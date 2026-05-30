import { pgTable, serial, varchar, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";

export const emailTemplateTypeEnum = pgEnum("email_template_type", [
  "welcome",
  "birthday",
  "anniversary",
  "leave_decision",
  "payslip",
]);

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  type: emailTemplateTypeEnum("type").notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  enabled: boolean("enabled").default(true),
  isDefault: boolean("is_default").default(false),
  description: text("description"),
  availableVars: text("available_vars"),
  orgId: varchar("org_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailLogStatusEnum = pgEnum("email_log_status", [
  "queued",
  "sent",
  "failed",
  "bounced",
]);

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id"),
  templateType: varchar("template_type", { length: 100 }),
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  toName: varchar("to_name", { length: 255 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  status: emailLogStatusEnum("status").default("queued"),
  errorMessage: text("error_message"),
  resendId: varchar("resend_id", { length: 255 }),
  orgId: varchar("org_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});
