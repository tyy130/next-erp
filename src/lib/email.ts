import { db } from "@/db";
import { emailTemplates, emailLogs } from "@/db/schema/email-templates";
import { eq } from "drizzle-orm";
import { renderTemplate } from "@/lib/email-utils";

// ── Resend lazy init ──────────────────────────────────────────────────
let _resend: import("resend").Resend | null = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new (require("resend")).Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "NextERP <notifications@nexterp.app>";
const COMPANY_NAME = "NextERP";

// ── Fetch template from DB ────────────────────────────────────────────
async function getTemplate(type: string) {
  const tpl = await db.query.emailTemplates.findFirst({
    where: eq(emailTemplates.type, type as "welcome" | "birthday" | "anniversary" | "leave_decision" | "payslip"),
  });
  return tpl;
}

// ── Log email to DB ───────────────────────────────────────────────────
async function logEmail(params: {
  templateType: string;
  templateId?: number;
  toEmail: string;
  toName?: string;
  subject: string;
  status: "queued" | "sent" | "failed" | "bounced";
  errorMessage?: string;
  resendId?: string;
  orgId?: string;
}) {
  try {
    await db.insert(emailLogs).values({
      templateId: params.templateId,
      templateType: params.templateType,
      toEmail: params.toEmail,
      toName: params.toName,
      subject: params.subject,
      status: params.status,
      errorMessage: params.errorMessage,
      resendId: params.resendId,
      orgId: params.orgId,
    });
  } catch {
    // Don't let logging failures break email sending
  }
}

// ── Send email with template ──────────────────────────────────────────
async function sendWithTemplate(params: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  templateType: string;
  templateId?: number;
  orgId?: string;
}) {
  const r = getResend();
  const logParams = {
    templateType: params.templateType,
    templateId: params.templateId,
    toEmail: params.to,
    toName: params.toName,
    subject: params.subject,
    orgId: params.orgId,
  };

  if (!r) {
    await logEmail({ ...logParams, status: "failed", errorMessage: "Resend not configured" });
    return;
  }

  await logEmail({ ...logParams, status: "queued" });

  try {
    const result = await r.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    await logEmail({
      ...logParams,
      status: "sent",
      resendId: result.data?.id,
      errorMessage: result.error?.message,
    });
    if (result.error) {
      await logEmail({
        ...logParams,
        status: "failed",
        errorMessage: result.error.message,
      });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await logEmail({
      ...logParams,
      status: "failed",
      errorMessage: msg,
    });
  }
}

// ── Template-based email functions ────────────────────────────────────

async function getBaseVars() {
  return {
    company_name: COMPANY_NAME,
  };
}

export async function sendWelcomeEmail({
  to,
  name,
  role,
  hireDate,
  loginUrl,
}: {
  to: string;
  name: string;
  role?: string;
  hireDate?: string;
  loginUrl?: string;
}) {
  const tpl = await getTemplate("welcome");
  if (!tpl || !tpl.enabled) return;

  const vars = await getBaseVars();
  const html = renderTemplate(tpl.bodyHtml, {
    ...vars,
    employee_name: name,
    role: role || "team member",
    start_date_phrase: hireDate ? ` starting <strong>${hireDate}</strong>` : "",
    login_prompt: loginUrl
      ? `<a href="${loginUrl}" class="btn">Access Your Dashboard &rarr;</a>`
      : "",
    start_date: hireDate || "",
    login_url: loginUrl || "",
  });
  const subject = renderTemplate(tpl.subject, { ...vars, employee_name: name });

  return sendWithTemplate({
    to,
    toName: name,
    subject,
    html,
    templateType: "welcome",
    templateId: tpl.id,
  });
}

export async function sendAnniversaryEmail({
  to,
  name,
  years,
}: {
  to: string;
  name: string;
  years: number;
}) {
  const tpl = await getTemplate("anniversary");
  if (!tpl || !tpl.enabled) return;

  const milestone = years === 1 ? "1 year" : `${years} years`;
  const vars = await getBaseVars();
  const html = renderTemplate(tpl.bodyHtml, {
    ...vars,
    employee_name: name,
    milestone,
  });
  const subject = renderTemplate(tpl.subject, { ...vars, employee_name: name, milestone });

  return sendWithTemplate({
    to,
    toName: name,
    subject,
    html,
    templateType: "anniversary",
    templateId: tpl.id,
  });
}

export async function sendBirthdayEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const tpl = await getTemplate("birthday");
  if (!tpl || !tpl.enabled) return;

  const vars = await getBaseVars();
  const html = renderTemplate(tpl.bodyHtml, {
    ...vars,
    employee_name: name,
  });
  const subject = renderTemplate(tpl.subject, { ...vars, employee_name: name });

  return sendWithTemplate({
    to,
    toName: name,
    subject,
    html,
    templateType: "birthday",
    templateId: tpl.id,
  });
}

export async function sendLeaveDecisionEmail({
  to,
  name,
  status,
  startDate,
  endDate,
  days,
  leaveType,
}: {
  to: string;
  name: string;
  status: "approved" | "rejected";
  startDate: string;
  endDate: string;
  days: number;
  leaveType?: string;
}) {
  const tpl = await getTemplate("leave_decision");
  if (!tpl || !tpl.enabled) return;

  const approved = status === "approved";
  const vars = await getBaseVars();
  const statusMessage = approved
    ? "<p>Enjoy your time off! Your manager and team have been notified.</p>"
    : "<p>If you have questions about this decision, please speak with your manager or HR.</p>";
  const statusTitle = approved ? "Approved ✅" : "Rejected ❌";

  const html = renderTemplate(tpl.bodyHtml, {
    ...vars,
    employee_name: name,
    status,
    status_title: statusTitle,
    status_class: approved ? "approved" : "rejected",
    status_message: statusMessage,
    leave_type: leaveType ?? "leave",
    start_date: startDate,
    end_date: endDate,
    days: String(days),
  });
  const subject = renderTemplate(tpl.subject, { ...vars, status });

  return sendWithTemplate({
    to,
    toName: name,
    subject,
    html,
    templateType: "leave_decision",
    templateId: tpl.id,
  });
}

export async function sendPayslipEmail({
  to,
  name,
  periodStart,
  periodEnd,
  grossPay,
  deductions,
  netPay,
}: {
  to: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  deductions: number;
  netPay: number;
}) {
  const tpl = await getTemplate("payslip");
  if (!tpl || !tpl.enabled) return;

  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const vars = await getBaseVars();
  const html = renderTemplate(tpl.bodyHtml, {
    ...vars,
    employee_name: name,
    period_start: periodStart,
    period_end: periodEnd,
    gross_pay: fmt(grossPay),
    deductions: fmt(deductions),
    net_pay: fmt(netPay),
  });
  const subject = renderTemplate(tpl.subject, {
    ...vars,
    period_start: periodStart,
    period_end: periodEnd,
  });

  return sendWithTemplate({
    to,
    toName: name,
    subject,
    html,
    templateType: "payslip",
    templateId: tpl.id,
  });
}
