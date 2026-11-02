// =========================================================================
// coefont-batch.mjs  ── CoeFont の画面を操作して音声を得る（PR #29 の担当）
//
//   node tools/coefont/coefont-batch.mjs [オプション]
//
// ■ 担当の境界（重要）
//   この道具は「読み台本 → 音声ファイル ＋ import.json」までです。
//   1.3倍速化・audio/ への配置・audio/manifest.js の更新は
//   **tools/import-coefont.mjs（PR #30）の責務**で、ここでは一切触りません。
//   対応表を書き換える道具が二つあると、競合と取りこぼしが必ず起きます。
//
//   入力  coefont/manifest.json        （PR #30 の build-coefont.mjs が生成）
//   出力  coefont/export/<key>.<ext>   （音声。import.json からの相対で export/）
//         coefont/import.json          （PR #30 の import-template.json と同じ形）
//   次へ  node tools/import-coefont.mjs coefont/import.json
//
// ■ オプション
//   --voice <検索語>    CoeFont の画面で声を探す語（既定 "後藤"）
//   --voice-label <名>  import.json に書くラベル（既定 "後藤さん"。#30 が要求する値）
//   --input-speed <n>   書き出した音声の速度。1 か 1.3 のみ（既定 1）
//   --limit <n>         先頭 n 件だけ
//   --only <k1,k2>      指定キーだけ
//   --redo              進捗を無視して全件やり直す
//   --dry-run           ブラウザを開かず、入力の検証と import.json の形だけ確認
// =========================================================================
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import SELECTORS, { resolve, missingTargets } from "./selectors.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, "..", "..");

export const sha = (text) => crypto.createHash("sha256").update(text).digest("hex");

/* PR #30 の import-coefont.mjs が受け付ける値。ここを外すと取り込みで弾かれます。 */
export const ALLOWED_INPUT_SPEEDS = [1, 1.3];
export const DEFAULT_VOICE_LABEL = "後藤さん";
export const ALLOWED_EXT = ["wav", "mp3", "m4a", "ogg"];

/* ───────── 入力：PR #30 が生成した読み台本の対応表 ───────── */
export function loadManifest(dir = root) {
  const p = path.join(dir, "coefont", "manifest.json");
  if (!fs.existsSync(p)) {
    throw new Error(
      `読み台本の対応表がありません: ${p}\n` +
      `  これは PR #30 の道具が作ります。先に次を実行してください。\n` +
      `    node tools/build-coefont.mjs\n` +
      `  （PR #30 が未マージの場合は、そのブランチを取り込む必要があります）`
    );
  }
  const rows = JSON.parse(fs.readFileSync(p, "utf8"));
  if (!Array.isArray(rows) || rows.length === 0) throw new Error(`対応表が空です: ${p}`);
  rows.forEach((r, i) => {
    for (const f of ["key", "speech_text", "source_sha256"]) {
      if (!r[f]) throw new Error(`対応表の ${i + 1} 件目に ${f} がありません（PR #30 の形式と不一致）`);
    }
  });
  if (new Set(rows.map((r) => r.key)).size !== rows.length) throw new Error("対応表にキーの重複があります");
  return rows;
}

/* ───────── 進捗（再実行で未完了分だけにする） ───────── */
const progressPath = (dir) => path.join(dir, "tools", "coefont", "progress.json");

export function loadProgress(dir = root) {
  const p = progressPath(dir);
  if (!fs.existsSync(p)) return { done: {} };
  try {
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    return { done: j.done && typeof j.done === "object" ? j.done : {} };
  } catch {
    return { done: {} }; // 壊れていたら最初からやり直す（有料サービスでも再取得は可能）
  }
}

export function saveProgress(progress, dir = root) {
  const p = progressPath(dir);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(progress, null, 2) + "\n", "utf8");
}

/* ───────── どれを処理するか決める ───────── */
export function selectWork(rows, { limit, only, done = {}, redo = false } = {}) {
  let work = rows;
  if (only && only.length) {
    const want = new Set(only);
    const unknown = only.filter((k) => !rows.some((r) => r.key === k));
    if (unknown.length) throw new Error(`対応表に無いキーです: ${unknown.join(", ")}`);
    work = work.filter((r) => want.has(r.key));
  }
  if (!redo) work = work.filter((r) => !done[r.key]);
  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1) throw new Error(`--limit は1以上の整数です: ${limit}`);
    work = work.slice(0, limit);
  }
  return work;
}

