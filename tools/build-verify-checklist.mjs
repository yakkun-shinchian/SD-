/* tools/build-verify-checklist.mjs
 * 実装コードから照合チェックリストを自動生成する。
 * 手書きの一覧は必ず実装からずれるため、レジストリを直接走査して
 * verify-data.js（グローバル VERIFY_DATA）を書き出す。
 *
 *   node tools/build-verify-checklist.mjs
 */
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const c = vm.createContext({ console, Math, Date, JSON, isFinite, Number, String, Array, Object, parseFloat, parseInt });
const load = (f) => vm.runInContext(fs.readFileSync(new URL(f, root), 'utf8'), c, { filename: f });
['labs-core.js', 'labs-cbc.js', 'labs-chem.js', 'labs-coag.js', 'labs-autoab.js',
 'dx-refs.js', 'dx-abg.js', 'dx-scores.js', 'dx-core.js', 'labs-integrate.js'].forEach(load);

const { LabsCore, DXScores, DXCore, DXRefs, LabsIntegrate } = c;
const sections = [];
/* ---- 確信度の仕分け ----
 * solid    … 原典で値が確定しており、照合しても動く見込みが薄い
 * varies   … 出典により値が割れる。臨床家が手元の成書を引く価値が最も高い
 * facility … 施設の測定系・規定に依存する。自施設での確認が要る
 * design   … 本アプリの設計判断（重みづけ・組み合わせ）。原典が存在しない
 */
const VARIES = {
  'abg.metalk': '係数 0.6 と 0.7 の二系統がある。本アプリは国内の成書に合わせて 0.6 を採用（2026-10-31 に 0.7 から変更）。',
  'abg.ra': '慢性呼吸性アシドーシスの代償係数は 3.5 と 4.0 の二系統がある。本アプリは 3.5。',
  'abg.ralk': '慢性呼吸性アルカローシスの代償係数は 4.0 と 5.0 の二系統がある。本アプリは 4.0。',
  'abg.ag': 'AG の基準は測定法により異なり、12 ± 2 とする文献と 8〜12 とする文献がある。本アプリは 12 ± 2、開大の判定は補正後 >14。',
  'abg.agcorr': 'アルブミン補正の係数は 2.5 が主流だが 2.0 を採る文献もある。本アプリは 2.5。',
  'abg.delta': 'Δ比で純粋な AG開大性とみなす下限が 0.8 と 1.0 で割れる。本アプリは 0.8。',
  'abg.aado2': '年齢補正式は「年齢/4 + 4」と「2.5 + 0.21 × 年齢」の二系統がある。本アプリは前者。',
  'abg.osm': '推算式は 2×Na + 血糖/18 + BUN/2.8 を採用。1.86×Na を使う式もある。',
  'calc.cca': 'Payne 式の補正基準アルブミンは 4.0 g/dL を採用。4.5 を採る文献もある。',
  'calc.buncr': '20 という閾値は目安であり、明確な原典上のカットオフではない。',
  'calc.deritis': '2 という閾値は目安。',
  'score.gbs': 'Glasgow-Blatchford は配点の版差がある。本アプリは原著の配点。',
  'score.jss_ap': 'LDH の「基準値上限の2倍」を 444 U/L（222 × 2）として自動入力している。自施設の LDH 基準値上限で変わる。',
  'score.isth_dic': 'PT 延長（秒）を PT活性または INR から換算している。本来は対照値との秒差であり、施設の対照値により変わる。',
  'score.childpugh': 'PT の区分を活性（%）と INR の両方から判定している。読み替えの境界は施設差がある。',
  'score.meldna': 'MELD の上下限（6〜40）と Cr の上限 4.0、透析時の扱いは版により異なる。',
  'score.news2': 'SpO₂ はスケール1のみ実装。慢性II型呼吸不全に用いるスケール2は未実装。',
  'pat.ch-siadh': '尿中Na の閾値は 20 以上とする基準と 40 以上とする基準がある。本アプリは特異度を優先して 40 以上（2026-10-31 に 30 から変更）。',
};

