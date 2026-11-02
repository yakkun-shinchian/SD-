/*! dx-refs.js — 出典レジストリ
 *  各判定・スコア・診断基準の原典を一元管理する。
 *  画面上は DXRefs.cite("SEPSIS3") で短縮表記、詳細は出典一覧に展開される。
 *  ⚠ 記載の書誌情報は実装時点のものです。運用前に原典で照合してください。
 */
var DXRefs = (function () {
  "use strict";

  var R = {
    NG158: {"label": "VTE：事前確率に応じた検査（NICE NG158）", "cite": "NICE NG158, 1.1. https://www.nice.org.uk/guidance/ng158/chapter/Recommendations"},
    NG148: {"label": "AKI：緊急造影と薬剤の判断（NICE NG148）", "cite": "NICE NG148, 1.1.7, 1.2. https://www.nice.org.uk/guidance/ng148/chapter/Recommendations"},
    ESC_HTN2024: {"label": "高血圧性緊急症：臓器障害と病態別対応（ESC 2024）", "cite": "2024 ESC hypertension guidelines, section 10. https://academic.oup.com/eurheartj/article/45/38/3912/7741010"},

    /* 初期対応の条件分岐・検査順序（2026-11-02照合） */
    NG240: {"label": "細菌性髄膜炎・髄膜炎菌感染症：検査と初期対応（NICE NG240）", "cite": "NICE NG240 (2024), 1.4.6–1.4.13, 1.6, 1.9. https://www.nice.org.uk/guidance/ng240/chapter/Recommendations"},
    NG39: {"label": "緊張性気胸の画像前減圧（NICE NG39）", "cite": "NICE NG39, 1.4.1–1.4.2（外傷診療の指針。循環不安定・重度呼吸障害の条件を参照）. https://www.nice.org.uk/guidance/ng39/chapter/Recommendations"},
    SSC2021: {"label": "敗血症：抗菌薬開始と培養（SSC 2021）", "cite": "Evans L, et al. Surviving Sepsis Campaign 2021. https://pmc.ncbi.nlm.nih.gov/articles/PMC8486643/"},
    ENCEPH_IDSA: {"label": "脳炎：経験的抗ウイルス治療（IDSA）", "cite": "Tunkel AR, et al. Clin Infect Dis. 2008;47:303–327, recommendation 21. https://academic.oup.com/cid/article/47/3/303/313455"},
    NG228: {"label": "SAH：CT陰性後の検査（NICE NG228）", "cite": "NICE NG228, 1.1.11–1.1.14. https://www.nice.org.uk/guidance/ng228/chapter/Recommendations"},
    NG128: {"label": "脳卒中・TIAの初期対応（NICE NG128）", "cite": "NICE NG128, 1.1–1.3. https://www.nice.org.uk/guidance/NG128/chapter/recommendations"},
    NG234: {"label": "悪性脊髄圧迫のステロイド適応（NICE NG234）", "cite": "NICE NG234, 1.8.1–1.8.2. https://www.nice.org.uk/guidance/ng234/chapter/recommendations"},
    ADRENAL_CRISIS: {"label": "副腎クリーゼ：検査を待たない治療（Society for Endocrinology）", "cite": "Society for Endocrinology, Adrenal crisis guidance. https://www.endocrinology.org/clinical-practice/clinical-guidance/adrenal-crisis/"},
    HYPERCA_EMERG: {"label": "高Ca血症：重症度別治療", "cite": "Society for Endocrinology (2016), Emergency management of acute hypercalcaemia. https://www.endocrinology.org/media/4277/emergency-guidance_acute-hypercalcaemia-in-adults.pdf"},
    HYPONA_EMERG: {"label": "症候性低Na血症：緊急補正と過補正防止", "cite": "Society for Endocrinology (2016). https://pmc.ncbi.nlm.nih.gov/articles/PMC5314809/"},
    ASAM_THIAMINE: {"label": "チアミンとブドウ糖の投与順序（ASAM）", "cite": "ASAM Clinical Practice Guideline on Alcohol Withdrawal Management (2020), V.7. https://doi.org/10.1097/ADM.0000000000000668"},
    AHA_POISON: {"label": "中毒の拮抗薬：適応と禁忌（AHA）", "cite": "AHA CPR & ECC Guidelines, Special Circumstances: Benzodiazepine and opioid poisoning. https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-and-pediatric-special-circumstances-of-resuscitation/"},
    ACC_BLEED: {"label": "抗凝固薬関連出血：中和適応（ACC）", "cite": "ACC Expert Consensus Decision Pathway (2020). https://www.jacc.org/doi/10.1016/j.jacc.2020.04.053"},
    CG141: {"label": "上部消化管出血：蘇生・内視鏡・薬物（NICE）", "cite": "NICE CG141, 1.3–1.5. https://www.nice.org.uk/guidance/CG141/Chapter/Recommendations"},
    IDSA_SSTI: {"label": "壊死性軟部組織感染：外科対応を遅らせない（IDSA）", "cite": "IDSA SSTI guideline (2014), section VIII. https://www.idsociety.org/practice-guideline/skin-and-soft-tissue-infections/"},
    RCUK_K: {"label": "高K血症の緊急治療（RCUK 2025）", "cite": "Resuscitation Council UK 2025, Special circumstances: Hyperkalaemia. https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/special-circumstances-guidelines"},
    DKA2024: {"label": "成人DKA：インスリン開始前のK評価", "cite": "Umpierrez GE, et al. Hyperglycemic Crises in Adults With Diabetes. Diabetes Care. 2024;47:1257–1275. https://doi.org/10.2337/dci24-0032"},
    TG18_INITIAL: {"label": "胆管炎の初期管理とドレナージ時機（TG18）", "cite": "Miura F, et al. Tokyo Guidelines 2018: initial management. https://doi.org/10.1002/jhbp.509"},
    ACG_AP2024: {"label": "急性膵炎：CTの適応（ACG 2024）", "cite": "Tenner S, et al. ACG Guidelines: Management of Acute Pancreatitis (2024). https://pmc.ncbi.nlm.nih.gov/articles/PMC13221274/"},
    ASH_HIT: {"label": "HIT：4Tsに応じた初期対応（ASH 2018）", "cite": "ASH 2018 HIT guideline, recommendations 2.2–2.6. https://pmc.ncbi.nlm.nih.gov/articles/PMC6258919/"},
    ISTH_TTP: {"label": "TTP：ADAMTS13採血と治療開始（ISTH）", "cite": "ISTH guidelines for diagnosis of TTP (2020). https://pmc.ncbi.nlm.nih.gov/articles/PMC8146131/"},

    /* ---- 基準値・計算式 ---- */
    JCCLS:      { label: "JCCLS 共用基準範囲",
                  cite: "日本臨床検査標準協議会（JCCLS）基準範囲共用化委員会. 共用基準範囲に基づく医学的判断値." },
    EGFR_JP:    { label: "日本人 eGFR 推算式",
                  cite: "Matsuo S, et al. Revised equations for estimated GFR from serum creatinine in Japan. Am J Kidney Dis. 2009;53(6):982-992." },
    PAYNE:      { label: "Payne 補正Ca式",
                  cite: "Payne RB, et al. Interpretation of serum calcium in patients with abnormal serum proteins. Br Med J. 1973;4(5893):643-646." },

    /* ---- 酸塩基平衡 ---- */
    WINTER:     { label: "Winter 式",
                  cite: "Albert MS, Dell RB, Winters RW. Quantitative displacement of acid-base equilibrium in metabolic acidosis. Ann Intern Med. 1967;66(2):312-322." },
    FIGGE:      { label: "アルブミン補正アニオンギャップ",
                  cite: "Figge J, et al. Anion gap and hypoalbuminemia. Crit Care Med. 1998;26(11):1807-1810." },
    GOLDMARK:   { label: "GOLD MARK（AG開大の鑑別）",
                  cite: "Mehta AN, Emmett JB, Emmett M. GOLD MARK: an anion gap mnemonic for the 21st century. Lancet. 2008;372(9642):892." },
    UAG:        { label: "尿アニオンギャップ",
                  cite: "Batlle DC, et al. The use of the urinary anion gap in the diagnosis of hyperchloremic metabolic acidosis. N Engl J Med. 1988;318(10):594-599." },
    BERLIN:     { label: "ARDS ベルリン定義",
                  cite: "ARDS Definition Task Force. Acute respiratory distress syndrome: the Berlin Definition. JAMA. 2012;307(23):2526-2533." },

    /* ---- 感染症・敗血症 ---- */
    SEPSIS3:    { label: "Sepsis-3",
                  cite: "Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-810." },
    SOFA:       { label: "SOFA スコア",
                  cite: "Vincent JL, et al. The SOFA score to describe organ dysfunction/failure. Intensive Care Med. 1996;22(7):707-710." },
    CURB65:     { label: "CURB-65",
                  cite: "Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital. Thorax. 2003;58(5):377-382." },
    ADROP:      { label: "A-DROP",
                  cite: "日本呼吸器学会. 成人肺炎診療ガイドライン." },
    CENTOR:     { label: "McIsaac（修正Centor）スコア",
                  cite: "McIsaac WJ, et al. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ. 1998;158(1):75-83." },

    /* ---- 循環器 ---- */
    CHADSVASC:  { label: "CHA₂DS₂-VASc",
                  cite: "Lip GY, et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation. Chest. 2010;137(2):263-272." },
    HASBLED:    { label: "HAS-BLED",
                  cite: "Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding. Chest. 2010;138(5):1093-1100." },
    WELLS_DVT:  { label: "Wells スコア（DVT）",
                  cite: "Wells PS, et al. Value of assessment of pretest probability of deep-vein thrombosis in clinical management. Lancet. 1997;350(9094):1795-1798." },
    WELLS_PE:   { label: "Wells スコア（肺塞栓）",
                  cite: "Wells PS, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost. 2000;83(3):416-420." },
    SPESI:      { label: "簡易版 PESI",
                  cite: "Jiménez D, et al. Simplification of the pulmonary embolism severity index for prognostication. Arch Intern Med. 2010;170(15):1383-1389." },

    /* ---- 腎 ---- */
    KDIGO_AKI:  { label: "KDIGO AKI 診療ガイドライン",
                  cite: "KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138." },
    KDIGO_CKD:  { label: "KDIGO CKD 診療ガイドライン",
                  cite: "KDIGO 2012 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int Suppl. 2013;3(1):1-150." },

    /* ---- 肝・消化器 ---- */
    CHILDPUGH:  { label: "Child-Pugh 分類",
                  cite: "Pugh RN, et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-649." },
    MELD:       { label: "MELD スコア",
                  cite: "Kamath PS, et al. A model to predict survival in patients with end-stage liver disease. Hepatology. 2001;33(2):464-470." },
    MELDNA:     { label: "MELD-Na",
                  cite: "Kim WR, et al. Hyponatremia and mortality among patients on the liver-transplant waiting list. N Engl J Med. 2008;359(10):1018-1026." },
    WESTHAVEN:  { label: "West-Haven 分類（肝性脳症）",
                  cite: "Vilstrup H, et al. Hepatic encephalopathy in chronic liver disease: 2014 practice guideline by AASLD and EASL. Hepatology. 2014;60(2):715-735." },
    GBS:        { label: "Glasgow-Blatchford スコア",
                  cite: "Blatchford O, Murray WR, Blatchford M. A risk score to predict need for treatment for upper-gastrointestinal haemorrhage. Lancet. 2000;356(9238):1318-1321." },
    ROCKALL:    { label: "Rockall スコア",
                  cite: "Rockall TA, et al. Risk assessment after acute upper gastrointestinal haemorrhage. Gut. 1996;38(3):316-321." },
    JSS_AP:     { label: "急性膵炎 重症度判定基準（厚生労働省）",
                  cite: "厚生労働省難治性膵疾患に関する調査研究班. 急性膵炎重症度判定基準（2008年改訂）／急性膵炎診療ガイドライン." },
    LIGHT:      { label: "Light の基準（胸水）",
                  cite: "Light RW, et al. Pleural effusions: the diagnostic separation of transudates and exudates. Ann Intern Med. 1972;77(4):507-513." },

    /* ---- 血液・凝固 ---- */
    JAAM_DIC:   { label: "急性期DIC診断基準（日本救急医学会）",
                  cite: "Gando S, et al. A multicenter, prospective validation of disseminated intravascular coagulation diagnostic criteria for critically ill patients. Crit Care Med. 2006;34(3):625-631." },
    ISTH_DIC:   { label: "ISTH overt DIC スコア",
                  cite: "Taylor FB Jr, et al. Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation. Thromb Haemost. 2001;86(5):1327-1330." },
    FOURTS:     { label: "4Ts スコア（HIT）",
                  cite: "Lo GK, et al. Evaluation of pretest clinical score (4 T's) for the diagnosis of heparin-induced thrombocytopenia. J Thromb Haemost. 2006;4(4):759-765." },
    HSCORE:     { label: "HScore（血球貪食症候群）",
                  cite: "Fardet L, et al. Development and validation of the HScore, a score for the diagnosis of reactive hemophagocytic syndrome. Arthritis Rheumatol. 2014;66(9):2613-2620." },

    /* ---- 内分泌 ---- */
    BURCH:      { label: "Burch-Wartofsky スコア（甲状腺クリーゼ）",
                  cite: "Burch HB, Wartofsky L. Life-threatening thyrotoxicosis: thyroid storm. Endocrinol Metab Clin North Am. 1993;22(2):263-277." },
    JTA_STORM:  { label: "甲状腺クリーゼ診断基準（日本甲状腺学会）",
                  cite: "日本甲状腺学会・日本内分泌学会. 甲状腺クリーゼ診断基準." },

    /* ---- 膠原病 ---- */
    SLE2019:    { label: "SLE 分類基準（EULAR/ACR 2019）",
                  cite: "Aringer M, et al. 2019 European League Against Rheumatism/American College of Rheumatology classification criteria for systemic lupus erythematosus. Ann Rheum Dis. 2019;78(9):1151-1159." },
    RA2010:     { label: "RA 分類基準（ACR/EULAR 2010）",
                  cite: "Aletaha D, et al. 2010 Rheumatoid arthritis classification criteria. Arthritis Rheum. 2010;62(9):2569-2581." },
    SSC2013:    { label: "全身性強皮症 分類基準（ACR/EULAR 2013）",
                  cite: "van den Hoogen F, et al. 2013 classification criteria for systemic sclerosis. Ann Rheum Dis. 2013;72(11):1747-1755." },
    APS_SYD:    { label: "抗リン脂質抗体症候群 分類基準（Sydney）",
                  cite: "Miyakis S, et al. International consensus statement on an update of the classification criteria for definite antiphospholipid syndrome. J Thromb Haemost. 2006;4(2):295-306." },

    /* ---- 神経 ---- */
    ABCD2:      { label: "ABCD² スコア（TIA）",
                  cite: "Johnston SC, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-292." },

    /* ---- 全身 ---- */
    NEWS2:      { label: "NEWS2",
                  cite: "Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. 2017." },

    /* ---- 意識・神経の評価尺度 ---- */
    GCS:        { label: "Glasgow Coma Scale",
                  cite: "Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-84." },
    JCS:        { label: "Japan Coma Scale（3-3-9度方式）",
                  cite: "太田富雄, 他. 急性期意識障害の新しいgrading とその表現法（いわゆる3-3-9度方式）. 脳神経外科学会（第3回脳卒中の外科研究会）講演集. 1975:61-69." },
    NIHSS:      { label: "NIHSS",
                  cite: "Brott T, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-870." },
    STROKE_JP:  { label: "脳卒中治療ガイドライン",
                  cite: "日本脳卒中学会 脳卒中ガイドライン委員会. 脳卒中治療ガイドライン 2021." },
    OTTAWA_SAH: { label: "Ottawa SAH ルール",
                  cite: "Perry JJ, et al. Clinical decision rules to rule out subarachnoid hemorrhage for acute headache. JAMA. 2013;310(12):1248-1255." },
    SE_ILAE:    { label: "てんかん重積の定義（ILAE）",
                  cite: "Trinka E, et al. A definition and classification of status epilepticus - Report of the ILAE Task Force on Classification of Status Epilepticus. Epilepsia. 2015;56(10):1515-1523." },
    GBS_CRIT:   { label: "ギラン・バレー症候群 診断基準",
                  cite: "Asbury AK, Cornblath DR. Assessment of current diagnostic criteria for Guillain-Barre syndrome. Ann Neurol. 1990;27(Suppl):S21-S24." },
    DUKE:       { label: "修正 Duke 基準（感染性心内膜炎）",
                  cite: "Li JS, et al. Proposed modifications to the Duke criteria for the diagnosis of infective endocarditis. Clin Infect Dis. 2000;30(4):633-638." },
    GOUT2015:   { label: "痛風 分類基準（ACR/EULAR 2015）",
                  cite: "Neogi T, et al. 2015 Gout Classification Criteria: an American College of Rheumatology/European League Against Rheumatism collaborative initiative. Arthritis Rheumatol. 2015;67(10):2557-2568." },
    MENINGITIS: { label: "成人細菌性髄膜炎の臨床所見",
                  cite: "van de Beek D, et al. Clinical features and prognostic factors in adults with bacterial meningitis. N Engl J Med. 2004;351(18):1849-1859." },

    /* ---- 循環・呼吸の主訴別アプローチ ---- */
    ACS_JCS:    { label: "急性冠症候群ガイドライン（日本循環器学会）",
                  cite: "日本循環器学会. 急性冠症候群ガイドライン（2018年改訂版）." },
    AORTA_ACC:  { label: "大動脈疾患ガイドライン（ACC/AHA 2022）",
                  cite: "Isselbacher EM, et al. 2022 ACC/AHA Guideline for the Diagnosis and Management of Aortic Disease. Circulation. 2022;146(24):e334-e482." },
    HF_JCS:     { label: "急性・慢性心不全診療ガイドライン",
                  cite: "日本循環器学会／日本心不全学会. 急性・慢性心不全診療ガイドライン（2017年改訂版）および2021年フォーカスアップデート." },
    PE_HF:      { label: "心不全の身体所見の診断精度",
                  cite: "Wang CS, et al. Does this dyspneic patient in the emergency department have congestive heart failure? JAMA. 2005;294(15):1944-1956." },

    /* ---- 腹部・消化器 ---- */
    TG18:       { label: "Tokyo Guidelines 2018（急性胆嚢炎・胆管炎）",
                  cite: "Yokoe M, et al. Tokyo Guidelines 2018: diagnostic criteria and severity grading of acute cholecystitis. J Hepatobiliary Pancreat Sci. 2018;25(1):41-54." },
    ALVARADO:   { label: "Alvarado スコア（急性虫垂炎）",
                  cite: "Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med. 1986;15(5):557-564." },
    IDSA_DIAR:  { label: "感染性腸炎 診療ガイドライン（IDSA）",
                  cite: "Shane AL, et al. 2017 Infectious Diseases Society of America Clinical Practice Guidelines for the Diagnosis and Management of Infectious Diarrhea. Clin Infect Dis. 2017;65(12):e45-e80." },

    /* ---- 皮膚・アレルギー ---- */
    ANAPHYLAXIS:{ label: "アナフィラキシー診断基準（WAO）",
                  cite: "Cardona V, et al. World Allergy Organization Anaphylaxis Guidance 2020. World Allergy Organ J. 2020;13(10):100472." },
    REGISCAR:   { label: "RegiSCAR（重症薬疹・DRESS）",
                  cite: "Kardaun SH, et al. Variability in the clinical pattern of cutaneous side-effects of drugs with systemic symptoms: does a DRESS syndrome really exist? Br J Dermatol. 2007;156(3):609-611." }
  };

  /** 出典IDの配列から、画面表示用の短縮ラベル配列を返す。 */
  function labels(ids) {
    return (ids || []).map(function (id) { return R[id] ? R[id].label : id; });
  }
  /** 出典IDの配列から、書誌情報付きのエントリ配列を返す。 */
  function entries(ids) {
    return (ids || []).map(function (id) {
      return R[id] ? { id: id, label: R[id].label, cite: R[id].cite } : { id: id, label: id, cite: "" };
    });
  }
  function get(id) { return R[id] || null; }
  function all() {
    return Object.keys(R).map(function (id) {
      return { id: id, label: R[id].label, cite: R[id].cite };
    });
  }

  return { get: get, labels: labels, entries: entries, all: all, map: R };
})();
