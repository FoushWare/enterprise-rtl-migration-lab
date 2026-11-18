#!/bin/bash
# Run only after real VS Code is visible, user desktop is prepared, and capture is approved.
# This script never simulates the editor, terminal or cursor.
set -euo pipefail
BASE="$(cd "$(dirname "$0")/.." && pwd)"
DEVICE="${1:?Pass the actual AVFoundation screen device index from ffmpeg -f avfoundation -list_devices true -i ''}"
OUTPUT="$BASE/raw-recordings/vscode-desktop-original.mov"
if [ -e "$OUTPUT" ]; then echo 'Refusing to overwrite raw footage.' >&2; exit 1; fi
ffmpeg -hide_banner -f avfoundation -framerate 30 -capture_cursor 1 -i "$DEVICE:none" \
  -t 50 -an -c:v prores_ks -profile:v 1 "$OUTPUT"
