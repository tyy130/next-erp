import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { userPreferences } from "@/db/schema/features";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prefs = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) });
  return NextResponse.json(prefs || { theme: "system", language: "en", dateFormat: "MM/DD/YYYY" });
}

export async function PATCH(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const existing = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, userId) });
  if (existing) {
    const [updated] = await db.update(userPreferences).set({ ...body, updatedAt: new Date() }).where(eq(userPreferences.userId, userId)).returning();
    return NextResponse.json(updated);
  } else {
    const [created] = await db.insert(userPreferences).values({ ...body, userId, orgId }).returning();
    return NextResponse.json(created);
  }
}
