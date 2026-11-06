// Optional DOM smoke check; jsdom is an external test-only dependency. No browser layout assertion.
const {JSDOM,VirtualConsole}=require(process.env.RADIODECK_JSDOM_MODULE || 'jsdom');
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require('path').resolve(__dirname,'..')+'/';
function app(file){const html=fs.readFileSync(root+file,'utf8');const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://radiodeck.test/'+file,runScripts:'outside-only',virtualConsole:vc,pretendToBeVisual:true});const w=dom.window;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.speechSynthesis={cancel(){},getVoices(){return []},addEventListener(){}};for(const tag of w.document.querySelectorAll('script[src]'))vm.runInContext(fs.readFileSync(root+tag.getAttribute('src').split('?')[0],'utf8'),dom.getInternalVMContext());w.document.dispatchEvent(new w.Event('DOMContentLoaded'));return {dom,w,errors};}
function route(w,hash){w.history.replaceState(null,'',hash);w.dispatchEvent(new w.HashChangeEvent('hashchange'));}
const {dom,w,errors}=app('radiology.html');const signs=vm.runInContext('RAD_SIGNS',dom.getInternalVMContext());let details=0;
for(const s of signs){for(const level of ['easy','deep']){route(w,'#/sign/'+s.id);w.document.querySelector('[data-level="'+level+'"]').click();assert.ok(w.document.querySelector('#main').textContent.replace(/\s/g,'').includes(s[level].replace(/\s/g,'')));assert.ok(w.document.querySelector('.radfig-wrap svg'));details++;}}
route(w,'#/navigate/head');w.document.querySelector('[data-tag="loc-epidural"]').click();w.document.querySelector('[data-tag="shape-lens"]').click();assert.ok(w.document.querySelector('.rcards a').href.endsWith('/edh-acute'));
route(w,'#/navigate/chest');w.document.querySelector('[data-tag="linear"]').click();w.document.querySelector('[data-tag="dist-lower"]').click();assert.ok(w.document.querySelector('.rcards a').href.endsWith('/kerley-b'));
const figures=vm.runInContext('Object.values(RAD_FIGURES).map(f=>f())',dom.getInternalVMContext());assert.ok(figures.every(x=>x.includes('<svg')));
assert.deepEqual(errors,[]);dom.window.close();
const n=app('nurse.html');const cards=n.w.document.querySelectorAll('.card');assert.equal(cards.length,29);assert.deepEqual(n.errors,[]);n.dom.window.close();
console.log(JSON.stringify({detail_views:details,reverse_lookup_cases:2,svg_functions:figures.length,nursetube_cards:cards.length,js_errors:0,limitation:'jsdom checks DOM and events, not actual browser layout/audio'}));
