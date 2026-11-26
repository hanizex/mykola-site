// Visuals for blog posts.
//   coverSvg(key, motif)  -> the main image of a post (1200x630 SVG, no text, shared by both language versions).
//                            Abstract shapes seeded by the post key + one line-drawn motif that hints at the subject.
//   diagram(src, lang)    -> HTML for a ```diagram block inside a post (theme-aware, text stays real text for search).
// Diagram syntax (one block per figure):
//   ```diagram
//   type: steps | compare | bars | matrix | ladder | cycle | cards | groups | quote | stats
//   title: optional heading      caption: optional note under the figure
//   - First column | second column | third column
//   ```
//   steps   - label | detail                       (numbered flow)
//   compare - left | right   + keys left:, right:  (two columns, first row = headers from keys)
//   bars    - label | value | note   + keys max:, unit:   (value = number or range "2-4")
//   matrix  - title | text  x4 (top-left, top-right, bottom-left, bottom-right) + keys x:, y:, highlight: 1-4
//   ladder  - level | text                         (ascending steps)
//   cycle   - short label                          (+ key center:)
//   cards   - label | text   + key mark: num | check | cross | arrow | dot
//   groups  - "# Group name" lines, then "- item" lines (chips with counts)
//   quote   - keys text:, by:
//   stats   - value | label                        (only real numbers)

