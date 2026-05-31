import { pgTable, serial, varchar, text, timestamp, numeric, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const agentActionTypeEnum = pgEnum("agent_action_type", [
  "create_invoice",
  "send_invoice",
  "record_payment",
  "create_expense",
  "approve_expense",
  "create_contact",
  "update_contact",
  "create_employee",
  "update_employee",
  "run_payroll",
  "send_payroll",
  "generate_report",
  "send_email",
  "other",
]);

export const agentActionStatusEnum = pgEnum("agent_action_status", [
  "pending",
  "approved",
  "rejected",
  "executed",
  "failed",
]);

export const agentActions = pgTable("agent_actions", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 255 }).notNull(),
  agentName: varchar("agent_name", { length: 255 }),
  actionType: agentActionTypeEnum("action_type").notNull(),
  status: agentActionStatusEnum("status").notNull().default("pending"),
  resourceType: varchar("resource_type", { length: 100 }),
  resourceId: integer("resource_id"),
  payload: jsonb("payload"),
  result: jsonb("result"),
  errorMessage: text("error_message"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  executedAt: timestamp("executed_at"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentGuardrails = pgTable("agent_guardrails", {
  id: serial("id").primaryKey(),
  orgId: varchar("org_id", { length: 255 }).notNull().unique(),
  enabled: boolean("enabled").default(true),
  requireApprovalAbove: numeric("require_approval_above", { precision: 15, scale: 2 }).default("1000"),
  requireApprovalActions: text("require_approval_actions").default('["run_payroll","create_employee"]'),
  dailyActionLimit: integer("daily_action_limit").default(50),
  allowedHoursStart: varchar("allowed_hours_start", { length: 5 }).default("08:00"),
  allowedHoursEnd: varchar("allowed_hours_end", { length: 5 }).default("20:00"),
  notifyOnAction: boolean("notify_on_action").default(true),
  notifyEmail: varchar("notify_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  keyPrefix: varchar("key_prefix", { length: 8 }).notNull(),
  scopes: text("scopes").default('["read"]'),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});