function confidenceOf(sec, it) {
  if (VARIES[it.id]) return { conf: 'varies', confNote: VARIES[it.id] };
  if (sec === 'panic') return { conf: 'facility', confNote: 'パニック値は施設規定が最優先。自施設の規定で上書きしてください。' };
  if (sec === 'ref') return it.tag === '施設依存'
    ? { conf: 'facility', confNote: 'JCCLS 未収載。自施設の検査室基準で確認してください。' }
    : { conf: 'solid', confNote: '' };
  if (sec === 'ddx') return { conf: 'design',
    confNote: '支持所見の選択と重みづけは本アプリの設計判断で、原典があるものではありません。抜けている所見のご指摘が最も有益です。' };
  if (sec === 'pat') return { conf: 'design',
    confNote: '判定条件の組み立ては本アプリの設計判断です。閾値そのものは各項目の基準値に従います。' };
  return { conf: 'solid', confNote: '' };
}

const refLabel = (ids) => (ids || []).map((id) => (DXRefs.get(id) ? DXRefs.get(id).label : id));

/* ---- 1. 基準値 ---- */
const refItems = [];
LabsCore.domains.forEach((d) => {
  d.analytes.forEach((a) => {
    if (a.type === 'qual' || a.type === 'select') return;
    const m = LabsCore.refText(a, { sex: 'm' });
    const f = LabsCore.refText(a, { sex: 'f' });
    if (!m) return;
    refItems.push({
      id: d.id + '.' + a.key,
      label: a.label,
      detail: (m === f ? m : '男 ' + m + '／女 ' + f) + (a.unit ? ' ' + a.unit : ''),
      tag: a.facility ? '施設依存' : 'JCCLS',
      group: d.title + '／' + a.group,
      star: false
    });
  });
});
sections.push({ id: 'ref', title: '基準値', lead:
  '既定値は JCCLS 共用基準範囲（成人）。「施設依存」は JCCLS 未収載のため一般的な施設値を採用しています。' +
  '手元の書籍および自施設の検査室基準と照合してください。', items: refItems });

/* ---- 2. パニック値 ---- */
const panicItems = [];
LabsCore.domains.forEach((d) => {
  d.analytes.forEach((a) => {
    if (!a.panic) return;
    const p = [];
    if (a.panic.low != null) p.push('下限 ' + a.panic.low);
    if (a.panic.high != null) p.push('上限 ' + a.panic.high);
    panicItems.push({
      id: 'panic.' + a.key, label: a.label, detail: p.join('／') + (a.unit ? ' ' + a.unit : ''),
      tag: '要確認', group: d.title, star: true
    });
  });
});
sections.push({ id: 'panic', title: 'パニック値の閾値', lead:
  'パニック値は施設規定が最優先されます。自施設の規定と必ず突き合わせてください。', items: panicItems });

/* ---- 3. 酸塩基平衡の計算式 ----
 * 代償式は analyze() を実際に走らせて文字列を取り出す。
 * ここを手書きすると実装を直しても一覧が古いままになる（実際に一度やらかした）。
 */
const probe = (v) => LabsCore.evaluate(['abg'], { values: v, context: { sex: 'm', age: 60 } }).derived.abg;
const formulaOf = (v) => { const a = probe(v); return a.compensation ? a.compensation.formula : '(取得失敗)'; };
const F_MA   = formulaOf({ ph: 7.20, paco2: 30, hco3: 12, na: 140, cl: 110 });
const F_MALK = formulaOf({ ph: 7.52, paco2: 48, hco3: 38, na: 140, cl: 95 });
const F_RA_A = formulaOf({ ph: 7.21, paco2: 70, hco3: 27, na: 140, cl: 102, abgCourse: '急性（数時間〜数日）' });
const F_RA_C = formulaOf({ ph: 7.33, paco2: 70, hco3: 35, na: 140, cl: 96,  abgCourse: '慢性（数日以上・COPD等）' });
const F_RL_A = formulaOf({ ph: 7.50, paco2: 28, hco3: 22, na: 140, cl: 104, abgCourse: '急性（数時間〜数日）' });
const F_RL_C = formulaOf({ ph: 7.47, paco2: 28, hco3: 20, na: 140, cl: 108, abgCourse: '慢性（数日以上・COPD等）' });

