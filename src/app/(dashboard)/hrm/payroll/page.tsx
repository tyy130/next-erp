import {
  getPayrollRuns,
  updatePayrollStatus,
  deletePayrollRun,
  createPayrollRun,
} from "@/app/actions/payroll";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@clerk/nextjs/server";
import { DollarSign, Users, Plus } from "lucide-react";

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
};

export default async function PayrollPage() {
  const { orgId } = await auth();
  const runs = orgId ? await getPayrollRuns() : [];

  const totalPaid = runs
    .filter((r) => r.status === "paid")
    .reduce((s, r) => s + Number(r.totalNet), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll</h1>
          <p className="text-sm text-muted-foreground">
            {runs.length} runs · ${totalPaid.toLocaleString()} disbursed
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Disbursed
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">From paid runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runs.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Run</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {runs[0]
                ? `$${Number(runs[0].totalNet).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Net pay</p>
          </CardContent>
        </Card>
      </div>

      {/* New run form */}
      <div className="rounded-lg border p-4 bg-muted/30">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1">
          <Plus className="h-4 w-4" /> New Payroll Run
        </h2>
        <form
          action={createPayrollRun}
          className="flex flex-wrap gap-3 items-end"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Period Start
            </label>
            <input
              name="periodStart"
              type="date"
              required
              className="block h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Period End
            </label>
            <input
              name="periodEnd"
              type="date"
              required
              className="block h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1 flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-muted-foreground">
              Notes (optional)
            </label>
            <input
              name="notes"
              type="text"
              placeholder="e.g. May payroll"
              className="block h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <Button type="submit" size="sm">
            Generate Run
          </Button>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No payroll runs yet. Generate your first run above.
                </TableCell>
              </TableRow>
            )}
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium">
                  {run.periodStart} → {run.periodEnd}
                </TableCell>
                <TableCell>{run.payslips.length}</TableCell>
                <TableCell>
                  ${Number(run.totalGross).toLocaleString()}
                </TableCell>
                <TableCell className="text-red-600">
                  -${Number(run.totalDeductions).toLocaleString()}
                </TableCell>
                <TableCell className="font-semibold text-green-700">
                  ${Number(run.totalNet).toLocaleString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[run.status ?? "draft"]}`}
                  >
                    {run.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {run.status === "draft" && (
                      <form
                        action={updatePayrollStatus.bind(
                          null,
                          run.id,
                          "processing",
                        )}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          Process
                        </Button>
                      </form>
                    )}
                    {run.status === "processing" && (
                      <form
                        action={updatePayrollStatus.bind(null, run.id, "paid")}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          Mark Paid
                        </Button>
                      </form>
                    )}
                    {run.status === "draft" && (
                      <DeleteButton
                        action={deletePayrollRun.bind(null, run.id)}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
