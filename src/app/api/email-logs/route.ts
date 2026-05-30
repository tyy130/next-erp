import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { emailLogs } from "@/db/schema/email-templates";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Number(req.nextUrl.searchParams.get("limit") || 50);

  const logs = await db.query.emailLogs.findMany({
    orderBy: (l, { desc }) => desc(l.createdAt),
    limit,
  });

  return NextResponse.json({ logs });
}
