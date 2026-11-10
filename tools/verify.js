// Run: node tools/verify.js — checks every answer in data.js.
const D = require('../data.js');
let errors = 0;
const fail = (m) => { errors++; console.log('  ✗ ' + m); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log('ABSTRACT');
for (const q of D.abstract) {
  const seq = [0, 1, 2, 3, 4, 5].map(q.seq);
  // 1. each rule's formula reproduces every frame of the sequence
  q.rules.forEach((r, k) => seq.forEach((p, i) => {
    if (!same(r.val(p), r.f(i, seq))) fail(`${q.id} rule ${k + 1} breaks at frame ${i + 1}: ${JSON.stringify(r.val(p))} vs ${JSON.stringify(r.f(i, seq))}`);
  }));
  // 2. the marked option is the generated frame 6
  if (!same(q.build(q.options[q.ans]), q.build(seq[5]))) fail(`${q.id} marked answer is not frame 6`);
  // 3. exactly one option survives all rules; every distractor broken by >=1 rule
  const survivors = q.options.map((o, j) => j).filter((j) => q.rules.every((r) => same(r.val(q.options[j]), r.f(5, seq))));
  if (survivors.length !== 1 || survivors[0] !== q.ans) fail(`${q.id} survivors ${survivors}`);
  // 4. options look different from each other
  const looks = q.options.map((o) => JSON.stringify(q.build(o)));
  if (new Set(looks).size !== looks.length) fail(`${q.id} has visually identical options`);
  // 5. no two shapes overlap in the same cell in any frame (shape elements with cells)
  const elim = q.options.map((o, j) => q.rules.map((r, k) => same(r.val(o), r.f(5, seq)) ? null : k + 1).filter(Boolean));
  console.log(`  ${q.id} ✓ answer ${'ABCDE'[q.ans]}  eliminated by rule: ${elim.map((e, j) => 'ABCDE'[j] + ':' + (e.join('+') || '-')).join(' ')}`);
}

console.log('NUMERICAL');
for (const q of D.numerical) {
  const v = q.compute(), t = q.fmt(v);
  const hits = q.options.filter((o) => o === t).length;
  if (hits !== 1) fail(`${q.id} computed ${t} matches ${hits} options`);
  if (new Set(q.options).size !== q.options.length) fail(`${q.id} duplicate options`);
  console.log(`  ${q.id} ✓ ${typeof v === 'number' ? v.toFixed(4) : v} -> ${t} = option ${'ABCDE'[q.ans]}`);
}

console.log('VERBAL');
for (const q of D.verbal) {
  const t = q.opts.filter((o) => o[1] === 'T').length;
  if (t !== 1 || q.opts.length !== 4) fail(`${q.id} has ${t} true statements`);
  else console.log(`  ${q.id} ✓ answer ${'ABCD'[q.ans]}`);
}
const dist = (arr, n) => arr.reduce((a, q) => (a[q.ans]++, a), Array(n).fill(0));
console.log('answer letter spread  A:', dist(D.abstract, 5).join(' '), ' N:', dist(D.numerical, 5).join(' '), ' V:', dist(D.verbal, 4).join(' '));
console.log(errors ? `\n${errors} problem(s)` : '\nAll checks passed');

/* ---------- Italian abstract ---------- */
const IT = require('../italian.js');
let itErr = 0;
const ifail = (m) => { itErr++; console.log('  ✗ ' + m); };
console.log('\nITALIAN ABSTRACT');
const PRES = ['id', 'rot90', 'rot180', 'rot270', 'mlr', 'mtb'];
const POSTS = { none: (x) => x, noSides: (x) => IT.minus(x, IT.SIDES), noDiamond: (x) => IT.minus(x, IT.DIAMOND), noCross: (x) => IT.minus(x, IT.CROSS), noDiag: (x) => IT.minus(x, IT.DIAG) };
const featuresLines = (s) => ({
  count: s.length, parity: s.length % 2, sides: IT.inter(s, IT.SIDES).length, diamond: IT.inter(s, IT.DIAMOND).length,
  cross: IT.inter(s, IT.CROSS).length, diag: IT.inter(s, IT.DIAG).length,
  mlrSym: IT.eq(IT.T.mlr(s), s), mtbSym: IT.eq(IT.T.mtb(s), s), rot90Sym: IT.eq(IT.T.rot90(s), s), rot180Sym: IT.eq(IT.T.rot180(s), s), closed: IT.degreesClosed(s),
});
const featuresShapes = (c) => ({ sides: c.n, dots: c.d, fill: c.f, sidesParity: c.n % 2, dotsParity: c.d % 2 });
for (const q of IT.questions) {
  const before = itErr;
  const key = (o) => JSON.stringify(o.s || o.c);
  if (new Set(q.options.map(key)).size !== q.options.length) ifail(`${q.id} duplicate options`);
  const pass = q.options.map((o, j) => j).filter((j) => q.rules.every((r) => r.ok(q.options[j], q.options)));
  if (pass.length !== 1 || pass[0] !== q.ans) ifail(`${q.id} options passing all rules: ${pass} (answer ${q.ans})`);
  const answer = q.options[q.ans];
  if (q.type === 'sup') {
    const f = (op, pre) => (a, b) => IT.OPS[op](a, IT.T[pre](b));
    q.ex.forEach(([a, b, c], k) => { if (!IT.eq(f(q.op, q.pre)(a, b), c)) ifail(`${q.id} example ${k + 1} does not follow its rule`); });
    if (!IT.eq(f(q.op, q.pre)(...q.q), answer.s)) ifail(`${q.id} answer does not follow the rule`);
    for (const op of Object.keys(IT.OPS)) for (const pre of PRES) {
      if (op === q.op && pre === q.pre) continue;
      if (q.ex.every(([a, b, c]) => IT.eq(f(op, pre)(a, b), c)) && !IT.eq(f(op, pre)(...q.q), answer.s)) ifail(`${q.id} alternative rule ${op}/${pre} also fits the examples`);
    }
  }
  if (q.type === 'mat' && q.rowOp) {
    const rows = [[0, 1, 2], [3, 4, 5]].map((r) => r.map((k) => q.grid[k].s));
    rows.forEach(([a, b, c], k) => { if (!IT.eq(IT.OPS[q.rowOp](a, b), c)) ifail(`${q.id} row ${k + 1} breaks the rule`); });
    if (!IT.eq(IT.OPS[q.rowOp](q.grid[6].s, q.grid[7].s), answer.s)) ifail(`${q.id} answer breaks the row rule`);
    for (const op of Object.keys(IT.OPS)) if (op !== q.rowOp && rows.every(([a, b, c]) => IT.eq(IT.OPS[op](a, b), c))) ifail(`${q.id} rows also fit ${op}`);
  }
  if (q.type === 'mat' && q.cell === 'shapes') {
    const g = [...q.grid.slice(0, 8).map((x) => x.c), answer.c];
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8]];
    for (const ln of lines) for (const k of ['sh', 'n', 'f']) if (new Set(ln.map((i) => g[i][k])).size !== 3) ifail(`${q.id} line ${ln} repeats ${k}`);
  }
  if (q.type === 'mat' && q.cell === 'arrow') {
    const g = [...q.grid.slice(0, 8).map((x) => x.c), answer.c];
    for (const r of [0, 3, 6]) {
      if (g[r + 1].a !== (g[r].a + 90) % 360 || g[r + 2].a !== (g[r + 1].a + 90) % 360) ifail(`${q.id} row ${r / 3 + 1} arrow`);
      if (g[r + 2].n !== g[r].n + g[r + 1].n) ifail(`${q.id} row ${r / 3 + 1} dots`);
    }
  }
  if (q.type === 'odd') {
    const out = q.options.map((o, j) => j).filter((j) => !q.prop(q.options[j], q.options));
    if (out.length !== 1 || out[0] !== q.ans) ifail(`${q.id} odd figures: ${out}`);
    const feats = q.options.map((o) => (o.s ? featuresLines(o.s) : featuresShapes(o.c)));
    for (const name of Object.keys(feats[0])) {
      const vals = feats.map((f) => JSON.stringify(f[name]));
      vals.forEach((v, k) => {
        const others = vals.filter((_, j) => j !== k);
        if (k !== q.ans && new Set(others).size === 1 && others[0] !== v) ifail(`${q.id} feature “${name}” singles out option ${'ABCDE'[k]} instead`);
      });
    }
  }
  if (q.type === 'ana') {
    const tfn = q.tf === 'g3' ? IT.anaG3 : IT.T[q.tf];
    if (!IT.eq(tfn(q.A), q.B) || !IT.eq(tfn(q.C), answer.s)) ifail(`${q.id} transformation mismatch`);
    for (const k of Object.keys(IT.T)) for (const [pn, post] of Object.entries(POSTS)) {
      const g = (x) => post(IT.T[k](x));
      if (IT.eq(g(q.A), q.B) && !IT.eq(g(q.C), answer.s)) ifail(`${q.id} alternative ${k}+${pn} maps A to B but gives a different answer`);
    }
  }
  if (itErr === before) console.log(`  ${q.id} ✓ ${q.type} answer ${'ABCDE'[q.ans]}`);
}
console.log(itErr ? `\n${itErr} Italian problem(s)` : '\nAll Italian checks passed');
process.exitCode = errors || itErr ? 1 : 0;

