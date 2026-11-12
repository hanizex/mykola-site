// Tiny static blog generator (English + Ukrainian).
//   content/blog/*.md       English posts       -> /blog/<slug>/
//   content/uk/blog/*.md    Ukrainian posts     -> /uk/blog/<slug>/
//   content/drafts, content/uk/drafts: never built for production.
//   node scripts/build-blog.mjs             production: published posts only
//   node scripts/build-blog.mjs --drafts    local preview: also renders drafts (noindex + DRAFT banner)
// Posts are paired across languages by the front-matter `key`; hreflang is emitted only when BOTH versions are rendered.
// Also writes: sitemap.xml (with hreflang alternates), rss.xml per language, llms.txt.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { introLink } from './config.mjs';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const NAME = 'Mykola Kalakutskyi';
const NAME_UK = 'Микола Калакуцький';
const CHANNEL = 'https://t.me/outstanding_pm';
const GITHUB = 'https://github.com/hanizex';
const PHOTO = `${SITE}/assets/mykola.jpg`;
const PUBLIC = join(ROOT, 'public');
const withDrafts = process.argv.includes('--drafts');

const T = {
  en: {
    code: 'en', name: NAME, pay: '/pay/', privacy: '/privacy/', terms: '/terms/', termsLabel: 'Terms', locale: 'en_US', dateLocale: 'en-GB', base: '/blog/', wpm: 200,
    blog: 'Blog', consult: 'Consultation', min: 'min read', short: 'In short:', topics: 'Topics', privacyLabel: 'Privacy', draft: 'DRAFT: not published.',
    cta: { consult: 'Discuss your case in a free intro call', comment: 'Argue with me in the Telegram channel' },
    idxTitle: `Blog – ${NAME}`, idxH1: 'Blog',
    idxDesc: 'Practical, sharp notes on project, product, delivery and operational management, for managers, founders and people starting out.',
    idxLead: 'Practical notes on project, product, delivery and operational management.',
    feedDesc: 'Practical notes on management.', other: { label: 'UA', title: 'Читати українською' },
  },
  uk: {
    code: 'uk', name: NAME_UK, pay: '/uk/pay/', privacy: '/uk/privacy/', terms: '/uk/terms/', termsLabel: 'Умови', locale: 'uk_UA', dateLocale: 'uk-UA', base: '/uk/blog/', wpm: 170,
    blog: 'Блог', consult: 'Консультація', min: 'хв читання', short: 'Коротко:', topics: 'Теми', privacyLabel: 'Конфіденційність', draft: 'ЧЕРНЕТКА: не опубліковано.',
    cta: { consult: 'Обговорити мій кейс на безкоштовному знайомстві', comment: 'Посперечатися в Telegram-каналі' },
    idxTitle: `Блог – ${NAME_UK}`, idxH1: 'Блог',
    idxDesc: 'Практичні й різкі нотатки про проєктний, продуктовий, delivery та операційний менеджмент: для менеджерів, засновників і тих, хто тільки починає.',
    idxLead: 'Практичні нотатки про проєктний, продуктовий, delivery та операційний менеджмент.',
    feedDesc: 'Практичні нотатки про менеджмент.', other: { label: 'EN', title: 'Read in English' },
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const LINKEDIN = 'https://www.linkedin.com/in/hanizex/';
const authorFor = (lang) => ({ '@type': 'Person', name: T[lang].name, alternateName: lang === 'uk' ? NAME : NAME_UK, url: `${SITE}/`, sameAs: [GITHUB, CHANNEL, LINKEDIN] });

marked.setOptions({ gfm: true, breaks: true }); // the author writes short lines: keep single line breaks

function parse(file, lang, draft) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  for (const k of ['title', 'description', 'date', 'slug', 'key']) if (!meta[k]) throw new Error(`${file}: front matter needs "${k}"`);
  if (!/^[a-z0-9-]+$/.test(meta.slug)) throw new Error(`${file}: slug must be lowercase letters, digits, hyphens`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${file}: date must be YYYY-MM-DD`);
  const cta = meta.cta || 'consult';
  if (!['consult', 'comment', 'none'].includes(cta)) throw new Error(`${file}: cta must be consult, comment or none`);
  const words = m[2].trim().split(/\s+/).length;
  return {
    ...meta, lang, draft, cta,
    tags: (meta.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    updated: meta.updated || meta.date,
    minutes: Math.max(1, Math.round(words / T[lang].wpm)),
    html: marked.parse(m[2]),
    path: `${T[lang].base}${meta.slug}/`,
  };
}

function load(dir, lang, draft) {
  const d = join(ROOT, dir);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => f.endsWith('.md') && f !== 'README.md').map((f) => parse(join(d, f), lang, draft));
}

const posts = [
  ...load('content/blog', 'en', false), ...load('content/uk/blog', 'uk', false),
  ...(withDrafts ? [...load('content/drafts', 'en', true), ...load('content/uk/drafts', 'uk', true)] : []),
].sort((a, b) => b.date.localeCompare(a.date));
const seen = new Set();
for (const p of posts) { const id = p.path; if (seen.has(id)) throw new Error(`duplicate path ${id}`); seen.add(id); }
const byLang = (lang) => posts.filter((p) => p.lang === lang);
const twin = (p) => posts.find((q) => q.key === p.key && q.lang !== p.lang);
const published = (lang) => byLang(lang).filter((p) => !p.draft);
const hasLang = (lang) => byLang(lang).length > 0;

const fullTitle = (t, lang) => { const sfx = ` – ${T[lang].name}`; return t.length + sfx.length <= 70 ? t + sfx : t; };
const fmt = (d, lang) => new Date(d + 'T00:00:00Z').toLocaleDateString(T[lang].dateLocale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// alternates: [{lang:'en'|'uk'|'x-default', href}]
function alternates(self, other) {
  if (!other) return [];
  const en = self.lang === 'en' ? self : other, uk = self.lang === 'uk' ? self : other;
  return [{ l: 'en', h: SITE + en.path }, { l: 'uk', h: SITE + uk.path }, { l: 'x-default', h: SITE + en.path }];
}

const head = ({ lang, title, description, path, type = 'website', extra = '', noindex = false, alts = [] }) => `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="${T[lang].name}">
  <link rel="canonical" href="${SITE}${path}">
  ${alts.map((a) => `<link rel="alternate" hreflang="${a.l}" href="${a.h}">`).join('\n  ')}
  ${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="${T[lang].name} – ${T[lang].blog}" href="${T[lang].base}rss.xml">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${SITE}${path}">
  <meta property="og:locale" content="${T[lang].locale}">
  <meta property="og:image" content="${PHOTO}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/assets/style.css">
  ${extra}
</head>`;

function header(lang, switchHref) {
  const t = T[lang];
  const sw = switchHref ? `<a href="${switchHref}" hreflang="${t.other.label === 'UA' ? 'uk' : 'en'}" lang="${t.other.label === 'UA' ? 'uk' : 'en'}" title="${t.other.title}">${t.other.label}</a>` : '';
  return `<header class="site"><div class="wrap"><a class="brand" href="${lang === 'uk' ? '/uk/' : '/'}">${t.name}</a><nav><a href="${lang === 'uk' ? '/uk/cv/' : '/cv/'}">${lang === 'uk' ? 'Резюме' : 'CV'}</a><a href="${t.base}">${t.blog}</a><a href="${lang === 'uk' ? '/uk/' : '/'}#consult">${t.consult}</a>${sw}</nav></div></header>`;
}
const footer = (lang) => `<footer class="site"><div class="wrap">© ${new Date().getFullYear()} ${T[lang].name} · <a href="${T[lang].base}">${T[lang].blog}</a> · <a href="${CHANNEL}" rel="noopener">Telegram</a> · <a href="${T[lang].privacy}">${T[lang].privacyLabel}</a> · <a href="${T[lang].terms}">${T[lang].termsLabel}</a> · <a href="${T[lang].base}rss.xml">RSS</a></div></footer>
  <script src="/assets/site.js" defer></script>`;

function ctaBlock(p) {
  const t = T[p.lang];
  if (p.cta === 'consult') return `<p class="cta-line"><a class="btn" href="${introLink('blog-' + p.slug)}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${t.cta.consult}</a></p>`;
  if (p.cta === 'comment') return `<p class="cta-line"><a class="btn" href="${CHANNEL}" data-ev="channel_click" rel="noopener">${t.cta.comment}</a></p>`;
  return '';
}

function body(p) {
  // The summary box goes right AFTER the hook (the first paragraph), never before it.
  const t = T[p.lang];
  const box = p.summary ? `<p class="lead tldr"><strong>${t.short}</strong> ${esc(p.summary)}</p>` : '';
  return p.html.startsWith('<p>') ? p.html.replace('</p>', '</p>\n' + box) : box + p.html;
}

function postPage(p) {
  const t = T[p.lang], other = twin(p);
  const ld = [{
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.updated, mainEntityOfPage: `${SITE}${p.path}`, url: `${SITE}${p.path}`,
    author: authorFor(p.lang), publisher: authorFor(p.lang), inLanguage: p.lang, isPartOf: { '@type': 'Blog', name: `${t.name} – ${t.blog}`, url: `${SITE}${t.base}` },
    ...(p.tags.length ? { keywords: p.tags.join(', ') } : {}),
    ...(other ? { workTranslation: { '@type': 'BlogPosting', url: SITE + other.path, inLanguage: other.lang } } : {}),
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.name, item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: t.blog, item: `${SITE}${t.base}` },
      { '@type': 'ListItem', position: 3, name: p.title, item: `${SITE}${p.path}` },
    ],
  }];
  return `${head({ lang: p.lang, title: fullTitle(p.title, p.lang), description: p.description, path: p.path, type: 'article', noindex: p.draft,
    alts: alternates(p, other), extra: ld.map(jsonLd).join('\n  ') })}
<body>
  ${header(p.lang, other ? other.path : '')}
  <main class="wrap">
    ${p.draft ? `<p class="note" style="background:#fff3cd;padding:8px 12px;border-radius:8px"><strong>${t.draft}</strong></p>` : ''}
    <article class="post">
      <p class="note" style="margin-bottom:6px"><a href="${t.base}">${t.blog}</a> · <time datetime="${p.date}">${fmt(p.date, p.lang)}</time> · ${p.minutes} ${t.min}${other ? ` · <a href="${other.path}" hreflang="${other.lang}" lang="${other.lang}">${t.other.title} →</a>` : ''}</p>
      <h1>${esc(p.title)}</h1>
      ${body(p)}
      ${p.tags.length ? `<p class="note">${t.topics}: ${p.tags.map(esc).join(' · ')}</p>` : ''}
    </article>
    ${ctaBlock(p)}
  </main>
  ${footer(p.lang)}
</body>
</html>
`;
}

function indexPage(lang) {
  const t = T[lang], list = byLang(lang);
  const otherLang = lang === 'en' ? 'uk' : 'en';
  const sw = hasLang(otherLang) ? T[otherLang].base : '';
  const cards = list.map((p) => `<a class="card" href="${p.path}"><strong>${esc(p.title)}${p.draft ? ' (draft)' : ''}</strong><span>${esc(p.description)}</span><span class="note" style="display:block;margin-top:6px">${fmt(p.date, lang)} · ${p.minutes} ${t.min}</span></a>`).join('\n        ');
  const ld = { '@context': 'https://schema.org', '@type': 'Blog', name: `${t.name} – ${t.blog}`, url: `${SITE}${t.base}`, inLanguage: lang, author: authorFor(lang),
    blogPost: list.filter((p) => !p.draft).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: SITE + p.path, datePublished: p.date })) };
  const alts = sw ? [{ l: 'en', h: `${SITE}/blog/` }, { l: 'uk', h: `${SITE}/uk/blog/` }, { l: 'x-default', h: `${SITE}/blog/` }] : [];
  return `${head({ lang, title: t.idxTitle, description: t.idxDesc, path: t.base, noindex: list.every((p) => p.draft), alts, extra: jsonLd(ld) })}
<body>
  ${header(lang, sw)}
  <main class="wrap">
    <h1 style="font-size:2rem">${t.idxH1}</h1>
    <p class="lead">${t.idxLead}</p>
    ${sw ? `<p class="note"><a href="${sw}" hreflang="${otherLang}" lang="${otherLang}">${T[otherLang].other.title} →</a></p>` : ''}
    <div class="cards">
        ${cards}
    </div>
  </main>
  ${footer(lang)}
</body>
</html>
`;
}

