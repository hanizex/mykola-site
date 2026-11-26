// Last build step for every page (after all generators): the same modern <head> and skip link everywhere,
// so the ten page generators do not each need to carry them. Safe to run twice (each insert checks first).
//   - <meta name="color-scheme" content="dark">, theme-color for the browser bar, text-scale (OS font size on phones)
//   - Speculation Rules: prefetch same-site pages when a link is hovered or pressed (not /api/, not prerender:
//     a prerendered page would count a page view that never happened)
//   - a "skip to content" link before the header and id="main" on <main>
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const META = '<meta name="color-scheme" content="dark">\n  <meta name="theme-color" content="#0a0d12">\n  <meta name="text-scale" content="scale">';
const RULES = '<script type="speculationrules">{"prefetch":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/api/*"}}]},"eagerness":"moderate"}]}</script>';
const SKIP = { uk: 'Перейти до змісту', en: 'Skip to content' };

function* walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* walk(p); else if (n.endsWith('.html')) yield p;
  }
}

let changed = 0;
for (const f of walk(PUBLIC)) {
  const html = readFileSync(f, 'utf8');
  if (!/<head[\s>]/i.test(html)) continue; // fragments and verification files
  let out = html;
  if (!out.includes('name="color-scheme"')) out = out.replace(/(<meta name="viewport"[^>]*>)/i, `$1\n  ${META}`);
  if (!out.includes('type="speculationrules"')) out = out.replace(/<\/head>/i, `  ${RULES}\n</head>`);
  if (/<main[\s>]/i.test(out) && !out.includes('class="skip"')) {
    const lang = /<html[^>]*lang="uk"/i.test(out) ? 'uk' : 'en';
    out = out.replace(/<main(?![^>]*\bid=)([\s>])/i, '<main id="main"$1');
    const id = (out.match(/<main[^>]*\bid="([^"]+)"/i) || [])[1] || 'main';
    out = out.replace(/(<body[^>]*>)/i, `$1\n  <a class="skip" href="#${id}">${SKIP[lang]}</a>`);
  }
  if (out !== html) { writeFileSync(f, out); changed++; }
}
console.log(`finalize-html: ${changed} pages updated`);
