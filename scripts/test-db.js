const { neon } = require("@neondatabase/serverless");
const user = "neondb_owner";
const pass = encodeURIComponent("npg_B4GKQbA3vyZY");
const host = "ep-solitary-scene-apk7vwr5-pooler.c-7.us-east-1.aws.neon.tech";
const connStr = "postgresql://" + user + ":***@" + host + "/neondb?sslmode=require&channel_binding=require";
console.log("Connection string:", connStr.substring(0, 80) + "...");
const sql = neon(connStr);
sql.query("SELECT 1 as test").then(r => console.log("OK:", r)).catch(e => console.error("ERR:", e.message.substring(0, 200)));