const rss = (lang) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${T[lang].name} – ${T[lang].blog}</title><link>${SITE}${T[lang].base}</link><description>${T[lang].feedDesc}</description><language>${lang}</language>
${published(lang).map((p) => `<item><title>${esc(p.title)}</title><link>${SITE}${p.path}</link><guid>${SITE}${p.path}</guid><pubDate>${new Date(p.date + 'T09:00:00Z').toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join('\n')}
</channel></rss>
`;

// Sitemap: only published pages; hreflang alternates only when both language versions are published.
const pubAll = posts.filter((p) => !p.draft);
function sitemap() {
  const x = (loc, lastmod, alts) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${(alts || []).map((a) => `<xhtml:link rel="alternate" hreflang="${a.l}" href="${a.h}"/>`).join('')}</url>`;
  const homeAlts = existsSync(join(PUBLIC, 'uk', 'index.html')) ? [{ l: 'en', h: `${SITE}/` }, { l: 'uk', h: `${SITE}/uk/` }, { l: 'x-default', h: `${SITE}/` }] : [];
  const cvAlts = [{ l: 'en', h: `${SITE}/cv/` }, { l: 'uk', h: `${SITE}/uk/cv/` }, { l: 'x-default', h: `${SITE}/cv/` }];
  const chAlts = [{ l: 'en', h: `${SITE}/challenge/` }, { l: 'uk', h: `${SITE}/uk/challenge/` }, { l: 'x-default', h: `${SITE}/challenge/` }];
  const termsAlts = [{ l: 'en', h: `${SITE}/terms/` }, { l: 'uk', h: `${SITE}/uk/terms/` }, { l: 'x-default', h: `${SITE}/terms/` }];
  const privAlts = existsSync(join(PUBLIC, 'uk', 'privacy', 'index.html')) ? [{ l: 'en', h: `${SITE}/privacy/` }, { l: 'uk', h: `${SITE}/uk/privacy/` }, { l: 'x-default', h: `${SITE}/privacy/` }] : [];
  const rows = [x(`${SITE}/`, '', homeAlts), ...(homeAlts.length ? [x(`${SITE}/uk/`, '', homeAlts)] : []), ...(existsSync(join(PUBLIC, 'uk', 'cv', 'index.html')) ? [x(`${SITE}/cv/`, '2026-11-11', cvAlts), x(`${SITE}/uk/cv/`, '2026-11-11', cvAlts)] : []), x(`${SITE}/privacy/`, '', privAlts), ...(existsSync(join(PUBLIC, 'uk', 'privacy', 'index.html')) ? [x(`${SITE}/uk/privacy/`, '', privAlts)] : []), ...(existsSync(join(PUBLIC, 'uk', 'challenge', 'index.html')) ? [x(`${SITE}/challenge/`, '2026-11-12', chAlts), x(`${SITE}/uk/challenge/`, '2026-11-12', chAlts)] : []), ...(existsSync(join(PUBLIC, 'uk', 'terms', 'index.html')) ? [x(`${SITE}/terms/`, '2026-11-12', termsAlts), x(`${SITE}/uk/terms/`, '2026-11-12', termsAlts)] : [])];
  const enIdx = published('en'), ukIdx = published('uk');
  const idxAlts = enIdx.length && ukIdx.length ? [{ l: 'en', h: `${SITE}/blog/` }, { l: 'uk', h: `${SITE}/uk/blog/` }, { l: 'x-default', h: `${SITE}/blog/` }] : [];
  if (enIdx.length) rows.push(x(`${SITE}/blog/`, enIdx[0].updated, idxAlts));
  if (ukIdx.length) rows.push(x(`${SITE}/uk/blog/`, ukIdx[0].updated, idxAlts));
  for (const p of pubAll) { const o = twin(p); rows.push(x(SITE + p.path, p.updated, o && !o.draft ? alternates(p, o) : [])); }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${rows.join('\n')}
</urlset>
`;
}

const llms = () => `# ${NAME}

> IT project and delivery manager, consultant and mentor. Free intro calls, one-hour online consultations (€50, on request) and a practical management blog by the author himself. Telegram channel: ${CHANNEL}

## Pages
- [CV](${SITE}/cv/): full career history, results with dates and money figures, skills, ventures; PDF: ${SITE}/assets/cv/Mykola_Kalakutskyi_CV_EN.pdf
- [Home and consultation](${SITE}/): who I am, projects and activities, 400+ consultation and mentorship sessions, how to book a free intro call or request a consultation
- [Challenge AI](${SITE}/challenge/): free 6-question quiz that tells whether AI is enough for a work problem or a human view is needed; runs in the browser
${pubAll.filter((p) => p.lang === 'en').map((p) => `- [${p.title}](${SITE}${p.path}): ${p.description}`).join('\n')}
${published('uk').length ? `\n## Ukrainian (Українською)\n- [Challenge AI](${SITE}/uk/challenge/): безкоштовний тест із 6 запитань: чи вистачить ШІ для робочої проблеми, чи потрібен погляд людини; працює в браузері\n- [Резюме](${SITE}/uk/cv/): повна історія кар'єри, результати з датами й сумами, навички, власні проєкти; PDF: ${SITE}/assets/cv/Mykola_Kalakutskyi_CV_UA.pdf\n${published('uk').map((p) => `- [${p.title}](${SITE}${p.path}): ${p.description}`).join('\n')}\n` : ''}`;

rmSync(join(PUBLIC, 'blog'), { recursive: true, force: true });
rmSync(join(PUBLIC, 'uk', 'blog'), { recursive: true, force: true }); // keep the hand-written /uk/ landing
for (const lang of ['en', 'uk']) {
  if (!hasLang(lang)) continue;
  const dir = join(PUBLIC, T[lang].base);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), indexPage(lang));
  writeFileSync(join(dir, 'rss.xml'), rss(lang));
  for (const p of byLang(lang)) { mkdirSync(join(PUBLIC, p.path), { recursive: true }); writeFileSync(join(PUBLIC, p.path, 'index.html'), postPage(p)); }
}
writeFileSync(join(PUBLIC, 'sitemap.xml'), sitemap());
writeFileSync(join(PUBLIC, 'llms.txt'), llms());
const drafts = posts.length - pubAll.length;
console.log(`blog: ${published('en').length} en + ${published('uk').length} uk published${drafts ? `, ${drafts} draft(s) rendered for preview` : ''}`);
