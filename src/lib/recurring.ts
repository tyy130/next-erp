import { db } from "@/db";
import { invoices, invoiceItems } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function generateRecurringInvoices() {
  const today = new Date().toISOString().split("T")[0];
  try {
    const configs = (await db.execute(sql`SELECT * FROM recurring_invoices WHERE status = 'active' AND next_run_date <= ${today} LIMIT 10`)) as unknown as any[];
    const results: any[] = [];
    for (const config of configs) {
      try {
        const [inv] = await db.insert(invoices).values({
          invoiceNumber: config.invoice_number || ("INV-" + Date.now().toString(36).toUpperCase()),
          contactId: config.contact_id, contactName: config.contact_name,
          billingAddress: config.billing_address, trnDate: today,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          discount: config.discount, discountType: config.discount_type,
          subtotal: config.total, taxTotal: config.tax_total, total: config.total,
          amountDue: config.total, status: "draft", notes: config.notes,
          orgId: config.org_id, createdBy: "system_recurring",
        }).returning();
        const items = (await db.execute(sql`SELECT * FROM recurring_invoice_items WHERE recurring_invoice_id = ${config.id}`)) as unknown as any[];
        for (const item of items) {
          await db.insert(invoiceItems).values({
            invoiceId: inv.id, description: item.description, qty: item.qty,
            unitPrice: item.unit_price, discount: item.discount,
            taxRate: item.tax_rate, lineTotal: item.line_total,
          });
        }
        const nextRun = calculateNextRun(today, config.frequency);
        await db.execute(sql`UPDATE recurring_invoices SET last_run_date = ${today}, next_run_date = ${nextRun} WHERE id = ${config.id}`);
        results.push({ id: inv.id, status: "created" });
      } catch (e: any) { results.push({ configId: config.id, error: e.message }); }
    }
    return results;
  } catch { return []; }
}

function calculateNextRun(from: string, frequency: string): string {
  const d = new Date(from);
  switch (frequency) {
    case "weekly": d.setDate(d.getDate() + 7); break;
    case "biweekly": d.setDate(d.getDate() + 14); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "yearly": d.setFullYear(d.getFullYear() + 1); break;
    default: d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString().split("T")[0];
}

export async function dispatchWebhook(orgId: string, event: string, data: any) {
  try {
    const hooks = (await db.execute(sql`SELECT url, secret FROM webhook_subscriptions WHERE org_id = ${orgId} AND is_active = true AND (events LIKE '%${event}%' OR events LIKE '%*%')`)) as unknown as any[];
    for (const hook of hooks) {
      fetch(hook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Webhook-Secret": hook.secret || "" },
        body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    }
  } catch { /* silent */ }
}
