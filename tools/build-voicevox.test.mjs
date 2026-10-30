import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['narration.txt', 'manifest.json', 'manifest.csv'];

test('書き出し・非破壊検査・意図的な不一致の検出', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'voicevox-check-'));
  try {
    fs.mkdirSync(path.join(dir, 'tools'));
    for (const name of ['data.js', 'scenes.js', 'tools/build-voicevox.mjs']) {
      fs.copyFileSync(path.join(root, name), path.join(dir, name));
    }
    const run = (...args) => spawnSync(process.execPath,
      [path.join(dir, 'tools/build-voicevox.mjs'), ...args], { encoding: 'utf8', cwd: os.tmpdir() });
    const check = (status) => {
      const result = run('--check');
      assert.equal(result.status, status, result.stderr);
      return result;
    };
    check(1); // 出力が存在しなくても、作成せず失敗する
    assert.equal(fs.existsSync(path.join(dir, 'voicevox')), false);
    assert.equal(run().status, 0);
    check(0);
    const originals = new Map(files.map(name => [name, fs.readFileSync(path.join(dir, 'voicevox', name), 'utf8')]));
    for (const [name, original] of originals) {
      const file = path.join(dir, 'voicevox', name);
      fs.writeFileSync(file, original + '意図的な不一致\n');
      assert.match(check(1).stderr, new RegExp(name.replace('.', '\\.')));
      assert.equal(fs.readFileSync(file, 'utf8'), original + '意図的な不一致\n');
      fs.unlinkSync(file);
      check(1);
      fs.writeFileSync(file, original);
    }
    // 台本だけが更新され、3ファイルが古いケース
    fs.appendFileSync(path.join(dir, 'scenes.js'), '\nSCENES.anat03[0].narration += "検査用変更";\n');
    const result = check(1);
    for (const [name, original] of originals) {
      assert.ok(result.stderr.includes(name));
      assert.equal(fs.readFileSync(path.join(dir, 'voicevox', name), 'utf8'), original);
    }
    assert.equal(run().status, 0);
    check(0);
    // カタログのタイトル更新漏れも検出する
    fs.appendFileSync(path.join(dir, 'data.js'), '\nPROGRAMS[0].title += "検査用変更";\n');
    check(1);
    assert.equal(run().status, 0);
    check(0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
