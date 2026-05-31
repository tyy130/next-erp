import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { invoices, bills, contacts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let csv = "";
  let filename = "export.csv";

  switch (type) {
    case "invoices": {
      const rows = await db.query.invoices.findMany({ where: eq(invoices.orgId, orgId) });
      csv = "Invoice Number,Customer,Date,Due Date,Total,Amount Due,Status\n";
      for (const r of rows) {
        csv += `"${r.invoiceNumber}","${r.contactName || ""}","${r.trnDate}","${r.dueDate || ""}","${r.total}","${r.amountDue}","${r.status}"\n`;
      }
      filename = "invoices.csv";
      break;
    }
    case "expenses": {
      const rows = await db.query.bills.findMany({ where: eq(bills.orgId, orgId) });
      csv = "Bill Number,Vendor,Date,Due Date,Total,Amount Due,Status\n";
      for (const r of rows) {
        csv += `"${r.billNumber}","${r.vendorName || ""}","${r.trnDate}","${r.dueDate || ""}","${r.total}","${r.amountDue}","${r.status}"\n`;
      }
      filename = "expenses.csv";
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${filename}"` },
  });
}
