import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { agentGuardrails } from "@/db/schema/agents";
import { eq } from "drizzle-orm";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const g = await db.query.agentGuardrails.findFirst({ where: eq(agentGuardrails.orgId, orgId) });
  return NextResponse.json(g || { enabled: true, requireApprovalAbove: 1000, dailyActionLimit: 50 });
}

export async function PATCH(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const existing = await db.query.agentGuardrails.findFirst({ where: eq(agentGuardrails.orgId, orgId) });
  if (existing) {
    const [updated] = await db.update(agentGuardrails).set({ ...body, updatedAt: new Date() }).where(eq(agentGuardrails.orgId, orgId)).returning();
    return NextResponse.json(updated);
  } else {
    const [created] = await db.insert(agentGuardrails).values({ ...body, orgId }).returning();
    return NextResponse.json(created);
  }
}
