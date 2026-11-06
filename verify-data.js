/*! verify-data.js — tools/build-verify-checklist.mjs が自動生成。直接編集しないこと。 */
var VERIFY_DATA = {
 "generated": "2026-11-02",
 "total": 456,
 "stars": 251,
 "byConf": {
  "solid": 73,
  "facility": 73,
  "varies": 18,
  "design": 292
 },
 "sections": [
  {
   "id": "ref",
   "title": "基準値",
   "lead": "既定値は JCCLS 共用基準範囲（成人）。「施設依存」は JCCLS 未収載のため一般的な施設値を採用しています。手元の書籍および自施設の検査室基準と照合してください。",
   "items": [
    {
     "id": "cbc.wbc",
     "label": "WBC 白血球数",
     "detail": "3300〜8600 /µL",
     "tag": "JCCLS",
     "group": "血算／白血球系",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.neut",
     "label": "好中球（分葉核＋桿状核）",
     "detail": "38.0〜74.0 %",
     "tag": "JCCLS",
     "group": "血算／白血球分画",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.lymph",
     "label": "リンパ球",
     "detail": "16.0〜49.0 %",
     "tag": "JCCLS",
     "group": "血算／白血球分画",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.mono",
     "label": "単球",
     "detail": "2.0〜10.0 %",
     "tag": "JCCLS",
     "group": "血算／白血球分画",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.eo",
     "label": "好酸球",
     "detail": "0.0〜7.0 %",
     "tag": "JCCLS",
     "group": "血算／白血球分画",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.baso",
     "label": "好塩基球",
     "detail": "0.0〜2.0 %",
     "tag": "JCCLS",
     "group": "血算／白血球分画",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.blast",
     "label": "芽球",
     "detail": "0.0〜0.0 %",
     "tag": "JCCLS",
     "group": "血算／白血球分画",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.atyp",
     "label": "異型リンパ球",
     "detail": "0.0〜0.0 %",
     "tag": "JCCLS",
     "group": "血算／白血球分画",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.rbc",
     "label": "RBC 赤血球数",
     "detail": "男 4.35〜5.55／女 3.86〜4.92 ×10⁶/µL",
     "tag": "JCCLS",
     "group": "血算／赤血球系",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.hb",
     "label": "Hb ヘモグロビン",
     "detail": "男 13.7〜16.8／女 11.6〜14.8 g/dL",
     "tag": "JCCLS",
     "group": "血算／赤血球系",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.ht",
     "label": "Ht ヘマトクリット",
     "detail": "男 40.7〜50.1／女 35.1〜44.4 %",
     "tag": "JCCLS",
     "group": "血算／赤血球系",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "cbc.rdw",
     "label": "RDW 赤血球大小不同",
     "detail": "11.5〜14.5 %",
     "tag": "施設依存",
     "group": "血算／赤血球系",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "cbc.retic",
     "label": "網赤血球",
     "detail": "0.50〜2.00 %",
     "tag": "施設依存",
     "group": "血算／赤血球系",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "cbc.plt",
     "label": "PLT 血小板数",
     "detail": "15.8〜34.8 ×10⁴/µL（万）",
     "tag": "JCCLS",
     "group": "血算／血小板",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ast",
     "label": "AST（GOT）",
     "detail": "13〜30 U/L",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.alt",
     "label": "ALT（GPT）",
     "detail": "男 10〜42／女 7〜23 U/L",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ld",
     "label": "LD（LDH・IFCC法）",
     "detail": "124〜222 U/L",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.alp",
     "label": "ALP（IFCC法）",
     "detail": "38〜113 U/L",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ggt",
     "label": "γ-GT（γ-GTP）",
     "detail": "男 13〜64／女 9〜32 U/L",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.tbil",
     "label": "総ビリルビン",
     "detail": "0.4〜1.5 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.dbil",
     "label": "直接ビリルビン",
     "detail": "0.0〜0.4 mg/dL",
     "tag": "施設依存",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.che",
     "label": "ChE（コリンエステラーゼ）",
     "detail": "男 240〜486／女 201〜421 U/L",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.tp",
     "label": "総蛋白",
     "detail": "6.6〜8.1 g/dL",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.alb",
     "label": "アルブミン",
     "detail": "4.1〜5.1 g/dL",
     "tag": "JCCLS",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.nh3",
     "label": "アンモニア（NH₃）",
     "detail": "12〜66 µg/dL",
     "tag": "施設依存",
     "group": "生化学／肝・胆道",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.bun",
     "label": "尿素窒素（BUN・UN）",
     "detail": "8.0〜20.0 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／腎・尿酸",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.cr",
     "label": "クレアチニン",
     "detail": "男 0.65〜1.07／女 0.46〜0.79 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／腎・尿酸",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ua",
     "label": "尿酸",
     "detail": "男 3.7〜7.8／女 2.6〜5.5 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／腎・尿酸",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.na",
     "label": "ナトリウム（Na）",
     "detail": "138〜145 mmol/L",
     "tag": "JCCLS",
     "group": "生化学／電解質・ミネラル",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.k",
     "label": "カリウム（K）",
     "detail": "3.6〜4.8 mmol/L",
     "tag": "JCCLS",
     "group": "生化学／電解質・ミネラル",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.cl",
     "label": "クロール（Cl）",
     "detail": "101〜108 mmol/L",
     "tag": "JCCLS",
     "group": "生化学／電解質・ミネラル",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ca",
     "label": "カルシウム（Ca）",
     "detail": "8.8〜10.1 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／電解質・ミネラル",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ip",
     "label": "無機リン（P）",
     "detail": "2.7〜4.6 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／電解質・ミネラル",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.mg",
     "label": "マグネシウム（Mg）",
     "detail": "1.8〜2.4 mg/dL",
     "tag": "施設依存",
     "group": "生化学／電解質・ミネラル",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.hco3",
     "label": "重炭酸イオン（HCO₃⁻）",
     "detail": "22.0〜26.0 mmol/L",
     "tag": "施設依存",
     "group": "生化学／電解質・ミネラル",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.glu",
     "label": "血糖（グルコース）",
     "detail": "73〜109 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／代謝・栄養",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.hba1c",
     "label": "HbA1c（NGSP）",
     "detail": "4.9〜6.0 %",
     "tag": "JCCLS",
     "group": "生化学／代謝・栄養",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.tcho",
     "label": "総コレステロール",
     "detail": "142〜248 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／代謝・栄養",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ldl",
     "label": "LDL コレステロール",
     "detail": "65〜163 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／代謝・栄養",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.hdl",
     "label": "HDL コレステロール",
     "detail": "男 38〜90／女 48〜103 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／代謝・栄養",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.tg",
     "label": "中性脂肪（TG）",
     "detail": "男 40〜234／女 30〜117 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／代謝・栄養",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ck",
     "label": "CK（CPK）",
     "detail": "男 59〜248／女 41〜153 U/L",
     "tag": "JCCLS",
     "group": "生化学／心・筋",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.ckmb",
     "label": "CK-MB",
     "detail": "0〜25 U/L",
     "tag": "施設依存",
     "group": "生化学／心・筋",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.tnt",
     "label": "トロポニン（I または T）",
     "detail": "0.000〜0.014 ng/mL",
     "tag": "施設依存",
     "group": "生化学／心・筋",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.bnp",
     "label": "BNP",
     "detail": "0.0〜18.4 pg/mL",
     "tag": "施設依存",
     "group": "生化学／心・筋",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.ntprobnp",
     "label": "NT-proBNP",
     "detail": "0〜125 pg/mL",
     "tag": "施設依存",
     "group": "生化学／心・筋",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.amy",
     "label": "アミラーゼ（AMY）",
     "detail": "44〜132 U/L",
     "tag": "JCCLS",
     "group": "生化学／膵",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.lip",
     "label": "リパーゼ",
     "detail": "13〜55 U/L",
     "tag": "施設依存",
     "group": "生化学／膵",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.crp",
     "label": "CRP",
     "detail": "0.00〜0.14 mg/dL",
     "tag": "JCCLS",
     "group": "生化学／炎症・感染",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "chem.pct",
     "label": "プロカルシトニン（PCT）",
     "detail": "0.00〜0.05 ng/mL",
     "tag": "施設依存",
     "group": "生化学／炎症・感染",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.lac",
     "label": "乳酸（ラクテート）",
     "detail": "0.5〜1.6 mmol/L",
     "tag": "施設依存",
     "group": "生化学／炎症・感染",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.sosm",
     "label": "血清浸透圧（実測）",
     "detail": "275〜290 mOsm/kg",
     "tag": "施設依存",
     "group": "生化学／神経・体液",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.uosm",
     "label": "尿浸透圧",
     "detail": "50〜1300 mOsm/kg",
     "tag": "施設依存",
     "group": "生化学／神経・体液",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.una",
     "label": "尿中ナトリウム（随時尿）",
     "detail": "20〜220 mmol/L",
     "tag": "施設依存",
     "group": "生化学／神経・体液",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "chem.usg",
     "label": "尿比重",
     "detail": "1.005〜1.030",
     "tag": "施設依存",
     "group": "生化学／神経・体液",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.plt",
     "label": "PLT 血小板数",
     "detail": "15.8〜34.8 ×10⁴/µL（万）",
     "tag": "JCCLS",
     "group": "凝固・線溶／血小板",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "coag.ptsec",
     "label": "PT（プロトロンビン時間）",
     "detail": "10.0〜13.0 秒",
     "tag": "施設依存",
     "group": "凝固・線溶／外因系（PT）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.ptpct",
     "label": "PT 活性",
     "detail": "70〜130 %",
     "tag": "施設依存",
     "group": "凝固・線溶／外因系（PT）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.inr",
     "label": "PT-INR",
     "detail": "0.90〜1.10",
     "tag": "施設依存",
     "group": "凝固・線溶／外因系（PT）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.aptt",
     "label": "APTT（活性化部分トロンボプラスチン時間）",
     "detail": "25.0〜40.0 秒",
     "tag": "施設依存",
     "group": "凝固・線溶／内因系（APTT）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.fib",
     "label": "フィブリノゲン",
     "detail": "200〜400 mg/dL",
     "tag": "施設依存",
     "group": "凝固・線溶／線溶・凝固因子",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.fdp",
     "label": "FDP（フィブリン分解産物）",
     "detail": "0.0〜5.0 µg/mL",
     "tag": "施設依存",
     "group": "凝固・線溶／線溶・凝固因子",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.ddimer",
     "label": "D-ダイマー",
     "detail": "0.00〜1.00 µg/mL",
     "tag": "施設依存",
     "group": "凝固・線溶／線溶・凝固因子",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.at3",
     "label": "アンチトロンビン（AT-III）",
     "detail": "80〜130 %",
     "tag": "施設依存",
     "group": "凝固・線溶／線溶・凝固因子",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "coag.tat",
     "label": "TAT（トロンビン-アンチトロンビン複合体）",
     "detail": "0.0〜4.0 ng/mL",
     "tag": "施設依存",
     "group": "凝固・線溶／線溶・凝固因子",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.c3",
     "label": "補体 C3",
     "detail": "73〜138 mg/dL",
     "tag": "施設依存",
     "group": "自己抗体／スクリーニング",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.c4",
     "label": "補体 C4",
     "detail": "11〜31 mg/dL",
     "tag": "施設依存",
     "group": "自己抗体／スクリーニング",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.ch50",
     "label": "CH50（血清補体価）",
     "detail": "30〜50 U/mL",
     "tag": "施設依存",
     "group": "自己抗体／スクリーニング",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.igg",
     "label": "IgG",
     "detail": "861〜1747 mg/dL",
     "tag": "施設依存",
     "group": "自己抗体／スクリーニング",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.igg4",
     "label": "IgG4",
     "detail": "11〜121 mg/dL",
     "tag": "施設依存",
     "group": "自己抗体／スクリーニング",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.sil2r",
     "label": "可溶性IL-2レセプター",
     "detail": "122〜496 U/mL",
     "tag": "施設依存",
     "group": "自己抗体／スクリーニング",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.dsdna",
     "label": "抗 dsDNA 抗体",
     "detail": "0.0〜12.0 IU/mL",
     "tag": "施設依存",
     "group": "自己抗体／膠原病特異抗体",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.mpo",
     "label": "MPO-ANCA（P-ANCA）",
     "detail": "0.0〜3.5 U/mL",
     "tag": "施設依存",
     "group": "自己抗体／血管炎・抗リン脂質",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.pr3",
     "label": "PR3-ANCA（C-ANCA）",
     "detail": "0.0〜3.5 U/mL",
     "tag": "施設依存",
     "group": "自己抗体／血管炎・抗リン脂質",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.rf",
     "label": "リウマトイド因子（RF）",
     "detail": "0.0〜15.0 IU/mL",
     "tag": "施設依存",
     "group": "自己抗体／関節リウマチ",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.ccp",
     "label": "抗 CCP 抗体",
     "detail": "0.0〜4.5 U/mL",
     "tag": "施設依存",
     "group": "自己抗体／関節リウマチ",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.mmp3",
     "label": "MMP-3",
     "detail": "男 36.9〜121.0／女 17.3〜59.7 ng/mL",
     "tag": "施設依存",
     "group": "自己抗体／関節リウマチ",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.trab",
     "label": "TRAb（TSH受容体抗体）",
     "detail": "0.0〜2.0 IU/L",
     "tag": "施設依存",
     "group": "自己抗体／甲状腺",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.achr",
     "label": "抗 AChR（アセチルコリン受容体）抗体",
     "detail": "0.00〜0.20 nmol/L",
     "tag": "施設依存",
     "group": "自己抗体／神経・筋",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "autoab.gad",
     "label": "抗 GAD 抗体",
     "detail": "0.0〜5.0 U/mL",
     "tag": "施設依存",
     "group": "自己抗体／内分泌・皮膚",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.ph",
     "label": "pH",
     "detail": "7.350〜7.450",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／動脈血ガス",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.paco2",
     "label": "PaCO₂",
     "detail": "35.0〜45.0 mmHg",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／動脈血ガス",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.hco3",
     "label": "HCO₃⁻",
     "detail": "22.0〜26.0 mmol/L",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／動脈血ガス",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.be",
     "label": "BE（base excess）",
     "detail": "-2.0〜2.0 mmol/L",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／動脈血ガス",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.pao2",
     "label": "PaO₂",
     "detail": "80.0〜100.0 mmHg",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／動脈血ガス",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.fio2",
     "label": "FiO₂",
     "detail": "0.21〜1.00 （0.21〜1.0）",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／動脈血ガス",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.na",
     "label": "ナトリウム（Na）",
     "detail": "138〜145 mmol/L",
     "tag": "JCCLS",
     "group": "血液ガス・酸塩基平衡／電解質（AG計算用）",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.cl",
     "label": "クロール（Cl）",
     "detail": "101〜108 mmol/L",
     "tag": "JCCLS",
     "group": "血液ガス・酸塩基平衡／電解質（AG計算用）",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.alb",
     "label": "アルブミン",
     "detail": "4.1〜5.1 g/dL",
     "tag": "JCCLS",
     "group": "血液ガス・酸塩基平衡／電解質（AG計算用）",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.lac",
     "label": "乳酸（ラクテート）",
     "detail": "0.5〜1.6 mmol/L",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／電解質（AG計算用）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.glu",
     "label": "血糖",
     "detail": "73〜109 mg/dL",
     "tag": "JCCLS",
     "group": "血液ガス・酸塩基平衡／電解質（AG計算用）",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.bun",
     "label": "尿素窒素（BUN）",
     "detail": "8.0〜20.0 mg/dL",
     "tag": "JCCLS",
     "group": "血液ガス・酸塩基平衡／電解質（AG計算用）",
     "star": false,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.sosm",
     "label": "血清浸透圧（実測）",
     "detail": "275〜290 mOsm/kg",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／電解質（AG計算用）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.una",
     "label": "尿中Na",
     "detail": "20〜220 mmol/L",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／尿電解質（尿AG用）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.uk",
     "label": "尿中K",
     "detail": "20〜80 mmol/L",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／尿電解質（尿AG用）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    },
    {
     "id": "abg.ucl",
     "label": "尿中Cl",
     "detail": "20〜250 mmol/L",
     "tag": "施設依存",
     "group": "血液ガス・酸塩基平衡／尿電解質（尿AG用）",
     "star": false,
     "conf": "facility",
     "confNote": "JCCLS 未収載。自施設の検査室基準で確認してください。"
    }
   ]
  },
  {
   "id": "panic",
   "title": "パニック値の閾値",
   "lead": "パニック値は施設規定が最優先されます。自施設の規定と必ず突き合わせてください。",
   "items": [
    {
     "id": "panic.wbc",
     "label": "WBC 白血球数",
     "detail": "下限 1000／上限 30000 /µL",
     "tag": "要確認",
     "group": "血算",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.hb",
     "label": "Hb ヘモグロビン",
     "detail": "下限 6／上限 20 g/dL",
     "tag": "要確認",
     "group": "血算",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.plt",
     "label": "PLT 血小板数",
     "detail": "下限 2／上限 100 ×10⁴/µL（万）",
     "tag": "要確認",
     "group": "血算",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.tbil",
     "label": "総ビリルビン",
     "detail": "上限 15 mg/dL",
     "tag": "要確認",
     "group": "生化学",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.nh3",
     "label": "アンモニア（NH₃）",
     "detail": "上限 150 µg/dL",
     "tag": "要確認",
     "group": "生化学",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.cr",
     "label": "クレアチニン",
     "detail": "上限 5 mg/dL",
     "tag": "要確認",
     "group": "生化学",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.na",
     "label": "ナトリウム（Na）",
     "detail": "下限 120／上限 160 mmol/L",
     "tag": "要確認",
     "group": "生化学",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.k",
     "label": "カリウム（K）",
     "detail": "下限 2.5／上限 6.5 mmol/L",
     "tag": "要確認",
     "group": "生化学",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.glu",
     "label": "血糖（グルコース）",
     "detail": "下限 50／上限 500 mg/dL",
     "tag": "要確認",
     "group": "生化学",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.ck",
     "label": "CK（CPK）",
     "detail": "上限 5000 U/L",
     "tag": "要確認",
     "group": "生化学",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.lac",
     "label": "乳酸（ラクテート）",
     "detail": "上限 4 mmol/L",
     "tag": "要確認",
     "group": "生化学",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.plt",
     "label": "PLT 血小板数",
     "detail": "下限 2／上限 100 ×10⁴/µL（万）",
     "tag": "要確認",
     "group": "凝固・線溶",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.inr",
     "label": "PT-INR",
     "detail": "上限 5",
     "tag": "要確認",
     "group": "凝固・線溶",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.aptt",
     "label": "APTT（活性化部分トロンボプラスチン時間）",
     "detail": "上限 100 秒",
     "tag": "要確認",
     "group": "凝固・線溶",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.fib",
     "label": "フィブリノゲン",
     "detail": "下限 100 mg/dL",
     "tag": "要確認",
     "group": "凝固・線溶",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.ph",
     "label": "pH",
     "detail": "下限 7.2／上限 7.6",
     "tag": "要確認",
     "group": "血液ガス・酸塩基平衡",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.paco2",
     "label": "PaCO₂",
     "detail": "下限 20／上限 70 mmHg",
     "tag": "要確認",
     "group": "血液ガス・酸塩基平衡",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.pao2",
     "label": "PaO₂",
     "detail": "下限 50 mmHg",
     "tag": "要確認",
     "group": "血液ガス・酸塩基平衡",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.na",
     "label": "ナトリウム（Na）",
     "detail": "下限 120／上限 160 mmol/L",
     "tag": "要確認",
     "group": "血液ガス・酸塩基平衡",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.lac",
     "label": "乳酸（ラクテート）",
     "detail": "上限 4 mmol/L",
     "tag": "要確認",
     "group": "血液ガス・酸塩基平衡",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    },
    {
     "id": "panic.glu",
     "label": "血糖",
     "detail": "下限 50／上限 500 mg/dL",
     "tag": "要確認",
     "group": "血液ガス・酸塩基平衡",
     "star": true,
     "conf": "facility",
     "confNote": "パニック値は施設規定が最優先。自施設の規定で上書きしてください。"
    }
   ]
  },
  {
   "id": "abg",
   "title": "酸塩基平衡の計算式・閾値",
   "lead": "血液ガス読影の中核。代償式は実装から読み出しています。式そのものの妥当性を照合してください。",
   "items": [
    {
     "id": "abg.ph",
     "label": "pH 判定域",
     "detail": "アシデミア <7.35／正常 7.35〜7.45／アルカレミア >7.45",
     "star": true,
     "refs": [],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.primary",
     "label": "一次性障害の境界",
     "detail": "HCO₃⁻ <22 / >26 mmol/L、PaCO₂ <35 / >45 mmHg",
     "star": true,
     "refs": [],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.winter",
     "label": "代謝性アシドーシスの代償（Winter 式）",
     "detail": "Winter 式：期待 PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2",
     "star": true,
     "refs": [
      "WINTER"
     ],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.metalk",
     "label": "代謝性アルカローシスの代償",
     "detail": "期待 PaCO₂ = 0.6 × (HCO₃⁻ − 24) + 40 ± 5（係数は出典により 0.6〜0.7）",
     "star": true,
     "refs": [],
     "conf": "varies",
     "confNote": "係数 0.6 と 0.7 の二系統がある。本アプリは国内の成書に合わせて 0.6 を採用（2026-10-31 に 0.7 から変更）。"
    },
    {
     "id": "abg.ra",
     "label": "呼吸性アシドーシスの代償",
     "detail": "急性：急性呼吸性アシドーシス：PaCO₂ 10 mmHg 上昇につき HCO₃⁻ 1.0 mmol/L 上昇 ± 2\n慢性：慢性呼吸性アシドーシス：PaCO₂ 10 mmHg 上昇につき HCO₃⁻ 3.5 mmol/L 上昇 ± 2",
     "star": true,
     "refs": [],
     "conf": "varies",
     "confNote": "慢性呼吸性アシドーシスの代償係数は 3.5 と 4.0 の二系統がある。本アプリは 3.5。"
    },
    {
     "id": "abg.ralk",
     "label": "呼吸性アルカローシスの代償",
     "detail": "急性：急性呼吸性アルカローシス：PaCO₂ 10 mmHg 低下につき HCO₃⁻ 2.0 mmol/L 低下 ± 2\n慢性：慢性呼吸性アルカローシス：PaCO₂ 10 mmHg 低下につき HCO₃⁻ 4.0 mmol/L 低下 ± 2",
     "star": true,
     "refs": [],
     "conf": "varies",
     "confNote": "慢性呼吸性アルカローシスの代償係数は 4.0 と 5.0 の二系統がある。本アプリは 4.0。"
    },
    {
     "id": "abg.ag",
     "label": "アニオンギャップ",
     "detail": "AG = Na − (Cl + HCO₃⁻)、基準 12 ± 2、開大の判定は補正後 >14",
     "star": true,
     "refs": [],
     "conf": "varies",
     "confNote": "AG の基準は測定法により異なり、12 ± 2 とする文献と 8〜12 とする文献がある。本アプリは 12 ± 2、開大の判定は補正後 >14。"
    },
    {
     "id": "abg.agcorr",
     "label": "アルブミン補正",
     "detail": "補正AG = AG + 2.5 × (4.0 − Alb)",
     "star": true,
     "refs": [
      "FIGGE"
     ],
     "conf": "varies",
     "confNote": "アルブミン補正の係数は 2.5 が主流だが 2.0 を採る文献もある。本アプリは 2.5。"
    },
    {
     "id": "abg.delta",
     "label": "Δ比（デルタ比）",
     "detail": "(補正AG − 12) ÷ (24 − HCO₃⁻)。<0.4 高Cl性主体／0.4〜0.8 混合／0.8〜2.0 純粋なAG開大／>2.0 代謝性アルカローシス合併",
     "star": true,
     "refs": [],
     "conf": "varies",
     "confNote": "Δ比で純粋な AG開大性とみなす下限が 0.8 と 1.0 で割れる。本アプリは 0.8。"
    },
    {
     "id": "abg.goldmark",
     "label": "AG開大の鑑別",
     "detail": "GOLD MARK（Glycols／Oxoproline／L-lactate／D-lactate／Methanol／Aspirin／Renal failure／Ketoacidosis）",
     "star": false,
     "refs": [
      "GOLDMARK"
     ],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.uag",
     "label": "尿アニオンギャップ",
     "detail": "尿Na + 尿K − 尿Cl。陽性＝腎性（遠位RTA）／陰性＝腎外性（下痢）",
     "star": true,
     "refs": [
      "UAG"
     ],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.aado2",
     "label": "A-aDO₂",
     "detail": "FiO₂ × (760 − 47) − PaCO₂/0.8 − PaO₂、正常上限の目安 = 年齢/4 + 4",
     "star": true,
     "refs": [],
     "conf": "varies",
     "confNote": "年齢補正式は「年齢/4 + 4」と「2.5 + 0.21 × 年齢」の二系統がある。本アプリは前者。"
    },
    {
     "id": "abg.pf",
     "label": "P/F 比と ARDS 重症度",
     "detail": "≦300 軽症／≦200 中等症／≦100 重症（PEEP ≧5 cmH₂O 下）",
     "star": true,
     "refs": [
      "BERLIN"
     ],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "abg.osm",
     "label": "推算血清浸透圧と浸透圧ギャップ",
     "detail": "2×Na + 血糖/18 + BUN/2.8、ギャップ >10 mOsm/kg で開大",
     "star": true,
     "refs": [],
     "conf": "varies",
     "confNote": "推算式は 2×Na + 血糖/18 + BUN/2.8 を採用。1.86×Na を使う式もある。"
    },
    {
     "id": "abg.respfail",
     "label": "呼吸不全の定義",
     "detail": "PaO₂ ≦60 mmHg。PaCO₂ ≦45 で I 型、>45 で II 型",
     "star": true,
     "refs": [],
     "conf": "solid",
     "confNote": ""
    }
   ]
  },
  {
   "id": "calc",
   "title": "その他の計算式",
   "lead": "",
   "items": [
    {
     "id": "calc.egfr",
     "label": "eGFR（日本人推算式）",
     "detail": "194 × Cr^−1.094 × 年齢^−0.287（女性 × 0.739）",
     "star": true,
     "refs": [
      "EGFR_JP"
     ],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "calc.cca",
     "label": "補正カルシウム（Payne 式）",
     "detail": "Ca + (4.0 − Alb)、Alb <4.0 のときのみ補正",
     "star": true,
     "refs": [
      "PAYNE"
     ],
     "conf": "varies",
     "confNote": "Payne 式の補正基準アルブミンは 4.0 g/dL を採用。4.5 を採る文献もある。"
    },
    {
     "id": "calc.mcv",
     "label": "赤血球指数",
     "detail": "MCV = Ht×10/RBC、MCH = Hb×10/RBC、MCHC = Hb/Ht×100",
     "star": false,
     "refs": [],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "calc.anc",
     "label": "好中球絶対数",
     "detail": "WBC × 好中球% ÷ 100。<1500 好中球減少、<500 高度",
     "star": true,
     "refs": [],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "calc.retic",
     "label": "網赤血球絶対数",
     "detail": "RBC(×10⁶/µL) × 10000 × 網赤血球(%)。>10万 増加、<2.5万 低値",
     "star": true,
     "refs": [],
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "calc.buncr",
     "label": "BUN／Cr 比",
     "detail": ">20 で腎前性・消化管出血を示唆",
     "star": false,
     "refs": [],
     "conf": "varies",
     "confNote": "20 という閾値は目安であり、明確な原典上のカットオフではない。"
    },
    {
     "id": "calc.deritis",
     "label": "De Ritis 比（AST/ALT）",
     "detail": "≧2 でアルコール性・肝硬変、<1 で慢性肝炎を示唆",
     "star": false,
     "refs": [],
     "conf": "varies",
     "confNote": "2 という閾値は目安。"
    }
   ]
  },
  {
   "id": "score",
   "title": "臨床スコア（項目・配点・カットオフ）",
   "lead": "配点とカットオフが原典どおりかを確認してください。",
   "items": [
    {
     "id": "score.qsofa",
     "label": "qSOFA",
     "detail": "呼吸数 ≧22 /分（+1）　|　意識変容（GCS <15）（+1）　|　収縮期血圧 ≦100 mmHg（+1）",
     "group": "感染症",
     "note": "ICU外での敗血症スクリーニング。2点以上で院内死亡リスクが上昇し、臓器障害の評価（SOFA）へ進みます。診断そのものではなく、警戒を引き上げる道具です。",
     "refs": [
      "SEPSIS3"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.sofa",
     "label": "SOFA スコア",
     "detail": "呼吸（P/F 比）：≧400 +0／<400 +1／<300 +2／<200（呼吸補助下） +3／<100（呼吸補助下） +4　|　凝固（血小板 ×10³/µL）：≧150 +0／<150 +1／<100 +2／<50 +3／<20 +4　|　肝（総ビリルビン mg/dL）：<1.2 +0／1.2〜1.9 +1／2.0〜5.9 +2／6.0〜11.9 +3／≧12.0 +4　|　循環：平均血圧 ≧70 mmHg +0／平均血圧 <70 mmHg +1／ドパミン ≦5 or ドブタミン +2／ドパミン >5 or ノルアド ≦0.1 +3／ドパミン >15 or ノルアド >0.1 +4　|　中枢神経（GCS）：15 +0／13〜14 +1／10〜12 +2／6〜9 +3／<6 +4　|　腎（Cr mg/dL または尿量）：<1.2 +0／1.2〜1.9 +1／2.0〜3.4 +2／3.5〜4.9 または尿量 <500 mL/日 +3／≧5.0 または尿量 <200 mL/日 +4",
     "group": "感染症",
     "note": "6臓器の障害度を 0〜4 点で評価します。Sepsis-3 では、感染に伴う SOFA の2点以上の急上昇をもって敗血症と定義します。",
     "refs": [
      "SOFA",
      "SEPSIS3"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.curb65",
     "label": "CURB-65",
     "detail": "意識障害（Confusion）（+1）　|　BUN >19 mg/dL（+1）　|　呼吸数 ≧30 /分（+1）　|　収縮期血圧 <90 または拡張期血圧 ≦60 mmHg（+1）　|　年齢 ≧65 歳（+1）",
     "group": "感染症",
     "note": "市中肺炎の重症度評価。0〜1点は外来治療、2点は入院を考慮、3点以上は重症で ICU 管理も検討します。",
     "refs": [
      "CURB65"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.adrop",
     "label": "A-DROP",
     "detail": "年齢（男性 ≧70歳／女性 ≧75歳）（+1）　|　脱水（BUN ≧21 mg/dL）（+1）　|　SpO₂ ≦90%（または PaO₂ ≦60 mmHg）（+1）　|　意識障害（+1）　|　収縮期血圧 ≦90 mmHg（+1）",
     "group": "感染症",
     "note": "日本呼吸器学会による市中肺炎の重症度分類。ショックがあれば点数によらず超重症と扱います。",
     "refs": [
      "ADROP"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.mcisaac",
     "label": "McIsaac（修正Centor）スコア",
     "detail": "体温 >38℃（+1）　|　咳がない（+1）　|　前頸部リンパ節の腫脹・圧痛（+1）　|　扁桃の腫脹または滲出物（+1）　|　年齢：3〜14 歳 +1／15〜44 歳 +0／45 歳以上 -1",
     "group": "感染症",
     "note": "急性咽頭炎における A群β溶血性レンサ球菌の事前確率。抗菌薬の要否判断に使います。",
     "refs": [
      "CENTOR"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.news2",
     "label": "NEWS2",
     "detail": "呼吸数 /分：≦8 +3／9〜11 +1／12〜20 +0／21〜24 +2／≧25 +3　|　SpO₂（スケール1）：≧96% +0／94〜95% +1／92〜93% +2／≦91% +3　|　酸素投与あり（+2）　|　収縮期血圧 mmHg：≦90 +3／91〜100 +2／101〜110 +1／111〜219 +0／≧220 +3　|　心拍数 /分：≦40 +3／41〜50 +1／51〜90 +0／91〜110 +1／111〜130 +2／≧131 +3　|　意識：清明 +0／新規の意識変容・傾眠・不穏 +3　|　体温 ℃：≦35.0 +3／35.1〜36.0 +1／36.1〜38.0 +0／38.1〜39.0 +1／≧39.1 +2",
     "group": "全身",
     "note": "バイタルサインから急変リスクを点数化します。5点以上で緊急の評価、7点以上で救急対応チームの要請が目安です。",
     "refs": [
      "NEWS2"
     ],
     "star": true,
     "conf": "varies",
     "confNote": "SpO₂ はスケール1のみ実装。慢性II型呼吸不全に用いるスケール2は未実装。"
    },
    {
     "id": "score.chadsvasc",
     "label": "CHA₂DS₂-VASc",
     "detail": "うっ血性心不全／左室機能障害（+1）　|　高血圧（+1）　|　年齢 ≧75 歳（+2）　|　糖尿病（+1）　|　脳卒中／TIA／血栓塞栓症の既往（+2）　|　血管疾患（心筋梗塞・末梢動脈疾患・大動脈プラーク）（+1）　|　年齢 65〜74 歳（+1）　|　女性（+1）",
     "group": "循環器",
     "note": "心房細動における脳梗塞・全身性塞栓症のリスク。抗凝固療法の適応判断に用います。",
     "refs": [
      "CHADSVASC"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.hasbled",
     "label": "HAS-BLED",
     "detail": "高血圧（収縮期 >160 mmHg）（+1）　|　腎機能障害（透析・移植・Cr >2.26 mg/dL）（+1）　|　肝機能障害（肝硬変、Bil >2倍 かつ AST/ALT >3倍）（+1）　|　脳卒中の既往（+1）　|　出血の既往または素因（+1）　|　INR 不安定（TTR 低値）（+1）　|　年齢 >65 歳（+1）　|　薬剤（抗血小板薬・NSAIDs）（+1）　|　アルコール多飲（週8単位以上）（+1）",
     "group": "循環器",
     "note": "抗凝固療法中の大出血リスク。3点以上で高リスクですが、抗凝固を中止する根拠ではなく、是正可能な因子を潰すための道具です。",
     "refs": [
      "HASBLED"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.wellsdvt",
     "label": "Wells スコア（深部静脈血栓症）",
     "detail": "活動性の悪性腫瘍（治療中・6か月以内・緩和治療中）（+1）　|　麻痺・不全麻痺・下肢のギプス固定（+1）　|　3日以上の臥床、または12週以内の大手術（+1）　|　深部静脈の走行に沿った圧痛（+1）　|　下肢全体の腫脹（+1）　|　腓腹部周囲径の左右差 >3 cm（+1）　|　患肢に限局した圧痕性浮腫（+1）　|　表在静脈の側副血行（静脈瘤ではない）（+1）　|　DVT の既往（+1）　|　DVT より可能性の高い他の診断がある（+-2）",
     "group": "循環器",
     "note": "DVT の事前確率。低確率かつ D-ダイマー陰性なら、画像検査なしに DVT を除外できる水準です。",
     "refs": [
      "WELLS_DVT"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.wellspe",
     "label": "Wells スコア（肺血栓塞栓症）",
     "detail": "DVT の臨床症状・徴候：なし +0／あり +3　|　PE より可能性の高い他の診断がない：他診断が濃厚 +0／PE が最も濃厚 +3　|　心拍数 >100 /分：なし +0／あり +1.5　|　4週以内の手術または3日以上の固定：なし +0／あり +1.5　|　DVT／PE の既往：なし +0／あり +1.5　|　喀血（+1）　|　悪性腫瘍（治療中・6か月以内・緩和治療中）（+1）",
     "group": "循環器",
     "note": "肺塞栓の事前確率。4点以下（PE unlikely）かつ D-ダイマー陰性で除外可能です。",
     "refs": [
      "WELLS_PE"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.spesi",
     "label": "簡易版 PESI",
     "detail": "年齢 >80 歳（+1）　|　悪性腫瘍（+1）　|　慢性心肺疾患（心不全・慢性肺疾患）（+1）　|　心拍数 ≧110 /分（+1）　|　収縮期血圧 <100 mmHg（+1）　|　SpO₂ <90%（+1）",
     "group": "循環器",
     "note": "確定した肺塞栓の30日死亡リスク。0点なら低リスクで外来管理も選択肢に入ります。",
     "refs": [
      "SPESI"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.abcd2",
     "label": "ABCD² スコア",
     "detail": "年齢 ≧60 歳（+1）　|　血圧 ≧140/90 mmHg（+1）　|　臨床症状：その他 +0／構音障害のみ（脱力なし） +1／片側の脱力 +2　|　持続時間：<10 分 +0／10〜59 分 +1／≧60 分 +2　|　糖尿病（+1）",
     "group": "神経",
     "note": "一過性脳虚血発作（TIA）後の早期脳梗塞リスク。4点以上で入院精査が勧められます。",
     "refs": [
      "ABCD2"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.kdigo",
     "label": "KDIGO 急性腎障害（AKI）病期",
     "detail": "血清クレアチニンの基準：該当なし +0／基礎値の1.5〜1.9倍、または 0.3 mg/dL 以上の上昇 +1／基礎値の2.0〜2.9倍 +2／基礎値の3.0倍以上、または 4.0 mg/dL 以上、または腎代替療法開始 +3　|　尿量の基準：該当なし +0／<0.5 mL/kg/時 が 6〜12 時間 +1／<0.5 mL/kg/時 が 12 時間以上 +2／<0.3 mL/kg/時 が 24 時間以上、または無尿 12 時間以上 +3",
     "group": "腎",
     "note": "血清Cr の上昇率・絶対値と尿量で病期を決めます。ベースラインCr が分かることが前提です。",
     "refs": [
      "KDIGO_AKI"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.ckd",
     "label": "CKD 重症度分類（GFR × 蛋白尿）",
     "detail": "入力済みの検査値から直接算出",
     "group": "腎",
     "note": "GFR 区分と蛋白尿区分のかけ合わせで、末期腎不全・心血管死のリスクを層別化します。",
     "refs": [
      "KDIGO_CKD"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.childpugh",
     "label": "Child-Pugh 分類",
     "detail": "肝性脳症：なし +1／グレード I〜II（軽度） +2／グレード III〜IV（昏睡） +3　|　腹水：なし +1／軽度（コントロール良好） +2／中等度以上（難治性） +3　|　総ビリルビン：<2.0 mg/dL +1／2.0〜3.0 mg/dL +2／>3.0 mg/dL +3　|　アルブミン：>3.5 g/dL +1／2.8〜3.5 g/dL +2／<2.8 g/dL +3　|　PT 活性（または INR）：>70%（INR <1.7） +1／40〜70%（INR 1.7〜2.3） +2／<40%（INR >2.3） +3",
     "group": "肝・消化器",
     "note": "肝硬変の予備能評価。手術侵襲の耐容性や予後判断に用います。",
     "refs": [
      "CHILDPUGH"
     ],
     "star": true,
     "conf": "varies",
     "confNote": "PT の区分を活性（%）と INR の両方から判定している。読み替えの境界は施設差がある。"
    },
    {
     "id": "score.meldna",
     "label": "MELD-Na スコア",
     "detail": "入力済みの検査値から直接算出",
     "group": "肝・消化器",
     "note": "末期肝疾患の短期予後予測。肝移植の優先順位決定に用いられます。総ビリルビン・INR・Cr・Na から自動計算します。",
     "refs": [
      "MELD",
      "MELDNA"
     ],
     "star": true,
     "conf": "varies",
     "confNote": "MELD の上下限（6〜40）と Cr の上限 4.0、透析時の扱いは版により異なる。"
    },
    {
     "id": "score.westhaven",
     "label": "West-Haven 分類（肝性脳症）",
     "detail": "グレード：0：変化なし +0／I：軽度の意識変容・多幸／不安・注意力低下・睡眠リズム異常 +1／II：傾眠・無気力・失見当識（時間）・明らかな羽ばたき振戦 +2／III：強い傾眠〜半昏睡・失見当識（場所）・著明な錯乱 +3／IV：昏睡（刺激に反応しない） +4",
     "group": "肝・消化器",
     "note": "肝性脳症の重症度。グレード II 以上は顕性脳症で、誤嚥と転倒のリスク管理が要ります。",
     "refs": [
      "WESTHAVEN"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.gbs",
     "label": "Glasgow-Blatchford スコア",
     "detail": "BUN（mg/dL）：<18.2 +0／18.2〜22.3 +2／22.4〜27.9 +3／28.0〜69.9 +4／≧70 +6　|　ヘモグロビン：男性 ≧13 / 女性 ≧12 g/dL +0／男性 12〜12.9 g/dL +1／男性 10〜11.9 / 女性 10〜11.9 g/dL +3／<10 g/dL +6　|　収縮期血圧：≧110 mmHg +0／100〜109 mmHg +1／90〜99 mmHg +2／<90 mmHg +3　|　心拍数 ≧100 /分（+1）　|　黒色便（+1）　|　失神（+2）　|　肝疾患（+2）　|　心不全（+2）",
     "group": "肝・消化器",
     "note": "上部消化管出血で介入（輸血・内視鏡的止血・手術）を要するかの予測。0〜1点なら外来管理も可能とされます。",
     "refs": [
      "GBS"
     ],
     "star": true,
     "conf": "varies",
     "confNote": "Glasgow-Blatchford は配点の版差がある。本アプリは原著の配点。"
    },
    {
     "id": "score.jss_ap",
     "label": "急性膵炎 重症度判定（予後因子）",
     "detail": "BE ≦ −3 mEq/L、またはショック（+1）　|　PaO₂ ≦60 mmHg（室内気）、または呼吸不全（+1）　|　BUN ≧40 mg/dL（または Cr ≧2.0 mg/dL）、または乏尿（+1）　|　LDH ≧ 基準値上限の2倍（+1）　|　血小板 ≦10万/µL（+1）　|　血清Ca ≦7.5 mg/dL（+1）　|　CRP ≧15 mg/dL（+1）　|　SIRS 診断基準の陽性項目 ≧3（+1）　|　年齢 ≧70 歳（+1）",
     "group": "肝・消化器",
     "note": "厚生労働省基準の予後因子9項目。3点以上で重症と判定し、集中治療管理の適応となります（造影CT Grade も併せて判定します）。",
     "refs": [
      "JSS_AP"
     ],
     "star": true,
     "conf": "varies",
     "confNote": "LDH の「基準値上限の2倍」を 444 U/L（222 × 2）として自動入力している。自施設の LDH 基準値上限で変わる。"
    },
    {
     "id": "score.light",
     "label": "Light の基準（胸水の滲出性／漏出性）",
     "detail": "胸水／血清 総蛋白比 >0.5（+1）　|　胸水／血清 LDH 比 >0.6（+1）　|　胸水 LDH > 血清LDH 正常上限の 2/3（+1）",
     "group": "肝・消化器",
     "note": "3項目のいずれか1つでも満たせば滲出性です。感度は高い一方、利尿薬使用下の心不全では漏出性を滲出性と誤判定しやすい点に注意します。",
     "refs": [
      "LIGHT"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.isth_dic",
     "label": "ISTH overt DIC スコア",
     "detail": "入力済みの検査値から直接算出",
     "group": "血液・凝固",
     "note": "国際血栓止血学会の顕性DIC 基準。5点以上で overt DIC と判定します。急性期DIC基準（日本救急医学会）より特異度が高い一方、検出は遅れます。",
     "refs": [
      "ISTH_DIC"
     ],
     "star": true,
     "conf": "varies",
     "confNote": "PT 延長（秒）を PT活性または INR から換算している。本来は対照値との秒差であり、施設の対照値により変わる。"
    },
    {
     "id": "score.fourts",
     "label": "4Ts スコア（HIT）",
     "detail": "血小板減少の程度：減少率 <30%、または最低値 <10×10³/µL +0／減少率 30〜50%、または最低値 10〜19×10³/µL +1／減少率 >50% かつ最低値 ≧20×10³/µL +2　|　発症の時期：4日以内（ヘパリン曝露歴なし） +0／不明、または5日以降だが時期が不明瞭 +1／5〜10日目、または30日以内の曝露歴があり1日以内の発症 +2　|　血栓症・その他の後遺症：なし +0／進行性・再発性の血栓、紅斑性皮膚病変、未確定の血栓疑い +1／確定した新規血栓、皮膚壊死、ヘパリン静注後の全身反応 +2　|　血小板減少の他の原因：他に明らかな原因がある +0／他の原因の可能性もある +1／他に原因が見当たらない +2",
     "group": "血液・凝固",
     "note": "ヘパリン起因性血小板減少症の事前確率。0〜3点なら HIT はほぼ否定でき、抗体検査は不要とされます。",
     "refs": [
      "FOURTS"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.hscore",
     "label": "HScore（血球貪食症候群）",
     "detail": "既知の免疫抑制状態（HIV・免疫抑制療法）：なし +0／あり +18　|　最高体温：<38.4℃ +0／38.4〜39.4℃ +33／>39.4℃ +49　|　臓器腫大：なし +0／肝腫大 または 脾腫 +23／肝腫大 かつ 脾腫 +38　|　血球減少の系統数：1 系統 +0／2 系統 +24／3 系統 +34　|　フェリチン：<2000 ng/mL +0／2000〜6000 ng/mL +35／>6000 ng/mL +50　|　中性脂肪：<132.7 mg/dL +0／132.7〜354 mg/dL +44／>354 mg/dL +64　|　フィブリノゲン：>250 mg/dL +0／≦250 mg/dL +30　|　AST：<30 U/L +0／≧30 U/L +19　|　骨髄での血球貪食像：なし +0／あり +35",
     "group": "血液・凝固",
     "note": "反応性血球貪食症候群（HLH）の確率を推定します。169点が感度93%・特異度86%のカットオフとされます。",
     "refs": [
      "HSCORE"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    },
    {
     "id": "score.burch",
     "label": "Burch-Wartofsky スコア（甲状腺クリーゼ）",
     "detail": "体温：<37.2℃ +0／37.2〜37.7℃ +5／37.8〜38.2℃ +10／38.3〜38.8℃ +15／38.9〜39.4℃ +20／39.4〜39.9℃ +25／≧40.0℃ +30　|　中枢神経症状：なし +0／軽度（焦燥） +10／中等度（せん妄・精神症状・強い傾眠） +20／重度（痙攣・昏睡） +30　|　消化器・肝症状：なし +0／中等度（下痢・嘔気嘔吐・腹痛） +10／重度（原因不明の黄疸） +20　|　心拍数：<99 /分 +0／100〜109 +5／110〜119 +10／120〜129 +15／130〜139 +20／≧140 +25　|　うっ血性心不全：なし +0／軽度（下腿浮腫） +5／中等度（両側ラ音） +10／重度（肺水腫） +15　|　心房細動：なし +0／あり +10　|　誘因（感染・手術・外傷など）：なし／不明 +0／あり +10",
     "group": "内分泌",
     "note": "45点以上で甲状腺クリーゼが濃厚、25〜44点は切迫、25点未満は可能性が低いと判定します。日本甲状腺学会の診断基準と併用してください。",
     "refs": [
      "BURCH",
      "JTA_STORM"
     ],
     "star": true,
     "conf": "solid",
     "confNote": ""
    }
   ]
  },
  {
   "id": "ddx",
   "title": "鑑別診断の判定条件",
   "lead": "支持所見の過不足と重みづけをご覧ください。抜けている所見のご指摘が最も有益です。",
   "items": [
    {
     "id": "ddx.sepsis",
     "label": "敗血症／敗血症性ショック",
     "group": "感染症",
     "detail": "【トリガー】crp_veryhigh・pct_high・lactate_high・fever・wbc_veryhigh・neutropenia_severe\n【支持】プロカルシトニン高値（重み 3）　|　乳酸 ≧4 mmol/L（重み 3）　|　CRP 高度上昇（重み 2）　|　発熱（重み 2）　|　白血球著増（重み 2）　|　白血球減少（重症のサイン）（重み 2）　|　血小板減少（重み 2）　|　腎機能低下（重み 1）　|　黄疸（重み 1）　|　DIC 基準該当（重み 3）　|　代償性過換気の破綻（切迫する呼吸筋疲労）（重み 2）\n【否定】D-ダイマー陰性（他疾患の可能性）（−1）",
     "note": "白血球は「増える」より「減る」方が重症です。高齢者では発熱しないことも多く、体温正常は敗血症を否定しません。",
     "refs": [
      "SEPSIS3",
      "SOFA"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.fn",
     "label": "発熱性好中球減少症",
     "group": "感染症",
     "detail": "【トリガー】neutropenia_severe\n【支持】好中球絶対数 <500/µL（重み 3）　|　発熱（重み 3）　|　貧血（重み 1）　|　血小板減少（重み 1）",
     "note": "好中球がいないため膿も発赤も出ません。局所所見の乏しさは「感染がない」ことを意味しません。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.acs",
     "label": "急性冠症候群",
     "group": "循環器",
     "detail": "【トリガー】troponin_high\n【支持】トロポニン上昇（重み 3）　|　CK 上昇（重み 1）　|　BNP 上昇（重み 1）\n【否定】高度腎機能低下（トロポニン偽陽性の要因）（−2）　|　明らかな感染（2型心筋傷害の可能性）（−1）",
     "note": "トロポニン上昇は「心筋が傷んだ」という事実にすぎません。冠動脈閉塞か、需給不均衡（2型）か、心筋炎・肺塞栓・腎不全かは経時変化と文脈で決まります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.hf",
     "label": "心不全",
     "group": "循環器",
     "detail": "【トリガー】bnp_high\n【支持】BNP／NT-proBNP 上昇（重み 3）　|　低Na血症（希釈性）（重み 1）　|　腎機能低下（心腎連関）（重み 1）　|　肝うっ血（重み 1）　|　低酸素血症（重み 1）",
     "note": "BNP は腎機能低下・高齢・心房細動でも上がり、肥満では低く出ます。数値だけでなく体重と浮腫の推移で読んでください。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.pe",
     "label": "肺血栓塞栓症",
     "group": "循環器",
     "detail": "【トリガー】ddimer_veryhigh・primary_resp_alkalosis\n【支持】D-ダイマー著増（重み 3）　|　A-aDO₂ 開大（重み 2）　|　一次性の呼吸性アルカローシス（重み 2）　|　低酸素血症（重み 2）　|　トロポニン上昇（右心負荷）（重み 2）　|　BNP 上昇（右心負荷）（重み 1）\n【否定】D-ダイマー陰性（−3）　|　代謝性アシドーシス（過換気は代償の可能性）（−2）",
     "note": "肺塞栓の初期は SpO₂ が保たれることがあります。頻呼吸と A-aDO₂ 開大の方が鋭敏です。",
     "refs": [
      "WELLS_PE",
      "SPESI"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.ards",
     "label": "急性呼吸窮迫症候群（ARDS）",
     "group": "呼吸器",
     "detail": "【トリガー】ards_range\n【支持】P/F 比 ≦300（重み 3）　|　A-aDO₂ 開大（重み 2）　|　強い炎症（重み 1）　|　感染の存在（重み 1）\n【否定】BNP 高値（心原性肺水腫の可能性）（−2）",
     "note": "ベルリン定義は「心不全・溢水では説明できない」ことを要求します。P/F 比だけでは ARDS と言えません。",
     "refs": [
      "BERLIN"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.copd_exac",
     "label": "慢性II型呼吸不全の急性増悪",
     "group": "呼吸器",
     "detail": "【トリガー】respiratory_acidosis\n【支持】PaCO₂ 上昇（実測）（重み 3）　|　低酸素血症（重み 2）　|　慢性代償による HCO₃⁻ 高値（重み 2）　|　代償の破綻（急性の上乗せ）（重み 2）",
     "note": "慢性代償のある患者で pH が落ちていれば、それは「急性の上乗せ」です。PaCO₂ の絶対値ではなく pH の変化を見ます。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.aki",
     "label": "急性腎障害",
     "group": "腎・電解質",
     "detail": "【トリガー】renal_severe・cr_high\n【支持】eGFR <30（重み 3）　|　高K血症（重み 2）　|　AG 開大（重み 1）　|　代謝性アシドーシス（重み 2）　|　高P血症（重み 1）　|　BUN/Cr 比 >20（腎前性を示唆）（重み 1）",
     "note": "AKI の診断は Cr の「値」ではなく「変化」で決まります。ベースラインが分からないなら、それを探すのが最初の一手です。",
     "refs": [
      "KDIGO_AKI"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.siadh",
     "label": "SIADH",
     "group": "腎・電解質",
     "detail": "【トリガー】hypona_mod\n【支持】中等度以上の低Na血症（重み 3）　|　尿浸透圧 >300（重み 3）　|　尿中Na ≧40（SIADH により特異的）（重み 3）　|　尿中Na ≧30（重み 1）\n【否定】高Na血症（−3）　|　脱水所見（体液量減少を示唆）（−2）",
     "note": "SIADH は除外診断です。甲状腺機能低下症と副腎不全を外さないと診断してはいけません。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.csws",
     "label": "中枢性塩類喪失症候群（CSWS）",
     "group": "腎・電解質",
     "detail": "【トリガー】hypona_mod\n【支持】中等度以上の低Na血症（重み 3）　|　尿中Na 高値（重み 3）　|　BUN/Cr 比 >20（体液量減少）（重み 3）　|　尿浸透圧 高値（重み 1）",
     "note": "SIADH と検査値が同じで治療が正反対です。分けるのは検査値ではなく体液量。看護記録の体重と尿量が診断を決めます。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.di",
     "label": "尿崩症",
     "group": "腎・電解質",
     "detail": "【トリガー】hyperna\n【支持】高Na血症（重み 3）　|　尿浸透圧 低値（重み 3）\n【否定】低Na血症（−3）",
     "note": "高Naで薄い尿が大量に出ていれば尿崩症です。下垂体術後は数時間で進むので、尿量を時間単位で追います。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.rta",
     "label": "尿細管性アシドーシス",
     "group": "腎・電解質",
     "detail": "【トリガー】hyperchloremic\n【支持】AG正常（高Cl性）代謝性アシドーシス（重み 3）　|　尿AG 陽性（重み 3）　|　低K血症（1型）（重み 1）　|　高K血症（4型）（重み 1）\n【否定】尿AG 陰性（腎外性喪失）（−3）　|　AG 開大（−2）",
     "note": "AG 正常の代謝性アシドーシスを見たら、まず下痢か腎かを尿AGで分けます。ここを飛ばすと迷子になります。",
     "refs": [
      "UAG"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.dka",
     "label": "糖尿病性ケトアシドーシス",
     "group": "内分泌代謝",
     "detail": "【トリガー】hyperglycemia_severe\n【支持】著明な高血糖（重み 3）　|　AG 開大（重み 3）　|　代謝性アシドーシス（重み 3）　|　HbA1c 糖尿病域（重み 1）　|　低Na血症（偽性）（重み 1）　|　見かけのK上昇（重み 1）\n【否定】低血糖（−3）",
     "note": "来院時のKが正常でも体内総Kは枯渇しています。インスリンを入れた瞬間からKは落ちます。",
     "refs": [
      "GOLDMARK"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.hhs",
     "label": "高浸透圧高血糖状態",
     "group": "内分泌代謝",
     "detail": "【トリガー】hyperglycemia_extreme\n【支持】血糖 >600 mg/dL（重み 3）　|　高Na血症（重み 2）　|　著明な脱水（重み 2）\n【否定】AG 開大（DKA を示唆）（−2）",
     "note": "DKA より死亡率が高い病態です。高齢で脱水が強く、意識障害で発見されます。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.storm",
     "label": "甲状腺クリーゼ",
     "group": "内分泌代謝",
     "detail": "【トリガー】trab_pos\n【支持】TRAb 陽性（重み 3）　|　発熱（重み 2）　|　肝障害（重み 1）　|　甲状腺自己抗体陽性（重み 1）",
     "note": "発熱・頻脈・意識障害の三つ揃いを敗血症と決めつける前に、甲状腺を一度は考えてください。治療がまったく違います。",
     "refs": [
      "BURCH",
      "JTA_STORM"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.adrenal",
     "label": "副腎不全（副腎クリーゼ）",
     "group": "内分泌代謝",
     "detail": "【トリガー】hypona・hyperk・hypoglycemia・eosinophilia（2件以上）\n【支持】低Na血症（重み 3）　|　高K血症（重み 3）　|　低血糖（重み 2）　|　好酸球増多（重み 2）　|　抗副腎皮質抗体陽性（重み 3）　|　高Ca血症（重み 1）",
     "note": "「低Na＋高K＋低血糖＋好酸球増多」は副腎不全の指紋です。ステロイドを長期内服していた患者の急な中断が典型的な引き金。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.tls",
     "label": "腫瘍崩壊症候群",
     "group": "内分泌代謝",
     "detail": "【トリガー】hyperk・hyperp・ua_high（3件以上）\n【支持】高K血症（重み 3）　|　高P血症（重み 3）　|　高尿酸血症（重み 3）　|　低Ca血症（重み 2）　|　腎機能低下（重み 2）　|　LD 上昇（重み 2）　|　芽球出現（重み 2）",
     "note": "横紋筋融解症がまったく同じ電解質パターンを作ります。背景（化学療法か、長時間臥床か）で分けてください。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.cirrhosis",
     "label": "肝硬変・肝不全",
     "group": "肝・消化器",
     "detail": "【トリガー】che_low・pt_prolonged・nh3_high\n【支持】アルブミン <3.0（重み 3）　|　ChE 低下（重み 3）　|　PT 延長（重み 3）　|　血小板減少（脾機能亢進）（重み 2）　|　アンモニア上昇（重み 2）　|　黄疸（重み 2）　|　低Na血症（重み 1）",
     "note": "肝硬変は DIC の診断基準を満たしやすい病態です。凝固異常を見たら、まず肝を疑ってから DIC を考えます。",
     "refs": [
      "CHILDPUGH",
      "MELD"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.cholangitis",
     "label": "急性胆管炎",
     "group": "肝・消化器",
     "detail": "【トリガー】cholestasis\n【支持】胆汁うっ滞（ALP・γ-GT 上昇）（重み 3）　|　黄疸（重み 3）　|　発熱（重み 3）　|　強い炎症（重み 2）　|　PCT 高値（重み 2）",
     "note": "Charcot 三徴に意識障害とショックが加われば Reynolds 五徴。閉鎖腔の感染なので、抗菌薬だけでは治りません。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.gib",
     "label": "上部消化管出血",
     "group": "肝・消化器",
     "detail": "【トリガー】buncr_high・anemia（2件以上）\n【支持】BUN/Cr 比 >20（重み 3）　|　貧血（重み 3）　|　高度貧血（重み 2）　|　小球性（慢性出血）（重み 1）\n【否定】高度腎機能低下（BUN 上昇の別要因）（−2）",
     "note": "腸に出た血は「高蛋白食」です。BUN だけが上がり Cr は上がらない——この乖離が手がかりになります。",
     "refs": [
      "GBS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.pancreatitis",
     "label": "急性膵炎",
     "group": "肝・消化器",
     "detail": "【トリガー】amy_veryhigh\n【支持】アミラーゼ 基準上限3倍以上（重み 3）　|　リパーゼ著増（重み 3）　|　低Ca血症（重症化のサイン）（重み 2）　|　CRP 高度上昇（重み 2）　|　腎機能低下（重み 1）",
     "note": "アミラーゼの高さと重症度は相関しません。重症度を決めるのは臓器障害です。",
     "refs": [
      "JSS_AP"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.dic",
     "label": "播種性血管内凝固症候群",
     "group": "血液",
     "detail": "【トリガー】dic_jaam・fdp_veryhigh\n【支持】急性期DIC 基準該当（重み 3）　|　血小板減少（重み 3）　|　FDP 著増（重み 3）　|　フィブリノゲン低下（重み 2）　|　PT 延長（重み 2）　|　AT-III 低下（重み 2）　|　TAT 上昇（重み 2）\n【否定】ChE 低下（肝疾患による類似所見）（−2）",
     "note": "DIC は病名ではなく「結果」です。基礎疾患を治さないかぎり凝固だけ追っても治りません。",
     "refs": [
      "JAAM_DIC",
      "ISTH_DIC"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.tma",
     "label": "血栓性微小血管症（TTP／HUS）",
     "group": "血液",
     "detail": "【トリガー】anemia・plt_low・ld_high（3件以上）\n【支持】貧血（重み 3）　|　血小板減少（重み 3）　|　LD 上昇（重み 3）　|　間接ビリルビン上昇（重み 2）　|　網赤血球増加（重み 2）　|　腎機能低下（重み 2）\n【否定】PT 延長（DIC を示唆）（−3）　|　フィブリノゲン低下（DIC を示唆）（−3）",
     "note": "DIC と見た目が同じで凝固系だけが正常——これが TTP の指紋です。血小板輸血が禁忌になりうる点で、取り違えが致命的になります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.hlh",
     "label": "血球貪食症候群（HLH）",
     "group": "血液",
     "detail": "【トリガー】pancytopenia・sil2r_high\n【支持】汎血球減少（重み 3）　|　可溶性IL-2R 高値（重み 3）　|　持続する発熱（重み 2）　|　肝障害（重み 2）　|　LD 上昇（重み 2）　|　フィブリノゲン低下（重み 2）",
     "note": "フェリチンが数千を超える発熱は HLH を疑う合図です。「原因不明の発熱＋汎血球減少＋肝障害」で一度は考えます。",
     "refs": [
      "HSCORE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.hit",
     "label": "ヘパリン起因性血小板減少症",
     "group": "血液",
     "detail": "【トリガー】plt_low（heparin 投与が必須）\n【支持】血小板減少（重み 3）　|　D-ダイマー上昇（血栓）（重み 2）\n【否定】フィブリノゲン低下（DIC を示唆）（−2）",
     "note": "血小板が減るのに血栓ができる、という逆説。出血を心配して抗凝固をやめると、かえって血栓で失います。",
     "refs": [
      "FOURTS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.mds",
     "label": "骨髄異形成症候群・骨髄不全",
     "group": "血液",
     "detail": "【トリガー】pancytopenia・retic_low\n【支持】汎血球減少（重み 3）　|　大球性（重み 2）　|　網赤血球低値（重み 3）　|　芽球出現（重み 2）\n【否定】網赤血球増加（末梢での破壊・喪失を示唆）（−3）",
     "note": "汎血球減少を見たら、まず網赤血球です。作れていないのか、作っているが壊されているのか——方向が真逆になります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.sle",
     "label": "全身性エリテマトーデス",
     "group": "膠原病",
     "detail": "【トリガー】ana_pos・dsdna_pos\n【支持】抗dsDNA 抗体陽性（重み 3）　|　抗Sm 抗体陽性（重み 3）　|　補体低下（重み 3）　|　抗核抗体 高力価（重み 2）　|　血小板減少（重み 1）　|　貧血（重み 1）　|　腎障害（重み 2）　|　リンパ球減少（重み 2）",
     "note": "SLE の活動性は抗dsDNA の上昇と補体の低下が対になって動きます。片方だけでは判断しません。",
     "refs": [
      "SLE2019"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.aav",
     "label": "ANCA 関連血管炎",
     "group": "膠原病",
     "detail": "【トリガー】mpo_pos・pr3_pos\n【支持】MPO-ANCA 陽性（重み 3）　|　PR3-ANCA 陽性（重み 3）　|　腎機能低下（重み 3）　|　強い炎症（重み 2）　|　貧血（重み 1）　|　好酸球増多（EGPA）（重み 2）",
     "note": "急速進行性糸球体腎炎は週単位で不可逆になります。ANCA 陽性＋尿潜血＋Cr 上昇は、待てない組み合わせです。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.aps",
     "label": "抗リン脂質抗体症候群",
     "group": "膠原病",
     "detail": "【トリガー】apl_pos\n【支持】抗リン脂質抗体陽性（重み 3）　|　APTT 単独延長（重み 3）　|　血小板減少（重み 2）　|　D-ダイマー上昇（重み 1）",
     "note": "APTT が延びるのに血栓に傾く、という逆説。延長を出血リスクと読んで抗凝固を控えると判断を誤ります。",
     "refs": [
      "APS_SYD"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.mg",
     "label": "重症筋無力症",
     "group": "神経・筋",
     "detail": "【トリガー】achr_pos・musk_pos\n【支持】抗AChR 抗体陽性（重み 3）　|　抗MuSK 抗体陽性（重み 3）　|　呼吸性アシドーシス（クリーゼ）（重み 3）　|　甲状腺自己抗体陽性（合併）（重み 1）",
     "note": "SpO₂ は最後まで保たれます。呼吸筋疲労は「努力」の指標（呼吸数・咳の強さ・話せる語数）で捉えてください。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.gbs",
     "label": "ギラン・バレー症候群",
     "group": "神経・筋",
     "detail": "【トリガー】gm1_pos・gq1b_pos・gt1a_pos\n【支持】抗GM1 抗体陽性（軸索型）（重み 3）　|　抗GQ1b 抗体陽性（Fisher症候群）（重み 3）　|　抗GT1a 抗体陽性（咽頭頸部上腕型）（重み 3）　|　呼吸性アシドーシス（重み 3）",
     "note": "麻痺の進行は上行性です。横隔膜に届く前に呼吸機能を測り始めるかどうかが予後を分けます。抗GT1a型は嚥下障害で発症するため、脳幹梗塞や重症筋無力症と取り違えられやすい点に注意します。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.ae",
     "label": "自己免疫性脳炎",
     "group": "神経・筋",
     "detail": "【トリガー】nmdar_pos・lgi1_pos・caspr2_pos\n【支持】抗NMDA受容体 抗体陽性（重み 3）　|　抗LGI1 抗体陽性（重み 3）　|　抗CASPR2 抗体陽性（重み 3）　|　低Na血症（抗LGI1 に多い）（重み 2）",
     "note": "若年者の急な精神症状を精神疾患と決める前に、一度は自己免疫性脳炎を考えてください。治せる認知症・治せる精神症状です。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.hepatic_enceph",
     "label": "肝性脳症",
     "group": "神経・筋",
     "detail": "【トリガー】nh3_high\n【支持】アンモニア著明高値（重み 3）　|　アンモニア高値（重み 2）　|　アルブミン低下（重み 2）　|　PT 延長（重み 2）　|　黄疸（重み 1）",
     "note": "アンモニア値と脳症の重症度は相関しません。値ではなく、羽ばたき振戦と意識レベルで判断します。",
     "refs": [
      "WESTHAVEN"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.toxalcohol",
     "label": "中毒性アルコール（メタノール・エチレングリコール）",
     "group": "中毒・薬剤",
     "detail": "【トリガー】osmgap_high\n【支持】浸透圧ギャップ開大（重み 3）　|　AG 開大（重み 3）　|　重度アシデミア（重み 2）　|　腎機能低下（重み 1）\n【否定】著明な高血糖（DKA／HHS の可能性）（−2）",
     "note": "AG 開大と浸透圧ギャップ開大が同時にあれば、まず中毒性アルコールです。治療開始の遅れが失明と死に直結します。",
     "refs": [
      "GOLDMARK"
     ],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    },
    {
     "id": "ddx.rhabdo",
     "label": "横紋筋融解症",
     "group": "中毒・薬剤",
     "detail": "【トリガー】rhabdo_range・ck_veryhigh\n【支持】CK >5000 U/L（重み 3）　|　高K血症（重み 2）　|　高P血症（重み 2）　|　低Ca血症（重み 2）　|　高尿酸血症（重み 1）　|　腎機能低下（重み 2）　|　LD 上昇（重み 1）　|　AST 優位の上昇（重み 1）",
     "note": "尿試験紙で潜血陽性なのに沈渣に赤血球がない——これがミオグロビン尿の見分け方です。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。"
    }
   ]
  },
  {
   "id": "pat",
   "title": "所見パターン・横断症候群の判定根拠",
   "lead": "★は赤判定（ただちに報告）です。閾値と根拠の妥当性を優先的にご確認ください。",
   "items": [
    {
     "id": "pat.cbc-fn",
     "label": "発熱性好中球減少症（FN）を疑う",
     "group": "血算",
     "detail": "【根拠】好中球絶対数 < 500/µL・発熱 37.5℃以上",
     "note": "感染症が急速に重症化しうる状態。血液培養2セット採取と広域抗菌薬の速やかな投与が原則です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-neutropenia",
     "label": "好中球減少",
     "group": "血算",
     "detail": "【根拠】好中球絶対数 < 1500/µL",
     "note": "感染防御能が落ちています。化学療法歴・薬剤性（抗甲状腺薬・抗てんかん薬ほか）を確認してください。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-plt-critical",
     "label": "重度血小板減少（出血リスク高）",
     "group": "血算",
     "detail": "【根拠】血小板 < 2万/µL",
     "note": "自然出血（頭蓋内出血を含む）の危険域です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-plt-low",
     "label": "血小板減少",
     "group": "血算",
     "detail": "【根拠】血小板 < 15.8万/µL",
     "note": "DIC・ITP・薬剤性（ヘパリン起因性＝HIT を含む）・肝硬変・敗血症・偽性血小板減少を鑑別します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-hit",
     "label": "ヘパリン起因性血小板減少症（HIT）に注意",
     "group": "血算",
     "detail": "【根拠】ヘパリン投与中・血小板減少",
     "note": "HIT は血小板が減るのに血栓ができる逆説的な病態です。投与開始5〜10日目の50%以上の減少が典型。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-blast",
     "label": "芽球の出現 — 造血器腫瘍を示唆",
     "group": "血算",
     "detail": "【根拠】末梢血に芽球を認める",
     "note": "急性白血病をはじめとする造血器腫瘍を示唆します。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-iron",
     "label": "鉄欠乏性貧血を疑う",
     "group": "血算",
     "detail": "【根拠】貧血・MCV < 83.6 fL（小球性）",
     "note": "慢性出血（消化管・月経）が背景にあることが多く、原因検索が本体です。フェリチン・血清鉄・TIBC で確認します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-acd",
     "label": "慢性疾患に伴う貧血（ACD）も鑑別に",
     "group": "血算",
     "detail": "【根拠】貧血・RDW 上昇を伴わない・網赤血球の増加もない",
     "note": "炎症・感染・悪性腫瘍・腎性貧血などの慢性病態に伴う貧血。鉄欠乏と紛らわしいので、フェリチンで切り分けます（ACD ではフェリチンは正常〜高値）。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-megalo",
     "label": "巨赤芽球性貧血を疑う",
     "group": "血算",
     "detail": "【根拠】貧血・MCV > 98.2 fL（大球性）",
     "note": "ビタミンB12・葉酸欠乏、骨髄異形成症候群、肝疾患、アルコール、甲状腺機能低下症を鑑別します。B12欠乏は亜急性連合性脊髄変性症など神経症状を伴うことがあります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-hemolysis",
     "label": "溶血または急性出血（骨髄は反応している）",
     "group": "血算",
     "detail": "【根拠】貧血・網赤血球増加",
     "note": "骨髄が造血で応答している状態。溶血性貧血か、急性出血後の回復期かを切り分けます。溶血なら LD上昇・間接ビリルビン上昇・ハプトグロビン低下が揃います。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-hypoprolif",
     "label": "造血低下型の貧血",
     "group": "血算",
     "detail": "【根拠】貧血・網赤血球が増えていない",
     "note": "骨髄の産生低下（骨髄抑制・腎性貧血・造血原料不足・慢性炎症）を示唆します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-anemia-severe",
     "label": "高度貧血 — 組織酸素化の破綻に注意",
     "group": "血算",
     "detail": "【根拠】Hb < 6.0 g/dL",
     "note": "輸血の適応が検討される水準です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-bacterial",
     "label": "細菌感染症を示唆する白血球像",
     "group": "血算",
     "detail": "【根拠】白血球増加・好中球／リンパ球比（NLR）> 5",
     "note": "細菌感染や急性炎症で典型的な像です。NLR はストレス反応や重症度の指標にもなります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-viral",
     "label": "ウイルス感染を示唆",
     "group": "血算",
     "detail": "【根拠】異型リンパ球の出現",
     "note": "EBV・CMV・HIV 急性期・薬剤性過敏症症候群（DIHS）などで出現します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-eo",
     "label": "好酸球増多",
     "group": "血算",
     "detail": "【根拠】好酸球 > 7%",
     "note": "アレルギー・薬剤性・寄生虫・好酸球性多発血管炎性肉芽腫症（EGPA）・副腎不全を鑑別します。新規薬剤の開始時期との関連を確認してください。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-steroid",
     "label": "ステロイドによる白血球増加の可能性",
     "group": "血算",
     "detail": "【根拠】白血球増加・ステロイド投与中",
     "note": "ステロイドは好中球を血管壁から遊離させ、感染がなくても白血球が上がります。一方でリンパ球は減ります。感染の有無を白血球数だけで判断しないでください。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cbc-polycythemia",
     "label": "多血",
     "group": "血算",
     "detail": "【根拠】ヘモグロビン高値",
     "note": "脱水による見かけ上の濃縮か、真性多血症・二次性多血（慢性低酸素・喫煙・睡眠時無呼吸）かを切り分けます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hyperk",
     "label": "高カリウム血症 — 致死性不整脈のリスク",
     "group": "生化学",
     "detail": "【根拠】K > 6.0 mmol/L",
     "note": "心室細動・心停止に直結します。溶血による偽性高K血症（採血時の駆血が強い・細い針）も必ず鑑別してください。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hypok",
     "label": "低カリウム血症",
     "group": "生化学",
     "detail": "【根拠】K < 3.0 mmol/L",
     "note": "不整脈・筋力低下・腸管麻痺を起こします。Mgが低いとKは補正されにくいので、Mgも同時に確認してください。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hypona-severe",
     "label": "重度低ナトリウム血症 — 脳浮腫・痙攣のリスク",
     "group": "生化学",
     "detail": "【根拠】Na < 125 mmol/L",
     "note": "意識障害・痙攣を起こしえます。補正が速すぎると浸透圧性脱髄症候群（ODS）を招くため、補正速度の管理が決定的に重要です（目安 24時間で 8〜10 mmol/L 以内）。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-siadh",
     "label": "SIADH（抗利尿ホルモン不適合分泌）を疑う",
     "group": "生化学",
     "detail": "【根拠】低Na血症・尿浸透圧 > 300 mOsm/kg・尿中Na ≧ 40 mmol/L",
     "note": "体液量が正常〜やや過剰なのが特徴。中枢神経疾患（くも膜下出血・髄膜炎・脳外傷）、肺疾患、薬剤（カルバマゼピン・SSRI）が原因になります。治療は水制限が基本で、CSWSとは逆向きです。なお尿中Naの閾値は基準により 20 以上とするものと 40 以上とするものがあり、本アプリは特異度を優先して 40 以上を採っています。",
     "star": false,
     "conf": "varies",
     "confNote": "尿中Na の閾値は 20 以上とする基準と 40 以上とする基準がある。本アプリは特異度を優先して 40 以上（2026-10-31 に 30 から変更）。"
    },
    {
     "id": "pat.ch-csws",
     "label": "中枢性塩類喪失症候群（CSWS）との鑑別を",
     "group": "生化学",
     "detail": "【根拠】低Na血症・尿中Na高値・中枢神経疾患の背景",
     "note": "SIADH と検査所見がほぼ同じでありながら、治療が正反対になる重要な鑑別です。CSWS は体液量が減少（多尿・体重減少・脱水所見）し、治療は生理食塩水による補充。SIADH に水制限をかけるつもりで CSWS を絞れば、脳血流が落ちて致命的になりえます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hypona-dilut",
     "label": "希釈性低Na（水分過剰）を疑う",
     "group": "生化学",
     "detail": "【根拠】低Na血症・尿浸透圧 ≦ 100 mOsm/kg",
     "note": "腎は正しく水を捨てようとしています。多飲・低張輸液の過剰が原因のことが多いです。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hypona-workup",
     "label": "低Na血症の鑑別に尿検査が必要",
     "group": "生化学",
     "detail": "【根拠】低Na血症・尿浸透圧・尿中Na が未測定",
     "note": "低Na血症は原因によって治療が正反対になります。尿浸透圧と尿中Naがないと鑑別できません。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-di",
     "label": "尿崩症を疑う",
     "group": "生化学",
     "detail": "【根拠】高Na血症・尿が希釈されている（尿浸透圧低値／尿比重低値）",
     "note": "下垂体・視床下部の術後、頭部外傷、脳死に近い病態で起こります。大量の希釈尿が出続け、急速に高Na血症が進みます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hyperna",
     "label": "高ナトリウム血症",
     "group": "生化学",
     "detail": "【根拠】Na > 155 mmol/L",
     "note": "ほぼ常に「水が足りない」状態です。自由に水を飲めない患者（意識障害・挿管・高齢）で進行します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-mannitol",
     "label": "浸透圧利尿薬の影響を考慮",
     "group": "生化学",
     "detail": "【根拠】マンニトール／グリセオール投与中",
     "note": "浸透圧利尿により自由水が失われ高Na血症に傾き、浸透圧ギャップが開きます。腎機能低下例では蓄積して急性腎障害を起こすことがあります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hyperca",
     "label": "高カルシウム血症",
     "group": "生化学",
     "detail": "【根拠】補正Ca > 12 mg/dL",
     "note": "意識障害・多尿・脱水・不整脈を起こします。悪性腫瘍（骨転移・PTHrP）と原発性副甲状腺機能亢進症が二大原因です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hypoca",
     "label": "低カルシウム血症",
     "group": "生化学",
     "detail": "【根拠】補正Ca < 7.0 mg/dL",
     "note": "テタニー・痙攣・喉頭痙攣を起こしえます。甲状腺／副甲状腺術後、大量輸血、急性膵炎、腫瘍崩壊症候群で生じます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hypomg",
     "label": "低マグネシウム血症",
     "group": "生化学",
     "detail": "【根拠】Mg < 1.8 mg/dL",
     "note": "低K・低Caを「治らなくさせる」隠れた原因です。Mgを補正しないとKもCaも上がりません。PPI長期内服・利尿薬・アルコール・下痢が原因。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-aki",
     "label": "腎機能低下 — 急性か慢性かの切り分けを",
     "group": "生化学",
     "detail": "【根拠】eGFR < 30 mL/min/1.73m²",
     "note": "過去のCr値との比較が決定的です。急性なら原因（腎前性・腎性・腎後性）の検索、慢性なら薬剤の腎排泄調整が焦点になります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-prerenal",
     "label": "腎前性（脱水・循環血液量減少）を疑う",
     "group": "生化学",
     "detail": "【根拠】BUN/Cr比 > 20",
     "note": "脱水・心拍出量低下・ステロイド・高蛋白負荷のほか、消化管出血でもBUNが優位に上がります。Hb・出血徴候を追加確認してください。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-gib",
     "label": "消化管出血の可能性 — BUN優位上昇＋貧血",
     "group": "生化学",
     "detail": "【根拠】BUN/Cr比 > 20・貧血",
     "note": "腸管内の血液が蛋白として吸収されBUNが上がります。貧血と組み合わさると消化管出血を強く示唆します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hepatocellular",
     "label": "肝逸脱酵素上昇 — 障害型の追加評価が必要",
     "group": "生化学",
     "detail": "【根拠】AST／ALT 上昇",
     "note": "ALP・γ-GTの測定状況と結果を確認し、胆汁うっ滞・混合型を含めて評価してください。ウイルス性肝炎・薬剤性肝障害・虚血性肝炎・アルコールを鑑別します。AST/ALT比（De Ritis比）が2以上ならアルコール性や肝硬変、1未満なら慢性肝炎を示唆します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-cholestasis",
     "label": "胆汁うっ滞型の肝機能異常",
     "group": "生化学",
     "detail": "【根拠】ALP 上昇・γ-GT 上昇",
     "note": "胆道閉塞（総胆管結石・腫瘍）、薬剤性、原発性胆汁性胆管炎を鑑別します。発熱＋右季肋部痛＋黄疸（Charcot三徴）があれば急性胆管炎で緊急です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-cholangitis",
     "label": "急性胆管炎を疑う（Charcot三徴）",
     "group": "生化学",
     "detail": "【根拠】胆汁うっ滞（ALP・γ-GT上昇）・黄疸・発熱・腹痛または黄疸の自覚",
     "note": "発熱・右季肋部痛・黄疸の三徴がそろう緊急病態です。胆道は閉鎖腔のため、胆汁がうっ滞すると細菌が一気に血中へ押し出され、短時間で敗血症性ショックに至ります。意識障害とショックが加われば Reynolds 五徴で、緊急ドレナージの適応です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-liverfailure",
     "label": "肝予備能の低下（肝硬変・肝不全）を示唆",
     "group": "生化学",
     "detail": "【根拠】アルブミン低下・ChE低下・PT延長・アンモニア上昇のいずれか・黄疸または肝逸脱酵素上昇",
     "note": "蛋白合成能の低下を示します。凝固能（PT-INR）と血小板を必ず併せて評価してください。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-nh3",
     "label": "高アンモニア血症 — 意識障害の原因となりうる",
     "group": "生化学",
     "detail": "【根拠】アンモニア > 150 µg/dL",
     "note": "肝性脳症を起こします。採血後に時間が経つと偽高値になるため、氷冷・速やかな提出が必要です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-vpa-nh3",
     "label": "バルプロ酸による高アンモニア血症の可能性",
     "group": "生化学",
     "detail": "【根拠】アンモニア高値・バルプロ酸内服中",
     "note": "バルプロ酸は肝障害がなくてもアンモニアを上げ、意識障害・傾眠を起こします（VPA誘発性高アンモニア血症性脳症）。肝性脳症と取り違えやすい重要な鑑別です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-cbz-na",
     "label": "カルバマゼピンによる低Na血症の可能性",
     "group": "生化学",
     "detail": "【根拠】低Na血症・カルバマゼピン内服中",
     "note": "カルバマゼピンは SIADH 様の機序で低Na血症を起こします。高齢者・長期内服で頻度が上がります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hypoglycemia",
     "label": "低血糖 — ただちに対応が必要",
     "group": "生化学",
     "detail": "【根拠】血糖 < 50 mg/dL",
     "note": "不可逆的な脳障害を起こしえます。発汗・頻脈・振戦などの交感神経症状は、β遮断薬内服中や無自覚性低血糖では出ません。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-dka",
     "label": "糖尿病性ケトアシドーシス（DKA）を疑う",
     "group": "生化学",
     "detail": "【根拠】著明な高血糖・アニオンギャップ開大",
     "note": "インスリン作用の絶対的不足による代謝性アシドーシスです。脱水・電解質異常を伴い、見かけのKが正常でも体内総Kは枯渇しています。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-hhs",
     "label": "著明な高血糖 — HHS／DKAの緊急鑑別",
     "group": "生化学",
     "detail": "【根拠】血糖 > 600 mg/dL",
     "note": "血清浸透圧・血中ケトン・血液ガス（pH／HCO3）・Na／Clを追加確認してください。未測定のAGを正常とは扱えません。HHS・DKAおよび混合病態を鑑別し、追加結果を待たず報告してください。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-troponin",
     "label": "心筋傷害を示唆",
     "group": "生化学",
     "detail": "【根拠】トロポニン上昇",
     "note": "急性冠症候群だけでなく、心筋炎・肺塞栓・敗血症・腎不全・頻脈でも上昇します。経時変化（上昇／下降パターン）が鑑別の鍵です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-rhabdo",
     "label": "横紋筋融解症を疑う",
     "group": "生化学",
     "detail": "【根拠】CK > 5000 U/L",
     "note": "ミオグロビンによる急性腎障害と高K血症が最大の脅威です。長時間の臥床・痙攣・外傷・スタチン・熱中症が原因になります。K・P・尿酸の上昇とCa低下という腫瘍崩壊症候群と同じ電解質パターンを示すため、背景での鑑別が要ります。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-statin-ck",
     "label": "スタチンによるCK上昇の可能性",
     "group": "生化学",
     "detail": "【根拠】CK上昇・スタチン内服中",
     "note": "筋痛・脱力を伴う場合は中止を検討する水準です。フィブラート併用で危険が増します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-bnp",
     "label": "心負荷の上昇（心不全を示唆）",
     "group": "生化学",
     "detail": "【根拠】BNP または NT-proBNP 高値",
     "note": "心不全の可能性を示します。腎機能低下・高齢・心房細動でも上昇するため、症状・体重・浮腫と合わせて評価します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-pancreatitis",
     "label": "急性膵炎を疑う",
     "group": "生化学",
     "detail": "【根拠】アミラーゼまたはリパーゼが基準上限の3倍以上",
     "note": "上腹部痛・背部への放散痛を伴えば急性膵炎の可能性が高いです。重症化すると低Ca血症・腎障害・呼吸不全を来します。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-lactate",
     "label": "乳酸高値 — 組織低灌流を示唆",
     "group": "生化学",
     "detail": "【根拠】乳酸 ≧ 4.0 mmol/L",
     "note": "敗血症性ショックの診断基準に含まれる値です。血圧が保たれていても組織レベルでは酸素が足りていない可能性があります（潜在性ショック）。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-bacterial-inf",
     "label": "細菌感染を示唆（PCT高値）",
     "group": "生化学",
     "detail": "【根拠】プロカルシトニン ≧ 0.5 ng/mL",
     "note": "ウイルス感染では上がりにくく、細菌感染・敗血症で上昇します。腎不全でも上がる点に注意。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-inflammation",
     "label": "炎症反応の上昇",
     "group": "生化学",
     "detail": "【根拠】CRP > 5 mg/dL",
     "note": "CRPは発症から上昇までに半日〜1日の遅れがあります。発症直後は低くても感染を否定できません。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-malnutrition",
     "label": "低栄養・蛋白低下",
     "group": "生化学",
     "detail": "【根拠】アルブミン < 3.0 g/dL",
     "note": "低栄養のほか、炎症・肝不全・ネフローゼ・蛋白漏出性胃腸症でも低下します。創傷治癒遅延・浮腫・薬物の蛋白結合率変化（ワルファリン等で効果増強）に影響します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ch-tls",
     "label": "腫瘍崩壊症候群（TLS）を疑う",
     "group": "生化学",
     "detail": "【根拠】K上昇・P上昇・尿酸上昇・Ca低下・悪性腫瘍・化学療法の背景",
     "note": "化学療法開始後24〜72時間に多く、急性腎障害と致死性不整脈を起こします。横紋筋融解症も同じ電解質パターンを示すため、背景で切り分けます。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-dic",
     "label": "急性期DIC診断基準を満たす",
     "group": "凝固・線溶",
     "detail": "【根拠】日本救急医学会 急性期DIC診断基準 4点以上",
     "note": "全身の微小血管で凝固が起こり、消費性に凝固因子と血小板が枯渇して出血に転じる病態です。基礎疾患（敗血症・外傷・産科疾患・悪性腫瘍）の治療が本体になります。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-dic-watch",
     "label": "DIC の前段階に注意（凝固活性化の所見あり）",
     "group": "凝固・線溶",
     "detail": "【根拠】TAT 上昇・AT-III 低下または FDP 上昇",
     "note": "スコアは満たさないものの、凝固の活性化が始まっています。基礎疾患が進行すればDICに移行しえます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-liver-mimic",
     "label": "肝疾患によるDIC類似所見の可能性",
     "group": "凝固・線溶",
     "detail": "【根拠】急性期DIC基準を満たす・肝疾患の背景",
     "note": "肝硬変は凝固因子の産生低下と脾機能亢進による血小板減少を同時に起こすため、DIC基準を満たしやすい病態です。真のDICか肝不全による凝固障害かで治療が変わります。切り分けの手がかりは、第VIII因子（肝で作られないためDICでのみ低下）と、経時的な増悪の有無です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-pt-only",
     "label": "PT 単独延長 — 外因系の異常",
     "group": "凝固・線溶",
     "detail": "【根拠】PT 延長・APTT は正常",
     "note": "外因系（第VII因子）の問題です。第VII因子は半減期が最も短いため、ビタミンK欠乏・肝障害・ワルファリンで最初に影響が出ます。これが「PTだけ先に延びる」理由です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-aptt-only",
     "label": "APTT 単独延長 — 内因系の異常",
     "group": "凝固・線溶",
     "detail": "【根拠】APTT 延長・PT は正常",
     "note": "内因系の問題です。ヘパリン投与中が最も多い原因。薬剤がなければ血友病A/B、von Willebrand病、ループスアンチコアグラント、第XII因子欠乏を鑑別します。ループスアンチコアグラントは出血ではなく血栓に傾く点が逆説的で重要です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-both",
     "label": "PT・APTT ともに延長 — 共通路の異常または複合要因",
     "group": "凝固・線溶",
     "detail": "【根拠】PT 延長・APTT 延長",
     "note": "DIC、肝不全、ビタミンK高度欠乏、大量輸血による希釈性凝固障害、抗凝固薬過量を鑑別します。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-inr-critical",
     "label": "PT-INR 著明高値 — 重大出血のリスク",
     "group": "凝固・線溶",
     "detail": "【根拠】PT-INR > 5.0",
     "note": "頭蓋内出血・消化管出血の危険域です。ワルファリン内服中なら中和（ビタミンK・プロトロンビン複合体製剤）の適応を検討する水準。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-warfarin",
     "label": "ワルファリン効果の過剰",
     "group": "凝固・線溶",
     "detail": "【根拠】PT-INR > 3.0・ワルファリン内服中",
     "note": "ビタミンK摂取量の変化、抗菌薬併用、肝機能低下、低アルブミン血症で効果が強まります。納豆・青汁の中止も逆に効きすぎの原因になりえます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-heparin",
     "label": "ヘパリンの効果域を評価",
     "group": "凝固・線溶",
     "detail": "【根拠】ヘパリン投与中・APTT 測定あり",
     "note": "治療域の目安は対照値の1.5〜2.5倍（概ね45〜75秒）。延びすぎは出血、足りなければ血栓です。AT-IIIが70%未満だとヘパリンは効きにくくなります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-fib-critical",
     "label": "フィブリノゲン著減 — 止血能の破綻",
     "group": "凝固・線溶",
     "detail": "【根拠】フィブリノゲン < 100 mg/dL",
     "note": "止血の最終段階の材料が枯渇しています。DIC、大量出血、L-アスパラギナーゼ、産科危機的出血で起こります。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-hyperfibrinolysis",
     "label": "線溶亢進の所見",
     "group": "凝固・線溶",
     "detail": "【根拠】FDP ≧ 25 µg/mL・フィブリノゲン低下",
     "note": "できた血栓が急速に溶かされており、出血に傾きます。線溶亢進型DIC（急性前骨髄球性白血病・大動脈瘤・前立腺癌・産科領域）で典型的です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-ddimer-high",
     "label": "D-ダイマー高値 — 血栓の存在を示唆（ただし特異度は低い）",
     "group": "凝固・線溶",
     "detail": "【根拠】D-ダイマー > 5.0 µg/mL",
     "note": "深部静脈血栓症・肺塞栓・大動脈解離・DIC・悪性腫瘍（Trousseau症候群）を示唆します。一方、高齢・炎症・術後・妊娠でも上がるため、これ単独では診断できません。脳梗塞では心原性塞栓や悪性腫瘍関連を示唆する所見になります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-ddimer-neg",
     "label": "D-ダイマー陰性 — 血栓症の可能性は低い",
     "group": "凝固・線溶",
     "detail": "【根拠】D-ダイマー ≦ 1.0 µg/mL",
     "note": "陰性的中率が高い検査です。臨床的な事前確率が低〜中等度であれば、静脈血栓塞栓症はかなり否定的です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-at3",
     "label": "アンチトロンビン低下",
     "group": "凝固・線溶",
     "detail": "【根拠】AT-III < 70%",
     "note": "DIC・肝不全・ネフローゼ症候群・大量出血で低下します。この水準ではヘパリンの効果が著しく落ちます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-plt-bleed",
     "label": "血小板減少による出血リスク",
     "group": "凝固・線溶",
     "detail": "【根拠】血小板 < 2万/µL",
     "note": "一次止血が成立しません。自然出血の危険域です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-fib-high",
     "label": "フィブリノゲン高値（急性期反応）",
     "group": "凝固・線溶",
     "detail": "【根拠】フィブリノゲン > 400 mg/dL",
     "note": "炎症の急性期反応蛋白として上昇します。感染・手術後・妊娠で見られ、これだけではDICを否定できません。FDP・血小板・PTと臨床経過を確認してください。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.cg-pregnancy",
     "label": "妊娠による生理的変動を考慮",
     "group": "凝固・線溶",
     "detail": "【根拠】妊娠中・D-ダイマーまたはフィブリノゲン高値",
     "note": "妊娠中はフィブリノゲン・D-ダイマーが生理的に上昇し、通常の基準値では判定できません。一方で妊娠は血栓症そのもののリスクも高めるため、症状との照合が重要です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-sle",
     "label": "全身性エリテマトーデス（SLE）を示唆する抗体プロファイル",
     "group": "自己抗体",
     "detail": "【根拠】抗核抗体陽性・抗dsDNA抗体または抗Sm抗体陽性",
     "note": "抗Sm抗体は特異度が高く、抗dsDNA抗体は腎炎の活動性と相関します。補体低下を伴えば活動期を示唆します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-sle-active",
     "label": "SLE の活動性亢進を示唆（補体消費）",
     "group": "自己抗体",
     "detail": "【根拠】抗dsDNA抗体陽性・補体低下",
     "note": "免疫複合体の形成で補体が消費されている状態。ループス腎炎・中枢神経ループスの活動期に対応します。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-druglupus",
     "label": "薬剤性ループスの可能性",
     "group": "自己抗体",
     "detail": "【根拠】抗ヒストン抗体陽性・抗核抗体陽性・抗dsDNA抗体陰性",
     "note": "被疑薬の中止で改善します。腎・中枢神経病変は稀です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-mctd",
     "label": "混合性結合組織病（MCTD）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗U1-RNP抗体陽性・抗Sm／抗dsDNA抗体陰性",
     "note": "SLE・強皮症・多発性筋炎の所見が混在します。レイノー現象と手指の腫脹が特徴。肺高血圧症が予後を左右します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-sjogren",
     "label": "シェーグレン症候群を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗SS-A/Ro 抗体または抗SS-B/La 抗体陽性",
     "note": "乾燥症状が中心ですが、間質性腎炎による尿細管性アシドーシス（低K血症）、間質性肺炎を合併します。妊娠例では胎児の先天性房室ブロックに注意が必要です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-ssc-diffuse",
     "label": "びまん皮膚硬化型 全身性強皮症を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗Scl-70（トポイソメラーゼI）抗体陽性",
     "note": "間質性肺疾患の合併が多く、予後を決めます。皮膚硬化は体幹に及びます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-ssc-limited",
     "label": "限局皮膚硬化型 全身性強皮症（CREST）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗セントロメア抗体陽性",
     "note": "経過は緩徐ですが、肺動脈性肺高血圧症が晩期に出現し予後を左右します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-renalcrisis",
     "label": "強皮症腎クリーゼのリスクが高い",
     "group": "自己抗体",
     "detail": "【根拠】抗RNAポリメラーゼIII抗体陽性",
     "note": "急激な高血圧と急性腎障害を起こす緊急病態です。ステロイド高用量が誘因になりえます。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-myositis",
     "label": "炎症性筋疾患（多発性筋炎・皮膚筋炎）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗ARS（Jo-1）／抗MDA5／抗TIF1-γ 抗体のいずれか陽性",
     "note": "抗体により表現型が大きく異なります。抗Jo-1は間質性肺疾患、抗MDA5は急速進行性間質性肺炎で予後不良、抗TIF1-γは悪性腫瘍の合併を強く示唆します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-mda5",
     "label": "抗MDA5抗体陽性 — 急速進行性間質性肺炎に警戒",
     "group": "自己抗体",
     "detail": "【根拠】抗MDA5抗体陽性",
     "note": "筋症状が軽くても肺病変が数週で急速に進行し、致死的になりえます。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-ra",
     "label": "関節リウマチを示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗CCP抗体陽性（またはRF陽性）",
     "note": "抗CCP抗体は特異度が高く、骨びらん進行のリスク指標にもなります。RF単独陽性は感染・加齢・他疾患でも起こるため慎重に解釈します。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-mpa",
     "label": "ANCA関連血管炎（MPO-ANCA型）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】MPO-ANCA 陽性",
     "note": "顕微鏡的多発血管炎が代表。急速進行性糸球体腎炎と肺胞出血が二大緊急病態です。好酸球増多を伴えば好酸球性多発血管炎性肉芽腫症（EGPA）を考えます。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-gpa",
     "label": "多発血管炎性肉芽腫症（GPA）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】PR3-ANCA 陽性",
     "note": "上気道（副鼻腔炎・鞍鼻）・肺（結節・空洞）・腎（糸球体腎炎）の三徴が特徴です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-goodpasture",
     "label": "抗GBM抗体陽性 — 緊急病態",
     "group": "自己抗体",
     "detail": "【根拠】抗GBM（糸球体基底膜）抗体陽性",
     "note": "肺胞出血と急速進行性糸球体腎炎を同時に起こします。血漿交換を含む治療開始の遅れが予後を直接悪化させます。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-aps",
     "label": "抗リン脂質抗体症候群を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗カルジオリピン抗体／抗β2GPI抗体／ループスアンチコアグラントのいずれか陽性",
     "note": "動静脈血栓症と習慣流産を起こします。ループスアンチコアグラントは APTT を延長させますが、出血ではなく血栓に傾くという逆説が臨床上の落とし穴です。APTT 延長を見て抗凝固を控えると、かえって血栓を招きます。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-mg",
     "label": "重症筋無力症を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗AChR抗体陽性 または 抗MuSK抗体陽性",
     "note": "日内変動する筋力低下が特徴（夕方に悪化）。最大の脅威は筋無力性クリーゼによる呼吸筋麻痺です。抗MuSK抗体型は球症状・呼吸筋障害が前面に出やすく、より注意が要ります。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-nmosd",
     "label": "視神経脊髄炎スペクトラム障害（NMOSD）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗AQP4抗体陽性",
     "note": "多発性硬化症と鑑別が必要です。MSの一部の治療薬はNMOSDを増悪させるため、この抗体の有無が治療方針を分けます。視神経炎と長大な脊髄炎が特徴で、重度の後遺症を残しやすい疾患です。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-mogad",
     "label": "MOG抗体関連疾患（MOGAD）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗MOG抗体陽性",
     "note": "視神経炎・急性散在性脳脊髄炎（ADEM）・脊髄炎を起こします。ステロイド反応性が良好な一方、減量時の再発が多いのが特徴です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-gbs",
     "label": "ギラン・バレー症候群スペクトラムを示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗GM1抗体・抗GQ1b抗体・抗GT1a抗体のいずれか陽性",
     "note": "上行性の弛緩性麻痺が進行し、呼吸筋麻痺と自律神経障害（不整脈・血圧変動）が命に関わります。抗体により表現型が分かれます。抗GM1は軸索型（AMAN）、抗GQ1bは外眼筋麻痺・失調・腱反射消失を呈するFisher症候群、抗GT1aは咽頭頸部上腕型で球麻痺が前面に出ます。抗GT1aと抗GQ1bは交差反応することがあります。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-encephalitis",
     "label": "自己免疫性脳炎を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗NMDA受容体抗体／抗LGI1抗体／抗CASPR2抗体のいずれか陽性",
     "note": "精神症状で発症し精神疾患と誤られることがあります。抗NMDA受容体脳炎は若年女性に多く卵巣奇形腫を合併、痙攣・不随意運動・自律神経不安定・中枢性低換気へ進行します。抗LGI1脳炎は特徴的な短い発作（faciobrachial dystonic seizure）と低Na血症を伴います。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-paraneoplastic",
     "label": "傍腫瘍性神経症候群 — 背景に悪性腫瘍の可能性",
     "group": "自己抗体",
     "detail": "【根拠】抗Hu／抗Yo／抗Ri 抗体のいずれか陽性",
     "note": "神経症状が腫瘍の発見に先行することが多く、抗体の種類が原発巣を示唆します（抗Hu→小細胞肺癌、抗Yo→卵巣癌・乳癌）。",
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-hashimoto",
     "label": "橋本病（慢性甲状腺炎）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗TPO抗体 または 抗サイログロブリン抗体陽性",
     "note": "機能低下に傾けば、徐脈・低体温・便秘・浮腫・うつ・認知機能低下が出ます。高齢者では認知症と誤られることがあります。重症では粘液水腫性昏睡。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-graves",
     "label": "バセドウ病を示唆",
     "group": "自己抗体",
     "detail": "【根拠】TRAb（TSH受容体抗体）陽性",
     "note": "甲状腺クリーゼ（発熱・頻脈・心不全・意識障害）が最大の緊急病態で、感染・手術・ヨード造影剤が誘因になります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-pbc",
     "label": "原発性胆汁性胆管炎（PBC）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗ミトコンドリア抗体（M2）陽性",
     "note": "中年女性に多く、ALP・γ-GTの上昇と掻痒感が初発症状になります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-aih",
     "label": "自己免疫性肝炎を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗平滑筋抗体 または 抗LKM-1抗体陽性",
     "note": "IgG高値・ANA陽性を伴うことが多く、急性肝炎様に発症して劇症化することがあります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-pernicious",
     "label": "自己免疫性胃炎・悪性貧血を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗胃壁細胞抗体 または 抗内因子抗体陽性",
     "note": "ビタミンB12欠乏による大球性貧血と神経症状（亜急性連合性脊髄変性症：深部感覚障害・歩行失調）を起こします。神経症状は貧血に先行することがあります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-t1dm",
     "label": "1型糖尿病（自己免疫性）を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗GAD抗体 または 抗IA-2抗体陽性",
     "note": "インスリン分泌が枯渇するためケトアシドーシスのリスクがあります。抗GAD抗体が著明高値の場合は、スティッフパーソン症候群・自己免疫性小脳失調といった神経疾患も鑑別に入ります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-pemphigus",
     "label": "天疱瘡を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗デスモグレイン1 または 3 抗体陽性",
     "note": "表皮内水疱・びらんを生じ、広範囲では熱傷に準じた体液喪失と感染リスクを伴います。抗Dsg3は口腔内びらんが主体で摂食困難になります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-bp",
     "label": "水疱性類天疱瘡を示唆",
     "group": "自己抗体",
     "detail": "【根拠】抗BP180抗体陽性",
     "note": "高齢者に多い緊満性水疱。DPP-4阻害薬による薬剤性の報告があり、内服歴の確認が重要です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-igg4",
     "label": "IgG4関連疾患を示唆",
     "group": "自己抗体",
     "detail": "【根拠】IgG4 > 135 mg/dL",
     "note": "膵・胆管・涙腺唾液腺・後腹膜など多臓器の腫大を起こします。悪性腫瘍との鑑別が重要です。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.ab-screening-neg",
     "label": "スクリーニング陰性 — 膠原病の可能性は低い",
     "group": "自己抗体",
     "detail": "【根拠】抗核抗体陰性・ANCA・抗CCP抗体も陰性",
     "note": "抗核抗体陰性は多くの膠原病を否定する方向に働きます。ただし、ANCA関連血管炎や抗リン脂質抗体症候群はANA陰性でも起こります。",
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-severe-acidemia",
     "label": "重度アシデミア",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】pH < 7.20",
     "note": "心収縮力低下・カテコラミン反応性の低下・不整脈を来します。原因検索と並行した循環管理が要ります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-mixed",
     "label": "混合性酸塩基平衡障害",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】代償の予測範囲から逸脱、または Δ比が単一障害と矛盾",
     "note": "pH だけを見ていると見落とす病態です。相殺し合って pH が正常に見えることもあり、その場合こそ背景に二つの病態が走っています。",
     "refs": [
      "WINTER"
     ],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-triple",
     "label": "三重性酸塩基平衡障害",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】3つ以上の酸塩基平衡障害が併存",
     "note": "重症病態に特徴的です（例：敗血症性ショックの乳酸アシドーシス＋嘔吐による代謝性アルカローシス＋頻呼吸による呼吸性アルカローシス）。",
     "refs": [
      "WINTER"
     ],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-ag-high",
     "label": "AG開大性代謝性アシドーシス — 固定酸の蓄積",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】代謝性アシドーシス・アルブミン補正AG > 14",
     "note": "GOLD MARK で鑑別します：Glycols（エチレングリコール・プロピレングリコール）／Oxoproline（アセトアミノフェン長期）／L-lactate（組織低灌流・敗血症）／D-lactate（短腸症候群）／Methanol／Aspirin（サリチル酸）／Renal failure（尿毒症）／Ketoacidosis（糖尿病・アルコール性・飢餓）。",
     "refs": [
      "GOLDMARK",
      "FIGGE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-osmgap",
     "label": "浸透圧ギャップ開大 — 中毒性アルコールを疑う",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】浸透圧ギャップ > 10 mOsm/kg・AG開大性代謝性アシドーシス",
     "note": "メタノール・エチレングリコール中毒の典型的な組み合わせです。治療開始の遅れが失明・腎不全・死亡に直結します。",
     "refs": [
      "GOLDMARK"
     ],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-hyperchloremic",
     "label": "AG正常（高Cl性）代謝性アシドーシス",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】代謝性アシドーシス・AG は正常範囲",
     "note": "重炭酸の喪失か、酸の排泄障害です。尿アニオンギャップ（尿Na＋尿K−尿Cl）で切り分けます：陰性なら腎外性喪失（下痢）、陽性なら腎性（遠位尿細管性アシドーシス）。生理食塩水の大量投与でも起こります。",
     "refs": [
      "UAG"
     ],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-uag-pos",
     "label": "尿AG 陽性 — 腎性（遠位尿細管性アシドーシス）を示唆",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】AG正常代謝性アシドーシス・尿アニオンギャップが陽性",
     "note": "腎のアンモニウム排泄が不十分であることを示します。遠位（1型）RTA、4型RTA（低レニン低アルドステロン）を鑑別します。",
     "refs": [
      "UAG"
     ],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-uag-neg",
     "label": "尿AG 陰性 — 腎外性喪失（下痢など）を示唆",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】AG正常代謝性アシドーシス・尿アニオンギャップが陰性",
     "note": "腎は正しくアンモニウムを排泄しており、消化管からの重炭酸喪失が主因と考えられます。",
     "refs": [
      "UAG"
     ],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-metalk",
     "label": "代謝性アルカローシス",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】HCO₃⁻ 上昇",
     "note": "尿Cl で二分します。20 mmol/L 未満なら生理食塩水反応性（嘔吐・経鼻胃管吸引・利尿薬中止後・体液量減少）、20 以上なら生理食塩水抵抗性（原発性アルドステロン症・Cushing・Bartter/Gitelman・重度低K）。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-chronic-resp",
     "label": "慢性呼吸性アシドーシス（代償性）",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】PaCO₂ 上昇・HCO₃⁻ が慢性代償の予測範囲内",
     "note": "慢性II型呼吸不全の安定した状態です。この患者で酸素を過剰投与すると CO₂ ナルコーシスを招きえます（低酸素性呼吸ドライブの抑制・換気血流不均等の増悪・Haldane効果）。SpO₂ の目標値は通常より低く設定します。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-acute-resp-acid",
     "label": "急性呼吸性アシドーシス — 換気不全",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】PaCO₂ 上昇・代償が急性パターン",
     "note": "分時換気量が不足しています。中枢抑制（薬剤・脳幹病変）、神経筋疾患（重症筋無力症・ギラン・バレー）、気道閉塞、胸郭・肺病変を鑑別します。進行すれば CO₂ ナルコーシスから呼吸停止に至ります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-resp-alk",
     "label": "呼吸性アルカローシス",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】PaCO₂ 低下",
     "note": "過換気は「不安」で片づけてはいけない所見です。低酸素血症、肺塞栓、敗血症、代謝性アシドーシスの代償、肝不全、中枢神経病変、サリチル酸中毒が背景にありえます。過換気症候群は除外診断です。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-aado2",
     "label": "A-aDO₂ 開大 — 肺でのガス交換障害",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】A-aDO₂ が年齢相当の目安を超えている",
     "note": "換気血流不均等・シャント・拡散障害を示します。純粋な肺胞低換気（麻薬性鎮痛薬・神経筋疾患）では A-aDO₂ は開大しないため、この一点で鑑別が大きく絞れます。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-ards",
     "label": "P/F 比低下 — ARDS の範囲",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】P/F 比 ≦ 300",
     "note": "ベルリン定義では、1週間以内の発症・両側性陰影・心不全や溢水では説明できないこと・PEEP ≧5 cmH₂O 下での P/F 比、の4条件で判定します。本アプリは P/F 比のみを計算しています。",
     "refs": [
      "BERLIN"
     ],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-resp-failure",
     "label": "I 型／II 型呼吸不全の判定",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】PaO₂ ≦ 60 mmHg",
     "note": "PaCO₂ 45 mmHg 以下なら I 型（酸素化障害）、45 超なら II 型（換気障害）です。II 型では酸素投与の目標値を下げ、換気補助を検討します。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-osmgap-missing",
     "label": "浸透圧ギャップが評価できていません",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】実測血清浸透圧は入力済み・推算に必要な項目が不足",
     "note": "推算血清浸透圧は Na・血糖・BUN の3つで計算します。いずれかが未測定のままだと推算値が過小となり、浸透圧ギャップが実際より大きく出ます。AG が開大している状況では、中毒性アルコールの判断に直結するため、不足項目を測定してから評価してください。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "pat.abg-ag-low",
     "label": "AG 低値",
     "group": "血液ガス・酸塩基平衡",
     "detail": "【根拠】アルブミン補正後 AG < 6",
     "note": "低アルブミン血症（補正しても残る場合）、多発性骨髄腫（陽性荷電のM蛋白）、リチウム・臭素・高度高脂血症による偽性低値を考えます。",
     "refs": [
      "FIGGE"
     ],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-dic",
     "label": "播種性血管内凝固症候群（DIC）",
     "group": "横断症候群",
     "detail": "【根拠】血小板減少・FDP／D-ダイマー上昇・フィブリノゲン低下・PT延長",
     "note": "全身の微小血管で凝固が起こり、凝固因子と血小板を使い果たして出血に転じています。出血と血栓が同時に進む病態です。なお肝硬変は凝固因子産生低下と脾機能亢進により同じ所見を呈しうるため、肝疾患の背景がある場合は下の「肝疾患によるDIC類似所見」も併せて読んでください。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-tma",
     "label": "血栓性微小血管症（TTP／HUS）— DICとの鑑別が必要",
     "group": "横断症候群",
     "detail": "【根拠】（入力の測定状態に応じて動的に生成されます）",
     "note": "TMA（TTP／HUSを含む）やDICなどの緊急鑑別が必要です。この3所見だけでは溶血やTMAを確定できません。凝固検査が未測定なら正常とは判断できず、基準範囲内でもDICを除外できません。凝固異常があってもTMAの合併を除外しません。追加検査の結果を待たず医師へ報告してください。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-sepsis",
     "label": "敗血症／敗血症性ショック",
     "group": "横断症候群",
     "detail": "【根拠】感染を示唆する所見（PCT高値・CRP高度上昇・著明な白血球異常・発熱＋炎症）・qSOFA 2点以上または乳酸 ≧4 mmol/L",
     "note": "感染に対する調節不全の宿主反応で臓器障害が起きている状態です。乳酸は組織が酸素不足に陥っているサインで、血圧が保たれていても安心できません。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-liverfailure",
     "label": "肝不全（合成能・解毒能の破綻）",
     "group": "横断症候群",
     "detail": "【根拠】アルブミン低下・PT延長・黄疸またはアンモニア上昇・血小板減少またはChE低下",
     "note": "肝臓の蛋白合成能（アルブミン・凝固因子）と解毒能（アンモニア・ビリルビン）が同時に落ちています。門脈圧亢進による脾機能亢進が血小板減少を加えます。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-gib",
     "label": "消化管出血",
     "group": "横断症候群",
     "detail": "【根拠】貧血・BUN/Cr比 > 20",
     "note": "腸管内に出た血液が蛋白として吸収され、BUNだけが選択的に上がります。貧血と組み合わさったときの意味は重いです。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-hemolysis",
     "label": "溶血",
     "group": "横断症候群",
     "detail": "【根拠】貧血・網赤血球増加（骨髄の反応あり）・LD上昇または間接ビリルビン上昇",
     "note": "赤血球が血管内外で壊されています。自己免疫性・薬剤性・機械的（人工弁・TMA）・感染を鑑別します。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-pancytopenia",
     "label": "汎血球減少（骨髄不全）",
     "group": "横断症候群",
     "detail": "【根拠】白血球・ヘモグロビン・血小板のすべてが低下・いずれかが高度（好中球減少・血小板5万未満・Hb 6未満）",
     "note": "造血そのものが止まっています。薬剤性・再生不良性貧血・骨髄異形成症候群・白血病・血球貪食症候群・巨赤芽球性貧血を鑑別します。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-pancytopenia-mild",
     "label": "汎血球減少（軽度〜中等度）",
     "group": "横断症候群",
     "detail": "【根拠】白血球・ヘモグロビン・血小板のすべてが低下（いずれも高度ではない）",
     "note": "三系統がそろって下がっていること自体が、骨髄という共通の上流に原因があることを示唆します。薬剤性・巨赤芽球性貧血・骨髄異形成症候群・脾機能亢進・膠原病を鑑別します。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-hlh",
     "label": "血球貪食症候群（HLH）の可能性",
     "group": "横断症候群",
     "detail": "【根拠】汎血球減少・可溶性IL-2レセプター高値・38.5℃以上の発熱・肝障害またはLD上昇",
     "note": "マクロファージが自分の血球を食べてしまう過剰炎症状態です。感染・悪性リンパ腫・膠原病が引き金になり、急速に進行します。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-tls",
     "label": "腫瘍崩壊症候群（TLS）",
     "group": "横断症候群",
     "detail": "【根拠】K上昇・P上昇・尿酸上昇・Ca低下・悪性腫瘍・化学療法の背景",
     "note": "腫瘍細胞が一気に壊れ、細胞内の中身が血中に流れ出しています。高K血症による不整脈と、尿酸・リン酸による急性腎障害が二大脅威です。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-rhabdo",
     "label": "横紋筋融解症と続発する急性腎障害",
     "group": "横断症候群",
     "detail": "【根拠】CK > 5000 U/L・腎機能低下または高K血症",
     "note": "壊れた筋細胞のミオグロビンが尿細管を詰まらせ、同時に細胞内のカリウムが血中に出ます。長時間の転倒臥床・痙攣・熱中症・スタチンが原因になります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-hyponatremia-neuro",
     "label": "脳神経疾患に伴う低Na血症 — SIADH と CSWS の鑑別",
     "group": "横断症候群",
     "detail": "【根拠】中等度以上の低Na血症・中枢神経疾患の背景",
     "note": "SIADH と中枢性塩類喪失症候群（CSWS）は検査所見がほぼ同じでありながら、治療が正反対です。SIADH は水制限、CSWS は生理食塩水による補充。切り分けるのは検査値ではなく「体液量」です。CSWS に水制限をかければ脳血流が落ち、脳梗塞を招きます。ここは看護師の観察が診断を決める場面です。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-di-neuro",
     "label": "尿崩症（下垂体・視床下部障害）",
     "group": "横断症候群",
     "detail": "【根拠】高Na血症・希釈尿（尿浸透圧低値／尿比重低値）",
     "note": "抗利尿ホルモンが出ない、または効かず、水が止めどなく失われています。下垂体術後・頭部外傷・脳死に近い病態で起こり、数時間で高Na血症が進行します。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-hyperk-cardiac",
     "label": "高カリウム血症による心停止リスク",
     "group": "横断症候群",
     "detail": "【根拠】K > 6.0 mmol/L",
     "note": "心筋の電気的安定性が失われます。心電図変化（テント状T波→P波消失→QRS幅延長→サインカーブ）は進行の順序そのものです。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-fn",
     "label": "発熱性好中球減少症（FN）",
     "group": "横断症候群",
     "detail": "【根拠】好中球絶対数 < 500/µL・発熱",
     "note": "感染を抑える細胞がいない状態での発熱です。数時間で敗血症性ショックに至りうるため、時間との勝負になります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-aki-uremia",
     "label": "急性腎障害の進行",
     "group": "横断症候群",
     "detail": "【根拠】eGFR < 15・高K血症または代謝性アシドーシス",
     "note": "腎代替療法の適応が近づいています。高K血症・アシドーシス・溢水・尿毒症症状が透析導入の指標になります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-autoimmune-organ",
     "label": "自己免疫疾患の臓器障害",
     "group": "横断症候群",
     "detail": "【根拠】自己抗体陽性・臓器障害を示す検査値異常",
     "note": "自己抗体が陽性で、かつ臓器の数値が動いています。疾患そのものの活動性か、免疫抑制療法による副作用・感染かの切り分けが臨床上の分かれ目です。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-mg-crisis",
     "label": "筋無力性クリーゼのリスク",
     "group": "横断症候群",
     "detail": "【根拠】抗AChR抗体または抗MuSK抗体陽性・呼吸関連の症状または頻呼吸",
     "note": "重症筋無力症で最も恐れるのは呼吸筋麻痺です。SpO₂は最後まで保たれることがあり、低下した時にはすでに手遅れになりえます。呼吸数・咳の強さ・一息で話せる語数といった「努力」の指標で捉えてください。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-gbs-resp",
     "label": "ギラン・バレー症候群の呼吸筋麻痺リスク",
     "group": "横断症候群",
     "detail": "【根拠】抗ガングリオシド抗体陽性（GM1／GQ1b／GT1a）・麻痺または呼吸症状",
     "note": "麻痺が上行し、横隔膜に達すると呼吸が止まります。自律神経障害による血圧変動・不整脈も命に関わります。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-hypoglycemia",
     "label": "低血糖",
     "group": "横断症候群",
     "detail": "【根拠】血糖 < 50 mg/dL",
     "note": "脳はブドウ糖しか使えません。遷延すれば不可逆的な障害を残します。β遮断薬内服中や無自覚性低血糖では警告症状が出ません。",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-dehydration",
     "label": "脱水・循環血液量減少",
     "group": "横断症候群",
     "detail": "【根拠】BUN/Cr比 > 20・高Na血症または頻脈",
     "note": "脱水・循環血液量減少の可能性があります。BUN優位上昇は消化管出血などでも起こるため、Hb・出血徴候も確認してください。高齢者・意識障害・発熱・下痢・利尿薬使用で進行します。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    },
    {
     "id": "sx.sx-malnutrition",
     "label": "低栄養",
     "group": "横断症候群",
     "detail": "【根拠】アルブミン < 3.0 g/dL・ChE低下または貧血",
     "note": "創傷治癒の遅延、褥瘡、易感染、薬物動態の変化（蛋白結合率の高い薬の効果増強）につながります。",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。"
    }
   ]
  },
  {
   "id": "hx",
   "title": "問診・身体所見の選択肢",
   "lead": "身体所見の入力肢そのものの妥当性です。臨床で実際に使う区分が落ちていないか、語（例：捻髪音／水泡音の呼び分け）が成書と合っているかをご覧ください。",
   "items": [
    {
     "id": "hx.発症と経過",
     "label": "発症と経過",
     "group": "問診・身体所見",
     "detail": "発症様式：突然（秒〜分で完成）／急性（数時間）／亜急性（数日〜数週）／慢性（数か月以上）\nその後の経過：進行・増悪／不変／改善傾向／反復（間欠的）\n契機・状況：労作時／安静時／食後／体位変換時／薬剤開始後／感染後／外傷後\n症状のピーク：発症直後が最強／徐々に増強／波がある（間欠）",
     "note": "発症様式 — 「突然」は血管性（破裂・解離・閉塞・捻転）とてんかんを最優先で考える／症状のピーク — 発症直後が最強＝SAH・大動脈解離・内臓穿孔・捻転を示唆",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "問診・身体所見の選択肢の立て方は本アプリの設計判断です。臨床で実際に使う区分が抜けていないかをご覧ください。"
    },
    {
     "id": "hx.全身・意識",
     "label": "全身・意識",
     "group": "問診・身体所見",
     "detail": "GCS 合計：点 数値入力\nJCS（3-3-9度方式）：0（清明）／I（刺激なしで覚醒）／II（刺激で覚醒）／III（刺激でも覚醒しない）\n体液量の見立て：正常／不足（脱水）／過剰（体液過剰）\n体重変化：不変／増加（1週で2kg以上）／減少（6か月で5%以上）",
     "note": "GCS 合計 — E4V5M6＝15。8点以下は気道確保を検討／体液量の見立て — 皮膚ツルゴール・腋窩乾燥・頸静脈・浮腫を総合して",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "問診・身体所見の選択肢の立て方は本アプリの設計判断です。臨床で実際に使う区分が抜けていないかをご覧ください。"
    },
    {
     "id": "hx.呼吸",
     "label": "呼吸",
     "group": "問診・身体所見",
     "detail": "呼吸様式：正常／努力呼吸（補助筋使用）／浅く速い／Kussmaul（深く大きい）／Cheyne-Stokes／下顎呼吸・あえぎ\n起坐呼吸：なし／あり\n肺野の聴診：清／捻髪音（両側下肺の fine crackles）／水泡音（coarse crackles）／wheeze（笛音）／片側で呼吸音減弱／両側で呼吸音減弱\n咳・喀痰：なし／乾性咳／膿性喀痰／血痰・喀血",
     "note": "起坐呼吸 — 臥位で悪化し坐位で改善＝左心不全の特異度が高い所見",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "問診・身体所見の選択肢の立て方は本アプリの設計判断です。臨床で実際に使う区分が抜けていないかをご覧ください。"
    },
    {
     "id": "hx.循環",
     "label": "循環",
     "group": "問診・身体所見",
     "detail": "頸静脈怒張：なし／あり\n心雑音：なし／収縮期／拡張期／新規出現／性状が変化\n心音・心膜：正常／減弱（遠い心音）／III音（ギャロップ）／心膜摩擦音\n血圧の左右差：なし／あり（20mmHg 以上）\n末梢循環：温かく乾燥／冷汗・湿潤／CRT 3秒以上\n下腿浮腫：なし／両側（圧痕性）／片側",
     "note": "頸静脈怒張 — 右房圧上昇。心不全・タンポナーデ・肺塞栓・緊張性気胸で上昇／下腿浮腫 — 片側＝DVT・リンパ・蜂窩巣炎／両側＝心・腎・肝・薬剤",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "問診・身体所見の選択肢の立て方は本アプリの設計判断です。臨床で実際に使う区分が抜けていないかをご覧ください。"
    },
    {
     "id": "hx.腹部",
     "label": "腹部",
     "group": "問診・身体所見",
     "detail": "腹部圧痛の部位：なし／心窩部（上腹部）／右上腹部／右下腹部／左下腹部／臍周囲／背部へ貫通・移動／びまん性\n腹膜刺激徴候：なし／あり（反跳痛・筋性防御）\n腸蠕動音：正常／減弱〜消失／金属音（高調）\nMurphy 徴候：陰性／陽性\nその他の腹部所見：なし／腹部膨満／波動あり（腹水）／拍動性腫瘤／腹壁静脈拡張\n便の性状：正常／水様／血便（鮮血）／黒色・タール状／白色・灰白色",
     "note": "腹膜刺激徴候 — ありなら外科コンサルトと画像を同時並行で",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "問診・身体所見の選択肢の立て方は本アプリの設計判断です。臨床で実際に使う区分が抜けていないかをご覧ください。"
    },
    {
     "id": "hx.神経",
     "label": "神経",
     "group": "問診・身体所見",
     "detail": "局所神経症候：なし／片麻痺／失語／半盲／小脳性（協調運動障害）／構音障害のみ\n瞳孔：正常／左右不同（アニソコリア）／両側散大・固定／両側縮小（pinpoint）\n項部硬直：なし／あり\n羽ばたき振戦：なし／あり\n腱反射：正常／亢進（＋病的反射）／低下〜消失\n感覚障害の分布：なし／手袋・靴下型／デルマトーム分布／髄節レベルあり（横断性）／片側\n振戦：なし／安静時／動作時（細かく速い）",
     "note": "",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "問診・身体所見の選択肢の立て方は本アプリの設計判断です。臨床で実際に使う区分が抜けていないかをご覧ください。"
    },
    {
     "id": "hx.皮膚・関節・表在",
     "label": "皮膚・関節・表在",
     "group": "問診・身体所見",
     "detail": "皮疹：なし／びまん性紅斑／点状出血・紫斑／水疱・粘膜疹／蝶形紅斑／環状・標的状／膿疱\n紫斑の性状：該当なし／触知可能（palpable）／平坦（非触知）\nリンパ節腫脹：なし／局所／全身性\n関節所見：なし／単関節の熱感・腫脹／多関節・対称性（手指小関節）／多関節・非対称性／体軸（仙腸・脊椎）\nRaynaud 現象：なし／あり\n口腔・眼：なし／口腔内潰瘍／眼・口の乾燥／結膜炎・ぶどう膜炎\n甲状腺：正常／びまん性腫大／結節／圧痛あり\nその他の皮膚所見：なし／黄染（黄疸）／チアノーゼ／クモ状血管腫・手掌紅斑／色素沈着／皮膚硬化（浮腫状硬化）",
     "note": "紫斑の性状 — 触知可能＝血管炎／平坦＝血小板・凝固の異常を先に考える",
     "refs": [],
     "star": false,
     "conf": "design",
     "confNote": "問診・身体所見の選択肢の立て方は本アプリの設計判断です。臨床で実際に使う区分が抜けていないかをご覧ください。"
    }
   ]
  },
  {
   "id": "cc",
   "title": "主訴からの診断アプローチ",
   "lead": "★は「その主訴でまず外すべき疾患」と「red flag の一覧」です。外すべき疾患の抜け、red flag の抜け、鑑別の並べ方について、先生の診療の順序と突き合わせてください。",
   "items": [
    {
     "id": "cc.fever.kill0",
     "label": "敗血症・敗血症性ショック",
     "group": "主訴：発熱",
     "detail": "【この主訴で外す理由】感染に対する制御不能な宿主反応が血管内皮を傷害し、組織低灌流に至る。抗菌薬投与の遅れが死亡率に直結する。\n【示唆する所見】意識障害あり・呼吸数 22/分 以上・収縮期血圧 100mmHg 以下・冷汗・湿潤・CRT 3秒以上・乳酸上昇・プロカルシトニン上昇・体温 36℃ 以下（低体温も敗血症の警告）\n【外すためにすること】臓器障害を評価しSOFA等で整理する。qSOFAだけでスクリーニング・除外・治療開始を判断しない／血液培養は投与を有意に遅らせない範囲で先に採取。ショックまたは敗血症の可能性が高ければ直ちに抗菌薬（認識から1時間以内を目安）。ショックのない疑い例は迅速評価し、感染の懸念が残れば認識から3時間以内を目安に開始／乳酸値（初期値と2〜4時間後の再検）／感染巣の同定（尿・胸部画像・腹部エコー／CT・皮膚軟部組織）",
     "note": "",
     "refs": [
      "SEPSIS3",
      "SOFA",
      "SSC2021"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fever.kill1",
     "label": "細菌性髄膜炎",
     "group": "主訴：発熱",
     "detail": "【この主訴で外す理由】髄液腔の化膿性炎症。発症から数時間で脳浮腫・脳血管炎に進む。発熱・意識障害・項部硬直の三徴は全てそろう例が半数に満たない。\n【示唆する所見】項部硬直・意識障害あり・点状出血・紫斑・体温 39℃ 以上・急激な発症\n【外すためにすること】腰椎穿刺前の頭部CTは一律には行わない。安全に実施でき、抗菌薬開始を有意に遅らせない場合は、採血・血液培養と腰椎穿刺を抗菌薬前に行う／占拠性病変のリスク、新規局在神経徴候（痙攣・異常肢位を含む）、瞳孔反応異常、GCS 9以下、進行性・持続性または急速な意識低下があれば画像を先行し、危険因子が解消するまで腰椎穿刺を行わない／気道未確保・呼吸障害・ショック・制御されていない痙攣・出血リスクは腰椎穿刺前に治療・安定化する。広範または急速に拡大する紫斑、穿刺部感染でも実施しない。CT正常だけで安全とは判断しない／細菌性髄膜炎を疑えば静注抗菌薬を速やかに開始（来院1時間以内を目安）。画像・腰椎穿刺が必要でも投与を遅らせず、採血・血液培養、抗菌薬、全身安定化を画像より先に行う。先に抗菌薬を開始した場合は、安全になり次第速やかに腰椎穿刺／細菌性髄膜炎を強く疑う成人ではデキサメタゾンを初回抗菌薬と同時または直前に検討するが、その準備で抗菌薬を遅らせない",
     "note": "",
     "refs": [
      "MENINGITIS",
      "NG240"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fever.kill2",
     "label": "感染性心内膜炎",
     "group": "主訴：発熱",
     "detail": "【この主訴で外す理由】弁上の感染巣から菌が持続的に血流へ出続け、塞栓と免疫学的機序で全身の臓器を侵す。不明熱のまま見逃されやすい。\n【示唆する所見】新規の心雑音・収縮期雑音・点状出血・紫斑・触知可能な紫斑・局所神経症候あり・CRP 上昇\n【外すためにすること】抗菌薬前に血液培養3セットを原則とするが、ショック・重症感染では採取間隔を待って抗菌薬を遅らせない／経胸壁心エコー（陰性でも疑いが強ければ経食道）／修正 Duke 基準での整理／塞栓巣の検索（頭部MRI・脾・腎）",
     "note": "",
     "refs": [
      "DUKE",
      "SSC2021"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fever.kill3",
     "label": "発熱性好中球減少症",
     "group": "主訴：発熱",
     "detail": "【この主訴で外す理由】好中球が枯れた状態では炎症所見そのものが立ち上がらない。局所症状が乏しいまま急速にショックへ進む。\n【示唆する所見】重度の好中球減少・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）・化学療法中\n【外すためにすること】好中球実数（ANC）の確認／血液培養2セット（＋カテーテル各ルーメン）／広域抗菌薬を直ちに（培養結果を待たない）",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fever.kill4",
     "label": "甲状腺クリーゼ",
     "group": "主訴：発熱",
     "detail": "【この主訴で外す理由】甲状腺ホルモン作用の過剰が代謝・循環・中枢を同時に破綻させる。発熱と不整脈と意識障害が同居したら思い出す。\n【示唆する所見】甲状腺びまん性腫大・細かく速い動作時振戦・意識障害あり・心拍数 100/分 以上・体温 39℃ 以上・TRAb 陽性\n【外すためにすること】FT4・FT3・TSH／Burch-Wartofsky スコアと日本甲状腺学会の診断基準での照合／心電図（心房細動・高心拍出性心不全）",
     "note": "",
     "refs": [
      "BURCH",
      "JTA_STORM"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fever.flags",
     "label": "【発熱】red flag と次の一手",
     "group": "主訴：発熱",
     "detail": "【red flag】収縮期血圧 100mmHg 以下・呼吸数 22/分 以上・意識障害あり・SpO₂ 92% 以下・項部硬直・点状出血・紫斑・乳酸上昇・重度の好中球減少・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）・体温 36℃ 以下（低体温も敗血症の警告）・血小板減少・急性期DIC基準 4点以上\n【次に聞くこと】発熱の立ち上がり方（突然の悪寒戦慄＝菌血症を示唆）と日内変動／最近2週間の新しい薬剤、ワクチン、抗菌薬の使用／渡航・動物接触・生食・結核曝露・性交渉歴／医療デバイス（カテーテル・ペースメーカー・人工弁・シャント）／免疫抑制の程度（ステロイド量・生物学的製剤・化学療法の最終日）\n【次に診ること】呼吸数を実際に1分測る（qSOFA で最初に動く）／皮膚を全部見る（点状出血・palpable purpura・末梢の塞栓・デバイス刺入部）／心音（新規雑音）・項部硬直・CVA 叩打痛・前立腺・口腔内／全身のリンパ節と脾の触診",
     "note": "発熱そのものは診断ではない。「どこの」「何による」炎症かを、感染・非感染（膠原病・薬剤・腫瘍・内分泌）の両輪で探す。最初の仕事は、時間単位で命に関わる四つを外すこと。",
     "refs": [
      "SEPSIS3",
      "SOFA",
      "CURB65",
      "ADROP",
      "TG18_INITIAL",
      "IDSA_SSTI"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fever.map",
     "label": "【発熱】鑑別の地図",
     "group": "主訴：発熱",
     "detail": "《感染（臓器別に当たりをつける）》肺炎（膿性喀痰・水泡音・呼吸数 22/分 以上・SpO₂ 92% 以下・CRP 上昇・白血球増加）　|　尿路感染・腎盂腎炎（背部へ貫通する痛み・体温 39℃ 以上・CRP 上昇・白血球増加）　|　胆道感染（胆嚢炎・胆管炎）（右上腹部圧痛・Murphy 徴候陽性・胆道系酵素優位の上昇・ビリルビン上昇・皮膚・眼球の黄染）　|　皮膚軟部組織感染・壊死性筋膜炎（びまん性紅斑・収縮期血圧 100mmHg 以下・CRP 著明上昇・CK 著明上昇・糖尿病の既往）　|　カテーテル関連血流感染（免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）・CRP 上昇・白血球増加）\n《非感染性の炎症》薬剤熱・薬剤性過敏症（DIHS/DRESS）（薬剤開始後・びまん性紅斑・好酸球増加・トランスアミナーゼ上昇・全身性リンパ節腫脹）　|　膠原病（成人Still病・血管炎・SLE）（膠原病の既往・多関節・対称性（手指小関節）・びまん性紅斑・抗核抗体陽性・MPO-ANCA 陽性・PR3-ANCA 陽性・CRP 著明上昇）　|　悪性腫瘍（リンパ腫・白血病）（悪性腫瘍の既往・全身性リンパ節腫脹・体重減少（6か月で5%以上）・LD 上昇・可溶性IL-2レセプター上昇・末梢血に blast・汎血球減少）　|　血球貪食症候群（HLH）（発熱（体温 38℃以上）・汎血球減少・LD 上昇・フィブリノゲン低下・全身性リンパ節腫脹）　|　静脈血栓症（発熱を伴う）（片側下腿浮腫・D-ダイマー上昇・悪性腫瘍の既往）",
     "note": "",
     "refs": [
      "SEPSIS3",
      "SOFA",
      "CURB65",
      "ADROP",
      "TG18_INITIAL",
      "IDSA_SSTI"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.dyspnea.kill0",
     "label": "急性肺血栓塞栓症",
     "group": "主訴：呼吸困難",
     "detail": "【この主訴で外す理由】肺血管床の急な閉塞で右心が後負荷に耐えられなくなる。呼吸困難と頻呼吸だけで、聴診も胸部X線も正常なことがある。\n【示唆する所見】呼吸数 22/分 以上・心拍数 100/分 以上・突然発症（秒〜分で完成）・片側下腿浮腫・D-ダイマー著明上昇・一次性呼吸性アルカローシス・A-aDO₂ 開大・頸静脈怒張・悪性腫瘍の既往\n【外すためにすること】Wells スコアで事前確率を立ててから D-ダイマー（高確率なら D-ダイマーを飛ばす）／造影CT肺動脈相／心エコー（右心負荷）／下肢静脈エコー／簡易PESI で重症度",
     "note": "",
     "refs": [
      "WELLS_PE",
      "SPESI"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.dyspnea.kill1",
     "label": "急性心不全・肺水腫",
     "group": "主訴：呼吸困難",
     "detail": "【この主訴で外す理由】左房圧の急上昇が肺毛細血管から水を押し出す。起坐呼吸は特異度の高い所見で、問診だけで大きく事前確率が動く。\n【示唆する所見】起坐呼吸・頸静脈怒張・両側下肺の捻髪音・III音（ギャロップ）・両側下腿浮腫・BNP／NT-proBNP 上昇・体重増加（1週で2kg以上）・心不全の既往\n【外すためにすること】BNP／NT-proBNP／胸部X線（肺うっ血・心拡大）／心エコー（左室機能・弁・下大静脈）／心電図と心筋トロポニン（虚血が引き金でないか）",
     "note": "",
     "refs": [
      "HF_JCS",
      "PE_HF"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.dyspnea.kill2",
     "label": "緊張性気胸",
     "group": "主訴：呼吸困難",
     "detail": "【この主訴で外す理由】胸腔内圧の上昇が静脈還流を止める。循環不安定・重度呼吸障害を伴う疑い例では臨床判断で緊急減圧する。典型所見が全てそろうのを待たない。\n【示唆する所見】片側で呼吸音減弱・頸静脈怒張・収縮期血圧 90mmHg 未満・突然発症（秒〜分で完成）・COPD の既往\n【外すためにすること】緊張性気胸を臨床的に疑い、循環不安定または重度の呼吸障害があれば、画像を待たず熟練した医療者が緊急胸腔減圧・ドレナージを行う。安定した気胸疑いでは胸部X線・肺エコー等で評価し、適応を判断する／肺エコーは即時に可能で処置を遅らせない場合に補助として使用（lung sliding消失だけでは確定しない）",
     "note": "",
     "refs": [
      "NG39"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.dyspnea.kill3",
     "label": "上気道閉塞・アナフィラキシー",
     "group": "主訴：呼吸困難",
     "detail": "【この主訴で外す理由】気道そのものが細くなる。進行すれば分単位で換気できなくなる。アドレナリン筋注の遅れが致死的。\n【示唆する所見】wheeze（笛音）・びまん性紅斑・薬剤開始後・収縮期血圧 100mmHg 以下・心拍数 100/分 以上\n【外すためにすること】アナフィラキシーを疑う場合は成人アドレナリン0.3〜0.5mgを大腿前外側に筋注（上気道閉塞全般への一律投与ではない）／気道確保の準備を同時並行で／WAO の診断基準で整理",
     "note": "",
     "refs": [
      "ANAPHYLAXIS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.dyspnea.kill4",
     "label": "ARDS",
     "group": "主訴：呼吸困難",
     "detail": "【この主訴で外す理由】肺の炎症で血管透過性が上がり、両肺にびまん性に水と細胞が入る。心原性でないことを確認しながら P/F で定義する。\n【示唆する所見】ARDS に相当する P/F 比・呼吸不全（P/F 比低下）・両側下肺の捻髪音・努力呼吸（補助筋使用）・SpO₂ 90% 未満\n【外すためにすること】P/F 比と PEEP 条件の記録／胸部CT（両側びまん性浸潤影）／心原性肺水腫の除外（心エコー・BNP）／ベルリン定義で重症度を分類",
     "note": "",
     "refs": [
      "BERLIN"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.dyspnea.flags",
     "label": "【呼吸困難】red flag と次の一手",
     "group": "主訴：呼吸困難",
     "detail": "【red flag】SpO₂ 90% 未満・呼吸数 30/分 以上・努力呼吸（補助筋使用）・下顎呼吸・あえぎ呼吸・意識障害あり・収縮期血圧 100mmHg 以下・片側で呼吸音減弱・呼吸性アシドーシス・重度のアシデミア・乳酸上昇・チアノーゼ・冷汗・湿潤\n【次に聞くこと】いつから、どのくらいの速さで（分・時間・日・週）／臥位で悪化するか（起坐呼吸）、夜間に起きるか（夜間発作性呼吸困難）／どのくらいの労作で出るか（平地・階段・会話）— 変化の幅が重症度／体重の変化と内服（利尿薬の自己調整、NSAIDs、新規薬剤）／胸痛・喀血・片側の下腿腫脹（肺塞栓の手がかり）\n【次に診ること】呼吸数と呼吸様式（補助筋・陥没・会話できる文の長さ）／頸静脈・III音・両側下肺の捻髪音（心不全の三点セット）／左右の呼吸音差と打診（気胸・胸水）／下腿の左右差（片側腫脹は肺塞栓へ）",
     "note": "呼吸困難は「気道・肺・心・血液・代謝・中枢」のどこが破れても出る。酸素化（SpO₂・P/F）と換気（PaCO₂）を分けて考えると、原因の層がはっきりする。",
     "refs": [
      "HF_JCS",
      "PE_HF",
      "WELLS_PE",
      "BERLIN",
      "CURB65",
      "ADROP",
      "LIGHT"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.dyspnea.map",
     "label": "【呼吸困難】鑑別の地図",
     "group": "主訴：呼吸困難",
     "detail": "《心・血管》急性心不全（起坐呼吸・頸静脈怒張・両側下肺の捻髪音・III音（ギャロップ）・両側下腿浮腫・BNP／NT-proBNP 上昇）　|　肺血栓塞栓症（突然発症（秒〜分で完成）・呼吸数 22/分 以上・D-ダイマー著明上昇・片側下腿浮腫・一次性呼吸性アルカローシス）　|　心タンポナーデ（頸静脈怒張・心音減弱・収縮期血圧 100mmHg 以下・心拍数 100/分 以上・心膜摩擦音）　|　急性冠症候群（呼吸困難が主訴）（冷汗・湿潤・トロポニン上昇・糖尿病の既往・75歳以上）\n《肺・気道》肺炎（水泡音・膿性喀痰・発熱（体温 38℃以上）・CRP 上昇・SpO₂ 92% 以下）　|　COPD・喘息の急性増悪（wheeze（笛音）・努力呼吸（補助筋使用）・COPD の既往・呼吸性アシドーシス・一次性呼吸性アシドーシス）　|　気胸（片側で呼吸音減弱・突然発症（秒〜分で完成））　|　胸水（片側で呼吸音減弱・両側で呼吸音減弱・アルブミン低下・心不全の既往・肝硬変の既往）　|　間質性肺疾患（両側下肺の捻髪音・慢性（数か月以上）・A-aDO₂ 開大・膠原病の既往）\n《肺以外の原因（見落としやすい層）》代謝性アシドーシスの代償（Kussmaul 呼吸）（Kussmaul 呼吸・代謝性アシドーシス・アニオンギャップ開大・著明な高血糖・乳酸上昇）　|　重度貧血（重度の貧血・貧血・心拍数 100/分 以上）　|　過換気・不安（一次性呼吸性アルカローシス・反復・間欠的）　|　神経筋疾患（横隔膜の力不足）（腱反射の低下〜消失・抗AChR抗体陽性・亜急性（数日〜数週））",
     "note": "",
     "refs": [
      "HF_JCS",
      "PE_HF",
      "WELLS_PE",
      "BERLIN",
      "CURB65",
      "ADROP",
      "LIGHT"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.chest_pain.kill0",
     "label": "急性冠症候群",
     "group": "主訴：胸痛",
     "detail": "【この主訴で外す理由】冠動脈のプラーク破綻と血栓で心筋が死に始める。再灌流までの時間がそのまま心筋の量になる。\n【示唆する所見】労作時に出現・冷汗・湿潤・トロポニン上昇・糖尿病の既往・75歳以上・急性発症（数時間）・心窩部圧痛\n【外すためにすること】来院10分以内の12誘導心電図（陰性なら時間をおいて反復）／高感度トロポニンの 0/1 時間アルゴリズム／ST上昇があれば再灌流療法の判断を同時に",
     "note": "",
     "refs": [
      "ACS_JCS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.chest_pain.kill1",
     "label": "急性大動脈解離",
     "group": "主訴：胸痛",
     "detail": "【この主訴で外す理由】内膜が裂け、偽腔が分枝をつぎつぎ塞ぐ。痛みの最強点が発症直後にあり、血圧の左右差や新規の拡張期雑音が手がかりになる。\n【示唆する所見】発症直後が最強（thunderclap 型）・突然発症（秒〜分で完成）・血圧の左右差 20mmHg 以上・拡張期雑音・背部へ貫通する痛み・局所神経症候あり・D-ダイマー著明上昇\n【外すためにすること】血圧の左右差と上下肢差の実測／造影CT（上行〜腸骨まで）／D-ダイマー陰性だけでは解離を除外しない。臨床的疑いが強ければ結果を待たず画像・専門科評価／高血圧・頻脈を伴う解離では臓器灌流を保ちながら降圧・心拍数管理。低血圧・ショックでは一律に降圧せず緊急外科評価・蘇生を優先",
     "note": "",
     "refs": [
      "AORTA_ACC"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.chest_pain.kill2",
     "label": "肺血栓塞栓症",
     "group": "主訴：胸痛",
     "detail": "【この主訴で外す理由】胸痛と呼吸困難が同居し、聴診は正常。頻呼吸と低酸素だけが訴える。\n【示唆する所見】突然発症（秒〜分で完成）・呼吸数 22/分 以上・SpO₂ 92% 以下・D-ダイマー著明上昇・片側下腿浮腫・一次性呼吸性アルカローシス\n【外すためにすること】循環が安定していればWellsで事前確率を評価。PE likelyならD-ダイマーを待たずCTPA、unlikelyならD-ダイマーから判断。ショックでは救急対応とベッドサイド評価を優先／心エコー（右心負荷）／下肢静脈エコー",
     "note": "",
     "refs": [
      "WELLS_PE",
      "NG158"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.chest_pain.kill3",
     "label": "緊張性気胸・食道破裂",
     "group": "主訴：胸痛",
     "detail": "【この主訴で外す理由】どちらも胸腔内に圧や消化液が漏れ出す病態。気胸は循環を止め、食道破裂は縦隔を融かす。\n【示唆する所見】片側で呼吸音減弱・頸静脈怒張・収縮期血圧 90mmHg 未満・痛みが進行している・激しい嘔吐のあとの胸痛（Boerhaave）\n【外すためにすること】緊張性気胸を臨床的に疑い、循環不安定または重度の呼吸障害があれば、画像を待たず熟練した医療者が緊急胸腔減圧・ドレナージを行う。安定した気胸疑いでは胸部X線・肺エコー等で評価し、適応を判断する／嘔吐後の胸痛なら造影CT／食道造影で縦隔気腫を探す",
     "note": "",
     "refs": [
      "NG39"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.chest_pain.flags",
     "label": "【胸痛】red flag と次の一手",
     "group": "主訴：胸痛",
     "detail": "【red flag】発症直後が最強（thunderclap 型）・血圧の左右差 20mmHg 以上・収縮期血圧 100mmHg 以下・冷汗・湿潤・SpO₂ 92% 以下・意識障害あり・トロポニン上昇・新規の心雑音・片側で呼吸音減弱・頸静脈怒張・呼吸数 22/分 以上・D-ダイマー著明上昇\n【次に聞くこと】発症の瞬間を特定できるか（できる＝血管性を疑う）／痛みの最強点が最初か、だんだん強くなったか／労作との関係、安静や硝酸薬での変化／移動するか（前胸部→背部＝解離）／嘔吐・飲酒のあとか（食道破裂）、外傷・長時間の不動（肺塞栓）\n【次に診ること】両腕の血圧を実測して左右差を見る／心音（新規の拡張期雑音・摩擦音・心音減弱）と頸静脈／左右の呼吸音差、皮下気腫／胸壁の圧痛点と皮疹（デルマトーム）",
     "note": "胸痛では「頻度の高い診断」より「外し損ねたら死ぬ診断」を先に並べる。心・大血管・肺・食道の四つの管を順に潰していく。",
     "refs": [
      "ACS_JCS",
      "AORTA_ACC",
      "WELLS_PE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.chest_pain.map",
     "label": "【胸痛】鑑別の地図",
     "group": "主訴：胸痛",
     "detail": "《心・大血管》急性冠症候群（労作時に出現・冷汗・湿潤・トロポニン上昇・糖尿病の既往）　|　大動脈解離（発症直後が最強（thunderclap 型）・血圧の左右差 20mmHg 以上・拡張期雑音・背部へ貫通する痛み）　|　急性心膜炎（心膜摩擦音・体位変換で出現・CRP 上昇・トロポニン上昇）　|　心タンポナーデ（頸静脈怒張・心音減弱・収縮期血圧 100mmHg 以下）\n《肺・胸膜》肺血栓塞栓症（突然発症（秒〜分で完成）・呼吸数 22/分 以上・D-ダイマー著明上昇・片側下腿浮腫）　|　気胸（片側で呼吸音減弱・突然発症（秒〜分で完成））　|　肺炎・胸膜炎（発熱（体温 38℃以上）・水泡音・CRP 上昇・膿性喀痰）\n《消化器・胸壁》逆流性食道炎・食道痙攣（食後に出現・反復・間欠的・体位変換で出現）　|　胆道・膵疾患からの放散（右上腹部圧痛・心窩部圧痛・Murphy 徴候陽性・アミラーゼ著明上昇・胆道系酵素優位の上昇）　|　肋間筋・胸肋関節の痛み（外傷後・反復する体位依存性の痛み）　|　帯状疱疹（びまん性紅斑・デルマトーム分布の感覚障害）",
     "note": "",
     "refs": [
      "ACS_JCS",
      "AORTA_ACC",
      "WELLS_PE"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.abd_pain.kill0",
     "label": "消化管穿孔・汎発性腹膜炎",
     "group": "主訴：腹痛",
     "detail": "【この主訴で外す理由】腸内容が腹腔に漏れ、細菌と消化酵素が腹膜を侵す。時間とともに敗血症性ショックへ移る。\n【示唆する所見】腹膜刺激徴候・びまん性圧痛・突然発症（秒〜分で完成）・腸蠕動音の減弱〜消失・収縮期血圧 100mmHg 以下・CRP 上昇・白血球増加・NSAIDs の使用\n【外すためにすること】立位腹部X線／腹部CT（free air）／外科コンサルトを画像と同時並行で／輸液・抗菌薬・NPO",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.abd_pain.kill1",
     "label": "上腸間膜動脈閉塞・腸管虚血",
     "group": "主訴：腹痛",
     "detail": "【この主訴で外す理由】腸が死んでいく過程。初期は所見が乏しく痛みだけが激しい（pain out of proportion）。乳酸が上がる頃には腸はすでに壊れている。\n【示唆する所見】突然発症（秒〜分で完成）・発症直後が最強（thunderclap 型）・心房細動の既往・乳酸上昇・アニオンギャップ開大・代謝性アシドーシス・腸蠕動音の減弱〜消失・75歳以上\n【外すためにすること】造影CT（動脈相・門脈相）を急ぐ／乳酸値（上昇は晩期の所見であり、正常でも否定しない）／心房細動・心内血栓の確認／外科・IVR に早期連絡",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.abd_pain.kill2",
     "label": "腹部大動脈瘤の破裂",
     "group": "主訴：腹痛",
     "detail": "【この主訴で外す理由】破裂すれば分単位で失血する。拍動性腫瘤・腹背部痛・低血圧の三つで即断。\n【示唆する所見】拍動性腹部腫瘤・背部へ貫通する痛み・収縮期血圧 90mmHg 未満・収縮期血圧 100mmHg 以下・突然発症（秒〜分で完成）・75歳以上・貧血\n【外すためにすること】ベッドサイドエコーで大動脈径／造影CT（安定していれば）／直ちに血管外科と輸血の手配",
     "note": "",
     "refs": [
      "AORTA_ACC"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.abd_pain.kill3",
     "label": "急性胆管炎",
     "group": "主訴：腹痛",
     "detail": "【この主訴で外す理由】閉塞した胆道内で胆汁が感染し、圧で菌が血中へ押し出される。抗菌薬・全身管理に加え、重症度と初期治療への反応で胆道ドレナージの時機を決める。\n【示唆する所見】右上腹部圧痛・皮膚・眼球の黄染・体温 39℃ 以上・胆道系酵素優位の上昇・ビリルビン上昇・収縮期血圧 100mmHg 以下・意識障害あり・血小板減少\n【外すためにすること】Tokyo Guidelines 2018 の診断・重症度基準で照合／腹部エコー／MRCP／CT／血液培養／抗菌薬・循環呼吸管理を開始し、中等症は早期、重症は初期安定化後できるだけ速やかに胆道ドレナージ。軽症も初期治療に反応しなければ検討",
     "note": "",
     "refs": [
      "TG18",
      "TG18_INITIAL"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.abd_pain.kill4",
     "label": "重症急性膵炎",
     "group": "主訴：腹痛",
     "detail": "【この主訴で外す理由】活性化した膵酵素が自己消化を起こし、全身の血管透過性が破れる。初期48時間の輸液管理が予後を決める。\n【示唆する所見】心窩部圧痛・背部へ貫通する痛み・アミラーゼ著明上昇・リパーゼ著明上昇・hypoca・呼吸数 22/分 以上・乳酸上昇\n【外すためにすること】リパーゼ（アミラーゼより特異的）／膵炎のCTは診断不確実・悪化時など適応を判断。壊死評価の時期と緊急鑑別の画像を区別し、他の急性腹症が疑わしければ48〜72時間を待たない／厚生労働省 重症度判定基準（予後因子＋CT grade）／胆石性かアルコール性かで治療方針が分かれる",
     "note": "",
     "refs": [
      "JSS_AP",
      "ACG_AP2024"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.abd_pain.flags",
     "label": "【腹痛】red flag と次の一手",
     "group": "主訴：腹痛",
     "detail": "【red flag】腹膜刺激徴候・発症直後が最強（thunderclap 型）・収縮期血圧 100mmHg 以下・拍動性腹部腫瘤・金属音（腸閉塞を示唆）・腸蠕動音の減弱〜消失・乳酸上昇・意識障害あり・75歳以上・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）・血便（鮮血）・黒色・タール状便・重度の貧血\n【次に聞くこと】痛みの始まり方と最強点の時期、場所の移動／食事・排便・排尿との関係、最終排便と排ガス／手術歴（癒着性腸閉塞）と腹部手術・内視鏡の既往／NSAIDs・ステロイド・抗凝固薬／女性なら最終月経と妊娠の可能性\n【次に診ること】腹膜刺激徴候（反跳痛・筋性防御）を最初に確認する／腸蠕動音（消失か金属音か）と腹部膨満／鼠径・臍の膨隆（嵌入ヘルニア）と拍動性腫瘤／直腸診と、女性では骨盤内の評価",
     "note": "腹痛は「手術が必要か」「血管の事故か」を先に決め、その後で部位別の鑑別に降りる。腹膜刺激徴候と、所見に不釣り合いな激痛は、どちらも外科を呼ぶ合図。",
     "refs": [
      "TG18",
      "ALVARADO",
      "JSS_AP",
      "AORTA_ACC"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.abd_pain.map",
     "label": "【腹痛】鑑別の地図",
     "group": "主訴：腹痛",
     "detail": "《右上腹部・心窩部》胆石症・胆嚢炎（右上腹部圧痛・Murphy 徴候陽性・食後に出現・胆道系酵素優位の上昇・発熱（体温 38℃以上））　|　胆管炎（右上腹部圧痛・皮膚・眼球の黄染・発熱（体温 38℃以上）・ビリルビン上昇・胆道系酵素優位の上昇）　|　急性膵炎（心窩部圧痛・背部へ貫通する痛み・アミラーゼ著明上昇・リパーゼ著明上昇）　|　胃・十二指腸潰瘍（心窩部圧痛・NSAIDs の使用・黒色・タール状便・貧血・BUN/Cr 比の上昇）　|　急性冠症候群（心窩部痛として）（心窩部圧痛・冷汗・湿潤・トロポニン上昇・糖尿病の既往）\n《下腹部》急性虫垂炎（右下腹部圧痛・臍周囲圧痛・発熱（体温 38℃以上）・白血球増加・CRP 上昇）　|　大腸炎・感染性腸炎（水様便・血便（鮮血）・発熱（体温 38℃以上）・びまん性圧痛・CRP 上昇）　|　虚血性大腸炎（左下腹部圧痛・血便（鮮血）・突然発症（秒〜分で完成）・75歳以上）　|　尿路結石（背部へ貫通する痛み・反復・間欠的・嘔吐を伴う）　|　婦人科疾患（卵巣捻転・骨盤内感染・妊娠）（女性・突然発症（秒〜分で完成）・発熱（体温 38℃以上））\n《びまん性・その他》腸閉塞（金属音（腸閉塞を示唆）・腹部膨満・びまん性圧痛・嘔吐）　|　腸管虚血（発症直後が最強（thunderclap 型）・心房細動の既往・乳酸上昇・代謝性アシドーシス・アニオンギャップ開大）　|　糖尿病性ケトアシドーシス（著明な高血糖・アニオンギャップ開大・代謝性アシドーシス・Kussmaul 呼吸・糖尿病の既往）　|　特発性細菌性腹膜炎（肝硬変の既往・腹水（波動）・発熱（体温 38℃以上）・びまん性圧痛・アルブミン低下）　|　副腎不全・高カルシウム血症など代謝性（高カルシウム血症・低ナトリウム血症・高カリウム血症・色素沈着）",
     "note": "",
     "refs": [
      "TG18",
      "ALVARADO",
      "JSS_AP",
      "AORTA_ACC"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.consciousness.kill0",
     "label": "低血糖",
     "group": "主訴：意識障害",
     "detail": "【この主訴で外す理由】低血糖は脳のエネルギー供給を障害し、遷延すれば不可逆の神経障害になりうる。直ちに血糖を測定して対応する。\n【示唆する所見】低血糖・hypoglycemia_severe・冷汗・湿潤・インスリン・SU薬の使用\n【外すためにすること】血糖を最初に測る（指尖で足りる）／低血糖による意識障害では静注ブドウ糖等で直ちに補正し再検（意識障害時は経口投与しない）。濃度・量は施設手順と静脈路に応じる／SU薬なら再発するので入院で経過を見る",
     "note": "",
     "refs": [
      "NG128",
      "ASAM_THIAMINE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.consciousness.kill1",
     "label": "脳血管障害（出血・梗塞・SAH）",
     "group": "主訴：意識障害",
     "detail": "【この主訴で外す理由】脳の構造が壊れている。時間が組織を決めるので、画像までの時間を削る。\n【示唆する所見】突然発症（秒〜分で完成）・局所神経症候あり・瞳孔不同・腱反射亢進（＋病的反射）・心房細動の既往・抗凝固薬の使用・頭痛を伴う\n【外すためにすること】頭部CT（出血の除外）、必要に応じてCTA／MRI／血糖・電解質を同時に／血圧管理と抗凝固薬の確認／NIHSS で神経学的重症度を記録",
     "note": "",
     "refs": [
      "STROKE_JP",
      "NIHSS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.consciousness.kill2",
     "label": "細菌性髄膜炎・脳炎",
     "group": "主訴：意識障害",
     "detail": "【この主訴で外す理由】中枢の感染は時間単位で進む。発熱と意識障害があれば、画像が正常でも感染は否定できず、腰椎穿刺の安全性を別途評価する。\n【示唆する所見】項部硬直・発熱（体温 38℃以上）・体温 39℃ 以上・点状出血・紫斑・CRP 上昇・痙攣を伴う\n【外すためにすること】腰椎穿刺前の頭部CTは一律には行わない。安全に実施でき、抗菌薬開始を有意に遅らせない場合は、採血・血液培養と腰椎穿刺を抗菌薬前に行う／占拠性病変のリスク、新規局在神経徴候（痙攣・異常肢位を含む）、瞳孔反応異常、GCS 9以下、進行性・持続性または急速な意識低下があれば画像を先行し、危険因子が解消するまで腰椎穿刺を行わない／気道未確保・呼吸障害・ショック・制御されていない痙攣・出血リスクは腰椎穿刺前に治療・安定化する。広範または急速に拡大する紫斑、穿刺部感染でも実施しない。CT正常だけで安全とは判断しない／細菌性髄膜炎を疑えば静注抗菌薬を速やかに開始（来院1時間以内を目安）。画像・腰椎穿刺が必要でも投与を遅らせず、採血・血液培養、抗菌薬、全身安定化を画像より先に行う。先に抗菌薬を開始した場合は、安全になり次第速やかに腰椎穿刺／細菌性髄膜炎を強く疑う成人ではデキサメタゾンを初回抗菌薬と同時または直前に検討するが、その準備で抗菌薬を遅らせない／脳炎を疑えばアシクロビルを検査結果待ちで遅らせず開始し、腎機能に応じ調整する",
     "note": "",
     "refs": [
      "MENINGITIS",
      "NG240",
      "ENCEPH_IDSA"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.consciousness.kill3",
     "label": "非痙攣性てんかん重積",
     "group": "主訴：意識障害",
     "detail": "【この主訴で外す理由】見える痙攣がないまま脳が発作を起こし続けている。意識障害が説明できないときに必ず思い出す。\n【示唆する所見】意識障害あり・てんかんの既往・痙攣の目撃・抗てんかん薬の使用\n【外すためにすること】脳波（可能なら持続モニタリング）／抗てんかん薬の血中濃度／痙攣性重積の5分基準を非痙攣性に一律適用しない。持続する意識障害では緊急脳波・専門科評価で判断",
     "note": "",
     "refs": [
      "SE_ILAE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.consciousness.kill4",
     "label": "重度の代謝性破綻",
     "group": "主訴：意識障害",
     "detail": "【この主訴で外す理由】アンモニア・ナトリウム・CO₂・甲状腺のどれかが脳を止めている。原因を治せば戻る。\n【示唆する所見】アンモニア上昇・重度の低ナトリウム血症・hyperna_severe・呼吸性アシドーシス・重度のアシデミア・羽ばたき振戦・肝硬変の既往・hyperca_severe\n【外すためにすること】アンモニア・Na・血糖・Ca・血液ガス・肝腎機能を一度に／低Naと高Naを区別し、発症時期・症状で補正計画を決める。低Naによる痙攣・昏睡では監視下で高張食塩水を緊急使用し、Naを頻回測定して過補正を防ぐ。慢性低Na・ODS高リスク例は特に厳格な上限を設定／West-Haven 分類で肝性脳症の段階を記録",
     "note": "",
     "refs": [
      "WESTHAVEN",
      "HYPONA_EMERG"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.consciousness.flags",
     "label": "【意識障害】red flag と次の一手",
     "group": "主訴：意識障害",
     "detail": "【red flag】昏睡（GCS 8 以下 または JCS III）・GCS 8 点以下・瞳孔不同・両側散大・固定・局所神経症候あり・項部硬直・低血糖・SpO₂ 90% 未満・収縮期血圧 90mmHg 未満・心拍数 50/分 以下・Cheyne-Stokes 呼吸・下顎呼吸・あえぎ呼吸・呼吸性アシドーシス・抗凝固薬の使用\n【次に聞くこと】最後に normal だった時刻（目撃者に確認する）／発症の速さと、その時していたこと／薬（オピオイド・鎮静薬・インスリン・SU薬・抗てんかん薬）とアルコール／外傷（本人が覚えていないことがある）、転倒／基礎疾患（肝・腎・糖尿病・てんかん・精神疾患）と直近の感染\n【次に診ること】GCS を項目ごとに（E・V・M を分けて記録する）／瞳孔径・左右差・対光反射、眼球の位置と運動／項部硬直と髄膜刺激徴候／呼吸様式（Cheyne-Stokes・Kussmaul・下顎呼吸）／皮膚（黄染・点状出血・注射痕）と体温",
     "note": "意識障害は「すぐ治せるもの」から順に潰す。低血糖・低酸素・ショック・オピオイドは分単位で戻せる。そのうえで、びまん性（代謝・中毒・感染）か局所（脳の構造)かを分ける。",
     "refs": [
      "GCS",
      "JCS",
      "WESTHAVEN",
      "SE_ILAE",
      "STROKE_JP",
      "AHA_POISON",
      "ASAM_THIAMINE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.consciousness.map",
     "label": "【意識障害】鑑別の地図",
     "group": "主訴：意識障害",
     "detail": "《すぐ治せる（最初に潰す）》低血糖（低血糖・hypoglycemia_severe・冷汗・湿潤）　|　低酸素・CO₂ ナルコーシス（SpO₂ 90% 未満・呼吸性アシドーシス・一次性呼吸性アシドーシス・COPD の既往）　|　オピオイド・ベンゾジアゼピン中毒（両側縮小（pinpoint）・薬剤開始後・呼吸性アシドーシス）　|　ショック（脳灌流の不足）（収縮期血圧 90mmHg 未満・冷汗・湿潤・CRT 3秒以上・乳酸上昇）\n《脳そのもの（局所徴候を探す）》脳出血・脳梗塞（突然発症（秒〜分で完成）・局所神経症候あり・片麻痺・腱反射亢進（＋病的反射）・心房細動の既往）　|　くも膜下出血（発症直後が最強（thunderclap 型）・項部硬直・突然発症（秒〜分で完成））　|　脳炎・髄膜炎（発熱（体温 38℃以上）・項部硬直・CRP 上昇）　|　てんかん重積・発作後（反復・間欠的・乳酸上昇・CK 著明上昇）　|　慢性硬膜下血腫（亜急性（数日〜数週）・外傷後・75歳以上・抗凝固薬の使用）\n《全身から来る（びまん性）》肝性脳症（羽ばたき振戦・アンモニア上昇・肝硬変の既往・アルブミン低下・コリンエステラーゼ低下）　|　尿毒症性脳症（重度の腎機能低下・renal_endstage・慢性腎臓病・透析・羽ばたき振戦）　|　電解質異常（Na・Ca）（重度の低ナトリウム血症・hyperna_severe・hyperca_severe・hypona_mod）　|　敗血症性脳症（発熱（体温 38℃以上）・乳酸上昇・CRP 上昇・呼吸数 22/分 以上・収縮期血圧 100mmHg 以下）　|　内分泌（甲状腺・副腎）（甲状腺びまん性腫大・TRAb 陽性・低ナトリウム血症・高カリウム血症・色素沈着）　|　ビタミンB1欠乏（Wernicke）（小脳性の協調運動障害・倦怠・食事摂取不良）",
     "note": "",
     "refs": [
      "GCS",
      "JCS",
      "WESTHAVEN",
      "SE_ILAE",
      "STROKE_JP",
      "AHA_POISON",
      "ASAM_THIAMINE"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.headache.kill0",
     "label": "くも膜下出血",
     "group": "主訴：頭痛",
     "detail": "【この主訴で外す理由】動脈瘤が破れた瞬間に痛みが最大になる。再破裂すれば致死率が跳ね上がるため、疑った時点で画像。\n【示唆する所見】発症直後が最強（thunderclap 型）・突然発症（秒〜分で完成）・項部硬直・意識障害あり・嘔吐を伴う・75歳以上\n【外すためにすること】頭部単純CT（発症6時間以内なら感度は高い）／CT陰性でも疑いが残れば発症からの時間・読影条件と腰椎穿刺の禁忌を評価し専門科と追加検査を判断。キサントクロミー検査は発症12時間以降を目安／Ottawa SAHルールは適用条件を確認して使用し、陰性を全患者の除外根拠にしない／CTA／MRA で動脈瘤の検索",
     "note": "",
     "refs": [
      "OTTAWA_SAH",
      "NG228"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.headache.kill1",
     "label": "細菌性髄膜炎",
     "group": "主訴：頭痛",
     "detail": "【この主訴で外す理由】発熱＋頭痛＋項部硬直。抗菌薬の1時間が転帰を変える。\n【示唆する所見】発熱（体温 38℃以上）・体温 39℃ 以上・項部硬直・意識障害あり・点状出血・紫斑・CRP 上昇\n【外すためにすること】腰椎穿刺前の頭部CTは一律には行わない。安全に実施でき、抗菌薬開始を有意に遅らせない場合は、採血・血液培養と腰椎穿刺を抗菌薬前に行う／占拠性病変のリスク、新規局在神経徴候（痙攣・異常肢位を含む）、瞳孔反応異常、GCS 9以下、進行性・持続性または急速な意識低下があれば画像を先行し、危険因子が解消するまで腰椎穿刺を行わない／気道未確保・呼吸障害・ショック・制御されていない痙攣・出血リスクは腰椎穿刺前に治療・安定化する。広範または急速に拡大する紫斑、穿刺部感染でも実施しない。CT正常だけで安全とは判断しない／細菌性髄膜炎を疑えば静注抗菌薬を速やかに開始（来院1時間以内を目安）。画像・腰椎穿刺が必要でも投与を遅らせず、採血・血液培養、抗菌薬、全身安定化を画像より先に行う。先に抗菌薬を開始した場合は、安全になり次第速やかに腰椎穿刺／細菌性髄膜炎を強く疑う成人ではデキサメタゾンを初回抗菌薬と同時または直前に検討するが、その準備で抗菌薬を遅らせない",
     "note": "",
     "refs": [
      "MENINGITIS",
      "NG240"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.headache.kill2",
     "label": "脳静脈血栓症・高血圧性緊急症",
     "group": "主訴：頭痛",
     "detail": "【この主訴で外す理由】静脈側の閉塞や血圧そのものが頭蓋内圧を上げる。進行性の頭痛と視覚症状、痙攣で現れる。\n【示唆する所見】進行・増悪している・収縮期血圧 180mmHg 以上・痙攣・半盲・抗リン脂質抗体陽性\n【外すためにすること】MRI／MRV（静脈相を必ず含める）／眼底（うっ血乳頭）／凝固・抗リン脂質抗体／急性臓器障害を伴う高血圧性緊急症でのみ監視下の降圧を検討。脳卒中・解離など病態別の目標に従い、脳静脈血栓症や血圧値だけで一律に降圧しない",
     "note": "",
     "refs": [
      "ESC_HTN2024"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.headache.kill3",
     "label": "巨細胞性動脈炎",
     "group": "主訴：頭痛",
     "detail": "【この主訴で外す理由】側頭動脈の炎症が眼動脈に及ぶと、不可逆の失明になる。50歳以上の新規頭痛では必ず考える。\n【示唆する所見】50歳以上の新規頭痛・CRP 上昇・CRP 著明上昇・貧血・多関節・対称性（手指小関節）・体重減少（6か月で5%以上）\n【外すためにすること】赤沈・CRP／側頭動脈の圧痛・拍動減弱・顎の疲労（jaw claudication）の確認／疑えばステロイドを先に開始し、側頭動脈生検は後から",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.headache.flags",
     "label": "【頭痛】red flag と次の一手",
     "group": "主訴：頭痛",
     "detail": "【red flag】発症直後が最強（thunderclap 型）・突然発症（秒〜分で完成）・項部硬直・意識障害あり・局所神経症候あり・発熱（体温 38℃以上）・進行・増悪している・75歳以上・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）・抗凝固薬の使用・瞳孔不同・外傷後\n【次に聞くこと】いつもの頭痛と同じか、違うか（違えば二次性として扱う）／人生で最悪か、何秒でピークに達したか／発熱・項部硬直・嘔吐・視覚症状の有無／外傷・抗凝固薬・免疫抑制状態／起床時の悪化、咳・前屈での増強（頭蓋内圧）\n【次に診ること】瞳孔・眼球運動・視野と眼底（うっ血乳頭）／項部硬直、Kernig・Brudzinski／側頭動脈の圧痛と拍動／局所神経症候（軽い片麻痺・失語を見逃さない）",
     "note": "頭痛の仕事は一次性（片頭痛・緊張型）と二次性（血管・感染・圧）の切り分け。いつもと違う、最悪、初めて — この三語が出たら二次性として扱う。",
     "refs": [
      "OTTAWA_SAH",
      "MENINGITIS",
      "STROKE_JP"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.headache.map",
     "label": "【頭痛】鑑別の地図",
     "group": "主訴：頭痛",
     "detail": "《二次性（構造・血管・感染）》くも膜下出血（発症直後が最強（thunderclap 型）・項部硬直・突然発症（秒〜分で完成））　|　脳出血（突然発症（秒〜分で完成）・局所神経症候あり・片麻痺・抗凝固薬の使用）　|　髄膜炎・脳炎（発熱（体温 38℃以上）・項部硬直・CRP 上昇・意識障害あり）　|　脳静脈血栓症（進行・増悪している・抗リン脂質抗体陽性・女性・ホルモン関連）　|　頭蓋内圧亢進（腫瘍・水頭症）（進行・増悪している・亜急性（数日〜数週）・悪性腫瘍の既往・局所神経症候あり）　|　慢性硬膜下血腫（外傷後・亜急性（数日〜数週）・75歳以上・抗凝固薬の使用）\n《一次性（二次性を外した後）》片頭痛（反復・間欠的・嘔吐・悪心・半盲）　|　緊張型頭痛（慢性（数か月以上）・反復・間欠的）　|　群発頭痛（反復・間欠的・発症直後が最強（thunderclap 型））\n《全身・薬剤》薬剤（硝酸薬・Ca拮抗薬）・薬物乱用頭痛（薬剤開始後・反復・間欠的）　|　一酸化炭素中毒（倦怠感を伴う・乳酸上昇・代謝性アシドーシス）　|　緑内障・副鼻腔炎・側頭動脈炎（結膜炎・ぶどう膜炎・発熱（体温 38℃以上）・CRP 上昇）",
     "note": "",
     "refs": [
      "OTTAWA_SAH",
      "MENINGITIS",
      "STROKE_JP"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.paralysis.kill0",
     "label": "急性脳梗塞",
     "group": "主訴：麻痺",
     "detail": "【この主訴で外す理由】血流が止まった領域が毎分壊れていく。再灌流療法には時間の窓があり、発症時刻の確定が治療方針そのもの。\n【示唆する所見】突然発症（秒〜分で完成）・片麻痺・失語・構音障害・半盲・心房細動の既往・糖尿病の既往・脳卒中・虚血性心疾患の既往\n【外すためにすること】最後に normal だった時刻の確定／頭部CT（出血の除外）→ CTA／MRI／NIHSS の記録／血糖（低血糖は麻痺で来る）／血栓回収・血栓溶解の適応判断",
     "note": "",
     "refs": [
      "STROKE_JP",
      "NIHSS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.paralysis.kill1",
     "label": "脳出血",
     "group": "主訴：麻痺",
     "detail": "【この主訴で外す理由】出血そのものが圧として脳を壊す。抗凝固薬の有無で初動が変わる。\n【示唆する所見】突然発症（秒〜分で完成）・片麻痺・意識障害あり・瞳孔不同・抗凝固薬の使用・INR 上昇・血小板減少・収縮期血圧 180mmHg 以上\n【外すためにすること】頭部CT／凝固（PT-INR・APTT・血小板）と抗凝固薬の中和／血圧管理／脳外科へ連絡",
     "note": "",
     "refs": [
      "STROKE_JP"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.paralysis.kill2",
     "label": "脊髄圧迫（硬膜外腫瘍・膿瘍・椎体骨折）",
     "group": "主訴：麻痺",
     "detail": "【この主訴で外す理由】脊髄は圧迫が続くと戻らない。膀胱直腸障害が出てからでは遅い。\n【示唆する所見】髄節レベルのある感覚障害（横断性）・腱反射亢進（＋病的反射）・背部へ貫通する痛み・悪性腫瘍の既往・発熱（体温 38℃以上）・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）\n【外すためにすること】緊急MRI（全脊髄）／神経症状を伴う悪性脊髄圧迫を疑う場合は速やかにデキサメタゾンと放射線・手術を専門科と検討（悪性腫瘍の既往だけでは一律投与しない）／膿瘍なら血液培養と排膿／膀胱直腸機能と感覚レベルを時間ごとに記録",
     "note": "",
     "refs": [
      "NG234"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.paralysis.kill3",
     "label": "ギラン・バレー症候群",
     "group": "主訴：麻痺",
     "detail": "【この主訴で外す理由】末梢神経が上行性に麻痺する。呼吸筋に達すれば換気ができなくなるので、肺活量を追うことが監視そのもの。\n【示唆する所見】感染後・腱反射の低下〜消失・進行・増悪している・手袋・靴下型の感覚障害・抗GQ1b抗体陽性・抗GM1抗体陽性・抗GT1a抗体陽性\n【外すためにすること】%肺活量・吸気圧を反復測定（呼吸筋麻痺の予測）／髄液（蛋白細胞解離）／神経伝導検査／抗ガングリオシド抗体／Asbury & Cornblath の診断基準で照合",
     "note": "",
     "refs": [
      "GBS_CRIT"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.paralysis.flags",
     "label": "【麻痺】red flag と次の一手",
     "group": "主訴：麻痺",
     "detail": "【red flag】突然発症（秒〜分で完成）・意識障害あり・瞳孔不同・髄節レベルのある感覚障害（横断性）・腱反射の低下〜消失・進行・増悪している・抗凝固薬の使用・低血糖・重度の高カリウム血症・hypok_severe・著明な高血圧\n【次に聞くこと】最後に normal だった時刻（治療の窓を決める）／症状の広がり方（片側か両側か、下から上がってきたか）／排尿・排便の障害（脊髄病変の警告）／先行する感染・ワクチン（1〜3週前）／抗凝固薬・血圧・既往（心房細動・糖尿病・悪性腫瘍）\n【次に診ること】麻痺の分布（顔を含むか、左右差、上下肢の差）／腱反射と病的反射（中枢か末梢かを分ける要）／感覚のレベル（髄節が特定できるか）／呼吸筋（%肺活量・咳の強さ）と嚥下／血糖と血圧の実測",
     "note": "麻痺はまず「中枢か末梢か」「血管性か非血管性か」。突然なら血管、上行するなら末梢神経、髄節レベルがあれば脊髄。時間が組織を決めるので並行して動く。",
     "refs": [
      "STROKE_JP",
      "NIHSS",
      "ABCD2",
      "GBS_CRIT",
      "NG128"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.paralysis.map",
     "label": "【麻痺】鑑別の地図",
     "group": "主訴：麻痺",
     "detail": "《中枢（脳）》脳梗塞（突然発症（秒〜分で完成）・片麻痺・失語・心房細動の既往）　|　脳出血（突然発症（秒〜分で完成）・意識障害あり・抗凝固薬の使用・INR 上昇）　|　TIA（反復・間欠的・症状が消えた・心房細動の既往・糖尿病の既往）　|　てんかん後の麻痺（Todd 麻痺）（痙攣・てんかんの既往・乳酸上昇・CK 著明上昇）　|　低血糖・代謝性の偽性麻痺（低血糖・重度の低ナトリウム血症・hyperna_severe）\n《脊髄》脊髄圧迫（髄節レベルのある感覚障害（横断性）・腱反射亢進（＋病的反射）・背部へ貫通する痛み・悪性腫瘍の既往）　|　脊髄硬膜外膿瘍（発熱（体温 38℃以上）・背部へ貫通する痛み・CRP 上昇・糖尿病の既往・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後））　|　脊髄炎（視神経炎を伴うもの）（髄節レベルのある感覚障害（横断性）・進行・増悪している・抗核抗体陽性）\n《末梢神経・筋・接合部》ギラン・バレー症候群（感染後・腱反射の低下〜消失・進行・増悪している・抗GQ1b抗体陽性・抗GM1抗体陽性）　|　重症筋無力症（抗AChR抗体陽性・musk_pos・日内変動する（夕方に悪化））　|　周期性四肢麻痺・電解質異常（hypok_severe・低カリウム血症・重度の高カリウム血症・TRAb 陽性）　|　横紋筋融解・ミオパチー（CK 著明上昇・横紋筋融解を疑う CK 値・スタチンの使用）",
     "note": "",
     "refs": [
      "STROKE_JP",
      "NIHSS",
      "ABCD2",
      "GBS_CRIT",
      "NG128"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.convulsion.kill0",
     "label": "てんかん重積状態",
     "group": "主訴：痙攣",
     "detail": "【この主訴で外す理由】発作が続くほど神経細胞が傷み、薬が効きにくくなる。5分を境に治療のアルゴリズムが始まる。\n【示唆する所見】進行・増悪している・意識障害あり・乳酸上昇・CK 著明上昇・代謝性アシドーシス・てんかんの既往\n【外すためにすること】全身性痙攣が5分以上持続、または意識回復なく反復する場合は痙攣性重積として直ちに治療／痙攣性重積では気道・換気・循環を支えながらベンゾジアゼピン、持続すれば第二選択薬（検査結果を待たない）／血糖・Na・Ca・Mg・血液ガスを同時に／発作が止まっても覚醒しなければ脳波（非痙攣性重積）",
     "note": "",
     "refs": [
      "SE_ILAE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.convulsion.kill1",
     "label": "代謝性の原因（低血糖・低Na・低Ca）",
     "group": "主訴：痙攣",
     "detail": "【この主訴で外す理由】薬では止まらない痙攣。原因を補正しなければ再発し続ける。\n【示唆する所見】低血糖・hypoglycemia_severe・重度の低ナトリウム血症・hypona_mod・hypoca_severe・hypomg\n【外すためにすること】血糖・Na・Ca・Mg・P を最初のセットに入れる／低Naによる痙攣・昏睡では監視下で高張食塩水を緊急使用。初期の症状改善目標と24時間の補正上限を区別し、Naを頻回測定。慢性低Na・ODS高リスク例では上限を厳格に設定／原因薬（サイアザイド・SSRI）の確認",
     "note": "",
     "refs": [
      "HYPONA_EMERG"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.convulsion.kill2",
     "label": "中枢神経感染・脳炎",
     "group": "主訴：痙攣",
     "detail": "【この主訴で外す理由】ヘルペス脳炎は治療可能だが遅れると後遺症が残る。発熱＋痙攣＋意識障害で想定する。\n【示唆する所見】発熱（体温 38℃以上）・項部硬直・意識障害あり・CRP 上昇・局所神経症候あり\n【外すためにすること】腰椎穿刺前の頭部CTは一律には行わない。安全に実施でき、抗菌薬開始を有意に遅らせない場合は、採血・血液培養と腰椎穿刺を抗菌薬前に行う／占拠性病変のリスク、新規局在神経徴候（痙攣・異常肢位を含む）、瞳孔反応異常、GCS 9以下、進行性・持続性または急速な意識低下があれば画像を先行し、危険因子が解消するまで腰椎穿刺を行わない／気道未確保・呼吸障害・ショック・制御されていない痙攣・出血リスクは腰椎穿刺前に治療・安定化する。広範または急速に拡大する紫斑、穿刺部感染でも実施しない。CT正常だけで安全とは判断しない／細菌性髄膜炎を疑えば静注抗菌薬を速やかに開始（来院1時間以内を目安）。画像・腰椎穿刺が必要でも投与を遅らせず、採血・血液培養、抗菌薬、全身安定化を画像より先に行う。先に抗菌薬を開始した場合は、安全になり次第速やかに腰椎穿刺／細菌性髄膜炎を強く疑う成人ではデキサメタゾンを初回抗菌薬と同時または直前に検討するが、その準備で抗菌薬を遅らせない／脳炎を疑えばアシクロビルを検査結果待ちで遅らせず開始し、腎機能に応じ調整する／安全に腰椎穿刺できる時点でHSV-PCR、必要に応じMRI",
     "note": "",
     "refs": [
      "MENINGITIS",
      "NG240",
      "ENCEPH_IDSA"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.convulsion.kill3",
     "label": "脳構造病変（出血・腫瘍・外傷）",
     "group": "主訴：痙攣",
     "detail": "【この主訴で外す理由】初発の痙攣は構造病変を探す機会。特に高齢者と局所徴候のある例。\n【示唆する所見】局所神経症候あり・外傷後・悪性腫瘍の既往・75歳以上・抗凝固薬の使用・瞳孔不同\n【外すためにすること】頭部CT／MRI／抗凝固薬と凝固系の確認／脳波",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.convulsion.flags",
     "label": "【痙攣】red flag と次の一手",
     "group": "主訴：痙攣",
     "detail": "【red flag】昏睡（GCS 8 以下 または JCS III）・GCS 8 点以下・局所神経症候あり・発熱（体温 38℃以上）・項部硬直・低血糖・重度の低ナトリウム血症・hypoca_severe・重度のアシデミア・CK 著明上昇・横紋筋融解を疑う CK 値・抗凝固薬の使用・SpO₂ 90% 未満\n【次に聞くこと】発作の様子を目撃者から（左右差・眼球偏倚・持続時間・舌咬傷・失禁）／発作後の意識の戻り方（戻らなければ重積・非痙攣性重積）／初発か反復か、服薬の中断／アルコールと最終飲酒、睡眠不足、新規薬剤／妊娠（妊娠後期なら子癇）\n【次に診ること】発作後の神経所見（Todd 麻痺の有無と改善）／舌・口腔の咬傷、外傷、肩関節の脱臼／項部硬直と発熱／血糖・Na・Ca・血液ガス・CK の実測",
     "note": "痙攣は「止める」と「原因を探す」を同時に進める。5分続けば重積として扱い、同時に血糖・Na・Ca・酸素・感染・中毒・構造を潰す。",
     "refs": [
      "SE_ILAE",
      "GCS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.convulsion.map",
     "label": "【痙攣】鑑別の地図",
     "group": "主訴：痙攣",
     "detail": "《全身・代謝・中毒》低血糖（低血糖・hypoglycemia_severe）　|　低ナトリウム血症（重度の低ナトリウム血症・hypona_mod・サイアザイドの使用）　|　低カルシウム・低マグネシウム（hypoca_severe・hypoca・hypomg）　|　尿毒症・肝性脳症（重度の腎機能低下・アンモニア上昇・慢性腎臓病・透析・肝硬変の既往）　|　薬剤・離脱（アルコール・ベンゾジアゼピン）（薬剤開始後・安静時振戦・代謝性アルカローシス）　|　抗てんかん薬の血中濃度低下（抗てんかん薬の使用・反復・間欠的）\n《中枢神経》てんかん（既知）（てんかんの既往・反復・間欠的）　|　脳卒中（出血・梗塞）（突然発症（秒〜分で完成）・局所神経症候あり・抗凝固薬の使用）　|　脳炎・髄膜炎（発熱（体温 38℃以上）・項部硬直・CRP 上昇）　|　脳腫瘍・転移（悪性腫瘍の既往・進行・増悪している・局所神経症候あり）　|　可逆性後頭葉白質症（PRES）（著明な高血圧・半盲・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後））\n《痙攣に見えるもの》失神（痙攣性失神）（体位変換で出現・心拍数 50/分 以下・反復・間欠的）　|　心原性（不整脈）（心房細動の既往・心拍数 50/分 以下・重度の高カリウム血症・hypok_severe）　|　心理的非てんかん性発作（反復・間欠的）",
     "note": "",
     "refs": [
      "SE_ILAE",
      "GCS"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.bleeding.kill0",
     "label": "循環血液量の喪失（出血性ショック）",
     "group": "主訴：出血",
     "detail": "【この主訴で外す理由】血圧が下がるのは遅い指標。頻脈・冷汗・乳酸上昇のほうが先に出る。止血と輸血を同時に進める。\n【示唆する所見】心拍数 100/分 以上・収縮期血圧 100mmHg 以下・冷汗・湿潤・CRT 3秒以上・乳酸上昇・重度の貧血・BUN/Cr 比の上昇\n【外すためにすること】輸液と輸血の準備、血液型・交差試験／乳酸と塩基過剰／出血源の同定（内視鏡・CT・血管造影）／抗凝固薬服用中の生命を脅かす出血では、薬剤・最終投与時刻に応じ中和を検討（蘇生・止血を遅らせない）",
     "note": "",
     "refs": [
      "ACC_BLEED"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.bleeding.kill1",
     "label": "上部消化管出血",
     "group": "主訴：出血",
     "detail": "【この主訴で外す理由】食道・胃・十二指腸からの出血は大量になりうる。黒色便とBUN/Cr比の上昇が手がかり。\n【示唆する所見】黒色・タール状便・貧血・BUN/Cr 比の上昇・NSAIDs の使用・肝硬変の既往・抗凝固薬の使用・心窩部圧痛\n【外すためにすること】Glasgow-Blatchford スコアで介入の必要性を判定／蘇生後に上部内視鏡。重症・不安定例は蘇生直後、その他は原則24時間以内を目安に専門科と調整／非静脈瘤性出血のPPIは内視鏡所見・施設手順に応じる。静脈瘤出血を疑う場合は血管作動薬と予防的抗菌薬を早期検討／Rockall スコアで予後",
     "note": "",
     "refs": [
      "GBS",
      "ROCKALL",
      "CG141"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.bleeding.kill2",
     "label": "DIC",
     "group": "主訴：出血",
     "detail": "【この主訴で外す理由】凝固と線溶が同時に暴走し、微小血栓と出血が共存する。基礎疾患（感染・悪性腫瘍・産科）の治療なしに止まらない。\n【示唆する所見】急性期DIC基準 4点以上・血小板減少・重度の血小板減少・FDP 著明上昇・D-ダイマー著明上昇・フィブリノゲン低下・PT 延長・アンチトロンビン低下\n【外すためにすること】急性期DIC診断基準（日本救急医学会）と ISTH overt DIC スコアの両方で確認／基礎疾患の同定と治療／血小板・フィブリノゲンの補充の閾値を決める",
     "note": "",
     "refs": [
      "JAAM_DIC",
      "ISTH_DIC"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.bleeding.kill3",
     "label": "抗凝固薬・抗血小板薬による出血",
     "group": "主訴：出血",
     "detail": "【この主訴で外す理由】薬が効きすぎている状態。中和薬と半減期を知っているかどうかで初動が変わる。\n【示唆する所見】抗凝固薬の使用・抗血小板薬の使用・INR 上昇・inr_veryhigh・APTT 延長・PT 延長・慢性腎臓病・透析\n【外すためにすること】PT-INR・APTT と最終服薬時刻／生命を脅かす出血・初期対応で止まらない大出血では薬剤別の中和を検討。軽微な出血に中和薬を一律使用しない。最終服薬・腎機能・国内適応を確認／腎機能（DOAC の排泄）／HAS-BLED で出血リスクを記録",
     "note": "",
     "refs": [
      "HASBLED",
      "ACC_BLEED"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.bleeding.kill4",
     "label": "血小板減少の緊急（TTP・HIT）",
     "group": "主訴：出血",
     "detail": "【この主訴で外す理由】どちらも「血小板が少ないのに血栓ができる」病態。輸血や安易なヘパリン継続が病態を悪化させる。\n【示唆する所見】重度の血小板減少・血小板減少・貧血・LD 上昇・腎機能低下・ヘパリンの使用・局所神経症候あり\n【外すためにすること】破砕赤血球の確認と ADAMTS13 活性（TTP）／4Tsで事前確率を評価。中〜高確率のHIT疑いではヘパリンを中止し出血リスクに応じ非ヘパリン抗凝固を検討。低確率に一律の検査・経験的治療を行わない／TTPの臨床的疑いが強ければ血漿交換前にADAMTS13用採血を行い、結果を待たず血液内科と緊急治療",
     "note": "",
     "refs": [
      "FOURTS",
      "ASH_HIT",
      "ISTH_TTP"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.bleeding.flags",
     "label": "【出血】red flag と次の一手",
     "group": "主訴：出血",
     "detail": "【red flag】心拍数 100/分 以上・収縮期血圧 100mmHg 以下・冷汗・湿潤・重度の貧血・重度の血小板減少・急性期DIC基準 4点以上・inr_veryhigh・フィブリノゲン低下・黒色・タール状便・血便（鮮血）・意識障害あり・抗凝固薬の使用・乳酸上昇\n【次に聞くこと】どこから、いつから、どのくらいの量（具体的な器や回数で）／抗凝固薬・抗血小板薬の種類と最終服薬時刻／歯科治療や手術での止血経験、家族歴（先天性）／肝疾患・腎疾患・悪性腫瘍・直近の感染／ヘパリン曝露（5〜10日前からの血小板の推移）\n【次に診ること】皮膚と粘膜を全部見る（点状出血・紫斑の性状・口腔・眼瞼）／紫斑が触知できるかどうか（血管炎か血小板か）／直腸診と便の性状／脈拍・起立時の血圧変化・CRT",
     "note": "出血は「どこから」「なぜ止まらないか」の二問。粘膜のじわじわ出血は血小板・血管、深部や関節の出血は凝固因子。そして全身に出ているならDICを疑う。",
     "refs": [
      "GBS",
      "ROCKALL",
      "JAAM_DIC",
      "ISTH_DIC",
      "FOURTS",
      "HASBLED"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.bleeding.map",
     "label": "【出血】鑑別の地図",
     "group": "主訴：出血",
     "detail": "《出血の場所》上部消化管（黒色・タール状便・BUN/Cr 比の上昇・心窩部圧痛・NSAIDs の使用・肝硬変の既往）　|　下部消化管（血便（鮮血）・75歳以上・左下腹部圧痛）　|　頭蓋内（意識障害あり・局所神経症候あり・突然発症（秒〜分で完成）・抗凝固薬の使用）　|　粘膜・皮膚（点状出血・歯肉・鼻）（点状出血・紫斑・平坦な（非触知）紫斑・血小板減少）　|　深部・関節・筋肉内（APTT 延長・PT 延長・外傷後）\n《止まらない理由》血小板の数が足りない（血小板減少・重度の血小板減少・汎血球減少）　|　凝固因子が足りない・働けない（PT 延長・APTT 延長・both_prolonged・INR 上昇・肝硬変の既往・抗凝固薬の使用）　|　消費されている（DIC）（急性期DIC基準 4点以上・FDP 著明上昇・フィブリノゲン低下・血小板減少・アンチトロンビン低下）　|　血管側の問題（血管炎・アミロイド・Vit C）（触知可能な紫斑・MPO-ANCA 陽性・PR3-ANCA 陽性）　|　線溶が亢進している（FDP 著明上昇・D-ダイマー著明上昇・フィブリノゲン低下・悪性腫瘍の既往）",
     "note": "",
     "refs": [
      "GBS",
      "ROCKALL",
      "JAAM_DIC",
      "ISTH_DIC",
      "FOURTS",
      "HASBLED"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.edema.kill0",
     "label": "深部静脈血栓症と肺塞栓",
     "group": "主訴：浮腫",
     "detail": "【この主訴で外す理由】片側の下腿腫脹は肺塞栓の予備軍。歩いた瞬間に肺へ飛ぶ。\n【示唆する所見】片側下腿浮腫・D-ダイマー上昇・D-ダイマー著明上昇・悪性腫瘍の既往・呼吸数 22/分 以上・SpO₂ 92% 以下・呼吸困難・胸痛を伴う\n【外すためにすること】安定例はWells（DVT）で事前確率を評価し、likelyなら下肢静脈エコー、unlikelyならD-ダイマーから判断／呼吸器症状があればPEを評価。安定例はWells（PE）で画像・D-ダイマーを選び、ショックでは救急対応を優先／抗凝固の開始判断",
     "note": "",
     "refs": [
      "WELLS_DVT",
      "WELLS_PE",
      "NG158"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.edema.kill1",
     "label": "急性心不全",
     "group": "主訴：浮腫",
     "detail": "【この主訴で外す理由】両側の圧痕性浮腫＋頸静脈怒張＋体重増加。肺うっ血に至る前に捕まえたい。\n【示唆する所見】両側下腿浮腫・頸静脈怒張・起坐呼吸・体重増加（1週で2kg以上）・BNP／NT-proBNP 上昇・両側下肺の捻髪音・心不全の既往\n【外すためにすること】BNP／NT-proBNP／胸部X線・心エコー／体重と尿量の記録／内服（利尿薬の自己中断・NSAIDs）の確認",
     "note": "",
     "refs": [
      "HF_JCS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.edema.kill2",
     "label": "蜂窩巣炎・壊死性筋膜炎",
     "group": "主訴：浮腫",
     "detail": "【この主訴で外す理由】片側の熱感を伴う腫脹。所見に不釣り合いな激痛と全身状態の悪化は、筋膜炎の警告。\n【示唆する所見】片側下腿浮腫・発熱（体温 38℃以上）・びまん性紅斑・CRP 著明上昇・糖尿病の既往・収縮期血圧 100mmHg 以下・CK 著明上昇\n【外すためにすること】皮膚所見の境界をマークして経時変化を見る／CRP・CK・血液培養／画像は補助であり、強く疑えば画像待ちで外科的探索・治療を遅らせない／外科へ即連絡し、広域抗菌薬と全身管理を並行",
     "note": "",
     "refs": [
      "IDSA_SSTI"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.edema.flags",
     "label": "【浮腫】red flag と次の一手",
     "group": "主訴：浮腫",
     "detail": "【red flag】片側下腿浮腫・SpO₂ 92% 以下・呼吸数 22/分 以上・起坐呼吸・発熱（体温 38℃以上）・CRP 著明上昇・D-ダイマー著明上昇・alb_verylow・重度の腎機能低下・体重増加（1週で2kg以上）・収縮期血圧 100mmHg 以下\n【次に聞くこと】片側か両側か、いつからか、朝と夕方でどう違うか／体重の推移（1週間で何kg）と尿量／呼吸困難・起坐呼吸・夜間の呼吸苦／新規薬剤（Ca拮抗薬・NSAIDs・ステロイド・ホルモン）／長時間の不動・手術・悪性腫瘍（DVT のリスク）\n【次に診ること】左右差を周囲長で測る（片側＝局所を探す）／圧痕の残り方（残る＝水分、残らない＝リンパ・粘液）／頸静脈・III音・両側下肺の捻髪音／腹水と肝脾、皮膚の熱感・境界",
     "note": "浮腫は片側か両側かで世界が分かれる。片側は局所の閉塞（DVT・リンパ・感染）、両側は全身の問題（心・腎・肝・栄養・薬剤）。",
     "refs": [
      "WELLS_DVT",
      "HF_JCS",
      "KDIGO_CKD",
      "CHILDPUGH"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.edema.map",
     "label": "【浮腫】鑑別の地図",
     "group": "主訴：浮腫",
     "detail": "《片側（局所の閉塞）》深部静脈血栓症（片側下腿浮腫・D-ダイマー上昇・悪性腫瘍の既往）　|　蜂窩巣炎（片側下腿浮腫・発熱（体温 38℃以上）・CRP 上昇・糖尿病の既往）　|　リンパ浮腫（片側下腿浮腫・慢性（数か月以上）・悪性腫瘍の既往）　|　静脈弁不全・外傷（片側下腿浮腫・外傷後・慢性（数か月以上））\n《両側（全身の問題）》心不全（両側下腿浮腫・頸静脈怒張・起坐呼吸・BNP／NT-proBNP 上昇・III音（ギャロップ））　|　腎機能低下・ネフローゼ（両側下腿浮腫・腎機能低下・重度の腎機能低下・アルブミン低下・alb_verylow・クレアチニン上昇）　|　肝硬変（腹水（波動）・アルブミン低下・コリンエステラーゼ低下・クモ状血管腫・手掌紅斑・腹壁静脈拡張・肝硬変の既往）　|　低栄養・吸収障害（alb_verylow・体重減少（6か月で5%以上）・貧血）　|　薬剤性（Ca拮抗薬・NSAIDs・ステロイド・ピオグリタゾン）（薬剤開始後・NSAIDs の使用・ステロイド）　|　甲状腺機能低下（粘液浮腫）（両側下腿浮腫・甲状腺びまん性腫大・低ナトリウム血症・ck_high）",
     "note": "",
     "refs": [
      "WELLS_DVT",
      "HF_JCS",
      "KDIGO_CKD",
      "CHILDPUGH"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.oliguria.kill0",
     "label": "腎後性閉塞（尿閉・両側水腎症）",
     "group": "主訴：乏尿",
     "detail": "【この主訴で外す理由】尿閉は導尿で改善しうるが、上部尿路閉塞は尿管ステント・腎瘻等が必要な場合がある。感染・無尿を伴う閉塞は緊急泌尿器科評価。\n【示唆する所見】腹部膨満・臍周囲圧痛・腎機能低下・クレアチニン上昇・高カリウム血症・骨盤内腫瘍の既往\n【外すためにすること】膀胱エコーで残尿を確認し、必要なら導尿／腎エコーで水腎症／解除後の多尿（post-obstructive diuresis）に備える",
     "note": "",
     "refs": [
      "KDIGO_AKI"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.oliguria.kill1",
     "label": "腎前性（循環血液量・心拍出量の不足）",
     "group": "主訴：乏尿",
     "detail": "【この主訴で外す理由】腎は灌流圧の変化を最初に受ける臓器。低血圧・脱水・出血・心不全のサインとして乏尿が出る。\n【示唆する所見】体液量不足（脱水）・収縮期血圧 100mmHg 以下・心拍数 100/分 以上・BUN/Cr 比の上昇・uosm_high・una_low・乳酸上昇・CRT 3秒以上\n【外すためにすること】循環血液量減少が疑われる場合に輸液を検討し、尿量・血圧・乳酸・肺うっ血を再評価。心不全・体液過剰では一律に輸液負荷しない／BUN/Cr 比・尿中Na・尿浸透圧／NSAIDs等とACE阻害薬／ARBの一時休薬は脱水・低血圧・高K等を踏まえ判断。必要な緊急造影検査を腎障害だけで一律に延期しない／KDIGO の AKI 病期分類で記録",
     "note": "",
     "refs": [
      "KDIGO_AKI",
      "NG148"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.oliguria.kill2",
     "label": "高カリウム血症による心停止",
     "group": "主訴：乏尿",
     "detail": "【この主訴で外す理由】乏尿が続けばカリウムは必ず上がる。心電図変化が出てからでは時間がない。\n【示唆する所見】高カリウム血症・重度の高カリウム血症・重度の腎機能低下・代謝性アシドーシス・心拍数 50/分 以下・横紋筋融解を疑う CK 値\n【外すためにすること】心電図（テント状T波・QRS 幅）／高Kに伴う心電図変化では静注カルシウムを検討。重度高Kでは心電図が正常でもインスリン・グルコース等の緊急治療を検討し、血糖・Kを反復監視。β刺激薬だけに依存しない／透析の適応判断（K・アシドーシス・体液過剰・尿毒症）",
     "note": "",
     "refs": [
      "RCUK_K"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.oliguria.kill3",
     "label": "急性腎障害の原因としての横紋筋融解・腫瘍崩壊",
     "group": "主訴：乏尿",
     "detail": "【この主訴で外す理由】筋や腫瘍の崩壊産物が尿細管を詰める。原因を知っていれば輸液で防げる。\n【示唆する所見】CK 著明上昇・横紋筋融解を疑う CK 値・高カリウム血症・hyperp・hypoca・尿酸上昇・LD 上昇・悪性腫瘍の既往\n【外すためにすること】CK・K・P・Ca・尿酸・LD／循環・尿量・心腎機能に応じて輸液量を調整。無尿・肺うっ血では大量輸液を継続せず腎臓専門医へ相談／腫瘍崩壊なら尿酸降下薬と透析の準備",
     "note": "",
     "refs": [
      "KDIGO_AKI"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.oliguria.flags",
     "label": "【乏尿】red flag と次の一手",
     "group": "主訴：乏尿",
     "detail": "【red flag】重度の高カリウム血症・高カリウム血症・重度の腎機能低下・renal_endstage・収縮期血圧 100mmHg 以下・代謝性アシドーシス・重度のアシデミア・体液量過剰・腹部膨満・横紋筋融解を疑う CK 値・乳酸上昇・意識障害あり\n【次に聞くこと】正確な尿量（時間尿で、推定ではなく実測）／体重の推移と最近の輸液・輸血の量／新規薬剤（NSAIDs・ACE阻害薬／ARB・抗菌薬・造影剤）／排尿の様子（出にくい・途切れる・残る）／下痢・嘔吐・出血・発熱（腎前性の原因）\n【次に診ること】膀胱エコーで残尿を測る（最初の一手）／体液量の評価（頸静脈・皮膚ツルゴール・浮腫・起立性変化）／心電図（高カリウムの変化）／腎エコー（水腎症・腎サイズ）",
     "note": "乏尿は腎前性・腎性・腎後性の三つに分ける。最初に膀胱と血圧を確認する — 閉塞と循環は、どちらもその場で治せる。",
     "refs": [
      "KDIGO_AKI",
      "KDIGO_CKD"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.oliguria.map",
     "label": "【乏尿】鑑別の地図",
     "group": "主訴：乏尿",
     "detail": "《腎前性》脱水・出血（体液量不足（脱水）・BUN/Cr 比の上昇・una_low・uosm_high・心拍数 100/分 以上）　|　心不全・心拍出量低下（頸静脈怒張・BNP／NT-proBNP 上昇・両側下腿浮腫・心不全の既往）　|　肝腎症候群（肝硬変の既往・腹水（波動）・una_low・アルブミン低下・クレアチニン上昇）　|　薬剤（NSAIDs・ACE阻害薬／ARB）（NSAIDs の使用・ACE阻害薬／ARB）\n《腎性》急性尿細管障害（虚血・腎毒性）（クレアチニン上昇・腎機能低下・una_high・uosm_low・乳酸上昇）　|　横紋筋融解症（CK 著明上昇・横紋筋融解を疑う CK 値・高カリウム血症・hyperp）　|　急性間質性腎炎（薬剤開始後・好酸球増加・びまん性紅斑・クレアチニン上昇）　|　急速進行性糸球体腎炎・血管炎（MPO-ANCA 陽性・PR3-ANCA 陽性・gbm_pos・クレアチニン上昇・血痰・喀血・CRP 上昇）　|　造影剤・腫瘍崩壊（尿酸上昇・hyperp・LD 上昇・悪性腫瘍の既往）\n《腎後性》前立腺肥大・尿閉（腹部膨満・男性・75歳以上）　|　両側尿管閉塞（腫瘍・結石・後腹膜）（悪性腫瘍の既往・背部へ貫通する痛み・腎機能低下）　|　膀胱カテーテルの閉塞（腹部膨満）",
     "note": "",
     "refs": [
      "KDIGO_AKI",
      "KDIGO_CKD"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.diarrhea.kill0",
     "label": "重度脱水・循環血液量減少性ショック",
     "group": "主訴：下痢",
     "detail": "【この主訴で外す理由】水と電解質が腸から失われ続ける。高齢者と小児では短時間で循環が破れる。\n【示唆する所見】体液量不足（脱水）・心拍数 100/分 以上・収縮期血圧 100mmHg 以下・BUN/Cr 比の上昇・高ナトリウム血症・低カリウム血症・代謝性アシドーシス・乳酸上昇・75歳以上\n【外すためにすること】体重・尿量・起立性変化の実測／Na・K・Cl・HCO₃⁻・血液ガス／ショック・重度脱水では等張液による静脈内蘇生を優先。軽〜中等度で意識・嚥下が保たれ、イレウスがなければ経口補水",
     "note": "",
     "refs": [
      "IDSA_DIAR"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.diarrhea.kill1",
     "label": "Clostridioides difficile 感染・偽膜性腸炎",
     "group": "主訴：下痢",
     "detail": "【この主訴で外す理由】抗菌薬使用後の腸内細菌の崩れ。劇症型では麻痺性イレウスとショックに至る。\n【示唆する所見】抗菌薬の使用・著明な白血球増加・アルブミン低下・発熱（体温 38℃以上）・腹部膨満・びまん性圧痛・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）\n【外すためにすること】CD トキシン／GDH と核酸検査／白血球数（著明な上昇は重症の指標）／腹部CT（結腸壁の肥厚・中毒性拡張）／原因抗菌薬の中止と標的治療",
     "note": "",
     "refs": [
      "IDSA_DIAR"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.diarrhea.kill2",
     "label": "腸管出血性大腸菌・溶血性尿毒症症候群",
     "group": "主訴：下痢",
     "detail": "【この主訴で外す理由】血便のあとに血小板減少と腎障害が続く。抗菌薬や止痢薬がかえって悪化させる。\n【示唆する所見】血便（鮮血）・血小板減少・貧血・LD 上昇・クレアチニン上昇・腎機能低下\n【外すためにすること】便培養とベロ毒素／血小板・LD・破砕赤血球・腎機能を連日追う／止痢薬は使わない／血液浄化の準備",
     "note": "",
     "refs": [
      "IDSA_DIAR"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.diarrhea.kill3",
     "label": "炎症性腸疾患の重症増悪・中毒性巨大結腸",
     "group": "主訴：下痢",
     "detail": "【この主訴で外す理由】結腸が拡張し、穿孔すれば一気に腹膜炎になる。頻回の血便と全身症状で見分ける。\n【示唆する所見】血便（鮮血）・発熱（体温 38℃以上）・貧血・CRP 上昇・アルブミン低下・腹部膨満・びまん性圧痛\n【外すためにすること】腹部X線／CT（結腸径）／CRP・アルブミン・ヘモグロビン／内視鏡（重症例は慎重に）／外科と並行して管理",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.diarrhea.flags",
     "label": "【下痢】red flag と次の一手",
     "group": "主訴：下痢",
     "detail": "【red flag】血便（鮮血）・発熱（体温 38℃以上）・体温 39℃ 以上・体液量不足（脱水）・収縮期血圧 100mmHg 以下・hypok_severe・低カリウム血症・代謝性アシドーシス・腎機能低下・血小板減少・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）・腹膜刺激徴候・著明な白血球増加・75歳以上\n【次に聞くこと】回数・量・性状（水様／血性／粘液／脂肪）と、夜間に起きるか／発症の速さと、同じものを食べた人の症状／直近3か月の抗菌薬（C. difficile）／渡航・生食・動物接触／体重減少・関節痛・口腔内病変（IBD の全身症状）\n【次に診ること】体液量の評価（起立性変化・皮膚ツルゴール・腋窩の乾燥）／腹部の圧痛と腹膜刺激徴候、腹部膨満／直腸診（便の性状・腫瘤・便塞栓）／体温と皮膚、関節・眼（IBD の腸管外症状）",
     "note": "下痢は「炎症性か分泌性か」「脱水と電解質がどこまで来ているか」。血便・発熱・高度脱水・免疫抑制のどれかがあれば、ただの胃腸炎として帰してはいけない。",
     "refs": [
      "IDSA_DIAR"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.diarrhea.map",
     "label": "【下痢】鑑別の地図",
     "group": "主訴：下痢",
     "detail": "《感染性》ウイルス性腸炎（水様便・急性発症（数時間）・嘔吐が先行）　|　細菌性腸炎（侵襲性）（血便（鮮血）・発熱（体温 38℃以上）・CRP 上昇・白血球増加・びまん性圧痛）　|　C. difficile 感染（抗菌薬の使用・著明な白血球増加・アルブミン低下）　|　食中毒（毒素型）（急性発症（数時間）・食後に出現・水様便）\n《非感染性》炎症性腸疾患（血便（鮮血）・亜急性（数日〜数週）・CRP 上昇・貧血・アルブミン低下・体重減少（6か月で5%以上））　|　虚血性大腸炎（左下腹部圧痛・血便（鮮血）・突然発症（秒〜分で完成）・75歳以上）　|　薬剤性（抗菌薬・PPI・メトホルミン・マグネシウム）（薬剤開始後・メトホルミン・PPI）　|　吸収不良・膵外分泌不全（慢性（数か月以上）・体重減少（6か月で5%以上）・灰白色便・アルブミン低下）　|　甲状腺機能亢進症（甲状腺びまん性腫大・TRAb 陽性・細かく速い動作時振戦・体重減少（6か月で5%以上）・心拍数 100/分 以上）　|　overflow（便秘による見かけの下痢）（75歳以上・腹部膨満）",
     "note": "",
     "refs": [
      "IDSA_DIAR"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.vomiting.kill0",
     "label": "腸閉塞・絞扼",
     "group": "主訴：嘔吐",
     "detail": "【この主訴で外す理由】閉塞が続けば腸が虚血に陥る。金属音と腹部膨満、手術歴が手がかり。\n【示唆する所見】金属音（腸閉塞を示唆）・腹部膨満・びまん性圧痛・腸蠕動音の減弱〜消失・乳酸上昇・腹膜刺激徴候・代謝性アルカローシス・低カリウム血症\n【外すためにすること】腹部X線／CT（閉塞点と絞扼徴候）／電解質（低K・低Cl性アルカローシス）／胃管と輸液／外科コンサルト",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.vomiting.kill1",
     "label": "頭蓋内圧亢進",
     "group": "主訴：嘔吐",
     "detail": "【この主訴で外す理由】嘔吐が噴出性で、頭痛・意識障害・局所徴候を伴う。消化器を探している間に脳が押される。\n【示唆する所見】意識障害あり・局所神経症候あり・瞳孔不同・項部硬直・頭痛を伴う・心拍数 50/分 以下\n【外すためにすること】頭部CT／MRI／眼底（うっ血乳頭）／血圧上昇＋徐脈（Cushing 現象）の確認",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.vomiting.kill2",
     "label": "糖尿病性ケトアシドーシス",
     "group": "主訴：嘔吐",
     "detail": "【この主訴で外す理由】嘔吐と腹痛で来る代謝性救急。胃腸炎として帰すと数時間で崩れる。\n【示唆する所見】著明な高血糖・極端な高血糖・アニオンギャップ開大・代謝性アシドーシス・Kussmaul 呼吸・糖尿病の既往・体液量不足（脱水）・高カリウム血症\n【外すためにすること】血糖・血液ガス・ケトン体／AG とアルブミン補正 AG／循環状態に応じ輸液し、インスリン前にKを確認。K 3.5mEq/L未満なら補充を優先し、3.5を超えるまでインスリンを延期。腎機能・血糖・Kを反復監視",
     "note": "",
     "refs": [
      "FIGGE",
      "DKA2024"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.vomiting.kill3",
     "label": "副腎不全・高カルシウム血症",
     "group": "主訴：嘔吐",
     "detail": "【この主訴で外す理由】嘔吐・脱力・低血圧の組み合わせ。ステロイド中断歴や悪性腫瘍が背景にある。\n【示唆する所見】低ナトリウム血症・高カリウム血症・色素沈着・収縮期血圧 100mmHg 以下・高カルシウム血症・hyperca_severe・ステロイドの使用・中断・悪性腫瘍の既往\n【外すためにすること】Na・K・血糖・Ca（補正Ca）・コルチゾール・ACTH／副腎クリーゼ（ショック・急性重症化）を疑えば採血・結果待ちで遅らせずヒドロコルチゾンと補液。安定した副腎不全疑いはコルチゾール・ACTH等で評価／高Caの程度・症状・原因に応じ治療。脱水には心腎機能をみながら補液し、必要時に腎機能等を考慮してビスホスホネート等を検討",
     "note": "",
     "refs": [
      "PAYNE",
      "ADRENAL_CRISIS",
      "HYPERCA_EMERG"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.vomiting.kill4",
     "label": "食道破裂（Boerhaave）",
     "group": "主訴：嘔吐",
     "detail": "【この主訴で外す理由】激しい嘔吐の直後の胸痛。縦隔炎に進むと致死率が高い。\n【示唆する所見】胸痛を伴う・突然発症（秒〜分で完成）・心窩部圧痛・呼吸数 22/分 以上・CRP 上昇\n【外すためにすること】造影CT（縦隔気腫・胸水）／食道造影／外科・消化器内科へ即連絡",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.vomiting.flags",
     "label": "【嘔吐】red flag と次の一手",
     "group": "主訴：嘔吐",
     "detail": "【red flag】金属音（腸閉塞を示唆）・腹膜刺激徴候・意識障害あり・局所神経症候あり・著明な高血糖・アニオンギャップ開大・重度の低ナトリウム血症・hyperca_severe・高カリウム血症・収縮期血圧 100mmHg 以下・黒色・タール状便・腹部膨満・心拍数 50/分 以下\n【次に聞くこと】嘔吐の時期（食後すぐ／早朝／噴出性）と内容（胆汁・血液・便臭）／腹痛・排ガス・最終排便（閉塞の有無）／頭痛・めまい・視覚症状・歩行の変化／薬剤（オピオイド・ジゴキシン・抗がん剤）とステロイドの中断／妊娠の可能性、糖尿病、腎機能\n【次に診ること】体液量と起立性変化、体重／腹部（膨満・蠕動音・腹膜刺激徴候・手術痕）／神経所見（瞳孔・小脳症状・歩行・眼振）／血糖・電解質・血液ガスの実測",
     "note": "嘔吐は消化器だけの症状ではない。中枢（圧・前庭）、代謝（DKA・副腎・高Ca）、薬剤、そして閉塞 — この四つを外から潰す。",
     "refs": [
      "FIGGE",
      "PAYNE",
      "GOLDMARK"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.vomiting.map",
     "label": "【嘔吐】鑑別の地図",
     "group": "主訴：嘔吐",
     "detail": "《消化管》腸閉塞（金属音（腸閉塞を示唆）・腹部膨満・低カリウム血症・代謝性アルカローシス）　|　胃炎・胃潰瘍・幽門狭窄（心窩部圧痛・NSAIDs の使用・黒色・タール状便・代謝性アルカローシス）　|　胆道・膵疾患（右上腹部圧痛・Murphy 徴候陽性・アミラーゼ著明上昇・リパーゼ著明上昇・胆道系酵素優位の上昇）　|　急性胃腸炎（水様便・急性発症（数時間）・発熱（体温 38℃以上））\n《中枢・前庭》頭蓋内圧亢進（出血・腫瘍・水頭症）（意識障害あり・局所神経症候あり・瞳孔不同）　|　小脳梗塞・出血（小脳性の協調運動障害・突然発症（秒〜分で完成）・頭痛）　|　前庭障害（BPPV・前庭神経炎）（体位変換で出現・反復・間欠的）　|　片頭痛（反復・間欠的・頭痛）\n《代謝・薬剤・その他》糖尿病性ケトアシドーシス（著明な高血糖・アニオンギャップ開大・代謝性アシドーシス・Kussmaul 呼吸）　|　尿毒症（重度の腎機能低下・renal_endstage・慢性腎臓病・透析・代謝性アシドーシス）　|　副腎不全（低ナトリウム血症・高カリウム血症・色素沈着・収縮期血圧 100mmHg 以下）　|　高カルシウム血症（高カルシウム血症・hyperca_severe・悪性腫瘍の既往）　|　薬剤（オピオイド・ジゴキシン・抗がん剤・抗菌薬）（薬剤開始後・化学療法中）　|　妊娠（妊娠の可能性を未確認）",
     "note": "",
     "refs": [
      "FIGGE",
      "PAYNE",
      "GOLDMARK"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fatigue.kill0",
     "label": "急性冠症候群・心不全の非典型的表現",
     "group": "主訴：倦怠感",
     "detail": "【この主訴で外す理由】高齢者・糖尿病・女性では胸痛がない。倦怠感と食欲低下だけで梗塞が進んでいることがある。\n【示唆する所見】75歳以上・糖尿病の既往・トロポニン上昇・BNP／NT-proBNP 上昇・労作時に出現・起坐呼吸・冷汗・湿潤\n【外すためにすること】心電図と心筋トロポニン（迷えば一度は取る）／BNP／NT-proBNP／労作耐容能の変化を具体的に聞く",
     "note": "",
     "refs": [
      "ACS_JCS",
      "HF_JCS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fatigue.kill1",
     "label": "副腎不全",
     "group": "主訴：倦怠感",
     "detail": "【この主訴で外す理由】低Na・高K・低血圧・色素沈着。診断されるまで何か月もかかることがあり、感染などで一気にクリーゼへ移る。\n【示唆する所見】低ナトリウム血症・高カリウム血症・色素沈着・収縮期血圧 100mmHg 以下・低血糖・体重減少（6か月で5%以上）・ステロイドの使用・中断\n【外すためにすること】朝のコルチゾール・ACTH／Na・K・血糖／副腎クリーゼを疑うショック・急性重症化では翌朝や負荷試験を待たずヒドロコルチゾンと補液。安定例は先にコルチゾール・ACTH等を評価",
     "note": "",
     "refs": [
      "ADRENAL_CRISIS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fatigue.kill2",
     "label": "造血器悪性腫瘍・重度貧血",
     "group": "主訴：倦怠感",
     "detail": "【この主訴で外す理由】汎血球減少や blast の出現は、倦怠感という主訴の下に隠れる。血算一枚で見つかる。\n【示唆する所見】重度の貧血・汎血球減少・末梢血に blast・血小板減少・LD 上昇・可溶性IL-2レセプター上昇・全身性リンパ節腫脹・体重減少（6か月で5%以上）・点状出血・紫斑\n【外すためにすること】血算と白血球分画（塗抹の目視を依頼する）／LD・尿酸・sIL-2R／必要なら骨髄検査へ",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fatigue.kill3",
     "label": "高カルシウム血症・腫瘍崩壊",
     "group": "主訴：倦怠感",
     "detail": "【この主訴で外す理由】倦怠感・多尿・便秘・意識障害。悪性腫瘍の背景で進む。\n【示唆する所見】高カルシウム血症・hyperca_severe・悪性腫瘍の既往・腎機能低下・意識障害あり・尿酸上昇\n【外すためにすること】補正Ca（Payne 式）とイオン化Ca／PTH・PTHrP・ビタミンD／高Caの程度・症状・原因に応じ治療。脱水には心腎機能をみながら補液し、必要時に腎機能等を考慮してビスホスホネート等を検討（腫瘍崩壊に一律使用しない）",
     "note": "",
     "refs": [
      "PAYNE",
      "HYPERCA_EMERG"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fatigue.flags",
     "label": "【倦怠感】red flag と次の一手",
     "group": "主訴：倦怠感",
     "detail": "【red flag】体重減少（6か月で5%以上）・重度の貧血・汎血球減少・末梢血に blast・hyperca_severe・重度の低ナトリウム血症・高カリウム血症・重度の腎機能低下・トロポニン上昇・全身性リンパ節腫脹・意識障害あり・低血糖・可溶性IL-2レセプター上昇\n【次に聞くこと】いつから、日内変動はあるか（朝が最悪＝うつ、動くと悪化＝身体疾患）／体重の変化、発熱、寝汗（B症状）／労作耐容能の具体的な変化（何階まで、何メートル）／薬剤の追加・増量／睡眠（いびき・無呼吸・日中の眠気）と気分\n【次に診ること】結膜・爪床の蒼白、舌の所見（貧血）／甲状腺、リンパ節、脾の触診／皮膚（色素沈着・黄染・紫斑）／心音・頸静脈・浮腫／起立性の血圧変化",
     "note": "倦怠感は最も非特異的で、最も見落としの多い主訴。「貧血・内分泌・腎肝・感染・腫瘍・薬剤・心」の七つを一度に当たり、同時に「隠れた急性疾患の仮面」でないかを確かめる。",
     "refs": [
      "JCCLS",
      "PAYNE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.fatigue.map",
     "label": "【倦怠感】鑑別の地図",
     "group": "主訴：倦怠感",
     "detail": "《血液・酸素運搬》貧血（鉄欠乏・慢性疾患・B12/葉酸）（貧血・anemia_moderate・microcytic・macrocytic・rdw_high）　|　造血器腫瘍（汎血球減少・末梢血に blast・異型リンパ球・LD 上昇・可溶性IL-2レセプター上昇）\n《内分泌・代謝》甲状腺機能低下症（両側下腿浮腫・低ナトリウム血症・ck_high・心拍数 50/分 以下・thyroid_ab_pos）　|　甲状腺機能亢進症（甲状腺びまん性腫大・TRAb 陽性・細かく速い動作時振戦・体重減少（6か月で5%以上）・心拍数 100/分 以上）　|　副腎不全（低ナトリウム血症・高カリウム血症・色素沈着・低血糖）　|　糖尿病の悪化・高血糖（hyperglycemia・hba1c_dm・糖尿病の既往・体重減少（6か月で5%以上））　|　電解質異常（Na・K・Ca・Mg）（低ナトリウム血症・低カリウム血症・高カルシウム血症・hypomg）\n《臓器障害・感染・腫瘍》腎機能低下・尿毒症（腎機能低下・重度の腎機能低下・クレアチニン上昇・慢性腎臓病・透析・貧血）　|　肝疾患（トランスアミナーゼ上昇・アルブミン低下・コリンエステラーゼ低下・ビリルビン上昇・肝硬変の既往）　|　心不全（BNP／NT-proBNP 上昇・起坐呼吸・両側下腿浮腫・頸静脈怒張）　|　慢性感染（結核・HIV・感染性心内膜炎）（発熱（体温 38℃以上）・体重減少（6か月で5%以上）・CRP 上昇・貧血・新規の心雑音）　|　悪性腫瘍（体重減少（6か月で5%以上）・貧血・アルブミン低下・LD 上昇・悪性腫瘍の既往・全身性リンパ節腫脹）　|　膠原病（リウマチ・SLE・筋炎）（多関節・対称性（手指小関節）・抗核抗体陽性・抗CCP抗体陽性・ck_high・膠原病の既往）\n《薬剤・環境・精神》薬剤性（β遮断薬・向精神薬・ステロイド・抗がん剤）（薬剤開始後・スタチン・ステロイド）　|　睡眠呼吸障害（呼吸困難を伴う・polycythemia・一次性呼吸性アシドーシス）　|　うつ・不安（慢性（数か月以上））",
     "note": "",
     "refs": [
      "JCCLS",
      "PAYNE"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.jaundice.kill0",
     "label": "急性胆管炎",
     "group": "主訴：黄疸",
     "detail": "【この主訴で外す理由】閉塞した胆道で感染が起き、菌が血中へ押し出される。黄疸＋発熱＋右上腹部痛はドレナージの適応を探す合図。\n【示唆する所見】発熱（体温 38℃以上）・体温 39℃ 以上・右上腹部圧痛・胆道系酵素優位の上昇・ビリルビン上昇・収縮期血圧 100mmHg 以下・意識障害あり・血小板減少・CRP 上昇\n【外すためにすること】Tokyo Guidelines 2018 の診断基準と重症度／腹部エコー／CT／MRCP／血液培養／抗菌薬・循環呼吸管理を開始し、中等症は早期、重症は初期安定化後できるだけ速やかに胆道ドレナージ。軽症も初期治療に反応しなければ検討",
     "note": "",
     "refs": [
      "TG18",
      "TG18_INITIAL"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.jaundice.kill1",
     "label": "急性肝不全",
     "group": "主訴：黄疸",
     "detail": "【この主訴で外す理由】肝細胞が一気に失われ、凝固能と意識が崩れる。PT-INR と意識レベルが重症度そのもの。\n【示唆する所見】トランスアミナーゼ著明上昇・INR 上昇・inr_veryhigh・PT 延長・アンモニア上昇・羽ばたき振戦・意識障害あり・低血糖・コリンエステラーゼ低下\n【外すためにすること】PT-INR と意識レベル（肝不全の定義そのもの）／アンモニア・血糖・アルブミン／ウイルス・薬剤・自己免疫・虚血の原因検索／肝移植施設への相談のタイミングを早める",
     "note": "",
     "refs": [
      "WESTHAVEN",
      "CHILDPUGH"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.jaundice.kill2",
     "label": "重度溶血（TTP・自己免疫性溶血・DIC）",
     "group": "主訴：黄疸",
     "detail": "【この主訴で外す理由】赤血球が壊れている。貧血の進行が速く、腎と中枢を同時に巻き込むことがある。\n【示唆する所見】ibil_high・LD 上昇・貧血・重度の貧血・retic_high・血小板減少・クレアチニン上昇・FDP 著明上昇\n【外すためにすること】間接ビリルビン・LD・ハプトグロビン・網赤血球／塗抹（破砕赤血球・球状赤血球）／直接クームス試験／TTPの臨床的疑いが強ければ血漿交換前にADAMTS13用採血を行い、結果を待たず血液内科と緊急治療",
     "note": "",
     "refs": [
      "ISTH_TTP"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.jaundice.flags",
     "label": "【黄疸】red flag と次の一手",
     "group": "主訴：黄疸",
     "detail": "【red flag】発熱（体温 38℃以上）・意識障害あり・羽ばたき振戦・inr_veryhigh・INR 上昇・トランスアミナーゼ著明上昇・低血糖・収縮期血圧 100mmHg 以下・血小板減少・腎機能低下・右上腹部圧痛・腹水（波動）\n【次に聞くこと】黄疸に気づいた時期と、尿・便の色の変化（濃い尿・灰白色便＝閉塞）／痛みの有無（無痛性黄疸は腫瘍を疑う）と発熱／飲酒量、サプリメント・健康食品を含む全ての内服／輸血・刺青・針刺し・性交渉歴（肝炎）／体重減少と家族歴\n【次に診ること】眼球結膜と皮膚の黄染の程度／右上腹部の圧痛と Murphy 徴候、胆嚢の触知（Courvoisier）／肝脾の大きさ、腹水、クモ状血管腫・手掌紅斑・腹壁静脈／羽ばたき振戦と意識レベル（肝不全の評価）",
     "note": "黄疸は三段構えで考える。肝前（溶血・無効造血）、肝（肝細胞障害）、肝後（胆道閉塞）。間接ビリルビン優位か直接優位か、胆道系酵素が上がっているかで層が決まる。",
     "refs": [
      "TG18",
      "CHILDPUGH",
      "MELDNA",
      "WESTHAVEN"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.jaundice.map",
     "label": "【黄疸】鑑別の地図",
     "group": "主訴：黄疸",
     "detail": "《肝前性（間接ビリルビン優位）》溶血性貧血（ibil_high・LD 上昇・貧血・retic_high・血小板減少）　|　体質性黄疸（Gilbert）（ibil_high）\n《肝性》ウイルス性肝炎（トランスアミナーゼ著明上昇・トランスアミナーゼ上昇・ビリルビン上昇）　|　薬剤性肝障害（薬剤開始後・トランスアミナーゼ上昇・胆道系酵素優位の上昇・好酸球増加）　|　アルコール性肝障害（ggt_high・トランスアミナーゼ上昇・macrocytic・血小板減少）　|　肝硬変の非代償化（肝硬変の既往・アルブミン低下・コリンエステラーゼ低下・血小板減少・腹水（波動）・クモ状血管腫・手掌紅斑・INR 上昇）　|　自己免疫性肝疾患（抗核抗体陽性・ama_pos・aih_ab_pos・igg4_high・胆道系酵素優位の上昇）　|　虚血性肝障害（ショック肝）（トランスアミナーゼ著明上昇・LD 上昇・収縮期血圧 100mmHg 以下・乳酸上昇）\n《肝後性（胆道閉塞）》胆管結石・胆管炎（右上腹部圧痛・発熱（体温 38℃以上）・胆道系酵素優位の上昇・ビリルビン上昇・Murphy 徴候陽性）　|　膵頭部・胆道の悪性腫瘍（胆道系酵素優位の上昇・ビリルビン上昇・体重減少（6か月で5%以上）・灰白色便・悪性腫瘍の既往）　|　原発性胆道疾患（PBC・PSC）（胆道系酵素優位の上昇・alp_high・ama_pos・igg4_high）",
     "note": "",
     "refs": [
      "TG18",
      "CHILDPUGH",
      "MELDNA",
      "WESTHAVEN"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.rash.kill0",
     "label": "アナフィラキシー",
     "group": "主訴：皮疹",
     "detail": "【この主訴で外す理由】皮膚症状＋呼吸・循環・消化器のいずれかが同時に来る。アドレナリン筋注の遅れが死因になる。\n【示唆する所見】びまん性紅斑・薬剤開始後・wheeze（笛音）・収縮期血圧 100mmHg 以下・心拍数 100/分 以上・呼吸困難・嘔吐を伴う\n【外すためにすること】アナフィラキシーを疑えば成人アドレナリン0.3〜0.5mgを大腿前外側に筋注（皮疹だけで一律投与しない）／原則仰臥位で急に立たせない。呼吸困難では呼吸しやすい体位、妊婦は左側、意識不良では気道保護を優先／WAO の診断基準で確認／遅発反応に備えて経過観察",
     "note": "",
     "refs": [
      "ANAPHYLAXIS"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.rash.kill1",
     "label": "重症薬疹（SJS／TEN・DIHS/DRESS）",
     "group": "主訴：皮疹",
     "detail": "【この主訴で外す理由】粘膜疹と水疱、あるいは高熱・肝障害・好酸球増加を伴う。原因薬の中止が遅れるほど皮膚が剥がれる。\n【示唆する所見】水疱・粘膜疹・薬剤開始後・体温 39℃ 以上・トランスアミナーゼ上昇・好酸球増加・全身性リンパ節腫脹・異型リンパ球\n【外すためにすること】被疑薬を全て並べ、開始時期と皮疹の時間関係を描く／粘膜（口腔・眼・外陰）の確認と Nikolsky 現象／肝腎機能・血算・好酸球／RegiSCAR の枠組みで整理し、皮膚科へ",
     "note": "",
     "refs": [
      "REGISCAR"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.rash.kill2",
     "label": "髄膜炎菌感染症・電撃性紫斑",
     "group": "主訴：皮疹",
     "detail": "【この主訴で外す理由】点状出血から紫斑が広がり、数時間でDICとショックに至る。発熱＋点状出血は抗菌薬を待たせない所見。\n【示唆する所見】点状出血・紫斑・発熱（体温 38℃以上）・体温 39℃ 以上・項部硬直・血小板減少・急性期DIC基準 4点以上・収縮期血圧 100mmHg 以下・乳酸上昇\n【外すためにすること】血液培養は投与を遅らせない範囲で採取し直ちに抗菌薬・全身安定化／広範・急速に拡大する紫斑では腰椎穿刺を行わない。ショック・出血リスクなども評価し、安全になるまで延期／凝固とDICの評価",
     "note": "",
     "refs": [
      "MENINGITIS",
      "JAAM_DIC",
      "NG240"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.rash.kill3",
     "label": "壊死性軟部組織感染",
     "group": "主訴：皮疹",
     "detail": "【この主訴で外す理由】皮膚所見より痛みが強く、境界が時間単位で進む。外科的デブリドマンと広域抗菌薬・全身管理を急ぐ。\n【示唆する所見】びまん性紅斑・発熱（体温 38℃以上）・CRP 著明上昇・CK 著明上昇・糖尿病の既往・収縮期血圧 100mmHg 以下・乳酸上昇\n【外すためにすること】皮膚所見の境界をマークして時間ごとに比較／CK・CRP・乳酸・血液培養／画像は補助であり、強く疑えば画像待ちで外科的探索・治療を遅らせない／外科へ即連絡し、広域抗菌薬と全身管理を並行",
     "note": "",
     "refs": [
      "IDSA_SSTI"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.rash.flags",
     "label": "【皮疹】red flag と次の一手",
     "group": "主訴：皮疹",
     "detail": "【red flag】水疱・粘膜疹・点状出血・紫斑・触知可能な紫斑・体温 39℃ 以上・収縮期血圧 100mmHg 以下・wheeze（笛音）・薬剤開始後・血小板減少・トランスアミナーゼ上昇・CRP 著明上昇・意識障害あり・急性期DIC基準 4点以上\n【次に聞くこと】皮疹が出た順序（どこから広がったか）と、発熱との前後関係／この4週間に始めた全ての薬（市販薬・サプリ・漢方を含む）／粘膜（口・眼・外陰）の症状、痛み・灼熱感／関節痛・脱毛・口腔内潰瘍・Raynaud（膠原病の手がかり）／動物・植物・食物・虫刺され、旅行歴\n【次に診ること】全身の皮膚と粘膜を見る（頭皮・手掌足底・爪・外陰も）／紫斑が触知できるかどうかを指で確かめる／Nikolsky 現象と皮膚剥離の面積／リンパ節と肝脾、関節／バイタル（血圧・呼吸・体温）— 皮疹の緊急度は全身状態で決まる",
     "note": "皮疹は「全身状態が悪いか」「粘膜をやられているか」「紫斑が触知できるか」の三点で緊急度が決まる。皮膚は全身疾患の窓である。",
     "refs": [
      "ANAPHYLAXIS",
      "REGISCAR",
      "SLE2019",
      "SSC2013"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.rash.map",
     "label": "【皮疹】鑑別の地図",
     "group": "主訴：皮疹",
     "detail": "《緊急度の高い形》紫斑（触知可能）＝血管炎（触知可能な紫斑・MPO-ANCA 陽性・PR3-ANCA 陽性・CRP 上昇・クレアチニン上昇）　|　紫斑（平坦）＝血小板・凝固の異常（平坦な（非触知）紫斑・点状出血・紫斑・血小板減少・重度の血小板減少・急性期DIC基準 4点以上）　|　水疱・粘膜疹＝重症薬疹・自己免疫性水疱症（水疱・粘膜疹・薬剤開始後・pemphigus_pos・bp180_pos）　|　びまん性紅斑＋低血圧＝毒素性ショック・アナフィラキシー（びまん性紅斑・収縮期血圧 100mmHg 以下・体温 39℃ 以上・心拍数 100/分 以上）\n《感染》ウイルス性発疹症（びまん性紅斑・発熱（体温 38℃以上）・異型リンパ球・lymphopenia）　|　蜂窩巣炎・erysipelas（片側下腿浮腫・発熱（体温 38℃以上）・CRP 上昇・糖尿病の既往）　|　帯状疱疹（水疱・粘膜疹・デルマトーム分布の感覚障害）　|　梅毒・HIV の皮疹（びまん性紅斑・全身性リンパ節腫脹）\n《膠原病・薬剤・その他》SLE（蝶形紅斑・抗核抗体陽性・抗核抗体 高力価・抗dsDNA抗体陽性・補体低下・多関節・対称性（手指小関節）・口腔内潰瘍）　|　皮膚筋炎（びまん性紅斑・ck_high・CK 著明上昇・jo1_pos・mda5_pos・tif1g_pos）　|　全身性強皮症（皮膚硬化・Raynaud 現象・scl70_pos・cent_pos・rnapol3_pos）　|　薬剤性発疹（軽症）（薬剤開始後・びまん性紅斑・好酸球増加）　|　乾癬・湿疹・蕁麻疹（反復・間欠的・慢性（数か月以上）・膿疱）",
     "note": "",
     "refs": [
      "ANAPHYLAXIS",
      "REGISCAR",
      "SLE2019",
      "SSC2013"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.joint_pain.kill0",
     "label": "化膿性関節炎",
     "group": "主訴：関節痛",
     "detail": "【この主訴で外す理由】関節内で菌が増えると数日で軟骨が破壊される。穿刺しなければ診断できない。\n【示唆する所見】単関節の熱感・腫脹・発熱（体温 38℃以上）・体温 39℃ 以上・CRP 上昇・CRP 著明上昇・白血球増加・糖尿病の既往・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）・関節疾患・人工関節\n【外すためにすること】関節穿刺（細胞数・結晶・グラム染色・培養）を最優先で／血液培養2セット／抗菌薬は穿刺後に（ただし全身状態が悪ければ待たない）／ドレナージ・洗浄の判断",
     "note": "",
     "refs": [],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.joint_pain.kill1",
     "label": "結晶性関節炎（痛風・偽痛風）の重症発作",
     "group": "主訴：関節痛",
     "detail": "【この主訴で外す理由】化膿性と見分けがつかない。穿刺液の結晶で分かれるが、両者は併存しうる。\n【示唆する所見】単関節の熱感・腫脹・尿酸上昇・発熱（体温 38℃以上）・CRP 上昇・利尿薬の使用・慢性腎臓病・透析\n【外すためにすること】関節液の偏光顕微鏡（尿酸ナトリウム／ピロリン酸カルシウム）／ACR/EULAR 2015 の痛風分類基準で整理／発作中の尿酸値は正常でも否定しない",
     "note": "",
     "refs": [
      "GOUT2015"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.joint_pain.kill2",
     "label": "全身性血管炎・膠原病の臓器障害",
     "group": "主訴：関節痛",
     "detail": "【この主訴で外す理由】関節症状は入口で、腎・肺・神経が同時に侵されていることがある。\n【示唆する所見】多関節・対称性（手指小関節）・MPO-ANCA 陽性・PR3-ANCA 陽性・抗核抗体 高力価・抗dsDNA抗体陽性・補体低下・クレアチニン上昇・触知可能な紫斑・血痰・喀血\n【外すためにすること】尿所見（血尿・蛋白尿・円柱）を必ず見る／胸部画像／ANCA・ANA・補体・抗dsDNA／ACR/EULAR の分類基準で整理する",
     "note": "",
     "refs": [
      "SLE2019",
      "RA2010"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.joint_pain.flags",
     "label": "【関節痛】red flag と次の一手",
     "group": "主訴：関節痛",
     "detail": "【red flag】単関節の熱感・腫脹・発熱（体温 38℃以上）・体温 39℃ 以上・CRP 著明上昇・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）・クレアチニン上昇・触知可能な紫斑・血痰・喀血・貧血・血小板減少・体重減少（6か月で5%以上）・結膜炎・ぶどう膜炎\n【次に聞くこと】関節の数と分布（左右対称か、大関節か小関節か、体軸か）／朝のこわばりの時間（1時間以上＝炎症性）／発症の速さ（数時間＝結晶・感染、数週＝自己免疫）／皮疹・眼症状・口腔内潰瘍・爪の変化・腸症状／先行感染、外傷、利尿薬、新規薬剤\n【次に診ること】腫脹・熱感・圧痛・可動域制限を関節ごとに記録／単関節で熱感があれば穿刺を検討する／皮膚・爪・頭皮（乾癬）、眼、口腔／腱付着部と仙腸関節／尿所見と血圧（腎病変の確認）",
     "note": "関節痛は「単関節か多関節か」「炎症性か非炎症性か」「対称性か」で地図が描ける。単関節の熱感は、まず化膿性関節炎を外す。",
     "refs": [
      "RA2010",
      "SLE2019",
      "GOUT2015",
      "SSC2013"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.joint_pain.map",
     "label": "【関節痛】鑑別の地図",
     "group": "主訴：関節痛",
     "detail": "《単関節》化膿性関節炎（単関節の熱感・腫脹・発熱（体温 38℃以上）・CRP 著明上昇・白血球増加）　|　痛風（単関節の熱感・腫脹・尿酸上昇・反復・間欠的・慢性腎臓病・透析）　|　偽痛風（CPPD）（単関節の熱感・腫脹・75歳以上・CRP 上昇）　|　外傷・変形性関節症（外傷後・慢性（数か月以上））\n《多関節・対称性》関節リウマチ（多関節・対称性（手指小関節）・抗CCP抗体陽性・リウマトイド因子陽性・mmp3_high・CRP 上昇・貧血）　|　SLE（多関節・対称性（手指小関節）・抗核抗体 高力価・抗dsDNA抗体陽性・補体低下・蝶形紅斑・口腔内潰瘍・血小板減少）　|　ウイルス性多関節炎（多関節・対称性（手指小関節）・感染後・急性発症（数時間））　|　リウマチ性多発筋痛症（50歳以上・CRP 上昇・貧血）\n《多関節・非対称性／体軸》脊椎関節炎・乾癬性関節炎（多関節・非対称性・体軸（仙腸・脊椎）の症状・結膜炎・ぶどう膜炎・CRP 上昇）　|　反応性関節炎（感染後・多関節・非対称性・結膜炎・ぶどう膜炎）　|　乾癬・炎症性腸疾患に伴う関節炎（体軸（仙腸・脊椎）の症状・血便（鮮血）・膿疱）",
     "note": "",
     "refs": [
      "RA2010",
      "SLE2019",
      "GOUT2015",
      "SSC2013"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.numbness.kill0",
     "label": "脊髄圧迫・馬尾症候群",
     "group": "主訴：しびれ",
     "detail": "【この主訴で外す理由】感覚レベルと膀胱直腸障害が出たら、時間単位で不可逆になる。\n【示唆する所見】髄節レベルのある感覚障害（横断性）・腱反射亢進（＋病的反射）・背部へ貫通する痛み・悪性腫瘍の既往・発熱（体温 38℃以上）・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）\n【外すためにすること】緊急MRI（全脊髄）／膀胱直腸機能と感覚レベルの時間記録／神経症状を伴う悪性脊髄圧迫を疑う場合は速やかにデキサメタゾンと専門科評価。感染性圧迫では抗菌薬・排膿を緊急検討（悪性腫瘍の既往だけで一律投与しない）",
     "note": "",
     "refs": [
      "NG234"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.numbness.kill1",
     "label": "脳血管障害",
     "group": "主訴：しびれ",
     "detail": "【この主訴で外す理由】片側のしびれだけで来る脳梗塞がある。突然発症で顔・上肢・下肢の組み合わせを見る。\n【示唆する所見】突然発症（秒〜分で完成）・片側の感覚障害・局所神経症候あり・構音障害・心房細動の既往・糖尿病の既往\n【外すためにすること】頭部CT／MRI／NIHSS／血糖／ABCD² で TIA 後のリスク評価",
     "note": "",
     "refs": [
      "STROKE_JP",
      "ABCD2"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.numbness.kill2",
     "label": "ギラン・バレー症候群",
     "group": "主訴：しびれ",
     "detail": "【この主訴で外す理由】感覚異常から始まり上行性に麻痺する。呼吸筋に及ぶ前に捕まえる。\n【示唆する所見】感染後・腱反射の低下〜消失・進行・増悪している・手袋・靴下型の感覚障害・抗GQ1b抗体陽性・抗GM1抗体陽性・抗GT1a抗体陽性\n【外すためにすること】%肺活量の反復測定／髄液（蛋白細胞解離）／神経伝導検査／抗ガングリオシド抗体",
     "note": "",
     "refs": [
      "GBS_CRIT"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.numbness.kill3",
     "label": "重度の電解質異常",
     "group": "主訴：しびれ",
     "detail": "【この主訴で外す理由】低Ca・低Mg・高K・低Kは感覚異常と筋症状で現れる。測れば分かるものを見落とさない。\n【示唆する所見】hypoca・hypoca_severe・hypomg・hypok_severe・重度の高カリウム血症・代謝性アルカローシス\n【外すためにすること】Ca（補正）・Mg・K・P・血液ガス／心電図／補正の速度に注意",
     "note": "",
     "refs": [
      "PAYNE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.numbness.flags",
     "label": "【しびれ】red flag と次の一手",
     "group": "主訴：しびれ",
     "detail": "【red flag】髄節レベルのある感覚障害（横断性）・腱反射の低下〜消失・進行・増悪している・突然発症（秒〜分で完成）・局所神経症候あり・発熱（体温 38℃以上）・悪性腫瘍の既往・hypoca_severe・重度の高カリウム血症・背部へ貫通する痛み・免疫抑制状態（ステロイド・免疫抑制薬・化学療法・移植後）\n【次に聞くこと】しびれの範囲を患者自身に描いてもらう（分布が診断の中心）／発症の速さと広がり方（下から上がってきたか）／排尿・排便の障害、歩行の変化／先行感染・ワクチン、外傷、同じ姿勢の持続／糖尿病・腎機能・飲酒・胃手術（B12）・新規薬剤\n【次に診ること】感覚（触覚・痛覚・振動覚・位置覚）の分布を記録する／腱反射と病的反射（中枢か末梢か）／筋力と筋萎縮、Tinel・Phalen／歩行と Romberg／血糖・Ca・Mg・B12・甲状腺の実測",
     "note": "しびれは分布が診断そのもの。手袋靴下型は多発神経炎、デルマトームは根、髄節レベルは脊髄、片側は脳。分布を描けば鑑別は半分終わる。",
     "refs": [
      "GBS_CRIT",
      "STROKE_JP",
      "PAYNE"
     ],
     "star": true,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    },
    {
     "id": "cc.numbness.map",
     "label": "【しびれ】鑑別の地図",
     "group": "主訴：しびれ",
     "detail": "《分布から（最初に描く）》多発神経炎（手袋・靴下型）（手袋・靴下型の感覚障害・腱反射の低下〜消失・糖尿病の既往・慢性（数か月以上）・macrocytic）　|　単一の根（デルマトーム）（デルマトーム分布の感覚障害・背部へ貫通する痛み）　|　髄節レベルあり（脊髄）（髄節レベルのある感覚障害（横断性）・腱反射亢進（＋病的反射））　|　片側（脳）（片側の感覚障害・突然発症（秒〜分で完成）・局所神経症候あり）　|　単一の末梢神経（手関節・肘・腓骨頭）（反復・間欠的・慢性（数か月以上））\n《代謝・栄養・薬剤》糖尿病性多発神経炎（糖尿病の既往・hba1c_dm・手袋・靴下型の感覚障害・hyperglycemia）　|　ビタミンB12・葉酸欠乏（macrocytic・貧血・腱反射亢進（＋病的反射）・手袋・靴下型の感覚障害）　|　尿毒症・甲状腺機能低下（重度の腎機能低下・慢性腎臓病・透析・thyroid_ab_pos・ck_high）　|　薬剤性（抗がん剤・抗結核薬・フェニトイン）（薬剤開始後・抗がん剤・フェニトイン）　|　アルコール性（macrocytic・ggt_high・hypomg）\n《自己免疫・その他》ギラン・バレー／CIDP（腱反射の低下〜消失・感染後・抗GQ1b抗体陽性・抗GM1抗体陽性・進行・増悪している）　|　血管炎性ニューロパチー（MPO-ANCA 陽性・PR3-ANCA 陽性・好酸球増加・触知可能な紫斑・CRP 上昇）　|　多発性硬化症・脊髄炎（髄節レベルのある感覚障害（横断性）・反復・間欠的・aqp4_pos・mog_pos）　|　過換気による四肢・口囲のしびれ（一次性呼吸性アルカローシス・反復・間欠的・代謝性アルカローシス）",
     "note": "",
     "refs": [
      "GBS_CRIT",
      "STROKE_JP",
      "PAYNE"
     ],
     "star": false,
     "conf": "design",
     "confNote": "主訴ごとに「まず外す疾患」「red flag」「鑑別の並べ方」を選んだのは本アプリの設計判断です。抜けている疾患・所見のご指摘が最も有益です。"
    }
   ]
  }
 ],
 "refs": [
  {
   "id": "NG158",
   "label": "VTE：事前確率に応じた検査（NICE NG158）",
   "cite": "NICE NG158, 1.1. https://www.nice.org.uk/guidance/ng158/chapter/Recommendations"
  },
  {
   "id": "NG148",
   "label": "AKI：緊急造影と薬剤の判断（NICE NG148）",
   "cite": "NICE NG148, 1.1.7, 1.2. https://www.nice.org.uk/guidance/ng148/chapter/Recommendations"
  },
  {
   "id": "ESC_HTN2024",
   "label": "高血圧性緊急症：臓器障害と病態別対応（ESC 2024）",
   "cite": "2024 ESC hypertension guidelines, section 10. https://academic.oup.com/eurheartj/article/45/38/3912/7741010"
  },
  {
   "id": "NG240",
   "label": "細菌性髄膜炎・髄膜炎菌感染症：検査と初期対応（NICE NG240）",
   "cite": "NICE NG240 (2024), 1.4.6–1.4.13, 1.6, 1.9. https://www.nice.org.uk/guidance/ng240/chapter/Recommendations"
  },
  {
   "id": "NG39",
   "label": "緊張性気胸の画像前減圧（NICE NG39）",
   "cite": "NICE NG39, 1.4.1–1.4.2（外傷診療の指針。循環不安定・重度呼吸障害の条件を参照）. https://www.nice.org.uk/guidance/ng39/chapter/Recommendations"
  },
  {
   "id": "SSC2021",
   "label": "敗血症：抗菌薬開始と培養（SSC 2021）",
   "cite": "Evans L, et al. Surviving Sepsis Campaign 2021. https://pmc.ncbi.nlm.nih.gov/articles/PMC8486643/"
  },
  {
   "id": "ENCEPH_IDSA",
   "label": "脳炎：経験的抗ウイルス治療（IDSA）",
   "cite": "Tunkel AR, et al. Clin Infect Dis. 2008;47:303–327, recommendation 21. https://academic.oup.com/cid/article/47/3/303/313455"
  },
  {
   "id": "NG228",
   "label": "SAH：CT陰性後の検査（NICE NG228）",
   "cite": "NICE NG228, 1.1.11–1.1.14. https://www.nice.org.uk/guidance/ng228/chapter/Recommendations"
  },
  {
   "id": "NG128",
   "label": "脳卒中・TIAの初期対応（NICE NG128）",
   "cite": "NICE NG128, 1.1–1.3. https://www.nice.org.uk/guidance/NG128/chapter/recommendations"
  },
  {
   "id": "NG234",
   "label": "悪性脊髄圧迫のステロイド適応（NICE NG234）",
   "cite": "NICE NG234, 1.8.1–1.8.2. https://www.nice.org.uk/guidance/ng234/chapter/recommendations"
  },
  {
   "id": "ADRENAL_CRISIS",
   "label": "副腎クリーゼ：検査を待たない治療（Society for Endocrinology）",
   "cite": "Society for Endocrinology, Adrenal crisis guidance. https://www.endocrinology.org/clinical-practice/clinical-guidance/adrenal-crisis/"
  },
  {
   "id": "HYPERCA_EMERG",
   "label": "高Ca血症：重症度別治療",
   "cite": "Society for Endocrinology (2016), Emergency management of acute hypercalcaemia. https://www.endocrinology.org/media/4277/emergency-guidance_acute-hypercalcaemia-in-adults.pdf"
  },
  {
   "id": "HYPONA_EMERG",
   "label": "症候性低Na血症：緊急補正と過補正防止",
   "cite": "Society for Endocrinology (2016). https://pmc.ncbi.nlm.nih.gov/articles/PMC5314809/"
  },
  {
   "id": "ASAM_THIAMINE",
   "label": "チアミンとブドウ糖の投与順序（ASAM）",
   "cite": "ASAM Clinical Practice Guideline on Alcohol Withdrawal Management (2020), V.7. https://doi.org/10.1097/ADM.0000000000000668"
  },
  {
   "id": "AHA_POISON",
   "label": "中毒の拮抗薬：適応と禁忌（AHA）",
   "cite": "AHA CPR & ECC Guidelines, Special Circumstances: Benzodiazepine and opioid poisoning. https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-and-pediatric-special-circumstances-of-resuscitation/"
  },
  {
   "id": "ACC_BLEED",
   "label": "抗凝固薬関連出血：中和適応（ACC）",
   "cite": "ACC Expert Consensus Decision Pathway (2020). https://www.jacc.org/doi/10.1016/j.jacc.2020.04.053"
  },
  {
   "id": "CG141",
   "label": "上部消化管出血：蘇生・内視鏡・薬物（NICE）",
   "cite": "NICE CG141, 1.3–1.5. https://www.nice.org.uk/guidance/CG141/Chapter/Recommendations"
  },
  {
   "id": "IDSA_SSTI",
   "label": "壊死性軟部組織感染：外科対応を遅らせない（IDSA）",
   "cite": "IDSA SSTI guideline (2014), section VIII. https://www.idsociety.org/practice-guideline/skin-and-soft-tissue-infections/"
  },
  {
   "id": "RCUK_K",
   "label": "高K血症の緊急治療（RCUK 2025）",
   "cite": "Resuscitation Council UK 2025, Special circumstances: Hyperkalaemia. https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/special-circumstances-guidelines"
  },
  {
   "id": "DKA2024",
   "label": "成人DKA：インスリン開始前のK評価",
   "cite": "Umpierrez GE, et al. Hyperglycemic Crises in Adults With Diabetes. Diabetes Care. 2024;47:1257–1275. https://doi.org/10.2337/dci24-0032"
  },
  {
   "id": "TG18_INITIAL",
   "label": "胆管炎の初期管理とドレナージ時機（TG18）",
   "cite": "Miura F, et al. Tokyo Guidelines 2018: initial management. https://doi.org/10.1002/jhbp.509"
  },
  {
   "id": "ACG_AP2024",
   "label": "急性膵炎：CTの適応（ACG 2024）",
   "cite": "Tenner S, et al. ACG Guidelines: Management of Acute Pancreatitis (2024). https://pmc.ncbi.nlm.nih.gov/articles/PMC13221274/"
  },
  {
   "id": "ASH_HIT",
   "label": "HIT：4Tsに応じた初期対応（ASH 2018）",
   "cite": "ASH 2018 HIT guideline, recommendations 2.2–2.6. https://pmc.ncbi.nlm.nih.gov/articles/PMC6258919/"
  },
  {
   "id": "ISTH_TTP",
   "label": "TTP：ADAMTS13採血と治療開始（ISTH）",
   "cite": "ISTH guidelines for diagnosis of TTP (2020). https://pmc.ncbi.nlm.nih.gov/articles/PMC8146131/"
  },
  {
   "id": "JCCLS",
   "label": "JCCLS 共用基準範囲",
   "cite": "日本臨床検査標準協議会（JCCLS）基準範囲共用化委員会. 共用基準範囲に基づく医学的判断値."
  },
  {
   "id": "EGFR_JP",
   "label": "日本人 eGFR 推算式",
   "cite": "Matsuo S, et al. Revised equations for estimated GFR from serum creatinine in Japan. Am J Kidney Dis. 2009;53(6):982-992."
  },
  {
   "id": "PAYNE",
   "label": "Payne 補正Ca式",
   "cite": "Payne RB, et al. Interpretation of serum calcium in patients with abnormal serum proteins. Br Med J. 1973;4(5893):643-646."
  },
  {
   "id": "WINTER",
   "label": "Winter 式",
   "cite": "Albert MS, Dell RB, Winters RW. Quantitative displacement of acid-base equilibrium in metabolic acidosis. Ann Intern Med. 1967;66(2):312-322."
  },
  {
   "id": "FIGGE",
   "label": "アルブミン補正アニオンギャップ",
   "cite": "Figge J, et al. Anion gap and hypoalbuminemia. Crit Care Med. 1998;26(11):1807-1810."
  },
  {
   "id": "GOLDMARK",
   "label": "GOLD MARK（AG開大の鑑別）",
   "cite": "Mehta AN, Emmett JB, Emmett M. GOLD MARK: an anion gap mnemonic for the 21st century. Lancet. 2008;372(9642):892."
  },
  {
   "id": "UAG",
   "label": "尿アニオンギャップ",
   "cite": "Batlle DC, et al. The use of the urinary anion gap in the diagnosis of hyperchloremic metabolic acidosis. N Engl J Med. 1988;318(10):594-599."
  },
  {
   "id": "BERLIN",
   "label": "ARDS ベルリン定義",
   "cite": "ARDS Definition Task Force. Acute respiratory distress syndrome: the Berlin Definition. JAMA. 2012;307(23):2526-2533."
  },
  {
   "id": "SEPSIS3",
   "label": "Sepsis-3",
   "cite": "Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-810."
  },
  {
   "id": "SOFA",
   "label": "SOFA スコア",
   "cite": "Vincent JL, et al. The SOFA score to describe organ dysfunction/failure. Intensive Care Med. 1996;22(7):707-710."
  },
  {
   "id": "CURB65",
   "label": "CURB-65",
   "cite": "Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital. Thorax. 2003;58(5):377-382."
  },
  {
   "id": "ADROP",
   "label": "A-DROP",
   "cite": "日本呼吸器学会. 成人肺炎診療ガイドライン."
  },
  {
   "id": "CENTOR",
   "label": "McIsaac（修正Centor）スコア",
   "cite": "McIsaac WJ, et al. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ. 1998;158(1):75-83."
  },
  {
   "id": "CHADSVASC",
   "label": "CHA₂DS₂-VASc",
   "cite": "Lip GY, et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation. Chest. 2010;137(2):263-272."
  },
  {
   "id": "HASBLED",
   "label": "HAS-BLED",
   "cite": "Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding. Chest. 2010;138(5):1093-1100."
  },
  {
   "id": "WELLS_DVT",
   "label": "Wells スコア（DVT）",
   "cite": "Wells PS, et al. Value of assessment of pretest probability of deep-vein thrombosis in clinical management. Lancet. 1997;350(9094):1795-1798."
  },
  {
   "id": "WELLS_PE",
   "label": "Wells スコア（肺塞栓）",
   "cite": "Wells PS, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost. 2000;83(3):416-420."
  },
  {
   "id": "SPESI",
   "label": "簡易版 PESI",
   "cite": "Jiménez D, et al. Simplification of the pulmonary embolism severity index for prognostication. Arch Intern Med. 2010;170(15):1383-1389."
  },
  {
   "id": "KDIGO_AKI",
   "label": "KDIGO AKI 診療ガイドライン",
   "cite": "KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138."
  },
  {
   "id": "KDIGO_CKD",
   "label": "KDIGO CKD 診療ガイドライン",
   "cite": "KDIGO 2012 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int Suppl. 2013;3(1):1-150."
  },
  {
   "id": "CHILDPUGH",
   "label": "Child-Pugh 分類",
   "cite": "Pugh RN, et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-649."
  },
  {
   "id": "MELD",
   "label": "MELD スコア",
   "cite": "Kamath PS, et al. A model to predict survival in patients with end-stage liver disease. Hepatology. 2001;33(2):464-470."
  },
  {
   "id": "MELDNA",
   "label": "MELD-Na",
   "cite": "Kim WR, et al. Hyponatremia and mortality among patients on the liver-transplant waiting list. N Engl J Med. 2008;359(10):1018-1026."
  },
  {
   "id": "WESTHAVEN",
   "label": "West-Haven 分類（肝性脳症）",
   "cite": "Vilstrup H, et al. Hepatic encephalopathy in chronic liver disease: 2014 practice guideline by AASLD and EASL. Hepatology. 2014;60(2):715-735."
  },
  {
   "id": "GBS",
   "label": "Glasgow-Blatchford スコア",
   "cite": "Blatchford O, Murray WR, Blatchford M. A risk score to predict need for treatment for upper-gastrointestinal haemorrhage. Lancet. 2000;356(9238):1318-1321."
  },
  {
   "id": "ROCKALL",
   "label": "Rockall スコア",
   "cite": "Rockall TA, et al. Risk assessment after acute upper gastrointestinal haemorrhage. Gut. 1996;38(3):316-321."
  },
  {
   "id": "JSS_AP",
   "label": "急性膵炎 重症度判定基準（厚生労働省）",
   "cite": "厚生労働省難治性膵疾患に関する調査研究班. 急性膵炎重症度判定基準（2008年改訂）／急性膵炎診療ガイドライン."
  },
  {
   "id": "LIGHT",
   "label": "Light の基準（胸水）",
   "cite": "Light RW, et al. Pleural effusions: the diagnostic separation of transudates and exudates. Ann Intern Med. 1972;77(4):507-513."
  },
  {
   "id": "JAAM_DIC",
   "label": "急性期DIC診断基準（日本救急医学会）",
   "cite": "Gando S, et al. A multicenter, prospective validation of disseminated intravascular coagulation diagnostic criteria for critically ill patients. Crit Care Med. 2006;34(3):625-631."
  },
  {
   "id": "ISTH_DIC",
   "label": "ISTH overt DIC スコア",
   "cite": "Taylor FB Jr, et al. Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation. Thromb Haemost. 2001;86(5):1327-1330."
  },
  {
   "id": "FOURTS",
   "label": "4Ts スコア（HIT）",
   "cite": "Lo GK, et al. Evaluation of pretest clinical score (4 T's) for the diagnosis of heparin-induced thrombocytopenia. J Thromb Haemost. 2006;4(4):759-765."
  },
  {
   "id": "HSCORE",
   "label": "HScore（血球貪食症候群）",
   "cite": "Fardet L, et al. Development and validation of the HScore, a score for the diagnosis of reactive hemophagocytic syndrome. Arthritis Rheumatol. 2014;66(9):2613-2620."
  },
  {
   "id": "BURCH",
   "label": "Burch-Wartofsky スコア（甲状腺クリーゼ）",
   "cite": "Burch HB, Wartofsky L. Life-threatening thyrotoxicosis: thyroid storm. Endocrinol Metab Clin North Am. 1993;22(2):263-277."
  },
  {
   "id": "JTA_STORM",
   "label": "甲状腺クリーゼ診断基準（日本甲状腺学会）",
   "cite": "日本甲状腺学会・日本内分泌学会. 甲状腺クリーゼ診断基準."
  },
  {
   "id": "SLE2019",
   "label": "SLE 分類基準（EULAR/ACR 2019）",
   "cite": "Aringer M, et al. 2019 European League Against Rheumatism/American College of Rheumatology classification criteria for systemic lupus erythematosus. Ann Rheum Dis. 2019;78(9):1151-1159."
  },
  {
   "id": "RA2010",
   "label": "RA 分類基準（ACR/EULAR 2010）",
   "cite": "Aletaha D, et al. 2010 Rheumatoid arthritis classification criteria. Arthritis Rheum. 2010;62(9):2569-2581."
  },
  {
   "id": "SSC2013",
   "label": "全身性強皮症 分類基準（ACR/EULAR 2013）",
   "cite": "van den Hoogen F, et al. 2013 classification criteria for systemic sclerosis. Ann Rheum Dis. 2013;72(11):1747-1755."
  },
  {
   "id": "APS_SYD",
   "label": "抗リン脂質抗体症候群 分類基準（Sydney）",
   "cite": "Miyakis S, et al. International consensus statement on an update of the classification criteria for definite antiphospholipid syndrome. J Thromb Haemost. 2006;4(2):295-306."
  },
  {
   "id": "ABCD2",
   "label": "ABCD² スコア（TIA）",
   "cite": "Johnston SC, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-292."
  },
  {
   "id": "NEWS2",
   "label": "NEWS2",
   "cite": "Royal College of Physicians. National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS. 2017."
  },
  {
   "id": "GCS",
   "label": "Glasgow Coma Scale",
   "cite": "Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81-84."
  },
  {
   "id": "JCS",
   "label": "Japan Coma Scale（3-3-9度方式）",
   "cite": "太田富雄, 他. 急性期意識障害の新しいgrading とその表現法（いわゆる3-3-9度方式）. 脳神経外科学会（第3回脳卒中の外科研究会）講演集. 1975:61-69."
  },
  {
   "id": "NIHSS",
   "label": "NIHSS",
   "cite": "Brott T, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-870."
  },
  {
   "id": "STROKE_JP",
   "label": "脳卒中治療ガイドライン",
   "cite": "日本脳卒中学会 脳卒中ガイドライン委員会. 脳卒中治療ガイドライン 2021."
  },
  {
   "id": "OTTAWA_SAH",
   "label": "Ottawa SAH ルール",
   "cite": "Perry JJ, et al. Clinical decision rules to rule out subarachnoid hemorrhage for acute headache. JAMA. 2013;310(12):1248-1255."
  },
  {
   "id": "SE_ILAE",
   "label": "てんかん重積の定義（ILAE）",
   "cite": "Trinka E, et al. A definition and classification of status epilepticus - Report of the ILAE Task Force on Classification of Status Epilepticus. Epilepsia. 2015;56(10):1515-1523."
  },
  {
   "id": "GBS_CRIT",
   "label": "ギラン・バレー症候群 診断基準",
   "cite": "Asbury AK, Cornblath DR. Assessment of current diagnostic criteria for Guillain-Barre syndrome. Ann Neurol. 1990;27(Suppl):S21-S24."
  },
  {
   "id": "DUKE",
   "label": "修正 Duke 基準（感染性心内膜炎）",
   "cite": "Li JS, et al. Proposed modifications to the Duke criteria for the diagnosis of infective endocarditis. Clin Infect Dis. 2000;30(4):633-638."
  },
  {
   "id": "GOUT2015",
   "label": "痛風 分類基準（ACR/EULAR 2015）",
   "cite": "Neogi T, et al. 2015 Gout Classification Criteria: an American College of Rheumatology/European League Against Rheumatism collaborative initiative. Arthritis Rheumatol. 2015;67(10):2557-2568."
  },
  {
   "id": "MENINGITIS",
   "label": "成人細菌性髄膜炎の臨床所見",
   "cite": "van de Beek D, et al. Clinical features and prognostic factors in adults with bacterial meningitis. N Engl J Med. 2004;351(18):1849-1859."
  },
  {
   "id": "ACS_JCS",
   "label": "急性冠症候群ガイドライン（日本循環器学会）",
   "cite": "日本循環器学会. 急性冠症候群ガイドライン（2018年改訂版）."
  },
  {
   "id": "AORTA_ACC",
   "label": "大動脈疾患ガイドライン（ACC/AHA 2022）",
   "cite": "Isselbacher EM, et al. 2022 ACC/AHA Guideline for the Diagnosis and Management of Aortic Disease. Circulation. 2022;146(24):e334-e482."
  },
  {
   "id": "HF_JCS",
   "label": "急性・慢性心不全診療ガイドライン",
   "cite": "日本循環器学会／日本心不全学会. 急性・慢性心不全診療ガイドライン（2017年改訂版）および2021年フォーカスアップデート."
  },
  {
   "id": "PE_HF",
   "label": "心不全の身体所見の診断精度",
   "cite": "Wang CS, et al. Does this dyspneic patient in the emergency department have congestive heart failure? JAMA. 2005;294(15):1944-1956."
  },
  {
   "id": "TG18",
   "label": "Tokyo Guidelines 2018（急性胆嚢炎・胆管炎）",
   "cite": "Yokoe M, et al. Tokyo Guidelines 2018: diagnostic criteria and severity grading of acute cholecystitis. J Hepatobiliary Pancreat Sci. 2018;25(1):41-54."
  },
  {
   "id": "ALVARADO",
   "label": "Alvarado スコア（急性虫垂炎）",
   "cite": "Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med. 1986;15(5):557-564."
  },
  {
   "id": "IDSA_DIAR",
   "label": "感染性腸炎 診療ガイドライン（IDSA）",
   "cite": "Shane AL, et al. 2017 Infectious Diseases Society of America Clinical Practice Guidelines for the Diagnosis and Management of Infectious Diarrhea. Clin Infect Dis. 2017;65(12):e45-e80."
  },
  {
   "id": "ANAPHYLAXIS",
   "label": "アナフィラキシー診断基準（WAO）",
   "cite": "Cardona V, et al. World Allergy Organization Anaphylaxis Guidance 2020. World Allergy Organ J. 2020;13(10):100472."
  },
  {
   "id": "REGISCAR",
   "label": "RegiSCAR（重症薬疹・DRESS）",
   "cite": "Kardaun SH, et al. Variability in the clinical pattern of cutaneous side-effects of drugs with systemic symptoms: does a DRESS syndrome really exist? Br J Dermatol. 2007;156(3):609-611."
  }
 ]
};
