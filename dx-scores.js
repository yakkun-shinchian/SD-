/*! dx-scores.js — 臨床スコア・重症度分類
 *  2種類の実装がある：
 *   direct … 入力済みの検査値・バイタルから直接算出（MELD-Na・KDIGO・Light 等）
 *   items  … 臨床所見を選択して算出。可能なものは autofill で検査値から下書きする。
 *  すべてのスコアに原典（DXRefs の ID）を紐づける。
 */
var DXScores = (function () {
  "use strict";
  var C = LabsCore;
  var n = function (v) { return C.num(v); };

  function band(score, cuts) {
    for (var i = 0; i < cuts.length; i++) if (score <= cuts[i][0]) return cuts[i];
    return cuts[cuts.length - 1];
  }
  function vit(ctx, k) { return n((ctx.vitals || {})[k]); }
  function hasH(ctx, k) { return C.has(ctx, "history", k); }

  var SCORES = [

  /* ===================== 感染症・全身 ===================== */
  { id: "qsofa", name: "qSOFA", category: "感染症", refs: ["SEPSIS3"],
    note: "ICU外での敗血症スクリーニング。2点以上で院内死亡リスクが上昇し、臓器障害の評価（SOFA）へ進みます。診断そのものではなく、警戒を引き上げる道具です。",
    items: [
      { key: "rr", label: "呼吸数 ≧22 /分", type: "bool", points: 1 },
      { key: "cns", label: "意識変容（GCS <15）", type: "bool", points: 1 },
      { key: "sbp", label: "収縮期血圧 ≦100 mmHg", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {};
      if (vit(ctx, "rr") != null) a.rr = vit(ctx, "rr") >= 22;
      if (vit(ctx, "sbp") != null) a.sbp = vit(ctx, "sbp") <= 100;
      if (C.has(ctx, "complaints", "consciousness")) a.cns = true;
      return a;
    },
    compute: function (s) {
      return s >= 2
        ? { band: "red", bandLabel: "陽性", interp: "qSOFA 2点以上。感染が疑われる状況なら敗血症を念頭に、臓器障害の評価と初期蘇生を急ぎます。",
            actions: ["血液培養2セット（抗菌薬投与前）", "乳酸値の測定", "SOFA スコアでの臓器障害評価", "初期輸液と抗菌薬のタイミングを確認"] }
        : { band: "green", bandLabel: "陰性", interp: "qSOFA は陰性ですが、感度は高くありません。臨床的に敗血症を疑うなら陰性でも検索を続けます。", actions: [] };
    } },

  { id: "sofa", name: "SOFA スコア", category: "感染症", refs: ["SOFA", "SEPSIS3"],
    note: "6臓器の障害度を 0〜4 点で評価します。Sepsis-3 では、感染に伴う SOFA の2点以上の急上昇をもって敗血症と定義します。",
    items: [
      { key: "resp", label: "呼吸（P/F 比）", type: "select", options: [
        { label: "≧400", points: 0 }, { label: "<400", points: 1 }, { label: "<300", points: 2 },
        { label: "<200（呼吸補助下）", points: 3 }, { label: "<100（呼吸補助下）", points: 4 }] },
      { key: "coag", label: "凝固（血小板 ×10³/µL）", type: "select", options: [
        { label: "≧150", points: 0 }, { label: "<150", points: 1 }, { label: "<100", points: 2 },
        { label: "<50", points: 3 }, { label: "<20", points: 4 }] },
      { key: "liver", label: "肝（総ビリルビン mg/dL）", type: "select", options: [
        { label: "<1.2", points: 0 }, { label: "1.2〜1.9", points: 1 }, { label: "2.0〜5.9", points: 2 },
        { label: "6.0〜11.9", points: 3 }, { label: "≧12.0", points: 4 }] },
      { key: "cv", label: "循環", type: "select", options: [
        { label: "平均血圧 ≧70 mmHg", points: 0 }, { label: "平均血圧 <70 mmHg", points: 1 },
        { label: "ドパミン ≦5 or ドブタミン", points: 2 },
        { label: "ドパミン >5 or ノルアド ≦0.1", points: 3 },
        { label: "ドパミン >15 or ノルアド >0.1", points: 4 }] },
      { key: "cns", label: "中枢神経（GCS）", type: "select", options: [
        { label: "15", points: 0 }, { label: "13〜14", points: 1 }, { label: "10〜12", points: 2 },
        { label: "6〜9", points: 3 }, { label: "<6", points: 4 }] },
      { key: "renal", label: "腎（Cr mg/dL または尿量）", type: "select", options: [
        { label: "<1.2", points: 0 }, { label: "1.2〜1.9", points: 1 }, { label: "2.0〜3.4", points: 2 },
        { label: "3.5〜4.9 または尿量 <500 mL/日", points: 3 },
        { label: "≧5.0 または尿量 <200 mL/日", points: 4 }] }
    ],
    autofill: function (V, ctx) {
      var a = {}, plt = n(V.plt), bil = n(V.tbil), cr = n(V.cr), pf = n(V.pao2) && n(V.fio2) ? n(V.pao2) / n(V.fio2) : null;
      if (pf != null) a.resp = pf >= 400 ? 0 : pf >= 300 ? 1 : pf >= 200 ? 2 : pf >= 100 ? 3 : 4;
      if (plt != null) { var p3 = plt * 10; a.coag = p3 >= 150 ? 0 : p3 >= 100 ? 1 : p3 >= 50 ? 2 : p3 >= 20 ? 3 : 4; }
      if (bil != null) a.liver = bil < 1.2 ? 0 : bil < 2 ? 1 : bil < 6 ? 2 : bil < 12 ? 3 : 4;
      if (cr != null) a.renal = cr < 1.2 ? 0 : cr < 2 ? 1 : cr < 3.5 ? 2 : cr < 5 ? 3 : 4;
      return a;
    },
    compute: function (s) {
      var b = s >= 11 ? { band: "red", bandLabel: "極めて重症" } : s >= 8 ? { band: "red", bandLabel: "重症" }
            : s >= 4 ? { band: "amber", bandLabel: "中等症" } : { band: "green", bandLabel: "軽症" };
      b.interp = "合計 " + s + " 点。感染を背景に前値から2点以上の上昇があれば Sepsis-3 の敗血症に該当します。点数が高いほど院内死亡率が上がります。";
      b.actions = s >= 8 ? ["集中治療管理の適応を検討", "臓器別の支持療法を確認", "経時的な再評価"] : ["経時的な再評価で推移を追う"];
      return b;
    } },

  { id: "curb65", name: "CURB-65", category: "感染症", refs: ["CURB65"],
    note: "市中肺炎の重症度評価。0〜1点は外来治療、2点は入院を考慮、3点以上は重症で ICU 管理も検討します。",
    items: [
      { key: "c", label: "意識障害（Confusion）", type: "bool", points: 1 },
      { key: "u", label: "BUN >19 mg/dL", type: "bool", points: 1 },
      { key: "r", label: "呼吸数 ≧30 /分", type: "bool", points: 1 },
      { key: "b", label: "収縮期血圧 <90 または拡張期血圧 ≦60 mmHg", type: "bool", points: 1 },
      { key: "age", label: "年齢 ≧65 歳", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {};
      if (n(V.bun) != null) a.u = n(V.bun) > 19;
      if (vit(ctx, "rr") != null) a.r = vit(ctx, "rr") >= 30;
      if (vit(ctx, "sbp") != null || vit(ctx, "dbp") != null)
        a.b = (vit(ctx, "sbp") != null && vit(ctx, "sbp") < 90) || (vit(ctx, "dbp") != null && vit(ctx, "dbp") <= 60);
      if (n(ctx.age) != null) a.age = n(ctx.age) >= 65;
      if (C.has(ctx, "complaints", "consciousness")) a.c = true;
      return a;
    },
    compute: function (s) {
      var b = s >= 3 ? { band: "red", bandLabel: "重症" } : s === 2 ? { band: "amber", bandLabel: "中等症" }
            : { band: "green", bandLabel: "軽症" };
      b.interp = s >= 3 ? "重症。入院のうえ ICU 管理の適応も検討します。"
               : s === 2 ? "入院治療を考慮する水準です。" : "外来治療が可能な水準です（社会的要因は別途考慮）。";
      b.actions = s >= 2 ? ["入院適応の判断", "血液培養・喀痰培養・尿中抗原の検討", "酸素化と呼吸数の監視"] : [];
      return b;
    } },

  { id: "adrop", name: "A-DROP", category: "感染症", refs: ["ADROP"],
    note: "日本呼吸器学会による市中肺炎の重症度分類。ショックがあれば点数によらず超重症と扱います。",
    items: [
      { key: "a", label: "年齢（男性 ≧70歳／女性 ≧75歳）", type: "bool", points: 1 },
      { key: "d", label: "脱水（BUN ≧21 mg/dL）", type: "bool", points: 1 },
      { key: "r", label: "SpO₂ ≦90%（または PaO₂ ≦60 mmHg）", type: "bool", points: 1 },
      { key: "o", label: "意識障害", type: "bool", points: 1 },
      { key: "p", label: "収縮期血圧 ≦90 mmHg", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {}, age = n(ctx.age);
      if (age != null) a.a = ctx.sex === "f" ? age >= 75 : age >= 70;
      if (n(V.bun) != null) a.d = n(V.bun) >= 21;
      if (vit(ctx, "spo2") != null || n(V.pao2) != null)
        a.r = (vit(ctx, "spo2") != null && vit(ctx, "spo2") <= 90) || (n(V.pao2) != null && n(V.pao2) <= 60);
      if (vit(ctx, "sbp") != null) a.p = vit(ctx, "sbp") <= 90;
      if (C.has(ctx, "complaints", "consciousness")) a.o = true;
      return a;
    },
    compute: function (s) {
      var b = s >= 4 ? { band: "red", bandLabel: "超重症" } : s === 3 ? { band: "red", bandLabel: "重症" }
            : s >= 1 ? { band: "amber", bandLabel: "中等症" } : { band: "green", bandLabel: "軽症" };
      b.interp = s >= 3 ? "入院（3点は重症、4点以上は ICU 管理を検討）。ショックがあれば点数によらず超重症として扱います。"
               : s >= 1 ? "外来または入院。全身状態で判断します。" : "外来治療が可能な水準です。";
      b.actions = [];
      return b;
    } },

  { id: "mcisaac", name: "McIsaac（修正Centor）スコア", category: "感染症", refs: ["CENTOR"],
    note: "急性咽頭炎における A群β溶血性レンサ球菌の事前確率。抗菌薬の要否判断に使います。",
    items: [
      { key: "fever", label: "体温 >38℃", type: "bool", points: 1 },
      { key: "nocough", label: "咳がない", type: "bool", points: 1 },
      { key: "node", label: "前頸部リンパ節の腫脹・圧痛", type: "bool", points: 1 },
      { key: "tonsil", label: "扁桃の腫脹または滲出物", type: "bool", points: 1 },
      { key: "age", label: "年齢", type: "select", options: [
        { label: "3〜14 歳", points: 1 }, { label: "15〜44 歳", points: 0 }, { label: "45 歳以上", points: -1 }] }
    ],
    autofill: function (V, ctx) {
      var a = {}, age = n(ctx.age);
      if (vit(ctx, "bt") != null) a.fever = vit(ctx, "bt") > 38;
      if (age != null) a.age = age <= 14 ? 0 : age <= 44 ? 1 : 2;
      return a;
    },
    compute: function (s) {
      var b = s >= 4 ? { band: "amber", bandLabel: "高確率" } : s >= 2 ? { band: "info", bandLabel: "中等度" }
            : { band: "green", bandLabel: "低確率" };
      b.interp = s >= 4 ? "迅速抗原検査または培養を行い、陽性なら抗菌薬を検討します。"
               : s >= 2 ? "迅速抗原検査を検討します。" : "細菌性の可能性は低く、抗菌薬は通常不要です。";
      b.actions = [];
      return b;
    } },

  { id: "news2", name: "NEWS2", category: "全身", refs: ["NEWS2"],
    note: "バイタルサインから急変リスクを点数化します。5点以上で緊急の評価、7点以上で救急対応チームの要請が目安です。",
    items: [
      { key: "rr", label: "呼吸数 /分", type: "select", options: [
        { label: "≦8", points: 3 }, { label: "9〜11", points: 1 }, { label: "12〜20", points: 0 },
        { label: "21〜24", points: 2 }, { label: "≧25", points: 3 }] },
      { key: "spo2", label: "SpO₂（スケール1）", type: "select", options: [
        { label: "≧96%", points: 0 }, { label: "94〜95%", points: 1 }, { label: "92〜93%", points: 2 }, { label: "≦91%", points: 3 }] },
      { key: "o2", label: "酸素投与あり", type: "bool", points: 2 },
      { key: "sbp", label: "収縮期血圧 mmHg", type: "select", options: [
        { label: "≦90", points: 3 }, { label: "91〜100", points: 2 }, { label: "101〜110", points: 1 },
        { label: "111〜219", points: 0 }, { label: "≧220", points: 3 }] },
      { key: "hr", label: "心拍数 /分", type: "select", options: [
        { label: "≦40", points: 3 }, { label: "41〜50", points: 1 }, { label: "51〜90", points: 0 },
        { label: "91〜110", points: 1 }, { label: "111〜130", points: 2 }, { label: "≧131", points: 3 }] },
      { key: "cns", label: "意識", type: "select", options: [
        { label: "清明", points: 0 }, { label: "新規の意識変容・傾眠・不穏", points: 3 }] },
      { key: "bt", label: "体温 ℃", type: "select", options: [
        { label: "≦35.0", points: 3 }, { label: "35.1〜36.0", points: 1 }, { label: "36.1〜38.0", points: 0 },
        { label: "38.1〜39.0", points: 1 }, { label: "≧39.1", points: 2 }] }
    ],
    autofill: function (V, ctx) {
      var a = {}, rr = vit(ctx, "rr"), sp = vit(ctx, "spo2"), sbp = vit(ctx, "sbp"), hr = vit(ctx, "hr"), bt = vit(ctx, "bt");
      if (rr != null) a.rr = rr <= 8 ? 0 : rr <= 11 ? 1 : rr <= 20 ? 2 : rr <= 24 ? 3 : 4;
      if (sp != null) a.spo2 = sp >= 96 ? 0 : sp >= 94 ? 1 : sp >= 92 ? 2 : 3;
      if (sbp != null) a.sbp = sbp <= 90 ? 0 : sbp <= 100 ? 1 : sbp <= 110 ? 2 : sbp <= 219 ? 3 : 4;
      if (hr != null) a.hr = hr <= 40 ? 0 : hr <= 50 ? 1 : hr <= 90 ? 2 : hr <= 110 ? 3 : hr <= 130 ? 4 : 5;
      if (bt != null) a.bt = bt <= 35 ? 0 : bt <= 36 ? 1 : bt <= 38 ? 2 : bt <= 39 ? 3 : 4;
      if (C.has(ctx, "complaints", "consciousness")) a.cns = 1;
      return a;
    },
    compute: function (s) {
      var b = s >= 7 ? { band: "red", bandLabel: "高リスク" } : s >= 5 ? { band: "amber", bandLabel: "中リスク" }
            : { band: "green", bandLabel: "低リスク" };
      b.interp = s >= 7 ? "緊急評価の適応。救急対応チーム／集中治療の関与を検討します。"
               : s >= 5 ? "速やかな医師の評価と監視強化が必要です。" : "通常の観察間隔で差し支えない水準です。";
      b.actions = [];
      return b;
    } },

  /* ===================== 循環器 ===================== */
  { id: "chadsvasc", name: "CHA₂DS₂-VASc", category: "循環器", refs: ["CHADSVASC"],
    note: "心房細動における脳梗塞・全身性塞栓症のリスク。抗凝固療法の適応判断に用います。",
    items: [
      { key: "chf", label: "うっ血性心不全／左室機能障害", type: "bool", points: 1 },
      { key: "htn", label: "高血圧", type: "bool", points: 1 },
      { key: "age75", label: "年齢 ≧75 歳", type: "bool", points: 2 },
      { key: "dm", label: "糖尿病", type: "bool", points: 1 },
      { key: "stroke", label: "脳卒中／TIA／血栓塞栓症の既往", type: "bool", points: 2 },
      { key: "vasc", label: "血管疾患（心筋梗塞・末梢動脈疾患・大動脈プラーク）", type: "bool", points: 1 },
      { key: "age65", label: "年齢 65〜74 歳", type: "bool", points: 1 },
      { key: "female", label: "女性", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {}, age = n(ctx.age);
      if (age != null) { a.age75 = age >= 75; a.age65 = age >= 65 && age < 75; }
      a.female = ctx.sex === "f";
      if (hasH(ctx, "hf")) a.chf = true;
      if (hasH(ctx, "htn")) a.htn = true;
      if (hasH(ctx, "dm")) a.dm = true;
      if (hasH(ctx, "stroke")) a.stroke = true;
      if (hasH(ctx, "cad")) a.vasc = true;
      return a;
    },
    compute: function (s) {
      var b = s >= 2 ? { band: "red", bandLabel: "抗凝固を推奨" } : s === 1 ? { band: "amber", bandLabel: "考慮" }
            : { band: "green", bandLabel: "低リスク" };
      b.interp = "合計 " + s + " 点。2点以上（女性のみの1点を除く）で経口抗凝固療法が推奨されます。出血リスク（HAS-BLED）と併せて判断します。";
      b.actions = s >= 2 ? ["抗凝固療法の適応と薬剤選択を確認", "HAS-BLED で出血リスクを評価", "腎機能に応じた DOAC 用量調整"] : [];
      return b;
    } },

  { id: "hasbled", name: "HAS-BLED", category: "循環器", refs: ["HASBLED"],
    note: "抗凝固療法中の大出血リスク。3点以上で高リスクですが、抗凝固を中止する根拠ではなく、是正可能な因子を潰すための道具です。",
    items: [
      { key: "h", label: "高血圧（収縮期 >160 mmHg）", type: "bool", points: 1 },
      { key: "a1", label: "腎機能障害（透析・移植・Cr >2.26 mg/dL）", type: "bool", points: 1 },
      { key: "a2", label: "肝機能障害（肝硬変、Bil >2倍 かつ AST/ALT >3倍）", type: "bool", points: 1 },
      { key: "s", label: "脳卒中の既往", type: "bool", points: 1 },
      { key: "b", label: "出血の既往または素因", type: "bool", points: 1 },
      { key: "l", label: "INR 不安定（TTR 低値）", type: "bool", points: 1 },
      { key: "e", label: "年齢 >65 歳", type: "bool", points: 1 },
      { key: "d1", label: "薬剤（抗血小板薬・NSAIDs）", type: "bool", points: 1 },
      { key: "d2", label: "アルコール多飲（週8単位以上）", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {}, age = n(ctx.age), cr = n(V.cr), sbp = vit(ctx, "sbp");
      if (age != null) a.e = age > 65;
      if (cr != null) a.a1 = cr > 2.26;
      if (sbp != null) a.h = sbp > 160;
      if (hasH(ctx, "cirrhosis")) a.a2 = true;
      if (hasH(ctx, "stroke")) a.s = true;
      if (hasH(ctx, "dialysis")) a.a1 = true;
      if (C.has(ctx, "meds", "antiplatelet") || C.has(ctx, "meds", "nsaid")) a.d1 = true;
      return a;
    },
    compute: function (s) {
      var b = s >= 3 ? { band: "red", bandLabel: "高リスク" } : { band: "green", bandLabel: "低〜中リスク" };
      b.interp = "合計 " + s + " 点。3点以上は大出血の高リスクですが、抗凝固中止の根拠にはなりません。血圧・飲酒・併用薬・INR 管理など是正可能な項目を潰すことが本来の用途です。";
      b.actions = s >= 3 ? ["是正可能な因子（血圧・NSAIDs・飲酒）の確認", "出血徴候の定期評価", "抗凝固の必要性と再評価間隔を確認"] : [];
      return b;
    } },

  { id: "wellsdvt", name: "Wells スコア（深部静脈血栓症）", category: "循環器", refs: ["WELLS_DVT"],
    note: "DVT の事前確率。低確率かつ D-ダイマー陰性なら、画像検査なしに DVT を除外できる水準です。",
    items: [
      { key: "ca", label: "活動性の悪性腫瘍（治療中・6か月以内・緩和治療中）", type: "bool", points: 1 },
      { key: "paralysis", label: "麻痺・不全麻痺・下肢のギプス固定", type: "bool", points: 1 },
      { key: "bed", label: "3日以上の臥床、または12週以内の大手術", type: "bool", points: 1 },
      { key: "tender", label: "深部静脈の走行に沿った圧痛", type: "bool", points: 1 },
      { key: "swell", label: "下肢全体の腫脹", type: "bool", points: 1 },
      { key: "calf", label: "腓腹部周囲径の左右差 >3 cm", type: "bool", points: 1 },
      { key: "edema", label: "患肢に限局した圧痕性浮腫", type: "bool", points: 1 },
      { key: "collateral", label: "表在静脈の側副血行（静脈瘤ではない）", type: "bool", points: 1 },
      { key: "hx", label: "DVT の既往", type: "bool", points: 1 },
      { key: "alt", label: "DVT より可能性の高い他の診断がある", type: "bool", points: -2 }
    ],
    autofill: function (V, ctx) {
      var a = {};
      if (hasH(ctx, "malignancy")) a.ca = true;
      if (C.has(ctx, "complaints", "paralysis")) a.paralysis = true;
      return a;
    },
    compute: function (s) {
      var b = s >= 3 ? { band: "red", bandLabel: "高確率" } : s >= 1 ? { band: "amber", bandLabel: "中確率" }
            : { band: "green", bandLabel: "低確率" };
      b.interp = s >= 3 ? "高確率。下肢静脈エコーを実施します。"
               : s >= 1 ? "中確率。D-ダイマーとエコーを組み合わせて評価します。"
               : "低確率。D-ダイマー陰性なら DVT はほぼ除外できます。";
      b.actions = s >= 1 ? ["D-ダイマーの測定", "下肢静脈エコーの検討"] : ["D-ダイマー陰性の確認"];
      return b;
    } },

  { id: "wellspe", name: "Wells スコア（肺血栓塞栓症）", category: "循環器", refs: ["WELLS_PE"],
    note: "肺塞栓の事前確率。4点以下（PE unlikely）かつ D-ダイマー陰性で除外可能です。",
    items: [
      { key: "dvt", label: "DVT の臨床症状・徴候", type: "select", options: [{ label: "なし", points: 0 }, { label: "あり", points: 3 }] },
      { key: "alt", label: "PE より可能性の高い他の診断がない", type: "select", options: [{ label: "他診断が濃厚", points: 0 }, { label: "PE が最も濃厚", points: 3 }] },
      { key: "hr", label: "心拍数 >100 /分", type: "select", options: [{ label: "なし", points: 0 }, { label: "あり", points: 1.5 }] },
      { key: "immob", label: "4週以内の手術または3日以上の固定", type: "select", options: [{ label: "なし", points: 0 }, { label: "あり", points: 1.5 }] },
      { key: "hx", label: "DVT／PE の既往", type: "select", options: [{ label: "なし", points: 0 }, { label: "あり", points: 1.5 }] },
      { key: "hemo", label: "喀血", type: "bool", points: 1 },
      { key: "ca", label: "悪性腫瘍（治療中・6か月以内・緩和治療中）", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {};
      if (vit(ctx, "hr") != null) a.hr = vit(ctx, "hr") > 100 ? 1 : 0;
      if (hasH(ctx, "malignancy")) a.ca = true;
      return a;
    },
    compute: function (s) {
      var b = s > 6 ? { band: "red", bandLabel: "高確率" } : s >= 2 ? { band: "amber", bandLabel: "中確率" }
            : { band: "green", bandLabel: "低確率" };
      b.interp = "合計 " + s + " 点。2分類では 4点超を PE likely として造影CT へ、4点以下は D-ダイマーで振り分けます。";
      b.actions = s > 4 ? ["造影CT 肺動脈撮影の検討", "心エコーで右心負荷を評価", "酸素化と循環動態の監視"]
                        : ["D-ダイマーの測定（陰性なら除外可）"];
      return b;
    } },

  { id: "spesi", name: "簡易版 PESI", category: "循環器", refs: ["SPESI"],
    note: "確定した肺塞栓の30日死亡リスク。0点なら低リスクで外来管理も選択肢に入ります。",
    items: [
      { key: "age", label: "年齢 >80 歳", type: "bool", points: 1 },
      { key: "ca", label: "悪性腫瘍", type: "bool", points: 1 },
      { key: "cp", label: "慢性心肺疾患（心不全・慢性肺疾患）", type: "bool", points: 1 },
      { key: "hr", label: "心拍数 ≧110 /分", type: "bool", points: 1 },
      { key: "sbp", label: "収縮期血圧 <100 mmHg", type: "bool", points: 1 },
      { key: "spo2", label: "SpO₂ <90%", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {}, age = n(ctx.age);
      if (age != null) a.age = age > 80;
      if (vit(ctx, "hr") != null) a.hr = vit(ctx, "hr") >= 110;
      if (vit(ctx, "sbp") != null) a.sbp = vit(ctx, "sbp") < 100;
      if (vit(ctx, "spo2") != null) a.spo2 = vit(ctx, "spo2") < 90;
      if (hasH(ctx, "malignancy")) a.ca = true;
      if (hasH(ctx, "hf") || hasH(ctx, "copd")) a.cp = true;
      return a;
    },
    compute: function (s) {
      var b = s >= 1 ? { band: "red", bandLabel: "高リスク" } : { band: "green", bandLabel: "低リスク" };
      b.interp = s >= 1 ? "高リスク。入院管理とし、右心負荷・トロポニンの評価を行います。"
                        : "低リスク。条件が整えば早期退院・外来治療も選択肢になります。";
      b.actions = s >= 1 ? ["心エコーで右心負荷を評価", "トロポニン・BNP の測定", "血栓溶解・カテーテル治療の適応を検討"] : [];
      return b;
    } },

  { id: "abcd2", name: "ABCD² スコア", category: "神経", refs: ["ABCD2"],
    note: "一過性脳虚血発作（TIA）後の早期脳梗塞リスク。4点以上で入院精査が勧められます。",
    items: [
      { key: "a", label: "年齢 ≧60 歳", type: "bool", points: 1 },
      { key: "b", label: "血圧 ≧140/90 mmHg", type: "bool", points: 1 },
      { key: "c", label: "臨床症状", type: "select", options: [
        { label: "その他", points: 0 }, { label: "構音障害のみ（脱力なし）", points: 1 }, { label: "片側の脱力", points: 2 }] },
      { key: "d1", label: "持続時間", type: "select", options: [
        { label: "<10 分", points: 0 }, { label: "10〜59 分", points: 1 }, { label: "≧60 分", points: 2 }] },
      { key: "d2", label: "糖尿病", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {}, age = n(ctx.age), sbp = vit(ctx, "sbp"), dbp = vit(ctx, "dbp");
      if (age != null) a.a = age >= 60;
      if (sbp != null || dbp != null) a.b = (sbp != null && sbp >= 140) || (dbp != null && dbp >= 90);
      if (hasH(ctx, "dm")) a.d2 = true;
      return a;
    },
    compute: function (s) {
      var b = s >= 6 ? { band: "red", bandLabel: "高リスク" } : s >= 4 ? { band: "amber", bandLabel: "中リスク" }
            : { band: "green", bandLabel: "低リスク" };
      b.interp = "合計 " + s + " 点。4点以上は入院精査が勧められます。なお TIA は点数によらず緊急評価の対象であり、低点数が安全を意味するわけではありません。";
      b.actions = ["頸動脈エコー・頭部MRI/MRA の検討", "心房細動の検索（心電図・ホルター）", "抗血栓療法の開始時期を確認"];
      return b;
    } },

  /* ===================== 腎 ===================== */
  { id: "kdigo", name: "KDIGO 急性腎障害（AKI）病期", category: "腎", refs: ["KDIGO_AKI"],
    note: "血清Cr の上昇率・絶対値と尿量で病期を決めます。ベースラインCr が分かることが前提です。",
    items: [
      { key: "cr", label: "血清クレアチニンの基準", type: "select", options: [
        { label: "該当なし", points: 0 },
        { label: "基礎値の1.5〜1.9倍、または 0.3 mg/dL 以上の上昇", points: 1 },
        { label: "基礎値の2.0〜2.9倍", points: 2 },
        { label: "基礎値の3.0倍以上、または 4.0 mg/dL 以上、または腎代替療法開始", points: 3 }] },
      { key: "uo", label: "尿量の基準", type: "select", options: [
        { label: "該当なし", points: 0 },
        { label: "<0.5 mL/kg/時 が 6〜12 時間", points: 1 },
        { label: "<0.5 mL/kg/時 が 12 時間以上", points: 2 },
        { label: "<0.3 mL/kg/時 が 24 時間以上、または無尿 12 時間以上", points: 3 }] }
    ],
    computeMax: true,
    compute: function (s) {
      var b = s >= 3 ? { band: "red", bandLabel: "3期" } : s === 2 ? { band: "amber", bandLabel: "2期" }
            : s === 1 ? { band: "amber", bandLabel: "1期" } : { band: "green", bandLabel: "該当なし" };
      b.interp = s >= 1 ? "AKI " + s + "期。Cr と尿量のうち重い方で病期を決めます。腎前性・腎性・腎後性の鑑別と、腎毒性薬剤の中止を急ぎます。"
                        : "AKI の基準を満たしません。";
      b.actions = s >= 1 ? ["腎前性／腎性／腎後性の鑑別（体液量・尿所見・膀胱エコー）",
                            "腎毒性薬剤（NSAIDs・造影剤・アミノグリコシド・RAS阻害薬）の中止を検討",
                            "腎排泄性薬剤の用量調整", "高K血症・アシドーシス・溢水の監視",
                            "腎代替療法の適応（溢水・高K・アシドーシス・尿毒症）を評価"] : [];
      return b;
    } },

  { id: "ckd", name: "CKD 重症度分類（GFR × 蛋白尿）", category: "腎", refs: ["KDIGO_CKD"],
    note: "GFR 区分と蛋白尿区分のかけ合わせで、末期腎不全・心血管死のリスクを層別化します。",
    direct: function (V, ctx) {
      var cr = n(V.cr), age = n(ctx.age);
      var e = C.egfr(cr, age, ctx.sex);
      if (e == null) return null;
      var g = e >= 90 ? "G1" : e >= 60 ? "G2" : e >= 45 ? "G3a" : e >= 30 ? "G3b" : e >= 15 ? "G4" : "G5";
      var gl = { G1: "正常または高値", G2: "正常または軽度低下", G3a: "軽度〜中等度低下",
                 G3b: "中等度〜高度低下", G4: "高度低下", G5: "末期腎不全" }[g];
      var bd = (g === "G5" || g === "G4") ? "red" : (g === "G3a" || g === "G3b") ? "amber" : "green";
      return {
        score: e, scoreLabel: e.toFixed(1) + " mL/min/1.73m²",
        band: bd, bandLabel: g + "（" + gl + "）",
        interp: "eGFR " + e.toFixed(1) + " → " + g + "。蛋白尿区分（A1 正常／A2 微量アルブミン尿／A3 顕性蛋白尿）と組み合わせて重症度を決定します。蛋白尿の有無でリスクは大きく変わるため、尿検査の併用が必須です。",
        actions: bd !== "green"
          ? ["尿蛋白／尿中アルブミン・Cr 比の測定", "腎排泄性薬剤の用量調整", "造影剤使用時の対策を確認",
             "貧血・骨ミネラル代謝異常・アシドーシスの評価", "腎臓専門医への紹介時期を検討"] : []
      };
    } },

  /* ===================== 肝・消化器 ===================== */
  { id: "childpugh", name: "Child-Pugh 分類", category: "肝・消化器", refs: ["CHILDPUGH"],
    note: "肝硬変の予備能評価。手術侵襲の耐容性や予後判断に用います。",
    items: [
      { key: "enc", label: "肝性脳症", type: "select", options: [
        { label: "なし", points: 1 }, { label: "グレード I〜II（軽度）", points: 2 }, { label: "グレード III〜IV（昏睡）", points: 3 }] },
      { key: "asc", label: "腹水", type: "select", options: [
        { label: "なし", points: 1 }, { label: "軽度（コントロール良好）", points: 2 }, { label: "中等度以上（難治性）", points: 3 }] },
      { key: "bil", label: "総ビリルビン", type: "select", options: [
        { label: "<2.0 mg/dL", points: 1 }, { label: "2.0〜3.0 mg/dL", points: 2 }, { label: ">3.0 mg/dL", points: 3 }] },
      { key: "alb", label: "アルブミン", type: "select", options: [
        { label: ">3.5 g/dL", points: 1 }, { label: "2.8〜3.5 g/dL", points: 2 }, { label: "<2.8 g/dL", points: 3 }] },
      { key: "pt", label: "PT 活性（または INR）", type: "select", options: [
        { label: ">70%（INR <1.7）", points: 1 }, { label: "40〜70%（INR 1.7〜2.3）", points: 2 }, { label: "<40%（INR >2.3）", points: 3 }] }
    ],
    autofill: function (V, ctx) {
      var a = {}, bil = n(V.tbil), alb = n(V.alb), inr = n(V.inr), ptp = n(V.ptpct);
      if (bil != null) a.bil = bil < 2 ? 0 : bil <= 3 ? 1 : 2;
      if (alb != null) a.alb = alb > 3.5 ? 0 : alb >= 2.8 ? 1 : 2;
      if (inr != null) a.pt = inr < 1.7 ? 0 : inr <= 2.3 ? 1 : 2;
      else if (ptp != null) a.pt = ptp > 70 ? 0 : ptp >= 40 ? 1 : 2;
      return a;
    },
    compute: function (s) {
      var g = s <= 6 ? "A" : s <= 9 ? "B" : "C";
      var b = g === "C" ? { band: "red", bandLabel: "グレード C" } : g === "B" ? { band: "amber", bandLabel: "グレード B" }
            : { band: "green", bandLabel: "グレード A" };
      b.interp = "合計 " + s + " 点 → Child-Pugh " + g + "。A は代償性、B・C は非代償性に相当し、手術侵襲の耐容性と予後が大きく異なります。";
      b.actions = g !== "A" ? ["腹水・肝性脳症・静脈瘤の評価", "肝排泄性薬剤と鎮静薬の慎重な使用",
                               "栄養評価（分岐鎖アミノ酸・塩分制限）", "肝移植適応の検討時期を確認"] : [];
      return b;
    } },

  { id: "meldna", name: "MELD-Na スコア", category: "肝・消化器", refs: ["MELD", "MELDNA"],
    note: "末期肝疾患の短期予後予測。肝移植の優先順位決定に用いられます。総ビリルビン・INR・Cr・Na から自動計算します。",
    direct: function (V, ctx) {
      var bil = n(V.tbil), inr = n(V.inr), cr = n(V.cr), na = n(V.na);
      if (bil == null || inr == null || cr == null) return null;
      var b = Math.max(bil, 1), i = Math.max(inr, 1), c = Math.min(Math.max(cr, 1), 4);
      if (C.has(ctx, "history", "dialysis")) c = 4;
      var meld = 3.78 * Math.log(b) + 11.2 * Math.log(i) + 9.57 * Math.log(c) + 6.43;
      meld = Math.round(Math.min(Math.max(meld, 6), 40));
      var out = meld, label = "MELD " + meld;
      if (na != null) {
        var nn = Math.min(Math.max(na, 125), 137);
        out = Math.round(meld + 1.32 * (137 - nn) - 0.033 * meld * (137 - nn));
        out = Math.min(Math.max(out, 6), 40);
        label = "MELD-Na " + out + "（MELD " + meld + "）";
      }
      var bd = out >= 30 ? "red" : out >= 20 ? "red" : out >= 15 ? "amber" : "green";
      return {
        score: out, scoreLabel: label, band: bd,
        bandLabel: out >= 30 ? "極めて高リスク" : out >= 20 ? "高リスク" : out >= 15 ? "中リスク" : "低リスク",
        interp: "点数が高いほど3か月死亡率が上がります。15 以上で肝移植の検討対象、30 以上は極めて短期の予後不良を示します。" +
                (na == null ? "Na を入力すると MELD-Na に補正されます。" : ""),
        actions: out >= 15 ? ["肝移植適応の評価時期を確認", "感染・消化管出血・腎障害など増悪因子の検索",
                              "腹水・肝腎症候群の評価"] : []
      };
    } },

  { id: "westhaven", name: "West-Haven 分類（肝性脳症）", category: "肝・消化器", refs: ["WESTHAVEN"],
    note: "肝性脳症の重症度。グレード II 以上は顕性脳症で、誤嚥と転倒のリスク管理が要ります。",
    items: [
      { key: "g", label: "グレード", type: "select", options: [
        { label: "0：変化なし", points: 0 },
        { label: "I：軽度の意識変容・多幸／不安・注意力低下・睡眠リズム異常", points: 1 },
        { label: "II：傾眠・無気力・失見当識（時間）・明らかな羽ばたき振戦", points: 2 },
        { label: "III：強い傾眠〜半昏睡・失見当識（場所）・著明な錯乱", points: 3 },
        { label: "IV：昏睡（刺激に反応しない）", points: 4 }] }
    ],
    compute: function (s) {
      var b = s >= 3 ? { band: "red", bandLabel: "グレード " + s } : s === 2 ? { band: "amber", bandLabel: "グレード II" }
            : s === 1 ? { band: "info", bandLabel: "グレード I" } : { band: "green", bandLabel: "グレード 0" };
      b.interp = s >= 2 ? "顕性肝性脳症。誘因（消化管出血・感染・便秘・脱水・電解質異常・鎮静薬）の検索と是正が治療の本体です。"
               : s === 1 ? "不顕性〜軽度。睡眠リズムの異常や注意力低下は見逃されやすく、運転など日常動作のリスクになります。"
               : "明らかな脳症はありません。";
      b.actions = s >= 2 ? ["誘因の検索（消化管出血・感染・便秘・脱水・低K・鎮静薬）",
                            "アンモニア値の確認", "誤嚥・転倒の予防", "ラクツロース・リファキシミンの投与状況を確認",
                            "グレード III 以上では気道確保を検討"] : [];
      return b;
    } },

  { id: "gbs", name: "Glasgow-Blatchford スコア", category: "肝・消化器", refs: ["GBS"],
    note: "上部消化管出血で介入（輸血・内視鏡的止血・手術）を要するかの予測。0〜1点なら外来管理も可能とされます。",
    items: [
      { key: "bun", label: "BUN（mg/dL）", type: "select", options: [
        { label: "<18.2", points: 0 }, { label: "18.2〜22.3", points: 2 }, { label: "22.4〜27.9", points: 3 },
        { label: "28.0〜69.9", points: 4 }, { label: "≧70", points: 6 }] },
      { key: "hb", label: "ヘモグロビン", type: "select", options: [
        { label: "男性 ≧13 / 女性 ≧12 g/dL", points: 0 },
        { label: "男性 12〜12.9 g/dL", points: 1 },
        { label: "男性 10〜11.9 / 女性 10〜11.9 g/dL", points: 3 },
        { label: "<10 g/dL", points: 6 }] },
      { key: "sbp", label: "収縮期血圧", type: "select", options: [
        { label: "≧110 mmHg", points: 0 }, { label: "100〜109 mmHg", points: 1 },
        { label: "90〜99 mmHg", points: 2 }, { label: "<90 mmHg", points: 3 }] },
      { key: "hr", label: "心拍数 ≧100 /分", type: "bool", points: 1 },
      { key: "melena", label: "黒色便", type: "bool", points: 1 },
      { key: "syncope", label: "失神", type: "bool", points: 2 },
      { key: "liver", label: "肝疾患", type: "bool", points: 2 },
      { key: "hf", label: "心不全", type: "bool", points: 2 }
    ],
    autofill: function (V, ctx) {
      var a = {}, bun = n(V.bun), hb = n(V.hb), sbp = vit(ctx, "sbp"), hr = vit(ctx, "hr");
      if (bun != null) a.bun = bun < 18.2 ? 0 : bun <= 22.3 ? 1 : bun <= 27.9 ? 2 : bun < 70 ? 3 : 4;
      if (hb != null) {
        var male = ctx.sex !== "f";
        a.hb = hb < 10 ? 3 : (male ? (hb >= 13 ? 0 : hb >= 12 ? 1 : 2) : (hb >= 12 ? 0 : 2));
      }
      if (sbp != null) a.sbp = sbp >= 110 ? 0 : sbp >= 100 ? 1 : sbp >= 90 ? 2 : 3;
      if (hr != null) a.hr = hr >= 100;
      if (hasH(ctx, "cirrhosis")) a.liver = true;
      if (hasH(ctx, "hf")) a.hf = true;
      return a;
    },
    compute: function (s) {
      var b = s >= 6 ? { band: "red", bandLabel: "高リスク" } : s >= 2 ? { band: "amber", bandLabel: "中リスク" }
            : { band: "green", bandLabel: "低リスク" };
      b.interp = s <= 1 ? "低リスク。輸血や内視鏡的止血を要する可能性は低く、外来管理も選択肢になります。"
                        : "介入を要する可能性があります。" + (s >= 6 ? "早期の内視鏡と輸血準備を検討します。" : "");
      b.actions = s >= 2 ? ["血液型・交差適合試験", "内視鏡のタイミングを確認", "抗血栓薬の扱いを確認", "PPI 投与の適応"] : [];
      return b;
    } },

  { id: "jss_ap", name: "急性膵炎 重症度判定（予後因子）", category: "肝・消化器", refs: ["JSS_AP"],
    note: "厚生労働省基準の予後因子9項目。3点以上で重症と判定し、集中治療管理の適応となります（造影CT Grade も併せて判定します）。",
    items: [
      { key: "be", label: "BE ≦ −3 mEq/L、またはショック", type: "bool", points: 1 },
      { key: "po2", label: "PaO₂ ≦60 mmHg（室内気）、または呼吸不全", type: "bool", points: 1 },
      { key: "bun", label: "BUN ≧40 mg/dL（または Cr ≧2.0 mg/dL）、または乏尿", type: "bool", points: 1 },
      { key: "ldh", label: "LDH ≧ 基準値上限の2倍", type: "bool", points: 1 },
      { key: "plt", label: "血小板 ≦10万/µL", type: "bool", points: 1 },
      { key: "ca", label: "血清Ca ≦7.5 mg/dL", type: "bool", points: 1 },
      { key: "crp", label: "CRP ≧15 mg/dL", type: "bool", points: 1 },
      { key: "sirs", label: "SIRS 診断基準の陽性項目 ≧3", type: "bool", points: 1 },
      { key: "age", label: "年齢 ≧70 歳", type: "bool", points: 1 }
    ],
    autofill: function (V, ctx) {
      var a = {}, age = n(ctx.age);
      if (age != null) a.age = age >= 70;
      if (n(V.be) != null) a.be = n(V.be) <= -3;
      if (n(V.pao2) != null) a.po2 = n(V.pao2) <= 60;
      if (n(V.bun) != null || n(V.cr) != null)
        a.bun = (n(V.bun) != null && n(V.bun) >= 40) || (n(V.cr) != null && n(V.cr) >= 2.0);
      if (n(V.ld) != null) a.ldh = n(V.ld) >= 444;
      if (n(V.plt) != null) a.plt = n(V.plt) <= 10;
      if (n(V.ca) != null) a.ca = n(V.ca) <= 7.5;
      if (n(V.crp) != null) a.crp = n(V.crp) >= 15;
      return a;
    },
    compute: function (s) {
      var b = s >= 3 ? { band: "red", bandLabel: "重症" } : { band: "amber", bandLabel: "軽症" };
      b.interp = s >= 3 ? "重症急性膵炎。初期の大量輸液、集中治療管理、専門施設への転送を検討します。"
                        : "予後因子では軽症ですが、発症48時間以内は増悪しうるため繰り返し評価します。";
      b.actions = s >= 3 ? ["集中治療管理・専門施設への転送を検討", "初期大量輸液と尿量管理",
                            "造影CT Grade の評価", "呼吸・循環・腎機能の連続監視", "原因（胆石・アルコール・高TG）の検索"]
                         : ["48時間以内の再評価", "原因検索"];
      return b;
    } },

  { id: "light", name: "Light の基準（胸水の滲出性／漏出性）", category: "肝・消化器", refs: ["LIGHT"],
    note: "3項目のいずれか1つでも満たせば滲出性です。感度は高い一方、利尿薬使用下の心不全では漏出性を滲出性と誤判定しやすい点に注意します。",
    items: [
      { key: "p", label: "胸水／血清 総蛋白比 >0.5", type: "bool", points: 1 },
      { key: "l", label: "胸水／血清 LDH 比 >0.6", type: "bool", points: 1 },
      { key: "l2", label: "胸水 LDH > 血清LDH 正常上限の 2/3", type: "bool", points: 1 }
    ],
    compute: function (s) {
      var b = s >= 1 ? { band: "amber", bandLabel: "滲出性" } : { band: "green", bandLabel: "漏出性" };
      b.interp = s >= 1
        ? "滲出性胸水。感染（膿胸・結核）、悪性腫瘍、膠原病、肺塞栓、膵炎などを鑑別します。"
        : "漏出性胸水。心不全、肝硬変、ネフローゼ症候群など全身の静水圧・膠質浸透圧の異常を考えます。";
      b.actions = s >= 1 ? ["胸水の細胞診・培養・ADA・糖・pH の追加検査",
                            "膿胸の評価（pH <7.2 ならドレナージを検討）", "悪性腫瘍・結核の検索"]
                         : ["心不全・肝硬変・ネフローゼの評価（心エコー・Alb・尿蛋白）"];
      return b;
    } },

  /* ===================== 血液・凝固 ===================== */
  { id: "isth_dic", name: "ISTH overt DIC スコア", category: "血液・凝固", refs: ["ISTH_DIC"],
    note: "国際血栓止血学会の顕性DIC 基準。5点以上で overt DIC と判定します。急性期DIC基準（日本救急医学会）より特異度が高い一方、検出は遅れます。",
    direct: function (V, ctx) {
      var plt = n(V.plt), fdp = n(V.fdp), dd = n(V.ddimer), inr = n(V.inr), ptp = n(V.ptpct), fib = n(V.fib);
      if (plt == null && fdp == null && fib == null) return null;
      var s = 0, rows = [];
      if (plt != null) { var p = plt < 5 ? 2 : plt < 10 ? 1 : 0; s += p; rows.push(["血小板数", plt.toFixed(1) + " 万/µL", p]); }
      if (fdp != null || dd != null) {
        var marker = fdp != null ? fdp : dd, lbl = fdp != null ? "FDP" : "D-ダイマー";
        var hi = fdp != null ? 25 : 5, mid = fdp != null ? 10 : 1;
        var q = marker >= hi ? 3 : marker >= mid ? 2 : 0;
        s += q; rows.push([lbl, marker.toFixed(1) + " µg/mL", q]);
      }
      var ptSec = null;
      if (ptp != null) ptSec = ptp >= 70 ? 0 : ptp >= 40 ? 4 : 8;
      else if (inr != null) ptSec = inr < 1.3 ? 0 : inr < 1.7 ? 4 : 8;
      if (ptSec != null) { var r = ptSec > 6 ? 2 : ptSec >= 3 ? 1 : 0; s += r; rows.push(["PT 延長", ptSec + " 秒相当", r]); }
      if (fib != null) { var f = fib < 100 ? 1 : 0; s += f; rows.push(["フィブリノゲン", fib.toFixed(0) + " mg/dL", f]); }
      return {
        score: s, scoreLabel: s + " 点", rows: rows,
        band: s >= 5 ? "red" : s >= 3 ? "amber" : "green",
        bandLabel: s >= 5 ? "overt DIC" : s >= 3 ? "非顕性DIC の疑い" : "基準未満",
        interp: s >= 5 ? "ISTH overt DIC の基準（5点以上）を満たします。基礎疾患の治療が本体です。"
                       : "現時点では overt DIC の基準を満たしません。経時的な再評価が重要で、1回の測定で否定はできません。",
        actions: s >= 5 ? ["出血・血栓の全身観察", "基礎疾患（感染・外傷・悪性腫瘍・産科）の治療",
                           "凝固系の頻回再検", "侵襲的処置前の凝固能確認"] : ["24時間以内の再検を検討"]
      };
    } },

  { id: "fourts", name: "4Ts スコア（HIT）", category: "血液・凝固", refs: ["FOURTS"],
    note: "ヘパリン起因性血小板減少症の事前確率。0〜3点なら HIT はほぼ否定でき、抗体検査は不要とされます。",
    items: [
      { key: "t1", label: "血小板減少の程度", type: "select", options: [
        { label: "減少率 <30%、または最低値 <10×10³/µL", points: 0 },
        { label: "減少率 30〜50%、または最低値 10〜19×10³/µL", points: 1 },
        { label: "減少率 >50% かつ最低値 ≧20×10³/µL", points: 2 }] },
      { key: "t2", label: "発症の時期", type: "select", options: [
        { label: "4日以内（ヘパリン曝露歴なし）", points: 0 },
        { label: "不明、または5日以降だが時期が不明瞭", points: 1 },
        { label: "5〜10日目、または30日以内の曝露歴があり1日以内の発症", points: 2 }] },
      { key: "t3", label: "血栓症・その他の後遺症", type: "select", options: [
        { label: "なし", points: 0 },
        { label: "進行性・再発性の血栓、紅斑性皮膚病変、未確定の血栓疑い", points: 1 },
        { label: "確定した新規血栓、皮膚壊死、ヘパリン静注後の全身反応", points: 2 }] },
      { key: "t4", label: "血小板減少の他の原因", type: "select", options: [
        { label: "他に明らかな原因がある", points: 0 },
        { label: "他の原因の可能性もある", points: 1 },
        { label: "他に原因が見当たらない", points: 2 }] }
    ],
    compute: function (s) {
      var b = s >= 6 ? { band: "red", bandLabel: "高確率" } : s >= 4 ? { band: "amber", bandLabel: "中確率" }
            : { band: "green", bandLabel: "低確率" };
      b.interp = s >= 4
        ? "HIT を否定できません。ヘパリンの中止と代替抗凝固薬への変更を検討しつつ、抗体検査を進めます。HIT は血小板が減るのに血栓ができる病態であり、抗凝固の中止ではなく「変更」が要ります。"
        : "低確率。HIT はほぼ否定的で、他の原因を検索します。";
      b.actions = s >= 4 ? ["すべてのヘパリン製剤の中止（ロック・コーティングカテーテルを含む）",
                            "代替抗凝固薬（アルガトロバン等）への変更を検討",
                            "HIT 抗体（抗PF4・ヘパリン複合体抗体）の提出",
                            "血小板輸血は原則避ける", "四肢・臓器の血栓徴候を観察"] : [];
      return b;
    } },

  { id: "hscore", name: "HScore（血球貪食症候群）", category: "血液・凝固", refs: ["HSCORE"],
    note: "反応性血球貪食症候群（HLH）の確率を推定します。169点が感度93%・特異度86%のカットオフとされます。",
    items: [
      { key: "immuno", label: "既知の免疫抑制状態（HIV・免疫抑制療法）", type: "select", options: [
        { label: "なし", points: 0 }, { label: "あり", points: 18 }] },
      { key: "temp", label: "最高体温", type: "select", options: [
        { label: "<38.4℃", points: 0 }, { label: "38.4〜39.4℃", points: 33 }, { label: ">39.4℃", points: 49 }] },
      { key: "organ", label: "臓器腫大", type: "select", options: [
        { label: "なし", points: 0 }, { label: "肝腫大 または 脾腫", points: 23 }, { label: "肝腫大 かつ 脾腫", points: 38 }] },
      { key: "cyto", label: "血球減少の系統数", type: "select", options: [
        { label: "1 系統", points: 0 }, { label: "2 系統", points: 24 }, { label: "3 系統", points: 34 }] },
      { key: "ferritin", label: "フェリチン", type: "select", options: [
        { label: "<2000 ng/mL", points: 0 }, { label: "2000〜6000 ng/mL", points: 35 }, { label: ">6000 ng/mL", points: 50 }] },
      { key: "tg", label: "中性脂肪", type: "select", options: [
        { label: "<132.7 mg/dL", points: 0 }, { label: "132.7〜354 mg/dL", points: 44 }, { label: ">354 mg/dL", points: 64 }] },
      { key: "fib", label: "フィブリノゲン", type: "select", options: [
        { label: ">250 mg/dL", points: 0 }, { label: "≦250 mg/dL", points: 30 }] },
      { key: "ast", label: "AST", type: "select", options: [
        { label: "<30 U/L", points: 0 }, { label: "≧30 U/L", points: 19 }] },
      { key: "hemo", label: "骨髄での血球貪食像", type: "select", options: [
        { label: "なし", points: 0 }, { label: "あり", points: 35 }] }
    ],
    autofill: function (V, ctx) {
      var a = {}, bt = vit(ctx, "bt"), tg = n(V.tg), fib = n(V.fib), ast = n(V.ast);
      if (bt != null) a.temp = bt < 38.4 ? 0 : bt <= 39.4 ? 1 : 2;
      if (tg != null) a.tg = tg < 132.7 ? 0 : tg <= 354 ? 1 : 2;
      if (fib != null) a.fib = fib > 250 ? 0 : 1;
      if (ast != null) a.ast = ast < 30 ? 0 : 1;
      var cy = 0;
      if (n(V.hb) != null && n(V.hb) < 9.2) cy++;
      if (n(V.plt) != null && n(V.plt) < 11) cy++;
      if (n(V.wbc) != null && n(V.wbc) < 5000) cy++;
      if (cy >= 1) a.cyto = Math.min(cy, 3) - 1;
      if (C.has(ctx, "meds", "immunosuppressant") || C.has(ctx, "meds", "chemo")) a.immuno = 1;
      return a;
    },
    compute: function (s) {
      var b = s >= 250 ? { band: "red", bandLabel: "極めて高確率" } : s >= 169 ? { band: "red", bandLabel: "高確率" }
            : s >= 120 ? { band: "amber", bandLabel: "中等度" } : { band: "green", bandLabel: "低確率" };
      b.interp = s >= 169
        ? "HLH の確率が高い水準です（169点で感度93%・特異度86%）。背景の感染・悪性リンパ腫・膠原病を急いで検索します。"
        : "現時点では HLH の可能性は高くありませんが、フェリチンと血球数の推移を追ってください。";
      b.actions = s >= 169 ? ["血液内科へのコンサルト", "フェリチン・可溶性IL-2R の確認", "骨髄検査の検討",
                              "背景疾患（EBV・悪性リンパ腫・膠原病）の検索", "全身状態の急変に備える"] : [];
      return b;
    } },

  /* ===================== 内分泌 ===================== */
  { id: "burch", name: "Burch-Wartofsky スコア（甲状腺クリーゼ）", category: "内分泌", refs: ["BURCH", "JTA_STORM"],
    note: "45点以上で甲状腺クリーゼが濃厚、25〜44点は切迫、25点未満は可能性が低いと判定します。日本甲状腺学会の診断基準と併用してください。",
    items: [
      { key: "temp", label: "体温", type: "select", options: [
        { label: "<37.2℃", points: 0 }, { label: "37.2〜37.7℃", points: 5 }, { label: "37.8〜38.2℃", points: 10 },
        { label: "38.3〜38.8℃", points: 15 }, { label: "38.9〜39.4℃", points: 20 },
        { label: "39.4〜39.9℃", points: 25 }, { label: "≧40.0℃", points: 30 }] },
      { key: "cns", label: "中枢神経症状", type: "select", options: [
        { label: "なし", points: 0 }, { label: "軽度（焦燥）", points: 10 },
        { label: "中等度（せん妄・精神症状・強い傾眠）", points: 20 },
        { label: "重度（痙攣・昏睡）", points: 30 }] },
      { key: "gi", label: "消化器・肝症状", type: "select", options: [
        { label: "なし", points: 0 }, { label: "中等度（下痢・嘔気嘔吐・腹痛）", points: 10 },
        { label: "重度（原因不明の黄疸）", points: 20 }] },
      { key: "hr", label: "心拍数", type: "select", options: [
        { label: "<99 /分", points: 0 }, { label: "100〜109", points: 5 }, { label: "110〜119", points: 10 },
        { label: "120〜129", points: 15 }, { label: "130〜139", points: 20 }, { label: "≧140", points: 25 }] },
      { key: "chf", label: "うっ血性心不全", type: "select", options: [
        { label: "なし", points: 0 }, { label: "軽度（下腿浮腫）", points: 5 },
        { label: "中等度（両側ラ音）", points: 10 }, { label: "重度（肺水腫）", points: 15 }] },
      { key: "af", label: "心房細動", type: "select", options: [{ label: "なし", points: 0 }, { label: "あり", points: 10 }] },
      { key: "trigger", label: "誘因（感染・手術・外傷など）", type: "select", options: [
        { label: "なし／不明", points: 0 }, { label: "あり", points: 10 }] }
    ],
    autofill: function (V, ctx) {
      var a = {}, bt = vit(ctx, "bt"), hr = vit(ctx, "hr");
      if (bt != null) a.temp = bt < 37.2 ? 0 : bt < 37.8 ? 1 : bt < 38.3 ? 2 : bt < 38.9 ? 3 : bt < 39.4 ? 4 : bt < 40 ? 5 : 6;
      if (hr != null) a.hr = hr < 100 ? 0 : hr < 110 ? 1 : hr < 120 ? 2 : hr < 130 ? 3 : hr < 140 ? 4 : 5;
      if (hasH(ctx, "af")) a.af = 1;
      if (hasH(ctx, "hf")) a.chf = 1;
      return a;
    },
    compute: function (s) {
      var b = s >= 45 ? { band: "red", bandLabel: "クリーゼが濃厚" } : s >= 25 ? { band: "amber", bandLabel: "切迫クリーゼ" }
            : { band: "green", bandLabel: "可能性は低い" };
      b.interp = s >= 45 ? "甲状腺クリーゼが濃厚です。致死率が高く、治療開始の遅れが予後を直接左右します。"
               : s >= 25 ? "切迫クリーゼ。甲状腺機能と誘因を急いで確認します。" : "クリーゼの可能性は低い水準です。";
      b.actions = s >= 25 ? ["ただちに内分泌科へコンサルト", "FT3・FT4・TSH・TRAb の提出",
                             "抗甲状腺薬・ヨウ素・β遮断薬・ステロイドの投与順序を確認",
                             "誘因（感染・手術・ヨード造影剤・薬剤中断）の検索",
                             "心拍・体温・意識の連続監視、冷却と補液"] : [];
      return b;
    } }
  ];

  var byId = {};
  SCORES.forEach(function (s) { byId[s.id] = s; });

  /** スコアを算出する。answers は {itemKey: boolean|optionIndex}。 */
  function run(def, answers, V, ctx) {
    if (def.direct) return def.direct(V, ctx);
    var total = 0, max = 0, answered = 0;
    (def.items || []).forEach(function (it) {
      var a = answers ? answers[it.key] : undefined;
      if (a === undefined || a === null || a === "") return;
      answered++;
      var p = 0;
      if (it.type === "bool") p = a ? (it.points || 1) : 0;
      else if (it.type === "select") {
        var idx = Number(a);
        if (it.options[idx]) p = it.options[idx].points;
      }
      total += p;
      if (p > max) max = p;
    });
    var score = def.computeMax ? max : total;
    var r = def.compute(score);
    r.score = score;
    r.scoreLabel = (r.scoreLabel != null) ? r.scoreLabel : (score + " 点");
    r.answered = answered;
    r.itemCount = (def.items || []).length;
    return r;
  }

  function categories() {
    var seen = [], out = [];
    SCORES.forEach(function (s) { if (seen.indexOf(s.category) < 0) { seen.push(s.category); out.push(s.category); } });
    return out;
  }

  return { list: SCORES, get: function (id) { return byId[id]; }, run: run, categories: categories };
})();
