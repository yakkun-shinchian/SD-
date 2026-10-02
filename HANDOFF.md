# 引き継ぎ書 — NurseTube / YAKUBON STUDIO 学習サイト

最終更新: 2026-10-02 ／ 作成: Claude (Opus 4.8)
対象: このプロジェクトを引き継ぐ人・AI（ChatGPT / Codex など）

> このファイル単体で現況が把握できるように書いています。ChatGPT に相談するときは、この全文を貼り付けてください。
> AI 向けの規約・アーキテクチャ詳細は **`CLAUDE.md`** も合わせて参照してください（※一部、下記「未対応・TODO」のとおり記述が古くなっています）。

---

## 0. プロジェクト一言まとめ

**看護師・看護学生のための「勉強用 YouTube」=「NurseTube」** を中心にした、**ビルド不要・依存ライブラリなしの静的サイト**です。
HTML + CSS + バニラ JS のみ。`python3 -m http.server` で開くだけで動きます。
おまけアプリとして **VentSim（人工呼吸器シミュレータ）** と **衛星追跡アプリ** も同梱しています。

複数の制作ストリームが並行して進んできました：
- **Claude**: サイト基盤 / 自動再生プレーヤー / VOICEVOX 対応 / **図解(SVG)・CT/MRI 断層イメージ** / VentSim / 衛星アプリ
- **Codex**: **V5/V6 イラスト会話動画パイプライン**（静止画＋音声＋MP4＋確認版ページ→本編組込）

---

## 1. リポジトリ全体像（複数アプリ同梱）

| ファイル | 役割 |
|---|---|
| **`index.html`** | **VentSim**（Dräger EVITA タイプ人工呼吸器モニター）。単一ファイル完結。**サイトのトップページ** |
| `ventilator.html` | 旧 URL 互換。`index.html` へのリダイレクト |
| `satellite.html` | 衛星追跡 3D グローブ（Three.js）。単一ファイル完結 |
| **`nurse.html`** | **NurseTube 本体**（学習ポータル）。下記スクリプト群を読み込む |
| `figures-preview.html` | 図解(SVG)の一覧プレビュー（Claude 作） |
| `nurse-*-review.html` | V5/V6 動画の「**確認版**」ページ（Codex 作、承認用の単体ページ） |

---

## 2. NurseTube の構造（本命）

### 読み込み順（`nurse.html`）
```
data.js → scenes.js → figures.js → audio/manifest.js → images/manifest.js
      → lessons.js → legacy-views.js → app.js
```
いずれも **グローバル変数**を公開する素の `<script>`（ES モジュールではない）。
`<script src="...?v=YYYYMMDD-...">` のクエリは**キャッシュバスティング**。内容を変えたら `v=` を更新する運用。

### データ層
| ファイル | 公開するもの | 中身 |
|---|---|---|
| `data.js` | `PROGRAMS`(**29本**), `CATEGORIES`, `EXAM_DATE`(2027-02-14), `PRESENTER`(ずんだもん) | 番組カタログ（メタ情報）。ここに番組を足す |
| `scenes.js` | `SCENES`(**29本**) | 各番組の自動再生スライド台本 `{heading, points[], narration}` |
| `figures.js` | `FIGURES`, `SCENE_FIGURES` | 図解(SVG)ライブラリ＋シーン割当（§3） |
| `lessons.js` | `ENHANCED_LESSONS` | V5/V6 の richな教材（会話・動画・正常値・クイズ等）（§4） |
| `audio/manifest.js` | `AUDIO_FILES` | スライド用の音声対応表（VOICEVOX など。自動生成） |
| `images/manifest.js` | `IMAGES` | 実写真（CT/MRI 等）の対応表（既定は空）（§3） |
| `legacy-views.js` | 旧表示の保存 | 旧サイト閲覧の互換 |

### ルーティング（`app.js`、ハッシュベース）
`#/`（ホーム） ／ `#/category/<カテゴリ>` ／ `#/search/<語>` ／ `#/watch/<番組ID>`

### 視聴ページの表示優先ロジック（`app.js` の `renderWatch`, 概ね L590 付近）
1. **`ENHANCED_LESSONS[id]` がある** →
   - `kind` が `anatomy-v5` / `illustrated-v6` → `renderAnatomyV5()`：ポスター＋**MP4動画**＋会話＋ページ別イラスト復習
   - それ以外（例 `base01`）→ `renderEnhanced()`：会話・**正常値表**・詳細・**クイズ**・出典
