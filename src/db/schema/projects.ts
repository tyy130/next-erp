import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  numeric,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("planning"),
  clientName: varchar("client_name", { length: 255 }),
  budget: numeric("budget", { precision: 15, scale: 2 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  managerId: varchar("manager_id", { length: 255 }),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("todo"),
  priority: taskPriorityEnum("priority").default("medium"),
  assigneeId: varchar("assignee_id", { length: 255 }),
  assigneeName: varchar("assignee_name", { length: 255 }),
  dueDate: date("due_date"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(projectTasks),
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTasks.projectId],
    references: [projects.id],
  }),
}));
