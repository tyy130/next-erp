import { db } from "@/db";
import { invoices, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import {
  recordPaymentForm,
  updateInvoiceStatus,
} from "@/app/actions/accounting";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  partial: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await auth();

  const inv = await db.query.invoices.findFirst({
    where: and(eq(invoices.id, Number(id)), eq(invoices.orgId, orgId ?? "")),
    with: { items: true, payments: true },
  });

  if (!inv) notFound();

  const totalPaid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <ButtonLink
          href="/accounting/invoices"
          variant="ghost"
          className="h-8 px-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Invoices
        </ButtonLink>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">
              {inv.invoiceNumber}
            </h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[inv.status ?? "draft"]}`}
            >
              {inv.status}
            </span>
          </div>
          {inv.contactName && (
            <p className="text-sm text-muted-foreground">{inv.contactName}</p>
          )}
        </div>
        <div className="flex gap-2">
          {inv.status === "draft" && (
            <form action={updateInvoiceStatus.bind(null, inv.id, "sent")}>
              <Button type="submit" size="sm">
                Send Invoice
              </Button>
            </form>
          )}
          {(inv.status === "sent" || inv.status === "partial") && (
            <form action={updateInvoiceStatus.bind(null, inv.id, "paid")}>
              <Button type="submit" size="sm" variant="outline">
                Mark Paid
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Invoice Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{inv.trnDate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Due Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{inv.dueDate ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg">
              $
              {Number(inv.total).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Amount Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`font-bold text-lg ${Number(inv.amountDue) > 0 ? "text-red-600" : "text-green-600"}`}
            >
              $
              {Number(inv.amountDue).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Line items */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Line Items</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax %</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inv.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">
                    {Number(item.qty)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${Number(item.unitPrice).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(item.taxRate ?? 0)}%
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(item.lineTotal).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={4} className="text-right">
                  Total
                </TableCell>
                <TableCell className="text-right">
                  $
                  {Number(inv.total).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Payment history */}
      {inv.payments.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Payment History</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inv.payments.map((pmt) => (
                  <TableRow key={pmt.id}>
                    <TableCell>{pmt.paymentDate}</TableCell>
                    <TableCell className="capitalize">
                      {pmt.method?.replace("_", " ")}
                    </TableCell>
                    <TableCell>{pmt.reference ?? "—"}</TableCell>
                    <TableCell className="text-right text-green-700 font-medium">
                      $
                      {Number(pmt.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell colSpan={3} className="text-right">
                    Total Paid
                  </TableCell>
                  <TableCell className="text-right text-green-700">
                    $
                    {totalPaid.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Record payment */}
      {(inv.status === "sent" || inv.status === "partial") && (
        <div className="rounded-lg border p-4 bg-muted/30">
          <h2 className="text-sm font-semibold mb-3">Record Payment</h2>
          <form
            action={recordPaymentForm}
            className="flex flex-wrap gap-3 items-end"
          >
            <input type="hidden" name="invoiceId" value={inv.id} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Amount *
              </label>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder={String(Number(inv.amountDue))}
                className="block h-9 w-32 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Date *
              </label>
              <input
                name="paymentDate"
                type="date"
                required
                className="block h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Method
              </label>
              <select
                name="method"
                className="block h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Reference
              </label>
              <input
                name="reference"
                type="text"
                placeholder="TXN-123"
                className="block h-9 w-32 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <Button type="submit" size="sm">
              Record
            </Button>
          </form>
        </div>
      )}

      {inv.notes && (
        <div>
          <h2 className="text-sm font-semibold mb-1">Notes</h2>
          <p className="text-sm text-muted-foreground">{inv.notes}</p>
        </div>
      )}
    </div>
  );
}
