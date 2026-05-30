import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  numeric,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const contactTypeEnum = pgEnum("contact_type", ["contact", "company"]);
export const activityTypeEnum = pgEnum("activity_type", [
  "call",
  "email",
  "note",
  "meeting",
  "task",
]);
export const dealStageEnum = pgEnum("deal_stage", [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const contactGroups = pgTable("contact_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crmCompanies = pgTable("crm_companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  employees: integer("employees"),
  annualRevenue: numeric("annual_revenue", { precision: 15, scale: 2 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  zip: varchar("zip", { length: 20 }),
  notes: text("notes"),
  ownerId: varchar("owner_id", { length: 255 }),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  type: contactTypeEnum("type").default("contact"),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  website: varchar("website", { length: 255 }),
  companyId: integer("company_id"),
  jobTitle: varchar("job_title", { length: 150 }),
  groupId: integer("group_id"),
  ownerId: varchar("owner_id", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  zip: varchar("zip", { length: 20 }),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("active"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("crm_activities", {
  id: serial("id").primaryKey(),
  type: activityTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }),
  message: text("message"),
  contactId: integer("contact_id"),
  companyId: integer("company_id"),
  dealId: integer("deal_id"),
  createdBy: varchar("created_by", { length: 255 }),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  stages: jsonb("stages")
    .$type<string[]>()
    .default(["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"]),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  value: numeric("value", { precision: 15, scale: 2 }),
  stage: dealStageEnum("stage").default("lead"),
  contactId: integer("contact_id"),
  companyId: integer("company_id"),
  pipelineId: integer("pipeline_id"),
  ownerId: varchar("owner_id", { length: 255 }),
  closeDate: date("close_date"),
  probability: integer("probability").default(0),
  notes: text("notes"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(crmCompanies, {
    fields: [contacts.companyId],
    references: [crmCompanies.id],
  }),
  group: one(contactGroups, {
    fields: [contacts.groupId],
    references: [contactGroups.id],
  }),
  activities: many(activities),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [deals.contactId],
    references: [contacts.id],
  }),
  company: one(crmCompanies, {
    fields: [deals.companyId],
    references: [crmCompanies.id],
  }),
  pipeline: one(pipelines, {
    fields: [deals.pipelineId],
    references: [pipelines.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  contact: one(contacts, {
    fields: [activities.contactId],
    references: [contacts.id],
  }),
  company: one(crmCompanies, {
    fields: [activities.companyId],
    references: [crmCompanies.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
}));
