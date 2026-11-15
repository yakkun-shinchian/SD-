/* tools/test-dx-intake.mjs
 * 音声・貼り付けからの取り込み（dx-intake.js）の回帰。
 * 誤って別の項目に値を入れることが、この機能でいちばん危ない失敗なので、
 * 「取り違えないこと」を中心に確かめる。
 *
 *   node tools/test-dx-intake.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c = vm.createContext({});
for (const f of ['labs-core.js','labs-cbc.js','labs-chem.js','labs-coag.js','labs-autoab.js',
                 'dx-refs.js','dx-abg.js','dx-hx.js','dx-intake.js'])
  vm.runInContext(fs.readFileSync(new URL('../'+f, import.meta.url),'utf8'), c, {filename:f});

let checks = 0;
const test = (name, fn) => { fn(); checks++; console.log('PASS ' + name); };
const parse = (t) => c.DXIntake.parse(t);
const find = (t, key) => parse(t).hits.find(h => h.key === key);
const val = (t, key) => { const h = find(t, key); return h ? h.value : undefined; };

test('検査名と数値の基本形', () => {
  assert.equal(val('ナトリウム138', 'na'), 138);
  assert.equal(val('Na 138', 'na'), 138);
  assert.equal(val('ナトリウムが138です', 'na'), 138);
  assert.equal(val('Na：138', 'na'), 138);
  assert.equal(val('ナトリウム　１３８', 'na'), 138);   // 全角
  assert.equal(val('クレアチニン 1.4', 'cr'), 1.4);
  assert.equal(val('pH 7.21', 'ph'), 7.21);
  assert.equal(val('BE -8.5', 'be'), -8.5);
});

test('短い英字の検査名が別の語を食わない', () => {
  // 「K」が「OK」「KL」に当たらない
  assert.equal(find('OKです', 'k'), undefined);
  assert.equal(val('K 5.2', 'k'), 5.2);
  // 「尿中Na」を「Na」として取らない
  const r = parse('尿中Na 45');
  assert.equal(r.hits.filter(h => h.key === 'una').length, 1);
  assert.equal(r.hits.filter(h => h.key === 'na').length, 0);
  // NT-proBNP を BNP と取り違えない
  const b = parse('NT-proBNP 1200');
  assert.equal(b.hits.filter(h => h.key === 'ntprobnp').length, 1);
  assert.equal(b.hits.filter(h => h.key === 'bnp').length, 0);
});

test('単位の読み替えを行い、必ず知らせる', () => {
  const a = find('血小板 18万', 'plt');
  assert.equal(a.value, 18);
  const b = find('血小板 180000', 'plt');
  assert.equal(b.value, 18);
  assert.ok(b.note, '読み替えたのに note が空');
  const d = find('血小板 18', 'plt');
  assert.equal(d.value, 18);
  assert.equal(d.note, '', '読み替えていないのに note が付いている');
});

test('血圧・体温・年齢・性別', () => {
  const r = parse('血圧 96/60、体温36度8、68歳男性');
  assert.equal(r.hits.find(h => h.key === 'sbp').value, 96);
  assert.equal(r.hits.find(h => h.key === 'dbp').value, 60);
  assert.equal(r.hits.find(h => h.key === 'bt').value, 36.8);
  assert.equal(r.hits.find(h => h.key === 'age').value, 68);
  assert.equal(r.hits.find(h => h.key === 'sex').value, 'm');
  assert.equal(parse('82歳女性').hits.find(h => h.key === 'sex').value, 'f');
});

test('所見の言い回しが選択肢の値になる', () => {
  const pairs = [
    ['冷汗あり', 'hx_perfusion', '冷汗・湿潤'],
    ['頸静脈怒張を認める', 'hx_jvd', 'あり'],
    ['項部硬直あり', 'hx_neck', 'あり'],
    ['突然発症の頭痛', 'hx_onset', '突然（秒〜分で完成）'],
    ['腹膜刺激徴候あり', 'hx_peritoneal', 'あり（反跳痛・筋性防御）'],
    ['羽ばたき振戦を認める', 'hx_asterixis', 'あり'],
    ['両側下肺に捻髪音', 'hx_lung', '捻髪音（両側下肺の fine crackles）']
  ];
  for (const [text, key, want] of pairs) assert.equal(val(text, key), want, text);
  // 選択肢の文字列が実在すること（dx-hx.js の options と一致していること）
  for (const [, key, want] of pairs) {
    const a = c.LabsCore.findAnalyte(key);
    assert.ok(a && a.options.includes(want), key + ' に「' + want + '」という選択肢がない');
  }
});

test('すべての言い回しが実在する選択肢を指している', () => {
  const bad = [];
  for (const [key, value] of c.DXIntake.PHRASE) {
    const a = c.LabsCore.findAnalyte(key);
    if (!a) { bad.push(key + '（項目なし）'); continue; }
    if (!a.options || !a.options.includes(value)) bad.push(key + ' → ' + value);
  }
  assert.deepEqual(bad, [], '存在しない選択肢を指している: ' + bad.join(' / '));
});

test('すべての検査名が実在する検査項目を指している', () => {
  const bad = Object.keys(c.DXIntake.LAB).filter(k => !c.LabsCore.findAnalyte(k));
  assert.deepEqual(bad, [], '存在しない検査項目: ' + bad.join(' / '));
});

test('主訴・既往・内服の語が実在するキーを指している', () => {
  // labs-ui.js のチップと同じキーでなければ、反映しても画面に出ない
  const ui = fs.readFileSync(new URL('../labs-ui.js', import.meta.url), 'utf8');
  const keysIn = (name) => {
    const m = new RegExp('var ' + name + ' = \\[([\\s\\S]*?)\\];').exec(ui);
    return new Set([...m[1].matchAll(/\["([a-z_0-9]+)",/g)].map(x => x[1]));
  };
  const sets = { complaints: keysIn('COMPLAINTS'), history: keysIn('HISTORY'), meds: keysIn('MEDS') };
  const bad = [];
  for (const g of Object.keys(sets))
    for (const k of Object.keys(c.DXIntake.CHIP[g]))
      if (!sets[g].has(k)) bad.push(g + '.' + k);
  assert.deepEqual(bad, [], 'labs-ui.js に無いキー: ' + bad.join(' / '));
});

test('読み取れなかった部分だけが未読として残る', () => {
  const r = parse('ナトリウム138、冷汗あり、よくわからない話');
  assert.ok(!r.leftover.includes('138'));
  assert.ok(!r.leftover.includes('冷汗'));
  assert.ok(r.leftover.includes('よくわからない話'));
});

test('数値のない検査名は拾わない', () => {
  // 「クレアチニンを調べてください」で Cr に値が入ってはいけない
  assert.equal(find('クレアチニンを調べてください', 'cr'), undefined);
  assert.equal(parse('採血してください').hits.length, 0);
});

test('apply が state の正しい場所へ入れる', () => {
  const st = { values: {}, context: { vitals: {}, complaints: [], history: [], meds: [] } };
  const r = parse('68歳男性、胸痛。血圧 96/60、ナトリウム138、冷汗あり、ワーファリン内服中');
  c.DXIntake.apply(r.hits, st);
  assert.equal(st.values.na, '138');
  assert.equal(st.values.hx_perfusion, '冷汗・湿潤');
  assert.equal(st.context.vitals.sbp, '96');
  assert.equal(st.context.age, '68');
  assert.equal(st.context.sex, 'm');
  assert.ok(st.context.complaints.includes('chest_pain'));
  assert.ok(st.context.meds.includes('warfarin'));
});

test('取り込んだ値がそのまま判定に乗る', () => {
  const st = { values: {}, context: { vitals: {}, complaints: [], history: [], meds: [] } };
  c.DXIntake.apply(parse('乳酸 5.2、CRP 18、血圧 80/50、呼吸28').hits, st);
  const ctx = { age: null, sex: 'm', pregnant: false, vitals: st.context.vitals,
                complaints: [], history: [], meds: [] };
  const F = c.LabsCore.evaluate(['cbc','chem','coag','autoab','abg'], {values: st.values, context: ctx}).findings;
  assert.ok(F.lactate_high, '乳酸上昇が立っていない');
  assert.ok(F.crp_veryhigh || F.crp_high, 'CRP上昇が立っていない');
});

console.log(`${checks} 群合格（取り込みの解析と反映）`);
