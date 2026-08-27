/* =====================================================================
   AI円卓会議 — アプリ本体
   ---------------------------------------------------------------------
   依存なし・ビルドなしの素のJavaScript（IIFE / グローバル汚染なし）。
   council-data.js が定義する COUNCIL_AGENTS / COUNCIL_PHASES / COUNCIL_DEMO
   を利用します。

   モードは2つ:
     - 収録モード : 収録済みの20ラウンド討議を再生（APIキー不要）
     - ライブモード: 利用者自身のAPIキーで4社のモデルを実際に議論させる
   ===================================================================== */
(function () {
  "use strict";

  /* ================= ユーティリティ ================= */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function agentById(id) {
    return COUNCIL_AGENTS.find((a) => a.id === id) || COUNCIL_AGENTS[0];
  }

  function phaseOfRound(no, total) {
    const t = total || 20;
    // 収録データは20ラウンド前提。ラウンド数を変えた場合は比率で割り当てる。
    const p = no / t;
    if (p <= 7 / 20) return COUNCIL_PHASES[0];
    if (p <= 13 / 20) return COUNCIL_PHASES[1];
    return COUNCIL_PHASES[2];
  }

  /* ================= 状態 ================= */

  const state = {
    mode: "demo",          // "demo" | "live"
    demoIndex: 0,          // 収録データの何本目か
    session: null,         // { topic, question, rounds: [], final }
    totalRounds: 20,
    r: 0,                  // 次に再生するラウンドの index
    t: 0,                  // 次に再生する発言の index
    playing: false,
    speed: 1.5,
    token: 0,
    done: false,
    live: { running: false, abort: null }
  };

  const DEFAULT_CONFIG = {
    topic: "高度経済成長期の日本（1955–1973）",
    question: "この時代とは、いったい何だったのか。",
    rounds: 20,
    providers: {
      chatgpt: { on: true, key: "", model: "gpt-4o", base: "https://api.openai.com/v1" },
      claude:  { on: true, key: "", model: "claude-sonnet-4-5", base: "https://api.anthropic.com/v1" },
      gemini:  { on: true, key: "", model: "gemini-2.5-flash", base: "https://generativelanguage.googleapis.com/v1beta" },
      grok:    { on: true, key: "", model: "grok-4", base: "https://api.x.ai/v1" }
    }
  };

  const CONFIG_KEY = "ai-council-config";
  const THEME_KEY = "ai-council-theme";

  function loadConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      const saved = JSON.parse(raw);
      const cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
      cfg.topic = saved.topic || cfg.topic;
      cfg.question = saved.question || cfg.question;
      cfg.rounds = saved.rounds || cfg.rounds;
      Object.keys(cfg.providers).forEach((id) => {
        if (saved.providers && saved.providers[id]) {
          Object.assign(cfg.providers[id], saved.providers[id]);
        }
      });
      return cfg;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
  }

  function saveConfig(cfg) {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch (e) { /* 保存できなくても動く */ }
  }

  let config = loadConfig();

  /* ================= DOM 参照 ================= */

  const el = {};
  function cacheDom() {
    el.log = $("#log");
    el.topic = $("#topicText");
    el.question = $("#questionText");
    el.modeBadge = $("#modeBadge");
    el.roundNow = $("#roundNow");
    el.roundTotal = $("#roundTotal");
    el.phaseSteps = $("#phaseSteps");
    el.phaseGoal = $("#phaseGoal");
    el.accVal = $("#accVal");
    el.humVal = $("#humVal");
    el.accBar = $("#accBar");
    el.humBar = $("#humBar");
    el.spark = $("#spark");
    el.answer = $("#answerText");
    el.answerRound = $("#answerRound");
    el.roster = $("#roster");
    el.playBtn = $("#playBtn");
    el.nextBtn = $("#nextBtn");
    el.allBtn = $("#allBtn");
    el.resetBtn = $("#resetBtn");
    el.speedSel = $("#speedSel");
    el.progress = $("#progress");
    el.demoPick = $("#demoPick");
    el.demoSel = $("#demoSel");
    el.settings = $("#settings");
    el.liveStatus = $("#liveStatus");
  }

  /* ================= 参加者リスト ================= */

  function renderRoster() {
    el.roster.innerHTML = COUNCIL_AGENTS.map((a) => `
      <li class="roster__item" data-agent="${escapeHtml(a.id)}" style="--c:${escapeHtml(a.color)}">
        <span class="roster__mark">${escapeHtml(a.mark)}</span>
        <span class="roster__body">
          <span class="roster__name">${escapeHtml(a.name)}</span>
          <span class="roster__role">${escapeHtml(a.role)}</span>
          <span class="roster__trait">${escapeHtml(a.trait)}</span>
        </span>
      </li>`).join("");
  }

  function markSpeaking(agentId) {
    $$(".roster__item").forEach((li) => {
      li.classList.toggle("is-speaking", li.dataset.agent === agentId);
    });
  }

  /* ================= フェーズ表示 ================= */

  function renderPhaseSteps(currentPhaseNo) {
    el.phaseSteps.innerHTML = COUNCIL_PHASES.map((p) => `
      <li class="phase ${p.no === currentPhaseNo ? "is-now" : (p.no < currentPhaseNo ? "is-done" : "")}"
          style="--c:${escapeHtml(p.color)}">
        <span class="phase__no">PHASE ${p.no}</span>
        <span class="phase__name">${escapeHtml(p.name)}</span>
        <span class="phase__sub">${escapeHtml(p.subtitle)}</span>
      </li>`).join("");
    const p = COUNCIL_PHASES.find((x) => x.no === currentPhaseNo) || COUNCIL_PHASES[0];
    el.phaseGoal.textContent = p.goal;
  }

  /* ================= スコア表示 ================= */

  function completedRounds() {
    return state.session.rounds.slice(0, state.r).filter((r) => typeof r.accuracy === "number");
  }

  function updateScores() {
    const done = completedRounds();
    const last = done[done.length - 1];
    const acc = last ? last.accuracy : 0;
    const hum = last ? last.humanity : 0;
    el.accVal.textContent = acc;
    el.humVal.textContent = hum;
    el.accBar.style.width = acc + "%";
    el.humBar.style.width = hum + "%";
    renderSpark(done);
  }

  function renderSpark(done) {
    const W = 260, H = 76, pad = 6;
    const n = Math.max(state.totalRounds, 2);
    const x = (i) => pad + (W - pad * 2) * (i / (n - 1));
    const y = (v) => H - pad - (H - pad * 2) * (v / 100);
    const line = (key, color) => {
      if (!done.length) return "";
      const pts = done.map((r, i) => `${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" ");
      const dot = done.length
        ? `<circle cx="${x(done.length - 1).toFixed(1)}" cy="${y(done[done.length - 1][key]).toFixed(1)}" r="3.2" fill="${color}"/>`
        : "";
      return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"
                stroke-linejoin="round" stroke-linecap="round"/>${dot}`;
    };
    el.spark.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="スコアの推移">
        <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="currentColor" stroke-opacity=".18"/>
        <line x1="${pad}" y1="${pad}" x2="${W - pad}" y2="${pad}" stroke="currentColor" stroke-opacity=".08" stroke-dasharray="3 4"/>
        ${line("accuracy", "#4a8cff")}
        ${line("humanity", "#d97757")}
      </svg>`;
  }

  /* ================= ログ描画 ================= */

  function atBottom() {
    return el.log.scrollHeight - el.log.scrollTop - el.log.clientHeight < 120;
  }
  function scrollDown(force) {
    if (force || atBottom()) el.log.scrollTop = el.log.scrollHeight;
  }

  function renderRoundHeader(round) {
    const p = phaseOfRound(round.no, state.totalRounds);
    const div = document.createElement("div");
    div.className = "round-head";
    div.dataset.roundhead = round.no;
    div.style.setProperty("--c", p.color);
    div.innerHTML = `
      <span class="round-head__no">第${round.no}ラウンド</span>
      <span class="round-head__theme">${escapeHtml(round.theme || "")}</span>
      <span class="round-head__phase">PHASE ${p.no}・${escapeHtml(p.name)}</span>`;
    el.log.appendChild(div);
    scrollDown();
  }

  function createTurnNode(turn, roundNo) {
    const a = agentById(turn.by);
    const wrap = document.createElement("article");
    wrap.className = "msg";
    if (roundNo != null) wrap.dataset.round = roundNo;
    wrap.style.setProperty("--c", a.color);
    wrap.innerHTML = `
      <div class="msg__avatar" aria-hidden="true">${escapeHtml(a.mark)}</div>
      <div class="msg__body">
        <header class="msg__head">
          <span class="msg__name">${escapeHtml(a.name)}</span>
          <span class="msg__role">${escapeHtml(a.role)}</span>
          ${turn.tag ? `<span class="msg__tag">${escapeHtml(turn.tag)}</span>` : ""}
        </header>
        <p class="msg__text"></p>
      </div>`;
    el.log.appendChild(wrap);
    return $(".msg__text", wrap);
  }

  function renderTurnInstant(turn, roundNo) {
    const node = createTurnNode(turn, roundNo);
    node.textContent = turn.text;
    scrollDown();
  }

  async function typeTurn(turn, roundNo, token) {
    const node = createTurnNode(turn, roundNo);
    markSpeaking(turn.by);
    scrollDown();
    const text = String(turn.text || "");
    const step = Math.max(1, Math.round((34 * state.speed) / 30)); // 30fps で送る文字数
    let i = 0;
    while (i < text.length) {
      while (!state.playing) {                 // 一時停止中は待つ
        await sleep(90);
        if (token !== state.token) return false;
      }
      if (token !== state.token) return false;
      i = Math.min(text.length, i + step);
      node.textContent = text.slice(0, i);
      scrollDown();
      await sleep(1000 / 30);
    }
    return true;
  }

  /* ================= ラウンド確定 ================= */

  function commitRound(round) {
    const idx = state.session.rounds.indexOf(round);
    state.r = idx + 1;
    state.t = 0;
    el.roundNow.textContent = round.no;
    renderPhaseSteps(phaseOfRound(round.no, state.totalRounds).no);
    updateScores();
    el.answerRound.textContent = `第${round.no}ラウンド時点`;
    el.answer.textContent = round.answer || "";
    el.answer.classList.remove("is-flash");
    void el.answer.offsetWidth;
    el.answer.classList.add("is-flash");
    el.progress.value = Math.round((round.no / state.totalRounds) * 100);

    const card = document.createElement("div");
    card.className = "answer-inline";
    card.innerHTML = `
      <span class="answer-inline__label">第${round.no}ラウンド時点の答え</span>
      <p>${escapeHtml(round.answer || "")}</p>
      <span class="answer-inline__scores">
        <span class="chip chip--acc">正確さ ${escapeHtml(round.accuracy)}</span>
        <span class="chip chip--hum">人間らしさ ${escapeHtml(round.humanity)}</span>
      </span>`;
    el.log.appendChild(card);
    scrollDown();
  }

  function renderFinal() {
    const f = state.session.final;
    if (!f) return;
    markSpeaking(null);
    const div = document.createElement("section");
    div.className = "final";
    div.innerHTML = `
      <h2 class="final__title">${escapeHtml(f.title)}</h2>
      ${String(f.body).split("\n\n").map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
      <p class="final__meta">${escapeHtml(state.session.topic)}／全${state.session.rounds.length}ラウンド・
        発言 ${state.session.rounds.reduce((s, r) => s + r.turns.length, 0)} 回</p>`;
    el.log.appendChild(div);
    scrollDown(true);
    state.done = true;
  }

  /* ================= 収録モードの再生 ================= */

  async function runDemo() {
    const token = ++state.token;
    state.playing = true;
    updateControls();
    while (state.r < state.session.rounds.length) {
      const round = state.session.rounds[state.r];
      if (state.t === 0 && !$('[data-roundhead="' + round.no + '"]', el.log)) renderRoundHeader(round);
      while (state.t < round.turns.length) {
        const ok = await typeTurn(round.turns[state.t], round.no, token);
        if (!ok) return;
        state.t++;
        await sleep(320 / state.speed);
        if (token !== state.token) return;
      }
      commitRound(round);
      await sleep(700 / state.speed);
      if (token !== state.token) return;
    }
    renderFinal();
    state.playing = false;
    markSpeaking(null);
    updateControls();
  }

  function play() {
    if (state.done) return;
    if (state.mode === "live" && !state.live.running) return;  // ライブは開始/再開のみ設定から
    if (state.playing) { state.playing = false; updateControls(); return; }
    if (state.mode === "live") { state.playing = true; updateControls(); return; }
    runDemo();
  }

  // このラウンドを一気に表示して締める
  function skipRound() {
    if (state.mode !== "demo" || state.done) return;
    const round = state.session.rounds[state.r];
    if (!round) return;
    const wasPlaying = state.playing;
    state.token++;              // 進行中のタイピングを止める
    state.playing = false;
    $$('[data-round="' + round.no + '"]', el.log).forEach((n) => n.remove());
    if (!$('[data-roundhead="' + round.no + '"]', el.log)) renderRoundHeader(round);
    round.turns.forEach((t) => renderTurnInstant(t, round.no));
    state.t = round.turns.length;
    commitRound(round);
    markSpeaking(null);
    if (state.r >= state.session.rounds.length) { renderFinal(); updateControls(); return; }
    if (wasPlaying) runDemo(); else updateControls();
  }

  function showAll() {
    if (state.mode !== "demo") return;
    state.token++;
    state.playing = false;
    el.log.innerHTML = "";
    state.r = 0; state.t = 0; state.done = false;
    renderIntro();
    state.session.rounds.forEach((round) => {
      renderRoundHeader(round);
      round.turns.forEach((t) => renderTurnInstant(t, round.no));
      commitRound(round);
    });
    renderFinal();
    markSpeaking(null);
    updateControls();
    scrollDown(true);
  }

  function resetSession() {
    state.token++;
    state.playing = false;
    state.done = false;
    state.r = 0;
    state.t = 0;
    el.log.innerHTML = "";
    el.answer.textContent = "まだ何も決まっていません。議論を始めてください。";
    el.answerRound.textContent = "開始前";
    el.roundNow.textContent = "0";
    el.progress.value = 0;
    renderPhaseSteps(1);
    updateScores();
    markSpeaking(null);
    updateControls();
    renderIntro();
  }

  function renderIntro() {
    const div = document.createElement("div");
    div.className = "intro";
    div.innerHTML = `
      <p class="intro__q">${escapeHtml(state.session.question)}</p>
      <p class="intro__t">議題：${escapeHtml(state.session.topic)}</p>
      <p class="intro__d">
        ${escapeHtml(String(state.totalRounds))}ラウンド × ${COUNCIL_AGENTS.length}体。
        まず【正確さ】を上げ、次に【多角性】、最後に【人間らしさ・感情・心】を入れていきます。
      </p>
      ${state.mode === "demo" && state.session.note
        ? `<p class="intro__note">${escapeHtml(state.session.note)}</p>` : ""}`;
    el.log.appendChild(div);
  }

  function updateControls() {
    el.playBtn.textContent = state.playing ? "⏸ 一時停止" : (state.done ? "✓ 完了" : "▶ 議論を始める");
    el.playBtn.disabled = state.done;
    el.nextBtn.disabled = state.done || state.mode === "live";
    el.allBtn.disabled = state.mode === "live";
    el.modeBadge.textContent = state.mode === "live" ? "LIVE API" : "収録モード";
    el.modeBadge.className = "badge " + (state.mode === "live" ? "badge--live" : "badge--demo");
    if (el.demoPick) el.demoPick.hidden = state.mode === "live" || demoList().length < 2;
  }

  /* ================= ライブAPIモード ================= */

  function enabledProviders() {
    return COUNCIL_AGENTS.filter((a) => {
      const p = config.providers[a.id];
      return p && p.on && p.key.trim();
    });
  }

  async function callOpenAICompat(p, system, user, signal) {
    const res = await fetch(p.base.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + p.key.trim() },
      body: JSON.stringify({
        model: p.model,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        max_tokens: 700
      })
    });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text()).slice(0, 200));
    const j = await res.json();
    return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  }

  async function callAnthropic(p, system, user, signal) {
    const res = await fetch(p.base.replace(/\/+$/, "") + "/messages", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": p.key.trim(),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: p.model,
        max_tokens: 700,
        system: system,
        messages: [{ role: "user", content: user }]
      })
    });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text()).slice(0, 200));
    const j = await res.json();
    return (j.content || []).map((c) => c.text || "").join("").trim();
  }

  async function callGemini(p, system, user, signal) {
    const url = p.base.replace(/\/+$/, "") + "/models/" + encodeURIComponent(p.model) +
      ":generateContent?key=" + encodeURIComponent(p.key.trim());
    const res = await fetch(url, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 900 }
      })
    });
    if (!res.ok) throw new Error("HTTP " + res.status + " " + (await res.text()).slice(0, 200));
    const j = await res.json();
    const cand = (j.candidates && j.candidates[0]) || null;
    return (cand && cand.content && cand.content.parts || []).map((x) => x.text || "").join("").trim();
  }

  function callAgentApi(agentId, system, user, signal) {
    const p = config.providers[agentId];
    if (agentId === "claude") return callAnthropic(p, system, user, signal);
    if (agentId === "gemini") return callGemini(p, system, user, signal);
    return callOpenAICompat(p, system, user, signal);
  }

  function transcriptText(limit) {
    const lines = [];
    state.session.rounds.forEach((r) => {
      r.turns.forEach((t) => lines.push(agentById(t.by).name + "：" + t.text));
      if (r.answer) lines.push("（第" + r.no + "ラウンド時点の答え）" + r.answer);
    });
    return lines.slice(-(limit || 26)).join("\n");
  }

  function buildAgentPrompt(round, phase, spoken) {
    return [
      "議題：" + state.session.topic,
      "問い：" + state.session.question,
      "",
      "いまは第" + round.no + "／" + state.totalRounds + "ラウンド、PHASE " + phase.no + "「" + phase.name + "：" + phase.subtitle + "」です。",
      phase.instruction,
      "",
      "このラウンドのテーマ：" + round.theme,
      "",
      "【現時点の暫定解】",
      (state.session.currentAnswer || "（まだない）"),
      "",
      "【直近のやりとり】",
      (transcriptText(24) || "（まだ発言はありません）"),
      "",
      (spoken.length ? "このラウンドで既に発言した参加者：" + spoken.join("、") : "あなたがこのラウンドの最初の発言者です。"),
      "",
      "上を踏まえ、あなたの役割として日本語で発言してください。",
      "同じ内容の繰り返しは禁止。前の発言に具体的に応答し、議論を一歩進めてください。",
      "150〜220字程度。前置き・挨拶・自己紹介は不要。発言本文だけを書いてください。"
    ].join("\n");
  }

  function buildSynthPrompt(round) {
    return [
      "あなたは円卓会議の書記です。以下の議論を読み、JSONだけを出力してください。",
      "",
      "議題：" + state.session.topic,
      "問い：" + state.session.question,
      "現在：第" + round.no + "／" + state.totalRounds + "ラウンド（PHASE " + phaseOfRound(round.no, state.totalRounds).no + "）",
      "",
      "【このラウンドの発言】",
      round.turns.map((t) => agentById(t.by).name + "：" + t.text).join("\n"),
      "",
      "【前ラウンド時点の答え】",
      (state.session.currentAnswer || "（まだない）"),
      "",
      "次のJSONのみを出力（前後に説明やコードフェンスを付けない）：",
      '{"answer":"問いに対する現時点の答えを120〜200字で。前ラウンドより必ず精密または深くすること",' +
      '"accuracy":0から100の整数（事実としての正確さ）,' +
      '"humanity":0から100の整数（人間らしさ・感情・心の込もり具合）,' +
      '"next_theme":"次のラウンドで扱うべきテーマを20字以内で"}'
    ].join("\n");
  }

  function parseJsonLoose(text) {
    if (!text) return null;
    let s = String(text).trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a >= 0 && b > a) s = s.slice(a, b + 1);
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function liveLog(msg, isError) {
    el.liveStatus.hidden = false;
    el.liveStatus.className = "live-status" + (isError ? " is-error" : "");
    el.liveStatus.textContent = msg;
  }

  async function runLive() {
    const agents = enabledProviders();
    if (!agents.length) {
      liveLog("APIキーが1つも設定されていません。設定を開いてキーを入力してください。", true);
      return;
    }
    state.live.running = true;
    state.live.abort = new AbortController();
    const signal = state.live.abort.signal;
    state.playing = true;
    state.done = false;
    updateControls();

    const synth = agents.find((a) => a.id === "chatgpt") || agents[0];
    let nextTheme = "定義 — どこからどこまでを、その時代と呼ぶか";

    try {
      for (let n = 1; n <= state.totalRounds; n++) {
        const phase = phaseOfRound(n, state.totalRounds);
        const round = { no: n, phase: phase.no, theme: nextTheme, turns: [] };
        state.session.rounds.push(round);
        renderRoundHeader(round);

        // 発言順をラウンドごとに回す
        const order = agents.slice(n % agents.length).concat(agents.slice(0, n % agents.length));
        const spoken = [];
        for (const a of order) {
          while (!state.playing) { await sleep(150); if (signal.aborted) throw new Error("停止しました"); }
          liveLog(`第${n}ラウンド：${a.name} が考えています…`);
          markSpeaking(a.id);
          let text;
          try {
            text = await callAgentApi(a.id, a.persona + "\n\n" + phase.instruction,
              buildAgentPrompt(round, phase, spoken), signal);
          } catch (err) {
            if (signal.aborted) throw err;
            text = "（" + a.name + " の応答に失敗しました：" + err.message + "）";
            liveLog(a.name + " でエラー: " + err.message, true);
          }
          const turn = { by: a.id, text: (text || "").trim() || "（空の応答）" };
          round.turns.push(turn);
          renderTurnInstant(turn, round.no);
          spoken.push(a.name);
        }

        // 書記による統合とスコアづけ
        liveLog(`第${n}ラウンド：${synth.name} が答えを更新しています…`);
        let parsed = null;
        try {
          const raw = await callAgentApi(synth.id,
            "あなたは正確で簡潔な書記です。指示されたJSON以外は絶対に出力しません。",
            buildSynthPrompt(round), signal);
          parsed = parseJsonLoose(raw);
        } catch (err) {
          if (signal.aborted) throw err;
          liveLog("統合でエラー: " + err.message, true);
        }
        round.answer = (parsed && parsed.answer) || (state.session.currentAnswer || "（更新できませんでした）");
        round.accuracy = clamp100(parsed && parsed.accuracy, 40 + n * 2);
        round.humanity = clamp100(parsed && parsed.humanity, 10 + n * 4);
        state.session.currentAnswer = round.answer;
        if (parsed && parsed.next_theme) nextTheme = String(parsed.next_theme).slice(0, 40);
        commitRound(round);
      }

      state.session.final = {
        title: "ライブ議論の到達点",
        body: state.session.currentAnswer || ""
      };
      renderFinal();
      liveLog("全" + state.totalRounds + "ラウンドが終了しました。");
    } catch (err) {
      liveLog("中断しました：" + err.message, true);
    } finally {
      state.live.running = false;
      state.playing = false;
      markSpeaking(null);
      updateControls();
    }
  }

  function clamp100(v, fallback) {
    const n = Math.round(Number(v));
    if (!isFinite(n)) return Math.max(0, Math.min(100, Math.round(fallback)));
    return Math.max(0, Math.min(100, n));
  }

  /* ================= エクスポート ================= */

  function exportMarkdown() {
    const s = state.session;
    const lines = [];
    lines.push("# AI円卓会議：" + s.topic);
    lines.push("");
    lines.push("**問い：** " + s.question);
    lines.push("");
    lines.push("参加：" + COUNCIL_AGENTS.map((a) => a.name + "（" + a.role + "）").join(" / "));
    lines.push("");
    s.rounds.forEach((r) => {
      if (!r.turns.length) return;
      const p = phaseOfRound(r.no, state.totalRounds);
      lines.push("## 第" + r.no + "ラウンド — " + (r.theme || "") + "（PHASE " + p.no + "：" + p.name + "）");
      lines.push("");
      r.turns.forEach((t) => {
        lines.push("- **" + agentById(t.by).name + "**" + (t.tag ? "［" + t.tag + "］" : "") + "：" + t.text);
      });
      lines.push("");
      if (r.answer) {
        lines.push("> **第" + r.no + "ラウンド時点の答え：** " + r.answer);
        lines.push(">");
        lines.push("> 正確さ " + r.accuracy + " / 人間らしさ " + r.humanity);
        lines.push("");
      }
    });
    if (s.final) {
      lines.push("## " + s.final.title);
      lines.push("");
      lines.push(s.final.body);
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-council-" + String(s.topic || "session").replace(/[\\/:*?"<>|\s（）()]+/g, "_").slice(0, 40) + ".md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ================= 設定ダイアログ ================= */

  const PRESET_TOPICS = [
    ["高度経済成長期の日本（1955–1973）", "この時代とは、いったい何だったのか。"],
    ["バブル経済とその崩壊（1986–1991）", "あの熱狂は、私たちに何を残したのか。"],
    ["インターネット黎明期（1995–2005）", "あの十年は、人間の何を変えたのか。"],
    ["戦国時代の日本（1467–1600）", "あの乱世を生きるとは、どういうことだったのか。"],
    ["産業革命期のイギリス（1760–1840）", "機械は人間を、どこへ連れて行ったのか。"],
    ["生成AIの時代（2022–）", "いま私たちは、何のただ中にいるのか。"]
  ];

  function openSettings() {
    config = loadConfig();
    const rows = COUNCIL_AGENTS.map((a) => {
      const p = config.providers[a.id];
      return `
      <div class="prov" style="--c:${escapeHtml(a.color)}">
        <label class="prov__head">
          <input type="checkbox" data-p="${escapeHtml(a.id)}" data-f="on" ${p.on ? "checked" : ""} />
          <span class="prov__mark">${escapeHtml(a.mark)}</span>
          <span class="prov__name">${escapeHtml(a.name)}</span>
          <span class="prov__role">${escapeHtml(a.role)}</span>
        </label>
        <div class="prov__grid">
          <label>APIキー
            <input type="password" data-p="${escapeHtml(a.id)}" data-f="key" value="${escapeHtml(p.key)}"
                   placeholder="${escapeHtml(a.id === "gemini" ? "AIza…" : (a.id === "claude" ? "sk-ant-…" : "sk-…"))}" autocomplete="off" />
          </label>
          <label>モデル名
            <input type="text" data-p="${escapeHtml(a.id)}" data-f="model" value="${escapeHtml(p.model)}" />
          </label>
          <label class="prov__base">エンドポイント
            <input type="text" data-p="${escapeHtml(a.id)}" data-f="base" value="${escapeHtml(p.base)}" />
          </label>
        </div>
      </div>`;
    }).join("");

    el.settings.innerHTML = `
      <form method="dialog" class="dlg">
        <h2 class="dlg__title">会議の設定</h2>

        <section class="dlg__sec">
          <h3>議題（時代）</h3>
          <label class="dlg__field">テーマ
            <input type="text" id="cfgTopic" value="${escapeHtml(config.topic)}" />
          </label>
          <label class="dlg__field">問い
            <input type="text" id="cfgQuestion" value="${escapeHtml(config.question)}" />
          </label>
          <div class="presets">${PRESET_TOPICS.map((t, i) =>
            `<button type="button" class="preset" data-i="${i}">${escapeHtml(t[0])}</button>`).join("")}</div>
          <label class="dlg__field">ラウンド数（各AIの発言回数）
            <input type="number" id="cfgRounds" min="1" max="30" value="${escapeHtml(config.rounds)}" />
          </label>
        </section>

        <section class="dlg__sec">
          <h3>ライブAPIモード</h3>
          <p class="dlg__note">
            自分のAPIキーを入れると、4社のモデルが実際に議論します。キーはこのブラウザの
            localStorage にのみ保存され、どこへも送信されません（各社のAPIエンドポイントを除く）。
            共用のパソコンでは使わないでください。ブラウザから直接呼ぶため、各社側でCORSが
            許可されている必要があります。
          </p>
          ${rows}
        </section>

        <footer class="dlg__foot">
          <button type="button" class="btn btn--ghost" id="cfgClear">キーを消去</button>
          <span class="spacer"></span>
          <button type="button" class="btn btn--ghost" id="cfgCancel">閉じる</button>
          <button type="button" class="btn" id="cfgDemo">収録モードで見る</button>
          <button type="button" class="btn btn--primary" id="cfgStart">ライブ会議を始める</button>
        </footer>
      </form>`;

    $$(".preset", el.settings).forEach((b) => b.addEventListener("click", () => {
      const t = PRESET_TOPICS[Number(b.dataset.i)];
      $("#cfgTopic", el.settings).value = t[0];
      $("#cfgQuestion", el.settings).value = t[1];
    }));

    $("#cfgCancel", el.settings).addEventListener("click", () => el.settings.close());
    $("#cfgClear", el.settings).addEventListener("click", () => {
      $$('input[data-f="key"]', el.settings).forEach((i) => { i.value = ""; });
    });
    $("#cfgDemo", el.settings).addEventListener("click", () => {
      readSettings();
      el.settings.close();
      startDemo(state.demoIndex);
    });
    $("#cfgStart", el.settings).addEventListener("click", () => {
      readSettings();
      if (!enabledProviders().length) {
        liveLog("APIキーが未入力です。少なくとも1つ入力してください。", true);
        return;
      }
      el.settings.close();
      startLive();
    });

    if (typeof el.settings.showModal === "function") el.settings.showModal();
    else el.settings.setAttribute("open", "");
  }

  function readSettings() {
    config.topic = $("#cfgTopic", el.settings).value.trim() || DEFAULT_CONFIG.topic;
    config.question = $("#cfgQuestion", el.settings).value.trim() || DEFAULT_CONFIG.question;
    config.rounds = Math.max(1, Math.min(30, Number($("#cfgRounds", el.settings).value) || 20));
    $$("input[data-p]", el.settings).forEach((input) => {
      const p = config.providers[input.dataset.p];
      if (!p) return;
      p[input.dataset.f] = input.type === "checkbox" ? input.checked : input.value.trim();
    });
    saveConfig(config);
  }

  /* ================= セッション開始 ================= */

  // 収録データの一覧（council-data*.js が登録する）
  function demoList() {
    return (window.COUNCIL_DEMOS && window.COUNCIL_DEMOS.length)
      ? window.COUNCIL_DEMOS
      : [COUNCIL_DEMO];
  }

  function renderDemoPicker() {
    const list = demoList();
    if (!el.demoSel) return;
    el.demoSel.innerHTML = list.map((d, i) =>
      `<option value="${i}"${i === state.demoIndex ? " selected" : ""}>${escapeHtml(d.topic)}</option>`).join("");
    // 収録が1本しかないときは選ぶ意味がないので隠す
    el.demoPick.hidden = list.length < 2 || state.mode === "live";
  }

  function startDemo(index) {
    if (state.live.abort) state.live.abort.abort();
    const list = demoList();
    state.demoIndex = Math.max(0, Math.min(list.length - 1, Number(index) || 0));
    state.mode = "demo";
    const demo = list[state.demoIndex];
    state.totalRounds = demo.rounds.length;
    state.session = JSON.parse(JSON.stringify(demo));
    el.topic.textContent = state.session.topic;
    el.question.textContent = state.session.question;
    el.roundTotal.textContent = state.totalRounds;
    el.liveStatus.hidden = true;
    renderDemoPicker();
    resetSession();
  }

  function startLive() {
    if (state.live.abort) state.live.abort.abort();
    state.mode = "live";
    state.totalRounds = config.rounds;
    state.session = {
      topic: config.topic,
      question: config.question,
      rounds: [],
      currentAnswer: "",
      final: null
    };
    el.topic.textContent = state.session.topic;
    el.question.textContent = state.session.question;
    el.roundTotal.textContent = state.totalRounds;
    resetSession();
    runLive();
  }

  /* ================= テーマ（配色） ================= */

  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* noop */ }
    $("#themeToggle").textContent = t === "light" ? "🌙" : "☀️";
  }

  /* ================= 初期化 ================= */

  function init() {
    cacheDom();
    renderRoster();
    renderPhaseSteps(1);

    let saved = "dark";
    try { saved = localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { /* noop */ }
    applyTheme(saved);

    startDemo(0);

    el.demoSel.addEventListener("change", () => startDemo(el.demoSel.value));
    el.playBtn.addEventListener("click", play);
    el.nextBtn.addEventListener("click", skipRound);
    el.allBtn.addEventListener("click", showAll);
    el.resetBtn.addEventListener("click", () => {
      if (state.mode === "live" && state.live.abort) state.live.abort.abort();
      if (state.mode === "live") startLive(); else startDemo(state.demoIndex);
    });
    el.speedSel.addEventListener("change", () => { state.speed = Number(el.speedSel.value); });
    $("#settingsBtn").addEventListener("click", openSettings);
    $("#exportBtn").addEventListener("click", exportMarkdown);
    $("#themeToggle").addEventListener("click", () => {
      applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
    });

    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea, select")) return;
      if (e.code === "Space") { e.preventDefault(); play(); }
      if (e.code === "ArrowRight") { e.preventDefault(); skipRound(); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
