const fs = require("fs");
const path = require("path");

const base = path.join(__dirname, "..", ".next", "standalone");

function listDir(dir, prefix = "") {
  const entries = fs.readdirSync(dir);
  for (const e of entries) {
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      console.log(`${prefix}${e}/`);
      if (prefix.length < 6) listDir(full, prefix + "  ");
    } else {
      console.log(`${prefix}${e}`);
    }
  }
}

listDir(base);