sections.push({ id: 'abg', title: '酸塩基平衡の計算式・閾値', lead:
  '血液ガス読影の中核。代償式は実装から読み出しています。式そのものの妥当性を照合してください。', items: [
  { id:'abg.ph', label:'pH 判定域', detail:'アシデミア <7.35／正常 7.35〜7.45／アルカレミア >7.45', star:true, refs:[] },
  { id:'abg.primary', label:'一次性障害の境界', detail:'HCO₃⁻ <22 / >26 mmol/L、PaCO₂ <35 / >45 mmHg', star:true, refs:[] },
  { id:'abg.winter', label:'代謝性アシドーシスの代償（Winter 式）', detail:F_MA, star:true, refs:['WINTER'] },
  { id:'abg.metalk', label:'代謝性アルカローシスの代償', detail:F_MALK, star:true, refs:[] },
  { id:'abg.ra', label:'呼吸性アシドーシスの代償', detail:'急性：' + F_RA_A + '\n慢性：' + F_RA_C, star:true, refs:[] },
  { id:'abg.ralk', label:'呼吸性アルカローシスの代償', detail:'急性：' + F_RL_A + '\n慢性：' + F_RL_C, star:true, refs:[] },
  { id:'abg.ag', label:'アニオンギャップ', detail:'AG = Na − (Cl + HCO₃⁻)、基準 12 ± 2、開大の判定は補正後 >14', star:true, refs:[] },
  { id:'abg.agcorr', label:'アルブミン補正', detail:'補正AG = AG + 2.5 × (4.0 − Alb)', star:true, refs:['FIGGE'] },
  { id:'abg.delta', label:'Δ比（デルタ比）', detail:'(補正AG − 12) ÷ (24 − HCO₃⁻)。<0.4 高Cl性主体／0.4〜0.8 混合／0.8〜2.0 純粋なAG開大／>2.0 代謝性アルカローシス合併', star:true, refs:[] },
  { id:'abg.goldmark', label:'AG開大の鑑別', detail:'GOLD MARK（Glycols／Oxoproline／L-lactate／D-lactate／Methanol／Aspirin／Renal failure／Ketoacidosis）', star:false, refs:['GOLDMARK'] },
  { id:'abg.uag', label:'尿アニオンギャップ', detail:'尿Na + 尿K − 尿Cl。陽性＝腎性（遠位RTA）／陰性＝腎外性（下痢）', star:true, refs:['UAG'] },
  { id:'abg.aado2', label:'A-aDO₂', detail:'FiO₂ × (760 − 47) − PaCO₂/0.8 − PaO₂、正常上限の目安 = 年齢/4 + 4', star:true, refs:[] },
  { id:'abg.pf', label:'P/F 比と ARDS 重症度', detail:'≦300 軽症／≦200 中等症／≦100 重症（PEEP ≧5 cmH₂O 下）', star:true, refs:['BERLIN'] },
  { id:'abg.osm', label:'推算血清浸透圧と浸透圧ギャップ', detail:'2×Na + 血糖/18 + BUN/2.8、ギャップ >10 mOsm/kg で開大', star:true, refs:[] },
  { id:'abg.respfail', label:'呼吸不全の定義', detail:'PaO₂ ≦60 mmHg。PaCO₂ ≦45 で I 型、>45 で II 型', star:true, refs:[] }
]});

/* ---- 4. 派生計算式 ---- */
sections.push({ id: 'calc', title: 'その他の計算式', lead: '', items: [
  { id:'calc.egfr', label:'eGFR（日本人推算式）', detail:'194 × Cr^−1.094 × 年齢^−0.287（女性 × 0.739）', star:true, refs:['EGFR_JP'] },
  { id:'calc.cca', label:'補正カルシウム（Payne 式）', detail:'Ca + (4.0 − Alb)、Alb <4.0 のときのみ補正', star:true, refs:['PAYNE'] },
  { id:'calc.mcv', label:'赤血球指数', detail:'MCV = Ht×10/RBC、MCH = Hb×10/RBC、MCHC = Hb/Ht×100', star:false, refs:[] },
  { id:'calc.anc', label:'好中球絶対数', detail:'WBC × 好中球% ÷ 100。<1500 好中球減少、<500 高度', star:true, refs:[] },
  { id:'calc.retic', label:'網赤血球絶対数', detail:'RBC(×10⁶/µL) × 10000 × 網赤血球(%)。>10万 増加、<2.5万 低値', star:true, refs:[] },
  { id:'calc.buncr', label:'BUN／Cr 比', detail:'>20 で腎前性・消化管出血を示唆', star:false, refs:[] },
  { id:'calc.deritis', label:'De Ritis 比（AST/ALT）', detail:'≧2 でアルコール性・肝硬変、<1 で慢性肝炎を示唆', star:false, refs:[] }
]});

