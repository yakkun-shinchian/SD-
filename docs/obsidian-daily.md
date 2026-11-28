# Obsidian 日報の自動化

毎日の **質問**・**作った動画**・**イラスト**・**台本**・**音声** を、Obsidian の保管庫に
1日1枚の「日報ノート」として自動でまとめます。

```
<保管庫>/NurseTube/
├── 日報一覧.md              ← 全日報の目次（Dataview があれば集計表も）
├── 日報/2026-11-28.md       ← その日の日報（質問・制作物・コミット・メモ欄）
├── 添付/2026-11-28/…        ← 動画・イラストの実ファイル（ノートに埋め込み表示）
└── _質問ログ/2026-11-28.jsonl ← Claude Code に入力した質問の生ログ
```

## 何が自動で集まるか

| 項目 | 集め方 |
|------|--------|
| ❓ 質問 | このリポジトリで Claude Code を使うと、入力した質問が `UserPromptSubmit` フックで `_質問ログ/` に記録されます（`.claude/settings.json`） |
| 🎬 動画・🖼 イラスト | その日（日本時間）に git へ追加・更新された `mp4/jpg/png/webp/svg` を検出し、`添付/` にコピーして埋め込みます。他ブランチの成果も拾います |
| 📝 台本・🔊 音声 | `*-script.json`・`*-dialogue.json`・`*.mp3` などを折りたたみリストで GitHub へリンク |
| 🛠 作業 | その日のコミット一覧 |

ファイル名の先頭（`anat01-…`、`exam02-…`）から `data.js` の番組タイトルを引き、番組ごとに整理します。

## 初回設定（あなたのパソコンで1回だけ）

1. 保管庫の場所を環境変数に登録します。

   ```bash
   # macOS / Linux（~/.zshrc または ~/.bashrc に追記）
   export OBSIDIAN_VAULT="$HOME/Documents/ObsidianVault"
   ```
   ```powershell
   # Windows（PowerShell）
   setx OBSIDIAN_VAULT "C:\Users\<あなた>\Documents\ObsidianVault"
   ```

2. これで完了です。以後このリポジトリで Claude Code を使うと、
   - 質問するたびに `_質問ログ/` へ記録され、
   - Claude が返答を終えるたびに（`Stop` フック）今日の日報が自動で更新されます。

   `OBSIDIAN_VAULT` が無い環境（クラウドのセッションなど）では、フックは何もしません。

## Claude を使わない日も毎日まとめる（任意）

毎晩 23:50 に自動実行する例です。

```bash
# macOS / Linux: crontab -e
50 23 * * * cd ~/SD- && git fetch --all -q && OBSIDIAN_VAULT="$HOME/Documents/ObsidianVault" /usr/local/bin/node tools/obsidian-daily.mjs --quiet
```
```powershell
# Windows: タスク スケジューラに登録
schtasks /create /sc daily /st 23:50 /tn "Obsidian日報" /tr "cmd /c cd /d C:\path\to\SD- && git fetch --all -q && node tools\obsidian-daily.mjs --quiet"
```

## 手動で使う

```bash
node tools/obsidian-daily.mjs                    # 今日の日報を作成・更新
node tools/obsidian-daily.mjs --date 2026-10-01  # 指定日
node tools/obsidian-daily.mjs --days 30          # 過去30日分をまとめて作る
node tools/obsidian-daily.mjs --dry-run          # 書き込まずに画面へ表示
```

| オプション | 意味 |
|------------|------|
| `--vault <パス>` | 保管庫（`OBSIDIAN_VAULT` より優先） |
| `--folder <名前>` | 保管庫内のフォルダ名（既定 `NurseTube`、環境変数 `OBSIDIAN_FOLDER`） |
| `--no-copy-video` | 動画をコピーせず GitHub へのリンクにする（容量節約） |
| `--no-copy-images` | イラストもリンクにする |
| `--with-audio` | 音声もコピーして埋め込む |

## 大切な約束

- **質問はリポジトリに入りません。** このリポジトリは公開（public）なので、質問ログは保管庫（あなたのパソコン）にだけ保存されます。
- **何度実行しても安全です。** 書き換わるのは `<!-- obsidian-daily:auto:start -->` 〜 `auto:end` の間だけで、下の「✍️ メモ」に書いた内容は残ります。
- 何も無かった日はノートを作りません。
