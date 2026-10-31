/*! dx-abg.js — 血液ガス・酸塩基平衡ドメイン
 *  体系的読影：①pH ②一次性障害 ③代償の妥当性 ④アニオンギャップ（Alb補正）
 *  ⑤Δ-Δ解析 ⑥酸素化（A-aDO₂・P/F比）
 *  Na・Cl・Alb・乳酸は生化学ドメインと共有（shared）。
 */
(function () {
  "use strict";
  var C = LabsCore;
  var n = C.num;

  var analytes = [
    { key: "ph", label: "pH", unit: "", group: "動脈血ガス",
      ref: [7.35, 7.45], panic: { low: 7.20, high: 7.60 }, decimals: 3, placeholder: "7.400", facility: true },
    { key: "paco2", label: "PaCO₂", unit: "mmHg", group: "動脈血ガス",
      ref: [35, 45], panic: { low: 20, high: 70 }, decimals: 1, placeholder: "40.0", facility: true },
    { key: "hco3", label: "HCO₃⁻", unit: "mmol/L", group: "動脈血ガス", shared: true,
      ref: [22, 26], decimals: 1, placeholder: "24.0", facility: true },
    { key: "be", label: "BE（base excess）", unit: "mmol/L", group: "動脈血ガス",
      ref: [-2, 2], decimals: 1, placeholder: "0.0", facility: true },
    { key: "pao2", label: "PaO₂", unit: "mmHg", group: "動脈血ガス",
      ref: [80, 100], panic: { low: 50 }, decimals: 1, placeholder: "90.0", facility: true },
    { key: "fio2", label: "FiO₂", unit: "（0.21〜1.0）", group: "動脈血ガス",
      ref: [0.21, 1.0], decimals: 2, placeholder: "0.21", facility: true,
      note: "室内気は 0.21。鼻カニュラ1L≒0.24、2L≒0.28、3L≒0.32（目安）" },
    { key: "abgCourse", label: "呼吸性障害の経過", group: "動脈血ガス", type: "select",
      options: ["", "急性（数時間〜数日）", "慢性（数日以上・COPD等）", "不明"],
      positiveWhen: function () { return false; }, refText: "—", facility: true,
      note: "急性か慢性かで代償の期待値が3倍以上変わります。判定の分かれ目です" },

    { key: "na", label: "ナトリウム（Na）", unit: "mmol/L", group: "電解質（AG計算用）", shared: true,
      ref: [138, 145], panic: { low: 120, high: 160 }, decimals: 0, placeholder: "140" },
    { key: "cl", label: "クロール（Cl）", unit: "mmol/L", group: "電解質（AG計算用）", shared: true,
      ref: [101, 108], decimals: 0, placeholder: "104" },
    { key: "alb", label: "アルブミン", unit: "g/dL", group: "電解質（AG計算用）", shared: true,
      ref: [4.1, 5.1], decimals: 1, placeholder: "4.3",
      note: "低アルブミン血症はAGを見かけ上小さくします。補正が必須" },
    { key: "lac", label: "乳酸（ラクテート）", unit: "mmol/L", group: "電解質（AG計算用）", shared: true,
      ref: [0.5, 1.6], panic: { high: 4.0 }, decimals: 1, placeholder: "1.0", facility: true },
    { key: "glu", label: "血糖", unit: "mg/dL", group: "電解質（AG計算用）", shared: true,
      ref: [73, 109], panic: { low: 50, high: 500 }, decimals: 0, placeholder: "95" },
    { key: "bun", label: "尿素窒素（BUN）", unit: "mg/dL", group: "電解質（AG計算用）", shared: true,
      ref: [8, 20], decimals: 1, placeholder: "14" },
    { key: "sosm", label: "血清浸透圧（実測）", unit: "mOsm/kg", group: "電解質（AG計算用）", shared: true,
      ref: [275, 290], decimals: 0, placeholder: "285", facility: true },

    { key: "una", label: "尿中Na", unit: "mmol/L", group: "尿電解質（尿AG用）", shared: true,
      ref: [20, 220], decimals: 0, placeholder: "60", facility: true },
    { key: "uk", label: "尿中K", unit: "mmol/L", group: "尿電解質（尿AG用）",
      ref: [20, 80], decimals: 0, placeholder: "40", facility: true },
    { key: "ucl", label: "尿中Cl", unit: "mmol/L", group: "尿電解質（尿AG用）",
      ref: [20, 250], decimals: 0, placeholder: "60", facility: true,
      note: "代謝性アルカローシスの鑑別に必須（生理食塩水反応性か抵抗性か）" }
  ];

  var PATM = 760, PH2O = 47, RQ = 0.8;

  /** 体系的な酸塩基平衡解析。読影の全ステップを構造化して返す。 */
  function analyze(V, ctx) {
    var ph = n(V.ph), pco2 = n(V.paco2), hco3 = n(V.hco3);
    var na = n(V.na), cl = n(V.cl), alb = n(V.alb);
    var pao2 = n(V.pao2), fio2 = n(V.fio2);
    var A = { steps: [], disorders: [], complete: false };
    if (ph == null || pco2 == null || hco3 == null) {
      A.note = "pH・PaCO₂・HCO₃⁻ の3つが揃うと酸塩基平衡を解析します。";
      return A;
    }
    A.complete = true;

    /* ① pH の評価 */
    A.phState = ph < 7.35 ? "acidemia" : (ph > 7.45 ? "alkalemia" : "normal");
    A.steps.push({
      no: 1, title: "pH の評価",
      detail: "pH " + ph.toFixed(3) + " → " +
        (A.phState === "acidemia" ? "アシデミア（酸血症）"
          : A.phState === "alkalemia" ? "アルカレミア（アルカリ血症）"
          : "正常域（代償済み、または混合性障害の可能性）")
    });

    /* ② 一次性障害の同定 */
    var metAcid = hco3 < 22, metAlk = hco3 > 26;
    var respAcid = pco2 > 45, respAlk = pco2 < 35;
    var primary = null, primaryLabel = "";

    if (A.phState === "acidemia") {
      if (metAcid && !respAcid) { primary = "MA"; }
      else if (respAcid && !metAcid) { primary = "RA"; }
      else if (metAcid && respAcid) { primary = "MIXED_ACID"; }
      else { primary = hco3 < 24 ? "MA" : "RA"; }
    } else if (A.phState === "alkalemia") {
      if (metAlk && !respAlk) { primary = "MAlk"; }
      else if (respAlk && !metAlk) { primary = "RAlk"; }
      else if (metAlk && respAlk) { primary = "MIXED_ALK"; }
      else { primary = hco3 > 24 ? "MAlk" : "RAlk"; }
    } else {
      if (metAcid && respAlk) primary = "MA";
      else if (metAlk && respAcid) primary = "MAlk";
      else if (!metAcid && !metAlk && !respAcid && !respAlk) primary = "NORMAL";
      else primary = metAcid ? "MA" : (metAlk ? "MAlk" : (respAcid ? "RA" : "RAlk"));
    }
    var LBL = {
      MA: "代謝性アシドーシス", MAlk: "代謝性アルカローシス",
      RA: "呼吸性アシドーシス", RAlk: "呼吸性アルカローシス",
      MIXED_ACID: "代謝性＋呼吸性アシドーシス（混合性）",
      MIXED_ALK: "代謝性＋呼吸性アルカローシス（混合性）",
      NORMAL: "明らかな酸塩基平衡障害なし"
    };
    A.primary = primary;
    primaryLabel = LBL[primary];
    A.primaryLabel = primaryLabel;
    if (primary !== "NORMAL") A.disorders.push(primaryLabel);
    A.steps.push({
      no: 2, title: "一次性障害の同定",
      detail: "HCO₃⁻ " + hco3.toFixed(1) + " mmol/L、PaCO₂ " + pco2.toFixed(1) + " mmHg → " + primaryLabel
    });
    if (A.phState === "normal" && primary !== "NORMAL") {
      A.steps[A.steps.length - 1].caution =
        "pH が正常域にもかかわらず HCO₃⁻・PaCO₂ が偏位しています。完全代償は稀であり、相殺し合う混合性障害を第一に考えます。";
    }

    /* ③ 代償の妥当性 */
    var chronic = V.abgCourse === "慢性（数日以上・COPD等）" ||
                  (V.abgCourse !== "急性（数時間〜数日）" && C.has(ctx, "history", "copd"));
    var comp = null;
    if (primary === "MA") {
      var ePco2 = 1.5 * hco3 + 8;
      comp = { target: "PaCO₂", expected: [ePco2 - 2, ePco2 + 2], actual: pco2,
               formula: "Winter 式：期待 PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2", ref: "WINTER" };
    } else if (primary === "MAlk") {
      // 係数は出典により 0.6〜0.7 と割れる。国内の成書で広く使われる 0.6 を既定とし、
      // 0.7 を採る文献との差（HCO₃⁻ が 10 上振れして約 1 mmHg）は ±5 の幅に収まる。
      var ePco2b = 0.6 * (hco3 - 24) + 40;
      comp = { target: "PaCO₂", expected: [ePco2b - 5, ePco2b + 5], actual: pco2,
               formula: "期待 PaCO₂ = 0.6 × (HCO₃⁻ − 24) + 40 ± 5（係数は出典により 0.6〜0.7）" };
    } else if (primary === "RA") {
      var k = chronic ? 3.5 : 1.0;
      var eH = 24 + (pco2 - 40) / 10 * k;
      comp = { target: "HCO₃⁻", expected: [eH - 2, eH + 2], actual: hco3,
               formula: (chronic ? "慢性" : "急性") + "呼吸性アシドーシス：PaCO₂ 10 mmHg 上昇につき HCO₃⁻ " +
                        k.toFixed(1) + " mmol/L 上昇 ± 2" };
    } else if (primary === "RAlk") {
      var k2 = chronic ? 4.0 : 2.0;
      var eH2 = 24 - (40 - pco2) / 10 * k2;
      comp = { target: "HCO₃⁻", expected: [eH2 - 2, eH2 + 2], actual: hco3,
               formula: (chronic ? "慢性" : "急性") + "呼吸性アルカローシス：PaCO₂ 10 mmHg 低下につき HCO₃⁻ " +
                        k2.toFixed(1) + " mmol/L 低下 ± 2" };
    }
    if (comp) {
      comp.adequate = comp.actual >= comp.expected[0] && comp.actual <= comp.expected[1];
      comp.direction = comp.actual < comp.expected[0] ? "low" : (comp.actual > comp.expected[1] ? "high" : "ok");
      comp.chronic = chronic;
      A.compensation = comp;
      var verdict;
      if (comp.adequate) {
        verdict = "代償は予測範囲内。単一の酸塩基平衡障害として矛盾しません。";
      } else if (primary === "MA" || primary === "MAlk") {
        verdict = comp.direction === "low"
          ? "実測 PaCO₂ が期待より低い → 呼吸性アルカローシスの合併を示唆します。"
          : "実測 PaCO₂ が期待より高い → 呼吸性アシドーシス（換気不全）の合併を示唆します。";
        A.disorders.push(comp.direction === "low" ? "呼吸性アルカローシス（合併）" : "呼吸性アシドーシス（合併）");
      } else {
        verdict = comp.direction === "low"
          ? "実測 HCO₃⁻ が期待より低い → 代謝性アシドーシスの合併を示唆します。"
          : "実測 HCO₃⁻ が期待より高い → 代謝性アルカローシスの合併を示唆します。";
        A.disorders.push(comp.direction === "low" ? "代謝性アシドーシス（合併）" : "代謝性アルカローシス（合併）");
      }
      A.steps.push({
        no: 3, title: "代償の妥当性",
        detail: comp.formula + "／期待 " + comp.expected[0].toFixed(1) + "〜" + comp.expected[1].toFixed(1) +
                "、実測 " + comp.actual.toFixed(1),
        verdict: verdict, ok: comp.adequate
      });
    }

    /* ④ アニオンギャップ（アルブミン補正） */
    if (na != null && cl != null) {
      var ag = na - (cl + hco3);
      var agc = (alb != null) ? ag + 2.5 * (4.0 - alb) : ag;
      A.ag = ag; A.agCorrected = agc; A.albCorrected = (alb != null);
      A.agHigh = agc > 14;
      A.agLow = agc < 6;
      A.steps.push({
        no: 4, title: "アニオンギャップ",
        detail: "AG = Na − (Cl + HCO₃⁻) = " + ag.toFixed(1) +
                (alb != null ? "／Alb 補正後 = " + agc.toFixed(1) + "（基準 12 ± 2）" : "（Alb 未入力のため未補正）"),
        verdict: A.agHigh ? "AG 開大。固定酸の蓄積を示唆します。"
               : (A.agLow ? "AG 低値。低アルブミン血症・多発性骨髄腫・リチウム等を考えます。"
                          : "AG は正常範囲です。"),
        caution: (alb != null ? null : "アルブミンを入れると判定が変わりえます。低Alb血症はAGを見かけ上 2.5/g·dL⁻¹ 小さくします。")
      });

      /* ⑤ Δ-Δ 解析（AG開大性アシドーシスがあるとき） */
      if (A.agHigh && hco3 < 24) {
        var dRatio = (agc - 12) / (24 - hco3);
        A.deltaRatio = dRatio;
        var di;
        if (dRatio < 0.4) di = "AG正常（高Cl性）代謝性アシドーシスが主体です。";
        else if (dRatio < 0.8) di = "AG開大性と AG正常（高Cl性）代謝性アシドーシスの混合です。";
        else if (dRatio <= 2.0) di = "純粋な AG開大性代謝性アシドーシスとして矛盾しません。";
        else di = "Δ比 > 2 → AG開大性代謝性アシドーシスに、代謝性アルカローシスまたは慢性呼吸性アシドーシスの合併を示唆します。";
        A.deltaInterpretation = di;
        if (dRatio < 0.8) A.disorders.push("AG正常（高Cl性）代謝性アシドーシス（合併）");
        if (dRatio > 2.0) A.disorders.push("代謝性アルカローシス（Δ比から示唆）");
        A.steps.push({
          no: 5, title: "Δ-Δ 解析（デルタ比）",
          detail: "Δ比 = (補正AG − 12) ÷ (24 − HCO₃⁻) = " + dRatio.toFixed(2),
          verdict: di
        });
      }
    }

    /* 浸透圧ギャップ */
    var sosm = n(V.sosm);
    if (sosm != null && na != null) {
      var calc = 2 * na + (n(V.glu) == null ? 0 : n(V.glu) / 18) + (n(V.bun) == null ? 0 : n(V.bun) / 2.8);
      A.osmGap = sosm - calc;
      A.osmGapHigh = A.osmGap > 10;
    }

    /* 尿アニオンギャップ */
    var una = n(V.una), uk = n(V.uk), ucl = n(V.ucl);
    if (una != null && uk != null && ucl != null) {
      A.uag = una + uk - ucl;
      A.uagPositive = A.uag > 0;
    }
    if (ucl != null) A.ucl = ucl;

    /* ⑥ 酸素化 */
    if (pao2 != null) {
      var f = (fio2 == null) ? 0.21 : fio2;
      A.aado2 = f * (PATM - PH2O) - pco2 / RQ - pao2;
      var age = n(ctx.age);
      A.aado2Expected = (age != null) ? (age / 4 + 4) : 15;
      A.aado2High = (f <= 0.25) ? (A.aado2 > A.aado2Expected) : (A.aado2 > 100);
      A.pf = pao2 / f;
      A.hypoxemia = pao2 < 80;
      A.respFailure = pao2 <= 60;
      if (A.pf <= 300) A.ards = A.pf <= 100 ? "重症" : (A.pf <= 200 ? "中等症" : "軽症");
      A.steps.push({
        no: 6, title: "酸素化の評価",
        detail: "A-aDO₂ = " + A.aado2.toFixed(1) + " mmHg（年齢相当の目安 " + A.aado2Expected.toFixed(0) +
                "）／P/F 比 = " + A.pf.toFixed(0),
        verdict: !A.aado2High
          ? "A-aDO₂ は開大していません。低酸素血症があれば肺胞低換気または吸入酸素濃度低下が原因です。"
          : "A-aDO₂ 開大。換気血流不均等・シャント・拡散障害を示唆します。" +
            (A.ards ? "P/F 比は ARDS ベルリン定義の「" + A.ards + "」域です（PEEP ≧5 cmH₂O 下での判定が前提）。" : "")
      });
    }

    A.summary = A.disorders.length
      ? A.disorders.join(" ＋ ")
      : (primary === "NORMAL" ? "酸塩基平衡障害なし" : primaryLabel);
    return A;
  }

  function derive(V, ctx) {
    var A = analyze(V, ctx);
    return {
      abg: A,
      abgAG: A.agCorrected, abgDelta: A.deltaRatio,
      abgAaDO2: A.aado2, abgPF: A.pf, abgOsmGap: A.osmGap, abgUAG: A.uag
    };
  }

  function findings(V, D, ctx) {
    var F = {}, A = D.abg || {};
    if (!A.complete) return F;
    F.abg_done = true;
    if (A.phState === "acidemia") F.acidemia = true;
    if (A.phState === "alkalemia") F.alkalemia = true;
    /* 主要フラグは実測値で立てる。代償の過不足（相対的な換気異常）は別フラグに分け、
       「代償が追いついていないだけ」を独立した呼吸性障害と取り違えないようにする。 */
    var pco2 = n(V.paco2), hco3v = n(V.hco3);
    if (hco3v != null && hco3v < 22) F.metabolic_acidosis = true;
    if (hco3v != null && hco3v > 26) F.metabolic_alkalosis = true;
    if (pco2 != null && pco2 > 45) F.respiratory_acidosis = true;
    if (pco2 != null && pco2 < 35) F.respiratory_alkalosis = true;
    if (A.primary === "RAlk") F.primary_resp_alkalosis = true;
    if (A.primary === "RA") F.primary_resp_acidosis = true;
    if (/呼吸性アシドーシス（合併）/.test(A.summary)) F.relative_hypoventilation = true;
    if (/呼吸性アルカローシス（合併）/.test(A.summary)) F.relative_hyperventilation = true;
    if (/代謝性アシドーシス（合併）/.test(A.summary)) F.metabolic_acidosis = true;
    if (/代謝性アルカローシス/.test(A.summary)) F.metabolic_alkalosis = true;
    if (A.disorders.length >= 2) F.mixed_disorder = true;
    if (A.disorders.length >= 3) F.triple_disorder = true;
    if (A.agHigh) F.ag_high = true;
    if (A.agLow) F.ag_low = true;
    if (A.deltaRatio != null && A.deltaRatio < 0.8) F.hyperchloremic = true;
    if (A.osmGapHigh) F.osmgap_high = true;
    if (A.uag != null) { if (A.uagPositive) F.uag_positive = true; else F.uag_negative = true; }
    if (A.aado2High) F.aado2_high = true;
    if (A.ards) F.ards_range = true;
    if (A.respFailure) F.resp_failure = true;
    if (A.compensation && !A.compensation.adequate) F.compensation_inadequate = true;
    if (n(V.ph) != null && n(V.ph) < 7.20) F.severe_acidemia = true;
    if (n(V.ph) != null && n(V.ph) > 7.60) F.severe_alkalemia = true;
    return F;
  }

  var patterns = [
    { id: "abg-severe-acidemia", name: "重度アシデミア", level: "red",
      when: function (F) { return F.severe_acidemia; },
      basis: ["pH < 7.20"],
      refs: [],
      note: "心収縮力低下・カテコラミン反応性の低下・不整脈を来します。原因検索と並行した循環管理が要ります。",
      actions: ["原因（乳酸・ケトン・腎不全・中毒・換気不全）の同定を優先", "循環動態・意識レベルの連続監視",
                "K値の再検（アシドーシス補正でKは細胞内へ移動し急落する）", "人工呼吸・透析の適応を検討"] },

    { id: "abg-mixed", name: "混合性酸塩基平衡障害", level: "amber",
      when: function (F) { return F.mixed_disorder && !F.triple_disorder; },
      basis: ["代償の予測範囲から逸脱、または Δ比が単一障害と矛盾"],
      refs: ["WINTER"],
      note: "pH だけを見ていると見落とす病態です。相殺し合って pH が正常に見えることもあり、その場合こそ背景に二つの病態が走っています。",
      actions: ["それぞれの障害に対応する原因を個別に検索", "経時的な血液ガス再検で優位な障害の推移を追う"] },

    { id: "abg-triple", name: "三重性酸塩基平衡障害", level: "red",
      when: function (F) { return F.triple_disorder; },
      basis: ["3つ以上の酸塩基平衡障害が併存"],
      refs: ["WINTER"],
      note: "重症病態に特徴的です（例：敗血症性ショックの乳酸アシドーシス＋嘔吐による代謝性アルカローシス＋頻呼吸による呼吸性アルカローシス）。",
      actions: ["集中治療管理の適応を検討", "それぞれの要因を個別に是正"] },

    { id: "abg-ag-high", name: "AG開大性代謝性アシドーシス — 固定酸の蓄積", level: "red",
      when: function (F) { return F.metabolic_acidosis && F.ag_high; },
      basis: ["代謝性アシドーシス", "アルブミン補正AG > 14"],
      refs: ["GOLDMARK", "FIGGE"],
      note: "GOLD MARK で鑑別します：Glycols（エチレングリコール・プロピレングリコール）／Oxoproline（アセトアミノフェン長期）／L-lactate（組織低灌流・敗血症）／D-lactate（短腸症候群）／Methanol／Aspirin（サリチル酸）／Renal failure（尿毒症）／Ketoacidosis（糖尿病・アルコール性・飢餓）。",
      actions: ["乳酸・ケトン体・腎機能・血糖をまず確認", "浸透圧ギャップを計算（開大なら中毒性アルコールを疑う）",
                "薬剤・アルコール・服薬歴の聴取", "原因別の治療（輸液・インスリン・血液浄化）の適応を検討"] },

    { id: "abg-osmgap", name: "浸透圧ギャップ開大 — 中毒性アルコールを疑う", level: "red",
      when: function (F) { return F.osmgap_high && F.ag_high; },
      basis: ["浸透圧ギャップ > 10 mOsm/kg", "AG開大性代謝性アシドーシス"],
      refs: ["GOLDMARK"],
      note: "メタノール・エチレングリコール中毒の典型的な組み合わせです。治療開始の遅れが失明・腎不全・死亡に直結します。",
      actions: ["ただちに中毒専門機関へ相談", "ホメピゾール／エタノール投与と血液透析の適応を検討",
                "眼症状（メタノール）・シュウ酸カルシウム結晶尿（エチレングリコール）を確認"] },

    { id: "abg-hyperchloremic", name: "AG正常（高Cl性）代謝性アシドーシス", level: "amber",
      when: function (F) { return F.metabolic_acidosis && !F.ag_high; },
      basis: ["代謝性アシドーシス", "AG は正常範囲"],
      refs: ["UAG"],
      note: "重炭酸の喪失か、酸の排泄障害です。尿アニオンギャップ（尿Na＋尿K−尿Cl）で切り分けます：陰性なら腎外性喪失（下痢）、陽性なら腎性（遠位尿細管性アシドーシス）。生理食塩水の大量投与でも起こります。",
      actions: ["尿Na・尿K・尿Cl の測定（尿AG の算出）", "下痢・消化管ドレナージ・尿路変更の有無を確認",
                "輸液内容（生理食塩水量）を確認", "K値の確認（RTAの型の鑑別に有用）"] },

    { id: "abg-uag-pos", name: "尿AG 陽性 — 腎性（遠位尿細管性アシドーシス）を示唆", level: "amber",
      when: function (F) { return F.hyperchloremic && F.uag_positive; },
      basis: ["AG正常代謝性アシドーシス", "尿アニオンギャップが陽性"],
      refs: ["UAG"],
      note: "腎のアンモニウム排泄が不十分であることを示します。遠位（1型）RTA、4型RTA（低レニン低アルドステロン）を鑑別します。",
      actions: ["尿pH の確認（5.5 以上で遠位RTA を示唆）", "K値の確認（1型は低K、4型は高K）",
                "基礎疾患（シェーグレン症候群・糖尿病・薬剤）の検索"] },

    { id: "abg-uag-neg", name: "尿AG 陰性 — 腎外性喪失（下痢など）を示唆", level: "info",
      when: function (F) { return F.hyperchloremic && F.uag_negative; },
      basis: ["AG正常代謝性アシドーシス", "尿アニオンギャップが陰性"],
      refs: ["UAG"],
      note: "腎は正しくアンモニウムを排泄しており、消化管からの重炭酸喪失が主因と考えられます。",
      actions: ["下痢・消化管ドレナージ・膵液瘻の有無を確認", "電解質と体液量の補正"] },

    { id: "abg-metalk", name: "代謝性アルカローシス", level: "amber",
      when: function (F) { return F.metabolic_alkalosis; },
      basis: ["HCO₃⁻ 上昇"],
      refs: [],
      note: "尿Cl で二分します。20 mmol/L 未満なら生理食塩水反応性（嘔吐・経鼻胃管吸引・利尿薬中止後・体液量減少）、20 以上なら生理食塩水抵抗性（原発性アルドステロン症・Cushing・Bartter/Gitelman・重度低K）。",
      actions: ["尿Cl の測定（反応性／抵抗性の鑑別）", "嘔吐・胃管吸引・利尿薬の確認",
                "K・Mg の補正（低Kはアルカローシスを維持させる）", "血圧と血清K から内分泌性の鑑別を検討"] },

    { id: "abg-chronic-resp", name: "慢性呼吸性アシドーシス（代償性）", level: "info",
      when: function (F, V, D) {
        var A = D.abg || {};
        return F.respiratory_acidosis && A.compensation && A.compensation.chronic && A.compensation.adequate;
      },
      basis: ["PaCO₂ 上昇", "HCO₃⁻ が慢性代償の予測範囲内"],
      refs: [],
      note: "慢性II型呼吸不全の安定した状態です。この患者で酸素を過剰投与すると CO₂ ナルコーシスを招きえます（低酸素性呼吸ドライブの抑制・換気血流不均等の増悪・Haldane効果）。SpO₂ の目標値は通常より低く設定します。",
      actions: ["酸素投与の目標 SpO₂ を主治医と確認（慢性II型呼吸不全では 88〜92% が目安）",
                "意識レベル・呼吸数の監視", "NPPV の適応を検討", "ベースラインの血液ガスと比較"] },

    { id: "abg-acute-resp-acid", name: "急性呼吸性アシドーシス — 換気不全", level: "red",
      when: function (F, V, D) {
        var A = D.abg || {};
        return F.respiratory_acidosis && A.compensation && !A.compensation.chronic;
      },
      basis: ["PaCO₂ 上昇", "代償が急性パターン"],
      refs: [],
      note: "分時換気量が不足しています。中枢抑制（薬剤・脳幹病変）、神経筋疾患（重症筋無力症・ギラン・バレー）、気道閉塞、胸郭・肺病変を鑑別します。進行すれば CO₂ ナルコーシスから呼吸停止に至ります。",
      actions: ["ただちに医師へ報告", "意識レベル・呼吸数・呼吸様式・努力呼吸の評価",
                "鎮静薬・オピオイドの投与歴を確認", "気道確保・換気補助（NPPV／挿管）の準備",
                "神経筋疾患が背景なら %肺活量の測定"] },

    { id: "abg-resp-alk", name: "呼吸性アルカローシス", level: "amber",
      when: function (F) { return F.respiratory_alkalosis; },
      basis: ["PaCO₂ 低下"],
      refs: [],
      note: "過換気は「不安」で片づけてはいけない所見です。低酸素血症、肺塞栓、敗血症、代謝性アシドーシスの代償、肝不全、中枢神経病変、サリチル酸中毒が背景にありえます。過換気症候群は除外診断です。",
      actions: ["SpO₂・A-aDO₂ の評価（開大があれば肺実質・血管病変を疑う）",
                "肺塞栓の事前確率を評価（Wells スコア）", "乳酸・感染徴候の確認", "サリチル酸の服薬歴を確認"] },

    { id: "abg-aado2", name: "A-aDO₂ 開大 — 肺でのガス交換障害", level: "amber",
      when: function (F) { return F.aado2_high; },
      basis: ["A-aDO₂ が年齢相当の目安を超えている"],
      refs: [],
      note: "換気血流不均等・シャント・拡散障害を示します。純粋な肺胞低換気（麻薬性鎮痛薬・神経筋疾患）では A-aDO₂ は開大しないため、この一点で鑑別が大きく絞れます。",
      actions: ["酸素投与への反応を確認（反応不良はシャントを示唆）", "胸部画像の検討", "肺塞栓の可能性を評価"] },

    { id: "abg-ards", name: "P/F 比低下 — ARDS の範囲", level: "red",
      when: function (F) { return F.ards_range; },
      basis: ["P/F 比 ≦ 300"],
      refs: ["BERLIN"],
      note: "ベルリン定義では、1週間以内の発症・両側性陰影・心不全や溢水では説明できないこと・PEEP ≧5 cmH₂O 下での P/F 比、の4条件で判定します。本アプリは P/F 比のみを計算しています。",
      actions: ["胸部X線／CT で両側性陰影を確認", "心不全・溢水の除外（心エコー・BNP）",
                "PEEP 設定と肺保護換気（低一回換気量）の確認", "腹臥位療法の適応を検討"] },

    { id: "abg-resp-failure", name: "I 型／II 型呼吸不全の判定", level: "red",
      when: function (F) { return F.resp_failure; },
      basis: ["PaO₂ ≦ 60 mmHg"],
      refs: [],
      note: "PaCO₂ 45 mmHg 以下なら I 型（酸素化障害）、45 超なら II 型（換気障害）です。II 型では酸素投与の目標値を下げ、換気補助を検討します。",
      actions: ["PaCO₂ による I 型／II 型の判別", "酸素投与量と目標 SpO₂ の確認", "換気補助の適応を検討"] },

    { id: "abg-ag-low", name: "AG 低値", level: "info",
      when: function (F) { return F.ag_low; },
      basis: ["アルブミン補正後 AG < 6"],
      refs: ["FIGGE"],
      note: "低アルブミン血症（補正しても残る場合）、多発性骨髄腫（陽性荷電のM蛋白）、リチウム・臭素・高度高脂血症による偽性低値を考えます。",
      actions: ["アルブミン値の確認", "蛋白分画・免疫電気泳動の検討"] }
  ];

  var presets = [
    { name: "敗血症性ショック（乳酸アシドーシス）", note: "全項目入り・統合判定のデモ",
      values: { ph: 7.21, paco2: 26, hco3: 10, pao2: 68, fio2: 0.4, na: 138, cl: 104, alb: 2.4, lac: 8.2,
                glu: 158, bun: 42, cr: 2.10, k: 4.6, ca: 7.9, ip: 4.8, crp: 18.5, pct: 8.4,
                wbc: 19800, neut: 88, lymph: 7, mono: 4, eo: 0, baso: 1, rbc: 3.40, hb: 10.2, ht: 31.0, plt: 6.2,
                ast: 68, alt: 52, ld: 410, tbil: 2.1, inr: 1.62, ptpct: 52, aptt: 48, fib: 128, fdp: 42, ddimer: 18.5, at3: 48,
                abgCourse: "急性（数時間〜数日）" },
      context: { age: 72, sex: "m", vitals: { bt: 38.9, sbp: 82, hr: 124, rr: 30 }, complaints: ["fever", "consciousness"] } },
    { name: "糖尿病性ケトアシドーシス", note: "AG著明開大・Winter式で代償確認",
      values: { ph: 7.08, paco2: 18, hco3: 5, pao2: 102, fio2: 0.21, na: 132, cl: 94, alb: 4.2, glu: 580,
                bun: 34, cr: 1.45, k: 5.4, ca: 8.9, ip: 4.4, hba1c: 11.2, crp: 2.1,
                wbc: 16200, neut: 82, lymph: 12, rbc: 4.80, hb: 15.2, ht: 46.0, plt: 38.0,
                abgCourse: "急性（数時間〜数日）" },
      context: { age: 26, sex: "f", history: ["dm"], complaints: ["vomiting", "consciousness"], vitals: { rr: 32, hr: 128 } } },
    { name: "COPD 慢性II型呼吸不全", note: "慢性代償・酸素投与に注意",
      values: { ph: 7.36, paco2: 62, hco3: 34, pao2: 58, fio2: 0.24, na: 140, cl: 96, alb: 3.8,
                k: 4.2, bun: 18, cr: 0.92, crp: 0.8, wbc: 7800, neut: 64, lymph: 26, rbc: 5.30, hb: 17.2, ht: 52.0, plt: 24.0,
                bnp: 86, abgCourse: "慢性（数日以上・COPD等）" },
      context: { age: 74, sex: "m", history: ["copd"], complaints: ["dyspnea"] } },
    { name: "急性呼吸性アシドーシス（麻薬性鎮痛薬）", note: "A-aDO₂ 開大なしが鍵",
      values: { ph: 7.21, paco2: 72, hco3: 27, pao2: 58, fio2: 0.21, na: 140, cl: 102, alb: 4.0, abgCourse: "急性（数時間〜数日）" },
      context: { age: 68, sex: "f", complaints: ["consciousness"], vitals: { rr: 8 } } },
    { name: "嘔吐による代謝性アルカローシス", note: "尿Cl 低値＝生理食塩水反応性",
      values: { ph: 7.52, paco2: 47, hco3: 38, pao2: 88, fio2: 0.21, na: 138, cl: 88, alb: 4.0, k: 2.8, una: 42, uk: 38, ucl: 8, abgCourse: "急性（数時間〜数日）" },
      context: { age: 58, sex: "f", complaints: ["vomiting"] } },
    { name: "下痢による高Cl性アシドーシス", note: "尿AG 陰性＝腎外性喪失",
      values: { ph: 7.29, paco2: 32, hco3: 15, pao2: 94, fio2: 0.21, na: 136, cl: 114, alb: 4.0, una: 22, uk: 18, ucl: 58, abgCourse: "急性（数時間〜数日）" },
      context: { age: 44, sex: "m", complaints: ["diarrhea"] } },
    { name: "遠位尿細管性アシドーシス", note: "尿AG 陽性＝腎性",
      values: { ph: 7.30, paco2: 33, hco3: 16, pao2: 96, fio2: 0.21, na: 138, cl: 113, alb: 4.1, k: 2.9, una: 68, uk: 44, ucl: 52, abgCourse: "慢性（数日以上・COPD等）" },
      context: { age: 51, sex: "f", history: ["autoimmune"] } },
    { name: "メタノール中毒", note: "AG開大＋浸透圧ギャップ開大",
      values: { ph: 7.12, paco2: 22, hco3: 7, pao2: 98, fio2: 0.21, na: 140, cl: 102, alb: 4.2, glu: 102, bun: 14, sosm: 338, abgCourse: "急性（数時間〜数日）" },
      context: { age: 47, sex: "m", complaints: ["consciousness", "vomiting"] } },
    { name: "ARDS", note: "P/F 比 80・A-aDO₂ 著明開大",
      values: { ph: 7.31, paco2: 48, hco3: 23, pao2: 64, fio2: 0.8, na: 139, cl: 103, alb: 2.8, lac: 2.4,
                k: 4.1, bun: 28, cr: 1.32, crp: 22.4, pct: 4.2, wbc: 17400, neut: 86, lymph: 9,
                rbc: 3.90, hb: 11.8, ht: 35.0, plt: 14.0, bnp: 62, abgCourse: "急性（数時間〜数日）" },
      context: { age: 63, sex: "m", complaints: ["dyspnea", "fever"], vitals: { rr: 32, spo2: 88 } } },
    { name: "三重性障害（敗血症＋嘔吐＋頻呼吸）", note: "Δ比 > 2 で隠れたアルカローシスを検出",
      values: { ph: 7.44, paco2: 24, hco3: 16, pao2: 76, fio2: 0.35, na: 140, cl: 88, alb: 2.6, lac: 6.4, glu: 148, bun: 38, abgCourse: "急性（数時間〜数日）" },
      context: { age: 69, sex: "f", vitals: { bt: 38.6, sbp: 92, hr: 118, rr: 30 }, complaints: ["fever", "vomiting"] } }
  ];

  C.register({
    id: "abg", title: "血液ガス・酸塩基平衡", subtitle: "Arterial Blood Gas / Acid-Base",
    icon: "🫁", accent: "#3fb6c9",
    groups: ["動脈血ガス", "電解質（AG計算用）", "尿電解質（尿AG用）"],
    analytes: analytes, derive: derive, findings: findings,
    patterns: patterns, presets: presets,
    derivedView: [
      { key: "abgAG", label: "アニオンギャップ（Alb補正）", unit: "mmol/L", ref: "12 ± 2", decimals: 1 },
      { key: "abgDelta", label: "Δ比（デルタ比）", unit: "", ref: "1.0〜2.0 が単一障害", decimals: 2 },
      { key: "abgAaDO2", label: "A-aDO₂", unit: "mmHg", ref: "年齢/4 + 4", decimals: 1 },
      { key: "abgPF", label: "P/F 比", unit: "", ref: "300 超", decimals: 0 },
      { key: "abgOsmGap", label: "浸透圧ギャップ", unit: "mOsm/kg", ref: "10 以下", decimals: 1 },
      { key: "abgUAG", label: "尿アニオンギャップ", unit: "mmol/L", ref: "陰性＝腎外性", decimals: 1 }
    ],
    extraPanels: ["abgSteps"],
    analyze: analyze
  });

  if (typeof window !== "undefined") window.DXABG = { analyze: analyze };
})();
