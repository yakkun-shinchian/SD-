# CoeFont（声フォント）で音声ナレーションを量産する 🔊

`scenes.js` の全ナレーション（118本）を、CoeFont のお気に入りの声で音声化し、
`audio/` に整列させるための道具です。設計の全体像は
[`docs/superpowers/specs/2026-11-02-coefont-batch-design.md`](../../docs/superpowers/specs/2026-11-02-coefont-batch-design.md)
にあります。

## いまの進行状況

| 段階 | ファイル | 状態 |
| --- | --- | --- |
| ① 初回ログイン | `coefont-login.mjs` | ✅ 使えます |
| ② 画面の採寸 | `coefont-probe.mjs` | ✅ 使えます |
| ③ 選択子の記入 | `selectors.js` | ⏳ 仕組みは完成・**中身は未記入15項目**（②の結果待ち） |
| ④ 音声の量産 | `coefont-batch.mjs` | ⏳ 未着手（③のあと） |

③④ は、②で実物の画面を測ってから作ります。推測で書いた選択子は初回で外れるため、
「測ってから作る」順序を崩しません。

## 必要なもの

- **Node.js**（Node 22 で確認）
- **Playwright**（この道具だけが使います。NurseTube 本体は依存ゼロのままです）

  ```bash
  npm install -g playwright && npx playwright install chromium
  ```

- **CoeFont のアカウント**（Google ログイン可）
- **インターネットに出られる環境** — クラウド実行環境からは `coefont.cloud` に
  到達できないため、**ご自分のパソコンで実行してください**

## 手順

### ① 初回だけ：ログイン

```bash
node tools/coefont/coefont-login.mjs
```

ブラウザが開きます。**ご自分の手で** Google ログインを済ませ、
読み上げの編集画面まで進んでから、ターミナルで Enter を押してください。
セッションは `tools/coefont/.profile/` に保存され、次回からログインは不要です。

> 🔒 **パスワードは扱いません。** このスクリプトはパスワードを受け取らず、
> 保存もせず、見てもいません。残るのはブラウザのプロファイルだけで、
> これは `.gitignore` に入っているためリポジトリには一切入りません。

### ② 画面の採寸

```bash
node tools/coefont/coefont-probe.mjs
```

開いたブラウザで操作を1手すすめるたびに、ターミナルで Enter を押してください。
押すたびに `ui-map/ui-map-01.json` と `.png` が連番で記録されます。

測っていただきたい段階は5つです。

1. 編集画面（ログイン直後）
2. 新規プロジェクトを作ったところ
3. 声の一覧／検索を開いたところ
4. 台本を入力する欄が見えているところ
5. 書き出し（ダウンロード）のボタンが見えているところ

終わるときは `q` + Enter。`ui-map/` の中身を共有していただければ、
画面に合った選択子を `selectors.js` に書き込みます。

### ③ 選択子の記入（採寸後）

`selectors.js` の空配列を埋めます。ここだけが画面の知識を持つため、
CoeFont が模様替えしたときに直すのもこの1枚だけです。

**1つの目標に当て方を複数持たせます。** 上から順に試し、最初に見つかった
ものを使うため、どれか1つが外れても動き続けます。

```js
project: {
  newButton: [
    { role: "button", name: /新規|作成|新しい/ },  // ① 役割＋文言（最も頑健）
    { text: "新規プロジェクト" },                   // ② 文言そのまま
    { testId: "new-project" },                      // ③ テスト用属性
    { css: "button.new-project" },                  // ④ CSS（最も脆い）
  ],
}
```

ボタンの文字が変わっても ③④ が残り、クラス名が変わっても ①② が残ります。
全部外れたときは、**何をどの順で試してどう外れたか**を添えて停止します
（黙って動かないより、原因が分かるほうが早く直せます）。

### ④ 音声の量産（③のあと）

```bash
node tools/coefont/coefont-batch.mjs --voice "<声の名前の一部>" --limit 3
```

まず `--limit 3` で3本だけ作り、`audio/` に正しい名前で並ぶか、
`nurse.html` で実際に声が鳴るかを確かめてから、全118本に進みます。

## PR #30 との分担（重要）

別セッションの **PR #30** が、同じ CoeFont 案件の別の半分を作っています。

| 担当 | 範囲 |
| --- | --- |
| **PR #30** | 読み（かな化）と取り込み（`tools/build-coefont.mjs`・`tools/import-coefont.mjs`） |
| **この道具（PR #29）** | CoeFont の画面操作（音声を得る部分） |

**`audio/manifest.js` を書くのは #30 だけです。** この道具は音声ファイルと
`coefont/import.json` を置くところまでで手を離し、その先は
`node tools/import-coefont.mjs coefont/import.json` に引き渡します。
二つの道具が同じ対応表を書き換える構造は、事故の種です。

声の既定値は **後藤さん**（#30 が音声ラベルとして要求する値）です。

## 仕組み

既存の VOICEVOX パイプラインと**同じ契約**に乗ります。アプリ本体は無改修です。

```
scenes.js ──(build-voicevox.mjs)──> voicevox/manifest.json ─┬─> VOICEVOX（既存）
                                    （通し番号・キー・本文）   └─> CoeFont（この道具）
                                                                      ↓
                                                        audio/<番組ID-シーン番号>.<ext>
                                                        audio/manifest.js
```

アプリは `audio/manifest.js` の `AUDIO_FILES` だけを見ており、その音声を誰が
作ったかを知りません。CoeFont は「もう一つの声の供給元」として並ぶだけです。

## 管理しないファイル（`.gitignore`）

| パス | 理由 |
| --- | --- |
| `.profile/` | **認証情報を含みます。** 絶対にコミットしないでください |
| `export/` | ダウンロードした音声の一時置き場 |
| `ui-map/` | 採寸結果（画面写真を含む） |
| `login-state.json` · `progress.json` | 実行時の記録 |

## ⚠️ 利用規約について

CoeFont で生成した音声の利用範囲とクレジット表記の要否は、**ご契約のプランの
規約でご確認ください**。VOICEVOX の「VOICEVOX:ずんだもん」表記義務とは条件が
異なります。

## API は採用しません（決定済み・2026-11-02）

CoeFont には公式 REST API がありますが、**費用を理由に採用しない**と決定しました。
この道具のブラウザ自動化が唯一の経路です。

そのため `selectors.js` は、1つの目標に対して**当て方を複数持ちます**
（役割＋文言 → 文言 → テスト属性 → CSS の順に試す）。退路が無い道なので、
手すりを厚くしてあります。
