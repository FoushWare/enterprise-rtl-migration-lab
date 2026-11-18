#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Keep source footage intact. Only crop/framing is changed in the composite.
ffmpeg -y -v error -i render/motion.mp4 -i evidence/vscode-real.mp4 -filter_complex \
 '[1:v]split=2[a][b];[a]trim=start=3:duration=8.448,setpts=PTS-STARTPTS,crop=2462:1740:418:60,scale=560:396[first];[b]trim=start=100:duration=51.216,setpts=PTS-STARTPTS,crop=2462:1740:418:60,scale=560:396[rest];[first][rest]concat=n=2:v=1:a=0[screen];[0:v][screen]overlay=1275:289:shortest=1[v]' \
 -map '[v]' -an -r 30 -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p -movflags +faststart render/picture.mp4
ffmpeg -y -v error -i render/picture.mp4 -i audio/narration.wav -i audio/sfx.wav \
 -filter_complex '[1:a]loudnorm=I=-16:TP=-1.5:LRA=7[voice];[voice][2:a]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.85:level=0[a]' \
 -map 0:v -map '[a]' -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart runtime-direction-demo.mp4
ffmpeg -y -v error -i render/picture.mp4 -i audio/sfx.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart runtime-direction-without-narration.mp4
