-- NextERP Feature Migration — Run this in your Neon SQL Editor
-- https://console.neon.tech → your project → SQL Editor

-- 1. Time Tracking
CREATE TABLE IF NOT EXISTS time_entries (
  id serial PRIMARY KEY,
  employee_id integer,
  employee_name varchar(255),
  project_id integer,
  project_name varchar(255),
  task_name varchar(255),
  description text,
  start_time timestamp NOT NULL,
  end_time timestamp,
  duration_minutes integer,
  billable boolean DEFAULT true,
  hourly_rate numeric(10,2),
  status varchar(20) DEFAULT 'running',
  org_id varchar(255) NOT NULL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_time_entries_org ON time_entries(org_id);

-- 2. File Attachments
CREATE TABLE IF NOT EXISTS file_attachments (
  id serial PRIMARY KEY,
  file_name varchar(500) NOT NULL,
  file_size integer,
  mime_type varchar(100),
  storage_path varchar(1000) NOT NULL,
  resource_type varchar(100) NOT NULL,
  resource_id integer NOT NULL,
  uploaded_by varchar(255),
  org_id varchar(255) NOT NULL,
  created_at timestamp DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_file_attachments_resource ON file_attachments(resource_type, resource_id);

-- 3. Webhook Subscriptions
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id serial PRIMARY KEY,
  url varchar(1000) NOT NULL,
  secret varchar(255),
  events text DEFAULT '["*"]',
  is_active boolean DEFAULT true,
  last_triggered_at timestamp,
  last_status varchar(50),
  failure_count integer DEFAULT 0,
  org_id varchar(255) NOT NULL,
  created_by varchar(255),
  created_at timestamp DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_org ON webhook_subscriptions(org_id);

-- 4. User Preferences (dark mode, language, date format)
CREATE TABLE IF NOT EXISTS user_preferences (
  id serial PRIMARY KEY,
  user_id varchar(255) NOT NULL UNIQUE,
  org_id varchar(255),
  theme varchar(20) DEFAULT 'system',
  language varchar(10) DEFAULT 'en',
  date_format varchar(20) DEFAULT 'MM/DD/YYYY',
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- 5. Audit Log (CSV import/export, agent actions)
CREATE TABLE IF NOT EXISTS audit_log (
  id serial PRIMARY KEY,
  user_id varchar(255),
  action varchar(100) NOT NULL,
  resource_type varchar(100),
  resource_id integer,
  details jsonb,
  org_id varchar(255) NOT NULL,
  created_at timestamp DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_org ON audit_log(org_id);

-- 6. Add currency columns to existing tables
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'USD';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS exchange_rate numeric(10,6) DEFAULT 1;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS currency varchar(3) DEFAULT 'USD';
ALTER TABLE bills ADD COLUMN IF NOT EXISTS exchange_rate numeric(10,6) DEFAULT 1;
ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS default_currency varchar(3) DEFAULT 'USD';
ALTER TABLE organization_settings ADD COLUMN IF NOT EXISTS supported_currencies text DEFAULT '["USD"]';

-- 7. Fix email_templates unique constraint (drizzle-kit was asking about this)
-- Rename the existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_templates_type_unique') THEN
    ALTER TABLE email_templates DROP CONSTRAINT email_templates_type_unique;
  END IF;
END $$;
ALTER TABLE email_templates ADD CONSTRAINT email_templates_type_unique UNIQUE (type);
