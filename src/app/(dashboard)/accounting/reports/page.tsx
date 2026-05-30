import { getIncomeStatementData } from "@/app/actions/accounting";
import { getInvoices, getBills } from "@/app/actions/accounting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default async function ReportsPage() {
  const { orgId } = await auth();

  if (!orgId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Set up your organization to view reports.
        </p>
      </div>
    );
  }

  const [statement, invoices, bills] = await Promise.all([
    getIncomeStatementData(orgId),
    getInvoices(),
    getBills(),
  ]);

  const outstanding = invoices
    .filter(
      (i) =>
        i.status === "sent" || i.status === "partial" || i.status === "overdue",
    )
    .reduce((s, i) => s + Number(i.amountDue), 0);

  const invoicesByStatus = invoices.reduce<Record<string, number>>(
    (acc, inv) => {
      acc[inv.status ?? "draft"] = (acc[inv.status ?? "draft"] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Income Statement Summary */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Income Statement</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                $
                {statement.revenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                From paid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                $
                {statement.expenses.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">From all bills</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${statement.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                $
                {statement.netIncome.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue − Expenses
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AR Summary */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Accounts Receivable</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Outstanding Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {outstanding.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Sent + partial + overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Invoice Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {Object.entries(invoicesByStatus).map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span className="capitalize text-muted-foreground">
                      {status}
                    </span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
