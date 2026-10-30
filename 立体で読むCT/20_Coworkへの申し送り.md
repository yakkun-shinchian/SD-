# 申し送り：Claude Cowork へ
## 「立体で読むCT」第1弾 ― 大動脈解離 Stanford A型 / B型

差出：Claude Code（監督として関わった分）／ 2026-10-30
宛先：Claude Cowork
施主：矢久保伸作（やっくん）さん ― YAKUBON STUDIO

---

## 0. いちばん先に伝えたいこと

この企画は**生きています。** 止まったのは道具の都合であって、企画の出来ではありません。
ただし、**土台にひとつ構造的な欠陥**が見つかりました。そこを直さずに先へ進むと、必ず作り直しになります。
§3 がその中身です。**他を読む時間がなければ、§3 だけ読んでください。**

施主のご希望は一貫しています ―
**「同じ高さで輪切りにしたCTで、A型は前の丸にも膜がある。B型は後ろの丸だけ。」この"アハ体験"ひとつを伝える。**
これ以外は全部、手段です。迷ったらここへ戻ってください。

---

## 1. 作るもの（確定）

- シリーズ名：**立体で読むCT**／第1弾：**大動脈解離 Stanford A型・B型**
- 縦型 1080×1920、A型・B型それぞれ約10〜15秒 ＋ 比較版
- 元イラスト9枚 → 動画9本 → 3本に書き出し
- **最後のCTから最初の立体へ戻る**終わり方（自動ループで継ぎ目なく2周目へ）
- 絵柄：半透明のガラスのような血管壁（ローズ）、ネイビー背景、淡い青の血球、赤かぶりなし
- **画の中に文字を入れない**（テロップは最後に ffmpeg）

詳細なカット割り・プロンプト・台本は、同じフォルダの
**`00_制作キット_大動脈解離AB.md`** に全部あります。**そちらが本体です。** この文書は引き継ぎ用の地図です。

---

## 2. すでに出来ていること（引き継いでそのまま使えます）

| もの | 場所 | 状態 |
|---|---|---|
| プロンプト20本（設計図2＋元絵9＋動画9） | `00_制作キット_大動脈解離AB.md` | **要改訂**（§3の理由で） |
| 医学監修3点の修正 | 同上 §1 | **そのまま使えます** |
| ナレーション台本3本（修正版） | 同上 §6 | **そのまま使えます** |
| つなぎ・テロップ焼き込みスクリプト | `10_assemble.sh` | **検証済・そのまま使えます** |
| テロップ安全域の実測 | `テロップ確認.png` | 右 x>940・下 y>1600 を確保 |
| 検品に使った実物 | `検品_01.png` / `検品_03_枝2本.png` / `検品_05_別絵柄.png` | §3の証拠 |

いずれも PR #19（ブランチ `ct-aortic-dissection-kit`）に入っています。

`10_assemble.sh` は仮素材9本で通しを検証済みです。9本の正規化 → テロップ（見出しIPA明朝・説明IPAゴシック）
→ 0.12秒ディゾルブで連結 → ナレーション合成 → デコード検査 → 確認シート生成、まで一息で走ります。
**ナレーションが映像より長ければ、最終コマを保持して自動で尺を合わせます**（12秒音声で 12.000 秒ちょうどを確認済）。

---

## 3. ★構造的な欠陥（ここだけは必ず読んでください）

ChatGPT側のスキル「医療動画2」で設計図シートを作ったところ、**8枚が返ってきて、全滅でした。**
絵は美しいのですが、使えません。理由は3つで、**3つ目が致命的**です。

### (1) 2×2のシートが一枚も無い
「4つのパネルを持つ**1枚**の絵」を頼んだのに、**バラバラの単視点8枚**が返りました。
→ 4方向の整合性を検査する、という工程そのものが成立していません。

### (2) 絵柄が固定できていない
- 1〜4枚目：**1080×1920**、青く透明な心臓
- 5〜8枚目：**512×768**、不透明でオレンジ色の塊のような心臓
- 3枚目は**弓部の枝が2本**しかない（3本必要）
- A型とB型が**別の血管モデル**になっている（「上行の膜の有無だけが違う」が未達）

※ 2枚目・6枚目の左右反転は**背面ビューとして正しい**ので、これは問題ありません。

