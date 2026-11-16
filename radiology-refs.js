/*! radiology-refs.js — RadioDeck 出典レジストリ
 *  所見・判定の根拠を一元管理する。所見側は refs: ["FLEISCHNER2024", ...] と
 *  IDで参照し、表示時にこのレジストリが書誌情報とリンクに展開する。
 *
 *  kind: "primary" … 学会ガイドライン・原著論文（判断の根拠）
 *        "edu"     … 無料の教育資料（学び直し・図の確認用）
 *
 *  ⚠ 記載の書誌情報は実装時点で確認したものです。臨床判断に使う前に、
 *    必ず原典で照合してください。本アプリは教育目的であり、診断には用いません。
 */
var RadioRefs = (function () {
  "use strict";

  var R = {
    /* ===== 用語・総論 ===== */
    FLEISCHNER2024: {
      kind: "primary",
      label: "Fleischner 用語集（第4版・2024）",
      cite: "Bankier AA, et al. Fleischner Society: Glossary of Terms for Thoracic Imaging. Radiology. 2024;310(2):e232558.",
      note: "胸部画像用語の国際標準。1984/1996/2008年版を置き換えた最新版。"
    },
    FLEISCHNER2008: {
      kind: "primary",
      label: "Fleischner 用語集（2008）",
      cite: "Hansell DM, et al. Fleischner Society: glossary of terms for thoracic imaging. Radiology. 2008;246(3):697-722. doi:10.1148/radiol.2462070712",
      url: "https://pubmed.ncbi.nlm.nih.gov/18195376/",
      note: "長く標準とされた版。2024年版に置き換えられたが、引用文献として頻出。"
    },
    JSRT_GL2021: {
      kind: "primary",
      label: "画像診断ガイドライン 2021年版（日本医学放射線学会）",
      cite: "日本医学放射線学会 編. 画像診断ガイドライン 2021年版. 金原出版; 2021.",
      url: "https://www.radiology.jp/content/files/gl2021/diagnostic_imaging_guidelines_2021.pdf",
      note: "日本語の一次資料。画像検査をオーダーする側の医師を対象に、138のBQ/CQ/FQで構成。"
    },

    /* ===== 胸部 ===== */
    BTS_PLEURAL2023: {
      kind: "primary",
      label: "BTS 胸膜疾患ガイドライン（2023）",
      cite: "Roberts ME, Rahman NM, et al. BTS Guideline for pleural disease. Thorax. 2023. doi:10.1136/thorax-2022-219371",
      url: "https://www.brit-thoracic.org.uk/clinical-resources/guidelines/pleural-disease",
      note: "気胸・胸水・膿胸・胸膜悪性腫瘍の検査と管理。2010年版の改訂。"
    },
    RADMASTER_CHEST: {
      kind: "edu",
      label: "Radiology Masterclass：胸部X線の系統的読影",
      cite: "Radiology Masterclass. Chest X-ray — Systematic Approach.",
      url: "https://www.radiologymasterclass.co.uk/tutorials/chest/chest_system/chest_system_end",
      note: "読影順序に唯一の正解はない、と明言したうえで手順を示す教材。"
    },
    ROBOCHEST: {
      kind: "edu",
      label: "RoboChest（NIAID／米軍医大学）",
      cite: "RoboChest. National Institute of Allergy and Infectious Diseases / Uniformed Services University.",
      url: "https://robochest.niaid.nih.gov/",
      note: "探索パターンの覚え方と読影の進め方を対話的に学ぶ公的教材。診断には用いない旨が明記されている。"
    },

    /* ===== 頭部 ===== */
    ASPECTS2000: {
      kind: "primary",
      label: "ASPECTS 原著（Lancet 2000）",
      cite: "Barber PA, Demchuk AM, Zhang J, Buchan AM; ASPECTS Study Group. Validity and reliability of a quantitative computed tomography score in predicting outcome of hyperacute stroke before thrombolytic therapy. Lancet. 2000;355(9216):1670-1674.",
      note: "10点から、早期虚血性変化のある領域ごとに1点ずつ減じる。島皮質も10領域のひとつ。"
    },
    MCA_DOT2001: {
      kind: "primary",
      label: "MCA dot sign 原著（Stroke 2001）",
      cite: "Barber PA, et al. Hyperdense sylvian fissure MCA “dot” sign: a CT marker of acute ischemia. Stroke. 2001;32(1):84-88. PMID:11136919",
      note: "シルビウス裂内のM2/M3閉塞を示す点状高吸収。本幹のhyperdense MCA signの末梢版。"
    },
    STATPEARLS_EDH: {
      kind: "edu",
      label: "StatPearls：硬膜外血腫",
      cite: "Epidural Hematoma. StatPearls. NCBI Bookshelf NBK518982.",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK518982/",
      note: "動脈性出血が硬膜を内板から剥離するため凸レンズ型になり、縫合で止まる——という機序の記述がある。"
    },

    /* ===== 腹部 ===== */
    LIRADS2018: {
      kind: "primary",
      label: "ACR CT/MRI LI-RADS v2018 Core",
      cite: "American College of Radiology. CT/MRI LI-RADS v2018 Core.",
      url: "https://www.acr.org/-/media/ACR/Files/RADS/LI-RADS/LI-RADS-2018-Core",
      note: "主要所見は 非辺縁性APHE・非辺縁性washout・被膜様濃染・大きさ・閾値増大 の5つ。"
    },
    TG18_CHOLECYSTITIS: {
      kind: "primary",
      label: "Tokyo Guidelines 2018（急性胆嚢炎）",
      cite: "Yokoe M, et al. Tokyo Guidelines 2018: diagnostic criteria and severity grading of acute cholecystitis. J Hepatobiliary Pancreat Sci. 2018;25(1):41-54. doi:10.1002/jhbp.515",
      url: "https://pubmed.ncbi.nlm.nih.gov/29032636/",
      note: "A局所の炎症所見＋B全身の炎症所見で疑診、Cの画像所見が加わって確診。"
    }
  };

  function get(id) { return R[id] || null; }

  /** 所見の refs（IDの配列、または旧形式の {label,url} 配列）を表示用に正規化する。 */
  function entries(refs) {
    return (refs || []).map(function (r) {
      if (typeof r === "string") {
        var e = R[r];
        return e
          ? { id: r, kind: e.kind, label: e.label, cite: e.cite, url: e.url || "", note: e.note || "" }
          : { id: r, kind: "", label: r, cite: "", url: "", note: "" };
      }
      return { id: "", kind: "", label: r.label || "", cite: "", url: r.url || "", note: "" };
    });
  }

  function all() {
    return Object.keys(R).map(function (id) {
      return {
        id: id, kind: R[id].kind, label: R[id].label,
        cite: R[id].cite, url: R[id].url || "", note: R[id].note || ""
      };
    });
  }

  return { get: get, entries: entries, all: all, map: R };
})();
