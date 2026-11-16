// Run: node --test tests/radiology-medical.test.cjs
// Text guardrails do not replace clinical review. Baseline is PR #24's reviewed head.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), vm=require('node:vm'), cp=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const base='32c0c7bde377dc612b6268ae6d84383de0712be9';
const oldFile=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8'});
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const parse=s=>JSON.parse(JSON.stringify(vm.runInNewContext(s+';RAD_SIGNS')));
const before=parse(oldFile('radiology-signs.js')),after=parse(read('radiology-signs.js'));
const by=id=>after.find(s=>s.id===id),text=id=>JSON.stringify(by(id));
test('32 entries / nine head entries; identifiers, tags, modality and figure bindings unchanged',()=>{
 assert.equal(after.length,32);assert.equal(after.filter(s=>s.region==='head').length,9);
 assert.equal(new Set(after.map(s=>s.id)).size,32);
 after.forEach((s,i)=>{for(const key of ['id','name','en','reading','region','modality','patterns','urgency','figure'])assert.deepEqual(s[key],before[i][key],s.id+':'+key);});
});
// 口調をです・ます体へ統一した（リポジトリ規約）。変わるのは語尾のひらがなだけなので、
// 「ひらがなを取り除いた本文」が一致することを事実の保存とみなす。さらに、事実が載る deep は
// バイト単位で凍結する。両方を課すことで、口調の変更に紛れた内容の書き換えを拒む。
const facts=o=>JSON.stringify(o).replace(/[\u3041-\u309F]/g,'');
// RadioDeck は所見と出典を足して育てる前提なので、ガードは「1バイトも動かない」ではなく
// 「既にある事実が書き換えられていない」。新しい項目（refs など）や新しい所見の追加は許す。
test('chest and abdomen entries keep every fact; fields may be added but none rewritten',()=>{
 for(const prev of before.filter(s=>s.region!=='head')){
  const now=after.find(s=>s.id===prev.id);
  assert.ok(now,prev.id+' が消えている');
  assert.equal(now.deep,prev.deep,prev.id+':deep');
  for(const k of Object.keys(prev)){
   if(k==='refs'){ // 出典だけは追記して育てる欄。既存の出典が消えていないことを課す。
    const have=new Set((now.refs||[]).map(r=>JSON.stringify(r)));
    assert.deepEqual((prev.refs||[]).filter(r=>!have.has(JSON.stringify(r))),[],prev.id+':refs の既存出典が消えている');
    continue;
   }
   assert.equal(facts(now[k]),facts(prev[k]),prev.id+':'+k+' が書き換わっている');
  }
 }
});
// NurseTube drifts on its own (tone rewrites, new programs), so the guard is not "frozen bytes".
// It is: RadioDeck adds exactly these entry points to NurseTube and changes nothing else,
// measured against the merge target rather than a fixed commit.
const mainRef=process.env.RADIODECK_BASE_REF||'origin/main';
const diffVsMain=f=>cp.execFileSync('git',['diff','--unified=0',mainRef,'--',f],{cwd:root,encoding:'utf8'}).split('\n');
const ENTRY_POINTS={
 "nurse.html": [
  "      <div class=\"sidebar__apps\">",
  "        <a href=\"radiology.html\"><span aria-hidden=\"true\">🩻</span>RadioDeck<small>放射線科 読影アトラス</small></a>",
  "        <a href=\"index.html\"><span aria-hidden=\"true\">🫁</span>VentSim<small>人工呼吸器シミュレーター</small></a>",
  "      </div>"
 ],
 "index.html": [
  "  <a href=\"./radiology.html\" style=\"color:#5a6b7a;margin-left:8px\">放射線科 読影アトラス(RadioDeck)へ →</a>"
 ],
 "styles.css": [
  "/* 姉妹アプリへの入り口（サイドバー上部） */",
  ".sidebar__apps {",
  "  display: flex; flex-direction: column; gap: 6px;",
  "  margin: 0 0 12px; padding-bottom: 12px;",
  "  border-bottom: 1px solid var(--border);",
  "}",
  ".sidebar__apps a {",
  "  display: grid; grid-template-columns: 22px 1fr; align-items: center;",
  "  gap: 2px 8px; padding: 9px 11px; border-radius: 10px;",
  "  border: 1px solid var(--border); color: var(--text);",
  "  text-decoration: none; font-size: 14px; font-weight: 700; line-height: 1.35;",
  "}",
  ".sidebar__apps a span { grid-row: span 2; font-size: 17px; }",
  ".sidebar__apps a small { font-size: 11px; font-weight: 400; color: var(--text-sub); }",
  ".sidebar__apps a:hover { border-color: var(--accent); color: var(--accent); }",
  ".sidebar__apps a:hover small { color: var(--accent); }",
  ""
 ]
};
// \u300C\u5DEE\u5206\u304C\u3061\u3087\u3046\u3069\u5165\u53E3\u306E\u884C\u3067\u3042\u308B\u300D\u3068\u3044\u3046\u5F62\u306F\u3001RadioDeck \u304C main \u306B\u30DE\u30FC\u30B8\u3055\u308C\u305F\u6642\u70B9\u3067
// \u6210\u7ACB\u3057\u306A\u304F\u306A\u3063\u305F\uFF08\u5DEE\u5206\u304C\u7A7A\u306B\u306A\u308B\uFF09\u3002\u5165\u53E3\u304C\u4ECA\u3082\u5728\u308B\u3053\u3068\u3092\u76F4\u63A5\u78BA\u304B\u3081\u308B\u5F62\u306B\u6539\u3081\u308B\u3002
// 口調の改訂（「のだ」調の廃止）は既に済んでいるので、かなの差は無視して比べる。
const bone=l=>l.replace(/[ぁ-ゟ]/g,'').trimEnd();
const keptLines=(f)=>{
 const have=new Set(read(f).split('\n').map(bone));
 return (l)=>have.has(bone(l));
};
test('RadioDeck keeps its figures and atlas; NurseTube keeps the RadioDeck entry points',()=>{
 assert.equal(read('radiology-figures.js'),oldFile('radiology-figures.js'),'radiology-figures.js');
 assert.equal(read('radiology-atlas.js').replace(/[\u3041-\u309F]/g,''),oldFile('radiology-atlas.js').replace(/[\u3041-\u309F]/g,''),'radiology-atlas.js');
 // CSS \u306F\u8FFD\u8A18\u3057\u3066\u80B2\u3066\u308B\u3002\u65E2\u5B58\u306E\u884C\u304C\u6D88\u3048\u3066\u3044\u306A\u3044\u3053\u3068\u3060\u3051\u3092\u8AB2\u3059\u3002
 const cssHas=keptLines('radiology.css');
 const lost=oldFile('radiology.css').split('\n').filter(l=>l.trim()&&!cssHas(l));
 assert.deepEqual(lost,[],'radiology.css: \u65E2\u5B58\u306E\u884C\u304C\u6D88\u3048\u3066\u3044\u308B');
 for(const f of ['app.js','data.js','scenes.js']) assert.deepEqual(diffVsMain(f).filter(l=>/^[+-]/.test(l)&&!/^(\+\+\+|---)/.test(l)),[],f+' must not be touched by RadioDeck');
 for(const f of Object.keys(ENTRY_POINTS)){
  const has=keptLines(f);
  assert.deepEqual(ENTRY_POINTS[f].filter(l=>l.trim()&&!has(l)),[],f+': RadioDeck \u306E\u5165\u53E3\u304C\u5931\u308F\u308C\u3066\u3044\u308B');
 }
});
test('EDH: lucid interval absent does not exclude; initial loss/recovery is distinguished',()=>{
 assert.match(by('edh-acute').easy,/意識消失からいったん回復/);assert.match(text('edh-acute'),/全例にはなく/);
 assert.doesNotMatch(text('edh-acute'),/約3分の1|意識清明期のあとに急変する/);
 assert.match(text('edh-acute'),/静脈洞/);
});
test('SDH: arterial origin and rapid deterioration; chronic course is not substituted',()=>{
 assert.match(text('sdh-acute'),/皮質動脈/);assert.match(text('sdh-acute'),/急速に悪化/);
 assert.doesNotMatch(text('sdh-acute'),/静脈性なので進行は比較的緩やか/);
 assert.match(text('sdh-acute'),/慢性硬膜下血腫.*混同しない/);
});
test('SAH: early CT exclusion has all prerequisites; late/deficit presentation uses LP',()=>{
 const d=by('sah').deep;
 for(const r of [/6時間超、または新規神経脱落症状/,/陰性なら腰椎穿刺/,/6時間未満で新規神経脱落症状がなく/,/高品質CT/,/専門資格.*神経放射線科医/,/ちょうど6時間/,/MRI.*置き換えない/,/血管攣縮.*DCIは同義ではない/])assert.match(d,r);
});
test('DWI: negative early/posterior/small infarct remains possible; positive restriction is not specific',()=>{
 const d=by('dwi-restriction');
 for(const r of [/初回DWI陰性/,/後方循環/,/小病変/,/再撮像待ち.*遅らせない/,/梗塞に特異的ではなく/])assert.match(d.deep,r);
 assert.doesNotMatch(text(d.id),/ADCが低下していなければ急性期梗塞ではない|両方そろうことが必須|初めて急性期梗塞/);
});
test('hemorrhage nursing observations are separate from imaging and require immediate escalation',()=>{
 for(const id of ['edh-acute','sdh-acute','sah']){
  const s=by(id);assert.ok(s.lookFor.some(x=>x.startsWith('画像：')));
  const obs=s.lookFor.find(x=>x.startsWith('看護観察：'));assert.ok(obs);
  for(const r of [/GCS/,/瞳孔/,/呼吸/,/直ちに報告/,/画像の再検を待って報告を遅らせない/])assert.match(obs,r);
 }
});
// 出典は「ID（radiology-refs.js の登録名）」か、旧形式の {label,url} のどちらでもよい。
// どちらの形でも、ラベルが在り、URLを持つならHTTPSであることを課す。
const RadioRefs=vm.runInNewContext(read('radiology-refs.js')+';RadioRefs');
test('all nine head entries expose references with safe HTTPS links',()=>{
 for(const s of after.filter(s=>s.region==='head')){
  assert.ok(s.refs?.length,s.id);
  for(const r of s.refs){
   if(typeof r==='string') assert.ok(RadioRefs.get(r),s.id+': 未登録の出典ID '+r);
  }
  for(const e of RadioRefs.entries(s.refs)){
   assert.ok(e.label,s.id+': ラベルのない出典');
   if(e.url) assert.equal(new URL(e.url).protocol,'https:',s.id+': '+e.url);
  }
 }
});
test('every reference ID used anywhere resolves, and the registry carries citations',()=>{
 for(const s of after) for(const r of (s.refs||[])) if(typeof r==='string') assert.ok(RadioRefs.get(r),s.id+': 未登録の出典ID '+r);
 for(const e of RadioRefs.all()){
  assert.ok(e.label&&e.cite,e.id+': ラベルか書誌情報が欠けている');
  assert.match(e.kind,/^(primary|edu)$/,e.id+': kind は primary か edu');
  if(e.url) assert.equal(new URL(e.url).protocol,'https:',e.id+': '+e.url);
 }
});
test('remaining head pitfalls: collateral anatomy, no pressure inference, no abscess certainty',()=>{
 assert.match(by('insular-ribbon').deep,/前大脳動脈・後大脳動脈/);
 assert.match(by('midline-shift').oneLine,/頭蓋内圧や血腫量そのものを測る指標ではない/);
 assert.match(by('ring-enhancement').easy,/腫瘍でも拡散制限/);
 assert.match(text('putaminal-hemorrhage'),/発症早期の血腫増大/);
});