/* ---------- Italian section: native Italian questions + Italian abstract explanations ---------- */
const TX = require('../it_text.js');
const NI = require('../it_native.js');
let niErr = 0;
const nfail = (m) => { niErr++; console.log('  ✗ ' + m); };
console.log('\nITALIAN SECTION (written in Italian)');
for (const q of D.abstract) {
  const t = TX.abstract[q.id];
  if (!t || t.rules.length !== q.rules.length) nfail(`${q.id} Italian abstract explanation missing or wrong length`);
}
for (const q of NI.numerical) {
  const v = q.compute(), t = q.fmt(v), hits = q.options.filter((o) => o === t).length;
  if (hits !== 1 || new Set(q.options).size !== q.options.length || q.options[q.ans] !== t) nfail(`${q.id} computed ${t} matches ${hits} options`);
  else console.log(`  ${q.id} ✓ ${typeof v === 'number' ? v.toFixed(4) : v} -> ${t} = ${'ABCDE'[q.ans]}`);
  if (!NI.datasets[q.ds]) nfail(`${q.id} missing dataset`);
}
const ex = NI.datasets.export.rows, tot = ex.find((r) => r[0] === 'Totale');
[1, 2].forEach((k) => { if (ex.filter((r) => r[0] !== 'Totale').reduce((a, r) => a + r[k], 0) !== tot[k]) nfail('export total does not add up'); });
for (const q of NI.verbal) {
  const t = q.opts.filter((o) => o[1] === 'T').length;
  if (t !== 1 || q.opts.length !== 4 || !NI.passages[q.p]) nfail(`${q.id} has ${t} true statements`);
  else console.log(`  ${q.id} ✓ answer ${'ABCD'[q.ans]}`);
}
console.log(niErr ? `\n${niErr} Italian-section problem(s)` : `All Italian-section checks passed (${NI.numerical.length} numerical, ${NI.verbal.length} verbal, ${D.abstract.length} abstract explanations)`);
if (niErr) process.exitCode = 1;
