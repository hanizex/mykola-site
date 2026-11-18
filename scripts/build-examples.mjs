// Examples page: full, anonymised written feedback from real sessions.
//   /examples/  and  /uk/examples/
// Content lives in content/examples (see scripts/examples.mjs). The English page shows an English translation when one exists, otherwise the Ukrainian original.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { introLink, ogPath, CHANNEL } from './config.mjs';
import { loadExamples, UI, pathFor, KINDS, ADVICE } from './examples.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const P = {
  en: { pre: '', home: '/', other: '/uk/examples/', otherLabel: 'UA', otherHl: 'uk', otherTitle: 'Читати українською', name: 'Mykola Kalakutskyi', cv: 'CV', cvPath: '/cv/', blog: 'Blog', blogPath: '/blog/', privacy: 'Privacy', privacyPath: '/privacy/', terms: 'Terms', termsPath: '/terms/', footOther: 'Українською', reqPath: '/request/',
    title: 'Real examples of written feedback and advice from an IT project manager', desc: 'Full anonymised texts from real work: feedback after mock interviews and consultations, plus advice messages on project problems, resume and post reviews, and job search. See how deep the work goes.' },
  uk: { pre: '/uk', home: '/uk/', other: '/examples/', otherLabel: 'EN', otherHl: 'en', otherTitle: 'Read in English', name: 'Микола Калакуцький', cv: 'Резюме', cvPath: '/uk/cv/', blog: 'Блог', blogPath: '/uk/blog/', privacy: 'Конфіденційність', privacyPath: '/uk/privacy/', terms: 'Умови', termsPath: '/uk/terms/', footOther: 'English', reqPath: '/uk/request/',
    title: 'Реальні приклади письмових відгуків і порад IT project менеджера', desc: 'Повні знеособлені тексти з реальної роботи: відгуки після пробних співбесід і консультацій, а також поради щодо проєктних ситуацій, розбору резюме й текстів та пошуку роботи. Подивіться, наскільки глибока робота.' },
};

const examples = loadExamples();

function page(k) {
  const p = P[k], u = UI[k], url = `${SITE}${pathFor(k)}`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: p.name, item: `${SITE}${p.home}` },
    { '@type': 'ListItem', position: 2, name: u.crumb, item: url } ] }];
  const groups = KINDS.map((kind) => ({ kind, list: examples.filter((e) => e.kind === kind) })).filter((g) => g.list.length);
  const indexHtml = `<div class="cards">${groups.map((g) => `<a class="card" href="#g-${g.kind}"><span class="note">${esc(u.count(g.list.length))}</span><strong>${esc(u.tile[g.kind])}</strong><span class="note" style="display:block;margin-top:6px">${esc(u.kind[g.kind])}</span></a>`).join('')}</div>`;
  const howHtml = `<h2 class="sub" style="font-size:1.1rem;margin-top:30px">${esc(u.howH)}</h2><ul class="exhow">${u.how.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const article = (e, open) => {
    const v = e[k] || e.uk, orig = k === 'en' && !e.en, tr = k === 'en' && !!e.en;
    const tag = orig ? `<span class="tag">${esc(u.origUk)}</span>` : tr ? `<span class="tag">${esc(u.translated)}</span>` : '';
    return `<article class="example" id="${e.slug}"><details${open ? ' open' : ''}><summary>${esc(v.title)}${tag}</summary><div class="body"${orig ? ' lang="uk"' : ''}>${v.html}</div></details></article>`;
  };
  const section = (g) => `<h2 class="sub" id="g-${g.kind}" style="font-size:1.25rem;margin-top:34px">${esc(u.kind[g.kind])}</h2>
    <p class="note">${esc(ADVICE.includes(g.kind) ? u.groupLead.advice : u.groupLead[g.kind])}</p>
    ${g.list.map((e, i) => article(e, i === 0)).join('\n    ')}`;
  const sections = groups.map(section).join('\n    ');
  const cta = `<p style="margin-top:26px"><a class="btn" href="${p.reqPath}" data-ev="cta_click">${esc(u.cta)}</a></p>
    <p class="note">${esc(u.directQ)} <a href="${introLink('examples-' + k)}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${esc(u.directLink)}</a></p>`;
  return `<!doctype html>
<html lang="${k}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${SITE}/examples/">
  <link rel="alternate" hreflang="uk" href="${SITE}/uk/examples/">
  <link rel="alternate" hreflang="x-default" href="${SITE}/examples/">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(p.desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${k === 'uk' ? 'uk_UA' : 'en_US'}">
  <meta property="og:image" content="${SITE}${ogPath(pathFor(k))}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css">
  ${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n  ')}
</head>
<body>
  <header class="site"><div class="wrap"><a class="brand" href="${p.home}">${esc(p.name)}</a><nav><a href="${p.cvPath}">${p.cv}</a><a href="${p.blogPath}">${p.blog}</a><a href="${p.other}" hreflang="${p.otherHl}" lang="${p.otherHl}" title="${p.otherTitle}">${p.otherLabel}</a></nav></div></header>
  <main class="wrap">
    <h1 style="font-size:2rem">${esc(u.h1)}</h1>
    <p class="lead">${esc(u.lead)}</p>
    <p class="note">${esc(u.note)} ${esc(u.langNote)}</p>
    ${cta}
    <h2 class="sub" style="font-size:1.1rem;margin-top:26px">${esc(u.index)}</h2>
    ${indexHtml}
    ${howHtml}
    ${sections}
    ${cta}
  </main>
  <footer class="site"><div class="wrap">© ${new Date().getFullYear()} ${esc(p.name)} · <a href="${p.cvPath}">${p.cv}</a> · <a href="${p.blogPath}">${p.blog}</a> · <a href="${CHANNEL}" rel="noopener">Telegram</a> · <a href="${p.privacyPath}">${p.privacy}</a> · <a href="${p.termsPath}">${p.terms}</a> · <a href="${p.other}" hreflang="${p.otherHl}" lang="${p.otherHl}">${p.footOther}</a></div></footer>
  <script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

for (const k of ['en', 'uk']) {
  const d = join(ROOT, 'public', k === 'uk' ? 'uk' : '', 'examples');
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'index.html'), page(k));
}
console.log(`examples: en + uk written (${examples.length} examples)`);
