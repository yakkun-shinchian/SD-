#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 4 ]]; then
  echo "Usage: $0 <frames-dir> <output.mp4> [hold-seconds=3.0] [transition-seconds=0.55]" >&2
  exit 2
fi

frames_dir=$1
output=$2
hold=${3:-3.0}
transition=${4:-0.55}
input_duration=$(awk -v h="$hold" -v t="$transition" 'BEGIN { printf "%.3f", h+t }')

mapfile -t frames < <(find "$frames_dir" -maxdepth 1 \( -type f -o -type l \) -name 'frame_*.png' -print | sort)
count=${#frames[@]}

if (( count < 2 )); then
  echo "Need at least two frame_*.png files in: $frames_dir" >&2
  exit 2
fi

mkdir -p "$(dirname "$output")"

args=()
for frame in "${frames[@]}"; do
  args+=( -loop 1 -t "$input_duration" -i "$frame" )
done

# Apple Books-style left turn: a curved leading edge, a bright paper rim,
# and a wider moving shadow make the right page feel as if it lifts and folds left.
edge="W*P+52*sin(PI*Y/H)"
expr="if(gte(X,$edge),B,if(gte(X,$edge-84),A*(0.52+0.48*(($edge-X)/84)),A))"

filters=""
for ((i=0; i<count; i++)); do
  filters+="[$i:v]fps=30,split=2[bgraw$i][pageraw$i];"
  filters+="[bgraw$i]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30,eq=brightness=-0.10:saturation=0.82,drawbox=x=34:y=328:w=1032:h=1287:color=black@0.28:t=fill[bg$i];"
  filters+="[pageraw$i]scale=1020:1275,pad=1032:1287:6:6:color=white,format=rgba[page$i];"
  filters+="[bg$i][page$i]overlay=(W-w)/2:(H-h)/2,format=gbrp[s$i];"
done

previous=s0
for ((i=1; i<count; i++)); do
  offset=$(awk -v i="$i" -v h="$hold" 'BEGIN { printf "%.3f", i*h }')
  current=x$i
  filters+="[$previous][s$i]xfade=transition=custom:duration=$transition:offset=$offset:expr='$expr'[$current];"
  previous=$current
done
filters+="[$previous]format=yuv420p[v]"

ffmpeg -y "${args[@]}" \
  -filter_complex "$filters" -map '[v]' \
  -r 30 -c:v libx264 -preset medium -crf 19 -movflags +faststart -an "$output"

printf '%s\n' "$output"
