/*! labs-core.js — 血液検査アセスメント支援 共通基盤
 *  基準値は日本臨床検査標準協議会（JCCLS）共用基準範囲を既定とする。
 *  JCCLS 未収載項目（凝固・自己抗体ほか）は一般的施設値を既定とし facility:true を付す。
 *  依存ゼロ・グローバル公開（ESモジュールではない）。
 */
var LabsCore = (function () {
  "use strict";

  var domains = [];
  var byId = {};

  /* ---------- 小道具 ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function num(v) {
    if (v === "" || v == null) return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }

  function fmt(n, d) {
    if (n == null || !isFinite(n)) return "—";
    return Number(n).toFixed(d == null ? 1 : d);
  }

  function has(ctx, listName, key) {
    var a = ctx && ctx[listName];
    return !!(a && a.indexOf(key) >= 0);
  }

  /* ---------- 基準値の解決 ---------- */

  /** 性別で分かれる基準値を1本に解決する。返り値は [lo, hi] か null。 */
  function resolveRef(analyte, ctx) {
    var r = analyte.ref;
    if (!r) return null;
    if (Array.isArray(r)) return r;
    var sex = (ctx && ctx.sex) === "f" ? "f" : "m";
    return r[sex] || r.m || r.f || null;
  }

  function refText(analyte, ctx) {
    var r = resolveRef(analyte, ctx);
    if (!r) return "";
    var d = analyte.decimals == null ? 1 : analyte.decimals;
    if (r[0] == null) return "〜" + fmt(r[1], d);
    if (r[1] == null) return fmt(r[0], d) + "〜";
    return fmt(r[0], d) + "〜" + fmt(r[1], d);
  }

  /** 値を 'LL' | 'L' | 'N' | 'H' | 'HH' に分類する。HH/LL はパニック値域。 */
  function flagOf(value, analyte, ctx) {
    if (value == null) return null;
    var p = analyte.panic;
    if (p) {
      if (p.low != null && value <= p.low) return "LL";
      if (p.high != null && value >= p.high) return "HH";
    }
    var r = resolveRef(analyte, ctx);
    if (!r) return "N";
    if (r[0] != null && value < r[0]) return "L";
    if (r[1] != null && value > r[1]) return "H";
    return "N";
  }

  var FLAG_LABEL = { LL: "危険域↓", L: "低値", N: "基準内", H: "高値", HH: "危険域↑" };

  /** 基準値からの逸脱の大きさ（倍率）。トリアージの重み付けに使う。 */
  function deviation(value, analyte, ctx) {
    var r = resolveRef(analyte, ctx);
    if (value == null || !r) return 0;
    if (r[1] != null && value > r[1]) return r[1] ? value / r[1] : 0;
    if (r[0] != null && value < r[0]) return r[0] ? -(r[0] / Math.max(value, 1e-6)) : 0;
    return 0;
  }

  /* ---------- レジストリ ---------- */

  function register(domain) {
    if (byId[domain.id]) return;
    domains.push(domain);
    byId[domain.id] = domain;
  }

  function get(id) { return byId[id]; }

  function analyteOf(domainId, key) {
    var d = byId[domainId];
    if (!d) return null;
    for (var i = 0; i < d.analytes.length; i++) {
      if (d.analytes[i].key === key) return d.analytes[i];
    }
    return null;
  }

  /** 全ドメインを横断して analyte 定義を引く。 */
  function findAnalyte(key) {
    for (var i = 0; i < domains.length; i++) {
      var a = analyteOf(domains[i].id, key);
      if (a) return a;
    }
    return null;
  }

  /* ---------- 共通の派生値 ---------- */

  /** 日本人向け eGFR 推算式（日本腎臓学会）。 */
  function egfr(cr, age, sex) {
    if (cr == null || age == null || !cr || !age) return null;
    var v = 194 * Math.pow(cr, -1.094) * Math.pow(age, -0.287);
    return sex === "f" ? v * 0.739 : v;
  }

  /** 補正カルシウム（Payne 式）。Alb 4.0 g/dL 未満のときのみ補正する。 */
  function correctedCa(ca, alb) {
    if (ca == null) return null;
    if (alb == null || alb >= 4.0) return ca;
    return ca + (4.0 - alb);
  }

  /** アニオンギャップ。K を含めない一般式。 */
  function anionGap(na, cl, hco3) {
    if (na == null || cl == null || hco3 == null) return null;
    return na - (cl + hco3);
  }

  /** 血清浸透圧の推算値。測定値との差（浸透圧ギャップ）の評価に使う。 */
  function calcOsm(na, glu, bun) {
    if (na == null) return null;
    return 2 * na + (glu == null ? 0 : glu / 18) + (bun == null ? 0 : bun / 2.8);
  }

  function ratio(a, b) {
    if (a == null || b == null || !b) return null;
    return a / b;
  }

  /* ---------- 評価エンジン ---------- */

  /**
   * 指定ドメインを評価する。
   * input: { context:{...}, values:{key:value} }
   * 返り値: { items[], derived{}, findings{}, patterns[], byDomain{} }
   */
  function evaluate(domainIds, input) {
    var ctx = input.context || {};
    var V = input.values || {};
    var out = { items: [], derived: {}, findings: {}, patterns: [], byDomain: {}, __dedupe: {} };
    var emitted = {}; // 複数ドメインが共有する項目（PLT など）の二重表示を防ぐ

    domainIds.forEach(function (id) {
      var d = byId[id];
      if (!d) return;

      var D = d.derive ? (d.derive(V, ctx) || {}) : {};
      var F = d.findings ? (d.findings(V, D, ctx) || {}) : {};
      var items = [];

      d.analytes.forEach(function (a) {
        if (emitted[a.key]) return;
        var isText = (a.type === "qual" || a.type === "select");
        var v = isText ? null : num(V[a.key]);
        var qual = isText ? (V[a.key] || "") : null;
        if (v == null && !qual) return;
        var flag;
        if (isText) {
          flag = a.positiveWhen ? (a.positiveWhen(qual) ? "H" : "N")
                                : (qual === "陽性" ? "H" : "N");
        } else {
          flag = flagOf(v, a, ctx);
        }
        emitted[a.key] = true;
        items.push({
          domain: id,
          key: a.key,
          label: a.label,
          unit: a.unit || "",
          value: v,
          qual: qual,
          decimals: a.decimals == null ? 1 : a.decimals,
          ref: isText ? (a.refText || "陰性") : refText(a, ctx),
          flag: flag,
          facility: !!a.facility,
          note: a.note || ""
        });
      });

      var pats = [];
      (d.patterns || []).forEach(function (p) {
        if (p.dedupeKey && out.__dedupe[p.dedupeKey]) return;
        var hit = false;
        try { hit = !!p.when(F, V, D, ctx); } catch (e) { hit = false; }
        if (hit) {
          if (p.dedupeKey) out.__dedupe[p.dedupeKey] = true;
          pats.push({
            domain: id, id: p.id, name: p.name, level: p.level || "info",
            basis: p.basis || [], note: p.note || "", actions: p.actions || [],
            refs: p.refs || []
          });
        }
      });

      out.byDomain[id] = { title: d.title, items: items, derived: D, findings: F, patterns: pats };
      out.items = out.items.concat(items);
      out.patterns = out.patterns.concat(pats);
      Object.keys(D).forEach(function (k) { out.derived[k] = D[k]; });
      Object.keys(F).forEach(function (k) { if (F[k]) out.findings[k] = true; });
    });

    return out;
  }

  /* ---------- パニック値の集約 ---------- */

  function panicItems(result) {
    return result.items.filter(function (it) {
      return it.flag === "HH" || it.flag === "LL";
    });
  }

  return {
    esc: esc, num: num, fmt: fmt, has: has,
    register: register, get: get, domains: domains,
    analyteOf: analyteOf, findAnalyte: findAnalyte,
    resolveRef: resolveRef, refText: refText, flagOf: flagOf, deviation: deviation,
    FLAG_LABEL: FLAG_LABEL,
    egfr: egfr, correctedCa: correctedCa, anionGap: anionGap, calcOsm: calcOsm, ratio: ratio,
    evaluate: evaluate, panicItems: panicItems
  };
})();
