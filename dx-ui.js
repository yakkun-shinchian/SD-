/*! dx-ui.js — 内科診断支援の画面拡張
 *  LabsUI のフックに、酸塩基平衡の体系的読影・鑑別診断・臨床スコア・出典一覧を差し込む。
 */
(function () {
  "use strict";
  if (typeof LabsUI === "undefined") return;
  var esc = LabsCore.esc, C = LabsCore;

  /* ---------- ① 酸塩基平衡：体系的読影のステップ ---------- */
  LabsUI.addSection(function (x) {
    var A = x.result.derived && x.result.derived.abg;
    if (!A || !A.complete) return "";
    return '<div class="card"><h2>🫁 酸塩基平衡の体系的読影' +
      '<span class="hint">① pH → ② 一次性障害 → ③ 代償 → ④ AG → ⑤ Δ-Δ → ⑥ 酸素化</span></h2>' +
      '<div class="body">' +
      '<div class="abg-summary"><small>総合判定</small>' + esc(A.summary) + "</div>" +
      '<ul class="steps">' + A.steps.map(function (st) {
        return '<li class="' + (st.ok === true ? "ok" : st.ok === false ? "ng" : "") + '">' +
          '<span class="no">' + st.no + "</span>" +
          "<h4>" + esc(st.title) + "</h4>" +
          '<div class="d">' + esc(st.detail) + "</div>" +
          (st.verdict ? '<div class="v">' + esc(st.verdict) + "</div>" : "") +
          (st.caution ? '<div class="caution">⚠ ' + esc(st.caution) + "</div>" : "") +
          "</li>";
      }).join("") + "</ul>" +
      '<div class="refs">計算式の出典：' +
        DXRefs.entries(["WINTER", "FIGGE", "GOLDMARK", "UAG", "BERLIN"]).map(function (r) {
          return '<span title="' + esc(r.cite) + '">' + esc(r.label) + "</span>";
        }).join("、") + "</div>" +
      "</div></div>";
  });

  /* ---------- ② 鑑別診断 ---------- */
  LabsUI.addSection(function (x) {
    if (typeof DXCore === "undefined") return "";
    var list = DXCore.differential(x.result.findings, x.input.values, x.result.derived, x.input.context, { limit: 10 });
    if (!list.length) return "";
    return '<div class="card"><h2>🔬 鑑別診断の候補' +
      '<span class="hint">' + list.length + " 件／合致度は確率ではありません</span></h2><div class=\"body\">" +
      '<p style="font-size:12px;color:var(--dim);margin:0 0 12px">' +
      '合致度は「入力された所見が、その疾患で期待される所見のうちどれだけ揃っているか」を示す指標です。' +
      '疾患の確率ではありません。事前確率と、ここに現れない病歴・身体所見・画像は臨床医が与えてください。</p>' +
      list.map(function (d) {
        var lv = d.fit >= 70 ? "red" : d.fit >= 45 ? "amber" : "info";
        return '<div class="finding ' + lv + '">' +
          "<h3>" + esc(d.name) +
          '<span class="lv">合致度 ' + d.fit + "%</span>" +
          '<span class="cat" style="font-size:10.5px;color:var(--dim);font-weight:700">' + esc(d.cat) + "</span></h3>" +
          '<div class="basis"><b>支持する所見（' + d.supCount + "／" + d.supTotal + "）：</b>" +
            (d.supports.length ? d.supports.map(esc).join(" ／ ") : "なし") + "</div>" +
          (d.opposes.length ? '<div class="basis" style="color:var(--blue)"><b>否定に働く所見：</b>' +
            d.opposes.map(esc).join(" ／ ") + "</div>" : "") +
          (d.pearl ? '<p class="story">💡 ' + esc(d.pearl) + "</p>" : "") +
          (d.next.length ? "<ul>" + d.next.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>" : "") +
          refs(d.refs) +
          "</div>";
      }).join("") + "</div></div>";
  });

  function refs(ids) {
    if (!ids || !ids.length) return "";
    return '<div class="refs">出典：' + DXRefs.entries(ids).map(function (r) {
      return '<span title="' + esc(r.cite) + '">' + esc(r.label) + "</span>";
    }).join("、") + "</div>";
  }

  /* ---------- ③ 臨床スコア ---------- */
  function scoreAnswers(state, def, V, ctx) {
    state.scores = state.scores || {};
    if (state.scores[def.id] === undefined) {
      state.scores[def.id] = def.autofill ? (def.autofill(V, ctx) || {}) : {};
      state.scores[def.id].__auto = true;
    }
    return state.scores[def.id];
  }

  function scoreCard(def, state, V, ctx) {
    var ans = def.direct ? null : scoreAnswers(state, def, V, ctx);
    var r = DXScores.run(def, ans, V, ctx);
    var head = '<h4>' + esc(def.name) + '<span class="cat">' + esc(def.category) + "</span>" +
      (ans && ans.__auto && Object.keys(ans).length > 1 ? '<span class="auto">検査値から自動入力</span>' : "") + "</h4>";
    if (!r) {
      return '<div class="score-card">' + head +
        '<p class="interp" style="color:var(--dim)">算出に必要な検査値が未入力です。</p>' +
        '<p style="font-size:12px;color:var(--dim);margin:0">' + esc(def.note) + "</p>" + refs(def.refs) + "</div>";
    }
    var items = "";
    if (def.items) {
      items = '<div class="score-items">' + def.items.map(function (it) {
        var v = ans[it.key];
        if (it.type === "bool") {
          return '<label class="chip' + (v ? " on" : "") + '" data-score="' + esc(def.id) + '" data-item="' + esc(it.key) + '" data-kind="bool">' +
            '<input type="checkbox"' + (v ? " checked" : "") + "> " + esc(it.label) + "</label>";
        }
        return '<div class="f"><label>' + esc(it.label) + "</label>" +
          '<select data-score="' + esc(def.id) + '" data-item="' + esc(it.key) + '" data-kind="select">' +
          '<option value="">未選択</option>' +
          it.options.map(function (o, i) {
            return '<option value="' + i + '"' + (String(v) === String(i) ? " selected" : "") + ">" +
              esc(o.label) + "（" + (o.points >= 0 ? "+" : "") + o.points + "）</option>";
          }).join("") + "</select></div>";
      }).join("") + "</div>";
    }
    return '<div class="score-card">' + head +
      '<div class="result"><span class="val">' + esc(r.scoreLabel) + "</span>" +
      '<span class="band ' + esc(r.band) + '">' + esc(r.bandLabel) + "</span>" +
      (r.answered != null ? '<span style="font-size:11px;color:var(--dim)">入力 ' + r.answered + "／" + r.itemCount + " 項目</span>" : "") +
      "</div>" +
      '<p class="interp">' + esc(r.interp) + "</p>" +
      (r.actions && r.actions.length ? "<ul style=\"margin:0 0 8px;padding-left:19px;font-size:13px;color:var(--sub)\">" +
        r.actions.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>" : "") +
      (def.items ? '<details><summary style="cursor:pointer;font-size:12px;color:var(--accent);font-weight:700">項目を編集</summary>' +
        '<p style="font-size:12px;color:var(--dim);margin:8px 0">' + esc(def.note) + "</p>" + items + "</details>"
        : '<p style="font-size:12px;color:var(--dim);margin:0">' + esc(def.note) + "</p>") +
      refs(def.refs) + "</div>";
  }

  LabsUI.addSection(function (x) {
    if (typeof DXScores === "undefined") return "";
    var V = x.input.values, ctx = x.input.context, state = x.state;
    var cats = DXScores.categories();
    var body = cats.map(function (cat) {
      var inCat = DXScores.list.filter(function (d) { return d.category === cat; });
      return '<details class="card" style="margin-bottom:10px"><summary>' + esc(cat) +
        '　<span style="font-weight:600;color:var(--dim);font-size:11.5px">' + inCat.length + " 種</span></summary>" +
        '<div class="body">' + inCat.map(function (d) { return scoreCard(d, state, V, ctx); }).join("") + "</div></details>";
    }).join("");
    return '<div class="card"><h2>📐 臨床スコア・重症度分類' +
      '<span class="hint">' + DXScores.list.length + " 種／入力済みの検査値とバイタルから自動入力</span></h2>" +
      '<div class="body">' + body + "</div></div>";
  });

  LabsUI.addBinder(function (root, ui) {
    root.addEventListener("change", function (e) {
      var t = e.target;
      var holder = t.closest("[data-score]");
      if (!holder) return;
      var sid = holder.getAttribute("data-score"), item = holder.getAttribute("data-item");
      var kind = holder.getAttribute("data-kind");
      var st = ui.state;
      st.scores = st.scores || {};
      st.scores[sid] = st.scores[sid] || {};
      if (kind === "bool") {
        st.scores[sid][item] = t.checked;
        holder.classList.toggle("on", t.checked);
      } else {
        st.scores[sid][item] = t.value === "" ? undefined : Number(t.value);
      }
      st.scores[sid].__auto = false;
      LabsUI.save();
      ui.rerender();
    });
  });

  /* ---------- ④ 出典一覧 ---------- */
  LabsUI.addSection(function () {
    if (typeof DXRefs === "undefined") return "";
    var all = DXRefs.all();
    return '<details class="card"><summary>📖 出典一覧（' + all.length + " 件）</summary><div class=\"body\">" +
      '<p style="font-size:12px;color:var(--amber);margin:0 0 10px">' +
      '⚠ 書誌情報は実装時点のものです。臨床判断に用いる前に、必ず原典および最新版のガイドラインで照合してください。</p>' +
      '<table class="tbl"><thead><tr><th>項目</th><th>出典</th></tr></thead><tbody>' +
      all.map(function (r) {
        return "<tr><td style=\"white-space:nowrap\">" + esc(r.label) + "</td><td style=\"font-size:11.5px;color:var(--sub)\">" +
          esc(r.cite) + "</td></tr>";
      }).join("") + "</tbody></table></div></details>";
  });
})();