export const MOTIFS = {
  'ai-vs-human': `<rect x="8" y="34" width="34" height="30" rx="7" stroke="{M}"/><line x1="25" y1="34" x2="25" y2="25" stroke="{M}"/><circle cx="25" cy="21" r="3.5" stroke="{A}"/><circle cx="19" cy="47" r="3" fill="{A}" stroke="none"/><circle cx="31" cy="47" r="3" fill="{A}" stroke="none"/><line x1="18" y1="56" x2="32" y2="56" stroke="{M}"/><circle cx="75" cy="38" r="10" stroke="{M}"/><path d="M57 72 Q75 50 93 72" stroke="{M}"/><path d="M45 44 h11 l-3 -3 M56 54 h-11 l3 3" stroke="{B}"/>`,
  code: `<polyline points="32,28 12,50 32,72" stroke="{M}"/><polyline points="68,28 88,50 68,72" stroke="{M}"/><line x1="58" y1="22" x2="42" y2="78" stroke="{A}"/>`,
  interview: `<circle cx="26" cy="32" r="9" stroke="{M}"/><path d="M12 62 Q26 42 40 62" stroke="{M}"/><circle cx="74" cy="32" r="9" stroke="{A}"/><path d="M60 62 Q74 42 88 62" stroke="{A}"/><line x1="8" y1="70" x2="92" y2="70" stroke="{M}"/><line x1="20" y1="70" x2="20" y2="90" stroke="{M}"/><line x1="80" y1="70" x2="80" y2="90" stroke="{M}"/><path d="M43 12 h14 v10 h-8 l-5 5 z" stroke="{B}"/>`,
  question: `<circle cx="50" cy="50" r="42" stroke="{M}" stroke-dasharray="5 9"/><path d="M38 38 Q38 25 50 25 Q62 25 62 38 Q62 47 50 51 L50 61" stroke="{A}" stroke-width="5"/><circle cx="50" cy="73" r="3.8" fill="{A}" stroke="none"/>{RING}`,
  megaphone: `<path d="M12 42 h14 l34 -18 v52 l-34 -18 h-14 z" stroke="{M}"/><path d="M20 58 l4 18 h8 l-3 -18" stroke="{M}"/><path d="M70 38 q8 12 0 24" stroke="{A}"/><path d="M79 29 q14 21 0 42" stroke="{A}"/><path d="M88 20 q20 30 0 60" stroke="{B}"/>`,
  chat: `<rect x="6" y="12" width="52" height="32" rx="8" stroke="{M}"/><path d="M18 44 l-3 11 l12 -11" stroke="{M}"/><rect x="42" y="52" width="52" height="32" rx="8" stroke="{A}"/><path d="M82 84 l3 11 l-12 -11" stroke="{A}"/><line x1="16" y1="24" x2="46" y2="24" stroke="{M}"/><line x1="16" y1="32" x2="36" y2="32" stroke="{M}"/><line x1="52" y1="64" x2="84" y2="64" stroke="{A}"/><line x1="52" y1="72" x2="72" y2="72" stroke="{A}"/>`,
  ladder: `<polyline points="6,90 6,72 28,72 28,54 50,54 50,36 72,36 72,18 94,18" stroke="{M}"/><circle cx="83" cy="9" r="5" fill="{A}" stroke="none"/><line x1="6" y1="90" x2="94" y2="90" stroke="{B}"/>`,
  phone: `<rect x="14" y="10" width="36" height="74" rx="7" stroke="{M}"/><line x1="26" y1="74" x2="38" y2="74" stroke="{M}"/><path d="M57 28 q8 8 0 16" stroke="{A}"/><path d="M64 21 q15 15 0 30" stroke="{A}"/><circle cx="72" cy="72" r="17" stroke="{B}"/><path d="M72 63 v9 l7 4" stroke="{B}"/>`,
  control: `<line x1="18" y1="14" x2="82" y2="14" stroke="{A}"/><line x1="50" y1="7" x2="50" y2="21" stroke="{A}"/><line x1="22" y1="14" x2="34" y2="56" stroke="{M}" stroke-dasharray="2 5"/><line x1="78" y1="14" x2="66" y2="56" stroke="{M}" stroke-dasharray="2 5"/><line x1="50" y1="21" x2="50" y2="35" stroke="{M}" stroke-dasharray="2 5"/><circle cx="50" cy="42" r="7" stroke="{M}"/><path d="M50 49 v22 M34 57 l16 -3 l16 3 M50 71 l-10 19 M50 71 l10 19" stroke="{M}"/>`,
  stamp: `<path d="M18 8 h40 l16 16 v68 h-56 z" stroke="{M}"/><path d="M58 8 v16 h16" stroke="{M}"/><line x1="28" y1="34" x2="60" y2="34" stroke="{M}"/><line x1="28" y1="44" x2="54" y2="44" stroke="{M}"/><circle cx="66" cy="70" r="19" stroke="{A}" stroke-width="4"/><path d="M58 62 l16 16 M74 62 l-16 16" stroke="{A}" stroke-width="4"/>`,
  robot: `<rect x="22" y="30" width="56" height="46" rx="10" stroke="{M}"/><line x1="50" y1="30" x2="50" y2="17" stroke="{M}"/><circle cx="50" cy="12" r="4.5" stroke="{A}"/><circle cx="38" cy="50" r="5" fill="{A}" stroke="none"/><circle cx="62" cy="50" r="5" fill="{A}" stroke="none"/><path d="M38 64 h24" stroke="{M}"/><line x1="12" y1="46" x2="22" y2="46" stroke="{B}"/><line x1="78" y1="46" x2="88" y2="46" stroke="{B}"/>`,
  chart: `<polyline points="10,8 10,90 92,90" stroke="{M}"/><rect x="20" y="62" width="12" height="28" stroke="{M}"/><rect x="40" y="46" width="12" height="44" stroke="{M}"/><rect x="60" y="30" width="12" height="60" stroke="{A}"/><polyline points="18,54 44,36 64,22 86,10" stroke="{B}"/>`,
  target: `<circle cx="46" cy="54" r="36" stroke="{M}"/><circle cx="46" cy="54" r="22" stroke="{M}"/><circle cx="46" cy="54" r="8" fill="{A}" stroke="none"/><path d="M46 54 L86 14 M75 14 h11 v11" stroke="{B}"/>`,
  team: `<circle cx="50" cy="30" r="10" stroke="{A}"/><path d="M32 66 Q50 40 68 66" stroke="{A}"/><circle cx="20" cy="44" r="8" stroke="{M}"/><path d="M6 76 Q20 56 34 76" stroke="{M}"/><circle cx="80" cy="44" r="8" stroke="{M}"/><path d="M66 76 Q80 56 94 76" stroke="{M}"/>`,
  search: `<rect x="8" y="8" width="48" height="62" rx="5" stroke="{M}"/><line x1="18" y1="22" x2="46" y2="22" stroke="{M}"/><line x1="18" y1="32" x2="40" y2="32" stroke="{M}"/><line x1="18" y1="42" x2="44" y2="42" stroke="{M}"/><circle cx="62" cy="62" r="16" stroke="{A}" stroke-width="4"/><line x1="74" y1="74" x2="91" y2="91" stroke="{A}" stroke-width="5"/>`,
  checklist: `<rect x="8" y="12" width="16" height="16" rx="3" stroke="{M}"/><path d="M11 20 l4 4 l7 -9" stroke="{A}"/><line x1="34" y1="20" x2="92" y2="20" stroke="{M}"/><rect x="8" y="42" width="16" height="16" rx="3" stroke="{M}"/><path d="M11 50 l4 4 l7 -9" stroke="{A}"/><line x1="34" y1="50" x2="80" y2="50" stroke="{M}"/><rect x="8" y="72" width="16" height="16" rx="3" stroke="{M}"/><line x1="34" y1="80" x2="86" y2="80" stroke="{B}"/>`,
  clock: `<circle cx="50" cy="54" r="38" stroke="{M}"/><path d="M50 32 v22 l15 10" stroke="{A}"/><path d="M38 8 h24 M50 8 v8" stroke="{M}"/><path d="M80 22 l7 -7" stroke="{B}"/>`,
  bulb: `<path d="M50 10 Q75 10 75 37 Q75 52 62 60 V70 H38 V60 Q25 52 25 37 Q25 10 50 10 z" stroke="{M}"/><line x1="40" y1="80" x2="60" y2="80" stroke="{M}"/><line x1="44" y1="89" x2="56" y2="89" stroke="{M}"/><path d="M41 42 l9 9 l9 -9" stroke="{A}"/><path d="M8 34 h8 M84 34 h8 M18 10 l6 6 M82 10 l-6 6" stroke="{B}"/>`,
  balance: `<line x1="50" y1="12" x2="50" y2="86" stroke="{M}"/><line x1="32" y1="88" x2="68" y2="88" stroke="{M}"/><line x1="12" y1="24" x2="88" y2="24" stroke="{M}"/><path d="M12 24 L2 52 h20 z" stroke="{A}"/><path d="M88 24 L78 52 h20 z" stroke="{B}"/><circle cx="50" cy="12" r="4" fill="{A}" stroke="none"/>`,
  cycle: `<path d="M50 12 A38 38 0 0 1 86 62" stroke="{A}"/><path d="M80 56 l6 6 l3 -9" stroke="{A}"/><path d="M80 74 A38 38 0 0 1 16 70" stroke="{B}"/><path d="M24 74 l-8 -4 l1 9" stroke="{B}"/><path d="M13 56 A38 38 0 0 1 40 13" stroke="{M}"/><path d="M33 9 l7 4 l-6 7" stroke="{M}"/>`,
  cv: `<rect x="18" y="6" width="64" height="88" rx="6" stroke="{M}"/><circle cx="50" cy="30" r="10" stroke="{A}"/><path d="M33 56 Q50 37 67 56" stroke="{A}"/><line x1="30" y1="68" x2="70" y2="68" stroke="{M}"/><line x1="30" y1="78" x2="58" y2="78" stroke="{B}"/>`,
  warning: `<path d="M50 10 L92 86 H8 Z" stroke="{M}"/><line x1="50" y1="38" x2="50" y2="62" stroke="{A}" stroke-width="5"/><circle cx="50" cy="74" r="3.5" fill="{A}" stroke="none"/>`,
  money: `<ellipse cx="40" cy="74" rx="28" ry="9" stroke="{M}"/><path d="M12 74 v-12 M68 74 v-12" stroke="{M}"/><ellipse cx="40" cy="62" rx="28" ry="9" stroke="{M}"/><path d="M12 62 v-12 M68 62 v-12" stroke="{M}"/><ellipse cx="40" cy="50" rx="28" ry="9" stroke="{A}"/><circle cx="76" cy="26" r="16" stroke="{B}"/><path d="M76 18 v16 M71 22 h8 q3 0 3 3 q0 3 -3 3 h-6" stroke="{B}"/>`,
};

