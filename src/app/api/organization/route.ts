import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { organizationSettings } from "@/db/schema/organization";
import { eq } from "drizzle-orm";

// GET org settings
export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.query.organizationSettings.findFirst({
    where: eq(organizationSettings.clerkOrgId, orgId),
  });

  return NextResponse.json({ settings });
}

// PATCH update org settings
export async function PATCH(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const existing = await db.query.organizationSettings.findFirst({
    where: eq(organizationSettings.clerkOrgId, orgId),
  });

  if (existing) {
    const [updated] = await db
      .update(organizationSettings)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(organizationSettings.clerkOrgId, orgId))
      .returning();
    return NextResponse.json({ settings: updated });
  } else {
    const [created] = await db
      .insert(organizationSettings)
      .values({ ...body, clerkOrgId: orgId })
      .returning();
    return NextResponse.json({ settings: created });
  }
}