2. **`videoId` がある** → YouTube 埋め込み（`youtube-nocookie.com`）
3. **`SCENES` がある** → 自動再生スライド `createLesson()` ＋ 図解 `visualHtml()`（§3）

> **ENHANCED_LESSONS 実装済み（7本）**：`base01`, `anat01`〜`anat05`, `exam01`
> 残り **22本は従来のスライド教材＋図解** で表示されます。

---

## 3. 図解・CT/MRI・写真/動画の仕組み（Claude 担当, commit `e49bbe2`）

- **`figures.js` に 10 種の図解(SVG)**：心臓 / 腎臓ネフロン / 肺・横隔膜 / 自律神経 / 内分泌 / バイタル / 心電図 ＋ **頭部CT / 頭部MRI / 胸部CT**（断層イメージ）。一部アニメ付き。
- **`SCENE_FIGURES`** で「`<番組ID>-<シーン番号>`」→図解名 を **42 シーン**に割当。
- 一覧確認は **`figures-preview.html`**。ホームの「今日の学び」カードにも `FIGURES`（心電図など）を使用。
- 各シーンの「映像」優先順位（`visualHtml()`, 概ね L380）：**①動画クリップ(`scene.videoId`) ②実写真(`IMAGES[key]`) ③図解SVG**。
- **本物の CT/MRI 写真を使う方法**：`images/` に画像を置き `images/manifest.js` の `IMAGES` に登録（出典 `credit` 表示対応）。詳細と**権利の注意は `images/README.md`**。
  - ⚠ 現状の CT/MRI 図は **「学習用の模式図」**（実患者画像ではない）。実写真は権利的に使えるもの（自作 / CC0 / ライセンス明記の CC BY 等）を投入すること。

---

## 4. V5/V6 イラスト会話動画パイプライン（Codex 担当）

Instagram 縦型（1080×1920）の「先輩と後輩の会話」教材。制作の流れ：

```
*-dialogue.json / *-script.json      … 会話台本
   → *-render.py (Python)            … ページ画像を描画
   → *-page-NN.jpg                   … イラスト静止画（縦型）
   → *-voice-NN.mp3                  … セリフ別音声（CoeFont）
   → *-review.mp4                    … 会話動画（確認用）
   → nurse-*-review.html             … 「確認版」単体ページ（承認用）
   → 承認後、lessons.js の ENHANCED_LESSONS[<id>] に組み込み（本編反映）
```

- **音声は CoeFont**（後輩「汎用式概念χ-soft-v2」CV：ろさちゃん／先輩「後藤邑子」）。
  動画内クレジット「声：CoeFont」を表示する運用。**（注：これは §5 の VOICEVOX とは別系統）**
- 進行管理ファイル：`anatomy-v5-progress.json`, `*-production.json`, `*-manifest.json`。
- 関連アセットはリポジトリ直下に大量にあります（`anat01-05-v5-*`, `vitals-v5/v6-*`, `exam01/02-v6-*` など）。

---

## 5. 音声は2系統あることに注意

1. **CoeFont**：V5/V6 の**動画(MP4)**用。上記 §4。
2. **VOICEVOX（ずんだもん）＋ 端末読み上げ(Web Speech API)**：**スライド教材**の読み上げ用。
   - `tools/build-voicevox.mjs`（台本→`voicevox/narration.txt`＋manifest）/ `tools/link-audio.mjs`（wav→`audio/`＋`audio/manifest.js`生成）。手順は `voicevox/README.md`。
   - ⚠ VOICEVOX ずんだもん音声には「VOICEVOX:ずんだもん」クレジットが必要。

---

## 6. 動かし方・確認方法

```bash
python3 -m http.server 8000
#   /                     → VentSim（人工呼吸器）
#   /nurse.html           → NurseTube 本体
#   /figures-preview.html → 図解一覧
#   /satellite.html       → 衛星アプリ
```
- **ビルド/npm 依存なし**。`tools/*.mjs` は Node（v22, `node:` 組込のみ）。`*-render.py` は Python。
- **テスト/CI/Lint なし**。変更はブラウザで該当ルートを触って確認するのが基本。
- ⚠ この実行環境には**ブラウザ/画像変換ツールが無い**ため、SVG 図や動画の「見た目」最終確認は未実施。実機/ローカルで `figures-preview.html` と各 `#/watch/<id>` を目視確認してほしい。

