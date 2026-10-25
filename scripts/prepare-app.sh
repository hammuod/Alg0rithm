#!/usr/bin/env bash
# Prepare web/app from this repository (main Alg0rithm)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/web/app"
rm -rf "$ROOT/web"
mkdir -p "$WEB"
# Copy site assets only
for item in index.html lap.html docs.html 404.html sw.js css js imgs libs package.json robots.txt sitemap.xml; do
  if [[ -e "$ROOT/$item" ]]; then
    cp -a "$ROOT/$item" "$WEB/"
  fi
done
echo "App staged at $WEB"
