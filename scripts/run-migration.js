const { neon } = require("@neondatabase/serverless");
const fs = require("fs");

async function main() {
  const user = "neondb_owner";
  const pass = "npg_B4GKQbA3vyZY";
  const host = "ep-solitary-scene-apk7vwr5-pooler.c-7.us-east-1.aws.neon.tech";
  const db = "neondb";
  const connStr = `postgresql://${user}:${encodeURIComponent(pass)}@${host}/${db}?sslmode=require&channel_binding=require`;
  
  const sql = neon(connStr);
  
  // Test connection first
  const test = await sql`SELECT 1 as test`;
  console.log("Connection OK:", test);

  // Drop old table
  await sql`DROP TABLE IF EXISTS email_templates CASCADE`;
  console.log("Dropped old email_templates");

  // Drop old type if exists
  await sql`DROP TYPE IF EXISTS email_template_type CASCADE`;
  console.log("Dropped old enum");

  // Create enum type
  await sql`CREATE TYPE email_template_type AS ENUM ('welcome', 'birthday', 'anniversary', 'leave_decision', 'payslip')`;
  console.log("Created enum type");

  // Create new email_templates table
  await sql`
    CREATE TABLE email_templates (
      id serial PRIMARY KEY,
      type email_template_type NOT NULL UNIQUE,
      name varchar(200) NOT NULL,
      subject varchar(500) NOT NULL,
      body_html text NOT NULL,
      enabled boolean DEFAULT true,
      is_default boolean DEFAULT false,
      description text,
      available_vars text,
      org_id varchar(255),
      created_at timestamp DEFAULT NOW(),
      updated_at timestamp DEFAULT NOW()
    )
  `;
  console.log("Created email_templates table");

  // Drop/create email_log enum and table
  await sql`DROP TYPE IF EXISTS email_log_status CASCADE`;
  await sql`CREATE TYPE email_log_status AS ENUM ('queued', 'sent', 'failed', 'bounced')`;
  await sql`
    CREATE TABLE email_logs (
      id serial PRIMARY KEY,
      template_id integer REFERENCES email_templates(id),
      template_type varchar(100),
      to_email varchar(255) NOT NULL,
      to_name varchar(255),
      subject varchar(500) NOT NULL,
      status email_log_status DEFAULT 'queued',
      error_message text,
      resend_id varchar(255),
      org_id varchar(255),
      created_at timestamp DEFAULT NOW()
    )
  `;
  console.log("Created email_logs table");

  console.log("Schema updated successfully. Default templates will be seeded on first API call.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
