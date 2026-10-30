// =========================================================================
// build-coefont.mjs
// 先輩・後輩の対話台本から、CoeFont手入力用の読み上げテキストと対応表を
// 書き出すのだ。CoeFontのAPIは使わないのだ（プラン制約のため）。
// ご本人がCoeFont画面で音声を作って、出来たMP3を所定の名前で戻す流れなのだ。
//
// 依存なし。実行:
//   node tools/build-coefont.mjs                  … 台本を自動で探すのだ
//   node tools/build-coefont.mjs exam02-v6-script.json
//
// 出力（coefont/ 配下）:
//   <id>-narration.txt … 1行=1発話。CoeFontに上から順に貼るのだ
//   <id>-manifest.csv  … 連番・ページ・話者・使う声・戻すファイル名・本文
//   <id>-manifest.json … 同上（プログラム用）
// =========================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 話者ごとの声。CoeFontの「お気に入り」から選ぶ正式名称なのだ。
// 勝手に別の声へ置き換えないのだ（coefont-new-project/SKILL.md の原則）。
const VOICES = {
  junior: "汎用式概念χ-soft-v2[最高精度] ¦CV:ろさちゃん Losa-chan -soft",
  senior: "後藤邑子",
};

// 既に作ってある音声を使い回せる定型句なのだ。再生成するとポイントが無駄なのだ。
// 締めのCTAは全教材で同じ音声（md5 c40e954c…）を共有しているのだ。
const REUSE = [
  { speech: "フォローしていただけると励みになります。よろしくお願いします。",
    source: "exam02-v6-voice-13.mp3" },
];

// 台本の形ごとに、発話の並びを取り出すのだ。
// V6: { lessonId, pages:[{ junior, senior, cta? }] }
// V5: { storyboard:[{ page, junior, senior }] }
function readScript(file) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const pages = data.pages || data.storyboard;
  if (!Array.isArray(pages)) return null;

  const base = path.basename(file);
  const id = data.lessonId || base.replace(/-(script|production|dialogue)\.json$/, "");
  const version = /-v5-/.test(base) ? "v5" : "v6";

  const rows = [];
  pages.forEach((page, i) => {
    const pageNo = page.page || i + 1;
    // 1ページ内は 後輩 → 先輩 → (最終ページのみ)CTA の順なのだ。
    // CTAは後輩が話すので、声は後輩と同じなのだ。
    // cta(V6) と closing(V5) は同じ締めの一言なのだ
    for (const [field, speaker] of [["junior", "junior"], ["senior", "senior"],
                                    ["cta", "junior"], ["closing", "junior"]]) {
      const raw = page[field];
      if (!raw) continue;
      rows.push({
        seq: rows.length + 1,
        page: pageNo,
        field,
        speaker,
        voice: VOICES[speaker],
        // 台本の改行はスライド上の見た目用なので、読み上げ文からは外すのだ
        speech: String(raw).replace(/\n/g, ""),
        script_text: raw,
      });
    }
  });
  // id が既に版を含む場合（anat05-v5 など）は二重に付けないのだ
  const stem = id.endsWith(`-${version}`) ? id : `${id}-${version}`;
  let genNo = 0;
  rows.forEach((r) => {
    r.target_mp3 = `${stem}-voice-${String(r.seq).padStart(2, "0")}.mp3`;
    const hit = REUSE.find((x) => x.speech === r.speech);
    r.reuse_from = hit ? hit.source : "";
    r.gen_no = hit ? "" : ++genNo;   // narration.txt の何行目に当たるかなのだ
  });
  return { id, version, stem, file: base, rows };
}

const csvEsc = (v) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const args = process.argv.slice(2);
const targets = args.length
  ? args
  : fs.readdirSync(root)
      .filter((f) => /-(v5-production|v6-script)\.json$/.test(f))
      .sort()
      .map((f) => path.join(root, f));

if (!targets.length) {
  console.error("台本が見つからないのだ（*-v6-script.json / *-v5-production.json）");
  process.exit(1);
}

const outDir = path.join(root, "coefont");
fs.mkdirSync(outDir, { recursive: true });

const cols = ["seq", "gen_no", "page", "speaker", "voice", "target_mp3", "reuse_from", "speech"];
let total = 0;
for (const target of targets) {
  const file = path.isAbsolute(target) ? target : path.join(root, target);
  const parsed = readScript(file);
  if (!parsed) {
    console.error(`  飛ばしたのだ（対応していない形）: ${path.basename(file)}`);
    continue;
  }
  const { id, rows } = parsed;
  // narration.txt には「新規に作る分だけ」を入れるのだ。使い回す分は入れないのだ。
  const toGenerate = rows.filter((r) => !r.reuse_from);
  fs.writeFileSync(path.join(outDir, `${id}-narration.txt`),
    toGenerate.map((r) => r.speech).join("\n") + "\n", "utf8");
  fs.writeFileSync(path.join(outDir, `${id}-manifest.json`),
    JSON.stringify(parsed, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(outDir, `${id}-manifest.csv`),
    [cols.join(",")].concat(rows.map((r) => cols.map((c) => csvEsc(r[c])).join(","))).join("\n") + "\n",
    "utf8");

  const byVoice = {};
  for (const r of toGenerate) byVoice[r.speaker] = (byVoice[r.speaker] || 0) + 1;
  const reused = rows.length - toGenerate.length;
  console.log(`${id}: 全${rows.length}発話 → 新規${toGenerate.length}`
    + `（後輩 ${byVoice.junior || 0} / 先輩 ${byVoice.senior || 0}）`
    + (reused ? ` ＋ 使い回し${reused}` : ""));
  total += toGenerate.length;
}
console.log(`\n書き出し完了なのだ: 新規に作るのは合計 ${total} 発話 → coefont/`);
console.log("narration.txt を上から順にCoeFontで生成して、manifest の target_mp3 の名前で戻してほしいのだ。");
console.log("reuse_from が入っている行は、既にある音声をそのまま使うのだ（作らなくていいのだ）。");
