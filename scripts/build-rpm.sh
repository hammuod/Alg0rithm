#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/prepare-app.sh" && "$ROOT/scripts/prepare-app.sh"
BUILD="$ROOT/build/rpm"
OUT="$ROOT/dist"
TOP="$BUILD/rpmbuild"
rm -rf "$BUILD" && mkdir -p "$TOP"/{BUILD,RPMS,SOURCES,SPECS,SRPMS} "$OUT"
SRC="$BUILD/alg0rithm-$VERSION"
mkdir -p "$SRC"
cp -a "$ROOT/web/app/." "$SRC/app/" 2>/dev/null || true
cat > "$SRC/alg0rithm" << 'EOF'
#!/usr/bin/env bash
HERE="$(cd "$(dirname "$0")" && pwd)"
[[ -f "$HERE/app/index.html" ]] && exec xdg-open "$HERE/app/index.html"
exec xdg-open "https://alg0rithm.dev"
EOF
chmod 755 "$SRC/alg0rithm"
cp "$ROOT/imgs/icon.png" "$SRC/icon.png" 2>/dev/null || true
tar -C "$BUILD" -czf "$TOP/SOURCES/alg0rithm-$VERSION.tar.gz" "alg0rithm-$VERSION"
cat > "$TOP/SPECS/alg0rithm.spec" << EOF
Name: alg0rithm
Version: $VERSION
Release: 1%{?dist}
Summary: Alg0rithm learning app
License: AGPL-3.0
Source0: %{name}-%{version}.tar.gz
BuildArch: noarch
Requires: xdg-utils
%description
Alg0rithm desktop package
%prep
%setup -q
%install
mkdir -p %{buildroot}/usr/bin %{buildroot}/usr/share/alg0rithm
install -m 755 alg0rithm %{buildroot}/usr/bin/alg0rithm
cp -a app %{buildroot}/usr/share/alg0rithm/ 2>/dev/null || true
%files
/usr/bin/alg0rithm
/usr/share/alg0rithm
EOF
command -v rpmbuild >/dev/null || { sudo apt-get update -qq && sudo apt-get install -y -qq rpm; }
rpmbuild --define "_topdir $TOP" -bb "$TOP/SPECS/alg0rithm.spec"
find "$TOP/RPMS" -name '*.rpm' -exec cp {} "$OUT/" \;
ls -lh "$OUT"/*.rpm 2>/dev/null || true
