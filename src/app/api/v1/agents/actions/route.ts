import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { agentActions, agentGuardrails } from "@/db/schema/agents";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { verifyApiKey } from "@/lib/api-auth";

// POST /api/v1/agents/actions — Execute an agent action
export async function POST(req: NextRequest) {
  const authResult = await verifyApiKey(req);
  if (!authResult) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { actionType, payload, agentId = "api", agentName = "API Agent" } = body;

  if (!actionType) return NextResponse.json({ error: "Missing actionType" }, { status: 400 });

  // Check guardrails
  const guardrails = await db.query.agentGuardrails.findFirst({
    where: eq(agentGuardrails.orgId, authResult.orgId),
  });

  const needsApproval = guardrails?.enabled && (
    (guardrails.requireApprovalActions && JSON.parse(guardrails.requireApprovalActions).includes(actionType)) ||
    (payload?.amount && guardrails.requireApprovalAbove && Number(payload.amount) > Number(guardrails.requireApprovalAbove))
  );

  // Log the action
  const [action] = await db.insert(agentActions).values({
    agentId, agentName, actionType,
    status: needsApproval ? "pending" : "executed",
    payload, orgId: authResult.orgId,
    executedAt: needsApproval ? null : new Date(),
  }).returning();

  if (needsApproval) {
    return NextResponse.json({
      success: true,
      actionId: action.id,
      status: "pending",
      message: "Action queued for approval",
    }, { status: 202 });
  }

  // Execute immediately (simplified — real implementation dispatches to specific handlers)
  const result = await executeAction(actionType, payload, authResult.orgId);

  await db.update(agentActions)
    .set({ status: result.error ? "failed" : "executed", result: result.data, errorMessage: result.error, executedAt: new Date() })
    .where(eq(agentActions.id, action.id));

  return NextResponse.json({ success: !result.error, actionId: action.id, ...result });
}

// GET /api/v1/agents/actions — List agent actions
export async function GET(req: NextRequest) {
  const authResult = await verifyApiKey(req);
  if (!authResult) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);
  const offset = Number(searchParams.get("offset") || 0);

  const conditions = [eq(agentActions.orgId, authResult.orgId)];
  if (status) conditions.push(eq(agentActions.status, status as any));

  const actions = await db.query.agentActions.findMany({
    where: and(...conditions),
    orderBy: (a, { desc }) => desc(a.createdAt),
    limit, offset,
  });

  return NextResponse.json({ actions, limit, offset });
}

async function executeAction(actionType: string, payload: any, orgId: string) {
  try {
    switch (actionType) {
      case "create_invoice": return { data: { message: "Invoice creation via API" } };
      case "send_invoice": return { data: { message: "Invoice send via API" } };
      case "create_contact": return { data: { message: "Contact creation via API" } };
      case "create_expense": return { data: { message: "Expense creation via API" } };
      default: return { data: { message: `Action ${actionType} acknowledged` } };
    }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
