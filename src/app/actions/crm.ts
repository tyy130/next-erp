"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { contacts, crmCompanies, deals, activities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function requireOrg(orgId: string | null | undefined): string {
  if (!orgId) throw new Error("No organization selected");
  return orgId;
}

// --- Contacts ---

export async function getContacts() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.contacts.findMany({
    where: eq(contacts.orgId, oid),
    with: { company: true },
    orderBy: (c, { asc }) => asc(c.firstName),
  });
}

export async function createContact(fd: FormData) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  const companyId = fd.get("companyId");
  await db.insert(contacts).values({
    firstName: fd.get("firstName") as string,
    lastName: (fd.get("lastName") as string) || undefined,
    email: (fd.get("email") as string) || undefined,
    phone: (fd.get("phone") as string) || undefined,
    jobTitle: (fd.get("jobTitle") as string) || undefined,
    companyId: companyId ? Number(companyId) : undefined,
    orgId: oid,
  });
  revalidatePath("/crm/contacts");
  redirect("/crm/contacts");
}

export async function deleteContact(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.orgId, oid)));
  revalidatePath("/crm/contacts");
}

// --- Companies ---

export async function getCompanies() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.crmCompanies.findMany({
    where: eq(crmCompanies.orgId, oid),
    orderBy: (c, { asc }) => asc(c.name),
  });
}

export async function createCompany(fd: FormData) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.insert(crmCompanies).values({
    name: fd.get("name") as string,
    email: (fd.get("email") as string) || undefined,
    phone: (fd.get("phone") as string) || undefined,
    website: (fd.get("website") as string) || undefined,
    industry: (fd.get("industry") as string) || undefined,
    orgId: oid,
  });
  revalidatePath("/crm/companies");
}

export async function deleteCompany(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .delete(crmCompanies)
    .where(and(eq(crmCompanies.id, id), eq(crmCompanies.orgId, oid)));
  revalidatePath("/crm/companies");
}

// --- Deals ---

export async function getDeals() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.deals.findMany({
    where: eq(deals.orgId, oid),
    with: { contact: true, company: true },
    orderBy: (d, { desc }) => desc(d.createdAt),
  });
}

export async function createDeal(fd: FormData) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);
  const contactId = fd.get("contactId");
  const companyId = fd.get("companyId");
  const stage = fd.get("stage") as
    | "lead"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";
  await db.insert(deals).values({
    title: fd.get("title") as string,
    value: (fd.get("value") as string) || undefined,
    stage: stage || "lead",
    contactId: contactId ? Number(contactId) : undefined,
    companyId: companyId ? Number(companyId) : undefined,
    closeDate: (fd.get("closeDate") as string) || undefined,
    ownerId: userId!,
    orgId: oid,
  });
  revalidatePath("/crm/deals");
}

export async function updateDealStage(
  id: number,
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost",
) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .update(deals)
    .set({ stage, updatedAt: new Date() })
    .where(and(eq(deals.id, id), eq(deals.orgId, oid)));
  revalidatePath("/crm/deals");
}

export async function deleteDeal(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.delete(deals).where(and(eq(deals.id, id), eq(deals.orgId, oid)));
  revalidatePath("/crm/deals");
}

// --- Activities ---

export async function createActivity(data: {
  type: "call" | "email" | "note" | "meeting" | "task";
  title?: string;
  message?: string;
  contactId?: number;
  companyId?: number;
  dealId?: number;
}) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .insert(activities)
    .values({ ...data, createdBy: userId!, orgId: oid });
  revalidatePath("/crm/contacts");
}
