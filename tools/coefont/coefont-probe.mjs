// =========================================================================
// coefont-probe.mjs   ── 画面を「採寸」します
//
// 保存済みのプロファイルでブラウザを開き、画面にあるボタン・入力欄・
// 選択肢を機械が読み取って JSON と画面写真に書き出します。
// 推測で選択子を書くと初回で外れるため、実物を測ってから書きます。
//
//   node tools/coefont/coefont-probe.mjs
//
// 使い方:
//   開いたブラウザで操作を1手すすめるたびに、この画面で Enter を押してください。
//   押すたびに ui-map-01.json / ui-map-01.png … と連番で記録されます。
//   「新規プロジェクト作成」「声を選ぶ」「台本を入力」「書き出し」の
//   それぞれの段階で1回ずつ押していただけると十分です。
//   終わるときは q と入力して Enter。
// =========================================================================
import path from "node:path";
import fs from "node:fs";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { loadChromium, launchOptions } from "./playwright-resolve.mjs";
import { summarize } from "./ui-summary.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const profileDir = path.join(here, ".profile");
const outDir = path.join(here, "ui-map");
const START_URL = process.env.COEFONT_URL || "https://coefont.cloud/";
const MAX_ELEMENTS = 500; // 記録する要素の上限（巨大ページでの暴走を防ぎます）

if (!fs.existsSync(profileDir)) {
  console.error("プロファイルがありません。先に `node tools/coefont/coefont-login.mjs` を実行してください。");
  process.exit(1);
}

const ask = (q) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); resolve(a.trim()); });
  });

/* ページ内で走らせる採寸関数。操作できる要素を拾い、
   選択子づくりに使える手がかり（文言・aria・data-*・役割）を集めます。 */
const MEASURE = (limit) => {
  const trim = (s, n = 120) => (s || "").replace(/\s+/g, " ").trim().slice(0, n);
  const cssPath = (el) => {
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && parts.length < 6; e = e.parentElement) {
      let p = e.tagName.toLowerCase();
      if (e.id) { parts.unshift(p + "#" + e.id); break; }
      const cls = (e.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 2);
      if (cls.length) p += "." + cls.join(".");
      const sibs = e.parentElement ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName) : [];
      if (sibs.length > 1) p += `:nth-of-type(${sibs.indexOf(e) + 1})`;
      parts.unshift(p);
    }
    return parts.join(" > ");
  };
  const dataAttrs = (el) => {
    const o = {};
    for (const a of el.attributes) if (a.name.startsWith("data-") || a.name.startsWith("aria-")) o[a.name] = trim(a.value, 60);
    return o;
  };
  const SEL = 'button, a[href], input, textarea, select, [role="button"], [role="tab"], [role="menuitem"], [role="option"], [role="combobox"], [contenteditable="true"], summary';
  const seen = new Set();
  const out = [];
  for (const el of document.querySelectorAll(SEL)) {
    if (out.length >= limit) break;
    const r = el.getBoundingClientRect();
    const visible = r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
    const rec = {
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type") || undefined,
      role: el.getAttribute("role") || undefined,
      text: trim(el.innerText || el.value || ""),
      name: el.getAttribute("name") || undefined,
      id: el.id || undefined,
      placeholder: el.getAttribute("placeholder") || undefined,
      title: el.getAttribute("title") || undefined,
      href: el.tagName === "A" ? trim(el.getAttribute("href"), 80) : undefined,
      cls: trim(el.getAttribute("class"), 90) || undefined,
      attrs: Object.keys(dataAttrs(el)).length ? dataAttrs(el) : undefined,
      visible,
      box: visible ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : undefined,
      css: cssPath(el),
    };
    const key = [rec.tag, rec.role, rec.text, rec.css].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    for (const k of Object.keys(rec)) if (rec[k] === undefined) delete rec[k];
    out.push(rec);
  }
  const options = [...document.querySelectorAll("select")].slice(0, 20).map((s) => ({
    name: s.getAttribute("name") || s.id || cssPath(s),
    options: [...s.options].slice(0, 60).map((o) => ({ value: o.value, label: trim(o.textContent, 60) })),
  }));
  return {
    url: location.href,
    title: document.title,
    headings: [...document.querySelectorAll("h1,h2,h3")].slice(0, 30).map((h) => trim(h.innerText, 80)).filter(Boolean),
    iframes: [...document.querySelectorAll("iframe")].map((f) => trim(f.getAttribute("src"), 100)),
    elementCount: out.length,
    elements: out,
    selects: options,
  };
};

const chromium = await loadChromium();
fs.mkdirSync(outDir, { recursive: true });

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

const page = context.pages()[0] || (await context.newPage());
try {
  await page.goto(START_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
} catch (e) {
  console.log(`⚠ ${START_URL} を開けませんでした: ${e.message}（手動で開いてください）`);
}

console.log(`
──────────────────────────────────────────────
 画面の採寸
──────────────────────────────────────────────
ブラウザで1手すすめるたびに、ここで Enter を押してください。
  例) ① 編集画面  ② 新規プロジェクト  ③ 声の一覧  ④ 台本入力  ⑤ 書き出し

書き出し先: ${outDir}
やめるときは q + Enter
`.trim());

let n = 0;
const captured = [];
for (;;) {
  const a = await ask(`\n[${String(n + 1).padStart(2, "0")}] 採寸する段階の画面にしたら Enter（q で終了）> `);
  if (a.toLowerCase() === "q") break;
  n++;
  const tag = String(n).padStart(2, "0");
  try {
    const data = await page.evaluate(MEASURE, MAX_ELEMENTS);
    data.capturedAt = new Date().toISOString();
    data.step = n;
    fs.writeFileSync(path.join(outDir, `ui-map-${tag}.json`), JSON.stringify(data, null, 2) + "\n", "utf8");
    fs.writeFileSync(path.join(outDir, `ui-map-${tag}.txt`), summarize(data), "utf8");
    await page.screenshot({ path: path.join(outDir, `ui-map-${tag}.png`), fullPage: true });
    captured.push(data);
    console.log(`  ✓ ${data.title || "(無題)"} — 操作できる要素 ${data.elementCount} 個`);
    console.log(`    ${data.url}`);
    console.log(`    → ui-map/ui-map-${tag}.json + .txt + .png`);
  } catch (e) {
    console.log(`  ✗ 採寸に失敗しました: ${e.message}`);
  }
}

await context.close();

/* 全段階を1枚にまとめる。これだけチャットに貼れば選択子が書けます。 */
let summaryPath = "";
if (captured.length) {
  const all =
    `# CoeFont 画面の採寸結果（${captured.length} 段階 / ${new Date().toISOString()}）\n` +
    `# このファイルをそのまま貼っていただければ、selectors.js を書けます。\n` +
    `# 個人情報は含みません（文言・aria・id・CSS経路のみ）。念のため目を通してください。\n\n` +
    captured.map(summarize).join("\n");
  summaryPath = path.join(outDir, "summary.txt");
  fs.writeFileSync(summaryPath, all, "utf8");
}

const size = summaryPath ? (fs.statSync(summaryPath).size / 1024).toFixed(1) : "0";
console.log(`
──────────────────────────────────────────────
 採寸おわり（${n} 段階）
──────────────────────────────────────────────
貼り付け用の1枚（${size} KB）:
  ${summaryPath || "（採寸なし）"}

これをそのままチャットに貼っていただければ、選択子を書き込みます。
大きすぎる場合は ui-map/ui-map-NN.txt を段階ごとに貼ってください。
画面写真（.png）は貼れないので、文字で足りなければそのとき仰ってください。
`.trim());
