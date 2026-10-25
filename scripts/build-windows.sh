#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/prepare-app.sh" && "$ROOT/scripts/prepare-app.sh"
OUT="$ROOT/dist"
APP="$ROOT/build/windows/Alg0rithm"
rm -rf "$ROOT/build/windows" && mkdir -p "$APP" "$OUT"
cp -a "$ROOT/web/app" "$APP/"
cat > "$APP/Alg0rithm.bat" << 'EOF'
@echo off
set HERE=%~dp0
if exist "%HERE%app\index.html" (start "" "%HERE%app\index.html") else (start "" "https://alg0rithm.dev")
EOF
cd "$ROOT/build/windows"
if command -v zip >/dev/null; then
  zip -r "$OUT/Alg0rithm-${VERSION}-windows-portable.zip" Alg0rithm
elif command -v powershell >/dev/null; then
  powershell -Command "Compress-Archive -Path Alg0rithm -DestinationPath '$OUT/Alg0rithm-${VERSION}-windows-portable.zip' -Force"
else
  tar -czf "$OUT/Alg0rithm-${VERSION}-windows-portable.tar.gz" Alg0rithm
fi
(cd "$OUT" && for f in Alg0rithm-${VERSION}-windows-portable.*; do [[ -f $f ]] && (sha256sum "$f" > "$f.sha256" 2>/dev/null || shasum -a 256 "$f" > "$f.sha256"); done)
