#!/usr/bin/env bash
# 立体で読むCT 第1弾 ― 大動脈解離 A型/B型  つなぎ＆テロップ焼き込み
# 使い方:  ./10_assemble.sh <clips_dir> [narration_dir] [out_dir]
#   clips_dir      に 01.mp4 … 09.mp4 を置く（CreativeClaw の書き出しをリネーム）
#   narration_dir  に a.mp3 / b.mp3 / cmp.mp3（CoeFont の書き出し）。無ければ無音で通す
set -euo pipefail

CLIPS="${1:-./clips}"
NARR="${2:-./narration}"
OUT="${3:-./out}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

W=1080; H=1920; FPS=30
MINCHO=/usr/share/fonts/opentype/ipafont-mincho/ipam.ttf   # 見出し
GOTHIC=/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf   # 説明
DISSOLVE=0.12                                              # 0.12秒以内（長いと二重像）

# テロップ安全域： 右 x>940 と 下 y>1600 は常に空ける
TX=70          # テロップ左端
TY_HEAD=1290   # 見出しベースライン
TY_BODY=1420   # 説明ベースライン
mkdir -p "$OUT"

IDX=(01 02 03 04 05 06 07 08 09)
for i in "${IDX[@]}"; do
  [[ -f "$CLIPS/$i.mp4" ]] || { echo "欠番: $CLIPS/$i.mp4" >&2; exit 1; }
done

# --- 1) 解像度・fps・SAR を揃え、音を外す -----------------------------------
echo "▸ 正規化"
for i in "${IDX[@]}"; do
  ffmpeg -y -loglevel error -i "$CLIPS/$i.mp4" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x0B1226,setsar=1,fps=${FPS}" \
    -an -c:v libx264 -crf 17 -pix_fmt yuv420p "$WORK/n$i.mp4"
done

# --- 2) テロップ（場面が変わる0.2秒前に消す） --------------------------------
# tel <入力> <出力> <見出し> <説明>
tel () {
  local in="$1" out="$2" head="$3" body="$4"
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
  local off; off=$(awk -v d="$dur" 'BEGIN{printf "%.3f", (d>0.45? d-0.2 : d)}')
  if [[ -z "$head$body" ]]; then cp "$in" "$out"; return; fi
  ffmpeg -y -loglevel error -i "$in" -vf \
"drawtext=fontfile=${MINCHO}:text='${head}':fontcolor=white:fontsize=74:x=${TX}:y=${TY_HEAD}:\
shadowcolor=0x000000AA:shadowx=3:shadowy=3:enable='between(t,0.15,${off})',\
drawtext=fontfile=${GOTHIC}:text='${body}':fontcolor=0xE8EEF7:fontsize=46:x=${TX}:y=${TY_BODY}:\
shadowcolor=0x000000AA:shadowx=2:shadowy=2:enable='between(t,0.35,${off})'" \
    -an -c:v libx264 -crf 17 -pix_fmt yuv420p "$out"
}

echo "▸ テロップ"
tel "$WORK/n01.mp4" "$WORK/t01.mp4" "大動脈解離 A型" "上行大動脈まで裂けている"
tel "$WORK/n02.mp4" "$WORK/t02.mp4" ""               ""
tel "$WORK/n03.mp4" "$WORK/t03.mp4" ""               "肺動脈分岐部の高さで輪切り"
tel "$WORK/n04.mp4" "$WORK/t04.mp4" "前の丸にも膜"    "A型 ― 原則は緊急手術"
tel "$WORK/n05.mp4" "$WORK/t05.mp4" "大動脈解離 B型" "上行大動脈はきれいなまま"
tel "$WORK/n06.mp4" "$WORK/t06.mp4" ""               ""
tel "$WORK/n07.mp4" "$WORK/t07.mp4" ""               "同じ高さで輪切り"
tel "$WORK/n08.mp4" "$WORK/t08.mp4" "後ろの丸だけ"    "B型 ― まずは降圧と安静"
tel "$WORK/n09.mp4" "$WORK/t09.mp4" "前の丸が分かれ道" "左：A型 ／ 右：B型"