const PALETTES = [
  ['#5b9bf8', '#f59e0b'], ['#2dd4bf', '#a78bfa'], ['#f59e0b', '#fb7185'], ['#a78bfa', '#5b9bf8'],
  ['#fb7185', '#2dd4bf'], ['#a3e635', '#5b9bf8'], ['#38bdf8', '#f472b6'], ['#facc15', '#60a5fa'],
];

function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const r1 = (n) => Math.round(n * 10) / 10;

export const motifFor = (key, motif) => (motif && MOTIFS[motif] ? motif : Object.keys(MOTIFS)[hash(key) % Object.keys(MOTIFS).length]);

export function coverSvg(key, motifName) {
  const R = rng(hash(key));
  const [A, B] = PALETTES[hash(key + '#p') % PALETTES.length];
  const W = 1200, H = 630, cx = 600, cy = 315;
  const shapes = [];
  const pick = (a, b) => a + R() * (b - a);
  const spot = () => { // keep big shapes out of the very centre, where the motif sits
    let x, y; do { x = pick(40, W - 40); y = pick(30, H - 30); } while (Math.abs(x - cx) < 250 && Math.abs(y - cy) < 210);
    return [x, y];
  };
  const col = () => (R() < 0.5 ? A : B);
  const n = 9 + Math.floor(R() * 4);
  for (let i = 0; i < n; i++) {
    const kind = Math.floor(R() * 7), [x, y] = spot(), c = col();
    if (kind === 0) shapes.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(pick(60, 230))}" fill="none" stroke="${c}" stroke-opacity="${r1(pick(0.3, 0.6))}" stroke-width="${r1(pick(3, 8))}"/>`);
    else if (kind === 1) shapes.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(pick(30, 150))}" fill="${c}" fill-opacity="${r1(pick(0.14, 0.3))}"/>`);
    else if (kind === 2) { const r = pick(70, 200), a0 = pick(0, 6.28), a1 = a0 + pick(1, 2.6); shapes.push(`<path d="M${r1(x + r * Math.cos(a0))} ${r1(y + r * Math.sin(a0))} A${r1(r)} ${r1(r)} 0 0 1 ${r1(x + r * Math.cos(a1))} ${r1(y + r * Math.sin(a1))}" fill="none" stroke="${c}" stroke-opacity="${r1(pick(0.55, 0.9))}" stroke-width="${r1(pick(10, 26))}" stroke-linecap="round"/>`); }
    else if (kind === 3) { const k = 3 + Math.floor(R() * 4), bw = pick(12, 22); let g = ''; for (let j = 0; j < k; j++) { const h = pick(30, 150); g += `<rect x="${r1(x + j * (bw + 8))}" y="${r1(y - h)}" width="${r1(bw)}" height="${r1(h)}" rx="${r1(bw / 2)}" fill="${c}" fill-opacity="${r1(pick(0.4, 0.8))}"/>`; } shapes.push(g); }
    else if (kind === 4) { let g = ''; const k = 4 + Math.floor(R() * 4); for (let j = 0; j < k; j++) g += `<line x1="${r1(x + j * 18)}" y1="${r1(y)}" x2="${r1(x + j * 18 + 90)}" y2="${r1(y - 90)}" stroke="${c}" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>`; shapes.push(g); }
    else if (kind === 5) { let g = ''; for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) g += `<circle cx="${r1(x + a * 20)}" cy="${r1(y + b * 20)}" r="3.2" fill="${c}" fill-opacity=".55"/>`; shapes.push(g); }
    else { const s = pick(40, 110); shapes.push(`<rect x="${r1(x - s / 2)}" y="${r1(y - s / 2)}" width="${r1(s)}" height="${r1(s)}" rx="${r1(s / 5)}" fill="none" stroke="${c}" stroke-opacity=".4" stroke-width="4" transform="rotate(${r1(pick(-30, 30))} ${r1(x)} ${r1(y)})"/>`); }
  }
  const name = motifFor(key, motifName);
  let ring = '';
  if (name === 'question') for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 9; ring += `<circle cx="${r1(50 + 42 * Math.cos(a))}" cy="${r1(50 + 42 * Math.sin(a))}" r="3.6" fill="{B}" stroke="none"/>`; }
  const motif = MOTIFS[name].replace('{RING}', ring).replace(/\{M\}/g, '#eef3ff').replace(/\{A\}/g, A).replace(/\{B\}/g, B);
  const id = 'c' + (hash(key) % 100000);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<defs>
