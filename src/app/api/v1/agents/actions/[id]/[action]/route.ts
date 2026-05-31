import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { agentActions } from "@/db/schema/agents";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { action } = await req.json();
  const status = action === "approve" ? "approved" : "rejected";
  const [updated] = await db.update(agentActions)
    .set({ status, approvedBy: orgId, approvedAt: new Date(), executedAt: status === "approved" ? new Date() : null })
    .where(and(eq(agentActions.id, Number(id)), eq(agentActions.orgId, orgId)))
    .returning();
  return NextResponse.json(updated);
}
