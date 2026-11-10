/* "Italian abstract": figure-logic formats common in Italian company selection tests and
   public concorsi — superimposition ("adding" figures), 3×3 matrices, odd one out and
   analogies. Line figures are sets of segments on a 3×3 point grid, so every rule is
   plain set logic and tools/verify.js can check it. */
(function (root) {
  'use strict';

  /* ---------- line-figure model ---------- */
  const SEGS = ['t', 'r', 'b', 'l', 'v', 'h', 'd1', 'd2', 'n1', 'n2', 'n3', 'n4'];
  const PT = { TL: [18, 18], T: [60, 18], TR: [102, 18], L: [18, 60], C: [60, 60], R: [102, 60], BL: [18, 102], B: [60, 102], BR: [102, 102] };
  const ENDS = { t: ['TL', 'TR'], r: ['TR', 'BR'], b: ['BR', 'BL'], l: ['BL', 'TL'], v: ['T', 'B'], h: ['L', 'R'], d1: ['TL', 'BR'], d2: ['TR', 'BL'], n1: ['T', 'R'], n2: ['R', 'B'], n3: ['B', 'L'], n4: ['L', 'T'] };
  const S = (a) => SEGS.filter((x) => a.includes(x));
  const union = (a, b) => S([...a, ...b]);
  const inter = (a, b) => S(a.filter((x) => b.includes(x)));
  const minus = (a, b) => S(a.filter((x) => !b.includes(x)));
  const xor = (a, b) => union(minus(a, b), minus(b, a));
  const eq = (a, b) => S(a).join() === S(b).join();
  const within = (a, b) => a.every((x) => b.includes(x));
  const ROT = { t: 'r', r: 'b', b: 'l', l: 't', v: 'h', h: 'v', d1: 'd2', d2: 'd1', n1: 'n2', n2: 'n3', n3: 'n4', n4: 'n1' };
  const MLR = { t: 't', b: 'b', l: 'r', r: 'l', v: 'v', h: 'h', d1: 'd2', d2: 'd1', n1: 'n4', n4: 'n1', n2: 'n3', n3: 'n2' };
  const MTB = { t: 'b', b: 't', l: 'l', r: 'r', v: 'v', h: 'h', d1: 'd2', d2: 'd1', n1: 'n2', n2: 'n1', n3: 'n4', n4: 'n3' };
  const map = (a, m) => S(a.map((x) => m[x]));
  const T = {
    id: (a) => S(a),
    rot90: (a) => map(a, ROT),
    rot180: (a) => map(map(a, ROT), ROT),
    rot270: (a) => map(map(map(a, ROT), ROT), ROT),
    mlr: (a) => map(a, MLR),
    mtb: (a) => map(a, MTB),
    comp: (a) => minus(SEGS, a),
  };
  const OPS = { or: union, xor, and: inter, sub: minus, rsub: (a, b) => minus(b, a) };
  const SIDES = ['t', 'r', 'b', 'l'], DIAMOND = ['n1', 'n2', 'n3', 'n4'], CROSS = ['v', 'h'], DIAG = ['d1', 'd2'];
  const isRotationOf = (a, b) => ['id', 'rot90', 'rot180', 'rot270'].some((k) => eq(T[k](a), b));

  /* ---------- question builders ---------- */
  const L = (s) => ({ s: S(s) });          // line figure spec
  const PRE_TEXT = {
    id: '',
    rot90: 'First turn the second figure 90° clockwise, then combine. ',
  };
  const SUP_RULES = {
    xor: (A, B) => [
      { text: 'Lines that appear in only one of the two figures are kept.', ok: (o) => within(xor(A, B), o.s) },
      { text: 'Lines that appear in BOTH figures cancel each other out and disappear.', ok: (o) => inter(o.s, inter(A, B)).length === 0 },
      { text: 'Nothing new appears: every line comes from one of the two figures.', ok: (o) => within(o.s, union(A, B)) },
    ],
    or: (A, B) => [
      { text: 'Every line from either figure appears in the result, including lines they share.', ok: (o) => within(union(A, B), o.s) },
      { text: 'Nothing new appears: every line comes from one of the two figures.', ok: (o) => within(o.s, union(A, B)) },
    ],
    and: (A, B) => [
      { text: 'Lines that appear in BOTH figures are kept.', ok: (o) => within(inter(A, B), o.s) },
      { text: 'Lines that appear in only one figure disappear.', ok: (o) => inter(o.s, xor(A, B)).length === 0 },
      { text: 'Nothing new appears: every line comes from one of the two figures.', ok: (o) => within(o.s, union(A, B)) },
    ],
    sub: (A, B) => [
      { text: 'Lines of the first figure that are not in the second figure stay.', ok: (o) => within(minus(A, B), o.s) },
      { text: 'The second figure “rubs out” its lines: any line it shares with the first disappears.', ok: (o) => inter(o.s, B).length === 0 },
      { text: 'Lines that are only in the second figure are not added.', ok: (o) => within(o.s, A) },
    ],
  };
  const OP_NAME = { xor: 'Shared lines cancel', or: 'Everything adds up', and: 'Only shared lines stay', sub: 'Second figure rubs out the first' };

  function sup(id, level, op, pre, ex, q, distract) {
    const f = (a, b) => OPS[op](a, T[pre](b));
    const A = S(q[0]), B = T[pre](q[1]);
    const rules = SUP_RULES[op](A, B);
    if (pre !== 'id') rules[0] = { ...rules[0], text: PRE_TEXT[pre] + rules[0].text };
    return {
      id, type: 'sup', level, op, pre, ruleName: OP_NAME[op] + (pre === 'rot90' ? ', after turning the second figure 90° clockwise' : ''),
      ex: ex.map(([a, b]) => [S(a), S(b), f(a, b)]), q: [S(q[0]), S(q[1])],
      options: [L(f(q[0], q[1])), ...distract.map(L)], ans: 0, rules,
    };
  }

  /* ---------- SUPERIMPOSITION ("adding" figures) ---------- */
  const superimposition = [
    sup('I1', 'Easy', 'or', 'id',
      [[['t', 'v'], ['v', 'b']], [['d1', 'n1'], ['d2', 'n1', 'l']]],
      [['h', 'n4', 'r'], ['h', 'd2', 't']],
      [['n4', 'r', 'd2', 't'], ['h'], ['h', 'n4', 'r', 'd2'], ['n4', 'r', 'd2', 't', 'v']]),
    sup('I2', 'Medium', 'xor', 'id',
      [[['t', 'l', 'd1'], ['t', 'r', 'd2']], [['v', 'h', 'n1'], ['h', 'n3', 'b']]],
      [['t', 'b', 'v', 'n2'], ['v', 'l', 'n2', 'd1']],
      [['t', 'b', 'v', 'n2', 'l', 'd1'], ['v', 'n2'], ['t', 'b', 'l'], ['t', 'b', 'l', 'd1', 'v']]),
    sup('I3', 'Medium', 'and', 'id',
      [[['t', 'r', 'd1', 'v'], ['t', 'd1', 'h', 'b']], [['l', 'n1', 'n2', 'h'], ['n1', 'n2', 'v', 'r']]],
      [['t', 'b', 'd1', 'd2', 'v'], ['d2', 'v', 'l', 'n3', 't']],
      [['b', 'd1', 'l', 'n3'], ['t', 'v'], ['d2', 'v'], ['t', 'b', 'd1', 'd2', 'v', 'l', 'n3']]),
    sup('I4', 'Hard', 'sub', 'id',
      [[['t', 'r', 'b', 'l', 'd1'], ['r', 'd1', 'h']], [['v', 'h', 'n1', 'n3'], ['h', 'n3', 'd2']]],
      [['t', 'l', 'v', 'n2', 'n3', 'd2'], ['l', 'n2', 'd1', 'r']],
      [['t', 'v', 'n3', 'd2', 'd1', 'r'], ['d1', 'r'], ['t', 'v', 'n3'], ['l', 'n2']]),
    sup('I5', 'Hard', 'xor', 'rot90',
      [[['t', 'd1'], ['t', 'h']], [['l', 'n1', 'v'], ['n4', 'b']]],
      [['t', 'b', 'd2', 'n3'], ['t', 'd1', 'n2']],
      [['b', 'd2', 'n3', 'd1', 'n2'], ['t', 'b', 'n3', 'l', 'n1'], ['t', 'b', 'r', 'd2'], ['t', 'b', 'd2', 'n3', 'r']]),
  ];

  /* ---------- MATRICES ---------- */
  const cellShapes = (c) => [...Array(c.n)].map((_, k) => ({ id: 'm' + k, t: 'shape', shape: c.sh, at: [60 + (k - (c.n - 1) / 2) * 34, 60], r: c.sh === 'triangle' ? 12 : 11, fill: c.f }));
  const arrowDots = (c) => [{ id: 'arrow', t: 'arrow', at: [60, 50], r: 24, rot: c.a }, { id: 'dots', t: 'dots', at: [60, 104], n: c.n, r: 4, gap: 12, fill: 'b' }];

  const M1rows = [[['t', 'v'], ['v', 'b']], [['l', 'd1'], ['d1', 'r', 'h']], [['n1', 'n2', 'h'], ['h', 'n3', 't']]];
  const M2 = [
    { sh: 'circle', n: 1, f: 'w' }, { sh: 'square', n: 2, f: 'g' }, { sh: 'triangle', n: 3, f: 'b' },
    { sh: 'square', n: 3, f: 'b' }, { sh: 'triangle', n: 1, f: 'w' }, { sh: 'circle', n: 2, f: 'g' },
    { sh: 'triangle', n: 2, f: 'g' }, { sh: 'circle', n: 3, f: 'b' }, { sh: 'square', n: 1, f: 'w' },
  ];
  const M3 = [
    { a: 0, n: 1 }, { a: 90, n: 2 }, { a: 180, n: 3 },
    { a: 90, n: 2 }, { a: 180, n: 2 }, { a: 270, n: 4 },
    { a: 180, n: 3 }, { a: 270, n: 1 }, { a: 0, n: 4 },
  ];
  const row3 = (grid, o) => [grid[6], grid[7], o];
  const matrices = [
    {
      id: 'I6', type: 'mat', level: 'Medium', rowOp: 'xor',
      grid: [...M1rows.flatMap(([a, b]) => [L(a), L(b), L(xor(a, b))]).slice(0, 8), null],
      options: [L(['n1', 'n2', 'n3', 't']), L(['n1', 'n2', 'n3', 'h', 't']), L(['n1', 'n2', 'n3', 'n4']), L(['h']), L(['n1', 'n2', 't'])],
      ans: 0,
      rules: [
        { text: 'In each row, column 1 + column 2 = column 3. Lines in only one of the first two figures are kept…', ok: (o) => within(xor(M1rows[2][0], M1rows[2][1]), o.s) },
        { text: '…and lines that appear in both cancel out. In row 3 the horizontal line is in both, so it disappears.', ok: (o) => inter(o.s, inter(M1rows[2][0], M1rows[2][1])).length === 0 },
        { text: 'Nothing new is added. (Completing the diamond with a fourth side is the trap.)', ok: (o) => within(o.s, union(M1rows[2][0], M1rows[2][1])) },
      ],
    },
    {
      id: 'I7', type: 'mat', level: 'Medium', cell: 'shapes',
      grid: [...M2.slice(0, 8).map((c) => ({ el: cellShapes(c), c })), null],
      options: [{ sh: 'square', n: 1, f: 'w' }, { sh: 'square', n: 1, f: 'b' }, { sh: 'square', n: 2, f: 'w' }, { sh: 'circle', n: 1, f: 'w' }, { sh: 'triangle', n: 3, f: 'w' }].map((c) => ({ el: cellShapes(c), c })),
      ans: 0,
      rules: [
        { text: 'Every row and every column contains one circle, one square and one triangle. Row 3 already has a triangle and a circle, so the missing cell is a square.', ok: (o) => o.c.sh === 'square' },
        { text: 'Every row and every column contains one, two and three shapes. Row 3 has 2 and 3, so the answer has 1.', ok: (o) => o.c.n === 1 },
        { text: 'Every row and every column contains one white, one grey and one black cell. Row 3 has grey and black, so the answer is white.', ok: (o) => o.c.f === 'w' },
      ],
    },
    {
      id: 'I8', type: 'mat', level: 'Hard', cell: 'arrow',
      grid: [...M3.slice(0, 8).map((c) => ({ el: arrowDots(c), c })), null],
      options: [{ a: 0, n: 4 }, { a: 270, n: 4 }, { a: 0, n: 5 }, { a: 0, n: 2 }, { a: 90, n: 4 }].map((c) => ({ el: arrowDots(c), c })),
      ans: 0,
      rules: [
        { text: 'Across each row the arrow turns 90° clockwise from one cell to the next. Row 3 goes down → left → up.', ok: (o) => o.c.a === 0 },
        { text: 'The dots ADD UP across each row: column 1 + column 2 = column 3 (1 + 2 = 3, 2 + 2 = 4). Row 3: 3 + 1 = 4. Continuing a +1 count gives 5, and subtracting gives 2.', ok: (o) => o.c.n === 4 },
      ],
    },
  ];

  /* ---------- ODD ONE OUT ---------- */
  const polyDots = (c) => [{ id: 'poly', t: 'shape', shape: 'poly', n: c.n, at: [60, 50], r: 30, fill: c.f, rot: c.n === 4 ? 45 : 0 }, { id: 'dots', t: 'dots', at: [60, 106], n: c.d, r: 3.5, gap: 10, fill: 'b' }];
  const O1base = ['t', 'v', 'n2'];
  const O3 = [['t', 'd2', 'l'], ['r', 'b', 'd2'], ['n1', 'h', 'n4'], ['n2', 'n3', 'h'], ['n4', 'v', 'n2']];
  const degreesClosed = (s) => { // a single closed outline: every endpoint used exactly twice
    const deg = {}; s.forEach((x) => ENDS[x].forEach((p) => { deg[p] = (deg[p] || 0) + 1; }));
    return Object.values(deg).every((d) => d === 2);
  };
  const odd = [
    {
      id: 'I9', type: 'odd', level: 'Hard', kind: 'lines',
      options: [L(T.rot90(O1base)), L(T.mlr(O1base)), L(T.rot180(O1base)), L(O1base), L(T.rot270(O1base))],
      prop: (o, all) => all.some((x) => x !== o && isRotationOf(x.s, o.s)),
      rules: [
        { text: 'Four figures are the SAME figure turned round (by 90°, 180° or 270°). One is its mirror image, and no amount of turning can produce a mirror image. Pick one figure, turn it in your head to match each of the others, and the one you cannot reach is the mirror image.', ok: (o, all) => !all.some((x) => x !== o && isRotationOf(x.s, o.s)) },
      ],
    },
    {
      id: 'I10', type: 'odd', level: 'Medium', kind: 'shapes',
      options: [{ n: 3, d: 3, f: 'w' }, { n: 5, d: 5, f: 'g' }, { n: 6, d: 5, f: 'g' }, { n: 4, d: 4, f: 'w' }, { n: 6, d: 6, f: 'g' }].map((c) => ({ el: polyDots(c), c })),
      prop: (o) => o.c.n === o.c.d,
      rules: [
        { text: 'In four figures the number of dots equals the number of sides of the shape (3 and 3, 5 and 5, 4 and 4, 6 and 6). One has a hexagon with only 5 dots. Colour and size are distractors: no single figure differs from all the others on those.', ok: (o) => o.c.n !== o.c.d },
      ],
    },
    {
      id: 'I11', type: 'odd', level: 'Hard', kind: 'lines',
      options: O3.map(L),
      prop: (o) => degreesClosed(o.s),
      rules: [
        { text: 'All five figures have three lines, and symmetry does not single one out. The difference is whether the lines form a closed shape: four are closed triangles, while one is an open zig-zag whose ends do not meet.', ok: (o) => !degreesClosed(o.s) },
      ],
    },
  ];
  odd.forEach((q) => { q.ans = q.options.findIndex((o) => !q.prop(o, q.options)); });

  /* ---------- ANALOGIES ---------- */
  const anaG3 = (a) => minus(T.mlr(a), SIDES);
  const analogies = [
    {
      id: 'I12', type: 'ana', level: 'Easy', tf: 'rot90', tfName: 'turned 90° clockwise',
      A: S(['t', 'd1', 'n2', 'h']), C: S(['l', 'v', 'n1']),
      options: [L(T.rot90(['l', 'v', 'n1'])), L(T.rot270(['l', 'v', 'n1'])), L(T.mlr(['l', 'v', 'n1'])), L(T.rot180(['l', 'v', 'n1'])), L(['t', 'h', 'n1'])],
      ans: 0,
      rules: [
        { text: 'The second figure is the first turned 90° clockwise: the top edge moves to the right side, the horizontal centre line becomes vertical, and the diagonal and the short edge turn with it. Apply the same turn to the third figure. Turning anticlockwise or mirroring gives the traps.', ok: (o) => eq(o.s, T.rot90(['l', 'v', 'n1'])) },
      ],
    },
    {
      id: 'I13', type: 'ana', level: 'Medium', tf: 'comp', tfName: 'inverted',
      A: S(['t', 'v', 'h', 'd1', 'n1', 'n3']), C: S(['t', 'b', 'v', 'h', 'n1', 'n2']),
      options: [L(T.comp(['t', 'b', 'v', 'h', 'n1', 'n2'])), L(['t', 'b', 'v', 'h', 'n1', 'n2']), L(['r', 'l', 'd1', 'd2']), L(T.mlr(['t', 'b', 'v', 'h', 'n1', 'n2'])), L(['r', 'l', 'd1', 'd2', 'n3', 'n4', 'h'])],
      ans: 0,
      rules: [
        { text: 'The figure is inverted. The dot grid allows 12 possible lines (4 outer sides, the centre cross, 2 diagonals and the 4 sides of the inner diamond). Every line that was drawn disappears and every possible line that was missing appears. Check it on the first pair: top, cross, one diagonal and two diamond edges become the other three sides, the other diagonal and the other two diamond edges.', ok: (o) => within(T.comp(['t', 'b', 'v', 'h', 'n1', 'n2']), o.s) },
        { text: 'None of the third figure’s own lines remains.', ok: (o) => inter(o.s, ['t', 'b', 'v', 'h', 'n1', 'n2']).length === 0 },
      ],
    },
    {
      id: 'I14', type: 'ana', level: 'Hard', tf: 'g3', tfName: 'mirrored left–right, outer sides removed',
      A: S(['t', 'l', 'd1', 'n2', 'h']), C: S(['r', 'b', 'v', 'n1', 'd2']),
      options: [L(anaG3(['r', 'b', 'v', 'n1', 'd2'])), L(['v', 'n1', 'd2']), L(T.mlr(['r', 'b', 'v', 'n1', 'd2'])), L(['v', 'n3', 'd1']), L(['v', 'n4', 'd2'])],
      ans: 0,
      rules: [
        { text: 'Two changes happen at once. First, the figure is mirrored left to right: the diagonal flips direction and the short edge moves to the other side.', ok: (o) => within(o.s, T.mlr(['r', 'b', 'v', 'n1', 'd2'])) },
        { text: 'Second, every line on the outer square (top, bottom, left, right sides) is removed.', ok: (o) => inter(o.s, SIDES).length === 0 },
        { text: 'Everything else that was mirrored stays.', ok: (o) => within(anaG3(['r', 'b', 'v', 'n1', 'd2']), o.s) },
      ],
    },
  ];
  analogies.forEach((q) => { q.B = q.tf === 'g3' ? anaG3(q.A) : T[q.tf](q.A); });

  /* ---------- deterministic option shuffle (same idea as data.js) ---------- */
  function seededOrder(id, n) {
    let h = 2166136261;
    for (const ch of id + 'italia') { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    const idx = [...Array(n).keys()];
    for (let k = n - 1; k > 0; k--) { h = (Math.imul(h, 1103515245) + 12345) >>> 0; const j = h % (k + 1); [idx[k], idx[j]] = [idx[j], idx[k]]; }
    return idx;
  }
  const questions = [...superimposition, ...matrices, ...odd, ...analogies];
  questions.forEach((q) => {
    if (q.type === 'odd') return; // odd-one-out figures keep their order; the answer is wherever the odd figure sits
    const order = seededOrder(q.id, q.options.length), right = q.options[q.ans];
    q.options = order.map((k) => q.options[k]);
    q.ans = q.options.indexOf(right);
  });

  const api = { questions, SEGS, PT, ENDS, S, union, inter, minus, xor, eq, within, T, OPS, SIDES, DIAMOND, CROSS, DIAG, isRotationOf, degreesClosed, anaG3 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EPSO_IT = api;
})(this);
