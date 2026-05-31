import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { timeEntries } from "@/db/schema/features";
import { eq, and, gte, lte, sql } from "drizzle-orm";

function getOrgId() { return auth().then(a => a.orgId); }

export async function GET(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const entries = await db.query.timeEntries.findMany({
    where: eq(timeEntries.orgId, orgId), orderBy: (e, { desc }) => desc(e.startTime), limit: 50,
  });
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [entry] = await db.insert(timeEntries).values({ ...body, orgId }).returning();
  return NextResponse.json(entry, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const body = await req.json();
  const [updated] = await db.update(timeEntries).set({ ...body, updatedAt: new Date() }).where(and(eq(timeEntries.id, id), eq(timeEntries.orgId, orgId))).returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const orgId = await getOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(timeEntries).where(and(eq(timeEntries.id, id), eq(timeEntries.orgId, orgId)));
  return NextResponse.json({ success: true });
}
