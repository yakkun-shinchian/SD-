// =========================================================================
// coefont-batch.test.mjs
// ブラウザを使わずに検証できる部分をすべて確かめます。
//   node --test tools/coefont/coefont-batch.test.mjs
//
// 最初の2つは「契約テスト」です。PR #30 の実物のデータを埋め込んでおり、
// #30 が形式を変えたら、ここで落ちて気づけます。
// =========================================================================
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  sha, loadManifest, loadProgress, saveProgress, selectWork, pickVoice,
  importEntry, writeImportJson, parseArgs, exportDir, assertSelectorsReady,
  DEFAULT_VOICE_LABEL, ALLOWED_INPUT_SPEEDS,
} from "./coefont-batch.mjs";
import { missingTargets, missingRequired, applyLocal, resolve } from "./selectors.mjs";

/* PR #30 の feature/coefont-reading-pipeline から取った実物の値 */
const REAL = {
  key: "anat01-1",
  speech_text: "きょうはしんぞうのかいぼうとけつえきのながれをべんきょうします。しんぞうにはうしんぼう・うしんしつ・さしんぼう・さしんしつのよっつのへやがあり、うえがしんぼう、したがしんしつです。まずはこのなまえといちをおさえましょう。",
  source_sha256: "5163e5a3bd9b4b07e9b6a8ec3524322776c940ca3ad8a2c0f168b0ea5827d232",
  speech_sha256: "41ee4069267700b70bc0b8ebd37f378a9fcc43a3ba7063e94fbda2fdf031e50b",
};

function fixture(rows = [REAL]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coefont-batch-test-"));
  fs.mkdirSync(path.join(dir, "coefont"), { recursive: true });
  fs.writeFileSync(path.join(dir, "coefont", "manifest.json"), JSON.stringify(rows, null, 2));
  return dir;
}
const clean = (d) => fs.rmSync(d, { recursive: true, force: true });

/* assert.throws は例外を返さないため、文面を調べたいときはこれで捕まえます。 */
function caught(fn) {
  try { fn(); } catch (e) { return e; }
  throw new assert.AssertionError({ message: "例外が投げられませんでした" });
}

test("契約: speech_sha256 は読み本文の改行なし SHA-256（PR #30 の実データと一致）", () => {
  assert.equal(sha(REAL.speech_text), REAL.speech_sha256);
  assert.notEqual(sha(REAL.speech_text + "\n"), REAL.speech_sha256); // 改行つきではない
});

test("契約: importEntry が PR #30 の import-template と同じ形・同じ値を出す", () => {
  const e = importEntry(REAL);
  assert.deepEqual(e, {
    key: "anat01-1",
    file: "export/anat01-1.mp3",   // import.json からの相対 → coefont/export/
    input_speed: 1,
    voice: "後藤さん",
    source_sha256: REAL.source_sha256,
    speech_sha256: REAL.speech_sha256,
  });
  assert.equal(DEFAULT_VOICE_LABEL, "後藤さん"); // #30 の import-coefont.mjs が要求する値
});

test("importEntry は PR #30 が弾く値を先に弾く", () => {
  assert.deepEqual(ALLOWED_INPUT_SPEEDS, [1, 1.3]);
  assert.equal(importEntry(REAL, { inputSpeed: 1.3 }).input_speed, 1.3);
  assert.throws(() => importEntry(REAL, { inputSpeed: 1.5 }), /input-speed/);
  assert.throws(() => importEntry(REAL, { inputSpeed: 2 }), /input-speed/);
  assert.equal(importEntry(REAL, { ext: "wav" }).file, "export/anat01-1.wav");
  assert.equal(importEntry(REAL, { ext: ".WAV" }).file, "export/anat01-1.wav");
  assert.throws(() => importEntry(REAL, { ext: "flac" }), /拡張子/);
  assert.equal(importEntry(REAL, { voiceLabel: "別名" }).voice, "別名");
});

test("loadManifest: 無い・空・形式違い・キー重複を見分けて止まる", () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "coefont-none-"));
  try {
    assert.throws(() => loadManifest(empty), /build-coefont\.mjs/); // 直し方を案内する
  } finally { clean(empty); }

  let d = fixture([]);
  try { assert.throws(() => loadManifest(d), /空/); } finally { clean(d); }

  d = fixture([{ key: "x", speech_text: "あ" }]); // source_sha256 欠落
  try { assert.throws(() => loadManifest(d), /source_sha256/); } finally { clean(d); }

  d = fixture([REAL, REAL]);
  try { assert.throws(() => loadManifest(d), /重複/); } finally { clean(d); }

  d = fixture();
  try { assert.equal(loadManifest(d).length, 1); } finally { clean(d); }
});

