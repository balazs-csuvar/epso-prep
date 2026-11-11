/* EPSO Reasoning Trainer — rendering and interaction (English and Italian) */
(function () {
  'use strict';
  const E = window.EPSO, ITS = window.EPSO_IT, TX = window.EPSO_TX_IT, NI = window.EPSO_NI, P2 = window.EPSO_P2, STR = window.EPSO_UI;
  const $ = (s, r = document) => r.querySelector(s);
  const L5 = 'ABCDE';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language ---------- */
  let LANG = 'en';
  const u = (k, ...a) => { const v = STR.UI[LANG][k]; return typeof v === 'function' ? v(...a) : v; };
  const G = () => STR.GUIDE[LANG];
  const lvl = (l) => STR.UI[LANG].level[l] || l;
  const absRule = (q, k) => (LANG === 'it' ? TX.abstract[q.id].rules[k] : q.rules[k].text);
  const absFam = (q) => (LANG === 'it' ? TX.abstract[q.id].family : q.family);
  // Italian numerical and verbal questions are written in Italian (it_native.js); abstract figures are shared
  const passTx = (k) => (LANG === 'it' ? NI.passages[k] : E.passages[k]);
  const dsOf = (k) => (LANG === 'it' ? NI.datasets[k] : E.datasets[k]);
  const bankOf = (kind) => (kind === 'eu' || kind === 'digital' ? P2[kind] : LANG === 'it' && kind !== 'abstract' ? NI[kind] : E[kind]);
  const lettersFor = (kind) => (kind === 'abstract' || kind === 'numerical' ? L5 : 'ABCD');

  /* ---------- storage (optional) ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('epso-trainer-v1')) || {}; } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem('epso-trainer-v1', JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  let progress = store.get(); // { qid: 1 | 0 }
  const pid = (id) => (LANG === 'it' ? 'it:' + id : id); // Italian practice keeps its own progress
  const mark = (id, ok) => { progress[id] = ok ? 1 : 0; store.set(progress); };

  /* ---------- SVG frame renderer ---------- */
  const FILL = { w: 'var(--f-paper)', g: 'var(--f-grey)', b: 'var(--f-ink)' };
  const pts = (n, r, rot = 0) => [...Array(n)].map((_, k) => {
    const a = ((-90 + (k * 360) / n + rot) * Math.PI) / 180;
    return (r * Math.cos(a)).toFixed(2) + ',' + (r * Math.sin(a)).toFixed(2);
  }).join(' ');
  const starPts = (r) => [...Array(10)].map((_, k) => {
    const a = ((-90 + k * 36) * Math.PI) / 180, rr = k % 2 ? r * 0.45 : r;
    return (rr * Math.cos(a)).toFixed(2) + ',' + (rr * Math.sin(a)).toFixed(2);
  }).join(' ');

  function shapeSVG(el) {
    const [x, y] = el.at, f = FILL[el.fill || 'w'], s = 'stroke="var(--f-ink)" stroke-width="2.2" stroke-linejoin="round"';
    const tr = `transform="translate(${x} ${y}) rotate(${el.rot || 0})"`;
    switch (el.shape) {
      case 'circle': return `<circle cx="${x}" cy="${y}" r="${el.r}" fill="${f}" ${s}/>`;
      case 'square': return `<rect ${tr} x="${-el.r}" y="${-el.r}" width="${2 * el.r}" height="${2 * el.r}" fill="${f}" ${s}/>`;
      case 'triangle': return `<polygon ${tr} points="${pts(3, el.r * 1.18)}" fill="${f}" ${s}/>`;
      case 'diamond': return `<polygon ${tr} points="${pts(4, el.r * 1.25)}" fill="${f}" ${s}/>`;
      case 'star': return `<polygon ${tr} points="${starPts(el.r * 1.25)}" fill="${f}" ${s}/>`;
      case 'poly': return `<polygon ${tr} points="${pts(el.n, el.n === 4 ? el.r * 1.2 : el.r)}" fill="${f}" ${s}/>`;
      default: return '';
    }
  }
  function elSVG(el) {
    switch (el.t) {
      case 'shape': return shapeSVG(el);
      case 'arrow': {
        const r = el.r;
        return `<g transform="translate(${el.at[0]} ${el.at[1]}) rotate(${el.rot})"><line x1="0" y1="${r}" x2="0" y2="${-r * 0.4}" stroke="var(--f-ink)" stroke-width="${Math.max(2.4, r / 7)}" stroke-linecap="round"/><polygon points="0,${-r} ${-r * 0.42},${-r * 0.32} ${r * 0.42},${-r * 0.32}" fill="var(--f-ink)"/></g>`;
      }
      case 'line': return `<g transform="translate(${el.at[0]} ${el.at[1]}) rotate(${el.rot})"><line x1="0" y1="${-el.r}" x2="0" y2="${el.r}" stroke="var(--f-ink)" stroke-width="3.2" stroke-linecap="round"/></g>`;
      case 'dots': {
        let o = '';
        for (let k = 0; k < el.n; k++) {
          const cx = el.at[0] + (k - (el.n - 1) / 2) * el.gap, cy = el.at[1], f = FILL[el.fill];
          o += el.shape === 'square'
            ? `<rect x="${cx - el.r}" y="${cy - el.r}" width="${2 * el.r}" height="${2 * el.r}" fill="${f}" stroke="var(--f-ink)" stroke-width="1.4"/>`
            : `<circle cx="${cx}" cy="${cy}" r="${el.r}" fill="${f}" stroke="var(--f-ink)" stroke-width="1.6"/>`;
        }
        return o;
      }
      case 'rtri': {
        const r = el.r, P = { BL: [[-r, r], [r, r], [-r, -r]], BR: [[r, r], [-r, r], [r, -r]], TR: [[r, -r], [-r, -r], [r, r]], TL: [[-r, -r], [r, -r], [-r, r]] }[el.corner];
        const sq = 7, c = P[0], sx = Math.sign(-c[0]) * sq, sy = Math.sign(-c[1]) * sq; // right-angle marker
        return `<g transform="translate(${el.at[0]} ${el.at[1]})"><polygon points="${P.map((p) => p.join(',')).join(' ')}" fill="${FILL[el.fill]}" stroke="var(--f-ink)" stroke-width="2.2" stroke-linejoin="round"/><polyline points="${c[0] + sx},${c[1]} ${c[0] + sx},${c[1] + sy} ${c[0]},${c[1] + sy}" fill="none" stroke="var(--f-ink)" stroke-width="1.3"/></g>`;
      }
      case 'quad': {
        const q = [[0, 0], [60, 0], [60, 60], [0, 60]];
        return q.map((p, k) => `<rect x="${p[0]}" y="${p[1]}" width="60" height="60" fill="${FILL[el.fills[k]]}"/>`).join('') +
          '<line x1="60" y1="0" x2="60" y2="120" stroke="var(--f-ink)" stroke-width="1.5"/><line x1="0" y1="60" x2="120" y2="60" stroke="var(--f-ink)" stroke-width="1.5"/>';
      }
      case 'bg': return `<rect x="0" y="0" width="120" height="120" fill="${FILL[el.fill]}"/>`;
      case 'segs': { // line figure on a 3×3 dot grid (Italian-style questions)
        let o = Object.values(ITS.PT).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="var(--f-guide)"/>`).join('');
        for (const s of el.s) {
          const [a, b] = ITS.ENDS[s].map((k) => ITS.PT[k]), m = el.mark && el.mark[s];
          const col = m === 'b' ? 'var(--f-blue)' : m === 'c' ? 'var(--f-red)' : 'var(--f-ink)';
          o += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="4.2" stroke-linecap="round"${m === 'c' ? ' stroke-dasharray="7 6"' : ''}/>`;
        }
        return o;
      }
      default: return '';
    }
  }
  function hlSVG(el) {
    const m = 'fill="var(--hl)" fill-opacity="0.9"';
    switch (el.t) {
      case 'shape': return `<circle class="hl" cx="${el.at[0]}" cy="${el.at[1]}" r="${el.r * 1.3 + 6}" ${m}/>`;
      case 'arrow': case 'line': return `<circle class="hl" cx="${el.at[0]}" cy="${el.at[1]}" r="${el.r + 6}" ${m}/>`;
      case 'rtri': return `<circle class="hl" cx="${el.at[0]}" cy="${el.at[1]}" r="${el.r * 1.5 + 4}" ${m}/>`;
      case 'dots': { const w = Math.max(1, el.n) * el.gap + 6; return `<rect class="hl" x="${el.at[0] - w / 2}" y="${el.at[1] - el.r - 6}" width="${w}" height="${2 * el.r + 12}" rx="${el.r + 6}" ${m}/>`; }
      default: return '';
    }
  }
  function frame(els, o = {}) {
    const hl = o.hl || [];
    let back = '', fore = '';
    for (const el of els) {
      const isWhole = el.t === 'quad' || el.t === 'bg';
      if (isWhole) back += elSVG(el); else fore += (hl.includes(el.id) ? hlSVG(el) : '') + elSVG(el);
    }
    const wholeHL = els.some((el) => (el.t === 'quad' || el.t === 'bg') && hl.includes(el.id));
    const grid = o.grid ? '<g class="grid" stroke="var(--grid)" stroke-width="1" stroke-dasharray="3 3"><line x1="40" y1="0" x2="40" y2="120"/><line x1="80" y1="0" x2="80" y2="120"/><line x1="0" y1="40" x2="120" y2="40"/><line x1="0" y1="80" x2="120" y2="80"/></g>' : '';
    return `<svg viewBox="0 0 120 120" role="img" aria-label="${esc(o.label || u('frame'))}"><rect x="0" y="0" width="120" height="120" fill="var(--f-paper)"/>${back}${grid}${fore}<rect x="1" y="1" width="118" height="118" fill="none" stroke="${wholeHL ? 'var(--hl)' : 'var(--f-ink)'}" stroke-width="${wholeHL ? 6 : 1.6}"/></svg>`;
  }
  const qmark = () => `<svg viewBox="0 0 120 120" role="img" aria-label="${u('missing')}"><rect x="1" y="1" width="118" height="118" fill="var(--f-paper)" stroke="var(--f-ink)" stroke-width="1.6" stroke-dasharray="6 5"/><text x="60" y="76" text-anchor="middle" font-size="48" font-family="var(--font-display)" fill="var(--f-ink)">?</text></svg>`;

  /* ---------- abstract question view ---------- */
  function seqOf(q) { return [0, 1, 2, 3, 4, 5].map(q.seq); }
  function elimMap(q) {
    const s = seqOf(q), same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    return q.rules.map((r) => q.options.map((o) => !same(r.val(o), r.f(5, s))));
  }
  function abstractStimulus(q, st) {
    const s = seqOf(q);
    const hl = st.step >= 0 ? q.rules[st.step].ids : [];
    const cells = s.slice(0, 5).map((p, i) => `<figure class="fr"><div class="frame">${frame(q.build(p), { hl, grid: st.grid, label: u('frame') + ' ' + (i + 1) })}</div><figcaption>${i + 1}</figcaption></figure>`).join('');
    const last = st.reveal ? frame(q.build(s[5]), { hl, grid: st.grid, label: u('frame') + ' 6' }) : qmark();
    return `<div class="strip">${cells}<figure class="fr next"><div class="frame">${last}</div><figcaption>6</figcaption></figure></div>`;
  }
  function figOptions(options, st, ans, render, elim) {
    return `<div class="aopts">${options.map((o, j) => {
      const struck = st.step >= 0 && elim.slice(0, st.step + 1).some((row) => row[j]);
      const cls = ['aopt', st.choice === j ? 'chosen' : '', st.done && j === ans ? 'right' : '', st.done && st.choice === j && j !== ans ? 'wrong' : '', struck ? 'struck' : ''].join(' ');
      return `<button class="${cls}" data-pick="${j}" ${st.done ? 'disabled' : ''} aria-label="${u('option')} ${L5[j]}"><span class="ol">${L5[j]}</span><span class="frame">${render(o, j)}</span></button>`;
    }).join('')}</div>`;
  }
  const abstractOptions = (q, st) => figOptions(q.options, st, q.ans, (o, j) => frame(q.build(o), { grid: st.grid, label: u('option') + ' ' + L5[j] }), elimMap(q));
  function ruleSteps(texts, elim, st, ans) {
    const steps = texts.map((text, k) => {
      const out = elim[k].map((x, j) => (x ? L5[j] : null)).filter(Boolean);
      return `<li><button class="step ${st.step === k ? 'on' : ''}" data-step="${k}"><span class="sn">${u('rule', k + 1)}</span><span class="st">${esc(text)}</span><span class="se">${out.length ? u('rulesOut', out.join(', ')) : u('nothingNew')}</span></button></li>`;
    }).join('');
    return `<p class="hint">${u('hint')}</p><ol class="steps">${steps}</ol><p class="finale">${u('finale', L5[ans])}</p>`;
  }
  const abstractExplain = (q, st) => `<div class="explain">${ruleSteps(q.rules.map((r, k) => absRule(q, k)), elimMap(q), st, q.ans)}</div>`;

  /* ---------- numerical view ---------- */
  function dataView(ds) {
    const d = dsOf(ds), title = d.title, note = d.note;
    const loc = LANG === 'it' ? 'it-IT' : 'en-GB';
    if (d.kind === 'table') {
      const fmt = (v) => (typeof v === 'number' ? v.toLocaleString(loc, { maximumFractionDigits: 2 }) : esc(v));
      return `<div class="data"><h4>${esc(title)}</h4><div class="tw"><table><thead><tr>${d.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${d.rows.map((r) => `<tr class="${r[0] === 'Total' || r[0] === 'Totale' ? 'tot' : ''}">${r.map((v) => `<td>${fmt(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="note">${esc(note)}</p></div>`;
    }
    const W = 360, H = 200, pad = { l: 34, r: 10, t: 18, b: 26 }, max = 160;
    const bw = (W - pad.l - pad.r) / d.values.length;
    const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
    const ticks = [0, 40, 80, 120, 160].map((v) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width="1"/><text x="${pad.l - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${v}</text>`).join('');
    const bars = d.values.map((v, k) => {
      const x = pad.l + k * bw + bw * 0.18, w = bw * 0.64;
      return `<rect x="${x}" y="${y(v)}" width="${w}" height="${y(0) - y(v)}" fill="var(--accent)" rx="2"/><text x="${x + w / 2}" y="${y(v) - 5}" text-anchor="middle" class="bv">${v}</text><text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" class="ax">${d.labels[k]}</text>`;
    }).join('');
    return `<div class="data"><h4>${esc(title)}</h4><div class="tw"><svg class="bar" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${ticks}${bars}</svg></div><p class="note">${esc(note)}</p></div>`;
  }

  /* ---------- generic question card ---------- */
  function textOptions(opts, st, letters, verdicts) {
    const V = STR.UI[LANG].verdict;
    return `<div class="topts">${opts.map((o, j) => {
      const cls = ['topt', st.choice === j ? 'chosen' : '', st.done && j === st.ans ? 'right' : '', st.done && st.choice === j && j !== st.ans ? 'wrong' : ''].join(' ');
      const v = st.done && verdicts ? `<span class="verdict v-${verdicts[j][0]}">${V[verdicts[j][0]]}</span><span class="why">${esc(verdicts[j][1])}</span>` : '';
      return `<button class="${cls}" data-pick="${j}" ${st.done ? 'disabled' : ''}><span class="ol">${letters[j]}</span><span class="ot">${esc(o)}${v ? `<span class="vv">${v}</span>` : ''}</span></button>`;
    }).join('')}</div>`;
  }

  const levelTag = (q) => (q.level === 'Hard' ? `<div class="qhead lone"><span class="tag lvl-Hard">${lvl('Hard')}</span></div>` : '');
  function renderQuestion(kind, q, st) {
    if (kind === 'abstract') {
      return `<div class="qhead"><span class="tag lvl-${q.level}">${lvl(q.level)}</span>${absFam(q).map((f) => `<span class="fam">${esc(f)}</span>`).join('')}<label class="gridtog"><input type="checkbox" id="grid-${q.id}" ${st.grid ? 'checked' : ''} data-grid> ${u('grid')}</label></div>
        <p class="stem">${u('stemAbs')}</p>
        ${abstractStimulus(q, st)}
        ${abstractOptions(q, st)}
        ${st.done && st.showExplain ? abstractExplain(q, st) : ''}`;
    }
    if (kind === 'eu' || kind === 'digital') {
      return `<div class="qhead"><span class="fam">${esc(q.topic)}</span></div><p class="stem">${esc(q.q)}</p>${textOptions(q.options, { ...st, ans: q.ans }, 'ABCD')}${st.done && st.showExplain ? `<div class="explain"><p>${esc(q.explain)}</p></div>` : ''}`;
    }
    if (kind === 'numerical') {
      return `${levelTag(q)}${dataView(q.ds)}<p class="stem">${esc(q.q)}</p>${textOptions(q.options, { ...st, ans: q.ans }, L5)}${st.done && st.showExplain ? `<div class="explain"><p>${esc(q.explain)}</p></div>` : ''}`;
    }
    const p = passTx(q.p);
    return `${levelTag(q)}<article class="passage" lang="${LANG}"><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></article><p class="stem">${u('stemVerb')}</p>${textOptions(q.opts.map((o) => o[0]), { ...st, ans: q.ans }, 'ABCD', st.done && st.showExplain ? q.opts.map((o) => [o[1], o[2]]) : null)}`;
  }

  /* ---------- routes ---------- */
  const ROUTES = {
    guide: { lang: 'en', view: 'guide' }, abstract: { lang: 'en', view: 'practice', kind: 'abstract' },
    numerical: { lang: 'en', view: 'practice', kind: 'numerical' }, verbal: { lang: 'en', view: 'practice', kind: 'verbal' },
    exam: { lang: 'en', view: 'exam' }, 'italian-abstract': { lang: 'en', view: 'its' },
    'eu-knowledge': { lang: 'en', view: 'practice', kind: 'eu' }, digital: { lang: 'en', view: 'practice', kind: 'digital' },
    'it-guida': { lang: 'it', view: 'guide' }, 'it-astratto': { lang: 'it', view: 'practice', kind: 'abstract' },
    'it-numerico': { lang: 'it', view: 'practice', kind: 'numerical' }, 'it-verbale': { lang: 'it', view: 'practice', kind: 'verbal' },
    'it-simulazione': { lang: 'it', view: 'exam' },
  };
  const HASH_IT = { guide: 'it-guida', exam: 'it-simulazione', abstract: 'it-astratto', numerical: 'it-numerico', verbal: 'it-verbale' };
  const hashFor = (k) => (LANG === 'it' ? HASH_IT[k] || k : k);

  /* ---------- practice mode ---------- */
  const prac = { en: {}, it: {} };
  const pracOf = (kind) => (prac[LANG][kind] = prac[LANG][kind] || { i: 0, hard: false });
  const pstate = {}; // per-question state in practice
  const getSt = (id) => (pstate[id] = pstate[id] || { choice: null, done: false, step: -1, reveal: false, grid: false, showExplain: true });

  function renderPractice(kind) {
    const NAME = u('names')[kind];
    const cur = pracOf(kind), all = bankOf(kind), bank = cur.hard ? all.filter((x) => x.level === 'Hard') : all;
    cur.i = Math.min(cur.i, bank.length - 1);
    const q = bank[cur.i], st = getSt(pid(q.id));
    const nHard = all.filter((x) => x.level === 'Hard').length;
    const done = bank.filter((x) => progress[pid(x.id)] !== undefined).length, right = bank.filter((x) => progress[pid(x.id)] === 1).length;
    const chips = bank.map((x, k) => { const pr = progress[pid(x.id)]; return `<button class="chip ${k === cur.i ? 'cur' : ''} ${pr === 1 ? 'ok' : pr === 0 ? 'no' : ''}" data-go="${k}" aria-label="${u('qAria', all.indexOf(x) + 1, x.level === 'Hard')}">${all.indexOf(x) + 1}${x.level === 'Hard' && !cur.hard ? '<i class="hd" aria-hidden="true"></i>' : ''}</button>`; }).join('');
    $('#view').innerHTML = `<section class="practice">
      <div class="phead"><div><h2>${NAME}</h2><p class="lede">${u('intro')[kind]}</p></div><div class="score">${u('score', right, done)}<br><span class="muted">${u('nq', bank.length)}</span></div></div>
      <div class="filter" role="group" aria-label="${u('filterAria')}" ${nHard ? '' : 'hidden'}><button class="seg ${cur.hard ? '' : 'on'}" data-hard="0" aria-pressed="${!cur.hard}">${u('all', all.length)}</button><button class="seg ${cur.hard ? 'on' : ''}" data-hard="1" aria-pressed="${cur.hard}">${u('hardOnly', nHard)}</button></div>
      <nav class="chips" aria-label="${u('filterAria')}">${chips}</nav>
      <div class="card" id="qcard">${renderQuestion(kind, q, st)}</div>
      ${st.done ? `<p class="result ${st.choice === q.ans ? 'good' : 'bad'}">${st.choice === q.ans ? u('correct') : u('wrong', lettersFor(kind)[q.ans])}</p>` : ''}
      <div class="actions">
        <button class="btn ghost" data-nav="-1" ${cur.i === 0 ? 'disabled' : ''}>${u('prev')}</button>
        ${st.done ? (kind === 'abstract' ? `<button class="btn ghost" data-reveal>${u('reveal', st.reveal)}</button>` : '') : `<button class="btn" data-check ${st.choice === null ? 'disabled' : ''}>${u('check')}</button>`}
        <button class="btn ${st.done ? '' : 'ghost'}" data-nav="1" ${cur.i === bank.length - 1 ? 'disabled' : ''}>${u('next')}</button>
      </div>
      <p class="reset"><button class="link" data-reset>${u('reset', NAME)}</button></p>
    </section>`;
    $('#view').onclick = (e) => {
      const t = e.target.closest('button,input'); if (!t) return;
      if (t.dataset.pick !== undefined && !st.done) { st.choice = +t.dataset.pick; renderPractice(kind); }
      else if (t.dataset.check !== undefined) { st.done = true; st.step = -1; mark(pid(q.id), st.choice === q.ans); renderPractice(kind); }
      else if (t.dataset.step !== undefined) { const k = +t.dataset.step; st.step = st.step === k ? -1 : k; renderPractice(kind); }
      else if (t.dataset.reveal !== undefined) { st.reveal = !st.reveal; renderPractice(kind); }
      else if (t.dataset.grid !== undefined) { st.grid = t.checked; renderPractice(kind); }
      else if (t.dataset.nav !== undefined) { cur.i = Math.max(0, Math.min(bank.length - 1, cur.i + +t.dataset.nav)); renderPractice(kind); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }
      else if (t.dataset.go !== undefined) { cur.i = +t.dataset.go; renderPractice(kind); }
      else if (t.dataset.hard !== undefined) { const h = t.dataset.hard === '1'; if (h !== cur.hard) { const keep = h ? all.filter((x) => x.level === 'Hard').indexOf(q) : all.indexOf(q); cur.hard = h; cur.i = Math.max(0, keep); renderPractice(kind); } }
      else if (t.dataset.reset !== undefined) { bank.forEach((x) => { delete progress[pid(x.id)]; delete pstate[pid(x.id)]; }); store.set(progress); renderPractice(kind); }
    };
  }

  /* ---------- mock exam ---------- */
  const EXAM = { verbal: { n: 20, min: 35 }, numerical: { n: 10, min: 20 }, abstract: { n: 10, min: 10 }, eu: { n: 30, min: 40 }, digital: { n: 40, min: 30 } };
  const PASS = { verbal: 'passV', numerical: 'passNA', abstract: 'passNA', eu: 'passEU', digital: 'passDS' };
  const exams = { en: null, it: null };
  let timerId = null;
  const ex = () => exams[LANG];
  const shuffle = (a) => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };

  function renderExamPicker() {
    clearInterval(timerId);
    $('#view').innerHTML = `<section class="practice"><div class="phead"><div><h2>${u('mockTitle')}</h2><p class="lede">${u('mockLede')}</p></div></div>
      <div class="pick">${Object.entries(EXAM).filter(([k]) => LANG === 'en' || !P2[k]).map(([k, v]) => `<button class="pickcard" data-start="${k}"><span class="pk">${u('names')[k]}</span><span class="pm">${u('pickMeta', v.n, v.min)}</span><span class="pp">${u(PASS[k])}</span></button>`).join('')}</div>
      <p class="muted small">${u('mockNote')}</p></section>`;
    $('#view').onclick = (e) => { const t = e.target.closest('[data-start]'); if (t) startExam(t.dataset.start); };
  }
  function startExam(kind) {
    const cfg = EXAM[kind];
    exams[LANG] = { kind, qs: shuffle(bankOf(kind)).slice(0, cfg.n), i: 0, ans: {}, flag: {}, end: Date.now() + cfg.min * 60000, over: false };
    clearInterval(timerId);
    timerId = setInterval(tick, 1000);
    renderExam();
  }
  function tick() {
    const x = ex();
    if (!x || x.over || !$('#clock')) return clearInterval(timerId);
    const left = Math.max(0, x.end - Date.now());
    const el = $('#clock'); el.textContent = fmtTime(left); el.classList.toggle('low', left < 60000);
    if (left === 0) finishExam();
  }
  const fmtTime = (ms) => { const s = Math.ceil(Math.max(0, ms) / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  function renderExam() {
    const x = ex(), q = x.qs[x.i], st = { choice: x.ans[q.id] ?? null, done: false, step: -1, grid: !!x.grid, showExplain: false };
    const nav = x.qs.map((y, k) => `<button class="chip ${k === x.i ? 'cur' : ''} ${x.ans[y.id] !== undefined ? 'answered' : ''} ${x.flag[y.id] ? 'flag' : ''}" data-go="${k}">${k + 1}</button>`).join('');
    const answered = Object.keys(x.ans).length;
    $('#view').innerHTML = `<section class="practice exam">
      <div class="exambar"><span>${u('examBar', u('names')[x.kind], x.i + 1, x.qs.length)}</span><span class="clock" id="clock">${fmtTime(x.end - Date.now())}</span></div>
      <nav class="chips">${nav}</nav>
      <div class="card">${renderQuestion(x.kind, q, st)}</div>
      <div class="actions"><button class="btn ghost" data-nav="-1" ${x.i === 0 ? 'disabled' : ''}>${u('prev')}</button><button class="btn ghost" data-flag>${u('flag', x.flag[q.id])}</button><button class="btn ghost" data-nav="1" ${x.i === x.qs.length - 1 ? 'disabled' : ''}>${u('nextShort')}</button><button class="btn" data-submit>${u('submit', answered, x.qs.length)}</button></div>
      <div id="confirm"></div></section>`;
    $('#view').onclick = (e) => {
      const t = e.target.closest('button,input'); if (!t) return;
      if (t.dataset.grid !== undefined) { x.grid = t.checked; renderExam(); }
      else if (t.dataset.pick !== undefined) { x.ans[q.id] = +t.dataset.pick; renderExam(); }
      else if (t.dataset.nav !== undefined) { x.i = Math.max(0, Math.min(x.qs.length - 1, x.i + +t.dataset.nav)); renderExam(); }
      else if (t.dataset.go !== undefined) { x.i = +t.dataset.go; renderExam(); }
      else if (t.dataset.flag !== undefined) { x.flag[q.id] = !x.flag[q.id]; renderExam(); }
      else if (t.dataset.submit !== undefined) {
        const missing = x.qs.length - Object.keys(x.ans).length;
        $('#confirm').innerHTML = `<div class="confirm"><p>${u('unanswered', missing)} ${u('submitNow')}</p><button class="btn" data-really>${u('submitBtn')}</button> <button class="btn ghost" data-cancel>${u('keep')}</button></div>`;
      } else if (t.dataset.really !== undefined) finishExam();
      else if (t.dataset.cancel !== undefined) $('#confirm').innerHTML = '';
    };
  }
  function finishExam() {
    clearInterval(timerId);
    const x = ex();
    x.over = true;
    const NAME = u('names')[x.kind];
    const score = x.qs.filter((q) => x.ans[q.id] === q.ans).length;
    x.qs.forEach((q) => { if (x.ans[q.id] !== undefined) mark(pid(q.id), x.ans[q.id] === q.ans); });
    const total = EXAM[x.kind].min * 60000, used = Math.min(total, total - Math.max(0, x.end - Date.now()));
    const half = Math.ceil(x.qs.length / 2);
    const letters = lettersFor(x.kind);
    $('#view').innerHTML = `<section class="practice"><div class="phead"><div><h2>${u('result', score, x.qs.length)}</h2><p class="lede">${u('used', NAME, fmtTime(used))} ${score >= half ? u('passOk') : u('passNo')}</p></div></div>
      <ol class="review">${x.qs.map((q, k) => { const a = x.ans[q.id]; const ok = a === q.ans; return `<li class="${ok ? 'ok' : 'no'}"><button class="rv" data-rv="${k}"><span>${u('rvQ', k + 1)}</span><span>${a === undefined ? u('noAns') : u('you', letters[a])} · ${u('corr', letters[q.ans])}</span><span class="rvs">${ok ? u('rvOk') : u('rvNo')}</span></button></li>`; }).join('')}</ol>
      <div id="rvbox"></div>
      <div class="actions"><button class="btn" data-again>${u('again', NAME)}</button><button class="btn ghost" data-pickt>${u('another')}</button></div></section>`;
    const showRv = () => { $('#rvbox').innerHTML = `<div class="card">${renderQuestion(x.kind, x.qs[x.rvq], x.rvst)}</div>`; };
    $('#view').onclick = (e) => {
      const t = e.target.closest('button,input'); if (!t) return;
      if (t.dataset.grid !== undefined && x.rvst) { x.rvst.grid = t.checked; showRv(); }
      else if (t.dataset.rv !== undefined) {
        const q = x.qs[+t.dataset.rv];
        x.rvst = x.rvst && x.rvst.id === q.id ? x.rvst : { id: q.id, choice: x.ans[q.id] ?? null, done: true, step: -1, grid: false, showExplain: true };
        x.rvq = +t.dataset.rv; showRv();
        $('#rvbox').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      } else if (t.dataset.step !== undefined && x.rvst) { const k = +t.dataset.step; x.rvst.step = x.rvst.step === k ? -1 : k; showRv(); }
      else if (t.dataset.again !== undefined) startExam(x.kind);
      else if (t.dataset.pickt !== undefined) renderExamPicker();
    };
  }

  /* ---------- guide ---------- */
  const byId = (id) => E.abstract.find((q) => q.id === id);
  const FAMILY_Q = [['A4', 1], ['A2', 0], ['A7', 0], ['A3', 0], ['A10', 0], ['A5', 0], ['A14', 0], ['A15', 0], ['A6', 0]];

  function familyCard(f, k) {
    const [qid, r] = FAMILY_Q[k], q = byId(qid), s = seqOf(q), ids = q.rules[r].ids;
    const strip = s.slice(0, 5).map((p) => `<div class="frame mini">${frame(q.build(p), { hl: ids })}</div>`).join('');
    return `<article class="fam-card"><div class="fam-top"><h4>${esc(f[0])}</h4><div class="flip" data-flip="${k}" aria-hidden="true"><div class="frame">${frame(q.build(s[0]), { hl: ids })}</div><span class="fnum">1</span></div></div>
      <div class="ministrip">${strip}</div>
      <p><b>${G().look}</b> ${esc(f[1])}</p><p class="trap"><b>${G().trap}</b> ${esc(f[2])}</p>
      <button class="link" data-try="${qid}">${G().tryIt}</button></article>`;
  }

  const WALK = 'A9';
  const walkStep = { en: -1, it: -1 };
  function renderGuide() {
    const g = G(), q = byId(WALK), ws = walkStep[LANG];
    const st = { choice: q.ans, done: true, step: ws, reveal: ws >= q.rules.length - 1, grid: true, showExplain: true };
    $('#view').innerHTML = `<section class="guide">
      <div class="hero"><p class="eyebrow">${g.eyebrow}</p><h1>${g.h1}</h1><p class="lede">${g.lede}</p></div>
      <div class="fmt">
        ${g.fmt.map((r) => `<div class="fmt-row"><span class="fk">${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span class="fp">${r[3]}</span><button class="link" data-goto="${r[4]}">${g.practise}</button></div>`).join('')}
        <p class="muted small">${g.fmtNote}</p>
      </div>
      <h2>${g.anatomyH}</h2>
      <p class="lede">${g.anatomyP}</p>
      <h2>${g.methodH}</h2>
      <div class="method">${g.method.map((m, k) => `<div class="mstep"><span class="mn">${k + 1}</span><b>${m[0]}</b><p>${m[1]}</p></div>`).join('')}</div>
      <h3>${g.walkH}</h3>
      <p class="muted">${g.walkP}</p>
      <div class="card walk">${abstractStimulus(q, st)}${abstractOptions(q, st)}${abstractExplain(q, st)}</div>
      <h2>${g.famH}</h2>
      <p class="lede">${g.famP}</p>
      <div class="fams">${g.families.map(familyCard).join('')}</div>
      <h2>${g.timeH}</h2>
      <div class="time">${g.time.map((t) => `<div><span class="tt">${t[0]}</span><p>${t[1]}</p></div>`).join('')}</div>
      <ul class="tips">${g.tips.map((t) => `<li>${t}</li>`).join('')}</ul>
      <h2>${g.vnH}</h2>
      <div class="two">
        <div><h4>${g.vH}</h4><ul class="tips">${g.vTips.map((t) => `<li>${t}</li>`).join('')}</ul></div>
        <div><h4>${g.nH}</h4><ul class="tips">${g.nTips.map((t) => `<li>${t}</li>`).join('')}</ul></div>
      </div>
      <p class="muted small sources">${g.sources}</p>
    </section>`;
    $('#view').onclick = (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.step !== undefined) { const k = +t.dataset.step; walkStep[LANG] = walkStep[LANG] === k ? -1 : k; const y = window.scrollY; renderGuide(); window.scrollTo(0, y); }
      else if (t.dataset.try) { const p = pracOf('abstract'); p.hard = false; p.i = E.abstract.findIndex((x) => x.id === t.dataset.try); location.hash = hashFor('abstract'); }
      else if (t.dataset.goto) location.hash = hashFor(t.dataset.goto);
    };
    startFlipbooks();
  }
  let flipTimer = null, flipFrame = 0;
  function startFlipbooks() {
    clearInterval(flipTimer);
    if (reduceMotion) return;
    flipTimer = setInterval(() => {
      const boxes = document.querySelectorAll('[data-flip]');
      if (!boxes.length) return clearInterval(flipTimer);
      flipFrame = (flipFrame + 1) % 5;
      boxes.forEach((b) => {
        const [qid, r] = FAMILY_Q[+b.dataset.flip], q = byId(qid);
        b.querySelector('.frame').innerHTML = frame(q.build(q.seq(flipFrame)), { hl: q.rules[r].ids });
        b.querySelector('.fnum').textContent = flipFrame + 1;
      });
    }, 1100);
  }

  /* ---------- Italian-style abstract page (English) ---------- */
  const IS_TYPE = { sup: 'Superimposition', mat: 'Matrix', odd: 'Odd one out', ana: 'Analogy' };
  const segFig = (spec) => (spec.s ? [{ id: 'segs', t: 'segs', s: spec.s, mark: spec.mark }] : spec.el);
  const F = (spec, o = {}) => frame(segFig(spec), o);
  const overlay = (A, B) => { const all = ITS.union(A, B); return { s: all, mark: Object.fromEntries(all.map((x) => [x, A.includes(x) && B.includes(x) ? 'c' : A.includes(x) ? 'a' : 'b'])) }; };
  const eqRow = (items, cls = '') => `<div class="eq ${cls}">${items.map((x) => (x.startsWith('<svg') ? `<div class="frame">${x}</div>` : `<span class="op">${x}</span>`)).join('')}</div>`;
  const KEY = '<p class="key"><span><i class="k-a"></i>only in the first figure</span><span><i class="k-b"></i>only in the second</span><span><i class="k-c"></i>in both</span></p>';
  const its = { view: 'guide', i: 0, st: {} };
  const itsSt = (id) => (its.st[id] = its.st[id] || { choice: null, done: false, step: -1 });

  function itsQuestion(q, st) {
    let stem, stim = '';
    if (q.type === 'sup') {
      stem = 'Each row combines the first two figures into the third, using the same rule every time. Which figure completes the last row?';
      stim = `<div class="eqs">${q.ex.map(([a, b, c]) => eqRow([F({ s: a }), '+', F({ s: b }), '=', F({ s: c })])).join('')}${eqRow([F({ s: q.q[0] }), '+', F({ s: q.q[1] }), '=', qmark()], 'ask')}</div>`;
    } else if (q.type === 'mat') {
      stem = 'Which figure completes the grid?';
      stim = `<div class="mat">${q.grid.map((c) => `<div class="frame">${c ? F(c) : qmark()}</div>`).join('')}</div>`;
    } else if (q.type === 'odd') stem = 'Which figure is the odd one out?';
    else {
      stem = 'The first figure is to the second as the third is to which figure?';
      stim = `<div class="eqs">${eqRow([F({ s: q.A }), ':', F({ s: q.B }), '=', F({ s: q.C }), ':', qmark()], 'ask')}</div>`;
    }
    const elim = q.rules.map((r) => q.options.map((o) => !r.ok(o, q.options)));
    let explain = '';
    if (st.done) {
      let vis = '';
      if (q.type === 'sup') {
        const B = ITS.T[q.pre](q.q[1]);
        vis = `<p class="hint">Rule: <b>${esc(q.ruleName)}</b>. The last row's two figures${q.pre !== 'id' ? ' (second one already turned)' : ''}, laid on top of each other:</p>${eqRow([F({ s: q.q[0] }), '+', F({ s: B }), '→', F(overlay(q.q[0], B))], 'small')}${KEY}`;
      }
      if (q.type === 'ana') vis = `<p class="hint">Change from the first to the second figure: <b>${esc(q.tfName)}</b>.</p>`;
      explain = `<div class="explain">${vis}${ruleSteps(q.rules.map((r) => r.text), elim, st, q.ans).replace(u('hint'), 'Click each rule to cross out the options it rules out.')}</div>`;
    }
    return `<div class="qhead"><span class="tag lvl-${q.level}">${q.level}</span><span class="fam">${IS_TYPE[q.type]}</span></div><p class="stem">${stem}</p>${stim}${figOptions(q.options, st, q.ans, (o) => F(o), elim)}${explain}`;
  }

  function itsGuide() {
    const A = ['t', 'l', 'd1', 'h'], B = ['t', 'r', 'd2', 'h'];
    const res = [['Everything adds up', ITS.union(A, B), 'Keep every line from both figures.'], ['Shared lines cancel', ITS.xor(A, B), 'Lines in both disappear; the rest stay. The most common rule.'], ['Only shared lines stay', ITS.inter(A, B), 'Keep only the lines that appear in both.'], ['Second rubs out the first', ITS.minus(A, B), 'Start from the first figure and delete the second figure’s lines.']];
    const M = [[['t', 'd1'], ['d1', 'b']], [['l', 'h'], ['h', 'n2', 'v']], [['n1', 'n3'], ['n3', 'd2']]];
    const base = ['t', 'd1', 'n3'];
    const odd = [[ITS.T.rot90(base), 'turned 90°'], [base, 'original'], [ITS.T.mlr(base), 'mirror image ✗'], [ITS.T.rot180(base), 'turned 180°'], [ITS.T.rot270(base), 'turned 270°']];
    const anaA = ['t', 'v', 'n2'], anaC = ['l', 'd1'];
    return `
      <h2>1 · Superimposition: “adding” figures</h2>
      <p class="lede">Two figures are laid on top of each other to make a third. The examples tell you what happens to lines that appear in both figures and lines that appear in only one. Find that out, then apply it to the last row.</p>
      <div class="card itg">
        ${eqRow([F({ s: A }), '+', F({ s: B }), '→', F(overlay(A, B))])}${KEY}
        <div class="results">${res.map((r) => `<figure><div class="frame">${F({ s: r[1] })}</div><figcaption><b>${r[0]}</b>${r[2]}</figcaption></figure>`).join('')}</div>
      </div>
      <ol class="tips"><li><b>Find a line that is in both figures</b> of an example. Is it in the result? If not, shared lines cancel.</li><li><b>Find a line that is in only one figure.</b> Is it in the result? If not, only shared lines stay (or the second figure is rubbing out the first).</li><li><b>Confirm with the second example</b> before applying the rule. Real tests sometimes mix rules with colour: two blacks make white, black + white makes black, and so on. Treat each colour pair the same way as lines.</li><li><b>Nothing fits?</b> The second figure may be turned or flipped before it is added. Check the examples for that.</li></ol>

      <h2>2 · Matrices (3×3 grids)</h2>
      <p class="lede">Read the grid row by row, like three short series, and check the columns too. The three most common row rules are below; the example uses the first one.</p>
      <div class="card itg">
        <div class="mat">${M.flatMap(([a, b]) => [F({ s: a }), F({ s: b }), F({ s: ITS.xor(a, b) })]).map((x) => `<div class="frame">${x}</div>`).join('')}</div>
        <p class="hint">Column 1 + column 2 = column 3, and lines in both cancel.</p>
      </div>
      <ul class="tips"><li><b>Addition across the row:</b> column 3 is column 1 combined with column 2, using one of the superimposition rules above. Dots or counts can add up too (1 + 2 = 3).</li><li><b>One of each:</b> every row and column contains each shape, colour or count exactly once, like a sudoku. The missing cell is whatever its row and column are still missing.</li><li><b>Progression:</b> something turns, moves or grows step by step along each row.</li></ul>

      <h2>3 · Odd one out</h2>
      <p class="lede">Four figures share a property; one does not. Run through a checklist rather than staring.</p>
      <div class="card itg"><div class="results five">${odd.map(([s, cap]) => `<figure><div class="frame">${F({ s })}</div><figcaption>${cap}</figcaption></figure>`).join('')}</div>
      <p class="hint">A classic trap: four figures are the same shape turned round, one is its mirror image. Turning can never produce a mirror image.</p></div>
      <ul class="tips"><li>Count: lines, sides, dots, corners. Odd or even?</li><li>Symmetry: left–right, top–bottom, or none.</li><li>Closed shape or open lines?</li><li>Rotations versus mirror images.</li><li>Relations between parts: “sides = dots”, “the dot is inside the shape”.</li></ul>

      <h2>4 · Analogies (A is to B as C is to ?)</h2>
      <p class="lede">Name exactly what changes from the first figure to the second, then do the same to the third.</p>
      <div class="card itg">${eqRow([F({ s: anaA }), ':', F({ s: ITS.T.rot90(anaA) }), '=', F({ s: anaC }), ':', F({ s: ITS.T.rot90(anaC) })])}<p class="hint">Here everything is turned 90° clockwise.</p></div>
      <ul class="tips"><li>Turned (by how much, which way?) or mirrored (which mirror line?)</li><li>Lines added, removed, or inverted (every drawn line disappears, every missing line appears)</li><li>Colours swapped, shapes swapped, size changed</li><li>Two changes at once: check the second change after finding the first</li></ul>
      <p><button class="btn" data-itsview="practice">Start practising (${ITS.questions.length} questions)</button></p>`;
  }

  function renderItStyle() {
    const head = `<div class="hero"><p class="eyebrow">Figure-logic tests used in Italian hiring and concorsi</p><h1>Italian abstract</h1>
      <p class="lede">Superimposition (“adding” figures), 3×3 matrices, odd one out and analogies. These are common in Italian company aptitude tests and public-sector concorsi.</p></div>
      <div class="notebox"><b>Does the EU use these?</b> No. EPSO’s abstract reasoning test uses only one format: a series of five figures where you choose the sixth. The skills carry over, though: spotting rules, tracking one element at a time and eliminating options.</div>
      <div class="filter" role="group" aria-label="Guide or practice"><button class="seg ${its.view === 'guide' ? 'on' : ''}" data-itsview="guide" aria-pressed="${its.view === 'guide'}">Guide</button><button class="seg ${its.view === 'practice' ? 'on' : ''}" data-itsview="practice" aria-pressed="${its.view === 'practice'}">Practice</button></div>`;
    let body;
    if (its.view === 'guide') body = itsGuide();
    else {
      const Q = ITS.questions, q = Q[its.i], st = itsSt(q.id);
      const chips = Q.map((x, k) => { const pr = progress['its:' + x.id]; return `<button class="chip ${k === its.i ? 'cur' : ''} ${pr === 1 ? 'ok' : pr === 0 ? 'no' : ''}" data-go="${k}" aria-label="Question ${k + 1}, ${IS_TYPE[x.type]}">${k + 1}</button>`; }).join('');
      body = `<nav class="chips" aria-label="Questions">${chips}</nav>
        <div class="card" id="qcard">${itsQuestion(q, st)}</div>
        ${st.done ? `<p class="result ${st.choice === q.ans ? 'good' : 'bad'}">${st.choice === q.ans ? 'Correct.' : `Not quite. The answer is ${L5[q.ans]}.`}</p>` : ''}
        <div class="actions"><button class="btn ghost" data-nav="-1" ${its.i === 0 ? 'disabled' : ''}>Previous</button>${st.done ? '' : `<button class="btn" data-check ${st.choice === null ? 'disabled' : ''}>Check answer</button>`}<button class="btn ${st.done ? '' : 'ghost'}" data-nav="1" ${its.i === Q.length - 1 ? 'disabled' : ''}>Next question</button></div>`;
    }
    $('#view').innerHTML = `<section class="guide its">${head}${body}</section>`;
    $('#view').onclick = (e) => {
      const t = e.target.closest('button'); if (!t) return;
      const Q = ITS.questions, q = Q[its.i], st = itsSt(q.id);
      if (t.dataset.itsview) { its.view = t.dataset.itsview; renderItStyle(); if (t.closest('.tips, p')) window.scrollTo(0, 0); }
      else if (t.dataset.pick !== undefined && !st.done) { st.choice = +t.dataset.pick; renderItStyle(); }
      else if (t.dataset.check !== undefined) { st.done = true; mark('its:' + q.id, st.choice === q.ans); renderItStyle(); }
      else if (t.dataset.step !== undefined) { const k = +t.dataset.step; st.step = st.step === k ? -1 : k; renderItStyle(); }
      else if (t.dataset.nav !== undefined) { its.i = Math.max(0, Math.min(Q.length - 1, its.i + +t.dataset.nav)); renderItStyle(); }
      else if (t.dataset.go !== undefined) { its.i = +t.dataset.go; renderItStyle(); }
    };
  }

  /* ---------- pop-up calculator (numerical practice + numerical mock) ---------- */
  const calc = (() => {
    const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="2.5" width="15" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="7.5" y="5.5" width="9" height="4" rx="1" fill="currentColor"/><g fill="currentColor"><circle cx="8.5" cy="13" r="1.2"/><circle cx="12" cy="13" r="1.2"/><circle cx="15.5" cy="13" r="1.2"/><circle cx="8.5" cy="17" r="1.2"/><circle cx="12" cy="17" r="1.2"/><circle cx="15.5" cy="17" r="1.2"/></g></svg>';
    const KEYS = [['C', 'clear', 'fn'], ['(', '(', 'fn'], [')', ')', 'fn'], ['÷', '/', 'op'],
      ['7', '7'], ['8', '8'], ['9', '9'], ['×', '*', 'op'],
      ['4', '4'], ['5', '5'], ['6', '6'], ['−', '-', 'op'],
      ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+', 'op'],
      ['0', '0'], ['.', '.'], ['⌫', 'back', 'fn'], ['=', 'eq', 'eq']];
    const CT = () => STR.CALC[LANG];
    const fab = document.createElement('button');
    fab.type = 'button'; fab.className = 'calc-fab'; fab.hidden = true; fab.innerHTML = ICON;
    fab.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div');
    panel.className = 'calc'; panel.hidden = true; panel.setAttribute('role', 'dialog');
    panel.innerHTML = `<div class="calc-head"><span class="calc-title"></span><button type="button" class="calc-x" data-close>×</button></div>
      <div class="calc-screen"><div class="calc-expr"></div><div class="calc-res" aria-live="polite"></div></div>
      <div class="calc-keys">${KEYS.map(([l, k, c]) => `<button type="button" data-k="${k}" class="${c || ''}">${l}</button>`).join('')}</div>`;
    document.body.append(fab, panel);
    const exprEl = panel.querySelector('.calc-expr'), resEl = panel.querySelector('.calc-res');

    // 'A' stands for the last result, kept at full precision so chained sums do not lose digits
    let expr = '', prev = '', justEq = false, error = '', ans = 0;
    const dec = (s) => (LANG === 'it' ? s.replace(/\./g, ',') : s);
    const fmt = (v) => (Math.abs(v) >= 1e15 || (v !== 0 && Math.abs(v) < 1e-9) ? v.toExponential(6) : String(parseFloat(v.toPrecision(12))));
    const pretty = (s) => dec(s.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−').replace(/A/g, () => fmt(ans)));

    // Small recursive-descent parser: + − × ÷, brackets, unary minus. No eval().
    function evaluate(src) {
      const open = (src.match(/\(/g) || []).length - (src.match(/\)/g) || []).length;
      const s = src + ')'.repeat(Math.max(0, open));
      let i = 0;
      const number = () => { if (s[i] === 'A') { i++; return ans; } const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)); if (!m) throw 0; i += m[0].length; return parseFloat(m[0]); };
      const factor = () => {
        if (s[i] === '-') { i++; return -factor(); }
        if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw 0; i++; return v; }
        return number();
      };
      const product = () => { let v = factor(); while (s[i] === '*' || s[i] === '/') { const o = s[i++], w = factor(); v = o === '*' ? v * w : v / w; } return v; };
      const sum = () => { let v = product(); while (s[i] === '+' || s[i] === '-') { const o = s[i++], w = product(); v = o === '+' ? v + w : v - w; } return v; };
      try { const v = sum(); return i === s.length ? v : NaN; } catch (e) { return NaN; }
    }

    function press(k) {
      error = '';
      if (k === 'clear') { expr = ''; prev = ''; justEq = false; }
      else if (k === 'back') { expr = justEq ? '' : expr.slice(0, -1); justEq = false; }
      else if (k === 'eq') {
        if (!expr) return render();
        const v = evaluate(expr);
        if (!isFinite(v)) error = isNaN(v) ? 'errExpr' : 'errDiv';
        else { prev = expr; ans = v; expr = 'A'; justEq = true; }
      } else if (/[+\-*/]/.test(k)) {
        justEq = false;
        if (expr === '' || /\($/.test(expr)) { if (k === '-') expr += '-'; }
        else if (/[+\-*/]$/.test(expr)) { if (!/[(]-$/.test(expr) && expr !== '-') expr = expr.slice(0, -1) + k; }
        else expr += k;
      } else { // digit, '.', '(' or ')'
        if ((justEq && k !== ')') || /A$/.test(expr)) { expr = ''; }
        justEq = false;
        if (k === '.' && /\d*\.\d*$/.test(expr)) return render();
        if (k === ')' && (expr.match(/\(/g) || []).length <= (expr.match(/\)/g) || []).length) return render();
        expr += k;
      }
      render();
    }
    function render() {
      if (error) { exprEl.textContent = pretty(expr); resEl.textContent = CT()[error]; resEl.classList.add('err'); return; }
      resEl.classList.remove('err');
      if (justEq) { exprEl.textContent = pretty(prev) + ' ='; resEl.textContent = dec(fmt(ans)); return; }
      resEl.textContent = expr ? pretty(expr) : '0';
      const v = /[\dA][+\-*/(]|\)/.test(expr) ? evaluate(expr) : NaN;
      exprEl.textContent = isFinite(v) ? '= ' + dec(fmt(v)) : '';
    }
    function setLang() {
      const c = CT();
      panel.querySelector('.calc-title').textContent = c.title;
      panel.setAttribute('aria-label', c.title);
      fab.setAttribute('aria-label', c.title); fab.title = c.title;
      panel.querySelector('[data-close]').setAttribute('aria-label', c.close);
      panel.querySelectorAll('[data-k]').forEach((b) => { const k = b.dataset.k; b.setAttribute('aria-label', c.names[k] || b.textContent); if (k === '.') b.textContent = LANG === 'it' ? ',' : '.'; });
      render();
    }
    function toggle(open) { panel.hidden = !open; fab.classList.toggle('on', open); fab.setAttribute('aria-expanded', String(open)); }

    fab.addEventListener('click', () => toggle(panel.hidden));
    panel.addEventListener('mousedown', (e) => { if (e.target.closest('.calc-keys button')) e.preventDefault(); }); // keep focus on the question
    panel.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) return toggle(false);
      const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k);
    });
    document.addEventListener('keydown', (e) => {
      if (panel.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest && e.target.closest('input, textarea, select')) return;
      const map = { Enter: 'eq', '=': 'eq', Backspace: 'back', Delete: 'clear', Escape: 'close', '*': '*', x: '*', X: '*', '/': '/', '+': '+', '-': '-', '.': '.', ',': '.', '(': '(', ')': ')' };
      const k = /^\d$/.test(e.key) ? e.key : map[e.key];
      if (!k) return;
      e.preventDefault();
      if (k === 'close') toggle(false); else press(k);
    });
    // drag by the title bar so the calculator never has to cover the data
    const head = panel.querySelector('.calc-head');
    head.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const r = panel.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
      head.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const x = Math.min(Math.max(0, ev.clientX - ox), window.innerWidth - r.width);
        const y = Math.min(Math.max(0, ev.clientY - oy), window.innerHeight - r.height);
        Object.assign(panel.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' });
      };
      const up = () => { head.removeEventListener('pointermove', move); head.removeEventListener('pointerup', up); head.removeEventListener('pointercancel', up); };
      head.addEventListener('pointermove', move); head.addEventListener('pointerup', up); head.addEventListener('pointercancel', up);
    });
    setLang();
    return {
      show(on) { fab.hidden = !on; document.body.classList.toggle('has-calc', on); if (!on) toggle(false); },
      setLang, evaluate,
    };
  })();
  window.EPSOCalc = calc;
  let current = ROUTES.guide;
  function updateCalc() {
    const x = ex(), v = $('#view');
    calc.show((current.view === 'practice' && current.kind === 'numerical') || (current.view === 'exam' && !!x && x.kind === 'numerical' && !!v.querySelector('.exam, .review')));
  }
  new MutationObserver(updateCalc).observe($('#view'), { childList: true });

  /* ---------- router ---------- */
  function route() {
    const h = (location.hash || '#guide').slice(1);
    current = ROUTES[h] || ROUTES.guide;
    const changedLang = LANG !== current.lang;
    LANG = current.lang;
    document.documentElement.lang = LANG;
    if (changedLang) calc.setLang();
    clearInterval(timerId);
    if (current.view !== 'guide') clearInterval(flipTimer);
    const inIt = LANG === 'it';
    document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + h || (inIt && a.classList.contains('tab-it'))));
    $('#itnav').hidden = !inIt;
    document.querySelectorAll('#itnav a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + h));
    $('#foot').textContent = u('footer');
    if (current.view === 'practice') renderPractice(current.kind);
    else if (current.view === 'exam') {
      const x = ex();
      if (x && !x.over) { renderExam(); timerId = setInterval(tick, 1000); } else renderExamPicker();
    } else if (current.view === 'its') renderItStyle();
    else renderGuide();
    updateCalc();
  }
  window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
  route();
})();
