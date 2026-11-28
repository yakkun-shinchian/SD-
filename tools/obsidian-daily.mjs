#!/usr/bin/env node
// =========================================================================
// Obsidian 日報ジェネレーター
//
// その日に作った動画・イラスト・台本・音声（git の履歴から検出）と、
// Claude Code に投げた質問（tools/obsidian-log-question.mjs が記録）を
// まとめて、Obsidian の保管庫（vault）に「日報ノート」として書き出します。
//
//   node tools/obsidian-daily.mjs --vault ~/Obsidian/MyVault
//   node tools/obsidian-daily.mjs --date 2026-11-15          # 指定日
//   node tools/obsidian-daily.mjs --days 14                  # 過去14日分をまとめて
//   node tools/obsidian-daily.mjs --dry-run                  # 書き込まずに内容を表示
//
// 保管庫は --vault か環境変数 OBSIDIAN_VAULT で指定します。
// 何度実行しても同じ結果になります（自動生成部分だけを書き換え、
// 「## メモ」以下に自分で書いた内容は残ります）。
//
// 依存パッケージなし（node: 組み込みのみ）。
// =========================================================================
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_URL = "https://github.com/yakkun-shinchian/SD-";
const PAGES_URL = "https://yakkun-shinchian.github.io/SD-";
const AUTO_START = "<!-- obsidian-daily:auto:start -->";
const AUTO_END = "<!-- obsidian-daily:auto:end -->";

const KINDS = {
  video: { label: "🎬 動画", exts: [".mp4", ".webm", ".mov"] },
  illust: { label: "🖼 イラスト・画像", exts: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"] },
  script: { label: "📝 台本・構成", exts: [".json"] },
  audio: { label: "🔊 音声", exts: [".mp3", ".wav", ".m4a"] },
};
const SCRIPT_RE = /(script|dialogue|production|storyboard|manifest|progress)/i;
const IGNORE_RE = /(^|\/)(tests?|node_modules|\.github|tools)\//;

// ---------------------------------------------------------------- 引数
function parseArgs(argv) {
  const o = {
    vault: process.env.OBSIDIAN_VAULT || "",
    folder: process.env.OBSIDIAN_FOLDER || "NurseTube",
    date: "",
    days: 1,
    copy: { video: true, illust: true, audio: false, script: false },
    dryRun: false,
    ifConfigured: false,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--vault") o.vault = next();
    else if (a === "--folder") o.folder = next();
    else if (a === "--date") o.date = next();
    else if (a === "--days") o.days = Math.max(1, parseInt(next(), 10) || 1);
    else if (a === "--no-copy-video") o.copy.video = false;
    else if (a === "--no-copy-images") o.copy.illust = false;
    else if (a === "--with-audio") o.copy.audio = true;
    else if (a === "--dry-run") o.dryRun = true;
    else if (a === "--if-configured") o.ifConfigured = true;
    else if (a === "--quiet") o.quiet = true;
    else if (a === "-h" || a === "--help") {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 20).join("\n"));
      process.exit(0);
    } else {
      console.error(`不明なオプション: ${a}`);
      process.exit(2);
    }
  }
  if (o.vault.startsWith("~")) o.vault = path.join(process.env.HOME || "", o.vault.slice(1));
  return o;
}

// ---------------------------------------------------------------- 日付（日本時間）
function jstToday() {
  return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
}
function addDays(ymd, n) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const WEEK = ["日", "月", "火", "水", "木", "金", "土"];
const weekday = (ymd) => WEEK[new Date(`${ymd}T00:00:00Z`).getUTCDay()];

// ---------------------------------------------------------------- git
function git(args, opts = {}) {
  return execFileSync("git", args, { cwd: ROOT, maxBuffer: 512 * 1024 * 1024, ...opts });
}

/** その日のコミットと、追加・変更されたファイル（最後に触ったコミット付き）を集める */
function collectDay(ymd) {
  let out = "";
  try {
    out = git([
      "log", "--all", "--no-merges", "--diff-filter=AM", "--name-status",
      `--since=${ymd}T00:00:00+09:00`, `--until=${ymd}T23:59:59+09:00`,
      "--format=@@%H\t%ad\t%s", "--date=format-local:%H:%M",
    ], { env: { ...process.env, TZ: "Asia/Tokyo" } }).toString("utf8");
  } catch {
    return { commits: [], files: new Map() };
  }
  const commits = [];
  const files = new Map(); // path -> { sha, status }
  let cur = null;
  for (const line of out.split("\n")) {
    if (line.startsWith("@@")) {
      const [sha, time, subject] = line.slice(2).split("\t");
      cur = { sha, time, subject };
      if (!commits.some((c) => c.subject === subject)) commits.push(cur);
      continue;
    }
    const m = line.match(/^([AM])\t(.+)$/);
    if (!m || !cur) continue;
    // git log は新しい順。最初に見たもの＝その日の最終版
    if (!files.has(m[2])) files.set(m[2], { sha: cur.sha, status: m[1] });
    else if (m[1] === "A") files.get(m[2]).status = "A";
  }
  return { commits: commits.reverse(), files };
}

