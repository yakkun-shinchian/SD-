// =========================================================================
// ui-summary.test.mjs   ブラウザ不要
//   node --test tools/coefont/ui-summary.test.mjs
// =========================================================================
import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize } from "./ui-summary.mjs";

const el = (o) => ({ visible: true, css: "html > body > div > button", ...o });

const sample = {
  step: 2,
  title: "CoeFont 編集画面",
  url: "https://coefont.cloud/editor",
  headings: ["プロジェクト", "声を選ぶ"],
  iframes: ["", "https://example.com/embed"],
  elements: [
    el({ tag: "button", text: "新規プロジェクト" }),
    el({ tag: "button", attrs: { "aria-label": "声をえらぶ" } }),
    el({ tag: "input", type: "search", placeholder: "名前で絞り込む", id: "q" }),
    el({ tag: "div", role: "button", attrs: { "data-testid": "download" } }),
    el({ tag: "span", css: "div.a > div.b > span:nth-of-type(3)" }), // 手がかりが無い
    el({ tag: "button", text: "見えない", visible: false }),
  ],
  selects: [{ name: "format", options: [{ value: "mp3", label: "MP3" }, { value: "wav", label: "WAV" }] }],
};

test("選択子を書くのに要る情報が入る", () => {
  const s = summarize(sample);
  assert.match(s, /## 段階 2 {2}CoeFont 編集画面/);
  assert.match(s, /URL: https:\/\/coefont\.cloud\/editor/);
  assert.match(s, /見出し: プロジェクト \/ 声を選ぶ/);
  assert.match(s, /「新規プロジェクト」/);
  assert.match(s, /aria=声をえらぶ/);
  assert.match(s, /ph=名前で絞り込む/);
  assert.match(s, /#q/);
  assert.match(s, /testid=download/);
  assert.match(s, /input\[search\]/);          // tag と type
  assert.match(s, /div\(button\)/);            // tag と role
  assert.match(s, /select format: MP3 \/ WAV/);
  assert.match(s, /iframe: https:\/\/example\.com\/embed/); // 空文字は落とす
});

test("CSS は「ほかに手がかりが無い要素」にだけ付ける（最も脆いため最後の手段）", () => {
  const s = summarize(sample);
  const lines = s.split("\n").filter((l) => l.startsWith("- "));
  const withCss = lines.filter((l) => l.includes("css:"));
  assert.equal(withCss.length, 1, lines.join("\n"));
  assert.match(withCss[0], /span/);
  assert.match(withCss[0], /div\.a > div\.b/);
  // 文言や id で当てられる要素には付けない
  assert.ok(!lines.find((l) => l.includes("新規プロジェクト") && l.includes("css:")));
  assert.ok(!lines.find((l) => l.includes("#q") && l.includes("css:")));
});

test("見えていない要素は出さない", () => {
  const s = summarize(sample);
  assert.ok(!s.includes("見えない"));
  assert.match(s, /操作できる要素 5 個/); // 6個のうち1個は非表示
});

test("長い値は切り、空白はたたむ（貼れる大きさに保つ）", () => {
  const s = summarize({
    step: 1, url: "u",
    elements: [el({ tag: "button", text: "あ".repeat(200) }), el({ tag: "a", attrs: { "aria-label": "い".repeat(200) } })],
  });
  assert.ok(!s.includes("あ".repeat(41)));
  assert.ok(!s.includes("い".repeat(31)));
  const multi = summarize({ step: 1, url: "u", elements: [el({ tag: "button", text: "改行\n  と   空白" })] });
  assert.match(multi, /「改行 と 空白」/);
});

test("要素が多すぎるときは打ち切って、省いた数を書く", () => {
  const many = { step: 1, url: "u", elements: Array.from({ length: 200 }, (_, i) => el({ tag: "button", text: `B${i}` })) };
  const s = summarize(many, { maxElements: 10 });
  assert.equal(s.split("\n").filter((l) => l.startsWith("- ")).length, 10);
  assert.match(s, /ほか 190 個（多すぎるため省略）/);
  assert.match(s, /操作できる要素 200 個/); // 全体の数は伝える
});

test("空や欠落した入力でも落ちない", () => {
  assert.doesNotThrow(() => summarize({ step: 1, url: "u" }));
  assert.doesNotThrow(() => summarize({ step: 1, url: "u", elements: [], selects: [] }));
  assert.match(summarize({ step: 1, url: "u" }), /操作できる要素 0 個/);
  // 題名が無いときは (無題)
  assert.match(summarize({ step: 1, url: "u" }), /\(無題\)/);
  // 文言も識別子も無い select は出さない
  assert.ok(!summarize({ step: 1, url: "u", selects: [{ name: "x", options: [] }] }).includes("select x"));
});
