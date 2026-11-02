// =========================================================================
// selectors.js  ── 画面の知識を閉じ込める唯一のファイル
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
// ■ いまの状態：未記入
//   実物を測る前に推測で書くと初回で確実に外れるため、空配列にしてあります。
//   先に `node tools/coefont/coefont-probe.mjs` で採寸し、ui-map/ の内容を
//   見てから埋めます。文言は正規表現も使えます（例 name: /新規|作成/）。
// =========================================================================

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
      `  tools/coefont/selectors.js の該当項目を埋めてください。`
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
    `  \`node tools/coefont/coefont-probe.mjs\` で再採寸し、selectors.js を直してください。`
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
