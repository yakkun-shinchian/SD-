# YAKUBON STUDIO — インフォグラフィック動画化パイプライン

完成済みインフォグラフィック（PNG）を**一切再生成せず**、その上に
カメラ移動とアノテーションを重ねて、ナレーション・字幕・BGM・効果音と同期した
MP4（9:16 / 4:5 / 16:9）を書き出すための道具です。

```bash
# 依存: Python3 + Pillow + numpy + ffmpeg
#（仮ナレーションをローカルで作る場合のみ）sudo apt-get install open-jtalk open-jtalk-mecab-naist-jdic hts-voice-nitech-jp-atr503-m001

cd studio/samples/qsofa
python3 make_infographic.py                       # テスト用インフォグラフィック（本番では不要）
python3 ../../motion/render.py timeline.json      # → out/qsofa_test_9x16.mp4 + .srt
python3 ../../motion/render.py timeline.json --stills 3,9.5,20   # 確認用の静止画だけ
python3 ../../motion/render.py timeline.json --size 1080x1350    # 4:5（Instagram）
python3 ../../motion/render.py timeline.json --size 1920x1080    # 16:9（YouTube）
```

## 仕組み

1. `narration.segments` の音声を用意する（`wav` を指定するとその音声を使用。指定しなければ open_jtalk で仮音声を作る）。
2. 各区間の **開始・終了時刻** が決まる → `n2.start+0.3` や `"sync": "n2"` でカメラや線を音声に合わせる。
3. 元画像は `resize(box=…)` で切り出すだけ（**文字・図・配置は変えない**）。線は別レイヤーに描いて重ねる。
   蛍光ペンは乗算合成なので、下の文字はつぶれません。
4. 字幕は `.srt` でも書き出すので、CapCut / Premiere / YouTube にそのまま読み込めます。

## タイムライン（timeline.json）

| キー | 内容 |
|---|---|
| `image` / `layout` | 元画像と、アンカー座標（論理座標 `[x, y, w, h]`）。`anchors` を直接書いてもよい |
| `output` | `file`, `size`（既定 1080x1920）, `fps` |
| `narration` | `lead_in`, `gap`, `speed`, `segments[{id, speak, subtitle, wav?, subtitle_y?}]` |
| `camera` | `{at, focus, pad, move, drift}` の配列。`focus` はアンカー名 / `[x,y,w,h]` / `"full"`。`drift` で Ken Burns |
| `overlays` | 下表。`start`+`dur`、または `sync`+`from`/`to`（ナレーション区間の割合）。`until` で消える。`sfx` で効果音 |
| `bgm` | `{"synth": "soft_pad"}`（自前合成・権利フリー）または `{"file": "bgm.wav"}`、`volume`。ナレーション中は自動で下がる |
| `subtitle_style` | `size`, `chars_per_line`, `y`（画面高さに対する位置。Shorts の下部UIを避けて 0.70〜0.80） |

### overlays の種類

| type | 動き |
|---|---|
| `highlight` | 蛍光ペンが左→右へ伸びる（読み上げ速度に同期） |
| `underline` | 手書きアンダーライン |
| `circle` | 手描きの丸囲み（少し行き過ぎて閉じる） |
| `box` | 大きな角丸の囲み枠を一周なぞる |
| `arrow` | 矢印が伸びる（`from` / `to` はアンカー名@left/right/top/bottom か座標、`bend` でカーブ） |
| `pulse` | 重要箇所の点滅・グロー |
| `pointer` | 指差しマーカー（バウンド） |
| `callout` | 吹き出し（ポップイン） |
| `label` | テキストのスライドイン / フェード / ポップ。`count_to` で数字カウントアップ |
| `wiggle` | 図や人物の軽い揺れ |

効果音（`sfx`）: `pen`（マーカー音） / `pop` / `swoosh` / `ding`。すべて自前合成で権利フリー。

## 本番での使い方（Claude への頼み方）

> 「このインフォグラフィックを60秒動画にして。読み上げ箇所へ蛍光ペンを同期し、重要部をズーム、
> 矢印と丸囲みを追加し、ナレーション・字幕を付けて9:16 MP4で完成させて」

Claude 側の手順:
1. 画像を見てブロック・重要語の座標（アンカー）を `layout.json` に書く（画像は編集しない）
2. 台本（`speak` / `subtitle`）とタイムラインを作る
3. `--stills` で数枚確認 → 座標を微調整 → 本番レンダリング
4. ナレーションは CoeFont / ElevenLabs / VOICEVOX で書き出した wav を `wav` に指定すれば差し替わる
   （台本・タイミングは音声の長さから自動で再計算されます）

## 医療情報について

テスト素材の qSOFA は Sepsis-3（Singer M, et al. *JAMA*. 2016;315(8):801-810）に基づきます。
qSOFA は敗血症の「診断基準」ではなく、ICU外でのスクリーニング指標です。施設のプロトコルに従ってください。

⚠ open_jtalk の仮音声（HTS voice "nitech-jp-atr503-m001"）はテスト用です。公開する動画では、権利を確認済みの音声（CoeFont の契約プランなど）に差し替えてください。