# --- 3) 0.12秒ディゾルブで鎖のようにつなぐ -----------------------------------
# join <出力> <入力...>
join_clips () {
  local out="$1"; shift
  local -a ins=("$@")
  local cur="${ins[0]}" n=1
  for ((k=1; k<${#ins[@]}; k++)); do
    local nxt="${ins[k]}"
    local d; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$cur")
    local off; off=$(awk -v d="$d" -v f="$DISSOLVE" 'BEGIN{printf "%.3f", d-f}')
    ffmpeg -y -loglevel error -i "$cur" -i "$nxt" \
      -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${DISSOLVE}:offset=${off},fps=${FPS}[v]" \
      -map "[v]" -c:v libx264 -crf 17 -pix_fmt yuv420p "$WORK/j$n.mp4"
    cur="$WORK/j$n.mp4"; n=$((n+1))
  done
  cp "$cur" "$out"
}

# --- 4) ナレーションを乗せて書き出し ------------------------------------------
# finish <映像> <音声ファイル名> <出力名>
finish () {
  local v="$1" a="$NARR/$2" o="$OUT/$3"
  if [[ -f "$a" ]]; then
    # ナレーションが映像より長ければ、最後のコマを保持して音に合わせる（音を切らない）
    local vd ad pad
    vd=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
    ad=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$a")
    pad=$(awk -v v="$vd" -v a="$ad" 'BEGIN{d=a-v; printf "%.3f", (d>0.05? d : 0)}')
    if [[ "$pad" != "0.000" ]]; then
      ffmpeg -y -loglevel error -i "$v" -vf "tpad=stop_mode=clone:stop_duration=${pad}" \
        -an -c:v libx264 -crf 17 -pix_fmt yuv420p "$WORK/held.mp4"
      v="$WORK/held.mp4"
      echo "  · 最後のコマを ${pad}s 保持してナレーションに合わせました"
    fi
    ffmpeg -y -loglevel error -i "$v" -i "$a" -map 0:v -map 1:a \
      -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "$o"
    echo "  ✓ $o （ナレーションあり）"
  else
    ffmpeg -y -loglevel error -i "$v" -f lavfi -i anullsrc=r=48000:cl=stereo \
      -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k -shortest "$o"
    echo "  ✓ $o （無音：$a が無いため）"
  fi
}

echo "▸ A型"
join_clips "$WORK/vA.mp4" "$WORK/t01.mp4" "$WORK/t02.mp4" "$WORK/t03.mp4" "$WORK/t04.mp4"
finish "$WORK/vA.mp4" a.mp3 "立体で読むCT_大動脈解離A型.mp4"

echo "▸ B型"
join_clips "$WORK/vB.mp4" "$WORK/t05.mp4" "$WORK/t06.mp4" "$WORK/t07.mp4" "$WORK/t08.mp4"
finish "$WORK/vB.mp4" b.mp3 "立体で読むCT_大動脈解離B型.mp4"

echo "▸ AB比較（#9 の最終フレーム＝#1 の開始フレーム → 自動ループが継ぎ目なく2周目へ）"
join_clips "$WORK/vC.mp4" "$WORK/t01.mp4" "$WORK/t02.mp4" "$WORK/t03.mp4" "$WORK/t04.mp4" \
                          "$WORK/t05.mp4" "$WORK/t06.mp4" "$WORK/t07.mp4" "$WORK/t08.mp4" "$WORK/t09.mp4"
finish "$WORK/vC.mp4" cmp.mp3 "立体で読むCT_大動脈解離AB比較.mp4"

# --- 5) 全編デコード検査 + 確認シート ----------------------------------------
echo "▸ デコード検査"
for f in "$OUT"/*.mp4; do
  if err=$(ffmpeg -v error -i "$f" -f null - 2>&1) && [[ -z "$err" ]]; then
    echo "  ✓ 壊れなし: $(basename "$f")"
  else
    echo "  ✗ 異常: $(basename "$f")"; echo "$err" | head -5
  fi
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,r_frame_rate,nb_read_packets -count_packets \
    -of default=nw=1 "$f" | sed 's/^/     /'
done

echo "▸ 確認シート（要所のコマを並べる）"
ffmpeg -y -loglevel error -i "$OUT/立体で読むCT_大動脈解離AB比較.mp4" \
  -vf "fps=1,scale=270:-1,tile=5x3" -frames:v 1 "$OUT/確認シート.png"
echo "  ✓ $OUT/確認シート.png"
echo "完了。"
