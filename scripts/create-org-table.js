const { neon } = require("@neondatabase/serverless");

async function main() {
  const user = "neondb_owner";
  const pass = "npg_B4GKQbA3vyZY";
  const host = "ep-solitary-scene-apk7vwr5-pooler.c-7.us-east-1.aws.neon.tech";
  const db = "neondb";
  const connStr = `postgresql://${user}:${pass}@${host}/${db}?sslmode=require&channel_binding=require`;

  const sql = neon(connStr);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS organization_settings (
      id serial PRIMARY KEY,
      clerk_org_id varchar(255) NOT NULL UNIQUE,
      name varchar(255),
      slug varchar(255),
      logo_url text,
      website varchar(500),
      address text,
      city varchar(100),
      state varchar(100),
      country varchar(100),
      zip varchar(20),
      phone varchar(50),
      email varchar(255),
      tax_id varchar(100),
      industry varchar(100),
      timezone varchar(100) DEFAULT 'America/New_York',
      currency varchar(3) DEFAULT 'USD',
      fiscal_year_start varchar(10) DEFAULT '01-01',
      created_at timestamp DEFAULT NOW(),
      updated_at timestamp DEFAULT NOW()
    )
  `);
  console.log("Table created");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
