/*! dx-core.js — 鑑別診断エンジン
 *  所見フラグの集合から鑑別候補を順位づけし、支持所見・否定所見・次の検査・出典を示す。
 *  ⚠ 出力は「所見との合致度」であり疾患の確率ではない。事前確率は臨床医が与える。
 */
var DXCore = (function () {
  "use strict";
  var C = LabsCore;

  /** 支持/否定所見の定義。w は重み（1=弱い手がかり、3=強い手がかり）。 */
  function s(flag, label, w) { return { flag: flag, label: label, w: w == null ? 2 : w }; }

  var DDX = [
    /* ---------- 感染症 ---------- */
    { id: "sepsis", name: "敗血症／敗血症性ショック", cat: "感染症", refs: ["SEPSIS3", "SOFA"],
      trigger: ["crp_veryhigh", "pct_high", "lactate_high", "fever", "wbc_veryhigh", "neutropenia_severe"],
      supports: [s("pct_high", "プロカルシトニン高値", 3), s("lactate_critical", "乳酸 ≧4 mmol/L", 3),
                 s("crp_veryhigh", "CRP 高度上昇", 2), s("fever", "発熱", 2), s("wbc_veryhigh", "白血球著増", 2),
                 s("wbc_low", "白血球減少（重症のサイン）", 2), s("plt_low", "血小板減少", 2),
                 s("renal_impair", "腎機能低下", 1), s("bil_high", "黄疸", 1), s("dic_jaam", "DIC 基準該当", 3),
                 s("relative_hypoventilation", "代償性過換気の破綻（切迫する呼吸筋疲労）", 2)],
      opposes: [s("ddimer_negative", "D-ダイマー陰性（他疾患の可能性）", 1)],
      next: ["血液培養2セット（抗菌薬投与前）", "感染巣の画像評価", "乳酸の再検（2〜4時間後）", "qSOFA／SOFA の算出"],
      pearl: "白血球は「増える」より「減る」方が重症です。高齢者では発熱しないことも多く、体温正常は敗血症を否定しません。" },

    { id: "fn", name: "発熱性好中球減少症", cat: "感染症", refs: [],
      trigger: ["neutropenia_severe"],
      supports: [s("neutropenia_severe", "好中球絶対数 <500/µL", 3), s("fever", "発熱", 3),
                 s("anemia", "貧血", 1), s("plt_low", "血小板減少", 1)],
      opposes: [],
      next: ["血液培養2セット（カテーテルがあれば両側から）", "1時間以内の広域抗菌薬", "全身の感染源検索"],
      pearl: "好中球がいないため膿も発赤も出ません。局所所見の乏しさは「感染がない」ことを意味しません。" },

    /* ---------- 循環器 ---------- */
    { id: "acs", name: "急性冠症候群", cat: "循環器", refs: [],
      trigger: ["troponin_high"],
      supports: [s("troponin_high", "トロポニン上昇", 3), s("ck_high", "CK 上昇", 1),
                 s("bnp_high", "BNP 上昇", 1)],
      opposes: [s("renal_severe", "高度腎機能低下（トロポニン偽陽性の要因）", 2),
                s("pct_high", "明らかな感染（2型心筋傷害の可能性）", 1)],
      next: ["12誘導心電図（経時的に反復）", "トロポニンの経時変化（上昇・下降パターン）", "心エコーで壁運動評価"],
      pearl: "トロポニン上昇は「心筋が傷んだ」という事実にすぎません。冠動脈閉塞か、需給不均衡（2型）か、心筋炎・肺塞栓・腎不全かは経時変化と文脈で決まります。" },

    { id: "hf", name: "心不全", cat: "循環器", refs: [],
      trigger: ["bnp_high"],
      supports: [s("bnp_high", "BNP／NT-proBNP 上昇", 3), s("hypona", "低Na血症（希釈性）", 1),
                 s("renal_impair", "腎機能低下（心腎連関）", 1), s("transaminase_high", "肝うっ血", 1),
                 s("resp_failure", "低酸素血症", 1)],
      opposes: [],
      next: ["心エコー（左室駆出率・弁膜症・下大静脈径）", "胸部X線", "体重推移と水分出納"],
      pearl: "BNP は腎機能低下・高齢・心房細動でも上がり、肥満では低く出ます。数値だけでなく体重と浮腫の推移で読んでください。" },

    { id: "pe", name: "肺血栓塞栓症", cat: "循環器", refs: ["WELLS_PE", "SPESI"],
      trigger: ["ddimer_veryhigh", "primary_resp_alkalosis"],
      supports: [s("ddimer_veryhigh", "D-ダイマー著増", 3), s("aado2_high", "A-aDO₂ 開大", 2),
                 s("primary_resp_alkalosis", "一次性の呼吸性アルカローシス", 2), s("resp_failure", "低酸素血症", 2),
                 s("troponin_high", "トロポニン上昇（右心負荷）", 2), s("bnp_high", "BNP 上昇（右心負荷）", 1)],
      opposes: [s("ddimer_negative", "D-ダイマー陰性", 3),
                s("metabolic_acidosis", "代謝性アシドーシス（過換気は代償の可能性）", 2)],
      next: ["Wells スコアで事前確率を評価", "造影CT 肺動脈撮影", "下肢静脈エコー", "心エコーで右心負荷"],
      pearl: "肺塞栓の初期は SpO₂ が保たれることがあります。頻呼吸と A-aDO₂ 開大の方が鋭敏です。" },

    /* ---------- 呼吸器 ---------- */
    { id: "ards", name: "急性呼吸窮迫症候群（ARDS）", cat: "呼吸器", refs: ["BERLIN"],
      trigger: ["ards_range"],
      supports: [s("ards_range", "P/F 比 ≦300", 3), s("aado2_high", "A-aDO₂ 開大", 2),
                 s("crp_veryhigh", "強い炎症", 1), s("pct_high", "感染の存在", 1)],
      opposes: [s("bnp_high", "BNP 高値（心原性肺水腫の可能性）", 2)],
      next: ["胸部X線／CT で両側性陰影", "心エコーで心原性肺水腫を除外", "PEEP 設定と肺保護換気の確認"],
      pearl: "ベルリン定義は「心不全・溢水では説明できない」ことを要求します。P/F 比だけでは ARDS と言えません。" },

    { id: "copd_exac", name: "慢性II型呼吸不全の急性増悪", cat: "呼吸器", refs: [],
      trigger: ["respiratory_acidosis"],
      supports: [s("respiratory_acidosis", "PaCO₂ 上昇（実測）", 3), s("resp_failure", "低酸素血症", 2),
                 s("metabolic_alkalosis", "慢性代償による HCO₃⁻ 高値", 2),
                 s("compensation_inadequate", "代償の破綻（急性の上乗せ）", 2)],
      opposes: [],
      next: ["ベースラインの血液ガスと比較", "胸部X線で肺炎・気胸の除外", "NPPV の適応評価"],
      pearl: "慢性代償のある患者で pH が落ちていれば、それは「急性の上乗せ」です。PaCO₂ の絶対値ではなく pH の変化を見ます。" },

    /* ---------- 腎・電解質 ---------- */
    { id: "aki", name: "急性腎障害", cat: "腎・電解質", refs: ["KDIGO_AKI"],
      trigger: ["renal_severe", "cr_high"],
      supports: [s("renal_severe", "eGFR <30", 3), s("hyperk", "高K血症", 2), s("ag_high", "AG 開大", 1),
                 s("metabolic_acidosis", "代謝性アシドーシス", 2), s("hyperp", "高P血症", 1),
                 s("buncr_high", "BUN/Cr 比 >20（腎前性を示唆）", 1)],
      opposes: [],
      next: ["過去の Cr と比較（急性か慢性か）", "尿量測定・尿所見", "膀胱エコーで尿閉の除外", "腎毒性薬剤の中止"],
      pearl: "AKI の診断は Cr の「値」ではなく「変化」で決まります。ベースラインが分からないなら、それを探すのが最初の一手です。" },

    { id: "siadh", name: "SIADH", cat: "腎・電解質", refs: [],
      trigger: ["hypona_mod"],
      supports: [s("hypona_mod", "中等度以上の低Na血症", 3), s("uosm_high", "尿浸透圧 >300", 3),
                 s("una_high", "尿中Na ≧30", 2), s("ua_high", "尿酸は低値のことが多い（高値なら否定的）", 0)],
      opposes: [s("hyperna", "高Na血症", 3), s("buncr_high", "脱水所見（体液量減少を示唆）", 2)],
      next: ["体液量の評価（体重・水分出納・ツルゴール・CVP）", "甲状腺機能・副腎機能の確認", "被疑薬の確認"],
      pearl: "SIADH は除外診断です。甲状腺機能低下症と副腎不全を外さないと診断してはいけません。" },

    { id: "csws", name: "中枢性塩類喪失症候群（CSWS）", cat: "腎・電解質", refs: [],
      trigger: ["hypona_mod"],
      supports: [s("hypona_mod", "中等度以上の低Na血症", 3), s("una_high", "尿中Na 高値", 3),
                 s("buncr_high", "BUN/Cr 比 >20（体液量減少）", 3), s("uosm_high", "尿浸透圧 高値", 1)],
      opposes: [],
      next: ["体液量の評価が決定的（体重減少・多尿・CVP 低下があれば CSWS 寄り）", "中枢神経病変の確認"],
      pearl: "SIADH と検査値が同じで治療が正反対です。分けるのは検査値ではなく体液量。看護記録の体重と尿量が診断を決めます。" },

    { id: "di", name: "尿崩症", cat: "腎・電解質", refs: [],
      trigger: ["hyperna"],
      supports: [s("hyperna", "高Na血症", 3), s("uosm_low", "尿浸透圧 低値", 3)],
      opposes: [s("hypona", "低Na血症", 3)],
      next: ["時間尿量の測定", "血漿・尿浸透圧の同時測定", "デスモプレシン負荷試験の検討", "下垂体・視床下部の画像"],
      pearl: "高Naで薄い尿が大量に出ていれば尿崩症です。下垂体術後は数時間で進むので、尿量を時間単位で追います。" },

    { id: "rta", name: "尿細管性アシドーシス", cat: "腎・電解質", refs: ["UAG"],
      trigger: ["hyperchloremic"],
      supports: [s("hyperchloremic", "AG正常（高Cl性）代謝性アシドーシス", 3),
                 s("uag_positive", "尿AG 陽性", 3), s("hypok", "低K血症（1型）", 1), s("hyperk", "高K血症（4型）", 1)],
      opposes: [s("uag_negative", "尿AG 陰性（腎外性喪失）", 3), s("ag_high", "AG 開大", 2)],
      next: ["尿pH の測定", "尿AG の算出", "基礎疾患（シェーグレン症候群・糖尿病・薬剤）の検索"],
      pearl: "AG 正常の代謝性アシドーシスを見たら、まず下痢か腎かを尿AGで分けます。ここを飛ばすと迷子になります。" },

    /* ---------- 内分泌・代謝 ---------- */
    { id: "dka", name: "糖尿病性ケトアシドーシス", cat: "内分泌代謝", refs: ["GOLDMARK"],
      trigger: ["hyperglycemia_severe"],
      supports: [s("hyperglycemia_severe", "著明な高血糖", 3), s("ag_high", "AG 開大", 3),
                 s("metabolic_acidosis", "代謝性アシドーシス", 3), s("hba1c_dm", "HbA1c 糖尿病域", 1),
                 s("hypona", "低Na血症（偽性）", 1), s("hyperk", "見かけのK上昇", 1)],
      opposes: [s("hypoglycemia", "低血糖", 3)],
      next: ["血中／尿中ケトン体", "動脈血液ガス", "K の頻回測定（治療で急落する）", "誘因（感染・インスリン中断）の検索"],
      pearl: "来院時のKが正常でも体内総Kは枯渇しています。インスリンを入れた瞬間からKは落ちます。" },

    { id: "hhs", name: "高浸透圧高血糖状態", cat: "内分泌代謝", refs: [],
      trigger: ["hyperglycemia_extreme"],
      supports: [s("hyperglycemia_extreme", "血糖 >600 mg/dL", 3), s("hyperna", "高Na血症", 2),
                 s("buncr_high", "著明な脱水", 2)],
      opposes: [s("ag_high", "AG 開大（DKA を示唆）", 2)],
      next: ["血清浸透圧の測定", "意識レベルの評価", "ケトン体（DKA との鑑別）"],
      pearl: "DKA より死亡率が高い病態です。高齢で脱水が強く、意識障害で発見されます。" },

    { id: "storm", name: "甲状腺クリーゼ", cat: "内分泌代謝", refs: ["BURCH", "JTA_STORM"],
      trigger: ["trab_pos"],
      supports: [s("trab_pos", "TRAb 陽性", 3), s("fever", "発熱", 2), s("transaminase_high", "肝障害", 1),
                 s("thyroid_ab_pos", "甲状腺自己抗体陽性", 1)],
      opposes: [],
      next: ["FT3・FT4・TSH の緊急測定", "Burch-Wartofsky スコアの算出", "誘因（感染・手術・ヨード造影剤・薬剤中断）の検索"],
      pearl: "発熱・頻脈・意識障害の三つ揃いを敗血症と決めつける前に、甲状腺を一度は考えてください。治療がまったく違います。" },

    { id: "adrenal", name: "副腎不全（副腎クリーゼ）", cat: "内分泌代謝", refs: [],
      trigger: ["hypona", "hyperk", "hypoglycemia", "eosinophilia"], minTrigger: 2,
      supports: [s("hypona", "低Na血症", 3), s("hyperk", "高K血症", 3), s("hypoglycemia", "低血糖", 2),
                 s("eosinophilia", "好酸球増多", 2), s("adrenal_pos", "抗副腎皮質抗体陽性", 3),
                 s("hyperca", "高Ca血症", 1)],
      opposes: [],
      next: ["血中コルチゾール・ACTH（治療開始前の採血）", "迅速ACTH負荷試験", "ステロイド中断歴の確認"],
      pearl: "「低Na＋高K＋低血糖＋好酸球増多」は副腎不全の指紋です。ステロイドを長期内服していた患者の急な中断が典型的な引き金。" },

    { id: "tls", name: "腫瘍崩壊症候群", cat: "内分泌代謝", refs: [],
      trigger: ["hyperk", "hyperp", "ua_high"], minTrigger: 3,
      supports: [s("hyperk", "高K血症", 3), s("hyperp", "高P血症", 3), s("ua_high", "高尿酸血症", 3),
                 s("hypoca", "低Ca血症", 2), s("renal_impair", "腎機能低下", 2), s("ld_high", "LD 上昇", 2),
                 s("blasts", "芽球出現", 2)],
      opposes: [],
      next: ["心電図モニター", "K・P・Ca・尿酸・Cr の頻回測定", "大量輸液とラスブリカーゼの適応"],
      pearl: "横紋筋融解症がまったく同じ電解質パターンを作ります。背景（化学療法か、長時間臥床か）で分けてください。" },

    /* ---------- 肝・消化器 ---------- */
    { id: "cirrhosis", name: "肝硬変・肝不全", cat: "肝・消化器", refs: ["CHILDPUGH", "MELD"],
      trigger: ["che_low", "pt_prolonged", "nh3_high"],
      supports: [s("alb_verylow", "アルブミン <3.0", 3), s("che_low", "ChE 低下", 3),
                 s("pt_prolonged", "PT 延長", 3), s("plt_low", "血小板減少（脾機能亢進）", 2),
                 s("nh3_high", "アンモニア上昇", 2), s("bil_high", "黄疸", 2), s("hypona", "低Na血症", 1)],
      opposes: [],
      next: ["Child-Pugh／MELD-Na の算出", "腹部エコー・上部内視鏡（静脈瘤）", "肝炎ウイルス・自己抗体"],
      pearl: "肝硬変は DIC の診断基準を満たしやすい病態です。凝固異常を見たら、まず肝を疑ってから DIC を考えます。" },

    { id: "cholangitis", name: "急性胆管炎", cat: "肝・消化器", refs: [],
      trigger: ["cholestasis"],
      supports: [s("cholestasis", "胆汁うっ滞（ALP・γ-GT 上昇）", 3), s("bil_high", "黄疸", 3),
                 s("fever", "発熱", 3), s("crp_veryhigh", "強い炎症", 2), s("pct_high", "PCT 高値", 2)],
      opposes: [],
      next: ["腹部エコー・MRCP／CT", "血液培養", "緊急胆道ドレナージの適応評価"],
      pearl: "Charcot 三徴に意識障害とショックが加われば Reynolds 五徴。閉鎖腔の感染なので、抗菌薬だけでは治りません。" },

    { id: "gib", name: "上部消化管出血", cat: "肝・消化器", refs: ["GBS"],
      trigger: ["buncr_high", "anemia"], minTrigger: 2,
      supports: [s("buncr_high", "BUN/Cr 比 >20", 3), s("anemia", "貧血", 3),
                 s("anemia_severe", "高度貧血", 2), s("microcytic", "小球性（慢性出血）", 1)],
      opposes: [s("renal_severe", "高度腎機能低下（BUN 上昇の別要因）", 2)],
      next: ["Glasgow-Blatchford スコア", "黒色便・吐血の確認", "上部内視鏡", "抗血栓薬の確認"],
      pearl: "腸に出た血は「高蛋白食」です。BUN だけが上がり Cr は上がらない——この乖離が手がかりになります。" },

    { id: "pancreatitis", name: "急性膵炎", cat: "肝・消化器", refs: ["JSS_AP"],
      trigger: ["amy_veryhigh"],
      supports: [s("amy_veryhigh", "アミラーゼ 基準上限3倍以上", 3), s("lip_veryhigh", "リパーゼ著増", 3),
                 s("hypoca", "低Ca血症（重症化のサイン）", 2), s("crp_veryhigh", "CRP 高度上昇", 2),
                 s("renal_impair", "腎機能低下", 1)],
      opposes: [],
      next: ["造影CT（Grade 判定）", "重症度判定（予後因子9項目）", "原因検索（胆石・アルコール・高TG）"],
      pearl: "アミラーゼの高さと重症度は相関しません。重症度を決めるのは臓器障害です。" },

    /* ---------- 血液 ---------- */
    { id: "dic", name: "播種性血管内凝固症候群", cat: "血液", refs: ["JAAM_DIC", "ISTH_DIC"],
      trigger: ["dic_jaam", "fdp_veryhigh"],
      supports: [s("dic_jaam", "急性期DIC 基準該当", 3), s("plt_low", "血小板減少", 3),
                 s("fdp_veryhigh", "FDP 著増", 3), s("fib_low", "フィブリノゲン低下", 2),
                 s("pt_prolonged", "PT 延長", 2), s("at3_low", "AT-III 低下", 2), s("tat_high", "TAT 上昇", 2)],
      opposes: [s("che_low", "ChE 低下（肝疾患による類似所見）", 2)],
      next: ["基礎疾患の特定（感染・外傷・悪性腫瘍・産科）", "凝固系の経時的再検", "ISTH スコアとの併用"],
      pearl: "DIC は病名ではなく「結果」です。基礎疾患を治さないかぎり凝固だけ追っても治りません。" },

    { id: "tma", name: "血栓性微小血管症（TTP／HUS）", cat: "血液", refs: [],
      trigger: ["anemia", "plt_low", "ld_high"], minTrigger: 3,
      supports: [s("anemia", "貧血", 3), s("plt_low", "血小板減少", 3), s("ld_high", "LD 上昇", 3),
                 s("ibil_high", "間接ビリルビン上昇", 2), s("retic_high", "網赤血球増加", 2),
                 s("renal_impair", "腎機能低下", 2)],
      opposes: [s("pt_prolonged", "PT 延長（DIC を示唆）", 3), s("fib_low", "フィブリノゲン低下（DIC を示唆）", 3)],
      next: ["血液像で破砕赤血球", "ハプトグロビン・直接クームス試験", "ADAMTS13 活性・インヒビター", "血漿交換の準備"],
      pearl: "DIC と見た目が同じで凝固系だけが正常——これが TTP の指紋です。血小板輸血が禁忌になりうる点で、取り違えが致命的になります。" },

    { id: "hlh", name: "血球貪食症候群（HLH）", cat: "血液", refs: ["HSCORE"],
      trigger: ["pancytopenia", "sil2r_high"],
      supports: [s("pancytopenia", "汎血球減少", 3), s("sil2r_high", "可溶性IL-2R 高値", 3),
                 s("fever", "持続する発熱", 2), s("transaminase_high", "肝障害", 2),
                 s("ld_high", "LD 上昇", 2), s("fib_low", "フィブリノゲン低下", 2)],
      opposes: [],
      next: ["フェリチン・中性脂肪の測定", "HScore の算出", "骨髄検査", "背景疾患（EBV・リンパ腫・膠原病）の検索"],
      pearl: "フェリチンが数千を超える発熱は HLH を疑う合図です。「原因不明の発熱＋汎血球減少＋肝障害」で一度は考えます。" },

    { id: "hit", name: "ヘパリン起因性血小板減少症", cat: "血液", refs: ["FOURTS"],
      trigger: ["plt_low"], requireMed: "heparin",
      supports: [s("plt_low", "血小板減少", 3), s("ddimer_high", "D-ダイマー上昇（血栓）", 2)],
      opposes: [s("fib_low", "フィブリノゲン低下（DIC を示唆）", 2)],
      next: ["4Ts スコアの算出", "ヘパリン開始からの日数を確認", "HIT 抗体の提出", "血栓徴候の全身評価"],
      pearl: "血小板が減るのに血栓ができる、という逆説。出血を心配して抗凝固をやめると、かえって血栓で失います。" },

    { id: "mds", name: "骨髄異形成症候群・骨髄不全", cat: "血液", refs: [],
      trigger: ["pancytopenia", "retic_low"],
      supports: [s("pancytopenia", "汎血球減少", 3), s("macrocytic", "大球性", 2),
                 s("retic_low", "網赤血球低値", 3), s("blasts", "芽球出現", 2)],
      opposes: [s("retic_high", "網赤血球増加（末梢での破壊・喪失を示唆）", 3)],
      next: ["網赤血球数", "ビタミンB12・葉酸", "骨髄検査", "被疑薬の確認"],
      pearl: "汎血球減少を見たら、まず網赤血球です。作れていないのか、作っているが壊されているのか——方向が真逆になります。" },

    /* ---------- 膠原病 ---------- */
    { id: "sle", name: "全身性エリテマトーデス", cat: "膠原病", refs: ["SLE2019"],
      trigger: ["ana_pos", "dsdna_pos"],
      supports: [s("dsdna_pos", "抗dsDNA 抗体陽性", 3), s("sm_pos", "抗Sm 抗体陽性", 3),
                 s("complement_low", "補体低下", 3), s("ana_high", "抗核抗体 高力価", 2),
                 s("plt_low", "血小板減少", 1), s("anemia", "貧血", 1), s("renal_impair", "腎障害", 2),
                 s("lymphopenia", "リンパ球減少", 2)],
      opposes: [],
      next: ["EULAR/ACR 2019 分類基準の確認", "尿所見（蛋白・円柱）", "補体・抗dsDNA の経時変化", "腎生検の適応"],
      pearl: "SLE の活動性は抗dsDNA の上昇と補体の低下が対になって動きます。片方だけでは判断しません。" },

    { id: "aav", name: "ANCA 関連血管炎", cat: "膠原病", refs: [],
      trigger: ["mpo_pos", "pr3_pos"],
      supports: [s("mpo_pos", "MPO-ANCA 陽性", 3), s("pr3_pos", "PR3-ANCA 陽性", 3),
                 s("renal_impair", "腎機能低下", 3), s("crp_veryhigh", "強い炎症", 2),
                 s("anemia", "貧血", 1), s("eosinophilia", "好酸球増多（EGPA）", 2)],
      opposes: [],
      next: ["尿沈渣（糸球体性血尿・赤血球円柱）", "胸部CT（結節・空洞・肺胞出血）", "腎生検", "耳鼻科的評価"],
      pearl: "急速進行性糸球体腎炎は週単位で不可逆になります。ANCA 陽性＋尿潜血＋Cr 上昇は、待てない組み合わせです。" },

    { id: "aps", name: "抗リン脂質抗体症候群", cat: "膠原病", refs: ["APS_SYD"],
      trigger: ["apl_pos"],
      supports: [s("apl_pos", "抗リン脂質抗体陽性", 3), s("aptt_only", "APTT 単独延長", 3),
                 s("plt_low", "血小板減少", 2), s("ddimer_high", "D-ダイマー上昇", 1)],
      opposes: [],
      next: ["12週以上の間隔をあけた再検（一過性陽性の除外）", "血栓症・妊娠合併症の既往確認", "抗凝固療法の適応評価"],
      pearl: "APTT が延びるのに血栓に傾く、という逆説。延長を出血リスクと読んで抗凝固を控えると判断を誤ります。" },

    /* ---------- 神経・筋 ---------- */
    { id: "mg", name: "重症筋無力症", cat: "神経・筋", refs: [],
      trigger: ["achr_pos", "musk_pos"],
      supports: [s("achr_pos", "抗AChR 抗体陽性", 3), s("musk_pos", "抗MuSK 抗体陽性", 3),
                 s("respiratory_acidosis", "呼吸性アシドーシス（クリーゼ）", 3),
                 s("thyroid_ab_pos", "甲状腺自己抗体陽性（合併）", 1)],
      opposes: [],
      next: ["%肺活量・単一呼吸での発語数", "反復刺激試験・単線維筋電図", "胸腺腫の検索（胸部CT）", "増悪薬剤の確認"],
      pearl: "SpO₂ は最後まで保たれます。呼吸筋疲労は「努力」の指標（呼吸数・咳の強さ・話せる語数）で捉えてください。" },

    { id: "gbs", name: "ギラン・バレー症候群", cat: "神経・筋", refs: [],
      trigger: ["gm1_pos", "gq1b_pos"],
      supports: [s("gm1_pos", "抗GM1 抗体陽性", 3), s("gq1b_pos", "抗GQ1b 抗体陽性", 3),
                 s("respiratory_acidosis", "呼吸性アシドーシス", 3)],
      opposes: [],
      next: ["髄液検査（蛋白細胞解離）", "神経伝導検査", "%肺活量の経時測定", "自律神経モニタリング"],
      pearl: "麻痺の進行は上行性です。横隔膜に届く前に呼吸機能を測り始めるかどうかが予後を分けます。" },

    { id: "ae", name: "自己免疫性脳炎", cat: "神経・筋", refs: [],
      trigger: ["nmdar_pos", "lgi1_pos", "caspr2_pos"],
      supports: [s("nmdar_pos", "抗NMDA受容体 抗体陽性", 3), s("lgi1_pos", "抗LGI1 抗体陽性", 3),
                 s("caspr2_pos", "抗CASPR2 抗体陽性", 3), s("hypona", "低Na血症（抗LGI1 に多い）", 2)],
      opposes: [],
      next: ["髄液検査・脳波・頭部MRI", "腫瘍検索（抗NMDA では卵巣奇形腫）", "免疫療法の開始時期を確認"],
      pearl: "若年者の急な精神症状を精神疾患と決める前に、一度は自己免疫性脳炎を考えてください。治せる認知症・治せる精神症状です。" },

    { id: "hepatic_enceph", name: "肝性脳症", cat: "神経・筋", refs: ["WESTHAVEN"],
      trigger: ["nh3_high"],
      supports: [s("nh3_veryhigh", "アンモニア著明高値", 3), s("nh3_high", "アンモニア高値", 2),
                 s("alb_low", "アルブミン低下", 2), s("pt_prolonged", "PT 延長", 2), s("bil_high", "黄疸", 1)],
      opposes: [],
      next: ["West-Haven 分類での重症度評価", "誘因（消化管出血・感染・便秘・脱水・低K・鎮静薬）の検索", "バルプロ酸内服の確認"],
      pearl: "アンモニア値と脳症の重症度は相関しません。値ではなく、羽ばたき振戦と意識レベルで判断します。" },

    /* ---------- 中毒・薬剤 ---------- */
    { id: "toxalcohol", name: "中毒性アルコール（メタノール・エチレングリコール）", cat: "中毒・薬剤", refs: ["GOLDMARK"],
      trigger: ["osmgap_high"],
      supports: [s("osmgap_high", "浸透圧ギャップ開大", 3), s("ag_high", "AG 開大", 3),
                 s("severe_acidemia", "重度アシデミア", 2), s("renal_impair", "腎機能低下", 1)],
      opposes: [s("hyperglycemia_severe", "著明な高血糖（DKA／HHS の可能性）", 2)],
      next: ["中毒専門機関への相談", "ホメピゾール／エタノールの投与検討", "血液透析の適応評価", "眼症状・シュウ酸結晶尿の確認"],
      pearl: "AG 開大と浸透圧ギャップ開大が同時にあれば、まず中毒性アルコールです。治療開始の遅れが失明と死に直結します。" },

    { id: "rhabdo", name: "横紋筋融解症", cat: "中毒・薬剤", refs: [],
      trigger: ["rhabdo_range", "ck_veryhigh"],
      supports: [s("rhabdo_range", "CK >5000 U/L", 3), s("hyperk", "高K血症", 2), s("hyperp", "高P血症", 2),
                 s("hypoca", "低Ca血症", 2), s("ua_high", "高尿酸血症", 1), s("renal_impair", "腎機能低下", 2),
                 s("ld_high", "LD 上昇", 1), s("transaminase_high", "AST 優位の上昇", 1)],
      opposes: [],
      next: ["尿潜血（ミオグロビン尿で試験紙陽性・沈渣で赤血球なし）", "K・Cr の頻回測定", "大量輸液", "コンパートメント症候群の評価"],
      pearl: "尿試験紙で潜血陽性なのに沈渣に赤血球がない——これがミオグロビン尿の見分け方です。" }
  ];

  /** 所見から鑑別候補を順位づける。返り値は証拠の重み順。 */
  function differential(F, V, D, ctx, opts) {
    opts = opts || {};
    var out = [];
    DDX.forEach(function (d) {
      // minTrigger：単独では非特異的な所見で候補が乱立するのを防ぐ
      var hits = (d.trigger || []).filter(function (t) { return F[t]; }).length;
      if (hits < (d.minTrigger || 1)) return;
      // requireCtx：背景（投薬歴など）が揃って初めて成立する鑑別
      if (d.requireMed && !C.has(ctx, "meds", d.requireMed)) return;
      var score = 0, maxScore = 0, sup = [], opp = [];
      (d.supports || []).forEach(function (x) {
        maxScore += x.w;
        if (F[x.flag]) { score += x.w; sup.push(x.label); }
      });
      (d.opposes || []).forEach(function (x) {
        if (F[x.flag]) { score -= x.w; opp.push(x.label); }
      });
      if (score <= 0) return;
      out.push({
        id: d.id, name: d.name, cat: d.cat, refs: d.refs || [],
        raw: score, max: maxScore,
        fit: Math.round(score / Math.max(maxScore, 1) * 100),
        supCount: sup.length, supTotal: (d.supports || []).length,
        supports: sup, opposes: opp, next: d.next || [], pearl: d.pearl || ""
      });
    });
    // 画面に出すのは合致度なので、並び順もそれに揃える（証拠の重みで同点を解く）
    out.sort(function (a, b) { return b.fit - a.fit || b.raw - a.raw; });
    return opts.limit ? out.slice(0, opts.limit) : out;
  }

  return { DDX: DDX, differential: differential };
})();
