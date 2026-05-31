import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema/agents";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

function generateApiKey() {
  const bytes = crypto.randomBytes(32);
  return "nep_" + bytes.toString("hex");
}

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const keys = await db.query.apiKeys.findMany({
    where: and(eq(apiKeys.orgId, orgId), eq(apiKeys.isActive, true)),
    columns: { id: true, name: true, keyPrefix: true, scopes: true, lastUsedAt: true, expiresAt: true, createdAt: true },
  });
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, scopes = ["read"] } = await req.json();
  const key = generateApiKey();
  const prefix = key.slice(0, 8);
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  await db.insert(apiKeys).values({ name, keyHash: hash, keyPrefix: prefix, scopes: JSON.stringify(scopes), orgId });
  return NextResponse.json({ key, name, prefix });
}

export async function DELETE(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.update(apiKeys).set({ isActive: false }).where(and(eq(apiKeys.id, id), eq(apiKeys.orgId, orgId)));
  return NextResponse.json({ success: true });
}
