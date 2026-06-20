/* =========================================================================
 * NurseTube（ナースチューブ）アプリ本体
 * 〜 ずんだもんが看護を解説してくれる勉強用YouTubeなのだ 〜
 * 依存：data.js（CATEGORIES, PROGRAMS, EXAM_DATE, PRESENTER）, scenes.js（SCENES）
 * ルーティングはURLハッシュで管理：
 *   #/                       … ホーム（すべて）
 *   #/category/<カテゴリ>     … カテゴリ絞り込み
 *   #/search/<キーワード>     … 検索結果
 *   #/watch/<番組ID>          … 視聴ページ（スライド自動再生）
 * ========================================================================= */
(function () {
  "use strict";

  // ずんだもんカラー（アバター用の枝豆グリーンなのだ）
  const ZUNDA_GREEN = "#5cb96b";

  // ----------------------- DOM参照 -----------------------
  const main = document.getElementById("main");
  const categoryList = document.getElementById("categoryList");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const examCountdown = document.getElementById("examCountdown");

  // いま再生中のレッスン（ページ遷移時に停止するために保持）
  let activeLesson = null;

  // ----------------------- ユーティリティ -----------------------
  const byId = (id) => PROGRAMS.find((p) => p.id === id);
  const catOf = (key) => CATEGORIES.find((c) => c.key === key);
  const scenesOf = (id) => (typeof SCENES !== "undefined" && SCENES[id]) ? SCENES[id] : null;
  const ytSearchUrl = (p) =>
    "https://www.youtube.com/results?search_query=" + encodeURIComponent("看護 " + p.title);

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function formatViews(n) {
    if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "") + "万";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "千";
    return String(n);
  }

  function formatDuration(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const mm = h ? String(m).padStart(2, "0") : String(m);
    return (h ? h + ":" : "") + mm + ":" + String(s).padStart(2, "0");
  }

  function relativeDate(dateStr) {
    const then = new Date(dateStr + "T00:00:00");
    const now = new Date();
    const days = Math.round((now - then) / 86400000);
    if (days < 0) return "公開予定";
    if (days === 0) return "今日";
    if (days < 7) return days + "日前";
    if (days < 31) return Math.floor(days / 7) + "週間前";
    if (days < 365) return Math.floor(days / 30) + "か月前";
    return Math.floor(days / 365) + "年前";
  }

  // hexを暗く／明るくする
  function shade(hex, percent) {
    const n = parseInt(hex.replace("#", ""), 16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const mix = (c) => Math.round((t - c) * p + c);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  }

  // 番組サムネイル（CSSグラデーション＋タイトル）を生成
  function thumbHtml(p, opts = {}) {
    const c = catOf(p.category) || { color: "#666", icon: "🎬" };
    const grad = `linear-gradient(135deg, ${c.color} 0%, ${shade(c.color, -35)} 100%)`;
    const play = opts.noPlay ? "" :
      `<div class="thumb__play"><span>▶</span></div>`;
    return `
      <div class="thumb" style="background:${grad}">
        <span class="thumb__cat">${c.icon} ${escapeHtml(p.category)}</span>
        <span class="thumb__icon">${c.icon}</span>
        <div class="thumb__title">${escapeHtml(p.title)}</div>
        <span class="thumb__dur">${formatDuration(p.durationSec)}</span>
        ${play}
      </div>`;
  }

  function cardHtml(p) {
    return `
      <article class="card" data-goto="#/watch/${p.id}">
        ${thumbHtml(p)}
        <div class="card__meta">
          <span class="avatar" style="background:${ZUNDA_GREEN}">${escapeHtml(p.channel.charAt(0))}</span>
          <div class="card__info">
            <h3 class="card__title">${escapeHtml(p.title)}</h3>
            <div class="card__sub">${escapeHtml(p.channel)}</div>
            <div class="card__sub">
              <span>${formatViews(p.views)} 回視聴</span><span>${relativeDate(p.published)}</span>
            </div>
          </div>
        </div>
      </article>`;
  }

  function gridHtml(list) {
    if (!list.length) {
      return `<div class="empty"><div class="empty__icon">🔍</div>
        <p>その番組は見つからなかったのだ…。<br />べつのキーワードやカテゴリで探してほしいのだ。</p></div>`;
    }
    return `<div class="grid">${list.map(cardHtml).join("")}</div>`;
  }

  // ----------------------- 画面描画 -----------------------
  function renderSidebar(activeKey) {
    categoryList.innerHTML = CATEGORIES.map((c) => {
      const href = c.key === "all" ? "#/" : `#/category/${encodeURIComponent(c.key)}`;
      const active = c.key === activeKey ? " active" : "";
      return `<li><a class="cat-link${active}" href="${href}">
        <span class="cat-link__icon">${c.icon}</span><span>${escapeHtml(c.label)}</span>
      </a></li>`;
    }).join("");
  }

  function chipsHtml(activeKey) {
    return `<div class="chips">${CATEGORIES.map((c) => {
      const href = c.key === "all" ? "#/" : `#/category/${encodeURIComponent(c.key)}`;
      const active = c.key === activeKey ? " active" : "";
      return `<button class="chip${active}" data-goto="${href}">${escapeHtml(c.label)}</button>`;
    }).join("")}</div>`;
  }

  function renderHome(categoryKey) {
    const key = categoryKey || "all";
    renderSidebar(key);
    const list = key === "all" ? PROGRAMS : PROGRAMS.filter((p) => p.category === key);
    const cat = catOf(key);
    const heading = key === "all"
      ? `ずんだもんのおすすめ番組なのだ <span class="muted">全${PROGRAMS.length}本</span>`
      : `${cat ? cat.icon + " " : ""}${escapeHtml(cat ? cat.label : key)}の番組なのだ <span class="muted">${list.length}本</span>`;
    main.innerHTML = chipsHtml(key) +
      `<h2 class="section-title">${heading}</h2>` + gridHtml(list);
  }

  function renderSearch(query) {
    renderSidebar(null);
    const q = (query || "").trim();
    const lower = q.toLowerCase();
    const list = PROGRAMS.filter((p) => {
      const hay = [p.title, p.channel, p.category, p.description, (p.tags || []).join(" ")]
        .join(" ").toLowerCase();
      return hay.includes(lower);
    });
    main.innerHTML =
      `<h2 class="section-title">「${escapeHtml(q)}」の検索結果なのだ <span class="muted">${list.length}件</span></h2>` +
      gridHtml(list);
  }

  // 自動再生レッスン（スライド＋ナレーション）のHTML
  function lessonHtml(p) {
    const c = catOf(p.category) || { color: "#444", icon: "🎬" };
    const grad = `linear-gradient(135deg, ${c.color} 0%, ${shade(c.color, -45)} 100%)`;
    return `<div class="player">
      <div class="lesson" id="lessonRoot" style="background:${grad}">
        <div class="lesson__stage">
          <span class="lesson__badge">${c.icon} ${escapeHtml(p.category)}</span>
          <span class="lesson__speaker">🫛 ずんだもん</span>
          <div class="lesson__scene">
            <h2 id="slideHeading"></h2>
            <ul id="slidePoints"></ul>
          </div>
          <div class="lesson__caption" id="slideCaption"></div>
          <button class="lesson__big" id="bigPlay" aria-label="再生する">▶</button>
        </div>
        <div class="lesson__bar">
          <div class="lesson__progress"><span id="progFill"></span></div>
          <div class="lesson__btns">
            <button id="btnPrev" aria-label="前のスライド">⏮</button>
            <button id="btnPlay" aria-label="再生／一時停止">▶</button>
            <button id="btnNext" aria-label="次のスライド">⏭</button>
            <span class="lesson__counter" id="counter"></span>
            <span class="spacer"></span>
            <button id="btnMute" aria-label="音声オン／オフ">🔊</button>
            <button id="btnReplay" aria-label="最初から">↻</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // YouTube動画ID用の埋め込み（videoIdを設定した場合）
  function embedHtml(p) {
    return `<div class="player">
      <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(p.videoId)}?rel=0"
        title="${escapeHtml(p.title)}" allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
    </div>`;
  }

  function playerHtml(p) {
    if (p.videoId) return embedHtml(p);            // 動画IDがあれば本物の動画を埋め込み
    if (scenesOf(p.id)) return lessonHtml(p);      // 台本があればスライド自動再生
    // どちらも無ければYouTube検索のプレースホルダー
    const c = catOf(p.category) || { color: "#444" };
    const grad = `linear-gradient(135deg, ${c.color} 0%, ${shade(c.color, -45)} 100%)`;
    return `<div class="player" style="background:${grad}">
      <div class="player-placeholder">
        <h3>${escapeHtml(p.title)}</h3>
        <a class="btn-yt" href="${ytSearchUrl(p)}" target="_blank" rel="noopener">▶ YouTubeで見るのだ</a>
        <small>（data.js の videoId に動画IDを入れると、ここで埋め込み再生できるのだ）</small>
      </div>
    </div>`;
  }

  // ナレーション読み上げの目安時間(ms)。音声が使えないときの自動送りにも使う
  function estDuration(text) {
    return Math.max(2600, 900 + text.length * 130);
  }

  // スライド自動再生コントローラ（Web Speech APIで読み上げ）
  function createLesson(scenes) {
    const root = document.getElementById("lessonRoot");
    if (!root || !scenes || !scenes.length) return null;

    const headingEl = document.getElementById("slideHeading");
    const pointsEl = document.getElementById("slidePoints");
    const captionEl = document.getElementById("slideCaption");
    const counterEl = document.getElementById("counter");
    const progFill = document.getElementById("progFill");
    const bigPlay = document.getElementById("bigPlay");
    const btnPlay = document.getElementById("btnPlay");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const btnMute = document.getElementById("btnMute");
    const btnReplay = document.getElementById("btnReplay");

    const synth = window.speechSynthesis || null;
    let idx = 0, playing = false, muted = false, ended = false;
    let token = 0, timer = null, jpVoice = null;

    function pickVoice() {
      if (!synth) return;
      const vs = synth.getVoices() || [];
      jpVoice = vs.find((v) => /ja[-_]?JP/i.test(v.lang)) ||
                vs.find((v) => (v.lang || "").toLowerCase().indexOf("ja") === 0) || null;
    }
    if (synth) {
      pickVoice();
      try { synth.addEventListener("voiceschanged", pickVoice); }
      catch (e) { synth.onvoiceschanged = pickVoice; }
    }

    const clearTimer = () => { if (timer) { clearTimeout(timer); timer = null; } };
    const stopSpeech = () => { clearTimer(); if (synth) { try { synth.cancel(); } catch (e) {} } };

    function renderScene() {
      const s = scenes[idx];
      headingEl.textContent = s.heading;
      pointsEl.innerHTML = s.points.map((pt) => `<li>${escapeHtml(pt)}</li>`).join("");
      captionEl.textContent = s.narration;
      counterEl.textContent = (idx + 1) + " / " + scenes.length;
      progFill.style.width = (((idx + 1) / scenes.length) * 100) + "%";
    }

    function setPlayingUI(on) {
      btnPlay.textContent = on ? "⏸" : "▶";
      bigPlay.hidden = on;
    }

    function finish() {
      playing = false; ended = true; stopSpeech(); setPlayingUI(false);
      progFill.style.width = "100%";
    }

    function speakScene() {
      token++;
      const my = token;
      const s = scenes[idx];
      const advance = () => {
        if (my !== token || !playing) return;
        token++; // このシーンの保留中タイマー／onendを無効化
        if (idx < scenes.length - 1) { idx++; renderScene(); speakScene(); }
        else { finish(); }
      };
      clearTimer();
      if (synth && !muted) {
        try { synth.cancel(); } catch (e) {}
        const u = new SpeechSynthesisUtterance(s.narration);
        if (jpVoice) u.voice = jpVoice;
        u.lang = "ja-JP"; u.rate = 1.02; u.pitch = 1.5;
        u.onend = advance;
        u.onerror = advance;
        try { synth.speak(u); } catch (e) {}
        // onendが発火しないブラウザ対策の保険タイマー
        timer = setTimeout(advance, estDuration(s.narration) + 3000);
      } else {
        timer = setTimeout(advance, estDuration(s.narration));
      }
    }

    function play() {
      if (ended) { idx = 0; ended = false; renderScene(); }
      playing = true; setPlayingUI(true); speakScene();
    }
    function pause() { playing = false; token++; stopSpeech(); setPlayingUI(false); }
    function toggle() { playing ? pause() : play(); }
    function goTo(i) {
      token++; stopSpeech();
      idx = Math.max(0, Math.min(scenes.length - 1, i));
      ended = false; renderScene();
      if (playing) speakScene(); else setPlayingUI(false);
    }

    btnPlay.addEventListener("click", toggle);
    bigPlay.addEventListener("click", play);
    btnPrev.addEventListener("click", () => goTo(idx - 1));
    btnNext.addEventListener("click", () => goTo(idx + 1));
    btnReplay.addEventListener("click", () => { idx = 0; ended = false; renderScene(); play(); });
    btnMute.addEventListener("click", () => {
      muted = !muted;
      btnMute.textContent = muted ? "🔇" : "🔊";
      if (playing) { token++; stopSpeech(); speakScene(); }
    });

    renderScene();
    setPlayingUI(false);

    return {
      destroy() {
        playing = false; token++; stopSpeech();
        if (synth) { try { synth.removeEventListener("voiceschanged", pickVoice); } catch (e) {} }
      },
    };
  }

  function relatedHtml(current) {
    const related = PROGRAMS
      .filter((p) => p.id !== current.id)
      .sort((a, b) => (b.category === current.category) - (a.category === current.category))
      .slice(0, 8);
    return `<aside class="related"><h3>関連する番組なのだ</h3>${related.map((p) => `
      <div class="related-item" data-goto="#/watch/${p.id}">
        ${thumbHtml(p, { noPlay: true })}
        <div class="related-item__info">
          <p class="related-item__title">${escapeHtml(p.title)}</p>
          <p class="related-item__sub">${escapeHtml(p.channel)}</p>
          <p class="related-item__sub">${formatViews(p.views)} 回視聴・${relativeDate(p.published)}</p>
        </div>
      </div>`).join("")}</aside>`;
  }

  function renderWatch(id) {
    const p = byId(id);
    renderSidebar(null);
    if (!p) {
      main.innerHTML = `<div class="empty"><div class="empty__icon">📺</div>
        <p>番組が見つからなかったのだ。</p><a class="btn-yt" href="#/">ホームにもどるのだ</a></div>`;
      return;
    }
    const tags = (p.tags || []).map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("");
    const hasLesson = !p.videoId && scenesOf(p.id);
    main.innerHTML = `
      <a class="back-link" href="#/">← 一覧にもどるのだ</a>
      <div class="watch">
        <div class="watch__primary">
          ${playerHtml(p)}
          ${hasLesson ? `<p class="play-hint">▶ 再生ボタンを押すと、ずんだもんがスライドで解説してくれるのだ（音声は端末の読み上げ機能を使うのだ）</p>` : ""}
          <h1 class="watch__title">${escapeHtml(p.title)}</h1>
          <div class="watch__bar">
            <div class="watch__channel">
              <span class="avatar" style="background:${ZUNDA_GREEN}">${escapeHtml(p.channel.charAt(0))}</span>
              <div><b>${escapeHtml(p.channel)}</b><small>${escapeHtml(p.category)}の解説なのだ</small></div>
            </div>
            <div class="watch__tags">${tags}</div>
          </div>
          <div class="desc-box">
            <div class="stat">${formatViews(p.views)} 回視聴・${relativeDate(p.published)}・${formatDuration(p.durationSec)}</div>
            ${escapeHtml(p.description)}
            <p class="yt-more"><a href="${ytSearchUrl(p)}" target="_blank" rel="noopener">▶ もっと詳しくはYouTubeでも探せるのだ</a></p>
          </div>
        </div>
        ${relatedHtml(p)}
      </div>`;
    document.title = `${p.title}｜NurseTube`;

    if (hasLesson) activeLesson = createLesson(scenesOf(p.id));
  }

  // ----------------------- ルーター -----------------------
  function router() {
    if (activeLesson) { activeLesson.destroy(); activeLesson = null; }
    closeSidebar();
    main.scrollTop = 0;
    window.scrollTo(0, 0);
    document.title = "NurseTube ナースチューブ｜ずんだもんと学ぶ看護のYouTube";

    const hash = location.hash.replace(/^#/, "") || "/";
    const parts = hash.split("/").filter(Boolean); // 例: ["watch","anat01"]

    if (parts[0] === "watch" && parts[1]) {
      renderWatch(decodeURIComponent(parts[1]));
    } else if (parts[0] === "category" && parts[1]) {
      renderHome(decodeURIComponent(parts[1]));
    } else if (parts[0] === "search" && parts[1]) {
      const q = decodeURIComponent(parts[1]);
      searchInput.value = q;
      renderSearch(q);
    } else {
      renderHome("all");
    }
  }

  // ----------------------- イベント -----------------------
  // カード等のクリック → data-goto のハッシュへ
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-goto]");
    if (el) {
      e.preventDefault();
      location.hash = el.getAttribute("data-goto");
    }
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    location.hash = q ? `#/search/${encodeURIComponent(q)}` : "#/";
  });

  // テーマ切替（localStorageに保存）
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("nursetube-theme", theme);
  }
  themeToggle.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
  });

  // モバイル用サイドバー開閉
  function openSidebar() { sidebar.classList.add("open"); backdrop.hidden = false; }
  function closeSidebar() { sidebar.classList.remove("open"); backdrop.hidden = true; }
  menuToggle.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  backdrop.addEventListener("click", closeSidebar);

  // 国家試験までのカウントダウン
  function renderCountdown() {
    if (typeof EXAM_DATE === "undefined") return;
    const target = new Date(EXAM_DATE + "T00:00:00");
    const days = Math.ceil((target - new Date()) / 86400000);
    if (isNaN(days)) return;
    examCountdown.innerHTML = days > 0
      ? `国試まであと<br /><strong>${days}</strong> 日なのだ`
      : `国家試験<br />おつかれさまなのだ!`;
  }

  // 端末を離れる／タブを閉じるときは読み上げを止める
  window.addEventListener("beforeunload", () => {
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  });

  // ----------------------- 起動 -----------------------
  const saved = localStorage.getItem("nursetube-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
  renderCountdown();
  window.addEventListener("hashchange", router);
  router();
})();
