// =========================================================================
// derive-selectors.test.mjs
//   採寸結果から選択子を起こす処理を、ブラウザなしで検証します。
//   実行:  node --test tools/coefont/derive-selectors.test.mjs
//
//   ここで使う画面は作り物ですが、形は coefont-probe.mjs の出力そのままです
//   （tag / role / text / placeholder / attrs / cls / visible / box / css）。
// =========================================================================
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deriveSelectors, candidatesFor, roleOf, scoreElement, repeatedCandidates,
  formatReport, RULES, REQUIRED_TARGETS,
} from "./derive-selectors.mjs";

const el = (o) => ({ visible: true, box: { x: 10, y: 10, w: 120, h: 40 }, css: "div > button", ...o });

/* ① トップ画面（ログイン済み）② 編集画面 ③ 声の一覧 */
const STAGES = [
  {
    step: 1, url: "https://coefont.cloud/", title: "CoeFont",
    elements: [
      el({ tag: "a", text: "マイページ", href: "/mypage", css: "header > a" }),
      el({ tag: "a", text: "ログイン", href: "/login", css: "header > a:nth-of-type(2)" }),
      el({ tag: "button", text: "新規プロジェクト", cls: "btn btn-primary", css: "main > button" }),
      el({ tag: "button", text: "プロジェクトを削除", css: "main > button:nth-of-type(2)" }),
    ],
  },
  {
    step: 2, url: "https://coefont.cloud/editor/abc", title: "エディタ | CoeFont",
    elements: [
      el({ tag: "input", type: "text", placeholder: "プロジェクト名", css: "form > input" }),
      el({ tag: "textarea", placeholder: "読み上げるテキストを入力", css: "form > textarea" }),
      el({ tag: "button", text: "声を選ぶ", attrs: { "data-testid": "voice-picker" }, css: "form > button" }),
      el({ tag: "button", text: "音量", css: "form > button:nth-of-type(2)" }),
      el({ tag: "button", text: "ダウンロード", css: "footer > button" }),
      el({ tag: "button", text: "一括ダウンロード", css: "footer > button:nth-of-type(2)" }),
      el({ tag: "button", text: "行を追加", css: "form > button:nth-of-type(3)" }),
    ],
  },
  {
    step: 3, url: "https://coefont.cloud/editor/abc", title: "エディタ | CoeFont",
    elements: [
      el({ tag: "input", type: "search", placeholder: "声を検索", css: "dialog > input" }),
      el({ tag: "div", role: "option", text: "後藤さん", cls: "voice-card", css: "dialog > div:nth-of-type(1)" }),
      el({ tag: "div", role: "option", text: "アベレージさん", cls: "voice-card", css: "dialog > div:nth-of-type(2)" }),
      el({ tag: "div", role: "option", text: "ミリアル", cls: "voice-card", css: "dialog > div:nth-of-type(3)" }),
      el({ tag: "button", text: "決定", css: "dialog > button" }),
      el({ tag: "button", text: "キャンセル", css: "dialog > button:nth-of-type(2)" }),
    ],
  },
];

test("必ず使う8項目が、作り物の画面からすべて埋まる", () => {
  const { candidates, report } = deriveSelectors(STAGES);
  for (const t of REQUIRED_TARGETS) {
    assert.ok(candidates[t]?.length, `${t} が埋まっていません`);
  }
  assert.equal(report.filter((r) => !r.matched && !r.optional).length, 0);
});

test("ログイン済みの目印に「ログイン」ボタンを選ばない", () => {
  const { candidates } = deriveSelectors(STAGES);
  const first = JSON.stringify(candidates["loggedIn.marker"][0]);
  assert.match(first, /マイページ/);
  assert.ok(!/"ログイン"/.test(first));
});

test("新規作成に「削除」を選ばない", () => {
  const { candidates } = deriveSelectors(STAGES);
  assert.match(JSON.stringify(candidates["project.newButton"][0]), /新規/);
});

test("声を選ぶボタンに「音量」を選ばない", () => {
  const { candidates } = deriveSelectors(STAGES);
  const s = JSON.stringify(candidates["voice.openPicker"]);
  assert.match(s, /声を選ぶ/);
  assert.ok(!/音量/.test(s));
});

test("書き出しは単発と一括を取り違えない", () => {
  const { candidates } = deriveSelectors(STAGES);
  assert.deepEqual(candidates["export.download"][0], { role: "button", name: "ダウンロード" });
  assert.match(JSON.stringify(candidates["export.downloadAll"][0]), /一括/);
});

