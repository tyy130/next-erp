import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { emailTemplates } from "@/db/schema/email-templates";
import { eq } from "drizzle-orm";

// GET all templates
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await db.query.emailTemplates.findMany({
    orderBy: (t, { asc }) => asc(t.type),
  });

  return NextResponse.json({ templates });
}

// PATCH update template
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, subject, bodyHtml, enabled } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const [updated] = await db
    .update(emailTemplates)
    .set({
      subject,
      bodyHtml,
      enabled,
      updatedAt: new Date(),
    })
    .where(eq(emailTemplates.id, id))
    .returning();

  return NextResponse.json({ template: updated });
}

// POST reset to default
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type } = body;

  if (!type) return NextResponse.json({ error: "Missing type" }, { status: 400 });

  // Delete the custom one so it falls back to... 
  // Actually we keep defaults as reference. For now, just return the default content.
  const defaultContent = getDefaultContent(type);
  if (!defaultContent) return NextResponse.json({ error: "Unknown type" }, { status: 400 });

  const [updated] = await db
    .update(emailTemplates)
    .set({
      subject: defaultContent.subject,
      bodyHtml: defaultContent.bodyHtml,
      updatedAt: new Date(),
    })
    .where(eq(emailTemplates.type, type as "welcome" | "birthday" | "anniversary" | "leave_decision" | "payslip"))
    .returning();

  return NextResponse.json({ template: updated });
}

function getDefaultContent(type: string) {
  const defaults: Record<string, { subject: string; bodyHtml: string }> = {
    welcome: {
      subject: "Welcome to the team, {employee_name}! 🎉",
      bodyHtml: "<!-- Welcome email HTML -->",
    },
    birthday: {
      subject: "Happy Birthday, {employee_name}! 🎉",
      bodyHtml: "<!-- Birthday email HTML -->",
    },
    anniversary: {
      subject: "Happy {milestone} Anniversary, {employee_name}! 🎂",
      bodyHtml: "<!-- Anniversary email HTML -->",
    },
    leave_decision: {
      subject: "Your leave request has been {status}",
      bodyHtml: "<!-- Leave decision email HTML -->",
    },
    payslip: {
      subject: "Your payslip for {period_start} – {period_end}",
      bodyHtml: "<!-- Payslip email HTML -->",
    },
  };
  return defaults[type];
}
