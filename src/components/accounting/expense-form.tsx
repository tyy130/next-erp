"use client";

import { useState, useTransition } from "react";
import { createBill } from "@/app/actions/accounting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ExpenseForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amount = fd.get("amount") as string;
    startTransition(async () => {
      try {
        await createBill({
          billNumber: fd.get("billNumber") as string,
          vendorName: fd.get("vendorName") as string,
          trnDate: fd.get("trnDate") as string,
          dueDate: (fd.get("dueDate") as string) || undefined,
          subtotal: amount,
          total: amount,
          items: [
            {
              description: (fd.get("description") as string) || "Expense",
              qty: "1",
              unitPrice: amount,
              lineTotal: amount,
            },
          ],
        });
        setOpen(false);
        toast.success("Expense recorded");
      } catch {
        toast.error("Failed to save");
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline">
        + Quick Add Expense
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4 rounded-lg border p-4 md:grid-cols-4"
    >
      <div className="space-y-1">
        <Label htmlFor="billNumber">Bill # *</Label>
        <Input
          id="billNumber"
          name="billNumber"
          placeholder="BILL-001"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="vendorName">Vendor</Label>
        <Input id="vendorName" name="vendorName" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="trnDate">Date *</Label>
        <Input
          id="trnDate"
          name="trnDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" name="dueDate" type="date" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
        />
      </div>
      <div className="col-span-full flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
