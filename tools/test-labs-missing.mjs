import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c = vm.createContext({});
for (const name of ['core','cbc','chem','coag','autoab']) vm.runInContext(fs.readFileSync(new URL('../labs-'+name+'.js', import.meta.url),'utf8'), c);
for (const name of ['refs','abg','scores','core']) vm.runInContext(fs.readFileSync(new URL('../dx-'+name+'.js', import.meta.url),'utf8'), c);
vm.runInContext(fs.readFileSync(new URL('../labs-integrate.js', import.meta.url),'utf8'), c);
const domains = ['cbc','chem','coag','autoab','abg'];
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

/* ---- 酸塩基平衡・鑑別診断（dx-*.js）の回帰テスト ---- */
const abg = (values, context={sex:'m',age:60}) =>
  c.LabsCore.evaluate(['cbc','chem','coag','autoab','abg'],{values,context}).derived.abg;
const ddx = (values, context={sex:'m',age:60}) => {
  const input={values,context}, r=c.LabsCore.evaluate(domains,input);
  return c.DXCore.differential(r.findings,values,r.derived,context,{}).map(d=>d.id);
};

test('ABG 未入力では解析しない', () => assert.equal(abg({}).complete, false));

test('Winter 式で代償不足を検出', () => {
  const a = abg({ph:7.21,paco2:26,hco3:10,na:138,cl:104,alb:2.4});
  assert.equal(a.primary,'MA');
  assert.equal(a.compensation.adequate,false);
  assert.ok(a.disorders.some(d=>d.includes('呼吸性アシドーシス')));
});

test('AG はアルブミンで補正される', () => {
  // AG 実測 12（基準内）でも、低アルブミン血症では補正後に開大が露わになる
  const low = abg({ph:7.3,paco2:30,hco3:15,na:140,cl:113,alb:2.0});
  const norm = abg({ph:7.3,paco2:30,hco3:15,na:140,cl:113,alb:4.0});
  assert.ok(low.agCorrected > low.ag);
  assert.equal(norm.agCorrected, norm.ag);
  assert.equal(low.agHigh, true);
  assert.equal(norm.agHigh, false);
});

test('呼吸性アシドーシスは急性と慢性で代償期待値が変わる', () => {
  const ac = abg({ph:7.21,paco2:70,hco3:27,na:140,cl:102,abgCourse:'急性（数時間〜数日）'});
  const ch = abg({ph:7.33,paco2:70,hco3:35,na:140,cl:96,abgCourse:'慢性（数日以上・COPD等）'});
  assert.ok(ac.compensation.expected[1] < ch.compensation.expected[0]);
  assert.equal(ac.compensation.adequate, true);
  assert.equal(ch.compensation.adequate, true);
});

test('Δ比が2超で隠れた代謝性アルカローシスを拾う', () => {
  const a = abg({ph:7.44,paco2:24,hco3:16,na:140,cl:88,alb:2.6});
  assert.ok(a.deltaRatio > 2);
  assert.ok(a.disorders.some(d=>d.includes('代謝性アルカローシス')));
});

test('P/F 比で ARDS 重症度を判定', () => {
  assert.equal(abg({ph:7.31,paco2:48,hco3:23,pao2:64,fio2:0.8,na:139,cl:103}).ards,'重症');   // P/F 80
  assert.equal(abg({ph:7.21,paco2:26,hco3:10,pao2:68,fio2:0.4,na:138,cl:104}).ards,'中等症'); // P/F 170
  assert.equal(abg({ph:7.4,paco2:40,hco3:24,pao2:88,fio2:0.3,na:140,cl:104}).ards,'軽症');    // P/F 293
  assert.equal(abg({ph:7.4,paco2:40,hco3:24,pao2:95,fio2:0.21,na:140,cl:104}).ards, undefined);
});

test('所見がなければ鑑別候補も出ない', () => assert.equal(ddx({}).length, 0));

test('発熱のみで甲状腺クリーゼを立てない', () =>
  assert.equal(ddx({crp:8},{sex:'m',age:60,vitals:{bt:39.0}}).includes('storm'), false));

test('AG開大のみで DKA を立てない', () => {
  const ids = ddx({ph:7.12,paco2:22,hco3:7,na:140,cl:102,alb:4.2,glu:102,sosm:338,bun:14});
  assert.equal(ids.includes('dka'), false);
  assert.ok(ids.includes('toxalcohol'));
});

test('貧血のみで消化管出血を立てない', () =>
  assert.equal(ddx({hb:9,rbc:3.5,ht:28}).includes('gib'), false));

test('HIT はヘパリン投与がなければ立てない', () => {
  const v={plt:6.8,hb:12.4,rbc:4.1,ht:37.5,wbc:9200,ddimer:4.2};
  assert.equal(ddx(v,{sex:'m',age:69,meds:[]}).includes('hit'), false);
  assert.ok(ddx(v,{sex:'m',age:69,meds:['heparin']}).includes('hit'));
});

