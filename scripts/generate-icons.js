const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <rect x="128" y="160" width="96" height="192" rx="16" fill="#6366f1"/>
  <rect x="240" y="128" width="96" height="256" rx="16" fill="#818cf8"/>
  <rect x="352" y="192" width="96" height="128" rx="16" fill="#a5b4fc"/>
</svg>`;

const publicDir = path.join(__dirname, "..", "public");
const tauriIconsDir = path.join(__dirname, "..", "src-tauri", "icons");

async function main() {
  // === Public web icons ===
  const sizes = [16, 32, 48, 64, 128, 192, 256, 512];
  for (const size of sizes) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(publicDir, `icon-${size}x${size}.png`));
  }
  await sharp(Buffer.from(svg)).resize(180, 180).png().toFile(path.join(publicDir, "apple-touch-icon.png"));
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(path.join(publicDir, "icon.png"));

  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360" fill="none">
    <rect width="1200" height="360" fill="transparent"/>
    <rect x="32" y="60" width="64" height="240" rx="12" fill="#6366f1"/>
    <rect x="112" y="24" width="64" height="312" rx="12" fill="#818cf8"/>
    <rect x="192" y="96" width="64" height="168" rx="12" fill="#a5b4fc"/>
    <text x="310" y="230" font-family="system-ui,sans-serif" font-size="180" font-weight="700" fill="#0f172a">NextERP</text>
  </svg>`;
  await sharp(Buffer.from(logoSvg)).png().toFile(path.join(publicDir, "logo.png"));

  console.log("✅ Web icons generated");

  // === Tauri desktop icons ===
  // 32x32 PNG (Linux)
  await sharp(Buffer.from(svg)).resize(32, 32).png().toFile(path.join(tauriIconsDir, "32x32.png"));

  // 128x128 PNG
  await sharp(Buffer.from(svg)).resize(128, 128).png().toFile(path.join(tauriIconsDir, "128x128.png"));

  // 128x128@2x (macOS Retina)
  await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(path.join(tauriIconsDir, "128x128@2x.png"));

  // .ico (Windows) — 256x256 works for the ICO
  await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(path.join(tauriIconsDir, "icon.ico"));

  // .icns (macOS) — generate via temporary dir
  const tmpDir = path.join(tauriIconsDir, "icon.iconset");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];
  for (const size of icnsSizes) {
    const half = size / 2;
    const oneX = size === 1024 ? 512 : half;
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(tmpDir, `icon_${size}x${size}.png`));
    if (size !== 16) {
      await sharp(Buffer.from(svg)).resize(oneX, oneX).png().toFile(path.join(tmpDir, `icon_${half}x${half}@2x.png`));
    }
  }

  // Use iconutil on macOS or icnsutils; for cross-platform we just provide the iconset
  // Tauri can build .icns during the build process
  console.log("✅ Tauri desktop icons generated");
  console.log("All icons done!");
}

main().catch(console.error);
