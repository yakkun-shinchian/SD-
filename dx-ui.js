/*! dx-ui.js — 内科診断支援の画面拡張
 *  LabsUI のフックに、酸塩基平衡の体系的読影・鑑別診断・臨床スコア・出典一覧を差し込む。
 */
(function () {
  "use strict";
  if (typeof LabsUI === "undefined") return;
  var esc = LabsCore.esc, C = LabsCore;

  /* ---------- 入力：音声・貼り付けからの取り込み ---------- */

  var EXAMPLE = "68歳男性、突然発症の胸痛。血圧 96/60、脈110、呼吸24、SpO2 95%、体温36度8。" +
    "ナトリウム138、カリウム4.2、クレアチニン1.4、CRP 8.2、トロポニン0.08、Dダイマー3.5、血小板18万。" +
    "冷汗あり、血圧の左右差あり。ワーファリン内服中。心房細動の既往。";

  function speechAvailable() {
    return typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function intakeState(st) {
    if (!st.intake) st.intake = { text: "", hits: [], notes: [], leftover: "", off: {} };
    return st.intake;
  }

  /** 読み取り結果の確認表。音声認識は必ず誤るので、反映の前に必ずここを通す。 */
  function intakeResultHtml(ik) {
    if (!ik.hits.length && !ik.leftover) return "";
    if (!ik.hits.length) {
      return '<div class="empty">読み取れる項目がありませんでした。' +
        "検査名と数値を続けて（例：ナトリウム 138）言うか、書いてみてください。</div>";
    }
    var rows = ik.hits.map(function (h, i) {
      var val = (h.display !== undefined ? h.display : h.value);
      return '<label class="ik-row' + (ik.off[i] ? " off" : "") + '">' +
        '<input type="checkbox" data-ik="' + i + '"' + (ik.off[i] ? "" : " checked") + ">" +
        '<span class="ik-label">' + esc(h.label) + "</span>" +
        '<span class="ik-val">' + esc(String(val)) + " " + esc(h.unit || "") + "</span>" +
        (h.note ? '<span class="ik-note">' + esc(h.note) + "</span>" : "") +
        '<span class="ik-raw">「' + esc(h.raw) + "」</span></label>";
    }).join("");
    var n = ik.hits.filter(function (_, i) { return !ik.off[i]; }).length;
    return '<div class="ik-result"><h4>読み取った内容（' + n + "／" + ik.hits.length + " 件を反映）</h4>" +
      '<p class="note">音声認識も文字認識も必ず誤ります。<b>反映する前にここで必ず確かめてください。</b>' +
      "違うものはチェックを外せます。</p>" +
      rows +
      (ik.leftover ? '<p class="note">読み取れなかった部分：' + esc(ik.leftover) + "</p>" : "") +
      '<div class="btns"><button class="btn primary" id="ik-apply">この内容を入力欄へ反映する</button></div>' +
      "</div>";
  }

  LabsUI.addInputPanel(function (x) {
    if (typeof DXIntake === "undefined") return "";
    var ik = intakeState(x.state);
    return '<details class="card" id="ik-card" open><summary>🎤 音声・貼り付けで取り込む' +
      '<span class="hint">1項目ずつ打たなくてよい</span></summary><div class="body">' +
      '<p class="note">検査値も所見も、話し言葉のまま入れてください。' +
      "電子カルテからの貼り付け、写真から選んだ文字、PDF から写した文字も同じように読み取ります。</p>" +
      '<div class="btns">' +
      (speechAvailable()
        ? '<button class="btn" id="ik-mic">🎤 話して入力</button>'
        : '<span class="note">この端末のブラウザは音声入力に対応していません（iOS・macOS の Safari、Chrome で使えます）。貼り付けはお使いいただけます。</span>') +
      '<button class="btn" id="ik-parse">読み取る</button>' +
      '<button class="btn" id="ik-example">例を入れる</button>' +
      '<button class="btn" id="ik-reset">消す</button>' +
      "</div>" +
      '<textarea id="ik-text" rows="4" placeholder="' + esc(EXAMPLE) + '">' + esc(ik.text) + "</textarea>" +
      '<div id="ik-result">' + intakeResultHtml(ik) + "</div>" +
      "</div></details>";
  });

  LabsUI.addBinder(function (root, ui) {
    var rec = null, listening = false;

    function paint() {
      var box = root.querySelector("#ik-result");
      if (box) box.innerHTML = intakeResultHtml(intakeState(ui.state));
    }
    function setText(v) {
      intakeState(ui.state).text = v;
      var ta = root.querySelector("#ik-text");
      if (ta && ta.value !== v) ta.value = v;
      LabsUI.save();
    }

    root.addEventListener("input", function (e) {
      if (e.target.id === "ik-text") { intakeState(ui.state).text = e.target.value; LabsUI.save(); }
    });

    root.addEventListener("change", function (e) {
      var cb = e.target.closest("input[data-ik]");
      if (!cb) return;
      var ik = intakeState(ui.state);
      ik.off[cb.getAttribute("data-ik")] = !cb.checked;
      LabsUI.save(); paint();
    });

    root.addEventListener("click", function (e) {
      var id = e.target.id;
      var ik = intakeState(ui.state);

      if (id === "ik-example") { setText(EXAMPLE); return; }
      if (id === "ik-reset") {
        ui.state.intake = { text: "", hits: [], notes: [], leftover: "", off: {} };
        setText(""); LabsUI.save(); paint(); return;
      }
      if (id === "ik-parse") {
        var ta = root.querySelector("#ik-text");
        var r = DXIntake.parse(ta ? ta.value : ik.text);
        ik.text = ta ? ta.value : ik.text;
        ik.hits = r.hits; ik.notes = r.notes; ik.leftover = r.leftover; ik.off = {};
        LabsUI.save(); paint(); return;
      }
      if (id === "ik-apply") {
        var keep = ik.hits.filter(function (_, i) { return !ik.off[i]; });
        if (!keep.length) return;
        var n = DXIntake.apply(keep, ui.state);
        ik.hits = []; ik.leftover = ""; ik.off = {};
        LabsUI.save();
        ui.redraw();
        var out = document.getElementById("lab-result");
        if (out) out.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (id === "ik-mic") {
        var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        if (listening && rec) { rec.stop(); return; }
        rec = new SR();
        rec.lang = "ja-JP";
        rec.continuous = true;
        rec.interimResults = true;
        var fixed = (root.querySelector("#ik-text") || {}).value || "";
        rec.onresult = function (ev) {
          var add = "";
          for (var i = ev.resultIndex; i < ev.results.length; i++) {
            if (ev.results[i].isFinal) fixed += ev.results[i][0].transcript;
            else add += ev.results[i][0].transcript;
          }
          var ta2 = root.querySelector("#ik-text");
          if (ta2) ta2.value = fixed + add;
          intakeState(ui.state).text = fixed;
        };
        rec.onend = function () {
          listening = false;
          var b = root.querySelector("#ik-mic");
          if (b) { b.textContent = "🎤 話して入力"; b.classList.remove("rec"); }
          LabsUI.save();
        };
        rec.onerror = rec.onend;
        try { rec.start(); } catch (err) { return; }
        listening = true;
        var btn = root.querySelector("#ik-mic");
        if (btn) { btn.textContent = "⏹ 話し終わった"; btn.classList.add("rec"); }
      }
    });
  });

  /* ---------- ⓪ 主訴からの診断アプローチ ---------- */

  /** 所見チップ。点灯しているものと、まだ確認されていないものを同じ列に並べる。
   *  未入力を陰性として隠さないことが、このツールの約束。 */
  function chip(x) {
    return '<span class="cc-sig' + (x.on ? " on" : "") + '">' +
      (x.on ? "●" : "○") + " " + esc(x.t) + "</span>";
  }

  function killerHtml(k) {
    return '<div class="cc-killer' + (k.litCount ? " lit" : "") + '">' +
      "<h4>🚨 " + esc(k.name) +
      '<span class="cnt">該当 ' + k.litCount + "／" + k.total + "</span></h4>" +
      '<p class="why">' + esc(k.why) + "</p>" +
      '<div class="cc-sigs">' + k.pointers.map(chip).join("") + "</div>" +
      (k.tests.length ? '<div class="cc-tests"><b>外すためにすること</b><ul>' +
        k.tests.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" : "") +
      refs(k.refs) + "</div>";
  }

  function ddHtml(d) {
    return '<div class="cc-dd' + (d.hitCount ? " hit" : "") + '">' +
      '<h5>' + esc(d.name) + '<span class="cnt">該当 ' + d.hitCount + "／" + d.total + "</span></h5>" +
      (d.hits.length ? '<div class="cc-hits">' + d.hits.map(function (t) {
        return "<span>" + esc(t) + "</span>";
      }).join("") + "</div>" : "") +
      (d.note ? '<p class="note">' + esc(d.note) + "</p>" : "") +
      "</div>";
  }

  function ccCardHtml(c) {
    var litN = c.litFlags.length;
    return '<details class="cc" open><summary>' + esc(c.icon + " " + c.label) +
      (litN ? '<span class="cc-lit">red flag ' + litN + " 件 点灯</span>" : "") + "</summary>" +
      '<div class="cc-body">' +
      '<p class="cc-frame">' + esc(c.frame) + "</p>" +

      '<h3 class="cc-h">まず外す — 時間が命を決める疾患</h3>' +
      c.killers.map(killerHtml).join("") +

      '<h3 class="cc-h">red flag — 点灯しているか、まだ確認していないか</h3>' +
      '<div class="cc-sigs block">' + c.redflags.map(chip).join("") + "</div>" +
      '<p class="note">○ は「所見なし」ではなく「まだ入力・確認されていない」ことを表します。' +
      "患者背景・バイタル・検査値・身体所見を入れるほど、この列は埋まります。</p>" +

      '<h3 class="cc-h">鑑別の地図</h3>' +
      c.groups.map(function (g) {
        return '<div class="cc-grp"><h4>' + esc(g.cat) + "</h4>" +
          g.dds.map(ddHtml).join("") + "</div>";
      }).join("") +

      '<div class="cc-next">' +
      '<div><h4>❓ 次に聞くこと</h4><ul>' +
        c.ask.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" +
      '<div><h4>🔍 次に診ること</h4><ul>' +
        c.exam.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" +
      "</div>" +
      refs(c.refs) +
      "</div></details>";
  }

  LabsUI.addSection(function (x) {
    if (typeof DXCC === "undefined") return "";
    var ctx = x.input.context || {};
    var sel = ctx.complaints || [];
    var cards = DXCC.assess(x.result.findings, x.input.values, x.result.derived, ctx);
    var covered = DXCC.covered();
    var uncovered = sel.filter(function (k) { return covered.indexOf(k) < 0; });

    var head = '<div class="card"><h2>🧭 主訴からの診断アプローチ' +
      '<span class="hint">' + (cards.length ? cards.length + " 件の主訴" : "主訴を選ぶと表示されます") +
      "</span></h2><div class=\"body\">";

    if (!cards.length) {
      return head + '<div class="empty">患者背景の「主訴・症状」を選ぶと、' +
        "その主訴で<b>まず外すべき致死的疾患</b>・<b>red flag の確認表</b>・" +
        "<b>鑑別の地図</b>・<b>次に聞くこと／診ること</b>を提示します。" +
        "問診・身体所見を入力すると、該当する所見が点灯します。</div></div></div>";
    }

    return head +
      '<p style="font-size:12px;color:var(--dim);margin:0 0 12px">' +
      "ここに並ぶのは確率ではありません。<b>その主訴で外してはいけない疾患</b>と、" +
      "<b>現在入力されている所見がそのうちいくつを満たすか</b>を示しています。" +
      "事前確率と、ここに現れない病歴・画像・経過は臨床医が与えてください。</p>" +
      cards.map(ccCardHtml).join("") +
      (uncovered.length ? '<p class="note">※ 選択された主訴のうち、' +
        esc(uncovered.join("・")) + " は主訴別カードを未収載です。</p>" : "") +
      "</div></div>";
  });

  /* ---------- 次に確かめること ---------- */

  LabsUI.addSection(function (x) {
    if (typeof DXNext === "undefined") return "";
    var ctx = x.input.context || {};
    var r;
    try { r = DXNext.suggest(x.result.findings, x.input.values, x.result.derived, ctx, { limit: 10 }); }
    catch (e) { return ""; }
    if (!r.tests.length) return "";

    var head = r.candidates.length
      ? "いま挙がっている候補：" + r.candidates.slice(0, 3).map(function (c) {
          return c.name + "（合致度 " + c.fit + "%）";
        }).join("、")
      : "まだ候補を絞るだけの情報がありません。まず外すべき疾患から確かめます。";

    return '<div class="card"><h2>🔎 次に確かめること' +
      '<span class="hint">' + r.total + " 件のうち、効く順に</span></h2><div class=\"body\">" +
      '<p class="nx-head">' + esc(head) + "</p>" +
      '<p style="font-size:12px;color:var(--dim);margin:0 0 12px">' +
      "ここに出るのは<b>まだ入力・確認されていない</b>ものです。「無い」という意味ではありません。" +
      "項目を押すと入力欄へ移ります。分からないもの・測れないものは飛ばして構いません。" +
      "<b>手元にある情報だけで鑑別は出ます。</b></p>" +
      r.tests.map(function (t) {
        return '<button class="nx-item" data-nx="' + esc(t.key) + '">' +
          '<span class="nx-kind ' + (t.kind === "exam" ? "exam" : "lab") + '">' +
          (t.kind === "exam" ? "診る" : "測る") + "</span>" +
          '<span class="nx-label">' + esc(t.label) +
          (t.unit ? ' <span class="nx-unit">' + esc(t.unit) + "</span>" : "") + "</span>" +
          '<span class="nx-why">' + esc(t.reasons[0] || "") + "</span>" +
          "</button>";
      }).join("") +
      "</div></div>";
  });

  LabsUI.addBinder(function (root) {
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-nx]");
      if (!b) return;
      var key = b.getAttribute("data-nx");
      var el = root.querySelector('[data-lab="' + key + '"]') ||
               root.querySelector('[data-vital="' + key + '"]');
      if (!el) return;
      var card = el.closest("details");
      if (card && !card.open) card.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () { try { el.focus(); } catch (err) { /* noop */ } }, 320);
    });
  });

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
        DXRefs.entries(["WINTER", "FIGGE", "GOLDMARK", "UAG", "BERLIN"]).map(refLink).join("、") + "</div>" +
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

  /** 原典が公開されているものは、書誌だけでなくそこへ飛べるようにする。 */
  function refLink(r) {
    var t = '<span title="' + esc(r.cite) + '">' + esc(r.label) + "</span>";
    return r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + t + " ↗</a>" : t;
  }

  function refs(ids) {
    if (!ids || !ids.length) return "";
    return '<div class="refs">出典：' +
      DXRefs.entries(ids).map(refLink).join("、") + "</div>";
  }

  /* ---------- ③ 臨床スコア ---------- */
  function scoreAnswers(state, def, V, ctx) {
    state.scores = state.scores || {};
    if (state.scores[def.id] === undefined || state.scores[def.id].__auto) {
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
        '<p class="interp" style="color:var(--dim)">未評価：算出に必要な検査値・患者情報が不足しています。</p>' +
        '<p style="font-size:12px;color:var(--dim);margin:0">' + esc(def.note) + "</p>" + refs(def.refs) + "</div>";
    }
    var items = "";
    if (def.items) {
      items = '<div class="score-items">' + def.items.map(function (it) {
        var v = ans[it.key];
        if (it.type === "bool") {
          return '<div class="f"><label>' + esc(it.label) + "</label>" +
            '<select data-score="' + esc(def.id) + '" data-item="' + esc(it.key) + '" data-kind="bool">' +
            '<option value="">未評価</option>' +
            '<option value="false"' + (v === false ? " selected" : "") + '>該当なし（0点）</option>' +
            '<option value="true"' + (v === true ? " selected" : "") + '>該当あり</option></select></div>';
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
      (r.missing && r.missing.length ? '<p class="interp"><b>未評価の項目：</b>' + r.missing.map(esc).join(' ／ ') + '</p>' : '') +
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
        st.scores[sid][item] = t.value === "" ? undefined : t.value === "true";
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
        return "<tr><td style=\"white-space:nowrap\">" + refLink(r) + "</td><td style=\"font-size:11.5px;color:var(--sub)\">" +
          esc(r.cite) + "</td></tr>";
      }).join("") + "</tbody></table></div></details>";
  });
})();
