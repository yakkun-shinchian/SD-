/*! dx-hx.js — 問診・身体所見ドメイン
 *  検査値の前に、臨床医が実際に最初に手に入れる情報（発症様式・経過・身体所見）を
 *  構造化して受け取り、所見フラグとして下流（dx-cc.js の主訴別アプローチ、
 *  dx-core.js の鑑別エンジン）へ渡す。
 *
 *  設計上の約束：
 *   - 「選択されていない」＝「所見なしを確認した」ではない。したがって全判定は
 *     選択肢との完全一致（=== "あり" 等）で書き、否定形で陰性を推定しない。
 *   - このドメインは患者の「値」ではないため、入力値一覧表には出さない（hideItems）。
 *   - 判定（patterns）はここでは持たない。主訴別の文脈で初めて意味を持つため、
 *     解釈は dx-cc.js 側に置く。
 */
var DXHx = (function () {
  "use strict";

  var SEL = function (key, label, options, note) {
    return {
      key: key, label: label, type: "select",
      options: [""].concat(options), refText: "—",
      group: null, note: note || ""
    };
  };

  /* ---------- 入力項目 ---------- */

  var G1 = "発症と経過", G2 = "全身・意識", G3 = "呼吸", G4 = "循環",
      G5 = "腹部", G6 = "神経", G7 = "皮膚・関節・表在";

  var A = [];
  function add(group, a) { a.group = group; A.push(a); return a; }

  add(G1, SEL("hx_onset", "発症様式",
    ["突然（秒〜分で完成）", "急性（数時間）", "亜急性（数日〜数週）", "慢性（数か月以上）"],
    "「突然」は血管性（破裂・解離・閉塞・捻転）とてんかんを最優先で考える"));
  add(G1, SEL("hx_course", "その後の経過",
    ["進行・増悪", "不変", "改善傾向", "反復（間欠的）"]));
  add(G1, SEL("hx_trigger", "契機・状況",
    ["労作時", "安静時", "食後", "体位変換時", "薬剤開始後", "感染後", "外傷後"]));
  add(G1, SEL("hx_pain_max", "症状のピーク",
    ["発症直後が最強", "徐々に増強", "波がある（間欠）"],
    "発症直後が最強＝SAH・大動脈解離・内臓穿孔・捻転を示唆"));

  add(G2, {
    key: "hx_gcs", label: "GCS 合計", unit: "点", group: G2,
    ref: [14, 15], refText: "—", decimals: 0, placeholder: "15",
    note: "E4V5M6＝15。8点以下は気道確保を検討"
  });
  add(G2, SEL("hx_jcs", "JCS（3-3-9度方式）",
    ["0（清明）", "I（刺激なしで覚醒）", "II（刺激で覚醒）", "III（刺激でも覚醒しない）"]));
  add(G2, SEL("hx_volume", "体液量の見立て",
    ["正常", "不足（脱水）", "過剰（体液過剰）"],
    "皮膚ツルゴール・腋窩乾燥・頸静脈・浮腫を総合して"));
  add(G2, SEL("hx_weight", "体重変化",
    ["不変", "増加（1週で2kg以上）", "減少（6か月で5%以上）"]));

  add(G3, SEL("hx_resp_effort", "呼吸様式",
    ["正常", "努力呼吸（補助筋使用）", "浅く速い", "Kussmaul（深く大きい）",
     "Cheyne-Stokes", "下顎呼吸・あえぎ"]));
  add(G3, SEL("hx_orthopnea", "起坐呼吸", ["なし", "あり"],
    "臥位で悪化し坐位で改善＝左心不全の特異度が高い所見"));
  add(G3, SEL("hx_lung", "肺野の聴診",
    ["清", "捻髪音（両側下肺の fine crackles）", "水泡音（coarse crackles）",
     "wheeze（笛音）", "片側で呼吸音減弱", "両側で呼吸音減弱"]));
  add(G3, SEL("hx_cough", "咳・喀痰",
    ["なし", "乾性咳", "膿性喀痰", "血痰・喀血"]));

  add(G4, SEL("hx_jvd", "頸静脈怒張", ["なし", "あり"],
    "右房圧上昇。心不全・タンポナーデ・肺塞栓・緊張性気胸で上昇"));
  add(G4, SEL("hx_murmur", "心雑音",
    ["なし", "収縮期", "拡張期", "新規出現／性状が変化"]));
  add(G4, SEL("hx_heart_sound", "心音・心膜",
    ["正常", "減弱（遠い心音）", "III音（ギャロップ）", "心膜摩擦音"]));
  add(G4, SEL("hx_bp_lr", "血圧の左右差", ["なし", "あり（20mmHg 以上）"]));
  add(G4, SEL("hx_perfusion", "末梢循環",
    ["温かく乾燥", "冷汗・湿潤", "CRT 3秒以上"]));
  add(G4, SEL("hx_leg_edema", "下腿浮腫",
    ["なし", "両側（圧痕性）", "片側"],
    "片側＝DVT・リンパ・蜂窩巣炎／両側＝心・腎・肝・薬剤"));

  add(G5, SEL("hx_abd_tender", "腹部圧痛の部位",
    ["なし", "心窩部（上腹部）", "右上腹部", "右下腹部", "左下腹部",
     "臍周囲", "背部へ貫通・移動", "びまん性"]));
  add(G5, SEL("hx_peritoneal", "腹膜刺激徴候",
    ["なし", "あり（反跳痛・筋性防御）"],
    "ありなら外科コンサルトと画像を同時並行で"));
  add(G5, SEL("hx_bowel", "腸蠕動音",
    ["正常", "減弱〜消失", "金属音（高調）"]));
  add(G5, SEL("hx_murphy", "Murphy 徴候", ["陰性", "陽性"]));
  add(G5, SEL("hx_abd_sign", "その他の腹部所見",
    ["なし", "腹部膨満", "波動あり（腹水）", "拍動性腫瘤", "腹壁静脈拡張"]));
  add(G5, SEL("hx_stool", "便の性状",
    ["正常", "水様", "血便（鮮血）", "黒色・タール状", "白色・灰白色"]));

  add(G6, SEL("hx_focal", "局所神経症候",
    ["なし", "片麻痺", "失語", "半盲", "小脳性（協調運動障害）", "構音障害のみ"]));
  add(G6, SEL("hx_pupil", "瞳孔",
    ["正常", "左右不同（アニソコリア）", "両側散大・固定", "両側縮小（pinpoint）"]));
  add(G6, SEL("hx_neck", "項部硬直", ["なし", "あり"]));
  add(G6, SEL("hx_asterixis", "羽ばたき振戦", ["なし", "あり"]));
  add(G6, SEL("hx_dtr", "腱反射",
    ["正常", "亢進（＋病的反射）", "低下〜消失"]));
  add(G6, SEL("hx_sensory", "感覚障害の分布",
    ["なし", "手袋・靴下型", "デルマトーム分布", "髄節レベルあり（横断性）", "片側"]));
  add(G6, SEL("hx_tremor", "振戦",
    ["なし", "安静時", "動作時（細かく速い）"]));

  add(G7, SEL("hx_rash", "皮疹",
    ["なし", "びまん性紅斑", "点状出血・紫斑", "水疱・粘膜疹",
     "蝶形紅斑", "環状・標的状", "膿疱"]));
  add(G7, SEL("hx_purpura_palp", "紫斑の性状",
    ["該当なし", "触知可能（palpable）", "平坦（非触知）"],
    "触知可能＝血管炎／平坦＝血小板・凝固の異常を先に考える"));
  add(G7, SEL("hx_lymph", "リンパ節腫脹", ["なし", "局所", "全身性"]));
  add(G7, SEL("hx_joint", "関節所見",
    ["なし", "単関節の熱感・腫脹", "多関節・対称性（手指小関節）",
     "多関節・非対称性", "体軸（仙腸・脊椎）"]));
  add(G7, SEL("hx_raynaud", "Raynaud 現象", ["なし", "あり"]));
  add(G7, SEL("hx_oral", "口腔・眼",
    ["なし", "口腔内潰瘍", "眼・口の乾燥", "結膜炎・ぶどう膜炎"]));
  add(G7, SEL("hx_thyroid", "甲状腺",
    ["正常", "びまん性腫大", "結節", "圧痛あり"]));
  add(G7, SEL("hx_skin_other", "その他の皮膚所見",
    ["なし", "黄染（黄疸）", "チアノーゼ", "クモ状血管腫・手掌紅斑",
     "色素沈着", "皮膚硬化（浮腫状硬化）"]));

  /* ---------- 所見フラグ ---------- */

  /** 所見フラグ → 画面に出す日本語。dx-cc.js が「点灯している所見」を説明するのに使う。 */
  var LABEL = {
    hx_sudden_onset: "突然発症（秒〜分で完成）",
    hx_onset_acute: "急性発症（数時間）",
    hx_onset_subacute: "亜急性（数日〜数週）",
    hx_onset_chronic: "慢性（数か月以上）",
    hx_progressive: "進行・増悪している",
    hx_recurrent: "反復・間欠的",
    hx_exertional: "労作時に出現",
    hx_at_rest: "安静時に出現",
    hx_after_meal: "食後に出現",
    hx_postural: "体位変換で出現",
    hx_after_drug: "薬剤開始後",
    hx_post_infection: "感染後",
    hx_post_trauma: "外傷後",
    hx_pain_max_at_onset: "発症直後が最強（thunderclap 型）",
    hx_gcs_low: "GCS 14 点以下",
    hx_gcs_severe: "GCS 8 点以下",
    hx_jcs_ii: "JCS II（刺激で覚醒）",
    hx_jcs_iii: "JCS III（刺激でも覚醒しない）",
    hx_consciousness_impaired: "意識障害あり",
    hx_coma: "昏睡（GCS 8 以下 または JCS III）",
    hx_hypovolemia: "体液量不足（脱水）",
    hx_hypervolemia: "体液量過剰",
    hx_weight_gain: "体重増加（1週で2kg以上）",
    hx_weight_loss: "体重減少（6か月で5%以上）",
    hx_resp_effort: "努力呼吸（補助筋使用）",
    hx_tachypnea_shallow: "浅く速い呼吸",
    hx_kussmaul: "Kussmaul 呼吸",
    hx_cheyne: "Cheyne-Stokes 呼吸",
    hx_agonal: "下顎呼吸・あえぎ呼吸",
    hx_orthopnea: "起坐呼吸",
    hx_fine_crackles: "両側下肺の捻髪音",
    hx_coarse_crackles: "水泡音",
    hx_wheeze: "wheeze（笛音）",
    hx_breath_down_unilat: "片側で呼吸音減弱",
    hx_breath_down_bilat: "両側で呼吸音減弱",
    hx_sputum_purulent: "膿性喀痰",
    hx_hemoptysis: "血痰・喀血",
    hx_jvd: "頸静脈怒張",
    hx_murmur_systolic: "収縮期雑音",
    hx_murmur_diastolic: "拡張期雑音",
    hx_murmur_new: "新規の心雑音",
    hx_heart_muffled: "心音減弱",
    hx_s3: "III音（ギャロップ）",
    hx_pericardial_rub: "心膜摩擦音",
    hx_bp_lr_diff: "血圧の左右差 20mmHg 以上",
    hx_cold_clammy: "冷汗・湿潤",
    hx_crt_delay: "CRT 3秒以上",
    hx_edema_bilat: "両側下腿浮腫",
    hx_edema_unilat: "片側下腿浮腫",
    hx_tender_epigastric: "心窩部圧痛",
    hx_tender_ruq: "右上腹部圧痛",
    hx_tender_rlq: "右下腹部圧痛",
    hx_tender_llq: "左下腹部圧痛",
    hx_tender_periumbilical: "臍周囲圧痛",
    hx_tender_back: "背部へ貫通する痛み",
    hx_tender_diffuse: "びまん性圧痛",
    hx_tender_any: "腹部圧痛あり",
    hx_peritoneal: "腹膜刺激徴候",
    hx_bowel_absent: "腸蠕動音の減弱〜消失",
    hx_bowel_metallic: "金属音（腸閉塞を示唆）",
    hx_murphy: "Murphy 徴候陽性",
    hx_abd_distension: "腹部膨満",
    hx_ascites: "腹水（波動）",
    hx_pulsatile_mass: "拍動性腹部腫瘤",
    hx_caput_medusae: "腹壁静脈拡張",
    hx_stool_watery: "水様便",
    hx_stool_bloody: "血便（鮮血）",
    hx_stool_melena: "黒色・タール状便",
    hx_stool_pale: "灰白色便",
    hx_focal_deficit: "局所神経症候あり",
    hx_hemiparesis: "片麻痺",
    hx_aphasia: "失語",
    hx_hemianopia: "半盲",
    hx_cerebellar: "小脳性の協調運動障害",
    hx_dysarthria: "構音障害",
    hx_pupil_aniso: "瞳孔不同",
    hx_pupil_fixed_dilated: "両側散大・固定",
    hx_pupil_pinpoint: "両側縮小（pinpoint）",
    hx_neck_stiff: "項部硬直",
    hx_asterixis: "羽ばたき振戦",
    hx_dtr_hyper: "腱反射亢進（＋病的反射）",
    hx_dtr_loss: "腱反射の低下〜消失",
    hx_sens_glove_stocking: "手袋・靴下型の感覚障害",
    hx_sens_dermatome: "デルマトーム分布の感覚障害",
    hx_sens_level: "髄節レベルのある感覚障害（横断性）",
    hx_sens_hemi: "片側の感覚障害",
    hx_tremor_rest: "安静時振戦",
    hx_tremor_fine: "細かく速い動作時振戦",
    hx_rash_diffuse: "びまん性紅斑",
    hx_petechiae: "点状出血・紫斑",
    hx_blister_mucosa: "水疱・粘膜疹",
    hx_malar_rash: "蝶形紅斑",
    hx_target_lesion: "環状・標的状の皮疹",
    hx_pustular: "膿疱",
    hx_purpura_palpable: "触知可能な紫斑",
    hx_purpura_flat: "平坦な（非触知）紫斑",
    hx_lymph_local: "局所リンパ節腫脹",
    hx_lymph_general: "全身性リンパ節腫脹",
    hx_mono_arthritis: "単関節の熱感・腫脹",
    hx_poly_sym_arthritis: "多関節・対称性（手指小関節）",
    hx_poly_asym_arthritis: "多関節・非対称性",
    hx_axial_arthritis: "体軸（仙腸・脊椎）の症状",
    hx_raynaud: "Raynaud 現象",
    hx_oral_ulcer: "口腔内潰瘍",
    hx_sicca: "眼・口の乾燥",
    hx_uveitis: "結膜炎・ぶどう膜炎",
    hx_goiter: "甲状腺びまん性腫大",
    hx_thyroid_nodule: "甲状腺結節",
    hx_thyroid_tender: "甲状腺の圧痛",
    hx_jaundice_skin: "皮膚・眼球の黄染",
    hx_cyanosis: "チアノーゼ",
    hx_spider_angioma: "クモ状血管腫・手掌紅斑",
    hx_hyperpigment: "色素沈着",
    hx_skin_sclerosis: "皮膚硬化"
  };

  function label(flag) { return LABEL[flag] || flag; }

  /** 身体所見が一つも入っていないかどうか。主訴別アプローチの表示を変えるのに使う。 */
  function derive(V) {
    var n = 0;
    A.forEach(function (a) {
      var v = V[a.key];
      if (v != null && v !== "") n++;
    });
    return { hx: { entered: n, total: A.length } };
  }

  function findings(V) {
    var F = {};
    var eq = function (key, val) { return V[key] === val; };
    var set = function (flag, cond) { if (cond) F[flag] = true; };

    /* 発症と経過 */
    set("hx_sudden_onset", eq("hx_onset", "突然（秒〜分で完成）"));
    set("hx_onset_acute", eq("hx_onset", "急性（数時間）"));
    set("hx_onset_subacute", eq("hx_onset", "亜急性（数日〜数週）"));
    set("hx_onset_chronic", eq("hx_onset", "慢性（数か月以上）"));
    set("hx_progressive", eq("hx_course", "進行・増悪"));
    set("hx_recurrent", eq("hx_course", "反復（間欠的）"));
    set("hx_exertional", eq("hx_trigger", "労作時"));
    set("hx_at_rest", eq("hx_trigger", "安静時"));
    set("hx_after_meal", eq("hx_trigger", "食後"));
    set("hx_postural", eq("hx_trigger", "体位変換時"));
    set("hx_after_drug", eq("hx_trigger", "薬剤開始後"));
    set("hx_post_infection", eq("hx_trigger", "感染後"));
    set("hx_post_trauma", eq("hx_trigger", "外傷後"));
    set("hx_pain_max_at_onset", eq("hx_pain_max", "発症直後が最強"));

    /* 全身・意識 */
    var gcs = LabsCore.num(V.hx_gcs);
    set("hx_gcs_low", gcs != null && gcs <= 14);
    set("hx_gcs_severe", gcs != null && gcs <= 8);
    set("hx_jcs_ii", eq("hx_jcs", "II（刺激で覚醒）"));
    set("hx_jcs_iii", eq("hx_jcs", "III（刺激でも覚醒しない）"));
    set("hx_consciousness_impaired",
      F.hx_gcs_low || F.hx_jcs_ii || F.hx_jcs_iii || eq("hx_jcs", "I（刺激なしで覚醒）"));
    set("hx_coma", F.hx_gcs_severe || F.hx_jcs_iii);
    set("hx_hypovolemia", eq("hx_volume", "不足（脱水）"));
    set("hx_hypervolemia", eq("hx_volume", "過剰（体液過剰）"));
    set("hx_weight_gain", eq("hx_weight", "増加（1週で2kg以上）"));
    set("hx_weight_loss", eq("hx_weight", "減少（6か月で5%以上）"));

    /* 呼吸 */
    set("hx_resp_effort", eq("hx_resp_effort", "努力呼吸（補助筋使用）"));
    set("hx_tachypnea_shallow", eq("hx_resp_effort", "浅く速い"));
    set("hx_kussmaul", eq("hx_resp_effort", "Kussmaul（深く大きい）"));
    set("hx_cheyne", eq("hx_resp_effort", "Cheyne-Stokes"));
    set("hx_agonal", eq("hx_resp_effort", "下顎呼吸・あえぎ"));
    set("hx_orthopnea", eq("hx_orthopnea", "あり"));
    set("hx_fine_crackles", eq("hx_lung", "捻髪音（両側下肺の fine crackles）"));
    set("hx_coarse_crackles", eq("hx_lung", "水泡音（coarse crackles）"));
    set("hx_wheeze", eq("hx_lung", "wheeze（笛音）"));
    set("hx_breath_down_unilat", eq("hx_lung", "片側で呼吸音減弱"));
    set("hx_breath_down_bilat", eq("hx_lung", "両側で呼吸音減弱"));
    set("hx_sputum_purulent", eq("hx_cough", "膿性喀痰"));
    set("hx_hemoptysis", eq("hx_cough", "血痰・喀血"));

    /* 循環 */
    set("hx_jvd", eq("hx_jvd", "あり"));
    set("hx_murmur_systolic", eq("hx_murmur", "収縮期"));
    set("hx_murmur_diastolic", eq("hx_murmur", "拡張期"));
    set("hx_murmur_new", eq("hx_murmur", "新規出現／性状が変化"));
    set("hx_heart_muffled", eq("hx_heart_sound", "減弱（遠い心音）"));
    set("hx_s3", eq("hx_heart_sound", "III音（ギャロップ）"));
    set("hx_pericardial_rub", eq("hx_heart_sound", "心膜摩擦音"));
    set("hx_bp_lr_diff", eq("hx_bp_lr", "あり（20mmHg 以上）"));
    set("hx_cold_clammy", eq("hx_perfusion", "冷汗・湿潤"));
    set("hx_crt_delay", eq("hx_perfusion", "CRT 3秒以上"));
    set("hx_edema_bilat", eq("hx_leg_edema", "両側（圧痕性）"));
    set("hx_edema_unilat", eq("hx_leg_edema", "片側"));

    /* 腹部 */
    set("hx_tender_epigastric", eq("hx_abd_tender", "心窩部（上腹部）"));
    set("hx_tender_ruq", eq("hx_abd_tender", "右上腹部"));
    set("hx_tender_rlq", eq("hx_abd_tender", "右下腹部"));
    set("hx_tender_llq", eq("hx_abd_tender", "左下腹部"));
    set("hx_tender_periumbilical", eq("hx_abd_tender", "臍周囲"));
    set("hx_tender_back", eq("hx_abd_tender", "背部へ貫通・移動"));
    set("hx_tender_diffuse", eq("hx_abd_tender", "びまん性"));
    set("hx_tender_any", !!(V.hx_abd_tender && V.hx_abd_tender !== "" && V.hx_abd_tender !== "なし"));
    set("hx_peritoneal", eq("hx_peritoneal", "あり（反跳痛・筋性防御）"));
    set("hx_bowel_absent", eq("hx_bowel", "減弱〜消失"));
    set("hx_bowel_metallic", eq("hx_bowel", "金属音（高調）"));
    set("hx_murphy", eq("hx_murphy", "陽性"));
    set("hx_abd_distension", eq("hx_abd_sign", "腹部膨満"));
    set("hx_ascites", eq("hx_abd_sign", "波動あり（腹水）"));
    set("hx_pulsatile_mass", eq("hx_abd_sign", "拍動性腫瘤"));
    set("hx_caput_medusae", eq("hx_abd_sign", "腹壁静脈拡張"));
    set("hx_stool_watery", eq("hx_stool", "水様"));
    set("hx_stool_bloody", eq("hx_stool", "血便（鮮血）"));
    set("hx_stool_melena", eq("hx_stool", "黒色・タール状"));
    set("hx_stool_pale", eq("hx_stool", "白色・灰白色"));

    /* 神経 */
    set("hx_hemiparesis", eq("hx_focal", "片麻痺"));
    set("hx_aphasia", eq("hx_focal", "失語"));
    set("hx_hemianopia", eq("hx_focal", "半盲"));
    set("hx_cerebellar", eq("hx_focal", "小脳性（協調運動障害）"));
    set("hx_dysarthria", eq("hx_focal", "構音障害のみ"));
    set("hx_focal_deficit",
      F.hx_hemiparesis || F.hx_aphasia || F.hx_hemianopia || F.hx_cerebellar || F.hx_dysarthria);
    set("hx_pupil_aniso", eq("hx_pupil", "左右不同（アニソコリア）"));
    set("hx_pupil_fixed_dilated", eq("hx_pupil", "両側散大・固定"));
    set("hx_pupil_pinpoint", eq("hx_pupil", "両側縮小（pinpoint）"));
    set("hx_neck_stiff", eq("hx_neck", "あり"));
    set("hx_asterixis", eq("hx_asterixis", "あり"));
    set("hx_dtr_hyper", eq("hx_dtr", "亢進（＋病的反射）"));
    set("hx_dtr_loss", eq("hx_dtr", "低下〜消失"));
    set("hx_sens_glove_stocking", eq("hx_sensory", "手袋・靴下型"));
    set("hx_sens_dermatome", eq("hx_sensory", "デルマトーム分布"));
    set("hx_sens_level", eq("hx_sensory", "髄節レベルあり（横断性）"));
    set("hx_sens_hemi", eq("hx_sensory", "片側"));
    set("hx_tremor_rest", eq("hx_tremor", "安静時"));
    set("hx_tremor_fine", eq("hx_tremor", "動作時（細かく速い）"));

    /* 皮膚・関節・表在 */
    set("hx_rash_diffuse", eq("hx_rash", "びまん性紅斑"));
    set("hx_petechiae", eq("hx_rash", "点状出血・紫斑"));
    set("hx_blister_mucosa", eq("hx_rash", "水疱・粘膜疹"));
    set("hx_malar_rash", eq("hx_rash", "蝶形紅斑"));
    set("hx_target_lesion", eq("hx_rash", "環状・標的状"));
    set("hx_pustular", eq("hx_rash", "膿疱"));
    set("hx_purpura_palpable", eq("hx_purpura_palp", "触知可能（palpable）"));
    set("hx_purpura_flat", eq("hx_purpura_palp", "平坦（非触知）"));
    set("hx_lymph_local", eq("hx_lymph", "局所"));
    set("hx_lymph_general", eq("hx_lymph", "全身性"));
    set("hx_mono_arthritis", eq("hx_joint", "単関節の熱感・腫脹"));
    set("hx_poly_sym_arthritis", eq("hx_joint", "多関節・対称性（手指小関節）"));
    set("hx_poly_asym_arthritis", eq("hx_joint", "多関節・非対称性"));
    set("hx_axial_arthritis", eq("hx_joint", "体軸（仙腸・脊椎）"));
    set("hx_raynaud", eq("hx_raynaud", "あり"));
    set("hx_oral_ulcer", eq("hx_oral", "口腔内潰瘍"));
    set("hx_sicca", eq("hx_oral", "眼・口の乾燥"));
    set("hx_uveitis", eq("hx_oral", "結膜炎・ぶどう膜炎"));
    set("hx_goiter", eq("hx_thyroid", "びまん性腫大"));
    set("hx_thyroid_nodule", eq("hx_thyroid", "結節"));
    set("hx_thyroid_tender", eq("hx_thyroid", "圧痛あり"));
    set("hx_jaundice_skin", eq("hx_skin_other", "黄染（黄疸）"));
    set("hx_cyanosis", eq("hx_skin_other", "チアノーゼ"));
    set("hx_spider_angioma", eq("hx_skin_other", "クモ状血管腫・手掌紅斑"));
    set("hx_hyperpigment", eq("hx_skin_other", "色素沈着"));
    set("hx_skin_sclerosis", eq("hx_skin_other", "皮膚硬化（浮腫状硬化）"));

    return F;
  }

  LabsCore.register({
    id: "hx",
    title: "問診・身体所見",
    subtitle: "発症様式と身体所見から診断を絞る",
    icon: "🩺",
    hideItems: true,
    groups: [G1, G2, G3, G4, G5, G6, G7],
    analytes: A,
    derive: derive,
    findings: findings
  });

  return { label: label, LABEL: LABEL, analytes: A };
})();
