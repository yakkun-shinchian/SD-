/*! labs-cbc.js — 血算（CBC）ドメイン
 *  基準値: JCCLS 共用基準範囲（成人）
 */
(function () {
  "use strict";
  var C = LabsCore;

  var analytes = [
    { key: "wbc", label: "WBC 白血球数", unit: "/µL", group: "白血球系",
      ref: [3300, 8600], panic: { low: 1000, high: 30000 }, decimals: 0, placeholder: "6500" },
    { key: "neut", label: "好中球（分葉核＋桿状核）", unit: "%", group: "白血球分画",
      ref: [38, 74], decimals: 1, placeholder: "60" },
    { key: "lymph", label: "リンパ球", unit: "%", group: "白血球分画",
      ref: [16, 49], decimals: 1, placeholder: "30" },
    { key: "mono", label: "単球", unit: "%", group: "白血球分画",
      ref: [2, 10], decimals: 1, placeholder: "6" },
    { key: "eo", label: "好酸球", unit: "%", group: "白血球分画",
      ref: [0, 7], decimals: 1, placeholder: "2" },
    { key: "baso", label: "好塩基球", unit: "%", group: "白血球分画",
      ref: [0, 2], decimals: 1, placeholder: "0.5" },
    { key: "blast", label: "芽球", unit: "%", group: "白血球分画",
      ref: [0, 0], decimals: 1, placeholder: "0", note: "出現自体が異常。血液内科コンサルトの対象" },
    { key: "atyp", label: "異型リンパ球", unit: "%", group: "白血球分画",
      ref: [0, 0], decimals: 1, placeholder: "0", note: "ウイルス感染で出現" },

    { key: "rbc", label: "RBC 赤血球数", unit: "×10⁶/µL", group: "赤血球系",
      ref: { m: [4.35, 5.55], f: [3.86, 4.92] }, decimals: 2, placeholder: "4.50" },
    { key: "hb", label: "Hb ヘモグロビン", unit: "g/dL", group: "赤血球系",
      ref: { m: [13.7, 16.8], f: [11.6, 14.8] }, panic: { low: 6.0, high: 20.0 },
      decimals: 1, placeholder: "13.5" },
    { key: "ht", label: "Ht ヘマトクリット", unit: "%", group: "赤血球系",
      ref: { m: [40.7, 50.1], f: [35.1, 44.4] }, decimals: 1, placeholder: "41.0" },
    { key: "rdw", label: "RDW 赤血球大小不同", unit: "%", group: "赤血球系",
      ref: [11.5, 14.5], decimals: 1, placeholder: "13.0", facility: true,
      note: "鉄欠乏では早期から上昇する" },
    { key: "retic", label: "網赤血球", unit: "%", group: "赤血球系",
      ref: [0.5, 2.0], decimals: 2, placeholder: "1.0", facility: true,
      note: "骨髄の造血反応をみる。貧血の鑑別に必須" },

    { key: "plt", label: "PLT 血小板数", unit: "×10⁴/µL（万）", group: "血小板",
      ref: [15.8, 34.8], panic: { low: 2.0, high: 100 }, decimals: 1, placeholder: "25.0",
      note: "JCCLS 158〜348 ×10³/µL を万単位に換算" }
  ];

  function derive(V, ctx) {
    var hb = C.num(V.hb), ht = C.num(V.ht), rbc = C.num(V.rbc), wbc = C.num(V.wbc);
    var D = {};
    if (ht != null && rbc) D.mcv = ht * 10 / rbc;
    if (hb != null && rbc) D.mch = hb * 10 / rbc;
    if (hb != null && ht) D.mchc = hb / ht * 100;
    if (wbc != null) {
      var n = C.num(V.neut);
      if (n != null) D.anc = wbc * n / 100;
      var ly = C.num(V.lymph);
      if (ly != null) D.alc = wbc * ly / 100;
      if (n != null && ly) D.nlr = (n / ly);
    }
    // RBC（×10⁶/µL）× 網赤血球(%)/100 ×10⁶ = rbc × 10000 × retic
    if (C.num(V.retic) != null && rbc) D.reticAbs = rbc * 10000 * C.num(V.retic); // /µL
    return D;
  }

  function findings(V, D, ctx) {
    var F = {};
    var sex = ctx.sex === "f" ? "f" : "m";
    var hb = C.num(V.hb), plt = C.num(V.plt), wbc = C.num(V.wbc);
    var hbLo = sex === "f" ? 11.6 : 13.7;

    if (hb != null) {
      if (hb < hbLo) F.anemia = true;
      if (hb < 8) F.anemia_moderate = true;
      if (hb < 6) F.anemia_severe = true;
      if (hb > (sex === "f" ? 14.8 : 16.8)) F.polycythemia = true;
    }
    if (D.mcv != null) {
      if (D.mcv < 83.6) F.microcytic = true;
      else if (D.mcv > 98.2) F.macrocytic = true;
      else F.normocytic = true;
    }
    if (C.num(V.rdw) != null && C.num(V.rdw) > 14.5) F.rdw_high = true;
    if (D.reticAbs != null) {
      if (D.reticAbs > 100000) F.retic_high = true;
      if (D.reticAbs < 25000) F.retic_low = true;
    }
    if (C.num(V.retic) != null) {
      if (C.num(V.retic) > 2.0) F.retic_pct_high = true;
      if (C.num(V.retic) < 0.5) F.retic_pct_low = true;
    }

    if (plt != null) {
      if (plt < 15.8) F.plt_low = true;
      if (plt < 5) F.plt_verylow = true;
      if (plt < 2) F.plt_critical = true;
      if (plt > 34.8) F.plt_high = true;
    }
    if (wbc != null) {
      if (wbc < 3300) F.wbc_low = true;
      if (wbc > 8600) F.wbc_high = true;
      if (wbc > 20000) F.wbc_veryhigh = true;
      if (wbc < 1000) F.wbc_critical = true;
    }
    if (D.anc != null) {
      if (D.anc < 1500) F.neutropenia = true;
      if (D.anc < 500) F.neutropenia_severe = true;
    }
    if (D.alc != null && D.alc < 1000) F.lymphopenia = true;
    if (D.nlr != null && D.nlr > 5) F.nlr_high = true;
    if (C.num(V.eo) != null && C.num(V.eo) > 7) F.eosinophilia = true;
    if (C.num(V.atyp) != null && C.num(V.atyp) > 0) F.atypical_lymph = true;
    if (C.num(V.blast) != null && C.num(V.blast) > 0) F.blasts = true;

    if (F.anemia && F.plt_low && F.wbc_low) F.pancytopenia = true;

    var bt = ctx.vitals && C.num(ctx.vitals.bt);
    if (bt != null && bt >= 37.5) F.fever = true;
    return F;
  }

  var patterns = [
    { id: "cbc-fn", name: "発熱性好中球減少症（FN）を疑う", level: "red",
      when: function (F) { return F.neutropenia_severe && F.fever; },
      basis: ["好中球絶対数 < 500/µL", "発熱 37.5℃以上"],
      note: "感染症が急速に重症化しうる状態。血液培養2セット採取と広域抗菌薬の速やかな投与が原則です。",
      actions: ["ただちに医師へ報告", "血液培養2セット（抗菌薬投与前）", "逆隔離・面会制限の確認", "口腔・肛門周囲・血管内留置部の感染源チェック"] },

    { id: "cbc-neutropenia", name: "好中球減少", level: "amber",
      when: function (F) { return F.neutropenia && !F.neutropenia_severe; },
      basis: ["好中球絶対数 < 1500/µL"],
      note: "感染防御能が落ちています。化学療法歴・薬剤性（抗甲状腺薬・抗てんかん薬ほか）を確認してください。",
      actions: ["発熱の有無を定期確認", "手指衛生・口腔ケアの強化"] },

    { id: "cbc-plt-critical", name: "重度血小板減少（出血リスク高）", level: "red",
      dedupeKey: "plt-critical",
      when: function (F) { return F.plt_critical; },
      basis: ["血小板 < 2万/µL"],
      note: "自然出血（頭蓋内出血を含む）の危険域です。",
      actions: ["ただちに医師へ報告", "転倒・外傷の回避、採血後の圧迫延長", "頭痛・意識変容・血尿・下血の観察", "筋注・坐薬・剃刀の回避"] },

    { id: "cbc-plt-low", name: "血小板減少", level: "amber",
      when: function (F) { return F.plt_low && !F.plt_critical; },
      basis: ["血小板 < 15.8万/µL"],
      note: "DIC・ITP・薬剤性（ヘパリン起因性＝HIT を含む）・肝硬変・敗血症・偽性血小板減少を鑑別します。",
      actions: ["出血斑・点状出血・歯肉出血の観察", "凝固系（PT/APTT/Fib/D-ダイマー）の確認"] },

    { id: "cbc-hit", name: "ヘパリン起因性血小板減少症（HIT）に注意", level: "red",
      when: function (F, V, D, ctx) { return F.plt_low && C.has(ctx, "meds", "heparin"); },
      basis: ["ヘパリン投与中", "血小板減少"],
      note: "HIT は血小板が減るのに血栓ができる逆説的な病態です。投与開始5〜10日目の50%以上の減少が典型。",
      actions: ["医師へ報告（ヘパリン中止の判断が必要）", "4T's スコアの評価", "四肢の腫脹・疼痛・色調変化（血栓徴候）の観察"] },

    { id: "cbc-blast", name: "芽球の出現 — 造血器腫瘍を示唆", level: "red",
      when: function (F) { return F.blasts; },
      basis: ["末梢血に芽球を認める"],
      note: "急性白血病をはじめとする造血器腫瘍を示唆します。",
      actions: ["ただちに医師へ報告", "腫瘍崩壊症候群（K・P・UA・Cr）の監視", "感染・出血の両面を警戒"] },

    { id: "cbc-iron", name: "鉄欠乏性貧血を疑う", level: "info",
      when: function (F) { return F.anemia && F.microcytic; },
      basis: ["貧血", "MCV < 83.6 fL（小球性）"],
      note: "慢性出血（消化管・月経）が背景にあることが多く、原因検索が本体です。フェリチン・血清鉄・TIBC で確認します。",
      actions: ["便潜血・黒色便の確認", "月経量の聴取", "フェリチン・血清鉄・TIBC の確認を提案"] },

    { id: "cbc-acd", name: "慢性疾患に伴う貧血（ACD）も鑑別に", level: "info",
      when: function (F, V, D, ctx) {
        return F.anemia && (F.normocytic || F.microcytic) &&
               C.num(V.rdw) != null && !F.rdw_high && !F.retic_high && !F.retic_pct_high;
      },
      basis: ["貧血", "RDW 上昇を伴わない", "網赤血球の増加もない"],
      note: "炎症・感染・悪性腫瘍・腎性貧血などの慢性病態に伴う貧血。鉄欠乏と紛らわしいので、フェリチンで切り分けます（ACD ではフェリチンは正常〜高値）。",
      actions: ["CRP・原疾患の活動性を確認", "腎機能（eGFR）を確認"] },

    { id: "cbc-megalo", name: "巨赤芽球性貧血を疑う", level: "info",
      when: function (F) { return F.anemia && F.macrocytic; },
      basis: ["貧血", "MCV > 98.2 fL（大球性）"],
      note: "ビタミンB12・葉酸欠乏、骨髄異形成症候群、肝疾患、アルコール、甲状腺機能低下症を鑑別します。B12欠乏は亜急性連合性脊髄変性症など神経症状を伴うことがあります。",
      actions: ["ビタミンB12・葉酸の測定を提案", "胃切除歴・菜食・大量飲酒・PPI 長期内服の聴取", "しびれ・歩行障害など神経症状の観察"] },

    { id: "cbc-hemolysis", name: "溶血または急性出血（骨髄は反応している）", level: "amber",
      when: function (F) { return F.anemia && (F.retic_high || F.retic_pct_high); },
      basis: ["貧血", "網赤血球増加"],
      note: "骨髄が造血で応答している状態。溶血性貧血か、急性出血後の回復期かを切り分けます。溶血なら LD上昇・間接ビリルビン上昇・ハプトグロビン低下が揃います。",
      actions: ["LD・ビリルビン分画・ハプトグロビンの確認", "出血源の検索（消化管・術後・外傷）", "尿の色調（ヘモグロビン尿）の観察"] },

    { id: "cbc-hypoprolif", name: "造血低下型の貧血", level: "amber",
      when: function (F) { return F.anemia && (F.retic_low || F.retic_pct_low); },
      basis: ["貧血", "網赤血球が増えていない"],
      note: "骨髄の産生低下（骨髄抑制・腎性貧血・造血原料不足・慢性炎症）を示唆します。",
      actions: ["腎機能・鉄・B12・葉酸の評価", "被疑薬の確認"] },

    { id: "cbc-anemia-severe", name: "高度貧血 — 組織酸素化の破綻に注意", level: "red",
      when: function (F) { return F.anemia_severe; },
      basis: ["Hb < 6.0 g/dL"],
      note: "輸血の適応が検討される水準です。",
      actions: ["ただちに医師へ報告", "バイタル（頻脈・血圧低下）・意識レベル・胸痛の観察", "活動制限と転倒予防", "輸血の準備（血液型・不規則抗体）"] },

    { id: "cbc-bacterial", name: "細菌感染症を示唆する白血球像", level: "amber",
      when: function (F, V, D) { return F.wbc_high && F.nlr_high; },
      basis: ["白血球増加", "好中球／リンパ球比（NLR）> 5"],
      note: "細菌感染や急性炎症で典型的な像です。NLR はストレス反応や重症度の指標にもなります。",
      actions: ["CRP・プロカルシトニンの確認", "感染巣の検索（肺・尿路・創部・カテーテル）", "qSOFA の評価"] },

    { id: "cbc-viral", name: "ウイルス感染を示唆", level: "info",
      when: function (F) { return F.atypical_lymph; },
      basis: ["異型リンパ球の出現"],
      note: "EBV・CMV・HIV 急性期・薬剤性過敏症症候群（DIHS）などで出現します。",
      actions: ["発熱・咽頭痛・リンパ節腫脹・皮疹・肝機能の確認"] },

    { id: "cbc-eo", name: "好酸球増多", level: "info",
      when: function (F) { return F.eosinophilia; },
      basis: ["好酸球 > 7%"],
      note: "アレルギー・薬剤性・寄生虫・好酸球性多発血管炎性肉芽腫症（EGPA）・副腎不全を鑑別します。新規薬剤の開始時期との関連を確認してください。",
      actions: ["新規投与薬の確認", "皮疹・喘息・末梢神経障害の有無（EGPA では MPO-ANCA を確認）"] },

    { id: "cbc-steroid", name: "ステロイドによる白血球増加の可能性", level: "info",
      when: function (F, V, D, ctx) { return F.wbc_high && C.has(ctx, "meds", "steroid"); },
      basis: ["白血球増加", "ステロイド投与中"],
      note: "ステロイドは好中球を血管壁から遊離させ、感染がなくても白血球が上がります。一方でリンパ球は減ります。感染の有無を白血球数だけで判断しないでください。",
      actions: ["CRP・発熱・局所所見を合わせて評価", "ステロイド下では発熱が出にくい点に注意"] },

    { id: "cbc-polycythemia", name: "多血", level: "info",
      when: function (F) { return F.polycythemia; },
      basis: ["ヘモグロビン高値"],
      note: "脱水による見かけ上の濃縮か、真性多血症・二次性多血（慢性低酸素・喫煙・睡眠時無呼吸）かを切り分けます。",
      actions: ["水分出納・体重・BUN/Cr比の確認", "SpO₂・喫煙歴の確認"] }
  ];

  var presets = [
    { name: "鉄欠乏性貧血", note: "小球性・RDW上昇・網赤血球低値",
      values: { wbc: 6200, neut: 58, lymph: 32, mono: 6, eo: 3, baso: 1, rbc: 3.80, hb: 8.4, ht: 28.5, rdw: 18.2, retic: 0.8, plt: 42.0 },
      context: { age: 48, sex: "f" } },
    { name: "巨赤芽球性貧血", note: "大球性・汎血球減少傾向",
      values: { wbc: 3100, neut: 55, lymph: 36, mono: 7, eo: 2, baso: 0, rbc: 2.10, hb: 8.0, ht: 24.0, rdw: 17.0, retic: 0.4, plt: 12.0 },
      context: { age: 72, sex: "m" } },
    { name: "溶血性貧血", note: "正球性・網赤血球著増",
      values: { wbc: 7800, neut: 60, lymph: 30, mono: 7, eo: 2, baso: 1, rbc: 2.90, hb: 8.8, ht: 26.5, rdw: 16.5, retic: 8.5, plt: 24.0 },
      context: { age: 35, sex: "f" } },
    { name: "発熱性好中球減少症", note: "化学療法後・ANC 160/µL",
      values: { wbc: 800, neut: 20, lymph: 65, mono: 12, eo: 2, baso: 1, rbc: 3.20, hb: 9.5, ht: 29.0, retic: 0.5, plt: 9.0 },
      context: { age: 58, sex: "m", vitals: { bt: 38.6 }, meds: ["chemo"] } },
    { name: "急性白血病示唆", note: "芽球出現・汎血球減少",
      values: { wbc: 42000, neut: 8, lymph: 12, mono: 3, eo: 0, baso: 0, blast: 77, rbc: 2.40, hb: 7.2, ht: 22.0, plt: 3.5 },
      context: { age: 64, sex: "m" } },
    { name: "ITP", note: "血小板のみ著減",
      values: { wbc: 6800, neut: 56, lymph: 34, mono: 7, eo: 2, baso: 1, rbc: 4.40, hb: 13.2, ht: 40.0, plt: 1.5 },
      context: { age: 41, sex: "f" } },
    { name: "HIT 疑い", note: "ヘパリン投与中の血小板減少",
      values: { wbc: 9200, neut: 72, lymph: 20, mono: 6, eo: 1, baso: 1, rbc: 4.10, hb: 12.4, ht: 37.5, plt: 6.8 },
      context: { age: 69, sex: "m", meds: ["heparin"] } },
    { name: "細菌感染症", note: "白血球増加・NLR高値",
      values: { wbc: 18500, neut: 88, lymph: 7, mono: 4, eo: 0, baso: 1, rbc: 4.30, hb: 12.8, ht: 39.0, plt: 31.0 },
      context: { age: 76, sex: "f", vitals: { bt: 38.9 } } }
  ];

  C.register({
    id: "cbc", title: "血算", subtitle: "Complete Blood Count",
    icon: "🩸", accent: "#e8556d",
    groups: ["白血球系", "白血球分画", "赤血球系", "血小板"],
    analytes: analytes, derive: derive, findings: findings,
    patterns: patterns, presets: presets,
    derivedView: [
      { key: "mcv", label: "MCV（平均赤血球容積）", unit: "fL", ref: "83.6〜98.2", decimals: 1 },
      { key: "mch", label: "MCH（平均赤血球ヘモグロビン量）", unit: "pg", ref: "27.5〜33.2", decimals: 1 },
      { key: "mchc", label: "MCHC（平均赤血球ヘモグロビン濃度）", unit: "%", ref: "31.7〜35.3", decimals: 1 },
      { key: "anc", label: "好中球絶対数（ANC）", unit: "/µL", ref: "1500以上", decimals: 0 },
      { key: "alc", label: "リンパ球絶対数", unit: "/µL", ref: "1000以上", decimals: 0 },
      { key: "nlr", label: "好中球／リンパ球比（NLR）", unit: "", ref: "5未満", decimals: 2 },
      { key: "reticAbs", label: "網赤血球絶対数", unit: "/µL", ref: "2.5〜10万", decimals: 0 }
    ]
  });
})();
