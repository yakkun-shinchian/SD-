/*! dx-next.js — 「次に何を確かめるか」
 *
 *  診断は一度に決まらない。主訴を聞き、検査を見て、画像を見て、と順に絞っていく。
 *  この層は、いま挙がっている鑑別候補を見比べて、
 *  「まだ分かっていないもののうち、どれを確かめると候補がいちばん動くか」を返す。
 *
 *  設計上の約束：
 *   - 「足りない」とは「まだ入力・確認されていない」こと。陰性であることではない。
 *   - 提案は確率ではなく、「どの候補の、どの支持所見を決められるか」を示すだけ。
 *   - 所見フラグと検査項目の対応表は、手で書かずに実装から導く。
 *     手書きの対応表は、判定を直したときに必ず古くなるため。
 */
var DXNext = (function () {
  "use strict";
  var C = LabsCore;

  var DOMAINS = ["hx", "abg", "cbc", "chem", "coag", "autoab"];

  /* 複数の項目が揃って初めて立つ所見は、単独で値を入れても現れない。
     そのため探索では見つからず、ここだけは明示する。 */
  var COMPOSITE = {
    ag_high: ["na", "cl", "hco3"], ag_low: ["na", "cl", "hco3"],
    hyperchloremic: ["na", "cl", "hco3"],
    metabolic_acidosis: ["ph", "paco2", "hco3"], metabolic_alkalosis: ["ph", "paco2", "hco3"],
    primary_resp_acidosis: ["ph", "paco2", "hco3"], primary_resp_alkalosis: ["ph", "paco2", "hco3"],
    respiratory_acidosis: ["ph", "paco2"], respiratory_alkalosis: ["ph", "paco2"],
    acidemia: ["ph"], alkalemia: ["ph"], severe_acidemia: ["ph"], severe_alkalemia: ["ph"],
    compensation_inadequate: ["ph", "paco2", "hco3"], mixed_disorder: ["ph", "paco2", "hco3"],
    osmgap_high: ["na", "glu", "bun", "sosm"],
    uag_positive: ["una", "uk", "ucl"], uag_negative: ["una", "uk", "ucl"],
    aado2_high: ["pao2", "paco2", "fio2"], resp_failure: ["pao2"],
    ards_range: ["pao2", "fio2"],
    buncr_high: ["bun", "cr"],
    dic_jaam: ["plt", "fdp", "ptpct", "fib"],
    pancytopenia: ["wbc", "hb", "plt"],
    nlr_high: ["wbc", "neut", "lymph"]
  };

  var baseCtx = { age: 60, sex: "m", pregnant: false, vitals: {}, complaints: [], history: [], meds: [] };

  function probeValues(a) {
    /* その項目「だけ」を極端な値にして、どの所見が立つかを見る */
    if (a.type === "select" || a.type === "qual") return (a.options || []).filter(Boolean);
    var r = a.ref;
    var band = Array.isArray(r) && r.length === 2 ? r : (r && r.m ? r.m : null);
    if (!band) return [100, 10000, 0.1, 0];
    var lo = band[0], hi = band[1];
    // 「上昇」の閾値は基準範囲の上限よりずっと高いことがある（BNP 100 など）。
    // 控えめな値だけで試すと、その所見に効く検査を取り逃がす。
    var out = [hi * 3 + 1, hi * 20 + 10, hi * 200 + 100];
    out.push(lo > 0 ? lo * 0.3 : 0);
    out.push(0);
    return out.filter(function (v, i, arr) { return isFinite(v) && arr.indexOf(v) === i; });
  }

  var MAP = null;   // flag → [検査キー]
  function flagMap() {
    if (MAP) return MAP;
    MAP = {};
    var base = C.evaluate(DOMAINS, { values: {}, context: baseCtx }).findings;
    DOMAINS.forEach(function (id) {
      var d = C.get(id);
      if (!d) return;
      d.analytes.forEach(function (a) {
        probeValues(a).forEach(function (v) {
          var vals = {}; vals[a.key] = v;
          var F;
          try { F = C.evaluate(DOMAINS, { values: vals, context: baseCtx }).findings; }
          catch (e) { return; }
          Object.keys(F).forEach(function (flag) {
            if (base[flag]) return;
            (MAP[flag] = MAP[flag] || []);
            if (MAP[flag].indexOf(a.key) < 0) MAP[flag].push(a.key);
          });
        });
      });
    });
    Object.keys(COMPOSITE).forEach(function (flag) {
      MAP[flag] = MAP[flag] || [];
      COMPOSITE[flag].forEach(function (k) {
        if (MAP[flag].indexOf(k) < 0) MAP[flag].push(k);
      });
    });
    return MAP;
  }

  function entered(V, key) {
    var v = V[key];
    return v !== undefined && v !== null && String(v).trim() !== "";
  }

  function describe(key) {
    var a = C.findAnalyte(key);
    if (!a) return { key: key, label: key, kind: "lab", unit: "" };
    var isExam = /^hx_/.test(key);
    return { key: key, label: a.label, unit: a.unit || "",
             kind: isExam ? "exam" : "lab", group: a.group || "" };
  }

  /**
   * いま挙がっている候補を見比べて、次に確かめる価値の高い順に返す。
   * 候補がまだ無いときは、選ばれた主訴の「まず外す疾患」が求める所見を出す。
   */
  function suggest(F, V, D, ctx, opts) {
    opts = opts || {};
    var limit = opts.limit || 8;
    var map = flagMap();
    var want = {};   // 検査キー → { weight, reasons:[] }

    function add(key, w, why) {
      if (!key || entered(V, key)) return;
      var e = want[key] || (want[key] = { weight: 0, reasons: [] });
      e.weight += w;
      if (e.reasons.indexOf(why) < 0 && e.reasons.length < 5) e.reasons.push(why);
    }
    function addFlag(flag, w, why) {
      (map[flag] || []).forEach(function (k) { add(k, w, why); });
    }

    var cands = (typeof DXCore !== "undefined")
      ? DXCore.differential(F, V, D, ctx, { limit: 8 }) : [];
    var byId = {};
    if (typeof DXCore !== "undefined") DXCore.DDX.forEach(function (d) { byId[d.id] = d; });

    cands.forEach(function (c0) {
      var def = byId[c0.id];
      if (!def) return;
      var lift = 1 + c0.fit / 100;      // 合致度の高い候補ほど、決める価値が大きい
      (def.supports || []).forEach(function (x) {
        if (F[x.flag]) return;          // すでに立っている支持所見は確かめ済み
        addFlag(x.flag, x.w * lift, c0.name + "：" + x.label);
      });
      (def.opposes || []).forEach(function (x) {
        if (F[x.flag]) return;
        addFlag(x.flag, x.w * lift * 0.8, c0.name + "を否定しうる：" + x.label);
      });
    });

    /* 主訴の「まず外す疾患」は、候補が挙がっていても必ず数に入れる。
       鑑別エンジンに項目が無い疾患（大動脈解離など）は候補に出てこないため、
       候補だけを見ていると、外してはいけない疾患の検査が提案から落ちる。 */
    if (typeof DXCC !== "undefined") {
      // すでに所見が点き始めている疾患ほど、残りを確かめる価値が大きい。
      // 「いま生きている疑い」を上に出すため、点灯割合で重みを持ち上げる。
      var lit = {};
      try {
        DXCC.assess(F, V, D, ctx).forEach(function (card) {
          card.killers.forEach(function (k) {
            lit[card.key + "/" + k.name] = k.total ? k.litCount / k.total : 0;
          });
        });
      } catch (e) { /* 点灯割合が取れなくても、提案そのものは出す */ }

      (DXCC.list || []).forEach(function (cc) {
        if ((ctx.complaints || []).indexOf(cc.key) < 0) return;
        (cc.killers || []).forEach(function (k) {
          var w = 3 * (1 + 2 * (lit[cc.key + "/" + k.name] || 0));
          (k.pointers || []).forEach(function (p) {
            var flag = (typeof p === "string") ? p : p.f;
            if (!flag || F[flag]) return;
            addFlag(flag, w, cc.label + "／" + k.name + " を外すため");
          });
        });
        (cc.redflags || []).forEach(function (p) {
          var flag = (typeof p === "string") ? p : p.f;
          if (!flag || F[flag]) return;
          addFlag(flag, 2, cc.label + " の red flag");
        });
      });
    }

    var tests = Object.keys(want).map(function (k) {
      var d = describe(k);
      d.weight = Math.round(want[k].weight * 10) / 10;
      d.reasons = want[k].reasons;
      return d;
    }).sort(function (a, b) { return b.weight - a.weight; });

    return {
      tests: tests.slice(0, limit),
      total: tests.length,
      candidates: cands
    };
  }

  return { suggest: suggest, flagMap: flagMap, COMPOSITE: COMPOSITE };
})();
