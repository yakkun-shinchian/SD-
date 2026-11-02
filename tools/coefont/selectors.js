// =========================================================================
// selectors.js  ── 画面の知識を閉じ込める唯一のファイル
//
// ■ なぜ1ファイルにまとめるのか
//   ブラウザ自動化が壊れる原因は、ほぼすべて「サイトの模様替え」です。
//   画面に関する知識（CSS選択子・ボタンの文言・待機条件）をここに集約して
//   おけば、CoeFont が改装したとき直すのはこの1枚だけで、
//   coefont-batch.mjs は無傷で済みます。
//
// ■ いまの状態：未記入
//   実物を測る前に推測で書くと、初回で確実に外れます。
//   先に `node tools/coefont/coefont-probe.mjs` で採寸し、
//   ui-map/ の内容を見てから、下の null を埋めます。
//
// ■ 書き方
//   文言で当てるのを第一候補にします（CSSクラスより模様替えに強いため）。
//     text:    page.getByRole('button', { name: ... }) に渡す文言
//     css:     文言で当てられないときの退避用
//     frame:   iframe の中にある場合のみ指定
// =========================================================================

const SELECTORS = {
  // 採寸で確認する項目（null は「まだ測っていない」という意味です）
  loggedIn: {
    // ログイン済みと判定できる目印（アカウントメニューなど）
    marker: null,
  },

  project: {
    // 新規プロジェクトを作るボタン
    newButton: null,
    // 作成後、編集画面になったと判定できる目印
    editorReady: null,
    // プロジェクト名の入力欄（任意）
    nameInput: null,
  },

  voice: {
    // 声を選ぶUIを開くボタン
    openPicker: null,
    // 声を名前で絞り込む検索欄
    searchInput: null,
    // 検索結果の一覧の各項目
    resultItem: null,
    // 項目の中で「声の名前」を示す部分
    resultName: null,
    // 選択を確定するボタン（無い場合もあります）
    confirm: null,
  },

  script: {
    // 台本（読み上げる文章）を入れる欄
    textInput: null,
    // 1行＝1音声として追加するボタン（UI次第で不要な場合もあります）
    addLine: null,
    // 読み上げ中／生成中を示す目印（待機条件に使います）
    busy: null,
  },

  export: {
    // 音声を書き出す／ダウンロードするボタン
    download: null,
    // 一括書き出しがある場合のボタン
    downloadAll: null,
    // 書き出し形式の選択（任意）
    format: null,
  },

  // 一般的な待機時間（ミリ秒）。採寸して実測値に寄せます。
  timing: {
    navigation: 60000,
    synthesis: 120000,
    settle: 500,
  },
};

export default SELECTORS;

/* 未記入の項目が残っているかを調べます（coefont-batch.mjs が起動時に使います）。 */
export function missingKeys(obj = SELECTORS, prefix = "") {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v === null) out.push(p);
    else if (v && typeof v === "object" && !Array.isArray(v)) out.push(...missingKeys(v, p));
  }
  return out;
}
