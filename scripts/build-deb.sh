#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
PKG_NAME="alg0rithm"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/prepare-app.sh" && "$ROOT/scripts/prepare-app.sh"
WEB_APP="$ROOT/web/app"
BUILD="$ROOT/build/deb"
OUT="$ROOT/dist"
rm -rf "$BUILD"
mkdir -p "$BUILD/DEBIAN" "$BUILD/usr/bin" "$BUILD/usr/share/$PKG_NAME" \
  "$BUILD/usr/share/applications" "$BUILD/usr/share/icons/hicolor/256x256/apps" \
  "$BUILD/usr/share/doc/$PKG_NAME" "$OUT"
cat > "$BUILD/DEBIAN/control" << EOF
Package: $PKG_NAME
Version: $VERSION
Section: education
Priority: optional
Architecture: all
Maintainer: Hammoud <contact@alg0rithm.dev>
Depends: xdg-utils
Description: Alg0rithm – learn algorithms simply
EOF
cat > "$BUILD/DEBIAN/postinst" << 'EOF'
#!/bin/sh
set -e
command -v update-desktop-database >/dev/null && update-desktop-database -q || true
EOF
chmod 755 "$BUILD/DEBIAN/postinst"
cp -a "$WEB_APP/." "$BUILD/usr/share/$PKG_NAME/"
cat > "$BUILD/usr/bin/$PKG_NAME" << EOF
#!/usr/bin/env bash
INDEX="/usr/share/${PKG_NAME}/index.html"
if [[ -f "\$INDEX" ]] && command -v xdg-open >/dev/null; then exec xdg-open "\$INDEX"; fi
exec xdg-open "https://alg0rithm.dev" 2>/dev/null || echo "Open \$INDEX"
EOF
chmod 755 "$BUILD/usr/bin/$PKG_NAME"
cat > "$BUILD/usr/share/applications/${PKG_NAME}.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Alg0rithm
Exec=$PKG_NAME
Icon=$PKG_NAME
Terminal=false
Categories=Education;Development;
EOF
[[ -f "$ROOT/imgs/icon.png" ]] && cp "$ROOT/imgs/icon.png" "$BUILD/usr/share/icons/hicolor/256x256/apps/${PKG_NAME}.png" || true
dpkg-deb --build --root-owner-group "$BUILD" "$OUT/${PKG_NAME}_${VERSION}_all.deb"
sha256sum "$OUT/${PKG_NAME}_${VERSION}_all.deb" > "$OUT/${PKG_NAME}_${VERSION}_all.deb.sha256"
ls -lh "$OUT"/*.deb
