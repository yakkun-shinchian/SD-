#!/usr/bin/env node
// スキル記憶庫（Obsidian Vault）同期ツール
//
// Claude に同期されている「自作スキル」を Obsidian の Vault に書き出し、
// 変更があれば ①変更前の全文を版として保存 ②差分（どこを変えたか）を
// 変更履歴に追記 ③最新版を更新 します。消えた版は二度と上書きしません。
//
//   node tools/skill-vault-sync.mjs            # 同期（変更があった分だけ記録）
//   node tools/skill-vault-sync.mjs --dry-run  # 何が変わるかだけ表示
//   node tools/skill-vault-sync.mjs --note "変更の理由"   # 変更履歴に理由を添える
//
// 依存なし（node: 組み込みのみ）。
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = join(ROOT, "obsidian", "YAKUBON-Memory");
const SKILLS_DIR = join(VAULT, "スキル");
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const noteIdx = args.indexOf("--note");
const NOTE = noteIdx >= 0 ? args[noteIdx + 1] || "" : "";

// Anthropic 公式・例示スキル、他社プラグインは対象外（自作だけを保管する）
const NOT_MINE = new Set(["academy-guide", "discernment-nudge", "frontend-design"]);

function findSyncedRoot() {
  const base = process.env.SKILLS_SYNC_DIR || "/root/.claude/skills/synced";
  if (!existsSync(base)) return null;
  if (existsSync(join(base, "manifest.json"))) return base;
  for (const d of readdirSync(base)) {
    const p = join(base, d);
    if (statSync(p).isDirectory() && existsSync(join(p, "manifest.json"))) return p;
  }
  return null;
}

const MARK = "<!-- 原文ここから -->\n";
const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 12);
const today = new Date().toISOString().slice(0, 10);

// 行単位の差分（LCS）。追加は「＋」、削除は「－」で表す。
function lineDiff(a, b) {
  const A = a.split("\n"), B = b.split("\n");
  const n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && A[i] === B[j]) { out.push([" ", A[i]]); i++; j++; }
    else if (i < n && (j >= m || dp[i + 1][j] >= dp[i][j + 1])) { out.push(["-", A[i]]); i++; }
    else { out.push(["+", B[j]]); j++; }
  }
  // 変更箇所の前後2行だけ残す
  const keep = out.map(() => false);
  out.forEach(([t], k) => { if (t !== " ") for (let d = -2; d <= 2; d++) if (out[k + d]) keep[k + d] = true; });
  const lines = [];
  let skipped = false, add = 0, del = 0;
  out.forEach(([t, s], k) => {
    if (t === "+") add++;
    if (t === "-") del++;
    if (!keep[k]) { if (!skipped) lines.push("…"); skipped = true; return; }
    skipped = false;
    lines.push(`${t === " " ? " " : t} ${s}`);
  });
  return { text: lines.join("\n"), add, del };
}

