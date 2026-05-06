#!/usr/bin/env bash
set -euo pipefail

VERSION=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' extension/manifest.json | head -1)
OUT="github-workflow-navigator-v${VERSION}.zip"

rm -f "$OUT"

zip -r "$OUT" extension \
  --exclude "*.DS_Store" \
  --exclude "*__MACOSX*"

echo "Created $OUT"
