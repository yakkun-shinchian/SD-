// Synthetic fixtures only; fetch is stubbed. No patient data or real credentials.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require(process.env.RADIODECK_JSDOM_MODULE || 'jsdom');
const root=path.resolve(__dirname,'..');
async function setup(t, hash='#/assist') {
 const dom=new JSDOM(fs.readFileSync(path.join(root,'radiology.html'),'utf8'),{url:'https://radiodeck.test/'+hash,runScripts:'outside-only'});
 t.after(()=>dom.window.close());
 const w=dom.window; w.scrollTo=()=>{};
 await new Promise(r=>w.document.addEventListener('DOMContentLoaded',r,{once:true}));
 w.localStorage.setItem('radiodeck-apikey','legacy-fake-key');
 w.sessionStorage.setItem('radiodeck-apikey','legacy-fake-key');
 const calls=[],readers=[];
 w.FileReader=class {constructor(){readers.push(this);throw Error('No file reads allowed');}};
 w.fetch=async(url,options)=>{calls.push({url,options,body:JSON.parse(options.body)});return {ok:true,json:async()=>({content:[{type:'text',text:'mock response'}]})};};
 for(const tag of w.document.querySelectorAll('script[src]')) vm.runInContext(fs.readFileSync(path.join(root,tag.getAttribute('src').split('?')[0]),'utf8'),dom.getInternalVMContext());
 const $=id=>w.document.getElementById(id);
 const route=hash=>{w.history.replaceState(null,'',hash);w.dispatchEvent(new w.HashChangeEvent('hashchange'));};
 const send=async()=>{$('askBtn').click();await new Promise(r=>setImmediate(r));};
 const prepare=()=>{$('apiKey').value='invalid-test-key';$('question').value='CT値の仕組み';};
 const confirm=()=>{$('textConfirmed').click();};
 function attachment(kind){
  const ev=new w.Event(kind,{bubbles:true,cancelable:true});
  const file=new w.File(['synthetic'],'fixture.png',{type:'image/png'});
  Object.defineProperty(ev,kind==='paste'?'clipboardData':'dataTransfer',{value:{files:[file],items:[{kind:'file',type:'image/png',getAsFile:()=>file}]}});
  $('question').dispatchEvent(ev);return ev;
 }
 return {w,$,calls,readers,route,send,prepare,confirm,attachment,dom};
}
test('public build has no upload controls or image serialization code',async t=>{
 const a=await setup(t);a.prepare();
 assert.equal(a.w.document.querySelector('input[type=file]'),null);
 assert.equal(a.$('imageConfirmed'),null);assert.equal(a.$('saveKey'),null);
 const source=fs.readFileSync(path.join(root,'radiology-app.js'),'utf8');
 assert.doesNotMatch(source,/new FileReader|readAsDataURL|type:\s*["']image["']|media_type|imageData/);
 await a.send();assert.equal(a.calls.length,0);
 a.confirm();await a.send();
 assert.deepEqual(a.calls[0].body.messages[0].content,[{type:'text',text:'CT値の仕組み'}]);
 assert.equal(a.calls[0].options.headers['x-api-key'],'invalid-test-key');
 assert.ok(!JSON.stringify(a.calls[0].body).includes('invalid-test-key'));
 await a.send();assert.equal(a.calls.length,1); // consent consumed
});
for(const via of ['paste','drop']) test(via+' and replacement revoke consent without reading or sending files',async t=>{
 const a=await setup(t);a.prepare();a.confirm();
 assert.equal(a.attachment(via).defaultPrevented,true);
 await a.send();assert.equal(a.calls.length,0);
 a.confirm();a.attachment(via);await a.send();assert.equal(a.calls.length,0);
 a.confirm();await a.send();assert.equal(a.calls.length,1);
 assert.deepEqual(a.calls[0].body.messages[0].content,[{type:'text',text:'CT値の仕組み'}]);
 assert.equal(a.readers.length,0);
});
test('editing, silent replacement, clear, and route re-entry cannot inherit consent',async t=>{
 const a=await setup(t);a.prepare();a.confirm();
 a.$('question').dispatchEvent(new a.w.Event('input'));await a.send();assert.equal(a.calls.length,0);
 a.confirm();a.$('question').value='別の一般的な質問';await a.send();assert.equal(a.calls.length,0);
 a.confirm();a.$('clearBtn').click();assert.equal(a.$('apiKey').value,'');
 a.prepare();await a.send();assert.equal(a.calls.length,0);
 a.confirm();a.route('#/dict');a.route('#/assist');
 assert.equal(a.$('apiKey').value,'');a.prepare();await a.send();assert.equal(a.calls.length,0);
 a.confirm();await a.send();assert.equal(a.calls.length,1);
});
test('text paste revokes confirmation; checkbox alone without change is insufficient',async t=>{
 const a=await setup(t);a.prepare();a.confirm();
 a.$('question').dispatchEvent(new a.w.Event('paste',{bubbles:true}));
 a.$('textConfirmed').checked=true;await a.send();assert.equal(a.calls.length,0);
});
test('legacy keys removed on every entry route; no key persistence after sending',async t=>{
 const a=await setup(t,'#/dict');
 assert.equal(a.w.localStorage.getItem('radiodeck-apikey'),null);
 assert.equal(a.w.sessionStorage.getItem('radiodeck-apikey'),null);
 a.route('#/assist');a.prepare();a.confirm();await a.send();
 assert.equal(a.w.localStorage.getItem('radiodeck-apikey'),null);
 assert.equal(a.w.sessionStorage.getItem('radiodeck-apikey'),null);
 assert.match(a.w.document.querySelector('.rassist__warn').textContent,/自動判別・除去する機能はありません/);
});
