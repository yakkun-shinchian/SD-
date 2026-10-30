/*! labs-coag.js — 凝固・線溶ドメイン
 *  凝固検査は JCCLS 共用基準範囲に収載がないため、一般的な施設値を既定とし
 *  すべて facility:true を付す。実運用では自施設の基準値に差し替えること。
 *  急性期DIC診断基準（日本救急医学会）のスコアリングを実装する。
 */
(function () {
  "use strict";
  var C = LabsCore;

  var analytes = [
    { key: "plt", label: "PLT 血小板数", unit: "×10⁴/µL（万）", group: "血小板", shared: true,
      ref: [15.8, 34.8], panic: { low: 2.0, high: 100 }, decimals: 1, placeholder: "25.0" },

    { key: "ptsec", label: "PT（プロトロンビン時間）", unit: "秒", group: "外因系（PT）",
      ref: [10, 13], decimals: 1, placeholder: "11.5", facility: true },
    { key: "ptpct", label: "PT 活性", unit: "%", group: "外因系（PT）",
      ref: [70, 130], decimals: 0, placeholder: "100", facility: true },
    { key: "inr", label: "PT-INR", unit: "", group: "外因系（PT）",
      ref: [0.90, 1.10], panic: { high: 5.0 }, decimals: 2, placeholder: "1.00", facility: true,
      note: "ワルファリンのモニタリング指標。治療域は適応により1.6〜3.0程度" },

    { key: "aptt", label: "APTT（活性化部分トロンボプラスチン時間）", unit: "秒", group: "内因系（APTT）",
      ref: [25, 40], panic: { high: 100 }, decimals: 1, placeholder: "30.0", facility: true },

    { key: "fib", label: "フィブリノゲン", unit: "mg/dL", group: "線溶・凝固因子",
      ref: [200, 400], panic: { low: 100 }, decimals: 0, placeholder: "280", facility: true },
    { key: "fdp", label: "FDP（フィブリン分解産物）", unit: "µg/mL", group: "線溶・凝固因子",
      ref: [0, 5], decimals: 1, placeholder: "3.0", facility: true },
    { key: "ddimer", label: "D-ダイマー", unit: "µg/mL", group: "線溶・凝固因子",
      ref: [0, 1.0], decimals: 2, placeholder: "0.5", facility: true,
      note: "陰性なら血栓を強く否定できるが、陽性の特異度は低い（高齢・炎症・術後・妊娠・悪性腫瘍で上昇）" },
    { key: "at3", label: "アンチトロンビン（AT-III）", unit: "%", group: "線溶・凝固因子",
      ref: [80, 130], decimals: 0, placeholder: "100", facility: true,
      note: "DIC・肝不全・ネフローゼで低下。70%未満はヘパリンが効きにくくなる" },
    { key: "tat", label: "TAT（トロンビン-アンチトロンビン複合体）", unit: "ng/mL", group: "線溶・凝固因子",
      ref: [0, 4.0], decimals: 1, placeholder: "2.0", facility: true,
      note: "凝固活性化の鋭敏な指標。DICの早期検出に有用" }
  ];

  /** SIRS 項目数（急性期DIC診断基準で用いる）。 */
  function sirsCount(V, ctx) {
    var v = ctx.vitals || {};
    var c = 0, known = 0;
    var bt = C.num(v.bt), hr = C.num(v.hr), rr = C.num(v.rr), wbc = C.num(V.wbc);
    if (bt != null) { known++; if (bt > 38 || bt < 36) c++; }
    if (hr != null) { known++; if (hr > 90) c++; }
    if (rr != null) { known++; if (rr > 20) c++; }
    if (wbc != null) { known++; if (wbc > 12000 || wbc < 4000) c++; }
    return { count: c, known: known };
  }

  /** 急性期DIC診断基準（日本救急医学会）スコア。4点以上でDIC。 */
  function jaamDic(V, ctx) {
    var plt = C.num(V.plt), inr = C.num(V.inr), ptpct = C.num(V.ptpct), fdp = C.num(V.fdp);
    var s = sirsCount(V, ctx);
    var rows = [], total = 0, measurable = 0;

    // SIRS
    if (s.known >= 3) {
      var p = s.count >= 3 ? 1 : 0;
      rows.push({ label: "SIRS 項目数", detail: s.count + " 項目", point: p }); total += p; measurable++;
    } else {
      rows.push({ label: "SIRS 項目数", detail: "バイタル未入力のため判定不可", point: null });
    }

    // 血小板（経時変化は未対応のため絶対値のみで評価）
    if (plt != null) {
      var pp = plt < 8 ? 3 : (plt < 12 ? 1 : 0);
      rows.push({ label: "血小板数", detail: plt.toFixed(1) + " 万/µL", point: pp }); total += pp; measurable++;
    } else {
      rows.push({ label: "血小板数", detail: "未入力", point: null });
    }

    // PT比（INR で代用。INR がなければ PT活性から概算）
    var ptRatio = inr;
    if (ptRatio == null && ptpct != null && ptpct > 0) ptRatio = 100 / ptpct;
    if (ptRatio != null) {
      var tp = ptRatio >= 1.2 ? 1 : 0;
      rows.push({ label: "PT 比", detail: ptRatio.toFixed(2), point: tp }); total += tp; measurable++;
    } else {
      rows.push({ label: "PT 比", detail: "未入力", point: null });
    }

    // FDP
    if (fdp != null) {
      var fp = fdp >= 25 ? 3 : (fdp >= 10 ? 1 : 0);
      rows.push({ label: "FDP", detail: fdp.toFixed(1) + " µg/mL", point: fp }); total += fp; measurable++;
    } else {
      rows.push({ label: "FDP", detail: "未入力", point: null });
    }

    return { rows: rows, total: total, measurable: measurable, dic: total >= 4 };
  }

  function derive(V, ctx) {
    var D = {};
    var ptsec = C.num(V.ptsec), aptt = C.num(V.aptt);
    if (ptsec != null) D.ptRatioSec = ptsec / 11.5;
    if (aptt != null) D.apttRatio = aptt / 30;
    D.jaam = jaamDic(V, ctx);
    D.jaamTotal = D.jaam.total;
    var fib = C.num(V.fib), fdp = C.num(V.fdp);
    if (fib != null && fdp != null && fib > 0) D.fdpFib = fdp / fib * 100;
    return D;
  }

  function findings(V, D, ctx) {
    var F = {}, n = C.num;
    var inr = n(V.inr), aptt = n(V.aptt), ptpct = n(V.ptpct), ptsec = n(V.ptsec);

    var ptProlonged = (inr != null && inr > 1.10) ||
                      (ptpct != null && ptpct < 70) ||
                      (ptsec != null && ptsec > 13);
    var apttProlonged = (aptt != null && aptt > 40);
    var ptMeasured = inr != null || ptpct != null || ptsec != null;
    var apttMeasured = aptt != null;

    if (ptProlonged) F.pt_prolonged = true;
    if (apttProlonged) F.aptt_prolonged = true;
    if (ptMeasured && apttMeasured) {
      if (ptProlonged && !apttProlonged) F.pt_only = true;
      if (!ptProlonged && apttProlonged) F.aptt_only = true;
      if (ptProlonged && apttProlonged) F.both_prolonged = true;
    }
    if (inr != null) {
      if (inr > 3.0) F.inr_high = true;
      if (inr > 4.0) F.inr_veryhigh = true;
      if (inr > 5.0) F.inr_critical = true;
    }
    if (aptt != null && aptt > 100) F.aptt_critical = true;

    if (n(V.fib) != null) {
      if (n(V.fib) < 200) F.fib_low = true;
      if (n(V.fib) < 100) F.fib_critical = true;
      if (n(V.fib) > 400) F.fib_high = true;
    }
    if (n(V.fdp) != null) {
      if (n(V.fdp) > 5) F.fdp_high = true;
      if (n(V.fdp) >= 25) F.fdp_veryhigh = true;
    }
    if (n(V.ddimer) != null) {
      if (n(V.ddimer) > 1.0) F.ddimer_high = true;
      if (n(V.ddimer) > 5.0) F.ddimer_veryhigh = true;
      if (n(V.ddimer) <= 1.0) F.ddimer_negative = true;
    }
    if (n(V.at3) != null) {
      if (n(V.at3) < 80) F.at3_low = true;
      if (n(V.at3) < 70) F.at3_verylow = true;
    }
    if (n(V.tat) != null && n(V.tat) > 4.0) F.tat_high = true;
    if (n(V.plt) != null) {
      if (n(V.plt) < 15.8) F.plt_low = true;
      if (n(V.plt) < 5) F.plt_verylow = true;
      if (n(V.plt) < 2) F.plt_critical = true;
    }
    if (D.jaam && D.jaam.dic) F.dic_jaam = true;
    return F;
  }

  var patterns = [
    { id: "cg-dic", name: "急性期DIC診断基準を満たす", level: "red",
      when: function (F, V, D) { return D.jaam && D.jaam.dic; },
      basis: ["日本救急医学会 急性期DIC診断基準 4点以上"],
      note: "全身の微小血管で凝固が起こり、消費性に凝固因子と血小板が枯渇して出血に転じる病態です。基礎疾患（敗血症・外傷・産科疾患・悪性腫瘍）の治療が本体になります。",
      actions: ["ただちに医師へ報告", "出血（穿刺部位・粘膜・消化管・頭蓋内）の全身観察", "血栓徴候（四肢の冷感・網状皮斑・乏尿）の観察", "凝固系の頻回再検タイミングを確認", "侵襲的処置の前に凝固能を確認"] },

    { id: "cg-dic-watch", name: "DIC の前段階に注意（凝固活性化の所見あり）", level: "amber",
      when: function (F, V, D) { return !(D.jaam && D.jaam.dic) && F.tat_high && (F.at3_low || F.fdp_high); },
      basis: ["TAT 上昇", "AT-III 低下または FDP 上昇"],
      note: "スコアは満たさないものの、凝固の活性化が始まっています。基礎疾患が進行すればDICに移行しえます。",
      actions: ["凝固系の再検間隔を短くする提案", "基礎疾患（感染・外傷・悪性腫瘍）の活動性を確認"] },

    { id: "cg-liver-mimic", name: "肝疾患によるDIC類似所見の可能性", level: "amber",
      when: function (F, V, D, ctx) {
        return (D.jaam && D.jaam.dic) &&
               (C.has(ctx, "history", "cirrhosis") || F.che_low || F.alb_verylow);
      },
      basis: ["急性期DIC基準を満たす", "肝疾患の背景"],
      note: "肝硬変は凝固因子の産生低下と脾機能亢進による血小板減少を同時に起こすため、DIC基準を満たしやすい病態です。真のDICか肝不全による凝固障害かで治療が変わります。切り分けの手がかりは、第VIII因子（肝で作られないためDICでのみ低下）と、経時的な増悪の有無です。",
      actions: ["医師へ報告（肝疾患背景があることを明示）", "過去の凝固データとの比較", "FDP／D-ダイマーの経時変化を確認", "出血徴候の観察"] },

    { id: "cg-pt-only", name: "PT 単独延長 — 外因系の異常", level: "amber",
      when: function (F) { return F.pt_only; },
      basis: ["PT 延長", "APTT は正常"],
      note: "外因系（第VII因子）の問題です。第VII因子は半減期が最も短いため、ビタミンK欠乏・肝障害・ワルファリンで最初に影響が出ます。これが「PTだけ先に延びる」理由です。",
      actions: ["ワルファリン内服の確認", "ビタミンK欠乏の要因（絶食・抗菌薬長期・胆道閉塞・新生児）を確認", "肝機能の確認", "出血徴候の観察"] },

    { id: "cg-aptt-only", name: "APTT 単独延長 — 内因系の異常", level: "amber",
      when: function (F) { return F.aptt_only; },
      basis: ["APTT 延長", "PT は正常"],
      note: "内因系の問題です。ヘパリン投与中が最も多い原因。薬剤がなければ血友病A/B、von Willebrand病、ループスアンチコアグラント、第XII因子欠乏を鑑別します。ループスアンチコアグラントは出血ではなく血栓に傾く点が逆説的で重要です。",
      actions: ["ヘパリン投与の有無と採血ルートを確認（ヘパリンロック混入による偽延長に注意）", "出血歴・家族歴の聴取", "抗リン脂質抗体の確認を提案"] },

    { id: "cg-both", name: "PT・APTT ともに延長 — 共通路の異常または複合要因", level: "red",
      when: function (F) { return F.both_prolonged; },
      basis: ["PT 延長", "APTT 延長"],
      note: "DIC、肝不全、ビタミンK高度欠乏、大量輸血による希釈性凝固障害、抗凝固薬過量を鑑別します。",
      actions: ["ただちに医師へ報告", "フィブリノゲン・FDP・D-ダイマー・血小板の確認", "肝機能・抗凝固薬の確認", "出血の全身観察"] },

    { id: "cg-inr-critical", name: "PT-INR 著明高値 — 重大出血のリスク", level: "red",
      when: function (F) { return F.inr_critical; },
      basis: ["PT-INR > 5.0"],
      note: "頭蓋内出血・消化管出血の危険域です。ワルファリン内服中なら中和（ビタミンK・プロトロンビン複合体製剤）の適応を検討する水準。",
      actions: ["ただちに医師へ報告", "頭痛・意識変容・麻痺（頭蓋内出血）の観察", "黒色便・血尿・皮下出血の確認", "転倒・外傷の厳重予防", "筋注・侵襲的処置の回避"] },

    { id: "cg-warfarin", name: "ワルファリン効果の過剰", level: "amber",
      when: function (F, V, D, ctx) { return F.inr_high && !F.inr_critical && C.has(ctx, "meds", "warfarin"); },
      basis: ["PT-INR > 3.0", "ワルファリン内服中"],
      note: "ビタミンK摂取量の変化、抗菌薬併用、肝機能低下、低アルブミン血症で効果が強まります。納豆・青汁の中止も逆に効きすぎの原因になりえます。",
      actions: ["医師へ報告", "併用薬（特に抗菌薬・NSAIDs）の確認", "食事内容（ビタミンK）の変化を聴取", "出血徴候の観察"] },

    { id: "cg-heparin", name: "ヘパリンの効果域を評価", level: "info",
      when: function (F, V, D, ctx) { return C.has(ctx, "meds", "heparin") && C.num(V.aptt) != null; },
      basis: ["ヘパリン投与中", "APTT 測定あり"],
      note: "治療域の目安は対照値の1.5〜2.5倍（概ね45〜75秒）。延びすぎは出血、足りなければ血栓です。AT-IIIが70%未満だとヘパリンは効きにくくなります。",
      actions: ["APTT の目標域を指示で確認", "AT-III 値の確認", "血小板数の推移を確認（HIT の監視）", "採血は投与ルートと別の部位から"] },

    { id: "cg-fib-critical", name: "フィブリノゲン著減 — 止血能の破綻", level: "red",
      when: function (F) { return F.fib_critical; },
      basis: ["フィブリノゲン < 100 mg/dL"],
      note: "止血の最終段階の材料が枯渇しています。DIC、大量出血、L-アスパラギナーゼ、産科危機的出血で起こります。",
      actions: ["ただちに医師へ報告", "出血の全身観察", "クリオプレシピテート／新鮮凍結血漿の準備の可能性", "侵襲的処置の回避"] },

    { id: "cg-hyperfibrinolysis", name: "線溶亢進の所見", level: "red",
      when: function (F) { return F.fdp_veryhigh && F.fib_low; },
      basis: ["FDP ≧ 25 µg/mL", "フィブリノゲン低下"],
      note: "できた血栓が急速に溶かされており、出血に傾きます。線溶亢進型DIC（急性前骨髄球性白血病・大動脈瘤・前立腺癌・産科領域）で典型的です。",
      actions: ["ただちに医師へ報告", "出血の全身観察（特に穿刺部位のにじみ）", "基礎疾患の確認"] },

    { id: "cg-ddimer-high", name: "D-ダイマー高値 — 血栓の存在を示唆（ただし特異度は低い）", level: "amber",
      when: function (F) { return F.ddimer_veryhigh; },
      basis: ["D-ダイマー > 5.0 µg/mL"],
      note: "深部静脈血栓症・肺塞栓・大動脈解離・DIC・悪性腫瘍（Trousseau症候群）を示唆します。一方、高齢・炎症・術後・妊娠でも上がるため、これ単独では診断できません。脳梗塞では心原性塞栓や悪性腫瘍関連を示唆する所見になります。",
      actions: ["下肢の腫脹・疼痛・左右差（DVT）の観察", "突然の呼吸困難・胸痛・SpO₂低下（肺塞栓）の観察", "医師へ報告し画像検査の要否を確認", "安静度・弾性ストッキング・間欠的空気圧迫の指示を確認"] },

    { id: "cg-ddimer-neg", name: "D-ダイマー陰性 — 血栓症の可能性は低い", level: "info",
      when: function (F) { return F.ddimer_negative; },
      basis: ["D-ダイマー ≦ 1.0 µg/mL"],
      note: "陰性的中率が高い検査です。臨床的な事前確率が低〜中等度であれば、静脈血栓塞栓症はかなり否定的です。",
      actions: ["事前確率が高い場合は陰性でも否定しきれない点に注意"] },

    { id: "cg-at3", name: "アンチトロンビン低下", level: "amber",
      when: function (F) { return F.at3_verylow; },
      basis: ["AT-III < 70%"],
      note: "DIC・肝不全・ネフローゼ症候群・大量出血で低下します。この水準ではヘパリンの効果が著しく落ちます。",
      actions: ["ヘパリン使用中ならAPTTが延びない理由として報告", "肝機能・尿蛋白の確認"] },

    { id: "cg-plt-bleed", name: "血小板減少による出血リスク", level: "red",
      dedupeKey: "plt-critical",
      when: function (F) { return F.plt_critical; },
      basis: ["血小板 < 2万/µL"],
      note: "一次止血が成立しません。自然出血の危険域です。",
      actions: ["ただちに医師へ報告", "頭痛・意識変容・視野異常（頭蓋内出血）の観察", "採血後の圧迫延長、筋注・坐薬・剃刀の回避", "転倒予防"] },

    { id: "cg-fib-high", name: "フィブリノゲン高値（急性期反応）", level: "info",
      when: function (F) { return F.fib_high && !F.fdp_veryhigh; },
      basis: ["フィブリノゲン > 400 mg/dL"],
      note: "炎症の急性期反応蛋白として上昇します。感染・手術後・妊娠で見られ、それ自体は異常事態ではありません。",
      actions: ["CRP・炎症の経過と合わせて評価"] },

    { id: "cg-pregnancy", name: "妊娠による生理的変動を考慮", level: "info",
      when: function (F, V, D, ctx) { return ctx.pregnant && (F.ddimer_high || F.fib_high); },
      basis: ["妊娠中", "D-ダイマーまたはフィブリノゲン高値"],
      note: "妊娠中はフィブリノゲン・D-ダイマーが生理的に上昇し、通常の基準値では判定できません。一方で妊娠は血栓症そのもののリスクも高めるため、症状との照合が重要です。",
      actions: ["下肢腫脹・呼吸困難の観察", "産科医との情報共有"] }
  ];

  var presets = [
    { name: "敗血症性DIC", note: "JAAM 基準を満たす",
      values: { plt: 6.2, inr: 1.65, ptpct: 48, aptt: 52, fib: 118, fdp: 48, ddimer: 22.5, at3: 48, tat: 28, wbc: 19800 },
      context: { age: 71, sex: "m", vitals: { bt: 38.9, hr: 122, rr: 28 } } },
    { name: "ワルファリン過量", note: "PT単独延長・INR高値",
      values: { plt: 22.0, inr: 6.80, ptpct: 12, aptt: 38, fib: 310, fdp: 3.0, ddimer: 0.6, at3: 102 },
      context: { age: 78, sex: "f", meds: ["warfarin"], history: ["af"] } },
    { name: "血友病パターン", note: "APTT単独延長",
      values: { plt: 26.5, inr: 1.02, ptpct: 98, aptt: 78, fib: 295, fdp: 2.5, ddimer: 0.4, at3: 98 },
      context: { age: 22, sex: "m" } },
    { name: "ヘパリン治療域", note: "APTT 約2倍",
      values: { plt: 21.0, inr: 1.08, aptt: 62, fib: 320, fdp: 4.0, ddimer: 1.8, at3: 88 },
      context: { age: 66, sex: "m", meds: ["heparin"] } },
    { name: "肝不全の凝固障害", note: "PT・APTTともに延長",
      values: { plt: 7.8, inr: 2.40, ptpct: 32, aptt: 48, fib: 142, fdp: 12, ddimer: 4.2, at3: 38, tat: 9.0 },
      context: { age: 64, sex: "m", history: ["cirrhosis"] } },
    { name: "肺塞栓疑い", note: "D-ダイマー著増・凝固は正常",
      values: { plt: 24.0, inr: 1.05, aptt: 32, fib: 420, fdp: 18, ddimer: 12.4, at3: 95 },
      context: { age: 68, sex: "f", complaints: ["dyspnea", "chest_pain"], vitals: { hr: 112, rr: 26, spo2: 89 } } },
    { name: "線溶亢進型DIC", note: "FDP著増＋フィブリノゲン著減",
      values: { plt: 4.1, inr: 1.48, aptt: 44, fib: 68, fdp: 96, ddimer: 42.0, at3: 62, tat: 44 },
      context: { age: 55, sex: "m", history: ["malignancy"] } }
  ];

  C.register({
    id: "coag", title: "凝固・線溶", subtitle: "Coagulation",
    icon: "🩹", accent: "#d68b3a",
    groups: ["血小板", "外因系（PT）", "内因系（APTT）", "線溶・凝固因子"],
    analytes: analytes, derive: derive, findings: findings,
    patterns: patterns, presets: presets,
    derivedView: [
      { key: "jaamTotal", label: "急性期DIC診断基準 合計点", unit: "点", ref: "3点以下", decimals: 0 },
      { key: "apttRatio", label: "APTT 比（対照30秒比）", unit: "倍", ref: "1.5〜2.5が治療域", decimals: 2 },
      { key: "fdpFib", label: "FDP／フィブリノゲン比", unit: "%", ref: "低いほど良い", decimals: 1 }
    ],
    extraPanels: ["jaam"]
  });
})();
