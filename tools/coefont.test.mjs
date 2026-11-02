import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,build,convert,dictionary,sha} from './build-coefont.mjs';
import {importAudio} from './import-coefont.mjs';
const rows=build();
test('118 scenes / 29 programs; VOICEVOX order, keys and display text preserved',()=>{
 const vv=JSON.parse(fs.readFileSync(path.join(root,'voicevox/manifest.json')));
 assert.equal(rows.length,118);assert.equal(new Set(rows.map(r=>r.program_id)).size,29);
 assert.deepEqual(rows.map(r=>[r.seq,r.key,r.display_text]),vv.map(r=>[r.seq,r.key,r.narration]));
 assert.equal(fs.readFileSync(path.join(root,'coefont/narration.txt'),'utf8').trim().split('\n').length,118);
 for(const r of rows) assert.match(r.speech_text,/^[ぁ-ゖー、。・「」『』！？!?（）()\s]+$/);
});
test('medical terms, context, abbreviations, decimals, counters and units',()=>{
 const d=dictionary();
 const cases={ '尿、尿細管、原尿、利尿薬':'にょ、にょうさいかん、げんにょう、りにょうやく',
 '上が心房、下が心室、上がる、下がる':'うえがしんぼう、したがしんしつ、あがる、さがる',
 '高カリウム、抑うつ、落ち着いて':'こうかりうむ、よくうつ、おちついて',
 'ADH、RAA、SpO2、pH、t-PA':'えーでぃーえいち、あーるえーえー、えすぴーおーつー、ぴーえいち、てぃーぴーえー',
 '36.5〜37.3度、95〜100%、400mL、1分間':'さんじゅうろくてんごからさんじゅうななてんさんど、きゅうじゅうごからひゃくぱーせんと、よんひゃくみりりっとる、いっぷんかん',
 '褥瘡、滲出液、側臥位、肘正中皮静脈':'じょくそう、しんしゅつえき、そくがい、ちゅうせいちゅうひじょうみゃく'};
 for(const [s,r] of Object.entries(cases)) assert.equal(convert(s,d).speech_text,r);
 assert.throws(()=>convert('999mg',d),/Unreviewed/);
});
function fixture(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'coefont-test-'));for(const p of ['data.js','scenes.js','coefont','audio']) fs.cpSync(path.join(root,p),path.join(dir,p),{recursive:true});return dir;}
test('source changes require review; unknown terms cannot silently pass',()=>{
 const dir=fixture();try{fs.appendFileSync(path.join(dir,'scenes.js'),'\nSCENES.anat01[0].narration += "変更";');assert.throws(()=>build(dir),/Source changed/);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('keyed imports, speed handling, preservation, rollback and invalid mappings',()=>{
 const dir=fixture();try{
 const audio=path.join(dir,'sample.wav');
 assert.equal(spawnSync('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:duration=2.6',audio]).status,0);
 const mapFile=path.join(dir,'import.json');const r=rows[0];
 const item={key:r.key,file:'sample.wav',voice:'後藤さん',input_speed:1,source_sha256:r.source_sha256,speech_sha256:sha(r.speech_text)};
 const manifest=path.join(dir,'audio/manifest.js');fs.writeFileSync(manifest,'const AUDIO_FILES = {"anat02-1":"audio/old.wav"};');
 const write=m=>fs.writeFileSync(mapFile,JSON.stringify(m));write([item]);
 assert.throws(()=>importAudio(mapFile,{dir}),/every scene/);
 let result=importAudio(mapFile,{dir,partial:true});assert.ok(Math.abs(result[0].output_duration-2)<0.12);
 assert.match(fs.readFileSync(manifest,'utf8'),/audio\/old.wav/);
 write([{...item,input_speed:1.3}]);result=importAudio(mapFile,{dir,partial:true});assert.ok(Math.abs(result[0].output_duration-2.6)<0.12);
 const before=fs.readFileSync(manifest,'utf8');
 for(const invalid of [[item,item],[{...item,key:'unknown'}],[{...item,input_speed:1.69}],[{...item,source_sha256:'old'}],[{...item,speech_sha256:'old'}],[{...item,file:'missing.mp3'}]]){
 write(invalid);assert.throws(()=>importAudio(mapFile,{dir,partial:true}));assert.equal(fs.readFileSync(manifest,'utf8'),before);
 }
 fs.writeFileSync(path.join(dir,'broken.mp3'),'not audio');write([{...item,file:'broken.mp3'}]);assert.throws(()=>importAudio(mapFile,{dir,partial:true}));assert.equal(fs.readFileSync(manifest,'utf8'),before);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
