/* =========================================================================
 * RadioDeck 図解ライブラリ（RAD_FIGURES）なのだ
 *
 * ★ ここにある図は、すべて自作のSVG「模式図」なのだ。
 *   実際の患者さんの画像ではないし、本物の写真を取り込んだものでもないのだ。
 *   本物は情報量が多すぎて初学者には読めないのだ。だから
 *   「何がどこに、どんな形で見えるか」だけを抜き出して描いているのだ。
 *
 * 使い方: RAD_FIGURES["kerleyB"]() が SVG文字列を返すのだ。
 * ========================================================================= */

"use strict";

/* 共通パーツ ------------------------------------------------------------- */

// レントゲン風の下地（黒背景）
function radFilmBg() {
  return `<rect class="radfig__film" x="0" y="0" width="400" height="300" rx="10"/>`;
}

// 胸部X線の基本構造（正面像）
function radChestBase() {
  return `
    ${radFilmBg()}
    <g class="radfig__soft">
      <!-- 胸壁 -->
      <path d="M60 52 C50 120 62 208 94 250" fill="none" stroke-width="3"/>
      <path d="M340 52 C350 120 338 208 306 250" fill="none" stroke-width="3"/>
      <!-- 鎖骨 -->
      <path d="M72 72 C116 56 162 58 186 68" fill="none" stroke-width="3"/>
      <path d="M328 72 C284 56 238 58 214 68" fill="none" stroke-width="3"/>
      <!-- 肋骨（左右4本ずつ・簡略） -->
      <g stroke-width="1.8" opacity=".48">
        <path d="M64 100 C96 84 140 86 176 104" fill="none"/>
        <path d="M62 130 C96 114 142 118 180 138" fill="none"/>
        <path d="M64 160 C98 144 144 150 184 170" fill="none"/>
        <path d="M70 190 C104 174 148 182 186 202" fill="none"/>
        <path d="M336 100 C304 84 260 86 224 104" fill="none"/>
        <path d="M338 130 C304 114 258 118 220 138" fill="none"/>
        <path d="M336 160 C302 144 256 150 216 170" fill="none"/>
        <path d="M330 190 C296 174 252 182 214 202" fill="none"/>
      </g>
    </g>
    <!-- 縦隔（脊椎の陰）と心陰影 -->
    <g class="radfig__mediastinum">
      <rect x="188" y="50" width="24" height="196" opacity=".42"/>
      <!-- 左心縁（画面右側へ張り出す） -->
      <path d="M200 112 C234 108 260 126 273 156 C286 188 281 222 265 241 L200 243 Z"/>
      <!-- 右心縁（画面左側のふくらみ） -->
      <path d="M200 150 C184 158 176 184 178 212 C179 230 187 241 200 243 Z"/>
      <!-- 大動脈弓 -->
      <path d="M200 94 C215 88 227 97 229 110 L200 114 Z" opacity=".85"/>
    </g>
    <!-- 気管（縦隔の中を走る黒い空気の柱） -->
    <rect x="194" y="50" width="13" height="54" rx="3" fill="#05080c"/>
    <path d="M194 104 L178 124 M207 104 L224 124" stroke="#05080c" stroke-width="5" fill="none"/>
    <!-- 横隔膜（右＝画面左のほうが高いのだ） -->
    <g class="radfig__soft">
      <path d="M66 238 C104 210 152 212 186 236" fill="none" stroke-width="3"/>
      <path d="M334 248 C298 222 254 224 222 244" fill="none" stroke-width="3"/>
    </g>`;
}

// 頭部CT（横断像）の基本構造
function radHeadBase() {
  return `
    ${radFilmBg()}
    <!-- 頭蓋骨 -->
    <ellipse class="radfig__bone" cx="200" cy="156" rx="116" ry="100" fill="none" stroke-width="6"/>
    <!-- 脳実質 -->
    <ellipse class="radfig__brain" cx="200" cy="156" rx="110" ry="94"/>
    <!-- 大脳縦裂 -->
    <path class="radfig__csf" d="M200 64 L200 248" stroke-width="2.5" fill="none"/>
    <!-- 基底核のあたり -->
    <ellipse class="radfig__gray" cx="154" cy="156" rx="19" ry="26" opacity=".5"/>
    <ellipse class="radfig__gray" cx="246" cy="156" rx="19" ry="26" opacity=".5"/>
    <!-- 側脳室（左右）と第三脳室 -->
    <ellipse class="radfig__csf-fill" cx="181" cy="156" rx="8" ry="29" transform="rotate(-9 181 156)"/>
    <ellipse class="radfig__csf-fill" cx="219" cy="156" rx="8" ry="29" transform="rotate(9 219 156)"/>
    <rect class="radfig__csf-fill" x="198" y="148" width="4" height="22" rx="2"/>`;
}

