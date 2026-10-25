#!/usr/bin/env bash
# Alg0rithm installer – main repo (hammuod/Alg0rithm)
set -euo pipefail
APP_NAME="alg0rithm"
WEB="https://alg0rithm.dev"
REPO="https://github.com/hammuod/Alg0rithm"
RELEASES="$REPO/releases/latest/download"
info(){ echo "[INFO] $*"; }
success(){ echo "[OK] $*"; }

if [[ -f /etc/os-release ]]; then . /etc/os-release; else ID=unknown; NAME=Unknown; fi
info "System: ${NAME:-?} ($ID)"

BASE="${XDG_DATA_HOME:-$HOME/.local/share}"
BIN="${XDG_BIN_HOME:-$HOME/.local/bin}"
mkdir -p "$BIN" "$BASE/applications"

cat > "$BIN/$APP_NAME" << EOF
#!/usr/bin/env bash
exec xdg-open "$WEB" 2>/dev/null || echo "$WEB"
EOF
chmod +x "$BIN/$APP_NAME"

cat > "$BASE/applications/${APP_NAME}.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Alg0rithm
Exec=$BIN/$APP_NAME
Icon=alg0rithm
Terminal=false
Categories=Education;Development;
EOF

success "Installed launcher: $BIN/$APP_NAME"
info "Packages: $REPO/releases"
info "Or: curl -fsSL https://packages.alg0rithm.dev/install.sh | bash"