test('代償性過換気を肺塞栓と取り違えない', () => {
  assert.equal(ddx({ph:7.08,paco2:18,hco3:5,na:132,cl:94,alb:4.2,glu:580,bun:34}).includes('pe'), false);
  assert.ok(ddx({ph:7.49,paco2:29,hco3:22,pao2:58,fio2:0.21,na:139,cl:103,ddimer:12.4}).includes('pe'));
});

test('合致度は降順に並ぶ', () => {
  const input={values:{ph:7.21,paco2:26,hco3:10,pao2:68,fio2:0.4,na:138,cl:104,alb:2.4,lac:8.2,
    glu:158,bun:42,cr:2.1,crp:18.5,pct:8.4,plt:6.2,wbc:19800,tbil:2.1,inr:1.62,fib:128,fdp:42},
    context:{sex:'m',age:72,vitals:{bt:38.9,sbp:82,hr:124,rr:30},complaints:['fever','consciousness']}};
  const r=c.LabsCore.evaluate(domains,input);
  const list=c.DXCore.differential(r.findings,input.values,r.derived,input.context,{});
  assert.ok(list.length>3);
  for(let i=1;i<list.length;i++) assert.ok(list[i-1].fit >= list[i].fit);
});

test('必要値が無いスコアは null を返す', () => {
  assert.equal(c.DXScores.run(c.DXScores.get('meldna'),null,{},{sex:'m',age:60}), null);
  const r=c.DXScores.run(c.DXScores.get('meldna'),null,{tbil:3.4,inr:1.7,cr:1.2,na:130},{sex:'m',age:60});
  assert.ok(r && r.score>=6 && r.score<=40);
});

test('全スコアに出典が紐づく', () => {
  c.DXScores.list.forEach(s=>{
    assert.ok(s.refs && s.refs.length, s.id+' に出典がない');
    s.refs.forEach(id=>assert.ok(c.DXRefs.get(id), s.id+' の出典 '+id+' が未登録'));
  });
});

test('全鑑別の出典が登録済み', () => {
  c.DXCore.DDX.forEach(d=>(d.refs||[]).forEach(id=>
    assert.ok(c.DXRefs.get(id), d.id+' の出典 '+id+' が未登録')));
});


/* ---- 臨床家の照合による修正（固定） ---- */

test('代謝性アルカローシスの代償係数は 0.6', () => {
  // HCO3 38 → 0.6 × 14 + 40 = 48.4（± 5）。0.7 なら 49.8 になる
  const a = abg({ph:7.52,paco2:48,hco3:38,na:138,cl:88,alb:4.0});
  assert.equal(a.primary,'MAlk');
  assert.ok(Math.abs((a.compensation.expected[0]+a.compensation.expected[1])/2 - 48.4) < 0.01,
    '期待値の中心が 48.4 でない: ' + a.compensation.expected);
  assert.ok(a.compensation.formula.includes('0.6'));
  assert.ok(a.compensation.formula.includes('0.6〜0.7'), '出典差の注記がない');
});

test('SIADH は尿中Na 40 以上を要求する', () => {
  const v = (una) => ({na:122,k:4.0,cl:88,bun:8.2,cr:0.62,alb:3.8,sosm:254,uosm:620,una,usg:1.020});
  const fires = (una) => run(v(una),domains,{sex:'f',age:58,history:['stroke']})
    .result.patterns.some(p=>p.id==='ch-siadh');
  assert.equal(fires(35), false, '尿中Na 35 で SIADH を立ててはいけない');
  assert.ok(fires(45), '尿中Na 45 で SIADH が立たない');
  // 30以上は腎性Na喪失として CSWS 側では依然拾う
  const r = run(v(35),domains,{sex:'f',age:58,history:['stroke','neurosurg']});
  assert.ok(r.result.patterns.some(p=>p.id==='ch-csws'), 'CSWS 側の閾値まで上げてはいけない');
});

test('抗GT1a 抗体でギラン・バレーを拾う', () => {
  const v = {gt1a:'陽性',gq1b:'陰性',gm1:'陰性'};
  const ctx = {sex:'m',age:46,complaints:['paralysis','dyspnea'],history:[],meds:[],vitals:{}};
  assert.ok(has(v,'ab-gbs'), '抗GT1a 単独で ab-gbs が立たない');
  const r = run(v,domains,ctx);
  assert.ok(r.syndromes.some(s=>s.id==='sx-gbs-resp'), '呼吸筋麻痺リスクの症候群が立たない');
  assert.ok(ddx(v,ctx).includes('gbs'), '鑑別に gbs が出ない');
  // 球麻痺への言及があること（抗GT1a 型の臨床的な肝）
  const p = r.result.patterns.find(x=>x.id==='ab-gbs');
  assert.ok(/球麻痺/.test(p.note) && /嚥下/.test(p.actions.join('')), '球麻痺・嚥下への言及がない');
});

console.log(`${checks} checks passed; ${presets} presets evaluated in standalone and integrated modes.`);
