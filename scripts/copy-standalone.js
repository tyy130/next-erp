const fs = require("fs");
const path = require("path");

const standaloneSrc = path.join(__dirname, "..", ".next", "standalone");
const serverDest = path.join(__dirname, "..", "src-tauri", "standalone-server");

// Clean destination
if (fs.existsSync(serverDest)) {
  fs.rmSync(serverDest, { recursive: true });
}
fs.mkdirSync(serverDest, { recursive: true });

// Copy Dev/next-erp/ (contains server.js, app node_modules, .next/)
const appDir = path.join(standaloneSrc, "Dev", "next-erp");
if (fs.existsSync(appDir)) {
  console.log("Copying Dev/next-erp/ -> standalone-server/app/");
  fs.cpSync(appDir, path.join(serverDest, "app"), { recursive: true });
}

// Copy root node_modules/
const rootModules = path.join(standaloneSrc, "node_modules");
if (fs.existsSync(rootModules)) {
  console.log("Copying node_modules/...");
  fs.cpSync(rootModules, path.join(serverDest, "node_modules"), { recursive: true });
}

console.log("\nStandalone server prepared at:", serverDest);
console.log("Contents:", fs.readdirSync(serverDest));
console.log("server.js exists:", fs.existsSync(path.join(serverDest, "app", "server.js")));

// Print size estimate
function dirSize(dir) {
  let size = 0;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    size += stat.isDirectory() ? dirSize(full) : stat.size;
  }
  return size;
}
const totalMB = Math.round(dirSize(serverDest) / 1024 / 1024);
console.log(`Total size: ${totalMB} MB`);
