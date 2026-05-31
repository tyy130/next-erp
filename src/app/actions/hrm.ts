"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { employees, departments, leaveTypes, leaveRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendWelcomeEmail, sendLeaveDecisionEmail } from "@/lib/email";

function requireOrg(orgId: string | null | undefined): string {
  if (!orgId) throw new Error("No organization selected");
  return orgId;
}

// --- Employees ---

export async function getEmployees() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.employees.findMany({
    where: eq(employees.orgId, oid),
    with: { department: true, designation: true },
    orderBy: (e, { asc }) => asc(e.firstName),
  });
}

export async function getEmployee(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.employees.findFirst({
    where: and(eq(employees.id, id), eq(employees.orgId, oid)),
    with: {
      department: true,
      designation: true,
      leaveRequests: true,
      notes: true,
    },
  });
}

export async function createEmployee(fd: FormData) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);

  const deptId = fd.get("departmentId");
  const desgId = fd.get("designationId");
  const firstName = fd.get("firstName") as string;
  const lastName = fd.get("lastName") as string;
  const email = (fd.get("email") as string) || undefined;
  const hireDate = (fd.get("hireDate") as string) || undefined;

  await db.insert(employees).values({
    firstName,
    lastName,
    email,
    phone: (fd.get("phone") as string) || undefined,
    departmentId: deptId ? Number(deptId) : undefined,
    designationId: desgId ? Number(desgId) : undefined,
    hireDate,
    salary: (fd.get("salary") as string) || undefined,
    payType: (fd.get("payType") as string as "hourly" | "salary") || "salary",
    status:
      (fd.get("status") as string as "active" | "inactive" | "terminated") ||
      "active",
    userId: userId!,
    orgId: oid,
  });

  // Send welcome email (fire-and-forget — don't block the redirect)
  if (email) {
    sendWelcomeEmail({
      to: email,
      name: `${firstName} ${lastName}`,
      hireDate,
      loginUrl:
        process.env.NEXT_PUBLIC_APP_URL ?? "https://next-erp-six.vercel.app",
    }).catch(() => {});
  }

  revalidatePath("/hrm/employees");
  redirect("/hrm/employees");
}

export async function updateEmployee(
  id: number,
  data: Partial<typeof employees.$inferInsert>,
) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .update(employees)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(employees.id, id), eq(employees.orgId, oid)));
  revalidatePath("/hrm/employees");
}

export async function deleteEmployee(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .delete(employees)
    .where(and(eq(employees.id, id), eq(employees.orgId, oid)));
  revalidatePath("/hrm/employees");
}

// --- Departments ---

export async function getDepartments() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.departments.findMany({
    where: eq(departments.orgId, oid),
    orderBy: (d, { asc }) => asc(d.title),
  });
}

export async function createDepartment(fd: FormData) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.insert(departments).values({
    title: fd.get("title") as string,
    description: (fd.get("description") as string) || undefined,
    orgId: oid,
  });
  revalidatePath("/hrm/departments");
}

export async function deleteDepartment(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .delete(departments)
    .where(and(eq(departments.id, id), eq(departments.orgId, oid)));
  revalidatePath("/hrm/departments");
}

// --- Leave ---

export async function getLeaveTypes() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.leaveTypes.findMany({
    where: eq(leaveTypes.orgId, oid),
  });
}

export async function getLeaveRequests() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.leaveRequests.findMany({
    where: eq(leaveRequests.orgId, oid),
    with: { employee: true, leaveType: true },
    orderBy: (lr, { desc }) => desc(lr.createdAt),
  });
}

export async function createLeaveRequest(fd: FormData) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.insert(leaveRequests).values({
    employeeId: Number(fd.get("employeeId")),
    leaveTypeId: Number(fd.get("leaveTypeId")),
    startDate: fd.get("startDate") as string,
    endDate: fd.get("endDate") as string,
    days: Number(fd.get("days")),
    reason: (fd.get("reason") as string) || undefined,
    orgId: oid,
  });
  revalidatePath("/hrm/leaves");
}

export async function updateLeaveStatus(
  id: number,
  status: "approved" | "rejected",
) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);

  await db
    .update(leaveRequests)
    .set({ status, approvedBy: userId!, approvedAt: new Date() })
    .where(and(eq(leaveRequests.id, id), eq(leaveRequests.orgId, oid)));

  // Send notification to employee
  const req = await db.query.leaveRequests.findFirst({
    where: eq(leaveRequests.id, id),
    with: { employee: true, leaveType: true },
  });

  if (req?.employee?.email) {
    sendLeaveDecisionEmail({
      to: req.employee.email,
      name: `${req.employee.firstName} ${req.employee.lastName}`,
      status,
      startDate: req.startDate,
      endDate: req.endDate,
      days: req.days,
      leaveType: req.leaveType?.name,
    }).catch(() => {});
  }

  revalidatePath("/hrm/leaves");
}

// --- Seed default departments ---

const DEFAULT_DEPARTMENTS = [
  { title: "Engineering", description: "Software development, infrastructure, and technical operations" },
  { title: "Marketing", description: "Brand, content, digital marketing, and growth" },
  { title: "Sales", description: "Revenue generation, client acquisition, and account management" },
  { title: "Human Resources", description: "Recruitment, people operations, and employee experience" },
  { title: "Finance", description: "Accounting, payroll, budgeting, and financial planning" },
  { title: "Operations", description: "Business operations, logistics, and process improvement" },
  { title: "Customer Support", description: "Customer success, support tickets, and client relations" },
  { title: "Product", description: "Product management, strategy, and roadmap" },
  { title: "Design", description: "UI/UX design, visual identity, and brand creative" },
  { title: "Legal", description: "Contracts, compliance, and legal affairs" },
  { title: "Executive", description: "C-suite, board, and strategic leadership" },
  { title: "Research & Development", description: "R&D, innovation, and experimental projects" },
];

export async function seedDefaultDepartments() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);

  // Get existing departments to avoid duplicates
  const existing = await db.query.departments.findMany({
    where: eq(departments.orgId, oid),
  });
  const existingTitles = new Set(existing.map((d) => d.title.toLowerCase()));

  const toInsert = DEFAULT_DEPARTMENTS.filter(
    (d) => !existingTitles.has(d.title.toLowerCase())
  );

  if (toInsert.length > 0) {
    await db.insert(departments).values(
      toInsert.map((d) => ({
        title: d.title,
        description: d.description,
        orgId: oid,
      }))
    );
  }

  revalidatePath("/hrm/departments");
  return { added: toInsert.length, skipped: DEFAULT_DEPARTMENTS.length - toInsert.length };
}
