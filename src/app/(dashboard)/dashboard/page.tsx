import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { employees, contacts, invoices, deals } from "@/db/schema";
import { eq, count, sum, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Contact, Receipt, TrendingUp } from "lucide-react";

async function getStats(orgId: string) {
  const [empCount, contactCount, invoiceTotal, dealCount] = await Promise.all([
    db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.orgId, orgId)),
    db
      .select({ count: count() })
      .from(contacts)
      .where(eq(contacts.orgId, orgId)),
    db
      .select({ total: sum(invoices.total) })
      .from(invoices)
      .where(eq(invoices.orgId, orgId)),
    db.select({ count: count() }).from(deals).where(eq(deals.orgId, orgId)),
  ]);

  return {
    employees: empCount[0]?.count ?? 0,
    contacts: contactCount[0]?.count ?? 0,
    invoiceTotal: Number(invoiceTotal[0]?.total ?? 0),
    deals: dealCount[0]?.count ?? 0,
  };
}

export default async function DashboardPage() {
  const { orgId } = await auth();
  const stats = orgId ? await getStats(orgId) : null;

  const cards = [
    {
      title: "Total Employees",
      value: stats?.employees ?? "—",
      icon: Users,
      desc: "Active headcount",
    },
    {
      title: "CRM Contacts",
      value: stats?.contacts ?? "—",
      icon: Contact,
      desc: "People & leads",
    },
    {
      title: "Revenue (all invoices)",
      value: stats
        ? `$${stats.invoiceTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
        : "—",
      icon: Receipt,
      desc: "Total invoiced",
    },
    {
      title: "Open Deals",
      value: stats?.deals ?? "—",
      icon: TrendingUp,
      desc: "In pipeline",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s your business at a glance.
        </p>
      </div>

      {!orgId && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Set up your organization in settings to see live data.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
