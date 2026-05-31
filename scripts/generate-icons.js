const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <rect x="128" y="160" width="96" height="192" rx="16" fill="#6366f1"/>
  <rect x="240" y="128" width="96" height="256" rx="16" fill="#818cf8"/>
  <rect x="352" y="192" width="96" height="128" rx="16" fill="#a5b4fc"/>
</svg>`;

const sizes = [16, 32, 48, 64, 128, 192, 256, 512];
const publicDir = path.join(__dirname, "..", "public");

async function main() {
  // Generate PNG icons at each size
  for (const size of sizes) {
    const outPath = path.join(publicDir, `icon-${size}x${size}.png`);
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon (180x180)
  await sharp(Buffer.from(svg)).resize(180, 180).png().toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");

  // Replace icon.png with a proper 512x512
  sharp(Buffer.from(svg)).resize(512, 512).png().toFile(path.join(publicDir, "icon.png"));
  console.log("Replaced icon.png with 512x512");

  // Replace logo.png with a wider version for sidebar
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360" fill="none">
  <rect width="1200" height="360" fill="transparent"/>
  <rect x="32" y="60" width="64" height="240" rx="12" fill="#6366f1"/>
  <rect x="112" y="24" width="64" height="312" rx="12" fill="#818cf8"/>
  <rect x="192" y="96" width="64" height="168" rx="12" fill="#a5b4fc"/>
  <text x="310" y="230" font-family="system-ui, sans-serif" font-size="180" font-weight="700" fill="#0f172a">NextERP</text>
</svg>`;
  sharp(Buffer.from(logoSvg)).png().toFile(path.join(publicDir, "logo.png"));
  console.log("Replaced logo.png with branded version");

  console.log("All icons generated!");
}

main().catch(console.error);
