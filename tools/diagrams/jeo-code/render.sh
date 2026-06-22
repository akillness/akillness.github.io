#!/usr/bin/env bash
# Render jeo-code post diagrams from mermaid sources to SVG.
# Requires: @mermaid-js/mermaid-cli (mmdc) + a local Chrome/Chromium.
set -euo pipefail

cd "$(dirname "$0")"

# NOTE: assets/img/jeo-code/d1..d5.svg are now HAND-AUTHORED designs
# (dark-theme / neon-glow tech style, matching architecture.svg) and are the
# source of truth. The mermaid sources below are kept as structural reference
# only. Running this script regenerates the plain mermaid look and OVERWRITES
# the hand-authored SVGs, so it is guarded. Set FORCE=1 to run anyway.
if [[ "${FORCE:-0}" != "1" ]]; then
  echo "refusing to overwrite hand-authored SVGs; re-run with FORCE=1 to regenerate from mermaid" >&2
  exit 1
fi
OUT="../../../assets/img/jeo-code"
THEME="theme.json"

# Point puppeteer at an installed Chrome if no bundled Chromium exists.
if [[ -z "${PUPPETEER_EXECUTABLE_PATH:-}" ]]; then
  for c in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "$(command -v google-chrome || true)" \
    "$(command -v chromium || true)"; do
    if [[ -n "$c" && -x "$c" ]]; then export PUPPETEER_EXECUTABLE_PATH="$c"; break; fi
  done
fi

for src in d1-harness-principles d2-multi-provider d3-skills-map d4-flywheel d5-skill-sequence; do
  echo "rendering $src ..."
  mmdc -i "$src.mmd" -o "$OUT/$src.svg" -c "$THEME" -b transparent
  python3 postprocess.py "$OUT/$src.svg"
done
echo "done → $OUT"
