#!/usr/bin/env bash
# Make a seamless loop by crossfading the tail into the head, then encode for the web.
# Usage: make_loop.sh IN.mp4 OUT_BASE [WIDTH=1920] [XFADE=0.8] [CRF_MP4=28] [CRF_WEBM=40]
# Writes OUT_BASE.mp4 (H.264, faststart, no audio), OUT_BASE.webm (VP9), OUT_BASE-poster.webp (first frame).
set -euo pipefail
in=$1; base=$2; w=${3:-1920}; xf=${4:-0.8}; crf=${5:-28}; crfw=${6:-40}
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
off=$(python3 -c "print(round($d-2*$xf,3))")
master=$(mktemp --suffix=.mp4)
ffmpeg -v error -y -i "$in" -filter_complex \
  "[0:v]split[a][b];[a]trim=start=$xf,setpts=PTS-STARTPTS[a1];[b]trim=0:$xf,setpts=PTS-STARTPTS[b1];[a1][b1]xfade=transition=fade:duration=$xf:offset=$off,scale=$w:-2:flags=lanczos,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -crf 18 -preset medium "$master"
ffmpeg -v error -y -i "$master" -an -c:v libx264 -crf "$crf" -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart "$base.mp4"
ffmpeg -v error -y -i "$master" -an -c:v libvpx-vp9 -crf "$crfw" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$base.webm"
ffmpeg -v error -y -i "$master" -frames:v 1 -c:v libwebp -quality 75 "$base-poster.webp"
rm -f "$master"
ls -la "$base".mp4 "$base".webm "$base"-poster.webp
