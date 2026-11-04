// =========================================================================
// selectors.mjs  ── 画面の知識を閉じ込める唯一のファイル
//
// ■ なぜ1ファイルにまとめるのか
//   ブラウザ自動化が壊れる原因は、ほぼすべて「サイトの模様替え」です。
//   画面に関する知識（当て方・文言・待機条件）をここに集約しておけば、
//   CoeFont が改装したとき直すのはこの1枚だけで、coefont-batch.mjs は
//   無傷で済みます。
//
// ■ なぜ候補を複数持つのか
//   API を使わない決定（2026-11-02）により、ブラウザ自動化が唯一の道に
//   なりました。退路が無いので、1つの目標に対して当て方を複数持ちます。
//   上から順に試し、最初に見つかったものを使います。
//
//     ① { role, name } … 役割＋文言。最も模様替えに強い
//     ② { text }       … 文言そのまま
//     ③ { label } / { placeholder } … 入力欄に有効
//     ④ { testId }     … data-testid があれば頑健
//     ⑤ { css }        … 最後の退避。最も脆い
//
//   ボタンの文字が変わっても ④⑤ が残り、クラス名が変わっても ①② が残ります。
//   全部が同時に外れないと壊れない、という形にしてあります。
//
// ■ いまの状態：既定は未記入、実測は selectors.local.json から
//   推測で書くと初回で確実に外れるため、この表は空のままにしてあります。
//   実際の当て方は採寸結果から起こします。
//
//     node tools/coefont/coefont-probe.mjs       # 採寸（画面を測る）
//     node tools/coefont/derive-selectors.mjs    # 採寸結果 → selectors.local.json
//
//   selectors.local.json があれば、この表に重ねて使います（git 管理外）。
//   手で直しても構いません。消せば既定（未記入）に戻ります。
//   文言は正規表現も使えます（例 name: /新規|作成/）。
// =========================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REQUIRED_TARGETS } from "./derive-selectors.mjs";

const SELECTORS = {
  loggedIn: {
    // ログイン済みと判定できる目印（アカウントメニューなど）
    marker: [],
  },

  project: {
    newButton: [],   // 新規プロジェクトを作るボタン
    editorReady: [], // 編集画面になったと判定できる目印
    nameInput: [],   // プロジェクト名の入力欄（任意）
  },

  voice: {
    openPicker: [],  // 声を選ぶUIを開くボタン
    searchInput: [], // 声を名前で絞り込む検索欄
    resultItem: [],  // 検索結果の各項目
    resultName: [],  // 項目の中で声の名前を示す部分
    confirm: [],     // 選択を確定するボタン（無い場合もあります）
  },

  script: {
    textInput: [],   // 台本を入れる欄
    addLine: [],     // 1行＝1音声として追加するボタン（不要な場合もあります）
    busy: [],        // 生成中を示す目印（待機条件に使います）
  },

  export: {
    download: [],    // 音声を書き出す／ダウンロードするボタン
    downloadAll: [], // 一括書き出しがある場合のボタン
    format: [],      // 書き出し形式の選択（任意）
  },

  // 待機時間（ミリ秒）。採寸して実測値に寄せます。
  timing: {
    navigation: 60000,
    synthesis: 120000,
    settle: 500,
  },
};

/* ───────────────────────────────────────────────────────────────────────
   採寸から起こした上書き（selectors.local.json）を重ねます。
   無ければ何もしません。壊れていたら黙らず警告します。
   ─────────────────────────────────────────────────────────────────────── */
export const LOCAL_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "selectors.local.json");

export function applyLocal(target = SELECTORS, file = LOCAL_PATH) {
  if (!fs.existsSync(file)) return { applied: 0, file: null };
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.warn(`⚠ ${file} が読めません（無視します）: ${e.message}`);
    return { applied: 0, file };
  }
  let applied = 0;
  for (const [dotted, list] of Object.entries(data.candidates || {})) {
    if (!Array.isArray(list) || list.length === 0) continue;
    const keys = dotted.split(".");
    let node = target;
    for (const k of keys.slice(0, -1)) node = node?.[k];
    const last = keys[keys.length - 1];
    if (!node || !Array.isArray(node[last])) {
      console.warn(`⚠ 知らない選択子の名前です（無視します）: ${dotted}`);
      continue;
    }
    node[last] = list;
    applied++;
  }
  return { applied, file };
}

export const localStatus = applyLocal();

export default SELECTORS;

/* ───────────────────────────────────────────────────────────────────────
   候補の配列から、実際に画面にあるものを1つ選びます。
   上から順に試し、見つかったものを返します。全部外れたら、
   「何をどの順で試して、どう外れたか」を添えて例外にします。
   （黙って null を返すと、原因を追うのに何時間もかかります）
   ─────────────────────────────────────────────────────────────────────── */
export async function resolve(page, candidates, opts = {}) {
  const { timeout = 5000, label = "(無名)", requireVisible = true } = opts;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error(
      `選択子が未記入です: ${label}\n` +
      `  先に \`node tools/coefont/coefont-probe.mjs\` で採寸し、\n` +
      `  tools/coefont/selectors.mjs の該当項目を埋めてください。`
    );
  }

  const tried = [];
  for (const c of candidates) {
    let locator = null;
    let how = "";
    try {
      if (c.role) {
        how = `role=${c.role}${c.name ? ` name=${c.name}` : ""}`;
        locator = page.getByRole(c.role, c.name !== undefined ? { name: c.name } : {});
      } else if (c.text !== undefined) {
        how = `text=${c.text}`;
        locator = page.getByText(c.text, c.exact === undefined ? {} : { exact: c.exact });
      } else if (c.label !== undefined) {
        how = `label=${c.label}`;
        locator = page.getByLabel(c.label);
      } else if (c.placeholder !== undefined) {
        how = `placeholder=${c.placeholder}`;
        locator = page.getByPlaceholder(c.placeholder);
      } else if (c.testId !== undefined) {
        how = `testId=${c.testId}`;
        locator = page.getByTestId(c.testId);
      } else if (c.css !== undefined) {
        how = `css=${c.css}`;
        locator = page.locator(c.css);
      } else {
        tried.push("(不正な候補) " + JSON.stringify(c));
        continue;
      }

      if (c.nth !== undefined) locator = locator.nth(c.nth);
      else locator = locator.first();

      await locator.waitFor({ state: requireVisible ? "visible" : "attached", timeout });
      return { locator, how };
    } catch (e) {
      tried.push(`${how} → ${String(e.message || e).split("\n")[0].slice(0, 80)}`);
    }
  }

  throw new Error(
    `画面に見つかりませんでした: ${label}\n` +
    `  試した順:\n` +
    tried.map((t, i) => `    ${i + 1}. ${t}`).join("\n") +
    `\n  CoeFont の画面が変わった可能性があります。\n` +
    `  \`node tools/coefont/coefont-probe.mjs\` で再採寸し、selectors.mjs を直してください。`
  );
}

/* 未記入（空配列）の項目を列挙します。coefont-batch.mjs が起動時に使います。 */
export function missingTargets(obj = SELECTORS, prefix = "") {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) { if (v.length === 0) out.push(p); }
    else if (v && typeof v === "object") out.push(...missingTargets(v, p));
  }
  return out;
}

/* 本番で必ず使う目標のうち、未記入のものだけを返します。
   任意の目標（voice.confirm, script.addLine など）は本番を止めません。 */
export function missingRequired() {
  const all = new Set(missingTargets());
  return REQUIRED_TARGETS.filter((t) => all.has(t));
}
