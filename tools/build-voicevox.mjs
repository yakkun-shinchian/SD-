// =========================================================================
// build-voicevox.mjs
// data.js / scenes.js から、VOICEVOX用の台本テキストと対応表を書き出すのだ。
// 依存なし。実行: node tools/build-voicevox.mjs
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

const outDir = path.join(root, "voicevox");
fs.mkdirSync(outDir, { recursive: true });

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
fs.writeFileSync(
  path.join(outDir, "narration.txt"),
  rows.map((r) => r.narration).join("\n") + "\n",
  "utf8"
);

// 2) manifest.json
fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(rows, null, 2) + "\n",
  "utf8"
);

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
fs.writeFileSync(path.join(outDir, "manifest.csv"), csv, "utf8");

console.log(`書き出し完了なのだ: ${rows.length} シーン / ${PROGRAMS.length} 番組`);
console.log("  - voicevox/narration.txt");
console.log("  - voicevox/manifest.json");
console.log("  - voicevox/manifest.csv");
