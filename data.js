/* EPSO reasoning practice — question bank.
   Every abstract question is generated from parameters, and each rule is
   a formula that can be checked by tools/verify.js. Numerical answers are
   computed from the datasets below, not typed in by hand. */
(function (root) {
  'use strict';

  /* ---------- geometry helpers for abstract frames (viewBox 0 0 120 120) ---------- */
  const C = (c) => [20 + (c % 3) * 40, 20 + Math.floor(c / 3) * 40]; // 3x3 cell centre
  const CORNERS_CW = [0, 2, 8, 6];               // TL, TR, BR, BL
  const PERIM_CW = [0, 1, 2, 5, 8, 7, 6, 3];      // outer ring, clockwise
  const mod = (a, n) => ((a % n) + n) % n;
  const CELL_NAME = ['top-left', 'top-middle', 'top-right', 'middle-left', 'centre',
    'middle-right', 'bottom-left', 'bottom-middle', 'bottom-right'];
  const FILL_NAME = { w: 'white', g: 'grey', b: 'black' };
  const ang = (a) => mod(a, 360);
  // direction from the centre cell to each surrounding cell (0° = up, clockwise)
  const DIR_TO_CELL = { 0: 1, 45: 2, 90: 5, 135: 8, 180: 7, 225: 6, 270: 3, 315: 0 };

  /* ---------- ABSTRACT REASONING ---------- */
  // Each question: build(p) -> elements; seq(i) -> params for frame i (0..5, frame 5 = answer);
  // options: params in display order; ans: index of correct option;
  // rules: { text, ids, val(p), f(i, seqParams) } — f is the rule's prediction for frame i.
  const abstract = [
    {
      id: 'A1', level: 'Easy', family: ['Movement', 'Shading'],
      title: 'Corner hop',
      build: (p) => [
        { id: 'sq', t: 'shape', shape: 'square', at: C(4), r: 15, fill: p.sq },
        { id: 'dot', t: 'shape', shape: 'circle', at: C(p.dot), r: 9, fill: 'b' },
      ],
      seq: (i) => ({ dot: CORNERS_CW[i % 4], sq: i % 2 ? 'b' : 'w' }),
      options: [{ dot: 6, sq: 'b' }, { dot: 2, sq: 'w' }, { dot: 2, sq: 'b' }, { dot: 8, sq: 'b' }, { dot: 0, sq: 'b' }],
      ans: 2,
      rules: [
        { text: 'The black dot moves one corner clockwise each frame: top-left → top-right → bottom-right → bottom-left → top-left. Frame 6 needs it top-right.',
          ids: ['dot'], val: (p) => p.dot, f: (i) => CORNERS_CW[i % 4] },
        { text: 'The centre square alternates white, black, white, black… Frame 6 is an even step, so it is black.',
          ids: ['sq'], val: (p) => p.sq, f: (i) => (i % 2 ? 'b' : 'w') },
      ],
    },
    {
      id: 'A2', level: 'Easy', family: ['Rotation', 'Counting'],
      title: 'Turning arrow',
      build: (p) => [
        { id: 'arrow', t: 'arrow', at: [60, 54], r: 26, rot: p.rot },
        { id: 'dots', t: 'dots', at: [60, 106], n: p.n, r: 4, gap: 12, fill: 'b' },
      ],
      seq: (i) => ({ rot: ang(45 * i), n: i % 2 ? 2 : 1 }),
      options: [{ rot: 270, n: 2 }, { rot: 225, n: 1 }, { rot: 180, n: 2 }, { rot: 225, n: 2 }, { rot: 135, n: 2 }],
      ans: 3,
      rules: [
        { text: 'The arrow turns 45° clockwise every frame (up, up-right, right, down-right, down). Next it points down-left (225°).',
          ids: ['arrow'], val: (p) => p.rot, f: (i) => ang(45 * i) },
        { text: 'The dots alternate 1, 2, 1, 2, 1… so frame 6 has 2 dots.',
          ids: ['dots'], val: (p) => p.n, f: (i) => (i % 2 ? 2 : 1) },
      ],
    },
    {
      id: 'A3', level: 'Easy', family: ['Counting (sides)', 'Shading'],
      title: 'Growing polygon',
      build: (p) => [{ id: 'poly', t: 'shape', shape: 'poly', n: p.n, at: [60, 62], r: 38, fill: p.f, rot: p.n === 4 ? 45 : 0 }],
      seq: (i) => ({ n: 3 + i, f: ['w', 'g', 'b'][i % 3] }),
      options: [{ n: 8, f: 'w' }, { n: 7, f: 'b' }, { n: 8, f: 'g' }, { n: 9, f: 'b' }, { n: 8, f: 'b' }],
      ans: 4,
      rules: [
        { text: 'The shape gains one side each frame: triangle (3), square (4), pentagon (5), hexagon (6), heptagon (7). Frame 6 is an octagon (8 sides). Count sides; do not guess by eye.',
          ids: ['poly'], val: (p) => p.n, f: (i) => 3 + i },
        { text: 'The fill cycles white → grey → black and repeats. Frame 6 is the third step of the second cycle: black.',
          ids: ['poly'], val: (p) => p.f, f: (i) => ['w', 'g', 'b'][i % 3] },
      ],
    },
    {
      id: 'A4', level: 'Easy', family: ['Movement', 'Every second frame'],
      title: 'Two speeds',
      build: (p) => [
        { id: 'circ', t: 'shape', shape: 'circle', at: C(p.c), r: 12, fill: 'w' },
        { id: 'sq', t: 'shape', shape: 'square', at: C(p.s), r: 10, fill: 'g' },
      ],
      seq: (i) => ({ c: CORNERS_CW[Math.floor(i / 2)], s: PERIM_CW[(1 + i) % 8] }),
      options: [{ c: 6, s: 3 }, { c: 8, s: 3 }, { c: 8, s: 6 }, { c: 2, s: 6 }, { c: 8, s: 7 }],
      ans: 2,
      rules: [
        { text: 'The white circle moves one corner clockwise only every SECOND frame (TL, TL, TR, TR, BR…). Frame 6 keeps it bottom-right.',
          ids: ['circ'], val: (p) => p.c, f: (i) => CORNERS_CW[Math.floor(i / 2)] },
        { text: 'The grey square walks clockwise around the outer ring one cell per frame: top-middle, top-right, middle-right, bottom-right, bottom-middle… next is bottom-left.',
          ids: ['sq'], val: (p) => p.s, f: (i) => PERIM_CW[(1 + i) % 8] },
      ],
    },
    {
      id: 'A5', level: 'Medium', family: ['Reflection', 'Counting'],
      title: 'Mirror flips',
      build: (p) => [
        { id: 'rt', t: 'rtri', at: [60, 52], r: 30, corner: p.k, fill: 'g' },
        { id: 'dots', t: 'dots', at: [60, 106], n: p.n, r: 4, gap: 11, fill: 'b' },
      ],
      seq: (i) => ({ k: ['BL', 'BR', 'TR', 'TL', 'BL', 'BR'][i], n: 6 - i }),
      options: [{ k: 'TL', n: 1 }, { k: 'BR', n: 1 }, { k: 'TR', n: 1 }, { k: 'BR', n: 2 }, { k: 'BL', n: 1 }],
      ans: 1,
      rules: [
        { text: 'The triangle is mirrored each frame, alternating a left–right flip and an up–down flip. Its right angle goes BL → BR → TR → TL → BL. The next flip is left–right, so the right angle ends bottom-right.',
          ids: ['rt'], val: (p) => p.k,
          f: (i) => { let k = 'BL'; for (let s = 1; s <= i; s++) { k = s % 2 ? k[0] + (k[1] === 'L' ? 'R' : 'L') : (k[0] === 'B' ? 'T' : 'B') + k[1]; } return k; } },
        { text: 'One dot disappears each frame: 6, 5, 4, 3, 2 → 1.',
          ids: ['dots'], val: (p) => p.n, f: (i) => 6 - i },
      ],
    },
    {
      id: 'A6', level: 'Hard', family: ['Instruction', 'Rotation'],
      title: 'Dots give orders',
      build: (p) => [
        { id: 'circ', t: 'shape', shape: 'circle', at: [56, 62], r: 26, fill: p.f },
        { id: 'dots', t: 'dots', at: [30, 14], n: p.d, r: 4, gap: 11, fill: 'b' },
        { id: 'arrow', t: 'arrow', at: C(8), r: 12, rot: p.a },
      ],
      seq: (i) => ({ d: [2, 3, 1, 3, 2, 1][i], f: ['g', 'g', 'b', 'w', 'b', 'g'][i], a: ang(90 * i) }),
      options: [{ d: 1, f: 'w', a: 90 }, { d: 1, f: 'g', a: 180 }, { d: 1, f: 'b', a: 90 }, { d: 1, f: 'g', a: 270 }, { d: 1, f: 'g', a: 90 }],
      ans: 4,
      rules: [
        { text: 'The dots do not follow a sequence of their own: they are an instruction. The number of dots in one frame sets the circle colour in the NEXT frame: 1 dot → white, 2 → grey, 3 → black. Frame 5 has 2 dots, so frame 6 has a grey circle. (All options show 1 dot, so the dot count itself does not decide anything.)',
          ids: ['dots', 'circ'], val: (p) => p.f,
          f: (i, s) => (i === 0 ? s[0].f : { 1: 'w', 2: 'g', 3: 'b' }[s[i - 1].d]) },
        { text: 'The small arrow turns 90° clockwise each frame: up, right, down, left, up → right.',
          ids: ['arrow'], val: (p) => p.a, f: (i) => ang(90 * i) },
      ],
    },
    {
      id: 'A7', level: 'Medium', family: ['Evolving rotation', 'Size'],
      title: 'Speeding up',
      build: (p) => [
        { id: 'arrow', t: 'arrow', at: [36, 60], r: 22, rot: p.rot },
        { id: 'sq', t: 'shape', shape: 'square', at: [90, 60], r: { s: 7, m: 12, l: 18 }[p.sz], fill: 'b' },
      ],
      seq: (i) => ({ rot: ang(45 * (i * (i + 1)) / 2), sz: ['s', 'm', 'l'][i % 3] }),
      options: [{ rot: 135, sz: 'l' }, { rot: 315, sz: 'l' }, { rot: 270, sz: 'l' }, { rot: 315, sz: 'm' }, { rot: 315, sz: 's' }],
      ans: 1,
      rules: [
        { text: 'The arrow turns by a growing amount: +45°, +90°, +135°, +180°. The next turn is +225°. From 90° (pointing right), 90 + 225 = 315°, i.e. pointing up-left. A constant 45° step would wrongly give 135°.',
          ids: ['arrow'], val: (p) => p.rot, f: (i) => ang(45 * (i * (i + 1)) / 2) },
        { text: 'The square cycles small → medium → large. Frame 6 is large.',
          ids: ['sq'], val: (p) => p.sz, f: (i) => ['s', 'm', 'l'][i % 3] },
      ],
    },
    {
      id: 'A8', level: 'Hard', family: ['Counting (total sides)'],
      title: 'Side sum',
      build: (p) => {
        const pos = p.ns.length === 2 ? [[34, 60], [86, 60]] : [[32, 38], [88, 38], [60, 88]];
        return p.ns.map((n, k) => ({ id: 's' + k, t: 'shape', shape: 'poly', n, at: pos[k], r: 20, fill: 'w', rot: n === 4 ? 45 : 0 }));
      },
      seq: (i) => ({ ns: [[3, 4], [5, 4], [6, 5], [6, 3, 4], [5, 5, 5], [6, 6, 5]][i] }),
      options: [{ ns: [6, 5, 5] }, { ns: [6, 6, 6] }, { ns: [5, 5, 5] }, { ns: [6, 6, 5] }, { ns: [6, 4, 4] }],
      ans: 3,
      rules: [
        { text: 'The shapes themselves change without a pattern, so count instead. Total number of sides per frame: 3+4 = 7, 5+4 = 9, 6+5 = 11, 6+3+4 = 13, 5+5+5 = 15. The total rises by 2 each time, so frame 6 needs 17 sides (6+6+5).',
          ids: ['s0', 's1', 's2'], val: (p) => p.ns.reduce((a, b) => a + b, 0), f: (i) => 7 + 2 * i },
      ],
    },
    {
      id: 'A9', level: 'Medium', family: ['Movement (two directions)', 'Rotation'],
      title: 'Passing on the ring',
      build: (p) => [
        { id: 'circ', t: 'shape', shape: 'circle', at: C(p.c), r: 11, fill: 'w' },
        { id: 'sq', t: 'shape', shape: 'square', at: C(p.s), r: 10, fill: 'b' },
        { id: 'tri', t: 'shape', shape: 'triangle', at: C(4), r: 14, fill: 'g', rot: p.t },
      ],
      seq: (i) => ({ c: PERIM_CW[i % 8], s: PERIM_CW[mod(5 - 2 * i, 8)], t: ang(90 * i) }),
      options: [{ c: 7, s: 5, t: 270 }, { c: 6, s: 5, t: 90 }, { c: 7, s: 1, t: 90 }, { c: 7, s: 8, t: 90 }, { c: 7, s: 5, t: 90 }],
      ans: 4,
      rules: [
        { text: 'The white circle moves clockwise around the outer ring one cell per frame: top-left, top-middle, top-right, middle-right, bottom-right → bottom-middle.',
          ids: ['circ'], val: (p) => p.c, f: (i) => PERIM_CW[i % 8] },
        { text: 'The black square moves ANTICLOCKWISE around the ring two cells per frame: bottom-middle → middle-right → top-middle → middle-left → bottom-middle → middle-right.',
          ids: ['sq'], val: (p) => p.s, f: (i) => PERIM_CW[mod(5 - 2 * i, 8)] },
        { text: 'The centre triangle turns 90° clockwise each frame: up, right, down, left, up → right.',
          ids: ['tri'], val: (p) => p.t, f: (i) => ang(90 * i) },
      ],
    },
    {
      id: 'A10', level: 'Easy', family: ['Shading (pattern shift)', 'Repeating cycle'],
      title: 'Turning quarters',
      build: (p) => [
        { id: 'quad', t: 'quad', fills: p.q.split('') },
        { id: 'mid', t: 'shape', shape: p.m, at: [60, 60], r: 13, fill: 'w' },
      ],
      seq: (i) => ({ q: [0, 1, 2, 3].map((j) => 'bwgw'[mod(j - i, 4)]).join(''), m: ['circle', 'triangle', 'square'][i % 3] }),
      options: [{ q: 'wgwb', m: 'square' }, { q: 'wbwg', m: 'square' }, { q: 'bwgw', m: 'square' }, { q: 'wbwg', m: 'circle' }, { q: 'wbwg', m: 'triangle' }],
      ans: 1,
      rules: [
        { text: 'The colours of the four quarters rotate one quarter clockwise each frame. Follow the black quarter: TL → TR → BR → BL → TL → TR. In frame 6 it is top-right, with grey bottom-left.',
          ids: ['quad'], val: (p) => p.q, f: (i) => [0, 1, 2, 3].map((j) => 'bwgw'[mod(j - i, 4)]).join('') },
        { text: 'The centre shape repeats circle → triangle → square. Frame 6 is a square.',
          ids: ['mid'], val: (p) => p.m, f: (i) => ['circle', 'triangle', 'square'][i % 3] },
      ],
    },
    {
      id: 'A11', level: 'Hard', family: ['Instruction (arrow points)', 'Size'],
      title: 'Follow the pointer',
      build: (p) => [
        { id: 'arrow', t: 'arrow', at: C(4), r: 15, rot: p.a },
        { id: 'circ', t: 'shape', shape: 'circle', at: C(p.c), r: p.sz === 'l' ? 13 : 7, fill: 'b' },
      ],
      seq: (i) => ({ c: [0, 5, 7, 0, 6, 1][i], a: [90, 180, 315, 225, 0, 135][i], sz: i % 2 ? 'l' : 's' }),
      options: [{ c: 6, a: 135, sz: 'l' }, { c: 1, a: 135, sz: 's' }, { c: 7, a: 135, sz: 'l' }, { c: 1, a: 135, sz: 'l' }, { c: 3, a: 135, sz: 'l' }],
      ans: 3,
      rules: [
        { text: 'The arrow does not rotate in a pattern; it is an instruction. In each frame it points at the cell where the circle will be in the NEXT frame. In frame 5 it points up, so in frame 6 the circle sits top-middle.',
          ids: ['arrow', 'circ'], val: (p) => p.c, f: (i, s) => (i === 0 ? s[0].c : DIR_TO_CELL[s[i - 1].a]) },
        { text: 'The circle alternates small, large, small, large… Frame 6 is large.',
          ids: ['circ'], val: (p) => p.sz, f: (i) => (i % 2 ? 'l' : 's') },
      ],
    },
    {
      id: 'A12', level: 'Medium', family: ['Movement', 'Rotation (symmetry trap)', 'Counting'],
      title: 'Three tracks',
      build: (p) => [
        { id: 'dot', t: 'shape', shape: 'circle', at: C(p.d), r: 8, fill: 'b' },
        { id: 'line', t: 'line', at: [60, 56], r: 22, rot: p.l },
        { id: 'sqs', t: 'dots', shape: 'square', at: [60, 104], n: p.n, r: 3.5, gap: 10, fill: 'g' },
      ],
      seq: (i) => ({ d: [2, 0, 6, 8][i % 4], l: mod(45 * i, 180), n: (i % 3) + 1 }),
      options: [{ d: 2, l: 45, n: 3 }, { d: 0, l: 135, n: 3 }, { d: 0, l: 45, n: 4 }, { d: 0, l: 0, n: 3 }, { d: 0, l: 45, n: 3 }],
      ans: 4,
      rules: [
        { text: 'The black dot moves one corner ANTICLOCKWISE each frame: top-right → top-left → bottom-left → bottom-right → top-right → top-left.',
          ids: ['dot'], val: (p) => p.d, f: (i) => [2, 0, 6, 8][i % 4] },
        { text: 'The line turns 45° clockwise each frame: | / — \\ |. A line looks the same after 180°, so frame 5 looks like frame 1, and frame 6 looks like frame 2: “/”.',
          ids: ['line'], val: (p) => p.l, f: (i) => mod(45 * i, 180) },
        { text: 'The small squares count 1, 2, 3, 1, 2 → 3 (a repeating cycle, not +1 for ever).',
          ids: ['sqs'], val: (p) => p.n, f: (i) => (i % 3) + 1 },
      ],
    },
    {
      id: 'A13', level: 'Hard', family: ['Instruction (shapes travel)', 'Background shading'],
      title: 'Conveyor belt',
      build: (p) => [
        { id: 'bg', t: 'bg', fill: p.bg },
        { id: 'tl', t: 'shape', shape: p.tl, at: [22, 22], r: 11, fill: 'w' },
        { id: 'c', t: 'shape', shape: p.c, at: [60, 60], r: 18, fill: 'w' },
        { id: 'br', t: 'shape', shape: p.br, at: [98, 98], r: 11, fill: 'w' },
      ],
      seq: (i) => [
        { tl: 'square', c: 'circle', br: 'triangle', bg: 'w' },
        { tl: 'star', c: 'square', br: 'circle', bg: 'g' },
        { tl: 'triangle', c: 'star', br: 'square', bg: 'w' },
        { tl: 'circle', c: 'triangle', br: 'star', bg: 'g' },
        { tl: 'diamond', c: 'circle', br: 'triangle', bg: 'w' },
        { tl: 'square', c: 'diamond', br: 'circle', bg: 'g' },
      ][i],
      options: [
        { tl: 'square', c: 'diamond', br: 'circle', bg: 'w' },
        { tl: 'square', c: 'circle', br: 'triangle', bg: 'g' },
        { tl: 'square', c: 'diamond', br: 'triangle', bg: 'g' },
        { tl: 'square', c: 'diamond', br: 'circle', bg: 'g' },
        { tl: 'square', c: 'triangle', br: 'circle', bg: 'g' },
      ],
      ans: 3,
      rules: [
        { text: 'The background alternates white and grey. Frame 6 is grey.',
          ids: ['bg'], val: (p) => p.bg, f: (i) => (i % 2 ? 'g' : 'w') },
        { text: 'Comparing the same position frame to frame shows no pattern. Instead, shapes travel: the top-left shape becomes the big centre shape in the next frame. Frame 5 has a diamond top-left, so frame 6 has a diamond in the centre.',
          ids: ['tl', 'c'], val: (p) => p.c, f: (i, s) => (i === 0 ? s[0].c : s[i - 1].tl) },
        { text: '…and the centre shape moves to the bottom-right corner in the next frame. Frame 5 has a circle in the centre, so frame 6 has a circle bottom-right. (The new top-left shape is the same in every option, so ignore it.)',
          ids: ['c', 'br'], val: (p) => p.br, f: (i, s) => (i === 0 ? s[0].br : s[i - 1].c) },
      ],
    },
    {
      id: 'A14', level: 'Easy', family: ['Size', 'Rotation', 'Counting'],
      title: 'Shrinking circle',
      build: (p) => [
        { id: 'circ', t: 'shape', shape: 'circle', at: [60, 68], r: { L: 36, M: 27, S: 18 }[p.s], fill: 'w' },
        { id: 'tri', t: 'shape', shape: 'triangle', at: [60, 68], r: 9, fill: 'b', rot: p.t },
        { id: 'dots', t: 'dots', at: [60, 14], n: p.n, r: 3.5, gap: 10, fill: 'b' },
      ],
      seq: (i) => ({ s: ['L', 'M', 'S'][i % 3], t: i % 2 ? 180 : 0, n: i + 1 }),
      options: [{ s: 'L', t: 180, n: 6 }, { s: 'S', t: 180, n: 6 }, { s: 'M', t: 180, n: 6 }, { s: 'S', t: 0, n: 6 }, { s: 'S', t: 180, n: 5 }],
      ans: 1,
      rules: [
        { text: 'The circle size cycles large → medium → small, then repeats. Frame 6 is small.',
          ids: ['circ'], val: (p) => p.s, f: (i) => ['L', 'M', 'S'][i % 3] },
        { text: 'The triangle flips between pointing up and pointing down. Frame 6 points down.',
          ids: ['tri'], val: (p) => p.t, f: (i) => (i % 2 ? 180 : 0) },
        { text: 'One dot is added each frame: 1, 2, 3, 4, 5 → 6.',
          ids: ['dots'], val: (p) => p.n, f: (i) => i + 1 },
      ],
    },
    {
      id: 'A15', level: 'Medium', family: ['Interleaved series'],
      title: 'Two stories',
      build: (p) => (p.k === 'sq'
        ? [{ id: 'sq', t: 'shape', shape: 'square', at: C(p.cell), r: 12, fill: 'g' }]
        : [{ id: 'dots', t: 'dots', at: [60, 60], n: p.n, r: 7, gap: 22, fill: p.fill }]),
      seq: (i) => (i % 2 ? { k: 'ci', n: (i + 1) / 2, fill: 'b' } : { k: 'sq', cell: [0, 3, 6][i / 2] }),
      options: [{ k: 'ci', n: 2, fill: 'b' }, { k: 'ci', n: 4, fill: 'b' }, { k: 'ci', n: 3, fill: 'w' }, { k: 'sq', cell: 0 }, { k: 'ci', n: 3, fill: 'b' }],
      ans: 4,
      rules: [
        { text: 'Frames 1, 3, 5 and frames 2, 4, 6 are two separate series that take turns. Frame 6 belongs to the circle series.',
          ids: ['dots', 'sq'], val: (p) => p.k, f: (i) => (i % 2 ? 'ci' : 'sq') },
        { text: 'In the circle series (frames 2 and 4) the number of black circles goes 1, 2 → so frame 6 has 3.',
          ids: ['dots'], val: (p) => (p.k === 'ci' ? p.n : null), f: (i) => (i % 2 ? (i + 1) / 2 : null) },
        { text: 'The circles in that series are always black.',
          ids: ['dots'], val: (p) => (p.k === 'ci' ? p.fill : null), f: (i) => (i % 2 ? 'b' : null) },
      ],
    },
    {
      id: 'A16', level: 'Hard', family: ['Instruction (count sets turn)', 'Movement'],
      title: 'Counted turns',
      build: (p) => [
        { id: 'arrow', t: 'arrow', at: [64, 60], r: 20, rot: p.a },
        { id: 'dots', t: 'dots', at: [20, 60], n: p.d, r: 3.5, gap: 8, fill: 'b' },
        { id: 'sq', t: 'shape', shape: 'square', at: C(p.s), r: 9, fill: 'w' },
      ],
      seq: (i) => ({ a: [0, 90, 270, 180, 270, 90][i], d: [1, 2, 3, 1, 2, 3][i], s: CORNERS_CW[i % 4] }),
      options: [{ a: 0, d: 3, s: 2 }, { a: 90, d: 3, s: 0 }, { a: 90, d: 3, s: 2 }, { a: 180, d: 3, s: 2 }, { a: 270, d: 3, s: 2 }],
      ans: 2,
      rules: [
        { text: 'The arrow does not turn by a fixed amount (+90, +180, +270, +90, …). The number of dots is the instruction: the arrow turns 90° clockwise for each dot in the PREVIOUS frame. Frame 5 has 2 dots, so the arrow turns 180° from left (270°) to right (90°). A constant +90° would wrongly give “up”.',
          ids: ['dots', 'arrow'], val: (p) => p.a, f: (i, s) => (i === 0 ? s[0].a : ang(s[i - 1].a + 90 * s[i - 1].d)) },
        { text: 'The white square moves one corner clockwise each frame: TL → TR → BR → BL → TL → TR.',
          ids: ['sq'], val: (p) => p.s, f: (i) => CORNERS_CW[i % 4] },
      ],
    },

    /* ----- hard set added later ----- */
    {
      id: 'A17', level: 'Hard', family: ['Linked movement', 'Rotation (anticlockwise 135°)'],
      title: 'Spin and orbit',
      build: (p) => [
        { id: 'circ', t: 'shape', shape: 'circle', at: C(p.c), r: 11, fill: 'b' },
        { id: 'sq', t: 'shape', shape: 'square', at: C(p.s), r: 10, fill: 'g' },
        { id: 'arrow', t: 'arrow', at: C(4), r: 15, rot: p.a },
      ],
      seq: (i) => ({ c: CORNERS_CW[i % 4], s: CORNERS_CW[(i + 2) % 4], a: ang(-135 * i) }),
      options: [{ c: 2, s: 6, a: 45 }, { c: 6, s: 2, a: 45 }, { c: 2, s: 6, a: 315 }, { c: 8, s: 0, a: 45 }, { c: 2, s: 6, a: 90 }],
      ans: 0,
      rules: [
        { text: 'The black circle moves one corner clockwise each frame: top-left → top-right → bottom-right → bottom-left → top-left → top-right.',
          ids: ['circ'], val: (p) => p.c, f: (i) => CORNERS_CW[i % 4] },
        { text: 'The grey square always sits in the corner diagonally opposite the circle, so it also moves clockwise: bottom-right → bottom-left → top-left → top-right → bottom-right → bottom-left.',
          ids: ['sq'], val: (p) => p.s, f: (i) => CORNERS_CW[(i + 2) % 4] },
        { text: 'The arrow turns 135° ANTICLOCKWISE each frame: up → down-left → right → up-left → down → up-right. Turning 135° clockwise from “down” would give up-left, which is the trap.',
          ids: ['arrow'], val: (p) => p.a, f: (i) => ang(-135 * i) },
      ],
    },
    {
      id: 'A18', level: 'Hard', family: ['Counting (sum of previous two)', 'Property rule (odd/even)'],
      title: 'Adding up',
      build: (p) => [
        { id: 'circ', t: 'shape', shape: 'circle', at: [60, 48], r: 26, fill: p.f },
        { id: 'dots', t: 'dots', at: [60, 100], n: p.n, r: 4, gap: 12, fill: 'b' },
      ],
      seq: (i) => { const n = [1, 1, 2, 3, 5, 8][i]; return { n, f: n % 2 ? 'b' : 'w' }; },
      options: [{ n: 8, f: 'w' }, { n: 7, f: 'b' }, { n: 8, f: 'b' }, { n: 6, f: 'w' }, { n: 9, f: 'b' }],
      ans: 0,
      rules: [
        { text: 'Each dot count is the sum of the two before it: 1, 1, 2 (1+1), 3 (1+2), 5 (2+3) → 3 + 5 = 8. The gaps between counts grow (0, 1, 1, 2), so guessing “+1” or “+2” gives the 6 and 7 traps.',
          ids: ['dots'], val: (p) => p.n, f: (i) => [1, 1, 2, 3, 5, 8][i] },
        { text: 'The circle is black when the number of dots is odd and white when it is even. 8 is even, so the circle is white.',
          ids: ['dots', 'circ'], val: (p) => p.f === (p.n % 2 ? 'b' : 'w'), f: () => true },
      ],
    },
    {
      id: 'A19', level: 'Hard', family: ['Movement (growing step)', 'Shading (back and forth)'],
      title: 'Speeding walker',
      build: (p) => [
        { id: 'dot', t: 'shape', shape: 'circle', at: C(p.d), r: 9, fill: 'b' },
        { id: 'sq', t: 'shape', shape: 'square', at: C(4), r: 14, fill: p.f },
      ],
      seq: (i) => ({ d: PERIM_CW[((i * (i + 1)) / 2) % 8], f: ['w', 'g', 'b', 'g', 'w', 'g'][i] }),
      options: [{ d: 3, f: 'g' }, { d: 6, f: 'g' }, { d: 3, f: 'b' }, { d: 3, f: 'w' }, { d: 5, f: 'g' }],
      ans: 0,
      rules: [
        { text: 'The dot walks clockwise around the outer ring, taking one more step each time: top-left → top-middle (1 step) → middle-right (2) → bottom-left (3) → top-right (4). Next it takes 5 steps: middle-right, bottom-right, bottom-middle, bottom-left, middle-left.',
          ids: ['dot'], val: (p) => p.d, f: (i) => PERIM_CW[((i * (i + 1)) / 2) % 8] },
        { text: 'The square goes white → grey → black and then comes back: grey, white, grey. It bounces rather than restarting, so frame 6 is grey, not black.',
          ids: ['sq'], val: (p) => p.f, f: (i) => ['w', 'g', 'b', 'g', 'w', 'g'][i] },
      ],
    },
    {
      id: 'A20', level: 'Hard', family: ['Instruction (colour sets direction)', 'Counting (+2, −1)'],
      title: 'Traffic light',
      build: (p) => [
        { id: 'sq', t: 'shape', shape: 'square', at: [18, 18], r: 9, fill: p.f },
        { id: 'arrow', t: 'arrow', at: [60, 58], r: 24, rot: p.a },
        { id: 'dots', t: 'dots', at: [60, 108], n: p.n, r: 3.5, gap: 10, fill: 'b' },
      ],
      seq: (i) => ({ f: ['b', 'w', 'w', 'b', 'w', 'b'][i], a: [0, 90, 0, 270, 0, 270][i], n: Math.floor(i / 2) + 1 + (i % 2 ? 2 : 0) }),
      options: [{ f: 'b', a: 270, n: 5 }, { f: 'b', a: 90, n: 5 }, { f: 'b', a: 0, n: 5 }, { f: 'b', a: 270, n: 2 }, { f: 'b', a: 270, n: 4 }],
      ans: 0,
      rules: [
        { text: 'The arrow’s turns look random (+90°, −90°, −90°, +90°). The small square is an instruction: if it is black, the arrow turns 90° clockwise in the next frame; if it is white, 90° anticlockwise. Frame 5 has a white square, so the arrow turns from up to left. (The square in frame 6 is the same in every option, so ignore it.)',
          ids: ['sq', 'arrow'], val: (p) => p.a, f: (i, s) => (i === 0 ? s[0].a : ang(s[i - 1].a + (s[i - 1].f === 'b' ? 90 : -90))) },
        { text: 'The dots go +2, −1, +2, −1: 1, 3, 2, 4, 3 → 5.',
          ids: ['dots'], val: (p) => p.n, f: (i) => Math.floor(i / 2) + 1 + (i % 2 ? 2 : 0) },
      ],
    },
    {
      id: 'A21', level: 'Hard', family: ['Interleaved series', 'Rotation (two speeds)'],
      title: 'Alternating arrows',
      build: (p) => [
        { id: 'arrow', t: 'arrow', at: [60, 54], r: 28, rot: p.a },
        { id: 'dots', t: 'dots', at: [60, 106], n: p.n, r: 4, gap: 12, fill: 'b' },
      ],
      seq: (i) => ({ a: i % 2 ? 180 - 45 * ((i - 1) / 2) : 90 * (i / 2), n: i % 2 ? (i + 1) / 2 : 3 }),
      options: [{ a: 90, n: 3 }, { a: 270, n: 3 }, { a: 135, n: 3 }, { a: 90, n: 4 }, { a: 90, n: 2 }],
      ans: 0,
      rules: [
        { text: 'Split the strip into two series. Frames 1, 3, 5 always have 3 dots. Frames 2, 4, 6 count 1, 2 → 3 dots.',
          ids: ['dots'], val: (p) => p.n, f: (i) => (i % 2 ? (i + 1) / 2 : 3) },
        { text: 'In frames 1, 3, 5 the arrow turns 90° clockwise (up, right, down). In frames 2, 4, 6 it turns 45° ANTICLOCKWISE: down → down-right → right. Continuing the odd series instead gives “left”, the trap.',
          ids: ['arrow'], val: (p) => p.a, f: (i) => (i % 2 ? 180 - 45 * ((i - 1) / 2) : 90 * (i / 2)) },
      ],
    },
    {
      id: 'A22', level: 'Hard', family: ['Counting (two counts)', 'Random positions (distractor)'],
      title: 'Crowd count',
      build: (p) => p.items.map(([cell, f], k) => ({ id: 'c' + k, t: 'shape', shape: 'circle', at: C(cell), r: 11, fill: f })),
      seq: (i) => ({ items: [
        [[0, 'b'], [4, 'w'], [8, 'w']],
        [[1, 'w'], [3, 'b'], [5, 'w'], [7, 'w']],
        [[0, 'w'], [2, 'b'], [4, 'w'], [6, 'b'], [8, 'w']],
        [[0, 'b'], [1, 'w'], [3, 'w'], [5, 'w'], [7, 'b'], [8, 'w']],
        [[0, 'w'], [1, 'b'], [2, 'w'], [3, 'b'], [5, 'w'], [6, 'w'], [8, 'b']],
        [[0, 'b'], [1, 'w'], [2, 'w'], [3, 'w'], [5, 'b'], [6, 'w'], [7, 'b'], [8, 'w']],
      ][i] }),
      options: [
        { items: [[0, 'b'], [1, 'w'], [2, 'w'], [3, 'w'], [5, 'b'], [6, 'w'], [7, 'b'], [8, 'w']] },
        { items: [[0, 'w'], [1, 'b'], [2, 'w'], [3, 'b'], [5, 'w'], [6, 'b'], [7, 'w'], [8, 'b']] },
        { items: [[0, 'b'], [2, 'w'], [3, 'w'], [4, 'b'], [6, 'w'], [7, 'b'], [8, 'w']] },
        { items: [[0, 'w'], [1, 'w'], [2, 'b'], [3, 'w'], [5, 'w'], [6, 'b'], [7, 'w'], [8, 'w']] },
        { items: [[0, 'b'], [1, 'w'], [2, 'w'], [3, 'w'], [4, 'w'], [5, 'b'], [6, 'w'], [7, 'b'], [8, 'w']] },
      ],
      ans: 0,
      rules: [
        { text: 'Ignore where the circles are: their positions change with no pattern. Count them instead. The total rises by one each frame: 3, 4, 5, 6, 7 → 8.',
          ids: ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'], val: (p) => p.items.length, f: (i) => 3 + i },
        { text: 'The number of BLACK circles rises by one every second frame: 1, 1, 2, 2, 3 → 3.',
          ids: ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'], val: (p) => p.items.filter((x) => x[1] === 'b').length, f: (i) => Math.floor(i / 2) + 1 },
      ],
    },
    {
      id: 'A23', level: 'Hard', family: ['Shading (two directions)', 'Interleaved series'],
      title: 'Opposite quarters',
      build: (p) => [
        { id: 'quad', t: 'quad', fills: p.q.split('') },
        { id: 'mid', t: 'shape', shape: 'poly', n: p.n, at: [60, 60], r: 15, fill: 'w', rot: p.n === 4 ? 45 : 0 },
      ],
      seq: (i) => ({ q: [0, 1, 2, 3].map((j) => (j === i % 4 ? 'b' : j === mod(1 - i, 4) ? 'g' : 'w')).join(''), n: i % 2 ? 4 + (i - 1) / 2 : 3 }),
      options: [{ q: 'gbww', n: 6 }, { q: 'bgww', n: 6 }, { q: 'gbww', n: 3 }, { q: 'wbgw', n: 6 }, { q: 'gbww', n: 4 }],
      ans: 0,
      rules: [
        { text: 'The black quarter moves clockwise: top-left → top-right → bottom-right → bottom-left → top-left → top-right.',
          ids: ['quad'], val: (p) => p.q.indexOf('b'), f: (i) => i % 4 },
        { text: 'The grey quarter moves the OTHER way, anticlockwise: top-right → top-left → bottom-left → bottom-right → top-right → top-left.',
          ids: ['quad'], val: (p) => p.q.indexOf('g'), f: (i) => mod(1 - i, 4) },
        { text: 'The centre shape has two series: frames 1, 3, 5 always show a triangle, while frames 2, 4, 6 add a side each time (square, pentagon → hexagon).',
          ids: ['mid'], val: (p) => p.n, f: (i) => (i % 2 ? 4 + (i - 1) / 2 : 3) },
      ],
    },
    {
      id: 'A24', level: 'Hard', family: ['Instruction (sides become dots)', 'Property rule (odd/even)'],
      title: 'Sides to dots',
      build: (p) => [
        { id: 'poly', t: 'shape', shape: 'poly', n: p.n, at: [60, 52], r: 30, fill: p.f, rot: p.n === 4 ? 45 : 0 },
        { id: 'dots', t: 'dots', at: [60, 106], n: p.d, r: 3.5, gap: 10, fill: 'b' },
      ],
      seq: (i) => { const n = [5, 3, 6, 4, 5, 4][i]; return { n, d: [2, 5, 3, 6, 4, 5][i], f: n % 2 ? 'w' : 'g' }; },
      options: [{ n: 4, f: 'g', d: 5 }, { n: 4, f: 'w', d: 5 }, { n: 4, f: 'g', d: 4 }, { n: 4, f: 'g', d: 6 }, { n: 4, f: 'w', d: 4 }],
      ans: 0,
      rules: [
        { text: 'The number of dots copies the number of sides of the shape in the PREVIOUS frame: pentagon → 5 dots, triangle → 3 dots, hexagon → 6, square → 4. Frame 5 shows a pentagon, so frame 6 has 5 dots. (Counting the sides of the shape in the same frame gives the 4-dot trap.)',
          ids: ['poly', 'dots'], val: (p) => p.d, f: (i, s) => (i === 0 ? s[0].d : s[i - 1].n) },
        { text: 'Shapes with an even number of sides are grey and shapes with an odd number are white. Every option shows a square (4 sides), so it must be grey.',
          ids: ['poly'], val: (p) => p.f === (p.n % 2 ? 'w' : 'g'), f: () => true },
      ],
    },
  ];

  /* ---------- NUMERICAL REASONING ---------- */
  const datasets = {
    ev: {
      title: 'New electric car registrations (thousands) and population',
      note: 'Illustrative figures for practice.',
      kind: 'table',
      cols: ['Country', '2023', '2024', '2025', 'Population 2025 (millions)'],
      rows: [
        ['Germany', 524, 381, 545, 83.6],
        ['France', 298, 291, 312, 68.6],
        ['Netherlands', 113, 125, 134, 18.0],
        ['Sweden', 112, 97, 104, 10.6],
        ['Poland', 19, 24, 36, 36.6],
      ],
    },
    budget: {
      title: 'Programme budget by area (€ million)',
      note: 'Illustrative figures for practice.',
      kind: 'table',
      cols: ['Area', '2024', '2025'],
      rows: [
        ['Research', 1240, 1380],
        ['Digital', 620, 710],
        ['Climate', 980, 1050],
        ['Education', 450, 430],
        ['Health', 310, 330],
        ['Total', 3600, 3900],
      ],
    },
    hotel: {
      title: 'Business travel: hotel price per night and exchange rates',
      note: 'Illustrative figures for practice. Exchange rate = units of local currency per €1.',
      kind: 'table',
      cols: ['City', 'Price per night (local)', 'Currency', 'Rate per €1'],
      rows: [
        ['Stockholm', 1450, 'SEK', 11.5],
        ['Warsaw', 520, 'PLN', 4.25],
        ['Budapest', 46000, 'HUF', 395],
        ['Prague', 3100, 'CZK', 25.0],
        ['Copenhagen', 1150, 'DKK', 7.46],
      ],
    },
    tram: {
      title: 'Average daily tram passengers in a city (thousands)',
      note: 'Illustrative figures for practice.',
      kind: 'bar',
      labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
      values: [82, 95, 118, 126, 131, 144],
    },

    gen: {
      title: 'Electricity generation by source in a member state (TWh)',
      note: 'Illustrative figures for practice.',
      kind: 'table',
      cols: ['Source', '2023', '2025'],
      rows: [
        ['Wind', 82, 104],
        ['Solar', 41, 63],
        ['Hydro', 24, 21],
        ['Gas', 96, 71],
        ['Nuclear', 57, 59],
        ['Total', 300, 318],
      ],
    },
    staff: {
      title: 'Staff of an EU agency by function, 2025',
      note: 'Illustrative figures for practice.',
      kind: 'table',
      cols: ['Function', 'Staff', 'Women (%)', 'Average monthly cost per staff member (€)'],
      rows: [
        ['Policy', 240, 55, 9800],
        ['Legal', 80, 65, 10400],
        ['IT', 150, 30, 9200],
        ['Finance', 90, 60, 8600],
        ['Admin', 140, 70, 6900],
      ],
    },
  };
  const row = (ds, name) => datasets[ds].rows.find((r) => r[0] === name);
  const pct = (x, d = 1) => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(d) + '%';

  // compute(): returns the exact value; fmt(): turns it into the option text.
  const numerical = [
    {
      id: 'N1', ds: 'ev',
      q: 'By approximately what percentage did new electric car registrations in Germany change between 2024 and 2025?',
      options: ['+4.0%', '+30.1%', '+43.0%', '+23.2%', '−30.1%'],
      compute: () => { const r = row('ev', 'Germany'); return (r[3] - r[2]) / r[2] * 100; },
      fmt: (v) => pct(v),
      explain: 'Percentage change = (new − old) ÷ old. (545 − 381) ÷ 381 = 164 ÷ 381 ≈ 0.430, so +43.0%. Dividing by the new value (545) gives the 30.1% trap; comparing 2023 with 2025 gives the 4.0% trap.',
    },
    {
      id: 'N2', ds: 'ev',
      q: 'In 2025, which country had the highest number of new electric car registrations per 1,000 inhabitants?',
      options: ['Germany', 'France', 'Netherlands', 'Sweden', 'Poland'],
      compute: () => {
        const r = datasets.ev.rows.map((x) => [x[0], x[3] / x[4]]);
        return r.sort((a, b) => b[1] - a[1])[0][0];
      },
      fmt: (v) => v,
      explain: 'Thousands of cars ÷ millions of people gives cars per 1,000 people. Sweden 104 ÷ 10.6 ≈ 9.8; Netherlands 134 ÷ 18.0 ≈ 7.4; Germany 545 ÷ 83.6 ≈ 6.5; France ≈ 4.5; Poland ≈ 1.0. Germany has the most cars in absolute terms, which is the trap.',
    },
    {
      id: 'N3', ds: 'ev',
      q: 'By approximately what percentage did total registrations across the five countries change between 2023 and 2025?',
      options: ['+6.1%', '+5.7%', '+8.4%', '+4.2%', '+65.0%'],
      compute: () => {
        const s = (k) => datasets.ev.rows.reduce((a, r) => a + r[k], 0);
        return (s(3) - s(1)) / s(1) * 100;
      },
      fmt: (v) => pct(v),
      explain: 'Total 2023 = 524 + 298 + 113 + 112 + 19 = 1,066. Total 2025 = 545 + 312 + 134 + 104 + 36 = 1,131. Change = 65 ÷ 1,066 ≈ +6.1%. Dividing by 1,131 gives the 5.7% trap.',
    },
    {
      id: 'N4', ds: 'ev',
      q: 'If Poland’s registrations keep rising every year by the same absolute number as between 2024 and 2025, in which year will they first exceed 100,000?',
      options: ['2028', '2029', '2030', '2031', '2032'],
      compute: () => { const r = row('ev', 'Poland'); const step = r[3] - r[2]; let v = r[3], y = 2025; while (v <= 100) { v += step; y++; } return String(y); },
      fmt: (v) => v,
      explain: 'The 2024–2025 increase is 36 − 24 = 12 thousand. 2026: 48, 2027: 60, 2028: 72, 2029: 84, 2030: 96, 2031: 108. So 2031. Using the percentage growth (+50% a year) instead would give 2028, the trap.',
    },
    {
      id: 'N5', ds: 'budget',
      q: 'What share of the total 2025 budget was allocated to Climate?',
      options: ['25.0%', '26.9%', '27.2%', '28.0%', '29.2%'],
      compute: () => row('budget', 'Climate')[2] / row('budget', 'Total')[2] * 100,
      fmt: (v) => v.toFixed(1) + '%',
      explain: '1,050 ÷ 3,900 ≈ 0.269 = 26.9%. 27.2% is the 2024 share (980 ÷ 3,600); 29.2% mixes the 2025 amount with the 2024 total.',
    },
    {
      id: 'N6', ds: 'budget',
      q: 'By how many percentage points did Research’s share of the total budget change from 2024 to 2025?',
      options: ['+11.3 pp', '−0.9 pp', '+2.7 pp', '+0.9 pp', '+3.9 pp'],
      compute: () => row('budget', 'Research')[2] / 3900 * 100 - row('budget', 'Research')[1] / 3600 * 100,
      fmt: (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + ' pp',
      explain: '2024 share: 1,240 ÷ 3,600 = 34.4%. 2025 share: 1,380 ÷ 3,900 = 35.4%. Difference ≈ +0.9 percentage points. +11.3 is the percentage growth of the Research amount itself (140 ÷ 1,240), not a change in share.',
    },
    {
      id: 'N7', ds: 'budget',
      q: 'The total budget for 2026 will be 5% higher than in 2025, and Education will keep the same share of the total as in 2025. How much will Education receive in 2026?',
      options: ['€430.0m', '€472.5m', '€409.5m', '€435.0m', '€451.5m'],
      compute: () => row('budget', 'Education')[2] * 1.05,
      fmt: (v) => '€' + v.toFixed(1) + 'm',
      explain: 'Same share of a total that grows 5% means Education also grows 5%: 430 × 1.05 = €451.5m. Using the 2024 amount (450 × 1.05 = 472.5) is the trap.',
    },
    {
      id: 'N8', ds: 'hotel',
      q: 'Converted into euro, in which city is the hotel cheapest per night?',
      options: ['Budapest', 'Stockholm', 'Warsaw', 'Prague', 'Copenhagen'],
      compute: () => datasets.hotel.rows.map((r) => [r[0], r[1] / r[3]]).sort((a, b) => a[1] - b[1])[0][0],
      fmt: (v) => v,
      explain: 'Divide each price by its rate: Stockholm 126.1, Warsaw 122.4, Budapest 116.5, Prague 124.0, Copenhagen 154.2 (€). Budapest is cheapest even though its local price looks highest.',
    },
    {
      id: 'N9', ds: 'hotel',
      q: 'A staff member stays 3 nights in Warsaw and then 2 nights in Prague. What is the total hotel cost, to the nearest euro?',
      options: ['€615', '€595', '€617', '€640', '€572'],
      compute: () => 3 * (520 / 4.25) + 2 * (3100 / 25),
      fmt: (v) => '€' + Math.round(v),
      explain: 'Warsaw: 520 ÷ 4.25 = €122.35 × 3 = €367.06. Prague: 3,100 ÷ 25 = €124.00 × 2 = €248.00. Total ≈ €615. Swapping the nights (2 Warsaw, 3 Prague) gives €617, the trap.',
    },
    {
      id: 'N10', ds: 'hotel',
      q: 'The forint (HUF) weakens so that €1 buys 10% more forints than shown. The Budapest hotel keeps its price in HUF. What is its new price per night in euro?',
      options: ['€104.8', '€116.5', '€128.1', '€95.3', '€105.9'],
      compute: () => 46000 / (395 * 1.1),
      fmt: (v) => '€' + v.toFixed(1),
      explain: 'New rate = 395 × 1.10 = 434.5 HUF per €1. 46,000 ÷ 434.5 ≈ €105.9. Simply cutting the old euro price by 10% (116.5 × 0.9 = 104.8) is wrong, because dividing by 1.1 is not the same as multiplying by 0.9.',
    },
    {
      id: 'N11', ds: 'tram',
      q: 'In which year was the percentage increase in passengers compared with the previous year the largest?',
      options: ['2021', '2022', '2023', '2024', '2025'],
      compute: () => { const v = datasets.tram.values; let best = 1, g = -1; for (let k = 1; k < v.length; k++) { const x = v[k] / v[k - 1] - 1; if (x > g) { g = x; best = k; } } return datasets.tram.labels[best]; },
      fmt: (v) => v,
      explain: '2021: 95 ÷ 82 = +15.9%. 2022: 118 ÷ 95 = +24.2%. 2023: +6.8%. 2024: +4.0%. 2025: +9.9%. The largest is 2022 (it also has the largest absolute rise, +23).',
    },
    {
      id: 'N12', ds: 'tram',
      q: 'If passenger numbers grow in 2026 by the same percentage as in 2025, roughly how many daily passengers will there be in 2026 (thousands)?',
      options: ['157.0', '151.2', '159.8', '156.0', '158.3'],
      compute: () => 144 * (144 / 131),
      fmt: (v) => v.toFixed(1),
      explain: '2025 growth = 144 ÷ 131 = 1.0992 (+9.9%). 144 × 1.0992 ≈ 158.3 thousand. Adding the same absolute rise (+13) gives 157.0, the trap.',
    },

    /* ----- hard set added later ----- */
    {
      id: 'N13', ds: 'gen', level: 'Hard',
      q: 'Wind, solar and hydro count as renewable sources. By how many percentage points did the renewable share of total generation change between 2023 and 2025?',
      options: ['+10.1 pp', '+13.7 pp', '+20.7 pp', '+27.9 pp', '+8.4 pp'],
      compute: () => { const g = (k) => ['Wind', 'Solar', 'Hydro'].reduce((a, n) => a + row('gen', n)[k], 0); return g(2) / row('gen', 'Total')[2] * 100 - g(1) / row('gen', 'Total')[1] * 100; },
      fmt: (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + ' pp',
      explain: 'Renewables 2023: 82 + 41 + 24 = 147 of 300 = 49.0%. Renewables 2025: 104 + 63 + 21 = 188 of 318 = 59.1%. Change = +10.1 percentage points. 27.9 is the growth of renewable output itself (188 ÷ 147), 20.7 is the relative change of the share (59.1 ÷ 49.0), and 13.7 comes from dividing 188 by the 2023 total.',
    },
    {
      id: 'N14', ds: 'gen', level: 'Hard',
      q: 'Assume solar generation grew by the same percentage in each year from 2023 to 2025. What was that annual growth rate?',
      options: ['26.8%', '24.0%', '53.7%', '22.0%', '25.6%'],
      compute: () => (Math.sqrt(row('gen', 'Solar')[2] / row('gen', 'Solar')[1]) - 1) * 100,
      fmt: (v) => v.toFixed(1) + '%',
      explain: 'Over two years solar grew by a factor of 63 ÷ 41 = 1.5366. The annual factor is the square root: √1.5366 = 1.2396, so 24.0% a year. Check: 41 × 1.24 × 1.24 ≈ 63. Halving the total growth (53.7% ÷ 2 = 26.8%) ignores compounding.',
    },
    {
      id: 'N15', ds: 'gen', level: 'Hard',
      q: 'In 2025 gas plants emitted on average 0.37 tonnes of CO2 per MWh generated. How much CO2 did gas generation emit in 2025? (1 TWh = 1,000,000 MWh)',
      options: ['263 million t', '2.6 million t', '35.5 million t', '26.3 thousand t', '26.3 million t'],
      compute: () => row('gen', 'Gas')[2] * 0.37,
      fmt: (v) => v.toFixed(1) + ' million t',
      explain: '71 TWh = 71 million MWh. 71 million × 0.37 t = 26.27 million tonnes ≈ 26.3 million t. 35.5 million t uses the 2023 figure (96 TWh); the other options get the units wrong by a factor of 10 or 1,000.',
    },
    {
      id: 'N16', ds: 'gen', level: 'Hard',
      q: 'In 2026 wind generation is expected to be 15% higher than in 2025 and to make up 40% of total generation. What total generation in 2026 does this imply?',
      options: ['260.0 TWh', '318.0 TWh', '365.7 TWh', '299.0 TWh', '287.5 TWh'],
      compute: () => row('gen', 'Wind')[2] * 1.15 / 0.4,
      fmt: (v) => v.toFixed(1) + ' TWh',
      explain: 'Wind 2026 = 104 × 1.15 = 119.6 TWh. If that is 40% of the total, the total is 119.6 ÷ 0.40 = 299.0 TWh. Forgetting the 15% growth gives 104 ÷ 0.4 = 260.0; growing the 2025 total by 15% gives 365.7.',
    },
    {
      id: 'N17', ds: 'staff', level: 'Hard',
      q: 'What percentage of the agency’s staff are women?',
      options: ['56.0%', '45.6%', '55.0%', '52.4%', '54.4%'],
      compute: () => { const r = datasets.staff.rows; return r.reduce((a, x) => a + x[1] * x[2] / 100, 0) / r.reduce((a, x) => a + x[1], 0) * 100; },
      fmt: (v) => v.toFixed(1) + '%',
      explain: 'Weight each percentage by staff numbers. Women: 132 (Policy) + 52 (Legal) + 45 (IT) + 54 (Finance) + 98 (Admin) = 381 of 700 = 54.4%. A simple average of the five percentages gives 56.0%, which is wrong because the functions differ in size. 45.6% is the share of men.',
    },
    {
      id: 'N18', ds: 'staff', level: 'Hard',
      q: 'What is the agency’s total staff cost for a full year?',
      options: ['€6.3m', '€75.4m', '€75.6m', '€62.9m', '€90.8m'],
      compute: () => datasets.staff.rows.reduce((a, x) => a + x[1] * x[3], 0) * 12,
      fmt: (v) => '€' + (v / 1e6).toFixed(1) + 'm',
      explain: 'Monthly cost per function: 240 × 9,800 = 2,352,000; 80 × 10,400 = 832,000; 150 × 9,200 = 1,380,000; 90 × 8,600 = 774,000; 140 × 6,900 = 966,000. Total €6,304,000 a month × 12 = €75.6m. Using the simple average cost (€8,980) × 700 × 12 gives €75.4m, close but wrong; €6.3m is one month only.',
    },
    {
      id: 'N19', ds: 'staff', level: 'Hard',
      q: 'The agency must cut its total monthly staff cost by at least 5% and will do so only by reducing the number of Admin staff. What is the smallest number of Admin posts it must cut?',
      options: ['7', '35', '45', '46', '52'],
      compute: () => String(Math.ceil(datasets.staff.rows.reduce((a, x) => a + x[1] * x[3], 0) * 0.05 / row('staff', 'Admin')[3])),
      fmt: (v) => v,
      explain: 'Monthly cost is €6,304,000 (see the previous question); 5% of that is €315,200. Each Admin post costs €6,900, so 315,200 ÷ 6,900 = 45.7 posts. Cutting 45 is not enough, so at least 46. 35 is 5% of all staff and 7 is 5% of Admin staff.',
    },
    {
      id: 'N20', ds: 'staff', level: 'Hard',
      q: 'If 20 women join the IT function and nobody leaves, what percentage of IT staff will be women?',
      options: ['43.3%', '50.0%', '38.2%', '32.4%', '41.2%'],
      compute: () => { const r = row('staff', 'IT'); return (r[1] * r[2] / 100 + 20) / (r[1] + 20) * 100; },
      fmt: (v) => v.toFixed(1) + '%',
      explain: 'Women in IT now: 30% of 150 = 45. After 20 join: 65 women out of 170 staff = 38.2%. Dividing by the old total (65 ÷ 150) gives 43.3%; adding 20 percentage points gives 50.0%.',
    },
    {
      id: 'N21', ds: 'ev', level: 'Hard',
      q: 'In 2025, how much higher, in percentage terms, were Germany’s new electric car registrations per 1,000 inhabitants than France’s?',
      options: ['74.7%', '30.2%', '21.9%', '43.3%', '47.5%'],
      compute: () => { const pc = (n) => row('ev', n)[3] / row('ev', n)[4]; return (pc('Germany') / pc('France') - 1) * 100; },
      fmt: (v) => v.toFixed(1) + '%',
      explain: 'Germany: 545 ÷ 83.6 = 6.52 per 1,000. France: 312 ÷ 68.6 = 4.55 per 1,000. 6.52 ÷ 4.55 = 1.433, so 43.3% higher. Comparing absolute registrations gives 74.7%; dividing by Germany’s figure instead of France’s gives 30.2%.',
    },
    {
      id: 'N22', ds: 'tram', level: 'Hard',
      q: 'Assuming the same percentage growth every year, what was the average annual growth rate of daily passengers from 2020 to 2025?',
      options: ['15.1%', '75.6%', '11.9%', '9.9%', '13.4%'],
      compute: () => (Math.pow(144 / 82, 1 / 5) - 1) * 100,
      fmt: (v) => v.toFixed(1) + '%',
      explain: '2020 to 2025 is 5 years of growth, not 6. Total factor 144 ÷ 82 = 1.756. Annual factor = 1.756^(1/5) = 1.119, so 11.9% a year. Dividing the total growth (75.6%) by 5 gives 15.1%, which ignores compounding; 9.9% is the 2025 growth alone.',
    },
  ];
  numerical.forEach((q) => { q.level = q.level || 'Standard'; q.ans = q.options.indexOf(q.fmt(q.compute())); });

  /* ---------- VERBAL REASONING ---------- */
  // v: verdict for each option: 'T' true (the answer), 'F' contradicted by the text, 'C' cannot tell from the text.
  const passages = {
    heat: { title: 'Urban heat islands', text: 'Cities are often several degrees warmer than the surrounding countryside, a phenomenon known as the urban heat island effect. Dark surfaces such as asphalt and roofing absorb solar radiation during the day and release it slowly at night, which is why the temperature difference is usually greatest after sunset. Dense building layouts also reduce air circulation. Studies in several European capitals have found that neighbourhoods with more than 30% tree cover experienced noticeably lower peak temperatures during heatwaves than comparable areas with little vegetation. Some municipalities have responded by introducing reflective “cool roof” requirements for new buildings, while others prioritise planting programmes. Critics of cool roofs point out that their benefit is reduced in winter, when absorbed heat would otherwise lower heating demand. Nonetheless, with heatwaves becoming more frequent, local authorities face growing pressure to adapt their urban design.' },
    remote: { title: 'Remote work and the regions', text: 'Between 2019 and 2023 the share of employees in the EU who usually or sometimes worked from home rose substantially, although the increase was uneven across member states and sectors. Jobs in information and communication and in finance were the most likely to be performed remotely, whereas roles in construction, retail and health care largely required physical presence. Some rural regions hoped that remote work would attract skilled residents from cities. Early evidence suggests that most remote workers who relocated moved to suburbs or smaller towns within commuting distance of their employer rather than to remote rural areas, possibly because many employers adopted hybrid arrangements that still required occasional office attendance. Broadband quality also remains a constraint in parts of the countryside.' },
    bees: { title: 'Pollinators', text: 'Around three quarters of the world’s leading food crop types benefit to some degree from animal pollination, although these crops account for a smaller share of total food production by volume, because staple cereals such as wheat and rice are mainly wind-pollinated. Wild pollinators, including many species of solitary bee, hoverfly and butterfly, are in decline in Europe. The main drivers identified by researchers include habitat loss, intensive agriculture, pesticide use and climate change. Managed honeybees cannot fully compensate for this loss: they are effective generalists but pollinate some crops, such as certain fruit varieties, less efficiently than specialised wild species. Measures such as flower strips along field margins have been shown to increase local pollinator numbers, but their effect on crop yields varies considerably depending on the landscape.' },
    night: { title: 'Night trains', text: 'After decades of decline, several European rail operators have reintroduced or expanded overnight train services since the late 2010s. Supporters argue that night trains offer a lower-carbon alternative to short-haul flights, particularly on routes of 800 to 1,500 kilometres, where a traveller can depart in the evening and arrive in the morning without paying for a hotel. However, operators face structural difficulties. Sleeper carriages carry fewer passengers than day coaches, rolling stock is expensive and in short supply, and track access charges differ from country to country, complicating cross-border pricing. Some services have been suspended after only a few seasons. Proponents say that a level playing field with aviation, for example through fuel taxation, would make the services more viable, whereas sceptics doubt that demand will ever be large enough to cover costs without permanent subsidies.' },
    lang: { title: 'Language learning in schools', text: 'In most EU countries, learning at least one foreign language is compulsory for pupils from primary school onwards, and many education systems require a second foreign language at lower secondary level. English is by far the most commonly studied foreign language. Researchers note, however, that an early start does not by itself guarantee higher proficiency. The number of teaching hours, the qualifications of teachers and pupils’ exposure to the language outside school, for instance through subtitled television, appear to matter at least as much. In countries where foreign films and programmes are subtitled rather than dubbed, adults tend to report better self-assessed language skills, although this correlation may also reflect other differences between those countries.' },
    tyre: { title: 'Tyre wear particles', text: 'Tyre wear is considered one of the largest sources of microplastic emissions to the environment. As vehicles brake, accelerate and corner, small particles abrade from the tread and are deposited on roads, from where rain can carry them into soils, rivers and eventually the sea. Unlike exhaust emissions, tyre wear is produced by all road vehicles, including electric cars. Because electric vehicles are typically heavier than comparable combustion-engine models, some analysts expect them to generate somewhat more tyre particles, although driving style and tyre design also have a strong influence. New EU vehicle emission standards include, for the first time, limits on particle emissions from tyres and brakes, with some test methods still being finalised.' },
    eci: { title: 'The European Citizens’ Initiative', text: 'The European Citizens’ Initiative allows citizens to invite the European Commission to propose legislation on a matter within its powers. An initiative must collect at least one million signatures from EU citizens, with minimum thresholds reached in at least seven member states. Once an initiative succeeds, the Commission must respond, setting out what action, if any, it intends to take and its reasons. It is not, however, obliged to propose legislation. Since the instrument became available in 2012, only a small proportion of registered initiatives have reached the signature threshold. Supporters argue that even unsuccessful initiatives can raise public awareness of an issue, while critics contend that the limited legislative follow-up has disappointed many organisers.' },
    food: { title: 'Household food waste', text: 'Households are responsible for more than half of the food wasted in the EU, according to recent estimates, with the remainder arising in processing, retail, restaurants and primary production. Much household waste is avoidable: food is bought in excessive quantities, stored incorrectly or discarded because of confusion over date labels. “Use by” dates relate to safety and should be respected, whereas “best before” dates indicate quality, meaning food is often still safe to eat after the date has passed. Awareness campaigns have had mixed results. Studies suggest that combining information with practical changes, such as smaller portion sizes or redesigned packaging, tends to be more effective than information alone.' },
    phish: { title: 'Phishing', text: 'Phishing remains one of the most common ways in which attackers gain access to organisations’ systems. Rather than exploiting technical vulnerabilities, phishing relies on persuading people to click a link, open an attachment or disclose credentials. Increasingly, messages are tailored to specific individuals using information gathered from public sources, a practice known as spear phishing, which makes them harder to recognise. Many organisations run simulated phishing exercises to train staff. Evidence on their effectiveness is mixed: click rates often fall after training, but the improvement can fade within months unless exercises are repeated. Technical measures such as multi-factor authentication do not prevent people from clicking malicious links, but they can limit the damage when passwords are stolen.' },
    age: { title: 'An ageing population', text: 'The EU’s population is ageing: the proportion of people aged 65 and over has been rising for decades and is projected to continue increasing, while the working-age population is expected to shrink in many member states. This shift puts pressure on pay-as-you-go pension systems, in which current workers’ contributions finance current pensions. Governments have responded in different ways, including raising the statutory retirement age, linking it to life expectancy, and encouraging supplementary private savings. Higher employment rates among older workers and women can partly offset the effect of demographic change, as can net migration of working-age people, although economists disagree about how large these effects could be.' },

    ai: { title: 'Regulating artificial intelligence', text: 'The EU’s Artificial Intelligence Act classifies AI systems according to the risk they pose. Practices considered to present an unacceptable risk, such as social scoring, are prohibited. High-risk systems, which include certain uses in recruitment, education and the management of critical infrastructure, must meet requirements on data quality, documentation, human oversight and accuracy before they can be placed on the market. Most other systems face few or no new obligations, although providers of some systems, such as chatbots, must ensure that people are informed that they are interacting with a machine. The obligations apply in stages over several years rather than all at once. Industry groups have warned that compliance costs could weigh on smaller firms, while some civil society organisations argue that the exclusion of national security uses leaves significant gaps.' },
    reuse: { title: 'Reusing wastewater', text: 'Treated urban wastewater can be reused to irrigate crops, a practice that could reduce pressure on rivers and aquifers in drought-prone regions. EU rules that took effect in 2023 set minimum quality requirements for water reused in agricultural irrigation, with stricter standards for food crops eaten raw than for crops that are processed before consumption. Member states may nonetheless decide that reuse is not appropriate in some or all of their river basins, provided they justify this decision. At present only a small fraction of treated wastewater in the EU is reused, and the share varies widely between countries. Cost is one obstacle: additional treatment and distribution infrastructure can make reclaimed water more expensive than abstracting freshwater, particularly where abstraction charges are low.' },
    ets: { title: 'Emissions trading', text: 'Under the EU Emissions Trading System, a cap is set on the total amount of certain greenhouse gases that covered installations can emit, and the cap is reduced over time. Companies must surrender an allowance for each tonne of CO2-equivalent they emit; they receive or buy allowances and can trade them with one another. A company that emits less than its allowances cover can sell the surplus, while one that emits more must buy additional allowances or face penalties. Because the cap limits total emissions, the price of allowances is determined by supply and demand rather than set directly by the authorities. A market stability reserve adjusts the number of allowances to be auctioned when the surplus in circulation is unusually large or small. Critics argue that the free allocation of allowances to some industries weakens the incentive to cut emissions, whereas those industries contend that it protects them from competitors in countries without similar carbon costs.' },
    amr: { title: 'Antimicrobial resistance', text: 'Antimicrobial resistance occurs when bacteria, viruses, fungi and parasites change over time and no longer respond to medicines, making infections harder to treat. Although resistance arises naturally, its spread is accelerated by the misuse and overuse of antimicrobials in both human medicine and animal farming. In the EU, the use of antibiotics to promote growth in farm animals has been banned since 2006, and since 2022 their routine preventive use in groups of animals has also been restricted. Developing new antibiotics is scientifically difficult and commercially unattractive, partly because effective new drugs are likely to be held in reserve and used sparingly to slow the emergence of resistance, which limits sales. Proposals to address this include financial rewards for developers that would be paid independently of the volume sold.' },
    cohesion: { title: 'Cohesion policy regions', text: 'Under EU cohesion policy, regions whose GDP per inhabitant is below 75% of the EU average are classified as less developed and are eligible for the highest rates of EU co-financing. Regions between 75% and 100% of the average are classed as transition regions, and those above 100% as more developed regions. The classification is based on data for a reference period and is fixed for the whole programming period, so a region that grows rapidly keeps its status until the next period begins. Evaluations suggest that cohesion funding has supported growth in many recipient regions, although some studies find that its effect depends strongly on the quality of local institutions.' },
    clocks: { title: 'Changing the clocks', text: 'Since 2001 the dates on which clocks change between summer time and winter time have been harmonised across the EU. In 2018 the Commission proposed ending the seasonal change after a public consultation in which a large majority of the 4.6 million respondents favoured abolition, although the respondents were not a representative sample of the population and most came from a single member state. The European Parliament supported the proposal in 2019, but member states in the Council have not reached a common position, partly because of concerns that countries might choose different standard times and so fragment the internal market.' },
  };

  const verbal = [
    { id: 'V1', p: 'heat', opts: [
      ['The temperature gap between cities and the countryside is usually largest during the hottest part of the day.', 'F', 'The text says the difference is usually greatest after sunset.'],
      ['Some critics argue that cool roofs lose part of their advantage in colder months.', 'T', 'Stated: critics point out that their benefit is reduced in winter.'],
      ['Tree planting lowers urban temperatures more effectively than cool roofs.', 'C', 'The text describes both measures but never compares their effectiveness.'],
      ['All European capitals have introduced cool roof requirements for new buildings.', 'C', 'The text only says “some municipalities” have done so. That does not rule out all capitals, but nothing confirms it either.'] ] },
    { id: 'V2', p: 'heat', opts: [
      ['Neighbourhoods with more than 30% tree cover never become warmer than the countryside.', 'C', 'The studies found lower peak temperatures than areas with little vegetation; nothing is said about comparison with the countryside.'],
      ['Heatwaves in Europe are becoming less frequent.', 'F', 'The text says heatwaves are becoming more frequent.'],
      ['The urban heat island effect is caused mainly by vehicle emissions.', 'C', 'Vehicle emissions are not mentioned.'],
      ['Dense building layouts contribute to higher urban temperatures by limiting air movement.', 'T', 'Stated: dense building layouts “reduce air circulation” as part of the heat island explanation.'] ] },
    { id: 'V3', p: 'remote', opts: [
      ['Working from home increased by a similar amount in every member state.', 'F', 'The increase was “uneven across member states”.'],
      ['Most remote workers who relocated chose remote rural areas.', 'F', 'Most moved to suburbs or smaller towns within commuting distance, rather than to remote rural areas.'],
      ['Hybrid working arrangements may help explain why relocating remote workers stayed relatively close to their employer.', 'T', 'The text offers hybrid arrangements as a possible reason (“possibly because…”). The statement uses matching hedged wording (“may help explain”).'],
      ['Health care workers were among the most likely to work from home.', 'F', 'Health care roles “largely required physical presence”.'] ] },
    { id: 'V4', p: 'remote', opts: [
      ['Poor broadband is the main reason rural regions have not attracted remote workers.', 'C', 'Broadband is mentioned as “also” a constraint, not as the main reason.'],
      ['Rural regions have successfully attracted large numbers of skilled city residents.', 'F', 'Early evidence suggests most movers did not go to remote rural areas.'],
      ['Roles in construction largely required employees to be physically present.', 'T', 'Stated directly.'],
      ['Finance employers were the first to adopt hybrid working arrangements.', 'C', 'The text says finance jobs were among the most likely to be done remotely, but says nothing about who adopted hybrid arrangements first.'] ] },
    { id: 'V5', p: 'bees', opts: [
      ['Wheat and rice depend heavily on animal pollination.', 'F', 'They are “mainly wind-pollinated”.'],
      ['Flower strips along field margins can increase the number of pollinators in the immediate area.', 'T', 'They “have been shown to increase local pollinator numbers”.'],
      ['Honeybees pollinate every crop less efficiently than wild species.', 'F', 'Only “some crops, such as certain fruit varieties”; “every crop” overstates it.'],
      ['Pesticide use is the most important cause of wild pollinator decline.', 'C', 'It is listed among the main drivers, but not ranked above the others.'] ] },
    { id: 'V6', p: 'bees', opts: [
      ['Crops that benefit from animal pollination make up most of global food production by volume.', 'F', 'They account for “a smaller share” of production by volume.'],
      ['Flower strips reliably increase crop yields.', 'F', 'Their effect on yields “varies considerably”.'],
      ['Managed honeybees outnumber wild bees in Europe.', 'C', 'Numbers are not compared.'],
      ['Some species of hoverfly are among the wild pollinators in decline in Europe.', 'T', 'The declining wild pollinators include “many species of … hoverfly”.'] ] },
    { id: 'V7', p: 'night', opts: [
      ['Night trains are profitable on routes of 800–1,500 kilometres.', 'C', 'That range is where supporters see an advantage for travellers; profitability is not stated (if anything, the text stresses cost problems).'],
      ['All recently launched night train services are still running.', 'F', 'Some services have been suspended.'],
      ['Sleeper carriages carry more passengers than day coaches.', 'F', 'They carry fewer.'],
      ['Differences in track access charges between countries make cross-border fares harder to set.', 'T', 'Charges differ from country to country, “complicating cross-border pricing”.'] ] },
    { id: 'V8', p: 'night', opts: [
      ['Supporters see night trains as a way for travellers to avoid paying for a hotel.', 'T', 'Supporters point out that a traveller can travel overnight “without paying for a hotel”.'],
      ['Sceptics believe fuel taxation for aviation would make night trains viable.', 'F', 'That is the proponents’ view; sceptics doubt demand will ever cover costs.'],
      ['Night trains first appeared in Europe in the late 2010s.', 'F', 'Services were “reintroduced” after “decades of decline”, so they existed before.'],
      ['A shortage of rolling stock is the main reason why some services were suspended.', 'C', 'The text lists several difficulties and mentions suspensions, but gives no reason for them.'] ] },
    { id: 'V9', p: 'lang', opts: [
      ['Starting to learn a language early guarantees higher proficiency.', 'F', 'An early start “does not by itself guarantee” higher proficiency.'],
      ['Subtitling television programmes causes adults to have better language skills.', 'C', 'The text describes a correlation and warns it may reflect other differences, so a cause is not established.'],
      ['In many education systems, a second foreign language is compulsory at lower secondary level.', 'T', 'Stated: many systems require a second foreign language at that level.'],
      ['English is a compulsory subject in every EU country.', 'C', 'English is the most studied language, but the text does not say it is compulsory everywhere.'] ] },
    { id: 'V10', p: 'lang', opts: [
      ['Teaching hours matter more than starting early.', 'C', 'The text says they matter “at least as much”, which does not establish “more”.'],
      ['Adults in countries that dub foreign films tend to report better language skills.', 'F', 'Better skills are reported where films are subtitled, not dubbed.'],
      ['The qualifications of teachers may influence pupils’ language proficiency.', 'T', 'Teacher qualifications “appear to matter”; the hedged statement matches.'],
      ['In most EU countries, learning a foreign language is optional at primary school.', 'F', 'It is compulsory from primary school onwards in most EU countries.'] ] },
    { id: 'V11', p: 'tyre', opts: [
      ['Electric cars produce no tyre wear particles.', 'F', 'Tyre wear is produced by all road vehicles, including electric cars.'],
      ['Driving style influences tyre wear more than vehicle weight does.', 'C', 'Both are said to matter; they are not ranked.'],
      ['Tyre wear particles can reach the sea, carried by rain via soils and rivers.', 'T', 'Stated: rain can carry them into soils, rivers and eventually the sea.'],
      ['Tyre wear is the single largest source of microplastics in the environment.', 'C', 'It is “one of the largest” sources; whether it is the largest is not stated.'] ] },
    { id: 'V12', p: 'tyre', opts: [
      ['Earlier EU emission standards already limited particles from tyres.', 'F', 'The new standards include such limits “for the first time”.'],
      ['Some analysts expect electric cars to generate somewhat more tyre particles than comparable combustion-engine cars.', 'T', 'Stated, with the reason that they are typically heavier.'],
      ['All test methods for the new tyre and brake limits have been finalised.', 'F', 'Some test methods are “still being finalised”.'],
      ['The new EU standards leave particles from tyres and brakes unregulated.', 'F', 'They include limits on particle emissions from tyres and brakes.'] ] },
    { id: 'V13', p: 'eci', opts: [
      ['The Commission must propose legislation once an initiative collects one million signatures.', 'F', 'It must respond, but “is not obliged to propose legislation”.'],
      ['One million signatures collected in a single member state would satisfy the requirements.', 'F', 'Thresholds must be reached in at least seven member states.'],
      ['When responding to a successful initiative, the Commission must explain its reasons.', 'T', 'It must set out what action, if any, it will take “and its reasons”.'],
      ['Most registered initiatives have reached the signature threshold.', 'F', 'Only “a small proportion” have.'] ] },
    { id: 'V14', p: 'eci', opts: [
      ['Critics argue that the instrument has raised public awareness of issues.', 'F', 'That is the supporters’ argument; critics focus on limited legislative follow-up.'],
      ['The instrument was created to replace petitions to the European Parliament.', 'C', 'Petitions to Parliament are not mentioned.'],
      ['An initiative may only concern a matter within the Commission’s powers.', 'T', 'Initiatives invite the Commission to propose legislation “on a matter within its powers”.'],
      ['Initiatives that fail to reach the threshold have no effect at all.', 'F', 'Supporters argue they can still raise awareness; the text does not support “no effect at all”.'] ] },
    { id: 'V15', p: 'food', opts: [
      ['Food past its “best before” date is unsafe to eat.', 'F', '“Best before” indicates quality; such food is often still safe.'],
      ['Retail generates more food waste than households in the EU.', 'F', 'Households are responsible for more than half of all food waste.'],
      ['Confusion over date labels is one reason why households throw food away.', 'T', 'Stated as one of the causes of avoidable household waste.'],
      ['Awareness campaigns have consistently reduced household food waste.', 'F', 'Their results have been “mixed”.'] ] },
    { id: 'V16', p: 'food', opts: [
      ['“Use by” dates indicate quality rather than safety.', 'F', 'It is the other way round: “use by” relates to safety.'],
      ['Information campaigns tend to be more effective when combined with practical changes.', 'T', 'Studies suggest combining information with practical changes is more effective than information alone.'],
      ['Primary production is the second-largest source of food waste after households.', 'C', 'The remaining sources are listed but not ranked.'],
      ['Smaller portion sizes would eliminate household food waste.', 'C', 'They are an example of a practical change that helps; elimination is not claimed.'] ] },
    { id: 'V17', p: 'phish', opts: [
      ['Multi-factor authentication stops employees from clicking malicious links.', 'F', 'It does “not prevent people from clicking malicious links”.'],
      ['Phishing is the most common way attackers gain access to organisations’ systems.', 'C', 'It is “one of the most common”; whether it is the most common is not stated.'],
      ['Spear phishing involves tailoring messages to particular individuals.', 'T', 'Stated: messages are tailored to specific individuals.'],
      ['Simulated phishing exercises permanently reduce click rates.', 'F', 'The improvement “can fade within months”.'] ] },
    { id: 'V18', p: 'phish', opts: [
      ['Phishing mainly exploits technical vulnerabilities in software.', 'F', 'It relies on persuading people “rather than exploiting technical vulnerabilities”.'],
      ['Most organisations run simulated phishing exercises.', 'C', 'The text says “many”, which is not the same as “most”.'],
      ['Multi-factor authentication makes stolen passwords completely useless.', 'C', 'It “can limit the damage”; complete protection is not claimed.'],
      ['The benefit of phishing training may fade if exercises are not repeated.', 'T', 'Stated: improvement can fade within months unless exercises are repeated.'] ] },
    { id: 'V19', p: 'age', opts: [
      ['In pay-as-you-go systems, current pensions are financed by current workers’ contributions.', 'T', 'Stated as the definition of such systems.'],
      ['Every member state has linked its retirement age to life expectancy.', 'C', 'This is one of several responses mentioned; how many countries use it is not stated.'],
      ['The working-age population is expected to shrink in every member state.', 'C', 'The text says “many member states”, not every one.'],
      ['Economists agree that migration will fully offset population ageing.', 'F', 'Migration can “partly” offset it, and economists disagree about the size of the effect.'] ] },
    { id: 'V20', p: 'age', opts: [
      ['Raising the retirement age is the most effective response to population ageing.', 'C', 'Responses are listed but not compared.'],
      ['The share of people aged 65 and over has recently begun to fall.', 'F', 'It has been rising for decades and is projected to keep rising.'],
      ['Higher employment among women could partly offset the effect of demographic change.', 'T', 'Stated: higher employment rates among older workers and women “can partly offset” it.'],
      ['All governments have rejected encouraging private pension savings.', 'F', 'Encouraging supplementary private savings is listed as one response.'] ] },

    /* ----- hard set added later ----- */
    { id: 'V21', p: 'ai', level: 'Hard', opts: [
      ['Some AI systems may be placed on the market only once requirements on human oversight have been met.', 'T', 'High-risk systems must meet requirements including human oversight before they can be placed on the market.'],
      ['All obligations under the AI Act took effect on the same date.', 'F', 'They apply “in stages over several years rather than all at once”.'],
      ['Compliance costs will force many smaller firms out of the market.', 'C', 'Industry groups warned that costs “could weigh on” smaller firms. That is a concern, not a statement that firms will leave the market.'],
      ['Providers of chatbots have no obligations under the Act.', 'F', 'They must ensure people are informed they are interacting with a machine.'] ] },
    { id: 'V22', p: 'ai', level: 'Hard', opts: [
      ['Some critics believe that excluding national security uses leaves gaps.', 'T', 'Some civil society organisations argue exactly this.'],
      ['Industry groups argue that the national security exclusion leaves significant gaps.', 'C', 'The text attributes this argument to civil society organisations. It says nothing about what industry groups think of the exclusion. Watch who says what.'],
      ['Most AI systems on the EU market are classified as high-risk.', 'C', 'The text says most other (non-high-risk) systems face few obligations, but gives no figures on how many systems fall into each category.'],
      ['Social scoring is allowed if it meets the high-risk requirements.', 'F', 'Social scoring is given as an example of a prohibited practice.'] ] },
    { id: 'V23', p: 'reuse', level: 'Hard', opts: [
      ['Reclaimed water can cost more than abstracted freshwater, especially where abstraction charges are low.', 'T', 'Stated almost word for word in the last sentence.'],
      ['The same quality standards apply to reused water whatever crop it irrigates.', 'F', 'Standards are stricter for food crops eaten raw.'],
      ['Member states must allow water reuse in every river basin.', 'F', 'They may decide reuse is not appropriate in some or all river basins.'],
      ['Spain reuses a larger share of its treated wastewater than any other member state.', 'C', 'No country is named. The text only says the share “varies widely”. Do not use outside knowledge.'] ] },
    { id: 'V24', p: 'reuse', level: 'Hard', opts: [
      ['A member state that rules out reuse in a river basin must give reasons for doing so.', 'T', 'It may do so “provided they justify this decision”.'],
      ['Most treated wastewater in the EU is discharged into rivers.', 'C', 'Only a small fraction is reused, but the text does not say what happens to the rest.'],
      ['The EU rules on water reuse for irrigation took effect before 2020.', 'F', 'They took effect in 2023.'],
      ['Reusing wastewater will end water shortages in drought-prone regions.', 'C', 'The text says reuse “could reduce pressure”. Ending shortages is a much stronger claim that the text neither makes nor rules out.'] ] },
    { id: 'V25', p: 'ets', level: 'Hard', opts: [
      ['Authorities do not directly set the price of allowances.', 'T', 'The price is determined by supply and demand “rather than set directly by the authorities”.'],
      ['The cap on emissions stays the same from year to year.', 'F', 'The cap “is reduced over time”.'],
      ['The price of allowances has risen steadily since the system began.', 'C', 'Price trends are not mentioned.'],
      ['A company that emits more than its allowances cover faces no consequences.', 'F', 'It must buy additional allowances or face penalties.'] ] },
    { id: 'V26', p: 'ets', level: 'Hard', opts: [
      ['The number of allowances auctioned can change in response to the size of the surplus in circulation.', 'T', 'The market stability reserve adjusts auction volumes when the surplus is unusually large or small.'],
      ['All allowances are allocated free of charge.', 'F', 'Companies “receive or buy” allowances, and free allocation goes only to “some industries”.'],
      ['Free allocation has led some industries to increase their emissions.', 'C', 'Critics say it weakens the incentive to cut emissions. A weaker incentive to cut is not the same as an increase.'],
      ['Industries that receive free allocation admit that it weakens their incentive to cut emissions.', 'C', 'That is the critics’ argument. The industries are only said to argue that free allocation protects them from competitors.'] ] },
    { id: 'V27', p: 'amr', level: 'Hard', opts: [
      ['Using antibiotics to make farm animals grow faster has not been permitted in the EU since 2006.', 'T', 'Growth-promoting use “has been banned since 2006”.'],
      ['Antimicrobial resistance arises only because medicines are misused.', 'F', 'Resistance “arises naturally”; misuse accelerates its spread.'],
      ['Resistance spreads faster through animal farming than through human medicine.', 'C', 'Both are named as accelerating factors, but they are not compared.'],
      ['Since 2022, routine preventive use of antibiotics in groups of farm animals has been unrestricted.', 'F', 'Since 2022 such use has been restricted.'] ] },
    { id: 'V28', p: 'amr', level: 'Hard', opts: [
      ['One reason new antibiotics may earn little is that they are likely to be used sparingly.', 'T', 'New drugs are likely to be held in reserve and used sparingly, “which limits sales”.'],
      ['Rewards paid independently of sales volume have been introduced across the EU.', 'C', 'They are described as proposals; whether any have been introduced is not stated.'],
      ['The text describes developing new antibiotics as scientifically straightforward.', 'F', 'It is described as “scientifically difficult”.'],
      ['Most resistant infections in the EU are caused by bacteria rather than fungi.', 'C', 'The text lists the organisms but gives no breakdown of infections.'] ] },
    { id: 'V29', p: 'cohesion', level: 'Hard', opts: [
      ['A less developed region whose GDP per inhabitant rises above 75% of the EU average during a programming period keeps that status until the period ends.', 'T', 'Classification is fixed for the whole period, so a fast-growing region keeps its status until the next period.'],
      ['A region at 90% of the EU average is classified as a more developed region.', 'F', 'Between 75% and 100% is a transition region.'],
      ['Less developed regions receive the largest total amount of cohesion funding.', 'C', 'They are eligible for the highest co-financing RATES. Total amounts received are not mentioned. Rates and totals are different things.'],
      ['Regional classifications are updated every year.', 'F', 'The classification is fixed for the whole programming period.'] ] },
    { id: 'V30', p: 'cohesion', level: 'Hard', opts: [
      ['Some studies suggest that the effect of cohesion funding depends on the quality of local institutions.', 'T', 'Stated in the last sentence.'],
      ['Transition regions are eligible for higher co-financing rates than less developed regions.', 'F', 'Less developed regions are eligible for the highest rates.'],
      ['Every region that received cohesion funding grew faster than the EU average.', 'C', 'Evaluations suggest funding supported growth in “many” regions. Nothing is said about growth relative to the EU average.'],
      ['Most transition regions will become more developed regions in the next programming period.', 'C', 'The text makes no prediction about future classifications.'] ] },
    { id: 'V31', p: 'clocks', level: 'Hard', opts: [
      ['The consultation results may not reflect the views of the EU population as a whole.', 'T', 'Respondents “were not a representative sample of the population”.'],
      ['Member states agreed in 2019 to end the seasonal clock change.', 'F', 'In 2019 the European Parliament supported the proposal; the member states have not reached a common position.'],
      ['Most respondents to the consultation came from Germany.', 'C', 'The text says most came from “a single member state” but does not name it. Even if you know which country it was, the passage does not say so.'],
      ['The European Parliament rejected the Commission’s proposal.', 'F', 'Parliament supported it in 2019.'] ] },
    { id: 'V32', p: 'clocks', level: 'Hard', opts: [
      ['One concern in the Council is that member states could end up with different standard times.', 'T', 'Stated as one reason member states have not agreed.'],
      ['The dates of the clock changes currently differ between member states.', 'F', 'They have been harmonised since 2001.'],
      ['Ending the seasonal change would reduce energy consumption.', 'C', 'Energy is not mentioned.'],
      ['A minority of consultation respondents favoured ending the clock change.', 'F', 'A large majority favoured abolition.'] ] },
  ];
  verbal.forEach((q) => { q.level = q.level || 'Standard'; q.ans = q.opts.findIndex((o) => o[1] === 'T'); });

  // Deterministic shuffle of option order (seeded by question id) so answer letters
  // are spread evenly and cannot be guessed from position.
  function seededOrder(id, n) {
    let h = 2166136261;
    for (const ch of id + 'k') { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    const idx = [...Array(n).keys()];
    for (let k = n - 1; k > 0; k--) { h = (Math.imul(h, 1103515245) + 12345) >>> 0; const j = h % (k + 1); [idx[k], idx[j]] = [idx[j], idx[k]]; }
    return idx;
  }
  abstract.forEach((q) => {
    const order = seededOrder(q.id, q.options.length);
    const correct = q.options[q.ans];
    q.options = order.map((k) => q.options[k]);
    q.ans = q.options.indexOf(correct);
  });
  verbal.forEach((q) => {
    const order = seededOrder(q.id, 4);
    q.opts = order.map((k) => [q.opts[k][0], q.opts[k][1], q.opts[k][2], k]); // keep the original position so translations line up
    q.ans = q.opts.findIndex((o) => o[1] === 'T');
  });

  const api = { abstract, numerical, datasets, verbal, passages, C, CELL_NAME, FILL_NAME, CORNERS_CW, PERIM_CW };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EPSO = api;
})(this);
