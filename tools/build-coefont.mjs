// Display/caption content remains in scenes.js. No external conversion service.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const sha = text => crypto.createHash('sha256').update(text).digest('hex');
export function sourceRows(dir = root) {
  const ctx = vm.createContext({});
  for (const f of ['data.js', 'scenes.js']) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
  const {programs, scenes} = vm.runInContext('({programs: PROGRAMS, scenes: SCENES})', ctx);
  const rows = [];
  for (const p of programs) {
    if (!scenes[p.id]?.length) throw Error(`Missing scenes: ${p.id}`);
    scenes[p.id].forEach((s, i) => rows.push({seq: rows.length + 1, program_id: p.id, scene_no: i + 1,
      key: `${p.id}-${i + 1}`, target_wav: `${p.id}-${i + 1}.wav`, heading: s.heading, display_text: s.narration}));
  }
  if (new Set(rows.map(r => r.key)).size !== rows.length) throw Error('Duplicate scene key');
  return rows;
}
export function dictionary(dir = root) {
  const entries = fs.readFileSync(path.join(dir, 'coefont/readings.tsv'), 'utf8').trim().split('\n').map(l => {
    const [surface, reading] = l.split('\t');
    if (!surface || !reading || !/^[ぁ-ゖー、。・ ]+$/.test(reading)) throw Error(`Invalid reading: ${l}`);
    return {surface, reading};
  });
  if (new Set(entries.map(e => e.surface)).size !== entries.length) throw Error('Duplicate reading');
  return entries.sort((a,b) => b.surface.length - a.surface.length);
}
export function convert(text, entries) {
  let speech = '', offset = 0; const tokens = [];
  while (offset < text.length) {
    const entry = entries.find(e => text.startsWith(e.surface, offset));
    if (entry) {
      tokens.push({...entry, offset}); speech += entry.reading; offset += entry.surface.length;
    } else {
      const ch = text[offset++];
      if (/[ァ-ヶ]/.test(ch)) speech += String.fromCharCode(ch.charCodeAt(0) - 0x60);
      else if (/^[ぁ-ゖー、。・「」『』！？!?（）()\s]$/.test(ch)) speech += ch;
      else throw Error(`Unreviewed character at ${offset-1}: ${text.slice(offset-8,offset+12)}`);
    }
  }
  return {speech_text: speech, tokens};
}
export const csv = (rows, columns) => '\uFEFF' + [columns, ...rows.map(r => columns.map(c => r[c] ?? ''))]
  .map(row => row.map(v => '"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
// Review is evidence for an exact original/kana pair, never a blanket approval
// of future dictionary output. Human approval and audio listening stay separate.
export function reviewFor(row, reviews) {
  const saved = reviews.get(row.key);
  if (!saved || saved.source_sha256 !== row.source_sha256 || saved.speech_sha256 !== sha(row.speech_text))
    return {text_review:'要再校正', human_review:'未確認', audio_review:'未試聴',
      note:'原文または読みが校正記録と一致しません。全文を再照合してください。', audio_check:'文字校正後に実音声で確認。'};
  return saved;
}
export function build(dir = root) {
  const entries = dictionary(dir), sources = sourceRows(dir);
  const reviewRows = JSON.parse(fs.readFileSync(path.join(dir, 'coefont/text-review.json'), 'utf8'));
  const reviews = new Map(reviewRows.map(r => [r.key, r]));
  if (reviews.size !== reviewRows.length || reviewRows.some(r => !sources.some(s => s.key === r.key)))
    throw Error('Duplicate/unknown text review key');
  const lock = JSON.parse(fs.readFileSync(path.join(dir, 'coefont/source-lock.json'), 'utf8'));
  if (JSON.stringify(sources.map(r => [r.key, sha(r.display_text)])) !== JSON.stringify(lock))
    throw Error('Source changed: review scene wording/readings and update source-lock.json deliberately.');
  const rows = sources.map(r => {
    const row = {...r, ...convert(r.display_text, entries), source_sha256: sha(r.display_text),
      voice:'後藤さん', target_speed:1.3};
    const review = reviewFor(row, reviews);
    return {...row, reading_review:`${review.text_review}・人による確認:${review.human_review}・実音声:${review.audio_review}`};
  });
  const out = path.join(dir, 'coefont'); fs.mkdirSync(path.join(out, 'scripts'), {recursive:true});
  const write = (f, data) => fs.writeFileSync(path.join(out, f), data);
  write('narration.txt', rows.map(r => r.speech_text).join('\n')+'\n');
  write('manifest.json', JSON.stringify(rows, null, 2)+'\n');
  write('manifest.csv', csv(rows, ['seq','key','program_id','scene_no','target_wav','heading','display_text','speech_text','source_sha256','voice','target_speed','reading_review']));
  write('review.csv', csv(rows.flatMap(r => r.tokens.map(t => ({key:r.key, ...t,
    kind: /[0-9]/.test(t.surface) ? '数値・単位または略語' : /[A-Za-zβ]/.test(t.surface) ? '略語・記号' : /[ァ-ヶ]/.test(t.surface) ? '片仮名・医学用語' : '漢字・医学用語・文脈読み',
    context:r.display_text.slice(Math.max(0,t.offset-10),t.offset+t.surface.length+10),
    human_review:reviewFor(r,reviews).human_review, note:t.surface==='尿'?'単独の尿は利用者指定の「にょ」。複合語は標準読み。':'',
    ai_text_review:reviewFor(r,reviews).text_review, audio_review:reviewFor(r,reviews).audio_review,
    scene_review_note:reviewFor(r,reviews).note}))),
    ['key','offset','surface','reading','kind','context','human_review','note','ai_text_review','audio_review','scene_review_note']));
  write('scene-review.csv', csv(rows.map(r => ({...r, speech_sha256:sha(r.speech_text), ...reviewFor(r,reviews)})),
    ['seq','key','heading','display_text','speech_text','source_sha256','speech_sha256','reviewer','reviewed_on',
      'text_review','human_review','audio_review','note','audio_check']));
  write('import-template.json', JSON.stringify(rows.map(r=>({key:r.key,file:`export/${r.key}.mp3`,input_speed:1,voice:'後藤さん',source_sha256:r.source_sha256,speech_sha256:sha(r.speech_text)})),null,2)+'\n');
  for (const r of rows) write(`scripts/${String(r.seq).padStart(3,'0')}_${r.key}.txt`, r.speech_text+'\n');
  return rows;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(`CoeFont: ${build().length} scenes exported`); } catch(e) {console.error(e.message); process.exitCode=1;}
}
