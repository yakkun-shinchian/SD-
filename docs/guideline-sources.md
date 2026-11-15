# 診療ガイドラインの取り込み台帳

このアプリの判定を、**公開されている診療ガイドラインの原典**と突き合わせていくための台帳です。
一度に全領域は終わりません。ここに「どこまで当たったか」を残し、領域ごとに進めます。

## 何を取り込み、何を取り込まないか

取り込むのは **判定そのもの**（閾値・診断基準・アルゴリズム・重症度分類）だけです。
ガイドラインの**本文はリポジトリに複製しません**。

これは制約ではなく、設計です。このアプリが読むのは文章ではなく数値と条件だからで、
「AG >14 で開大」「BNP 100 pg/mL」「TG18 の胆嚢炎は局所＋全身＋画像」といった
**判定は事実であり、著作物ではありません**。出典を明記して実装に落とせます。
本文を持たなくても精度は上がり、持っても精度は上がりません。

各判定には必ず `dx-refs.js` の出典 ID を付け、原典が公開されていれば `url` も入れます。
`verify.html` と各判定カードから、その場で原典を開けるようにしてあります。

## ネットワーク

学会サイトは既定の環境からは届きません。環境「**SD- 診療ガイドライン参照**」に
下記ホストを許可してあります。`WebFetch` はプロキシを通らないため、**取得は `curl` で**行います。

```
www.j-circ.or.jp  minds.jcqhc.or.jp  www.jsn.or.jp  www.jsge.or.jp  www.jrs.or.jp
www.jsth.org  www.japanthyroid.jp  www.jds.or.jp  www.ryumachi-jp.com
www.jstroke.gr.jp  www.nanbyou.or.jp  www.jaam.jp  kdigo.org
pmc.ncbi.nlm.nih.gov  pubmed.ncbi.nlm.nih.gov  www.ahajournals.org
academic.oup.com  goldcopd.org  ginasthma.org  www.sccm.org
```

### PDF から取れるもの・取れないもの

日本循環器学会の PDF は、**数値・英文の文献リスト・図表のラベルは `pdftotext` で取れますが、
日本語の本文はほぼ取れません**（CID フォントに ToUnicode が無いため）。

したがって作業はこうなります。

- **数値の閾値** — PDF から直接確認できる。これが取り込みの主対象。
- **文章で書かれた基準** — PDF からは読めない。英語版（Circ J／PMC）を当たるか、
  先生に `verify.html` で確認していただく。

## 領域別の進捗

| 領域 | 原典 | 取り込んだもの | 状態 |
|---|---|---|---|
| 循環器・心不全 | 日本循環器学会 2025年改訂版 心不全診療ガイドライン | BNP／NT-proBNP カットオフ（急性期 100／300、慢性期 35／125） | ✅ 反映済み。従来の NT-proBNP 400 は誤りだったため修正 |
| 循環器・ACS | 日本循環器学会 急性冠症候群ガイドライン（2018年改訂版） | 出典と原典 URL | ⏳ 判定の取り込みはこれから |
| 循環器・肺血栓塞栓症 | 日本循環器学会 2025年改訂版 肺血栓塞栓症・DVT・肺高血圧症ガイドライン | 出典と原典 URL、年齢調整 D-ダイマーの注意喚起 | ⏳ リスク層別化はこれから |
| 循環器・大動脈 | 日本循環器学会 2020年改訂版 大動脈瘤・大動脈解離診療ガイドライン | 出典と原典 URL（ACC/AHA 2022 と併記） | ⏳ |
| 循環器・感染性心内膜炎 | 日本循環器学会 2026年改訂版 感染性心内膜炎診療ガイドライン | 出典と原典 URL（修正 Duke 基準と併記） | ⏳ |
| 腎臓 | KDIGO AKI／CKD | 既存（病期分類） | ⏳ 原典 URL 未付与 |
| 呼吸器 | 日本呼吸器学会、GOLD、GINA | 未着手 | ⬜ |
| 消化器・肝 | 日本消化器病学会、Tokyo Guidelines 2018 | 既存（TG18・Child-Pugh・MELD） | ⏳ 原典 URL 未付与 |
| 内分泌 | 日本甲状腺学会、日本糖尿病学会 | 既存（甲状腺クリーゼ） | ⏳ |
| 血液・凝固 | 日本血栓止血学会、日本救急医学会 | 既存（急性期DIC・ISTH・4Ts） | ⏳ |
| 膠原病 | ACR/EULAR、日本リウマチ学会 | 既存（SLE2019・RA2010・SSc2013） | ⏳ |
| 脳神経 | 日本脳卒中学会 脳卒中治療ガイドライン 2021 | 出典のみ | ⏳ |

- ✅ 判定まで反映済み　⏳ 出典は付いたが判定の照合はこれから　⬜ 未着手

## 取り込みの手順

```bash
# 1. 一覧を取る（例：日本循環器学会）
curl -sS "https://www.j-circ.or.jp/guideline/guideline-series/" -o jcs.html

# 2. PDF を落として数値を探す
curl -sS "https://www.j-circ.or.jp/cms/wp-content/uploads/2025/03/JCS2025_Kato.pdf" -o hf.pdf
pdftotext -layout hf.pdf hf.txt
grep -nE "BNP|pg/mL" hf.txt
```

3. `dx-refs.js` に出典を追加する（`label` / `cite` / 公開されていれば `url`）。
   **出典を先に入れてから判定を書く。**
4. 判定を `labs-*.js`／`dx-core.js`／`dx-cc.js`／`dx-scores.js` に入れ、`refs` で出典を指す。
5. 値が出典により割れるものは `tools/build-verify-checklist.mjs` の `VARIES` に理由を書く。
6. 照合チェックリストを再生成し、回帰を通す。

```bash
node tools/build-verify-checklist.mjs
node tools/test-labs-missing.mjs
node tools/test-dx-scores-missing.mjs
node tools/browser-check.mjs
```

## これまでに見つかった実装の誤り

| 日付 | 箇所 | 誤り | 原典 |
|---|---|---|---|
| 2026-11-15 | `labs-chem.js` | NT-proBNP の上昇判定が 400 pg/mL。ガイドラインの急性期カットオフは 300 | 心不全診療ガイドライン 2025 |
| 2026-11-15 | `dx-refs.js` | 心不全の出典が 2017年改訂版＋2021 FU のまま。2025年改訂版が出ている | 同上 |
| 2026-11-15 | `dx-core.js` | 心不全の鑑別に出典が付いていなかった（本プロジェクトの規約違反） | 同上 |
| 2026-11-15 | `labs-coag.js` | D-ダイマー陰性の表示が測定系（FEU／DDU）の違いに触れておらず、安心させすぎる可能性 | ADJUST-PE ほか |
