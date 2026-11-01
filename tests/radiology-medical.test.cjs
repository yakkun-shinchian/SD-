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
test('chest and abdomen entries are identical',()=>assert.deepEqual(after.filter(s=>s.region!=='head'),before.filter(s=>s.region!=='head')));
test('SVG, application, reverse lookup, atlas and NurseTube source unchanged',()=>{
 for(const f of ['radiology-figures.js','radiology-app.js','radiology-atlas.js','radiology.html','radiology.css','nurse.html','app.js','data.js','scenes.js','styles.css','index.html']) assert.equal(read(f),oldFile(f),f);
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
test('all nine head entries expose references with safe HTTPS links',()=>{
 for(const s of after.filter(s=>s.region==='head')){assert.ok(s.refs?.length,s.id);for(const r of s.refs){assert.equal(new URL(r.url).protocol,'https:');assert.ok(r.label);}}
});
test('remaining head pitfalls: collateral anatomy, no pressure inference, no abscess certainty',()=>{
 assert.match(by('insular-ribbon').deep,/前大脳動脈・後大脳動脈/);
 assert.match(by('midline-shift').oneLine,/頭蓋内圧や血腫量そのものを測る指標ではない/);
 assert.match(by('ring-enhancement').easy,/腫瘍でも拡散制限/);
 assert.match(text('putaminal-hemorrhage'),/発症早期の血腫増大/);
});
