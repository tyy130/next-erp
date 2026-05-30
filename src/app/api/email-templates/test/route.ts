import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResend } from "@/lib/resend";
import { renderTemplate } from "@/lib/email-utils";

// POST /api/email-templates/test
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { to, subject, bodyHtml, variables } = body;

  if (!to || !subject || !bodyHtml) {
    return NextResponse.json({ error: "Missing to, subject, or bodyHtml" }, { status: 400 });
  }

  // Render with provided variables (for preview/test)
  const html = renderTemplate(bodyHtml, variables || {});
  const renderedSubject = renderTemplate(subject, variables || {});

  const r = getResend();
  if (!r) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 400 });
  }

  try {
    const result = await r.emails.send({
      from: "NextERP <notifications@nexterp.app>",
      to,
      subject: renderedSubject,
      html,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
