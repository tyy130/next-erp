const { neon } = require("@neondatabase/serverless");
async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const stmts = [
    `CREATE TABLE IF NOT EXISTS agent_actions (
      id serial PRIMARY KEY, agent_id varchar(255) NOT NULL, agent_name varchar(255),
      action_type varchar(50) NOT NULL, status varchar(20) NOT NULL DEFAULT 'pending',
      resource_type varchar(100), resource_id integer, payload jsonb, result jsonb,
      error_message text, approved_by varchar(255), approved_at timestamp,
      executed_at timestamp, org_id varchar(255) NOT NULL, created_at timestamp DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS agent_guardrails (
      id serial PRIMARY KEY, org_id varchar(255) NOT NULL UNIQUE, enabled boolean DEFAULT true,
      require_approval_above numeric(15,2) DEFAULT 1000,
      require_approval_actions text DEFAULT '["run_payroll","create_employee"]',
      daily_action_limit integer DEFAULT 50, allowed_hours_start varchar(5) DEFAULT '08:00',
      allowed_hours_end varchar(5) DEFAULT '20:00', notify_on_action boolean DEFAULT true,
      notify_email varchar(255), created_at timestamp DEFAULT NOW(), updated_at timestamp DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS api_keys (
      id serial PRIMARY KEY, name varchar(255) NOT NULL, key_hash varchar(255) NOT NULL UNIQUE,
      key_prefix varchar(8) NOT NULL, scopes text DEFAULT '["read"]', last_used_at timestamp,
      expires_at timestamp, is_active boolean DEFAULT true, org_id varchar(255) NOT NULL,
      created_by varchar(255), created_at timestamp DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_agent_actions_org ON agent_actions(org_id)`,
    `CREATE INDEX IF NOT EXISTS idx_agent_actions_status ON agent_actions(status)`,
    `CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash)`,
  ];
  for (const stmt of stmts) {
    await sql.query(stmt);
  }
  console.log("Agent tables created");
}
main().catch(e => { console.error(e.message); process.exit(1); });
