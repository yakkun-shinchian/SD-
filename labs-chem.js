/*! labs-chem.js — 生化学ドメイン
 *  基準値: JCCLS 共用基準範囲（成人）。未収載項目は facility:true を付す。
 *  脳神経領域（Na異常の鑑別・抗てんかん薬の影響）と ICU（乳酸・PCT）を重点的に収載。
 */
(function () {
  "use strict";
  var C = LabsCore;

  var analytes = [
    /* 肝・胆道 */
    { key: "ast", label: "AST（GOT）", unit: "U/L", group: "肝・胆道", ref: [13, 30], decimals: 0, placeholder: "22" },
    { key: "alt", label: "ALT（GPT）", unit: "U/L", group: "肝・胆道", ref: { m: [10, 42], f: [7, 23] }, decimals: 0, placeholder: "20" },
    { key: "ld", label: "LD（LDH・IFCC法）", unit: "U/L", group: "肝・胆道", ref: [124, 222], decimals: 0, placeholder: "180",
      note: "溶血・組織崩壊・腫瘍でも上昇する非特異的指標" },
    { key: "alp", label: "ALP（IFCC法）", unit: "U/L", group: "肝・胆道", ref: [38, 113], decimals: 0, placeholder: "80",
      note: "IFCC法。旧JSCC法の値とは異なる（JSCC ≒ IFCC × 約3）" },
    { key: "ggt", label: "γ-GT（γ-GTP）", unit: "U/L", group: "肝・胆道", ref: { m: [13, 64], f: [9, 32] }, decimals: 0, placeholder: "30" },
    { key: "tbil", label: "総ビリルビン", unit: "mg/dL", group: "肝・胆道", ref: [0.4, 1.5], panic: { high: 15 }, decimals: 1, placeholder: "0.8" },
    { key: "dbil", label: "直接ビリルビン", unit: "mg/dL", group: "肝・胆道", ref: [0, 0.4], decimals: 1, placeholder: "0.2", facility: true },
    { key: "che", label: "ChE（コリンエステラーゼ）", unit: "U/L", group: "肝・胆道", ref: { m: [240, 486], f: [201, 421] }, decimals: 0, placeholder: "300",
      note: "肝の蛋白合成能を映す。低栄養・肝硬変で低下" },
    { key: "tp", label: "総蛋白", unit: "g/dL", group: "肝・胆道", ref: [6.6, 8.1], decimals: 1, placeholder: "7.2" },
    { key: "alb", label: "アルブミン", unit: "g/dL", group: "肝・胆道", ref: [4.1, 5.1], decimals: 1, placeholder: "4.3" },
    { key: "nh3", label: "アンモニア（NH₃）", unit: "µg/dL", group: "肝・胆道", ref: [12, 66], panic: { high: 150 }, decimals: 0, placeholder: "40", facility: true,
      note: "意識障害の鑑別に必須。バルプロ酸内服でも上昇する" },

    /* 腎・尿酸 */
    { key: "bun", label: "尿素窒素（BUN・UN）", unit: "mg/dL", group: "腎・尿酸", ref: [8, 20], decimals: 1, placeholder: "14" },
    { key: "cr", label: "クレアチニン", unit: "mg/dL", group: "腎・尿酸", ref: { m: [0.65, 1.07], f: [0.46, 0.79] }, panic: { high: 5.0 }, decimals: 2, placeholder: "0.80" },
    { key: "ua", label: "尿酸", unit: "mg/dL", group: "腎・尿酸", ref: { m: [3.7, 7.8], f: [2.6, 5.5] }, decimals: 1, placeholder: "5.0" },

    /* 電解質・ミネラル */
    { key: "na", label: "ナトリウム（Na）", unit: "mmol/L", group: "電解質・ミネラル", ref: [138, 145], panic: { low: 120, high: 160 }, decimals: 0, placeholder: "140" },
    { key: "k", label: "カリウム（K）", unit: "mmol/L", group: "電解質・ミネラル", ref: [3.6, 4.8], panic: { low: 2.5, high: 6.5 }, decimals: 1, placeholder: "4.0" },
    { key: "cl", label: "クロール（Cl）", unit: "mmol/L", group: "電解質・ミネラル", ref: [101, 108], decimals: 0, placeholder: "104" },
    { key: "ca", label: "カルシウム（Ca）", unit: "mg/dL", group: "電解質・ミネラル", ref: [8.8, 10.1], decimals: 1, placeholder: "9.3" },
    { key: "ip", label: "無機リン（P）", unit: "mg/dL", group: "電解質・ミネラル", ref: [2.7, 4.6], decimals: 1, placeholder: "3.5" },
    { key: "mg", label: "マグネシウム（Mg）", unit: "mg/dL", group: "電解質・ミネラル", ref: [1.8, 2.4], decimals: 1, placeholder: "2.1", facility: true },
    { key: "hco3", label: "重炭酸イオン（HCO₃⁻）", unit: "mmol/L", group: "電解質・ミネラル", ref: [22, 26], decimals: 1, placeholder: "24", facility: true,
      note: "血液ガスから。アニオンギャップ計算に使う" },

    /* 代謝・栄養 */
    { key: "glu", label: "血糖（グルコース）", unit: "mg/dL", group: "代謝・栄養", ref: [73, 109], panic: { low: 50, high: 500 }, decimals: 0, placeholder: "95" },
    { key: "hba1c", label: "HbA1c（NGSP）", unit: "%", group: "代謝・栄養", ref: [4.9, 6.0], decimals: 1, placeholder: "5.5" },
    { key: "tcho", label: "総コレステロール", unit: "mg/dL", group: "代謝・栄養", ref: [142, 248], decimals: 0, placeholder: "200" },
    { key: "ldl", label: "LDL コレステロール", unit: "mg/dL", group: "代謝・栄養", ref: [65, 163], decimals: 0, placeholder: "120" },
    { key: "hdl", label: "HDL コレステロール", unit: "mg/dL", group: "代謝・栄養", ref: { m: [38, 90], f: [48, 103] }, decimals: 0, placeholder: "60" },
    { key: "tg", label: "中性脂肪（TG）", unit: "mg/dL", group: "代謝・栄養", ref: { m: [40, 234], f: [30, 117] }, decimals: 0, placeholder: "120" },

    /* 心・筋 */
    { key: "ck", label: "CK（CPK）", unit: "U/L", group: "心・筋", ref: { m: [59, 248], f: [41, 153] }, panic: { high: 5000 }, decimals: 0, placeholder: "120" },
    { key: "ckmb", label: "CK-MB", unit: "U/L", group: "心・筋", ref: [0, 25], decimals: 0, placeholder: "10", facility: true },
    { key: "tnt", label: "トロポニン（I または T）", unit: "ng/mL", group: "心・筋", ref: [0, 0.014], decimals: 3, placeholder: "0.010", facility: true,
      note: "高感度測定。カットオフは測定系ごとに異なる" },
    { key: "bnp", label: "BNP", unit: "pg/mL", group: "心・筋", ref: [0, 18.4], decimals: 1, placeholder: "15", facility: true },
    { key: "ntprobnp", label: "NT-proBNP", unit: "pg/mL", group: "心・筋", ref: [0, 125], decimals: 0, placeholder: "80", facility: true },

    /* 膵 */
    { key: "amy", label: "アミラーゼ（AMY）", unit: "U/L", group: "膵", ref: [44, 132], decimals: 0, placeholder: "80" },
    { key: "lip", label: "リパーゼ", unit: "U/L", group: "膵", ref: [13, 55], decimals: 0, placeholder: "30", facility: true,
      note: "膵特異性はアミラーゼより高い" },

    /* 炎症・感染 */
    { key: "crp", label: "CRP", unit: "mg/dL", group: "炎症・感染", ref: [0, 0.14], decimals: 2, placeholder: "0.05" },
    { key: "pct", label: "プロカルシトニン（PCT）", unit: "ng/mL", group: "炎症・感染", ref: [0, 0.05], decimals: 2, placeholder: "0.03", facility: true,
      note: "細菌感染・敗血症でウイルス感染より強く上昇する" },
    { key: "lac", label: "乳酸（ラクテート）", unit: "mmol/L", group: "炎症・感染", ref: [0.5, 1.6], panic: { high: 4.0 }, decimals: 1, placeholder: "1.0", facility: true,
      note: "組織低灌流の指標。敗血症性ショックの診断に使う" },

    /* 神経・体液（脳外科／神経内科で重要） */
    { key: "sosm", label: "血清浸透圧（実測）", unit: "mOsm/kg", group: "神経・体液", ref: [275, 290], decimals: 0, placeholder: "285", facility: true },
    { key: "uosm", label: "尿浸透圧", unit: "mOsm/kg", group: "神経・体液", ref: [50, 1300], decimals: 0, placeholder: "500", facility: true,
      note: "低Na血症の鑑別の要。100以下なら水分過剰、300以上ならADH作用あり" },
    { key: "una", label: "尿中ナトリウム（随時尿）", unit: "mmol/L", group: "神経・体液", ref: [20, 220], decimals: 0, placeholder: "60", facility: true,
      note: "30以上なら腎からのNa喪失（SIADH・CSWS・利尿薬）を示唆" },
    { key: "usg", label: "尿比重", unit: "", group: "神経・体液", ref: [1.005, 1.030], decimals: 3, placeholder: "1.015", facility: true }
  ];

  function derive(V, ctx) {
    var D = {};
    var cr = C.num(V.cr), na = C.num(V.na), cl = C.num(V.cl), hco3 = C.num(V.hco3);
    var ca = C.num(V.ca), alb = C.num(V.alb), bun = C.num(V.bun), glu = C.num(V.glu);
    var ast = C.num(V.ast), alt = C.num(V.alt), sosm = C.num(V.sosm);

    D.egfr = C.egfr(cr, C.num(ctx.age), ctx.sex);
    D.cca = C.correctedCa(ca, alb);
    D.ag = C.anionGap(na, cl, hco3);
    D.osmCalc = C.calcOsm(na, glu, bun);
    if (sosm != null && D.osmCalc != null) D.osmGap = sosm - D.osmCalc;
    D.bunCr = C.ratio(bun, cr);
    D.deRitis = C.ratio(ast, alt);
    if (C.num(V.tbil) != null && C.num(V.dbil) != null) D.ibil = C.num(V.tbil) - C.num(V.dbil);
    return D;
  }

  function findings(V, D, ctx) {
    var F = {};
    var n = C.num;
    var na = n(V.na), k = n(V.k), glu = n(V.glu), cr = n(V.cr), crp = n(V.crp);

    /* 電解質 */
    if (na != null) {
      if (na < 135) F.hypona = true;
      if (na < 130) F.hypona_mod = true;
      if (na < 125) F.hypona_severe = true;
      if (na > 145) F.hyperna = true;
      if (na > 155) F.hyperna_severe = true;
    }
    if (k != null) {
      if (k < 3.5) F.hypok = true;
      if (k < 3.0) F.hypok_severe = true;
      if (k > 5.0) F.hyperk = true;
      if (k > 6.0) F.hyperk_severe = true;
    }
    if (D.cca != null) {
      if (D.cca > 10.4) F.hyperca = true;
      if (D.cca > 12) F.hyperca_severe = true;
      if (D.cca < 8.5) F.hypoca = true;
      if (D.cca < 7.0) F.hypoca_severe = true;
    }
    if (n(V.mg) != null) {
      if (n(V.mg) < 1.8) F.hypomg = true;
      if (n(V.mg) > 2.4) F.hypermg = true;
    }
    if (n(V.ip) != null) {
      if (n(V.ip) > 4.6) F.hyperp = true;
      if (n(V.ip) < 2.7) F.hypop = true;
    }
    if (D.ag != null && D.ag > 12) F.ag_high = true;

    /* 腎 */
    if (D.egfr != null) {
      if (D.egfr < 60) F.renal_impair = true;
      if (D.egfr < 30) F.renal_severe = true;
      if (D.egfr < 15) F.renal_endstage = true;
    }
    if (cr != null && cr > (ctx.sex === "f" ? 0.79 : 1.07)) F.cr_high = true;
    if (D.bunCr != null && D.bunCr > 20) F.buncr_high = true;
    if (n(V.ua) != null && n(V.ua) > (ctx.sex === "f" ? 5.5 : 7.8)) F.ua_high = true;

    /* 肝 */
    var ast = n(V.ast), alt = n(V.alt);
    var altHi = ctx.sex === "f" ? 23 : 42;
    if ((ast != null && ast > 30) || (alt != null && alt > altHi)) F.transaminase_high = true;
    if ((ast != null && ast > 300) || (alt != null && alt > 300)) F.transaminase_veryhigh = true;
    if (n(V.alp) != null && n(V.alp) > 113) F.alp_high = true;
    if (n(V.ggt) != null && n(V.ggt) > (ctx.sex === "f" ? 32 : 64)) F.ggt_high = true;
    if (F.alp_high && F.ggt_high) F.cholestasis = true;
    if (n(V.tbil) != null && n(V.tbil) > 1.5) F.bil_high = true;
    if (D.ibil != null && D.ibil > 1.0) F.ibil_high = true;
    if (n(V.alb) != null && n(V.alb) < 4.1) F.alb_low = true;
    if (n(V.alb) != null && n(V.alb) < 3.0) F.alb_verylow = true;
    if (n(V.che) != null && n(V.che) < (ctx.sex === "f" ? 201 : 240)) F.che_low = true;
    if (n(V.nh3) != null && n(V.nh3) > 66) F.nh3_high = true;
    if (n(V.nh3) != null && n(V.nh3) > 150) F.nh3_veryhigh = true;
    if (n(V.ld) != null && n(V.ld) > 222) F.ld_high = true;

    /* 代謝 */
    if (glu != null) {
      if (glu < 70) F.hypoglycemia = true;
      if (glu < 50) F.hypoglycemia_severe = true;
      if (glu > 140) F.hyperglycemia = true;
      if (glu > 250) F.hyperglycemia_severe = true;
      if (glu > 600) F.hyperglycemia_extreme = true;
    }
    if (n(V.hba1c) != null && n(V.hba1c) >= 6.5) F.hba1c_dm = true;

    /* 心・筋 */
    if (n(V.ck) != null) {
      if (n(V.ck) > (ctx.sex === "f" ? 153 : 248)) F.ck_high = true;
      if (n(V.ck) > 1000) F.ck_veryhigh = true;
      if (n(V.ck) > 5000) F.rhabdo_range = true;
    }
    if (n(V.tnt) != null && n(V.tnt) > 0.014) F.troponin_high = true;
    if (n(V.bnp) != null && n(V.bnp) > 100) F.bnp_high = true;
    if (n(V.ntprobnp) != null && n(V.ntprobnp) > 400) F.bnp_high = true;

    /* 膵 */
    if (n(V.amy) != null && n(V.amy) > 132) F.amy_high = true;
    if (n(V.amy) != null && n(V.amy) > 396) F.amy_veryhigh = true;
    if (n(V.lip) != null && n(V.lip) > 165) F.lip_veryhigh = true;

    /* 炎症 */
    if (crp != null) {
      if (crp > 0.3) F.crp_high = true;
      if (crp > 5) F.crp_veryhigh = true;
    }
    if (n(V.pct) != null && n(V.pct) >= 0.5) F.pct_high = true;
    if (n(V.pct) != null && n(V.pct) >= 2.0) F.pct_veryhigh = true;
    if (n(V.lac) != null && n(V.lac) >= 2.0) F.lactate_high = true;
    if (n(V.lac) != null && n(V.lac) >= 4.0) F.lactate_critical = true;

    /* 尿所見（低Na鑑別用） */
    if (n(V.uosm) != null) {
      if (n(V.uosm) > 300) F.uosm_high = true;
      if (n(V.uosm) <= 100) F.uosm_low = true;
    }
    if (n(V.una) != null) {
      if (n(V.una) >= 30) F.una_high = true;
      if (n(V.una) < 20) F.una_low = true;
    }
    return F;
  }

  var patterns = [
    /* ---- 電解質：緊急度が高い順 ---- */
    { id: "ch-hyperk", name: "高カリウム血症 — 致死性不整脈のリスク", level: "red",
      when: function (F) { return F.hyperk_severe; },
      basis: ["K > 6.0 mmol/L"],
      note: "心室細動・心停止に直結します。溶血による偽性高K血症（採血時の駆血が強い・細い針）も必ず鑑別してください。",
      actions: ["ただちに医師へ報告", "12誘導心電図（テント状T波・QRS幅延長・P波消失）", "心電図モニター装着", "カリウム含有輸液・食品の中止確認", "再採血で偽性高K血症を否定"] },

    { id: "ch-hypok", name: "低カリウム血症", level: "amber",
      when: function (F) { return F.hypok_severe; },
      basis: ["K < 3.0 mmol/L"],
      note: "不整脈・筋力低下・腸管麻痺を起こします。Mgが低いとKは補正されにくいので、Mgも同時に確認してください。",
      actions: ["医師へ報告", "心電図（U波出現・QT延長）", "Mg値の確認", "利尿薬・下痢・嘔吐・インスリンの関与を確認", "カリウム製剤のワンショット静注は禁忌"] },

    { id: "ch-hypona-severe", name: "重度低ナトリウム血症 — 脳浮腫・痙攣のリスク", level: "red",
      when: function (F) { return F.hypona_severe; },
      basis: ["Na < 125 mmol/L"],
      note: "意識障害・痙攣を起こしえます。補正が速すぎると浸透圧性脱髄症候群（ODS）を招くため、補正速度の管理が決定的に重要です（目安 24時間で 8〜10 mmol/L 以内）。",
      actions: ["ただちに医師へ報告", "意識レベル・痙攣の観察", "補正速度の指示を確認し、Na の再検タイミングを守る", "水分出納・尿量の厳密測定"] },

    { id: "ch-siadh", name: "SIADH（抗利尿ホルモン不適合分泌）を疑う", level: "amber",
      when: function (F, V, D, ctx) { return F.hypona && F.uosm_high && F.una_high; },
      basis: ["低Na血症", "尿浸透圧 > 300 mOsm/kg", "尿中Na ≧ 30 mmol/L"],
      note: "体液量が正常〜やや過剰なのが特徴。中枢神経疾患（くも膜下出血・髄膜炎・脳外傷）、肺疾患、薬剤（カルバマゼピン・SSRI）が原因になります。治療は水制限が基本で、CSWSとは逆向きです。",
      actions: ["体重・水分出納・浮腫・ツルゴールで体液量を評価（CSWSとの切り分けの要）", "水分制限の指示を確認", "カルバマゼピン等の被疑薬を確認", "意識レベルの経時観察"] },

    { id: "ch-csws", name: "中枢性塩類喪失症候群（CSWS）との鑑別を", level: "amber",
      when: function (F, V, D, ctx) {
        return F.hypona && F.una_high && (C.has(ctx, "history", "stroke") || C.has(ctx, "history", "neurosurg") || C.has(ctx, "complaints", "consciousness"));
      },
      basis: ["低Na血症", "尿中Na高値", "中枢神経疾患の背景"],
      note: "SIADH と検査所見がほぼ同じでありながら、治療が正反対になる重要な鑑別です。CSWS は体液量が減少（多尿・体重減少・脱水所見）し、治療は生理食塩水による補充。SIADH に水制限をかけるつもりで CSWS を絞れば、脳血流が落ちて致命的になりえます。",
      actions: ["体液量の評価を最優先（体重推移・尿量・中心静脈圧・ツルゴール）", "尿量が多く体重が減っていれば CSWS 寄り", "医師へ体液量所見を具体的に報告"] },

    { id: "ch-hypona-dilut", name: "希釈性低Na（水分過剰）を疑う", level: "info",
      when: function (F) { return F.hypona && F.uosm_low; },
      basis: ["低Na血症", "尿浸透圧 ≦ 100 mOsm/kg"],
      note: "腎は正しく水を捨てようとしています。多飲・低張輸液の過剰が原因のことが多いです。",
      actions: ["輸液内容（維持液の張度）を確認", "飲水量の聴取"] },

    { id: "ch-hypona-workup", name: "低Na血症の鑑別に尿検査が必要", level: "info",
      when: function (F, V) { return F.hypona && C.num(V.uosm) == null && C.num(V.una) == null; },
      basis: ["低Na血症", "尿浸透圧・尿中Na が未測定"],
      note: "低Na血症は原因によって治療が正反対になります。尿浸透圧と尿中Naがないと鑑別できません。",
      actions: ["尿浸透圧・尿中Na の測定を提案（Na補正を始める前の採取が望ましい）", "体重・水分出納・浮腫の記録"] },

    { id: "ch-di", name: "尿崩症を疑う", level: "amber",
      when: function (F, V) { return F.hyperna && (F.uosm_low || (C.num(V.usg) != null && C.num(V.usg) < 1.005)); },
      basis: ["高Na血症", "尿が希釈されている（尿浸透圧低値／尿比重低値）"],
      note: "下垂体・視床下部の術後、頭部外傷、脳死に近い病態で起こります。大量の希釈尿が出続け、急速に高Na血症が進みます。",
      actions: ["ただちに医師へ報告", "時間尿量の厳密測定（200 mL/hr 超が続くか）", "水分出納・体重・血清Naの頻回確認", "デスモプレシン投与指示の確認"] },

    { id: "ch-hyperna", name: "高ナトリウム血症", level: "amber",
      when: function (F) { return F.hyperna_severe; },
      basis: ["Na > 155 mmol/L"],
      note: "ほぼ常に「水が足りない」状態です。自由に水を飲めない患者（意識障害・挿管・高齢）で進行します。",
      actions: ["医師へ報告", "水分出納・不感蒸泄（発熱・多呼吸）の評価", "経管からの白湯追加や自由水補給の指示を確認", "補正は緩徐に（急速補正は脳浮腫を招く）"] },

    { id: "ch-mannitol", name: "浸透圧利尿薬の影響を考慮", level: "info",
      when: function (F, V, D, ctx) { return C.has(ctx, "meds", "mannitol") && (F.hyperna || F.renal_impair || D.osmGap > 10); },
      basis: ["マンニトール／グリセオール投与中"],
      note: "浸透圧利尿により自由水が失われ高Na血症に傾き、浸透圧ギャップが開きます。腎機能低下例では蓄積して急性腎障害を起こすことがあります。",
      actions: ["血清浸透圧・浸透圧ギャップの確認", "腎機能・尿量の監視", "投与間隔と総投与量の確認"] },

    { id: "ch-hyperca", name: "高カルシウム血症", level: "red",
      when: function (F) { return F.hyperca_severe; },
      basis: ["補正Ca > 12 mg/dL"],
      note: "意識障害・多尿・脱水・不整脈を起こします。悪性腫瘍（骨転移・PTHrP）と原発性副甲状腺機能亢進症が二大原因です。",
      actions: ["ただちに医師へ報告", "意識レベル・脱水所見の観察", "心電図（QT短縮）", "生理食塩水による補液の指示を確認"] },

    { id: "ch-hypoca", name: "低カルシウム血症", level: "amber",
      when: function (F) { return F.hypoca_severe; },
      basis: ["補正Ca < 7.0 mg/dL"],
      note: "テタニー・痙攣・喉頭痙攣を起こしえます。甲状腺／副甲状腺術後、大量輸血、急性膵炎、腫瘍崩壊症候群で生じます。",
      actions: ["医師へ報告", "トルソー徴候・クヴォステック徴候の確認", "しびれ・筋痙攣・喉頭狭窄音の観察", "心電図（QT延長）"] },

    { id: "ch-hypomg", name: "低マグネシウム血症", level: "info",
      when: function (F) { return F.hypomg; },
      basis: ["Mg < 1.8 mg/dL"],
      note: "低K・低Caを「治らなくさせる」隠れた原因です。Mgを補正しないとKもCaも上がりません。PPI長期内服・利尿薬・アルコール・下痢が原因。",
      actions: ["K・Caの補正が効かない場合はMgを疑う", "PPI・利尿薬の内服歴を確認"] },

    /* ---- 腎 ---- */
    { id: "ch-aki", name: "腎機能低下 — 急性か慢性かの切り分けを", level: "amber",
      when: function (F) { return F.renal_severe; },
      basis: ["eGFR < 30 mL/min/1.73m²"],
      note: "過去のCr値との比較が決定的です。急性なら原因（腎前性・腎性・腎後性）の検索、慢性なら薬剤の腎排泄調整が焦点になります。",
      actions: ["過去のCr値との比較", "尿量の測定（0.5 mL/kg/hr 未満が6時間続けばAKI）", "腎排泄性薬剤（抗菌薬・造影剤・NSAIDs）の確認", "尿閉の確認（膀胱エコー・導尿）"] },

    { id: "ch-prerenal", name: "腎前性（脱水・循環血液量減少）を疑う", level: "info",
      when: function (F, V, D) { return F.buncr_high && !F.anemia; },
      basis: ["BUN/Cr比 > 20"],
      note: "脱水・心拍出量低下・ステロイド・高蛋白負荷でBUNが優位に上がります。",
      actions: ["水分出納・体重・皮膚ツルゴール・口腔乾燥の評価", "血圧・脈拍（起立性変化）の確認"] },

    { id: "ch-gib", name: "消化管出血の可能性 — BUN優位上昇＋貧血", level: "amber",
      when: function (F, V, D, ctx) {
        var hb = C.num(V.hb);
        var lo = ctx.sex === "f" ? 11.6 : 13.7;
        return F.buncr_high && hb != null && hb < lo;
      },
      basis: ["BUN/Cr比 > 20", "貧血"],
      note: "腸管内の血液が蛋白として吸収されBUNが上がります。貧血と組み合わさると消化管出血を強く示唆します。",
      actions: ["黒色便・吐血・下血の確認", "バイタル（頻脈・血圧低下・起立性低血圧）", "医師へ報告、内視鏡の準備の可能性", "抗血栓薬の内服確認"] },

    /* ---- 肝 ---- */
    { id: "ch-hepatocellular", name: "肝細胞障害型の肝機能異常", level: "amber",
      when: function (F, V, D) { return F.transaminase_high && !F.cholestasis; },
      basis: ["AST／ALT 上昇", "胆道系酵素の優位な上昇なし"],
      note: "ウイルス性肝炎・薬剤性肝障害・虚血性肝炎・アルコールを鑑別します。AST/ALT比（De Ritis比）が2以上ならアルコール性や肝硬変、1未満なら慢性肝炎を示唆します。",
      actions: ["新規開始薬・サプリメント・市販薬の確認", "飲酒歴の聴取", "黄疸・倦怠感・食思不振の観察"] },

    { id: "ch-cholestasis", name: "胆汁うっ滞型の肝機能異常", level: "amber",
      when: function (F) { return F.cholestasis; },
      basis: ["ALP 上昇", "γ-GT 上昇"],
      note: "胆道閉塞（総胆管結石・腫瘍）、薬剤性、原発性胆汁性胆管炎を鑑別します。発熱＋右季肋部痛＋黄疸（Charcot三徴）があれば急性胆管炎で緊急です。",
      actions: ["Charcot三徴（発熱・腹痛・黄疸）の確認 — 揃えば緊急", "便色の白色化・尿の濃染の観察", "腹部エコーの検討を提案"] },

    { id: "ch-cholangitis", name: "急性胆管炎を疑う（Charcot三徴）", level: "red",
      when: function (F, V, D, ctx) {
        var fever = F.fever || C.has(ctx, "complaints", "fever");
        return F.cholestasis && F.bil_high && fever &&
               (C.has(ctx, "complaints", "abd_pain") || C.has(ctx, "complaints", "jaundice"));
      },
      basis: ["胆汁うっ滞（ALP・γ-GT上昇）", "黄疸", "発熱", "腹痛または黄疸の自覚"],
      note: "発熱・右季肋部痛・黄疸の三徴がそろう緊急病態です。胆道は閉鎖腔のため、胆汁がうっ滞すると細菌が一気に血中へ押し出され、短時間で敗血症性ショックに至ります。意識障害とショックが加われば Reynolds 五徴で、緊急ドレナージの適応です。",
      actions: ["ただちに医師へ報告", "血圧・意識レベルの頻回確認（Reynolds五徴への進展を見逃さない）",
                "血液培養2セットの採取状況を確認", "絶飲食と緊急ドレナージ（ERCP・PTGBD）の準備を確認",
                "抗菌薬投与のタイミングを確認"] },

    { id: "ch-liverfailure", name: "肝予備能の低下（肝硬変・肝不全）を示唆", level: "red",
      when: function (F) {
        // 合成能（ChE・PT）または解毒能（NH3）の低下を必須条件とする。
        // これがないと急性胆管炎や敗血症の低Alb＋黄疸を肝不全と誤判定する。
        var synthetic = F.che_low || F.pt_prolonged || F.nh3_high;
        return synthetic && F.alb_low && (F.bil_high || F.transaminase_high);
      },
      basis: ["アルブミン低下", "ChE低下・PT延長・アンモニア上昇のいずれか", "黄疸または肝逸脱酵素上昇"],
      note: "蛋白合成能の低下を示します。凝固能（PT-INR）と血小板を必ず併せて評価してください。",
      actions: ["医師へ報告", "PT-INR・血小板の確認", "肝性脳症（羽ばたき振戦・見当識障害・昼夜逆転）の観察", "出血傾向・腹水・浮腫の評価"] },

    { id: "ch-nh3", name: "高アンモニア血症 — 意識障害の原因となりうる", level: "red",
      when: function (F) { return F.nh3_veryhigh; },
      basis: ["アンモニア > 150 µg/dL"],
      note: "肝性脳症を起こします。採血後に時間が経つと偽高値になるため、氷冷・速やかな提出が必要です。",
      actions: ["ただちに医師へ報告", "意識レベル（JCS/GCS）・羽ばたき振戦の評価", "便通の確認（便秘は増悪因子）", "誤嚥・転倒の予防"] },

    { id: "ch-vpa-nh3", name: "バルプロ酸による高アンモニア血症の可能性", level: "amber",
      when: function (F, V, D, ctx) { return F.nh3_high && C.has(ctx, "meds", "vpa"); },
      basis: ["アンモニア高値", "バルプロ酸内服中"],
      note: "バルプロ酸は肝障害がなくてもアンモニアを上げ、意識障害・傾眠を起こします（VPA誘発性高アンモニア血症性脳症）。肝性脳症と取り違えやすい重要な鑑別です。",
      actions: ["医師へ報告（バルプロ酸血中濃度の測定を提案）", "意識レベル・傾眠・痙攣頻度の変化を観察", "カルニチン欠乏の関与を確認"] },

    { id: "ch-cbz-na", name: "カルバマゼピンによる低Na血症の可能性", level: "amber",
      when: function (F, V, D, ctx) { return F.hypona && C.has(ctx, "meds", "cbz"); },
      basis: ["低Na血症", "カルバマゼピン内服中"],
      note: "カルバマゼピンは SIADH 様の機序で低Na血症を起こします。高齢者・長期内服で頻度が上がります。",
      actions: ["医師へ報告", "ふらつき・傾眠・痙攣閾値低下の観察", "血中濃度の確認を提案"] },

    /* ---- 代謝 ---- */
    { id: "ch-hypoglycemia", name: "低血糖 — ただちに対応が必要", level: "red",
      when: function (F) { return F.hypoglycemia_severe; },
      basis: ["血糖 < 50 mg/dL"],
      note: "不可逆的な脳障害を起こしえます。発汗・頻脈・振戦などの交感神経症状は、β遮断薬内服中や無自覚性低血糖では出ません。",
      actions: ["ただちにブドウ糖投与（意識があれば経口、なければ静注）の指示を確認", "医師へ報告", "15分後に再検", "インスリン・SU薬の投与歴と食事摂取量を確認"] },

    { id: "ch-dka", name: "糖尿病性ケトアシドーシス（DKA）を疑う", level: "red",
      when: function (F, V, D) { return F.hyperglycemia_severe && F.ag_high; },
      basis: ["著明な高血糖", "アニオンギャップ開大"],
      note: "インスリン作用の絶対的不足による代謝性アシドーシスです。脱水・電解質異常を伴い、見かけのKが正常でも体内総Kは枯渇しています。",
      actions: ["ただちに医師へ報告", "意識レベル・呼吸（Kussmaul大呼吸）・アセトン臭の確認", "尿／血中ケトンの確認", "K値の頻回測定（インスリン投与で急落する）", "大量輸液の準備"] },

    { id: "ch-hhs", name: "高浸透圧高血糖状態（HHS）を疑う", level: "red",
      when: function (F, V, D) { return F.hyperglycemia_extreme && !F.ag_high; },
      basis: ["血糖 > 600 mg/dL", "アニオンギャップ開大なし"],
      note: "高齢2型糖尿病に多く、著明な脱水と高浸透圧で意識障害を来します。死亡率はDKAより高いです。",
      actions: ["ただちに医師へ報告", "意識レベル・脱水所見の評価", "血清浸透圧の確認", "輸液の準備"] },

    /* ---- 心・筋 ---- */
    { id: "ch-troponin", name: "心筋傷害を示唆", level: "red",
      when: function (F) { return F.troponin_high; },
      basis: ["トロポニン上昇"],
      note: "急性冠症候群だけでなく、心筋炎・肺塞栓・敗血症・腎不全・頻脈でも上昇します。経時変化（上昇／下降パターン）が鑑別の鍵です。",
      actions: ["ただちに医師へ報告", "12誘導心電図", "胸痛の性状・持続時間の聴取（高齢・糖尿病では無痛性のことがある）", "トロポニンの再検タイミングを確認", "モニター装着・安静"] },

    { id: "ch-rhabdo", name: "横紋筋融解症を疑う", level: "red",
      when: function (F) { return F.rhabdo_range; },
      basis: ["CK > 5000 U/L"],
      note: "ミオグロビンによる急性腎障害と高K血症が最大の脅威です。長時間の臥床・痙攣・外傷・スタチン・熱中症が原因になります。K・P・尿酸の上昇とCa低下という腫瘍崩壊症候群と同じ電解質パターンを示すため、背景での鑑別が要ります。",
      actions: ["ただちに医師へ報告", "尿の色調（赤褐色）の観察", "K値・腎機能の頻回確認", "尿量の厳密測定", "大量輸液の指示を確認"] },

    { id: "ch-statin-ck", name: "スタチンによるCK上昇の可能性", level: "info",
      when: function (F, V, D, ctx) { return F.ck_high && C.has(ctx, "meds", "statin"); },
      basis: ["CK上昇", "スタチン内服中"],
      note: "筋痛・脱力を伴う場合は中止を検討する水準です。フィブラート併用で危険が増します。",
      actions: ["筋痛・脱力・暗色尿の聴取", "医師へ報告"] },

    { id: "ch-bnp", name: "心負荷の上昇（心不全を示唆）", level: "amber",
      when: function (F) { return F.bnp_high; },
      basis: ["BNP または NT-proBNP 高値"],
      note: "心不全の可能性を示します。腎機能低下・高齢・心房細動でも上昇するため、症状・体重・浮腫と合わせて評価します。",
      actions: ["呼吸困難・起坐呼吸・夜間発作性呼吸困難の確認", "体重推移・浮腫・頸静脈怒張の観察", "SpO₂・呼吸数・水分出納の確認"] },

    /* ---- 膵 ---- */
    { id: "ch-pancreatitis", name: "急性膵炎を疑う", level: "red",
      when: function (F) { return F.amy_veryhigh || F.lip_veryhigh; },
      basis: ["アミラーゼまたはリパーゼが基準上限の3倍以上"],
      note: "上腹部痛・背部への放散痛を伴えば急性膵炎の可能性が高いです。重症化すると低Ca血症・腎障害・呼吸不全を来します。",
      actions: ["ただちに医師へ報告", "腹痛の部位・性状・背部放散の確認", "絶飲食の指示を確認", "Ca・腎機能・呼吸状態の監視"] },

    /* ---- 炎症・敗血症 ---- */
    { id: "ch-lactate", name: "乳酸高値 — 組織低灌流を示唆", level: "red",
      when: function (F) { return F.lactate_critical; },
      basis: ["乳酸 ≧ 4.0 mmol/L"],
      note: "敗血症性ショックの診断基準に含まれる値です。血圧が保たれていても組織レベルでは酸素が足りていない可能性があります（潜在性ショック）。",
      actions: ["ただちに医師へ報告", "血圧・脈拍・尿量・末梢冷感・毛細血管再充満時間の評価", "乳酸の再検タイミングを確認", "血液培養・輸液・抗菌薬の指示を確認"] },

    { id: "ch-bacterial-inf", name: "細菌感染を示唆（PCT高値）", level: "amber",
      when: function (F) { return F.pct_high; },
      basis: ["プロカルシトニン ≧ 0.5 ng/mL"],
      note: "ウイルス感染では上がりにくく、細菌感染・敗血症で上昇します。腎不全でも上がる点に注意。",
      actions: ["感染巣の検索", "血液培養の採取状況を確認", "抗菌薬開始のタイミングを確認"] },

    { id: "ch-inflammation", name: "炎症反応の上昇", level: "info",
      when: function (F) { return F.crp_veryhigh; },
      basis: ["CRP > 5 mg/dL"],
      note: "CRPは発症から上昇までに半日〜1日の遅れがあります。発症直後は低くても感染を否定できません。",
      actions: ["発熱・局所所見・バイタルを合わせて評価", "感染巣の検索"] },

    /* ---- 栄養 ---- */
    { id: "ch-malnutrition", name: "低栄養・蛋白低下", level: "info",
      when: function (F) { return F.alb_verylow; },
      basis: ["アルブミン < 3.0 g/dL"],
      note: "低栄養のほか、炎症・肝不全・ネフローゼ・蛋白漏出性胃腸症でも低下します。創傷治癒遅延・浮腫・薬物の蛋白結合率変化（ワルファリン等で効果増強）に影響します。",
      actions: ["食事摂取量・体重推移の記録", "浮腫・褥瘡リスクの評価", "蛋白結合率の高い薬剤の効果増強に注意"] },

    { id: "ch-tls", name: "腫瘍崩壊症候群（TLS）を疑う", level: "red",
      when: function (F, V, D, ctx) {
        var background = C.has(ctx, "history", "malignancy") || C.has(ctx, "history", "hematologic") ||
                         C.has(ctx, "meds", "chemo") || F.blasts;
        return F.hyperk && F.hyperp && F.ua_high && F.hypoca && background;
      },
      basis: ["K上昇", "P上昇", "尿酸上昇", "Ca低下", "悪性腫瘍・化学療法の背景"],
      note: "化学療法開始後24〜72時間に多く、急性腎障害と致死性不整脈を起こします。横紋筋融解症も同じ電解質パターンを示すため、背景で切り分けます。",
      actions: ["ただちに医師へ報告", "心電図モニター", "尿量の厳密測定", "大量輸液・ラスブリカーゼ等の指示を確認"] }
  ];

  var presets = [
    { name: "敗血症（ICU）", note: "炎症＋乳酸＋腎障害",
      values: { ast: 68, alt: 52, ld: 410, tbil: 2.1, alb: 2.6, bun: 42, cr: 2.10, na: 134, k: 4.6, cl: 100, ca: 7.9, glu: 168, crp: 18.5, pct: 8.4, lac: 4.8, hco3: 17 },
      context: { age: 74, sex: "m", vitals: { bt: 38.8, sbp: 86, hr: 118, rr: 26, spo2: 92 }, complaints: ["fever", "consciousness"] } },
    { name: "SIADH（くも膜下出血後）", note: "低Na＋尿浸透圧高＋尿中Na高",
      values: { na: 122, k: 4.0, cl: 88, bun: 8.2, cr: 0.62, alb: 3.8, sosm: 254, uosm: 620, una: 78, usg: 1.020 },
      context: { age: 58, sex: "f", history: ["stroke"], complaints: ["headache", "consciousness"] } },
    { name: "中枢性塩類喪失症候群", note: "低Na＋多尿＋体重減少",
      values: { na: 124, k: 3.8, cl: 90, bun: 24, cr: 0.95, alb: 3.9, sosm: 258, uosm: 480, una: 95, usg: 1.012 },
      context: { age: 62, sex: "m", history: ["stroke", "neurosurg"], complaints: ["consciousness"] } },
    { name: "尿崩症（下垂体術後）", note: "高Na＋希釈尿",
      values: { na: 158, k: 4.1, cl: 120, bun: 26, cr: 0.88, sosm: 322, uosm: 85, una: 18, usg: 1.002 },
      context: { age: 45, sex: "f", history: ["neurosurg"] } },
    { name: "肝硬変", note: "低Alb・ChE低下・黄疸・NH3上昇",
      values: { ast: 86, alt: 54, ld: 240, alp: 148, ggt: 92, tbil: 3.4, dbil: 1.9, che: 118, tp: 6.1, alb: 2.4, nh3: 128, bun: 9.0, cr: 0.72, na: 131, k: 3.9, plt: 7.2, inr: 1.72, fib: 148, hb: 9.8, rbc: 3.10, ht: 30.0 },
      context: { age: 67, sex: "m", history: ["cirrhosis"], complaints: ["consciousness", "jaundice"] } },
    { name: "糖尿病性ケトアシドーシス", note: "高血糖＋AG開大",
      values: { glu: 520, hba1c: 11.2, na: 130, k: 5.4, cl: 92, hco3: 8, bun: 32, cr: 1.45, crp: 2.1, ca: 8.9, alb: 4.0 },
      context: { age: 24, sex: "m", history: ["dm"], complaints: ["consciousness", "vomiting"], vitals: { rr: 28, hr: 124, sbp: 98 } } },
    { name: "横紋筋融解症", note: "CK著増＋AKI＋高K",
      values: { ck: 42000, ckmb: 180, ast: 520, alt: 240, ld: 980, bun: 48, cr: 2.80, k: 6.2, ca: 7.2, ip: 6.8, ua: 11.2, alb: 3.6 },
      context: { age: 81, sex: "f", complaints: ["fatigue"], meds: ["statin"] } },
    { name: "腫瘍崩壊症候群", note: "K・P・UA上昇＋Ca低下",
      values: { k: 6.4, ip: 7.2, ua: 14.5, ca: 7.0, alb: 3.4, cr: 2.40, bun: 38, ld: 2400 },
      context: { age: 52, sex: "m", history: ["malignancy"], meds: ["chemo"] } },
    { name: "急性胆管炎", note: "胆汁うっ滞＋炎症",
      values: { ast: 180, alt: 220, alp: 410, ggt: 380, tbil: 5.8, dbil: 4.2, crp: 14.2, pct: 3.8, alb: 3.4, bun: 22, cr: 1.10 },
      context: { age: 70, sex: "f", vitals: { bt: 39.2, sbp: 96 }, complaints: ["fever", "abd_pain", "jaundice"] } },
    { name: "バルプロ酸性高アンモニア血症", note: "肝酵素正常でNH3高値",
      values: { ast: 26, alt: 22, tbil: 0.7, alb: 4.0, nh3: 185, na: 138, k: 4.2, glu: 96 },
      context: { age: 34, sex: "m", meds: ["vpa"], complaints: ["consciousness"] } }
  ];

  C.register({
    id: "chem", title: "生化学", subtitle: "Biochemistry",
    icon: "🧪", accent: "#4aa3e8",
    groups: ["肝・胆道", "腎・尿酸", "電解質・ミネラル", "代謝・栄養", "心・筋", "膵", "炎症・感染", "神経・体液"],
    analytes: analytes, derive: derive, findings: findings,
    patterns: patterns, presets: presets,
    derivedView: [
      { key: "egfr", label: "eGFR（日本人推算式）", unit: "mL/min/1.73m²", ref: "60以上", decimals: 1 },
      { key: "cca", label: "補正カルシウム（Payne式）", unit: "mg/dL", ref: "8.8〜10.1", decimals: 2 },
      { key: "ag", label: "アニオンギャップ", unit: "mmol/L", ref: "12以下", decimals: 1 },
      { key: "osmCalc", label: "推算血清浸透圧", unit: "mOsm/kg", ref: "275〜290", decimals: 0 },
      { key: "osmGap", label: "浸透圧ギャップ（実測−推算）", unit: "mOsm/kg", ref: "10以下", decimals: 1 },
      { key: "bunCr", label: "BUN／Cr 比", unit: "", ref: "10〜20", decimals: 1 },
      { key: "deRitis", label: "AST／ALT 比（De Ritis比）", unit: "", ref: "1前後", decimals: 2 },
      { key: "ibil", label: "間接ビリルビン", unit: "mg/dL", ref: "1.0以下", decimals: 2 }
    ]
  });
})();
