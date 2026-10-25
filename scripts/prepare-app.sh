#!/usr/bin/env bash
# Stage static site into web/app for Tauri frontendDist
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/web/app"
rm -rf "$ROOT/web"
mkdir -p "$WEB"

for item in index.html lap.html docs.html 404.html sw.js css js imgs libs package.json robots.txt sitemap.xml favicon.ico; do
  if [[ -e "$ROOT/$item" ]]; then
    cp -a "$ROOT/$item" "$WEB/"
  fi
done

# Service worker / absolute paths: prefer relative for file:// and custom protocol
# Keep as-is; Tauri serves over tauri:// / asset protocol.

echo "Frontend staged at $WEB"
ls -la "$WEB" | head -25
