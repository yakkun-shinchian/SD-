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

/* 主訴からの診断アプローチ（dx-cc.js）が主訴の選択と身体所見に追従すること */
await page.goto(base + '/dx.html', { waitUntil: 'networkidle' });
if (await page.locator('#dlg-ok').count()) await page.locator('#dlg-ok').click();
await page.locator('#btn-clear').click();
await page.waitForTimeout(400);
const ccCard = () => page.locator('details.cc', { has: page.locator('summary:has-text("胸痛")') }).first();
const dissection = () => ccCard().locator('.cc-killer', { has: page.locator('h4:has-text("急性大動脈解離")') }).first();

check('主訴を選ぶ前は主訴カードの代わりに案内が出る',
  (await ccCard().count()) === 0 &&
  /主訴・症状/.test(await page.locator('.card:has-text("主訴からの診断アプローチ") .empty').first().textContent()));

await openAll();
await page.locator('.chip[data-group="complaints"][data-key="chest_pain"]').click();
await page.waitForTimeout(400);
check('主訴「胸痛」を選ぶと主訴カードが出る', (await ccCard().count()) === 1);
check('胸痛カードが急性大動脈解離を「まず外す疾患」に挙げる', (await dissection().count()) === 1);

const litBefore = await ccCard().locator('.cc-sig.on').count();
const cntBefore = (await dissection().locator('.cnt').textContent()).trim();
await openAll();
await page.locator('select[data-lab="hx_bp_lr"]').first().selectOption('あり（20mmHg 以上）');
await page.waitForTimeout(400);
const litAfter = await ccCard().locator('.cc-sig.on').count();
const cntAfter = (await dissection().locator('.cnt').textContent()).trim();
check('身体所見「血圧の左右差あり」で red flag が点灯する', litAfter > litBefore,
  litBefore + ' → ' + litAfter);
check('同じ所見で大動脈解離の該当数が増える', cntBefore !== cntAfter, cntBefore + ' → ' + cntAfter);
check('点灯件数が主訴カードの見出しにも出る',
  /red flag \d+ 件 点灯/.test(await ccCard().locator('summary').textContent()));

/* 問診・身体所見は「検査値の一覧」には出さない（hideItems） */
check('問診・身体所見が入力値一覧表に混ざらない',
  !/血圧の左右差/.test(await page.locator('.card:has-text("入力値の一覧と判定")').first().textContent()));

/* 安全性の条件が実際のカードに表示され、長文化しても横にはみ出さないこと */
for (const width of [390, 1200]) {
  await page.setViewportSize({ width, height: 900 });
  for (const key of await page.evaluate(() => DXCC.covered())) {
    await page.locator('#btn-clear').click();
    await page.waitForTimeout(400);
    await openAll();
    await page.locator('.chip[data-group="complaints"][data-key="' + key + '"]').click();
    await page.waitForTimeout(400);
    const card = page.locator('details.cc').first();
    await card.waitFor();
    await openAll();
    const body = await card.textContent();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    check(width + 'px ' + key + ' のカード・条件文・表示幅',
      (await page.locator('details.cc').count()) === 1 && !overflow &&
      !/頭部CT → 腰椎穿刺|気胸を疑えば画像前に胸腔穿刺/.test(body));
    if (['fever', 'headache', 'consciousness', 'convulsion'].includes(key))
      check(width + 'px ' + key + ' に腰椎穿刺の条件を表示',
        /CTは一律には行わない/.test(body) && /GCS 9以下/.test(body) && /抗菌薬.*画像より先/.test(body));
    if (['dyspnea', 'chest_pain'].includes(key))
      check(width + 'px ' + key + ' に減圧の適応と安定例を表示',
        /循環不安定または重度の呼吸障害/.test(body) && /安定した気胸疑い/.test(body));
  }
}
await page.setViewportSize({ width: 1200, height: 1000 });

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
