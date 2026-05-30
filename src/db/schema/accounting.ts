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
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "income",
  "expense",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "partial",
  "paid",
  "overdue",
  "cancelled",
]);
export const billStatusEnum = pgEnum("bill_status", [
  "draft",
  "received",
  "partial",
  "paid",
  "overdue",
  "cancelled",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "debit",
  "credit",
]);

export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  type: accountTypeEnum("type").notNull(),
  parentId: integer("parent_id"),
  system: boolean("system").default(false),
  status: boolean("status").default(true),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ledgers = pgTable("ledgers", {
  id: serial("id").primaryKey(),
  chartId: integer("chart_id").notNull(),
  code: varchar("code", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  system: boolean("system").default(false),
  balance: numeric("balance", { precision: 15, scale: 2 }).default("0"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  contactId: integer("contact_id"),
  contactName: varchar("contact_name", { length: 255 }),
  trnDate: date("trn_date").notNull(),
  dueDate: date("due_date"),
  billingAddress: text("billing_address"),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0"),
  discountType: varchar("discount_type", { length: 20 }).default("flat"),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull(),
  taxTotal: numeric("tax_total", { precision: 15, scale: 2 }).default("0"),
  total: numeric("total", { precision: 15, scale: 2 }).notNull(),
  amountDue: numeric("amount_due", { precision: 15, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").default("draft"),
  notes: text("notes"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  description: text("description").notNull(),
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 15, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
  lineTotal: numeric("line_total", { precision: 15, scale: 2 }).notNull(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  billNumber: varchar("bill_number", { length: 50 }).notNull(),
  vendorId: integer("vendor_id"),
  vendorName: varchar("vendor_name", { length: 255 }),
  trnDate: date("trn_date").notNull(),
  dueDate: date("due_date"),
  billingAddress: text("billing_address"),
  discount: numeric("discount", { precision: 10, scale: 2 }).default("0"),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull(),
  taxTotal: numeric("tax_total", { precision: 15, scale: 2 }).default("0"),
  total: numeric("total", { precision: 15, scale: 2 }).notNull(),
  amountDue: numeric("amount_due", { precision: 15, scale: 2 }).notNull(),
  status: billStatusEnum("status").default("draft"),
  notes: text("notes"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull(),
  ledgerId: integer("ledger_id"),
  description: text("description").notNull(),
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 15, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 15, scale: 2 }).notNull(),
});

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  trnDate: date("trn_date").notNull(),
  ref: varchar("ref", { length: 255 }),
  narration: text("narration"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalDetails = pgTable("journal_details", {
  id: serial("id").primaryKey(),
  journalId: integer("journal_id").notNull(),
  ledgerId: integer("ledger_id").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  method: varchar("method", { length: 50 }).default("bank_transfer"),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const invoicesRelations = relations(invoices, ({ many }) => ({
  items: many(invoiceItems),
  payments: many(payments),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const billsRelations = relations(bills, ({ many }) => ({
  items: many(billItems),
}));

export const billItemsRelations = relations(billItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id],
  }),
  ledger: one(ledgers, {
    fields: [billItems.ledgerId],
    references: [ledgers.id],
  }),
}));

export const journalsRelations = relations(journals, ({ many }) => ({
  details: many(journalDetails),
}));

export const journalDetailsRelations = relations(journalDetails, ({ one }) => ({
  journal: one(journals, {
    fields: [journalDetails.journalId],
    references: [journals.id],
  }),
  ledger: one(ledgers, {
    fields: [journalDetails.ledgerId],
    references: [ledgers.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const ledgersRelations = relations(ledgers, ({ one }) => ({
  chart: one(chartOfAccounts, {
    fields: [ledgers.chartId],
    references: [chartOfAccounts.id],
  }),
}));
