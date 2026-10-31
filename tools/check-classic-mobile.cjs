const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright' : 'playwright');
const fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});const results=[];
for(const width of [320,390]){
 const page=await browser.newPage({viewport:{width,height:844},colorScheme:'light'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:8000/nurse-classic/');
 const dark=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor); if(dark==='rgb(255, 255, 255)')throw Error('not dark');
 const groups=await page.evaluate(()=>Object.entries(SCENES).map(([id,s])=>[id,s.length]));let count=0;
 for(const [id,n] of groups){await page.goto('http://localhost:8000/nurse-classic/#/watch/'+id);await page.waitForSelector('#slideHeading');
 for(let i=0;i<n;i++){
 const issues=await page.evaluate(({id,i})=>{const out=[];const rect=s=>document.querySelector(s).getBoundingClientRect();const h=rect('#slideHeading'),p=rect('#slidePoints'),c=rect('#slideCaption'),bar=rect('.lesson__bar'),f=rect('#slideFigure');
 if(document.documentElement.scrollWidth>innerWidth+1)out.push('horizontal overflow');
 if(h.bottom>p.top+1||p.bottom>c.top+1||c.bottom>bar.top+1)out.push('text overlap');
 if(f.height>0&&f.bottom>h.top+1)out.push('figure overlap');
 for(const s of ['#slideHeading','#slidePoints','#slideCaption']){const el=document.querySelector(s);if(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1)out.push('clipping '+s);}
 const scene=SCENES[id][i];if(document.querySelector('#slideCaption').textContent!==scene.narration)out.push('caption');
 if(document.querySelector('#slideHeading').textContent!==scene.heading)out.push('heading');
 if(JSON.stringify([...document.querySelectorAll('#slidePoints li')].map(e=>e.textContent))!==JSON.stringify(scene.points))out.push('points');
 return out;},{id,i});if(issues.length)throw Error(width+' '+id+'-'+(i+1)+' '+issues.join(','));count++;if(i<n-1)await page.click('#btnNext');
 }}
 if(errors.length)throw Error(errors.join('\n'));results.push({width,scenes:count,darkBackground:dark,errors});await page.close();
}
// Simulate missing Japanese TTS: browser emits onend immediately.
for(const mode of ['onend','onerror','muted']){
 const p=await browser.newPage({viewport:{width:390,height:844}});
 await p.addInitScript(({mode})=>{Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[],addEventListener:()=>{},cancel:()=>{},speak:u=>setTimeout(()=>u[mode==='onerror'?'onerror':'onend']?.(),0)}});window.SpeechSynthesisUtterance=class{constructor(t){this.text=t;}};},{mode});
 await p.goto('http://localhost:8000/nurse-classic/#/watch/anat03');await p.waitForSelector('#btnPlay');
 if(mode==='muted')await p.click('#btnMute');
 const duration=await p.evaluate(()=>900+SCENES.anat03[0].narration.length*130);
 await p.click('#btnPlay');await p.waitForTimeout(1000);if(!(await p.textContent('#counter')).startsWith('1 /'))throw Error('instant advance');
 await p.waitForFunction(()=>document.querySelector('#counter').textContent.startsWith('2 /'),{},{timeout:duration+5000});
 await p.click('#btnPlay');const paused=await p.textContent('#counter');await p.waitForTimeout(1000);if(await p.textContent('#counter')!==paused)throw Error('pause');
 await p.click('#btnPrev');if(!(await p.textContent('#counter')).startsWith('1 /'))throw Error('prev');
 await p.click('#btnNext');if(!(await p.textContent('#counter')).startsWith('2 /'))throw Error('next');
 results.push({playback:mode,duration,instantAdvance:false,pause:true,previousNext:true});await p.close();
}
await browser.close();console.log(JSON.stringify(results,null,2));})().catch(e=>{console.error(e);process.exit(1)});
