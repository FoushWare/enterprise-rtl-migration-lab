#!/bin/bash
# Requires real reviewed VS Code footage. Never creates placeholder screencasts.
set -euo pipefail
BASE="$(cd "$(dirname "$0")/.." && pwd)"
RAW="$BASE/raw-recordings/vscode-desktop-original.mov"
B="$BASE/experiments/02-animated-architecture.mp4"
[ -f "$RAW" ] || { echo 'BLOCKED: authentic VS Code recording is missing.' >&2; exit 1; }
[ -f "$B" ] || { echo 'Architecture experiment is missing.' >&2; exit 1; }
# Select/revise the real capture's in/out points after reviewing the footage.
# A: 36 seconds of real motion, gentle zoom, pillarbox original 16:10 desktop.
ffmpeg -n -i "$RAW" -t 36 -an -vf \
 "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x091522,zoompan=z='1+0.025*(1-cos(on*PI/1080))/2':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=30,fade=t=in:st=0:d=0.4,fade=t=out:st=35.6:d=0.4" \
 -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -movflags +faststart "$BASE/experiments/01-developer-screencast.mp4"
# C: authentic IDE → all architecture animation → authentic IDE. 41 seconds with dissolves.
ffmpeg -n -i "$BASE/experiments/01-developer-screencast.mp4" -i "$B" -filter_complex \
 "[0:v]split=2[s][e];[s]trim=start=0:end=12,setpts=PTS-STARTPTS[a];[1:v]setpts=0.5*(PTS-STARTPTS),fps=30[b];[e]trim=start=24:end=36,setpts=PTS-STARTPTS[c];[a][b]xfade=transition=fade:duration=0.5:offset=11.5[ab];[ab][c]xfade=transition=fade:duration=0.5:offset=29[v]" \
 -map '[v]' -an -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -movflags +faststart "$BASE/experiments/03-hybrid-screencast.mp4"
