const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const iconsetDir = path.join(__dirname, "..", "src-tauri", "icons", "icon.iconset");
const icnsOut = path.join(__dirname, "..", "src-tauri", "icons", "icon.icns");

if (fs.existsSync(iconsetDir)) {
  try {
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsOut}"`, { stdio: "pipe" });
    console.log("✅ Generated icon.icns");
  } catch (e) {
    // iconutil is macOS-only. On Linux/Windows, generate from largest PNG
    console.log("⚠️  iconutil not available (macOS only), using PNG fallback");
    const sharp = require("sharp");
    const png512 = path.join(__dirname, "..", "src-tauri", "icons", "128x128@2x.png");
    if (fs.existsSync(png512)) {
      fs.copyFileSync(png512, icnsOut);
      console.log("Copied 256x256 PNG as icon.icns placeholder");
    }
  }
} else {
  console.log("⚠️  icon.iconset not found, skipping .icns generation");
}