function radLabel(x, y, text, anchor) {
  return `<text class="radfig__label" x="${x}" y="${y}" text-anchor="${anchor || "middle"}">${text}</text>`;
}

function radArrow(x1, y1, x2, y2) {
  return `<path class="radfig__arrow" d="M${x1} ${y1} L${x2} ${y2}" marker-end="url(#radArrowHead)"/>`;
}

function radDefs() {
  return `<defs>
    <marker id="radArrowHead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" class="radfig__arrowhead"/>
    </marker>
  </defs>`;
}

function radSvg(inner, label) {
  return `<svg viewBox="0 0 400 300" class="radfig" role="img" aria-label="${label}">
    ${radDefs()}${inner}
  </svg>`;
}

/* 図解本体 --------------------------------------------------------------- */

const RAD_FIGURES = {
  /* ===== 胸部X線 ===== */

  cxrNormal() {
    return radSvg(
      `${radChestBase()}
       ${radLabel(126, 100, "右肺野")}
       ${radLabel(278, 100, "左肺野")}
       ${radLabel(238, 212, "心陰影")}
       ${radLabel(96, 258, "肋横角")}`,
      "正常な胸部X線の模式図"
    );
  },

  kerleyB() {
    const lines = [];
    // 下肺野・末梢に、胸膜に垂直な短い線
    const seed = [
      [74, 196, 100, 192], [72, 208, 98, 205], [78, 220, 104, 218],
      [84, 230, 110, 229], [326, 196, 300, 192], [328, 208, 302, 205],
      [322, 220, 296, 218], [316, 230, 290, 229],
    ];
    seed.forEach(([x1, y1, x2, y2]) => {
      lines.push(`<path class="radfig__finding" d="M${x1} ${y1} L${x2} ${y2}" stroke-width="3.2"/>`);
    });
    return radSvg(
      `${radChestBase()}
       <g>${lines.join("")}</g>
       ${radArrow(118, 170, 96, 200)}
       ${radLabel(150, 164, "胸膜に垂直な短い線")}
       ${radLabel(200, 282, "1〜2cm・肺底部・末梢に多いのだ")}`,
      "ケーリーBラインの模式図"
    );
  },

  batwing() {
    return radSvg(
      `${radChestBase()}
       <g class="radfig__finding-fill" opacity=".75">
         <ellipse cx="150" cy="150" rx="56" ry="48"/>
         <ellipse cx="256" cy="150" rx="52" ry="46"/>
       </g>
       ${radLabel(200, 286, "肺門を中心に、蝶が羽を広げたように白くなるのだ")}
       ${radArrow(104, 108, 132, 134)}
       ${radLabel(96, 100, "中枢優位", "start")}`,
      "蝶形陰影（バットウィング）の模式図"
    );
  },

  silhouette() {
    return radSvg(
      `${radChestBase()}
       <g class="radfig__finding-fill" opacity=".8">
         <path d="M214 160 C206 190 208 220 220 238 L262 238 C276 222 280 196 276 168 Z"/>
       </g>
       ${radArrow(312, 182, 280, 198)}
       ${radLabel(318, 176, "心陰影の", "start")}
       ${radLabel(318, 190, "輪郭が消える", "start")}
       ${radLabel(200, 286, "接している＝同じ深さにある、という証拠なのだ")}`,
      "シルエットサインの模式図"
    );
  },

  airBronchogram() {
    return radSvg(
      `${radChestBase()}
       <g class="radfig__finding-fill" opacity=".8">
         <ellipse cx="128" cy="160" rx="52" ry="54"/>
       </g>
       <g class="radfig__air" stroke-width="3.4" fill="none">
         <path d="M156 134 L124 158 M124 158 L104 146 M124 158 L110 184 M124 158 L140 182"/>
       </g>
       ${radArrow(74, 112, 108, 144)}
       ${radLabel(68, 104, "白い中に", "start")}
       ${radLabel(200, 286, "肺胞が埋まっても気管支に空気が残ると黒く透けるのだ")}`,
      "エアブロンコグラムの模式図"
    );
  },

  pneumothorax() {
    return radSvg(
      `${radChestBase()}
       <!-- 虚脱肺 -->
       <path class="radfig__finding" d="M100 78 C78 130 86 200 112 240" fill="none" stroke-width="3.4"/>
       <!-- 無構造な黒い部分 -->
       ${radLabel(78, 150, "肺紋理", "middle")}
       ${radLabel(78, 166, "なし", "middle")}
       ${radArrow(132, 96, 106, 112)}
       ${radLabel(140, 90, "胸膜線", "start")}
       ${radLabel(200, 286, "線より外に血管影がなければ気胸なのだ")}`,
      "気胸の模式図"
    );
  },

  effusion() {
    return radSvg(
      `${radChestBase()}
       <path class="radfig__fluid" d="M64 236 C100 212 150 214 190 232 L192 256 L84 256 Z"/>
       <path class="radfig__fluid" d="M64 236 C78 222 76 206 72 196" fill="none" stroke-width="3"/>
       ${radArrow(126, 184, 92, 220)}
       ${radLabel(134, 178, "外側ほど高く上がる", "start")}
       ${radLabel(200, 286, "肋横角が鈍くなるのが最初のサインなのだ")}`,
      "胸水の模式図"
    );
  },

  atelectasis() {
    return radSvg(
      `${radChestBase()}
       <g class="radfig__finding-fill" opacity=".8">
         <path d="M92 196 C120 176 160 180 180 200 L176 240 L104 242 Z"/>
       </g>
       <path class="radfig__arrow" d="M196 180 L166 196" marker-end="url(#radArrowHead)"/>
       <path class="radfig__arrow" d="M120 250 L132 232" marker-end="url(#radArrowHead)"/>
       ${radLabel(214, 174, "縦隔が患側へ引かれる", "start")}
       ${radLabel(200, 286, "容積が減る＝周りが寄ってくるのが無気肺なのだ")}`,
      "無気肺の模式図"
    );
  },

  ggo() {
    return radSvg(
      `${radFilmBg()}
       <circle class="radfig__brain" cx="200" cy="150" r="118" opacity=".25"/>
       <g class="radfig__finding-fill" opacity=".45">
         <ellipse cx="150" cy="130" rx="48" ry="40"/>
         <ellipse cx="252" cy="168" rx="44" ry="38"/>
       </g>
       <g class="radfig__air" stroke-width="2.4" fill="none" opacity=".9">
         <path d="M120 130 L182 130 M150 106 L150 158 M226 168 L286 168"/>
       </g>
       ${radLabel(200, 44, "すりガラス影（GGO）")}
       ${radLabel(200, 272, "白いけれど、中の血管が透けて見えるのが特徴なのだ")}`,
      "すりガラス影の模式図"
    );
  },

  crazyPaving() {
    const grid = [];
    for (let i = 0; i < 5; i += 1) {
      grid.push(`<path class="radfig__finding" d="M${128 + i * 24} 108 L${128 + i * 24} 200" stroke-width="2"/>`);
      grid.push(`<path class="radfig__finding" d="M124 ${112 + i * 22} L${244} ${112 + i * 22}" stroke-width="2"/>`);
    }
    return radSvg(
      `${radFilmBg()}
       <circle class="radfig__brain" cx="200" cy="150" r="118" opacity=".25"/>
       <rect class="radfig__finding-fill" x="124" y="108" width="120" height="94" opacity=".4" rx="6"/>
       <g>${grid.join("")}</g>
       ${radLabel(200, 44, "crazy-paving（敷石状）")}
       ${radLabel(200, 240, "すりガラス影＋小葉間隔壁の肥厚")}
       ${radLabel(200, 272, "石畳を敷いたような網目に見えるのだ")}`,
      "crazy-paving patternの模式図"
    );
  },

  honeycomb() {
    const cells = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 6; c += 1) {
        const x = 118 + c * 30 + (r % 2 ? 15 : 0);
        const y = 150 + r * 26;
        cells.push(`<circle class="radfig__finding" cx="${x}" cy="${y}" r="11" fill="none" stroke-width="2.6"/>`);
      }
    }
    return radSvg(
      `${radFilmBg()}
       <circle class="radfig__brain" cx="200" cy="150" r="118" opacity=".25"/>
       <g>${cells.join("")}</g>
       ${radLabel(200, 56, "蜂巣肺（honeycombing）")}
       ${radLabel(200, 258, "胸膜直下・下肺野優位に積み重なるのが典型なのだ")}`,
      "蜂巣肺の模式図"
    );
  },

  /* ===== 頭部CT ===== */

  headNormal() {
    return radSvg(
      `${radHeadBase()}
       ${radLabel(200, 34, "正常の頭部CT（模式図）")}
       ${radLabel(154, 210, "基底核")}
       ${radLabel(200, 282, "灰白質と白質の境界がはっきり見えるのが正常なのだ")}`,
      "正常頭部CTの模式図"
    );
  },

  sdh() {
    return radSvg(
      `${radHeadBase()}
       <path class="radfig__blood" d="M100 106 C84 136 84 178 102 208 C114 192 118 158 116 128 C115 116 109 110 100 106 Z"/>
       ${radLabel(200, 34, "急性硬膜下血腫：脳表に沿う三日月型")}
       ${radArrow(74, 70, 100, 112)}
       ${radLabel(200, 282, "縫合線を越えて、広く薄く広がるのだ")}`,
      "急性硬膜下血腫の模式図"
    );
  },

  edh() {
    return radSvg(
      `${radHeadBase()}
       <path class="radfig__blood" d="M98 122 C126 126 138 154 136 180 C134 200 122 212 104 210 C90 186 90 146 98 122 Z"/>
       ${radLabel(200, 34, "急性硬膜外血腫：こんもり盛り上がる凸レンズ型")}
       ${radArrow(72, 80, 100, 124)}
       ${radLabel(200, 282, "縫合線で硬膜が骨に貼りついているので、そこで止まるのだ")}`,
      "急性硬膜外血腫の模式図"
    );
  },

  sah() {
    return radSvg(
      `${radHeadBase()}
       <g class="radfig__blood">
         <path d="M200 102 L186 124 L166 118 L178 140 L160 154 L184 158 L182 182 L200 166 L218 182 L216 158 L240 154 L222 140 L234 118 L214 124 Z"/>
       </g>
       ${radLabel(200, 34, "くも膜下出血：脳槽が白く埋まる（星形）")}
       ${radArrow(300, 72, 240, 124)}
       ${radLabel(200, 282, "本来は黒いはずの脳脊髄液の場所が、白くなるのだ")}`,
      "くも膜下出血の模式図"
    );
  },

  hyperdenseMca() {
    return radSvg(
      `${radHeadBase()}
       <path class="radfig__blood" d="M234 148 C256 140 276 136 296 138" fill="none" stroke-width="7" stroke-linecap="round"/>
       <path class="radfig__csf" d="M166 148 C144 140 124 136 104 138" fill="none" stroke-width="5" stroke-linecap="round" opacity=".55"/>
       ${radLabel(200, 34, "hyperdense MCA sign：片側の血管だけが白い")}
       ${radArrow(302, 72, 288, 132)}
       ${radLabel(200, 282, "血栓そのものが写っているのだ。左右差で気づくのだ")}`,
      "hyperdense MCA signの模式図"
    );
  },

  insularRibbon() {
    return radSvg(
      `${radHeadBase()}
       <path class="radfig__gray" d="M242 124 C262 140 262 172 242 188" fill="none" stroke-width="7" opacity=".95"/>
       <path class="radfig__finding-soft" d="M158 124 C138 140 138 172 158 188" fill="none" stroke-width="7"/>
       ${radLabel(200, 34, "島皮質リボンの消失：左だけ境界がぼやけている")}
       ${radArrow(96, 76, 142, 130)}
       ${radLabel(200, 282, "黒くなる前に「ぼやける」のが早期サインなのだ")}`,
      "島皮質リボン消失の模式図"
    );
  },

  putaminal() {
    return radSvg(
      `${radHeadBase()}
       <ellipse class="radfig__blood" cx="152" cy="156" rx="25" ry="33"/>
       ${radLabel(200, 34, "被殻出血：基底核の外側に境界明瞭な白い塊")}
       ${radArrow(76, 84, 132, 140)}
       ${radLabel(200, 282, "高血圧性脳出血が最も好む場所なのだ")}`,
      "被殻出血の模式図"
    );
  },

  midlineShift() {
    return radSvg(
      `${radHeadBase()}
       <path class="radfig__blood" d="M100 106 C84 136 84 178 102 208 C116 190 120 156 118 126 Z"/>
       <path class="radfig__csf" d="M216 68 L216 246" stroke-width="3" fill="none"/>
       ${radLabel(200, 34, "正中偏位：正中構造が健側へ押される")}
       <path class="radfig__arrow" d="M200 262 L216 262" marker-end="url(#radArrowHead)"/>
       ${radLabel(200, 282, "偏位量は必ずmmで測って伝えるのだ")}`,
      "正中偏位の模式図"
    );
  },
  /* ===== 腹部 ===== */

  // 造影ダイナミックの「時間 × 濃染」グラフ。腹部の質的診断の核心なのだ。
  enhanceCurves() {
    const ax = (t) => 70 + t * 78; // 0..4 → x
    const ay = (v) => 240 - v * 1.7; // 0..100 → y
    const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${ax(p[0])} ${ay(p[1])}`).join(" ");
    const liver = [[0, 10], [1, 35], [2, 70], [3, 62], [4, 55]];
    const hcc = [[0, 10], [1, 92], [2, 58], [3, 40], [4, 34]];
    const hem = [[0, 10], [1, 40], [2, 62], [3, 78], [4, 86]];
    const met = [[0, 10], [1, 30], [2, 38], [3, 34], [4, 30]];
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__axis">
         <path d="M70 240 L376 240" stroke-width="2"/>
         <path d="M70 240 L70 52" stroke-width="2"/>
       </g>
       ${radLabel(70, 262, "単純")}
       ${radLabel(148, 262, "動脈相")}
       ${radLabel(226, 262, "門脈相")}
       ${radLabel(304, 262, "平衡相")}
       <text class="radfig__label" x="30" y="150" text-anchor="middle" transform="rotate(-90 30 150)">濃染の強さ</text>
       <path class="radfig__curve radfig__curve--liver" d="${path(liver)}" fill="none"/>
       <path class="radfig__curve radfig__curve--a" d="${path(hcc)}" fill="none"/>
       <path class="radfig__curve radfig__curve--b" d="${path(hem)}" fill="none"/>
       <path class="radfig__curve radfig__curve--c" d="${path(met)}" fill="none"/>
       <g class="radfig__legend">
         <text x="286" y="78" class="radfig__curve-key radfig__curve-key--a">肝細胞癌</text>
         <text x="286" y="96" class="radfig__curve-key radfig__curve-key--b">血管腫</text>
         <text x="286" y="114" class="radfig__curve-key radfig__curve-key--c">乏血性（転移・膵癌）</text>
         <text x="286" y="132" class="radfig__curve-key radfig__curve-key--liver">背景の肝臓</text>
       </g>
       ${radLabel(200, 36, "造影ダイナミックCT：時間でこう変わるのだ")}`,
      "造影ダイナミックCTの濃染曲線の模式図"
    );
  },

  hccWashout() {
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__organ">
         <path d="M28 108 C72 76 160 72 186 104 C190 150 170 196 120 206 C70 212 32 174 28 108 Z"/>
       </g>
       <circle class="radfig__finding-fill" cx="108" cy="138" r="26"/>
       ${radLabel(108, 230, "動脈相：明るい")}
       <g class="radfig__organ">
         <path d="M214 108 C258 76 346 72 372 104 C376 150 356 196 306 206 C256 212 218 174 214 108 Z"/>
       </g>
       <circle class="radfig__finding-dark" cx="294" cy="138" r="26"/>
       <circle class="radfig__finding" cx="294" cy="138" r="30" fill="none" stroke-width="3"/>
       ${radLabel(294, 230, "門脈〜平衡相：暗い＋被膜")}
       ${radLabel(200, 40, "肝細胞癌：動脈相濃染 → washout")}
       ${radLabel(200, 268, "背景の肝臓より暗くなるのが washout なのだ")}`,
      "肝細胞癌の濃染パターンの模式図"
    );
  },

  hemangioma() {
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__organ">
         <path d="M40 96 C84 66 168 62 192 94 C196 140 176 186 128 196 C80 202 44 162 40 96 Z"/>
       </g>
       <circle class="radfig__finding-dark" cx="112" cy="128" r="30"/>
       <g class="radfig__finding-fill">
         <circle cx="92" cy="112" r="7"/><circle cx="130" cy="114" r="7"/>
         <circle cx="90" cy="144" r="7"/><circle cx="132" cy="144" r="7"/>
       </g>
       ${radLabel(116, 218, "動脈相：辺縁に結節状の濃染")}
       <g class="radfig__organ">
         <path d="M210 96 C254 66 338 62 362 94 C366 140 346 186 298 196 C250 202 214 162 210 96 Z"/>
       </g>
       <circle class="radfig__finding-fill" cx="286" cy="128" r="30"/>
       ${radLabel(290, 218, "遅延相：中心まで埋まる")}
       ${radLabel(200, 40, "肝血管腫：辺縁から中心へ fill-in するのだ")}
       ${radLabel(200, 262, "ゆっくり埋まり、遅延相でも明るいままなのが特徴なのだ")}`,
      "肝血管腫の模式図"
    );
  },

  doubleDuct() {
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__organ">
         <path d="M60 108 C120 92 196 96 246 118 C286 136 316 160 340 186" fill="none" stroke-width="20" stroke-linecap="round" opacity=".55"/>
       </g>
       <path class="radfig__fluid" d="M86 78 C120 96 150 118 176 138" fill="none" stroke-width="11" stroke-linecap="round"/>
       <path class="radfig__fluid" d="M74 162 C112 158 148 152 178 146" fill="none" stroke-width="11" stroke-linecap="round"/>
       <circle class="radfig__finding-dark" cx="206" cy="146" r="24"/>
       <circle class="radfig__finding" cx="206" cy="146" r="24" fill="none" stroke-width="2.6" stroke-dasharray="5 4"/>
       ${radLabel(78, 62, "総胆管（拡張）", "start")}
       ${radLabel(60, 186, "主膵管（拡張）", "start")}
       ${radArrow(268, 104, 224, 132)}
       ${radLabel(274, 98, "膵頭部の乏血性腫瘤", "start")}
       ${radLabel(200, 262, "2本の管がそろって拡張したら膵頭部を疑うのだ")}`,
      "double duct signの模式図"
    );
  },

  freeAir() {
    return radSvg(
      `${radChestBase()}
       <path class="radfig__air-fill" d="M80 230 C116 206 160 208 192 228 L192 236 C158 220 116 220 82 240 Z"/>
       <path class="radfig__air-fill" d="M336 240 C300 214 256 216 224 236 L224 244 C256 230 298 230 334 250 Z"/>
       ${radArrow(132, 186, 136, 220)}
       ${radLabel(138, 180, "横隔膜の下に黒い三日月", "start")}
       ${radLabel(200, 286, "立位で撮らないと見えないのだ。ここが大事なのだ")}`,
      "横隔膜下遊離ガスの模式図"
    );
  },

  bowelObstruction() {
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__organ" stroke-width="3" fill="none">
         <ellipse cx="130" cy="110" rx="56" ry="26"/>
         <ellipse cx="150" cy="166" rx="62" ry="28"/>
         <ellipse cx="132" cy="222" rx="54" ry="25"/>
       </g>
       <g class="radfig__fluid">
         <path d="M76 112 L186 112 L186 134 C150 140 110 138 76 132 Z"/>
         <path d="M90 168 L212 168 L212 192 C170 198 126 196 90 190 Z"/>
         <path d="M80 224 L186 224 L186 244 C150 250 112 248 80 242 Z"/>
       </g>
       <g class="radfig__organ" stroke-width="2.4" fill="none" opacity=".9">
         <path d="M86 102 L174 102 M92 158 L206 158 M88 214 L178 214"/>
       </g>
       ${radArrow(262, 128, 200, 120)}
       ${radLabel(268, 122, "鏡面像（ニボー）", "start")}
       ${radLabel(268, 170, "階段状に", "start")}
       ${radLabel(268, 186, "並ぶのが小腸なのだ", "start")}
       ${radLabel(200, 278, "立位で、液体と空気が水平な境界を作るのだ")}`,
      "腸閉塞のニボーの模式図"
    );
  },

  hydronephrosis() {
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__organ">
         <path d="M118 80 C168 84 188 126 184 162 C180 206 148 236 112 230 C86 224 78 180 80 142 C82 108 94 82 118 80 Z"/>
       </g>
       <g class="radfig__fluid">
         <path d="M132 112 C156 118 160 146 154 164 C148 186 130 198 116 190 C106 178 108 142 114 124 Z"/>
       </g>
       <path class="radfig__fluid" d="M154 170 C196 196 232 220 262 240" fill="none" stroke-width="10" stroke-linecap="round"/>
       <circle class="radfig__bone" cx="276" cy="248" r="9"/>
       ${radArrow(214, 128, 166, 148)}
       ${radLabel(220, 122, "腎盂・腎杯の拡張", "start")}
       ${radArrow(322, 224, 290, 244)}
       ${radLabel(328, 218, "結石", "start")}
       ${radLabel(200, 282, "拡張が終わるところに、犯人がいるのだ")}`,
      "水腎症と尿管結石の模式図"
    );
  },

  appendicitis() {
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__organ">
         <path d="M96 118 C140 108 184 112 206 134 L206 196 C176 214 128 212 98 194 Z" opacity=".55"/>
       </g>
       <g class="radfig__finding-soft" opacity=".5">
         <ellipse cx="248" cy="196" rx="62" ry="46"/>
       </g>
       <path class="radfig__organ" d="M202 168 C228 180 252 196 272 216" fill="none" stroke-width="16" stroke-linecap="round"/>
       <path class="radfig__finding" d="M202 168 C228 180 252 196 272 216" fill="none" stroke-width="20" stroke-linecap="round" opacity=".35"/>
       <circle class="radfig__bone" cx="224" cy="178" r="7"/>
       ${radLabel(120, 160, "盲腸")}
       ${radArrow(316, 150, 278, 192)}
       ${radLabel(322, 144, "腫大した虫垂（6mm超）", "start")}
       ${radArrow(188, 120, 218, 170)}
       ${radLabel(182, 114, "糞石", "end")}
       ${radLabel(200, 278, "まわりの脂肪が白く濁るのが「炎症の煙」なのだ")}`,
      "急性虫垂炎の模式図"
    );
  },

  gallbladder() {
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__organ">
         <path d="M120 92 C176 88 212 128 210 176 C208 220 176 244 142 238 C108 230 96 186 100 146 C103 116 106 94 120 92 Z" fill="none" stroke-width="13"/>
       </g>
       <g class="radfig__finding-soft" opacity=".45">
         <path d="M120 92 C176 88 212 128 210 176 C208 220 176 244 142 238 C108 230 96 186 100 146 C103 116 106 94 120 92 Z" fill="none" stroke-width="26"/>
       </g>
       <circle class="radfig__bone" cx="139" cy="106" r="11"/>
       ${radArrow(252, 108, 206, 140)}
       ${radLabel(258, 102, "壁肥厚（3mm超）", "start")}
       ${radArrow(86, 72, 128, 98)}
       ${radLabel(80, 66, "頸部に嵌頓した結石", "end")}
       ${radLabel(200, 278, "出口に石が詰まる → 胆嚢が腫れて壁が厚くなるのだ")}`,
      "急性胆嚢炎の模式図"
    );
  },

  ipmn() {
    return radSvg(
      `${radFilmBg()}
       <g class="radfig__organ">
         <path d="M48 140 C120 112 220 118 300 148 C330 160 348 174 360 190" fill="none" stroke-width="26" stroke-linecap="round" opacity=".5"/>
       </g>
       <path class="radfig__fluid" d="M70 142 C140 122 230 128 300 156" fill="none" stroke-width="7" stroke-linecap="round"/>
       <g class="radfig__fluid">
         <circle cx="138" cy="176" r="17"/><circle cx="162" cy="192" r="13"/>
         <circle cx="116" cy="196" r="12"/><circle cx="142" cy="208" r="10"/>
       </g>
       <path class="radfig__fluid" d="M138 176 L128 150" stroke-width="5"/>
       ${radArrow(96, 244, 126, 212)}
       ${radLabel(90, 250, "ブドウの房状の嚢胞", "end")}
       ${radArrow(256, 92, 232, 134)}
       ${radLabel(262, 86, "主膵管と交通している", "start")}
       ${radLabel(200, 276, "「膵管とつながる嚢胞」—— ここがIPMNの決め手なのだ")}`,
      "IPMNの模式図"
    );
  },

  // 図がまだ無い所見のための控えめなプレースホルダ
  placeholder() {
    return radSvg(
      `${radFilmBg()}
       <circle class="radfig__brain" cx="200" cy="146" r="64" opacity=".3"/>
       ${radLabel(200, 152, "図は準備中なのだ")}
       ${radLabel(200, 230, "文章と読影ポイントだけで先に公開しているのだ")}`,
      "図は準備中"
    );
  },
};
