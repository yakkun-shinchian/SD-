/* V5で段階的に改善した教材。既存のSCENESは引き続き利用する。 */
const ENHANCED_LESSONS = {
  base01: {
    reviewed: "2026-09-30",
    title: "バイタルサイン｜数字の向こうの患者さんを見る",
    hook: "数字が正常なら、安心していい？",
    intro: "バイタルサインは、体から届くお知らせ。数字と患者さんの様子を、一緒に読み解きましょう。",
    image: "images/vitals-v5.webp",
    dialogue: [
      { role: "後輩", text: "先輩、バイタルの数字が正常なら、安心ですよね？" },
      { role: "先輩", text: "数字だけでは決められないよ。バイタルは体の『お知らせランプ』。患者さんの様子も一緒に見よう。" },
      { role: "後輩", text: "何をセットで見るんですか？" },
      { role: "先輩", text: "体温・脈拍・呼吸・血圧。それに、血液の酸素の目安になるSpO₂も確認するよ。" },
      { role: "後輩", text: "正常の範囲だけ覚えればいいですか？" },
      { role: "先輩", text: "『普段と比べてどうか』も大切。呼吸の速さだけでなく、苦しそうか、意識や顔色はどうかを見よう。" },
      { role: "後輩", text: "数値がおかしいときは、測り直します！" },
      { role: "先輩", text: "測り方も確認しよう。でも、息苦しさや意識の変化があれば、測り直しだけで待たずに応援を呼んで報告してね。" },
    ],
    summary: ["数字＋患者さんの様子を見る", "普段の値・前回との変化を見る", "気になる症状は、数値が正常でも報告する"],
    ranges: [
      ["体温", "36.5〜37.3℃", "測る部位や時間帯で変わります。腋窩・口腔など、測定方法も記録。"],
      ["脈拍", "60〜100回／分", "速さに加えて、リズム・強さも観察。運動や薬剤などで変化します。"],
      ["呼吸数", "12〜18回／分", "資料によって12〜20回／分とも示されます。深さ・リズム・努力呼吸も確認。"],
      ["血圧", "安静時の参考範囲：90/60〜120/80 mmHg", "診断や治療の目標値とは別です。本人の普段の値・症状・施設基準を合わせて判断。"],
      ["SpO₂（エスピーオーツー）", "多くの健康な人で95〜100％", "経皮的動脈血酸素飽和度。指などのセンサーで酸素化を推定します。疾患・標高などで異なり、酸素療法の目標は個別の指示を確認。"],
    ],
    details: [
      { title: "① 測定条件をそろえる", text: "安静か、運動直後か、痛みや発熱があるかを確認します。血圧は適切なカフと姿勢で測り、体温は測定部位をそろえると経過を比較しやすくなります。" },
      { title: "② 呼吸は『回数＋様子』", text: "胸やお腹の動きから呼吸数を数え、浅さ・不規則さ・息苦しさも観察します。SpO₂が保たれていても、換気が十分とは限りません。酸素投与中なら投与方法と流量も記録します。" },
      { title: "③ SpO₂の数字をうのみにしない", text: "冷たい指や血流不良、体動、マニキュア、皮膚の色素などで精度に影響が出ます。脈拍や信号の安定を確かめ、数値と症状が合わなければ報告・追加評価につなげます。" },
      { title: "④ 変化を言葉で報告する", text: "例：『前回の呼吸数は16回、今回は28回です。息苦しさがあり、酸素投与の条件は同じです』。測定値・前回との差・症状・測定条件を伝えると、状況が伝わりやすくなります。急な悪化は施設の緊急対応に沿って応援を要請します。" },
    ],
    quiz: { question: "SpO₂が97％でも、患者さんが息苦しそう。どうする？", options: ["正常値なので、そのまま様子を見る", "呼吸・意識などを確認し、変化を報告する"], correct: 1, explanation: "数値だけで安心せず、患者さんの症状と変化を合わせて評価します。呼吸が苦しい、意識が変わったなどの急変時は、測定のやり直しだけで待たずに応援を呼びます。" },
    sources: [
      { title: "MedlinePlus：Pulse Oximetry（SpO₂の参考値）", url: "https://medlineplus.gov/lab-tests/pulse-oximetry/" },
      { title: "American Heart Association：血圧測定の姿勢とカフ", url: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home" },
      { title: "MedlinePlus：Vital signs（健康な成人・安静時の参考値）", url: "https://medlineplus.gov/ency/article/002341.htm" },
      { title: "FDA：Pulse Oximeters（測定上の限界）", url: "https://www.fda.gov/medical-devices/products-and-medical-procedures/pulse-oximeters" },
    ],
  },
};

ENHANCED_LESSONS.anat01 = {
  "kind": "anatomy-v5",
  "title": "心臓の解剖と血液の流れ",
  "intro": "右は肺へ、左は全身へ。先輩と後輩の会話で、心臓のしくみをひとつずつ。",
  "poster": "anat01-v5-page-01.jpg",
  "video": "anat01-v5-review.mp4",
  "summary": [
    "右心室から肺へ送り、肺静脈で左心房へ戻る",
    "左心室から全身へ送り、大静脈で右心房へ戻る",
    "4つの弁が血液の逆流を防ぐ"
  ],
  "flow": [
    "全身",
    "上・下大静脈",
    "右心房",
    "三尖弁",
    "右心室",
    "肺動脈弁",
    "肺動脈",
    "肺",
    "肺静脈",
    "左心房",
    "僧帽弁",
    "左心室",
    "大動脈弁",
    "大動脈",
    "全身"
  ],
  "pages": [
    {
      "page": 1,
      "title": "心臓は\n２つのポンプ！",
      "junior": "先輩、心臓の右と左って、何が違うんですか？",
      "senior": "右は肺へ、左は全身へ。まず送り先で分けよう！",
      "summary": "右は肺へ／左は全身へ",
      "art": "Two large friendly hand-painted pump metaphors, one beside a lung icon and one beside a body silhouette. No anatomical cross section or arrows."
    },
    {
      "page": 2,
      "title": "４つの部屋は\n受け取る・送る",
      "junior": "心房と心室、名前がごちゃごちゃになります。",
      "senior": "心房は受け取り、心室は送り出す部屋。右と左に１組ずつあるよ。",
      "summary": "心房＝受け取る／心室＝送り出す",
      "art": "A dollhouse metaphor with four unlabeled rooms, two receiving trays and two pumps. Explicitly a metaphor, not an anatomical heart diagram. No extra labels."
    },
    {
      "page": 3,
      "title": "肺で酸素を\n受け取る！",
      "junior": "右心室から出た血液は、どこへ行くんですか？",
      "senior": "肺動脈で肺へ。酸素を受け取って、肺静脈で左心房へ戻るよ。",
      "summary": "肺循環＝心臓と肺の往復",
      "art": "Friendly cartoon lung icon and red blood cell character taking an oxygen parcel. Illustrative metaphor only, no vessels or arrows."
    },
    {
      "page": 4,
      "title": "左心室から\n全身へ出発！",
      "junior": "肺から帰ってきた血液は、次にどうなるんですか？",
      "senior": "左心房から左心室へ。大動脈で全身に酸素を届け、大静脈で右心房へ戻るよ。",
      "summary": "体循環＝心臓と全身の往復",
      "art": "Red blood cell courier delivering an oxygen parcel to a simple human silhouette. No vascular map or arrows; conceptual courier metaphor."
    },
    {
      "page": 5,
      "title": "４つの弁は\n逆流防止の扉",
      "junior": "血液が、後ろへ戻らないのはどうしてですか？",
      "senior": "弁が逆流を防ぐから。右は三尖弁と肺動脈弁、左は僧帽弁と大動脈弁だよ。",
      "summary": "弁＝逆流を防ぐ",
      "art": "Simple hinged one-way door metaphor with a red blood cell approaching. No anatomical valve reconstruction or flow arrows. Friendly clear door, not an exact valve diagram."
    },
    {
      "page": 6,
      "title": "動脈・静脈は\n向きで覚える！",
      "junior": "動脈なら、必ず酸素が多いんですよね？",
      "senior": "名前は心臓から出るか、戻るかで決まるよ。肺動脈は酸素が少なく、肺静脈は多いんだ。",
      "summary": "右は肺へ／左は全身へ／弁は逆流防止",
      "art": "Two nurse characters confidently checking a clipboard with a simple heart icon. No anatomical section, arrows or added text.",
      "closing": "フォローしていただくと励みになります。よろしくお願いします。"
    }
  ]
};

ENHANCED_LESSONS.anat02 = {
  "kind": "anatomy-v5",
  "title": "腎臓のはたらき｜ネフロンと尿ができるしくみ",
  "intro": "こす・取り戻す・尿へ移す。先輩と後輩の会話で、体の調整係をひとつずつ。",
  "poster": "anat02-v5-page-01.jpg",
  "video": "anat02-v5-review.mp4",
  "summary": [
    "腎臓は老廃物を捨て、水分・電解質を調整する",
    "ろ過・再吸収・分泌を、移動の向きで整理する",
    "尿量だけで判断せず、検査や体の状態も合わせて見る"
  ],
  "pages": [
    {
      "page": 1,
      "title": "腎臓は\n体の調整係！",
      "junior": "腎臓って、尿を作るだけですか？",
      "senior": "老廃物を捨て、水分と電解質のバランスも整えるよ。",
      "summary": "捨てる＋バランスを整える",
      "art": "Friendly bean-shaped kidney mascot operating a balance scale between blue water-drop and small mineral symbols. Conceptual metaphor, not anatomical diagram. No extra words or arrows."
    },
    {
      "page": 2,
      "title": "尿を作る工房\nネフロン",
      "junior": "ネフロンって、何のことですか？",
      "senior": "糸球体と尿細管のセット。こすフィルターと、取り戻す通り道だよ。",
      "summary": "糸球体＋尿細管＝ネフロン",
      "art": "Tiny craft workshop with an unlabelled strainer and a winding conveyor, friendly conceptual metaphor for a filtering and reclaiming workshop. No reconstructed kidney cross section, no vascular arrows."
    },
    {
      "page": 3,
      "title": "まず、こす！\nこれが「ろ過」",
      "junior": "血液が、そのまま尿になるんですか？",
      "senior": "水や小さな物質がこされて原尿に。血球や大きなたんぱく質は、通常は残るよ。",
      "summary": "原尿＝尿のもと",
      "art": "A kitchen strainer metaphor with small blue water drops below, large red blood cell and large protein parcel retained above. No germs, no real vascular diagram, no arrows."
    },
    {
      "page": 4,
      "title": "必要なものは\n取り戻す！",
      "junior": "原尿を、全部捨てちゃうんですか？",
      "senior": "水やブドウ糖などを血液へ戻すよ。これが再吸収。原尿の大部分は戻るんだ。",
      "summary": "再吸収＝尿細管から血液へ",
      "art": "A reclaiming worker metaphor calmly collecting water drops and sugar cube parcels into a red collection basket. Conceptual only; no vessel or tube labelled, no arrows."
    },
    {
      "page": 5,
      "title": "尿の側へ\n追加で移す！",
      "junior": "分泌は、再吸収と何が違うんですか？",
      "senior": "向きが逆だよ。血液から尿細管へ、余分な酸などを移すのが分泌なんだ。",
      "summary": "分泌＝血液から尿細管へ",
      "art": "Parcel transfer metaphor: a friendly worker places an acid parcel in a yellow urine collection basket from beside a red blood-side basket. No chemical formula or added text, no arrows, no precise diagram."
    },
    {
      "page": 6,
      "title": "水の節約係\n抗利尿ホルモン",
      "junior": "抗利尿ホルモンって何ですか？",
      "senior": "ADHとも呼ぶよ。集合管で水を血液へ戻し、尿を濃くするんだ。",
      "summary": "ADH＝水を取り戻す調整",
      "art": "A friendly blue water drop saved in a safe transparent reservoir by a gentle kidney mascot adjusting a dial. Hormone control metaphor, no tap draining water to outside, no arrows."
    },
    {
      "page": 7,
      "title": "血圧を支える\nホルモン連携",
      "junior": "腎臓は、血圧にも関わるんですか？",
      "senior": "レニン・アンジオテンシン・アルドステロン系。塩分と水を保ち、血圧を支えるよ。",
      "summary": "塩分・水分・血圧を調整",
      "art": "Three friendly relay team messenger mascots beside a water drop and small salt parcel. Conceptual teamwork metaphor, no unrelated hearts or celebration, no direction arrows, no extra text."
    },
    {
      "page": 8,
      "title": "尿量だけで\n安心しない！",
      "junior": "尿が出ていれば、腎臓は大丈夫ですか？",
      "senior": "尿量だけでは決められないよ。血液検査や尿検査、体の様子も合わせて見るんだ。",
      "summary": "尿量＋検査＋体の様子",
      "art": "Two nurses checking a clipboard showing small urine collection cup, blood sample tube and calm patient silhouette symbols. No additional duplicate nurses, no extra text.",
      "closing": "フォローしていただけると励みになります。よろしくお願いします。"
    }
  ],
  "explanations": [
    {
      "title": "3つの働きの向き",
      "text": "ろ過：糸球体の血液 → 原尿。再吸収：尿細管の中 → 血液。分泌：血液 → 尿細管の中。工房や荷物運びのイラストは、しくみを理解するための比喩です。"
    },
    {
      "title": "ネフロンの正式な構成",
      "text": "ネフロンは、腎小体（糸球体とボウマン嚢）と尿細管からなる腎臓の機能単位です。各腎臓に約100万個あります。動画では、まず「糸球体と尿細管のセット」として紹介しています。原尿は糸球体でろ過され、ボウマン嚢に集まる尿のもとです。尿細管で必要な物質や水が再吸収され、余分な酸などが分泌されます。"
    },
    {
      "title": "ホルモンによる調整",
      "text": "抗利尿ホルモン（ADH、バソプレシン）は、主に集合管で水の再吸収を促し、尿を濃くする方向に働きます。腎臓で作られるホルモンではなく、視床下部で作られ、下垂体後葉から放出されます。"
    },
    {
      "title": "血圧を支えるホルモン連携",
      "text": "レニン・アンジオテンシン・アルドステロン系は血圧と体液量の調整に関わります。アンジオテンシンⅡには血管を収縮させる働きがあり、副腎皮質から分泌されるアルドステロンは腎臓でナトリウムの再吸収とカリウムの排泄を促します。塩分と水の保持も、血圧を支える働きにつながります。"
    },
    {
      "title": "観察につなげる",
      "text": "尿が出ていても、腎機能が正常とは限りません。腎機能は、血液検査から推算する糸球体ろ過量（eGFR）、尿中アルブミンなどの尿検査、経過や体の状態を合わせて評価します。尿量だけで判断しないことが大切です。"
    }
  ],
  "sources": [
    {
      "title": "NIDDK：Your Kidneys & How They Work",
      "url": "https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work"
    },
    {
      "title": "NIDDK：Diabetes Insipidus",
      "url": "https://www.niddk.nih.gov/health-information/kidney-disease/diabetes-insipidus"
    },
    {
      "title": "NIDDK：Chronic Kidney Disease Tests & Diagnosis",
      "url": "https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis"
    },
    {
      "title": "Society for Endocrinology：Aldosterone",
      "url": "https://www.yourhormones.info/hormones/aldosterone/"
    }
  ]
};

ENHANCED_LESSONS.anat03 = {
  "kind": "anatomy-v5",
  "title": "呼吸のメカニズムとガス交換",
  "intro": "空気を動かす・ガスを交換する。先輩と後輩の会話で、呼吸のしくみをひとつずつ。",
  "poster": "anat03-v5-page-01.jpg",
  "video": "anat03-v5-review.mp4",
  "summary": [
    "換気とガス交換は、呼吸の別々の働き",
    "酸素は肺胞から血液へ、二酸化炭素は血液から肺胞へ",
    "SpO₂だけで換気を判断せず、呼吸や意識も合わせて見る"
  ],
  "pages": [
    {
      "page": 1,
      "title": "呼吸は\n２つの仕事！",
      "junior": "息をするって、空気を出し入れすることですか？",
      "senior": "空気を動かす換気と、酸素・二酸化炭素を交換するガス交換。両方が大切だよ。",
      "summary": "換気＋ガス交換",
      "art": "A friendly lung mascot beside a gentle air breeze symbol and two small colored gas parcels. Concept only: no gas arrows, no anatomical section or gas labels."
    },
    {
      "page": 2,
      "title": "横隔膜が下がると\n空気が入る！",
      "junior": "吸うとき、肺が自分で広がるんですか？",
      "senior": "横隔膜が縮んで下がると、胸の中が広がる。肺の中の圧が下がり、空気が入るよ。",
      "summary": "吸気＝筋肉が働く",
      "art": "A simple wide expanded accordion bellows beside a friendly lung mascot. The accordion is a volume-expansion metaphor, not an anatomical diagram. No arrows, no fake muscle diagram or air flowing into chest cavity."
    },
    {
      "page": 3,
      "title": "安静時の呼気は\n戻る力！",
      "junior": "吐くときも、筋肉で押し出すんですか？",
      "senior": "安静時は、筋肉がゆるむと肺が元に戻る。その力で空気が出るよ。",
      "summary": "呼気＝肺の戻る力",
      "art": "A gently partly-deflated balloon with its open neck, a soft breeze beside it. Metaphor for recoil, not respiratory equipment. No hands squeezing balloon, no clinical diagram, no arrows."
    },
    {
      "page": 4,
      "title": "肺胞で\nガスを交換！",
      "junior": "吸った酸素は、どこで血液に入るんですか？",
      "senior": "肺胞の薄い壁を通って血液へ。二酸化炭素は血液から肺胞へ移るよ。",
      "summary": "酸素は血液へ／二酸化炭素は肺胞へ",
      "art": "Two friendly parcel carriers exchanging two differently colored parcels at a small trading window. Air-side character and red blood cell carrier. Metaphor only; no generated alveolus-capillary anatomical diagram, no arrows or extra labels."
    },
    {
      "page": 5,
      "title": "酸素の運び屋\nヘモグロビン",
      "junior": "酸素は、どうやって全身へ届くんですか？",
      "senior": "主に赤血球のヘモグロビンが運ぶよ。体で生まれた二酸化炭素は、血液で肺へ戻るんだ。",
      "summary": "酸素を届ける／二酸化炭素を戻す",
      "art": "A friendly red blood cell courier carrying oxygen-like colorful parcels beside a simple human silhouette. No extra text, labels, vascular routes or arrows. Concept of delivery, not molecular structure."
    },
    {
      "page": 6,
      "title": "空気と血液\n両方が大切！",
      "junior": "空気が肺に入れば、酸素は十分ですか？",
      "senior": "肺胞へ空気が届く換気と、血液が流れる血流。両方がそろって酸素を渡せるよ。",
      "summary": "換気と血流をそろえる",
      "art": "Two friendly helpers: a blue air-cloud character and a red blood cell character working together to hold one oxygen parcel. Concept of cooperation, no fake circulatory pipes or arrows."
    },
    {
      "page": 7,
      "title": "酸素は\n受け取って、放す！",
      "junior": "ヘモグロビンは、酸素をずっと抱えているんですか？",
      "senior": "肺で受け取り、組織で放すよ。その結びつきやすさを示すのが、酸素解離曲線なんだ。",
      "summary": "酸素解離曲線＝結びつきの関係",
      "art": "A red blood cell character gently giving an oxygen parcel to a friendly body-cell character. Metaphor only, NOT a graph or curve. No invented curve, scientific axes or arrows."
    },
    {
      "page": 8,
      "title": "SpO₂だけで\n安心しない！",
      "junior": "SpO₂が正常なら、呼吸は大丈夫ですか？",
      "senior": "酸素化の目安だよ。二酸化炭素の排出は別。呼吸の深さ、苦しさ、意識も見よう。",
      "summary": "酸素化と換気は、別々に見る",
      "art": "Exactly two nurses, junior on left and senior on right. Senior holds observation clipboard showing a small finger pulse oximeter, breath and awareness icons with NO extra text or monitor numbers. Warm serious observation scene, no duplicate nurses.",
      "closing": "フォローしていただけると励みになります。よろしくお願いします。"
    }
  ],
  "explanations": [
    {
      "title": "ガスの移動の向き",
      "text": "酸素は肺胞から血液へ、二酸化炭素は血液から肺胞へ移ります。それぞれのガスの分圧差による拡散です。風船・蛇腹・荷物運びのイラストは、理解のための比喩です。"
    },
    {
      "title": "吸うとき・吐くときのしくみ",
      "text": "吸気では横隔膜が収縮して下がり、胸腔が広がります。肺が広がることで肺胞内の圧が外気より低くなり、気道を通って空気が入ります。空気が胸腔そのものに入るわけではありません。外肋間筋なども吸気に関わります。 安静時の呼気は主に受動的です。吸気筋がゆるみ、肺・胸郭の弾性による戻る力で肺胞内の圧が外気より高くなり、空気が出ます。運動時や努力して吐くとき、病状によっては呼気にも筋肉の働きが加わります。"
    },
    {
      "title": "換気・ガス交換・血流の違い",
      "text": "換気は空気の出入りです。そのうち肺胞に届く換気が、ガス交換と二酸化炭素の排出に関わります。肺胞と毛細血管の薄い壁を通るガス交換には、肺胞への空気と、肺の毛細血管を流れる血液の両方が必要です。どちらかが不足したり、釣り合いが崩れたりすると、十分に酸素を取り込めないことがあります。"
    },
    {
      "title": "外呼吸・内呼吸・細胞呼吸",
      "text": "外呼吸は肺胞と血液のガス交換、内呼吸は血液と体の組織のガス交換を指します。細胞が酸素を使ってエネルギーを得る過程は細胞呼吸です。内呼吸と細胞呼吸は区別して理解しましょう。"
    },
    {
      "title": "ヘモグロビンと酸素解離曲線",
      "text": "酸素は主に赤血球のヘモグロビンと結合して運ばれ、一部は血漿に溶けています。二酸化炭素は主に重炭酸イオンの形で運ばれます。酸素と二酸化炭素の運び方は同じではありません。 酸素解離曲線は、酸素分圧とヘモグロビンの酸素飽和度の関係を示すS字状の曲線です。肺で酸素を受け取り、組織で放すしくみを理解する手がかりになります。二酸化炭素の増加、pHの低下、温度の上昇などでは右に移動し、同じ酸素分圧で酸素を放しやすくなります。"
    },
    {
      "title": "SpO₂と呼吸の観察",
      "text": "SpO₂は、パルスオキシメータで推定する動脈血の酸素飽和度です。酸素化の目安になりますが、二酸化炭素の量は測定しません。酸素の値が保たれていても、換気が十分とは限りません。二酸化炭素の評価には、必要に応じて血液ガスなどを用います。 呼吸数だけでなく、深さ、努力呼吸、息苦しさ、意識状態、経過を合わせて観察します。体動や末梢の冷えなどで測定値に誤差が出ることもあります。急な呼吸困難や意識の変化は、数値だけで安心せず、速やかに指導者・担当者へ報告して評価につなげます。"
    }
  ],
  "sources": [
    {
      "title": "NHLBI：How the Lungs Work — The Respiratory System",
      "url": "https://www.nhlbi.nih.gov/health/lungs/respiratory-system"
    },
    {
      "title": "NHLBI：What Breathing Does for the Body",
      "url": "https://www.nhlbi.nih.gov/health/lungs/breathing-benefits"
    },
    {
      "title": "NHLBI：How Your Body Controls Breathing",
      "url": "https://www.nhlbi.nih.gov/health/lungs/body-controls-breathing"
    },
    {
      "title": "OpenStax：Anatomy and Physiology 2e — Gas Exchange",
      "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/22-4-gas-exchange"
    },
    {
      "title": "OpenStax：Anatomy and Physiology 2e — Transport of Gases",
      "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/22-5-transport-of-gases"
    },
    {
      "title": "American Thoracic Society：Pulse Oximetry",
      "url": "https://www.thoracic.org/patients/patient-resources/resources/pulse-oximetry.pdf"
    },
    {
      "title": "MedlinePlus：Pulse Oximetry",
      "url": "https://medlineplus.gov/lab-tests/pulse-oximetry/"
    },
    {
      "title": "NHLBI：Respiratory Failure — Symptoms",
      "url": "https://www.nhlbi.nih.gov/health/respiratory-failure/symptoms"
    }
  ]
};
