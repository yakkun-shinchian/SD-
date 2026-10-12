# YAKUBON STUDIO — インフォグラフィック動画化パイプライン

完成済みインフォグラフィック（PNG）を**一切再生成せず**、その上に
カメラ移動とアノテーションを重ねて、ナレーション・字幕・BGM・効果音と同期した
MP4（9:16 / 4:5 / 16:9）を書き出すための道具です。

```bash
# 依存: Python3 + Pillow + numpy + ffmpeg
#（仮ナレーションをローカルで作る場合のみ）sudo apt-get install open-jtalk open-jtalk-mecab-naist-jdic hts-voice-nitech-jp-atr503-m001

# 音声未提供のサンプルは、まず位置・消去のプレビュー検証を実行
python3 studio/motion/render.py studio/samples/qsofa/timeline.json --preview --validate-only
python3 studio/motion/review_stills.py studio/samples/qsofa/timeline.json studio/samples/qsofa/review
python3 -m unittest discover -s studio/tests -v
# 実音声・語句アラインメントの入力後のみ本番出力が可能
python3 studio/motion/render.py studio/samples/qsofa/timeline.json
```

## M3・M4の強調・同期ルール（2026-10-12）

`profile: "M3"` または `"M4"` では共通の厳格検証を適用します。
サンプルは **M3の位置検証用** です。原図は変更していません。

- 赤＝明示した大見出し・中見出しのみ。本文・数値・表の項目は黄色。
- 黄色＝発話中の重要な本文に対応する、レビュー済みの一行アンカーのみ。
- 1語句1マーカー。別名アンカーで同じ箇所を二重指定することも禁止。
- 既存の下線などがある対象は `existing_emphasis: true` とし、追加マーカーを禁止。
  原図から下線を消さず、その語句は `cues` と `overlays` の両方から外します。
  既存強調があるか不明な対象も、本番・プレビューともに通しません。
- 始点は実音声の語句開始、描画0.2〜0.4秒、発話終了後0.15〜0.3秒で消去。
  次の語句を読む前に完全消去。短い語句では描画時間を区間内に短縮します。
- 太さは文字高の45〜65%、不透明度30〜45%。元画像の下半分への半透明乗算帯です。
- カメラは発話開始前に移動を完了し、マーカーの消去まで保持。
  各出力フレームで全文が画角に収まることを検査します。
- この厳格プロファイルでは重複・遮蔽防止のため、追加字幕、丸、矢印、点滅、
  文字の再配置・wiggleを無効（指定時はエラー）にしています。
  旧来の汎用演出はプロファイルなしのタイムラインに残りますが、M3/M4準拠とは扱いません。

### 音声と語句を対応づける

`narration.segments[].wav` に**最終編集後の音声**を指定し、各セグメントに
`alignment: {"status":"verified", "method":"listening", "audio_sha256":"…"}` を記録します。
自動アラインメントを試聴で補正した場合は `forced_alignment_reviewed` を使います。
SHA-256はWAVファイル全体の値です。再編集・差し替え後は再測定してください。
`wav` 指定時は既存実装と同じく `narration.speed` は適用されません。

`cues` の `start` / `end` は**そのWAV先頭を0とした、実測した語句の秒数**です。
先頭の無音も秒数に含めます。`spoken` に実際の発話、`target` に原図の対応箇所を記録。
言い換えの対応は人が確認し、文中の複数行は行ごとに短い語句へ分けます。
文字数比や音声全長の割合で埋めてはいけません。

```json
{"id":"rr", "segment":"n2", "target":"c1_value",
 "spoken":"1分間に、22回以上", "start":null, "end":null}
```

`null` は未測定です。サンプルの `preview_start` / `preview_end` / `preview_duration`
は見た目の検証に限る仮値で、実音声の時刻ではありません。
`--preview` は静止画・検証のみを許可し、MP4の書き出しを禁止します。
本番コマンドはWAVと確認済みアラインメントがない場合、明示的に失敗します。

### 原図・座標の検収

`layout.json` の `image_sha256` で原図を固定し、`anchor_meta` に原図の文字列、
構造上の役割、既存強調の有無、目視確認した `reviewed_rect` と確認方法を記録します。
`heading_anchors` は赤を使える見出しのホワイトリストです。
画像や座標が変わると再確認が必要になります。元画像の既存下線や文字を
機械が自動認識・意味判定する機能ではありません。手動の確認情報が必要です。
`make_infographic.py` は別用途の素材生成器です。検収済みサンプルへ実行すると
検収メタデータが失われます。本番画像の再生成に使わないでください。

`review/contact_sheet.png` は各語句の直前・描画完了・消去途中・完全消去を比較します。
`review/validation.json` には各語句の座標、開始、発話終了、完全消去時刻を記録します。
静止画やメタデータの成功だけでは音声同期を保証しません。最終動画を通して試聴し、
発話と強調の始点の差が目標±0.15秒・最大0.2秒以内であることを確認してください。

### M4の編集構成との関係

M4にも同じ色・重複・座標・実測音声ゲートを適用します。30秒のフック（0〜2秒）、
情報ギャップ（2〜5秒）、約8・16・24秒の3つの発見、まとめ、CTAは台本の編集要件です。
この修正で既存qSOFA原図・ナレーションを別のM4台本へ無断改稿していません。
M4の構成を組む場合も、予定した秒数へ音声の実測値を捏造して合わせず、
音声を確定してからキューを測定してください。構成の意味的品質は自動検証の対象外です。

## 旧来の汎用タイムラインの仕組み

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
| `overlays` | 下表。`start`+`dur`、または `sync`+`from`/`to`（ナレーション区間の割合）。`until` で消える。省略時は同期セグメント末尾（非同期は描画終了）から0.4秒で消える。`sfx` で効果音 |
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
   （セグメント位置は長さから計算しますが、語句の実測タイミングは別途必要です）

## 医療情報について

テスト素材の qSOFA は Sepsis-3（Singer M, et al. *JAMA*. 2016;315(8):801-810）に基づきます。
qSOFA は敗血症の「診断基準」ではなく、ICU外でのスクリーニング指標です。施設のプロトコルに従ってください。

⚠ open_jtalk の仮音声（HTS voice "nitech-jp-atr503-m001"）はテスト用です。公開する動画では、権利を確認済みの音声（CoeFont の契約プランなど）に差し替えてください。
