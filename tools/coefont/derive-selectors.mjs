// =========================================================================
// derive-selectors.mjs  ── 採寸結果から選択子を自動で書き起こす
//
//   node tools/coefont/derive-selectors.mjs
//
// ■ なぜこの道具があるのか
//   選択子は「実物を見てから書く」のが原則です。ところが採寸結果
//   （ui-map/*.json）は先生のパソコンの中にあり、こちらからは読めません。
//   そこで、読む側をこちらに持ってくるのではなく、書き起こす側を
//   先生のパソコンへ持っていきます。推測ではなく実測から起こすので、
//   原則は保ったままです。
//
// ■ やること
//   ui-map/ui-map-*.json を読み、目標ごとに「それらしい要素」を採点して
//   上位を候補に並べ、tools/coefont/selectors.local.json に書きます。
//   selectors.mjs はこの上書きを自動で読み込みます（無ければ従来どおり）。
//
// ■ 出てくる報告は短く作ってあります（1目標1行）。
//   貼っていただければ、外れている所だけこちらで直せます。
// =========================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/* ───────── 目標ごとの手がかり ─────────
   re      … 文言・aria・placeholder・id などに当てる言葉
   reNeg   … 当たったら強く減点する言葉（取り違えが多い所に置きます）
   tags    … その目標らしいタグ
   roles   … その目標らしい役割
   stage   … 採寸のどのあたりに出るか（"early" は前半、"late" は後半）
   optional… 無くても本番が回る目標                                        */
export const RULES = {
  "loggedIn.marker": {
    re: /マイページ|マイ ?ページ|ログアウト|アカウント|プロフィール|会員|my ?page|logout|sign ?out|account|profile|dashboard/i,
    reNeg: /ログイン|サインイン|新規登録|会員登録|log ?in|sign ?in|sign ?up|register/i,
    tags: ["a", "button"],
    stage: "early",
  },
  "project.newButton": {
    re: /新規|新しい|あたらしい|作成|つくる|追加|プロジェクトを作|new|create|add ?project/i,
    reNeg: /削除|消す|キャンセル|delete|remove|cancel/i,
    tags: ["button", "a"],
    stage: "early",
  },
  "project.editorReady": {
    re: /読み上げ|テキスト|台本|本文|入力|セリフ|text|script/i,
    tags: ["textarea", "div"],
    roles: ["textbox"],
    stage: "late",
  },
  "project.nameInput": {
    re: /プロジェクト名|タイトル|題名|名前|project ?name|title/i,
    tags: ["input"],
    needsField: true,
    optional: true,
  },
  "voice.openPicker": {
    re: /声|ボイス|話者|キャラ|コエフォント|voice|speaker|coefont|選ぶ|選択/i,
    reNeg: /音量|速度|ピッチ|抑揚|volume|speed|pitch/i,
    tags: ["button", "a", "div"],
    roles: ["button", "combobox"],
    stage: "late",
  },
  "voice.searchInput": {
    re: /検索|探す|絞り込|search|filter|find/i,
    tags: ["input"],
    needsField: true,
    stage: "late",
  },
  "voice.resultItem": { repeated: true, stage: "late" },
  "voice.resultName": { repeated: true, stage: "late", optional: true },
  "voice.confirm": {
    re: /決定|確定|選択する|この声|適用|OK|完了|apply|select|confirm|done/i,
    reNeg: /キャンセル|閉じる|やめる|cancel|close/i,
    tags: ["button"],
    stage: "late",
    optional: true,
  },
  "script.textInput": {
    re: /読み上げ|テキスト|台本|本文|入力|セリフ|text|script|ここに/i,
    tags: ["textarea", "div"],
    roles: ["textbox"],
    stage: "late",
  },
  "script.addLine": {
    re: /追加|行を|改行|新しい行|add ?line|add ?row|\+/i,
    reNeg: /削除|消す|delete|remove/i,
    tags: ["button"],
    stage: "late",
    optional: true,
  },
  "script.busy": {
    re: /生成中|合成中|処理中|読み込み中|お待ち|loading|processing|generating/i,
    stage: "late",
    optional: true,
  },
  "export.download": {
    re: /ダウンロード|書き出|保存|出力|download|export|save|wav|mp3/i,
    reNeg: /一括|すべて|全て|全部|all/i,
    tags: ["button", "a"],
    stage: "late",
  },
  "export.downloadAll": {
    re: /(一括|すべて|全て|全部|all).{0,8}(ダウンロード|書き出|保存|出力|download|export)|(ダウンロード|書き出|download|export).{0,8}(一括|すべて|全て|all)/i,
    tags: ["button", "a"],
    stage: "late",
    optional: true,
  },
  "export.format": {
    re: /形式|フォーマット|拡張子|format|wav|mp3|m4a/i,
    tags: ["select", "button"],
    stage: "late",
    optional: true,
  },
};

