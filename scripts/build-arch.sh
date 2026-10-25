#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist"
BUILD="$ROOT/build/arch"
rm -rf "$BUILD" && mkdir -p "$BUILD" "$OUT"
cat > "$BUILD/PKGBUILD" << EOF
pkgname=alg0rithm
pkgver=$VERSION
pkgrel=1
pkgdesc="Alg0rithm"
arch=('any')
url="https://alg0rithm.dev"
license=('AGPL-3.0-or-later')
depends=('xdg-utils')
source=()
package() { install -Dm755 /dev/null "\$pkgdir/usr/bin/alg0rithm" || true; }
EOF
cat > "$BUILD/alg0rithm" << 'EOF'
#!/usr/bin/env bash
exec xdg-open "https://alg0rithm.dev"
EOF
chmod 755 "$BUILD/alg0rithm"
tar -C "$BUILD" -czf "$OUT/alg0rithm-${VERSION}-arch.src.tar.gz" PKGBUILD alg0rithm
sha256sum "$OUT/alg0rithm-${VERSION}-arch.src.tar.gz" > "$OUT/alg0rithm-${VERSION}-arch.src.tar.gz.sha256"