test("台本の欄は textarea を選ぶ（placeholder も候補に残る）", () => {
  const { candidates } = deriveSelectors(STAGES);
  const s = JSON.stringify(candidates["script.textInput"]);
  assert.match(s, /読み上げるテキスト/);
});

test("検索欄は placeholder から当てる", () => {
  const { candidates } = deriveSelectors(STAGES);
  assert.match(JSON.stringify(candidates["voice.searchInput"]), /声を検索/);
});

test("一覧は「同じ形が3つ以上並ぶ」ことで見分ける", () => {
  const r = repeatedCandidates(STAGES);
  assert.ok(r.length);
  assert.deepEqual(r[0].cand, { role: "option" });
  assert.equal(r[0].count, 3);
});

test("ボタンが3つ並んでいるだけの列は一覧とみなさない", () => {
  const junk = [{
    step: 1, url: "u", title: "t",
    elements: [
      el({ tag: "button", text: "ダウンロード", cls: "act", css: "a>b:nth-of-type(1)" }),
      el({ tag: "button", text: "書き出し", cls: "act", css: "a>b:nth-of-type(2)" }),
      el({ tag: "button", text: "検索", cls: "act", css: "a>b:nth-of-type(3)" }),
    ],
  }];
  assert.equal(repeatedCandidates(junk).length, 0);
});

test("候補は頑健な順に並ぶ（役割＋文言 → 文言 → aria → placeholder → testid → CSS）", () => {
  const c = candidatesFor(el({
    tag: "button", text: "声を選ぶ", attrs: { "aria-label": "声の選択", "data-testid": "voice-picker" },
    id: "pick", css: "form > button",
  }));
  assert.deepEqual(c[0], { role: "button", name: "声を選ぶ" });
  assert.deepEqual(c[1], { text: "声を選ぶ" });
  assert.deepEqual(c[2], { label: "声の選択" });
  assert.deepEqual(c[3], { testId: "voice-picker" });
  assert.deepEqual(c.at(-1), { css: "form > button" });
});

test("役割は tag と type から補う", () => {
  assert.equal(roleOf({ tag: "button" }), "button");
  assert.equal(roleOf({ tag: "a" }), "link");
  assert.equal(roleOf({ tag: "textarea" }), "textbox");
  assert.equal(roleOf({ tag: "input", type: "search" }), "textbox");
  assert.equal(roleOf({ tag: "input", type: "checkbox" }), "checkbox");
  assert.equal(roleOf({ tag: "div", role: "option" }), "option");
  assert.equal(roleOf({ tag: "div" }), null);
});

test("見えていない要素は候補にしない", () => {
  const hidden = el({ tag: "button", text: "新規プロジェクト", visible: false });
  assert.equal(scoreElement(hidden, RULES["project.newButton"], { stageIndex: 0, stageCount: 1 }), -1);
});

test("言葉が一つも当たらない要素は候補にしない", () => {
  const far = el({ tag: "button", text: "利用規約" });
  assert.equal(scoreElement(far, RULES["project.newButton"], { stageIndex: 0, stageCount: 1 }), -1);
});

test("文言なしの div は台本欄（contenteditable）として加点される", () => {
  const ce = el({ tag: "div", text: "ここにテキストを入力", css: "form > div" });
  const s = scoreElement(ce, RULES["script.textInput"], { stageIndex: 1, stageCount: 2 });
  assert.ok(s > 0);
});

test("採寸が1段階しかなくても落ちない", () => {
  const { report } = deriveSelectors([STAGES[1]]);
  assert.ok(report.length === Object.keys(RULES).length);
});

test("報告は1目標1行で、埋まらなかった必須項目を名指しする", () => {
  const { report } = deriveSelectors([{ step: 1, url: "u", title: "t", elements: [] }]);
  const text = formatReport(report, [{}]);
  assert.match(text, /✗ loggedIn\.marker/);
  assert.match(text, /－ voice\.confirm/);          // 任意は「－」
  assert.match(text, /この報告を貼って/);
  assert.equal(text.trim().split("\n").length, Object.keys(RULES).length + 3);
});

test("全部埋まれば、次の一手を報告に書く", () => {
  const { report } = deriveSelectors(STAGES);
  assert.match(formatReport(report, STAGES), /--dry-run/);
});