/* ---- 5. 臨床スコア ---- */
const scoreItems = [];
DXScores.list.forEach((s) => {
  const detail = s.items
    ? s.items.map((it) => it.type === 'bool'
        ? it.label + '（+' + (it.points == null ? 1 : it.points) + '）'
        : it.label + '：' + it.options.map((o) => o.label + ' ' + (o.points >= 0 ? '+' : '') + o.points).join('／')
      ).join('　|　')
    : '入力済みの検査値から直接算出';
  scoreItems.push({ id: 'score.' + s.id, label: s.name, detail: detail,
    group: s.category, note: s.note, refs: s.refs, star: true });
});
sections.push({ id: 'score', title: '臨床スコア（項目・配点・カットオフ）', lead:
  '配点とカットオフが原典どおりかを確認してください。', items: scoreItems });

/* ---- 6. 鑑別診断 ---- */
const ddxItems = [];
DXCore.DDX.forEach((d) => {
  const sup = (d.supports || []).map((x) => x.label + '（重み ' + x.w + '）').join('　|　');
  const opp = (d.opposes || []).map((x) => x.label + '（−' + x.w + '）').join('　|　');
  ddxItems.push({
    id: 'ddx.' + d.id, label: d.name, group: d.cat,
    detail: '【トリガー】' + (d.trigger || []).join('・') +
            (d.minTrigger ? '（' + d.minTrigger + '件以上）' : '') +
            (d.requireMed ? '（' + d.requireMed + ' 投与が必須）' : '') +
            '\n【支持】' + sup + (opp ? '\n【否定】' + opp : ''),
    note: d.pearl, refs: d.refs, star: true
  });
});
sections.push({ id: 'ddx', title: '鑑別診断の判定条件', lead:
  '支持所見の過不足と重みづけをご覧ください。抜けている所見のご指摘が最も有益です。', items: ddxItems });

/* ---- 7. 所見パターン ---- */
const patItems = [];
LabsCore.domains.forEach((d) => {
  (d.patterns || []).forEach((p) => {
    patItems.push({ id: 'pat.' + p.id, label: p.name, group: d.title,
      detail: '【根拠】' + (p.basis || []).join('・'), note: p.note, refs: p.refs,
      star: p.level === 'red' });
  });
});
LabsIntegrate.syndromes.forEach((s) => {
  // basis は測定状態を文言に反映するため関数のことがある（共同作業で導入）
  const basis = typeof s.basis === 'function'
    ? '（入力の測定状態に応じて動的に生成されます）'
    : (s.basis || []).join('・');
  patItems.push({ id: 'sx.' + s.id, label: s.name, group: '横断症候群',
    detail: '【根拠】' + basis, note: s.story, refs: [],
    star: s.level === 'red' });
});
sections.push({ id: 'pat', title: '所見パターン・横断症候群の判定根拠', lead:
  '★は赤判定（ただちに報告）です。閾値と根拠の妥当性を優先的にご確認ください。', items: patItems });

/* ---- 確信度を全項目へ付与 ---- */
sections.forEach((sec) => sec.items.forEach((it) => Object.assign(it, confidenceOf(sec.id, it))));

/* ---- 書き出し ---- */
const total = sections.reduce((n, s) => n + s.items.length, 0);
const stars = sections.reduce((n, s) => n + s.items.filter((i) => i.star).length, 0);
const byConf = {};
sections.forEach((s) => s.items.forEach((it) => { byConf[it.conf] = (byConf[it.conf] || 0) + 1; }));
const out = { generated: new Date().toISOString().slice(0, 10), total, stars, byConf, sections,
              refs: DXRefs.all() };
fs.writeFileSync(new URL('verify-data.js', root),
  '/*! verify-data.js — tools/build-verify-checklist.mjs が自動生成。直接編集しないこと。 */\n' +
  'var VERIFY_DATA = ' + JSON.stringify(out, null, 1) + ';\n');
console.log('verify-data.js を生成: ' + total + ' 項目（うち優先 ★ ' + stars + ' 項目）');
sections.forEach((s) => console.log('  ' + s.title + ': ' + s.items.length));
console.log('確信度の内訳:');
console.log('  varies   出典により割れる（成書を引く価値が高い）: ' + (byConf.varies || 0));
console.log('  facility 施設の測定系・規定に依存           : ' + (byConf.facility || 0));
console.log('  design   本アプリの設計判断（原典なし）      : ' + (byConf.design || 0));
console.log('  solid    原典で確定                         : ' + (byConf.solid || 0));
