/* =========================================================================
 * NurseTube 図解ライブラリ（FIGURES）なのだ
 * 各番組のスライドに表示する模式図(SVG)を定義しているのだ。
 *  - 解剖図・断層像(CT/MRI風)などをコードで描いているので、軽くて拡大に強いのだ。
 *  - CT/MRI風の図は「学習用イメージ(模式図)」で、実際の患者画像ではないのだ。
 *  - 本物のCT/MRI写真を使いたい場合は images/ に置いて images/manifest.js に登録するのだ
 *    （その番組のシーンでは写真が図解より優先表示されるのだ。手順は images/README.md）。
 *
 * SCENE_FIGURES で「番組ID-シーン番号」→図解名 を割り当てているのだ。
 * ========================================================================= */

const FIGURES = {
  // ---- 心臓の4つの部屋（拍動アニメ＋血流の色） ----
  heart() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="心臓の4つの部屋の模式図">
      <rect class="fig__bg" width="400" height="300" rx="14"/>
      <g class="fig-pulse">
        <rect x="62" y="56" width="128" height="80" rx="10" fill="#cfe8ff" stroke="#1b5e9b" stroke-width="2.5"/>
        <rect x="210" y="56" width="128" height="80" rx="10" fill="#ffd9d9" stroke="#b23a3a" stroke-width="2.5"/>
        <rect x="62" y="150" width="128" height="92" rx="10" fill="#9fd0ff" stroke="#1b5e9b" stroke-width="2.5"/>
        <rect x="210" y="150" width="128" height="92" rx="10" fill="#ff9d9d" stroke="#b23a3a" stroke-width="2.5"/>
        <line x1="200" y1="52" x2="200" y2="246" stroke="#ffffff" stroke-width="4"/>
      </g>
      <g text-anchor="middle" fill="#13314a">
        <text x="126" y="92" font-size="16" font-weight="700">右心房</text>
        <text x="274" y="92" font-size="16" font-weight="700">左心房</text>
        <text x="126" y="198" font-size="16" font-weight="700">右心室</text>
        <text x="274" y="198" font-size="16" font-weight="700">左心室</text>
      </g>
      <g class="fig-flow">
        <polygon points="120,138 132,138 126,150" fill="#1b5e9b"/>
        <polygon points="268,138 280,138 274,150" fill="#b23a3a"/>
      </g>
      <text x="200" y="286" text-anchor="middle" font-size="12.5" fill="#13314a">青＝酸素が少ない血　／　赤＝酸素が多い血</text>
    </svg>`;
  },

  // ---- ネフロン（糸球体＋尿細管） ----
  nephron() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="ネフロンの模式図">
      <rect class="fig__bg" width="400" height="300" rx="14"/>
      <circle cx="82" cy="96" r="30" fill="#ffe6b0" stroke="#c98a1a" stroke-width="2.5"/>
      <path d="M66 96 q8 -14 16 0 q8 14 16 0" fill="none" stroke="#d4791a" stroke-width="3.5"/>
      <text x="82" y="150" text-anchor="middle" font-size="14" font-weight="700" fill="#13314a">糸球体</text>
      <path d="M112 96 C175 96 150 150 210 150 C250 150 250 235 215 235 C188 235 200 120 300 120 L300 250"
            fill="none" stroke="#7fb3e0" stroke-width="11" stroke-linecap="round"/>
      <text x="300" y="272" text-anchor="middle" font-size="13" font-weight="700" fill="#13314a">尿</text>
      <text x="208" y="142" text-anchor="middle" font-size="12" fill="#13314a">尿細管</text>
      <text x="215" y="222" text-anchor="middle" font-size="11" fill="#13314a">ヘンレループ</text>
      <g class="fig-flow">
        <polygon points="150,160 162,168 149,172" fill="#1b7a3a"/>
        <polygon points="262,118 274,110 274,124" fill="#1b7a3a"/>
      </g>
      <text x="270" y="96" font-size="12.5" font-weight="700" fill="#1b7a3a">再吸収</text>
      <text x="270" y="170" font-size="11.5" fill="#1b7a3a">水・Na・糖</text>
      <text x="20" y="26" font-size="12.5" fill="#13314a">ろ過 → 再吸収 → 尿</text>
    </svg>`;
  },

  // ---- 呼吸（肺・横隔膜の動き） ----
  lungs() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="肺と横隔膜の模式図">
      <rect class="fig__bg" width="400" height="300" rx="14"/>
      <rect x="190" y="36" width="20" height="64" rx="6" fill="#bcd" stroke="#456" stroke-width="2"/>
      <path d="M200 96 L150 120 M200 96 L250 120" stroke="#456" stroke-width="6" stroke-linecap="round"/>
      <g class="fig-breathe">
        <path d="M150 110 C110 120 105 210 150 232 C175 244 178 150 168 120 Z" fill="#ffc1cf" stroke="#c25" stroke-width="2.5"/>
        <path d="M250 110 C290 120 295 210 250 232 C225 244 222 150 232 120 Z" fill="#ffc1cf" stroke="#c25" stroke-width="2.5"/>
      </g>
      <path class="fig-dia" d="M120 246 Q200 276 280 246" fill="none" stroke="#7a4" stroke-width="7" stroke-linecap="round"/>
      <g text-anchor="middle" fill="#13314a">
        <text x="226" y="70" font-size="13" font-weight="700">気管</text>
        <text x="135" y="180" font-size="14" font-weight="700">肺</text>
        <text x="200" y="292" font-size="12.5" font-weight="700" fill="#3a6a1f">横隔膜（吸気で下がる）</text>
      </g>
    </svg>`;
  },

  // ---- 自律神経（交感／副交感の対比） ----
  autonomic() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="自律神経の交感・副交感の対比">
      <rect class="fig__bg" width="400" height="300" rx="14"/>
      <rect x="22" y="40" width="166" height="226" rx="12" fill="#ffe2de" stroke="#c0392b" stroke-width="2.5"/>
      <rect x="212" y="40" width="166" height="226" rx="12" fill="#dcecff" stroke="#1b5e9b" stroke-width="2.5"/>
      <text x="105" y="70" text-anchor="middle" font-size="16" font-weight="700" fill="#9e2b20">交感神経</text>
      <text x="295" y="70" text-anchor="middle" font-size="16" font-weight="700" fill="#13507f">副交感神経</text>
      <text x="105" y="92" text-anchor="middle" font-size="12" fill="#9e2b20">活動・緊張モード</text>
      <text x="295" y="92" text-anchor="middle" font-size="12" fill="#13507f">休息・回復モード</text>
      <g text-anchor="middle" font-size="14" fill="#3a2522">
        <text x="105" y="132">心拍 ▲</text><text x="105" y="166">血圧 ▲</text>
        <text x="105" y="200">瞳孔 散大</text><text x="105" y="234">消化 ▼</text>
      </g>
      <g text-anchor="middle" font-size="14" fill="#13314a">
        <text x="295" y="132">心拍 ▼</text><text x="295" y="166">血圧 ▼</text>
        <text x="295" y="200">瞳孔 縮小</text><text x="295" y="234">消化 ▲</text>
      </g>
    </svg>`;
  },

  // ---- 内分泌（視床下部→下垂体→各腺） ----
  endocrine() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="ホルモン分泌の流れ">
      <rect class="fig__bg" width="400" height="300" rx="14"/>
      <g text-anchor="middle">
        <rect x="120" y="30" width="160" height="40" rx="9" fill="#e7d8ff" stroke="#6a3fb0" stroke-width="2"/>
        <text x="200" y="56" font-size="15" font-weight="700" fill="#3d206e">視床下部</text>
        <rect x="120" y="96" width="160" height="40" rx="9" fill="#d8e6ff" stroke="#2f5fa0" stroke-width="2"/>
        <text x="200" y="122" font-size="15" font-weight="700" fill="#1d3c66">下垂体</text>
        <rect x="40" y="170" width="100" height="38" rx="9" fill="#d9f3e1" stroke="#2f8a4e" stroke-width="2"/>
        <text x="90" y="194" font-size="13" font-weight="700" fill="#1d5e34">甲状腺</text>
        <rect x="150" y="170" width="100" height="38" rx="9" fill="#d9f3e1" stroke="#2f8a4e" stroke-width="2"/>
        <text x="200" y="194" font-size="13" font-weight="700" fill="#1d5e34">副腎</text>
        <rect x="260" y="170" width="100" height="38" rx="9" fill="#d9f3e1" stroke="#2f8a4e" stroke-width="2"/>
        <text x="310" y="194" font-size="13" font-weight="700" fill="#1d5e34">膵臓</text>
      </g>
      <g stroke="#6a6f78" stroke-width="2.5" class="fig-flow">
        <line x1="200" y1="70" x2="200" y2="94"/>
        <line x1="170" y1="136" x2="95" y2="168"/>
        <line x1="200" y1="136" x2="200" y2="168"/>
        <line x1="230" y1="136" x2="305" y2="168"/>
      </g>
      <text x="200" y="252" text-anchor="middle" font-size="13" font-weight="700" fill="#13314a">ホルモン → 標的器官へ</text>
      <text x="200" y="276" text-anchor="middle" font-size="11.5" fill="#13314a">出すぎ＝亢進 ／ 足りない＝低下</text>
    </svg>`;
  },

  // ---- バイタルサイン（モニター風） ----
  vitals() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="バイタルサインの正常値">
      <rect width="400" height="300" rx="14" fill="#0d1622"/>
      <path class="ecg-line" d="M16 70 H120 l10 0 l8 -34 l10 60 l8 -26 H210 l10 0 l8 -34 l10 60 l8 -26 H384"
            fill="none" stroke="#39e08a" stroke-width="3"/>
      <g font-family="inherit">
        <text x="20" y="120" font-size="13" fill="#9fb3c8">体温</text>
        <text x="20" y="146" font-size="20" font-weight="700" fill="#fff">36〜37 ℃</text>
        <text x="210" y="120" font-size="13" fill="#9fb3c8">脈拍</text>
        <text x="210" y="146" font-size="20" font-weight="700" fill="#46d18a">60〜100 /分</text>
        <text x="20" y="190" font-size="13" fill="#9fb3c8">呼吸</text>
        <text x="20" y="216" font-size="20" font-weight="700" fill="#fff">12〜20 /分</text>
        <text x="210" y="190" font-size="13" fill="#9fb3c8">血圧</text>
        <text x="210" y="216" font-size="20" font-weight="700" fill="#fff">120/80 mmHg</text>
        <text x="20" y="260" font-size="13" fill="#9fb3c8">SpO₂</text>
        <text x="20" y="286" font-size="20" font-weight="700" fill="#46c7d1">96〜99 %</text>
      </g>
    </svg>`;
  },

  // ---- 心電図（PQRST） ----
  ecg() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="正常な心電図の波形">
      <rect width="400" height="300" rx="14" fill="#0d1622"/>
      <g stroke="#16324a" stroke-width="1">
        <line x1="0" y1="80" x2="400" y2="80"/><line x1="0" y1="150" x2="400" y2="150"/>
        <line x1="0" y1="220" x2="400" y2="220"/>
        <line x1="100" y1="0" x2="100" y2="300"/><line x1="200" y1="0" x2="200" y2="300"/>
        <line x1="300" y1="0" x2="300" y2="300"/>
      </g>
      <path class="ecg-line" d="M10 150 H70 q10 0 16 -16 q6 16 16 16 H150 l8 14 l10 -90 l10 110 l8 -34 H250 q12 0 20 -22 q8 22 20 22 H390"
            fill="none" stroke="#39e08a" stroke-width="3"/>
      <g fill="#bfe9d2" font-size="13" font-weight="700" text-anchor="middle">
        <text x="93" y="120">P</text>
        <text x="178" y="58">R</text>
        <text x="168" y="190">Q</text>
        <text x="190" y="190">S</text>
        <text x="278" y="120">T</text>
      </g>
      <text x="200" y="288" text-anchor="middle" font-size="12.5" fill="#9fb3c8">正常洞調律：P → QRS → T が規則正しく出る</text>
    </svg>`;
  },

  // ---- 頭部CT風（脳梗塞：低吸収域） ----
  brainCT() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="頭部CT風の模式図（脳梗塞）">
      <rect width="400" height="300" fill="#000"/>
      <ellipse cx="200" cy="150" rx="118" ry="138" fill="#1a1a1d" stroke="#cfcfcf" stroke-width="7"/>
      <ellipse cx="200" cy="150" rx="104" ry="124" fill="url(#ctg)"/>
      <defs><radialGradient id="ctg" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#7a7a7e"/><stop offset="100%" stop-color="#3a3a3d"/>
      </radialGradient></defs>
      <path d="M188 96 q12 -16 24 0 q4 40 0 108 q-12 16 -24 0 q-4 -54 0 -108Z" fill="#171719"/>
      <path d="M196 110 q8 -8 0 80" stroke="#000" stroke-width="2" fill="none"/>
      <g>
        <ellipse cx="250" cy="120" rx="34" ry="26" fill="#202024" stroke="#ffd54a" stroke-width="2.5" stroke-dasharray="6 5" class="fig-flow"/>
        <text x="250" y="124" text-anchor="middle" font-size="12" font-weight="700" fill="#ffd54a">梗塞巣</text>
        <text x="250" y="140" text-anchor="middle" font-size="10.5" fill="#ffd54a">低吸収域</text>
      </g>
      <text x="38" y="150" font-size="14" font-weight="700" fill="#e6e6e6">R</text>
      <text x="352" y="150" font-size="14" font-weight="700" fill="#e6e6e6">L</text>
      <text x="200" y="292" text-anchor="middle" font-size="12" fill="#9aa">頭部CT（学習用イメージ・模式図）</text>
    </svg>`;
  },

  // ---- 頭部MRI風（急性期：拡散強調で高信号） ----
  brainMRI() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="頭部MRI風の模式図（急性期病変）">
      <rect width="400" height="300" fill="#000"/>
      <ellipse cx="200" cy="150" rx="116" ry="136" fill="#101012" stroke="#8a8a8a" stroke-width="4"/>
      <ellipse cx="200" cy="150" rx="104" ry="124" fill="url(#mrg)"/>
      <defs><radialGradient id="mrg" cx="50%" cy="45%" r="62%">
        <stop offset="0%" stop-color="#9aa0a6"/><stop offset="100%" stop-color="#54585d"/>
      </radialGradient></defs>
      <path d="M186 98 q14 -16 28 0 q5 42 0 104 q-14 16 -28 0 q-5 -52 0 -104Z" fill="#d7dbe0"/>
      <ellipse cx="248" cy="124" rx="30" ry="23" fill="#f2f5f8" stroke="#3ad1ff" stroke-width="2.5" stroke-dasharray="6 5" class="fig-flow"/>
      <text x="248" y="120" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0b6f8c">急性期</text>
      <text x="248" y="136" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0b6f8c">高信号</text>
      <text x="38" y="150" font-size="14" font-weight="700" fill="#e6e6e6">R</text>
      <text x="352" y="150" font-size="14" font-weight="700" fill="#e6e6e6">L</text>
      <text x="200" y="292" text-anchor="middle" font-size="12" fill="#9aa">頭部MRI（学習用イメージ・模式図）</text>
    </svg>`;
  },

  // ---- 胸部CT風（COPD：含気の多い肺野） ----
  chestCT() {
    return `<svg viewBox="0 0 400 300" class="fig" role="img" aria-label="胸部CT風の模式図">
      <rect width="400" height="300" fill="#000"/>
      <ellipse cx="200" cy="155" rx="150" ry="120" fill="#161618" stroke="#cfcfcf" stroke-width="7"/>
      <ellipse cx="130" cy="150" rx="58" ry="86" fill="#050506" stroke="#3a3a3d" stroke-width="2"/>
      <ellipse cx="270" cy="150" rx="58" ry="86" fill="#050506" stroke="#3a3a3d" stroke-width="2"/>
      <ellipse cx="200" cy="150" rx="30" ry="50" fill="#6e6e72"/>
      <text x="200" y="146" text-anchor="middle" font-size="11" fill="#0c0c0c" font-weight="700">心臓</text>
      <text x="200" y="160" text-anchor="middle" font-size="10" fill="#0c0c0c">縦隔</text>
      <circle cx="200" cy="232" r="14" fill="#e8e8ea"/>
      <text x="200" y="236" text-anchor="middle" font-size="9" fill="#222">椎体</text>
      <g class="fig-flow">
        <text x="130" y="150" text-anchor="middle" font-size="13" font-weight="700" fill="#5fd0ff">肺野</text>
        <text x="270" y="150" text-anchor="middle" font-size="13" font-weight="700" fill="#5fd0ff">肺野</text>
      </g>
      <text x="200" y="292" text-anchor="middle" font-size="12" fill="#9aa">胸部CT（学習用イメージ・模式図）</text>
    </svg>`;
  },
};

/* 「番組ID-シーン番号」→ 図解名 の割り当てなのだ。
 * ここに無いシーンは図解なし（文字中心）で表示されるのだ。 */
const SCENE_FIGURES = {
  // 心臓
  "anat01-1": "heart", "anat01-2": "heart", "anat01-3": "heart", "anat01-4": "heart", "anat01-5": "heart",
  // 腎臓
  "anat02-1": "nephron", "anat02-2": "nephron", "anat02-3": "nephron", "anat02-4": "nephron", "anat02-5": "nephron",
  // 呼吸
  "anat03-1": "lungs", "anat03-2": "lungs", "anat03-3": "lungs", "anat03-4": "lungs",
  // 自律神経
  "anat04-1": "autonomic", "anat04-2": "autonomic", "anat04-3": "autonomic", "anat04-4": "autonomic",
  // ホルモン
  "anat05-1": "endocrine", "anat05-2": "endocrine", "anat05-3": "endocrine", "anat05-4": "endocrine",
  // バイタル
  "base01-1": "vitals", "base01-2": "vitals", "base01-3": "vitals", "base01-4": "vitals",
  // 心不全
  "dis01-1": "heart", "dis01-2": "heart", "dis01-3": "heart", "dis01-4": "heart",
  // 脳梗塞（CTとMRIを両方つかうのだ）
  "dis03-1": "brainCT", "dis03-2": "brainCT", "dis03-3": "brainMRI", "dis03-4": "brainMRI",
  // COPD
  "dis04-1": "chestCT", "dis04-2": "chestCT", "dis04-3": "chestCT", "dis04-4": "chestCT",
  // 心電図
  "exam03-1": "ecg", "exam03-2": "ecg", "exam03-3": "ecg", "exam03-4": "ecg",
};
