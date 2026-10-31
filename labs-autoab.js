/*! labs-autoab.js — 自己抗体ドメイン
 *  膠原病・血管炎・抗リン脂質抗体症候群に加え、臓器特異的自己免疫
 *  （甲状腺・肝・神経筋・脱髄・自己免疫性脳炎・内分泌・皮膚）を収載する。
 *  基準値は測定系により異なるため全項目 facility:true とする。
 */
(function () {
  "use strict";
  var C = LabsCore;

  var POS = ["", "陰性", "陽性"];
  function q(key, label, group, note) {
    return { key: key, label: label, group: group, type: "qual", options: POS,
             facility: true, note: note || "" };
  }

  var analytes = [
    /* スクリーニング */
    { key: "ana", label: "抗核抗体（ANA）力価", group: "スクリーニング", type: "select",
      options: ["", "陰性（40倍未満）", "40倍", "80倍", "160倍", "320倍", "640倍", "1280倍以上"],
      positiveWhen: function (v) { return v && v !== "陰性（40倍未満）" && v !== "40倍"; },
      refText: "40倍未満", facility: true,
      note: "80倍以上を陽性と扱うのが一般的。健常者でも低力価陽性があるため力価と染色型をセットで読む" },
    { key: "anaPattern", label: "ANA 染色型", group: "スクリーニング", type: "select",
      options: ["", "homogeneous（均質型）", "speckled（斑紋型）", "nucleolar（核小体型）",
                "discrete speckled / centromere（セントロメア型）", "peripheral（辺縁型）", "cytoplasmic（細胞質型）"],
      positiveWhen: function () { return false; }, refText: "—", facility: true,
      note: "均質型→SLE・薬剤性ループス／斑紋型→Sm・RNP・SS-A/B／核小体型→強皮症／セントロメア型→限局皮膚硬化型" },
    { key: "c3", label: "補体 C3", unit: "mg/dL", group: "スクリーニング", ref: [73, 138], decimals: 0, placeholder: "95", facility: true },
    { key: "c4", label: "補体 C4", unit: "mg/dL", group: "スクリーニング", ref: [11, 31], decimals: 0, placeholder: "20", facility: true },
    { key: "ch50", label: "CH50（血清補体価）", unit: "U/mL", group: "スクリーニング", ref: [30, 50], decimals: 0, placeholder: "40", facility: true,
      note: "消費されて低下する。SLE の活動性評価に有用" },
    { key: "igg", label: "IgG", unit: "mg/dL", group: "スクリーニング", ref: [861, 1747], decimals: 0, placeholder: "1200", facility: true },
    { key: "igg4", label: "IgG4", unit: "mg/dL", group: "スクリーニング", ref: [11, 121], decimals: 0, placeholder: "50", facility: true,
      note: "135 mg/dL 以上で IgG4関連疾患を疑う" },
    { key: "sil2r", label: "可溶性IL-2レセプター", unit: "U/mL", group: "スクリーニング", ref: [122, 496], decimals: 0, placeholder: "300", facility: true,
      note: "リンパ腫・血球貪食症候群・活動性自己免疫疾患で上昇" },

    /* 膠原病特異抗体 */
    { key: "dsdna", label: "抗 dsDNA 抗体", unit: "IU/mL", group: "膠原病特異抗体", ref: [0, 12], decimals: 1, placeholder: "5", facility: true,
      note: "SLE に特異的。腎炎の活動性と相関する" },
    q("sm", "抗 Sm 抗体", "膠原病特異抗体", "SLE に高度に特異的（感度は低い）"),
    q("rnp", "抗 U1-RNP 抗体", "膠原病特異抗体", "高力価単独陽性なら混合性結合組織病（MCTD）"),
    q("ssa", "抗 SS-A/Ro 抗体", "膠原病特異抗体", "シェーグレン症候群・SLE。妊娠中は胎児房室ブロックに注意"),
    q("ssb", "抗 SS-B/La 抗体", "膠原病特異抗体", "シェーグレン症候群"),
    q("scl70", "抗 Scl-70（トポイソメラーゼI）抗体", "膠原病特異抗体", "びまん皮膚硬化型全身性強皮症。間質性肺疾患の合併が多い"),
    q("cent", "抗セントロメア抗体", "膠原病特異抗体", "限局皮膚硬化型全身性強皮症（CREST）。肺高血圧に注意"),
    q("rnapol3", "抗 RNAポリメラーゼIII 抗体", "膠原病特異抗体", "強皮症腎クリーゼのリスクが高い"),
    q("jo1", "抗 Jo-1（抗ARS）抗体", "膠原病特異抗体", "多発性筋炎・皮膚筋炎。間質性肺疾患・機械工の手"),
    q("mda5", "抗 MDA5 抗体", "膠原病特異抗体", "急速進行性間質性肺炎を伴う皮膚筋炎。予後不良"),
    q("tif1g", "抗 TIF1-γ 抗体", "膠原病特異抗体", "悪性腫瘍合併皮膚筋炎"),
    q("histone", "抗ヒストン抗体", "膠原病特異抗体", "薬剤性ループス"),

    /* 血管炎・抗リン脂質 */
    { key: "mpo", label: "MPO-ANCA（P-ANCA）", unit: "U/mL", group: "血管炎・抗リン脂質", ref: [0, 3.5], decimals: 1, placeholder: "1.0", facility: true,
      note: "顕微鏡的多発血管炎・好酸球性多発血管炎性肉芽腫症（EGPA）" },
    { key: "pr3", label: "PR3-ANCA（C-ANCA）", unit: "U/mL", group: "血管炎・抗リン脂質", ref: [0, 3.5], decimals: 1, placeholder: "1.0", facility: true,
      note: "多発血管炎性肉芽腫症（GPA）。上気道・肺・腎の三徴" },
    q("gbm", "抗 GBM（糸球体基底膜）抗体", "血管炎・抗リン脂質", "Goodpasture症候群。肺胞出血＋急速進行性糸球体腎炎で緊急"),
    q("acl", "抗カルジオリピン抗体", "血管炎・抗リン脂質", "抗リン脂質抗体症候群"),
    q("b2gpi", "抗カルジオリピン β2GPI 複合体抗体", "血管炎・抗リン脂質", "抗リン脂質抗体症候群に特異的"),
    q("la", "ループスアンチコアグラント", "血管炎・抗リン脂質", "名前に反して血栓に傾く。APTT が延長するのに出血しない"),

    /* 関節リウマチ */
    { key: "rf", label: "リウマトイド因子（RF）", unit: "IU/mL", group: "関節リウマチ", ref: [0, 15], decimals: 1, placeholder: "8", facility: true,
      note: "特異度は低く、感染・加齢・他の膠原病でも陽性になる" },
    { key: "ccp", label: "抗 CCP 抗体", unit: "U/mL", group: "関節リウマチ", ref: [0, 4.5], decimals: 1, placeholder: "2.0", facility: true,
      note: "関節リウマチに高度に特異的。発症前から陽性化することがある" },
    { key: "mmp3", label: "MMP-3", unit: "ng/mL", group: "関節リウマチ", ref: { m: [36.9, 121], f: [17.3, 59.7] }, decimals: 1, placeholder: "50", facility: true,
      note: "滑膜炎の活動性。ステロイドでも上昇する点に注意" },

    /* 甲状腺 */
    q("tpo", "抗 TPO（甲状腺ペルオキシダーゼ）抗体", "甲状腺", "橋本病（慢性甲状腺炎）"),
    q("tgab", "抗 サイログロブリン抗体", "甲状腺", "橋本病"),
    { key: "trab", label: "TRAb（TSH受容体抗体）", unit: "IU/L", group: "甲状腺", ref: [0, 2.0], decimals: 1, placeholder: "0.8", facility: true,
      note: "バセドウ病。甲状腺クリーゼの基礎疾患として重要" },

    /* 肝・消化器 */
    q("ama", "抗ミトコンドリア抗体（M2）", "肝・消化器", "原発性胆汁性胆管炎（PBC）。ALP・γ-GT 上昇と組み合わせて読む"),
    q("sma", "抗平滑筋抗体", "肝・消化器", "自己免疫性肝炎"),
    q("lkm1", "抗 LKM-1 抗体", "肝・消化器", "2型自己免疫性肝炎"),
    q("pca", "抗胃壁細胞抗体", "肝・消化器", "自己免疫性胃炎・悪性貧血"),
    q("if", "抗内因子抗体", "肝・消化器", "悪性貧血（ビタミンB12欠乏）"),

    /* 神経・筋 */
    { key: "achr", label: "抗 AChR（アセチルコリン受容体）抗体", unit: "nmol/L", group: "神経・筋",
      ref: [0, 0.2], decimals: 2, placeholder: "0.10", facility: true,
      note: "重症筋無力症の約80〜85%で陽性。クリーゼでは呼吸筋麻痺に注意" },
    q("musk", "抗 MuSK 抗体", "神経・筋", "AChR抗体陰性の重症筋無力症。球症状・呼吸筋障害が前面に出やすい"),
    q("aqp4", "抗 AQP4（アクアポリン4）抗体", "神経・筋", "視神経脊髄炎スペクトラム障害（NMOSD）。多発性硬化症とは治療が異なる"),
    q("mog", "抗 MOG 抗体", "神経・筋", "MOG抗体関連疾患（MOGAD）"),
    q("gm1", "抗 GM1 抗体", "神経・筋", "ギラン・バレー症候群（軸索型 AMAN）"),
    q("gq1b", "抗 GQ1b 抗体", "神経・筋", "Fisher症候群（外眼筋麻痺・失調・腱反射消失）"),
    q("nmdar", "抗 NMDA受容体抗体", "神経・筋", "自己免疫性脳炎。精神症状・痙攣・不随意運動・自律神経不安定。卵巣奇形腫の合併"),
    q("lgi1", "抗 LGI1 抗体", "神経・筋", "辺縁系脳炎。faciobrachial dystonic seizure・低Na血症を伴いやすい"),
    q("caspr2", "抗 CASPR2 抗体", "神経・筋", "Morvan症候群・辺縁系脳炎・神経筋過剰興奮"),
    q("hu", "抗 Hu 抗体", "神経・筋", "傍腫瘍性神経症候群（小細胞肺癌）"),
    q("yo", "抗 Yo 抗体", "神経・筋", "傍腫瘍性小脳変性症（卵巣癌・乳癌）"),
    q("ri", "抗 Ri 抗体", "神経・筋", "傍腫瘍性オプソクローヌス・ミオクローヌス"),

    /* 内分泌・皮膚 */
    { key: "gad", label: "抗 GAD 抗体", unit: "U/mL", group: "内分泌・皮膚", ref: [0, 5.0], decimals: 1, placeholder: "1.0", facility: true,
      note: "1型糖尿病・緩徐進行1型（SPIDDM）。高値ではスティッフパーソン症候群・自己免疫性小脳失調も" },
    q("ia2", "抗 IA-2 抗体", "内分泌・皮膚", "1型糖尿病"),
    q("dsg1", "抗デスモグレイン1 抗体", "内分泌・皮膚", "落葉状天疱瘡"),
    q("dsg3", "抗デスモグレイン3 抗体", "内分泌・皮膚", "尋常性天疱瘡（口腔内びらん）"),
    q("bp180", "抗 BP180 抗体", "内分泌・皮膚", "水疱性類天疱瘡。DPP-4阻害薬による薬剤性もある"),
    q("adrenal", "抗副腎皮質抗体", "内分泌・皮膚", "自己免疫性アジソン病")
  ];

  function derive(V, ctx) {
    var D = {}, n = C.num;
    var c3 = n(V.c3), c4 = n(V.c4), ch50 = n(V.ch50);
    var lowCount = 0, known = 0;
    if (c3 != null) { known++; if (c3 < 73) lowCount++; }
    if (c4 != null) { known++; if (c4 < 11) lowCount++; }
    if (ch50 != null) { known++; if (ch50 < 30) lowCount++; }
    D.complementLow = known > 0 && lowCount > 0;
    D.complementKnown = known;
    /* 陽性となった抗体をまとめる */
    var pos = [];
    analytes.forEach(function (a) {
      var v = V[a.key];
      if (a.type === "qual" && v === "陽性") pos.push(a.label);
      else if (a.type !== "qual" && a.type !== "select" && a.ref) {
        var num = C.num(v);
        var r = C.resolveRef(a, ctx);
        if (num != null && r && r[1] != null && num > r[1] && a.group !== "スクリーニング") pos.push(a.label);
      }
    });
    if (V.ana && V.ana !== "" && V.ana !== "陰性（40倍未満）" && V.ana !== "40倍") {
      pos.unshift("抗核抗体 " + V.ana);
    }
    D.positives = pos;
    D.positiveCount = pos.length;
    return D;
  }

  function isPos(V, key) { return V[key] === "陽性"; }
  function over(V, key, cut) { var n = C.num(V[key]); return n != null && n > cut; }
  function anaPos(V) {
    return V.ana && V.ana !== "" && V.ana !== "陰性（40倍未満）" && V.ana !== "40倍";
  }
  function anaHigh(V) {
    return V.ana === "320倍" || V.ana === "640倍" || V.ana === "1280倍以上";
  }

  function findings(V, D, ctx) {
    var F = {};
    if (anaPos(V)) F.ana_pos = true;
    if (anaHigh(V)) F.ana_high = true;
    if (over(V, "dsdna", 12)) F.dsdna_pos = true;
    if (isPos(V, "sm")) F.sm_pos = true;
    if (isPos(V, "rnp")) F.rnp_pos = true;
    if (isPos(V, "ssa")) F.ssa_pos = true;
    if (isPos(V, "ssb")) F.ssb_pos = true;
    if (isPos(V, "scl70")) F.scl70_pos = true;
    if (isPos(V, "cent")) F.cent_pos = true;
    if (isPos(V, "rnapol3")) F.rnapol3_pos = true;
    if (isPos(V, "jo1")) F.jo1_pos = true;
    if (isPos(V, "mda5")) F.mda5_pos = true;
    if (isPos(V, "tif1g")) F.tif1g_pos = true;
    if (isPos(V, "histone")) F.histone_pos = true;
    if (over(V, "mpo", 3.5)) F.mpo_pos = true;
    if (over(V, "pr3", 3.5)) F.pr3_pos = true;
    if (isPos(V, "gbm")) F.gbm_pos = true;
    if (isPos(V, "acl") || isPos(V, "b2gpi") || isPos(V, "la")) F.apl_pos = true;
    if (over(V, "rf", 15)) F.rf_pos = true;
    if (over(V, "ccp", 4.5)) F.ccp_pos = true;
    if (isPos(V, "tpo") || isPos(V, "tgab")) F.thyroid_ab_pos = true;
    if (over(V, "trab", 2.0)) F.trab_pos = true;
    if (isPos(V, "ama")) F.ama_pos = true;
    if (isPos(V, "sma") || isPos(V, "lkm1")) F.aih_ab_pos = true;
    if (isPos(V, "pca") || isPos(V, "if")) F.gastric_ab_pos = true;
    if (over(V, "achr", 0.2)) F.achr_pos = true;
    if (isPos(V, "musk")) F.musk_pos = true;
    if (isPos(V, "aqp4")) F.aqp4_pos = true;
    if (isPos(V, "mog")) F.mog_pos = true;
    if (isPos(V, "gm1")) F.gm1_pos = true;
    if (isPos(V, "gq1b")) F.gq1b_pos = true;
    if (isPos(V, "nmdar")) F.nmdar_pos = true;
    if (isPos(V, "lgi1")) F.lgi1_pos = true;
    if (isPos(V, "caspr2")) F.caspr2_pos = true;
    if (isPos(V, "hu") || isPos(V, "yo") || isPos(V, "ri")) F.paraneoplastic_pos = true;
    if (over(V, "gad", 5.0)) F.gad_pos = true;
    if (isPos(V, "ia2")) F.ia2_pos = true;
    if (isPos(V, "dsg1") || isPos(V, "dsg3")) F.pemphigus_pos = true;
    if (isPos(V, "bp180")) F.bp180_pos = true;
    if (isPos(V, "adrenal")) F.adrenal_pos = true;
    if (D.complementLow) F.complement_low = true;
    if (over(V, "igg4", 135)) F.igg4_high = true;
    if (over(V, "sil2r", 496)) F.sil2r_high = true;
    return F;
  }

  var patterns = [
    { id: "ab-sle", name: "全身性エリテマトーデス（SLE）を示唆する抗体プロファイル", level: "amber",
      when: function (F) { return F.ana_pos && (F.dsdna_pos || F.sm_pos); },
      basis: ["抗核抗体陽性", "抗dsDNA抗体または抗Sm抗体陽性"],
      note: "抗Sm抗体は特異度が高く、抗dsDNA抗体は腎炎の活動性と相関します。補体低下を伴えば活動期を示唆します。",
      actions: ["尿所見（蛋白尿・血尿・円柱）の確認 — ループス腎炎の検出", "補体（C3・C4・CH50）の確認", "発熱・皮疹・関節痛・漿膜炎・精神神経症状の観察", "感染とループス活動期の鑑別が常に課題になる点を共有"] },

    { id: "ab-sle-active", name: "SLE の活動性亢進を示唆（補体消費）", level: "red",
      when: function (F) { return F.dsdna_pos && F.complement_low; },
      basis: ["抗dsDNA抗体陽性", "補体低下"],
      note: "免疫複合体の形成で補体が消費されている状態。ループス腎炎・中枢神経ループスの活動期に対応します。",
      actions: ["医師へ報告", "尿量・尿蛋白・浮腫・血圧の評価", "意識・精神症状・痙攣（NPSLE）の観察", "免疫抑制療法の強化に伴う感染リスクの管理"] },

    { id: "ab-druglupus", name: "薬剤性ループスの可能性", level: "info",
      when: function (F, V) { return F.histone_pos && F.ana_pos && C.num(V.dsdna) != null && !F.dsdna_pos; },
      basis: ["抗ヒストン抗体陽性", "抗核抗体陽性", "抗dsDNA抗体陰性"],
      note: "被疑薬の中止で改善します。腎・中枢神経病変は稀です。",
      actions: ["被疑薬（ヒドララジン・プロカインアミド・抗TNF製剤・抗てんかん薬など）の確認"] },

    { id: "ab-mctd", name: "混合性結合組織病（MCTD）を示唆", level: "info",
      when: function (F, V) { return F.rnp_pos && V.sm === "陰性" && C.num(V.dsdna) != null && !F.dsdna_pos; },
      basis: ["抗U1-RNP抗体陽性・抗Sm／抗dsDNA抗体陰性"],
      note: "SLE・強皮症・多発性筋炎の所見が混在します。レイノー現象と手指の腫脹が特徴。肺高血圧症が予後を左右します。",
      actions: ["レイノー現象・手指腫脹の観察", "労作時呼吸困難（肺高血圧）の確認"] },

    { id: "ab-sjogren", name: "シェーグレン症候群を示唆", level: "info",
      when: function (F) { return F.ssa_pos || F.ssb_pos; },
      basis: ["抗SS-A/Ro 抗体または抗SS-B/La 抗体陽性"],
      note: "乾燥症状が中心ですが、間質性腎炎による尿細管性アシドーシス（低K血症）、間質性肺炎を合併します。妊娠例では胎児の先天性房室ブロックに注意が必要です。",
      actions: ["口腔・眼の乾燥症状の聴取", "低K血症の有無を確認", "妊娠の可能性があれば産科と共有"] },

    { id: "ab-ssc-diffuse", name: "びまん皮膚硬化型 全身性強皮症を示唆", level: "amber",
      when: function (F) { return F.scl70_pos; },
      basis: ["抗Scl-70（トポイソメラーゼI）抗体陽性"],
      note: "間質性肺疾患の合併が多く、予後を決めます。皮膚硬化は体幹に及びます。",
      actions: ["労作時呼吸困難・乾性咳嗽の観察", "SpO₂・呼吸数の確認", "逆流性食道炎・嚥下障害の確認"] },

    { id: "ab-ssc-limited", name: "限局皮膚硬化型 全身性強皮症（CREST）を示唆", level: "info",
      when: function (F) { return F.cent_pos; },
      basis: ["抗セントロメア抗体陽性"],
      note: "経過は緩徐ですが、肺動脈性肺高血圧症が晩期に出現し予後を左右します。",
      actions: ["レイノー現象・指尖潰瘍の観察", "労作時呼吸困難の確認"] },

    { id: "ab-renalcrisis", name: "強皮症腎クリーゼのリスクが高い", level: "red",
      when: function (F) { return F.rnapol3_pos; },
      basis: ["抗RNAポリメラーゼIII抗体陽性"],
      note: "急激な高血圧と急性腎障害を起こす緊急病態です。ステロイド高用量が誘因になりえます。",
      actions: ["血圧の頻回測定（急な上昇を見逃さない）", "腎機能・尿量の監視", "頭痛・視力障害・痙攣の観察", "ステロイド使用状況を医師と共有"] },

    { id: "ab-myositis", name: "炎症性筋疾患（多発性筋炎・皮膚筋炎）を示唆", level: "amber",
      when: function (F) { return F.jo1_pos || F.mda5_pos || F.tif1g_pos; },
      basis: ["抗ARS（Jo-1）／抗MDA5／抗TIF1-γ 抗体のいずれか陽性"],
      note: "抗体により表現型が大きく異なります。抗Jo-1は間質性肺疾患、抗MDA5は急速進行性間質性肺炎で予後不良、抗TIF1-γは悪性腫瘍の合併を強く示唆します。",
      actions: ["CK・筋力（近位筋）・嚥下機能の評価", "呼吸状態の観察（抗MDA5陽性では急変しうる）", "悪性腫瘍スクリーニングの状況を確認"] },

    { id: "ab-mda5", name: "抗MDA5抗体陽性 — 急速進行性間質性肺炎に警戒", level: "red",
      when: function (F) { return F.mda5_pos; },
      basis: ["抗MDA5抗体陽性"],
      note: "筋症状が軽くても肺病変が数週で急速に進行し、致死的になりえます。",
      actions: ["ただちに医師と共有", "SpO₂・呼吸数・労作時の低下を頻回に評価", "フェリチン値の推移を確認（上昇が増悪の指標）"] },

    { id: "ab-ra", name: "関節リウマチを示唆", level: "info",
      when: function (F, V) { return F.ccp_pos || (F.rf_pos && V.ana === "陰性（40倍未満）"); },
      basis: ["抗CCP抗体陽性（またはRF陽性）"],
      note: "抗CCP抗体は特異度が高く、骨びらん進行のリスク指標にもなります。RF単独陽性は感染・加齢・他疾患でも起こるため慎重に解釈します。",
      actions: ["朝のこわばりの持続時間・罹患関節の分布（対称性・小関節）を確認", "MMP-3・CRPで活動性を評価", "生物学的製剤使用時は結核・肺炎の感染リスクを管理"] },

    { id: "ab-mpa", name: "ANCA関連血管炎（MPO-ANCA型）を示唆", level: "red",
      when: function (F) { return F.mpo_pos; },
      basis: ["MPO-ANCA 陽性"],
      note: "顕微鏡的多発血管炎が代表。急速進行性糸球体腎炎と肺胞出血が二大緊急病態です。好酸球増多を伴えば好酸球性多発血管炎性肉芽腫症（EGPA）を考えます。",
      actions: ["ただちに医師へ報告", "尿所見（血尿・蛋白尿）と腎機能の推移を確認", "血痰・呼吸困難・SpO₂低下（肺胞出血）の観察", "末梢神経障害（しびれ・下垂足）の確認"] },

    { id: "ab-gpa", name: "多発血管炎性肉芽腫症（GPA）を示唆", level: "red",
      when: function (F) { return F.pr3_pos; },
      basis: ["PR3-ANCA 陽性"],
      note: "上気道（副鼻腔炎・鞍鼻）・肺（結節・空洞）・腎（糸球体腎炎）の三徴が特徴です。",
      actions: ["ただちに医師へ報告", "鼻出血・副鼻腔症状・難聴の確認", "血痰・呼吸状態の観察", "腎機能・尿所見の監視"] },

    { id: "ab-goodpasture", name: "抗GBM抗体陽性 — 緊急病態", level: "red",
      when: function (F) { return F.gbm_pos; },
      basis: ["抗GBM（糸球体基底膜）抗体陽性"],
      note: "肺胞出血と急速進行性糸球体腎炎を同時に起こします。血漿交換を含む治療開始の遅れが予後を直接悪化させます。",
      actions: ["ただちに医師へ報告", "喀血・呼吸困難・SpO₂の厳重監視", "尿量・腎機能の推移", "血漿交換・透析の準備状況を確認"] },

    { id: "ab-aps", name: "抗リン脂質抗体症候群を示唆", level: "amber",
      when: function (F) { return F.apl_pos; },
      basis: ["抗カルジオリピン抗体／抗β2GPI抗体／ループスアンチコアグラントのいずれか陽性"],
      note: "動静脈血栓症と習慣流産を起こします。ループスアンチコアグラントは APTT を延長させますが、出血ではなく血栓に傾くという逆説が臨床上の落とし穴です。APTT 延長を見て抗凝固を控えると、かえって血栓を招きます。",
      actions: ["血栓徴候（四肢腫脹・胸痛・呼吸困難・神経脱落症状）の観察", "APTT 延長を出血リスクと短絡しないこと", "抗凝固療法の指示と目標INRを確認", "妊娠歴（流産歴）の聴取"] },

    { id: "ab-mg", name: "重症筋無力症を示唆", level: "red",
      when: function (F) { return F.achr_pos || F.musk_pos; },
      basis: ["抗AChR抗体陽性 または 抗MuSK抗体陽性"],
      note: "日内変動する筋力低下が特徴（夕方に悪化）。最大の脅威は筋無力性クリーゼによる呼吸筋麻痺です。抗MuSK抗体型は球症状・呼吸筋障害が前面に出やすく、より注意が要ります。",
      actions: ["呼吸状態の評価（努力呼吸・浅速呼吸・咳の弱さ・%肺活量）", "嚥下機能・構音・誤嚥リスクの評価", "眼瞼下垂・複視の日内変動を記録", "増悪させる薬剤（アミノグリコシド・マクロライド・キノロン・β遮断薬・マグネシウム）の確認"] },

    { id: "ab-nmosd", name: "視神経脊髄炎スペクトラム障害（NMOSD）を示唆", level: "red",
      when: function (F) { return F.aqp4_pos; },
      basis: ["抗AQP4抗体陽性"],
      note: "多発性硬化症と鑑別が必要です。MSの一部の治療薬はNMOSDを増悪させるため、この抗体の有無が治療方針を分けます。視神経炎と長大な脊髄炎が特徴で、重度の後遺症を残しやすい疾患です。",
      actions: ["医師へ報告（MSとの治療方針の違いを共有）", "視力・視野の変化を記録", "脊髄症状（感覚レベル・四肢麻痺・膀胱直腸障害）の評価", "頑固なしゃっくり・嘔吐（最後野症候群）に注意"] },

    { id: "ab-mogad", name: "MOG抗体関連疾患（MOGAD）を示唆", level: "amber",
      when: function (F) { return F.mog_pos; },
      basis: ["抗MOG抗体陽性"],
      note: "視神経炎・急性散在性脳脊髄炎（ADEM）・脊髄炎を起こします。ステロイド反応性が良好な一方、減量時の再発が多いのが特徴です。",
      actions: ["視力・意識・麻痺の経過観察", "ステロイド減量期の再発に注意"] },

    { id: "ab-gbs", name: "ギラン・バレー症候群／Fisher症候群を示唆", level: "red",
      when: function (F) { return F.gm1_pos || F.gq1b_pos; },
      basis: ["抗GM1抗体 または 抗GQ1b抗体陽性"],
      note: "上行性の弛緩性麻痺が進行し、呼吸筋麻痺と自律神経障害（不整脈・血圧変動）が命に関わります。抗GQ1b抗体陽性は外眼筋麻痺・失調・腱反射消失を呈するFisher症候群を示唆します。",
      actions: ["呼吸機能の頻回評価（%肺活量・単一呼吸での発語数・努力呼吸）", "嚥下・construction 咳嗽力の評価と誤嚥予防", "自律神経症状（血圧変動・不整脈）のモニタリング", "麻痺の上行速度を経時記録", "深部静脈血栓予防"] },

    { id: "ab-encephalitis", name: "自己免疫性脳炎を示唆", level: "red",
      when: function (F) { return F.nmdar_pos || F.lgi1_pos || F.caspr2_pos; },
      basis: ["抗NMDA受容体抗体／抗LGI1抗体／抗CASPR2抗体のいずれか陽性"],
      note: "精神症状で発症し精神疾患と誤られることがあります。抗NMDA受容体脳炎は若年女性に多く卵巣奇形腫を合併、痙攣・不随意運動・自律神経不安定・中枢性低換気へ進行します。抗LGI1脳炎は特徴的な短い発作（faciobrachial dystonic seizure）と低Na血症を伴います。",
      actions: ["ただちに医師へ報告", "意識レベル・精神症状・痙攣の経時記録", "自律神経不安定（血圧・心拍の激しい変動・中枢性低換気）の監視", "抗LGI1陽性ではNa値を確認", "転倒・自傷の安全確保", "腫瘍検索の状況を確認"] },

    { id: "ab-paraneoplastic", name: "傍腫瘍性神経症候群 — 背景に悪性腫瘍の可能性", level: "red",
      when: function (F) { return F.paraneoplastic_pos; },
      basis: ["抗Hu／抗Yo／抗Ri 抗体のいずれか陽性"],
      note: "神経症状が腫瘍の発見に先行することが多く、抗体の種類が原発巣を示唆します（抗Hu→小細胞肺癌、抗Yo→卵巣癌・乳癌）。",
      actions: ["医師へ報告（悪性腫瘍スクリーニングの状況を確認）", "神経症状（失調・感覚性ニューロパチー・不随意運動）の経時記録", "誤嚥・転倒の予防"] },

    { id: "ab-hashimoto", name: "橋本病（慢性甲状腺炎）を示唆", level: "info",
      when: function (F, V) { return F.thyroid_ab_pos && C.num(V.trab) != null && !F.trab_pos; },
      basis: ["抗TPO抗体 または 抗サイログロブリン抗体陽性"],
      note: "機能低下に傾けば、徐脈・低体温・便秘・浮腫・うつ・認知機能低下が出ます。高齢者では認知症と誤られることがあります。重症では粘液水腫性昏睡。",
      actions: ["甲状腺機能（TSH・FT4）の確認", "徐脈・低体温・活動性低下・便秘の観察", "低Na血症の有無を確認"] },

    { id: "ab-graves", name: "バセドウ病を示唆", level: "amber",
      when: function (F) { return F.trab_pos; },
      basis: ["TRAb（TSH受容体抗体）陽性"],
      note: "甲状腺クリーゼ（発熱・頻脈・心不全・意識障害）が最大の緊急病態で、感染・手術・ヨード造影剤が誘因になります。",
      actions: ["脈拍・体温・不整脈（心房細動）の監視", "体重減少・発汗・手指振戦・眼症状の観察", "造影剤使用予定があれば医師と共有"] },

    { id: "ab-pbc", name: "原発性胆汁性胆管炎（PBC）を示唆", level: "info",
      when: function (F) { return F.ama_pos; },
      basis: ["抗ミトコンドリア抗体（M2）陽性"],
      note: "中年女性に多く、ALP・γ-GTの上昇と掻痒感が初発症状になります。",
      actions: ["ALP・γ-GT・ビリルビンの確認", "掻痒感・黄疸・倦怠感の聴取", "骨粗鬆症・脂溶性ビタミン欠乏の評価"] },

    { id: "ab-aih", name: "自己免疫性肝炎を示唆", level: "amber",
      when: function (F) { return F.aih_ab_pos; },
      basis: ["抗平滑筋抗体 または 抗LKM-1抗体陽性"],
      note: "IgG高値・ANA陽性を伴うことが多く、急性肝炎様に発症して劇症化することがあります。",
      actions: ["AST・ALT・ビリルビン・PT-INR の推移を確認", "意識レベル（肝性脳症）の観察"] },

    { id: "ab-pernicious", name: "自己免疫性胃炎・悪性貧血を示唆", level: "info",
      when: function (F) { return F.gastric_ab_pos; },
      basis: ["抗胃壁細胞抗体 または 抗内因子抗体陽性"],
      note: "ビタミンB12欠乏による大球性貧血と神経症状（亜急性連合性脊髄変性症：深部感覚障害・歩行失調）を起こします。神経症状は貧血に先行することがあります。",
      actions: ["MCV・ビタミンB12の確認", "しびれ・歩行障害・深部感覚（振動覚・位置覚）の評価", "転倒リスクの評価"] },

    { id: "ab-t1dm", name: "1型糖尿病（自己免疫性）を示唆", level: "info",
      when: function (F) { return F.gad_pos || F.ia2_pos; },
      basis: ["抗GAD抗体 または 抗IA-2抗体陽性"],
      note: "インスリン分泌が枯渇するためケトアシドーシスのリスクがあります。抗GAD抗体が著明高値の場合は、スティッフパーソン症候群・自己免疫性小脳失調といった神経疾患も鑑別に入ります。",
      actions: ["インスリン中断がケトアシドーシスに直結する点を共有", "シックデイ対応の確認", "抗GAD著明高値なら筋強剛・失調など神経症状も確認"] },

    { id: "ab-pemphigus", name: "天疱瘡を示唆", level: "amber",
      when: function (F) { return F.pemphigus_pos; },
      basis: ["抗デスモグレイン1 または 3 抗体陽性"],
      note: "表皮内水疱・びらんを生じ、広範囲では熱傷に準じた体液喪失と感染リスクを伴います。抗Dsg3は口腔内びらんが主体で摂食困難になります。",
      actions: ["皮膚・粘膜のびらん範囲の記録", "疼痛・摂食状況・栄養の評価", "創部感染と体液バランスの管理"] },

    { id: "ab-bp", name: "水疱性類天疱瘡を示唆", level: "info",
      when: function (F) { return F.bp180_pos; },
      basis: ["抗BP180抗体陽性"],
      note: "高齢者に多い緊満性水疱。DPP-4阻害薬による薬剤性の報告があり、内服歴の確認が重要です。",
      actions: ["DPP-4阻害薬の内服歴を確認", "水疱・掻痒の範囲と感染徴候の観察"] },

    { id: "ab-igg4", name: "IgG4関連疾患を示唆", level: "info",
      when: function (F) { return F.igg4_high; },
      basis: ["IgG4 > 135 mg/dL"],
      note: "膵・胆管・涙腺唾液腺・後腹膜など多臓器の腫大を起こします。悪性腫瘍との鑑別が重要です。",
      actions: ["臓器腫大の有無（黄疸・腹痛・唾液腺腫脹）を確認"] },

    { id: "ab-screening-neg", name: "スクリーニング陰性 — 膠原病の可能性は低い", level: "info",
      when: function (F, V, D) {
        return V.ana === "陰性（40倍未満）" && ["mpo", "pr3", "ccp"].every(function (k) { return C.num(V[k]) != null; }) && D && D.positiveCount === 0;
      },
      basis: ["抗核抗体陰性", "ANCA・抗CCP抗体も陰性"],
      note: "抗核抗体陰性は多くの膠原病を否定する方向に働きます。ただし、ANCA関連血管炎や抗リン脂質抗体症候群はANA陰性でも起こります。",
      actions: ["症状が続く場合は非免疫性の原因（感染・悪性腫瘍・薬剤）を検討"] }
  ];

  var presets = [
    { name: "SLE（活動期）", note: "ANA高力価＋抗dsDNA＋補体低下",
      values: { ana: "1280倍以上", anaPattern: "homogeneous（均質型）", dsdna: 186, sm: "陽性", rnp: "陽性", ssa: "陽性", c3: 42, c4: 6, ch50: 14, igg: 2240 },
      context: { age: 27, sex: "f", complaints: ["fever", "joint_pain", "rash"] } },
    { name: "関節リウマチ", note: "抗CCP高値＋RF陽性",
      values: { ana: "80倍", rf: 142, ccp: 288, mmp3: 310, igg: 1680, c3: 118, c4: 28 },
      context: { age: 56, sex: "f", complaints: ["joint_pain"] } },
    { name: "全身性強皮症（びまん型）", note: "抗Scl-70陽性",
      values: { ana: "640倍", anaPattern: "speckled（斑紋型）", scl70: "陽性", c3: 102, c4: 24 },
      context: { age: 49, sex: "f", complaints: ["dyspnea"] } },
    { name: "シェーグレン症候群", note: "抗SS-A/SS-B陽性",
      values: { ana: "320倍", anaPattern: "speckled（斑紋型）", ssa: "陽性", ssb: "陽性", igg: 2080, rf: 48 },
      context: { age: 61, sex: "f" } },
    { name: "ANCA関連血管炎（MPA）", note: "MPO-ANCA高値",
      values: { ana: "陰性（40倍未満）", mpo: 184, pr3: 1.0, c3: 108, c4: 26 },
      context: { age: 73, sex: "m", complaints: ["fever", "oliguria"] } },
    { name: "重症筋無力症", note: "抗AChR抗体陽性",
      values: { achr: 18.4, musk: "陰性", ana: "陰性（40倍未満）" },
      context: { age: 44, sex: "f", complaints: ["fatigue", "numbness"] } },
    { name: "視神経脊髄炎（NMOSD）", note: "抗AQP4抗体陽性",
      values: { aqp4: "陽性", mog: "陰性", ana: "160倍", ssa: "陽性" },
      context: { age: 38, sex: "f", complaints: ["numbness", "paralysis"] } },
    { name: "ギラン・バレー症候群", note: "抗GM1抗体陽性",
      values: { gm1: "陽性", gq1b: "陰性", ana: "陰性（40倍未満）" },
      context: { age: 52, sex: "m", complaints: ["paralysis", "numbness"] } },
    { name: "抗NMDA受容体脳炎", note: "若年女性の精神症状＋痙攣",
      values: { nmdar: "陽性", lgi1: "陰性", ana: "陰性（40倍未満）" },
      context: { age: 23, sex: "f", complaints: ["consciousness", "convulsion"] } },
    { name: "橋本病", note: "抗TPO・抗Tg陽性",
      values: { tpo: "陽性", tgab: "陽性", trab: 0.6, ana: "80倍" },
      context: { age: 48, sex: "f", complaints: ["fatigue"] } },
    { name: "バセドウ病", note: "TRAb高値",
      values: { trab: 14.2, tpo: "陽性", ana: "陰性（40倍未満）" },
      context: { age: 32, sex: "f", vitals: { hr: 118 } } },
    { name: "原発性胆汁性胆管炎", note: "抗ミトコンドリアM2抗体陽性",
      values: { ama: "陽性", ana: "160倍", igg: 1820, sma: "陰性" },
      context: { age: 58, sex: "f", complaints: ["fatigue", "jaundice"] } },
    { name: "抗リン脂質抗体症候群", note: "APTT延長するのに血栓に傾く",
      values: { acl: "陽性", b2gpi: "陽性", la: "陽性", ana: "160倍", aptt: 56 },
      context: { age: 34, sex: "f" } }
  ];

  C.register({
    id: "autoab", title: "自己抗体", subtitle: "Autoantibodies",
    icon: "🧬", accent: "#9b7fe0",
    groups: ["スクリーニング", "膠原病特異抗体", "血管炎・抗リン脂質", "関節リウマチ",
             "甲状腺", "肝・消化器", "神経・筋", "内分泌・皮膚"],
    analytes: analytes, derive: derive, findings: findings,
    patterns: patterns, presets: presets,
    derivedView: [
      { key: "positiveCount", label: "陽性となった自己抗体の数", unit: "項目", ref: "—", decimals: 0 }
    ]
  });
})();
