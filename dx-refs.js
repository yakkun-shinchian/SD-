/*! dx-refs.js — 出典レジストリ
 *  各判定・スコア・診断基準の原典を一元管理する。
 *  画面上は DXRefs.cite("SEPSIS3") で短縮表記、詳細は出典一覧に展開される。
 *  ⚠ 記載の書誌情報は実装時点のものです。運用前に原典で照合してください。
 */
var DXRefs = (function () {
  "use strict";

  var R = {
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
                  cite: "Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. 2017." }
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