test("selectWork: limit・only・再実行・--redo", () => {
  const rows = ["a", "b", "c", "d"].map((k) => ({ key: k, speech_text: k, source_sha256: k }));
  assert.deepEqual(selectWork(rows, {}).map((r) => r.key), ["a", "b", "c", "d"]);
  assert.deepEqual(selectWork(rows, { limit: 2 }).map((r) => r.key), ["a", "b"]);
  assert.deepEqual(selectWork(rows, { only: ["b", "d"] }).map((r) => r.key), ["b", "d"]);
  // 済みのものは飛ばす（90本目で落ちても続きから）
  assert.deepEqual(selectWork(rows, { done: { a: {}, b: {} } }).map((r) => r.key), ["c", "d"]);
  assert.deepEqual(selectWork(rows, { done: { a: {}, b: {} }, redo: true }).map((r) => r.key), ["a", "b", "c", "d"]);
  assert.deepEqual(selectWork(rows, { only: ["a", "c"], done: { a: {} } }).map((r) => r.key), ["c"]);
  assert.throws(() => selectWork(rows, { only: ["zzz"] }), /無いキー/);
  assert.throws(() => selectWork(rows, { limit: 0 }), /1以上/);
});

test("pickVoice: 一意なら選び、曖昧なら勝手に決めず止まる", () => {
  const list = ["後藤さん", "後藤さん（ささやき）", "ミリアル", "アリアル"];
  assert.equal(pickVoice(list, "後藤さん"), "後藤さん");          // 完全一致を優先
  assert.equal(pickVoice(list, "ミリアル"), "ミリアル");
  assert.equal(pickVoice(["後藤 真希"], "後藤"), "後藤 真希");    // 一意な部分一致
  assert.throws(() => pickVoice(list, "後藤"), /複数の声/);        // 曖昧 → 止まる
  assert.throws(() => pickVoice(list, "存在しない"), /見つかりません/);
  assert.throws(() => pickVoice([], "後藤"), /見つかりません/);
  assert.throws(() => pickVoice(list, ""), /検索語が空/);
  // 候補を文面に並べる（選び直せるように）
  assert.match(caught(() => pickVoice(list, "後藤")).message, /後藤さん（ささやき）/);
});

test("parseArgs: 既定値・指定・誤り", () => {
  const d = parseArgs([]);
  assert.equal(d.voice, "後藤");                  // 画面での検索語
  assert.equal(d.voiceLabel, "後藤さん");          // import.json に書くラベル（別物）
  assert.equal(d.inputSpeed, 1);
  assert.equal(d.dryRun, false);
  const o = parseArgs(["--voice", "後藤 真希", "--limit", "3", "--only", "a, b ,", "--dry-run", "--input-speed", "1.3", "--redo"]);
  assert.equal(o.voice, "後藤 真希");
  assert.equal(o.limit, 3);
  assert.deepEqual(o.only, ["a", "b"]);
  assert.equal(o.dryRun, true);
  assert.equal(o.inputSpeed, 1.3);
  assert.equal(o.redo, true);
  assert.throws(() => parseArgs(["--nope"]), /知らないオプション/);
  assert.throws(() => parseArgs(["--voice"]), /値がありません/);
  assert.throws(() => parseArgs(["--input-speed", "2"]), /input-speed/);
});

test("writeImportJson と exportDir の場所が PR #30 の相対パスと噛み合う", () => {
  const dir = fixture();
  try {
    const p = writeImportJson([importEntry(REAL)], dir);
    assert.equal(p, path.join(dir, "coefont", "import.json"));
    const back = JSON.parse(fs.readFileSync(p, "utf8"));
    assert.equal(back[0].speech_sha256, REAL.speech_sha256);
    // import-coefont.mjs は file を import.json のあるフォルダから解決する
    const resolved = path.resolve(path.dirname(p), back[0].file);
    assert.equal(resolved, path.join(exportDir(dir), "anat01-1.mp3"));
  } finally { clean(dir); }
});