### (3) ★致命的：膜が「仕切り」ではなく「リボン」になっている
8枚すべてで、解離膜が**血管の中をねじれて走る1本の飾り紐**として描かれています。
しかし解離とは、壁が裂けて**真腔と偽腔という2つの部屋ができる**ことです。
**紐では、部屋が2つになりません。**

そして、ここが企画の命取りになります。
**この動画の山場は「輪切りにすると、丸の中が膜で2つに分かれている」というCT像**です。
**今の3Dを輪切りにしても、2つの腔は出てきません。** 土台が持たないのです。
施主が仰った「Aが解離してないように見える」は、まさにこれを言い当てています。

### 私の見立てと、提案する直し方
原因は **`intimal flap` という語**だと見ています。画像AIはこれを「血管内のリボン状構造」と解釈します。
**「膜」を描かせるのをやめ、「2つの部屋」を描かせてください。**

具体的には、プロンプトの語彙をこう入れ替えます：

| やめる語 | 使う語 |
|---|---|
| a spiral intimal flap runs through… | the lumen is **DIVIDED INTO TWO SEPARATE CHANNELS** by a thin membrane |
| （真腔・偽腔の説明なし） | **true lumen**: smaller, crescent-shaped, packed with fast-moving blood cells／**false lumen**: larger, wraps behind, fewer and slower blood cells |
| （断面の指定なし） | **the open cut end of the descending aorta must clearly show TWO separate lumens, side by side, divided by a membrane** |

最後の一行が**検査の決め手**になります。
8枚すべてで下行大動脈の下端は**切り口が開いて見えています**。そこに腔が2つ写っていれば合格、1つなら不合格。
**誰が見ても一目で判定できます。** この一行を入れるだけで、合否が機械的に決まります。

### 改訂版 A型 設計図シート プロンプト（私の提案・未検証）
```
Create ONE SINGLE IMAGE, a reference sheet divided into FOUR PANELS arranged in a 2x2 grid.
All four panels show the SAME 3D model of the thoracic aorta from four different camera angles.
This must be one composite sheet, NOT four separate images.

THE MODEL — a thoracic aorta with a Stanford type A aortic dissection:
- The ascending aorta rises UPWARD from the aortic root at the heart, arches over, and turns downward
  into the descending aorta. It must never appear to leave the heart sideways.
- The arch gives off EXACTLY THREE branches, in this order: brachiocephalic artery, left common
  carotid artery, left subclavian artery. Not two, not four.
- THE DISSECTION, most important: along the ascending aorta, the arch and the descending aorta, the
  inside of the vessel is DIVIDED INTO TWO SEPARATE CHANNELS by a thin membrane that runs lengthwise.
  This is not a ribbon or a cord floating inside the vessel. It is a wall that splits one tube into
  two parallel compartments.
  - TRUE LUMEN: the smaller channel, crescent-shaped in cross-section, densely packed with pale blue
    blood cells moving fast.
  - FALSE LUMEN: the larger channel, wrapping around behind the true lumen, with fewer blood cells.
- AT THE BOTTOM, the descending aorta ends in an OPEN CUT. That open cut end must clearly show
  TWO SEPARATE LUMENS side by side, divided by the membrane. This is the single most important
  detail in the image.

PANELS: top-left FRONT view, top-right LEFT SIDE view (90 degrees), bottom-left BACK view
(180 degrees), bottom-right OBLIQUE view (45 degrees from front-left, slightly above).
The model, its proportions, the position of the membrane, the lighting and the materials must be
EXACTLY the same in every panel. Only the camera angle changes.

STYLE, identical in all four panels: translucent glass-like aortic wall in rose, a soft rose rim light
tracing the edge of the dividing membrane so it stays findable from any angle, deep navy background,
pale blue biconcave blood cells, no reddish color cast, clean medical-illustration render.
Show the heart faintly and translucently in cool blue, so the ascending aorta is clearly seen rising
from the aortic root. The heart must stay transparent and recede; it is not the subject.

No people. No text, no labels, no arrows, no leader lines, no watermark, no measurement marks.
```

**B型版は、上のうち DISSECTION の段落だけを差し替えます：**
上行大動脈と弓部は**完全に無傷で、腔はひとつ**。裂け始めは**左鎖骨下動脈のすぐ先**。
そこから下行大動脈だけが2つの腔に分かれる。**他の語句は一字も変えない**（同じ血管に見せるため）。