---

## 7. 済み / 未対応（TODO）

### 済み
- NurseTube 基盤：カタログ(29本)・カテゴリ・検索・テーマ(ライト/ダーク)・国試カウントダウン・自動再生スライド
- ずんだもん口調、VOICEVOX 対応（tools）
- **図解 10 種＋CT/MRI＋写真/動画スロット（42 シーン, `e49bbe2`）**
- VentSim（人工呼吸器, トップページ）、衛星アプリ、`CLAUDE.md`、GitHub Pages ワークフロー
- V5/V6 会話動画：`base01`, `anat01`〜`anat05`, `exam01` を**本編組込**。各種「確認版」ページ

### 未対応・次の候補
- [ ] **残り 22 本を `ENHANCED_LESSONS` 化**（V5/V6 動画化 or 会話/クイズ付きへ格上げ）
- [ ] **本物の CT/MRI 写真の投入**（権利 OK 素材を `images/` へ、`IMAGES` に登録）
- [ ] **図解を未カバー番組へ追加**（薬理・看護技術・母性/小児・精神・疾患の一部）
- [ ] **`CLAUDE.md` の軽微な陳腐化を更新**：読み込み順に `figures.js / images/manifest.js / lessons.js / legacy-views.js` が未記載、Key files 表に図解・V5/V6 系が未記載
- [ ] V5 動画・図解の**ブラウザ実機での見た目最終確認**（本環境では不可）
- [ ] **PR 状況の確認**：本ブランチは統合先。`main` への PR 要確認（§8）

---

## 8. Git / ブランチ運用

- **`claude/sleepy-albattani-z4782h` が統合トランク**（＝このリポジトリの既定ブランチ扱い）。`codex/*`・`claude/*` の機能ブランチが**ここを base に PR** を出してマージされます。トランク自身への小さな更新は**直接 push** が慣例（履歴もその形）。
- 直近：図解 = `e49bbe2` → Codex の V5/V6 多数 → 本引き継ぎ = `f695a4f`。
- レビュー待ちの未マージ PR（base は本トランク。中身は要確認）：
  - **#6** GitHub Pages ワークフロー関連（衛星アプリまわり）
  - **#7 / #8** 「AI 円卓／四賢者会議」アプリ（ChatGPT・Claude・Gemini・Grok が1つの時代を議論）
  - **#9** 脳血管障害クリニカルパス改訂原案（院内検討用ドキュメント）
- 運用：作業前に `git fetch` / `git pull` で最新化（複数セッションが同じブランチへ push するため衝突しやすい。衝突時は rebase）。大きな機能追加は**機能ブランチ＋ドラフト PR**、トランク直送は小さな更新に限る。コミットメッセージは日本語。

---

## 9. 規約・注意点（重要）

- **言語・口調**：全面日本語。番組メタ/スライド台本は **ずんだもん「〜なのだ」**。V5 会話は先輩/後輩の自然口調（口調を混在させない）。
- **依存なし・ビルドなし**：npm パッケージ/フレームワーク/バンドラを入れない。ブラウザ側は**グローバル変数**（ES モジュール不可）。
- **セキュリティ**：動的文字列を `innerHTML` に入れる前に必ず `escapeHtml()`。
- **状態**：テーマは `localStorage`（`nursetube-theme`）。
- **キャッシュバスティング**：`nurse.html` の `?v=` を更新時に上げる。
- **医療内容**：一般的な学習用。数値は資料により幅があるため**出典確認**を推奨（`lessons.js` に `sources` の例あり）。CT/MRI 風図は**模式図**である旨を明記。

---

## 10. 新しい AI がまず開くべきファイル（順番）

1. `CLAUDE.md` … 規約・アーキテクチャ（本書 §7 の陳腐化点に注意）
2. `nurse.html` … 読み込み順と DOM 骨格
3. `app.js` … `renderWatch`（表示分岐）/ `visualHtml`（図解）/ `renderAnatomyV5` / `renderEnhanced` / `createLesson`
4. `data.js` / `scenes.js` / `lessons.js` / `figures.js` … データ 4 層
5. 任意の `nurse-*-review.html` と `*-render.py` … V5/V6 動画制作の実例
