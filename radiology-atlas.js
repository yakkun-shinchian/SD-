/* =========================================================================
 * RadioDeck（レディオデッキ）— 放射線科読影アトラスの「骨格」データなのだ
 *
 * このファイルが定義するもの:
 *   RAD_REGIONS   … 領域（頭部・胸部・腹部）とモダリティ
 *   RAD_AXES      … 「逆引きナビ」の質問軸（見えたものを選ぶ選択肢）
 *   RAD_PROTOCOLS … 系統的読影手順（見落としを防ぐチェックリスト）
 *   RAD_HU        … CT値（Hounsfield Unit）の目安表
 *
 * ▼ 所見そのものは radiology-signs.js に、図は radiology-figures.js にあるのだ。
 *
 * ⚠ 本アプリは学習用なのだ。実際の患者さんの診断には使えないのだ。
 * ========================================================================= */

"use strict";

/* ---------------------------------------------------------------------------
 * 領域とモダリティ
 * ------------------------------------------------------------------------- */
const RAD_REGIONS = [
  {
    key: "head",
    label: "頭部",
    icon: "🧠",
    color: "#7c5cff",
    blurb: "まずは「血が出ていないか」。頭部CTの第一の仕事は、出血の有無なのだ。",
    modalities: [
      { key: "hct", label: "頭部CT（単純）", note: "出血・骨折に強い。救急の第一選択。" },
      { key: "hmr", label: "頭部MRI", note: "超急性期の梗塞（DWI）と後頭蓋窩に強い。" },
    ],
  },
  {
    key: "chest",
    label: "胸部",
    icon: "🫁",
    color: "#2f9e6e",
    blurb: "白いのか、黒いのか。そして「どこが」白いのか。それだけで半分わかるのだ。",
    modalities: [
      { key: "cxr", label: "胸部X線", note: "最も多く撮られる。重なりを読み解く技術がいる。" },
      { key: "cct", label: "胸部CT", note: "すりガラス影・間質の形を直接見られる。" },
    ],
  },
  {
    key: "abdomen",
    label: "腹部",
    icon: "🫀",
    color: "#d9793f",
    blurb: "臓器を一つずつ、順番に。造影のタイミングで見えるものが変わるのだ。",
    modalities: [
      { key: "act", label: "腹部CT（単純・造影）", note: "造影の相（動脈相・門脈相・平衡相）が勝負どころ。" },
      { key: "amr", label: "腹部MRI", note: "肝腫瘤の質的診断・胆道（MRCP）に強い。" },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * 逆引きナビの質問軸
 *   各領域ごとに「見えたもの」を選んでいくと、候補の所見に絞り込まれるのだ。
 *   options[].tag が radiology-signs.js の sign.patterns と照合されるのだ。
 * ------------------------------------------------------------------------- */
const RAD_AXES = {
  head: [
    {
      key: "density",
      label: "どんな濃度・信号に見える？",
      hint: "CTは「白い＝高吸収」「黒い＝低吸収」。MRIなら信号の高さで選ぶのだ。",
      options: [
        { tag: "hyperdense", label: "白い（高吸収）", sub: "出血・石灰化・造影剤・血栓" },
        { tag: "hypodense", label: "黒い（低吸収）", sub: "梗塞・浮腫・陳旧性病変・脂肪" },
        { tag: "isodense", label: "周りと同じくらい（等吸収）", sub: "亜急性の血腫は見落としやすいのだ" },
        { tag: "dwi-high", label: "MRI DWIで白い", sub: "超急性期の脳梗塞の決め手" },
        { tag: "t2-high", label: "MRI T2/FLAIRで白い", sub: "浮腫・脱髄・陳旧性変化" },
      ],
    },
    {
      key: "location",
      label: "どこにある？",
      hint: "「どの空間にあるか」で、病気の種類がほぼ決まるのだ。",
      options: [
        { tag: "loc-parenchyma", label: "脳の実質の中" },
        { tag: "loc-subarachnoid", label: "脳溝・脳槽（くも膜下腔）" },
        { tag: "loc-ventricle", label: "脳室の中" },
        { tag: "loc-subdural", label: "脳の表面と硬膜のあいだ" },
        { tag: "loc-epidural", label: "硬膜と頭蓋骨のあいだ" },
        { tag: "loc-vessel", label: "太い血管の走り道に沿って" },
      ],
    },
    {
      key: "shape",
      label: "どんな形？",
      hint: "形は、どの膜に止められているかを教えてくれるのだ。",
      options: [
        { tag: "shape-crescent", label: "三日月型（広くうすく広がる）" },
        { tag: "shape-lens", label: "凸レンズ型（こんもり盛り上がる）" },
        { tag: "shape-wedge", label: "くさび形（血管の縄張りに一致）" },
        { tag: "shape-mass", label: "境界のはっきりした塊" },
        { tag: "shape-diffuse", label: "ぼんやり広がる・左右差として" },
      ],
    },
    {
      key: "extra",
      label: "いっしょに見えるものは？（任意）",
      hint: "合併所見は「どれくらい緊急か」を決めるのだ。",
      optional: true,
      options: [
        { tag: "midline-shift", label: "正中が押されている" },
        { tag: "sulcal-effacement", label: "脳溝が消えている" },
        { tag: "ventricle-dilat", label: "脳室が大きい" },
        { tag: "ring-enhance", label: "造影でリング状に光る" },
      ],
    },
  ],

  chest: [
    {
      key: "opacity",
      label: "どんな見た目？",
      hint: "まず「白いか黒いか」、そして「白さの質」を見るのだ。",
      options: [
        { tag: "linear", label: "線状・網目状", sub: "間質が腫れているサイン" },
        { tag: "ggo", label: "すりガラス状（血管が透けて見える）" },
        { tag: "consolidation", label: "べったり白い（血管が見えない）" },
        { tag: "nodule", label: "粒・結節（3cm未満）" },
        { tag: "mass", label: "大きな塊（3cm以上）" },
        { tag: "whiteout", label: "片側がまるごと白い" },
        { tag: "hyperlucent", label: "むしろ黒い（透けすぎ）" },
        { tag: "cavity", label: "中が抜けている（空洞）" },
      ],
    },
    {
      key: "distribution",
      label: "どこに分布している？",
      hint: "重力と血流が、分布を決めるのだ。だから分布は原因を語るのだ。",
      options: [
        { tag: "dist-upper", label: "上のほう（上肺野）" },
        { tag: "dist-lower", label: "下のほう（下肺野）" },
        { tag: "dist-perihilar", label: "肺門のまわり（中枢側）" },
        { tag: "dist-peripheral", label: "外側・胸膜のすぐ下" },
        { tag: "dist-diffuse", label: "全体にまんべんなく" },
        { tag: "dist-unilateral", label: "片側だけ" },
      ],
    },
    {
      key: "extra",
      label: "いっしょに見えるものは？（任意）",
      optional: true,
      options: [
        { tag: "cardiomegaly", label: "心臓が大きい" },
        { tag: "effusion", label: "胸水がある" },
        { tag: "shift", label: "気管や縦隔がずれている" },
        { tag: "air-bronchogram", label: "白い中に気管支が黒く見える" },
        { tag: "free-air", label: "横隔膜の下に黒い空気" },
        { tag: "volume-loss", label: "肺が縮んでいる（容積減少）" },
      ],
    },
  ],

  abdomen: [
    {
      key: "organ",
      label: "どの臓器の話？",
      options: [
        { tag: "org-liver", label: "肝臓" },
        { tag: "org-biliary", label: "胆嚢・胆管" },
        { tag: "org-pancreas", label: "膵臓" },
        { tag: "org-urinary", label: "腎・尿路" },
        { tag: "org-bowel", label: "消化管" },
        { tag: "org-peritoneum", label: "腹腔・腹膜" },
      ],
    },
    {
      key: "finding",
      label: "何が見えている？",
      options: [
        { tag: "fnd-mass", label: "腫瘤・結節がある" },
        { tag: "fnd-dilat", label: "管が広がっている" },
        { tag: "fnd-wall", label: "壁が厚い" },
        { tag: "fnd-fluid", label: "液体がたまっている" },
        { tag: "fnd-freeair", label: "あるはずのない場所にガス" },
        { tag: "fnd-stone", label: "石・石灰化" },
        { tag: "fnd-stranding", label: "まわりの脂肪が汚い（濃度上昇）" },
      ],
    },
    {
      key: "enhance",
      label: "造影ではどう光る？（任意）",
      hint: "腹部の質的診断は、ほぼここで決まるのだ。",
      optional: true,
      options: [
        { tag: "enh-arterial", label: "動脈相で強く光る" },
        { tag: "enh-hypo", label: "動脈相でも暗いまま（乏血性）" },
        { tag: "enh-washout", label: "あとで周りより暗くなる（washout）" },
        { tag: "enh-centripetal", label: "辺縁から中心へ埋まっていく" },
        { tag: "enh-ring", label: "リング状に光る" },
        { tag: "enh-delayed", label: "遅れて光ってくる" },
      ],
    },
  ],
};

/* ---------------------------------------------------------------------------
 * 系統的読影手順 — 「見落とし」は能力ではなく手順の問題なのだ
 * ------------------------------------------------------------------------- */
const RAD_PROTOCOLS = [
  {
    key: "cxr",
    region: "chest",
    title: "胸部X線：ABCDE＋αで読むのだ",
    lead:
      "放射線科医が速いのは、目がいいからではないのだ。毎回まったく同じ順番で見るから、見落とす場所がなくなるだけなのだ。順番こそが実力なのだ。",
    steps: [
      {
        key: "A",
        label: "A — Airway（気道）",
        checks: [
          "気管は正中にあるか。左右どちらかに引かれて／押されていないか",
          "気管分岐部の角度はどうか（左房拡大で開大する）",
          "主気管支に途絶はないか",
        ],
        why: "気管の偏位は「引っぱられている（無気肺）」か「押されている（緊張性気胸・大量胸水）」かを一瞬で教えてくれるのだ。",
      },
      {
        key: "B",
        label: "B — Breathing（肺野と胸膜）",
        checks: [
          "左右の肺野を上・中・下に分け、同じ高さで左右を見比べる",
          "肺尖部（鎖骨の上）を忘れない。ここは見落としの常連なのだ",
          "肋横角（costophrenic angle）は鋭いか。鈍れば胸水",
          "胸膜線より外側に肺紋理がないか（気胸）",
        ],
        why: "「左右を見比べる」のが肝なのだ。人間の目は絶対値ではなく差を見るのが得意だからなのだ。",
      },
      {
        key: "C",
        label: "C — Circulation（心陰影と大血管）",
        checks: [
          "心胸郭比（CTR）は50%以下か（立位・吸気・PA像での話なのだ）",
          "心陰影の輪郭（右第1〜2弓、左第1〜4弓）が追えるか",
          "大動脈弓の突出・石灰化はないか",
          "肺血管影が上肺野で太くなっていないか（cephalization）",
        ],
        why: "心不全は「心臓が大きい」より先に「上肺野の血管が太くなる」で現れることが多いのだ。",
      },
      {
        key: "D",
        label: "D — Diaphragm（横隔膜と腹部）",
        checks: [
          "横隔膜のドームは滑らかか。右が左よりやや高いのが正常",
          "横隔膜の下に遊離ガス（free air）がないか",
          "胃泡の位置はどうか",
        ],
        why: "立位胸部X線は、実は消化管穿孔を見つける最も手軽な検査でもあるのだ。",
      },
      {
        key: "E",
        label: "E — Everything else（骨・軟部・デバイス）",
        checks: [
          "肋骨・鎖骨・肩甲骨・脊椎に骨折や骨破壊はないか",
          "皮下気腫・乳房陰影・軟部腫瘤はないか",
          "挿管チューブ・CVカテーテル・ドレーン・ペースメーカーの先端位置は適切か",
        ],
        why: "デバイスの位置確認は看護師が最初に気づける領域なのだ。気管チューブ先端は気管分岐部から2〜5cm上が目安なのだ。",
      },
      {
        key: "F",
        label: "F — Forgotten areas（隠れた場所をもう一周）",
        checks: [
          "心陰影の裏（左下肺野は心臓に重なって見えにくい）",
          "横隔膜の裏",
          "肺尖部",
          "鎖骨や肋骨に重なる部分",
        ],
        why: "見落としの大半は「重なって見えにくい場所」で起きるのだ。だから最後にもう一度、そこだけを見にいくのだ。",
      },
    ],
  },
  {
    key: "hct",
    region: "head",
    title: "頭部CT：Blood Can Be Very Bad の順で読むのだ",
    lead:
      "英語圏で古くから使われる語呂なのだ。Blood（血）・Cisterns（脳槽）・Brain（脳実質）・Ventricles（脳室）・Bone（骨）。救急で頭部CTを見るとき、この順番を外さなければ致命的な見落としはぐっと減るのだ。",
    steps: [
      {
        key: "Blood",
        label: "Blood — 血はどこかに出ていないか",
        checks: [
          "硬膜外（凸レンズ型）・硬膜下（三日月型）・くも膜下（脳溝や脳槽が白い）・脳内・脳室内の5か所を順に",
          "急性期の血液は白く見える（おおむね50〜80 HU程度）",
          "貧血が強いと血腫が白くなりきらないことがあるのだ",
        ],
        why: "出血は「今すぐ動くかどうか」を決める所見なのだ。だから最初に見るのだ。",
      },
      {
        key: "Cisterns",
        label: "Cisterns — 脳槽はつぶれていないか",
        checks: [
          "迂回槽（ambient cistern）・鞍上槽（suprasellar cistern）・第四脳室周囲",
          "脳槽が白く埋まっていればくも膜下出血、消えていれば頭蓋内圧亢進・ヘルニア",
        ],
        why: "脳槽は脳の「のりしろ」なのだ。ここが消えるのは、脳が逃げ場を失っているサインなのだ。",
      },
      {
        key: "Brain",
        label: "Brain — 脳実質の左右差を見る",
        checks: [
          "灰白質と白質の境界がぼやけていないか（早期虚血のサイン）",
          "島皮質のリボン（insular ribbon）は左右で同じに見えるか",
          "レンズ核の輪郭は保たれているか",
          "脳溝が片側だけ消えていないか",
        ],
        why: "超急性期の脳梗塞は「黒くなる」前に「境界がぼやける」のだ。細胞性浮腫で水分が増え、わずかにCT値が下がるからなのだ。",
      },
      {
        key: "Ventricles",
        label: "Ventricles — 脳室の大きさと位置",
        checks: [
          "左右対称か。片側がつぶれていないか",
          "全体に拡大していないか（水頭症）",
          "正中構造（中隔・松果体）が偏位していないか",
        ],
        why: "正中偏位は「量」を教えてくれるのだ。5mmを超えるかどうかが、しばしば手術の議論の入口になるのだ。",
      },
      {
        key: "Bone",
        label: "Bone — 骨条件に切り替えて骨を見る",
        checks: [
          "頭蓋骨に骨折線はないか（縫合線と間違えないこと）",
          "副鼻腔・乳突蜂巣に液体貯留はないか（頭蓋底骨折の間接所見）",
          "顔面骨・眼窩も忘れずに",
        ],
        why: "脳条件のまま骨を見ても骨折は見えないのだ。ウィンドウを変えるのは「別の検査をする」のと同じくらい大事なのだ。",
      },
    ],
  },
  {
    key: "act",
    region: "abdomen",
    title: "腹部CT：臓器を一つずつ、順番に巡るのだ",
    lead:
      "腹部CTは情報量が多すぎて、目立つものに引っぱられるのだ（心理学でいう注意の捕捉なのだ）。だから「気になるもの」を見る前に、決めた巡回ルートを一周するのだ。",
    steps: [
      {
        key: "1",
        label: "① 実質臓器を上から順に",
        checks: [
          "肝（大きさ・辺縁・腫瘤・脂肪化）→ 脾 → 膵（主膵管の太さ）→ 副腎 → 腎",
          "造影なら、どの相で撮られた画像かを必ず確認する",
        ],
        why: "同じ腫瘤でも、動脈相で光るか門脈相で光るかで診断名が変わるのだ。相を知らずに読むのは、楽譜を見ずに演奏するようなものなのだ。",
      },
      {
        key: "2",
        label: "② 管を追いかける",
        checks: [
          "胆管（肝内胆管の拡張・総胆管径）と膵管",
          "尿管を腎盂から膀胱まで追う",
          "腸管の径（小腸3cm・大腸6cm・盲腸9cmが目安のルール）",
        ],
        why: "管は「どこで詰まったか」を上流の拡張で教えてくれるのだ。拡張の終わるところが、犯人のいる場所なのだ。",
      },
      {
        key: "3",
        label: "③ 血管を見る",
        checks: [
          "大動脈の径・壁在血栓・解離",
          "門脈・肝静脈・上腸間膜動静脈の開存",
        ],
        why: "腸管虚血は腸ではなく血管に原因があるのだ。腸だけ見ていると間に合わないのだ。",
      },
      {
        key: "4",
        label: "④ 腔を見る",
        checks: [
          "腹水・膿瘍・遊離ガス（肝表面やダグラス窩を狙って探す）",
          "脂肪織の濃度上昇（炎症の煙なのだ）",
        ],
        why: "脂肪織濃度上昇は「ここで何かが起きている」という煙なのだ。火元の臓器を探す道しるべになるのだ。",
      },
      {
        key: "5",
        label: "⑤ 骨と肺底部",
        checks: [
          "脊椎・骨盤骨の溶骨性／造骨性病変",
          "撮影範囲に入った肺底部",
        ],
        why: "腹部CTの端っこに写った肺底部で肺炎や肺癌が見つかることは、実際によくあるのだ。",
      },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * CT値（Hounsfield Unit）の目安
 *   ※ 施設・装置・撮影条件で変動するのだ。あくまで学習用の目安なのだ。
 * ------------------------------------------------------------------------- */
const RAD_HU = {
  note:
    "CT値は水を0、空気を−1000と決めた相対的なものさしなのだ。実際の値は装置の較正や撮影条件でぶれるので、数字は「覚える」より「順番の感覚」をつかむのが大事なのだ。",
  rows: [
    { label: "空気", value: "約 −1000", color: "#111827", hint: "肺・腸管ガス・気胸" },
    { label: "脂肪", value: "約 −120 〜 −90", color: "#3f3f46", hint: "脂肪腫・血管筋脂肪腫の手がかり" },
    { label: "水・単純性嚢胞", value: "約 0", color: "#52525b", hint: "ものさしの基準点なのだ" },
    { label: "脳脊髄液", value: "約 0 〜 15", color: "#5b6472", hint: "脳室・脳槽" },
    { label: "白質", value: "約 20 〜 30", color: "#6b7280", hint: "灰白質よりやや低いのだ" },
    { label: "灰白質", value: "約 35 〜 45", color: "#8b94a3", hint: "白質との差が境界を作るのだ" },
    { label: "流れている血液", value: "約 13 〜 50", color: "#9ca3af", hint: "" },
    { label: "凝血・急性出血", value: "約 50 〜 80", color: "#d4d4d8", hint: "白く見えるのはヘモグロビン蛋白の密度によるのだ" },
    { label: "造影された血管", value: "約 100 〜 300", color: "#e5e7eb", hint: "相によって変わるのだ" },
    { label: "海綿骨", value: "約 300 〜 400", color: "#f1f5f9", hint: "" },
    { label: "皮質骨・石灰化", value: "約 500 〜 1900", color: "#ffffff", hint: "骨条件で見るのだ" },
  ],
  refs: [
    { label: "Hounsfield scale（Wikipedia）", url: "https://en.wikipedia.org/wiki/Hounsfield_scale" },
  ],
};
