#!/usr/bin/env python3
"""テスト用の仮インフォグラフィック（qSOFA）を生成する。

出力:
  infographic.png … 2160x3840（論理座標 1080x1920 の2倍解像度）
  layout.json     … 文字・ブロックの位置（論理座標）。タイムラインのアンカーに使う。

※本番では、あなたが完成させたインフォグラフィックPNGをそのまま使い、
  アンカー座標だけを layout.json に書けばよい（画像は一切再生成しない）。
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

S = 2  # 解像度倍率（ズームしても文字がにじまないよう2倍で描く）
W, H = 1080, 1920
FONT = "/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf"
here = os.path.dirname(os.path.abspath(__file__))
out_dir = sys.argv[1] if len(sys.argv) > 1 else here

img = Image.new("RGB", (W * S, H * S), "#F4F7FB")
d = ImageDraw.Draw(img)
layout = {}

def f(px):
    return ImageFont.truetype(FONT, px * S)

def text(key, xy, s, size, fill="#1F2A44", bold=False, anchor="la"):
    font = f(size)
    sw = max(1, S) if bold else 0
    d.text((xy[0] * S, xy[1] * S), s, font=font, fill=fill, anchor=anchor,
           stroke_width=sw, stroke_fill=fill)
    l, t, r, b = d.textbbox((xy[0] * S, xy[1] * S), s, font=font, anchor=anchor, stroke_width=sw)
    if key:
        layout[key] = [round(l / S), round(t / S), round((r - l) / S), round((b - t) / S)]

def rrect(key, box, fill, outline=None, width=0, r=28):
    x, y, w, h = box
    d.rounded_rectangle([x * S, y * S, (x + w) * S, (y + h) * S], radius=r * S,
                        fill=fill, outline=outline, width=width * S)
    if key:
        layout[key] = list(box)

# ── ヘッダー
rrect("header", (0, 0, W, 330), "#1F3A93", r=0)
text(None, (60, 52), "看護師のための 敗血症スクリーニング", 34, "#CFE0FF")
text("title", (60, 105), "qSOFA（クイックソーファ）", 72, "#FFFFFF", bold=True)
text(None, (60, 222), "ICU外で「敗血症かも？」を素早く拾う3項目", 36, "#FFE58A", bold=True)

# ── 3つの基準カード（2列グリッド：9:16でも大きくズームできる配置）
cards = [
    ("c1", (40, 380), "1", "呼吸数", "22回/分 以上", ("胸郭の動きを", "30秒×2で数える"), "#E8F1FF", "#2B6CB0"),
    ("c2", (560, 380), "2", "意識の変容", "GCS 15 未満", ("「いつもと違う」も", "大切なサイン"), "#FFF4E5", "#C05621"),
    ("c3", (40, 960), "3", "収縮期血圧", "100mmHg 以下", ("普段の血圧との", "比較も忘れずに"), "#FDECEC", "#C53030"),
]
CW, CH = 480, 540
for key, (x, y), num, label, value, note, bg, accent in cards:
    rrect(key, (x, y, CW, CH), bg, outline=accent, width=3)
    d.ellipse([(x + 30) * S, (y + 30) * S, (x + 110) * S, (y + 110) * S], fill=accent)
    text(None, (x + 70, y + 70), num, 54, "#FFFFFF", bold=True, anchor="mm")
    text(f"{key}_label", (x + 130, y + 42), label, 52, accent, bold=True)
    # 簡単なアイコン枠
    d.rounded_rectangle([(x + 40) * S, (y + 150) * S, (x + CW - 40) * S, (y + 330) * S],
                        radius=20 * S, fill="#FFFFFF")
    text(f"{key}_value", (x + CW // 2, y + 240), value, 52 if len(value) > 9 else 60, "#1F2A44", bold=True, anchor="mm")
    text(f"{key}_note", (x + 40, y + 370), note[0], 32, "#4A5568")
    text(None, (x + 40, y + 416), note[1], 32, "#4A5568")

# 右中段：観察のコツ
rrect("tips", (560, 960, CW, CH), "#EEF9F1", outline="#2F855A", width=3)
text("tips_title", (590, 1000), "観察のコツ", 46, "#2F855A", bold=True)
for i, s in enumerate(["・バイタルは「推移」で見る", "・感染徴候（発熱/悪寒）", "・尿量・皮膚色・冷感", "・SpO2低下と頻脈"]):
    text(f"tips_{i}", (590, 1090 + i * 80), s, 32, "#22543D")

# ── 結論ボックス
rrect("concl", (40, 1540, 1000, 250), "#1F3A93", r=32)
text("concl_1", (540, 1610), "2項目以上 あてはまれば", 46, "#FFFFFF", bold=True, anchor="mm")
text("concl_2", (540, 1700), "敗血症を疑い 医師へ即報告", 62, "#FFE58A", bold=True, anchor="mm")

# ── 出典
text("source", (40, 1830), "出典: Singer M, et al. JAMA. 2016;315(8):801-810（Sepsis-3）", 24, "#718096")
text(None, (1040, 1870), "YAKUBON STUDIO", 26, "#A0AEC0", bold=True, anchor="ra")

img.save(os.path.join(out_dir, "infographic.png"))
with open(os.path.join(out_dir, "layout.json"), "w", encoding="utf-8") as fp:
    json.dump({"size": [W, H], "scale": S, "anchors": layout}, fp, ensure_ascii=False, indent=1)
print("ok", len(layout), "anchors")
