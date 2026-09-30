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
