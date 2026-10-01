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

  function safeDecode(value) { try { return decodeURIComponent(value); } catch (e) { return value; } }

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

  const anatomyV5Of = (id) => {
    const lesson = typeof ENHANCED_LESSONS !== "undefined" ? ENHANCED_LESSONS[id] : null;
    return lesson && ["anatomy-v5", "illustrated-v6"].includes(lesson.kind) ? lesson : null;
  };

  // 表示用の情報。既存のバイタル動画プレーヤーはそのまま利用する。
  const cardLessonOf = (id) => id === "base01"
    ? { title: "バイタルサイン｜数字の向こうの患者さんを見る", poster: "vitals-v5-01.jpg", pages: new Array(4), durationSec: 50 }
    : anatomyV5Of(id);

  // 番組サムネイル（CSSグラデーション＋タイトル）を生成
  function thumbHtml(p, opts = {}) {
    const c = catOf(p.category) || { color: "#666", icon: "🎬" };
    const grad = `linear-gradient(135deg, ${c.color} 0%, ${shade(c.color, -35)} 100%)`;
    const play = opts.noPlay ? "" :
      `<div class="thumb__play"><span>▶</span></div>`;
    const lesson = cardLessonOf(p.id);
    if (lesson) return `
      <div class="thumb thumb--v5">
        <img class="thumb__v5-image" src="${escapeHtml(lesson.poster)}" width="1080" height="1920" loading="lazy" alt="" />
        <span class="thumb__cat">${escapeHtml(lesson.version || "V5")}イラスト・会話動画</span>
        <div class="thumb__title">${escapeHtml(lesson.title)}</div>
        <span class="thumb__dur">${formatDuration(lesson.durationSec || p.durationSec)}</span>${play}
      </div>`;
    return `
      <div class="thumb" style="background:${grad}">
        <span class="thumb__cat">${c.icon} ${escapeHtml(p.category)}</span>
        <span class="thumb__icon">${c.icon}</span>
        <div class="thumb__title">${escapeHtml(p.title)}</div>
        <span class="thumb__dur">${formatDuration(p.durationSec)}</span>
        ${play}
      </div>`;
  }

  // 旧サイトの閲覧表示は、動画ファイルとは独立して保持する。
  function historicalViews(p) {
    const archive = typeof NURSETUBE_LEGACY_VIEWS !== "undefined" ? NURSETUBE_LEGACY_VIEWS : {};
    const n = archive[p.id];
    return Number.isSafeInteger(n) && n >= 0 ? n : null;
  }
  function viewsHtml(p) {
    const n = historicalViews(p);
    return n === null ? "" : `<p class="legacy-views" title="旧サイトに保存されていた表示値。アクセス解析・実人数とは未照合です。">旧サイトの閲覧表示：<strong>${n.toLocaleString("ja-JP")}回</strong></p>`;
  }

  function cardHtml(p) {
    const lesson = cardLessonOf(p.id);
    const channel = lesson ? "先輩と後輩の会話" : p.channel;
    return `
      <a class="card" href="#/watch/${encodeURIComponent(p.id)}">
        ${thumbHtml(p)}
        <div class="card__meta">
          <span class="avatar" style="background:${ZUNDA_GREEN}">${escapeHtml(channel.charAt(0))}</span>
          <div class="card__info">
            <h3 class="card__title">${escapeHtml(p.title)}</h3>
            <div class="card__sub">${escapeHtml(channel)}</div>${viewsHtml(p)}
            <div class="card__sub">
              <span>${lesson ? lesson.pages.length + "枚のイラスト・音声付き" : (scenesOf(p.id) ? scenesOf(p.id).length + "場面で学ぶ" : "教材")}</span>
            </div>
          </div>
        </div>
      </a>`;
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
    if (key === "all") { renderWarmHome(); return; }
    main.innerHTML = chipsHtml(key) +
      `<h2 class="section-title">${heading}</h2>` + gridHtml(list);
  }

  function renderWarmHome() {
    main.classList.add("home-main");
    const picks = ["base01", "anat01", "exam03"].map(byId).filter(Boolean);
    const visualNames = ["vitals", "heart", "ecg"];
    main.innerHTML = `<a class="instagram-banner" href="https://www.instagram.com/yakubon_studio/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @yakubon_studio を開く（新しいタブ）">
      <svg class="instagram-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle></svg>
      <span class="instagram-banner__copy"><strong>Instagram <span>@yakubon_studio</span></strong><span>イラストと動画で、一緒に看護を学ぼう。</span></span><span class="instagram-banner__cta">見に行く <span aria-hidden="true">↗</span></span>
      </a><section class="welcome" aria-labelledby="welcomeTitle">
      <img class="welcome__art" src="images/nursetube-hero.webp" alt="青い制服の先輩と後輩が、一緒にノートを開いて学んでいる" width="1536" height="1024" fetchpriority="high">
      <div class="welcome__copy"><h1 id="welcomeTitle">看護の「わからない」を、<br>ひとつずつ。</h1>
      <p>見て、聴いて、触って。<br class="mobile-break">「なるほど」を育てよう。</p>
      <div class="welcome__actions"><a class="warm-btn" href="#/watch/base01">▶ バイタルサインの動画を見る</a><button class="warm-btn" type="button" data-scroll-catalog>教材を探す <span aria-hidden="true">›</span></button>
      <a class="warm-btn warm-btn--outline" href="index.html">人工呼吸器を体験する <span aria-hidden="true">›</span></a></div></div></section>
      <nav class="subject-nav" aria-label="分野から教材を探す">${CATEGORIES.filter(c => c.key !== "all").map(c => `<a href="#/category/${encodeURIComponent(c.key)}"><span aria-hidden="true">${c.icon}</span>${escapeHtml(c.label)}</a>`).join("")}</nav>
      <section class="learning-section"><h2>今日の学びを見つけよう</h2><div class="featured-lessons">${picks.map((p,i) => `<a class="featured-lesson" href="#/watch/${p.id}"><div class="featured-lesson__art">${i === 0 ? `<img src="images/vitals-v5.webp" alt="バイタルを一緒に学ぶ先輩と後輩" width="1536" height="1024" loading="lazy">` : i === 1 ? `<img src="anat01-v5-page-01.jpg" alt="心臓は2つのポンプ。先輩と後輩がイラストで解説" width="1080" height="1920" loading="lazy" style="object-fit:contain">` : FIGURES[visualNames[i]]()}</div><div class="featured-lesson__copy"><h3>${["バイタルサイン", "心臓と血液の流れ", "心電図の基本"][i]}</h3><p>${["数字と患者さんの様子を、一緒に。", "血液の旅を、イラストと会話で。", "波形の見方を、ひとつずつ。"][i]}</p>${i <= 1 ? '<span class="lesson-status">更新：V5イラスト・音声付き動画</span>' : '<span class="lesson-status lesson-status--plain">既存のスライド教材</span>'}</div></a>`).join("")}</div></section>
      <p class="legacy-views-note">閲覧回数は旧サイトに保存されていた表示値を引き継いでいます。実人数・現在のアクセス解析とは未照合です。動画を交換してもこの記録は残します。</p>\n      <section id="learningCatalog" class="learning-section"><h2>すべての教材 <small>全${PROGRAMS.length}本</small></h2>${gridHtml(PROGRAMS)}</section>
      <footer class="warm-footer"><p>今日はひとつ、わかれば大丈夫。</p><span>YAKUBON STUDIO</span></footer>`;
  }

  function renderEnhanced(p, lesson) {
    main.classList.add("enhanced-main");
    const hasVideo = p.id === "base01";
    main.innerHTML = `<a class="back-link" href="#/">一覧にもどる</a>
      <article class="v5-lesson"><header class="v5-heading"><span class="lesson-status">基礎看護学 · イラストと会話</span><h1>${escapeHtml(lesson.title)}</h1>${viewsHtml(p)}<p>${escapeHtml(lesson.intro)}</p></header>
      ${hasVideo ? `<section class="v5-video-section" aria-label="音声付きV5動画"><p>画面中央の ▶ を押すと、先輩と後輩の会話が音声付きで再生されます。<br>2枚目・4枚目を描き直した4枚のV5イラストで学びましょう。</p><div class="v5-video-player"><video id="v5Video" controls playsinline preload="metadata" poster="vitals-v5-01.jpg" aria-label="バイタルサインの音声付き動画"><source src="vitals-v5-player-v2.mp4" type="video/mp4">動画を再生できない場合は、下の会話文をご覧ください。</video><button id="v5VideoPlay" class="v5-video-play" type="button" aria-label="バイタルサインの動画を再生"><span>▶<small id="v5VideoLabel">再生する</small></span></button></div><p id="v5VideoStatus" role="status" aria-live="polite"></p><p class="v5-video-credit">声：CoeFont／後輩「汎用式概念χ-soft-v2」（CV：ろさちゃん）、先輩「後藤邑子」</p></section>` : ""}
      <section class="v5-intro"><img src="${lesson.image}" alt="先輩と後輩が患者さんの様子とバイタルサインを確認するイラスト" width="1536" height="1024"><div><h2>${escapeHtml(lesson.hook)}</h2><p>測って終わりにせず、<br><strong>「いつもと違う？」まで見る。</strong></p><p>ここを押さえると、観察がつながります。</p></div></section>
      <section class="v5-section"><h2>先輩と後輩の、なるほど会話</h2><div class="dialogue">${lesson.dialogue.map(d => `<div class="dialogue__line ${d.role === "先輩" ? "dialogue__line--senior" : ""}"><span class="dialogue__role">${d.role}</span><p>${escapeHtml(d.text)}</p></div>`).join("")}</div>
      <div class="dialogue-audio"><button id="dialoguePlay" class="warm-btn" type="button">会話を聴く</button><button id="dialogueStop" class="audio-stop" type="button">停止</button><span id="dialogueStatus" role="status">端末の日本語音声で読み上げます（動画では指定CoeFontの音声を使用）。</span></div></section>
      <section class="v5-section takeaway"><h2>今日、持ち帰る3つ</h2><ul>${lesson.summary.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul></section>
      <section class="v5-section"><h2>成人・安静時の参考値</h2><p>一律の「安全ライン」ではありません。年齢・疾患・測定条件で異なります。</p><div class="range-table-wrap"><table class="range-table"><thead><tr><th scope="col">項目</th><th scope="col">参考値</th><th scope="col">観察のポイント</th></tr></thead><tbody>${lesson.ranges.map(r => `<tr><th scope="row">${escapeHtml(r[0])}</th><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td></tr>`).join("")}</tbody></table></div></section>
      <section class="v5-section"><h2>もう少し詳しく学ぶ</h2><div class="v5-detail-list">${lesson.details.map(d => `<div><h3>${escapeHtml(d.title)}</h3><p>${escapeHtml(d.text)}</p></div>`).join("")}</div></section>
      <section class="v5-section quiz"><h2>1問だけ、確かめよう</h2><p>${escapeHtml(lesson.quiz.question)}</p><div class="quiz__options">${lesson.quiz.options.map((o,i) => `<button type="button" data-quiz-answer="${i}">${escapeHtml(o)}</button>`).join("")}</div><p id="quizFeedback" class="quiz__feedback" role="status" hidden></p></section>
      <section class="v5-section"><h2>スライドでも復習</h2><p>既存のスライド構成を残し、参考値の説明を見直しました。</p>${lessonHtml(p)}</section>
      <section class="v5-section references"><h2>参考資料</h2><ul>${lesson.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a></li>`).join("")}</ul><p>資料照合・更新：${lesson.reviewed}。学習用教材です。実際の観察・対応は施設の手順と患者さんごとの指示を確認してください。</p></section>
      <footer class="warm-footer"><p>今日はひとつ、わかれば大丈夫。</p><a href="#/">ほかの教材へ</a></footer></article>`;
    document.title = `${lesson.title}｜NurseTube`;
    document.querySelectorAll("[data-quiz-answer]").forEach(button => button.addEventListener("click", () => {
      const correct = Number(button.dataset.quizAnswer) === lesson.quiz.correct;
      const feedback = document.getElementById("quizFeedback");
      feedback.hidden = false;
      feedback.textContent = `${correct ? "正解です。" : "もう一度、患者さんの様子に注目してみよう。"} ${lesson.quiz.explanation}`;
      document.querySelectorAll("[data-quiz-answer]").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
    }));
    const slideshow = createLesson(p.id, scenesOf(p.id));
    const synth = window.speechSynthesis;
    let dialogueToken = 0;
    const status = document.getElementById("dialogueStatus");
    const stopDialogue = () => { dialogueToken++; if (synth) synth.cancel(); status.textContent = "読み上げを停止しました。"; };
    const video = document.getElementById("v5Video");
    if (video) {
      const button = document.getElementById("v5VideoPlay");
      const label = document.getElementById("v5VideoLabel");
      const videoStatus = document.getElementById("v5VideoStatus");
      const showPlay = () => {
        button.hidden = false; button.disabled = false; button.removeAttribute("aria-busy");
        label.textContent = video.ended ? "もう一度再生" : "再生する";
      };
      button.addEventListener("click", () => {
        if (video.ended) video.currentTime = 0;
        button.disabled = true; button.setAttribute("aria-busy", "true");
        videoStatus.textContent = "読み込み中…";
        video.play().catch(() => { showPlay(); videoStatus.textContent = "再生できませんでした。下の操作バーから再生するか、ページを読み直してください。"; });
      });
      video.addEventListener("play", () => { stopDialogue(); slideshow?.pause(); });
      video.addEventListener("playing", () => { button.hidden = true; button.disabled = false; button.removeAttribute("aria-busy"); videoStatus.textContent = ""; });
      video.addEventListener("pause", showPlay);
      video.addEventListener("ended", showPlay);
      video.addEventListener("error", () => { showPlay(); videoStatus.textContent = "動画を読み込めませんでした。下の会話文でも復習できます。"; });
      ["dialoguePlay", "btnPlay", "bigPlay", "btnReplay"].forEach(id => document.getElementById(id)?.addEventListener("click", () => video.pause(), true));
    }
    document.getElementById("dialogueStop").addEventListener("click", stopDialogue);
    document.getElementById("dialoguePlay").addEventListener("click", () => {
      if (!synth || typeof SpeechSynthesisUtterance === "undefined") { status.textContent = "この端末では読み上げを利用できません。会話の文章で復習できます。"; return; }
      slideshow?.destroy(); stopDialogue(); const myToken = dialogueToken;
      let index = 0;
      const speakNext = () => {
        if (myToken !== dialogueToken) return;
        if (index >= lesson.dialogue.length) { status.textContent = "読み上げが終わりました。"; return; }
        const d = lesson.dialogue[index++];
        const utterance = new SpeechSynthesisUtterance(d.text);
        utterance.lang = "ja-JP"; utterance.rate = 1; utterance.pitch = d.role === "先輩" ? 1 : 1.12;
        const voice = synth.getVoices().find(v => /^ja/i.test(v.lang)); if (voice) utterance.voice = voice;
        status.textContent = `${d.role}の会話を読み上げ中（${index}/${lesson.dialogue.length}）`;
        utterance.onend = speakNext;
        utterance.onerror = () => { if (myToken === dialogueToken) status.textContent = "読み上げを終了しました。端末の音声設定も確認してください。"; };
        synth.speak(utterance);
      }; speakNext();
    });
    document.getElementById("btnPlay").addEventListener("click", stopDialogue, true);
    document.getElementById("bigPlay").addEventListener("click", stopDialogue, true);
    document.getElementById("btnReplay").addEventListener("click", stopDialogue, true);
    activeLesson = { destroy() { video?.pause(); stopDialogue(); slideshow?.destroy(); } };
  }

  function renderAnatomyV5(p, lesson) {
    main.classList.add("enhanced-main");
    main.innerHTML = `<a class="back-link" href="#/">一覧にもどる</a><article class="v5-lesson">
      <header class="v5-heading"><span class="lesson-status">${escapeHtml(p.category)} · ${escapeHtml(lesson.version || "V5")}イラスト・音声付き動画</span><h1>${escapeHtml(lesson.title)}</h1>${viewsHtml(p)}<p>${escapeHtml(lesson.intro)}</p></header>
      <section class="v5-video-section"><p>画面中央の ▶ を押すと、先輩と後輩の会話が音声付きで再生されます。</p><div class="v5-video-player"><video id="v5Video" controls playsinline preload="metadata" poster="${escapeHtml(lesson.poster)}" aria-label="${escapeHtml(lesson.title)}の音声付き動画"><source src="${escapeHtml(lesson.video)}" type="video/mp4">動画を再生できない場合は、下の会話文をご覧ください。</video><button id="v5VideoPlay" class="v5-video-play" type="button" aria-label="${escapeHtml(lesson.title)}の動画を再生"><span>▶<small id="v5VideoLabel">再生する</small></span></button></div><p id="v5VideoStatus" role="status" aria-live="polite"></p><p class="v5-video-credit">声：CoeFont／後輩「汎用式概念χ-soft-v2」（CV：ろさちゃん）、先輩「後藤邑子」</p></section>
      <section class="v5-section takeaway"><h2>今日、持ち帰る3つ</h2><ul>${lesson.summary.map(t=>`<li>${escapeHtml(t)}</li>`).join("")}</ul></section>
      ${lesson.flow?`<section class="v5-section"><h2>血液の流れをたどろう</h2><p>${lesson.flow.map(escapeHtml).join(" → ")}</p><p>ポンプ・部屋・扉のイラストは、しくみを理解するための比喩です。</p></section>`:""}${lesson.explanations?`<section class="v5-section"><h2>しくみを文章で整理</h2>${lesson.explanations.map(d=>`<h3>${escapeHtml(d.title)}</h3><p>${escapeHtml(d.text)}</p>`).join("")}</section>`:""}
      <section class="v5-section"><h2>イラストと会話で復習</h2>${lesson.pages.map(d=>`<details class="v5-anatomy-page"><summary>${d.page}. ${escapeHtml(d.title.replace(/\n/g," "))}</summary><img src="${escapeHtml(d.image || `${p.id}-v5-page-${String(d.page).padStart(2,"0")}.jpg`)}" alt="${escapeHtml(d.title.replace(/\n/g," "))}" width="1080" height="1920" loading="lazy"><div class="dialogue"><div class="dialogue__line"><span class="dialogue__role">後輩</span><p>${escapeHtml(d.junior)}</p></div><div class="dialogue__line dialogue__line--senior"><span class="dialogue__role">先輩</span><p>${escapeHtml(d.senior)}</p></div>${d.closing?`<div class="dialogue__line"><span class="dialogue__role">後輩</span><p>${escapeHtml(d.closing)}</p></div>`:""}</div></details>`).join("")}</section>
      <section class="v5-section"><h2>もう少し詳しく学ぶ</h2><p>これまでの解説本文も、文章で復習できます。</p><div class="v5-detail-list">${scenesOf(p.id).map(d=>`<div><h3>${escapeHtml(d.heading)}</h3><p>${escapeHtml(d.narration)}</p></div>`).join("")}</div></section>
      <section class="v5-section references"><h2>参考資料</h2>${(lesson.sources || [{title:"NHLBI：How Blood Flows through the Heart",url:"https://www.nhlbi.nih.gov/health/heart/blood-flow"}]).map(d=>`<p><a href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(d.title)}</a></p>`).join("")}<p>内容照合：2026年10月1日</p></section><footer class="warm-footer"><p>今日はひとつ、わかれば大丈夫。</p><a href="#/">ほかの教材へ</a></footer></article>`;
    document.title = `${lesson.title}｜NurseTube`;
    const video=document.getElementById("v5Video"),button=document.getElementById("v5VideoPlay"),label=document.getElementById("v5VideoLabel"),status=document.getElementById("v5VideoStatus");
    const showPlay=()=>{button.hidden=false;button.disabled=false;button.removeAttribute("aria-busy");label.textContent=video.ended?"もう一度再生":"再生する";};
    button.addEventListener("click",()=>{if(video.ended)video.currentTime=0;button.disabled=true;button.setAttribute("aria-busy","true");status.textContent="読み込み中…";video.play().catch(()=>{showPlay();status.textContent="再生できませんでした。下の操作バーから再生してください。";});});
    video.addEventListener("playing",()=>{button.hidden=true;button.disabled=false;button.removeAttribute("aria-busy");status.textContent="";});
    video.addEventListener("pause",showPlay);video.addEventListener("ended",showPlay);
    video.addEventListener("error",()=>{showPlay();status.textContent="動画を読み込めませんでした。下の会話文でも復習できます。";});
    const onVisibility=()=>{if(document.hidden)video.pause();};document.addEventListener("visibilitychange",onVisibility);
    activeLesson={destroy(){video.pause();video.removeAttribute("src");video.querySelector("source")?.removeAttribute("src");video.load();document.removeEventListener("visibilitychange",onVisibility);}};
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
          <div class="lesson__body" id="lessonBody">
            <div class="lesson__figure" id="slideFigure"></div>
            <div class="lesson__scene">
              <h2 id="slideHeading"></h2>
              <ul id="slidePoints"></ul>
            </div>
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

  // そのシーンの「映像」を返す（優先順位：動画クリップ → 本物の写真 → 図解SVG）
  function visualHtml(key, scene) {
    // 1) シーンに動画ID(本物のクリップ)があれば最優先で埋め込み
    if (scene && scene.videoId) {
      return `<iframe class="fig-media" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(scene.videoId)}?rel=0"
        title="clip" allowfullscreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
    }
    // 2) 本物の写真(CT/MRI等)が images/manifest.js に登録されていれば表示
    if (typeof IMAGES !== "undefined" && IMAGES[key]) {
      const v = IMAGES[key];
      const src = typeof v === "string" ? v : v.src;
      const alt = (v && typeof v === "object" && v.alt) ? v.alt : "";
      const credit = (v && typeof v === "object" && v.credit)
        ? `<span class="fig-credit">${escapeHtml(v.credit)}</span>` : "";
      return `<div class="fig-photo"><img class="fig-media" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">${credit}</div>`;
    }
    // 3) 図解(SVG)。scene.figure または SCENE_FIGURES の割り当てを使う
    const name = (scene && scene.figure) ||
      (typeof SCENE_FIGURES !== "undefined" && SCENE_FIGURES[key]) || null;
    if (name && typeof FIGURES !== "undefined" && typeof FIGURES[name] === "function") {
      return FIGURES[name]();
    }
    return "";
  }

  // スライド自動再生コントローラ（Web Speech APIで読み上げ）
  function createLesson(programId, scenes) {
    const root = document.getElementById("lessonRoot");
    if (!root || !scenes || !scenes.length) return null;

    const headingEl = document.getElementById("slideHeading");
    const pointsEl = document.getElementById("slidePoints");
    const captionEl = document.getElementById("slideCaption");
    const figureEl = document.getElementById("slideFigure");
    const bodyEl = document.getElementById("lessonBody");
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
    let token = 0, timer = null, jpVoice = null, audioEl = null;

    // そのシーンに本物の音声ファイル(VOICEVOX等)があれば、そのパスを返す
    const audioFor = (i) =>
      (typeof AUDIO_FILES !== "undefined" && AUDIO_FILES[programId + "-" + (i + 1)]) || null;
    function stopAudio() {
      if (audioEl) {
        try { audioEl.pause(); } catch (e) {}
        audioEl.onended = null; audioEl.onerror = null; audioEl = null;
      }
    }

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
    const stopSpeech = () => {
      clearTimer();
      if (synth) { try { synth.cancel(); } catch (e) {} }
      stopAudio();
    };

    function renderScene() {
      const s = scenes[idx];
      headingEl.textContent = s.heading;
      pointsEl.innerHTML = s.points.map((pt) => `<li>${escapeHtml(pt)}</li>`).join("");
      captionEl.textContent = s.narration;
      counterEl.textContent = (idx + 1) + " / " + scenes.length;
      progFill.style.width = (((idx + 1) / scenes.length) * 100) + "%";
      // 図解／写真／動画クリップを表示（あれば横並びレイアウトに）
      const vis = visualHtml(programId + "-" + (idx + 1), s);
      figureEl.innerHTML = vis;
      bodyEl.classList.toggle("has-figure", !!vis);
    }

    function setPlayingUI(on) {
      btnPlay.textContent = on ? "⏸" : "▶";
      bigPlay.hidden = on;
    }

    function finish() {
      playing = false; ended = true; stopSpeech(); setPlayingUI(false);
      progFill.style.width = "100%";
    }

    // 音声ファイルが無いときの読み上げ／無音自動送り
    function ttsOrTimer(s, advance, my) {
      if (my !== token) return;
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

    function speakScene() {
      token++;
      const my = token;
      const s = scenes[idx];
      const advance = () => {
        if (my !== token || !playing) return;
        token++; // このシーンの保留中タイマー／onend／音声を無効化
        clearTimer();
        stopAudio();
        if (synth) { try { synth.cancel(); } catch (e) {} }
        if (idx < scenes.length - 1) { idx++; renderScene(); speakScene(); }
        else { finish(); }
      };
      clearTimer();
      const src = audioFor(idx);
      if (src && !muted) {
        // 本物のずんだもん音声(VOICEVOX等)があれば、それを再生
        stopAudio();
        audioEl = new Audio(src);
        audioEl.onended = advance;
        audioEl.onerror = () => { stopAudio(); ttsOrTimer(s, advance, my); };
        const pr = audioEl.play();
        if (pr && pr.catch) pr.catch(() => { stopAudio(); ttsOrTimer(s, advance, my); });
        // 音声が止まった場合の安全網(長めの保険タイマー)
        timer = setTimeout(advance, Math.max(estDuration(s.narration) * 2, 20000));
      } else {
        // 音声ファイルが無ければ端末の読み上げ(または無音で自動送り)
        ttsOrTimer(s, advance, my);
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
      pause,
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
          <p class="related-item__sub">${escapeHtml(p.category)}</p>
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
    if (typeof ENHANCED_LESSONS !== "undefined" && ENHANCED_LESSONS[id]) { const lesson = ENHANCED_LESSONS[id]; if (["anatomy-v5", "illustrated-v6"].includes(lesson.kind)) renderAnatomyV5(p, lesson); else renderEnhanced(p, lesson); return; }
    const tags = (p.tags || []).map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("");
    const hasLesson = !p.videoId && scenesOf(p.id);
    main.innerHTML = `
      <a class="back-link" href="#/">← 一覧にもどるのだ</a>
      <div class="watch">
        <div class="watch__primary">
          ${playerHtml(p)}
          ${hasLesson ? `<p class="play-hint">▶ 再生ボタンを押すと、ずんだもんがスライドで解説してくれるのだ（音声ファイルがあれば本物の声、無ければ端末の読み上げを使うのだ）</p>` : ""}
          <h1 class="watch__title">${escapeHtml(p.title)}</h1>${viewsHtml(p)}
          <div class="watch__bar">
            <div class="watch__channel">
              <span class="avatar" style="background:${ZUNDA_GREEN}">${escapeHtml(p.channel.charAt(0))}</span>
              <div><b>${escapeHtml(p.channel)}</b><small>${escapeHtml(p.category)}の解説なのだ</small></div>
            </div>
            <div class="watch__tags">${tags}</div>
          </div>
          <div class="desc-box">
            <div class="stat">${escapeHtml(p.category)}・${formatDuration(p.durationSec)}</div>
            ${escapeHtml(p.description)}
            <p class="yt-more"><a href="${ytSearchUrl(p)}" target="_blank" rel="noopener">▶ もっと詳しくはYouTubeでも探せるのだ</a></p>
          </div>
        </div>
        ${relatedHtml(p)}
      </div>`;
    document.title = `${p.title}｜NurseTube`;

    if (hasLesson) activeLesson = createLesson(p.id, scenesOf(p.id));
  }

  // ----------------------- ルーター -----------------------
  function router() {
    if (activeLesson) { activeLesson.destroy(); activeLesson = null; }
    main.classList.remove("home-main", "enhanced-main");
    closeSidebar();
    main.scrollTop = 0;
    window.scrollTo(0, 0);
    document.title = "NurseTube｜YAKUBON STUDIO 看護の学び";

    const hash = location.hash.replace(/^#/, "") || "/";
    const parts = hash.split("/").filter(Boolean); // 例: ["watch","anat01"]

    if (parts[0] === "watch" && parts[1]) {
      renderWatch(safeDecode(parts[1]));
    } else if (parts[0] === "category" && parts[1]) {
      renderHome(safeDecode(parts[1]));
    } else if (parts[0] === "search" && parts[1]) {
      const q = safeDecode(parts[1]);
      searchInput.value = q;
      renderSearch(q);
    } else {
      renderHome("all");
    }
  }

  // ----------------------- イベント -----------------------
  // カード等のクリック → data-goto のハッシュへ
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-scroll-catalog]")) { document.getElementById("learningCatalog")?.scrollIntoView({ behavior: "auto" }); return; }
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
    try { localStorage.setItem("nursetube-theme", theme); } catch (e) {}
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
    const japanDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    const part = type => japanDate.find(p => p.type === type).value;
    const today = Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day")));
    const [year, month, day] = EXAM_DATE.split("-").map(Number);
    const days = Math.round((Date.UTC(year, month - 1, day) - today) / 86400000);
    if (!Number.isFinite(days)) return;
    const message = days > 0 ? `国試まであと <strong>${days}</strong> 日` :
      days === 0 ? "今日は看護師国家試験の日です" : "国家試験、おつかれさまでした";
    if (examCountdown) examCountdown.innerHTML = message;
    const highlight = document.getElementById("examHighlight");
    if (highlight) highlight.innerHTML = `<div><span>第116回 看護師国家試験</span><p>${message}</p></div><div class="exam-highlight__detail"><time datetime="2027-02-14">2027年2月14日（日）</time><a href="https://www.mhlw.go.jp/kouseiroudoushou/shikaku_shiken/kangoshi/" target="_blank" rel="noopener noreferrer">厚生労働省の正式日程 ↗</a><span>今日のひとつが、力になる。</span></div>`;
  }

  // 端末を離れる／タブを閉じるときは読み上げを止める
  window.addEventListener("beforeunload", () => {
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  });

  // ----------------------- 起動 -----------------------
  let saved = null;
  try { saved = localStorage.getItem("nursetube-theme"); } catch (e) {}
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
  renderCountdown();
  // 開いたまま日付が変わった場合も日本時間で更新する。
  setInterval(renderCountdown, 60000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) renderCountdown(); });
  window.addEventListener("hashchange", router);
  router();
})();