export const REQUIRED_TARGETS = Object.entries(RULES)
  .filter(([, r]) => !r.optional)
  .map(([k]) => k);

/* ───────── 要素から候補をつくる ───────── */
const oneLine = (s, n = 34) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);

export function roleOf(e) {
  if (e.role) return e.role;
  if (e.tag === "button") return "button";
  if (e.tag === "a") return "link";
  if (e.tag === "textarea") return "textbox";
  if (e.tag === "select") return "combobox";
  if (e.tag === "input") {
    const t = String(e.type || "text").toLowerCase();
    if (["text", "search", "email", "url", "tel", "password"].includes(t)) return "textbox";
    if (t === "checkbox") return "checkbox";
    if (t === "radio") return "radio";
    if (["button", "submit", "reset"].includes(t)) return "button";
  }
  return null;
}

/* 当て方を頑健な順に並べます（① 役割＋文言 … ⑤ CSS）。 */
export function candidatesFor(e) {
  const aria = e.attrs?.["aria-label"];
  const testId = e.attrs?.["data-testid"] || e.attrs?.["data-test-id"];
  const name = oneLine(e.text) || oneLine(aria) || oneLine(e.title);
  const role = roleOf(e);
  const out = [];
  if (role && name) out.push({ role, name });
  if (oneLine(e.text)) out.push({ text: oneLine(e.text) });
  if (aria) out.push({ label: oneLine(aria) });
  if (e.placeholder) out.push({ placeholder: oneLine(e.placeholder) });
  if (testId) out.push({ testId: oneLine(testId) });
  if (e.id) out.push({ css: `#${e.id}` });
  if (e.css) out.push({ css: e.css });
  const seen = new Set();
  return out.filter((c) => {
    const k = JSON.stringify(c);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* 入力欄らしさ（placeholder だけの検索欄などを拾うため） */
const isField = (e) => e.tag === "input" || e.tag === "textarea" || roleOf(e) === "textbox";

/* contenteditable の印（新しい採寸にはあります）。
   古い採寸に印は無いので、「役割のない div が採寸対象に入っている」ことを代わりの印にします
   （採寸は button/a/input/textarea/select/role付き/contenteditable だけを拾うため）。 */
const isEditableDiv = (e) => e.editable === true || (e.tag === "div" && !e.role);

export function scoreElement(e, rule, { stageIndex, stageCount }) {
  if (!e.visible) return -1;
  const hay = {
    text: oneLine(e.text, 120),
    aria: oneLine(e.attrs?.["aria-label"], 120),
    ph: oneLine(e.placeholder, 120),
    title: oneLine(e.title, 120),
    meta: [e.id, e.attrs?.["data-testid"], e.name, e.cls, e.href].filter(Boolean).join(" "),
  };
  let s = 0;
  if (rule.re) {
    if (rule.re.test(hay.text)) s += 4;
    if (rule.re.test(hay.aria)) s += 4;
    if (rule.re.test(hay.ph)) s += 3;
    if (rule.re.test(hay.title)) s += 2;
    if (rule.re.test(hay.meta)) s += 1;
    if (s === 0) return -1; // 言葉が一つも当たらないものは候補にしません
  }
  if (rule.reNeg && [hay.text, hay.aria, hay.ph, hay.title].some((h) => rule.reNeg.test(h))) s -= 6;
  if (rule.tags?.includes(e.tag)) s += 2;
  if (rule.roles?.includes(roleOf(e))) s += 2;
  if (rule.needsField && !isField(e)) s -= 5;
  if (isEditableDiv(e) && rule.roles?.includes("textbox")) s += 3;
  // 画面の上の方は見出し・ヘッダ、下の方は操作列になりやすい、ほどの弱い手がかり
  if (e.box && e.box.h > 0 && e.box.h < 80) s += 1;
  const pos = stageCount > 1 ? stageIndex / (stageCount - 1) : 0;
  if (rule.stage === "early") s += (1 - pos) * 1.5;
  if (rule.stage === "late") s += pos * 1.5;
  return s;
}

/* 検索結果の一覧は「同じ見た目の要素が何個も並ぶ」ことで見分けます。 */
export function repeatedCandidates(stages) {
  const best = [];
  stages.forEach((st, i) => {
    const groups = new Map();
    for (const e of (st.elements || []).filter((x) => x.visible)) {
      const role = e.role || "";
      const cls = (e.cls || "").split(/\s+/).filter(Boolean).slice(0, 2).join(".");
      const key = role === "option" || role === "menuitem" ? `role:${role}` : cls ? `cls:${cls}` : "";
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    for (const [key, list] of groups) {
      if (list.length < 3) continue;
      // 操作ボタンが並んでいるだけの列は除きます
      const junk = /ダウンロード|書き出|検索|設定|削除|追加|download|export|search|setting|delete/i;
      if (list.filter((e) => junk.test(oneLine(e.text, 60))).length > list.length / 2) continue;
      const cand = key.startsWith("role:")
        ? { role: key.slice(5) }
        : { css: "." + key.slice(4) };
      best.push({ score: list.length + i, cand, count: list.length, stage: st.step ?? i + 1 });
    }
  });
  best.sort((a, b) => b.score - a.score);
  return best.slice(0, 3);
}

/* ───────── 本体：採寸結果 → 候補一覧＋報告 ───────── */
export function deriveSelectors(stages, { perTarget = 4 } = {}) {
  const candidates = {};
  const report = [];
  const stageCount = stages.length;

  for (const [target, rule] of Object.entries(RULES)) {
    if (rule.repeated) {
      const r = repeatedCandidates(stages);
      if (r.length) {
        candidates[target] = r.map((x) => x.cand);
        report.push({
          target, matched: true, optional: !!rule.optional, stage: r[0].stage,
          how: `${JSON.stringify(r[0].cand)}（同じ形が ${r[0].count} 個）`,
        });
      } else {
        report.push({ target, matched: false, optional: !!rule.optional });
      }
      continue;
    }

    const scored = [];
    stages.forEach((st, i) => {
      for (const e of st.elements || []) {
        const s = scoreElement(e, rule, { stageIndex: i, stageCount });
        if (s > 0) scored.push({ s, e, stage: st.step ?? i + 1 });
      }
    });
    scored.sort((a, b) => b.s - a.s);

    const list = [];
    const seen = new Set();
    for (const { e } of scored.slice(0, 3)) {
      for (const c of candidatesFor(e)) {
        const k = JSON.stringify(c);
        if (seen.has(k)) continue;
        seen.add(k);
        list.push(c);
        if (list.length >= perTarget) break;
      }
      if (list.length >= perTarget) break;
    }

    if (list.length) {
      candidates[target] = list;
      const top = scored[0];
      report.push({
        target, matched: true, optional: !!rule.optional, stage: top.stage,
        how: `${JSON.stringify(list[0])}  ← ${top.e.tag}${top.e.role ? `(${top.e.role})` : ""}「${oneLine(top.e.text) || oneLine(top.e.attrs?.["aria-label"]) || oneLine(top.e.placeholder) || "（文言なし）"}」`,
      });
    } else {
      report.push({ target, matched: false, optional: !!rule.optional });
    }
  }
  return { candidates, report };
}

export function formatReport(report, stages) {
  const L = [];
  L.push(`# 選択子の書き起こし（採寸 ${stages.length} 段階）`);
  for (const r of report) {
    const mark = r.matched ? "✓" : r.optional ? "－" : "✗";
    const tail = r.matched ? `段階${r.stage}  ${r.how}` : r.optional ? "（無くても動きます）" : "見つかりません";
    L.push(`${mark} ${r.target.padEnd(22)} ${tail}`);
  }
  const miss = report.filter((r) => !r.matched && !r.optional);
  L.push("");
  L.push(miss.length
    ? `✗ が ${miss.length} 件あります。この報告を貼っていただければ、こちらで直します。`
    : `必要な項目はすべて埋まりました。次は --dry-run で形を確かめます。`);
  return L.join("\n") + "\n";
}

export function loadStages(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(
      `採寸結果がありません: ${dir}\n` +
      `  先に次を実行してください。\n` +
      `    node tools/coefont/coefont-probe.mjs`
    );
  }
  const files = fs.readdirSync(dir).filter((f) => /^ui-map-\d+\.json$/.test(f)).sort();
  if (!files.length) throw new Error(`${dir} に ui-map-NN.json がありません（採寸をやり直してください）`);
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

export function main() {
  const dir = path.join(here, "ui-map");
  const stages = loadStages(dir);
  const { candidates, report } = deriveSelectors(stages);
  const out = path.join(here, "selectors.local.json");
  fs.writeFileSync(out, JSON.stringify({
    _comment: "derive-selectors.mjs が採寸結果から自動生成。手で直しても構いません。消せば selectors.mjs の既定に戻ります。",
    _generatedAt: new Date().toISOString(),
    _stages: stages.map((s) => ({ step: s.step, url: s.url, title: s.title })),
    candidates,
  }, null, 2) + "\n", "utf8");

  const text = formatReport(report, stages);
  fs.writeFileSync(path.join(dir, "derive-report.txt"), text, "utf8");
  console.log("\n" + text);
  console.log(`書きました: tools/coefont/selectors.local.json`);
  console.log(`報告の控え: tools/coefont/ui-map/derive-report.txt\n`);
  return { candidates, report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.error("\n" + e.message + "\n"); process.exitCode = 1; }
}
