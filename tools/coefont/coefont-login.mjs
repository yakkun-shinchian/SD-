// =========================================================================
// coefont-login.mjs   ── 初回だけ実行します
//
// ブラウザを開きます。利用者が自分の手で Google ログインを済ませてください。
// そのセッションは tools/coefont/.profile/ に保存され、以降の実行では
// ログイン操作が不要になります。
//
//   node tools/coefont/coefont-login.mjs
//
// ■ パスワードについて
//   このスクリプトはパスワードを受け取らず、保存もせず、見てもいません。
//   ログインは利用者の画面で利用者が行います。保存されるのはブラウザの
//   プロファイル（.profile/ ・gitignore 済み）だけです。
// =========================================================================
import path from "node:path";
import fs from "node:fs";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { loadChromium, launchOptions } from "./playwright-resolve.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const profileDir = path.join(here, ".profile");
const START_URL = process.env.COEFONT_URL || "https://coefont.cloud/";

const ask = (q) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); resolve(a); });
  });

const chromium = await loadChromium();
fs.mkdirSync(profileDir, { recursive: true });

console.log(`
──────────────────────────────────────────────
 CoeFont ログイン（初回のみ）
──────────────────────────────────────────────
ブラウザを開きます。次の操作をお願いします。

  1) Google アカウントでログイン
  2) テキスト読み上げ（Text to Speech）の編集画面まで進む
  3) この画面にもどって Enter

プロファイルの保存先: ${profileDir}
`.trim());

const context = await chromium.launchPersistentContext(
  profileDir,
  launchOptions({
    headless: false,
    viewport: { width: 1440, height: 950 },
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    args: ["--disable-blink-features=AutomationControlled"],
  })
);

const page = context.pages()[0] || (await context.newPage());
try {
  await page.goto(START_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
} catch (e) {
  console.log(`\n⚠ ${START_URL} を開けませんでした: ${e.message}`);
  console.log("  ブラウザのアドレス欄から手動で開いていただいても構いません。");
}

await ask("\nログインと編集画面への移動が済んだら Enter を押してください > ");

// いまどこにいるかを記録（選択子づくりの手がかりになります）
const snapshot = {
  savedAt: new Date().toISOString(),
  url: page.url(),
  title: await page.title().catch(() => ""),
  cookieDomains: [...new Set((await context.cookies()).map((c) => c.domain))].sort(),
};
fs.writeFileSync(path.join(here, "login-state.json"), JSON.stringify(snapshot, null, 2) + "\n", "utf8");

console.log(`
──────────────────────────────────────────────
 保存しました
──────────────────────────────────────────────
  現在のURL   : ${snapshot.url}
  ページ題名  : ${snapshot.title}
  Cookieドメイン: ${snapshot.cookieDomains.join(", ") || "（なし）"}

次は画面の採寸です:

  node tools/coefont/coefont-probe.mjs
`.trim());

await context.close();
