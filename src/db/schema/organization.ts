import { pgTable, serial, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const organizationSettings = pgTable("organization_settings", {
  id: serial("id").primaryKey(),
  clerkOrgId: varchar("clerk_org_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  slug: varchar("slug", { length: 255 }),
  logoUrl: text("logo_url"),
  website: varchar("website", { length: 500 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  zip: varchar("zip", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  taxId: varchar("tax_id", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  timezone: varchar("timezone", { length: 100 }).default("America/New_York"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  fiscalYearStart: varchar("fiscal_year_start", { length: 10 }).default("01-01"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
