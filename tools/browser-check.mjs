/* tools/browser-check.mjs
 * 実ブラウザでの動作確認。UI の不具合は node のテストでは捕まらないため、
 * 画面操作そのものを検証する。
 *
 *   npx playwright@1.56.1 install chromium   # 初回のみ（環境によっては不要）
 *   node tools/browser-check.mjs
 *
 * Playwright が無い環境ではスキップして終了する（依存ゼロの方針を崩さない）。
 */
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(new URL('../x', import.meta.url)));
// ESM の解決では見つからない環境があるため CommonJS 側でも探す
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  try {
    const { createRequire } = await import('node:module');
    ({ chromium } = createRequire(import.meta.url)('playwright'));
  } catch {
    console.log('SKIP: playwright が見つからないためブラウザ確認を省略します');
    process.exit(0);
  }
}

const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
                '.css':'text/css; charset=utf-8', '.json':'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;

let failed = 0;
const check = (name, ok, detail) => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok || !detail ? '' : ' — ' + detail));
  if (!ok) failed++;
};

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());

const openAll = () => page.evaluate(() => document.querySelectorAll('details').forEach(d => (d.open = true)));

for (const f of ['dx.html', 'labs.html', 'labs-cbc.html', 'labs-chem.html',
                 'labs-coag.html', 'labs-autoab.html', 'verify.html']) {
  errors.length = 0;
  await page.goto(base + '/' + f, { waitUntil: 'networkidle' });
  if (await page.locator('#dlg-ok').count()) await page.locator('#dlg-ok').click();
  check(f + ' が JS エラーなく開く', errors.length === 0, errors.join(' | '));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(f + ' に横スクロールが出ない', overflow === 0, 'overflow=' + overflow);
}

/* スコア編集が state の差し替え後も反映されること（拡張が mount 時の参照を握る不具合の再発防止） */
await page.goto(base + '/dx.html', { waitUntil: 'networkidle' });
if (await page.locator('#dlg-ok').count()) await page.locator('#dlg-ok').click();
const qsofa = async () => {
  await openAll();
  const card = page.locator('.score-card', { has: page.locator('h4:text-is("qSOFA")') }).first();
  return (await card.locator('.val').textContent()).trim();
};
const editCns = async (value) => {
  await openAll();
  const before = await qsofa();
  await page.locator('select[data-score="qsofa"][data-item="cns"]').first().selectOption(value);
  await page.waitForTimeout(400);
  const saved = await page.evaluate(() => {
    try { return (JSON.parse(localStorage.getItem('nursetube-labs-draft-v1') || '{}').scores || {}).qsofa; }
    catch { return null; }
  });
  return before !== (await qsofa()) && saved && saved.cns === (value === 'true');
};

check('スコア編集が反映される（起動直後）', await editCns('true'));
await openAll();
await page.locator('.preset:has-text("敗血症性ショック（乳酸アシドーシス）")').click();
await page.waitForTimeout(500);
check('スコア編集が反映される（症例プリセット適用後）', await editCns('false'));
await openAll();
await page.locator('#btn-clear').click();
await page.waitForTimeout(500);
check('スコア編集が反映される（入力をすべてクリア後）', await editCns('true'));

/* 照合チェックリストの記録と書き出し */
await page.goto(base + '/verify.html', { waitUntil: 'networkidle' });
await page.locator('#b-open').click();
await page.waitForTimeout(200);
await page.locator('.vitem').first().locator('button[data-m="fix"]').click();
await page.waitForTimeout(200);
await page.reload({ waitUntil: 'networkidle' });
check('照合の記録がリロード後も残る', (await page.locator('.vitem.s-fix').count()) > 0);
await page.locator('#b-export').click();
await page.waitForTimeout(300);
check('要修正の書き出しが機能する', /要修正/.test(await page.locator('#v-out').inputValue()));

await browser.close();
server.close();
console.log(failed ? '\n' + failed + ' 件失敗しました' : '\nブラウザ確認：すべて通過');
process.exit(failed ? 1 : 0);
