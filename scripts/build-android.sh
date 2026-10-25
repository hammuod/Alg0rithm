#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/prepare-app.sh" && "$ROOT/scripts/prepare-app.sh"
OUT="$ROOT/dist"
BUILD="$ROOT/build/android"
rm -rf "$BUILD" && mkdir -p "$BUILD" "$OUT"
cp -a "$ROOT/web/app" "$BUILD/"
cat > "$BUILD/twa-manifest.json" << EOF
{"packageId":"dev.alg0rithm.app","host":"alg0rithm.dev","name":"Alg0rithm","startUrl":"/","themeColor":"#4A90E2","appVersionName":"$VERSION"}
EOF
cd "$BUILD" && tar -czf "$OUT/Alg0rithm-${VERSION}-android-web.tar.gz" app twa-manifest.json
sha256sum "$OUT/Alg0rithm-${VERSION}-android-web.tar.gz" > "$OUT/Alg0rithm-${VERSION}-android-web.tar.gz.sha256"
