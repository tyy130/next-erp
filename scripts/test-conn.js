const { neon } = require("@neondatabase/serverless");

async function main() {
  const connStr = "postgresql://neondb_owner:npg_B4GKQbA3vyZY@ep-solitary-scene-apk7vwr5-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  
  const sql = neon(connStr);
  const test = await sql`SELECT 1 as test`;
  console.log("Connection OK:", test);
}

main().catch((e) => { console.error("ERR:", e.message.substring(0, 200)); process.exit(1); });
