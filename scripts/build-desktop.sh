#!/usr/bin/env bash
set -e

echo "=== NextERP Desktop Build ==="

# Ensure dev deps are installed (tauri cli needs them)
npm install --include=dev

# 1. Build Next.js with standalone output
echo "[1/3] Building Next.js..."
TAURI_BUILD=true npm run build

# 2. Copy standalone server for Tauri to bundle
echo "[2/3] Copying standalone server..."
node scripts/copy-standalone.js

# 3. Build Tauri desktop app
echo "[3/3] Building Tauri desktop app..."
cd src-tauri && cargo tauri build && cd ..

echo ""
echo "=== Build Complete ==="
echo "Installers are in: src-tauri/target/release/bundle/"
ls -la src-tauri/target/release/bundle/ 2>/dev/null || echo "(check src-tauri/target/release/bundle/ for output)"
