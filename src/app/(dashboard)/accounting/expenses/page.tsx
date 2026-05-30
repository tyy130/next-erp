import { getBills, deleteBill } from "@/app/actions/accounting";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/ui/delete-button";
import { auth } from "@clerk/nextjs/server";
import { ExpenseForm } from "@/components/accounting/expense-form";

export default async function ExpensesPage() {
  const { orgId } = await auth();
  const rows = orgId ? await getBills() : [];
  const totalSpend = rows.reduce((s, b) => s + Number(b.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expenses</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} bills · ${totalSpend.toLocaleString()} total spend
        </p>
      </div>

      <ExpenseForm />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No expenses yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-mono font-medium">
                  {bill.billNumber}
                </TableCell>
                <TableCell>{bill.vendorName ?? "—"}</TableCell>
                <TableCell>{bill.trnDate}</TableCell>
                <TableCell>{bill.dueDate ?? "—"}</TableCell>
                <TableCell>${Number(bill.total).toLocaleString()}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {bill.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DeleteButton action={deleteBill.bind(null, bill.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
