# 後組みオーバーレイ指定

`scripts/render_natural_overlay.py` は、4:5の文字なし背景へ、V3固定の手書き風文字と鉛筆調ふきだしを重ねる。座標は背景画像の実ピクセルで指定する。1080×1350を標準にする。

```json
{
  "balloons": [
    {
      "speaker": "rookie",
      "box": [20, 960, 525, 285],
      "tail": [240, 900],
      "text": "感染、かなり\nヤバいですよね!?",
      "font_size": 50,
      "padding": 25
    },
    {
      "speaker": "senior",
      "box": [560, 960, 500, 285],
      "tail": [770, 900],
      "text": "そのCRP、\n“今”の炎症？",
      "font_size": 50,
      "padding": 25
    }
  ],
  "direct_text": [
    {
      "box": [70, 35, 940, 170],
      "text": "CRP 20!",
      "font_size": 138,
      "fill": "#F51E69",
      "stroke_fill": "#FFFFFF",
      "stroke_width": 2,
      "glow_radius": 6
    },
    {
      "box": [20, 200, 1040, 135],
      "text": "これ、ヤバくないですか？",
      "font_size": 72,
      "fill": "#28107A",
      "stroke_fill": "#FFFFFF",
      "stroke_width": 2,
      "glow_radius": 5
    }
  ]
}
```

実行例：

```bash
python3 scripts/render_natural_overlay.py background.png overlay.json slide_01.png
```

## 規則

- `box` は `[x, y, width, height]` にする。
- `tail` は話者の口元方向の座標にする。顔へ接触させない。
- `speaker` は新人を `rookie`、先輩を `senior` に固定する。
- 改行を意図的に指定する。スクリプトが「入らない」と止めたら、文字サイズを下げず台詞を短くする。
- 1枚につきふきだしは原則2個までにする。
- 見出しを複数色にする場合は、`direct_text` を行または語のまとまりごとに分ける。
- 顔、目、口、指、患者、医療図へ `box` を重ねない。
