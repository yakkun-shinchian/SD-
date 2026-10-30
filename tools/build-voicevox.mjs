// =========================================================================
// build-voicevox.mjs
// data.js / scenes.js から、VOICEVOX用の台本テキストと対応表を書き出すのだ。
// 依存なし。実行: node tools/build-voicevox.mjs
// 検査のみ（書き込みなし）: node tools/build-voicevox.mjs --check
//   出力:
//     voicevox/narration.txt … 1行=1ナレーション（VOICEVOXのテキスト読み込み用）
//     voicevox/manifest.json … seq/番組ID/シーン番号/ファイル名/本文の対応表
//     voicevox/manifest.csv  … 同上（表計算ソフト用）
// =========================================================================
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// data.js / scenes.js を読み込む（ブラウザ用のグローバル変数をvmで評価）
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "data.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "scenes.js"), "utf8"), sandbox);
vm.runInContext("this.__P = PROGRAMS; this.__S = SCENES;", sandbox);
const PROGRAMS = sandbox.__P, SCENES = sandbox.__S;

const check = process.argv.includes("--check");
if (process.argv.slice(2).some((arg) => arg !== "--check")) {
  console.error("使い方: node tools/build-voicevox.mjs [--check]");
  process.exit(1);
}
const outDir = path.join(root, "voicevox");
const outputs = new Map();

// 番組順→シーン順で通し番号(seq)を振る。これがVOICEVOXの書き出し順と一致するのだ。
const rows = [];
let seq = 0;
for (const p of PROGRAMS) {
  const scenes = SCENES[p.id] || [];
  scenes.forEach((s, i) => {
    seq++;
    const sceneNo = i + 1;
    const key = `${p.id}-${sceneNo}`; // アプリ側の音声キーと一致
    rows.push({
      seq,
      program_id: p.id,
      scene_no: sceneNo,
      key,
      target_wav: `${key}.wav`,
      category: p.category,
      program_title: p.title,
      heading: s.heading,
      narration: s.narration,
    });
  });
}

// 1) narration.txt（VOICEVOXに読み込ませる本文。1行=1音声アイテム）
outputs.set("narration.txt", rows.map((r) => r.narration).join("\n") + "\n");

// 2) manifest.json
outputs.set("manifest.json", JSON.stringify(rows, null, 2) + "\n");

// 3) manifest.csv
const csvEsc = (v) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const cols = ["seq", "program_id", "scene_no", "key", "target_wav", "category", "program_title", "heading", "narration"];
const csv =
  [cols.join(",")]
    .concat(rows.map((r) => cols.map((c) => csvEsc(r[c])).join(",")))
    .join("\n") + "\n";
outputs.set("manifest.csv", csv);

if (check) {
  const stale = [];
  for (const [name, expected] of outputs) {
    const file = path.join(outDir, name);
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== expected) {
      stale.push(`voicevox/${name}`);
    }
  }
  if (stale.length) {
    console.error(`書き出しが未同期なのだ: ${stale.join(", ")}`);
    console.error("node tools/build-voicevox.mjs を実行して更新するのだ。");
    process.exitCode = 1;
  } else {
    console.log(`整合性OKなのだ: ${rows.length} シーン / 3ファイル`);
  }
} else {
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, content] of outputs) {
    fs.writeFileSync(path.join(outDir, name), content, "utf8");
  }
  console.log(`書き出し完了なのだ: ${rows.length} シーン / ${PROGRAMS.length} 番組`);
  for (const name of outputs.keys()) console.log(`  - voicevox/${name}`);
}