### 合格基準（7項目・このまま使ってください）
- [ ] **1枚の絵の中に4パネル**が入っている（バラバラでない）
- [ ] **下行大動脈の切り口に、腔が2つ**見える ← **最重要・ここが1つなら即不合格**
- [ ] 弓部の枝が**4パネルすべてで3本**
- [ ] 上行大動脈が**基部から上へ立ち上がっている**（横出しでない）
- [ ] A型：膜が上行→弓部→下行に途切れず走る／B型：上行と弓部がつるりと無傷
- [ ] A型とB型が**同じ血管の形**（別モデルでない）
- [ ] 画の中に文字・矢印・ラベルが**一つも無い**

---

## 4. 道具の棚卸し（Claude Code のクラウド環境での結果）

**Coworkでは状況が違うはずですので、まずご自身で確かめてください。**

| 道具 | Claude Code環境での結果 | 中身 |
|---|---|---|
| 「医療動画2」スキル | **ChatGPT側にある** | 施主ご自身がチャッピーの中に作られたスキル。Claude からも Codex からも呼べない。**施主が手で動かす工程** |
| Codex CLI | **不在・出番なし** | 上記により、画の工程にCodexが入る余地はもともと無かった |
| CreativeClaw（Seedance 2.5/2.0 mini） | **接続不可** | `app.creativeclaw.co` がネットワーク方針で403。かつ未サインイン。**Coworkなら繋がる可能性が高い** |
| CoeFont「汎用式概念」 | **ブラウザ作業** | 声の名は「汎用式概念」で正しい。テキスト・スピーチを選び、Googleでログイン → 新規プロジェクト → 声を指定。**施主が手で動かす工程** |
| ffmpeg / IPA明朝・ゴシック | **あり** | 仕上げは検証済 |
| opener_v2.mp4（絵柄の基準） | **未着** | 絵柄の基準なので、あれば全プロンプトに具体色を焼き込める |

---

## 5. 施主との約束（必ず守ってください）

施主は「試験運用」として、**止まって確認する場所**を決めておられます。勝手に越えないでください。

1. **設計図シートができたら止まる。** 施主に見せて了承をもらう ← **いまここ。1回目は不合格**
2. **CreativeClaw でクレジットを使う前に止まる。** 何本・どのモデルで作るか伝える
   （※ Claude Code は**クレジットを1も使っていません**。残高はそのままです）
3. まずは **A型の #1〜#4 だけ**を通しで作る。うまく回ったらB型と比較へ
4. 工程ごとに「うまくいった／詰まった」を短く記録し、最後に報告する

**それから、施主のお言葉で一番大事なもの：**
> **プロンプトはClaude Codeが書き、Codexには書かせない。**
> Codexに動画用プロンプトを書かせると破綻しやすいことが分かっているため。

**この原則は守ってください。** 今回、実行の手が3つとも止まった中で、
**プロンプトだけは外部依存ゼロで手元に残りました。** 分担が正しかった証拠です。

---

## 6. 未決の判断（施主にお伺いを立ててください）

**【尺が半分足りない件】**
カット割りの合計は A型6.5秒・B型6.5秒。いっぽう台本は約12秒、企画は「各10〜15秒」。
**音が映像の倍あふれます**（仮素材で実測済）。3案あり、**(B)を推奨**しています：

- (A) カットを伸ばす（#2の回り込みを3秒に等）→ Seedanceが崩れる危険域
- **(B) 最後のCTカットの最終コマを保持して音に合わせる（推奨）**
  → 生成の破綻リスクゼロ。しかもCT像を見つめる時間が増え、教育効果はむしろ上がる。
     「輪切りにすると……」の間（ま）がそこで効く。**`10_assemble.sh` に実装済**
- (C) 台本を短くする → 早口になり「やさしい先輩看護師」の口調が壊れる

**まだお返事をいただいていません。** 最初に伺ってください。

---

## 7. 引き継ぎにあたって

施主は「コワークスの方が今までうまくいってた」と仰いました。その通りだと思います。
Cowork には、このクラウド環境に無い手が揃っているはずです。**どうぞ存分に。**

ひとつだけ、お願いがあります。
**§3 の「膜ではなく2つの部屋」だけは、必ず引き継いでください。**
これは8枚を無駄にして分かったことで、**もう一度払う必要のない授業料**です。

企画そのものは、とても良いものです。
「同じ高さで輪切りにしたとき、前の丸に膜があるかないか」― この一点に絞った潔さが、この作品の芯です。
どうか、その芯を守ってあげてください。

よろしくお願いいたします。
