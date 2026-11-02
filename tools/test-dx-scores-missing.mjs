import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const sections = [], binders = [];
const c = vm.createContext({LabsUI: {addSection: f=>sections.push(f), addBinder: f=>binders.push(f), save() {}}});
for (const f of ['labs-core.js','dx-refs.js','dx-scores.js','dx-ui.js'])
  vm.runInContext(fs.readFileSync(new URL('../'+f, import.meta.url),'utf8'), c);
let checks = 0;
const test = (name, f) => { f(); checks++; console.log('PASS '+name); };
const run = (d, a={}, v={}, ctx={}) => c.DXScores.run(d,a,v,ctx);
const unsafe = /低リスク|陰性|軽症|通常の観察間隔で差し支えない|ほぼ否定|外来治療が可能/;
for (const d of c.DXScores.list.filter(d=>d.items)) {
  test(d.id+' empty / each missing item / complete / invalid', ()=>{
    const full = Object.fromEntries(d.items.map(it=>[it.key,it.type==='bool'?false:0]));
    const empty = run(d);
    assert.equal(empty.status,'unevaluated'); assert.equal(empty.score,null);
    assert.equal(empty.scoreLabel,'—'); assert.equal(empty.answered,0);
    assert.equal(unsafe.test(empty.interp+empty.bandLabel),false);
    const expected = d.computeMax ? Math.max(...d.items.map(it=>it.type==='bool'?0:it.options[0].points)) : d.items.reduce((s,it)=>s+(it.type==='bool'?0:it.options[0].points),0);
    const complete=run(d,full);
    assert.equal(complete.complete,true); assert.equal(complete.score,expected);
    assert.equal(complete.bandLabel,d.compute(expected).bandLabel);
    for(const it of d.items) {
      for(const invalid of [undefined,null,'',' ',NaN,Infinity,{},-1,999,'bad']) {
        const r=run(d,{...full,[it.key]:invalid});
        assert.equal(r.complete,false); assert.equal(r.score,null);
        assert.equal(r.answered,d.items.length-1); assert.ok(r.missing.includes(it.label));
        assert.equal(unsafe.test(r.interp+r.bandLabel+r.actions.join('')),false);
      }
    }
  });
}
test('NEWS2 explicit normal is zero, empty and 2/7 are not',()=>{
  const d=c.DXScores.get('news2');
  const a=d.autofill({}, {vitals:{rr:16,hr:70}});
  assert.equal(run(d,a).answered,2); assert.equal(run(d,a).score,null);
  const full={...d.autofill({}, {vitals:{rr:16,hr:70,sbp:120,spo2:98,bt:37}}),o2:false,cns:0};
  // Oxygen key is part of the real registry, not a synthetic test definition.
  for(const it of d.items) if(full[it.key]===undefined) full[it.key]=0;
  assert.equal(run(d,full).score,0);
});
test('negative points and computeMax remain correct',()=>{
 const d=c.DXScores.get('wellsdvt'); const a=Object.fromEntries(d.items.map(it=>[it.key,false]));
 a.alt=true; assert.equal(run(d,a).score,-2);
 assert.equal(run(c.DXScores.get('kdigo'),{cr:1,uo:3}).score,3);
});
for(const [id,v,ctx] of [
 ['meldna',{tbil:1,inr:1,cr:1,na:140},{}],
 ['isth_dic',{plt:20,fdp:2,inr:1,fib:300},{}],
 ['ckd',{cr:1},{age:50,sex:'m'}]
]) test(id+' direct empty / partial / all formula inputs',()=>{
 const d=c.DXScores.get(id); assert.equal(run(d),null);
 for(const key of Object.keys(v)) {const partial={...v};delete partial[key];assert.equal(run(d,{},partial,ctx),null);}
 const r=run(d,{},v,ctx);assert.ok(r && Number.isFinite(r.score));
 if(id==='ckd') {assert.equal(r.status,'provisional');assert.notEqual(r.band,'green');}
});
test('ISTH alternative markers and PT must still be complete',()=>{
 const d=c.DXScores.get('isth_dic');
 assert.equal(run(d,{}, {ddimer:0.2}),null);
 assert.equal(run(d,{}, {plt:20,ddimer:0.2,ptpct:100,fib:300}).score,0);
});
test('compound autofill does not infer normal from missing components',()=>{
 assert.equal(c.DXScores.get('curb65').autofill({}, {vitals:{sbp:120}}).b,undefined);
 assert.equal(c.DXScores.get('abcd2').autofill({}, {vitals:{sbp:120}}).b,undefined);
 assert.equal(c.DXScores.get('chadsvasc').autofill({}, {}).female,undefined);
 assert.equal(c.DXScores.get('sofa').autofill({cr:1,pao2:60,fio2:0.5}, {}).renal,undefined);
 assert.equal(c.DXScores.get('sofa').autofill({cr:1,pao2:60,fio2:0.5}, {}).resp,undefined);
 assert.equal(c.DXScores.get('hscore').autofill({hb:8}, {}).cyto,undefined);
 assert.equal(c.DXScores.get('jss_ap').autofill({bun:10,cr:1,be:0,pao2:100}, {}).bun,undefined);
});
// 臨床スコアのセクションを「登録順の番号」ではなく中身で特定する。
// dx-ui.js にセクションが増えても、この検査が静かに別のセクションを見にいかないようにする。
const scoreSection = (()=>{
 const probe = {state:{},input:{values:{},context:{}},result:{findings:{},derived:{}}};
 const hits = sections.filter(f=>{ try { return /臨床スコア/.test(f(probe)||''); } catch { return false; } });
 assert.equal(hits.length,1,'臨床スコアのセクションが一意に特定できない');
 return hits[0];
})();
const render=(state={},values={},context={})=>scoreSection({state,input:{values,context}});
const card=(html,name)=>html.split('<div class="score-card">').find(s=>s.startsWith('<h4>'+name+'<'));
test('rendered UI hides reassuring results and offers explicit false / reset',()=>{
 const html=render();
 for(const id of ['news2','qsofa','sofa']) {
  const h=card(html,c.DXScores.get(id).name).split('<details>')[0];
  assert.match(h,/未評価/);assert.match(h,/—/);assert.equal(unsafe.test(h),false);
 }
 assert.match(html,/<option value="false">該当なし（0点）/);
 assert.doesNotMatch(html,/type="checkbox"/);
 const full=render({scores:{qsofa:{rr:false,cns:false,sbp:false}}});
 assert.match(card(full,'qSOFA'),/0 点/);
 assert.match(card(full,'qSOFA'),/陰性/);
});
test('binder false → true → unanswered and auto values refresh',()=>{
 let handler; binders[0]({addEventListener:(_,f)=>{handler=f;}},{state:c.state={},rerender(){}});
 const target={value:'false',closest(){return {getAttribute:k=>({'data-score':'qsofa','data-item':'rr','data-kind':'bool'})[k]};}};
 for(const [value,expected] of [['false',false],['true',true],['',undefined]]) {
  target.value=value;handler({target});assert.equal(c.state.scores.qsofa.rr,expected);
 }
 const state={};render(state,{}, {vitals:{rr:16}});assert.equal(state.scores.qsofa.rr,false);
 render(state);assert.equal(state.scores.qsofa.rr,undefined);
});
console.log(`${checks} score/UI regression groups passed; ${c.DXScores.list.length} scores covered.`);