function kindOf(p) {
  if (IGNORE_RE.test(p)) return null;
  const ext = path.extname(p).toLowerCase();
  for (const [k, v] of Object.entries(KINDS)) {
    if (!v.exts.includes(ext)) continue;
    if (k === "script" && !SCRIPT_RE.test(path.basename(p))) return null;
    return k;
  }
  return null;
}

// ---------------------------------------------------------------- 番組タイトル
function loadPrograms() {
  try {
    const src = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");
    const ctx = {};
    vm.runInNewContext(`${src}\n;this.__P = PROGRAMS;`, ctx);
    return new Map(ctx.__P.map((p) => [p.id, p]));
  } catch {
    return new Map();
  }
}
function programIdOf(p) {
  const m = path.basename(p).match(/^([a-z]+\d+)(?=[-_.])/i);
  if (m) return m[1].toLowerCase();
  const s = p.match(/(?:^|\/)samples\/([^/]+)\//);
  return s ? s[1] : "その他";
}

// ---------------------------------------------------------------- 質問ログ
function readQuestions(dir, ymd) {
  const f = path.join(dir, `${ymd}.jsonl`);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).flatMap((l) => {
    try { return [JSON.parse(l)]; } catch { return []; }
  });
}

// ---------------------------------------------------------------- 書き出し
const md = (s) => String(s).replace(/\r/g, "").trim();
const quote = (s) => md(s).split("\n").map((l) => `> ${l}`).join("\n");

