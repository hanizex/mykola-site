// Napkin-style infographics for blog posts: real SVG graphics (shapes, icons, arrows), drawn at build time.
// In a post:
//   ```visual
//   type: flow | iceberg | pyramid | funnel | hub | venn | balance | stairs | donut | versus | timeline
//   title: optional heading            caption: optional note
//   - Label | short text | icon         (icon = a name from ICON_NAMES, optional)
//   ```
// Per type:
//   flow      - label | text | icon                vertical process with arrows; key end: effect  -> last step is the outcome
//   iceberg   - label | text | icon                hidden part; key top: what everybody sees, key topnote: optional
//   pyramid   - label | text                       first item = top of the pyramid
//   funnel    - label | text                       first item = widest stage
//   hub       - label | icon                       key center: the central idea (3-8 items)
//   venn      - label | text                       2 or 3 sets; key center: the overlap
//   balance   - left item | right item             keys left:, right:, heavier: left | right
//   stairs    - label | text                       first item = lowest step (2-5 items)
//   donut     - label | number                     real numbers only; key center: optional caption for the total
//   versus    - left item | right item             keys left:, right:, lefticon:, righticon:, tone: bad-good | neutral
//   timeline  - when | label | text
// Colours: the post's palette (same as its cover), text uses the site theme variables. Width is fixed (viewBox 480),
// so every visual reads on a phone and is capped at 600px on desktop.

import { MOTIFS, PALETTES, hash, parseSpec } from './blog-visuals.mjs';

