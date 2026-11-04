// =========================================================================
// playwright-resolve.mjs
// Playwright をいくつかの場所から探して返します。Windows / macOS / Linux 共通。
//
// 本体（NurseTube）は依存ゼロの方針ですが、ブラウザ自動化だけは
// Playwright が必要です。見つからない場合は入れ方を案内して終了します。
//
// ■ なぜ単純な require では足りないのか
//   `npm install -g` で入れた場所は、Node の既定の探索経路に入りません。
//   そのためプロジェクト内のスクリプトから `require("playwright")` しても
//   見つからないことがあります（Windows の %APPDATA%\npm\node_modules が典型）。
//   そこで `npm root -g` に場所を聞いてから解決します。
// =========================================================================
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

/* グローバル npm の置き場所を npm 自身に聞きます（OS を問わず効きます）。 */
function globalNodeModules() {
  try {
    const out = execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 15000 });
    const dir = out.trim();
    return dir ? [dir] : [];
  } catch {
    return [];
  }
}

/* 念のための既定の置き場所。npm が PATH に無い場合の保険です。 */
function fallbackNodeModules() {
  const list = [];
  if (process.platform === "win32") {
    if (process.env.APPDATA) list.push(path.join(process.env.APPDATA, "npm", "node_modules"));
    if (process.env.ProgramFiles) list.push(path.join(process.env.ProgramFiles, "nodejs", "node_modules"));
  } else {
    // macOS（Homebrew）
    list.push("/opt/homebrew/lib/node_modules");          // Apple Silicon
    list.push("/usr/local/lib/node_modules");             // Intel Mac / 一般的な Linux
    // Linux
    list.push("/opt/node-tools/node_modules");
    list.push("/opt/node22/lib/node_modules");
    list.push("/usr/lib/node_modules");
    // 利用者ごとの置き場所
    list.push(path.join(os.homedir(), ".npm-global", "lib", "node_modules"));
    list.push(path.join(os.homedir(), ".nvm", "versions", "node"));  // nvm は下で展開します
  }
  return list;
}

export async function loadChromium() {
  const tryFrom = (dir) => {
    // createRequire は「ファイル」を基準にするため、ダミーのファイル名を足します
    const req = createRequire(path.join(dir, "__resolve__.js"));
    const pw = req("playwright");
    return pw && pw.chromium ? pw.chromium : null;
  };

  // ① そのまま解決できる場合（プロジェクト内 or NODE_PATH 上）
  try {
    const pw = createRequire(import.meta.url)("playwright");
    if (pw?.chromium) return pw.chromium;
  } catch { /* 次へ */ }

  // ② ESM の import（プロジェクト内に入れた場合に効きます）
  try {
    const pw = await import("playwright");
    const c = pw?.chromium || pw?.default?.chromium;
    if (c) return c;
  } catch { /* 次へ */ }

  // ③ グローバル npm の場所を聞いてから解決
  const tried = [];
  for (const dir of [...globalNodeModules(), ...fallbackNodeModules()]) {
    try {
      const c = tryFrom(dir);
      if (c) return c;
      tried.push(`${dir}（playwright はあるが chromium を持たない）`);
    } catch (e) {
      tried.push(`${dir}（${e.code === "MODULE_NOT_FOUND" ? "見つからず" : e.code || "失敗"}）`);
    }
  }

  const win = process.platform === "win32";
  console.error(`
Playwright が見つかりませんでした。CoeFont の画面操作には必要です。

${win ? "PowerShell か Windows Terminal で" : "ターミナルで"}次を実行してください。

  npm install -g playwright
  npx playwright install chromium

${win ? `Node.js がまだ入っていない場合は、先にこちらを。

  winget install OpenJS.NodeJS.LTS

（または https://nodejs.org/ja から LTS 版を入れてください）
入れたあとは、ターミナルを一度閉じて開き直してください。PATH が通ります。
` : ""}
それでも見つからない場合は、**このフォルダに直接入れる**のが最も確実です。

  npm install playwright

── 探した場所（${tried.length} 件）──
${tried.map((t) => "  - " + t).join("\n") || "  （候補なし。npm が PATH にありますか？）"}

OS: ${process.platform} / Node: ${process.version}
この一覧をそのまま貼っていただければ、原因を特定できます。

NurseTube 本体は依存ゼロのままです。この道具だけが Playwright を使います。
`.trim());
  process.exit(1);
}

// ブラウザの実行ファイルを明示したい環境のための任意の指定
export function launchOptions(extra = {}) {
  const o = { ...extra };
  if (process.env.COEFONT_CHROME) o.executablePath = process.env.COEFONT_CHROME;
  return o;
}
