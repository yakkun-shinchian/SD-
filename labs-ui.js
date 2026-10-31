/*! labs-ui.js — 血液検査アセスメント支援 共通UI
 *  入力フォームの生成、結果の描画、症例プリセット、下書き保存、免責表示を担う。
 *  LabsUI.mount({ domains:['cbc'], integrate:false }) で起動する。
 */
var LabsUI = (function () {
  "use strict";
  var C = LabsCore;
  var esc = C.esc;

  var STORE_KEY = "nursetube-labs-draft-v1";
  var THEME_KEY = "nursetube-labs-theme";
  var AGREE_KEY = "nursetube-labs-agreed-v1";

  var COMPLAINTS = [
    ["fever", "発熱"], ["dyspnea", "呼吸困難"], ["chest_pain", "胸痛"], ["abd_pain", "腹痛"],
    ["bleeding", "出血"], ["consciousness", "意識障害"], ["convulsion", "痙攣"], ["paralysis", "麻痺"],
    ["headache", "頭痛"], ["edema", "浮腫"], ["oliguria", "乏尿"], ["diarrhea", "下痢"],
    ["vomiting", "嘔吐"], ["fatigue", "倦怠感"], ["jaundice", "黄疸"], ["rash", "皮疹"],
    ["joint_pain", "関節痛"], ["numbness", "しびれ"]
  ];
  var HISTORY = [
    ["cirrhosis", "肝硬変"], ["ckd", "慢性腎臓病"], ["dialysis", "透析"], ["dm", "糖尿病"],
    ["htn", "高血圧"], ["hf", "心不全"], ["cad", "虚血性心疾患"], ["af", "心房細動"],
    ["stroke", "脳卒中"], ["neurosurg", "脳神経外科術後"], ["epilepsy", "てんかん"],
    ["copd", "COPD"], ["malignancy", "悪性腫瘍"], ["hematologic", "血液疾患"],
    ["autoimmune", "膠原病"], ["transplant", "臓器移植後"]
  ];
  var MEDS = [
    ["warfarin", "ワルファリン"], ["doac", "DOAC"], ["heparin", "ヘパリン"], ["antiplatelet", "抗血小板薬"],
    ["steroid", "ステロイド"], ["chemo", "化学療法"], ["immunosuppressant", "免疫抑制薬"],
    ["diuretic_loop", "ループ利尿薬"], ["diuretic_thiazide", "サイアザイド"], ["statin", "スタチン"],
    ["ppi", "PPI"], ["nsaid", "NSAIDs"], ["acei_arb", "ACE阻害薬／ARB"],
    ["insulin", "インスリン"], ["su", "SU薬"], ["metformin", "メトホルミン"],
    ["vpa", "バルプロ酸"], ["cbz", "カルバマゼピン"], ["phenytoin", "フェニトイン"],
    ["mannitol", "マンニトール／グリセオール"], ["antithyroid", "抗甲状腺薬"], ["antibiotics", "抗菌薬"]
  ];
  var VITALS = [
    ["bt", "体温", "℃", "36.5", 1], ["sbp", "収縮期血圧", "mmHg", "120", 0],
    ["dbp", "拡張期血圧", "mmHg", "70", 0], ["hr", "心拍数", "/分", "72", 0],
    ["rr", "呼吸数", "/分", "16", 0], ["spo2", "SpO₂", "%", "98", 0]
  ];

  var PAGES = [
    ["dx.html", "内科診断"], ["labs.html", "統括"], ["labs-cbc.html", "血算"], ["labs-chem.html", "生化学"],
    ["labs-coag.html", "凝固"], ["labs-autoab.html", "自己抗体"]
  ];

  var cfg, state, root;
  /* 他モジュール（dx-ui.js 等）が入力パネル・結果セクションを差し込むためのフック */
  var extraInputs = [], extraSections = [], extraBinders = [];
  function addInputPanel(fn) { extraInputs.push(fn); }
  function addSection(fn) { extraSections.push(fn); }
  function addBinder(fn) { extraBinders.push(fn); }
  function api() {
    return { state: state, cfg: cfg, root: root, esc: esc, rerender: schedule, redraw: draw };
  }

  /* ---------- 保存 ---------- */

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* localStorage 不可でも動作を止めない */ }
    return null;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* noop */ }
  }
  function clearSaved() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* noop */ }
  }

  function blankState() {
    return {
      context: { age: "", sex: "m", pregnant: false, vitals: {}, complaints: [], history: [], meds: [] },
      values: {}, scores: {}
    };
  }

  /* ---------- テーマ ---------- */

  function initTheme() {
    var t = "dark";
    try { t = localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { /* noop */ }
    document.documentElement.setAttribute("data-theme", t);
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", cur);
    try { localStorage.setItem(THEME_KEY, cur); } catch (e) { /* noop */ }
  }

  /* ---------- 免責モーダル ---------- */

  function maybeShowDisclaimer() {
    var agreed = false;
    try { agreed = localStorage.getItem(AGREE_KEY) === "1"; } catch (e) { /* noop */ }
    if (agreed) return;
    var m = document.createElement("div");
    m.className = "modal";
    m.innerHTML =
      '<div class="box" role="dialog" aria-modal="true" aria-labelledby="dlg-t">' +
      '<h2 id="dlg-t">ご利用の前に</h2>' +
      '<p>本ツールは看護師の<b>教育・判断補助</b>を目的としたものです。使用前に以下をご確認ください。</p>' +
      '<ul>' +
      '<li><b>診断・治療の決定は医師が行います。</b>本ツールは鑑別の候補を提示するにとどまります。</li>' +
      '<li>基準値は日本臨床検査標準協議会（JCCLS）共用基準範囲を既定としています。実際の判定は<b>自施設の基準値</b>に従ってください。</li>' +
      '<li>パニック値の閾値は<b>各施設の規定</b>が優先されます。</li>' +
      '<li>凝固・自己抗体の基準値は測定系により異なります（「施設依存」と表示）。</li>' +
      '<li>患者氏名・IDは入力しないでください。本ツールは個人情報を扱わない設計です。</li>' +
      '</ul>' +
      '<div class="btns"><button class="btn primary" id="dlg-ok">理解しました</button></div>' +
      '</div>';
    document.body.appendChild(m);
    m.querySelector("#dlg-ok").addEventListener("click", function () {
      try { localStorage.setItem(AGREE_KEY, "1"); } catch (e) { /* noop */ }
      m.remove();
    });
  }

  /* ---------- 画面の骨組み ---------- */

  function headerHtml() {
    var cur = location.pathname.split("/").pop() || "labs.html";
    var nav = PAGES.map(function (p) {
      var a = (p[0] === cur) ? ' aria-current="page"' : "";
      return '<a href="' + p[0] + '"' + a + ">" + esc(p[1]) + "</a>";
    }).join("");
    return '<header class="lab-header">' +
      '<span class="mark">' + esc(cfg.icon || "🧾") + "</span>" +
      "<div><h1>" + esc(cfg.title) + '</h1><div class="sub">' + esc(cfg.subtitle || "") + "</div></div>" +
      '<div class="spacer"></div>' +
      '<nav class="lab-nav">' + nav + "</nav>" +
      '<button class="icon-btn" id="btn-theme">表示切替</button>' +
      "</header>";
  }

  function chipsHtml(name, list, selected) {
    return '<div class="chips">' + list.map(function (p) {
      var on = selected.indexOf(p[0]) >= 0;
      return '<label class="chip' + (on ? " on" : "") + '" data-group="' + name + '" data-key="' + p[0] + '">' +
        '<input type="checkbox"' + (on ? " checked" : "") + "> " + esc(p[1]) + "</label>";
    }).join("") + "</div>";
  }

  function contextHtml() {
    var c = state.context;
    var vitals = VITALS.map(function (v) {
      return '<div class="f"><label>' + esc(v[1]) + ' <span class="unit">' + esc(v[2]) + "</span></label>" +
        '<input type="number" inputmode="decimal" step="any" data-vital="' + v[0] + '" ' +
        'placeholder="' + esc(v[3]) + '" value="' + esc(c.vitals[v[0]] == null ? "" : c.vitals[v[0]]) + '"></div>';
    }).join("");

    return '<details class="card" id="ctx-card" open><summary>👤 患者背景（検査値の読み方を左右します）</summary><div class="body">' +
      '<div class="grp"><div class="grp-title">基本</div><div class="fields">' +
      '<div class="f"><label>年齢 <span class="unit">歳</span></label>' +
      '<input type="number" inputmode="numeric" id="ctx-age" placeholder="65" value="' + esc(c.age) + '"></div>' +
      '<div class="f"><label>性別</label><select id="ctx-sex">' +
      '<option value="m"' + (c.sex === "m" ? " selected" : "") + ">男性</option>" +
      '<option value="f"' + (c.sex === "f" ? " selected" : "") + ">女性</option></select>" +
      '<div class="note">Hb・Cr・尿酸・γ-GT・CK などの基準値が切り替わります</div></div>' +
      '<div class="f"><label>妊娠</label><select id="ctx-preg">' +
      '<option value="">なし</option><option value="1"' + (c.pregnant ? " selected" : "") + ">あり</option></select>" +
      '<div class="note">D-ダイマー・フィブリノゲン・ALP の生理的上昇を考慮します</div></div>' +
      "</div></div>" +
      '<div class="grp"><div class="grp-title">バイタルサイン（qSOFA・SIRS の判定に使います）</div>' +
      '<div class="fields">' + vitals + "</div></div>" +
      '<div class="grp"><div class="grp-title">主訴・症状</div>' + chipsHtml("complaints", COMPLAINTS, c.complaints) + "</div>" +
      '<div class="grp"><div class="grp-title">既往・背景</div>' + chipsHtml("history", HISTORY, c.history) + "</div>" +
      '<div class="grp"><div class="grp-title">内服・投与中の薬剤（検査値の解釈そのものが変わります）</div>' +
      chipsHtml("meds", MEDS, c.meds) + "</div>" +
      "</div></details>";
  }

  function inputsHtml() {
    var seen = {};
    var html = "";
    cfg.domains.forEach(function (id) {
      var d = C.get(id);
      if (!d) return;
      var groups = {};
      d.analytes.forEach(function (a) {
        if (seen[a.key]) return;
        seen[a.key] = true;
        (groups[a.group] = groups[a.group] || []).push(a);
      });
      var inner = (d.groups || Object.keys(groups)).map(function (g) {
        var list = groups[g];
        if (!list || !list.length) return "";
        return '<div class="grp"><div class="grp-title">' + esc(g) + "</div>" +
          '<div class="fields">' + list.map(fieldHtml).join("") + "</div></div>";
      }).join("");
      if (!inner) return;
      var title = cfg.domains.length > 1
        ? esc(d.icon + " " + d.title + "（" + d.subtitle + "）")
        : "🧾 検査値の入力";
      html += '<details class="card" open><summary>' + title + "</summary>" +
              '<div class="body">' + inner + "</div></details>";
    });
    return html;
  }

  function fieldHtml(a) {
    var v = state.values[a.key];
    v = (v == null ? "" : v);
    var fac = a.facility ? ' <span class="fac">施設依存</span>' : "";
    var unit = a.unit ? ' <span class="unit">' + esc(a.unit) + "</span>" : "";
    var ctl;
    if (a.type === "qual" || a.type === "select") {
      ctl = '<select data-lab="' + esc(a.key) + '">' + (a.options || ["", "陰性", "陽性"]).map(function (o) {
        return '<option value="' + esc(o) + '"' + (String(v) === o ? " selected" : "") + ">" +
               esc(o === "" ? "未測定" : o) + "</option>";
      }).join("") + "</select>";
    } else {
      ctl = '<input type="number" inputmode="decimal" step="any" data-lab="' + esc(a.key) + '" ' +
            'placeholder="' + esc(a.placeholder || "") + '" value="' + esc(v) + '">';
    }
    var ref = (a.type === "qual" || a.type === "select")
      ? (a.refText || "陰性") : C.refText(a, state.context);
    return '<div class="f"><label>' + esc(a.label) + unit + fac + "</label>" + ctl +
      '<div class="note">基準 ' + esc(ref) + (a.note ? "／" + esc(a.note) : "") + "</div></div>";
  }

  function presetsHtml() {
    var all = [];
    cfg.domains.forEach(function (id) {
      var d = C.get(id);
      if (!d || !d.presets) return;
      d.presets.forEach(function (p, i) { all.push({ domain: id, idx: i, p: p, d: d }); });
    });
    if (!all.length) return "";
    return '<details class="card"><summary>📚 症例プリセット（動作確認と学習に）</summary><div class="body">' +
      '<div class="preset-list">' + all.map(function (x) {
        return '<button class="preset" data-preset-domain="' + esc(x.domain) + '" data-preset-idx="' + x.idx + '">' +
          "<b>" + esc(x.p.name) + "</b><span>" + esc(x.p.note || "") + "</span></button>";
      }).join("") + "</div></div></details>";
  }

  function toolbarHtml() {
    return '<div class="btns" style="margin-bottom:14px">' +
      '<button class="btn" id="btn-clear">入力をすべてクリア</button>' +
      '<button class="btn" id="btn-print">印刷／PDF保存</button>' +
      "</div>";
  }

  /* ---------- 結果の描画 ---------- */

  function flagBadge(f) {
    if (!f || f === "N") return '<span class="badge N">基準内</span>';
    return '<span class="badge ' + f + '">' + esc(C.FLAG_LABEL[f] || f) + "</span>";
  }

  function itemsTable(items) {
    if (!items.length) return '<div class="empty">検査値が入力されていません。</div>';
    return '<table class="tbl"><thead><tr><th>項目</th><th style="text-align:right">値</th>' +
      "<th>判定</th><th>基準値</th></tr></thead><tbody>" +
      items.map(function (it) {
        var val = it.qual ? esc(it.qual) : (C.fmt(it.value, it.decimals) + " " + esc(it.unit));
        return '<tr class="f-' + esc(it.flag) + '"><td>' + esc(it.label) +
          (it.facility ? ' <span class="fac">施設依存</span>' : "") + "</td>" +
          '<td class="num">' + val + "</td><td>" + flagBadge(it.flag) + "</td>" +
          '<td class="ref">' + esc(it.ref) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  function derivedTable(domainIds, derived) {
    var rows = [];
    domainIds.forEach(function (id) {
      var d = C.get(id);
      if (!d || !d.derivedView) return;
      d.derivedView.forEach(function (dv) {
        var v = derived[dv.key];
        if (v == null || !isFinite(v)) return;
        rows.push('<tr><td>' + esc(dv.label) + '</td><td class="num">' + C.fmt(v, dv.decimals) +
          " " + esc(dv.unit) + '</td><td class="ref">' + esc(dv.ref) + "</td></tr>");
      });
    });
    if (!rows.length) return "";
    return '<div class="card"><h2>🧮 計算で導かれる指標<span class="hint">入力値から自動算出</span></h2>' +
      '<div class="body" style="padding:0"><table class="tbl"><thead><tr><th>指標</th>' +
      '<th style="text-align:right">値</th><th>目安</th></tr></thead><tbody>' +
      rows.join("") + "</tbody></table></div></div>";
  }

  function findingCard(p) {
    return '<div class="finding ' + esc(p.level) + '"><h3>' + esc(p.name) +
      '<span class="lv">' + (p.level === "red" ? "要報告" : p.level === "amber" ? "要注意" : "参考") + "</span></h3>" +
      (p.basis && p.basis.length ? '<div class="basis"><b>根拠：</b>' + p.basis.map(esc).join(" ／ ") + "</div>" : "") +
      (p.story || p.note ? '<p class="story">' + esc(p.story || p.note) + "</p>" : "") +
      (p.actions && p.actions.length ? "<ul>" + p.actions.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>" : "") +
      refsHtml(p.refs) +
      "</div>";
  }

  /** 判定根拠となったガイドライン・原典を所見カードの末尾に出す。 */
  function refsHtml(ids) {
    if (!ids || !ids.length || typeof DXRefs === "undefined") return "";
    var e = DXRefs.entries(ids);
    if (!e.length) return "";
    return '<div class="refs">出典：' + e.map(function (r) {
      return '<span title="' + esc(r.cite) + '">' + esc(r.label) + "</span>";
    }).join("、") + "</div>";
  }

  var LEVEL_ORDER = { red: 0, amber: 1, info: 2 };

  function jaamPanel(derived) {
    var j = derived.jaam;
    if (!j || !j.rows) return "";
    return '<div class="card"><h2>📊 急性期DIC診断基準（日本救急医学会）' +
      '<span class="hint">4点以上でDIC</span></h2><div class="body">' +
      '<table class="score-tbl"><thead><tr><th>項目</th><th>所見</th>' +
      '<th style="text-align:right">点</th></tr></thead><tbody>' +
      j.rows.map(function (r) {
        return "<tr><td>" + esc(r.label) + "</td><td>" + esc(r.detail) + '</td><td class="pt">' +
          (r.point == null ? "—" : r.point) + "</td></tr>";
      }).join("") +
      '</tbody><tfoot><tr><td colspan="2">合計</td><td class="pt">' + j.total + " 点</td></tr></tfoot></table>" +
      '<p style="font-size:12.5px;color:' + (j.dic ? "var(--red)" : "var(--sub)") + ';margin:0">' +
      (j.dic ? "基準を満たします（4点以上）。ただちに医師へ報告してください。"
             : "現時点では基準を満たしません。" +
               (j.measurable < 4 ? "未入力の項目があるため過小評価の可能性があります。" : "")) +
      "</p><p style=\"font-size:11.5px;color:var(--dim);margin:8px 0 0\">" +
      "本実装は絶対値のみで評価しています。実際の基準には「24時間以内の血小板減少率」も含まれるため、" +
      "前回値がある場合は必ず併せて評価してください。</p></div></div>";
  }

  function render() {
    var out = document.getElementById("lab-result");
    if (!out) return;

    var ctx = normContext();
    var input = { context: ctx, values: state.values };
    var result = C.evaluate(cfg.domains, input);
    var html = "";

    if (cfg.integrate) {
      var a = LabsIntegrate.assess(input, result);
      var tag = { red: "緊急度 高", amber: "要注意", green: "緊急所見なし", none: "未入力" }[a.level];
      html += '<div class="triage ' + esc(a.level) + '"><span class="tag">' + esc(tag) + "</span>" +
        '<div class="msg">' + esc(a.headline) + "</div>" +
        (a.reasons.length ? "<ul>" + a.reasons.slice(0, 12).map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>" : "") +
        (cfg.scopeNote ? '<p style="font-size:12px;color:var(--sub);margin:10px 0 0">' + esc(cfg.scopeNote) + "</p>" : "") +
        "</div>";

      if (a.syndromes.length) {
        html += '<div class="card"><h2>🔗 横断症候群 — 組み合わせから見える病態' +
          '<span class="hint">単独項目では見えないもの</span></h2><div class="body">' +
          a.syndromes.slice().sort(function (x, y) { return LEVEL_ORDER[x.level] - LEVEL_ORDER[y.level]; })
            .map(findingCard).join("") + "</div></div>";
      }
      if (a.organs.length) {
        html += '<div class="card"><h2>🗺️ 臓器別の所見マップ</h2><div class="body"><div class="organs">' +
          a.organs.map(function (o) {
            return '<div class="organ"><h4>' + esc(o.icon) + " " + esc(o.label) + "</h4>" +
              '<div class="hits">' + o.hits.map(function (h) { return "<span>" + esc(h) + "</span>"; }).join("") +
              "</div></div>";
          }).join("") + "</div></div></div>";
      }
      if (a.actions.length) {
        html += '<div class="card"><h2>🩺 看護アクション（優先度順）' +
          '<span class="hint">緊急度の高い所見から並べています</span></h2><div class="body" style="padding:0">' +
          '<ul class="actions">' + a.actions.slice(0, 18).map(function (x) {
            return "<li>" + esc(x.text) + '<span class="src">' + esc(x.src) + "</span></li>";
          }).join("") + "</ul></div></div>";
      }
      if (a.missing.length) {
        html += '<div class="card"><h2>🔎 次の一手 — 追加を検討する検査・観察</h2><div class="body">' +
          '<ul class="missing">' + a.missing.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") +
          "</ul></div></div>";
      }
    }

    /* ドメイン内の所見 */
    var pats = result.patterns.slice().sort(function (x, y) { return LEVEL_ORDER[x.level] - LEVEL_ORDER[y.level]; });
    if (pats.length) {
      html += '<div class="card"><h2>🧭 読み取れる所見' +
        '<span class="hint">' + pats.length + " 件</span></h2><div class=\"body\">" +
        pats.map(findingCard).join("") + "</div></div>";
    } else if (result.items.length) {
      html += '<div class="card"><h2>🧭 読み取れる所見</h2><div class="body">' +
        '<div class="empty">特定のパターンには合致しませんでした。個別項目と症状・経過を併せて評価してください。</div>' +
        "</div></div>";
    }

    if (result.derived && result.derived.jaam) html += jaamPanel(result.derived);
    html += derivedTable(cfg.domains, result.derived);

    html += '<div class="card"><h2>📋 入力値の一覧と判定' +
      '<span class="hint">' + result.items.length + " 項目</span></h2>" +
      '<div class="body" style="padding:0">' + itemsTable(result.items) + "</div></div>";

    var ext = { result: result, input: input, state: state, assess: null };
    extraSections.forEach(function (f) {
      try { html += (f(ext) || ""); } catch (e) { /* 一つの拡張の失敗で全体を壊さない */ }
    });

    out.innerHTML = html;
    paintInputs(result);
  }

  /* 入力欄そのものを色付けして、画面を見た瞬間に異常が目に入るようにする */
  function paintInputs(result) {
    var map = {};
    result.items.forEach(function (it) { map[it.key] = it.flag; });
    root.querySelectorAll("input[data-lab]").forEach(function (el) {
      el.classList.remove("v-high", "v-low", "v-panic");
      var f = map[el.getAttribute("data-lab")];
      if (f === "H") el.classList.add("v-high");
      else if (f === "L") el.classList.add("v-low");
      else if (f === "HH" || f === "LL") el.classList.add("v-panic");
    });
  }

  function normContext() {
    var c = state.context;
    return {
      age: C.num(c.age), sex: c.sex === "f" ? "f" : "m", pregnant: !!c.pregnant,
      vitals: c.vitals || {}, complaints: c.complaints || [],
      history: c.history || [], meds: c.meds || []
    };
  }

  /* ---------- イベント ---------- */

  function bind() {
    root.addEventListener("input", function (e) {
      var t = e.target;
      if (t.matches("[data-lab]")) {
        state.values[t.getAttribute("data-lab")] = t.value;
      } else if (t.matches("[data-vital]")) {
        state.context.vitals[t.getAttribute("data-vital")] = t.value;
      } else if (t.id === "ctx-age") {
        state.context.age = t.value;
      } else { return; }
      save(); schedule();
    });

    root.addEventListener("change", function (e) {
      var t = e.target;
      if (t.id === "ctx-sex") state.context.sex = t.value;
      else if (t.id === "ctx-preg") state.context.pregnant = !!t.value;
      else if (t.matches("[data-lab]") && t.tagName === "SELECT") {
        state.values[t.getAttribute("data-lab")] = t.value;
      } else if (t.matches('.chip input')) {
        var lab = t.closest(".chip");
        var g = lab.getAttribute("data-group"), k = lab.getAttribute("data-key");
        var arr = state.context[g] || (state.context[g] = []);
        var i = arr.indexOf(k);
        if (t.checked) { if (i < 0) arr.push(k); } else if (i >= 0) { arr.splice(i, 1); }
        lab.classList.toggle("on", t.checked);
      } else { return; }
      save(); schedule();
    });

    root.addEventListener("click", function (e) {
      var pb = e.target.closest("[data-preset-idx]");
      if (pb) { applyPreset(pb.getAttribute("data-preset-domain"), +pb.getAttribute("data-preset-idx")); return; }
      if (e.target.id === "btn-clear") {
        if (confirm("入力内容をすべて消去します。よろしいですか？")) {
          state = blankState(); clearSaved(); draw();
        }
        return;
      }
      if (e.target.id === "btn-print") { window.print(); return; }
      if (e.target.id === "btn-theme") { toggleTheme(); return; }
    });

    extraBinders.forEach(function (f) { try { f(root, api()); } catch (e) { /* noop */ } });
  }

  function applyPreset(domainId, idx) {
    var d = C.get(domainId);
    if (!d || !d.presets || !d.presets[idx]) return;
    var p = d.presets[idx];
    state = blankState();
    Object.keys(p.values).forEach(function (k) { state.values[k] = p.values[k]; });
    if (p.context) {
      Object.keys(p.context).forEach(function (k) {
        state.context[k] = (k === "vitals") ? Object.assign({}, p.context[k]) : p.context[k];
      });
    }
    save(); draw();
    var r = document.getElementById("lab-result");
    if (r) r.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(render, 160);
  }

  /* ---------- 組み立て ---------- */

  function draw() {
    root.innerHTML = headerHtml() +
      '<div class="lab-wrap">' +
      contextHtml() + inputsHtml() +
      extraInputs.map(function (f) { try { return f(api()) || ""; } catch (e) { return ""; } }).join("") +
      presetsHtml() + toolbarHtml() +
      '<div id="lab-result"></div>' +
      "</div>" +
      '<div class="disclaimer"><b>⚠ 本ツールは教育・判断補助が目的です。</b>' +
      "診断・治療の決定は医師が行います。基準値は JCCLS 共用基準範囲を既定とし、" +
      "パニック値の閾値を含め<b>各施設の規定が優先されます</b>。患者氏名・IDは入力しないでください。</div>";
    render();
  }

  function mount(options) {
    cfg = options || {};
    cfg.domains = cfg.domains || [];
    cfg.title = cfg.title || "検査値アセスメント";
    initTheme();
    state = load() || blankState();
    if (!state.context) state = blankState();
    state.context.vitals = state.context.vitals || {};
    state.context.complaints = state.context.complaints || [];
    state.context.history = state.context.history || [];
    state.context.meds = state.context.meds || [];
    state.values = state.values || {};
    state.scores = state.scores || {};
    root = document.getElementById("app") || document.body;
    draw();
    bind();
    maybeShowDisclaimer();
  }

  return { mount: mount, addInputPanel: addInputPanel, addSection: addSection,
           addBinder: addBinder, save: save, esc: esc };
})();
