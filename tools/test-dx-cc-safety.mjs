import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const sections=[];
const c=vm.createContext({LabsUI:{addSection:f=>sections.push(f),addBinder(){},save(){}}});
for(const f of ['labs-core.js','dx-refs.js','dx-hx.js','dx-cc.js','dx-ui.js'])
  vm.runInContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),c);
let count=0;
const test=(name,fn)=>{fn();console.log('PASS '+name);count++;};
const keys=['fever','dyspnea','chest_pain','abd_pain','consciousness','headache','paralysis','convulsion','bleeding','edema','oliguria','diarrhea','vomiting','fatigue','jaundice','rash','joint_pain','numbness'];
const assess=(key,F={},ctx={})=>c.DXCC.assess(F,{}, {},{...ctx,complaints:[key]})[0];
const killer=(key,name)=>assess(key).killers.find(k=>k.name===name);
const text=(key,name)=>{const k=killer(key,name);assert.ok(k,name);return k.tests.join('\n');};
function includesAll(t,patterns){for(const p of patterns)assert.match(t,p);}
test('18主訴の選択・未入力・未知の主訴',()=>{
 assert.deepEqual(Array.from(c.DXCC.covered()),keys);
 assert.equal(c.DXCC.assess({}, {}, {}, {}).length,0);
 assert.equal(c.DXCC.assess({}, {}, {}, {complaints:['unknown']}).length,0);
 for(const key of keys){const card=assess(key);assert.equal(card.key,key);assert.equal(card.litFlags.length,0);
 assert.ok(card.redflags.length&&card.ask.length&&card.exam.length&&card.groups.length);
 for(const k of card.killers){assert.equal(k.litCount,0);assert.ok(k.tests.length);}
 }
});
for(const [key,name] of [['dyspnea','緊張性気胸'],['chest_pain','緊張性気胸・食道破裂']])test(key+' 気胸の安定/不安定の両条件',()=>{
 includesAll(text(key,name),[/緊張性気胸を臨床的に疑い/,/循環不安定または重度の呼吸障害/,/画像を待たず/,/安定した気胸疑いでは胸部X線/]);
});
for(const [key,name] of [['fever','細菌性髄膜炎'],['headache','細菌性髄膜炎'],['consciousness','細菌性髄膜炎・脳炎'],['convulsion','中枢神経感染・脳炎']])test(key+' 髄膜炎の安全な検査順序',()=>{
 includesAll(text(key,name),[/CTは一律には行わない/,/安全に実施でき.*遅らせない場合/,/GCS 9以下/,/瞳孔反応異常/,/占拠性病変/,/新規局在神経徴候/,/進行性.*急速な意識低下/,/危険因子が解消するまで/,/ショック.*痙攣.*出血リスク/,/CT正常だけで安全とは判断しない/,/抗菌薬.*画像より先/,/安全になり次第速やかに腰椎穿刺/]);
 assert.ok(killer(key,name).refs.includes('NG240'));
});
test('紫斑・ショックでは髄液検査を急がせない',()=>includesAll(text('rash','髄膜炎菌感染症・電撃性紫斑'),[/広範.*紫斑では腰椎穿刺を行わない/,/安全になるまで延期/,/直ちに抗菌薬/]));
const scenarios=[
 ['fever','敗血症・敗血症性ショック',[/ショックまたは敗血症の可能性が高ければ/,/ショックのない疑い例/,/有意に遅らせない/]],
 ['chest_pain','急性大動脈解離',[/低血圧・ショックでは一律に降圧せず/]],
 ['abd_pain','重症急性膵炎',[/他の急性腹症.*待たない/]],
 ['consciousness','低血糖',[/低血糖による意識障害/,/経口投与しない/,/再検/]],
 ['consciousness','重度の代謝性破綻',[/低Naと高Naを区別/,/痙攣・昏睡.*高張食塩水/,/過補正/]],
 ['convulsion','てんかん重積状態',[/全身性痙攣が5分以上/,/気道・換気・循環/,/検査結果を待たない/]],
 ['bleeding','抗凝固薬・抗血小板薬による出血',[/生命を脅かす出血/,/軽微な出血に中和薬を一律使用しない/]],
 ['bleeding','上部消化管出血',[/蘇生後/,/静脈瘤出血を疑う場合/]],
 ['edema','蜂窩巣炎・壊死性筋膜炎',[/画像待ち.*遅らせない/,/広域抗菌薬/]],
 ['oliguria','腎前性（循環血液量・心拍出量の不足）',[/循環血液量減少が疑われる場合/,/心不全・体液過剰.*一律に輸液負荷しない/]],
 ['oliguria','急性腎障害の原因としての横紋筋融解・腫瘍崩壊',[/無尿・肺うっ血.*大量輸液を継続せず/]],
 ['oliguria','高カリウム血症による心停止',[/心電図変化では静注カルシウム/,/心電図が正常でも/,/血糖・Kを反復監視/]],
 ['diarrhea','重度脱水・循環血液量減少性ショック',[/ショック・重度脱水.*静脈内蘇生を優先/,/軽〜中等度.*経口補水/]],
 ['vomiting','糖尿病性ケトアシドーシス',[/インスリン前にKを確認/,/3.5.*未満なら補充を優先/,/インスリンを延期/]],
 ['vomiting','副腎不全・高カルシウム血症',[/副腎クリーゼ/,/結果待ちで遅らせず/,/安定した副腎不全疑い/]],
 ['fatigue','副腎不全',[/ショック・急性重症化/,/翌朝や負荷試験を待たず/,/安定例は先に/]],
 ['jaundice','急性胆管炎',[/中等症は早期/,/重症は初期安定化後/,/軽症も初期治療に反応しなければ/]],
 ['joint_pain','化膿性関節炎',[/抗菌薬は穿刺後に.*全身状態が悪ければ待たない/]],
 ['numbness','脊髄圧迫・馬尾症候群',[/神経症状を伴う悪性脊髄圧迫/,/既往だけで一律投与しない/]]
];
for(const [key,name,patterns] of scenarios)test(key+' '+name,()=>includesAll(text(key,name),patterns));
test('HIT/TTPは事前確率と検体採取・治療時機を区別',()=>{
 includesAll(text('bleeding','血小板減少の緊急（TTP・HIT）'),[/中〜高確率/,/低確率に一律/,/血漿交換前にADAMTS13用採血/,/結果を待たず/]);
 assert.match(text('jaundice','重度溶血（TTP・自己免疫性溶血・DIC）'),/結果を待たず/);
});
test('PE・高血圧・造影検査の条件を省略しない',()=>{
 includesAll(text('chest_pain','肺血栓塞栓症'),[/PE likelyならD-ダイマーを待たず/,/unlikelyならD-ダイマー/,/ショックでは救急対応/]);
 assert.match(text('headache','脳静脈血栓症・高血圧性緊急症'),/血圧値だけで一律に降圧しない/);
 assert.match(text('oliguria','腎前性（循環血液量・心拍出量の不足）'),/緊急造影検査.*一律に延期しない/);
});
test('鑑別の注記にも治療を遅らせる指示を残さない',()=>{
 const notes=key=>assess(key).groups.flatMap(g=>g.dds.map(d=>d.note)).join('\n');
 includesAll(notes('consciousness'),[/ブドウ糖投与をチアミン待ちで遅らせない/,/フルマゼニル.*一律に投与しない/]);
 assert.match(notes('paralysis'),/改善待ちにせず/);
});
test('危険所見を入力しても処置文の適応条件を省略しない',()=>{
 for(const key of keys){const empty=assess(key),flagged=assess(key,{hx_consciousness_impaired:true,hx_breath_down_unilat:true,hx_bp_lr_diff:true},{vitals:{sbp:70,spo2:80}});
 for(const k of empty.killers)assert.deepEqual(Array.from(flagged.killers.find(x=>x.name===k.name).tests),Array.from(k.tests));}
 const k=assess('chest_pain',{hx_bp_lr_diff:true}).killers.find(k=>k.name==='急性大動脈解離');assert.ok(k.litCount>0);
});
test('全出典IDが解決し、各主訴が既存HTML構造で描画される',()=>{
 for(const key of keys){const card=assess(key);for(const id of [...card.refs,...card.killers.flatMap(k=>k.refs)])assert.ok(c.DXRefs.get(id),id);
 const html=sections[0]({result:{findings:{},derived:{}},input:{values:{},context:{complaints:[key]}}});
 includesAll(html,[/class="cc"/,/class="cc-killer/,/red flag/,/まだ入力・確認されていない/]);
 for(const k of card.killers)for(const t of k.tests)assert.ok(html.includes(c.LabsCore.esc(t)),key+' missing rendered instruction');
 assert.doesNotMatch(html,/頭部CT → 腰椎穿刺|気胸を疑えば画像前に胸腔穿刺/);
 }
});
console.log(`${count} safety regression groups passed`);
