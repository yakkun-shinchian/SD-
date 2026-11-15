/*! dx-intake.js — 音声・貼り付けからの取り込み
 *
 *  検査値を1項目ずつ手で打つのは、ベッドサイドでは現実的ではない。
 *  話した言葉、あるいは電子カルテ・OCR から貼り付けた文章をそのまま受け取り、
 *  項目と数値に分解して入力欄へ落とす。
 *
 *  安全上の約束：
 *   - 読み取った結果は必ず確認表に出し、利用者が外せるようにしてから反映する。
 *     音声認識は必ず誤る。黙って値を入れることは、この用途では危険である。
 *   - 読み取れなかった語は「読み取れなかった」として残す。黙って捨てない。
 *   - 単位の読み替え（血小板の 70000 → 7 万）を行った場合は、その旨を必ず表示する。
 *   - 音声認識はブラウザ内蔵（Web Speech API）のみを使う。音声も本文も端末の外へ
 *     出さない設計を保つため、外部の書き起こしサービスは使わない。
 */
var DXIntake = (function () {
  "use strict";

  /* ================= 語彙 ================= */
  /* 検査項目。長い語から照合するので、並び順は気にしなくてよい。 */
  var LAB = {
    wbc: ["白血球数", "白血球", "WBC"],
    neut: ["好中球"], lymph: ["リンパ球"], eo: ["好酸球"], blast: ["芽球", "ブラスト"],
    atyp: ["異型リンパ球"],
    rbc: ["赤血球数", "赤血球", "RBC"],
    hb: ["ヘモグロビン", "血色素", "Hb", "HGB"],
    ht: ["ヘマトクリット", "Ht", "HCT"],
    plt: ["血小板数", "血小板", "PLT", "プレート"],
    retic: ["網赤血球", "レチクロ"],
    ast: ["AST", "GOT"], alt: ["ALT", "GPT"],
    ld: ["LDH", "LD"], alp: ["ALP"], ggt: ["γ-GTP", "γGTP", "ガンマGTP", "GGT"],
    tbil: ["総ビリルビン", "T-Bil", "TBil", "ビリルビン"],
    dbil: ["直接ビリルビン", "D-Bil", "DBil"],
    che: ["コリンエステラーゼ", "ChE"],
    tp: ["総蛋白", "総タンパク", "TP"],
    alb: ["アルブミン", "Alb"],
    nh3: ["アンモニア", "NH3"],
    bun: ["尿素窒素", "BUN", "UN"],
    cr: ["クレアチニン", "Cr", "Cre"],
    ua: ["尿酸", "UA"],
    na: ["ナトリウム", "Na"],
    k: ["カリウム", "K"],
    cl: ["クロール", "クロル", "Cl"],
    ca: ["カルシウム", "Ca"],
    ip: ["無機リン", "リン", "IP"],
    mg: ["マグネシウム", "Mg"],
    hco3: ["重炭酸", "ビカーボ", "HCO3", "HCO3-"],
    glu: ["血糖", "グルコース", "BS", "Glu"],
    hba1c: ["ヘモグロビンエーワンシー", "HbA1c", "A1c"],
    tcho: ["総コレステロール", "T-Cho"], ldl: ["LDL"], hdl: ["HDL"],
    tg: ["中性脂肪", "トリグリセリド", "TG"],
    ck: ["CPK", "CK"], ckmb: ["CK-MB", "CKMB"],
    tnt: ["高感度トロポニン", "トロポニン"],
    ntprobnp: ["NT-proBNP", "NTproBNP", "エヌティープロBNP"],
    bnp: ["BNP"],
    amy: ["アミラーゼ", "AMY"], lip: ["リパーゼ"],
    crp: ["CRP", "シーアールピー"],
    pct: ["プロカルシトニン", "PCT"],
    lac: ["乳酸", "ラクテート", "Lac"],
    sosm: ["血清浸透圧", "実測浸透圧"],
    uosm: ["尿浸透圧"],
    una: ["尿中ナトリウム", "尿中Na"],
    uk: ["尿中カリウム", "尿中K"], ucl: ["尿中クロール", "尿中Cl"],
    usg: ["尿比重"],
    ph: ["pH", "ピーエッチ"],
    paco2: ["PaCO2", "pCO2", "二酸化炭素分圧", "炭酸ガス分圧"],
    pao2: ["PaO2", "pO2", "酸素分圧"],
    be: ["ベースエクセス", "BE"],
    fio2: ["FiO2", "吸入酸素濃度"],
    ptsec: ["PT秒", "プロトロンビン時間"],
    ptpct: ["PT活性", "PT%"],
    inr: ["PT-INR", "INR"],
    aptt: ["APTT"],
    fib: ["フィブリノゲン", "フィブリノーゲン", "Fib"],
    fdp: ["FDP"],
    ddimer: ["Dダイマー", "D-ダイマー", "ディーダイマー", "DD"],
    at3: ["アンチトロンビン", "AT-III", "ATIII", "AT3"],
    tat: ["TAT"],
    c3: ["補体C3", "C3"], c4: ["補体C4", "C4"], ch50: ["CH50"],
    igg: ["IgG"], igg4: ["IgG4"],
    sil2r: ["可溶性IL-2レセプター", "sIL-2R", "sIL2R"],
    dsdna: ["抗dsDNA抗体", "dsDNA"],
    mpo: ["MPO-ANCA", "MPOANCA", "P-ANCA"],
    pr3: ["PR3-ANCA", "PR3ANCA", "C-ANCA"],
    rf: ["リウマトイド因子", "RF"],
    ccp: ["抗CCP抗体", "抗CCP", "CCP"],
    mmp3: ["MMP-3", "MMP3"],
    trab: ["TRAb"], achr: ["抗AChR抗体", "AChR抗体"], gad: ["抗GAD抗体", "GAD抗体"]
  };

  var VITAL_META = {
    bt: ["体温", "℃"], sbp: ["収縮期血圧", "mmHg"], dbp: ["拡張期血圧", "mmHg"],
    hr: ["心拍数", "/分"], rr: ["呼吸数", "/分"], spo2: ["SpO₂", "%"]
  };

  var VITAL = {
    bt: ["体温", "BT", "KT", "熱"],
    hr: ["心拍数", "脈拍", "脈", "HR", "PR"],
    rr: ["呼吸数", "呼吸", "RR"],
    spo2: ["SpO2", "サチュレーション", "サチュ", "酸素飽和度"],
    sbp: ["収縮期血圧"], dbp: ["拡張期血圧"]
  };

  /* 言い回し → 選択式の所見・患者背景。値まで決まるものだけを載せる。 */
  var PHRASE = [
    /* 発症と経過 */
    ["hx_onset", "突然（秒〜分で完成）", ["突然発症", "突然", "急に始ま"]],
    ["hx_onset", "急性（数時間）", ["数時間前から", "急性発症"]],
    ["hx_onset", "慢性（数か月以上）", ["数か月前から", "慢性の経過"]],
    ["hx_pain_max", "発症直後が最強", ["発症直後が最強", "最初が一番痛", "突然最強"]],
    ["hx_course", "進行・増悪", ["増悪", "悪化して"]],
    ["hx_trigger", "労作時", ["労作時", "歩くと", "動くと"]],
    ["hx_trigger", "薬剤開始後", ["薬を始めて", "投与開始後"]],
    ["hx_trigger", "感染後", ["感染の後", "感冒後", "下痢の後"]],
    /* 呼吸 */
    ["hx_resp_effort", "努力呼吸（補助筋使用）", ["努力呼吸", "補助筋"]],
    ["hx_resp_effort", "Kussmaul（深く大きい）", ["クスマウル", "Kussmaul"]],
    ["hx_resp_effort", "Cheyne-Stokes", ["チェーンストークス", "Cheyne"]],
    ["hx_orthopnea", "あり", ["起坐呼吸", "起座呼吸", "坐位で楽"]],
    ["hx_lung", "捻髪音（両側下肺の fine crackles）", ["捻髪音", "ファインクラックル", "fine crackles"]],
    ["hx_lung", "水泡音（coarse crackles）", ["水泡音", "coarse crackles", "コースクラックル"]],
    ["hx_lung", "wheeze（笛音）", ["wheeze", "ウィーズ", "喘鳴", "笛音"]],
    ["hx_lung", "片側で呼吸音減弱", ["片側の呼吸音減弱", "片側呼吸音減弱", "一側呼吸音減弱"]],
    ["hx_cough", "膿性喀痰", ["膿性痰", "膿性喀痰"]],
    ["hx_cough", "血痰・喀血", ["血痰", "喀血"]],
    /* 循環 */
    ["hx_jvd", "あり", ["頸静脈怒張", "けい静脈怒張", "JVD"]],
    ["hx_murmur", "収縮期", ["収縮期雑音"]],
    ["hx_murmur", "拡張期", ["拡張期雑音"]],
    ["hx_murmur", "新規出現／性状が変化", ["新規の心雑音", "新しい雑音"]],
    ["hx_heart_sound", "減弱（遠い心音）", ["心音減弱", "心音が遠い"]],
    ["hx_heart_sound", "III音（ギャロップ）", ["3音", "III音", "ギャロップ"]],
    ["hx_heart_sound", "心膜摩擦音", ["心膜摩擦音"]],
    ["hx_bp_lr", "あり（20mmHg 以上）", ["血圧の左右差", "左右差あり", "上下肢差"]],
    ["hx_perfusion", "冷汗・湿潤", ["冷汗", "冷や汗", "湿潤"]],
    ["hx_perfusion", "CRT 3秒以上", ["CRT延長", "毛細血管再充満時間の延長"]],
    ["hx_leg_edema", "両側（圧痕性）", ["両側の下腿浮腫", "両下肢浮腫", "両側浮腫"]],
    ["hx_leg_edema", "片側", ["片側の下腿腫脹", "片側浮腫", "一側の下腿腫脹"]],
    /* 腹部 */
    ["hx_abd_tender", "右上腹部", ["右上腹部痛", "右季肋部"]],
    ["hx_abd_tender", "右下腹部", ["右下腹部痛"]],
    ["hx_abd_tender", "左下腹部", ["左下腹部痛"]],
    ["hx_abd_tender", "心窩部（上腹部）", ["心窩部痛", "心窩部の圧痛", "上腹部痛"]],
    ["hx_abd_tender", "背部へ貫通・移動", ["背部へ放散", "背部に貫通", "背中へ抜ける"]],
    ["hx_abd_tender", "びまん性", ["腹部全体の圧痛", "びまん性の圧痛"]],
    ["hx_peritoneal", "あり（反跳痛・筋性防御）", ["腹膜刺激", "反跳痛", "筋性防御", "ブルンベルグ"]],
    ["hx_bowel", "金属音（高調）", ["金属音"]],
    ["hx_bowel", "減弱〜消失", ["腸蠕動音の減弱", "蠕動音消失", "腸雑音減弱"]],
    ["hx_murphy", "陽性", ["マーフィー徴候陽性", "Murphy陽性", "マーフィー陽性"]],
    ["hx_abd_sign", "波動あり（腹水）", ["腹水"]],
    ["hx_abd_sign", "拍動性腫瘤", ["拍動性腫瘤"]],
    ["hx_stool", "黒色・タール状", ["黒色便", "タール便", "メレナ"]],
    ["hx_stool", "血便（鮮血）", ["血便", "鮮血便"]],
    ["hx_stool", "水様", ["水様便"]],
    /* 神経 */
    ["hx_focal", "片麻痺", ["片麻痺", "右片麻痺", "左片麻痺"]],
    ["hx_focal", "失語", ["失語"]],
    ["hx_focal", "小脳性（協調運動障害）", ["小脳症状", "協調運動障害", "失調"]],
    ["hx_pupil", "左右不同（アニソコリア）", ["瞳孔不同", "アニソコリア"]],
    ["hx_pupil", "両側縮小（pinpoint）", ["縮瞳", "ピンポイント"]],
    ["hx_pupil", "両側散大・固定", ["瞳孔散大", "散大固定"]],
    ["hx_neck", "あり", ["項部硬直", "頸部硬直", "項部強直"]],
    ["hx_asterixis", "あり", ["羽ばたき振戦", "アステリキシス"]],
    ["hx_dtr", "低下〜消失", ["腱反射の低下", "腱反射消失", "深部腱反射低下"]],
    ["hx_dtr", "亢進（＋病的反射）", ["腱反射亢進", "病的反射"]],
    ["hx_sensory", "手袋・靴下型", ["手袋靴下型", "手袋・靴下"]],
    ["hx_sensory", "髄節レベルあり（横断性）", ["感覚レベル", "髄節レベル"]],
    ["hx_tremor", "動作時（細かく速い）", ["細かい振戦", "手指振戦"]],
    /* 皮膚・関節 */
    ["hx_rash", "点状出血・紫斑", ["点状出血", "紫斑"]],
    ["hx_rash", "蝶形紅斑", ["蝶形紅斑"]],
    ["hx_rash", "水疱・粘膜疹", ["粘膜疹", "水疱"]],
    ["hx_purpura_palp", "触知可能（palpable）", ["触知可能な紫斑", "palpable purpura"]],
    ["hx_lymph", "全身性", ["全身のリンパ節腫脹", "全身性リンパ節腫脹"]],
    ["hx_joint", "多関節・対称性（手指小関節）", ["対称性多関節", "手指小関節"]],
    ["hx_joint", "単関節の熱感・腫脹", ["単関節", "一関節の腫脹"]],
    ["hx_raynaud", "あり", ["レイノー", "Raynaud"]],
    ["hx_oral", "口腔内潰瘍", ["口腔内潰瘍", "アフタ"]],
    ["hx_thyroid", "びまん性腫大", ["甲状腺腫大", "甲状腺のびまん性腫大"]],
    ["hx_skin_other", "黄染（黄疸）", ["黄疸", "眼球黄染", "皮膚黄染"]],
    ["hx_skin_other", "クモ状血管腫・手掌紅斑", ["クモ状血管腫", "手掌紅斑"]],
    ["hx_skin_other", "チアノーゼ", ["チアノーゼ"]],
    /* 体液量・意識 */
    ["hx_volume", "不足（脱水）", ["脱水", "体液量不足"]],
    ["hx_volume", "過剰（体液過剰）", ["体液過剰", "溢水"]],
    ["hx_jcs", "III（刺激でも覚醒しない）", ["JCS300", "JCS200", "JCS100", "昏睡"]],
    ["hx_jcs", "II（刺激で覚醒）", ["JCS30", "JCS20", "JCS10"]],
    ["hx_jcs", "I（刺激なしで覚醒）", ["JCS3", "JCS2", "JCS1"]]
  ];

  var CHIP = {
    complaints: {
      fever: ["発熱", "熱発"], dyspnea: ["呼吸困難", "息苦し", "呼吸苦"],
      chest_pain: ["胸痛", "胸が痛"], abd_pain: ["腹痛", "お腹が痛"],
      bleeding: ["出血"], consciousness: ["意識障害", "意識レベル低下"],
      convulsion: ["痙攣", "けいれん"], paralysis: ["麻痺"],
      headache: ["頭痛"], edema: ["浮腫", "むくみ"], oliguria: ["乏尿", "尿が出な"],
      diarrhea: ["下痢"], vomiting: ["嘔吐", "吐い"], fatigue: ["倦怠感", "だるさ"],
      jaundice: ["黄疸"], rash: ["皮疹", "発疹"], joint_pain: ["関節痛"],
      numbness: ["しびれ", "痺れ"]
    },
    history: {
      cirrhosis: ["肝硬変"], ckd: ["慢性腎臓病", "CKD"], dialysis: ["透析"],
      dm: ["糖尿病"], htn: ["高血圧"], hf: ["心不全"], cad: ["狭心症", "心筋梗塞の既往"],
      af: ["心房細動", "AF"], stroke: ["脳梗塞", "脳出血", "脳卒中"],
      epilepsy: ["てんかん"], copd: ["COPD", "肺気腫"],
      malignancy: ["悪性腫瘍", "がんの既往", "癌の既往"],
      autoimmune: ["膠原病"], transplant: ["移植後"]
    },
    meds: {
      warfarin: ["ワルファリン", "ワーファリン"], doac: ["DOAC", "エリキュース", "リクシアナ", "イグザレルト"],
      heparin: ["ヘパリン"], antiplatelet: ["抗血小板", "バイアスピリン", "クロピドグレル"],
      steroid: ["ステロイド", "プレドニン"], chemo: ["化学療法", "抗がん剤"],
      immunosuppressant: ["免疫抑制"], diuretic_loop: ["ループ利尿薬", "フロセミド", "ラシックス"],
      diuretic_thiazide: ["サイアザイド"], statin: ["スタチン"], ppi: ["PPI"],
      nsaid: ["NSAIDs", "ロキソニン", "エヌセイド"], acei_arb: ["ARB", "ACE阻害薬"],
      insulin: ["インスリン"], su: ["SU薬"], metformin: ["メトホルミン"],
      antibiotics: ["抗菌薬", "抗生剤", "抗生物質"]
    }
  };

  /* ================= 正規化 ================= */

  function normalize(s) {
    return String(s || "")
      .replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/　/g, " ")
      .replace(/[、。,]/g, " ")
      .replace(/(\d)\s+(\d{3})(?!\d)/g, "$1$2")   // 「18 000」→「18000」
      .replace(/(\d),(\d{3})/g, "$1$2");          // 「18,000」→「18000」
  }

  var isAscii = function (t) { return /^[A-Za-z0-9%\-+.]+$/.test(t); };

  /** 照合する語を長い順に並べる。短い語（Na・K）が長い語（尿中Na）を食わないようにするため。 */
  function termList() {
    var out = [];
    Object.keys(LAB).forEach(function (k) {
      LAB[k].forEach(function (t) { out.push({ kind: "lab", key: k, term: t }); });
    });
    Object.keys(VITAL).forEach(function (k) {
      VITAL[k].forEach(function (t) { out.push({ kind: "vital", key: k, term: t }); });
    });
    out.sort(function (a, b) { return b.term.length - a.term.length; });
    return out;
  }
  var TERMS = termList();

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  /* ================= 解析 ================= */

  /** 語の直後から数値を拾う。間に「は」「が」「：」や単位が挟まっても追う。 */
  function numberAfter(text, from) {
    var tail = text.slice(from, from + 20);
    var m = /^[^0-9\-]{0,8}(-?\d+(?:\.\d+)?)\s*(万)?/.exec(tail);
    if (!m) return null;
    var v = parseFloat(m[1]);
    if (!isFinite(v)) return null;
    if (m[2]) v = v * 10000;
    return { value: v, end: from + m.index + m[0].length, raw: m[0].trim() };
  }

  /** 血小板は ×10⁴/µL（万）で持つ。実数で言われたときは読み替え、そのことを表示する。 */
  function adjust(key, v) {
    if (key === "plt" && v >= 1000) return { value: Math.round(v / 10000 * 10) / 10, note: "×10⁴/µL へ読み替え" };
    if (key === "fio2" && v > 1.5) return { value: Math.round(v) / 100, note: "% を小数へ読み替え" };
    return { value: v, note: "" };
  }

  function parse(raw) {
    var text = normalize(raw);
    var taken = [];                        // 使用済みの文字範囲
    var hits = [], notes = [];
    var free = text;

    function overlaps(s, e) {
      return taken.some(function (r) { return s < r[1] && e > r[0]; });
    }

    /* --- 血圧は「90/50」の形を先に取る --- */
    var bp = /(?:血圧|BP)[^0-9]{0,6}(\d{2,3})\s*[\/／のと]\s*(\d{2,3})/.exec(text);
    if (bp) {
      taken.push([bp.index, bp.index + bp[0].length]);
      hits.push({ kind: "vital", key: "sbp", label: "収縮期血圧", value: +bp[1], unit: "mmHg", raw: bp[0] });
      hits.push({ kind: "vital", key: "dbp", label: "拡張期血圧", value: +bp[2], unit: "mmHg", raw: bp[0] });
    }

    /* --- 体温の「38度5分」 --- */
    var bt = /(?:体温|熱)[^0-9]{0,4}(\d{2})\s*度\s*(\d)?/.exec(text);
    if (bt) {
      taken.push([bt.index, bt.index + bt[0].length]);
      hits.push({ kind: "vital", key: "bt", label: "体温",
                  value: parseFloat(bt[1] + "." + (bt[2] || "0")), unit: "℃", raw: bt[0] });
    }

    /* --- 年齢・性別 --- */
    var age = /(\d{1,3})\s*(?:歳|才)/.exec(text);
    if (age) { taken.push([age.index, age.index + age[0].length]);
      hits.push({ kind: "age", key: "age", label: "年齢", value: +age[1], unit: "歳", raw: age[0] }); }
    var sex = /(男性|女性|男|女)/.exec(text);
    if (sex) taken.push([sex.index, sex.index + sex[0].length]);
    if (sex) hits.push({ kind: "sex", key: "sex", label: "性別",
                         value: /女/.test(sex[1]) ? "f" : "m",
                         display: /女/.test(sex[1]) ? "女性" : "男性", unit: "", raw: sex[0] });

    /* --- 検査項目・バイタル --- */
    TERMS.forEach(function (t) {
      var pat = isAscii(t.term)
        ? new RegExp("(^|[^A-Za-z0-9])(" + escRe(t.term) + ")(?![A-Za-z0-9])", "gi")
        : new RegExp("(" + escRe(t.term) + ")", "g");
      var m;
      while ((m = pat.exec(text)) !== null) {
        var hitStart = m.index + (isAscii(t.term) ? m[1].length : 0);
        var hitEnd = hitStart + t.term.length;
        if (overlaps(hitStart, hitEnd)) continue;
        var n = numberAfter(text, hitEnd);
        if (!n) continue;
        if (overlaps(hitEnd, n.end)) continue;
        taken.push([hitStart, n.end]);
        var a = t.kind === "lab" ? adjust(t.key, n.value) : { value: n.value, note: "" };
        var def = (t.kind === "lab" && typeof LabsCore !== "undefined")
          ? LabsCore.findAnalyte(t.key) : null;
        var vm2 = VITAL_META[t.key];
        hits.push({
          kind: t.kind, key: t.key,
          label: def ? def.label : (vm2 ? vm2[0] : t.term),
          value: a.value, unit: def ? (def.unit || "") : (vm2 ? vm2[1] : ""),
          note: a.note, raw: text.slice(hitStart, n.end).trim()
        });
        if (a.note) notes.push(t.term + "：" + a.note);
      }
    });

    /* --- 所見の言い回し --- */
    PHRASE.forEach(function (p) {
      var key = p[0], val = p[1];
      if (hits.some(function (h) { return h.key === key; })) return;
      for (var i = 0; i < p[2].length; i++) {
        var idx = text.indexOf(p[2][i]);
        if (idx < 0) continue;
        var def2 = (typeof LabsCore !== "undefined") ? LabsCore.findAnalyte(key) : null;
        taken.push([idx, idx + p[2][i].length]);
        hits.push({ kind: "finding", key: key, label: def2 ? def2.label : key,
                    value: val, display: val, unit: "", raw: p[2][i] });
        return;
      }
    });

    /* --- 主訴・既往・内服 --- */
    ["complaints", "history", "meds"].forEach(function (group) {
      Object.keys(CHIP[group]).forEach(function (k) {
        CHIP[group][k].forEach(function (w) {
          var at = text.indexOf(w);
          if (at < 0) return;
          if (hits.some(function (h) { return h.kind === group && h.key === k; })) return;
          taken.push([at, at + w.length]);
          hits.push({ kind: group, key: k, label: GROUP_LABEL[group], value: k, display: w, unit: "", raw: w });
        });
      });
    });

    /* --- 読み取れなかった部分 --- */
    taken.sort(function (a, b) { return a[0] - b[0]; });
    var leftover = "", pos = 0;
    taken.forEach(function (r) { leftover += text.slice(pos, r[0]); pos = Math.max(pos, r[1]); });
    leftover += text.slice(pos);
    leftover = leftover.replace(/\s+/g, " ").trim();

    return { hits: hits, notes: notes, leftover: leftover, text: free };
  }

  var GROUP_LABEL = { complaints: "主訴", history: "既往", meds: "内服" };

  /* ================= 反映 ================= */

  function apply(hits, state) {
    var n = 0;
    state.context = state.context || {};
    state.context.vitals = state.context.vitals || {};
    hits.forEach(function (h) {
      switch (h.kind) {
        case "lab": case "finding":
          state.values[h.key] = String(h.value); n++; break;
        case "vital":
          state.context.vitals[h.key] = String(h.value); n++; break;
        case "age": state.context.age = String(h.value); n++; break;
        case "sex": state.context.sex = h.value; n++; break;
        case "complaints": case "history": case "meds":
          var arr = state.context[h.kind] || (state.context[h.kind] = []);
          if (arr.indexOf(h.key) < 0) { arr.push(h.key); n++; }
          break;
      }
    });
    return n;
  }

  return {
    parse: parse, apply: apply, normalize: normalize,
    LAB: LAB, VITAL: VITAL, PHRASE: PHRASE, CHIP: CHIP, GROUP_LABEL: GROUP_LABEL
  };
})();
