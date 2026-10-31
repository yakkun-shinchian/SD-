// No dependencies. Run from any directory: node tools/check-classic-content.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const load = (path, name) => JSON.parse(JSON.stringify(vm.runInNewContext(read(path) + `\n;${name}`, {}, { timeout: 1000 })));
const current = load('scenes.js', 'SCENES');
const classic = load('nurse-classic/scenes.js', 'SCENES');
const programs = load('data.js', 'PROGRAMS');
const classics = load('nurse-classic/data.js', 'PROGRAMS');
const errors = [];
const check = (label, a, b) => { try { assert.deepEqual(a, b); } catch { errors.push(label); } };
check('program IDs/order', classics.map(p => p.id), programs.map(p => p.id));
check('scene program IDs/order', Object.keys(classic), Object.keys(current));
check('catalog/scene coverage', Object.keys(current).sort(), programs.map(p => p.id).sort());
let count = 0;
for (const [id, scenes] of Object.entries(current)) {
  check(`${id}: scene count`, classic[id]?.length, scenes.length);
  scenes.forEach((scene, i) => {
    count++;
    for (const field of ['heading', 'points', 'narration'])
      check(`${id}-${i + 1}: ${field}`, classic[id]?.[i]?.[field], scene[field]);
  });
}
// Descriptions may intentionally describe different presentation formats.
// Pin BOTH reviewed texts: an edit to either side requires explicit review.
const reviewed = JSON.parse(read('tools/classic-description-review.json'));
const hash = text => createHash('sha256').update(text).digest('hex');
const differences = [];
for (const p of programs) {
  const other = classics.find(c => c.id === p.id);
  if (other?.description === p.description) continue;
  differences.push(p.id);
  check(`${p.id}: description review required`, reviewed[p.id] && {
    current: reviewed[p.id].current, classic: reviewed[p.id].classic
  }, { current: hash(p.description), classic: hash(other?.description ?? '') });
}
check('stale description review entries', Object.keys(reviewed).sort(), differences.sort());
if (errors.length) {
  console.error('Classic content drift detected:\n' + errors.map(e => `- ${e}`).join('\n'));
  process.exitCode = 1;
} else console.log(`PASS: ${count} scenes; headings, points, narration and catalog descriptions reviewed. Titles/durations are intentionally independent.`);
