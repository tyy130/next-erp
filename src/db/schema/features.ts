import { pgTable, serial, varchar, text, integer, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id"),
  employeeName: varchar("employee_name", { length: 255 }),
  projectId: integer("project_id"),
  projectName: varchar("project_name", { length: 255 }),
  taskName: varchar("task_name", { length: 255 }),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationMinutes: integer("duration_minutes"),
  billable: boolean("billable").default(true),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("running"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fileAttachments = pgTable("file_attachments", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  storagePath: varchar("storage_path", { length: 1000 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: integer("resource_id").notNull(),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webhookSubscriptions = pgTable("webhook_subscriptions", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 1000 }).notNull(),
  secret: varchar("secret", { length: 255 }),
  events: text("events").default('["*"]'),
  isActive: boolean("is_active").default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  lastStatus: varchar("last_status", { length: 50 }),
  failureCount: integer("failure_count").default(0),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  orgId: varchar("org_id", { length: 255 }),
  theme: varchar("theme", { length: 20 }).default("system"),
  language: varchar("language", { length: 10 }).default("en"),
  dateFormat: varchar("date_format", { length: 20 }).default("MM/DD/YYYY"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }),
  resourceId: integer("resource_id"),
  details: jsonb("details"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
