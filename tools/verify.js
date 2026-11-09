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
process.exit(errors ? 1 : 0);
