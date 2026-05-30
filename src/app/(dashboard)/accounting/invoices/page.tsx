import {
  getInvoices,
  deleteInvoice,
  updateInvoiceStatus,
} from "@/app/actions/accounting";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/ui/delete-button";
import { Plus } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  partial: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default async function InvoicesPage() {
  const { orgId } = await auth();
  const rows = orgId ? await getInvoices() : [];
  const totalRevenue = rows
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} invoices · ${totalRevenue.toLocaleString()} collected
          </p>
        </div>
        <ButtonLink href="/accounting/invoices/new">
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </ButtonLink>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  No invoices yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-medium">
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell>{inv.contactName ?? "—"}</TableCell>
                <TableCell>{inv.trnDate}</TableCell>
                <TableCell>{inv.dueDate ?? "—"}</TableCell>
                <TableCell>${Number(inv.total).toLocaleString()}</TableCell>
                <TableCell>${Number(inv.amountDue).toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[inv.status ?? "draft"]}`}
                  >
                    {inv.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {inv.status === "draft" && (
                      <form
                        action={updateInvoiceStatus.bind(null, inv.id, "sent")}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          Send
                        </Button>
                      </form>
                    )}
                    {(inv.status === "sent" || inv.status === "partial") && (
                      <form
                        action={updateInvoiceStatus.bind(null, inv.id, "paid")}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          Mark Paid
                        </Button>
                      </form>
                    )}
                    <DeleteButton action={deleteInvoice.bind(null, inv.id)} />
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
