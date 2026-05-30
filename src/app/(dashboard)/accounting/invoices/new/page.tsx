"use client";

import { useState, useTransition } from "react";
import { createInvoice } from "@/app/actions/accounting";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type LineItem = {
  description: string;
  qty: string;
  unitPrice: string;
  discount: string;
  taxRate: string;
};

function calcLine(item: LineItem) {
  const qty = parseFloat(item.qty) || 0;
  const price = parseFloat(item.unitPrice) || 0;
  const disc = parseFloat(item.discount) || 0;
  const tax = parseFloat(item.taxRate) || 0;
  const subtotal = qty * price - disc;
  return subtotal + (subtotal * tax) / 100;
}

export default function NewInvoicePage() {
  const [items, setItems] = useState<LineItem[]>([
    { description: "", qty: "1", unitPrice: "", discount: "0", taxRate: "0" },
  ]);
  const [pending, startTransition] = useTransition();

  const subtotal = items.reduce((s, i) => s + calcLine(i), 0);

  function addLine() {
    setItems((prev) => [
      ...prev,
      { description: "", qty: "1", unitPrice: "", discount: "0", taxRate: "0" },
    ]);
  }

  function removeLine(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createInvoice({
          invoiceNumber: fd.get("invoiceNumber") as string,
          contactName: fd.get("contactName") as string,
          trnDate: fd.get("trnDate") as string,
          dueDate: (fd.get("dueDate") as string) || undefined,
          notes: (fd.get("notes") as string) || undefined,
          subtotal: subtotal.toFixed(2),
          total: subtotal.toFixed(2),
          items: items.map((item) => ({
            ...item,
            lineTotal: calcLine(item).toFixed(2),
          })),
        });
      } catch (err) {
        toast.error("Failed to create invoice");
      }
    });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <ButtonLink variant="ghost" size="sm" href="/accounting/invoices">
          <ChevronLeft className="h-4 w-4" />
          Back
        </ButtonLink>
        <h1 className="text-2xl font-bold">New Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice # *</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              placeholder="INV-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName">Customer</Label>
            <Input id="contactName" name="contactName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trnDate">Date *</Label>
            <Input
              id="trnDate"
              name="trnDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>
        </div>

        {/* Line items */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
            <span className="col-span-5">Description</span>
            <span className="col-span-2">Qty</span>
            <span className="col-span-2">Unit Price</span>
            <span className="col-span-1">Disc</span>
            <span className="col-span-1">Tax %</span>
            <span className="col-span-1" />
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-5"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLine(idx, "description", e.target.value)}
                required
              />
              <Input
                className="col-span-2"
                type="number"
                min="0"
                step="0.01"
                value={item.qty}
                onChange={(e) => updateLine(idx, "qty", e.target.value)}
              />
              <Input
                className="col-span-2"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={item.unitPrice}
                onChange={(e) => updateLine(idx, "unitPrice", e.target.value)}
              />
              <Input
                className="col-span-1"
                type="number"
                min="0"
                step="0.01"
                value={item.discount}
                onChange={(e) => updateLine(idx, "discount", e.target.value)}
              />
              <Input
                className="col-span-1"
                type="number"
                min="0"
                step="0.01"
                value={item.taxRate}
                onChange={(e) => updateLine(idx, "taxRate", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLine(idx)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            <Plus className="mr-1 h-4 w-4" />
            Add Line
          </Button>
        </div>

        <div className="flex justify-end">
          <div className="w-48 space-y-1 text-sm">
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Create Invoice"}
          </Button>
          <ButtonLink variant="outline" href="/accounting/invoices">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}
