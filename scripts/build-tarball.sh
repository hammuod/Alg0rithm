#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/prepare-app.sh" && "$ROOT/scripts/prepare-app.sh"
OUT="$ROOT/dist"
BUILD="$ROOT/build/tarball/alg0rithm-$VERSION"
rm -rf "$ROOT/build/tarball" && mkdir -p "$BUILD/bin" "$OUT"
cp -a "$ROOT/web/app" "$BUILD/"
cat > "$BUILD/bin/alg0rithm" << 'EOF'
#!/usr/bin/env bash
HERE="$(cd "$(dirname "$0")/.." && pwd)"
[[ -f "$HERE/app/index.html" ]] && exec xdg-open "$HERE/app/index.html"
exec xdg-open "https://alg0rithm.dev"
EOF
chmod 755 "$BUILD/bin/alg0rithm"
tar -C "$ROOT/build/tarball" -czf "$OUT/alg0rithm-${VERSION}-linux-any.tar.gz" "alg0rithm-$VERSION"
sha256sum "$OUT/alg0rithm-${VERSION}-linux-any.tar.gz" > "$OUT/alg0rithm-${VERSION}-linux-any.tar.gz.sha256"
