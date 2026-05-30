import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  timestamp,
  boolean,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const employeeStatusEnum = pgEnum("employee_status", [
  "active",
  "inactive",
  "terminated",
]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const maritalStatusEnum = pgEnum("marital_status", [
  "single",
  "married",
  "divorced",
  "widowed",
]);
export const payTypeEnum = pgEnum("pay_type", ["hourly", "salary"]);
export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  leadId: varchar("lead_id", { length: 255 }),
  status: boolean("status").default(true),
  orgId: varchar("org_id", { length: 255 }).notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const designations = pgTable("designations", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: boolean("status").default(true),
  orgId: varchar("org_id", { length: 255 }).notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  employeeId: varchar("employee_id", { length: 20 }),
  departmentId: integer("department_id"),
  designationId: integer("designation_id"),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  mobile: varchar("mobile", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  maritalStatus: maritalStatusEnum("marital_status"),
  nationality: varchar("nationality", { length: 100 }),
  hireDate: date("hire_date"),
  type: varchar("type", { length: 50 }).default("employee"),
  status: employeeStatusEnum("status").default("active"),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  payRate: numeric("pay_rate", { precision: 10, scale: 2 }),
  payType: payTypeEnum("pay_type").default("salary"),
  avatarUrl: text("avatar_url"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaveTypes = pgTable("leave_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 10 }).default("#3b82f6"),
  maxDays: integer("max_days").default(15),
  carryForward: boolean("carry_forward").default(false),
  requireApproval: boolean("require_approval").default(true),
  status: boolean("status").default(true),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  leaveTypeId: integer("leave_type_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").default("pending"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const employeeNotes = pgTable("employee_notes", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  comment: text("comment").notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  start: date("start").notNull(),
  end: date("end"),
  recurring: boolean("recurring").default(false),
  description: text("description"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const departmentsRelations = relations(departments, ({ many }) => ({
  employees: many(employees),
}));

export const designationsRelations = relations(designations, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  designation: one(designations, {
    fields: [employees.designationId],
    references: [designations.id],
  }),
  leaveRequests: many(leaveRequests),
  notes: many(employeeNotes),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveRequests.leaveTypeId],
    references: [leaveTypes.id],
  }),
}));

export const payrollStatusEnum = pgEnum("payroll_status", [
  "draft",
  "processing",
  "paid",
  "cancelled",
]);

export const payrollRuns = pgTable("payroll_runs", {
  id: serial("id").primaryKey(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  status: payrollStatusEnum("status").default("draft"),
  totalGross: numeric("total_gross", { precision: 15, scale: 2 }).default("0"),
  totalDeductions: numeric("total_deductions", {
    precision: 15,
    scale: 2,
  }).default("0"),
  totalNet: numeric("total_net", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payslips = pgTable("payslips", {
  id: serial("id").primaryKey(),
  payrollRunId: integer("payroll_run_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  employeeName: varchar("employee_name", { length: 255 }).notNull(),
  grossPay: numeric("gross_pay", { precision: 15, scale: 2 }).notNull(),
  deductions: numeric("deductions", { precision: 15, scale: 2 }).default("0"),
  netPay: numeric("net_pay", { precision: 15, scale: 2 }).notNull(),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payrollRunsRelations = relations(payrollRuns, ({ many }) => ({
  payslips: many(payslips),
}));

export const payslipsRelations = relations(payslips, ({ one }) => ({
  payrollRun: one(payrollRuns, {
    fields: [payslips.payrollRunId],
    references: [payrollRuns.id],
  }),
  employee: one(employees, {
    fields: [payslips.employeeId],
    references: [employees.id],
  }),
}));