function buildNote(ymd, day, questions, programs, opts, attachDir) {
  const groups = new Map(); // programId -> { video:[], illust:[], ... }
  for (const [p, info] of day.files) {
    const k = kindOf(p);
    if (!k) continue;
    const id = programIdOf(p);
    if (!groups.has(id)) groups.set(id, { video: [], illust: [], script: [], audio: [] });
    groups.get(id)[k].push({ path: p, ...info });
  }

  const counts = { video: 0, illust: 0, script: 0, audio: 0 };
  for (const g of groups.values()) for (const k of Object.keys(counts)) counts[k] += g[k].length;

  const copies = []; // { sha, path, dest }
  const L = [];
  L.push(`# ${ymd}（${weekday(ymd)}）の制作日報`, "");
  L.push(`- 質問 **${questions.length}** 件 ／ 動画 **${counts.video}** 本 ／ イラスト **${counts.illust}** 枚 ／ 台本 **${counts.script}** 件 ／ 音声 **${counts.audio}** 本`);
  L.push(`- 前日: [[${addDays(ymd, -1)}]] ・ 翌日: [[${addDays(ymd, 1)}]] ・ [[日報一覧]]`, "");

  L.push("## ❓ 今日の質問", "");
  if (!questions.length) L.push("_記録された質問はありません。_", "");
  questions.forEach((q, i) => {
    L.push(`### Q${i + 1}. ${md(q.prompt).split("\n")[0].slice(0, 60)}`);
    L.push(`<small>${q.time || ""}${q.project ? ` ・ ${q.project}` : ""}</small>`, "");
    L.push(quote(q.prompt), "");
  });

  L.push("## 🎨 今日の制作物", "");
  if (!groups.size) L.push("_この日に追加・更新された制作物はありません。_", "");
  const ids = [...groups.keys()].sort((a, b) => (a === "その他") - (b === "その他") || a.localeCompare(b));
  for (const id of ids) {
    const g = groups.get(id);
    const prog = programs.get(id);
    L.push(`### ${prog ? `${prog.title}（${id}）` : id}`);
    if (prog) L.push(`<small>${prog.category} ・ [番組ページ](${PAGES_URL}/nurse.html#/watch/${id})</small>`);
    L.push("");
    for (const k of ["video", "illust", "script", "audio"]) {
      const items = g[k].sort((a, b) => a.path.localeCompare(b.path, "ja", { numeric: true }));
      if (!items.length) continue;
      if (!opts.copy[k]) {
        // 台本・音声などは折りたたみ（Obsidian のコールアウト）にしてリンクだけ並べる
        L.push(`> [!note]- ${KINDS[k].label}（${items.length}）`);
        for (const it of items) {
          const badge = it.status === "A" ? "🆕" : "✏️";
          L.push(`> - ${badge} [${it.path}](${REPO_URL}/blob/${it.sha}/${encodeURI(it.path)})`);
        }
        L.push("");
        continue;
      }
      L.push(`**${KINDS[k].label}**（${items.length}）`, "");
      for (const it of items) {
        const badge = it.status === "A" ? "🆕" : "✏️";
        const web = `${REPO_URL}/blob/${it.sha}/${encodeURI(it.path)}`;
        if (opts.copy[k]) {
          const name = it.path.replace(/\//g, "__");
          const rel = `${attachDir}/${name}`;
          copies.push({ sha: it.sha, path: it.path, dest: rel });
          L.push(k === "illust" ? `- ${badge} ${it.path}\n\n  ![[${rel}|360]]\n` : `- ${badge} ${it.path}\n\n  ![[${rel}]]\n`);
        } else {
          L.push(`- ${badge} [${it.path}](${web})`);
        }
      }
      L.push("");
    }
  }

  L.push("## 🛠 今日の作業（コミット）", "");
  if (!day.commits.length) L.push("_コミットはありません。_");
  for (const c of day.commits) L.push(`- ${c.time} ${md(c.subject)} （[${c.sha.slice(0, 7)}](${REPO_URL}/commit/${c.sha})）`);
  L.push("");

  const tags = ["日報", "NurseTube", ...[...groups.keys()].filter((i) => programs.has(i))];
  const front = [
    "---",
    `date: ${ymd}`,
    `questions: ${questions.length}`,
    `videos: ${counts.video}`,
    `illustrations: ${counts.illust}`,
    `scripts: ${counts.script}`,
    `audio: ${counts.audio}`,
    `tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]`,
    "---",
  ].join("\n");
  return { front, body: L.join("\n"), copies, counts, questions: questions.length };
}

/** 既存ノートの「自動生成部分」だけを差し替える（メモは残す） */
function mergeNote(existing, front, body) {
  const auto = `${AUTO_START}\n${body}\n${AUTO_END}`;
  if (!existing) return `${front}\n${auto}\n\n## ✍️ メモ\n\n- \n`;
  const s = existing.indexOf(AUTO_START);
  const e = existing.indexOf(AUTO_END);
  const rest = existing.replace(/^---\n[\s\S]*?\n---\n?/, "");
  if (s < 0 || e < 0) return `${front}\n${auto}\n\n${rest.trim()}\n`;
  const after = existing.slice(e + AUTO_END.length);
  return `${front}\n${auto}${after}`;
}

function writeIndex(dailyDir, base) {
  const notes = fs.readdirSync(dailyDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse();
  const L = ["# 日報一覧", "", "Dataview プラグインがあれば、下の表が自動で集計されます。", "",
    "```dataview", `TABLE questions AS "質問", videos AS "動画", illustrations AS "イラスト", scripts AS "台本"`,
    `FROM "${base}/日報"`, "SORT date DESC", "```", "", "## すべての日報", ""];
  let month = "";
  for (const f of notes) {
    const d = f.slice(0, 10);
    if (d.slice(0, 7) !== month) { month = d.slice(0, 7); L.push("", `### ${month}`); }
    L.push(`- [[${d}]]（${weekday(d)}）`);
  }
  fs.writeFileSync(path.join(dailyDir, "..", "日報一覧.md"), `${L.join("\n")}\n`);
}

// ---------------------------------------------------------------- main
function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!o.vault && !o.dryRun) {
    if (o.ifConfigured) process.exit(0);
    console.error("保管庫が未指定です。--vault <パス> か環境変数 OBSIDIAN_VAULT を設定してください。");
    process.exit(2);
  }
  if (o.vault && !fs.existsSync(o.vault)) {
    if (o.ifConfigured) process.exit(0);
    console.error(`保管庫が見つかりません: ${o.vault}`);
    process.exit(2);
  }
  const base = o.folder.replace(/^\/+|\/+$/g, "");
  const baseAbs = path.join(o.vault || ".", base);
  const dailyDir = path.join(baseAbs, "日報");
  const qDir = process.env.OBSIDIAN_QUESTIONS_DIR || path.join(baseAbs, "_質問ログ");
  const programs = loadPrograms();
  const end = o.date || jstToday();

  for (let i = o.days - 1; i >= 0; i--) {
    const ymd = addDays(end, -i);
    const day = collectDay(ymd);
    const qs = readQuestions(qDir, ymd);
    const attachDir = `${base}/添付/${ymd}`;
    const note = buildNote(ymd, day, qs, programs, o, attachDir);
    const notePath = path.join(dailyDir, `${ymd}.md`);

    if (o.dryRun) {
      console.log(`${note.front}\n${note.body}\n`);
      continue;
    }
    // 何もない日はノートを作らない（既にあれば更新する）
    const empty = !note.questions && !day.files.size && !day.commits.length;
    if (empty && !fs.existsSync(notePath)) continue;

    fs.mkdirSync(dailyDir, { recursive: true });
    for (const c of note.copies) {
      const dest = path.join(o.vault, c.dest);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      try { fs.writeFileSync(dest, git(["show", `${c.sha}:${c.path}`])); } catch { /* 取り出せなければリンクのみ */ }
    }
    const existing = fs.existsSync(notePath) ? fs.readFileSync(notePath, "utf8") : "";
    fs.writeFileSync(notePath, mergeNote(existing, note.front, note.body));
    if (!o.quiet) {
      const c = note.counts;
      console.log(`✔ ${path.relative(o.vault, notePath)}  質問${note.questions} 動画${c.video} イラスト${c.illust} 台本${c.script} 音声${c.audio}`);
    }
  }
  if (!o.dryRun && fs.existsSync(dailyDir)) writeIndex(dailyDir, base);
}

main();
