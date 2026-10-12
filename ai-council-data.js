/* =========================================================================
   AI Council（AI四賢者会議）— 共通データ定義
   -------------------------------------------------------------------------
   ここでは「議論に参加する4つのAI」と「議論のフェーズ」を定義します。
   各時代の台本は ai-council-era-*.js が AICouncil.addEra() で登録します。

   ⚠ 重要：本アプリの発言はすべて、各AIの「作風」をイメージした創作（脚本）
      です。実在の ChatGPT / Claude / Gemini / Grok の出力ではありません。
   ========================================================================= */
"use strict";

const AICouncil = {
  /* ---- 参加者（作風をイメージした架空のキャラクター） ---- */
  agents: [
    {
      id: "gpt",
      name: "ChatGPT",
      tag: "整理役",
      color: "#10a37f",
      mark: "◎",
      style: "論点を構造化し、抜けと重複をなくす。まず枠組みを作る。"
    },
    {
      id: "claude",
      name: "Claude",
      tag: "慎重役",
      color: "#d97757",
      mark: "✳",
      style: "確からしさの度合いを区別し、断定を避ける。倫理と当事者性に敏感。"
    },
    {
      id: "gemini",
      name: "Gemini",
      tag: "俯瞰役",
      color: "#4285f4",
      mark: "◆",
      style: "数値・統計・同時代の世界と比較する。地図とグラフで考える。"
    },
    {
      id: "grok",
      name: "Grok",
      tag: "挑発役",
      color: "#a855f7",
      mark: "✦",
      style: "きれいごとを剥がす。皮肉とユーモアで、誰も言わない本音を置く。"
    },
    {
      id: "zunda",
      name: "ずんだもん",
      tag: "司会",
      color: "#5cb96b",
      mark: "▶",
      style: "議事を進行し、そのラウンドで何が動いたかを一言でまとめるのだ。"
    }
  ],

  /* ---- 議論の3フェーズ（20ラウンドを3段階に分ける） ---- */
  phases: [
    {
      id: 0,
      name: "第1相：事実の精査",
      short: "事実",
      range: [1, 7],
      color: "#4285f4",
      desc: "年代・数字・史料の確からしさを詰める。まず「正確さ」を上げる段階。"
    },
    {
      id: 1,
      name: "第2相：解釈と反証",
      short: "解釈",
      range: [8, 13],
      color: "#f0a500",
      desc: "英雄史観・通説を疑い、周縁の視点と世界の同時代を重ねる段階。"
    },
    {
      id: 2,
      name: "第3相：人間らしさ・心",
      short: "心",
      range: [14, 20],
      color: "#e0518a",
      desc: "そこに生きた人の肉声・感情・死生観へ降りていく。「心」を入れる段階。"
    }
  ],

  /* ---- スコアの意味 ---- */
  meters: [
    { key: "fact", label: "正確さ", color: "#4285f4", desc: "事実・数字・史料批判の厳密さ" },
    { key: "view", label: "多面性", color: "#f0a500", desc: "視点の数と、通説への反証の強さ" },
    { key: "heart", label: "人間らしさ", color: "#e0518a", desc: "感情・肉声・当事者への近さ" }
  ],

  /* ---- 時代の台本（era ファイルから登録される） ---- */
  eras: [],

  addEra(era) {
    this.eras.push(era);
    return era;
  },

  getEra(id) {
    return this.eras.find(e => e.id === id) || null;
  },

  getAgent(id) {
    return this.agents.find(a => a.id === id) || null;
  },

  /* ラウンド番号(1始まり)からフェーズを返す */
  phaseOf(round) {
    return this.phases.find(p => round >= p.range[0] && round <= p.range[1]) || this.phases[0];
  }
};