function readState(dir) {
  const p = join(dir, ".state.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : { versions: [] };
}

function frontmatter(obj) {
  return "---\n" + Object.entries(obj).map(([k, v]) =>
    Array.isArray(v) ? `${k}:\n${v.map((x) => `  - ${JSON.stringify(x)}`).join("\n")}` : `${k}: ${JSON.stringify(v)}`
  ).join("\n") + "\n---\n";
}

function main() {
  const src = findSyncedRoot();
  if (!src) { console.error("同期スキルのフォルダが見つかりません（SKILLS_SYNC_DIR で指定できます）"); process.exit(1); }
  const manifest = JSON.parse(readFileSync(join(src, "manifest.json"), "utf8"));
  const mine = manifest.skills
    .filter((s) => s.source === "plugin" && !NOT_MINE.has(s.name))
    .filter((s) => existsSync(join(src, s.name, "SKILL.md")))
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));

  const report = [];
  const index = [];
  for (const s of mine) {
    const body = readFileSync(join(src, s.name, "SKILL.md"), "utf8");
    const hash = sha(body);
    const dir = join(SKILLS_DIR, s.name);
    const state = readState(dir);
    const last = state.versions.at(-1);
    const prev = last ? readFileSync(join(dir, "履歴", last.file), "utf8").split(MARK)[1] ?? "" : null;

    let status = "変更なし";
    if (!last || last.hash !== hash) {
      const v = state.versions.length + 1;
      const updated = s.updatedAt.slice(0, 10);
      const file = `v${v}_${updated}.md`;
      status = last ? `更新 → v${v}` : "初回登録 v1";
      if (!DRY) {
        mkdirSync(join(dir, "履歴"), { recursive: true });
        // ① 版スナップショット（全文。以後は絶対に上書きしない）
        writeFileSync(join(dir, "履歴", file),
          frontmatter({ skill: s.name, version: v, skill_updated_at: s.updatedAt, recorded: today, hash, tags: ["スキル版"] }) +
          `\n> [!info] ${s.name} の v${v}（${updated} 時点の原文そのまま）\n> 最新版は [[${s.name}]]、変更点は [[${s.name}_変更履歴]]\n\n` + MARK + body);
        // ② 変更履歴（差分）
        const logPath = join(dir, `${s.name}_変更履歴.md`);
        let log = existsSync(logPath) ? readFileSync(logPath, "utf8")
          : frontmatter({ skill: s.name, tags: ["変更履歴"] }) + `\n# ${s.name} 変更履歴\n\n新しい変更が上に来ます。各版の全文は「履歴」フォルダにあります。\n\n<!-- 履歴ここから -->\n`;
        let entry;
        if (!last) {
          entry = `## v1 — ${updated}（記憶庫に初回登録）\n- 原文：[[${file.replace(/\.md$/, "")}]]\n- これより前の版はClaude側に残っておらず、復元できませんでした。\n`;
        } else {
          const d = lineDiff(prev, body);
          entry = `## v${v} — ${updated}（v${last.version} から変更）\n` +
            `- 変更前：[[${last.file.replace(/\.md$/, "")}]] ／ 変更後：[[${file.replace(/\.md$/, "")}]]\n` +
            `- 追加 ${d.add} 行・削除 ${d.del} 行\n` + (NOTE ? `- 理由・メモ：${NOTE}\n` : `- 理由・メモ：（あとで書き足してください）\n`) +
            "\n```diff\n" + d.text + "\n```\n";
        }
        log = log.replace("<!-- 履歴ここから -->\n", `<!-- 履歴ここから -->\n${entry}\n`);
        writeFileSync(logPath, log);
        state.versions.push({ version: v, file, hash, skill_updated_at: s.updatedAt, recorded: today });
        writeFileSync(join(dir, ".state.json"), JSON.stringify(state, null, 2) + "\n");
      }
    }
    const curV = DRY && status !== "変更なし" ? (last ? last.version + 1 : 1) : state.versions.at(-1)?.version ?? 1;
    // ③ 最新版ノート（毎回書き直してよい“いまの姿”）
    if (!DRY) {
      writeFileSync(join(dir, `${s.name}.md`),
        frontmatter({ skill: s.name, current_version: curV, skill_updated_at: s.updatedAt, skill_id: s.skillId, description: s.description, tags: ["スキル", "最新版"] }) +
        `\n> [!tip] 最新版 v${curV}（${s.updatedAt.slice(0, 10)}）\n> 変更点：[[${s.name}_変更履歴]] ／ 全版：「履歴」フォルダ ／ 一覧：[[スキル一覧]]\n\n` + body);
    }
    index.push({ s, v: curV });
    report.push(`${status.padEnd(10)} ${s.name}`);
  }

  if (!DRY) {
    const rows = index.map(({ s, v }) =>
      `| [[${s.name}]] | v${v} | ${s.updatedAt.slice(0, 10)} | ${s.description.replace(/\|/g, "／")} |`).join("\n");
    writeFileSync(join(VAULT, "スキル一覧.md"),
      frontmatter({ tags: ["MOC"], generated: today }) +
      `\n# スキル一覧（自作 ${index.length} 本）\n\n自動生成：\`node tools/skill-vault-sync.mjs\`。手で書き換えないでください。\n\n` +
      `| スキル | 版 | 最終更新 | いつ使うか |\n|---|---|---|---|\n${rows}\n`);
  }
  console.log(report.join("\n"));
  console.log(`\n${DRY ? "[dry-run] " : ""}${index.length} 本を確認しました → ${VAULT}`);
}
main();
