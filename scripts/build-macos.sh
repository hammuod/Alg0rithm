#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/prepare-app.sh" && "$ROOT/scripts/prepare-app.sh"
OUT="$ROOT/dist"
APP="$ROOT/build/macos/Alg0rithm.app"
rm -rf "$ROOT/build/macos" && mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" "$OUT"
cp -a "$ROOT/web/app" "$APP/Contents/Resources/"
cat > "$APP/Contents/MacOS/Alg0rithm" << 'EOF'
#!/bin/bash
HERE="$(cd "$(dirname "$0")/.." && pwd)"
open "$HERE/Resources/app/index.html" 2>/dev/null || open "https://alg0rithm.dev"
EOF
chmod +x "$APP/Contents/MacOS/Alg0rithm"
cat > "$APP/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>Alg0rithm</string>
  <key>CFBundleIdentifier</key><string>dev.alg0rithm.app</string>
  <key>CFBundleVersion</key><string>$VERSION</string>
  <key>CFBundleExecutable</key><string>Alg0rithm</string>
  <key>CFBundlePackageType</key><string>APPL</string>
</dict></plist>
EOF
cd "$ROOT/build/macos" && zip -r "$OUT/Alg0rithm-${VERSION}-macos.zip" Alg0rithm.app
sha256sum "$OUT/Alg0rithm-${VERSION}-macos.zip" > "$OUT/Alg0rithm-${VERSION}-macos.zip.sha256" 2>/dev/null || shasum -a 256 "$OUT/Alg0rithm-${VERSION}-macos.zip" > "$OUT/Alg0rithm-${VERSION}-macos.zip.sha256"