const EXTRA = {
  eye: `<path d="M6 50 Q50 10 94 50 Q50 90 6 50 Z" stroke="{M}"/><circle cx="50" cy="50" r="14" stroke="{A}"/><circle cx="50" cy="50" r="5" fill="{A}" stroke="none"/>`,
  mail: `<rect x="8" y="22" width="84" height="58" rx="8" stroke="{M}"/><path d="M10 26 L50 56 L90 26" stroke="{A}"/>`,
  calendar: `<rect x="10" y="18" width="80" height="72" rx="8" stroke="{M}"/><line x1="10" y1="38" x2="90" y2="38" stroke="{M}"/><line x1="30" y1="8" x2="30" y2="26" stroke="{A}"/><line x1="70" y1="8" x2="70" y2="26" stroke="{A}"/><rect x="26" y="52" width="14" height="12" rx="2" fill="{A}" stroke="none"/>`,
  note: `<path d="M14 8 h52 l20 20 v64 h-72 z" stroke="{M}"/><path d="M66 8 v20 h20" stroke="{M}"/><line x1="26" y1="44" x2="72" y2="44" stroke="{A}"/><line x1="26" y1="58" x2="72" y2="58" stroke="{A}"/><line x1="26" y1="72" x2="56" y2="72" stroke="{A}"/>`,
  flag: `<line x1="18" y1="8" x2="18" y2="94" stroke="{M}"/><path d="M18 12 H82 L70 32 L82 52 H18" stroke="{A}"/>`,
  shield: `<path d="M50 6 L86 20 V48 Q86 78 50 94 Q14 78 14 48 V20 Z" stroke="{M}"/><path d="M34 50 l12 12 l22 -24" stroke="{A}"/>`,
  fire: `<path d="M50 6 Q74 34 70 60 Q66 88 50 92 Q34 88 30 60 Q28 44 40 30 Q42 46 50 50 Q46 28 50 6 Z" stroke="{A}"/><path d="M50 92 Q40 84 42 72 Q46 62 50 58 Q56 66 58 74 Q58 86 50 92" stroke="{B}"/>`,
  down: `<polyline points="8,20 34,46 52,32 90,76" stroke="{A}"/><path d="M90 52 V76 H66" stroke="{A}"/><line x1="8" y1="92" x2="92" y2="92" stroke="{M}"/>`,
  up: `<polyline points="8,80 34,54 52,68 90,24" stroke="{A}"/><path d="M66 24 H90 V48" stroke="{A}"/><line x1="8" y1="92" x2="92" y2="92" stroke="{M}"/>`,
  lock: `<rect x="18" y="44" width="64" height="48" rx="8" stroke="{M}"/><path d="M30 44 V30 Q30 10 50 10 Q70 10 70 30 V44" stroke="{M}"/><circle cx="50" cy="64" r="6" fill="{A}" stroke="none"/><line x1="50" y1="68" x2="50" y2="80" stroke="{A}"/>`,
  gear: `<circle cx="50" cy="50" r="16" stroke="{A}"/><path d="M50 6 V20 M50 80 V94 M6 50 H20 M80 50 H94 M19 19 L29 29 M71 71 L81 81 M19 81 L29 71 M71 29 L81 19" stroke="{M}"/><circle cx="50" cy="50" r="32" stroke="{M}"/>`,
  book: `<path d="M50 20 Q30 8 8 14 V84 Q30 78 50 90 Q70 78 92 84 V14 Q70 8 50 20 Z" stroke="{M}"/><line x1="50" y1="20" x2="50" y2="90" stroke="{A}"/>`,
  coffee: `<path d="M14 34 H74 V64 Q74 88 44 88 Q14 88 14 64 Z" stroke="{M}"/><path d="M74 42 Q92 42 92 56 Q92 70 74 70" stroke="{M}"/><path d="M30 8 q6 8 0 16 M46 8 q6 8 0 16 M62 8 q6 8 0 16" stroke="{A}"/>`,
  heart: `<path d="M50 88 L14 52 Q2 38 12 24 Q26 8 42 20 L50 28 L58 20 Q74 8 88 24 Q98 38 86 52 Z" stroke="{A}"/>`,
  star: `<path d="M50 8 L61 36 L92 38 L68 58 L76 90 L50 72 L24 90 L32 58 L8 38 L39 36 Z" stroke="{A}"/>`,
  puzzle: `<path d="M12 30 H36 Q34 12 50 12 Q66 12 64 30 H88 V54 Q70 52 70 66 Q70 80 88 78 V90 H12 Z" stroke="{M}"/><circle cx="40" cy="60" r="6" fill="{A}" stroke="none"/>`,
  user: `<circle cx="50" cy="32" r="18" stroke="{M}"/><path d="M14 92 Q50 40 86 92" stroke="{A}"/>`,
  idea: MOTIFS.bulb, x: `<path d="M20 20 L80 80 M80 20 L20 80" stroke="{A}" stroke-width="10"/>`, check: `<path d="M14 52 L40 78 L88 22" stroke="{A}" stroke-width="10"/>`,
};
export const ICONS = { ...MOTIFS, ...EXTRA };
export const ICON_NAMES = Object.keys(ICONS);

const W = 480;
const F = 1.15; // font scale: keeps text readable when the 480-wide drawing shrinks to a phone screen
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (n) => Math.round(n * 10) / 10;

// Wrap by an estimated text width (Inter/system sans: ~0.56 of the font size per character, bold ~0.6).
function wrap(s, widthPx, size = 14, bold = false) {
  const max = Math.max(6, Math.floor(widthPx / (size * F * (bold ? 0.62 : 0.58))));
  const words = String(s ?? '').trim().split(/\s+/).filter(Boolean), out = [];
  let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) out.push(cur);
  return out;
}
function txt(x, y, lines, cls, anchor = 'start', lh = 18) {
  if (!lines.length) return '';
  return `<text x="${r1(x)}" y="${r1(y)}" class="${cls}" text-anchor="${anchor}">${lines.map((l, i) => `<tspan x="${r1(x)}" dy="${i ? r1(lh * F) : 0}">${esc(l)}</tspan>`).join('')}</text>`;
}
function icon(name, cx, cy, size, A, B) {
  const m = ICONS[name];
  if (!m) return '';
  const s = size / 100;
  return `<g transform="translate(${r1(cx - size / 2)} ${r1(cy - size / 2)}) scale(${r1(s * 1000) / 1000})" fill="none" stroke-width="${r1(2.4 / s)}" stroke-linecap="round" stroke-linejoin="round" class="vx-ic">${m.replace('{RING}', '').replace(/\{M\}/g, 'currentColor').replace(/\{A\}/g, A).replace(/\{B\}/g, B)}</g>`;
}
const node = (cx, cy, r, A, B, ic, n) => `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${A}" fill-opacity=".16" stroke="${A}" stroke-width="2"/>${ic && ICONS[ic] ? icon(ic, cx, cy, r * 1.15, A, B) : `<text x="${r1(cx)}" y="${r1(cy + 6)}" class="vx-n" text-anchor="middle">${esc(n)}</text>`}`;

