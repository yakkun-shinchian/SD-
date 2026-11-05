/* =========================================================================
 * RadioDeck — アプリ本体なのだ
 *
 *  ルーティング / 所見の逆引き / 辞典 / 読影手順 / AI読影（自前キー方式）
 *
 *  依存なし・ビルドなし。data は radiology-atlas.js / -figures.js / -signs.js
 * ========================================================================= */

(function () {
  "use strict";

  /* =====================================================================
   * 小道具
   * ===================================================================== */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const main = $("#main");

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // 改行を <br> に（escape した後にだけ使うのだ）
  function nl2br(safe) {
    return safe.replace(/\n/g, "<br>");
  }

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) {
      /* プライベートブラウジングなどでは黙って諦めるのだ */
    }
    return null;
  }

  const URGENCY = {
    emergency: { label: "緊急", cls: "rbadge--emergency" },
    urgent: { label: "準緊急", cls: "rbadge--urgent" },
    routine: { label: "通常", cls: "rbadge--routine" },
  };

  function regionOf(key) {
    return RAD_REGIONS.find((r) => r.key === key) || null;
  }

  function signById(id) {
    return RAD_SIGNS.find((s) => s.id === id) || null;
  }

  function figureHtml(key) {
    const fn = (typeof RAD_FIGURES !== "undefined" && RAD_FIGURES[key]) || RAD_FIGURES.placeholder;
    return `<div class="radfig-wrap">${fn()}</div>`;
  }

  function radiopaediaLink(sign) {
    const q = encodeURIComponent(sign.en || sign.name);
    return `https://radiopaedia.org/search?q=${q}&scope=all`;
  }

  /* =====================================================================
   * レベル（やさしく / しっかり）とテーマ
   * ===================================================================== */

  let level = store("radiodeck-level") === "deep" ? "deep" : "easy";

  function applyLevel() {
    $$(".rlevel__btn").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.level === level));
    });
  }

  function setLevel(next) {
    level = next;
    store("radiodeck-level", next);
    applyLevel();
    router(); // 表示中の内容を描き直すのだ
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = $("#themeToggle");
    if (btn) btn.textContent = theme === "light" ? "☀️" : "🌙";
    store("radiodeck-theme", theme);
  }

  /* =====================================================================
   * 共通パーツのHTML
   * ===================================================================== */

  function urgencyBadge(sign) {
    const u = URGENCY[sign.urgency] || URGENCY.routine;
    return `<span class="rbadge ${u.cls}">${u.label}</span>`;
  }

  function regionBadge(sign) {
    const r = regionOf(sign.region);
    if (!r) return "";
    return `<span class="rbadge rbadge--region">${r.icon} ${escapeHtml(r.label)}</span>`;
  }

  function signCard(sign, matchNote) {
    return `
      <a class="rcard" href="#/sign/${encodeURIComponent(sign.id)}">
        <div class="rcard__top">
          ${urgencyBadge(sign)}
          ${regionBadge(sign)}
          ${matchNote ? `<span class="rmatch">${escapeHtml(matchNote)}</span>` : ""}
        </div>
        <div class="rcard__title">${escapeHtml(sign.name)}</div>
        <div class="rcard__one">${escapeHtml(sign.oneLine)}</div>
      </a>`;
  }

  function emptyState(title, body) {
    return `<div class="rempty"><strong>${escapeHtml(title)}</strong>${escapeHtml(body || "")}</div>`;
  }

  /* =====================================================================
   * ホーム
   * ===================================================================== */

  function viewHome() {
    const regionCards = RAD_REGIONS.map((r) => `
      <a class="rcard rregion-card" href="#/navigate/${r.key}">
        <div class="rregion-card__icon" aria-hidden="true">${r.icon}</div>
        <div class="rcard__title">${escapeHtml(r.label)}</div>
        <div class="rregion-card__blurb">${escapeHtml(r.blurb)}</div>
        <div class="rregion-card__mods">
          ${r.modalities.map((m) => `<span class="rbadge">${escapeHtml(m.label)}</span>`).join("")}
        </div>
      </a>`).join("");

    const counts = RAD_REGIONS.map((r) => {
      const n = RAD_SIGNS.filter((s) => s.region === r.key).length;
      return `${r.icon} ${escapeHtml(r.label)} ${n}件`;
    }).join(" ／ ");

    const emergencies = RAD_SIGNS.filter((s) => s.urgency === "emergency").slice(0, 6);

    return `
      <div class="rhead">
        <h1>「これは何？」と「どうしてそう見えるの？」に、両方こたえるのだ</h1>
        <p>
          所見の名前を覚えるだけなら暗記で足ります。でも<strong>なぜそう見えるのか</strong>がわかると、
          見たことのない所見でも推論できるようになります。RadioDeck は、その「なぜ」を主役にした読影アトラスです。
        </p>
      </div>

      <div class="rtoolbar">
        <a class="rbtn rbtn--primary" href="#/navigate">🔎 見えたものから引く</a>
        <a class="rbtn" href="#/dict">📖 所見辞典（${RAD_SIGNS.length}件）</a>
        <a class="rbtn" href="#/protocol">🧭 読影手順で練習する</a>
        <a class="rbtn" href="#/assist">🤖 AIで学習する</a>
      </div>

      <section class="rsection">
        <h2>領域からはじめる</h2>
        <div class="rcards">${regionCards}</div>
        <p class="rcard__one" style="margin-top:12px">収録：${counts}</p>
      </section>

      <section class="rsection">
        <h2>見逃してはいけない所見</h2>
        <div class="rcards">${emergencies.map((s) => signCard(s)).join("")}</div>
      </section>

      <section class="rsection">
        <h2>CT値（Hounsfield Unit）の目安</h2>
        ${huTable()}
      </section>`;
  }

  function huTable() {
    const rows = RAD_HU.rows.map((r) => `
      <tr>
        <td><span class="rhu__swatch" style="background:${escapeHtml(r.color)}"></span></td>
        <td>${escapeHtml(r.label)}</td>
        <td>${escapeHtml(r.value)}</td>
        <td>${escapeHtml(r.hint)}</td>
      </tr>`).join("");
    const refs = (RAD_HU.refs || []).map(
      (r) => `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.label)}</a>`
    ).join("");
    return `
      <div class="rbox">
        <p style="margin-bottom:12px">${escapeHtml(RAD_HU.note)}</p>
        <table class="rhu">
          <thead><tr><th></th><th>組織</th><th>CT値の目安</th><th>メモ</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="rrefs">${refs}</div>
      </div>`;
  }

  /* =====================================================================
   * 逆引きナビ
   * ===================================================================== */

  // 選択状態は領域ごとに保持するのだ（タブを行き来しても消えないのだ）
  const navState = Object.create(null);

  function selectedTags(regionKey) {
    if (!navState[regionKey]) navState[regionKey] = new Set();
    return navState[regionKey];
  }

  function viewNavigatePicker() {
    const cards = RAD_REGIONS.map((r) => `
      <a class="rcard rregion-card" href="#/navigate/${r.key}">
        <div class="rregion-card__icon" aria-hidden="true">${r.icon}</div>
        <div class="rcard__title">${escapeHtml(r.label)}から引く</div>
        <div class="rregion-card__blurb">${escapeHtml(r.blurb)}</div>
      </a>`).join("");

    return `
      <div class="rhead">
        <h1>🔎 見えたものから、所見を引く</h1>
        <p>画像を見ながら「どこに・どんな形で・どんな濃さで見えるか」を選んでいくと、候補の所見が絞り込まれます。まず領域を選んでください。</p>
      </div>
      <div class="rcards">${cards}</div>`;
  }

  function scoreSign(sign, tags) {
    let hit = 0;
    tags.forEach((t) => {
      if (sign.patterns && sign.patterns.indexOf(t) !== -1) hit += 1;
    });
    return hit;
  }

  function viewNavigate(regionKey) {
    const region = regionOf(regionKey);
    if (!region) return emptyState("領域が見つかりません", "ホームから選び直してください。");

    const axes = RAD_AXES[regionKey] || [];
    const tags = selectedTags(regionKey);

    const axesHtml = axes.map((axis) => `
      <div class="raxis">
        <div class="raxis__q">${escapeHtml(axis.label)}${axis.optional ? '<span class="rbadge" style="margin-left:8px">任意</span>' : ""}</div>
        ${axis.hint ? `<div class="raxis__hint">${escapeHtml(axis.hint)}</div>` : ""}
        <div class="raxis__opts">
          ${axis.options.map((o) => `
            <button type="button" class="rchip" data-tag="${escapeHtml(o.tag)}"
                    aria-pressed="${tags.has(o.tag)}">
              ${escapeHtml(o.label)}
              ${o.sub ? `<small>${escapeHtml(o.sub)}</small>` : ""}
            </button>`).join("")}
        </div>
      </div>`).join("");

    const pool = RAD_SIGNS.filter((s) => s.region === regionKey);
    let results;
    let countLabel;

    if (tags.size === 0) {
      results = pool.slice().sort((a, b) => {
        const order = { emergency: 0, urgent: 1, routine: 2 };
        return order[a.urgency] - order[b.urgency];
      });
      countLabel = `${region.label}の所見を${results.length}件すべて表示しています。上の選択肢を選ぶと絞り込まれます。`;
    } else {
      results = pool
        .map((s) => ({ sign: s, score: scoreSign(s, tags) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => Object.assign(x.sign, { __score: x.score }));
      countLabel = `${tags.size}個の特徴を選択中 — ${results.length}件が該当しました（一致数の多い順）。`;
    }

    const cards = results.length
      ? results.map((s) =>
          signCard(s, tags.size && s.__score ? `${s.__score}/${tags.size} 一致` : "")
        ).join("")
      : emptyState(
          "該当する所見がありませんでした",
          "選択を減らしてみてください。組み合わせが珍しいほど、候補は少なくなります。"
        );

    return `
      <div class="rhead">
        <h1>${region.icon} ${escapeHtml(region.label)}の所見を逆引きする</h1>
        <p>${escapeHtml(region.blurb)}</p>
      </div>

      <div class="rtoolbar">
        <a class="rbtn" href="#/navigate">← 領域を変える</a>
        <button type="button" class="rbtn" id="navReset">選択をクリア</button>
        ${region.modalities.map((m) => `<span class="rbadge">${escapeHtml(m.label)}</span>`).join("")}
      </div>

      <div id="navAxes">${axesHtml}</div>

      <section class="rsection">
        <h2>候補の所見</h2>
        <div class="rresult-count">${escapeHtml(countLabel)}</div>
        <div class="rcards">${cards}</div>
      </section>`;
  }

  function bindNavigate(regionKey) {
    const tags = selectedTags(regionKey);
    $$("#navAxes .rchip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const t = chip.dataset.tag;
        if (tags.has(t)) tags.delete(t);
        else tags.add(t);
        render(viewNavigate(regionKey));
        bindNavigate(regionKey);
      });
    });
    const reset = $("#navReset");
    if (reset) {
      reset.addEventListener("click", () => {
        tags.clear();
        render(viewNavigate(regionKey));
        bindNavigate(regionKey);
      });
    }
  }

  /* =====================================================================
   * 所見辞典
   * ===================================================================== */

  function viewDict(regionKey) {
    const filters = [`<a class="rbtn ${!regionKey ? "rbtn--primary" : ""}" href="#/dict">すべて</a>`]
      .concat(
        RAD_REGIONS.map((r) =>
          `<a class="rbtn ${regionKey === r.key ? "rbtn--primary" : ""}" href="#/dict/${r.key}">${r.icon} ${escapeHtml(r.label)}</a>`
        )
      ).join("");

    const list = RAD_SIGNS.filter((s) => !regionKey || s.region === regionKey);

    const grouped = RAD_REGIONS.map((r) => {
      const items = list.filter((s) => s.region === r.key);
      if (!items.length) return "";
      return `
        <section class="rsection">
          <h2>${r.icon} ${escapeHtml(r.label)}（${items.length}件）</h2>
          <div class="rcards">${items.map((s) => signCard(s)).join("")}</div>
        </section>`;
    }).join("");

    return `
      <div class="rhead">
        <h1>📖 所見辞典</h1>
        <p>所見の定義・<strong>なぜそう見えるのか</strong>・鑑別・読影のコツ・落とし穴をまとめています。現在 ${RAD_SIGNS.length} 件を収録しています。</p>
      </div>
      <div class="rtoolbar">${filters}</div>
      ${grouped || emptyState("まだ所見がありません", "")}`;
  }

  function viewSign(id) {
    const sign = signById(id);
    if (!sign) return emptyState("その所見は見つかりませんでした", "辞典から選び直してください。");

    const body = level === "deep" ? sign.deep : sign.easy;
    const levelNote =
      level === "deep"
        ? "専門水準の記述を表示しています。やさしい説明に切り替えるには、右上の「やさしく」を押してください。"
        : "やさしい説明を表示しています。専門水準の記述は、右上の「しっかり」で切り替えられます。";

    const mech = (sign.mechanism || []).map((m) => `
      <div class="rstep">
        <div class="rstep__no" aria-hidden="true"></div>
        <div class="rstep__body">
          <h4>${escapeHtml(m.step)}</h4>
          <p>${nl2br(escapeHtml(m.text))}</p>
        </div>
      </div>`).join("");

    const ddx = (sign.ddx || []).map((d) => `
      <tr><td>${escapeHtml(d.name)}</td><td>${escapeHtml(d.hint || "")}</td></tr>`).join("");

    const refs = (sign.refs || [])
      .map((r) => `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.label)}</a>`)
      .join("");

    const related = RAD_SIGNS.filter(
      (s) => s.id !== sign.id && s.region === sign.region &&
        s.patterns.some((p) => sign.patterns.indexOf(p) !== -1)
    ).slice(0, 4);

    return `
      <div class="rtoolbar">
        <a class="rbtn" href="#/dict/${sign.region}">← ${escapeHtml(regionOf(sign.region).label)}の一覧へ</a>
        <a class="rbtn" href="#/navigate/${sign.region}">🔎 逆引きで探す</a>
      </div>

      <div class="rdetail__head">
        <h1 class="rdetail__title">${escapeHtml(sign.name)}</h1>
        <div class="rdetail__en">${escapeHtml(sign.en || "")}</div>
        <div class="rdetail__meta">
          ${urgencyBadge(sign)}
          ${regionBadge(sign)}
          ${(sign.modality || []).map((m) => `<span class="rbadge">${escapeHtml(m)}</span>`).join("")}
        </div>
        <div class="rdetail__one">${escapeHtml(sign.oneLine)}</div>
      </div>

      <div class="rgrid rgrid--2">
        <div class="rbox">
          <h3>📝 解説</h3>
          <p>${nl2br(escapeHtml(body))}</p>
          <p class="rcard__one" style="margin-top:14px">${escapeHtml(levelNote)}</p>
        </div>
        <div>
          ${figureHtml(sign.figure)}
        </div>
      </div>

      <section class="rsection">
        <h2>なぜそう見えるのか</h2>
        <div class="rbox">${mech || "<p>準備中です。</p>"}</div>
      </section>

      <div class="rgrid rgrid--2" style="margin-top:18px">
        <div class="rbox">
          <h3>👀 どこをどう見るか</h3>
          <ul>${(sign.lookFor || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        </div>
        <div class="rbox">
          <h3>🔀 鑑別</h3>
          <table class="rddx">
            <thead><tr><th>鑑別疾患・病態</th><th>見分けるポイント</th></tr></thead>
            <tbody>${ddx}</tbody>
          </table>
        </div>
      </div>

      <div class="rgrid rgrid--2" style="margin-top:18px">
        <div class="rbox">
          <h3>💡 覚えておくと効くこと</h3>
          <ul class="rlist--pearls">${(sign.pearls || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        </div>
        <div class="rbox">
          <h3>⚠️ 落とし穴</h3>
          <ul class="rlist--pitfalls">${(sign.pitfalls || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        </div>
      </div>

      <section class="rsection">
        <h2>さらに調べる</h2>
        <div class="rbox">
          <p style="margin-bottom:10px">
            本アプリの図は模式図です。実際の画像を見たいときは、症例データベースで確認してください。
          </p>
          <div class="rrefs">
            <a href="${escapeHtml(radiopaediaLink(sign))}" target="_blank" rel="noopener noreferrer">
              Radiopaedia で「${escapeHtml(sign.en || sign.name)}」の実例を見る
            </a>
            ${refs}
          </div>
        </div>
      </section>

      ${related.length ? `
      <section class="rsection">
        <h2>似た見た目になる所見</h2>
        <div class="rcards">${related.map((s) => signCard(s)).join("")}</div>
      </section>` : ""}`;
  }

  /* =====================================================================
   * 読影手順
   * ===================================================================== */

  function viewProtocolList() {
    const cards = RAD_PROTOCOLS.map((p) => {
      const r = regionOf(p.region);
      return `
        <a class="rcard" href="#/protocol/${p.key}">
          <div class="rcard__top">
            <span class="rbadge rbadge--region">${r ? r.icon + " " + escapeHtml(r.label) : ""}</span>
            <span class="rbadge">${p.steps.length}ステップ</span>
          </div>
          <div class="rcard__title">${escapeHtml(p.title)}</div>
          <div class="rcard__one">${escapeHtml(p.lead.slice(0, 76))}…</div>
        </a>`;
    }).join("");

    return `
      <div class="rhead">
        <h1>🧭 系統的読影手順</h1>
        <p>
          見落としは、能力の問題ではなく<strong>手順の問題</strong>です。毎回まったく同じ順番で見れば、
          見ていない場所がなくなります。チェックを入れながら、実際の画像で練習してみてください。
        </p>
      </div>
      <div class="rcards">${cards}</div>`;
  }

  function viewProtocol(key) {
    const p = RAD_PROTOCOLS.find((x) => x.key === key);
    if (!p) return emptyState("その手順は見つかりませんでした", "一覧から選び直してください。");

    const steps = p.steps.map((s, i) => `
      <div class="rstepcard">
        <div class="rstepcard__h">
          <div class="rstepcard__key">${escapeHtml(s.key)}</div>
          <h3>${escapeHtml(s.label)}</h3>
        </div>
        ${s.checks.map((c, j) => `
          <label class="rcheck">
            <input type="checkbox" data-ck="${escapeHtml(p.key)}-${i}-${j}" />
            <span>${escapeHtml(c)}</span>
          </label>`).join("")}
        ${s.why ? `<div class="rwhy"><strong>なぜ見るのか：</strong>${escapeHtml(s.why)}</div>` : ""}
      </div>`).join("");

    return `
      <div class="rtoolbar">
        <a class="rbtn" href="#/protocol">← 手順の一覧へ</a>
        <button type="button" class="rbtn" id="protoReset">チェックをリセット</button>
      </div>
      <div class="rhead">
        <h1>${escapeHtml(p.title)}</h1>
      </div>
      <div class="rproto__lead">${escapeHtml(p.lead)}</div>
      ${steps}`;
  }

  function bindProtocol(key) {
    const saved = JSON.parse(store("radiodeck-checks") || "{}");
    $$("input[data-ck]").forEach((box) => {
      const id = box.dataset.ck;
      box.checked = !!saved[id];
      box.addEventListener("change", () => {
        const cur = JSON.parse(store("radiodeck-checks") || "{}");
        if (box.checked) cur[id] = 1;
        else delete cur[id];
        store("radiodeck-checks", JSON.stringify(cur));
      });
    });
    const reset = $("#protoReset");
    if (reset) {
      reset.addEventListener("click", () => {
        const cur = JSON.parse(store("radiodeck-checks") || "{}");
        Object.keys(cur).forEach((k) => {
          if (k.indexOf(key + "-") === 0) delete cur[k];
        });
        store("radiodeck-checks", JSON.stringify(cur));
        $$("input[data-ck]").forEach((b) => { b.checked = false; });
      });
    }
  }

  /* =====================================================================
   * 検索
   * ===================================================================== */

  function viewSearch(q) {
    const needle = (q || "").trim().toLowerCase();
    if (!needle) return viewDict(null);

    const hits = RAD_SIGNS.filter((s) => {
      const hay = [
        s.name, s.en, s.reading, s.oneLine, s.easy, s.deep,
        (s.modality || []).join(" "),
        (s.ddx || []).map((d) => d.name).join(" "),
      ].join(" ").toLowerCase();
      return hay.indexOf(needle) !== -1;
    });

    return `
      <div class="rhead">
        <h1>「${escapeHtml(q)}」の検索結果</h1>
        <p>${hits.length}件が見つかりました。</p>
      </div>
      ${hits.length
        ? `<div class="rcards">${hits.map((s) => signCard(s)).join("")}</div>`
        : emptyState("見つかりませんでした", "所見名の一部や、見た目の言葉（三日月、すりガラス、washout など）でも探せます。")}`;
  }

  /* =====================================================================
   * AI読影（自前APIキー方式）
   * ===================================================================== */

  const MODELS = [
    { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5（速くて安い・まずはこれ）" },
    { id: "claude-opus-5-5", label: "Claude Opus 5.5（最も丁寧だが高価）" },
  ];

  // Public build: text-only. No upload, FileReader, image payload, or enable flag.
  const ASSIST_SYSTEM = [
    "あなたは読影の基礎を教える学習アシスタントです。医師ではありません。",
    "一般的な所見の機序・物理・病態生理を説明してください。個別患者の診断は行いません。",
    "個人情報を求めず、入力に含まれていても再掲しないでください。",
    "これは学習用の解説であり、実際の診断は医師の判断によります、と付記してください。",
  ].join("\n");

  function viewAssist() {

    const savedModel = store("radiodeck-model") || MODELS[0].id;

    return `
      <div class="rhead">
        <h1>🤖 AI学習アシスタント</h1>
        <p>
          「ケーリーBラインはどうしてできるの？」など、一般的な知識をテキストで学べます。
        </p>
      </div>

      <div class="rassist__warn">
        <h3>⚠️ 使う前に、必ずお読みください</h3>
        <ul>
          <li><strong>公開版では画像の取り込み・送信はできません。</strong>患者画像や個人情報を自動判別・除去する機能はありません。</li>
          <li>質問は Anthropic の外部APIへ送信されます。氏名・ID・診療記録などを入力せず、一般的な学習質問だけを送ってください。</li>
          <li>AIの回答は学習の補助であり、診断ではありません。誤りが含まれる場合があります。</li>
          <li>あなた自身のAPIキーを使い、利用料はあなたのアカウントに課金されます。</li>
          <li>APIキーは保存しません。この画面を離れるかクリアすると消えます。送信時のみ認証用に Anthropic へ送ります。</li>
        </ul>
      </div>

      <div class="rbox">
        <div class="rfield">
          <label for="apiKey">Anthropic APIキー</label>
          <div class="rfield__hint">
            console.anthropic.com で発行できます（sk-ant- で始まる文字列）。
          </div>
          <input class="rinput" type="password" id="apiKey" placeholder="sk-ant-..." value="" autocomplete="off" />
        </div>

        <div class="rfield">
          <label for="modelSel">モデル</label>
          <select class="rselect" id="modelSel">
            ${MODELS.map((m) => `<option value="${escapeHtml(m.id)}" ${m.id === savedModel ? "selected" : ""}>${escapeHtml(m.label)}</option>`).join("")}
          </select>
        </div>

        <div class="rfield">
          <label for="question">質問</label>
          <textarea class="rtextarea" id="question" placeholder="例）ケーリーBラインができる仕組みを教えてください（患者情報は入力しないでください）"></textarea>
        </div>

        <label class="rcheck">
          <input type="checkbox" id="textConfirmed" />
          <span>この質問に患者情報が含まれないことを確認し、Anthropic へのテキスト送信に同意します。</span>
        </label>
        <div class="rtoolbar">
          <button type="button" class="rbtn rbtn--primary" id="askBtn">学習質問を送信する</button>
          <button type="button" class="rbtn" id="clearBtn">入力をクリア</button>
        </div>
        <div class="rstatus" id="status"></div>
      </div>

      <div id="answerWrap"></div>`;
  }

  function bindAssist() {
    const status = $("#status");
    const answerWrap = $("#answerWrap");
    const questionInput = $("#question");
    const confirmed = $("#textConfirmed");
    let confirmedText = null;
    let sending = false;
    function setStatus(msg, isError) {
      status.textContent = msg || "";
      status.className = "rstatus" + (isError ? " rstatus--error" : "");
    }
    function revoke() { confirmed.checked = false; confirmedText = null; }
    questionInput.addEventListener("input", revoke);
    confirmed.addEventListener("change", () => {
      confirmedText = confirmed.checked ? questionInput.value.trim() : null;
    });
    // Scoped to the current view: no document listeners accumulate on navigation.
    main.onpaste = (e) => {
      revoke();
      const data = e.clipboardData;
      if (data && ((data.files || []).length || Array.from(data.items || []).some(i => i.kind === "file" || /^image\//.test(i.type)))) {
        e.preventDefault();
        setStatus("公開版では画像を取り込めません。学習質問をテキストで入力してください。", true);
      }
    };
    main.ondragover = e => e.preventDefault();
    main.ondrop = e => {
      e.preventDefault();
      revoke();
      setStatus("公開版ではドラッグ＆ドロップを受け付けません。", true);
    };
    $("#clearBtn").addEventListener("click", () => {
      revoke();
      $("#apiKey").value = "";
      questionInput.value = "";
      answerWrap.innerHTML = "";
      setStatus("");
    });

    $("#askBtn").addEventListener("click", async () => {
      const key = $("#apiKey").value.trim();
      const model = $("#modelSel").value;
      const question = $("#question").value.trim();
      if (sending) return;
      if (!key) { setStatus("APIキーを入力してください。", true); return; }
      if (!question) { setStatus("学習質問を入力してください。", true); return; }
      if (!confirmed.checked || confirmedText !== question) {
        revoke();
        setStatus("質問に患者情報が含まれないことを送信前に確認してください。", true);
        return;
      }
      // Construct a fresh text-only request. Never serialize DOM/clipboard/file state.
      const content = [{ type: "text", text: question }];
      revoke();
      store("radiodeck-model", model);
      sending = true;

      const btn = $("#askBtn");
      btn.disabled = true;
      setStatus("AIが学習質問への回答を作成しています…");
      answerWrap.innerHTML = "";

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 2400,
            system: ASSIST_SYSTEM,
            messages: [{ role: "user", content: content }],
          }),
        });

        if (!res.ok) {
          let detail = "";
          try {
            const err = await res.json();
            detail = (err && err.error && err.error.message) || "";
          } catch (e) { /* JSONでない場合もあるのだ */ }
          throw new Error(
            `APIがエラーを返しました（HTTP ${res.status}）${detail ? "：" + detail : ""}`
          );
        }

        const json = await res.json();
        const text = (json.content || [])
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n");

        setStatus("");
        renderAnswer(text || "（回答が空でした）");
      } catch (err) {
        setStatus(
          "うまくいきませんでした。" + (err && err.message ? err.message : "") +
            "／APIキーが正しいか、残高があるか、ネットワークがつながっているかを確認してください。",
          true
        );
      } finally {
        sending = false;
        btn.disabled = false;
      }
    });

    function renderAnswer(text) {
      // 回答文に出てくる所見名を辞典へつなぐのだ
      const mentioned = RAD_SIGNS.filter((s) => {
        const n = s.name.replace(/（.*?）/g, "");
        return text.indexOf(n) !== -1 || (s.en && text.toLowerCase().indexOf(s.en.toLowerCase()) !== -1);
      }).slice(0, 6);

      answerWrap.innerHTML = `
        <div class="ranswer">
          <h3>🩻 AIの学習用回答</h3>
          ${nl2br(escapeHtml(text))}
        </div>
        ${mentioned.length ? `
          <div class="rsection">
            <h2>回答に出てきた所見を、辞典で確かめる</h2>
            <div class="rrelated">
              ${mentioned.map((s) => `<a class="rbtn" href="#/sign/${encodeURIComponent(s.id)}">${escapeHtml(s.name)}</a>`).join("")}
            </div>
          </div>` : ""}`;
    }
  }

  /* =====================================================================
   * 免責の詳細
   * ===================================================================== */

  function disclaimerFullHtml() {
    return `
      <div class="rdisclaimer-full" id="disclaimerFull" hidden>
        <h2>このアプリについて（くわしく）</h2>
        <ul>
          <li><strong>学習用です。</strong>実際の患者さんの診断・治療方針の決定には使用できません。</li>
          <li><strong>図はすべて自作の模式図です。</strong>実際の患者画像ではなく、他者の画像を転載したものでもありません。所見の「見え方」の要点だけを抜き出して描いています。</li>
          <li><strong>本物の画像は情報量が多すぎて初学者には読めません。</strong>だからあえて模式図にしています。実例は Radiopaedia などの症例データベースへのリンクから確認してください。</li>
          <li><strong>内容は教科書・ガイドライン・文献を参照して作成していますが、</strong>医学は更新されます。診療の判断は必ず最新の一次情報と指導医の判断に拠ってください。</li>
          <li><strong>AI学習タブ</strong>は、一般的な学習質問のテキストのみをAnthropicへ送信します。画像入力はできません。患者情報を入力しないでください。</li>
          <li>CT値などの数値は装置・撮影条件で変動します。目安としてお使いください。</li>
        </ul>
      </div>`;
  }

  /* =====================================================================
   * ルーター
   * ===================================================================== */

  function render(html) {
    main.onpaste = main.ondrop = main.ondragover = null;
    main.innerHTML = disclaimerFullHtml() + html;
    const full = $("#disclaimerFull");
    if (full && disclaimerOpen) full.hidden = false;
  }

  let disclaimerOpen = false;

  function setActiveTab(tab) {
    $$(".rtab").forEach((a) => {
      if (a.dataset.tab === tab) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function router() {
    const raw = location.hash.replace(/^#\/?/, "");
    const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);
    const head = parts[0] || "";

    window.scrollTo({ top: 0, behavior: "auto" });

    if (head === "navigate") {
      setActiveTab("navigate");
      if (parts[1]) {
        render(viewNavigate(parts[1]));
        bindNavigate(parts[1]);
      } else {
        render(viewNavigatePicker());
      }
      return;
    }

    if (head === "dict") {
      setActiveTab("dict");
      render(viewDict(parts[1] || null));
      return;
    }

    if (head === "sign") {
      setActiveTab("dict");
      render(viewSign(parts[1]));
      return;
    }

    if (head === "protocol") {
      setActiveTab("protocol");
      if (parts[1]) {
        render(viewProtocol(parts[1]));
        bindProtocol(parts[1]);
      } else {
        render(viewProtocolList());
      }
      return;
    }

    if (head === "assist") {
      setActiveTab("assist");
      render(viewAssist());
      bindAssist();
      return;
    }

    if (head === "search") {
      setActiveTab("dict");
      render(viewSearch(parts.slice(1).join("/")));
      return;
    }

    setActiveTab("");
    render(viewHome());
  }

  /* =====================================================================
   * 起動
   * ===================================================================== */

  function init() {
    // Remove legacy persisted credentials even when opening a non-AI route.
    store("radiodeck-apikey", null);
    try { sessionStorage.removeItem("radiodeck-apikey"); } catch (e) {}
    // テーマ
    const savedTheme = store("radiodeck-theme");
    applyTheme(savedTheme === "light" ? "light" : "dark");
    $("#themeToggle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      applyTheme(cur === "light" ? "dark" : "light");
    });

    // レベル
    applyLevel();
    $$(".rlevel__btn").forEach((b) => {
      b.addEventListener("click", () => setLevel(b.dataset.level));
    });

    // 検索
    $("#searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = $("#searchInput").value.trim();
      location.hash = q ? "#/search/" + encodeURIComponent(q) : "#/dict";
    });

    // 免責の開閉
    $("#disclaimerMore").addEventListener("click", () => {
      disclaimerOpen = !disclaimerOpen;
      const full = $("#disclaimerFull");
      if (full) full.hidden = !disclaimerOpen;
    });

    window.addEventListener("hashchange", router);
    router();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

