// =========================================================================
// ui-summary.mjs
// 採寸結果（coefont-probe.mjs が出す JSON）を「チャットに貼れる1枚」にたたみます。
//
// JSON は大きく、画面写真は貼れません。選択子を書くのに要る情報
// —— 役割・文言・aria・testid・id、そしてそれらで当てられない要素の CSS ——
// だけを残します。純粋な関数なので、ブラウザなしで検証できます。
// =========================================================================

export function summarize(data, { maxElements = 150 } = {}) {
  const cut = (v, n) => (v == null ? "" : String(v).replace(/\s+/g, " ").trim().slice(0, n));
  const L = [];
  L.push(`## 段階 ${data.step}  ${cut(data.title, 60) || "(無題)"}`);
  L.push(`URL: ${data.url}`);
  if (data.headings?.length) L.push(`見出し: ${data.headings.slice(0, 6).map((h) => cut(h, 30)).join(" / ")}`);
  const frames = (data.iframes || []).filter(Boolean);
  if (frames.length) L.push(`iframe: ${frames.map((f) => cut(f, 60)).join(" / ")}`);

  const vis = (data.elements || []).filter((e) => e.visible);
  L.push(`操作できる要素 ${vis.length} 個（見えているものだけ）`);
  for (const e of vis.slice(0, maxElements)) {
    const tag = e.tag + (e.type ? `[${e.type}]` : "") + (e.role ? `(${e.role})` : "");
    const bits = [];
    if (e.text) bits.push(`「${cut(e.text, 40)}」`);
    if (e.attrs?.["aria-label"]) bits.push(`aria=${cut(e.attrs["aria-label"], 30)}`);
    if (e.placeholder) bits.push(`ph=${cut(e.placeholder, 30)}`);
    if (e.attrs?.["data-testid"]) bits.push(`testid=${cut(e.attrs["data-testid"], 30)}`);
    if (e.id) bits.push(`#${e.id}`);
    // 文言や id で当てられるものに CSS は不要（最も脆いので最後の手段）
    const needCss = bits.length === 0;
    L.push(`- ${tag} ${bits.join(" ") || "（文言なし）"}${needCss ? `  css:${cut(e.css, 70)}` : ""}`);
  }
  if (vis.length > maxElements) L.push(`…ほか ${vis.length - maxElements} 個（多すぎるため省略）`);

  for (const sel of data.selects || []) {
    if (!sel.options?.length) continue;
    L.push(`select ${cut(sel.name, 40)}: ${sel.options.slice(0, 10).map((o) => cut(o.label || o.value, 20)).join(" / ")}`);
  }
  return L.join("\n") + "\n";
}
