// Optional test-only jsdom dependency; no real API key, patient image, or network.
// RADIODECK_JSDOM_MODULE=/path/to/jsdom node --test tests/radiology-image-safety.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require(process.env.RADIODECK_JSDOM_MODULE || 'jsdom');
const root = path.resolve(__dirname, '..');
async function setup(t) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'radiology.html'), 'utf8'), {
    url: 'https://radiodeck.test/#/assist', runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  w.scrollTo = () => {};
  await new Promise(resolve => w.document.addEventListener('DOMContentLoaded', resolve, {once:true}));
  const readers = [], calls = [];
  w.FileReader = class {
    constructor() { readers.push(this); }
    readAsDataURL(file) { this.file = file; }
    finish() { this.result = 'data:image/png;base64,' + this.file.data; this.onload(); }
  };
  w.fetch = async (url, options) => {
    calls.push({url, body: JSON.parse(options.body)});
    return {ok:true, json:async () => ({content:[{type:'text',text:'mock response'}]})};
  };
  for (const tag of w.document.querySelectorAll('script[src]')) {
    vm.runInContext(fs.readFileSync(path.join(root, tag.getAttribute('src').split('?')[0]), 'utf8'), dom.getInternalVMContext());
  }
  const $ = id => w.document.getElementById(id);
  $('apiKey').value = 'invalid-test-key';
  function load(via='file', data='c2NoZW1hdGlj', type='image/png', size=1) {
    const file = {type, size, data};
    const event = new w.Event(via === 'file' ? 'change' : via, {bubbles:true,cancelable:true});
    if (via === 'file') Object.defineProperty($('fileInput'), 'files', {value:[file],configurable:true});
    if (via === 'drop') Object.defineProperty(event,'dataTransfer',{value:{files:[file]}});
    if (via === 'paste') Object.defineProperty(event,'clipboardData',{value:{items:[{type,getAsFile:()=>file}]}});
    (via === 'paste' ? w.document : $(via === 'file' ? 'fileInput':'drop')).dispatchEvent(event);
    return readers.at(-1);
  }
  async function send() { $('askBtn').click(); await new Promise(resolve => setImmediate(resolve)); }
  function confirm() { $('imageConfirmed').click(); }
  return {w,$,readers,calls,load,send,confirm};
}
for (const via of ['file','drop','paste']) {
  test(via + ': unconfirmed image blocks fetch; confirmed image sends', async t => {
    const a = await setup(t);
    a.load(via).finish();
    a.$('question').value = '模式図の説明';
    assert.equal(a.$('imageConfirmed').checked,false);
    await a.send(); assert.equal(a.calls.length,0);
    assert.match(a.$('status').textContent,/送信前/);
    a.confirm(); await a.send(); assert.equal(a.calls.length,1);
    const payload = a.calls[0].body;
    assert.equal(payload.messages[0].content[0].source.data,'c2NoZW1hdGlj');
    assert.match(payload.system,/解析せずに/);
    a.confirm(); await a.send(); assert.equal(a.calls.length,1);
  });
}
test('text-only and key persistence remain available', async t => {
  const a = await setup(t);
  a.$('question').value='CT値とは';
  await a.send(); assert.equal(a.calls.length,1);
  assert.deepEqual(a.calls[0].body.messages[0].content,[{type:'text',text:'CT値とは'}]);
  assert.equal(a.w.localStorage.getItem('radiodeck-apikey'),null);
  a.$('saveKey').checked=true;
  await a.send(); assert.equal(a.w.localStorage.getItem('radiodeck-apikey'),'invalid-test-key');
  a.$('saveKey').checked=false;
  await a.send(); assert.equal(a.w.localStorage.getItem('radiodeck-apikey'),null);
});
test('replacement, pending read, stale completion, clear, and reselect revoke confirmation', async t => {
  const a = await setup(t);
  a.load().finish(); a.confirm();
  const old = a.load('drop','b2xk');
  assert.equal(a.$('imageConfirmed').checked,false);
  a.$('question').value='question';
  await a.send(); assert.equal(a.calls.length,0);
  const newest = a.load('paste','bmV3'); newest.finish(); a.confirm(); old.finish();
  await a.send(); assert.equal(a.calls.length,1);
  assert.equal(a.calls[0].body.messages[0].content[0].source.data,'bmV3');
  const pending = a.load(); a.$('clearBtn').click(); pending.finish();
  assert.equal(a.$('imageConfirmed').checked,false);
  assert.equal(a.$('imageSafety').hidden,true);
  a.$('question').value='text'; await a.send();
  assert.equal(a.calls[1].body.messages[0].content.length,1);
  a.load().finish(); await a.send(); assert.equal(a.calls.length,2);
});
test('invalid/oversized/failed images cannot retain prior confirmed image', async t => {
  const a = await setup(t);
  for (const failure of ['type','size','error','abort','malformed']) {
    a.load().finish(); a.confirm();
    if (failure==='type') a.load('file','x','text/plain');
    else if (failure==='size') a.load('file','x','image/png',5*1024*1024+1);
    else {
      const reader = a.load();
      if (failure==='malformed') { reader.result='invalid'; reader.onload(); }
      else reader[failure==='error'?'onerror':'onabort']();
    }
    await a.send(); assert.equal(a.calls.length,0);
    assert.equal(a.$('imageConfirmed').checked,false);
  }
});
test('route re-entry starts without image or confirmation; warning remains', async t => {
  const a = await setup(t);
  a.load().finish(); a.confirm();
  a.w.dispatchEvent(new a.w.HashChangeEvent('hashchange'));
  assert.equal(a.$('imageConfirmed').checked,false);
  assert.equal(a.$('imageSafety').hidden,true);
  assert.match(a.w.document.querySelector('.rassist__warn').textContent,/実際の患者さんの画像は絶対にアップロードしない/);
  assert.match(a.$('imageSafetyHint').textContent,/自動判別・除去するものではありません/);
  a.$('apiKey').value='invalid-test-key';
  a.load('paste').finish(); await a.send(); assert.equal(a.calls.length,0);
});
