/*! labs-integrate.js — 統括アセスメント層
 *  各ドメインの所見フラグを横断して症候群パターンに照合し、
 *  緊急度トリアージ・臓器別マップ・看護アクションを生成する。
 */
var LabsIntegrate = (function () {
  "use strict";
  var C = LabsCore;

  /* ---------- qSOFA / SIRS ---------- */

  function qsofa(ctx) {
    var v = ctx.vitals || {};
    var sbp = C.num(v.sbp), rr = C.num(v.rr);
    var items = [], score = 0, known = 0;
    if (sbp != null) { known++; if (sbp <= 100) { score++; items.push("収縮期血圧 ≦100 mmHg"); } }
    if (rr != null) { known++; if (rr >= 22) { score++; items.push("呼吸数 ≧22 /分"); } }
    if (ctx.complaints && ctx.complaints.indexOf("consciousness") >= 0) {
      known++; score++; items.push("意識変容あり");
    }
    return { score: score, known: known, items: items };
  }

  /* ---------- 横断症候群パターン ---------- */

  var syndromes = [
    {
      id: "sx-dic", name: "播種性血管内凝固症候群（DIC）", level: "red",
      when: function (F, V, D) {
        return F.dic_jaam ||
          (F.plt_low && (F.fdp_high || F.ddimer_high) && F.fib_low && F.pt_prolonged);
      },
      basis: ["血小板減少", "FDP／D-ダイマー上昇", "フィブリノゲン低下", "PT延長"],
      story: "全身の微小血管で凝固が起こり、凝固因子と血小板を使い果たして出血に転じています。出血と血栓が同時に進む病態です。なお肝硬変は凝固因子産生低下と脾機能亢進により同じ所見を呈しうるため、肝疾患の背景がある場合は下の「肝疾患によるDIC類似所見」も併せて読んでください。",
      actions: ["ただちに医師へ報告", "出血（穿刺部位・粘膜・消化管・頭蓋内）の全身観察",
                "血栓徴候（四肢冷感・網状皮斑・乏尿）の観察", "基礎疾患（感染・外傷・悪性腫瘍・産科）の確認",
                "侵襲的処置の前に凝固能を確認"]
    },
    {
      id: "sx-tma", name: "血栓性微小血管症（TTP／HUS）— DICとの鑑別が必要", level: "red",
      when: function (F, V, D) {
        return F.anemia && F.plt_low && F.ld_high;
      },
      basis: function (F, V, D, ctx) {
        var labels = { normal: "基準範囲内（測定済み）", abnormal: "基準範囲外", unmeasured: "未測定・未評価" };
        return ["貧血", "血小板減少", "LD上昇（溶血の確定所見ではない）",
          "PT：" + labels[C.measurementState(V, ["inr", "ptsec", "ptpct"], ctx)],
          "フィブリノゲン：" + labels[C.measurementState(V, ["fib"], ctx)]];
      },
      story: "TMA（TTP／HUSを含む）やDICなどの緊急鑑別が必要です。この3所見だけでは溶血やTMAを確定できません。凝固検査が未測定なら正常とは判断できず、基準範囲内でもDICを除外できません。凝固異常があってもTMAの合併を除外しません。追加検査の結果を待たず医師へ報告してください。",
      actions: ["ただちに医師へ報告（TMA・DICなどの緊急鑑別）",
                "PT・フィブリノゲン・FDP／D-ダイマーの測定状況と結果を確認",
                "破砕赤血球・ハプトグロビン・網赤血球・ビリルビン分画・直接クームス試験を確認",
                "神経症状・腎機能・発熱を評価（五徴が揃うのを待たない）",
                "TTPが疑われる場合は血液専門医への相談・ADAMTS13検査・治療準備を医師と確認",
                "血小板輸血の適応は出血状況を含め医師に確認"]
    },
    {
      id: "sx-sepsis", name: "敗血症／敗血症性ショック", level: "red",
      when: function (F, V, D, ctx) {
        var q = qsofa(ctx);
        // 感染を積極的に示す所見を必須にする。CRP の軽度上昇だけでは
        // 糖尿病性ケトアシドーシスなど非感染性の重症病態を敗血症と誤判定する。
        var infection = F.pct_high || F.crp_veryhigh || F.wbc_veryhigh ||
                        F.neutropenia_severe || (F.fever && (F.crp_high || F.wbc_high || F.wbc_low));
        return infection && (q.score >= 2 || F.lactate_critical);
      },
      basis: ["感染を示唆する所見（PCT高値・CRP高度上昇・著明な白血球異常・発熱＋炎症）",
              "qSOFA 2点以上または乳酸 ≧4 mmol/L"],
      story: "感染に対する調節不全の宿主反応で臓器障害が起きている状態です。乳酸は組織が酸素不足に陥っているサインで、血圧が保たれていても安心できません。",
      actions: ["ただちに医師へ報告", "血液培養2セット（抗菌薬投与前）",
                "1時間以内の抗菌薬投与・初期輸液の指示を確認", "乳酸の再検タイミングを確認",
                "尿量（0.5 mL/kg/hr）・血圧・末梢循環の連続監視", "感染巣の検索とソースコントロール"]
    },
    {
      id: "sx-liverfailure", name: "肝不全（合成能・解毒能の破綻）", level: "red",
      when: function (F) {
        return F.alb_low && F.pt_prolonged && (F.bil_high || F.nh3_high) && (F.plt_low || F.che_low);
      },
      basis: ["アルブミン低下", "PT延長", "黄疸またはアンモニア上昇", "血小板減少またはChE低下"],
      story: "肝臓の蛋白合成能（アルブミン・凝固因子）と解毒能（アンモニア・ビリルビン）が同時に落ちています。門脈圧亢進による脾機能亢進が血小板減少を加えます。",
      actions: ["ただちに医師へ報告", "肝性脳症（羽ばたき振戦・見当識障害・昼夜逆転）の評価",
                "出血傾向の観察と侵襲的処置の回避", "便通の確保（便秘はアンモニアを上げる）",
                "腹水・浮腫・体重の記録", "低血糖の監視（肝での糖新生低下）"]
    },
    {
      id: "sx-gib", name: "消化管出血", level: "red",
      when: function (F, V, D) {
        return F.anemia && F.buncr_high;
      },
      basis: ["貧血", "BUN/Cr比 > 20"],
      story: "腸管内に出た血液が蛋白として吸収され、BUNだけが選択的に上がります。貧血と組み合わさったときの意味は重いです。",
      actions: ["ただちに医師へ報告", "黒色便・吐血・下血の確認", "バイタル（頻脈・血圧低下・起立性低血圧）",
                "抗血栓薬・NSAIDsの内服確認", "輸血の準備（血液型・不規則抗体）", "絶食・内視鏡の指示を確認"]
    },
    {
      id: "sx-hemolysis", name: "溶血", level: "amber",
      when: function (F) {
        // 網赤血球の増加（骨髄が壊された分を作り直そうとしている証拠）を必須とする。
        // LD と間接ビリルビンだけでは肝疾患との区別がつかない。
        return F.anemia && (F.retic_high || F.retic_pct_high) && (F.ld_high || F.ibil_high);
      },
      basis: ["貧血", "網赤血球増加（骨髄の反応あり）", "LD上昇または間接ビリルビン上昇"],
      story: "赤血球が血管内外で壊されています。自己免疫性・薬剤性・機械的（人工弁・TMA）・感染を鑑別します。",
      actions: ["ハプトグロビン・直接クームス試験の確認を提案", "尿色調（ヘモグロビン尿）の観察",
                "新規開始薬の確認", "血液像での破砕赤血球の有無を確認"]
    },
    {
      id: "sx-pancytopenia", name: "汎血球減少（骨髄不全）", level: "red",
      when: function (F) {
        return F.pancytopenia && (F.neutropenia || F.plt_verylow || F.anemia_severe);
      },
      basis: ["白血球・ヘモグロビン・血小板のすべてが低下", "いずれかが高度（好中球減少・血小板5万未満・Hb 6未満）"],
      story: "造血そのものが止まっています。薬剤性・再生不良性貧血・骨髄異形成症候群・白血病・血球貪食症候群・巨赤芽球性貧血を鑑別します。",
      actions: ["医師へ報告", "感染と出血の両方を同時に警戒", "被疑薬・化学療法歴の確認",
                "発熱時は血液培養を速やかに", "口腔ケア・環境整備の強化"]
    },
    {
      id: "sx-pancytopenia-mild", name: "汎血球減少（軽度〜中等度）", level: "amber",
      when: function (F) {
        return F.pancytopenia && !(F.neutropenia || F.plt_verylow || F.anemia_severe);
      },
      basis: ["白血球・ヘモグロビン・血小板のすべてが低下（いずれも高度ではない）"],
      story: "三系統がそろって下がっていること自体が、骨髄という共通の上流に原因があることを示唆します。薬剤性・巨赤芽球性貧血・骨髄異形成症候群・脾機能亢進・膠原病を鑑別します。",
      actions: ["被疑薬の確認", "ビタミンB12・葉酸・網赤血球の確認を提案",
                "脾腫・肝疾患の有無を確認", "経時的な推移の記録（進行性かどうかが重要）"]
    },
    {
      id: "sx-hlh", name: "血球貪食症候群（HLH）の可能性", level: "red",
      when: function (F, V, D, ctx) {
        var bt = ctx.vitals && C.num(ctx.vitals.bt);
        return F.pancytopenia && F.sil2r_high && bt != null && bt >= 38.5 &&
               (F.transaminase_high || F.ld_high);
      },
      basis: ["汎血球減少", "可溶性IL-2レセプター高値", "38.5℃以上の発熱", "肝障害またはLD上昇"],
      story: "マクロファージが自分の血球を食べてしまう過剰炎症状態です。感染・悪性リンパ腫・膠原病が引き金になり、急速に進行します。",
      actions: ["ただちに医師へ報告", "フェリチン・中性脂肪・フィブリノゲンの測定を提案",
                "脾腫の有無を確認", "全身状態の急変に備える"]
    },
    {
      id: "sx-tls", name: "腫瘍崩壊症候群（TLS）", level: "red",
      when: function (F, V, D, ctx) {
        var background = C.has(ctx, "history", "malignancy") || C.has(ctx, "history", "hematologic") ||
                         C.has(ctx, "meds", "chemo") || F.blasts;
        return F.hyperk && F.hyperp && F.ua_high && F.hypoca && background;
      },
      basis: ["K上昇", "P上昇", "尿酸上昇", "Ca低下", "悪性腫瘍・化学療法の背景"],
      story: "腫瘍細胞が一気に壊れ、細胞内の中身が血中に流れ出しています。高K血症による不整脈と、尿酸・リン酸による急性腎障害が二大脅威です。",
      actions: ["ただちに医師へ報告", "心電図モニターの装着", "時間尿量の厳密測定",
                "大量輸液・ラスブリカーゼの指示を確認", "K・P・Ca・Crの頻回再検"]
    },
    {
      id: "sx-rhabdo", name: "横紋筋融解症と続発する急性腎障害", level: "red",
      when: function (F) { return F.rhabdo_range && (F.cr_high || F.hyperk); },
      basis: ["CK > 5000 U/L", "腎機能低下または高K血症"],
      story: "壊れた筋細胞のミオグロビンが尿細管を詰まらせ、同時に細胞内のカリウムが血中に出ます。長時間の転倒臥床・痙攣・熱中症・スタチンが原因になります。",
      actions: ["ただちに医師へ報告", "尿色調（赤褐色）と尿量の監視", "心電図モニター",
                "K値の頻回確認", "大量輸液の指示を確認", "圧迫部位の観察（コンパートメント症候群）"]
    },
    {
      id: "sx-hyponatremia-neuro", name: "脳神経疾患に伴う低Na血症 — SIADH と CSWS の鑑別", level: "red",
      when: function (F, V, D, ctx) {
        return F.hypona_mod &&
          (C.has(ctx, "history", "stroke") || C.has(ctx, "history", "neurosurg") ||
           C.has(ctx, "complaints", "consciousness") || C.has(ctx, "complaints", "convulsion"));
      },
      basis: ["中等度以上の低Na血症", "中枢神経疾患の背景"],
      story: "SIADH と中枢性塩類喪失症候群（CSWS）は検査所見がほぼ同じでありながら、治療が正反対です。SIADH は水制限、CSWS は生理食塩水による補充。切り分けるのは検査値ではなく「体液量」です。CSWS に水制限をかければ脳血流が落ち、脳梗塞を招きます。ここは看護師の観察が診断を決める場面です。",
      actions: ["体液量の評価を最優先 — 体重推移・時間尿量・水分出納・皮膚ツルゴール・中心静脈圧",
                "尿量が多く体重が減っていれば CSWS 寄り、体液正常〜過剰なら SIADH 寄り",
                "尿浸透圧・尿中Naの測定（Na補正開始前の採取が望ましい）",
                "補正速度の管理（24時間 8〜10 mmol/L 以内）— 急速補正は浸透圧性脱髄症候群を招く",
                "意識レベル・痙攣の経時観察", "カルバマゼピン等の被疑薬を確認"]
    },
    {
      id: "sx-di-neuro", name: "尿崩症（下垂体・視床下部障害）", level: "red",
      when: function (F, V, D, ctx) {
        return F.hyperna && (F.uosm_low || (C.num(V.usg) != null && C.num(V.usg) < 1.005));
      },
      basis: ["高Na血症", "希釈尿（尿浸透圧低値／尿比重低値）"],
      story: "抗利尿ホルモンが出ない、または効かず、水が止めどなく失われています。下垂体術後・頭部外傷・脳死に近い病態で起こり、数時間で高Na血症が進行します。",
      actions: ["ただちに医師へ報告", "時間尿量の厳密測定（200 mL/hr 超の持続は警戒）",
                "体重・水分出納・血清Naの頻回確認", "デスモプレシン投与の指示を確認",
                "意識レベルの観察"]
    },
    {
      id: "sx-hyperk-cardiac", name: "高カリウム血症による心停止リスク", level: "red",
      when: function (F) { return F.hyperk_severe; },
      basis: ["K > 6.0 mmol/L"],
      story: "心筋の電気的安定性が失われます。心電図変化（テント状T波→P波消失→QRS幅延長→サインカーブ）は進行の順序そのものです。",
      actions: ["ただちに医師へ報告", "12誘導心電図と心電図モニターの装着",
                "溶血による偽性高K血症の除外（再採血）", "カリウム含有輸液・食品・薬剤の中止確認",
                "グルコース・インスリン療法／カルシウム製剤／陽イオン交換樹脂の指示を確認"]
    },
    {
      id: "sx-fn", name: "発熱性好中球減少症（FN）", level: "red",
      when: function (F) { return F.neutropenia_severe && F.fever; },
      basis: ["好中球絶対数 < 500/µL", "発熱"],
      story: "感染を抑える細胞がいない状態での発熱です。数時間で敗血症性ショックに至りうるため、時間との勝負になります。",
      actions: ["ただちに医師へ報告", "血液培養2セット（抗菌薬投与前・カテーテルがあれば両側から）",
                "1時間以内の広域抗菌薬投与の指示を確認", "感染源の全身確認（口腔・肛門周囲・カテーテル刺入部・皮膚）",
                "直腸検温・坐薬・浣腸は避ける", "逆隔離・面会制限の確認"]
    },
    {
      id: "sx-aki-uremia", name: "急性腎障害の進行", level: "red",
      when: function (F) { return F.renal_endstage && (F.hyperk || F.ag_high); },
      basis: ["eGFR < 15", "高K血症または代謝性アシドーシス"],
      story: "腎代替療法の適応が近づいています。高K血症・アシドーシス・溢水・尿毒症症状が透析導入の指標になります。",
      actions: ["ただちに医師へ報告", "尿量の厳密測定", "体重・浮腫・呼吸状態（溢水）の評価",
                "心電図モニター", "腎排泄性薬剤の用量調整を確認", "透析導入の準備状況を確認"]
    },
    {
      id: "sx-autoimmune-organ", name: "自己免疫疾患の臓器障害", level: "amber",
      when: function (F) {
        var abPos = F.ana_pos || F.mpo_pos || F.pr3_pos || F.ccp_pos || F.apl_pos || F.gbm_pos;
        var organ = F.renal_impair || F.transaminase_high || F.anemia || F.plt_low || F.crp_high;
        return abPos && organ;
      },
      basis: ["自己抗体陽性", "臓器障害を示す検査値異常"],
      story: "自己抗体が陽性で、かつ臓器の数値が動いています。疾患そのものの活動性か、免疫抑制療法による副作用・感染かの切り分けが臨床上の分かれ目です。",
      actions: ["尿所見（蛋白・血尿）と腎機能の推移を確認", "感染徴候と疾患活動性の両面で評価",
                "免疫抑制薬・ステロイドの投与状況を確認", "補体（C3・C4・CH50）で活動性を評価"]
    },
    {
      id: "sx-mg-crisis", name: "筋無力性クリーゼのリスク", level: "red",
      when: function (F, V, D, ctx) {
        return (F.achr_pos || F.musk_pos) &&
          (C.has(ctx, "complaints", "dyspnea") || C.has(ctx, "complaints", "paralysis") ||
           (ctx.vitals && C.num(ctx.vitals.rr) != null && C.num(ctx.vitals.rr) >= 22) ||
           (ctx.vitals && C.num(ctx.vitals.spo2) != null && C.num(ctx.vitals.spo2) < 95));
      },
      basis: ["抗AChR抗体または抗MuSK抗体陽性", "呼吸関連の症状または頻呼吸"],
      story: "重症筋無力症で最も恐れるのは呼吸筋麻痺です。SpO₂は最後まで保たれることがあり、低下した時にはすでに手遅れになりえます。呼吸数・咳の強さ・一息で話せる語数といった「努力」の指標で捉えてください。",
      actions: ["ただちに医師へ報告", "%肺活量・単一呼吸での発語数・咳嗽力の評価",
                "SpO₂の正常値に安心しないこと", "嚥下機能評価と誤嚥予防",
                "増悪薬（アミノグリコシド・マクロライド・キノロン・β遮断薬・Mg製剤）の確認",
                "気管挿管の準備体制を確認"]
    },
    {
      id: "sx-gbs-resp", name: "ギラン・バレー症候群の呼吸筋麻痺リスク", level: "red",
      when: function (F, V, D, ctx) {
        return (F.gm1_pos || F.gq1b_pos || F.gt1a_pos) &&
          (C.has(ctx, "complaints", "paralysis") || C.has(ctx, "complaints", "dyspnea"));
      },
      basis: ["抗ガングリオシド抗体陽性（GM1／GQ1b／GT1a）", "麻痺または呼吸症状"],
      story: "麻痺が上行し、横隔膜に達すると呼吸が止まります。自律神経障害による血圧変動・不整脈も命に関わります。",
      actions: ["ただちに医師へ報告", "%肺活量の経時測定", "麻痺の上行レベルを経時記録",
                "血圧・心拍の変動を連続監視", "嚥下評価と誤嚥予防", "深部静脈血栓予防"]
    },
    {
      id: "sx-hypoglycemia", name: "低血糖", level: "red",
      when: function (F) { return F.hypoglycemia_severe; },
      basis: ["血糖 < 50 mg/dL"],
      story: "脳はブドウ糖しか使えません。遷延すれば不可逆的な障害を残します。β遮断薬内服中や無自覚性低血糖では警告症状が出ません。",
      actions: ["ただちにブドウ糖投与の指示を確認", "医師へ報告", "15分後の再検",
                "インスリン・SU薬の投与と食事摂取量の照合", "意識レベルの観察"]
    },
    {
      id: "sx-dehydration", name: "脱水・循環血液量減少", level: "amber",
      when: function (F, V, D, ctx) {
        var hr = ctx.vitals && C.num(ctx.vitals.hr);
        return F.buncr_high && (F.hyperna || (hr != null && hr > 100));
      },
      basis: ["BUN/Cr比 > 20", "高Na血症または頻脈"],
      story: "脱水・循環血液量減少の可能性があります。BUN優位上昇は消化管出血などでも起こるため、Hb・出血徴候も確認してください。高齢者・意識障害・発熱・下痢・利尿薬使用で進行します。",
      actions: ["水分出納・体重・皮膚ツルゴール・口腔乾燥の評価", "起立性の血圧変化を確認",
                "輸液・経口補水の指示を確認", "尿量の記録"]
    },
    {
      id: "sx-malnutrition", name: "低栄養", level: "info",
      when: function (F) { return F.alb_verylow && (F.che_low || F.anemia); },
      basis: ["アルブミン < 3.0 g/dL", "ChE低下または貧血"],
      story: "創傷治癒の遅延、褥瘡、易感染、薬物動態の変化（蛋白結合率の高い薬の効果増強）につながります。",
      actions: ["食事摂取量・体重推移の記録", "褥瘡リスク評価", "栄養サポートチームへの相談を検討",
                "ワルファリンなど蛋白結合率の高い薬の効果増強に注意"]
    }
  ];

  /* ---------- 臓器別マップ ---------- */

  var ORGANS = [
    { id: "hematopoietic", label: "造血", icon: "🩸",
      flags: { anemia: "貧血", anemia_severe: "高度貧血", plt_low: "血小板減少", plt_critical: "重度血小板減少",
               wbc_low: "白血球減少", wbc_high: "白血球増加", neutropenia: "好中球減少",
               neutropenia_severe: "高度好中球減少", pancytopenia: "汎血球減少", blasts: "芽球出現",
               microcytic: "小球性", macrocytic: "大球性", retic_high: "網赤血球増加" } },
    { id: "coagulation", label: "凝固・線溶", icon: "🩹",
      flags: { pt_prolonged: "PT延長", aptt_prolonged: "APTT延長", fib_low: "フィブリノゲン低下",
               fib_critical: "フィブリノゲン著減", fdp_high: "FDP上昇", ddimer_high: "D-ダイマー上昇",
               at3_low: "AT-III低下", tat_high: "TAT上昇", dic_jaam: "DIC基準該当", inr_high: "INR高値" } },
    { id: "liver", label: "肝・胆道", icon: "🫀",
      flags: { transaminase_high: "肝逸脱酵素上昇", cholestasis: "胆汁うっ滞", bil_high: "黄疸",
               alb_low: "アルブミン低下", che_low: "ChE低下", nh3_high: "アンモニア上昇" } },
    { id: "renal", label: "腎・電解質", icon: "💧",
      flags: { renal_impair: "腎機能低下", renal_severe: "高度腎機能低下", renal_endstage: "末期腎不全域",
               buncr_high: "BUN優位上昇", hyperk: "高K血症", hypok: "低K血症", hypona: "低Na血症",
               hyperna: "高Na血症", hyperca: "高Ca血症", hypoca: "低Ca血症", ag_high: "AG開大",
               hypomg: "低Mg血症", hyperp: "高P血症" } },
    { id: "cardiac", label: "心・循環", icon: "❤️",
      flags: { troponin_high: "トロポニン上昇", bnp_high: "心負荷上昇", ck_high: "CK上昇",
               rhabdo_range: "横紋筋融解域", lactate_high: "乳酸上昇", lactate_critical: "乳酸高度上昇" } },
    { id: "infection", label: "感染・炎症", icon: "🦠",
      flags: { crp_high: "CRP上昇", crp_veryhigh: "CRP高度上昇", pct_high: "PCT上昇",
               pct_veryhigh: "PCT高度上昇", fever: "発熱", nlr_high: "NLR上昇", atypical_lymph: "異型リンパ球" } },
    { id: "metabolic", label: "代謝・内分泌", icon: "🔥",
      flags: { hyperglycemia: "高血糖", hyperglycemia_severe: "著明高血糖", hypoglycemia: "低血糖",
               hba1c_dm: "HbA1c糖尿病域", trab_pos: "TRAb陽性", thyroid_ab_pos: "甲状腺自己抗体陽性",
               gad_pos: "抗GAD抗体陽性", ua_high: "尿酸高値" } },
    { id: "immune", label: "免疫・膠原病", icon: "🧬",
      flags: { ana_pos: "抗核抗体陽性", dsdna_pos: "抗dsDNA陽性", sm_pos: "抗Sm陽性",
               ssa_pos: "抗SS-A陽性", scl70_pos: "抗Scl-70陽性", cent_pos: "抗セントロメア陽性",
               mpo_pos: "MPO-ANCA陽性", pr3_pos: "PR3-ANCA陽性", ccp_pos: "抗CCP陽性",
               apl_pos: "抗リン脂質抗体陽性", complement_low: "補体低下", igg4_high: "IgG4高値" } },
    { id: "neuro", label: "神経・筋", icon: "🧠",
      flags: { achr_pos: "抗AChR陽性", musk_pos: "抗MuSK陽性", aqp4_pos: "抗AQP4陽性",
               mog_pos: "抗MOG陽性", gm1_pos: "抗GM1陽性", gq1b_pos: "抗GQ1b陽性",
               nmdar_pos: "抗NMDA受容体陽性", lgi1_pos: "抗LGI1陽性", caspr2_pos: "抗CASPR2陽性",
               paraneoplastic_pos: "傍腫瘍性抗体陽性", nh3_veryhigh: "高アンモニア血症",
               hypona_severe: "重度低Na血症", uosm_low: "尿希釈", uosm_high: "尿濃縮" } }
  ];

  function organMap(F) {
    return ORGANS.map(function (o) {
      var hits = [];
      Object.keys(o.flags).forEach(function (k) { if (F[k]) hits.push(o.flags[k]); });
      return { id: o.id, label: o.label, icon: o.icon, hits: hits };
    }).filter(function (o) { return o.hits.length > 0; });
  }

  /* ---------- 統括アセスメント ---------- */

  function assess(input, result) {
    var ctx = input.context || {};
    var V = input.values || {};
    var F = result.findings || {};
    var D = result.derived || {};

    /* 横断症候群の照合 */
    var sx = [];
    syndromes.forEach(function (s) {
      var hit = false;
      try { hit = !!s.when(F, V, D, ctx); } catch (e) { hit = false; }
      if (hit) sx.push({ id: s.id, name: s.name, level: s.level, basis: typeof s.basis === "function" ? s.basis(F, V, D, ctx) : s.basis, story: s.story, actions: s.actions });
    });

    /* パニック値 */
    var panics = C.panicItems(result);

    /* トリアージ判定 */
    var q = qsofa(ctx);
    var reasons = [];
    var level = "green";

    if (panics.length) {
      level = "red";
      panics.forEach(function (p) {
        reasons.push("パニック値：" + p.label + " " + C.fmt(p.value, p.decimals) + " " + p.unit);
      });
    }
    sx.forEach(function (s) {
      if (s.level === "red") { level = "red"; reasons.push("症候群：" + s.name); }
    });
    result.patterns.forEach(function (p) {
      if (p.level === "red") {
        level = "red";
        if (reasons.indexOf("所見：" + p.name) < 0) reasons.push("所見：" + p.name);
      }
    });
    if (q.score >= 2) {
      level = "red";
      reasons.push("qSOFA " + q.score + "点（" + q.items.join("・") + "）");
    }
    if (level !== "red") {
      var amber = sx.some(function (s) { return s.level === "amber"; }) ||
                  result.patterns.some(function (p) { return p.level === "amber"; });
      if (amber) {
        level = "amber";
        sx.forEach(function (s) { if (s.level === "amber") reasons.push("症候群：" + s.name); });
        result.patterns.forEach(function (p) {
          if (p.level === "amber" && reasons.indexOf("所見：" + p.name) < 0) reasons.push("所見：" + p.name);
        });
      }
    }
    if (level === "green" && result.items.length === 0) level = "none";

    /* ヘッドライン */
    var headline;
    if (level === "none") headline = "検査値が入力されていません。";
    else if (level === "red") {
      headline = sx.length
        ? sx.filter(function (s) { return s.level === "red"; }).map(function (s) { return s.name; }).slice(0, 2).join("／") + " を示唆する所見です。ただちに医師へ報告してください。"
        : "緊急度の高い検査値異常があります。ただちに医師へ報告してください。";
    } else if (level === "amber") {
      headline = "経過観察ではすまない所見があります。医師への報告と追加評価を検討してください。";
    } else {
      headline = "緊急性の高い所見は検出されませんでした。症状・経過と併せて評価してください。";
    }

    /* 看護アクションの集約（重複排除・症候群優先） */
    var actions = [], seen = {};
    function push(list, src) {
      (list || []).forEach(function (a) {
        if (!seen[a]) { seen[a] = true; actions.push({ text: a, src: src }); }
      });
    }
    sx.filter(function (s) { return s.level === "red"; }).forEach(function (s) { push(s.actions, s.name); });
    result.patterns.filter(function (p) { return p.level === "red"; }).forEach(function (p) { push(p.actions, p.name); });
    sx.filter(function (s) { return s.level === "amber"; }).forEach(function (s) { push(s.actions, s.name); });
    result.patterns.filter(function (p) { return p.level === "amber"; }).forEach(function (p) { push(p.actions, p.name); });
    result.patterns.filter(function (p) { return p.level === "info"; }).forEach(function (p) { push(p.actions, p.name); });

    /* 不足している検査（次の一手） */
    var missing = [];
    function want(cond, text) { if (cond) missing.push(text); }
    want(F.anemia && F.plt_low && F.ld_high && C.measurementState(V, ["inr", "ptsec", "ptpct"], ctx) === "unmeasured", "PTが未測定：PT-INR等を確認（報告を遅らせない）");
    want(F.anemia && F.plt_low && F.ld_high && C.num(V.fib) == null, "フィブリノゲンが未測定：追加確認（報告を遅らせない）");
    want(F.histone_pos && F.ana_pos && C.num(V.dsdna) == null, "抗dsDNA抗体が未測定：薬剤性ループスの鑑別に追加確認");
    want(F.rnp_pos && (C.num(V.dsdna) == null || !V.sm), "抗Sm・抗dsDNA抗体の測定状況を確認（抗RNP単独陽性とは判断できない）");
    want(F.thyroid_ab_pos && C.num(V.trab) == null, "TRAbが未測定：甲状腺機能と併せて追加確認");
    want(V.ana === "陰性（40倍未満）" && ["mpo", "pr3", "ccp"].some(function (k) { return C.num(V[k]) == null; }), "ANA以外の未測定抗体を陰性とは判断できません。症状に応じて追加検査の必要性を確認");
    want(F.hypona && C.num(V.uosm) == null, "尿浸透圧・尿中Na（低Na血症の鑑別に必須）");
    want(F.anemia && C.num(V.retic) == null, "網赤血球（造血反応の有無で貧血を二分できる）");
    want(F.anemia && F.microcytic && true, "フェリチン・血清鉄・TIBC（鉄欠乏と慢性炎症の切り分け）");
    want(F.anemia && F.macrocytic, "ビタミンB12・葉酸");
    want(F.plt_low && C.num(V.fdp) == null, "FDP・D-ダイマー・フィブリノゲン（DICの評価）");
    want((F.anemia && F.plt_low && F.ld_high), "ハプトグロビン・直接クームス試験・血液像（破砕赤血球）");
    want(F.transaminase_high && C.num(V.inr) == null, "PT-INR（肝の合成能評価）");
    want((F.crp_high || F.pct_high) && C.num(V.lac) == null, "乳酸（組織低灌流の評価）");
    want(F.ana_pos && C.num(V.c3) == null, "補体 C3・C4・CH50（膠原病の活動性評価）");
    want(F.hyperk, "12誘導心電図（高K血症による変化の確認）");
    want(F.rhabdo_range && C.num(V.k) == null, "カリウム・腎機能（横紋筋融解に伴う二次障害）");
    want(!ctx.vitals || C.num(ctx.vitals.sbp) == null, "バイタルサイン（qSOFA 判定に必要）");

    return {
      level: level, headline: headline, reasons: reasons,
      syndromes: sx, panics: panics, qsofa: q,
      organs: organMap(F), actions: actions, missing: missing
    };
  }

  return { assess: assess, qsofa: qsofa, syndromes: syndromes };
})();
