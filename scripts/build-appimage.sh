#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/prepare-app.sh" && "$ROOT/scripts/prepare-app.sh"
OUT="$ROOT/dist"
BUILD="$ROOT/build/appimage/Alg0rithm.AppDir"
rm -rf "$ROOT/build/appimage" && mkdir -p "$BUILD/usr/bin" "$OUT"
cp -a "$ROOT/web/app" "$BUILD/"
cat > "$BUILD/AppRun" << 'EOF'
#!/usr/bin/env bash
HERE="$(dirname "$(readlink -f "$0")")"
xdg-open "$HERE/app/index.html" 2>/dev/null || xdg-open "https://alg0rithm.dev"
EOF
chmod 755 "$BUILD/AppRun"
cp "$BUILD/AppRun" "$BUILD/usr/bin/alg0rithm"
tar -C "$ROOT/build/appimage" -czf "$OUT/Alg0rithm-${VERSION}-x86_64.AppDir.tar.gz" Alg0rithm.AppDir
sha256sum "$OUT/Alg0rithm-${VERSION}-x86_64.AppDir.tar.gz" > "$OUT/Alg0rithm-${VERSION}-x86_64.AppDir.tar.gz.sha256"
