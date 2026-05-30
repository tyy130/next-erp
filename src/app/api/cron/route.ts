import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendAnniversaryEmail, sendBirthdayEmail } from "@/lib/email";

// Vercel Cron: runs daily at 8am UTC (see vercel.json)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(today.getUTCDate()).padStart(2, "0");
  const yyyy = today.getUTCFullYear();

  // Get all active employees across all orgs
  const allEmployees = await db.query.employees.findMany({
    where: eq(employees.status, "active"),
  });

  const results = { anniversaries: 0, birthdays: 0, errors: 0 };

  for (const emp of allEmployees) {
    if (!emp.email) continue;
    const name = `${emp.firstName} ${emp.lastName}`;

    // Work anniversary
    if (emp.hireDate) {
      const [hireYear, hireMM, hireDD] = emp.hireDate.split("-");
      if (hireMM === mm && hireDD === dd && hireYear !== String(yyyy)) {
        const years = yyyy - Number(hireYear);
        try {
          await sendAnniversaryEmail({ to: emp.email, name, years });
          results.anniversaries++;
        } catch {
          results.errors++;
        }
      }
    }

    // Birthday
    if (emp.dateOfBirth) {
      const [, birthMM, birthDD] = emp.dateOfBirth.split("-");
      if (birthMM === mm && birthDD === dd) {
        try {
          await sendBirthdayEmail({ to: emp.email, name });
          results.birthdays++;
        } catch {
          results.errors++;
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    date: `${yyyy}-${mm}-${dd}`,
    ...results,
  });
}
