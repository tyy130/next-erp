const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load from .env.production which has the decrypted values
  const envFile = path.join(__dirname, "..", ".env.production");
  if (fs.existsSync(envFile)) {
    const env = fs.readFileSync(envFile, "utf8");
    const match = env.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (match) process.env.DATABASE_URL = match[1].replace(/^"|"$/g, "");
  }
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);
  const stmts = [
    `CREATE TABLE IF NOT EXISTS recurring_invoices (id serial PRIMARY KEY, name varchar(255) NOT NULL, invoice_number varchar(50), contact_id integer, contact_name varchar(255), billing_address text, discount numeric(10,2) DEFAULT 0, discount_type varchar(20) DEFAULT 'flat', tax_total numeric(15,2) DEFAULT 0, total numeric(15,2) NOT NULL, currency varchar(3) DEFAULT 'USD', notes text, status varchar(20) DEFAULT 'active', frequency varchar(20) DEFAULT 'monthly', start_date date NOT NULL, end_date date, next_run_date date NOT NULL, last_run_date date, org_id varchar(255) NOT NULL, created_by varchar(255), created_at timestamp DEFAULT NOW(), updated_at timestamp DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS recurring_invoice_items (id serial PRIMARY KEY, recurring_invoice_id integer NOT NULL, description text NOT NULL, qty numeric(10,2) NOT NULL, unit_price numeric(15,2) NOT NULL, discount numeric(10,2) DEFAULT 0, tax_rate numeric(5,2) DEFAULT 0, line_total numeric(15,2) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS time_entries (id serial PRIMARY KEY, employee_id integer, employee_name varchar(255), project_id integer, project_name varchar(255), task_name varchar(255), description text, start_time timestamp NOT NULL, end_time timestamp, duration_minutes integer, billable boolean DEFAULT true, hourly_rate numeric(10,2), status varchar(20) DEFAULT 'running', org_id varchar(255) NOT NULL, created_at timestamp DEFAULT NOW(), updated_at timestamp DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS file_attachments (id serial PRIMARY KEY, file_name varchar(500) NOT NULL, file_size integer, mime_type varchar(100), storage_path varchar(1000) NOT NULL, resource_type varchar(100) NOT NULL, resource_id integer NOT NULL, uploaded_by varchar(255), org_id varchar(255) NOT NULL, created_at timestamp DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS webhook_subscriptions (id serial PRIMARY KEY, url varchar(1000) NOT NULL, secret varchar(255), events text DEFAULT '["*"]', is_active boolean DEFAULT true, last_triggered_at timestamp, last_status varchar(50), failure_count integer DEFAULT 0, org_id varchar(255) NOT NULL, created_by varchar(255), created_at timestamp DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS webhook_deliveries (id serial PRIMARY KEY, webhook_id integer NOT NULL, event varchar(100) NOT NULL, payload jsonb, response_status integer, response_body text, duration_ms integer, success boolean DEFAULT false, created_at timestamp DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS user_preferences (id serial PRIMARY KEY, user_id varchar(255) NOT NULL UNIQUE, org_id varchar(255), theme varchar(20) DEFAULT 'system', language varchar(10) DEFAULT 'en', date_format varchar(20) DEFAULT 'MM/DD/YYYY', created_at timestamp DEFAULT NOW(), updated_at timestamp DEFAULT NOW())`,
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'USD'`,
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS exchange_rate numeric(10,6) DEFAULT 1`,
    `ALTER TABLE bills ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'USD'`,
    `ALTER TABLE bills ADD COLUMN IF NOT EXISTS exchange_rate numeric(10,6) DEFAULT 1`,
    `ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS default_currency varchar(3) DEFAULT 'USD'`,
    `ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS supported_currencies text DEFAULT '["USD"]'`,
    `CREATE TABLE IF NOT EXISTS audit_log (id serial PRIMARY KEY, user_id varchar(255), action varchar(100) NOT NULL, resource_type varchar(100), resource_id integer, details jsonb, org_id varchar(255) NOT NULL, created_at timestamp DEFAULT NOW())`,
    `CREATE INDEX IF NOT EXISTS idx_recurring_invoices_org ON recurring_invoices(org_id)`,
    `CREATE INDEX IF NOT EXISTS idx_time_entries_org ON time_entries(org_id)`,
    `CREATE INDEX IF NOT EXISTS idx_file_attachments_resource ON file_attachments(resource_type, resource_id)`,
    `CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_org ON webhook_subscriptions(org_id)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_log_org ON audit_log(org_id)`,
  ];
  let ok = 0, fail = 0;
  for (const stmt of stmts) {
    try { await sql.query(stmt); ok++; } catch (e) { fail++; console.error("FAIL:", stmt.substring(0, 50), e.message ? e.message.substring(0, 80) : String(e)); }
  }
  console.log("Done: " + ok + " OK, " + fail + " failed");
}
main().catch(e => { console.error(e.message); process.exit(1); });
