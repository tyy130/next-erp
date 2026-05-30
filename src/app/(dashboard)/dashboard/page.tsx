import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  employees,
  contacts,
  invoices,
  deals,
  leaveRequests,
  payrollRuns,
  projects,
} from "@/db/schema";
import { eq, count, sum, and, gte, lte, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Users,
  Contact,
  Receipt,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CalendarClock,
  FolderOpen,
  Plus,
  ArrowRight,
} from "lucide-react";

async function getStats(orgId: string) {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const [
    empCount,
    contactCount,
    paidRevenue,
    dealCount,
    pendingLeaves,
    overdueInvoices,
    recentInvoices,
    activeProjects,
    latestPayroll,
  ] = await Promise.all([
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
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, "paid"))),
    db.select({ count: count() }).from(deals).where(eq(deals.orgId, orgId)),
    db
      .select({ count: count() })
      .from(leaveRequests)
      .where(
        and(
          eq(leaveRequests.orgId, orgId),
          eq(leaveRequests.status, "pending"),
        ),
      ),
    db
      .select({ count: count(), total: sum(invoices.amountDue) })
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), eq(invoices.status, "overdue"))),
    db.query.invoices.findMany({
      where: eq(invoices.orgId, orgId),
      orderBy: (inv, { desc }) => desc(inv.createdAt),
      limit: 5,
    }),
    db
      .select({ count: count() })
      .from(projects)
      .where(and(eq(projects.orgId, orgId), eq(projects.status, "active"))),
    db.query.payrollRuns.findFirst({
      where: eq(payrollRuns.orgId, orgId),
      orderBy: (r, { desc }) => desc(r.createdAt),
    }),
  ]);

  return {
    employees: empCount[0]?.count ?? 0,
    contacts: contactCount[0]?.count ?? 0,
    paidRevenue: Number(paidRevenue[0]?.total ?? 0),
    deals: dealCount[0]?.count ?? 0,
    pendingLeaves: pendingLeaves[0]?.count ?? 0,
    overdueCount: overdueInvoices[0]?.count ?? 0,
    overdueTotal: Number(overdueInvoices[0]?.total ?? 0),
    recentInvoices,
    activeProjects: activeProjects[0]?.count ?? 0,
    latestPayroll,
  };
}

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-700",
  partial: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default async function DashboardPage() {
  const { orgId } = await auth();
  const stats = orgId ? await getStats(orgId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your business at a glance.</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/accounting/invoices/new" className="h-8 text-sm">
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Invoice
          </ButtonLink>
          <ButtonLink
            href="/hrm/employees/new"
            variant="outline"
            className="h-8 text-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Employee
          </ButtonLink>
        </div>
      </div>

      {!orgId && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Set up your organization in settings to see live data.
        </div>
      )}

      {/* Alert banners */}
      {stats && stats.overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>
              {stats.overdueCount} overdue invoice
              {stats.overdueCount > 1 ? "s" : ""}
            </strong>{" "}
            totaling $
            {stats.overdueTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
          <ButtonLink
            href="/accounting/invoices"
            variant="ghost"
            className="ml-auto h-7 text-xs text-red-700"
          >
            View <ArrowRight className="h-3 w-3 ml-1" />
          </ButtonLink>
        </div>
      )}
      {stats && Number(stats.pendingLeaves) > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <CalendarClock className="h-4 w-4 shrink-0" />
          <span>
            <strong>
              {stats.pendingLeaves} leave request
              {Number(stats.pendingLeaves) > 1 ? "s" : ""}
            </strong>{" "}
            awaiting approval
          </span>
          <ButtonLink
            href="/hrm/leaves"
            variant="ghost"
            className="ml-auto h-7 text-xs text-yellow-700"
          >
            Review <ArrowRight className="h-3 w-3 ml-1" />
          </ButtonLink>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Employees",
            value: stats?.employees ?? "—",
            icon: Users,
            desc: "Active headcount",
            href: "/hrm/employees",
          },
          {
            title: "CRM Contacts",
            value: stats?.contacts ?? "—",
            icon: Contact,
            desc: "People & leads",
            href: "/crm/contacts",
          },
          {
            title: "Revenue Collected",
            value: stats
              ? `$${stats.paidRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "—",
            icon: DollarSign,
            desc: "From paid invoices",
            href: "/accounting/invoices",
          },
          {
            title: "Open Deals",
            value: stats?.deals ?? "—",
            icon: TrendingUp,
            desc: "In pipeline",
            href: "/crm/deals",
          },
          {
            title: "Active Projects",
            value: stats?.activeProjects ?? "—",
            icon: FolderOpen,
            desc: "In progress",
            href: "/projects",
          },
          {
            title: "Pending Leaves",
            value: stats ? String(stats.pendingLeaves) : "—",
            icon: CalendarClock,
            desc: "Need approval",
            href: "/hrm/leaves",
          },
          {
            title: "Overdue Invoices",
            value: stats ? String(stats.overdueCount) : "—",
            icon: AlertCircle,
            desc: stats
              ? `$${stats.overdueTotal.toLocaleString()} outstanding`
              : "",
            href: "/accounting/invoices",
          },
          {
            title: "Last Payroll",
            value: stats?.latestPayroll
              ? `$${Number(stats.latestPayroll.totalNet).toLocaleString()}`
              : "—",
            icon: Receipt,
            desc: stats?.latestPayroll?.periodEnd ?? "No runs yet",
            href: "/hrm/payroll",
          },
        ].map((card) => (
          <Card key={card.title} className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent invoices */}
      {stats && stats.recentInvoices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Invoices</h2>
            <ButtonLink
              href="/accounting/invoices"
              variant="ghost"
              className="h-7 text-xs"
            >
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </ButtonLink>
          </div>
          <div className="rounded-md border divide-y">
            {stats.recentInvoices.map((inv) => (
              <a
                key={inv.id}
                href={`/accounting/invoices/${inv.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-mono">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {inv.contactName ?? "No customer"} · {inv.trnDate}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">
                    $
                    {Number(inv.total).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[inv.status ?? "draft"]}`}
                  >
                    {inv.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "New Invoice",
              href: "/accounting/invoices/new",
              icon: Receipt,
            },
            { label: "Add Employee", href: "/hrm/employees/new", icon: Users },
            { label: "New Contact", href: "/crm/contacts/new", icon: Contact },
            { label: "New Project", href: "/projects", icon: FolderOpen },
          ].map((action) => (
            <ButtonLink
              key={action.href}
              href={action.href}
              variant="outline"
              className="h-16 flex-col gap-1 text-xs"
            >
              <action.icon className="h-5 w-5" />
              {action.label}
            </ButtonLink>
          ))}
        </div>
      </div>
    </div>
  );
}
