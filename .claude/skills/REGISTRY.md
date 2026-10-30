# YAKUBON STUDIO スキル台帳（正本の所在と対応表）

最終調査日：**2026-10-30** ／ 調査環境：Claude Code クラウドセッション（リポジトリ `yakkun-shinchian/SD-`）

この文書は **実際にファイルとして存在が確認できたもの** だけを「発見」として記載します。
ChatGPT（チャッピー）側の呼称だけが判明していて実体が見つからないものは、
推測で仕様を確定せず **未発見** として明示します。

---

## 1. 発見した「ご本人作成スキル」（SKILL.md 実体あり）

探索の結果、SKILL.md として存在するユーザー独自スキルは **2件** でした。

| # | 正式登録名 | ChatGPT側の呼称（推定対応） | 原本の保存場所 | 本リポジトリ内の共有先 |
|---|---|---|---|---|
| 1 | `yakubon-infographic-c1` | Clinical Infographic C1 | `~/.claude/skills/synced/<org>_<account>/yakubon-infographic-c1/SKILL.md` | `.claude/skills/yakubon-infographic-c1/SKILL.md` |
| 2 | `medical-3d-orbit-opener` | 医療動画の冒頭3D回り込みカット | `~/.claude/skills/synced/<org>_<account>/medical-3d-orbit-opener/SKILL.md` | `.claude/skills/medical-3d-orbit-opener/SKILL.md` |

- 登録元：claude.ai のアカウント同期スキル（`manifest.json` 上は `source: plugin`）
  - `medical-3d-orbit-opener` … skillId `skill_01Uds6zjnY78v8LcC8grSzfX`（更新 2026-10-29）
  - `yakubon-infographic-c1` … skillId `skill_01DU2cT95CaAJmB4teJeajY8`（更新 2026-10-29）
- 本リポジトリへのコピーは **1バイトも改変していません**（sha256 一致を確認済み）。
  原本は書き換えず、同期元をそのまま正本として残しています。

### 読み込み可否

| スキル | Claude Code | Codex |
|---|---|---|
| `yakubon-infographic-c1` | **可**（`anthropic-skills:yakubon-infographic-c1` / 本PR後は `.claude/skills/` からも） | **可**（本PRの `AGENTS.md` 経由。未検証） |
| `medical-3d-orbit-opener` | **可**（実読み込みテスト済み・2026-10-30） | **可**（本PRの `AGENTS.md` 経由。未検証） |

> Codex側は本セッションから実行できないため、**読み込める配置にした**ところまでが確認済みです。
> 実際の読み込み成功は、Codex側で一度お試しいただく必要があります。

---

## 2. 「スキル」ではなく「コード」として正本が存在する制作方式

SKILL.md はありませんが、**実行可能なコードと成果物** が正本として存在します。
これは推測ではなく、リポジトリ内の実ファイルから読み取った実態です。

### 2-1. Instagram V6（先輩・後輩対話カルーセル動画）

リポジトリ内で **「Instagram V6」と明示** されています（`nurse-exam-drip-v6-review.html`）。

| 項目 | 確認できた実態 | 典拠ファイル |
|---|---|---|
| 解像度 | 1080 × 1920（縦9:16） | `exam02-v6-manifest.json` の `probe` |
| フレームレート | 24fps（exam01）／30fps（exam02） | `exam01-v6-render.py` / `exam02-v6-render.py` |
| 台本形式 | `pages[]`：`title` / `junior` / `senior` / `cta` / `bottom` / `diagram` / `sourceImage` | `exam01-v6-script.json`, `exam02-v6-script.json` |
| 話者 | 後輩＝`junior`、先輩＝`senior`（偶数/奇数で交互） | `*-v6-render.py` |
| CoeFont音声 | 後輩「汎用式概念χ-soft-v2（CV：ろさちゃん）」／先輩「後藤邑子」 | `nurse-v6-review.html`, `nurse-exam-drip-v6-review.html` |
| 冒頭無音 | 各ページ先頭 **0.35秒** のみ、発話間 **0.28秒** | `*-v6-render.py` |
| 話者インジケータ | 後輩 x=35／先輩 x=1010、y=620、26×26px、`0xED5791@0.9` | `*-v6-render.py` |
| 注目マーカー | 図の余白 x=24、`0x7566A8`。**文字・数字の上は通さない** | `*-v6-render.py` |
| エンコード | h264 / crf26 / yuv420p ＋ aac 96k 48kHz ＋ `+faststart` | `*-v6-render.py` |
| 検品 | ffprobe・全走査デコード・sha256・25MB上限・発話数assert | `*-v6-render.py` |
| 出力尺 | exam02＝84.2秒（6ページ） | `exam02-v6-manifest.json` |

**原則**：イラストは生成済みの承認済み素材を固定で使い、動きは
「話者インジケータ」と「図の余白のマーカー」だけで付けます（医学的な図と文字は動かしません）。

### 2-2. V5（イラスト＋対話）

| 項目 | 実態 | 典拠 |
|---|---|---|
| 台本形式 | `storyboard[]`：`title` / `junior` / `senior` / `summary` / `art`（英語画像プロンプト） | `anat05-v5-production.json` |
| 付帯情報 | `sources` / `medical_review` / `technical_checks` | 同上 |
| 成果物 | `anat01〜05-v5-page-*.jpg` ＋ `*-voice-*.mp3` ＋ `*-review.mp4` | リポジトリ直下 |

### 2-3. VOICEVOX ずんだもんナレーション（NurseTube本体用）

