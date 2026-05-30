"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  invoices,
  invoiceItems,
  bills,
  billItems,
  chartOfAccounts,
  ledgers,
  payments,
} from "@/db/schema";
import { eq, and, sum, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function requireOrg(orgId: string | null | undefined): string {
  if (!orgId) throw new Error("No organization selected");
  return orgId;
}

// --- Invoices ---

export async function getInvoices() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.invoices.findMany({
    where: eq(invoices.orgId, oid),
    with: { items: true, payments: true },
    orderBy: (inv, { desc }) => desc(inv.createdAt),
  });
}

export async function createInvoice(data: {
  invoiceNumber: string;
  contactId?: number;
  contactName?: string;
  trnDate: string;
  dueDate?: string;
  discount?: string;
  discountType?: string;
  subtotal: string;
  taxTotal?: string;
  total: string;
  notes?: string;
  items: {
    description: string;
    qty: string;
    unitPrice: string;
    discount?: string;
    taxRate?: string;
    lineTotal: string;
  }[];
}) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);
  const { items, ...invoiceData } = data;

  const [inv] = await db
    .insert(invoices)
    .values({
      ...invoiceData,
      amountDue: invoiceData.total,
      orgId: oid,
      createdBy: userId!,
    })
    .returning({ id: invoices.id });

  if (items.length > 0) {
    await db
      .insert(invoiceItems)
      .values(items.map((item) => ({ ...item, invoiceId: inv.id })));
  }

  revalidatePath("/accounting/invoices");
  redirect("/accounting/invoices");
}

export async function updateInvoiceStatus(
  id: number,
  status: "draft" | "sent" | "partial" | "paid" | "overdue" | "cancelled",
) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .update(invoices)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(invoices.id, id), eq(invoices.orgId, oid)));
  revalidatePath("/accounting/invoices");
}

export async function deleteInvoice(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.orgId, oid)));
  revalidatePath("/accounting/invoices");
}

export async function recordPaymentForm(fd: FormData) {
  return recordPayment({
    invoiceId: Number(fd.get("invoiceId")),
    amount: fd.get("amount") as string,
    paymentDate: fd.get("paymentDate") as string,
    method: (fd.get("method") as string) || undefined,
    reference: (fd.get("reference") as string) || undefined,
  });
}

export async function recordPayment(data: {
  invoiceId: number;
  amount: string;
  paymentDate: string;
  method?: string;
  reference?: string;
}) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.insert(payments).values({ ...data, orgId: oid, createdBy: userId! });

  // Update amountDue on invoice
  const [inv] = await db
    .select({ total: invoices.total })
    .from(invoices)
    .where(eq(invoices.id, data.invoiceId));

  const paid = await db
    .select({ total: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.invoiceId, data.invoiceId));

  const amountDue = Number(inv.total) - Number(paid[0]?.total ?? 0);
  const newStatus = amountDue <= 0 ? "paid" : "partial";

  await db
    .update(invoices)
    .set({
      amountDue: amountDue.toFixed(2),
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, data.invoiceId));

  revalidatePath("/accounting/invoices");
}

// --- Expenses (Bills) ---

export async function getBills() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.bills.findMany({
    where: eq(bills.orgId, oid),
    with: { items: true },
    orderBy: (b, { desc }) => desc(b.createdAt),
  });
}

export async function createBill(data: {
  billNumber: string;
  vendorName?: string;
  trnDate: string;
  dueDate?: string;
  subtotal: string;
  taxTotal?: string;
  total: string;
  notes?: string;
  items: {
    description: string;
    qty: string;
    unitPrice: string;
    lineTotal: string;
    ledgerId?: number;
  }[];
}) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);
  const { items, ...billData } = data;

  const [bill] = await db
    .insert(bills)
    .values({
      ...billData,
      amountDue: billData.total,
      orgId: oid,
      createdBy: userId!,
    })
    .returning({ id: bills.id });

  if (items.length > 0) {
    await db
      .insert(billItems)
      .values(items.map((item) => ({ ...item, billId: bill.id })));
  }

  revalidatePath("/accounting/expenses");
  redirect("/accounting/expenses");
}

export async function deleteBill(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.delete(billItems).where(eq(billItems.billId, id));
  await db.delete(bills).where(and(eq(bills.id, id), eq(bills.orgId, oid)));
  revalidatePath("/accounting/expenses");
}

// --- Chart of Accounts ---

export async function getChartOfAccounts() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.chartOfAccounts.findMany({
    where: eq(chartOfAccounts.orgId, oid),
    orderBy: (coa, { asc }) => asc(coa.name),
  });
}

export async function createAccount(fd: FormData) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  const name = fd.get("name") as string;
  const type = fd.get("type") as
    | "asset"
    | "liability"
    | "equity"
    | "income"
    | "expense";
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  await db.insert(chartOfAccounts).values({ name, type, slug, orgId: oid });
  revalidatePath("/accounting/accounts");
}

// --- Reports ---

export async function getIncomeStatementData(orgId: string) {
  const [revenue, expenses] = await Promise.all([
    db
      .select({ total: sum(invoices.total) })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, "paid"))),
    db
      .select({ total: sum(bills.total) })
      .from(bills)
      .where(eq(bills.orgId, orgId)),
  ]);

  const totalRevenue = Number(revenue[0]?.total ?? 0);
  const totalExpenses = Number(expenses[0]?.total ?? 0);

  return {
    revenue: totalRevenue,
    expenses: totalExpenses,
    netIncome: totalRevenue - totalExpenses,
  };
}
