# CoeFont 受け渡しフォルダ

CoeFontの**APIは使いません**（APIキー発行に月額プラン加入が必要で、保有ポイントがあるため）。
音声はご本人がCoeFont画面で作り、MP3をこのリポジトリへ戻す運用です。
手順の原本は `.claude/skills/coefont-new-project/SKILL.md`、方針は
`.claude/skills/REGISTRY.md` §5-1 にあります。

## 1. 書き出し

```bash
node tools/build-coefont.mjs                      # 台本を自動で探す
node tools/build-coefont.mjs exam02-v6-script.json # 個別指定
```

対応する台本の形：

- **V6** `*-v6-script.json` … `pages[]` の `junior` / `senior` / `cta`
- **V5** `*-v5-production.json` … `storyboard[]` の `junior` / `senior` / `closing`

出力（`coefont/` 配下）：

| ファイル | 用途 |
|---|---|
| `<id>-narration.txt` | **CoeFontに上から順に貼る本文。**新規に作る分だけが入っています |
| `<id>-manifest.csv` | 連番・話者・使う声・戻すファイル名・使い回しの別（表計算で開けます） |
| `<id>-manifest.json` | 同上（プログラム用） |

台本の改行はスライド上の見た目用なので、読み上げ本文からは除いてあります。

## 2. CoeFontでの生成（ご本人）

1. 案件ごとに**新規プロジェクト**を作る（他案件のプロジェクトを流用しない）
2. **その回の映像を見て、声を決める**

**声は固定していません。** どの声が合うかは、その時の映像を見ないと分からないためです。
下の3つは候補であって、割り当ての決まりではありません。

| 候補 | CoeFont上の名称 |
|---|---|
| 汎用式概念 | 汎用式概念χ-soft-v2[最高精度] ¦CV:ろさちゃん Losa-chan -soft |
| 後藤邑子 | 後藤邑子 |
| ミリアル | ミリアル |

決めたら、その回の書き出しに反映します。

```bash
node tools/build-coefont.mjs exam02-v6-script.json --junior ミリアル
node tools/build-coefont.mjs exam02-v6-script.json --junior 汎用式概念 --senior ミリアル
```

指定しなければ前回と同じ既定値（後輩＝汎用式概念／先輩＝後藤邑子）で出ます。
`--cta` を省くと締めは後輩と同じ声になります。略称でも正式名称でも通ります。

`manifest.csv` の `voice` 列には**その回に決めた声が記録**されます。後から
「この教材は誰の声だったか」を辿れます。

3. 「お気に入り」から、決めた声を選ぶ（SKILL.md の原則どおり、**勝手に別の声へ置き換えない**）
3. `narration.txt` を上から順に生成し、**MP3でダウンロード**
4. `manifest.csv` の `target_mp3` の名前に揃える
   （`gen_no` が narration.txt の何行目かを示します）

## 3. 使い回せる音声

`reuse_from` が入っている行は**作り直す必要がありません**。

締めの「フォローしていただけると励みになります。よろしくお願いします。」は
全6教材で同一音声を共有しています（`anat02〜05-v5-voice-17` / `exam01-v6-voice-17` /
`exam02-v6-voice-13` が md5 `c40e954c…` で一致）。`exam02-v6-voice-13.mp3` を複製してください。

## 4. 戻したあと（Claude担当）

尺測定 → 冒頭無音0.35秒・発話間0.28秒の配置 → 話者インジケータ描画 →
1080×1920 / h264 / aac でレンダリング → ffprobe・無音検査・全走査デコード・sha256検品。

既存の `exam0*-v6-render.py` と同じ手順です。`.claude/skills/REGISTRY.md` §2-1 / §7-1 参照。

## 注意

- MP3の実ファイルはこのフォルダではなく**リポジトリ直下**に置きます（既存の命名に合わせるため）
- 音声が**生成できたこと**と**ファイルを取得できたこと**は別です。
  ダウンロードまで完了してから同期作業へ進みます
