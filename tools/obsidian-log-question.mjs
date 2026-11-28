#!/usr/bin/env node
// =========================================================================
// Claude Code の UserPromptSubmit フックから呼ばれ、入力した質問を
// Obsidian 保管庫の「_質問ログ/YYYY-MM-DD.jsonl」に 1 行ずつ追記します。
// tools/obsidian-daily.mjs がこれを読み、日報の「今日の質問」にまとめます。
//
// - 環境変数 OBSIDIAN_VAULT が未設定なら何もしません（クラウド環境など）。
// - 質問は保管庫（あなたのパソコン）にだけ保存され、リポジトリには入りません。
// - どんな失敗でも終了コード 0 で抜け、Claude Code の動作を止めません。
// =========================================================================
import fs from "node:fs";
import path from "node:path";

const MAX = 4000; // 長い貼り付けは切り詰める

try {
  let vault = process.env.OBSIDIAN_VAULT || "";
  if (vault.startsWith("~")) vault = path.join(process.env.HOME || "", vault.slice(1));
  if (!vault || !fs.existsSync(vault)) process.exit(0);

  const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  let prompt = String(input.prompt || "").trim();
  if (!prompt) process.exit(0);
  if (prompt.length > MAX) prompt = `${prompt.slice(0, MAX)}\n…（以下省略）`;

  const now = new Date(Date.now() + 9 * 3600e3).toISOString(); // 日本時間
  const ymd = now.slice(0, 10);
  const folder = (process.env.OBSIDIAN_FOLDER || "NurseTube").replace(/^\/+|\/+$/g, "");
  const dir = process.env.OBSIDIAN_QUESTIONS_DIR || path.join(vault, folder, "_質問ログ");
  fs.mkdirSync(dir, { recursive: true });

  const rec = {
    time: now.slice(11, 16),
    prompt,
    project: path.basename(input.cwd || process.env.CLAUDE_PROJECT_DIR || ""),
    session: input.session_id || "",
  };
  fs.appendFileSync(path.join(dir, `${ymd}.jsonl`), `${JSON.stringify(rec)}\n`);
} catch {
  /* 記録に失敗しても質問の送信は妨げない */
}
process.exit(0);
