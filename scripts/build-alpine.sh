#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist"
BUILD="$ROOT/build/alpine"
rm -rf "$BUILD" && mkdir -p "$BUILD" "$OUT"
cat > "$BUILD/APKBUILD" << EOF
pkgname=alg0rithm
pkgver=$VERSION
pkgrel=0
pkgdesc="Alg0rithm"
url="https://alg0rithm.dev"
arch="noarch"
license="AGPL-3.0-or-later"
EOF
cat > "$BUILD/alg0rithm" << 'EOF'
#!/bin/sh
xdg-open "https://alg0rithm.dev" 2>/dev/null || echo https://alg0rithm.dev
EOF
chmod 755 "$BUILD/alg0rithm"
tar -C "$BUILD" -czf "$OUT/alg0rithm-${VERSION}-alpine.src.tar.gz" APKBUILD alg0rithm
sha256sum "$OUT/alg0rithm-${VERSION}-alpine.src.tar.gz" > "$OUT/alg0rithm-${VERSION}-alpine.src.tar.gz.sha256"