/* ───────── 声を選ぶ（複数一致なら勝手に決めず止まる） ───────── */
export function pickVoice(candidates, query) {
  if (!query) throw new Error("声の検索語が空です");
  const exact = candidates.filter((c) => c === query);
  if (exact.length === 1) return exact[0];
  const hits = candidates.filter((c) => c.includes(query));
  if (hits.length === 1) return hits[0];
  if (hits.length === 0) {
    throw new Error(
      `「${query}」に当てはまる声が見つかりません。\n` +
      `  画面にあった声: ${candidates.slice(0, 20).join(" / ") || "（取得できず）"}`
    );
  }
  throw new Error(
    `「${query}」に複数の声が当てはまります。どれか1つに絞れる語を --voice に指定してください。\n` +
    hits.map((h) => `    - ${h}`).join("\n")
  );
}

/* ───────── 出力：PR #30 の取り込み口に渡す1件 ───────── */
export function importEntry(row, { ext = "mp3", inputSpeed = 1, voiceLabel = DEFAULT_VOICE_LABEL } = {}) {
  if (!ALLOWED_INPUT_SPEEDS.includes(inputSpeed)) {
    throw new Error(`--input-speed は ${ALLOWED_INPUT_SPEEDS.join(" か ")} のみです（PR #30 の制約）: ${inputSpeed}`);
  }
  const e = String(ext).replace(/^\./, "").toLowerCase();
  if (!ALLOWED_EXT.includes(e)) {
    throw new Error(`扱えない拡張子です（PR #30 の制約）: ${ext}（${ALLOWED_EXT.join("/")} のみ）`);
  }
  return {
    key: row.key,
    file: `export/${row.key}.${e}`,   // import.json からの相対パス → coefont/export/
    input_speed: inputSpeed,
    voice: voiceLabel,
    source_sha256: row.source_sha256,
    speech_sha256: sha(row.speech_text),
  };
}

export function writeImportJson(entries, dir = root) {
  const p = path.join(dir, "coefont", "import.json");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(entries, null, 2) + "\n", "utf8");
  return p;
}

export const exportDir = (dir = root) => path.join(dir, "coefont", "export");

/* ───────── 引数の読み取り ───────── */
export function parseArgs(argv) {
  const o = { voice: "後藤", voiceLabel: DEFAULT_VOICE_LABEL, inputSpeed: 1, dryRun: false, redo: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} の値がありません`);
      return v;
    };
    if (a === "--voice") o.voice = next();
    else if (a === "--voice-label") o.voiceLabel = next();
    else if (a === "--input-speed") o.inputSpeed = Number(next());
    else if (a === "--limit") o.limit = Number.parseInt(next(), 10);
    else if (a === "--only") o.only = next().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--redo") o.redo = true;
    else if (a === "--dry-run") o.dryRun = true;
    else throw new Error(`知らないオプションです: ${a}`);
  }
  if (!ALLOWED_INPUT_SPEEDS.includes(o.inputSpeed)) {
    throw new Error(`--input-speed は ${ALLOWED_INPUT_SPEEDS.join(" か ")} のみです: ${o.inputSpeed}`);
  }
  return o;
}

/* ───────── 本番：ブラウザで CoeFont を操作する ───────── */
export function assertSelectorsReady() {
  const missing = missingTargets();
  if (missing.length) {
    throw new Error(
      `選択子が未記入です（${missing.length} 件）。先に画面を採寸してください。\n` +
      `    node tools/coefont/coefont-login.mjs   # 初回のみ\n` +
      `    node tools/coefont/coefont-probe.mjs   # 採寸\n` +
      `  そのうえで tools/coefont/selectors.js を埋めます。未記入の項目:\n` +
      missing.map((m) => `    - ${m}`).join("\n")
    );
  }
  return true;
}

