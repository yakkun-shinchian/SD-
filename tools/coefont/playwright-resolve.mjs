// =========================================================================
// playwright-resolve.mjs
// Playwright をいくつかの場所から探して返します。
// 本体（NurseTube）は依存ゼロの方針ですが、ブラウザ自動化だけは
// Playwright が必要です。見つからない場合は入れ方を案内して終了します。
// =========================================================================
import { createRequire } from "node:module";

const CANDIDATES = [
  // そのまま解決できる場合（プロジェクト内 or NODE_PATH 上）
  () => createRequire(import.meta.url)("playwright"),
  // グローバル・共有インストール（環境によってパスが異なります）
  () => createRequire("/opt/node-tools/package.json")("playwright"),
  () => createRequire("/opt/node22/lib/node_modules/npm/package.json")("playwright"),
  () => createRequire("/usr/lib/node_modules/npm/package.json")("playwright"),
];

export async function loadChromium() {
  for (const tryLoad of CANDIDATES) {
    try {
      const pw = tryLoad();
      if (pw && pw.chromium) return pw.chromium;
    } catch { /* 次の候補へ */ }
  }
  try {
    const pw = await import("playwright");
    if (pw?.chromium) return pw.chromium;
    if (pw?.default?.chromium) return pw.default.chromium;
  } catch { /* 下の案内へ */ }

  console.error(`
Playwright が見つかりませんでした。CoeFont の画面操作には必要です。

  npm install -g playwright && npx playwright install chromium

を実行してから、もう一度お試しください。
（NurseTube 本体は依存ゼロのままです。この道具だけが Playwright を使います）
`.trim());
  process.exit(1);
}

// ブラウザの実行ファイルを明示したい環境のための任意の指定
export function launchOptions(extra = {}) {
  const o = { ...extra };
  if (process.env.COEFONT_CHROME) o.executablePath = process.env.COEFONT_CHROME;
  return o;
}
