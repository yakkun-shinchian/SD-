import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c = vm.createContext({});
for (const name of ['core','cbc','chem','coag','autoab','integrate']) vm.runInContext(fs.readFileSync(new URL('../labs-'+name+'.js', import.meta.url),'utf8'), c);
const domains = ['cbc','chem','coag','autoab'];
function run(values, ds=domains, context={sex:'m',age:50}) {
 const input={values,context}; const result=c.LabsCore.evaluate(ds,input);
 return {result, ...c.LabsIntegrate.assess(input,result)};
}
let checks=0;
function test(name,fn){fn(); checks++; console.log('PASS '+name);}
const base={hb:8,plt:7,ld:700};
for(const [name,extra,pt,fib] of [
 ['unmeasured',{},'未測定','未測定'],['normal',{inr:1,fib:300},'基準範囲内','基準範囲内'],
 ['abnormal',{inr:1.8,fib:100},'基準範囲外','基準範囲外'],
 ['PT only',{inr:1},'基準範囲内','未測定'],['fib only',{fib:300},'未測定','基準範囲内'],
 ['PT seconds',{ptsec:12,fib:300},'基準範囲内','基準範囲内'],['PT activity',{ptpct:100,fib:300},'基準範囲内','基準範囲内'],
 ['conflicting PT',{inr:1,ptsec:18,fib:300},'基準範囲外','基準範囲内'],['high fib',{inr:1,fib:500},'基準範囲内','基準範囲外'],
 ['blank invalid',{inr:' ',fib:'bad'},'未測定','未測定']]) test('TMA '+name,()=>{
 const r=run({...base,...extra}), s=r.syndromes.find(s=>s.id==='sx-tma');
 assert.equal(r.level,'red'); assert.ok(s); assert.ok(s.basis[3].includes(pt));assert.ok(s.basis[4].includes(fib));
 if(pt==='未測定')assert.ok(r.missing.some(x=>x.includes('PTが未測定')));
 if(fib==='未測定')assert.ok(r.missing.some(x=>x.includes('フィブリノゲンが未測定')));
});
test('empty has no TMA',()=>assert.equal(run({}).syndromes.some(x=>x.id==='sx-tma'),false));
function has(v,id,ds=domains){return run(v,ds).result.patterns.some(p=>p.id===id);}
for(const [id,partial,negative,positive] of [
 ['ab-druglupus',{histone:'陽性',ana:'160倍'},{dsdna:5},{dsdna:100}],
 ['ab-mctd',{rnp:'陽性'},{sm:'陰性',dsdna:5},{sm:'陽性',dsdna:5}],
 ['ab-hashimoto',{tpo:'陽性'},{trab:0.6},{trab:10}],
 ['ab-screening-neg',{ana:'陰性（40倍未満）'},{mpo:1,pr3:1,ccp:1},{mpo:100,pr3:1,ccp:1}],
 ['cbc-acd',{hb:8,rbc:3,ht:27,rdw:12},{retic:1},{retic:8}]
]) test(id+' missing / negative / positive',()=>{
 assert.equal(has(partial,id),false);assert.equal(has({...partial,...negative},id),true);assert.equal(has({...partial,...positive},id),false);
});
test('ANA 40 is not negative screening',()=>assert.equal(has({ana:'40倍',mpo:1,pr3:1,ccp:1},'ab-screening-neg'),false));
test('HHS urgent without AG and with AG',()=>{
 for(const values of [{glu:700},{glu:700,na:140,cl:100,hco3:10}]) {
 const r=run(values,['chem']);assert.equal(r.level,'red');assert.ok(r.result.patterns.some(p=>p.id==='ch-hhs'));assert.ok(!JSON.stringify(r.result.patterns).includes('開大なし'));
 }
});
test('isolated PT requires normal APTT',()=>{
 assert.equal(has({inr:1.8},'cg-pt-only'),false);
 // Check finding directly, independent of presentation IDs.
 assert.equal(run({inr:1.8,aptt:20}).result.findings.pt_only,undefined);
 assert.equal(run({inr:1.8,aptt:30}).result.findings.pt_only,true);
});
test('chem-only BUN still prompts Hb assessment',()=>{
 const r=run({bun:50,cr:1},['chem']);assert.ok(r.result.patterns.some(p=>p.id==='ch-prerenal' && p.note.includes('Hb')));
});
let presets=0;
for(const d of domains)for(const p of c.LabsCore.get(d).presets){
 for(const ds of [[d],domains]){const r=run(p.values,ds,p.context||{});assert.ok(r.result.items.length);assert.ok(['red','amber','green','none'].includes(r.level));}
 presets++;
}
console.log(`${checks} checks passed; ${presets} presets evaluated in standalone and integrated modes.`);