| 項目 | 実態 | 典拠 |
|---|---|---|
| 書き出し | `node tools/build-voicevox.mjs` → `voicevox/narration.txt`（118行）＋ `manifest.json/csv` | `tools/build-voicevox.mjs` |
| 整列 | `node tools/link-audio.mjs` → `audio/<番組ID-シーン番号>.wav` ＋ `audio/manifest.js` | `tools/link-audio.mjs` |
| 話者 | ずんだもん（ノーマル） | `voicevox/README.md` |
| 必須表記 | **「VOICEVOX:ずんだもん」クレジット** | 同上 |

### 2-4. 3D医療モデル教材（別リポジトリ）

`yakkun-shinchian/yakubon-3d-heart` ＝ YAKUBON STUDIO｜3D HEART v2。
BodyParts3D 4.0（DBCLS, CC BY 4.0）採用、18構造、血流アニメーション、Three.js + Vite。
**医療動画2（立体解剖CG）系の資産**ですが、動画制作スキルではなくWeb教材です。

---

## 3. 未発見のスキル（実体が確認できなかったもの）

以下は **探索しましたがファイルが存在しません**。推測で SKILL.md を作成していません。

| ご指定の名称 | 状態 | 備考 |
|---|---|---|
| Medical Video 1（医療動画1） | **未発見** | ただし §4 の所見を参照 |
| Medical Video 2（医療動画2） | **未発見** | CT/MRI＋立体解剖CG。`yakubon-3d-heart` が近い資産 |
| Infographics 3 | **未発見** | 正式名称・仕様とも不明 |
| Infographic M3 | **未発見** | 9:16短尺・蛍光ペン同期の仕様は未確認 |
| Instagram V7 Carousel | **未発見** | 1080×1350・`#FFFDF8`・`#3984F6` の仕様は未確認 |
| Instagram V6 Carousel（スキルとして） | **SKILL.mdは未発見** | ただし §2-1 にコードとしての正本あり |
| バルーン・血管内治療スキル | **未発見** | 独立スキルか医療動画1の一部か、判別不能 |
| Kindle書籍制作スキル | **未発見** | 原稿・章立て・KDP工程のテンプレート等なし |

### 探索した場所（すべて確認済み・該当なし）

```
~/.claude/skills/                  → session-start-hook と synced のみ
~/.claude/skills/synced/<account>/ → 全28スキル中、独自は上記2件のみ
~/.claude/plugins/{data,synced}/   → 配布プラグインのみ（独自スキルなし）
/home/user/SD-/.claude/            → 本PRで新規作成（既存なし）
/home/user/SD-/.agents/            → 存在しない
/home/user/SD-/AGENTS.md           → 存在しない（本PRで新規作成）
~/.codex, ~/.config/codex          → 存在しない
~/AGENTS.md, ~/.cursor             → 存在しない
リポジトリ全体の SKILL.md 検索     → 0件
アクセス可能なGitHubリポジトリ4件  → SD- / yakubon-3d-heart / nursing-exam-site / git-takasugi
```

---

## 4. 判別についての所見（確定ではなく仮説）

**`medical-3d-orbit-opener` は「医療動画1」の一部である可能性が高い**と見ています。

根拠：同スキル内で固定指定されている画風が、ご記載の医療動画1の特徴と一致します。

| ご記載の医療動画1 | `medical-3d-orbit-opener` の固定語句 |
|---|---|
| 半透明の血管 | `translucent glass-like vessel wall` |
| 深いネイビー背景 | `deep navy background` |
| 青い発光 | `cool blue rim light`, `soft inner glow` |
| 赤血球 | `small biconcave blood cells floating inside` |
| カテーテル・バルーン・ステント | 「伸びた実績：フローダイバーター治療動画」の記載 |

ただし同スキルは **冒頭0〜3.5秒の掴みカット専用** です。
手技本編（バルーン拡張・ステント展開・血栓回収など）の指示文テンプレートは含まれていません。

→ **医療動画1は「オービット冒頭（発見済み）＋手技本編（未発見）」の2段構成**だったと推測されます。
手技本編側の正本が ChatGPT 側にあるなら、その指示文をお送りいただければ、
同じ書式で SKILL.md 化できます（勝手には作りません）。

---

## 5. 外部サービスの接続状況（2026-10-30 実測）

| サービス | 状態 | 備考 |
|---|---|---|
| **CoeFont**（`coefont.cloud`） | **接続不可** | 環境のネットワークポリシーがホストを拒否（プロキシ 403） |
| ffmpeg / ffprobe | **利用可** | 6.1.1。9:16合成・無音検査・デコード検証を実測成功 |
| Node.js | **利用可** | v22.22.0（`tools/*.mjs` 実行可） |
| Python / numpy / Pillow | **利用可** | 3.13.17 / numpy 2.5.3 / Pillow 12.3.0 |
| 日本語フォント | **一部のみ** | IPAGothic・Unifont-JP・WenQuanYi。ブランド指定書体なし |
| Playwright + Chromium | **利用可** | ブラウザ自動操作可（ただしCoeFontはホスト拒否で到達不可） |
| 画像・動画生成 | **要確認** | creative-claw / Higgsfield / artlist / Canva / Descript 等が接続済み。未実行 |

---

## 6. 運用ルール（このフォルダの扱い）

1. **既存スキルを勝手に書き換えない。** 原本は claude.ai 同期側。ここはミラー。
2. **実体のないスキルを推測で作らない。** 未発見は未発見として §3 に残す。
3. 変更時は必ず **バックアップ → diff 確認 → sha256 照合** の順で行う。
4. Claude Code は `.claude/skills/` を、Codex は `AGENTS.md` 経由で同じ定義を読む。