test("進捗: 保存して読み戻せる。壊れていたら空から始める", () => {
  const dir = fixture();
  try {
    assert.deepEqual(loadProgress(dir), { done: {} });
    saveProgress({ done: { "anat01-1": { ext: "mp3" } } }, dir);
    assert.equal(loadProgress(dir).done["anat01-1"].ext, "mp3");
    fs.writeFileSync(path.join(dir, "tools", "coefont", "progress.json"), "{壊れたJSON");
    assert.deepEqual(loadProgress(dir), { done: {} });
  } finally { clean(dir); }
});

test("選択子が未記入のままブラウザを開かない（必ず使う項目を文面に並べて止まる）", () => {
  assert.equal(missingTargets().length, 15);   // 既定はすべて未記入
  assert.equal(missingRequired().length, 8);   // うち本番を止めるのは8項目
  const err = caught(() => assertSelectorsReady());
  assert.match(err.message, /未記入/);
  assert.match(err.message, /derive-selectors\.mjs/);
  assert.match(err.message, /voice\.openPicker/);
  // 任意の項目は文面に並べません（埋めなくても本番は回ります）
  assert.ok(!/voice\.confirm/.test(err.message));
});

test("selectors.local.json は既定の表に重なる（名前が違えば黙らず警告）", () => {
  const target = { voice: { openPicker: [] }, export: { download: [] } };
  const f = path.join(os.tmpdir(), `sel-local-${process.pid}.json`);
  fs.writeFileSync(f, JSON.stringify({ candidates: {
    "voice.openPicker": [{ role: "button", name: "声を選ぶ" }],
    "export.download": [],                 // 空は無視
    "nonexistent.target": [{ css: ".x" }], // 知らない名前は無視
  } }), "utf8");
  try {
    const r = applyLocal(target, f);
    assert.equal(r.applied, 1);
    assert.deepEqual(target.voice.openPicker, [{ role: "button", name: "声を選ぶ" }]);
    assert.deepEqual(target.export.download, []);
  } finally { fs.rmSync(f, { force: true }); }
});

test("selectors.local.json が無ければ何もしない", () => {
  const target = { voice: { openPicker: [] } };
  const r = applyLocal(target, path.join(os.tmpdir(), "absent-sel-local.json"));
  assert.deepEqual(r, { applied: 0, file: null });
  assert.deepEqual(target.voice.openPicker, []);
});

/* ───────── 声の一覧は「絞る前の全部」から読む ─────────
   以前ここは locator.toString() を選択子として使い回していて、
   実行すれば必ず落ちる形でした。偽の page で契約を固定します。 */
function fakePage(texts) {
  // 本物の Playwright と同じく、first() は「別の locator」を返します（元を変えません）。
  // 絞った1件には allTextContents がありません。
  const list = {
    _kind: "list",
    first() { return leaf; },
    nth() { return leaf; },
    async allTextContents() { return texts; },
    filter({ hasText }) {
      const n = texts.filter((t) => t.includes(hasText)).length;
      return { async count() { return n; }, async click() { clicks.push(hasText); } };
    },
  };
  const leaf = { _kind: "one", async waitFor() {}, async click() { clicks.push("(絞った1件)"); } };
  const clicks = [];
  return { page: { getByRole: () => list }, clicks };
}

test("声の一覧は絞る前の locator から全名称を読む", async () => {
  const { page } = fakePage(["後藤さん", "ミリアル", "アベレージさん"]);
  const r = await resolve(page, [{ role: "option" }], { label: "voice.resultItem" });
  assert.equal(r.all._kind, "list", "all が絞ったあとのものになっています");
  assert.equal(r.locator._kind, "one", "locator が絞られていません");
  assert.equal(typeof r.locator.allTextContents, "undefined");  // 絞った1件からは読めない
  assert.deepEqual(await r.all.allTextContents(), ["後藤さん", "ミリアル", "アベレージさん"]);
});

test("選ぶのは一覧の中から（画面の他の場所と取り違えない）", async () => {
  const { page, clicks } = fakePage(["後藤さん", "ミリアル"]);
  const r = await resolve(page, [{ role: "option" }], { label: "voice.resultItem" });
  const names = await r.all.allTextContents();
  const chosen = pickVoice(names, "後藤");
  assert.equal(chosen, "後藤さん");
  const hit = r.all.filter({ hasText: chosen });
  assert.equal(await hit.count(), 1);
  await hit.click();
  assert.deepEqual(clicks, ["後藤さん"]);
});
