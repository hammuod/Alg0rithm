#!/usr/bin/env bash
# Build real native Alg0rithm desktop app (Tauri) — not a browser launcher
set -euo pipefail

VERSION="${VERSION:-3.0.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP="$ROOT/desktop"
OUT="$ROOT/dist"

mkdir -p "$OUT"
chmod +x "$ROOT/scripts/prepare-app.sh"
"$ROOT/scripts/prepare-app.sh"

# Icons: generate minimal PNGs from site icon if tauri icons missing
ICON_SRC="$ROOT/imgs/icon.png"
ICON_DIR="$DESKTOP/src-tauri/icons"
mkdir -p "$ICON_DIR"
if [[ -f "$ICON_SRC" ]]; then
  if has_cmd() { command -v "$1" >/dev/null 2>&1; }; then :; fi
  if command -v convert >/dev/null 2>&1; then
    convert "$ICON_SRC" -resize 32x32 "$ICON_DIR/32x32.png"
    convert "$ICON_SRC" -resize 128x128 "$ICON_DIR/128x128.png"
    convert "$ICON_SRC" -resize 256x256 "$ICON_DIR/128x128@2x.png"
  else
    cp "$ICON_SRC" "$ICON_DIR/32x32.png"
    cp "$ICON_SRC" "$ICON_DIR/128x128.png"
    cp "$ICON_SRC" "$ICON_DIR/128x128@2x.png"
  fi
  # placeholder icns/ico — tauri may accept png on some targets; copy png named as needed
  cp "$ICON_DIR/128x128.png" "$ICON_DIR/icon.png" 2>/dev/null || true
  # For Windows/macOS CI, install icon tools or use default; create dummy files if missing
  [[ -f "$ICON_DIR/icon.ico" ]] || cp "$ICON_DIR/128x128.png" "$ICON_DIR/icon.ico" 2>/dev/null || true
  [[ -f "$ICON_DIR/icon.icns" ]] || cp "$ICON_DIR/128x128.png" "$ICON_DIR/icon.icns" 2>/dev/null || true
fi

cd "$DESKTOP"

# Node deps
if [[ ! -d node_modules ]]; then
  npm install --no-fund --no-audit
fi

# Rust
if ! command -v rustc >/dev/null 2>&1; then
  echo "Rust required. Install: https://rustup.rs"
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  # shellcheck disable=SC1091
  source "$HOME/.cargo/env"
fi

export CI=true
npx tauri build "${@:-}"

# Collect artifacts into dist/
BUNDLE="$DESKTOP/src-tauri/target/release/bundle"
if [[ -d "$BUNDLE" ]]; then
  find "$BUNDLE" -type f \( \
    -name '*.deb' -o -name '*.rpm' -o -name '*.AppImage' -o \
    -name '*.msi' -o -name '*.exe' -o -name '*.dmg' -o \
    -name '*.app' -o -name '*.tar.gz' \
  \) -exec cp -a {} "$OUT/" \; 2>/dev/null || true
  # also copy binary
  if [[ -f "$DESKTOP/src-tauri/target/release/alg0rithm" ]]; then
    cp "$DESKTOP/src-tauri/target/release/alg0rithm" "$OUT/alg0rithm-${VERSION}-linux-bin" || true
  fi
  if [[ -f "$DESKTOP/src-tauri/target/release/alg0rithm.exe" ]]; then
    cp "$DESKTOP/src-tauri/target/release/alg0rithm.exe" "$OUT/Alg0rithm-${VERSION}-windows.exe" || true
  fi
fi

echo "Artifacts in $OUT:"
ls -lh "$OUT" || true