<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#151d33"/></linearGradient>
<radialGradient id="${id}r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${A}" stop-opacity=".5"/><stop offset="1" stop-color="${A}" stop-opacity="0"/></radialGradient>
<pattern id="${id}d" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="#ffffff" fill-opacity=".07"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="url(#${id}g)"/>
<rect width="${W}" height="${H}" fill="url(#${id}d)"/>
${shapes.join('\n')}
<circle cx="${cx}" cy="${cy}" r="330" fill="url(#${id}r)"/>
<rect x="${cx - 205}" y="${cy - 205}" width="410" height="410" rx="56" fill="#0d1324" fill-opacity=".82" stroke="${A}" stroke-opacity=".45" stroke-width="3"/>
<g transform="translate(${cx - 160} ${cy - 160}) scale(3.2)" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${motif}</g>
</svg>
`;
}

// ---------- diagrams ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

function parseSpec(src) {
  const meta = {}, items = [], groups = [];
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('# ')) { groups.push({ name: line.slice(2).trim(), items: [] }); continue; }
    if (line.startsWith('- ')) { const cols = line.slice(2).split('|').map((c) => c.trim()); (groups.length ? groups[groups.length - 1].items : items).push(cols); continue; }
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return { meta, items, groups };
}

const num = (v) => { const m = String(v).match(/^(-?\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(-?\d+(?:[.,]\d+)?))?/); return m ? [parseFloat(m[1].replace(',', '.')), m[2] != null ? parseFloat(m[2].replace(',', '.')) : null] : [0, null]; };

function wrapLabel(s, max = 16) {
  const words = String(s).split(/\s+/), lines = [];
  let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

const MARKS = { check: '✓', cross: '✕', arrow: '→', dot: '•' };

export function diagram(src, lang = 'uk') {
  const { meta, items, groups } = parseSpec(src);
  const type = (meta.type || 'cards').toLowerCase();
  let inner = '';
  if (type === 'steps') {
    inner = `<ol class="dg-steps">${items.map((c, i) => `<li><b class="dg-n">${i + 1}</b><strong>${inline(c[0] || '')}</strong>${c[1] ? `<span>${inline(c[1])}</span>` : ''}</li>`).join('')}</ol>`;
  } else if (type === 'compare') {
    const tone = meta.tone === 'neutral' ? '' : ' dg-tone';
    inner = `<div class="dg-compare${tone}"><div class="dg-h dg-l">${inline(meta.left || '')}</div><div class="dg-h dg-r">${inline(meta.right || '')}</div>${items.map((c) => `<div class="dg-l">${inline(c[0] || '')}</div><div class="dg-r">${inline(c[1] || '')}</div>`).join('')}</div>`;
  } else if (type === 'bars') {
    const vals = items.map((c) => num(c[1]));
    const max = parseFloat(meta.max) || Math.max(...vals.map(([a, b]) => (b ?? a)), 1);
    const unit = meta.unit ? ' ' + esc(meta.unit) : '';
    inner = `<div class="dg-bars">${items.map((c, i) => {
      const [a, b] = vals[i], from = b == null ? 0 : a, to = b == null ? a : b;
      return `<div class="dg-row"><div class="dg-lab">${inline(c[0] || '')}</div><div class="dg-track"><i style="left:${r1((from / max) * 100)}%;width:${r1(Math.max(2, ((to - from) / max) * 100))}%"></i></div><div class="dg-val">${esc(c[1] || '')}${unit}${c[2] ? `<small>${inline(c[2])}</small>` : ''}</div></div>`;
    }).join('')}</div>`;
  } else if (type === 'matrix') {
    const hl = parseInt(meta.highlight, 10);
    inner = `<div class="dg-matrix">${meta.y ? `<div class="dg-y"><span>${inline(meta.y)}</span></div>` : ''}<div class="dg-q4">${items.slice(0, 4).map((c, i) => `<div class="dg-q${hl === i + 1 ? ' on' : ''}"><strong>${inline(c[0] || '')}</strong>${c[1] ? `<span>${inline(c[1])}</span>` : ''}</div>`).join('')}</div>${meta.x ? `<div class="dg-x">${inline(meta.x)}</div>` : ''}</div>`;
  } else if (type === 'ladder') {
    const n = items.length;
    inner = `<ol class="dg-ladder" style="--n:${n}">${items.map((c, i) => `<li style="--i:${i}"><div class="dg-step"><strong>${inline(c[0] || '')}</strong>${c[1] ? `<span>${inline(c[1])}</span>` : ''}</div></li>`).join('')}</ol>`;
  } else if (type === 'cycle') {
    const n = Math.max(items.length, 1), R = 132, C = 200;
    let svg = `<circle cx="${C}" cy="${C}" r="${R}" class="dg-ring"/>`;
    items.forEach((c, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, x = C + R * Math.cos(a), y = C + R * Math.sin(a);
      const a2 = a + Math.PI / n, ax = C + R * Math.cos(a2), ay = C + R * Math.sin(a2), deg = (a2 * 180) / Math.PI + 90;
      svg += `<path d="M-7 -6 L4 0 L-7 6" class="dg-arrow" transform="translate(${r1(ax)} ${r1(ay)}) rotate(${r1(deg - 90)})"/>`;
      const lines = wrapLabel(c[0] || '', 14);
      svg += `<circle cx="${r1(x)}" cy="${r1(y)}" r="46" class="dg-node"/><text x="${r1(x)}" y="${r1(y - (lines.length - 1) * 8 + 4)}" class="dg-t">${lines.map((l, j) => `<tspan x="${r1(x)}" dy="${j ? 16 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
    });
    if (meta.center) { const lines = wrapLabel(meta.center, 16); svg += `<text x="${C}" y="${r1(C - (lines.length - 1) * 9 + 5)}" class="dg-c">${lines.map((l, j) => `<tspan x="${C}" dy="${j ? 18 : 0}">${esc(l)}</tspan>`).join('')}</text>`; }
    inner = `<svg class="dg-cycle" viewBox="0 0 400 400" role="img" aria-label="${esc(items.map((c) => c[0]).join(' → '))}">${svg}</svg>`;
  } else if (type === 'groups') {
    inner = `<div class="dg-groups">${groups.map((g) => `<div class="dg-g"><div class="dg-gh"><strong>${inline(g.name)}</strong><b>${g.items.length}</b></div><ul>${g.items.map((c) => `<li>${inline(c[0] || '')}</li>`).join('')}</ul></div>`).join('')}</div>`;
  } else if (type === 'quote') {
    inner = `<blockquote class="dg-quote"><p>${inline(meta.text || '')}</p>${meta.by ? `<cite>${inline(meta.by)}</cite>` : ''}</blockquote>`;
  } else if (type === 'stats') {
    inner = `<div class="dg-stats">${items.map((c) => `<div><b>${inline(c[0] || '')}</b><span>${inline(c[1] || '')}</span></div>`).join('')}</div>`;
  } else { // cards
    const mark = meta.mark || 'num';
    inner = `<ul class="dg-cards">${items.map((c, i) => `<li class="dg-m-${esc(mark)}"><b class="dg-n">${mark === 'num' ? i + 1 : MARKS[mark] || '•'}</b><div><strong>${inline(c[0] || '')}</strong>${c[1] ? `<span>${inline(c[1])}</span>` : ''}</div></li>`).join('')}</ul>`;
  }
  const title = meta.title ? `<div class="dg-title">${inline(meta.title)}</div>` : '';
  const cap = meta.caption ? `<figcaption>${inline(meta.caption)}</figcaption>` : '';
  return `<figure class="dg dg--${esc(type)}">${title}${inner}${cap}</figure>\n`;
}
