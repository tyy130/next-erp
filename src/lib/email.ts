import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "NextERP <notifications@nexterp.app>";

function base(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Plus Jakarta Sans', Inter, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: #0f172a; padding: 24px 32px; }
    .header h2 { color: #fff; margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
    .body { padding: 32px; color: #374151; line-height: 1.6; font-size: 15px; }
    .body h3 { margin-top: 0; color: #111827; font-size: 20px; }
    .badge { display: inline-block; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: 600; }
    .badge.err { background: #fef2f2; color: #991b1b; border-color: #fca5a5; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .table th { background: #f9fafb; text-align: left; padding: 8px 12px; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #e5e7eb; }
    .table td { padding: 10px 12px; border: 1px solid #e5e7eb; font-size: 14px; }
    .footer { border-top: 1px solid #e5e7eb; padding: 16px 32px; font-size: 12px; color: #9ca3af; }
    .btn { display: inline-block; background: #0f172a; color: #fff !important; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><h2>NextERP</h2></div>
    <div class="body">${body}</div>
    <div class="footer">Sent by NextERP · Your all-in-one business platform</div>
  </div>
</body>
</html>`;
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
  const r = getResend();
  if (!r) return;
  return r.emails.send({
    from: FROM,
    to,
    subject: `Welcome to the team, ${name}! 🎉`,
    html: base(
      "Welcome!",
      `<h3>Welcome aboard, ${name}!</h3>
      <p>We're thrilled to have you join us${hireDate ? ` starting <strong>${hireDate}</strong>` : ""}${role ? ` as <strong>${role}</strong>` : ""}.</p>
      <p>Your account has been set up in NextERP — you'll use it to manage your leave requests, view payslips, and stay up to date with company news.</p>
      ${loginUrl ? `<a href="${loginUrl}" class="btn">Access Your Dashboard →</a>` : ""}
      <p style="margin-top:24px;">If you have any questions, reach out to HR and we'll be happy to help.</p>
      <p>Welcome to the family! 👋</p>`,
    ),
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
  const r = getResend();
  if (!r) return;
  const milestone = years === 1 ? "1 year" : `${years} years`;
  return r.emails.send({
    from: FROM,
    to,
    subject: `Happy ${milestone} Anniversary, ${name}! 🎂`,
    html: base(
      "Work Anniversary",
      `<h3>Happy ${milestone} Anniversary, ${name}!</h3>
      <p>Today marks <strong>${milestone}</strong> since you joined the team. We're so grateful for everything you bring to the table — your dedication, skill, and energy make a real difference.</p>
      <p>Here's to many more! 🥂</p>
      <p style="margin-top:24px;">With appreciation,<br/>Your Team</p>`,
    ),
  });
}

export async function sendBirthdayEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const r = getResend();
  if (!r) return;
  return r.emails.send({
    from: FROM,
    to,
    subject: `Happy Birthday, ${name}! 🎉`,
    html: base(
      "Happy Birthday!",
      `<h3>Happy Birthday, ${name}! 🎂</h3>
      <p>The whole team is wishing you an amazing day filled with joy and celebration. We're lucky to have you with us!</p>
      <p>Enjoy your special day! 🎈</p>`,
    ),
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
  const r = getResend();
  if (!r) return;
  const approved = status === "approved";
  return r.emails.send({
    from: FROM,
    to,
    subject: `Your leave request has been ${status}`,
    html: base(
      "Leave Update",
      `<h3>Leave Request ${approved ? "Approved ✅" : "Rejected ❌"}</h3>
      <p>Hi ${name}, your ${leaveType ?? "leave"} request has been <strong>${status}</strong>.</p>
      <table class="table">
        <tr><th>From</th><th>To</th><th>Days</th><th>Status</th></tr>
        <tr>
          <td>${startDate}</td>
          <td>${endDate}</td>
          <td>${days}</td>
          <td><span class="badge ${approved ? "" : "err"}">${status}</span></td>
        </tr>
      </table>
      ${approved ? "<p>Enjoy your time off! Your manager and team have been notified.</p>" : "<p>If you have questions about this decision, please speak with your manager or HR.</p>"}`,
    ),
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
  const r = getResend();
  if (!r) return;
  return r.emails.send({
    from: FROM,
    to,
    subject: `Your payslip for ${periodStart} – ${periodEnd}`,
    html: base(
      "Payslip",
      `<h3>Payslip — ${periodStart} to ${periodEnd}</h3>
      <p>Hi ${name}, your salary for this period has been processed.</p>
      <table class="table">
        <tr><th>Item</th><th style="text-align:right">Amount</th></tr>
        <tr><td>Gross Pay</td><td style="text-align:right">$${grossPay.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>Deductions (10%)</td><td style="text-align:right; color:#dc2626">-$${deductions.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr>
        <tr><td><strong>Net Pay</strong></td><td style="text-align:right"><strong>$${netPay.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td></tr>
      </table>
      <p>Payment has been initiated to your registered bank account. Please allow 1–2 business days for the funds to arrive.</p>`,
    ),
  });
}