const T = {
  flow({ items, meta }, A, B, id) {
    let y = 34, out = '';
    const rows = items.map((c) => { const lab = wrap(c[0], 360, 16, true), t = wrap(c[1], 360, 14); return { c, lab, t, h: Math.max(84, lab.length * 20 * F + t.length * 18 * F + 26) }; });
    rows.forEach((r, i) => {
      const last = i === rows.length - 1, effect = last && meta.end === 'effect';
      const cy = y + 26;
      if (!last) out += `<line x1="44" y1="${cy + 30}" x2="44" y2="${y + r.h + 26 - 34}" stroke="${B}" stroke-width="2.5" marker-end="url(#${id}a)"/>`;
      out += effect ? `<circle cx="44" cy="${cy}" r="28" fill="${B}" fill-opacity=".22" stroke="${B}" stroke-width="2.5"/>${r.c[2] && ICONS[r.c[2]] ? icon(r.c[2], 44, cy, 32, B, A) : `<text x="44" y="${cy + 6}" class="vx-n" text-anchor="middle">!</text>`}` : node(44, cy, 26, A, B, r.c[2], i + 1);
      out += txt(88, y + 20, r.lab, 'vx-l' + (effect ? ' vx-hl' : ''), 'start', 20) + txt(88, y + 20 + r.lab.length * 20 * F + 2, r.t, 'vx-t');
      y += r.h;
    });
    return { h: y + 6, body: out };
  },
  iceberg({ items, meta }, A, B) {
    const top = wrap(meta.top || '', 190, 16, true), note = wrap(meta.topnote || '', 190, 13);
    const sea = 150;
    let out = `<path d="M240 26 L292 ${sea} L188 ${sea} Z" fill="#e8f1ff" fill-opacity=".9"/>`;
    out += txt(304, 56, top, 'vx-l', 'start', 20) + txt(304, 60 + top.length * 20 * F, note, 'vx-t');
    let y = sea + 46; const rows = [];
    for (const c of items) { const lab = wrap(c[0], 330, 15, true), t = wrap(c[1], 330, 13.5); rows.push({ c, lab, t, y }); y += Math.max(48, lab.length * 19 * F + t.length * 17 * F + 16); }
    const H = y + 20;
    out += `<path d="M188 ${sea} L292 ${sea} C380 ${sea + 14} 470 ${sea + 70} 462 ${H - 64} Q450 ${H - 8} 240 ${H - 4} Q30 ${H - 8} 18 ${H - 64} C10 ${sea + 70} 100 ${sea + 14} 188 ${sea} Z" fill="${A}" fill-opacity=".16" stroke="${A}" stroke-opacity=".5" stroke-width="2"/>`;
    out = `<rect x="0" y="${sea}" width="${W}" height="${H - sea}" fill="${A}" fill-opacity=".07"/><path d="M0 ${sea} q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="${A}" stroke-width="2" stroke-opacity=".7"/>` + out;
    for (const r of rows) {
      out += r.c[2] && ICONS[r.c[2]] ? icon(r.c[2], 74, r.y + 4, 26, B, A) : `<circle cx="74" cy="${r.y + 4}" r="5" fill="${B}"/>`;
      out += txt(98, r.y + 9, r.lab, 'vx-l vx-sm', 'start', 19) + txt(98, r.y + 9 + r.lab.length * 19 * F, r.t, 'vx-t');
    }
    return { h: H, body: out };
  },
  pyramid(spec, A, B, id, flip = false) {
    const n = spec.items.length; let y = 16, out = '';
    const rows = spec.items.map((c) => { const lab = wrap(c[0], 210, 15, true), t = wrap(c[1], 210, 13.5); return { c, lab, t, h: Math.max(58, lab.length * 19 * F + t.length * 17 * F + 18) }; });
    const total = rows.reduce((s, r) => s + r.h, 0), x0 = 12, pw = 200, cx = x0 + pw / 2;
    let acc = 0;
    rows.forEach((r, i) => {
      const f0 = flip ? 1 - acc / total : acc / total, f1 = flip ? 1 - (acc + r.h) / total : (acc + r.h) / total;
      const w0 = 24 + f0 * (pw - 24), w1 = 24 + f1 * (pw - 24), y0 = y + acc, y1 = y0 + r.h - 4;
      const op = r1(0.75 - (i / Math.max(1, n - 1)) * 0.5);
      out += `<path d="M${r1(cx - w0 / 2)} ${r1(y0)} L${r1(cx + w0 / 2)} ${r1(y0)} L${r1(cx + w1 / 2)} ${r1(y1)} L${r1(cx - w1 / 2)} ${r1(y1)} Z" fill="${i % 2 ? B : A}" fill-opacity="${flip ? r1(1.05 - op) : op}"/>`;
      out += `<line x1="${r1(cx + (w0 + w1) / 4 + 4)}" y1="${r1((y0 + y1) / 2)}" x2="244" y2="${r1((y0 + y1) / 2)}" stroke="${i % 2 ? B : A}" stroke-width="1.5" stroke-dasharray="3 4"/>`;
      out += `<circle cx="248" cy="${r1((y0 + y1) / 2)}" r="4" fill="${i % 2 ? B : A}"/>`;
      const ty = (y0 + y1) / 2 - ((r.lab.length + r.t.length) * 18) / 2 + 13;
      out += txt(260, ty, r.lab, 'vx-l vx-sm', 'start', 19) + txt(260, ty + r.lab.length * 19 * F, r.t, 'vx-t');
      acc += r.h;
    });
    return { h: y + total + 10, body: out };
  },
  funnel(spec, A, B, id) { return T.pyramid(spec, A, B, id, true); },
  hub({ items, meta }, A, B) {
    const n = items.length, cx = 240, cy = 250, R = 160;
    let out = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${A}" stroke-opacity=".25" stroke-dasharray="4 7"/>`;
    const cl = wrap(meta.center || '', 100, 15, true);
    items.forEach((c, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      out += `<line x1="${r1(cx + 64 * Math.cos(a))}" y1="${r1(cy + 64 * Math.sin(a))}" x2="${r1(x - 32 * Math.cos(a))}" y2="${r1(y - 32 * Math.sin(a))}" stroke="${B}" stroke-width="2"/>`;
    });
    out += `<circle cx="${cx}" cy="${cy}" r="62" fill="${A}" fill-opacity=".25" stroke="${A}" stroke-width="2.5"/>` + txt(cx, cy - (cl.length - 1) * 9 + 5, cl, 'vx-l vx-c', 'middle', 18);
    items.forEach((c, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      out += node(x, y, 28, A, B, c[1], i + 1);
      const lab = wrap(c[0], 112, 13.5, true), below = Math.sin(a) > -0.3;
      const half = (Math.max(...lab.map((l) => l.length)) * 15.5 * 0.6) / 2, lx = Math.min(W - 4 - half, Math.max(4 + half, x));
      out += txt(lx, below ? y + 46 : y - 38 - (lab.length - 1) * 16, lab, 'vx-l vx-xs', 'middle', 16);
    });
    return { h: 500, body: out };
  },
  venn({ items, meta }, A, B) {
    const C = [A, B, '#a78bfa'];
    const three = items.length >= 3, out = [];
    const pos = three ? [[180, 160], [300, 160], [240, 262]] : [[175, 180], [305, 180]];
    const r = three ? 115 : 135;
    pos.forEach(([x, y], i) => out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${C[i]}" fill-opacity=".2" stroke="${C[i]}" stroke-width="2"/>`));
    const lp = three ? [[130, 120], [350, 120], [240, 330]] : [[110, 170], [370, 170]];
    items.slice(0, 3).forEach((c, i) => { const lab = wrap(c[0], 110, 15, true), t = wrap(c[1], 110, 12.5); const [x, y] = lp[i]; out.push(txt(x, y - (lab.length + t.length) * 8, lab, 'vx-l vx-sm', 'middle', 18) + txt(x, y - (lab.length + t.length) * 8 + lab.length * 18 * F, t, 'vx-t vx-xs', 'middle', 15)); });
    if (meta.center) { const cl = wrap(meta.center, 70, 13.5, true); const [x, y] = three ? [240, 192] : [240, 180]; out.push(txt(x, y - (cl.length - 1) * 8 + 4, cl, 'vx-l vx-xs vx-hl', 'middle', 16)); }
    return { h: three ? 390 : 330, body: out.join('') };
  },
  balance({ items, meta }, A, B) {
    const heavyRight = (meta.heavier || 'right') === 'right', t = heavyRight ? 7 : -7;
    const px = 240, py = 70, L = 140, rad = (t * Math.PI) / 180;
    const lx = px - L * Math.cos(rad), ly = py - L * Math.sin(rad), rx = px + L * Math.cos(rad), ry = py + L * Math.sin(rad);
    let out = `<path d="M${px} ${py} L${px - 26} 400 M${px} ${py} L${px + 26} 400" stroke="currentColor" stroke-opacity=".0"/>`;
    out += `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + 30}" stroke="currentColor" stroke-opacity=".5" stroke-width="3"/><path d="M${px - 22} ${py + 30} H${px + 22}" stroke="currentColor" stroke-opacity=".5" stroke-width="3"/>`;
    out += `<line x1="${r1(lx)}" y1="${r1(ly)}" x2="${r1(rx)}" y2="${r1(ry)}" stroke="currentColor" stroke-opacity=".75" stroke-width="4" stroke-linecap="round"/><circle cx="${px}" cy="${py}" r="7" fill="${A}"/>`;
    const side = (x, y, title, list, col) => {
      let s = `<path d="M${r1(x)} ${r1(y)} L${r1(x - 60)} ${r1(y + 46)} M${r1(x)} ${r1(y)} L${r1(x + 60)} ${r1(y + 46)}" stroke="${col}" stroke-opacity=".6" stroke-width="1.5"/><path d="M${r1(x - 72)} ${r1(y + 46)} H${r1(x + 72)} Q${r1(x)} ${r1(y + 72)} ${r1(x - 72)} ${r1(y + 46)} Z" fill="${col}" fill-opacity=".35" stroke="${col}" stroke-width="2"/>`;
      const tl = wrap(title, 180, 15, true); const half = (Math.max(0, ...tl.map((l) => l.length)) * 17.2 * 0.6) / 2; s += txt(Math.min(W - 4 - half, Math.max(4 + half, x)), y + 98, tl, 'vx-l vx-sm', 'middle', 18);
      let yy = y + 104 + tl.length * 18 * F;
      for (const it of list) { const l = wrap(it, 176, 13); s += `<circle cx="${r1(x - 92)}" cy="${r1(yy + 8)}" r="3.5" fill="${col}"/>` + txt(x - 82, yy + 13, l, 'vx-t', 'start', 17); yy += l.length * 17 * F + 8; }
      return { s, yy };
    };
    const left = side(lx, ly, meta.left || '', items.map((c) => c[0]).filter(Boolean), A), right = side(rx, ry, meta.right || '', items.map((c) => c[1]).filter(Boolean), B);
    out += left.s + right.s;
    return { h: Math.max(left.yy, right.yy) + 14, body: out };
  },
  stairs({ items }, A, B) {
    const n = items.length, sw = (W - 20) / n, step = 46;
    const rows = items.map((c) => ({ lab: wrap(c[0], sw - 18, 15, true), t: wrap(c[1], sw - 18, 13) }));
    const textH = Math.max(...rows.map((r) => r.lab.length * 18 * F + r.t.length * 16 * F)) + 18;
    const base = 60 + (n - 1) * step + textH;
    let out = '';
    rows.forEach((r, i) => {
      const x = 10 + i * sw, top = base - textH - i * step;
      out += `<rect x="${r1(x + 2)}" y="${r1(top)}" width="${r1(sw - 4)}" height="${r1(base - top)}" rx="8" fill="${A}" fill-opacity="${r1(0.12 + i * (0.38 / Math.max(1, n - 1)))}" stroke="${A}" stroke-opacity=".5"/>`;
      out += `<line x1="${r1(x + 2)}" y1="${r1(top)}" x2="${r1(x + sw - 2)}" y2="${r1(top)}" stroke="${B}" stroke-width="3" stroke-linecap="round"/>`;
      out += txt(x + 12, top + 24, r.lab, 'vx-l vx-sm', 'start', 18) + txt(x + 12, top + 24 + r.lab.length * 18 * F + 2, r.t, 'vx-t vx-xs', 'start', 16);
    });
    const fx = 10 + (n - 1) * sw + sw / 2, fy = base - textH - (n - 1) * step;
    out += `<circle cx="${r1(fx)}" cy="${r1(fy - 34)}" r="9" fill="${B}"/><path d="M${r1(fx)} ${r1(fy - 24)} V${r1(fy - 4)} M${r1(fx - 10)} ${r1(fy - 18)} H${r1(fx + 10)}" stroke="${B}" stroke-width="3" stroke-linecap="round"/>`;
    return { h: base + 8, body: out };
  },
  donut({ items, meta }, A, B) {
    const cols = [A, B, '#2dd4bf', '#a78bfa', '#fb7185', '#a3e635', '#38bdf8', '#facc15'];
    const vals = items.map((c) => parseFloat(String(c[1]).replace(',', '.')) || 0), total = vals.reduce((a, b) => a + b, 0) || 1;
    const cx = 120, cy = 130, R = 92, w = 32; let a0 = -Math.PI / 2, out = '';
    vals.forEach((v, i) => {
      const a1 = a0 + (v / total) * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (a, r) => `${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}`;
      out += `<path d="M${p(a0, R)} A${R} ${R} 0 ${large} 1 ${p(a1 - 0.01, R)}" fill="none" stroke="${cols[i % cols.length]}" stroke-width="${w}"/>`;
      a0 = a1;
    });
    out += `<text x="${cx}" y="${cy + 8}" class="vx-big" text-anchor="middle">${esc(String(Math.round(total * 10) / 10))}</text>` + txt(cx, cy + 30, wrap(meta.center || '', 110, 12), 'vx-t vx-xs', 'middle', 14);
    let y = 34;
    items.forEach((c, i) => { const l = wrap(c[0], 170, 14); out += `<rect x="252" y="${y - 11}" width="14" height="14" rx="4" fill="${cols[i % cols.length]}"/><text x="${W - 8}" y="${y + 1}" class="vx-l vx-sm" text-anchor="end">${esc(c[1])}</text>` + txt(274, y + 1, l, 'vx-t', 'start', 17); y += l.length * 17 * F + 12; });
    return { h: Math.max(270, y + 6), body: out };
  },
  versus({ items, meta }, A, B) {
    const bad = meta.tone !== 'neutral', cl = bad ? B : A, cr = A;
    let out = `<line x1="240" y1="20" x2="240" y2="9999" stroke="currentColor" stroke-opacity=".12" stroke-width="2"/>`;
    const head = (x, title, ic, col) => node(x, 50, 32, col, col, ic, '') + txt(x, 108, wrap(title, 200, 16, true), 'vx-l', 'middle', 19);
    out += head(120, meta.left || '', meta.lefticon, cl) + head(360, meta.right || '', meta.righticon, cr);
    out += `<circle cx="240" cy="50" r="20" fill="var(--surface, #12161f)" stroke="currentColor" stroke-opacity=".3"/><text x="240" y="56" class="vx-l vx-sm" text-anchor="middle">VS</text>`;
    const tl = Math.max(wrap(meta.left || '', 200, 16, true).length, wrap(meta.right || '', 200, 16, true).length);
    let y = 128 + tl * 19;
    for (const c of items) {
      const l = wrap(c[0], 186, 13.5), r = wrap(c[1], 186, 13.5), h = Math.max(l.length, r.length) * 17 + 16;
      out += `<rect x="14" y="${y - 4}" width="212" height="${h}" rx="10" fill="${cl}" fill-opacity=".08"/><rect x="254" y="${y - 4}" width="212" height="${h}" rx="10" fill="${cr}" fill-opacity=".12"/>`;
      out += `<text x="28" y="${y + 14}" class="vx-mk" fill="${cl}">${bad ? '✕' : '•'}</text>` + txt(46, y + 14, l, 'vx-t' + (bad ? ' vx-dim' : ''), 'start', 17);
      out += `<text x="268" y="${y + 14}" class="vx-mk" fill="${cr}">${bad ? '✓' : '•'}</text>` + txt(286, y + 14, r, 'vx-t vx-fg', 'start', 17);
      y += h + 8;
    }
    return { h: y + 4, body: out.replace('y2="9999"', `y2="${y}"`) };
  },
  timeline({ items }, A, B) {
    let y = 30, out = '';
    const rows = items.map((c) => ({ c, lab: wrap(c[1], 300, 15, true), t: wrap(c[2], 300, 13.5) }));
    rows.forEach((r, i) => { r.y = y; y += Math.max(56, r.lab.length * 19 * F + r.t.length * 17 * F + 22); });
    out += `<line x1="128" y1="24" x2="128" y2="${rows.length ? rows[rows.length - 1].y : 24}" stroke="${A}" stroke-opacity=".5" stroke-width="3"/>`;
    for (const r of rows) {
      out += txt(110, r.y + 6, wrap(r.c[0], 96, 13.5, true), 'vx-l vx-xs vx-hl', 'end', 16) + `<circle cx="128" cy="${r.y}" r="9" fill="${B}" stroke="var(--surface, #12161f)" stroke-width="3"/>`;
      out += txt(150, r.y + 6, r.lab, 'vx-l vx-sm', 'start', 19) + txt(150, r.y + 6 + r.lab.length * 19 * F, r.t, 'vx-t');
    }
    return { h: y, body: out };
  },
};

export const VISUAL_TYPES = Object.keys(T);

export function visual(src, key = 'x') {
  const spec = parseSpec(src);
  const type = (spec.meta.type || 'flow').toLowerCase();
  if (!T[type]) throw new Error(`visual: unknown type "${type}" (use ${VISUAL_TYPES.join(', ')})`);
  const [A, B] = PALETTES[hash(key + '#p') % PALETTES.length];
  const id = 'v' + (hash(key + src) % 1e6);
  const { h, body } = T[type](spec, A, B, id);
  const label = [spec.meta.title, ...spec.items.map((c) => c.filter((v) => v && !ICONS[v]).slice(0, 2).join(': '))].filter(Boolean).join('. ');
  const svg = `<svg viewBox="0 0 ${W} ${Math.ceil(h)}" role="img" aria-label="${esc(label)}"><defs><marker id="${id}a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${B}"/></marker></defs>${body}</svg>`;
  const title = spec.meta.title ? `<div class="dg-title">${esc(spec.meta.title)}</div>` : '';
  const cap = spec.meta.caption ? `<figcaption>${esc(spec.meta.caption)}</figcaption>` : '';
  return `<figure class="vx vx--${type}">${title}${svg}${cap}</figure>\n`;
}
