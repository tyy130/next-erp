"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { payrollRuns, payslips, employees } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendPayslipEmail } from "@/lib/email";

function requireOrg(orgId: string | null | undefined): string {
  if (!orgId) throw new Error("No organization selected");
  return orgId;
}

export async function getPayrollRuns() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.payrollRuns.findMany({
    where: eq(payrollRuns.orgId, oid),
    with: { payslips: true },
    orderBy: (r, { desc }) => desc(r.createdAt),
  });
}

export async function createPayrollRun(fd: FormData) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);

  const periodStart = fd.get("periodStart") as string;
  const periodEnd = fd.get("periodEnd") as string;
  const notes = (fd.get("notes") as string) || undefined;

  const activeEmployees = await db.query.employees.findMany({
    where: and(eq(employees.orgId, oid), eq(employees.status, "active")),
  });

  const [run] = await db
    .insert(payrollRuns)
    .values({
      periodStart,
      periodEnd,
      notes,
      status: "draft",
      orgId: oid,
      createdBy: userId!,
    })
    .returning({ id: payrollRuns.id });

  if (activeEmployees.length > 0) {
    const slips = activeEmployees.map((emp) => {
      const gross = Number(emp.salary ?? emp.payRate ?? 0);
      const deductions = gross * 0.1;
      const net = gross - deductions;
      return {
        payrollRunId: run.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        grossPay: gross.toFixed(2),
        deductions: deductions.toFixed(2),
        netPay: net.toFixed(2),
        orgId: oid,
      };
    });

    await db.insert(payslips).values(slips);

    const totalGross = slips.reduce((s, sl) => s + Number(sl.grossPay), 0);
    const totalDeductions = slips.reduce(
      (s, sl) => s + Number(sl.deductions),
      0,
    );
    const totalNet = slips.reduce((s, sl) => s + Number(sl.netPay), 0);

    await db
      .update(payrollRuns)
      .set({
        totalGross: totalGross.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        totalNet: totalNet.toFixed(2),
      })
      .where(eq(payrollRuns.id, run.id));
  }

  revalidatePath("/hrm/payroll");
}

export async function updatePayrollStatus(
  id: number,
  status: "draft" | "processing" | "paid" | "cancelled",
) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .update(payrollRuns)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(payrollRuns.id, id), eq(payrollRuns.orgId, oid)));

  // When marked paid, email each employee their payslip
  if (status === "paid") {
    const run = await db.query.payrollRuns.findFirst({
      where: eq(payrollRuns.id, id),
      with: { payslips: true },
    });
    if (run) {
      const empIds = run.payslips.map((s) => s.employeeId);
      const emps = await db.query.employees.findMany({
        where: eq(employees.orgId, oid),
      });
      const empMap = Object.fromEntries(emps.map((e) => [e.id, e]));
      for (const slip of run.payslips) {
        const emp = empMap[slip.employeeId];
        if (emp?.email) {
          sendPayslipEmail({
            to: emp.email,
            name: slip.employeeName,
            periodStart: run.periodStart,
            periodEnd: run.periodEnd,
            grossPay: Number(slip.grossPay),
            deductions: Number(slip.deductions),
            netPay: Number(slip.netPay),
          }).catch(() => {});
        }
      }
    }
  }

  revalidatePath("/hrm/payroll");
}

export async function deletePayrollRun(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.delete(payslips).where(eq(payslips.payrollRunId, id));
  await db
    .delete(payrollRuns)
    .where(and(eq(payrollRuns.id, id), eq(payrollRuns.orgId, oid)));
  revalidatePath("/hrm/payroll");
}