// 辞書・逆引き・プロトコルの実装は、追記はしてよいが、既存の行を消したり書き換えたりしない。
// 唯一の例外が出典の描画。{label,url} の直書きから、radiology-refs.js の出典IDを
// 展開する方式へ意図的に差し替えた。どの行を手放したかをここに明記して残す。
const REPLACED_BY_REF_REGISTRY=[
 '    const refs = (sign.refs || [])',
 '      .map((r) => `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.label)}</a>`)',
 '            ${refs}'
];
test('dictionary, reverse lookup and protocol implementations are not rewritten',()=>{
 const section=s=>s.slice(s.indexOf('  const navState'),s.indexOf('  const MODELS'));
 const now=new Set(section(read('radiology-app.js')).split('\n').map(bone));
 const allowed=new Set(REPLACED_BY_REF_REGISTRY.map(bone));
 const lost=section(oldFile('radiology-app.js')).split('\n')
   .filter(l=>l.trim()&&!now.has(bone(l))&&!allowed.has(bone(l)));
 assert.deepEqual(lost,[],'radiology-app.js: 既存の実装行が書き換わっている');
});

// リポジトリ規約：「〜なのだ／〜のだ」調は廃止。文末に残っていないことを機械的に確かめる。
test('no plain-style 「のだ」 endings remain in RadioDeck copy',()=>{
 for(const f of ['radiology-signs.js','radiology-atlas.js','radiology-app.js','radiology.html','radiology.css']){
  const hits=[...read(f).matchAll(/.{0,20}のだ(?=[。」）（"'`,\]]|$)/gm)].map(m=>m[0]);
  assert.deepEqual(hits,[],f+': 「のだ」調が残っている → '+hits.join(' / '));
 }
});
