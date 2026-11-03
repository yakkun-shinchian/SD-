// Keyed import only: never guess scene order from filenames.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {root, build, sha} from './build-coefont.mjs';
function run(cmd, args) {
  const r=spawnSync(cmd,args,{encoding:'utf8'});
  if(r.error || r.status!==0) throw Error(`${cmd}: ${r.error?.message || r.stderr}`);
  return r.stdout;
}
export function duration(file) {
  const n=Number(run('ffprobe',['-v','error','-select_streams','a:0','-show_entries','stream=duration','-of','default=nw=1:nk=1',file]).trim());
  if(!Number.isFinite(n)||n<=0) throw Error(`No valid audio: ${file}`);
  return n;
}
export function importAudio(mappingPath, {dir=root, partial=false}={}) {
  const rows=build(dir), byKey=new Map(rows.map(r=>[r.key,r]));
  const mapping=JSON.parse(fs.readFileSync(mappingPath,'utf8'));
  if(!Array.isArray(mapping)||!mapping.length) throw Error('Empty mapping');
  if(!partial && mapping.length!==rows.length) throw Error('Full import requires every scene; use --partial explicitly');
  const seen=new Set(), files=new Set();
  const items=mapping.map(m=>{
    const r=byKey.get(m.key);
    if(!r||seen.has(m.key)) throw Error(`Unknown/duplicate key: ${m.key}`);
    seen.add(m.key);
    if(m.source_sha256!==r.source_sha256||m.speech_sha256!==sha(r.speech_text)) throw Error(`Stale script: ${m.key}`);
    if(![1,1.3].includes(m.input_speed)) throw Error(`Declare input_speed 1 or 1.3: ${m.key}`);
    if(m.voice!=='後藤さん') throw Error(`Expected voice label 後藤さん: ${m.key}`);
    if(typeof m.file!=='string'||! /\.(wav|mp3|m4a|ogg)$/i.test(m.file)) throw Error('Unsupported file');
    const file=fs.realpathSync(path.resolve(path.dirname(mappingPath),m.file));
    if(files.has(file)) throw Error('Duplicate audio file'); files.add(file);
    return {...m,file,input_duration:duration(file)};
  });
  const audioDir=path.join(dir,'audio'); fs.mkdirSync(audioDir,{recursive:true});
  const manifestPath=path.join(audioDir,'manifest.js');
  const previous=fs.readFileSync(manifestPath,'utf8');
  const oldMap=vm.runInNewContext(previous+';AUDIO_FILES',Object.create(null),{timeout:1000});
  const map={...oldMap}, batch=`coefont-${crypto.randomUUID()}`;
  const stage=fs.mkdtempSync(path.join(audioDir,'.coefont-stage-'));
  let published=false;
  try {
    const report=[];
    for(const m of items) {
      const output=path.join(stage,`${m.key}.wav`), factor=1.3/m.input_speed;
      run('ffmpeg',['-v','error','-nostdin','-y','-i',m.file,'-map','0:a:0','-vn','-af',`atempo=${factor}`,'-c:a','pcm_s16le',output]);
      const outputDuration=duration(output), expected=m.input_duration/factor;
      if(Math.abs(outputDuration-expected)>Math.max(0.12,expected*0.03)) throw Error(`Unexpected duration: ${m.key}`);
      map[m.key]=`audio/${batch}/${m.key}.wav`;
      report.push({...m,applied_factor:factor,target_speed:1.3,output_duration:outputDuration,output:map[m.key]});
    }
    fs.writeFileSync(path.join(stage,'import-report.json'),JSON.stringify(report,null,2)+'\n');
    fs.writeFileSync(path.join(stage,'previous-manifest.js'),previous);
    if(fs.readFileSync(manifestPath,'utf8')!==previous) throw Error('Audio manifest changed during import');
    fs.renameSync(stage,path.join(audioDir,batch)); published=true;
    const temp=path.join(audioDir,`.manifest-${batch}.tmp`);
    fs.writeFileSync(temp,'/* CoeFont audio, speed baked in; existing audio keys preserved. */\nconst AUDIO_FILES = '+JSON.stringify(map,null,2)+';\n');
    fs.renameSync(temp,manifestPath);
    return report;
  } catch(e) {
    if(!published) fs.rmSync(stage,{recursive:true,force:true});
    throw e;
  }
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2);
    if(!args[0]||args.some((a,i)=>i>0 && a!=='--partial')) throw Error('Usage: node tools/import-coefont.mjs coefont/import.json [--partial]');
    console.log(`Imported: ${importAudio(path.resolve(args[0]),{partial:args.includes('--partial')}).length}`);
  }catch(e){console.error(e.message);process.exitCode=1;}
}
