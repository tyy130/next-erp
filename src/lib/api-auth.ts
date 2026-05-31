import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema/agents";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function verifyApiKey(req: NextRequest) {
  const key = req.headers.get("x-api-key");
  if (!key) return null;
  const prefix = key.slice(0, 8);
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const keyRecord = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyPrefix, prefix), eq(apiKeys.keyHash, hash), eq(apiKeys.isActive, true)),
  });
  if (!keyRecord) return null;
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRecord.id));
  return { orgId: keyRecord.orgId, scopes: JSON.parse(keyRecord.scopes || '["read"]') };
}
