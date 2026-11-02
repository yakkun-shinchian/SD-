/*! dx-cc.js — 主訴からの診断アプローチ
 *
 *  鑑別エンジン（dx-core.js）が「所見 → 疾患」の順に働くのに対し、
 *  こちらは臨床の実際の順序、すなわち「主訴 → まず除外すべき致死的疾患 →
 *  red flag の確認 → 体系的な鑑別の地図 → 次に聞くこと・診ること」で働く。
 *
 *  設計上の約束：
 *   - 出力は確率ではない。「該当した所見の数」と「点灯した red flag」を示すだけ。
 *   - red flag は点灯の有無にかかわらず全件を出す。確認すべき項目の一覧として
 *     機能することが目的で、未入力を「陰性」として隠してはならない。
 *   - 判定は患者背景の「主訴・症状」で選ばれたものだけを表示する。
 */
var DXCC = (function () {
  "use strict";
  var C = LabsCore;

  /* ---------- 条件の書き方 ---------- */

  function vit(ctx, k) { return C.num((ctx.vitals || {})[k]); }
  function med(ctx, k) { return C.has(ctx, "meds", k); }
  function hist(ctx, k) { return C.has(ctx, "history", k); }
  function cplt(ctx, k) { return C.has(ctx, "complaints", k); }

  /** 所見シグナル：文字列ならフラグ名、オブジェクトなら {f:フラグ} か {fn:関数} ＋ 表示文 t */
  function sigText(s) {
    if (typeof s === "string") return hxLabel(s);
    return s.t || hxLabel(s.f || "");
  }
  function hxLabel(flag) {
    if (typeof DXHx !== "undefined" && DXHx.LABEL[flag]) return DXHx.label(flag);
    return LAB_LABEL[flag] || flag;
  }
  function sigOn(s, F, V, D, ctx) {
    try {
      if (typeof s === "string") return !!F[s];
      if (s.fn) return !!s.fn(F, V, D, ctx);
      return !!F[s.f];
    } catch (e) { return false; }
  }

  /** 検査側フラグの日本語名（主訴カードに出す分だけ） */
  var LAB_LABEL = {
    fever: "発熱（体温 38℃以上）",
    anemia: "貧血",
    anemia_severe: "重度の貧血",
    plt_low: "血小板減少",
    plt_verylow: "重度の血小板減少",
    pancytopenia: "汎血球減少",
    neutropenia_severe: "重度の好中球減少",
    wbc_high: "白血球増加",
    wbc_veryhigh: "著明な白血球増加",
    wbc_low: "白血球減少",
    blasts: "末梢血に blast",
    atypical_lymph: "異型リンパ球",
    eosinophilia: "好酸球増加",
    crp_high: "CRP 上昇",
    crp_veryhigh: "CRP 著明上昇",
    pct_high: "プロカルシトニン上昇",
    lactate_high: "乳酸上昇",
    lactate_critical: "乳酸著明上昇",
    cr_high: "クレアチニン上昇",
    renal_impair: "腎機能低下",
    renal_severe: "重度の腎機能低下",
    buncr_high: "BUN/Cr 比の上昇",
    hypona: "低ナトリウム血症",
    hypona_severe: "重度の低ナトリウム血症",
    hyperna: "高ナトリウム血症",
    hyperk: "高カリウム血症",
    hyperk_severe: "重度の高カリウム血症",
    hypok: "低カリウム血症",
    hyperca: "高カルシウム血症",
    hypoglycemia: "低血糖",
    hyperglycemia_severe: "著明な高血糖",
    hyperglycemia_extreme: "極端な高血糖",
    ag_high: "アニオンギャップ開大",
    osmgap_high: "浸透圧ギャップ開大",
    transaminase_high: "トランスアミナーゼ上昇",
    transaminase_veryhigh: "トランスアミナーゼ著明上昇",
    cholestasis: "胆道系酵素優位の上昇",
    bil_high: "ビリルビン上昇",
    alb_low: "アルブミン低下",
    che_low: "コリンエステラーゼ低下",
    nh3_high: "アンモニア上昇",
    ld_high: "LD 上昇",
    ck_veryhigh: "CK 著明上昇",
    rhabdo_range: "横紋筋融解を疑う CK 値",
    troponin_high: "トロポニン上昇",
    bnp_high: "BNP／NT-proBNP 上昇",
    amy_veryhigh: "アミラーゼ著明上昇",
    lip_veryhigh: "リパーゼ著明上昇",
    ddimer_high: "D-ダイマー上昇",
    ddimer_veryhigh: "D-ダイマー著明上昇",
    ddimer_negative: "D-ダイマー陰性",
    fdp_veryhigh: "FDP 著明上昇",
    fib_low: "フィブリノゲン低下",
    pt_prolonged: "PT 延長",
    inr_high: "INR 上昇",
    aptt_prolonged: "APTT 延長",
    dic_jaam: "急性期DIC基準 4点以上",
    at3_low: "アンチトロンビン低下",
    resp_failure: "呼吸不全（P/F 比低下）",
    ards_range: "ARDS に相当する P/F 比",
    aado2_high: "A-aDO₂ 開大",
    metabolic_acidosis: "代謝性アシドーシス",
    metabolic_alkalosis: "代謝性アルカローシス",
    primary_resp_alkalosis: "一次性呼吸性アルカローシス",
    primary_resp_acidosis: "一次性呼吸性アシドーシス",
    respiratory_acidosis: "呼吸性アシドーシス",
    severe_acidemia: "重度のアシデミア",
    hyperchloremic: "高クロール性（AG 正常）アシドーシス",
    ana_pos: "抗核抗体陽性",
    ana_high: "抗核抗体 高力価",
    dsdna_pos: "抗dsDNA抗体陽性",
    complement_low: "補体低下",
    mpo_pos: "MPO-ANCA 陽性",
    pr3_pos: "PR3-ANCA 陽性",
    ccp_pos: "抗CCP抗体陽性",
    rf_pos: "リウマトイド因子陽性",
    ssa_pos: "抗SS-A抗体陽性",
    trab_pos: "TRAb 陽性",
    gq1b_pos: "抗GQ1b抗体陽性",
    gm1_pos: "抗GM1抗体陽性",
    gt1a_pos: "抗GT1a抗体陽性",
    sil2r_high: "可溶性IL-2レセプター上昇",
    ua_high: "尿酸上昇",
    apl_pos: "抗リン脂質抗体陽性",
    achr_pos: "抗AChR抗体陽性"
  };

  /* よく使う条件 */
  var S = {
    tachypnea: { fn: function (F, V, D, ctx) { var r = vit(ctx, "rr"); return r != null && r >= 22; }, t: "呼吸数 22/分 以上" },
    tachypnea30: { fn: function (F, V, D, ctx) { var r = vit(ctx, "rr"); return r != null && r >= 30; }, t: "呼吸数 30/分 以上" },
    hypotension: { fn: function (F, V, D, ctx) { var s = vit(ctx, "sbp"); return s != null && s <= 100; }, t: "収縮期血圧 100mmHg 以下" },
    shockBp: { fn: function (F, V, D, ctx) { var s = vit(ctx, "sbp"); return s != null && s < 90; }, t: "収縮期血圧 90mmHg 未満" },
    tachycardia: { fn: function (F, V, D, ctx) { var h = vit(ctx, "hr"); return h != null && h >= 100; }, t: "心拍数 100/分 以上" },
    bradycardia: { fn: function (F, V, D, ctx) { var h = vit(ctx, "hr"); return h != null && h <= 50; }, t: "心拍数 50/分 以下" },
    hypoxia: { fn: function (F, V, D, ctx) { var s = vit(ctx, "spo2"); return s != null && s <= 92; }, t: "SpO₂ 92% 以下" },
    hypoxiaSevere: { fn: function (F, V, D, ctx) { var s = vit(ctx, "spo2"); return s != null && s < 90; }, t: "SpO₂ 90% 未満" },
    highFever: { fn: function (F, V, D, ctx) { var t = vit(ctx, "bt"); return t != null && t >= 39; }, t: "体温 39℃ 以上" },
    hypothermia: { fn: function (F, V, D, ctx) { var t = vit(ctx, "bt"); return t != null && t <= 36; }, t: "体温 36℃ 以下（低体温も敗血症の警告）" },
    elderly: { fn: function (F, V, D, ctx) { var a = C.num(ctx.age); return a != null && a >= 75; }, t: "75歳以上" },
    anticoag: { fn: function (F, V, D, ctx) { return med(ctx, "warfarin") || med(ctx, "doac") || med(ctx, "heparin"); }, t: "抗凝固薬の使用" },
    antiplt: { fn: function (F, V, D, ctx) { return med(ctx, "antiplatelet"); }, t: "抗血小板薬の使用" },
    immunosupp: { fn: function (F, V, D, ctx) { return med(ctx, "steroid") || med(ctx, "immunosuppressant") || med(ctx, "chemo") || hist(ctx, "transplant"); }, t: "免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）" },
    cirrhosis: { fn: function (F, V, D, ctx) { return hist(ctx, "cirrhosis"); }, t: "肝硬変の既往" },
    ckd: { fn: function (F, V, D, ctx) { return hist(ctx, "ckd") || hist(ctx, "dialysis"); }, t: "慢性腎臓病・透析" },
    dm: { fn: function (F, V, D, ctx) { return hist(ctx, "dm"); }, t: "糖尿病の既往" },
    af: { fn: function (F, V, D, ctx) { return hist(ctx, "af"); }, t: "心房細動の既往" },
    hf: { fn: function (F, V, D, ctx) { return hist(ctx, "hf"); }, t: "心不全の既往" },
    malignancy: { fn: function (F, V, D, ctx) { return hist(ctx, "malignancy"); }, t: "悪性腫瘍の既往" },
    autoimmune: { fn: function (F, V, D, ctx) { return hist(ctx, "autoimmune"); }, t: "膠原病の既往" },
    copd: { fn: function (F, V, D, ctx) { return hist(ctx, "copd"); }, t: "COPD の既往" },
    nsaid: { fn: function (F, V, D, ctx) { return med(ctx, "nsaid"); }, t: "NSAIDs の使用" },
    newDrug: "hx_after_drug"
  };

  /* ---------- 主訴別アプローチ ---------- */

  var CC = [

    /* ============== 発熱 ============== */
    {
      key: "fever", label: "発熱", icon: "🌡️",
      frame: "発熱そのものは診断ではない。「どこの」「何による」炎症かを、感染・非感染（膠原病・薬剤・腫瘍・内分泌）の両輪で探す。最初の仕事は、時間単位で命に関わる四つを外すこと。",
      killers: [
        {
          name: "敗血症・敗血症性ショック",
          why: "感染に対する制御不能な宿主反応が血管内皮を傷害し、組織低灌流に至る。抗菌薬投与の遅れが死亡率に直結する。",
          pointers: ["hx_consciousness_impaired", S.tachypnea, S.hypotension, "hx_cold_clammy", "hx_crt_delay",
                     "lactate_high", "pct_high", S.hypothermia],
          tests: ["qSOFA（意識・呼吸数22以上・収縮期血圧100以下）と SOFA の算出",
                  "血液培養2セットを採取したうえで、認識から1時間以内の経験的抗菌薬",
                  "乳酸値（初期値と2〜4時間後の再検）", "感染巣の同定（尿・胸部画像・腹部エコー／CT・皮膚軟部組織）"],
          refs: ["SEPSIS3", "SOFA"]
        },
        {
          name: "細菌性髄膜炎",
          why: "髄液腔の化膿性炎症。発症から数時間で脳浮腫・脳血管炎に進む。発熱・意識障害・項部硬直の三徴は全てそろう例が半数に満たない。",
          pointers: ["hx_neck_stiff", "hx_consciousness_impaired", "hx_petechiae", S.highFever,
                     { f: "hx_sudden_onset", t: "急激な発症" }],
          tests: ["頭部CT（脳圧亢進の除外）に続く腰椎穿刺 — ただし抗菌薬を待たせない",
                  "血液培養2セット", "経験的抗菌薬（＋デキサメタゾンの併用を検討）"],
          refs: ["MENINGITIS"]
        },
        {
          name: "感染性心内膜炎",
          why: "弁上の感染巣から菌が持続的に血流へ出続け、塞栓と免疫学的機序で全身の臓器を侵す。不明熱のまま見逃されやすい。",
          pointers: ["hx_murmur_new", "hx_murmur_systolic", "hx_petechiae", "hx_purpura_palpable",
                     "hx_focal_deficit", "crp_high"],
          tests: ["血液培養を時間をずらして3セット", "経胸壁心エコー（陰性でも疑いが強ければ経食道）",
                  "修正 Duke 基準での整理", "塞栓巣の検索（頭部MRI・脾・腎）"],
          refs: ["DUKE"]
        },
        {
          name: "発熱性好中球減少症",
          why: "好中球が枯れた状態では炎症所見そのものが立ち上がらない。局所症状が乏しいまま急速にショックへ進む。",
          pointers: ["neutropenia_severe", S.immunosupp, { fn: function (F, V, D, ctx) { return med(ctx, "chemo"); }, t: "化学療法中" }],
          tests: ["好中球実数（ANC）の確認", "血液培養2セット（＋カテーテル各ルーメン）",
                  "広域抗菌薬を直ちに（培養結果を待たない）"],
          refs: []
        },
        {
          name: "甲状腺クリーゼ",
          why: "甲状腺ホルモン作用の過剰が代謝・循環・中枢を同時に破綻させる。発熱と不整脈と意識障害が同居したら思い出す。",
          pointers: ["hx_goiter", "hx_tremor_fine", "hx_consciousness_impaired", S.tachycardia, S.highFever, "trab_pos"],
          tests: ["FT4・FT3・TSH", "Burch-Wartofsky スコアと日本甲状腺学会の診断基準での照合", "心電図（心房細動・高心拍出性心不全）"],
          refs: ["BURCH", "JTA_STORM"]
        }
      ],
      redflags: [
        S.hypotension, S.tachypnea, "hx_consciousness_impaired", S.hypoxia,
        "hx_neck_stiff", "hx_petechiae", "lactate_high", "neutropenia_severe",
        S.immunosupp, S.hypothermia, "plt_low", "dic_jaam"
      ],
      groups: [
        {
          cat: "感染（臓器別に当たりをつける）",
          dds: [
            { name: "肺炎", sup: ["hx_sputum_purulent", "hx_coarse_crackles", S.tachypnea, S.hypoxia, "crp_high", "wbc_high"],
              note: "重症度は A-DROP／CURB-65 で。呼吸数は最も早く動くバイタル。" },
            { name: "尿路感染・腎盂腎炎", sup: ["hx_tender_back", S.highFever, "crp_high", "wbc_high"],
              note: "側腹部の叩打痛と尿所見。男性・再発例は閉塞起点を探す。" },
            { name: "胆道感染（胆嚢炎・胆管炎）", sup: ["hx_tender_ruq", "hx_murphy", "cholestasis", "bil_high", "hx_jaundice_skin"],
              note: "発熱＋右上腹部痛＋黄疸は Charcot 三徴。胆管炎ならドレナージが治療。" },
            { name: "皮膚軟部組織感染・壊死性筋膜炎", sup: ["hx_rash_diffuse", S.hypotension, "crp_veryhigh", "ck_veryhigh", S.dm],
              note: "痛みが所見に不釣り合いに強い、皮膚所見を越えて進む、ガス像 — 外科的デブリドマンが治療。" },
            { name: "カテーテル関連血流感染", sup: [S.immunosupp, "crp_high", "wbc_high"],
              note: "ほかに巣がないならデバイスを疑う。抜去の判断を遅らせない。" }
          ]
        },
        {
          cat: "非感染性の炎症",
          dds: [
            { name: "薬剤熱・薬剤性過敏症（DIHS/DRESS）", sup: [S.newDrug, "hx_rash_diffuse", "eosinophilia", "transaminase_high", "hx_lymph_general"],
              note: "比較的元気な高熱、好酸球増加、肝障害。原因薬の中止が診断的。" },
            { name: "膠原病（成人Still病・血管炎・SLE）", sup: [S.autoimmune, "hx_poly_sym_arthritis", "hx_rash_diffuse", "ana_pos", "mpo_pos", "pr3_pos", "crp_veryhigh"],
              note: "感染を十分に否定してから。皮疹・関節・腎・肺を一度に見る。" },
            { name: "悪性腫瘍（リンパ腫・白血病）", sup: [S.malignancy, "hx_lymph_general", "hx_weight_loss", "ld_high", "sil2r_high", "blasts", "pancytopenia"],
              note: "B症状（発熱・体重減少・寝汗）とLD・sIL-2R。" },
            { name: "血球貪食症候群（HLH）", sup: ["fever", "pancytopenia", "ld_high", "fib_low", "hx_lymph_general"],
              note: "発熱＋血球減少＋フェリチン著明上昇。HScore で整理する。" },
            { name: "静脈血栓症（発熱を伴う）", sup: ["hx_edema_unilat", "ddimer_high", S.malignancy],
              note: "発熱の原因として忘れられやすい。片側の下腿腫脹を見る。" }
          ]
        }
      ],
      ask: ["発熱の立ち上がり方（突然の悪寒戦慄＝菌血症を示唆）と日内変動",
            "最近2週間の新しい薬剤、ワクチン、抗菌薬の使用",
            "渡航・動物接触・生食・結核曝露・性交渉歴",
            "医療デバイス（カテーテル・ペースメーカー・人工弁・シャント）",
            "免疫抑制の程度（ステロイド量・生物学的製剤・化学療法の最終日）"],
      exam: ["呼吸数を実際に1分測る（qSOFA で最初に動く）",
             "皮膚を全部見る（点状出血・palpable purpura・末梢の塞栓・デバイス刺入部）",
             "心音（新規雑音）・項部硬直・CVA 叩打痛・前立腺・口腔内",
             "全身のリンパ節と脾の触診"],
      refs: ["SEPSIS3", "SOFA", "CURB65", "ADROP"]
    },

    /* ============== 呼吸困難 ============== */
    {
      key: "dyspnea", label: "呼吸困難", icon: "🫁",
      frame: "呼吸困難は「気道・肺・心・血液・代謝・中枢」のどこが破れても出る。酸素化（SpO₂・P/F）と換気（PaCO₂）を分けて考えると、原因の層がはっきりする。",
      killers: [
        {
          name: "急性肺血栓塞栓症",
          why: "肺血管床の急な閉塞で右心が後負荷に耐えられなくなる。呼吸困難と頻呼吸だけで、聴診も胸部X線も正常なことがある。",
          pointers: [S.tachypnea, S.tachycardia, "hx_sudden_onset", "hx_edema_unilat", "ddimer_veryhigh",
                     "primary_resp_alkalosis", "aado2_high", "hx_jvd", S.malignancy],
          tests: ["Wells スコアで事前確率を立ててから D-ダイマー（高確率なら D-ダイマーを飛ばす）",
                  "造影CT肺動脈相", "心エコー（右心負荷）", "下肢静脈エコー", "簡易PESI で重症度"],
          refs: ["WELLS_PE", "SPESI"]
        },
        {
          name: "急性心不全・肺水腫",
          why: "左房圧の急上昇が肺毛細血管から水を押し出す。起坐呼吸は特異度の高い所見で、問診だけで大きく事前確率が動く。",
          pointers: ["hx_orthopnea", "hx_jvd", "hx_fine_crackles", "hx_s3", "hx_edema_bilat",
                     "bnp_high", "hx_weight_gain", S.hf],
          tests: ["BNP／NT-proBNP", "胸部X線（肺うっ血・心拡大）", "心エコー（左室機能・弁・下大静脈）",
                  "心電図と心筋トロポニン（虚血が引き金でないか）"],
          refs: ["HF_JCS", "PE_HF"]
        },
        {
          name: "緊張性気胸",
          why: "胸腔内圧の上昇が静脈還流を止める。画像を待つ前に、片側呼吸音減弱＋頸静脈怒張＋血圧低下で穿刺を決める所見診断。",
          pointers: ["hx_breath_down_unilat", "hx_jvd", S.shockBp, "hx_sudden_onset", S.copd],
          tests: ["身体所見で疑えばその場で胸腔穿刺・ドレナージ（画像を待たない）",
                  "ベッドサイド肺エコー（lung sliding の消失）"],
          refs: []
        },
        {
          name: "上気道閉塞・アナフィラキシー",
          why: "気道そのものが細くなる。進行すれば分単位で換気できなくなる。アドレナリン筋注の遅れが致死的。",
          pointers: ["hx_wheeze", "hx_rash_diffuse", S.newDrug, S.hypotension, S.tachycardia],
          tests: ["アドレナリン 0.3〜0.5mg を大腿前外側に筋注（静注ではない）",
                  "気道確保の準備を同時並行で", "WAO の診断基準で整理"],
          refs: ["ANAPHYLAXIS"]
        },
        {
          name: "ARDS",
          why: "肺の炎症で血管透過性が上がり、両肺にびまん性に水と細胞が入る。心原性でないことを確認しながら P/F で定義する。",
          pointers: ["ards_range", "resp_failure", "hx_fine_crackles", "hx_resp_effort", S.hypoxiaSevere],
          tests: ["P/F 比と PEEP 条件の記録", "胸部CT（両側びまん性浸潤影）",
                  "心原性肺水腫の除外（心エコー・BNP）", "ベルリン定義で重症度を分類"],
          refs: ["BERLIN"]
        }
      ],
      redflags: [
        S.hypoxiaSevere, S.tachypnea30, "hx_resp_effort", "hx_agonal", "hx_consciousness_impaired",
        S.hypotension, "hx_breath_down_unilat", "respiratory_acidosis", "severe_acidemia",
        "lactate_high", "hx_cyanosis", "hx_cold_clammy"
      ],
      groups: [
        {
          cat: "心・血管",
          dds: [
            { name: "急性心不全", sup: ["hx_orthopnea", "hx_jvd", "hx_fine_crackles", "hx_s3", "hx_edema_bilat", "bnp_high"],
              note: "起坐呼吸・III音・頸静脈怒張がそろえば、心不全の事前確率は大きく上がる。" },
            { name: "肺血栓塞栓症", sup: ["hx_sudden_onset", S.tachypnea, "ddimer_veryhigh", "hx_edema_unilat", "primary_resp_alkalosis"],
              note: "低酸素と頻呼吸に見合う胸部所見がない — それが所見。" },
            { name: "心タンポナーデ", sup: ["hx_jvd", "hx_heart_muffled", S.hypotension, S.tachycardia, "hx_pericardial_rub"],
              note: "Beck の三徴（血圧低下・頸静脈怒張・心音減弱）。心エコーで即断。" },
            { name: "急性冠症候群（呼吸困難が主訴）", sup: ["hx_cold_clammy", "troponin_high", S.dm, S.elderly],
              note: "高齢者・糖尿病では胸痛を訴えず呼吸困難だけで来る。" }
          ]
        },
        {
          cat: "肺・気道",
          dds: [
            { name: "肺炎", sup: ["hx_coarse_crackles", "hx_sputum_purulent", "fever", "crp_high", S.hypoxia],
              note: "A-DROP／CURB-65 で入院適応を決める。" },
            { name: "COPD・喘息の急性増悪", sup: ["hx_wheeze", "hx_resp_effort", S.copd, "respiratory_acidosis", "primary_resp_acidosis"],
              note: "CO₂ 貯留と意識レベル。慢性の代償があるかを HCO₃⁻ で見る。" },
            { name: "気胸", sup: ["hx_breath_down_unilat", "hx_sudden_onset"],
              note: "若年やせ型の突然発症、COPD の二次性。" },
            { name: "胸水", sup: ["hx_breath_down_unilat", "hx_breath_down_bilat", "alb_low", S.hf, S.cirrhosis],
              note: "穿刺したら Light の基準で滲出性／漏出性を分ける。" },
            { name: "間質性肺疾患", sup: ["hx_fine_crackles", "hx_onset_chronic", "aado2_high", S.autoimmune],
              note: "乾性の捻髪音とばち指。膠原病・薬剤・職業歴を必ず聞く。" }
          ]
        },
        {
          cat: "肺以外の原因（見落としやすい層）",
          dds: [
            { name: "代謝性アシドーシスの代償（Kussmaul 呼吸）", sup: ["hx_kussmaul", "metabolic_acidosis", "ag_high", "hyperglycemia_severe", "lactate_high"],
              note: "息苦しさの原因は肺ではない。アシドーシスを治すのが呼吸の治療。" },
            { name: "重度貧血", sup: ["anemia_severe", "anemia", S.tachycardia],
              note: "酸素飽和度は正常でも酸素運搬能が足りない。" },
            { name: "過換気・不安", sup: ["primary_resp_alkalosis", "hx_recurrent"],
              note: "最後に残す診断。器質的原因を外してから。" },
            { name: "神経筋疾患（横隔膜の力不足）", sup: ["hx_dtr_loss", "achr_pos", "hx_onset_subacute"],
              note: "CO₂ が上がるのに呼吸数が増えない。%肺活量と吸気圧を測る。" }
          ]
        }
      ],
      ask: ["いつから、どのくらいの速さで（分・時間・日・週）",
            "臥位で悪化するか（起坐呼吸）、夜間に起きるか（夜間発作性呼吸困難）",
            "どのくらいの労作で出るか（平地・階段・会話）— 変化の幅が重症度",
            "体重の変化と内服（利尿薬の自己調整、NSAIDs、新規薬剤）",
            "胸痛・喀血・片側の下腿腫脹（肺塞栓の手がかり）"],
      exam: ["呼吸数と呼吸様式（補助筋・陥没・会話できる文の長さ）",
             "頸静脈・III音・両側下肺の捻髪音（心不全の三点セット）",
             "左右の呼吸音差と打診（気胸・胸水）",
             "下腿の左右差（片側腫脹は肺塞栓へ）"],
      refs: ["HF_JCS", "PE_HF", "WELLS_PE", "BERLIN", "CURB65", "ADROP", "LIGHT"]
    },

    /* ============== 胸痛 ============== */
    {
      key: "chest_pain", label: "胸痛", icon: "💔",
      frame: "胸痛では「頻度の高い診断」より「外し損ねたら死ぬ診断」を先に並べる。心・大血管・肺・食道の四つの管を順に潰していく。",
      killers: [
        {
          name: "急性冠症候群",
          why: "冠動脈のプラーク破綻と血栓で心筋が死に始める。再灌流までの時間がそのまま心筋の量になる。",
          pointers: ["hx_exertional", "hx_cold_clammy", "troponin_high", S.dm, S.elderly, "hx_onset_acute", "hx_tender_epigastric"],
          tests: ["来院10分以内の12誘導心電図（陰性なら時間をおいて反復）",
                  "高感度トロポニンの 0/1 時間アルゴリズム", "ST上昇があれば再灌流療法の判断を同時に"],
          refs: ["ACS_JCS"]
        },
        {
          name: "急性大動脈解離",
          why: "内膜が裂け、偽腔が分枝をつぎつぎ塞ぐ。痛みの最強点が発症直後にあり、血圧の左右差や新規の拡張期雑音が手がかりになる。",
          pointers: ["hx_pain_max_at_onset", "hx_sudden_onset", "hx_bp_lr_diff", "hx_murmur_diastolic",
                     "hx_tender_back", "hx_focal_deficit", "ddimer_veryhigh"],
          tests: ["血圧の左右差と上下肢差の実測", "造影CT（上行〜腸骨まで）",
                  "D-ダイマー陰性は否定の補助になるが、確定診断は画像", "降圧・心拍数管理を並行して開始"],
          refs: ["AORTA_ACC"]
        },
        {
          name: "肺血栓塞栓症",
          why: "胸痛と呼吸困難が同居し、聴診は正常。頻呼吸と低酸素だけが訴える。",
          pointers: ["hx_sudden_onset", S.tachypnea, S.hypoxia, "ddimer_veryhigh", "hx_edema_unilat", "primary_resp_alkalosis"],
          tests: ["Wells スコア → D-ダイマー or 造影CT", "心エコー（右心負荷）", "下肢静脈エコー"],
          refs: ["WELLS_PE"]
        },
        {
          name: "緊張性気胸・食道破裂",
          why: "どちらも胸腔内に圧や消化液が漏れ出す病態。気胸は循環を止め、食道破裂は縦隔を融かす。",
          pointers: ["hx_breath_down_unilat", "hx_jvd", S.shockBp, { f: "hx_progressive", t: "痛みが進行している" },
                     { fn: function (F, V, D, ctx) { return cplt(ctx, "vomiting"); }, t: "激しい嘔吐のあとの胸痛（Boerhaave）" }],
          tests: ["気胸を疑えば画像前に胸腔穿刺", "嘔吐後の胸痛なら造影CT／食道造影で縦隔気腫を探す"],
          refs: []
        }
      ],
      redflags: [
        "hx_pain_max_at_onset", "hx_bp_lr_diff", S.hypotension, "hx_cold_clammy",
        S.hypoxia, "hx_consciousness_impaired", "troponin_high", "hx_murmur_new",
        "hx_breath_down_unilat", "hx_jvd", S.tachypnea, "ddimer_veryhigh"
      ],
      groups: [
        {
          cat: "心・大血管",
          dds: [
            { name: "急性冠症候群", sup: ["hx_exertional", "hx_cold_clammy", "troponin_high", S.dm],
              note: "労作で出て安静で消える、冷汗を伴う — 性状より「状況」が効く。" },
            { name: "大動脈解離", sup: ["hx_pain_max_at_onset", "hx_bp_lr_diff", "hx_murmur_diastolic", "hx_tender_back"],
              note: "痛みが移動する、裂けるような — かつ最強点が最初。" },
            { name: "急性心膜炎", sup: ["hx_pericardial_rub", "hx_postural", "crp_high", "troponin_high"],
              note: "坐位前屈で軽くなる、吸気で増す。心膜摩擦音を探す。" },
            { name: "心タンポナーデ", sup: ["hx_jvd", "hx_heart_muffled", S.hypotension],
              note: "心膜炎・解離・外傷・腫瘍の合併症として。" }
          ]
        },
        {
          cat: "肺・胸膜",
          dds: [
            { name: "肺血栓塞栓症", sup: ["hx_sudden_onset", S.tachypnea, "ddimer_veryhigh", "hx_edema_unilat"], note: "" },
            { name: "気胸", sup: ["hx_breath_down_unilat", "hx_sudden_onset"], note: "" },
            { name: "肺炎・胸膜炎", sup: ["fever", "hx_coarse_crackles", "crp_high", "hx_sputum_purulent"],
              note: "呼吸で増す痛み＋発熱。" }
          ]
        },
        {
          cat: "消化器・胸壁",
          dds: [
            { name: "逆流性食道炎・食道痙攣", sup: ["hx_after_meal", "hx_recurrent", "hx_postural"],
              note: "ACS を外した後の診断。PPI の反応は診断根拠として弱い。" },
            { name: "胆道・膵疾患からの放散", sup: ["hx_tender_ruq", "hx_tender_epigastric", "hx_murphy", "amy_veryhigh", "cholestasis"], note: "" },
            { name: "肋間筋・胸肋関節の痛み", sup: ["hx_post_trauma", { f: "hx_recurrent", t: "反復する体位依存性の痛み" }],
              note: "圧痛点が再現できるか。ただし圧痛があっても ACS は否定できない。" },
            { name: "帯状疱疹", sup: ["hx_rash_diffuse", "hx_sens_dermatome"],
              note: "皮疹の前に痛みが出る。デルマトームに沿うかを見る。" }
          ]
        }
      ],
      ask: ["発症の瞬間を特定できるか（できる＝血管性を疑う）",
            "痛みの最強点が最初か、だんだん強くなったか",
            "労作との関係、安静や硝酸薬での変化",
            "移動するか（前胸部→背部＝解離）",
            "嘔吐・飲酒のあとか（食道破裂）、外傷・長時間の不動（肺塞栓）"],
      exam: ["両腕の血圧を実測して左右差を見る",
             "心音（新規の拡張期雑音・摩擦音・心音減弱）と頸静脈",
             "左右の呼吸音差、皮下気腫",
             "胸壁の圧痛点と皮疹（デルマトーム）"],
      refs: ["ACS_JCS", "AORTA_ACC", "WELLS_PE"]
    },

    /* ============== 腹痛 ============== */
    {
      key: "abd_pain", label: "腹痛", icon: "🫄",
      frame: "腹痛は「手術が必要か」「血管の事故か」を先に決め、その後で部位別の鑑別に降りる。腹膜刺激徴候と、所見に不釣り合いな激痛は、どちらも外科を呼ぶ合図。",
      killers: [
        {
          name: "消化管穿孔・汎発性腹膜炎",
          why: "腸内容が腹腔に漏れ、細菌と消化酵素が腹膜を侵す。時間とともに敗血症性ショックへ移る。",
          pointers: ["hx_peritoneal", "hx_tender_diffuse", "hx_sudden_onset", "hx_bowel_absent",
                     S.hypotension, "crp_high", "wbc_high", S.nsaid],
          tests: ["立位腹部X線／腹部CT（free air）", "外科コンサルトを画像と同時並行で",
                  "輸液・抗菌薬・NPO"],
          refs: []
        },
        {
          name: "上腸間膜動脈閉塞・腸管虚血",
          why: "腸が死んでいく過程。初期は所見が乏しく痛みだけが激しい（pain out of proportion）。乳酸が上がる頃には腸はすでに壊れている。",
          pointers: ["hx_sudden_onset", "hx_pain_max_at_onset", S.af, "lactate_high", "ag_high",
                     "metabolic_acidosis", "hx_bowel_absent", S.elderly],
          tests: ["造影CT（動脈相・門脈相）を急ぐ", "乳酸値（上昇は晩期の所見であり、正常でも否定しない）",
                  "心房細動・心内血栓の確認", "外科・IVR に早期連絡"],
          refs: []
        },
        {
          name: "腹部大動脈瘤の破裂",
          why: "破裂すれば分単位で失血する。拍動性腫瘤・腹背部痛・低血圧の三つで即断。",
          pointers: ["hx_pulsatile_mass", "hx_tender_back", S.shockBp, S.hypotension, "hx_sudden_onset", S.elderly, "anemia"],
          tests: ["ベッドサイドエコーで大動脈径", "造影CT（安定していれば）", "直ちに血管外科と輸血の手配"],
          refs: ["AORTA_ACC"]
        },
        {
          name: "急性胆管炎",
          why: "閉塞した胆道内で胆汁が感染し、圧で菌が血中へ押し出される。ドレナージなしに抗菌薬だけでは止まらない。",
          pointers: ["hx_tender_ruq", "hx_jaundice_skin", S.highFever, "cholestasis", "bil_high",
                     S.hypotension, "hx_consciousness_impaired", "plt_low"],
          tests: ["Tokyo Guidelines 2018 の診断・重症度基準で照合",
                  "腹部エコー／MRCP／CT", "血液培養", "重症なら緊急胆道ドレナージ"],
          refs: ["TG18"]
        },
        {
          name: "重症急性膵炎",
          why: "活性化した膵酵素が自己消化を起こし、全身の血管透過性が破れる。初期48時間の輸液管理が予後を決める。",
          pointers: ["hx_tender_epigastric", "hx_tender_back", "amy_veryhigh", "lip_veryhigh",
                     "hypoca", S.tachypnea, "lactate_high"],
          tests: ["リパーゼ（アミラーゼより特異的）", "造影CT（発症48〜72時間後が評価に適する）",
                  "厚生労働省 重症度判定基準（予後因子＋CT grade）", "胆石性かアルコール性かで治療方針が分かれる"],
          refs: ["JSS_AP"]
        }
      ],
      redflags: [
        "hx_peritoneal", "hx_pain_max_at_onset", S.hypotension, "hx_pulsatile_mass",
        "hx_bowel_metallic", "hx_bowel_absent", "lactate_high", "hx_consciousness_impaired",
        S.elderly, S.immunosupp, "hx_stool_bloody", "hx_stool_melena", "anemia_severe"
      ],
      groups: [
        {
          cat: "右上腹部・心窩部",
          dds: [
            { name: "胆石症・胆嚢炎", sup: ["hx_tender_ruq", "hx_murphy", "hx_after_meal", "cholestasis", "fever"],
              note: "Tokyo Guidelines の基準で局所・全身・画像を組む。" },
            { name: "胆管炎", sup: ["hx_tender_ruq", "hx_jaundice_skin", "fever", "bil_high", "cholestasis"], note: "Charcot 三徴＋ショック・意識障害で Reynolds 五徴。" },
            { name: "急性膵炎", sup: ["hx_tender_epigastric", "hx_tender_back", "amy_veryhigh", "lip_veryhigh"], note: "" },
            { name: "胃・十二指腸潰瘍", sup: ["hx_tender_epigastric", S.nsaid, "hx_stool_melena", "anemia", "buncr_high"], note: "穿孔すれば腹膜刺激徴候に変わる。" },
            { name: "急性冠症候群（心窩部痛として）", sup: ["hx_tender_epigastric", "hx_cold_clammy", "troponin_high", S.dm],
              note: "下壁梗塞は心窩部痛と嘔吐で来る。心電図を一度は取る。" }
          ]
        },
        {
          cat: "下腹部",
          dds: [
            { name: "急性虫垂炎", sup: ["hx_tender_rlq", "hx_tender_periumbilical", "fever", "wbc_high", "crp_high"],
              note: "臍周囲から右下腹部への移動が典型。Alvarado スコアで整理。" },
            { name: "大腸炎・感染性腸炎", sup: ["hx_stool_watery", "hx_stool_bloody", "fever", "hx_tender_diffuse", "crp_high"], note: "" },
            { name: "虚血性大腸炎", sup: ["hx_tender_llq", "hx_stool_bloody", "hx_sudden_onset", S.elderly], note: "左側結腸の突然の痛み＋血便。" },
            { name: "尿路結石", sup: ["hx_tender_back", "hx_recurrent", { fn: function (F, V, D, ctx) { return cplt(ctx, "vomiting"); }, t: "嘔吐を伴う" }],
              note: "側腹部から鼠径への放散、体位で楽にならない痛み。" },
            { name: "婦人科疾患（卵巣捻転・骨盤内感染・妊娠）", sup: [{ fn: function (F, V, D, ctx) { return ctx.sex === "f"; }, t: "女性" }, "hx_sudden_onset", "fever"],
              note: "妊娠反応は腹痛の女性全員に。子宮外妊娠は鑑別の最上段。" }
          ]
        },
        {
          cat: "びまん性・その他",
          dds: [
            { name: "腸閉塞", sup: ["hx_bowel_metallic", "hx_abd_distension", "hx_tender_diffuse", { fn: function (F, V, D, ctx) { return cplt(ctx, "vomiting"); }, t: "嘔吐" }],
              note: "手術歴・嵌入・腫瘍。絞扼の有無が緊急性を決める。" },
            { name: "腸管虚血", sup: ["hx_pain_max_at_onset", S.af, "lactate_high", "metabolic_acidosis", "ag_high"], note: "" },
            { name: "糖尿病性ケトアシドーシス", sup: ["hyperglycemia_severe", "ag_high", "metabolic_acidosis", "hx_kussmaul", S.dm],
              note: "腹痛で来る DKA がある。腹部を手術する前に血糖とガスを見る。" },
            { name: "特発性細菌性腹膜炎", sup: [S.cirrhosis, "hx_ascites", "fever", "hx_tender_diffuse", "alb_low"],
              note: "肝硬変＋腹水＋発熱なら腹水穿刺。好中球250/µL以上で診断。" },
            { name: "副腎不全・高カルシウム血症など代謝性", sup: ["hyperca", "hypona", "hyperk", "hx_hyperpigment"],
              note: "腹痛・嘔吐・低血圧の三つが説明できないときに思い出す。" }
          ]
        }
      ],
      ask: ["痛みの始まり方と最強点の時期、場所の移動",
            "食事・排便・排尿との関係、最終排便と排ガス",
            "手術歴（癒着性腸閉塞）と腹部手術・内視鏡の既往",
            "NSAIDs・ステロイド・抗凝固薬",
            "女性なら最終月経と妊娠の可能性"],
      exam: ["腹膜刺激徴候（反跳痛・筋性防御）を最初に確認する",
             "腸蠕動音（消失か金属音か）と腹部膨満",
             "鼠径・臍の膨隆（嵌入ヘルニア）と拍動性腫瘤",
             "直腸診と、女性では骨盤内の評価"],
      refs: ["TG18", "ALVARADO", "JSS_AP", "AORTA_ACC"]
    },

    /* ============== 意識障害 ============== */
    {
      key: "consciousness", label: "意識障害", icon: "🧠",
      frame: "意識障害は「すぐ治せるもの」から順に潰す。低血糖・低酸素・ショック・オピオイドは分単位で戻せる。そのうえで、びまん性（代謝・中毒・感染）か局所（脳の構造)かを分ける。",
      killers: [
        {
          name: "低血糖",
          why: "脳はブドウ糖しか使えない。放置すれば不可逆の神経障害になる。最初に測り、迷えば投与する。",
          pointers: ["hypoglycemia", "hypoglycemia_severe", "hx_cold_clammy", { fn: function (F, V, D, ctx) { return med(ctx, "insulin") || med(ctx, "su"); }, t: "インスリン・SU薬の使用" }],
          tests: ["血糖を最初に測る（指尖で足りる）", "50%ブドウ糖の投与とその後の再検",
                  "SU薬なら再発するので入院で経過を見る"],
          refs: []
        },
        {
          name: "脳血管障害（出血・梗塞・SAH）",
          why: "脳の構造が壊れている。時間が組織を決めるので、画像までの時間を削る。",
          pointers: ["hx_sudden_onset", "hx_focal_deficit", "hx_pupil_aniso", "hx_dtr_hyper",
                     S.af, S.anticoag, { fn: function (F, V, D, ctx) { return cplt(ctx, "headache"); }, t: "頭痛を伴う" }],
          tests: ["頭部CT（出血の除外）、必要に応じてCTA／MRI", "血糖・電解質を同時に",
                  "血圧管理と抗凝固薬の確認", "NIHSS で神経学的重症度を記録"],
          refs: ["STROKE_JP", "NIHSS"]
        },
        {
          name: "細菌性髄膜炎・脳炎",
          why: "中枢の感染は時間単位で進む。発熱と意識障害があれば、画像が正常でも髄液を見る。",
          pointers: ["hx_neck_stiff", "fever", S.highFever, "hx_petechiae", "crp_high",
                     { fn: function (F, V, D, ctx) { return cplt(ctx, "convulsion"); }, t: "痙攣を伴う" }],
          tests: ["頭部CT → 腰椎穿刺（抗菌薬を待たせない）", "血液培養", "単純ヘルペス脳炎を想定したアシクロビルの早期投与を検討"],
          refs: ["MENINGITIS"]
        },
        {
          name: "非痙攣性てんかん重積",
          why: "見える痙攣がないまま脳が発作を起こし続けている。意識障害が説明できないときに必ず思い出す。",
          pointers: ["hx_consciousness_impaired", { fn: function (F, V, D, ctx) { return hist(ctx, "epilepsy") || cplt(ctx, "convulsion"); }, t: "てんかんの既往・痙攣の目撃" },
                     { fn: function (F, V, D, ctx) { return med(ctx, "vpa") || med(ctx, "cbz") || med(ctx, "phenytoin"); }, t: "抗てんかん薬の使用" }],
          tests: ["脳波（可能なら持続モニタリング）", "抗てんかん薬の血中濃度",
                  "ILAE の重積の定義（5分以上、または発作後に意識が戻らない）で判断"],
          refs: ["SE_ILAE"]
        },
        {
          name: "重度の代謝性破綻",
          why: "アンモニア・ナトリウム・CO₂・甲状腺のどれかが脳を止めている。原因を治せば戻る。",
          pointers: ["nh3_high", "hypona_severe", "hyperna_severe", "respiratory_acidosis",
                     "severe_acidemia", "hx_asterixis", S.cirrhosis, "hyperca_severe"],
          tests: ["アンモニア・Na・血糖・Ca・血液ガス・肝腎機能を一度に",
                  "Na 補正は 24時間で 8〜10mEq/L 以内に留める", "West-Haven 分類で肝性脳症の段階を記録"],
          refs: ["WESTHAVEN"]
        }
      ],
      redflags: [
        "hx_coma", "hx_gcs_severe", "hx_pupil_aniso", "hx_pupil_fixed_dilated", "hx_focal_deficit",
        "hx_neck_stiff", "hypoglycemia", S.hypoxiaSevere, S.shockBp, S.bradycardia,
        "hx_cheyne", "hx_agonal", "respiratory_acidosis", S.anticoag
      ],
      groups: [
        {
          cat: "すぐ治せる（最初に潰す）",
          dds: [
            { name: "低血糖", sup: ["hypoglycemia", "hypoglycemia_severe", "hx_cold_clammy"], note: "" },
            { name: "低酸素・CO₂ ナルコーシス", sup: [S.hypoxiaSevere, "respiratory_acidosis", "primary_resp_acidosis", S.copd], note: "" },
            { name: "オピオイド・ベンゾジアゼピン中毒", sup: ["hx_pupil_pinpoint", { f: "hx_after_drug", t: "薬剤開始後" }, "respiratory_acidosis"],
              note: "pinpoint pupil ＋呼吸抑制。拮抗薬で診断と治療が同時に進む。" },
            { name: "ショック（脳灌流の不足）", sup: [S.shockBp, "hx_cold_clammy", "hx_crt_delay", "lactate_high"], note: "" }
          ]
        },
        {
          cat: "脳そのもの（局所徴候を探す）",
          dds: [
            { name: "脳出血・脳梗塞", sup: ["hx_sudden_onset", "hx_focal_deficit", "hx_hemiparesis", "hx_dtr_hyper", S.af], note: "" },
            { name: "くも膜下出血", sup: ["hx_pain_max_at_onset", "hx_neck_stiff", "hx_sudden_onset"], note: "" },
            { name: "脳炎・髄膜炎", sup: ["fever", "hx_neck_stiff", "crp_high"], note: "" },
            { name: "てんかん重積・発作後", sup: ["hx_recurrent", "lactate_high", "ck_veryhigh"],
              note: "発作直後は乳酸とCKが上がる。意識が戻らなければ重積を疑う。" },
            { name: "慢性硬膜下血腫", sup: ["hx_onset_subacute", "hx_post_trauma", S.elderly, S.anticoag], note: "数週かけてゆっくり。転倒を覚えていないことも多い。" }
          ]
        },
        {
          cat: "全身から来る（びまん性）",
          dds: [
            { name: "肝性脳症", sup: ["hx_asterixis", "nh3_high", S.cirrhosis, "alb_low", "che_low"], note: "" },
            { name: "尿毒症性脳症", sup: ["renal_severe", "renal_endstage", S.ckd, "hx_asterixis"], note: "" },
            { name: "電解質異常（Na・Ca）", sup: ["hypona_severe", "hyperna_severe", "hyperca_severe", "hypona_mod"], note: "" },
            { name: "敗血症性脳症", sup: ["fever", "lactate_high", "crp_high", S.tachypnea, S.hypotension], note: "" },
            { name: "内分泌（甲状腺・副腎）", sup: ["hx_goiter", "trab_pos", "hypona", "hyperk", "hx_hyperpigment"],
              note: "甲状腺クリーゼと低体温の粘液浮腫、副腎不全。どれも意識障害で来る。" },
            { name: "ビタミンB1欠乏（Wernicke）", sup: ["hx_cerebellar", { fn: function (F, V, D, ctx) { return cplt(ctx, "fatigue"); }, t: "倦怠・食事摂取不良" }],
              note: "眼球運動障害・小脳症状・意識障害。ブドウ糖の前にチアミンを。" }
          ]
        }
      ],
      ask: ["最後に normal だった時刻（目撃者に確認する）",
            "発症の速さと、その時していたこと",
            "薬（オピオイド・鎮静薬・インスリン・SU薬・抗てんかん薬）とアルコール",
            "外傷（本人が覚えていないことがある）、転倒",
            "基礎疾患（肝・腎・糖尿病・てんかん・精神疾患）と直近の感染"],
      exam: ["GCS を項目ごとに（E・V・M を分けて記録する）",
             "瞳孔径・左右差・対光反射、眼球の位置と運動",
             "項部硬直と髄膜刺激徴候",
             "呼吸様式（Cheyne-Stokes・Kussmaul・下顎呼吸）",
             "皮膚（黄染・点状出血・注射痕）と体温"],
      refs: ["GCS", "JCS", "WESTHAVEN", "SE_ILAE", "STROKE_JP"]
    },

    /* ============== 頭痛 ============== */
    {
      key: "headache", label: "頭痛", icon: "🤕",
      frame: "頭痛の仕事は一次性（片頭痛・緊張型）と二次性（血管・感染・圧）の切り分け。いつもと違う、最悪、初めて — この三語が出たら二次性として扱う。",
      killers: [
        {
          name: "くも膜下出血",
          why: "動脈瘤が破れた瞬間に痛みが最大になる。再破裂すれば致死率が跳ね上がるため、疑った時点で画像。",
          pointers: ["hx_pain_max_at_onset", "hx_sudden_onset", "hx_neck_stiff", "hx_consciousness_impaired",
                     { fn: function (F, V, D, ctx) { return cplt(ctx, "vomiting"); }, t: "嘔吐を伴う" }, S.elderly],
          tests: ["頭部単純CT（発症6時間以内なら感度は高い）", "CT 陰性でも疑いが残れば腰椎穿刺（キサントクロミー）",
                  "Ottawa SAH ルールは「除外」のための道具として使う", "CTA／MRA で動脈瘤の検索"],
          refs: ["OTTAWA_SAH"]
        },
        {
          name: "細菌性髄膜炎",
          why: "発熱＋頭痛＋項部硬直。抗菌薬の1時間が転帰を変える。",
          pointers: ["fever", S.highFever, "hx_neck_stiff", "hx_consciousness_impaired", "hx_petechiae", "crp_high"],
          tests: ["頭部CT → 腰椎穿刺", "血液培養2セット", "経験的抗菌薬＋デキサメタゾン"],
          refs: ["MENINGITIS"]
        },
        {
          name: "脳静脈血栓症・高血圧性緊急症",
          why: "静脈側の閉塞や血圧そのものが頭蓋内圧を上げる。進行性の頭痛と視覚症状、痙攣で現れる。",
          pointers: ["hx_progressive", { fn: function (F, V, D, ctx) { var s = vit(ctx, "sbp"); return s != null && s >= 180; }, t: "収縮期血圧 180mmHg 以上" },
                     { fn: function (F, V, D, ctx) { return cplt(ctx, "convulsion"); }, t: "痙攣" }, "hx_hemianopia", "apl_pos"],
          tests: ["MRI／MRV（静脈相を必ず含める）", "眼底（うっ血乳頭）", "凝固・抗リン脂質抗体",
                  "降圧は緩やかに（最初の1時間で25%以内）"],
          refs: []
        },
        {
          name: "巨細胞性動脈炎",
          why: "側頭動脈の炎症が眼動脈に及ぶと、不可逆の失明になる。50歳以上の新規頭痛では必ず考える。",
          pointers: [{ fn: function (F, V, D, ctx) { var a = C.num(ctx.age); return a != null && a >= 50; }, t: "50歳以上の新規頭痛" },
                     "crp_high", "crp_veryhigh", "anemia", "hx_poly_sym_arthritis", "hx_weight_loss"],
          tests: ["赤沈・CRP", "側頭動脈の圧痛・拍動減弱・顎の疲労（jaw claudication）の確認",
                  "疑えばステロイドを先に開始し、側頭動脈生検は後から"],
          refs: []
        }
      ],
      redflags: [
        "hx_pain_max_at_onset", "hx_sudden_onset", "hx_neck_stiff", "hx_consciousness_impaired",
        "hx_focal_deficit", "fever", "hx_progressive", S.elderly, S.immunosupp, S.anticoag,
        "hx_pupil_aniso", "hx_post_trauma"
      ],
      groups: [
        {
          cat: "二次性（構造・血管・感染）",
          dds: [
            { name: "くも膜下出血", sup: ["hx_pain_max_at_onset", "hx_neck_stiff", "hx_sudden_onset"], note: "" },
            { name: "脳出血", sup: ["hx_sudden_onset", "hx_focal_deficit", "hx_hemiparesis", S.anticoag], note: "" },
            { name: "髄膜炎・脳炎", sup: ["fever", "hx_neck_stiff", "crp_high", "hx_consciousness_impaired"], note: "" },
            { name: "脳静脈血栓症", sup: ["hx_progressive", "apl_pos", { fn: function (F, V, D, ctx) { return ctx.sex === "f" && med(ctx, "steroid"); }, t: "女性・ホルモン関連" }], note: "" },
            { name: "頭蓋内圧亢進（腫瘍・水頭症）", sup: ["hx_progressive", "hx_onset_subacute", S.malignancy, "hx_focal_deficit"],
              note: "朝方に強い、咳や前屈で増す、嘔吐を伴う。" },
            { name: "慢性硬膜下血腫", sup: ["hx_post_trauma", "hx_onset_subacute", S.elderly, S.anticoag], note: "" }
          ]
        },
        {
          cat: "一次性（二次性を外した後）",
          dds: [
            { name: "片頭痛", sup: ["hx_recurrent", { fn: function (F, V, D, ctx) { return cplt(ctx, "vomiting"); }, t: "嘔吐・悪心" }, "hx_hemianopia"],
              note: "拍動性・片側・光音過敏・日常動作で悪化。閃輝暗点は前兆。" },
            { name: "緊張型頭痛", sup: ["hx_onset_chronic", "hx_recurrent"], note: "両側の圧迫感、動作で悪化しない。" },
            { name: "群発頭痛", sup: ["hx_recurrent", "hx_pain_max_at_onset"], note: "片側眼窩、流涙・鼻閉、決まった時刻に。" }
          ]
        },
        {
          cat: "全身・薬剤",
          dds: [
            { name: "薬剤（硝酸薬・Ca拮抗薬）・薬物乱用頭痛", sup: [S.newDrug, "hx_recurrent"], note: "" },
            { name: "一酸化炭素中毒", sup: [{ fn: function (F, V, D, ctx) { return cplt(ctx, "fatigue"); }, t: "倦怠感を伴う" }, "lactate_high", "metabolic_acidosis"],
              note: "同居者が同じ症状、暖房器具。SpO₂ は正常に見える。" },
            { name: "緑内障・副鼻腔炎・側頭動脈炎", sup: ["hx_uveitis", "fever", "crp_high"], note: "頭痛の原因が頭蓋内にないこともある。" }
          ]
        }
      ],
      ask: ["いつもの頭痛と同じか、違うか（違えば二次性として扱う）",
            "人生で最悪か、何秒でピークに達したか",
            "発熱・項部硬直・嘔吐・視覚症状の有無",
            "外傷・抗凝固薬・免疫抑制状態",
            "起床時の悪化、咳・前屈での増強（頭蓋内圧）"],
      exam: ["瞳孔・眼球運動・視野と眼底（うっ血乳頭）",
             "項部硬直、Kernig・Brudzinski",
             "側頭動脈の圧痛と拍動",
             "局所神経症候（軽い片麻痺・失語を見逃さない）"],
      refs: ["OTTAWA_SAH", "MENINGITIS", "STROKE_JP"]
    },

    /* ============== 麻痺 ============== */
    {
      key: "paralysis", label: "麻痺", icon: "🫳",
      frame: "麻痺はまず「中枢か末梢か」「血管性か非血管性か」。突然なら血管、上行するなら末梢神経、髄節レベルがあれば脊髄。時間が組織を決めるので並行して動く。",
      killers: [
        {
          name: "急性脳梗塞",
          why: "血流が止まった領域が毎分壊れていく。再灌流療法には時間の窓があり、発症時刻の確定が治療方針そのもの。",
          pointers: ["hx_sudden_onset", "hx_hemiparesis", "hx_aphasia", "hx_dysarthria", "hx_hemianopia",
                     S.af, S.dm, { fn: function (F, V, D, ctx) { return hist(ctx, "stroke") || hist(ctx, "cad"); }, t: "脳卒中・虚血性心疾患の既往" }],
          tests: ["最後に normal だった時刻の確定", "頭部CT（出血の除外）→ CTA／MRI",
                  "NIHSS の記録", "血糖（低血糖は麻痺で来る）", "血栓回収・血栓溶解の適応判断"],
          refs: ["STROKE_JP", "NIHSS"]
        },
        {
          name: "脳出血",
          why: "出血そのものが圧として脳を壊す。抗凝固薬の有無で初動が変わる。",
          pointers: ["hx_sudden_onset", "hx_hemiparesis", "hx_consciousness_impaired", "hx_pupil_aniso",
                     S.anticoag, "inr_high", "plt_low", { fn: function (F, V, D, ctx) { var s = vit(ctx, "sbp"); return s != null && s >= 180; }, t: "収縮期血圧 180mmHg 以上" }],
          tests: ["頭部CT", "凝固（PT-INR・APTT・血小板）と抗凝固薬の中和", "血圧管理", "脳外科へ連絡"],
          refs: ["STROKE_JP"]
        },
        {
          name: "脊髄圧迫（硬膜外腫瘍・膿瘍・椎体骨折）",
          why: "脊髄は圧迫が続くと戻らない。膀胱直腸障害が出てからでは遅い。",
          pointers: ["hx_sens_level", "hx_dtr_hyper", "hx_tender_back", S.malignancy, "fever", S.immunosupp],
          tests: ["緊急MRI（全脊髄）", "悪性腫瘍ならステロイドと放射線・手術の検討",
                  "膿瘍なら血液培養と排膿", "膀胱直腸機能と感覚レベルを時間ごとに記録"],
          refs: []
        },
        {
          name: "ギラン・バレー症候群",
          why: "末梢神経が上行性に麻痺する。呼吸筋に達すれば換気ができなくなるので、肺活量を追うことが監視そのもの。",
          pointers: ["hx_post_infection", "hx_dtr_loss", "hx_progressive", "hx_sens_glove_stocking",
                     "gq1b_pos", "gm1_pos", "gt1a_pos"],
          tests: ["%肺活量・吸気圧を反復測定（呼吸筋麻痺の予測）", "髄液（蛋白細胞解離）",
                  "神経伝導検査", "抗ガングリオシド抗体", "Asbury & Cornblath の診断基準で照合"],
          refs: ["GBS_CRIT"]
        }
      ],
      redflags: [
        "hx_sudden_onset", "hx_consciousness_impaired", "hx_pupil_aniso", "hx_sens_level",
        "hx_dtr_loss", "hx_progressive", S.anticoag, "hypoglycemia", "hyperk_severe",
        "hypok_severe", { fn: function (F, V, D, ctx) { var s = vit(ctx, "sbp"); return s != null && s >= 180; }, t: "著明な高血圧" }
      ],
      groups: [
        {
          cat: "中枢（脳）",
          dds: [
            { name: "脳梗塞", sup: ["hx_sudden_onset", "hx_hemiparesis", "hx_aphasia", S.af], note: "" },
            { name: "脳出血", sup: ["hx_sudden_onset", "hx_consciousness_impaired", S.anticoag, "inr_high"], note: "" },
            { name: "TIA", sup: ["hx_recurrent", { f: "hx_course", t: "症状が消えた" }, S.af, S.dm],
              note: "消えても危険は消えない。ABCD² で早期再発リスクを評価する。" },
            { name: "てんかん後の麻痺（Todd 麻痺）", sup: [{ fn: function (F, V, D, ctx) { return cplt(ctx, "convulsion") || hist(ctx, "epilepsy"); }, t: "痙攣・てんかんの既往" }, "lactate_high", "ck_veryhigh"],
              note: "数時間で改善する。改善しなければ画像へ。" },
            { name: "低血糖・代謝性の偽性麻痺", sup: ["hypoglycemia", "hypona_severe", "hyperna_severe"],
              note: "血糖を測らずに脳梗塞と決めてはいけない。" }
          ]
        },
        {
          cat: "脊髄",
          dds: [
            { name: "脊髄圧迫", sup: ["hx_sens_level", "hx_dtr_hyper", "hx_tender_back", S.malignancy], note: "" },
            { name: "脊髄硬膜外膿瘍", sup: ["fever", "hx_tender_back", "crp_high", S.dm, S.immunosupp], note: "発熱＋背部痛＋神経症候の三徴。" },
            { name: "脊髄炎（視神経炎を伴うもの）", sup: ["hx_sens_level", "hx_progressive", "ana_pos"], note: "抗AQP4抗体・抗MOG抗体を確認する。" }
          ]
        },
        {
          cat: "末梢神経・筋・接合部",
          dds: [
            { name: "ギラン・バレー症候群", sup: ["hx_post_infection", "hx_dtr_loss", "hx_progressive", "gq1b_pos", "gm1_pos"], note: "" },
            { name: "重症筋無力症", sup: ["achr_pos", "musk_pos", { f: "hx_recurrent", t: "日内変動する（夕方に悪化）" }],
              note: "眼症状と易疲労性。クリーゼは呼吸筋から来る。" },
            { name: "周期性四肢麻痺・電解質異常", sup: ["hypok_severe", "hypok", "hyperk_severe", "trab_pos"],
              note: "甲状腺機能亢進に伴う低K性麻痺は若年男性に多い。" },
            { name: "横紋筋融解・ミオパチー", sup: ["ck_veryhigh", "rhabdo_range", { fn: function (F, V, D, ctx) { return med(ctx, "statin"); }, t: "スタチンの使用" }], note: "" }
          ]
        }
      ],
      ask: ["最後に normal だった時刻（治療の窓を決める）",
            "症状の広がり方（片側か両側か、下から上がってきたか）",
            "排尿・排便の障害（脊髄病変の警告）",
            "先行する感染・ワクチン（1〜3週前）",
            "抗凝固薬・血圧・既往（心房細動・糖尿病・悪性腫瘍）"],
      exam: ["麻痺の分布（顔を含むか、左右差、上下肢の差）",
             "腱反射と病的反射（中枢か末梢かを分ける要）",
             "感覚のレベル（髄節が特定できるか）",
             "呼吸筋（%肺活量・咳の強さ）と嚥下",
             "血糖と血圧の実測"],
      refs: ["STROKE_JP", "NIHSS", "ABCD2", "GBS_CRIT"]
    },

    /* ============== 痙攣 ============== */
    {
      key: "convulsion", label: "痙攣", icon: "⚡",
      frame: "痙攣は「止める」と「原因を探す」を同時に進める。5分続けば重積として扱い、同時に血糖・Na・Ca・酸素・感染・中毒・構造を潰す。",
      killers: [
        {
          name: "てんかん重積状態",
          why: "発作が続くほど神経細胞が傷み、薬が効きにくくなる。5分を境に治療のアルゴリズムが始まる。",
          pointers: ["hx_progressive", "hx_consciousness_impaired", "lactate_high", "ck_veryhigh", "metabolic_acidosis",
                     { fn: function (F, V, D, ctx) { return hist(ctx, "epilepsy"); }, t: "てんかんの既往" }],
          tests: ["ILAE の定義（5分以上、または発作間に意識が戻らない）で重積と判断",
                  "ベンゾジアゼピンを十分量 → 第二選択薬", "血糖・Na・Ca・Mg・血液ガスを同時に",
                  "発作が止まっても覚醒しなければ脳波（非痙攣性重積）"],
          refs: ["SE_ILAE"]
        },
        {
          name: "代謝性の原因（低血糖・低Na・低Ca）",
          why: "薬では止まらない痙攣。原因を補正しなければ再発し続ける。",
          pointers: ["hypoglycemia", "hypoglycemia_severe", "hypona_severe", "hypona_mod", "hypoca_severe", "hypomg"],
          tests: ["血糖・Na・Ca・Mg・P を最初のセットに入れる",
                  "低Naの補正速度は 24時間で 8〜10mEq/L 以内", "原因薬（サイアザイド・SSRI）の確認"],
          refs: []
        },
        {
          name: "中枢神経感染・脳炎",
          why: "ヘルペス脳炎は治療可能だが遅れると後遺症が残る。発熱＋痙攣＋意識障害で想定する。",
          pointers: ["fever", "hx_neck_stiff", "hx_consciousness_impaired", "crp_high", "hx_focal_deficit"],
          tests: ["頭部CT → 腰椎穿刺（HSV-PCR を含める）", "アシクロビルの早期投与を検討", "MRI（側頭葉）"],
          refs: ["MENINGITIS"]
        },
        {
          name: "脳構造病変（出血・腫瘍・外傷）",
          why: "初発の痙攣は構造病変を探す機会。特に高齢者と局所徴候のある例。",
          pointers: ["hx_focal_deficit", "hx_post_trauma", S.malignancy, S.elderly, S.anticoag, "hx_pupil_aniso"],
          tests: ["頭部CT／MRI", "抗凝固薬と凝固系の確認", "脳波"],
          refs: []
        }
      ],
      redflags: [
        "hx_coma", "hx_gcs_severe", "hx_focal_deficit", "fever", "hx_neck_stiff",
        "hypoglycemia", "hypona_severe", "hypoca_severe", "severe_acidemia",
        "ck_veryhigh", "rhabdo_range", S.anticoag, S.hypoxiaSevere
      ],
      groups: [
        {
          cat: "全身・代謝・中毒",
          dds: [
            { name: "低血糖", sup: ["hypoglycemia", "hypoglycemia_severe"], note: "" },
            { name: "低ナトリウム血症", sup: ["hypona_severe", "hypona_mod", { fn: function (F, V, D, ctx) { return med(ctx, "diuretic_thiazide"); }, t: "サイアザイドの使用" }], note: "" },
            { name: "低カルシウム・低マグネシウム", sup: ["hypoca_severe", "hypoca", "hypomg"], note: "" },
            { name: "尿毒症・肝性脳症", sup: ["renal_severe", "nh3_high", S.ckd, S.cirrhosis], note: "" },
            { name: "薬剤・離脱（アルコール・ベンゾジアゼピン）", sup: [S.newDrug, "hx_tremor_rest", "metabolic_alkalosis"],
              note: "最終飲酒からの時間を聞く。離脱は48〜72時間が山。" },
            { name: "抗てんかん薬の血中濃度低下", sup: [{ fn: function (F, V, D, ctx) { return med(ctx, "vpa") || med(ctx, "cbz") || med(ctx, "phenytoin"); }, t: "抗てんかん薬の使用" }, "hx_recurrent"],
              note: "服薬中断・相互作用・下痢による吸収低下。" }
          ]
        },
        {
          cat: "中枢神経",
          dds: [
            { name: "てんかん（既知）", sup: [{ fn: function (F, V, D, ctx) { return hist(ctx, "epilepsy"); }, t: "てんかんの既往" }, "hx_recurrent"], note: "" },
            { name: "脳卒中（出血・梗塞）", sup: ["hx_sudden_onset", "hx_focal_deficit", S.anticoag], note: "" },
            { name: "脳炎・髄膜炎", sup: ["fever", "hx_neck_stiff", "crp_high"], note: "抗NMDA受容体抗体など自己免疫性脳炎も含める。" },
            { name: "脳腫瘍・転移", sup: [S.malignancy, "hx_progressive", "hx_focal_deficit"], note: "" },
            { name: "可逆性後頭葉白質症（PRES）", sup: [{ fn: function (F, V, D, ctx) { var s = vit(ctx, "sbp"); return s != null && s >= 180; }, t: "著明な高血圧" }, "hx_hemianopia", S.immunosupp], note: "" }
          ]
        },
        {
          cat: "痙攣に見えるもの",
          dds: [
            { name: "失神（痙攣性失神）", sup: ["hx_postural", S.bradycardia, "hx_recurrent"],
              note: "数秒のミオクローヌスは失神でも起きる。前駆症状と回復の速さが違う。" },
            { name: "心原性（不整脈）", sup: [S.af, S.bradycardia, "hyperk_severe", "hypok_severe"],
              note: "痙攣の前に意識がなくなったのなら心原性を疑う。心電図を必ず。" },
            { name: "心理的非てんかん性発作", sup: ["hx_recurrent"], note: "器質的原因を外してから、専門家とともに。" }
          ]
        }
      ],
      ask: ["発作の様子を目撃者から（左右差・眼球偏倚・持続時間・舌咬傷・失禁）",
            "発作後の意識の戻り方（戻らなければ重積・非痙攣性重積）",
            "初発か反復か、服薬の中断",
            "アルコールと最終飲酒、睡眠不足、新規薬剤",
            "妊娠（妊娠後期なら子癇）"],
      exam: ["発作後の神経所見（Todd 麻痺の有無と改善）",
             "舌・口腔の咬傷、外傷、肩関節の脱臼",
             "項部硬直と発熱",
             "血糖・Na・Ca・血液ガス・CK の実測"],
      refs: ["SE_ILAE", "GCS"]
    },

    /* ============== 出血 ============== */
    {
      key: "bleeding", label: "出血", icon: "🩸",
      frame: "出血は「どこから」「なぜ止まらないか」の二問。粘膜のじわじわ出血は血小板・血管、深部や関節の出血は凝固因子。そして全身に出ているならDICを疑う。",
      killers: [
        {
          name: "循環血液量の喪失（出血性ショック）",
          why: "血圧が下がるのは遅い指標。頻脈・冷汗・乳酸上昇のほうが先に出る。止血と輸血を同時に進める。",
          pointers: [S.tachycardia, S.hypotension, "hx_cold_clammy", "hx_crt_delay", "lactate_high",
                     "anemia_severe", "buncr_high"],
          tests: ["輸液と輸血の準備、血液型・交差試験", "乳酸と塩基過剰", "出血源の同定（内視鏡・CT・血管造影）",
                  "抗凝固薬の中和"],
          refs: []
        },
        {
          name: "上部消化管出血",
          why: "食道・胃・十二指腸からの出血は大量になりうる。黒色便とBUN/Cr比の上昇が手がかり。",
          pointers: ["hx_stool_melena", "anemia", "buncr_high", S.nsaid, S.cirrhosis, S.anticoag, "hx_tender_epigastric"],
          tests: ["Glasgow-Blatchford スコアで介入の必要性を判定", "上部内視鏡（肝硬変なら変動する）",
                  "PPI 静注、肝硬変なら血管収縮薬と抗菌薬", "Rockall スコアで予後"],
          refs: ["GBS", "ROCKALL"]
        },
        {
          name: "DIC",
          why: "凝固と線溶が同時に暴走し、微小血栓と出血が共存する。基礎疾患（感染・悪性腫瘍・産科）の治療なしに止まらない。",
          pointers: ["dic_jaam", "plt_low", "plt_verylow", "fdp_veryhigh", "ddimer_veryhigh",
                     "fib_low", "pt_prolonged", "at3_low"],
          tests: ["急性期DIC診断基準（日本救急医学会）と ISTH overt DIC スコアの両方で確認",
                  "基礎疾患の同定と治療", "血小板・フィブリノゲンの補充の閾値を決める"],
          refs: ["JAAM_DIC", "ISTH_DIC"]
        },
        {
          name: "抗凝固薬・抗血小板薬による出血",
          why: "薬が効きすぎている状態。中和薬と半減期を知っているかどうかで初動が変わる。",
          pointers: [S.anticoag, S.antiplt, "inr_high", "inr_veryhigh", "aptt_prolonged", "pt_prolonged", S.ckd],
          tests: ["PT-INR・APTT と最終服薬時刻", "ワルファリンならビタミンK＋凝固因子製剤、DOACなら特異的中和薬",
                  "腎機能（DOAC の排泄）", "HAS-BLED で出血リスクを記録"],
          refs: ["HASBLED"]
        },
        {
          name: "血小板減少の緊急（TTP・HIT）",
          why: "どちらも「血小板が少ないのに血栓ができる」病態。輸血や安易なヘパリン継続が病態を悪化させる。",
          pointers: ["plt_verylow", "plt_low", "anemia", "ld_high", "renal_impair",
                     { fn: function (F, V, D, ctx) { return med(ctx, "heparin"); }, t: "ヘパリンの使用" }, "hx_focal_deficit"],
          tests: ["破砕赤血球の確認と ADAMTS13 活性（TTP）",
                  "4Ts スコアと HIT 抗体（HIT ではヘパリンを直ちに中止し代替抗凝固へ）",
                  "TTP を疑えば血漿交換を急ぐ"],
          refs: ["FOURTS"]
        }
      ],
      redflags: [
        S.tachycardia, S.hypotension, "hx_cold_clammy", "anemia_severe", "plt_verylow",
        "dic_jaam", "inr_veryhigh", "fib_low", "hx_stool_melena", "hx_stool_bloody",
        "hx_consciousness_impaired", S.anticoag, "lactate_high"
      ],
      groups: [
        {
          cat: "出血の場所",
          dds: [
            { name: "上部消化管", sup: ["hx_stool_melena", "buncr_high", "hx_tender_epigastric", S.nsaid, S.cirrhosis], note: "" },
            { name: "下部消化管", sup: ["hx_stool_bloody", S.elderly, "hx_tender_llq"], note: "虚血性大腸炎・大腸癌・血管病変。" },
            { name: "頭蓋内", sup: ["hx_consciousness_impaired", "hx_focal_deficit", "hx_sudden_onset", S.anticoag], note: "" },
            { name: "粘膜・皮膚（点状出血・歯肉・鼻）", sup: ["hx_petechiae", "hx_purpura_flat", "plt_low"],
              note: "血小板・血管側の障害。一次止血の問題。" },
            { name: "深部・関節・筋肉内", sup: ["aptt_prolonged", "pt_prolonged", "hx_post_trauma"],
              note: "凝固因子側の障害。二次止血の問題。" }
          ]
        },
        {
          cat: "止まらない理由",
          dds: [
            { name: "血小板の数が足りない", sup: ["plt_low", "plt_verylow", "pancytopenia"],
              note: "産生低下・破壊（ITP・TTP・HIT）・分布（脾）に分ける。" },
            { name: "凝固因子が足りない・働けない", sup: ["pt_prolonged", "aptt_prolonged", "both_prolonged", "inr_high", S.cirrhosis, S.anticoag],
              note: "PT 単独延長・APTT 単独延長・両方延長で原因群が分かれる。" },
            { name: "消費されている（DIC）", sup: ["dic_jaam", "fdp_veryhigh", "fib_low", "plt_low", "at3_low"], note: "" },
            { name: "血管側の問題（血管炎・アミロイド・Vit C）", sup: ["hx_purpura_palpable", "mpo_pos", "pr3_pos"],
              note: "触知可能な紫斑は血管炎を強く示唆する。血小板は正常。" },
            { name: "線溶が亢進している", sup: ["fdp_veryhigh", "ddimer_veryhigh", "fib_low", S.malignancy],
              note: "前立腺癌・急性前骨髄球性白血病・大動脈瘤で線溶優位型。" }
          ]
        }
      ],
      ask: ["どこから、いつから、どのくらいの量（具体的な器や回数で）",
            "抗凝固薬・抗血小板薬の種類と最終服薬時刻",
            "歯科治療や手術での止血経験、家族歴（先天性）",
            "肝疾患・腎疾患・悪性腫瘍・直近の感染",
            "ヘパリン曝露（5〜10日前からの血小板の推移）"],
      exam: ["皮膚と粘膜を全部見る（点状出血・紫斑の性状・口腔・眼瞼）",
             "紫斑が触知できるかどうか（血管炎か血小板か）",
             "直腸診と便の性状",
             "脈拍・起立時の血圧変化・CRT"],
      refs: ["GBS", "ROCKALL", "JAAM_DIC", "ISTH_DIC", "FOURTS", "HASBLED"]
    },

    /* ============== 浮腫 ============== */
    {
      key: "edema", label: "浮腫", icon: "💧",
      frame: "浮腫は片側か両側かで世界が分かれる。片側は局所の閉塞（DVT・リンパ・感染）、両側は全身の問題（心・腎・肝・栄養・薬剤）。",
      killers: [
        {
          name: "深部静脈血栓症と肺塞栓",
          why: "片側の下腿腫脹は肺塞栓の予備軍。歩いた瞬間に肺へ飛ぶ。",
          pointers: ["hx_edema_unilat", "ddimer_high", "ddimer_veryhigh", S.malignancy, S.tachypnea, S.hypoxia,
                     { fn: function (F, V, D, ctx) { return cplt(ctx, "dyspnea") || cplt(ctx, "chest_pain"); }, t: "呼吸困難・胸痛を伴う" }],
          tests: ["Wells スコア（DVT）→ D-ダイマーまたは下肢静脈エコー",
                  "呼吸器症状があれば肺塞栓として Wells（PE）と造影CT", "抗凝固の開始判断"],
          refs: ["WELLS_DVT", "WELLS_PE"]
        },
        {
          name: "急性心不全",
          why: "両側の圧痕性浮腫＋頸静脈怒張＋体重増加。肺うっ血に至る前に捕まえたい。",
          pointers: ["hx_edema_bilat", "hx_jvd", "hx_orthopnea", "hx_weight_gain", "bnp_high", "hx_fine_crackles", S.hf],
          tests: ["BNP／NT-proBNP", "胸部X線・心エコー", "体重と尿量の記録", "内服（利尿薬の自己中断・NSAIDs）の確認"],
          refs: ["HF_JCS"]
        },
        {
          name: "蜂窩巣炎・壊死性筋膜炎",
          why: "片側の熱感を伴う腫脹。所見に不釣り合いな激痛と全身状態の悪化は、筋膜炎の警告。",
          pointers: ["hx_edema_unilat", "fever", "hx_rash_diffuse", "crp_veryhigh", S.dm, S.hypotension, "ck_veryhigh"],
          tests: ["皮膚所見の境界をマークして経時変化を見る", "CRP・CK・血液培養",
                  "画像（ガス・筋膜の液体貯留）", "疑えば外科的検索を遅らせない"],
          refs: []
        }
      ],
      redflags: [
        "hx_edema_unilat", S.hypoxia, S.tachypnea, "hx_orthopnea", "fever", "crp_veryhigh",
        "ddimer_veryhigh", "alb_verylow", "renal_severe", "hx_weight_gain", S.hypotension
      ],
      groups: [
        {
          cat: "片側（局所の閉塞）",
          dds: [
            { name: "深部静脈血栓症", sup: ["hx_edema_unilat", "ddimer_high", S.malignancy], note: "" },
            { name: "蜂窩巣炎", sup: ["hx_edema_unilat", "fever", "crp_high", S.dm], note: "" },
            { name: "リンパ浮腫", sup: ["hx_edema_unilat", "hx_onset_chronic", S.malignancy], note: "圧痕が残りにくい、足背が盛り上がる。" },
            { name: "静脈弁不全・外傷", sup: ["hx_edema_unilat", "hx_post_trauma", "hx_onset_chronic"], note: "" }
          ]
        },
        {
          cat: "両側（全身の問題）",
          dds: [
            { name: "心不全", sup: ["hx_edema_bilat", "hx_jvd", "hx_orthopnea", "bnp_high", "hx_s3"], note: "" },
            { name: "腎機能低下・ネフローゼ", sup: ["hx_edema_bilat", "renal_impair", "renal_severe", "alb_low", "alb_verylow", "cr_high"],
              note: "尿蛋白の定量を。顔面・眼瞼の浮腫で来ることが多い。" },
            { name: "肝硬変", sup: ["hx_ascites", "alb_low", "che_low", "hx_spider_angioma", "hx_caput_medusae", S.cirrhosis], note: "" },
            { name: "低栄養・吸収障害", sup: ["alb_verylow", "hx_weight_loss", "anemia"], note: "" },
            { name: "薬剤性（Ca拮抗薬・NSAIDs・ステロイド・ピオグリタゾン）", sup: [S.newDrug, S.nsaid, { fn: function (F, V, D, ctx) { return med(ctx, "steroid"); }, t: "ステロイド" }],
              note: "薬剤は両側性浮腫の見落とされやすい原因。中止で判断できる。" },
            { name: "甲状腺機能低下（粘液浮腫）", sup: ["hx_edema_bilat", "hx_goiter", "hypona", "ck_high"],
              note: "圧痕の残らない浮腫、徐脈、低体温。" }
          ]
        }
      ],
      ask: ["片側か両側か、いつからか、朝と夕方でどう違うか",
            "体重の推移（1週間で何kg）と尿量",
            "呼吸困難・起坐呼吸・夜間の呼吸苦",
            "新規薬剤（Ca拮抗薬・NSAIDs・ステロイド・ホルモン）",
            "長時間の不動・手術・悪性腫瘍（DVT のリスク）"],
      exam: ["左右差を周囲長で測る（片側＝局所を探す）",
             "圧痕の残り方（残る＝水分、残らない＝リンパ・粘液）",
             "頸静脈・III音・両側下肺の捻髪音",
             "腹水と肝脾、皮膚の熱感・境界"],
      refs: ["WELLS_DVT", "HF_JCS", "KDIGO_CKD", "CHILDPUGH"]
    },

    /* ============== 乏尿 ============== */
    {
      key: "oliguria", label: "乏尿", icon: "🚱",
      frame: "乏尿は腎前性・腎性・腎後性の三つに分ける。最初に膀胱と血圧を確認する — 閉塞と循環は、どちらもその場で治せる。",
      killers: [
        {
          name: "腎後性閉塞（尿閉・両側水腎症）",
          why: "出口が詰まっているだけなら、カテーテル一本で解決する。放置すれば不可逆の腎障害になる。",
          pointers: ["hx_abd_distension", "hx_tender_periumbilical", "renal_impair", "cr_high", "hyperk",
                     { fn: function (F, V, D, ctx) { return hist(ctx, "malignancy"); }, t: "骨盤内腫瘍の既往" }],
          tests: ["膀胱エコーで残尿を確認し、必要なら導尿", "腎エコーで水腎症",
                  "解除後の多尿（post-obstructive diuresis）に備える"],
          refs: ["KDIGO_AKI"]
        },
        {
          name: "腎前性（循環血液量・心拍出量の不足）",
          why: "腎は灌流圧の変化を最初に受ける臓器。低血圧・脱水・出血・心不全のサインとして乏尿が出る。",
          pointers: ["hx_hypovolemia", S.hypotension, S.tachycardia, "buncr_high", "uosm_high", "una_low",
                     "lactate_high", "hx_crt_delay"],
          tests: ["輸液負荷への反応（尿量・血圧・乳酸）", "BUN/Cr 比・尿中Na・尿浸透圧",
                  "腎毒性薬（NSAIDs・ACE阻害薬／ARB・造影剤）の中止", "KDIGO の AKI 病期分類で記録"],
          refs: ["KDIGO_AKI"]
        },
        {
          name: "高カリウム血症による心停止",
          why: "乏尿が続けばカリウムは必ず上がる。心電図変化が出てからでは時間がない。",
          pointers: ["hyperk", "hyperk_severe", "renal_severe", "metabolic_acidosis", S.bradycardia, "rhabdo_range"],
          tests: ["心電図（テント状T波・QRS 幅）", "カルシウム製剤・グルコース＋インスリン・β刺激薬",
                  "透析の適応判断（K・アシドーシス・体液過剰・尿毒症）"],
          refs: []
        },
        {
          name: "急性腎障害の原因としての横紋筋融解・腫瘍崩壊",
          why: "筋や腫瘍の崩壊産物が尿細管を詰める。原因を知っていれば輸液で防げる。",
          pointers: ["ck_veryhigh", "rhabdo_range", "hyperk", "hyperp", "hypoca", "ua_high", "ld_high", S.malignancy],
          tests: ["CK・K・P・Ca・尿酸・LD", "大量輸液と尿量の維持", "腫瘍崩壊なら尿酸降下薬と透析の準備"],
          refs: ["KDIGO_AKI"]
        }
      ],
      redflags: [
        "hyperk_severe", "hyperk", "renal_severe", "renal_endstage", S.hypotension,
        "metabolic_acidosis", "severe_acidemia", "hx_hypervolemia", "hx_abd_distension",
        "rhabdo_range", "lactate_high", "hx_consciousness_impaired"
      ],
      groups: [
        {
          cat: "腎前性",
          dds: [
            { name: "脱水・出血", sup: ["hx_hypovolemia", "buncr_high", "una_low", "uosm_high", S.tachycardia], note: "尿中Na 低値・尿浸透圧高値＝腎は正しく働いている。" },
            { name: "心不全・心拍出量低下", sup: ["hx_jvd", "bnp_high", "hx_edema_bilat", S.hf], note: "体液は多いのに腎灌流は少ない。" },
            { name: "肝腎症候群", sup: [S.cirrhosis, "hx_ascites", "una_low", "alb_low", "cr_high"], note: "" },
            { name: "薬剤（NSAIDs・ACE阻害薬／ARB）", sup: [S.nsaid, { fn: function (F, V, D, ctx) { return med(ctx, "acei_arb"); }, t: "ACE阻害薬／ARB" }],
              note: "糸球体内圧を下げる。脱水と重なると一気に落ちる。" }
          ]
        },
        {
          cat: "腎性",
          dds: [
            { name: "急性尿細管障害（虚血・腎毒性）", sup: ["cr_high", "renal_impair", "una_high", "uosm_low", "lactate_high"], note: "尿中Na 高値・尿浸透圧低値。" },
            { name: "横紋筋融解症", sup: ["ck_veryhigh", "rhabdo_range", "hyperk", "hyperp"], note: "" },
            { name: "急性間質性腎炎", sup: [S.newDrug, "eosinophilia", "hx_rash_diffuse", "cr_high"], note: "薬剤・感染・膠原病。好酸球と皮疹が手がかり。" },
            { name: "急速進行性糸球体腎炎・血管炎", sup: ["mpo_pos", "pr3_pos", "gbm_pos", "cr_high", "hx_hemoptysis", "crp_high"],
              note: "肺腎症候群として血痰を伴う。週単位で腎が失われる。" },
            { name: "造影剤・腫瘍崩壊", sup: ["ua_high", "hyperp", "ld_high", S.malignancy], note: "" }
          ]
        },
        {
          cat: "腎後性",
          dds: [
            { name: "前立腺肥大・尿閉", sup: ["hx_abd_distension", { fn: function (F, V, D, ctx) { return ctx.sex === "m"; }, t: "男性" }, S.elderly], note: "まず残尿を測る。" },
            { name: "両側尿管閉塞（腫瘍・結石・後腹膜）", sup: [S.malignancy, "hx_tender_back", "renal_impair"], note: "" },
            { name: "膀胱カテーテルの閉塞", sup: ["hx_abd_distension"], note: "乏尿の原因が機械的なこともある。まずカテーテルを見る。" }
          ]
        }
      ],
      ask: ["正確な尿量（時間尿で、推定ではなく実測）",
            "体重の推移と最近の輸液・輸血の量",
            "新規薬剤（NSAIDs・ACE阻害薬／ARB・抗菌薬・造影剤）",
            "排尿の様子（出にくい・途切れる・残る）",
            "下痢・嘔吐・出血・発熱（腎前性の原因）"],
      exam: ["膀胱エコーで残尿を測る（最初の一手）",
             "体液量の評価（頸静脈・皮膚ツルゴール・浮腫・起立性変化）",
             "心電図（高カリウムの変化）",
             "腎エコー（水腎症・腎サイズ）"],
      refs: ["KDIGO_AKI", "KDIGO_CKD"]
    },

    /* ============== 下痢 ============== */
    {
      key: "diarrhea", label: "下痢", icon: "🚽",
      frame: "下痢は「炎症性か分泌性か」「脱水と電解質がどこまで来ているか」。血便・発熱・高度脱水・免疫抑制のどれかがあれば、ただの胃腸炎として帰してはいけない。",
      killers: [
        {
          name: "重度脱水・循環血液量減少性ショック",
          why: "水と電解質が腸から失われ続ける。高齢者と小児では短時間で循環が破れる。",
          pointers: ["hx_hypovolemia", S.tachycardia, S.hypotension, "buncr_high", "hyperna", "hypok",
                     "metabolic_acidosis", "lactate_high", S.elderly],
          tests: ["体重・尿量・起立性変化の実測", "Na・K・Cl・HCO₃⁻・血液ガス", "補液（経口が可能なら経口を優先）"],
          refs: []
        },
        {
          name: "Clostridioides difficile 感染・偽膜性腸炎",
          why: "抗菌薬使用後の腸内細菌の崩れ。劇症型では麻痺性イレウスとショックに至る。",
          pointers: [{ fn: function (F, V, D, ctx) { return med(ctx, "antibiotics"); }, t: "抗菌薬の使用" },
                     "wbc_veryhigh", "alb_low", "fever", "hx_abd_distension", "hx_tender_diffuse", S.immunosupp],
          tests: ["CD トキシン／GDH と核酸検査", "白血球数（著明な上昇は重症の指標）",
                  "腹部CT（結腸壁の肥厚・中毒性拡張）", "原因抗菌薬の中止と標的治療"],
          refs: ["IDSA_DIAR"]
        },
        {
          name: "腸管出血性大腸菌・溶血性尿毒症症候群",
          why: "血便のあとに血小板減少と腎障害が続く。抗菌薬や止痢薬がかえって悪化させる。",
          pointers: ["hx_stool_bloody", "plt_low", "anemia", "ld_high", "cr_high", "renal_impair"],
          tests: ["便培養とベロ毒素", "血小板・LD・破砕赤血球・腎機能を連日追う",
                  "止痢薬は使わない", "血液浄化の準備"],
          refs: ["IDSA_DIAR"]
        },
        {
          name: "炎症性腸疾患の重症増悪・中毒性巨大結腸",
          why: "結腸が拡張し、穿孔すれば一気に腹膜炎になる。頻回の血便と全身症状で見分ける。",
          pointers: ["hx_stool_bloody", "fever", "anemia", "crp_high", "alb_low", "hx_abd_distension", "hx_tender_diffuse"],
          tests: ["腹部X線／CT（結腸径）", "CRP・アルブミン・ヘモグロビン", "内視鏡（重症例は慎重に）", "外科と並行して管理"],
          refs: []
        }
      ],
      redflags: [
        "hx_stool_bloody", "fever", S.highFever, "hx_hypovolemia", S.hypotension,
        "hypok_severe", "hypok", "metabolic_acidosis", "renal_impair", "plt_low",
        S.immunosupp, "hx_peritoneal", "wbc_veryhigh", S.elderly
      ],
      groups: [
        {
          cat: "感染性",
          dds: [
            { name: "ウイルス性腸炎", sup: ["hx_stool_watery", "hx_onset_acute", { fn: function (F, V, D, ctx) { return cplt(ctx, "vomiting"); }, t: "嘔吐が先行" }],
              note: "嘔吐から始まり水様便へ。抗菌薬は不要。" },
            { name: "細菌性腸炎（侵襲性）", sup: ["hx_stool_bloody", "fever", "crp_high", "wbc_high", "hx_tender_diffuse"],
              note: "血便・高熱・テネスムス。便培養を取ってから治療を考える。" },
            { name: "C. difficile 感染", sup: [{ fn: function (F, V, D, ctx) { return med(ctx, "antibiotics"); }, t: "抗菌薬の使用" }, "wbc_veryhigh", "alb_low"], note: "" },
            { name: "食中毒（毒素型）", sup: ["hx_onset_acute", "hx_after_meal", "hx_stool_watery"], note: "数時間以内の発症。原因食の共有者を確認。" }
          ]
        },
        {
          cat: "非感染性",
          dds: [
            { name: "炎症性腸疾患", sup: ["hx_stool_bloody", "hx_onset_subacute", "crp_high", "anemia", "alb_low", "hx_weight_loss"], note: "" },
            { name: "虚血性大腸炎", sup: ["hx_tender_llq", "hx_stool_bloody", "hx_sudden_onset", S.elderly], note: "" },
            { name: "薬剤性（抗菌薬・PPI・メトホルミン・マグネシウム）", sup: [S.newDrug, { fn: function (F, V, D, ctx) { return med(ctx, "metformin") || med(ctx, "ppi"); }, t: "メトホルミン・PPI" }], note: "" },
            { name: "吸収不良・膵外分泌不全", sup: ["hx_onset_chronic", "hx_weight_loss", "hx_stool_pale", "alb_low"], note: "" },
            { name: "甲状腺機能亢進症", sup: ["hx_goiter", "trab_pos", "hx_tremor_fine", "hx_weight_loss", S.tachycardia], note: "下痢と体重減少で来る内分泌疾患。" },
            { name: "overflow（便秘による見かけの下痢）", sup: [S.elderly, "hx_abd_distension"], note: "直腸診で確かめる。止痢薬は禁。" }
          ]
        }
      ],
      ask: ["回数・量・性状（水様／血性／粘液／脂肪）と、夜間に起きるか",
            "発症の速さと、同じものを食べた人の症状",
            "直近3か月の抗菌薬（C. difficile）",
            "渡航・生食・動物接触",
            "体重減少・関節痛・口腔内病変（IBD の全身症状）"],
      exam: ["体液量の評価（起立性変化・皮膚ツルゴール・腋窩の乾燥）",
             "腹部の圧痛と腹膜刺激徴候、腹部膨満",
             "直腸診（便の性状・腫瘤・便塞栓）",
             "体温と皮膚、関節・眼（IBD の腸管外症状）"],
      refs: ["IDSA_DIAR"]
    },

    /* ============== 嘔吐 ============== */
    {
      key: "vomiting", label: "嘔吐", icon: "🤢",
      frame: "嘔吐は消化器だけの症状ではない。中枢（圧・前庭）、代謝（DKA・副腎・高Ca）、薬剤、そして閉塞 — この四つを外から潰す。",
      killers: [
        {
          name: "腸閉塞・絞扼",
          why: "閉塞が続けば腸が虚血に陥る。金属音と腹部膨満、手術歴が手がかり。",
          pointers: ["hx_bowel_metallic", "hx_abd_distension", "hx_tender_diffuse", "hx_bowel_absent",
                     "lactate_high", "hx_peritoneal", "metabolic_alkalosis", "hypok"],
          tests: ["腹部X線／CT（閉塞点と絞扼徴候）", "電解質（低K・低Cl性アルカローシス）",
                  "胃管と輸液", "外科コンサルト"],
          refs: []
        },
        {
          name: "頭蓋内圧亢進",
          why: "嘔吐が噴出性で、頭痛・意識障害・局所徴候を伴う。消化器を探している間に脳が押される。",
          pointers: ["hx_consciousness_impaired", "hx_focal_deficit", "hx_pupil_aniso", "hx_neck_stiff",
                     { fn: function (F, V, D, ctx) { return cplt(ctx, "headache"); }, t: "頭痛を伴う" }, S.bradycardia],
          tests: ["頭部CT／MRI", "眼底（うっ血乳頭）", "血圧上昇＋徐脈（Cushing 現象）の確認"],
          refs: []
        },
        {
          name: "糖尿病性ケトアシドーシス",
          why: "嘔吐と腹痛で来る代謝性救急。胃腸炎として帰すと数時間で崩れる。",
          pointers: ["hyperglycemia_severe", "hyperglycemia_extreme", "ag_high", "metabolic_acidosis",
                     "hx_kussmaul", S.dm, "hx_hypovolemia", "hyperk"],
          tests: ["血糖・血液ガス・ケトン体", "AG とアルブミン補正 AG", "輸液・インスリン・K の補充計画"],
          refs: ["FIGGE"]
        },
        {
          name: "副腎不全・高カルシウム血症",
          why: "嘔吐・脱力・低血圧の組み合わせ。ステロイド中断歴や悪性腫瘍が背景にある。",
          pointers: ["hypona", "hyperk", "hx_hyperpigment", S.hypotension, "hyperca", "hyperca_severe",
                     { fn: function (F, V, D, ctx) { return med(ctx, "steroid"); }, t: "ステロイドの使用・中断" }, S.malignancy],
          tests: ["Na・K・血糖・Ca（補正Ca）・コルチゾール・ACTH", "疑えばヒドロコルチゾンを先に投与",
                  "高Caなら輸液とビスホスホネート"],
          refs: ["PAYNE"]
        },
        {
          name: "食道破裂（Boerhaave）",
          why: "激しい嘔吐の直後の胸痛。縦隔炎に進むと致死率が高い。",
          pointers: [{ fn: function (F, V, D, ctx) { return cplt(ctx, "chest_pain"); }, t: "胸痛を伴う" },
                     "hx_sudden_onset", "hx_tender_epigastric", S.tachypnea, "crp_high"],
          tests: ["造影CT（縦隔気腫・胸水）", "食道造影", "外科・消化器内科へ即連絡"],
          refs: []
        }
      ],
      redflags: [
        "hx_bowel_metallic", "hx_peritoneal", "hx_consciousness_impaired", "hx_focal_deficit",
        "hyperglycemia_severe", "ag_high", "hypona_severe", "hyperca_severe", "hyperk",
        S.hypotension, "hx_stool_melena", "hx_abd_distension", S.bradycardia
      ],
      groups: [
        {
          cat: "消化管",
          dds: [
            { name: "腸閉塞", sup: ["hx_bowel_metallic", "hx_abd_distension", "hypok", "metabolic_alkalosis"], note: "" },
            { name: "胃炎・胃潰瘍・幽門狭窄", sup: ["hx_tender_epigastric", S.nsaid, "hx_stool_melena", "metabolic_alkalosis"], note: "" },
            { name: "胆道・膵疾患", sup: ["hx_tender_ruq", "hx_murphy", "amy_veryhigh", "lip_veryhigh", "cholestasis"], note: "" },
            { name: "急性胃腸炎", sup: ["hx_stool_watery", "hx_onset_acute", "fever"], note: "他を外した後の診断。" }
          ]
        },
        {
          cat: "中枢・前庭",
          dds: [
            { name: "頭蓋内圧亢進（出血・腫瘍・水頭症）", sup: ["hx_consciousness_impaired", "hx_focal_deficit", "hx_pupil_aniso"], note: "" },
            { name: "小脳梗塞・出血", sup: ["hx_cerebellar", "hx_sudden_onset", { fn: function (F, V, D, ctx) { return cplt(ctx, "headache"); }, t: "頭痛" }],
              note: "めまいと嘔吐だけで来る。歩けるかどうかを必ず見る。" },
            { name: "前庭障害（BPPV・前庭神経炎）", sup: ["hx_postural", "hx_recurrent"], note: "中枢性を外してから。" },
            { name: "片頭痛", sup: ["hx_recurrent", { fn: function (F, V, D, ctx) { return cplt(ctx, "headache"); }, t: "頭痛" }], note: "" }
          ]
        },
        {
          cat: "代謝・薬剤・その他",
          dds: [
            { name: "糖尿病性ケトアシドーシス", sup: ["hyperglycemia_severe", "ag_high", "metabolic_acidosis", "hx_kussmaul"], note: "" },
            { name: "尿毒症", sup: ["renal_severe", "renal_endstage", S.ckd, "metabolic_acidosis"], note: "" },
            { name: "副腎不全", sup: ["hypona", "hyperk", "hx_hyperpigment", S.hypotension], note: "" },
            { name: "高カルシウム血症", sup: ["hyperca", "hyperca_severe", S.malignancy], note: "" },
            { name: "薬剤（オピオイド・ジゴキシン・抗がん剤・抗菌薬）", sup: [S.newDrug, { fn: function (F, V, D, ctx) { return med(ctx, "chemo"); }, t: "化学療法中" }], note: "" },
            { name: "妊娠", sup: [{ fn: function (F, V, D, ctx) { return ctx.sex === "f" && !ctx.pregnant; }, t: "妊娠の可能性を未確認" }],
              note: "妊娠可能年齢の女性では、嘔吐の鑑別に必ず入れる。" }
          ]
        }
      ],
      ask: ["嘔吐の時期（食後すぐ／早朝／噴出性）と内容（胆汁・血液・便臭）",
            "腹痛・排ガス・最終排便（閉塞の有無）",
            "頭痛・めまい・視覚症状・歩行の変化",
            "薬剤（オピオイド・ジゴキシン・抗がん剤）とステロイドの中断",
            "妊娠の可能性、糖尿病、腎機能"],
      exam: ["体液量と起立性変化、体重",
             "腹部（膨満・蠕動音・腹膜刺激徴候・手術痕）",
             "神経所見（瞳孔・小脳症状・歩行・眼振）",
             "血糖・電解質・血液ガスの実測"],
      refs: ["FIGGE", "PAYNE", "GOLDMARK"]
    },

    /* ============== 倦怠感 ============== */
    {
      key: "fatigue", label: "倦怠感", icon: "🫩",
      frame: "倦怠感は最も非特異的で、最も見落としの多い主訴。「貧血・内分泌・腎肝・感染・腫瘍・薬剤・心」の七つを一度に当たり、同時に「隠れた急性疾患の仮面」でないかを確かめる。",
      killers: [
        {
          name: "急性冠症候群・心不全の非典型的表現",
          why: "高齢者・糖尿病・女性では胸痛がない。倦怠感と食欲低下だけで梗塞が進んでいることがある。",
          pointers: [S.elderly, S.dm, "troponin_high", "bnp_high", "hx_exertional", "hx_orthopnea", "hx_cold_clammy"],
          tests: ["心電図と心筋トロポニン（迷えば一度は取る）", "BNP／NT-proBNP", "労作耐容能の変化を具体的に聞く"],
          refs: ["ACS_JCS", "HF_JCS"]
        },
        {
          name: "副腎不全",
          why: "低Na・高K・低血圧・色素沈着。診断されるまで何か月もかかることがあり、感染などで一気にクリーゼへ移る。",
          pointers: ["hypona", "hyperk", "hx_hyperpigment", S.hypotension, "hypoglycemia", "hx_weight_loss",
                     { fn: function (F, V, D, ctx) { return med(ctx, "steroid"); }, t: "ステロイドの使用・中断" }],
          tests: ["朝のコルチゾール・ACTH", "Na・K・血糖", "疑えば負荷試験の前にヒドロコルチゾンを"],
          refs: []
        },
        {
          name: "造血器悪性腫瘍・重度貧血",
          why: "汎血球減少や blast の出現は、倦怠感という主訴の下に隠れる。血算一枚で見つかる。",
          pointers: ["anemia_severe", "pancytopenia", "blasts", "plt_low", "ld_high", "sil2r_high",
                     "hx_lymph_general", "hx_weight_loss", "hx_petechiae"],
          tests: ["血算と白血球分画（塗抹の目視を依頼する）", "LD・尿酸・sIL-2R", "必要なら骨髄検査へ"],
          refs: []
        },
        {
          name: "高カルシウム血症・腫瘍崩壊",
          why: "倦怠感・多尿・便秘・意識障害。悪性腫瘍の背景で進む。",
          pointers: ["hyperca", "hyperca_severe", S.malignancy, "renal_impair", "hx_consciousness_impaired", "ua_high"],
          tests: ["補正Ca（Payne 式）とイオン化Ca", "PTH・PTHrP・ビタミンD", "輸液とビスホスホネート"],
          refs: ["PAYNE"]
        }
      ],
      redflags: [
        "hx_weight_loss", "anemia_severe", "pancytopenia", "blasts", "hyperca_severe",
        "hypona_severe", "hyperk", "renal_severe", "troponin_high", "hx_lymph_general",
        "hx_consciousness_impaired", "hypoglycemia", "sil2r_high"
      ],
      groups: [
        {
          cat: "血液・酸素運搬",
          dds: [
            { name: "貧血（鉄欠乏・慢性疾患・B12/葉酸）", sup: ["anemia", "anemia_moderate", "microcytic", "macrocytic", "rdw_high"],
              note: "MCV と網赤血球で産生低下・破壊・失血を分ける。" },
            { name: "造血器腫瘍", sup: ["pancytopenia", "blasts", "atypical_lymph", "ld_high", "sil2r_high"], note: "" }
          ]
        },
        {
          cat: "内分泌・代謝",
          dds: [
            { name: "甲状腺機能低下症", sup: ["hx_edema_bilat", "hypona", "ck_high", S.bradycardia, "thyroid_ab_pos"], note: "" },
            { name: "甲状腺機能亢進症", sup: ["hx_goiter", "trab_pos", "hx_tremor_fine", "hx_weight_loss", S.tachycardia], note: "" },
            { name: "副腎不全", sup: ["hypona", "hyperk", "hx_hyperpigment", "hypoglycemia"], note: "" },
            { name: "糖尿病の悪化・高血糖", sup: ["hyperglycemia", "hba1c_dm", S.dm, "hx_weight_loss"], note: "" },
            { name: "電解質異常（Na・K・Ca・Mg）", sup: ["hypona", "hypok", "hyperca", "hypomg"], note: "" }
          ]
        },
        {
          cat: "臓器障害・感染・腫瘍",
          dds: [
            { name: "腎機能低下・尿毒症", sup: ["renal_impair", "renal_severe", "cr_high", S.ckd, "anemia"], note: "" },
            { name: "肝疾患", sup: ["transaminase_high", "alb_low", "che_low", "bil_high", S.cirrhosis], note: "" },
            { name: "心不全", sup: ["bnp_high", "hx_orthopnea", "hx_edema_bilat", "hx_jvd"], note: "" },
            { name: "慢性感染（結核・HIV・感染性心内膜炎）", sup: ["fever", "hx_weight_loss", "crp_high", "anemia", "hx_murmur_new"], note: "" },
            { name: "悪性腫瘍", sup: ["hx_weight_loss", "anemia", "alb_low", "ld_high", S.malignancy, "hx_lymph_general"], note: "" },
            { name: "膠原病（リウマチ・SLE・筋炎）", sup: ["hx_poly_sym_arthritis", "ana_pos", "ccp_pos", "ck_high", S.autoimmune], note: "" }
          ]
        },
        {
          cat: "薬剤・環境・精神",
          dds: [
            { name: "薬剤性（β遮断薬・向精神薬・ステロイド・抗がん剤）", sup: [S.newDrug, { fn: function (F, V, D, ctx) { return med(ctx, "statin") || med(ctx, "steroid"); }, t: "スタチン・ステロイド" }], note: "" },
            { name: "睡眠呼吸障害", sup: [{ fn: function (F, V, D, ctx) { return cplt(ctx, "dyspnea"); }, t: "呼吸困難を伴う" }, "polycythemia", "primary_resp_acidosis"],
              note: "日中の眠気、いびき、朝の頭痛。多血と CO₂ 貯留。" },
            { name: "うつ・不安", sup: ["hx_onset_chronic"], note: "器質的原因の検索と並行して評価する。除外診断ではない。" }
          ]
        }
      ],
      ask: ["いつから、日内変動はあるか（朝が最悪＝うつ、動くと悪化＝身体疾患）",
            "体重の変化、発熱、寝汗（B症状）",
            "労作耐容能の具体的な変化（何階まで、何メートル）",
            "薬剤の追加・増量",
            "睡眠（いびき・無呼吸・日中の眠気）と気分"],
      exam: ["結膜・爪床の蒼白、舌の所見（貧血）",
             "甲状腺、リンパ節、脾の触診",
             "皮膚（色素沈着・黄染・紫斑）",
             "心音・頸静脈・浮腫",
             "起立性の血圧変化"],
      refs: ["JCCLS", "PAYNE"]
    },

    /* ============== 黄疸 ============== */
    {
      key: "jaundice", label: "黄疸", icon: "🟡",
      frame: "黄疸は三段構えで考える。肝前（溶血・無効造血）、肝（肝細胞障害）、肝後（胆道閉塞）。間接ビリルビン優位か直接優位か、胆道系酵素が上がっているかで層が決まる。",
      killers: [
        {
          name: "急性胆管炎",
          why: "閉塞した胆道で感染が起き、菌が血中へ押し出される。黄疸＋発熱＋右上腹部痛はドレナージの適応を探す合図。",
          pointers: ["fever", S.highFever, "hx_tender_ruq", "cholestasis", "bil_high", S.hypotension,
                     "hx_consciousness_impaired", "plt_low", "crp_high"],
          tests: ["Tokyo Guidelines 2018 の診断基準と重症度", "腹部エコー／CT／MRCP",
                  "血液培養", "重症・中等症なら緊急胆道ドレナージ"],
          refs: ["TG18"]
        },
        {
          name: "急性肝不全",
          why: "肝細胞が一気に失われ、凝固能と意識が崩れる。PT-INR と意識レベルが重症度そのもの。",
          pointers: ["transaminase_veryhigh", "inr_high", "inr_veryhigh", "pt_prolonged", "nh3_high",
                     "hx_asterixis", "hx_consciousness_impaired", "hypoglycemia", "che_low"],
          tests: ["PT-INR と意識レベル（肝不全の定義そのもの）", "アンモニア・血糖・アルブミン",
                  "ウイルス・薬剤・自己免疫・虚血の原因検索", "肝移植施設への相談のタイミングを早める"],
          refs: ["WESTHAVEN", "CHILDPUGH"]
        },
        {
          name: "重度溶血（TTP・自己免疫性溶血・DIC）",
          why: "赤血球が壊れている。貧血の進行が速く、腎と中枢を同時に巻き込むことがある。",
          pointers: ["ibil_high", "ld_high", "anemia", "anemia_severe", "retic_high", "plt_low", "cr_high", "fdp_veryhigh"],
          tests: ["間接ビリルビン・LD・ハプトグロビン・網赤血球", "塗抹（破砕赤血球・球状赤血球）",
                  "直接クームス試験", "TTP を疑えば ADAMTS13 と血漿交換"],
          refs: []
        }
      ],
      redflags: [
        "fever", "hx_consciousness_impaired", "hx_asterixis", "inr_veryhigh", "inr_high",
        "transaminase_veryhigh", "hypoglycemia", S.hypotension, "plt_low", "renal_impair",
        "hx_tender_ruq", "hx_ascites"
      ],
      groups: [
        {
          cat: "肝前性（間接ビリルビン優位）",
          dds: [
            { name: "溶血性貧血", sup: ["ibil_high", "ld_high", "anemia", "retic_high", "plt_low"], note: "ハプトグロビン低下と網赤血球増加。" },
            { name: "体質性黄疸（Gilbert）", sup: ["ibil_high"], note: "肝酵素も胆道系酵素も正常で、総ビリルビンのみ軽度上昇。" }
          ]
        },
        {
          cat: "肝性",
          dds: [
            { name: "ウイルス性肝炎", sup: ["transaminase_veryhigh", "transaminase_high", "bil_high"], note: "AST/ALT が数百〜数千。" },
            { name: "薬剤性肝障害", sup: [S.newDrug, "transaminase_high", "cholestasis", "eosinophilia"], note: "被疑薬の開始からの期間を並べる。" },
            { name: "アルコール性肝障害", sup: ["ggt_high", "transaminase_high", "macrocytic", "plt_low"], note: "AST 優位、γ-GT 上昇、MCV 上昇。" },
            { name: "肝硬変の非代償化", sup: [S.cirrhosis, "alb_low", "che_low", "plt_low", "hx_ascites", "hx_spider_angioma", "inr_high"],
              note: "Child-Pugh と MELD-Na で重症度を記録する。" },
            { name: "自己免疫性肝疾患", sup: ["ana_pos", "ama_pos", "aih_ab_pos", "igg4_high", "cholestasis"], note: "" },
            { name: "虚血性肝障害（ショック肝）", sup: ["transaminase_veryhigh", "ld_high", S.hypotension, "lactate_high"], note: "循環が戻れば急速に下がる。" }
          ]
        },
        {
          cat: "肝後性（胆道閉塞）",
          dds: [
            { name: "胆管結石・胆管炎", sup: ["hx_tender_ruq", "fever", "cholestasis", "bil_high", "hx_murphy"], note: "" },
            { name: "膵頭部・胆道の悪性腫瘍", sup: ["cholestasis", "bil_high", "hx_weight_loss", "hx_stool_pale", S.malignancy],
              note: "痛みのない黄疸＋灰白色便＋体重減少。" },
            { name: "原発性胆道疾患（PBC・PSC）", sup: ["cholestasis", "alp_high", "ama_pos", "igg4_high"], note: "" }
          ]
        }
      ],
      ask: ["黄疸に気づいた時期と、尿・便の色の変化（濃い尿・灰白色便＝閉塞）",
            "痛みの有無（無痛性黄疸は腫瘍を疑う）と発熱",
            "飲酒量、サプリメント・健康食品を含む全ての内服",
            "輸血・刺青・針刺し・性交渉歴（肝炎）",
            "体重減少と家族歴"],
      exam: ["眼球結膜と皮膚の黄染の程度",
             "右上腹部の圧痛と Murphy 徴候、胆嚢の触知（Courvoisier）",
             "肝脾の大きさ、腹水、クモ状血管腫・手掌紅斑・腹壁静脈",
             "羽ばたき振戦と意識レベル（肝不全の評価）"],
      refs: ["TG18", "CHILDPUGH", "MELDNA", "WESTHAVEN"]
    },

    /* ============== 皮疹 ============== */
    {
      key: "rash", label: "皮疹", icon: "🩹",
      frame: "皮疹は「全身状態が悪いか」「粘膜をやられているか」「紫斑が触知できるか」の三点で緊急度が決まる。皮膚は全身疾患の窓である。",
      killers: [
        {
          name: "アナフィラキシー",
          why: "皮膚症状＋呼吸・循環・消化器のいずれかが同時に来る。アドレナリン筋注の遅れが死因になる。",
          pointers: ["hx_rash_diffuse", S.newDrug, "hx_wheeze", S.hypotension, S.tachycardia,
                     { fn: function (F, V, D, ctx) { return cplt(ctx, "dyspnea") || cplt(ctx, "vomiting"); }, t: "呼吸困難・嘔吐を伴う" }],
          tests: ["アドレナリン 0.3〜0.5mg 大腿前外側に筋注", "仰臥位（立たせない）", "WAO の診断基準で確認", "遅発反応に備えて経過観察"],
          refs: ["ANAPHYLAXIS"]
        },
        {
          name: "重症薬疹（SJS／TEN・DIHS/DRESS）",
          why: "粘膜疹と水疱、あるいは高熱・肝障害・好酸球増加を伴う。原因薬の中止が遅れるほど皮膚が剥がれる。",
          pointers: ["hx_blister_mucosa", S.newDrug, S.highFever, "transaminase_high", "eosinophilia",
                     "hx_lymph_general", "atypical_lymph"],
          tests: ["被疑薬を全て並べ、開始時期と皮疹の時間関係を描く", "粘膜（口腔・眼・外陰）の確認と Nikolsky 現象",
                  "肝腎機能・血算・好酸球", "RegiSCAR の枠組みで整理し、皮膚科へ"],
          refs: ["REGISCAR"]
        },
        {
          name: "髄膜炎菌感染症・電撃性紫斑",
          why: "点状出血から紫斑が広がり、数時間でDICとショックに至る。発熱＋点状出血は抗菌薬を待たせない所見。",
          pointers: ["hx_petechiae", "fever", S.highFever, "hx_neck_stiff", "plt_low", "dic_jaam",
                     S.hypotension, "lactate_high"],
          tests: ["血液培養を取り、直ちに抗菌薬", "髄液検査（遅らせない範囲で）", "凝固とDICの評価"],
          refs: ["MENINGITIS", "JAAM_DIC"]
        },
        {
          name: "壊死性軟部組織感染",
          why: "皮膚所見より痛みが強く、境界が時間単位で進む。外科的デブリドマンだけが治療。",
          pointers: ["hx_rash_diffuse", "fever", "crp_veryhigh", "ck_veryhigh", S.dm, S.hypotension, "lactate_high"],
          tests: ["皮膚所見の境界をマークして時間ごとに比較", "CK・CRP・乳酸・血液培養",
                  "画像でガス・筋膜液体", "外科へ即連絡"],
          refs: []
        }
      ],
      redflags: [
        "hx_blister_mucosa", "hx_petechiae", "hx_purpura_palpable", S.highFever, S.hypotension,
        "hx_wheeze", S.newDrug, "plt_low", "transaminase_high", "crp_veryhigh",
        "hx_consciousness_impaired", "dic_jaam"
      ],
      groups: [
        {
          cat: "緊急度の高い形",
          dds: [
            { name: "紫斑（触知可能）＝血管炎", sup: ["hx_purpura_palpable", "mpo_pos", "pr3_pos", "crp_high", "cr_high"],
              note: "IgA 血管炎・ANCA 関連血管炎・クリオグロブリン。腎と肺を必ず見る。" },
            { name: "紫斑（平坦）＝血小板・凝固の異常", sup: ["hx_purpura_flat", "hx_petechiae", "plt_low", "plt_verylow", "dic_jaam"], note: "" },
            { name: "水疱・粘膜疹＝重症薬疹・自己免疫性水疱症", sup: ["hx_blister_mucosa", S.newDrug, "pemphigus_pos", "bp180_pos"], note: "" },
            { name: "びまん性紅斑＋低血圧＝毒素性ショック・アナフィラキシー", sup: ["hx_rash_diffuse", S.hypotension, S.highFever, S.tachycardia], note: "" }
          ]
        },
        {
          cat: "感染",
          dds: [
            { name: "ウイルス性発疹症", sup: ["hx_rash_diffuse", "fever", "atypical_lymph", "lymphopenia"], note: "" },
            { name: "蜂窩巣炎・erysipelas", sup: ["hx_edema_unilat", "fever", "crp_high", S.dm], note: "" },
            { name: "帯状疱疹", sup: ["hx_blister_mucosa", "hx_sens_dermatome"], note: "デルマトームに沿う。汎発化は免疫抑制を示唆。" },
            { name: "梅毒・HIV の皮疹", sup: ["hx_rash_diffuse", "hx_lymph_general"], note: "手掌足底の皮疹は梅毒を疑う契機。" }
          ]
        },
        {
          cat: "膠原病・薬剤・その他",
          dds: [
            { name: "SLE", sup: ["hx_malar_rash", "ana_pos", "ana_high", "dsdna_pos", "complement_low", "hx_poly_sym_arthritis", "hx_oral_ulcer"],
              note: "EULAR/ACR 2019 の分類基準で整理する。" },
            { name: "皮膚筋炎", sup: ["hx_rash_diffuse", "ck_high", "ck_veryhigh", "jo1_pos", "mda5_pos", "tif1g_pos"],
              note: "Gottron 徴候・ヘリオトロープ疹。悪性腫瘍と間質性肺炎を同時に探す。" },
            { name: "全身性強皮症", sup: ["hx_skin_sclerosis", "hx_raynaud", "scl70_pos", "cent_pos", "rnapol3_pos"], note: "" },
            { name: "薬剤性発疹（軽症）", sup: [S.newDrug, "hx_rash_diffuse", "eosinophilia"], note: "粘膜・全身症状・肝障害がなければ軽症。ただし経過を追う。" },
            { name: "乾癬・湿疹・蕁麻疹", sup: ["hx_recurrent", "hx_onset_chronic", "hx_pustular"], note: "" }
          ]
        }
      ],
      ask: ["皮疹が出た順序（どこから広がったか）と、発熱との前後関係",
            "この4週間に始めた全ての薬（市販薬・サプリ・漢方を含む）",
            "粘膜（口・眼・外陰）の症状、痛み・灼熱感",
            "関節痛・脱毛・口腔内潰瘍・Raynaud（膠原病の手がかり）",
            "動物・植物・食物・虫刺され、旅行歴"],
      exam: ["全身の皮膚と粘膜を見る（頭皮・手掌足底・爪・外陰も）",
             "紫斑が触知できるかどうかを指で確かめる",
             "Nikolsky 現象と皮膚剥離の面積",
             "リンパ節と肝脾、関節",
             "バイタル（血圧・呼吸・体温）— 皮疹の緊急度は全身状態で決まる"],
      refs: ["ANAPHYLAXIS", "REGISCAR", "SLE2019", "SSC2013"]
    },

    /* ============== 関節痛 ============== */
    {
      key: "joint_pain", label: "関節痛", icon: "🦴",
      frame: "関節痛は「単関節か多関節か」「炎症性か非炎症性か」「対称性か」で地図が描ける。単関節の熱感は、まず化膿性関節炎を外す。",
      killers: [
        {
          name: "化膿性関節炎",
          why: "関節内で菌が増えると数日で軟骨が破壊される。穿刺しなければ診断できない。",
          pointers: ["hx_mono_arthritis", "fever", S.highFever, "crp_high", "crp_veryhigh", "wbc_high",
                     S.dm, S.immunosupp, { fn: function (F, V, D, ctx) { return hist(ctx, "autoimmune"); }, t: "関節疾患・人工関節" }],
          tests: ["関節穿刺（細胞数・結晶・グラム染色・培養）を最優先で",
                  "血液培養2セット", "抗菌薬は穿刺後に（ただし全身状態が悪ければ待たない）", "ドレナージ・洗浄の判断"],
          refs: []
        },
        {
          name: "結晶性関節炎（痛風・偽痛風）の重症発作",
          why: "化膿性と見分けがつかない。穿刺液の結晶で分かれるが、両者は併存しうる。",
          pointers: ["hx_mono_arthritis", "ua_high", "fever", "crp_high", { fn: function (F, V, D, ctx) { return med(ctx, "diuretic_loop") || med(ctx, "diuretic_thiazide"); }, t: "利尿薬の使用" }, S.ckd],
          tests: ["関節液の偏光顕微鏡（尿酸ナトリウム／ピロリン酸カルシウム）",
                  "ACR/EULAR 2015 の痛風分類基準で整理", "発作中の尿酸値は正常でも否定しない"],
          refs: ["GOUT2015"]
        },
        {
          name: "全身性血管炎・膠原病の臓器障害",
          why: "関節症状は入口で、腎・肺・神経が同時に侵されていることがある。",
          pointers: ["hx_poly_sym_arthritis", "mpo_pos", "pr3_pos", "ana_high", "dsdna_pos", "complement_low",
                     "cr_high", "hx_purpura_palpable", "hx_hemoptysis"],
          tests: ["尿所見（血尿・蛋白尿・円柱）を必ず見る", "胸部画像", "ANCA・ANA・補体・抗dsDNA",
                  "ACR/EULAR の分類基準で整理する"],
          refs: ["SLE2019", "RA2010"]
        }
      ],
      redflags: [
        "hx_mono_arthritis", "fever", S.highFever, "crp_veryhigh", S.immunosupp,
        "cr_high", "hx_purpura_palpable", "hx_hemoptysis", "anemia", "plt_low",
        "hx_weight_loss", "hx_uveitis"
      ],
      groups: [
        {
          cat: "単関節",
          dds: [
            { name: "化膿性関節炎", sup: ["hx_mono_arthritis", "fever", "crp_veryhigh", "wbc_high"], note: "穿刺が診断。待たない。" },
            { name: "痛風", sup: ["hx_mono_arthritis", "ua_high", "hx_recurrent", S.ckd], note: "第1中足趾節関節、夜間の急激な発症。" },
            { name: "偽痛風（CPPD）", sup: ["hx_mono_arthritis", S.elderly, "crp_high"], note: "膝・手関節。レントゲンの石灰化。" },
            { name: "外傷・変形性関節症", sup: ["hx_post_trauma", "hx_onset_chronic"], note: "炎症所見に乏しい。" }
          ]
        },
        {
          cat: "多関節・対称性",
          dds: [
            { name: "関節リウマチ", sup: ["hx_poly_sym_arthritis", "ccp_pos", "rf_pos", "mmp3_high", "crp_high", "anemia"],
              note: "手指小関節、朝のこわばり1時間以上。ACR/EULAR 2010 で分類。" },
            { name: "SLE", sup: ["hx_poly_sym_arthritis", "ana_high", "dsdna_pos", "complement_low", "hx_malar_rash", "hx_oral_ulcer", "plt_low"], note: "" },
            { name: "ウイルス性多関節炎", sup: ["hx_poly_sym_arthritis", "hx_post_infection", "hx_onset_acute"], note: "数週で自然に治まる。" },
            { name: "リウマチ性多発筋痛症", sup: [{ fn: function (F, V, D, ctx) { var a = C.num(ctx.age); return a != null && a >= 50; }, t: "50歳以上" }, "crp_high", "anemia"],
              note: "肩と股の帯状の痛み。巨細胞性動脈炎と併存する。" }
          ]
        },
        {
          cat: "多関節・非対称性／体軸",
          dds: [
            { name: "脊椎関節炎・乾癬性関節炎", sup: ["hx_poly_asym_arthritis", "hx_axial_arthritis", "hx_uveitis", "crp_high"],
              note: "炎症性背部痛（安静で悪化、運動で改善）と腱付着部炎。" },
            { name: "反応性関節炎", sup: ["hx_post_infection", "hx_poly_asym_arthritis", "hx_uveitis"], note: "尿路・腸管感染の1〜4週後。" },
            { name: "乾癬・炎症性腸疾患に伴う関節炎", sup: ["hx_axial_arthritis", "hx_stool_bloody", "hx_pustular"], note: "" }
          ]
        }
      ],
      ask: ["関節の数と分布（左右対称か、大関節か小関節か、体軸か）",
            "朝のこわばりの時間（1時間以上＝炎症性）",
            "発症の速さ（数時間＝結晶・感染、数週＝自己免疫）",
            "皮疹・眼症状・口腔内潰瘍・爪の変化・腸症状",
            "先行感染、外傷、利尿薬、新規薬剤"],
      exam: ["腫脹・熱感・圧痛・可動域制限を関節ごとに記録",
             "単関節で熱感があれば穿刺を検討する",
             "皮膚・爪・頭皮（乾癬）、眼、口腔",
             "腱付着部と仙腸関節",
             "尿所見と血圧（腎病変の確認）"],
      refs: ["RA2010", "SLE2019", "GOUT2015", "SSC2013"]
    },

    /* ============== しびれ ============== */
    {
      key: "numbness", label: "しびれ", icon: "🫱",
      frame: "しびれは分布が診断そのもの。手袋靴下型は多発神経炎、デルマトームは根、髄節レベルは脊髄、片側は脳。分布を描けば鑑別は半分終わる。",
      killers: [
        {
          name: "脊髄圧迫・馬尾症候群",
          why: "感覚レベルと膀胱直腸障害が出たら、時間単位で不可逆になる。",
          pointers: ["hx_sens_level", "hx_dtr_hyper", "hx_tender_back", S.malignancy, "fever", S.immunosupp],
          tests: ["緊急MRI（全脊髄）", "膀胱直腸機能と感覚レベルの時間記録",
                  "悪性腫瘍ならステロイド、感染なら排膿"],
          refs: []
        },
        {
          name: "脳血管障害",
          why: "片側のしびれだけで来る脳梗塞がある。突然発症で顔・上肢・下肢の組み合わせを見る。",
          pointers: ["hx_sudden_onset", "hx_sens_hemi", "hx_focal_deficit", "hx_dysarthria", S.af, S.dm],
          tests: ["頭部CT／MRI", "NIHSS", "血糖", "ABCD² で TIA 後のリスク評価"],
          refs: ["STROKE_JP", "ABCD2"]
        },
        {
          name: "ギラン・バレー症候群",
          why: "感覚異常から始まり上行性に麻痺する。呼吸筋に及ぶ前に捕まえる。",
          pointers: ["hx_post_infection", "hx_dtr_loss", "hx_progressive", "hx_sens_glove_stocking",
                     "gq1b_pos", "gm1_pos", "gt1a_pos"],
          tests: ["%肺活量の反復測定", "髄液（蛋白細胞解離）", "神経伝導検査", "抗ガングリオシド抗体"],
          refs: ["GBS_CRIT"]
        },
        {
          name: "重度の電解質異常",
          why: "低Ca・低Mg・高K・低Kは感覚異常と筋症状で現れる。測れば分かるものを見落とさない。",
          pointers: ["hypoca", "hypoca_severe", "hypomg", "hypok_severe", "hyperk_severe", "metabolic_alkalosis"],
          tests: ["Ca（補正）・Mg・K・P・血液ガス", "心電図", "補正の速度に注意"],
          refs: ["PAYNE"]
        }
      ],
      redflags: [
        "hx_sens_level", "hx_dtr_loss", "hx_progressive", "hx_sudden_onset", "hx_focal_deficit",
        "fever", S.malignancy, "hypoca_severe", "hyperk_severe", "hx_tender_back", S.immunosupp
      ],
      groups: [
        {
          cat: "分布から（最初に描く）",
          dds: [
            { name: "多発神経炎（手袋・靴下型）", sup: ["hx_sens_glove_stocking", "hx_dtr_loss", S.dm, "hx_onset_chronic", "macrocytic"],
              note: "糖尿病・ビタミンB12欠乏・アルコール・薬剤・腎不全・甲状腺。" },
            { name: "単一の根（デルマトーム）", sup: ["hx_sens_dermatome", "hx_tender_back"], note: "頸椎・腰椎の神経根症。皮疹があれば帯状疱疹。" },
            { name: "髄節レベルあり（脊髄）", sup: ["hx_sens_level", "hx_dtr_hyper"], note: "緊急MRI。" },
            { name: "片側（脳）", sup: ["hx_sens_hemi", "hx_sudden_onset", "hx_focal_deficit"], note: "" },
            { name: "単一の末梢神経（手関節・肘・腓骨頭）", sup: ["hx_recurrent", "hx_onset_chronic"], note: "手根管・肘部管・腓骨神経麻痺。圧迫の部位を探す。" }
          ]
        },
        {
          cat: "代謝・栄養・薬剤",
          dds: [
            { name: "糖尿病性多発神経炎", sup: [S.dm, "hba1c_dm", "hx_sens_glove_stocking", "hyperglycemia"], note: "" },
            { name: "ビタミンB12・葉酸欠乏", sup: ["macrocytic", "anemia", "hx_dtr_hyper", "hx_sens_glove_stocking"],
              note: "大細胞性貧血＋後索症状。MCV が上がる前に神経症状が出ることもある。" },
            { name: "尿毒症・甲状腺機能低下", sup: ["renal_severe", S.ckd, "thyroid_ab_pos", "ck_high"], note: "" },
            { name: "薬剤性（抗がん剤・抗結核薬・フェニトイン）", sup: [S.newDrug, { fn: function (F, V, D, ctx) { return med(ctx, "chemo") || med(ctx, "phenytoin"); }, t: "抗がん剤・フェニトイン" }], note: "" },
            { name: "アルコール性", sup: ["macrocytic", "ggt_high", "hypomg"], note: "" }
          ]
        },
        {
          cat: "自己免疫・その他",
          dds: [
            { name: "ギラン・バレー／CIDP", sup: ["hx_dtr_loss", "hx_post_infection", "gq1b_pos", "gm1_pos", "hx_progressive"], note: "" },
            { name: "血管炎性ニューロパチー", sup: ["mpo_pos", "pr3_pos", "eosinophilia", "hx_purpura_palpable", "crp_high"],
              note: "多発性の非対称な神経障害（mononeuritis multiplex）。" },
            { name: "多発性硬化症・脊髄炎", sup: ["hx_sens_level", "hx_recurrent", "aqp4_pos", "mog_pos"], note: "" },
            { name: "過換気による四肢・口囲のしびれ", sup: ["primary_resp_alkalosis", "hx_recurrent", "metabolic_alkalosis"],
              note: "両手と口のまわり。器質的原因を外してから。" }
          ]
        }
      ],
      ask: ["しびれの範囲を患者自身に描いてもらう（分布が診断の中心）",
            "発症の速さと広がり方（下から上がってきたか）",
            "排尿・排便の障害、歩行の変化",
            "先行感染・ワクチン、外傷、同じ姿勢の持続",
            "糖尿病・腎機能・飲酒・胃手術（B12）・新規薬剤"],
      exam: ["感覚（触覚・痛覚・振動覚・位置覚）の分布を記録する",
             "腱反射と病的反射（中枢か末梢か）",
             "筋力と筋萎縮、Tinel・Phalen",
             "歩行と Romberg",
             "血糖・Ca・Mg・B12・甲状腺の実測"],
      refs: ["GBS_CRIT", "STROKE_JP", "PAYNE"]
    }
  ];

  /* ---------- 評価 ---------- */

  function buildKiller(k, F, V, D, ctx) {
    var lit = [], all = [];
    (k.pointers || []).forEach(function (s) {
      var t = sigText(s), on = sigOn(s, F, V, D, ctx);
      all.push({ t: t, on: on });
      if (on) lit.push(t);
    });
    return {
      name: k.name, why: k.why, tests: k.tests || [], refs: k.refs || [],
      pointers: all, lit: lit, litCount: lit.length, total: all.length
    };
  }

  function buildDd(dd, F, V, D, ctx) {
    var hits = [], total = 0;
    (dd.sup || []).forEach(function (s) {
      total++;
      if (sigOn(s, F, V, D, ctx)) hits.push(sigText(s));
    });
    return { name: dd.name, note: dd.note || "", hits: hits, hitCount: hits.length, total: total };
  }

  function buildCard(c, F, V, D, ctx) {
    var killers = (c.killers || []).map(function (k) { return buildKiller(k, F, V, D, ctx); });
    killers.sort(function (a, b) { return b.litCount - a.litCount; });

    var redflags = (c.redflags || []).map(function (s) {
      return { t: sigText(s), on: sigOn(s, F, V, D, ctx) };
    });
    var lit = redflags.filter(function (r) { return r.on; });

    var groups = (c.groups || []).map(function (g) {
      var dds = (g.dds || []).map(function (dd) { return buildDd(dd, F, V, D, ctx); });
      dds.sort(function (a, b) { return b.hitCount - a.hitCount; });
      return { cat: g.cat, dds: dds, hitCount: dds.reduce(function (n, d) { return n + d.hitCount; }, 0) };
    });

    return {
      key: c.key, label: c.label, icon: c.icon, frame: c.frame,
      killers: killers, redflags: redflags, litFlags: lit,
      groups: groups, ask: c.ask || [], exam: c.exam || [], refs: c.refs || []
    };
  }

  /**
   * 患者背景で選ばれた主訴について、主訴別のアプローチを返す。
   * 選ばれていない主訴は返さない（画面を埋めないため）。
   */
  function assess(F, V, D, ctx) {
    var sel = (ctx && ctx.complaints) || [];
    if (!sel.length) return [];
    return CC.filter(function (c) { return sel.indexOf(c.key) >= 0; })
             .map(function (c) { return buildCard(c, F, V, D, ctx); });
  }

  /** 主訴カードを用意している主訴キーの一覧（未対応の主訴を画面で伝えるため） */
  function covered() { return CC.map(function (c) { return c.key; }); }

  return { assess: assess, covered: covered, list: CC, sigText: sigText, LAB_LABEL: LAB_LABEL };
})();
