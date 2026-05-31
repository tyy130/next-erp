import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { webhookSubscriptions } from "@/db/schema/features";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

async function getOrgId() { return (await auth()).orgId; }

export async function GET() {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hooks = await db.query.webhookSubscriptions.findMany({ where: eq(webhookSubscriptions.orgId, orgId), orderBy: (w, { desc }) => desc(w.createdAt) });
  return NextResponse.json({ hooks });
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url, secret = crypto.randomBytes(16).toString("hex"), events = '["*"]' } = await req.json();
  const [hook] = await db.insert(webhookSubscriptions).values({ url, secret, events, orgId }).returning();
  return NextResponse.json(hook, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(webhookSubscriptions).where(and(eq(webhookSubscriptions.id, id), eq(webhookSubscriptions.orgId, orgId)));
  return NextResponse.json({ success: true });
}
