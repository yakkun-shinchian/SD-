// =========================================================================
// link-audio.mjs
// VOICEVOXで書き出した音声(wav等)を、アプリ用の <番組ID>-<シーン番号> に整列し、
// audio/ にコピーして audio/manifest.js を生成するのだ。依存なし。
//
// 使い方:
//   1) VOICEVOXで voicevox/narration.txt を読み込み、話者を「ずんだもん(ノーマル)」にする
//   2) 「音声書き出し（一括）」で全部書き出す
//   3) 書き出したファイルを voicevox/export/ に入れる（順番=narration.txtの行順のまま）
//   4) node tools/link-audio.mjs
//
//   ※ ファイルは voicevox/manifest.json の順番(seq)に positional で対応づけます。
//     VOICEVOXの一括書き出しは行順に連番が付くので、自然順ソートで一致します。
// =========================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "voicevox", "manifest.json");
const exportDir = path.join(root, "voicevox", "export");
const audioDir = path.join(root, "audio");

if (!fs.existsSync(manifestPath)) {
  console.error("voicevox/manifest.json が無いのだ。先に `node tools/build-voicevox.mjs` を実行してほしいのだ。");
  process.exit(1);
}
if (!fs.existsSync(exportDir)) {
  console.error(`書き出しフォルダが無いのだ: ${exportDir}\nVOICEVOXのwavをここに入れてほしいのだ。`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
fs.mkdirSync(audioDir, { recursive: true });

// 数字を考慮した自然順ソート（001, 002, ... の順に並べる）
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const files = fs
  .readdirSync(exportDir)
  .filter((f) => /\.(wav|mp3|ogg|m4a)$/i.test(f))
  .sort(collator.compare);

if (files.length === 0) {
  console.error("音声ファイルが見つからないのだ（wav/mp3/ogg/m4a）。");
  process.exit(1);
}
if (files.length !== manifest.length) {
  console.warn(`⚠ ファイル数(${files.length}) と シーン数(${manifest.length}) が不一致なのだ。`);
  console.warn("  順番のズレや書き出し漏れがないか確認してほしいのだ。少ない方の数だけ対応づけるのだ。");
}

const map = {};
const n = Math.min(files.length, manifest.length);
for (let i = 0; i < n; i++) {
  const ext = path.extname(files[i]).toLowerCase();
  const dest = `${manifest[i].key}${ext}`;
  fs.copyFileSync(path.join(exportDir, files[i]), path.join(audioDir, dest));
  map[manifest[i].key] = `audio/${dest}`;
}

const js =
  "/* 自動生成: tools/link-audio.mjs。アプリが使う音声ファイルの対応表なのだ。 */\n" +
  "/* { \"番組ID-シーン番号\": \"音声ファイルのパス\" }。空なら端末の読み上げを使うのだ。 */\n" +
  "const AUDIO_FILES = " + JSON.stringify(map, null, 2) + ";\n";
fs.writeFileSync(path.join(audioDir, "manifest.js"), js, "utf8");

console.log(`整列完了なのだ: ${n} 件を audio/ にコピーし、audio/manifest.js を更新したのだ。`);
