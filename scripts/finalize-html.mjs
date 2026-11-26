// Last build step for every page (after all generators): the same modern <head> and skip link everywhere,
// so the ten page generators do not each need to carry them. Safe to run twice (each insert checks first).
//   - <meta name="color-scheme" content="dark">, theme-color for the browser bar, text-scale (OS font size on phones)
//   - Speculation Rules: prefetch same-site pages when a link is hovered or pressed (not /api/, not prerender:
//     a prerendered page would count a page view that never happened)
//   - a "skip to content" link before the header and id="main" on <main>
//   - link previews (LinkedIn, Telegram, Facebook, X, Slack, WhatsApp): full Open Graph + Twitter tags on every page;
//     pages without their own card get the home card of their language
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const META = '<meta name="color-scheme" content="dark">\n  <meta name="theme-color" content="#0a0d12">\n  <meta name="text-scale" content="scale">';
const RULES = '<script type="speculationrules">{"prefetch":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/api/*"}}]},"eagerness":"moderate"}]}</script>';
const SKIP = { uk: 'Перейти до змісту', en: 'Skip to content' };
const SITE = 'https://mykola.pages.dev';
const NAME = { uk: 'Микола Калакуцький', en: 'Mykola Kalakutskyi' };
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const unattr = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const metaVal = (html, key) => { const m = html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`, 'i')); return m ? unattr(m[1]) : ''; };

function previewTags(html, rel, lang) {
  const add = [];
  const title = metaVal(html, 'og:title') || unattr((html.match(/<title>([^<]*)<\/title>/i) || [])[1] || NAME[lang]);
  const desc = metaVal(html, 'og:description') || metaVal(html, 'description') || title;
  if (!metaVal(html, 'og:title')) {
    const path = '/' + rel.replace(/index\.html$/, '').replace(/\\/g, '/');
    add.push(`<meta property="og:title" content="${attr(title)}">`, `<meta property="og:description" content="${attr(desc)}">`, '<meta property="og:type" content="website">',
      `<meta property="og:url" content="${SITE}${path}">`, `<meta property="og:locale" content="${lang === 'uk' ? 'uk_UA' : 'en_US'}">`,
      `<meta property="og:image" content="${SITE}/assets/og/${lang === 'uk' ? 'uk' : 'home'}.png">`, '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">');
  }
  const img = metaVal(html, 'og:image') || `${SITE}/assets/og/${lang === 'uk' ? 'uk' : 'home'}.png`;
  if (!metaVal(html, 'og:site_name')) add.push(`<meta property="og:site_name" content="${NAME[lang]}">`);
  if (!metaVal(html, 'og:image:alt')) add.push(`<meta property="og:image:alt" content="${attr(title)}">`);
  if (!metaVal(html, 'og:image:type') && /\.png$/i.test(img)) add.push('<meta property="og:image:type" content="image/png">');
  if (!metaVal(html, 'twitter:card')) add.push('<meta name="twitter:card" content="summary_large_image">');
  if (!metaVal(html, 'twitter:title')) add.push(`<meta name="twitter:title" content="${attr(title)}">`);
  if (!metaVal(html, 'twitter:description')) add.push(`<meta name="twitter:description" content="${attr(desc)}">`);
  if (!metaVal(html, 'twitter:image')) add.push(`<meta name="twitter:image" content="${img}">`);
  return add;
}

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
  const lang0 = /<html[^>]*lang="uk"/i.test(out) ? 'uk' : 'en';
  if (!f.endsWith('404.html')) { const tags = previewTags(out, relative(PUBLIC, f), lang0); if (tags.length) out = out.replace(/<\/head>/i, `  ${tags.join('\n  ')}\n</head>`); }
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