async function runBrowser(work, opts) {
  assertSelectorsReady();

  const { loadChromium, launchOptions } = await import("./playwright-resolve.mjs");
  const chromium = await loadChromium();
  const profileDir = path.join(here, ".profile");
  if (!fs.existsSync(profileDir)) {
    throw new Error("ログイン情報がありません。先に `node tools/coefont/coefont-login.mjs` を実行してください。");
  }
  fs.mkdirSync(exportDir(), { recursive: true });

  const context = await chromium.launchPersistentContext(
    profileDir,
    launchOptions({
      headless: false,
      viewport: { width: 1440, height: 950 },
      locale: "ja-JP",
      timezoneId: "Asia/Tokyo",
      acceptDownloads: true,
      args: ["--disable-blink-features=AutomationControlled"],
    })
  );

  const progress = loadProgress();
  try {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(process.env.COEFONT_URL || "https://coefont.cloud/", {
      waitUntil: "domcontentloaded",
      timeout: SELECTORS.timing.navigation,
    });

    await resolve(page, SELECTORS.loggedIn.marker, { label: "loggedIn.marker" });
    const nb = await resolve(page, SELECTORS.project.newButton, { label: "project.newButton" });
    await nb.locator.click();
    await resolve(page, SELECTORS.project.editorReady, { label: "project.editorReady" });

    // 声を選ぶ。候補が複数なら勝手に決めず止まります。
    const op = await resolve(page, SELECTORS.voice.openPicker, { label: "voice.openPicker" });
    await op.locator.click();
    const si = await resolve(page, SELECTORS.voice.searchInput, { label: "voice.searchInput" });
    await si.locator.fill(opts.voice);
    await page.waitForTimeout(SELECTORS.timing.settle);
    const items = await resolve(page, SELECTORS.voice.resultItem, { label: "voice.resultItem" });
    const names = (await items.locator.page().locator(items.locator.toString()).allTextContents?.()) || [];
    const chosen = pickVoice(names.map((s) => s.trim()).filter(Boolean), opts.voice);
    await page.getByText(chosen, { exact: true }).first().click();
    if (SELECTORS.voice.confirm.length) {
      const cf = await resolve(page, SELECTORS.voice.confirm, { label: "voice.confirm" });
      await cf.locator.click();
    }
    console.log(`声: ${chosen}（import.json に書くラベル: ${opts.voiceLabel}）`);

    let ext = "mp3";
    for (const [i, row] of work.entries()) {
      const ti = await resolve(page, SELECTORS.script.textInput, { label: "script.textInput" });
      await ti.locator.fill(row.speech_text);
      if (SELECTORS.script.addLine.length) {
        const al = await resolve(page, SELECTORS.script.addLine, { label: "script.addLine" });
        await al.locator.click();
      }
      const dl = await resolve(page, SELECTORS.export.download, { label: "export.download" });
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: SELECTORS.timing.synthesis }),
        dl.locator.click(),
      ]);
      const suggested = download.suggestedFilename() || "";
      const e = (path.extname(suggested).replace(/^\./, "") || "mp3").toLowerCase();
      ext = ALLOWED_EXT.includes(e) ? e : "mp3";
      const dest = path.join(exportDir(), `${row.key}.${ext}`);
      await download.saveAs(dest);
      progress.done[row.key] = { ext, savedAt: new Date().toISOString() };
      saveProgress(progress);
      console.log(`  [${i + 1}/${work.length}] ${row.key} → coefont/export/${row.key}.${ext}`);
    }
    return { ext, progress };
  } finally {
    saveProgress(progress);
    await context.close();
  }
}

/* ───────── 入口 ───────── */
export async function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const rows = loadManifest();
  const progress = loadProgress();
  const work = selectWork(rows, { limit: opts.limit, only: opts.only, done: progress.done, redo: opts.redo });

  console.log(`対応表 ${rows.length} 件 / 今回の対象 ${work.length} 件 / 済み ${Object.keys(progress.done).length} 件`);

  if (opts.dryRun) {
    const entries = work.map((r) => importEntry(r, { inputSpeed: opts.inputSpeed, voiceLabel: opts.voiceLabel }));
    console.log("\n--dry-run：ブラウザは開きません。import.json に書く内容の先頭3件:");
    console.log(JSON.stringify(entries.slice(0, 3), null, 2));
    console.log(`\n（本番では ${entries.length} 件を coefont/export/ に書き出し、coefont/import.json を作ります）`);
    return { entries, dryRun: true };
  }

  if (work.length === 0) {
    console.log("やることがありません（--redo で全件やり直せます）");
    return { entries: [], dryRun: false };
  }

  const { progress: after } = await runBrowser(work, opts);

  // 済みになったものすべてで import.json を作ります（今回の分だけでなく）
  const entries = rows
    .filter((r) => after.done[r.key])
    .map((r) => importEntry(r, { ext: after.done[r.key].ext, inputSpeed: opts.inputSpeed, voiceLabel: opts.voiceLabel }));
  const p = writeImportJson(entries);

  console.log(`\n書き出し完了: ${entries.length} 件`);
  console.log(`  ${path.relative(root, p)} を作りました。次はこれを PR #30 の道具に渡します。\n`);
  console.log(`    node tools/import-coefont.mjs coefont/import.json${entries.length < rows.length ? " --partial" : ""}\n`);
  return { entries, dryRun: false };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error("\n" + e.message + "\n");
    process.exitCode = 1;
  });
}
