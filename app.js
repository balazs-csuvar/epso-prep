/* EPSO Reasoning Trainer — rendering and interaction */
(function () {
  'use strict';
  const E = window.EPSO;
  const $ = (s, r = document) => r.querySelector(s);
  const L5 = 'ABCDE';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- storage (optional) ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('epso-trainer-v1')) || {}; } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem('epso-trainer-v1', JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };
  let progress = store.get(); // { qid: 1 | 0 }
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
    return `<svg viewBox="0 0 120 120" role="img" aria-label="${esc(o.label || 'figure')}"><rect x="0" y="0" width="120" height="120" fill="var(--f-paper)"/>${back}${grid}${fore}<rect x="1" y="1" width="118" height="118" fill="none" stroke="${wholeHL ? 'var(--hl)' : 'var(--f-ink)'}" stroke-width="${wholeHL ? 6 : 1.6}"/></svg>`;
  }
  const qmark = '<svg viewBox="0 0 120 120" role="img" aria-label="missing frame"><rect x="1" y="1" width="118" height="118" fill="var(--f-paper)" stroke="var(--f-ink)" stroke-width="1.6" stroke-dasharray="6 5"/><text x="60" y="76" text-anchor="middle" font-size="48" font-family="var(--font-display)" fill="var(--f-ink)">?</text></svg>';

  /* ---------- abstract question view ---------- */
  function seqOf(q) { return [0, 1, 2, 3, 4, 5].map(q.seq); }
  function elimMap(q) {
    const s = seqOf(q), same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    return q.rules.map((r) => q.options.map((o, j) => !same(r.val(o), r.f(5, s))));
  }
  function abstractStimulus(q, st) {
    const s = seqOf(q);
    const hl = st.step >= 0 ? q.rules[st.step].ids : [];
    const cells = s.slice(0, 5).map((p, i) => `<figure class="fr"><div class="frame">${frame(q.build(p), { hl, grid: st.grid, label: 'frame ' + (i + 1) })}</div><figcaption>${i + 1}</figcaption></figure>`).join('');
    const last = st.reveal ? frame(q.build(s[5]), { hl, grid: st.grid, label: 'frame 6' }) : qmark;
    return `<div class="strip">${cells}<figure class="fr next"><div class="frame">${last}</div><figcaption>6</figcaption></figure></div>`;
  }
  function abstractOptions(q, st, onPick) {
    const elim = elimMap(q);
    return `<div class="aopts">${q.options.map((o, j) => {
      const struck = st.step >= 0 && elim.slice(0, st.step + 1).some((row) => row[j]);
      const cls = ['aopt', st.choice === j ? 'chosen' : '', st.done && j === q.ans ? 'right' : '', st.done && st.choice === j && j !== q.ans ? 'wrong' : '', struck ? 'struck' : ''].join(' ');
      return `<button class="${cls}" data-pick="${j}" ${st.done && !onPick ? 'disabled' : ''} aria-label="Option ${L5[j]}"><span class="ol">${L5[j]}</span><span class="frame">${frame(q.build(o), { grid: st.grid, label: 'option ' + L5[j] })}</span></button>`;
    }).join('')}</div>`;
  }
  function abstractExplain(q, st) {
    const elim = elimMap(q);
    const steps = q.rules.map((r, k) => {
      const out = elim[k].map((x, j) => (x ? L5[j] : null)).filter(Boolean);
      return `<li><button class="step ${st.step === k ? 'on' : ''}" data-step="${k}"><span class="sn">Rule ${k + 1}</span><span class="st">${esc(r.text)}</span><span class="se">${out.length ? 'Rules out ' + out.join(', ') : 'Rules out nothing new: every option already obeys it'}</span></button></li>`;
    }).join('');
    return `<div class="explain"><p class="hint">Click each rule to highlight what it tracks and cross out the options it rules out.</p><ol class="steps">${steps}</ol><p class="finale">Only <b>${L5[q.ans]}</b> survives every rule.</p></div>`;
  }

  /* ---------- numerical view ---------- */
  function dataView(ds) {
    const d = E.datasets[ds];
    if (d.kind === 'table') {
      const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('en-GB', { maximumFractionDigits: 2 }) : esc(v));
      return `<div class="data"><h4>${esc(d.title)}</h4><div class="tw"><table><thead><tr>${d.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${d.rows.map((r) => `<tr class="${r[0] === 'Total' ? 'tot' : ''}">${r.map((v) => `<td>${fmt(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="note">${esc(d.note)}</p></div>`;
    }
    const W = 360, H = 200, pad = { l: 34, r: 10, t: 18, b: 26 }, max = 160;
    const bw = (W - pad.l - pad.r) / d.values.length;
    const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
    const ticks = [0, 40, 80, 120, 160].map((t) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}" stroke="var(--rule)" stroke-width="1"/><text x="${pad.l - 6}" y="${y(t) + 4}" text-anchor="end" class="ax">${t}</text>`).join('');
    const bars = d.values.map((v, k) => {
      const x = pad.l + k * bw + bw * 0.18, w = bw * 0.64;
      return `<rect x="${x}" y="${y(v)}" width="${w}" height="${y(0) - y(v)}" fill="var(--accent)" rx="2"/><text x="${x + w / 2}" y="${y(v) - 5}" text-anchor="middle" class="bv">${v}</text><text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" class="ax">${d.labels[k]}</text>`;
    }).join('');
    return `<div class="data"><h4>${esc(d.title)}</h4><div class="tw"><svg class="bar" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(d.title)}">${ticks}${bars}</svg></div><p class="note">${esc(d.note)}</p></div>`;
  }

  /* ---------- generic question card ---------- */
  function textOptions(opts, st, letters, verdicts) {
    return `<div class="topts">${opts.map((o, j) => {
      const cls = ['topt', st.choice === j ? 'chosen' : '', st.done && j === st.ans ? 'right' : '', st.done && st.choice === j && j !== st.ans ? 'wrong' : ''].join(' ');
      const v = st.done && verdicts ? `<span class="verdict v-${verdicts[j][0]}">${{ T: 'True', F: 'False', C: 'Cannot tell' }[verdicts[j][0]]}</span><span class="why">${esc(verdicts[j][1])}</span>` : '';
      return `<button class="${cls}" data-pick="${j}" ${st.done ? 'disabled' : ''}><span class="ol">${letters[j]}</span><span class="ot">${esc(o)}${v ? `<span class="vv">${v}</span>` : ''}</span></button>`;
    }).join('')}</div>`;
  }

  function renderQuestion(kind, q, st) {
    if (kind === 'abstract') {
      return `<div class="qhead"><span class="tag">${q.level}</span>${q.family.map((f) => `<span class="fam">${esc(f)}</span>`).join('')}<label class="gridtog"><input type="checkbox" id="grid-${q.id}" ${st.grid ? 'checked' : ''} data-grid> Show 3×3 grid</label></div>
        <p class="stem">Which figure comes next in the series?</p>
        ${abstractStimulus(q, st)}
        ${abstractOptions(q, st)}
        ${st.done && st.showExplain ? abstractExplain(q, st) : ''}`;
    }
    if (kind === 'numerical') {
      return `${dataView(q.ds)}<p class="stem">${esc(q.q)}</p>${textOptions(q.options, { ...st, ans: q.ans }, L5)}${st.done && st.showExplain ? `<div class="explain"><p>${esc(q.explain)}</p></div>` : ''}`;
    }
    const p = E.passages[q.p];
    return `<article class="passage"><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></article><p class="stem">Which of the following statements is correct?</p>${textOptions(q.opts.map((o) => o[0]), { ...st, ans: q.ans }, 'ABCD', st.done && st.showExplain ? q.opts.map((o) => [o[1], o[2]]) : null)}`;
  }

  /* ---------- practice mode ---------- */
  const BANK = { abstract: E.abstract, numerical: E.numerical, verbal: E.verbal };
  const NAMES = { abstract: 'Abstract reasoning', numerical: 'Numerical reasoning', verbal: 'Verbal reasoning' };
  const prac = { abstract: { i: 0 }, numerical: { i: 0 }, verbal: { i: 0 } };
  const pstate = {}; // per-question state in practice
  const getSt = (id) => (pstate[id] = pstate[id] || { choice: null, done: false, step: -1, reveal: false, grid: false, showExplain: true });

  function renderPractice(kind) {
    const bank = BANK[kind], cur = prac[kind], q = bank[cur.i], st = getSt(q.id);
    const done = bank.filter((x) => progress[x.id] !== undefined).length, right = bank.filter((x) => progress[x.id] === 1).length;
    const chips = bank.map((x, k) => `<button class="chip ${k === cur.i ? 'cur' : ''} ${progress[x.id] === 1 ? 'ok' : progress[x.id] === 0 ? 'no' : ''}" data-go="${k}" aria-label="Question ${k + 1}">${k + 1}</button>`).join('');
    const intro = {
      abstract: 'Five frames follow hidden rules. Find the rules, then pick the frame that comes sixth. After you answer, step through the rules to see which options each one rules out.',
      numerical: 'Read the question first, then find only the figures you need. Calculators are allowed in the real test (on screen). Watch units and percentage points.',
      verbal: 'Judge each statement only against the passage. Exactly one is correct; the others are false or cannot be confirmed from the text.',
    }[kind];
    $('#view').innerHTML = `<section class="practice">
      <div class="phead"><div><h2>${NAMES[kind]}</h2><p class="lede">${intro}</p></div><div class="score"><b>${right}</b>/<span>${done}</span> correct<br><span class="muted">${bank.length} questions</span></div></div>
      <nav class="chips" aria-label="Questions">${chips}</nav>
      <div class="card" id="qcard">${renderQuestion(kind, q, st)}</div>
      ${st.done ? `<p class="result ${st.choice === q.ans ? 'good' : 'bad'}">${st.choice === q.ans ? 'Correct.' : `Not quite. The answer is ${(kind === 'verbal' ? 'ABCD' : L5)[q.ans]}.`}</p>` : ''}
      <div class="actions">
        <button class="btn ghost" data-nav="-1" ${cur.i === 0 ? 'disabled' : ''}>Previous</button>
        ${st.done ? (kind === 'abstract' ? `<button class="btn ghost" data-reveal>${st.reveal ? 'Hide' : 'Show'} frame 6 in the series</button>` : '') : `<button class="btn" data-check ${st.choice === null ? 'disabled' : ''}>Check answer</button>`}
        <button class="btn ${st.done ? '' : 'ghost'}" data-nav="1" ${cur.i === bank.length - 1 ? 'disabled' : ''}>Next question</button>
      </div>
      <p class="reset"><button class="link" data-reset>Clear my ${NAMES[kind].toLowerCase()} progress</button></p>
    </section>`;
    const v = $('#view');
    v.onclick = (e) => {
      const t = e.target.closest('button,input'); if (!t) return;
      if (t.dataset.pick !== undefined && !st.done) { st.choice = +t.dataset.pick; renderPractice(kind); }
      else if (t.dataset.check !== undefined) { st.done = true; st.step = -1; mark(q.id, st.choice === q.ans); renderPractice(kind); }
      else if (t.dataset.step !== undefined) { const k = +t.dataset.step; st.step = st.step === k ? -1 : k; renderPractice(kind); }
      else if (t.dataset.reveal !== undefined) { st.reveal = !st.reveal; renderPractice(kind); }
      else if (t.dataset.grid !== undefined) { st.grid = t.checked; renderPractice(kind); }
      else if (t.dataset.nav !== undefined) { cur.i = Math.max(0, Math.min(bank.length - 1, cur.i + +t.dataset.nav)); renderPractice(kind); window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }
      else if (t.dataset.go !== undefined) { cur.i = +t.dataset.go; renderPractice(kind); }
      else if (t.dataset.reset !== undefined) { bank.forEach((x) => { delete progress[x.id]; delete pstate[x.id]; }); store.set(progress); renderPractice(kind); }
    };
  }

  /* ---------- mock exam ---------- */
  const EXAM = {
    verbal: { n: 20, min: 35 }, numerical: { n: 10, min: 20 }, abstract: { n: 10, min: 10 },
  };
  let exam = null, timerId = null;
  const shuffle = (a) => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };

  function renderExamPicker() {
    clearInterval(timerId);
    $('#view').innerHTML = `<section class="practice"><div class="phead"><div><h2>Timed mock test</h2><p class="lede">Same length and time limit as the EPSO reasoning tests. No feedback until you submit. You can move between questions and flag ones to revisit.</p></div></div>
      <div class="pick">${Object.entries(EXAM).map(([k, v]) => `<button class="pickcard" data-start="${k}"><span class="pk">${NAMES[k]}</span><span class="pm">${v.n} questions · ${v.min} minutes</span><span class="pp">${k === 'verbal' ? 'Pass mark usually 10/20' : 'Combined pass mark with the other test usually 10/20'}</span></button>`).join('')}</div>
      <p class="muted small">The abstract and numerical mocks draw a random set from the question bank each time. Always check the pass marks in your own Notice of Competition.</p></section>`;
    $('#view').onclick = (e) => { const t = e.target.closest('[data-start]'); if (t) startExam(t.dataset.start); };
  }
  function startExam(kind) {
    const cfg = EXAM[kind];
    exam = { kind, qs: shuffle(BANK[kind]).slice(0, cfg.n), i: 0, ans: {}, flag: {}, end: Date.now() + cfg.min * 60000, over: false };
    clearInterval(timerId);
    timerId = setInterval(tick, 1000);
    renderExam();
  }
  function tick() {
    if (!exam || exam.over) return clearInterval(timerId);
    const left = Math.max(0, exam.end - Date.now());
    const el = $('#clock'); if (el) { el.textContent = fmtTime(left); el.classList.toggle('low', left < 60000); }
    if (left === 0) finishExam();
  }
  const fmtTime = (ms) => { const s = Math.ceil(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  function renderExam() {
    const q = exam.qs[exam.i], st = { choice: exam.ans[q.id] ?? null, done: false, step: -1, grid: !!exam.grid, showExplain: false };
    const nav = exam.qs.map((x, k) => `<button class="chip ${k === exam.i ? 'cur' : ''} ${exam.ans[x.id] !== undefined ? 'answered' : ''} ${exam.flag[x.id] ? 'flag' : ''}" data-go="${k}">${k + 1}</button>`).join('');
    const answered = Object.keys(exam.ans).length;
    $('#view').innerHTML = `<section class="practice exam">
      <div class="exambar"><span>${NAMES[exam.kind]} · question ${exam.i + 1} of ${exam.qs.length}</span><span class="clock" id="clock">${fmtTime(exam.end - Date.now())}</span></div>
      <nav class="chips">${nav}</nav>
      <div class="card">${renderQuestion(exam.kind, q, st)}</div>
      <div class="actions"><button class="btn ghost" data-nav="-1" ${exam.i === 0 ? 'disabled' : ''}>Previous</button><button class="btn ghost" data-flag>${exam.flag[q.id] ? 'Unflag' : 'Flag for review'}</button><button class="btn ghost" data-nav="1" ${exam.i === exam.qs.length - 1 ? 'disabled' : ''}>Next</button><button class="btn" data-submit>Submit test (${answered}/${exam.qs.length} answered)</button></div>
      <div id="confirm"></div></section>`;
    $('#view').onclick = (e) => {
      const t = e.target.closest('button,input'); if (!t) return;
      if (t.dataset.grid !== undefined) { exam.grid = t.checked; renderExam(); }
      else if (t.dataset.pick !== undefined) { exam.ans[q.id] = +t.dataset.pick; renderExam(); }
      else if (t.dataset.nav !== undefined) { exam.i = Math.max(0, Math.min(exam.qs.length - 1, exam.i + +t.dataset.nav)); renderExam(); }
      else if (t.dataset.go !== undefined) { exam.i = +t.dataset.go; renderExam(); }
      else if (t.dataset.flag !== undefined) { exam.flag[q.id] = !exam.flag[q.id]; renderExam(); }
      else if (t.dataset.submit !== undefined) {
        const missing = exam.qs.length - Object.keys(exam.ans).length;
        $('#confirm').innerHTML = `<div class="confirm"><p>${missing ? `${missing} question${missing > 1 ? 's are' : ' is'} unanswered. Wrong answers cost nothing in EPSO tests, so guessing is better than leaving blanks.` : 'All questions answered.'} Submit now?</p><button class="btn" data-really>Submit</button> <button class="btn ghost" data-cancel>Keep working</button></div>`;
      } else if (t.dataset.really !== undefined) finishExam();
      else if (t.dataset.cancel !== undefined) $('#confirm').innerHTML = '';
    };
  }
  function finishExam() {
    clearInterval(timerId);
    exam.over = true;
    const score = exam.qs.filter((q) => exam.ans[q.id] === q.ans).length;
    exam.qs.forEach((q) => { if (exam.ans[q.id] !== undefined) mark(q.id, exam.ans[q.id] === q.ans); });
    const used = Math.min(EXAM[exam.kind].min * 60000, EXAM[exam.kind].min * 60000 - Math.max(0, exam.end - Date.now()));
    const half = Math.ceil(exam.qs.length / 2);
    const letters = exam.kind === 'verbal' ? 'ABCD' : L5;
    $('#view').innerHTML = `<section class="practice"><div class="phead"><div><h2>Result: ${score} / ${exam.qs.length}</h2><p class="lede">${NAMES[exam.kind]} · time used ${fmtTime(used)}. ${score >= half ? 'At or above half marks, the usual pass threshold.' : 'Below half marks. Review the misses below, then try again.'}</p></div></div>
      <ol class="review">${exam.qs.map((q, k) => { const a = exam.ans[q.id]; const ok = a === q.ans; return `<li class="${ok ? 'ok' : 'no'}"><button class="rv" data-rv="${k}"><span>Question ${k + 1}</span><span>${a === undefined ? 'no answer' : 'you: ' + letters[a]} · correct: ${letters[q.ans]}</span><span class="rvs">${ok ? 'Correct' : 'Review'}</span></button></li>`; }).join('')}</ol>
      <div id="rvbox"></div>
      <div class="actions"><button class="btn" data-again>New ${NAMES[exam.kind].toLowerCase()} mock</button><button class="btn ghost" data-pickt>Choose another test</button></div></section>`;
    $('#view').onclick = (e) => {
      const t = e.target.closest('button,input'); if (!t) return;
      if (t.dataset.grid !== undefined && exam.rvst) {
        exam.rvst.grid = t.checked;
        $('#rvbox').innerHTML = `<div class="card">${renderQuestion(exam.kind, exam.qs[exam.rvq], exam.rvst)}</div>`;
      } else if (t.dataset.rv !== undefined) {
        const q = exam.qs[+t.dataset.rv];
        const st = exam.rvst && exam.rvst.id === q.id ? exam.rvst : { id: q.id, choice: exam.ans[q.id] ?? null, done: true, step: -1, grid: false, showExplain: true };
        exam.rvst = st; exam.rvq = +t.dataset.rv;
        $('#rvbox').innerHTML = `<div class="card">${renderQuestion(exam.kind, q, st)}</div>`;
        $('#rvbox').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      } else if (t.dataset.step !== undefined && exam.rvst) {
        const k = +t.dataset.step; exam.rvst.step = exam.rvst.step === k ? -1 : k;
        $('#rvbox').innerHTML = `<div class="card">${renderQuestion(exam.kind, exam.qs[exam.rvq], exam.rvst)}</div>`;
      } else if (t.dataset.again !== undefined) startExam(exam.kind);
      else if (t.dataset.pickt !== undefined) renderExamPicker();
    };
  }

  /* ---------- guide ---------- */
  const byId = (id) => E.abstract.find((q) => q.id === id);
  const FAMILIES = [
    { name: 'Position and movement', q: 'A4', r: 1, look: 'Picture a 3×3 grid. Does something hop corner to corner, walk around the outer ring, or move along a row? Count how many cells per step, and check the direction.', trap: 'Some elements move only every second frame, and two elements can move in opposite directions or at different speeds.' },
    { name: 'Rotation', q: 'A2', r: 0, look: 'Follow one end of the shape (the arrow tip). Is the step 45°, 90° or 180°? Clockwise or anticlockwise?', trap: 'Symmetric shapes hide rotation: a line looks the same after 180°, a square after 90°. Check that the answer looks right, not that the angle matches.' },
    { name: 'Evolving steps', q: 'A7', r: 0, look: 'If the change is not constant, write the differences down: +45°, +90°, +135°… The rule may be in the growth of the step.', trap: 'A constant-step distractor is almost always among the options.' },
    { name: 'Counting', q: 'A3', r: 0, look: 'Count objects, sides, corners, dots or line crossings. Look for +1, −1, +2 or an alternation like 1, 2, 1, 2.', trap: 'When shapes change without pattern, add up their sides or count all items together.' },
    { name: 'Shading and colour', q: 'A10', r: 0, look: 'Track one colour (the black quarter) rather than all of them. Is it alternating, cycling through three shades, or moving position?', trap: 'If colour looks random, it may be set by another element (see Instructions).' },
    { name: 'Reflection', q: 'A5', r: 0, look: 'Ask whether the shape flips left–right (vertical mirror) or upside down (horizontal mirror). Follow a distinctive feature such as a right-angle corner.', trap: 'Flips can alternate between the two mirror lines; a flip and a rotation can look alike, so test both.' },
    { name: 'Size', q: 'A14', r: 0, look: 'Is something growing, shrinking, or cycling large–medium–small?', trap: 'Size cycles restart; do not continue shrinking past the smallest size seen.' },
    { name: 'Two series in one', q: 'A15', r: 0, look: 'If frames 1, 3, 5 look alike and 2, 4 look alike, treat them as two separate sequences. The missing frame 6 continues the even series.', trap: 'One distractor usually continues the wrong series.' },
    { name: 'Instructions', q: 'A6', r: 0, look: 'One element controls another in the NEXT frame: the number of dots sets a colour, an arrow points where a shape will go, a shape travels to a new position.', trap: 'Hardest family. Suspect it when an element changes with no sequence of its own. Elements that are identical in every option can be ignored.' },
  ];

  function familyCard(f, k) {
    const q = byId(f.q), s = seqOf(q), ids = q.rules[f.r].ids;
    const strip = s.slice(0, 5).map((p) => `<div class="frame mini">${frame(q.build(p), { hl: ids })}</div>`).join('');
    return `<article class="fam-card"><div class="fam-top"><h4>${esc(f.name)}</h4><div class="flip" data-flip="${k}" aria-hidden="true"><div class="frame">${frame(q.build(s[0]), { hl: ids })}</div><span class="fnum">1</span></div></div>
      <div class="ministrip">${strip}</div>
      <p><b>What to look for.</b> ${esc(f.look)}</p><p class="trap"><b>Trap.</b> ${esc(f.trap)}</p>
      <button class="link" data-try="${f.q}">Practise this question →</button></article>`;
  }

  const WALK = 'A9';
  let walkStep = -1;
  function renderGuide() {
    const q = byId(WALK);
    const st = { choice: q.ans, done: true, step: walkStep, reveal: walkStep >= q.rules.length - 1, grid: true, showExplain: true };
    const methodSteps = [
      ['Isolate', 'Pick ONE simple element (a dot, an arrow, a colour). Ignore everything else for now.'],
      ['Track', 'Follow it across frames 1 to 5 and name its rule: where does it move, how does it turn, how does the count change?'],
      ['Predict', 'Say what that element must look like in frame 6 before looking at the options.'],
      ['Eliminate', 'Cross out every option where that element is wrong. Then repeat with the next element until one option is left.'],
    ];
    $('#view').innerHTML = `<section class="guide">
      <div class="hero"><p class="eyebrow">EPSO graduate reasoning tests</p><h1>Learn the rules, then beat the clock</h1><p class="lede">Practice for verbal, numerical and abstract reasoning in the EPSO format, with a step-by-step visual method for abstract questions.</p></div>

      <div class="fmt">
        <div class="fmt-row"><span class="fk">Verbal</span><span>20 questions</span><span>35 min</span><span class="fp">≈ 1 min 45 s each · usually pass 10/20</span><button class="link" data-goto="verbal">Practise</button></div>
        <div class="fmt-row"><span class="fk">Numerical</span><span>10 questions</span><span>20 min</span><span class="fp">≈ 2 min each · on-screen calculator</span><button class="link" data-goto="numerical">Practise</button></div>
        <div class="fmt-row"><span class="fk">Abstract</span><span>10 questions</span><span>10 min</span><span class="fp">≈ 1 min each · 5 frames, 5 options</span><button class="link" data-goto="abstract">Practise</button></div>
        <p class="muted small">Numerical and abstract usually share a combined pass mark (often 10/20). No marks are lost for wrong answers, so never leave a blank. Formats vary: check your Notice of Competition.</p>
      </div>

      <h2 id="anatomy">How an abstract question works</h2>
      <p class="lede">You see five frames in a row. Each frame is built from a few independent “building blocks”, and each block follows its own rule. Your job is to work out frame 6. Usually two or three rules are in play at once, and each wrong option breaks at least one of them.</p>

      <h2>The four-step method</h2>
      <div class="method">${methodSteps.map((m, k) => `<div class="mstep"><span class="mn">${k + 1}</span><b>${m[0]}</b><p>${m[1]}</p></div>`).join('')}</div>

      <h3>Worked example: try it step by step</h3>
      <p class="muted">Grid lines are on to help you see positions. Press each rule in turn: the tracked element lights up in yellow and the options it rules out are crossed out.</p>
      <div class="card walk">${abstractStimulus(q, st)}${abstractOptions(q, st)}${abstractExplain(q, st)}</div>

      <h2>The nine rule families</h2>
      <p class="lede">Almost every EPSO abstract question combines two to four of these. The yellow marker shows the element to follow; the large frame plays the sequence.</p>
      <div class="fams">${FAMILIES.map(familyCard).join('')}</div>

      <h2>Under time pressure</h2>
      <div class="time">
        <div><span class="tt">0–20 s</span><p>Find one rule and eliminate with it.</p></div>
        <div><span class="tt">20–45 s</span><p>Add a second (and third) rule only if more than one option is left.</p></div>
        <div><span class="tt">45–60 s</span><p>Commit. If two options remain, compare just those two: the difference tells you what to check.</p></div>
      </div>
      <ul class="tips">
        <li><b>Check in a fixed order:</b> position → rotation → count → shading → size → shape → instructions.</li>
        <li><b>Ignore what all options share.</b> If an element is identical in every option, it cannot decide the answer.</li>
        <li><b>Start with the easiest element</b>, such as a lone dot or the background, not the busiest shape.</li>
        <li><b>Stuck after 20 seconds?</b> Eliminate what you can, guess among the rest, move on. The last questions are often hardest.</li>
      </ul>

      <h2>Verbal and numerical: the short version</h2>
      <div class="two">
        <div><h4>Verbal</h4><ul class="tips"><li>Treat the passage as the only truth. Outside knowledge is a trap.</li><li>Watch quantifiers: “some”, “many”, “most” and “all” are different claims.</li><li>A cause the text does not state, a comparison it does not make, or a hedge (“may”, “possibly”) turned into a certainty makes a statement unsupported.</li><li>Eliminate first; the true statement is usually a plain paraphrase.</li></ul></div>
        <div><h4>Numerical</h4><ul class="tips"><li>Read the question before the table, then pick out only the cells you need.</li><li>Percentage change divides by the OLD value. Percentage points compare two percentages.</li><li>Check units: thousands, millions, per capita, exchange-rate direction.</li><li>Look at how far apart the options are; if they are far apart, estimate.</li></ul></div>
      </div>
      <p class="muted small sources">Format details from EPSO’s testing standards and current Notices of Competition (AD5 2026, CAST). All questions on this site are original practice material, written to match the EPSO format; every answer is checked by a script. The official EPSO samples are at <a href="https://selection.eu-careers.europa.eu/en/abstract-testsasten" target="_blank" rel="noopener">abstract</a>, <a href="https://selection.eu-careers.europa.eu/en/numerical-testsasten" target="_blank" rel="noopener">numerical</a> and <a href="https://selection.eu-careers.europa.eu/en/verbal-testsAST" target="_blank" rel="noopener">verbal</a>.</p>
    </section>`;
    $('#view').onclick = (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.step !== undefined) { const k = +t.dataset.step; walkStep = walkStep === k ? -1 : k; const y = window.scrollY; renderGuide(); window.scrollTo(0, y); }
      else if (t.dataset.try) { const i = E.abstract.findIndex((x) => x.id === t.dataset.try); prac.abstract.i = i; location.hash = 'abstract'; }
      else if (t.dataset.goto) location.hash = t.dataset.goto;
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
        const f = FAMILIES[+b.dataset.flip], q = byId(f.q);
        b.querySelector('.frame').innerHTML = frame(q.build(q.seq(flipFrame)), { hl: q.rules[f.r].ids });
        b.querySelector('.fnum').textContent = flipFrame + 1;
      });
    }, 1100);
  }

  /* ---------- router ---------- */
  function route() {
    const h = (location.hash || '#guide').slice(1);
    if (h !== 'exam') clearInterval(timerId);
    if (h !== 'guide') clearInterval(flipTimer);
    document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + h));
    if (h === 'abstract' || h === 'numerical' || h === 'verbal') renderPractice(h);
    else if (h === 'exam') { if (exam && !exam.over) renderExam(); else renderExamPicker(); }
    else renderGuide();
  }
  window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
  route();
})();
