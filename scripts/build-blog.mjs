// Tiny static blog generator: content/blog/*.md -> public/blog/**, plus sitemap.xml, rss.xml, llms.txt.
//   node scripts/build-blog.mjs             production: published posts only (content/blog)
//   node scripts/build-blog.mjs --drafts    local preview: also renders content/drafts, marked noindex + DRAFT banner
// Drafts are never rendered by the production build.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const NAME = 'Mykola Kalakutskyi';
const PUBLIC = join(ROOT, 'public');
const OUT = join(PUBLIC, 'blog');
const withDrafts = process.argv.includes('--drafts');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function parse(file, draft) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  for (const k of ['title', 'description', 'date', 'slug']) if (!meta[k]) throw new Error(`${file}: front matter needs "${k}"`);
  if (!/^[a-z0-9-]+$/.test(meta.slug)) throw new Error(`${file}: slug must be lowercase letters, digits, hyphens`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${file}: date must be YYYY-MM-DD`);
  const words = m[2].trim().split(/\s+/).length;
  return {
    ...meta,
    draft,
    tags: (meta.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    updated: meta.updated || meta.date,
    minutes: Math.max(1, Math.round(words / 200)),
    html: marked.parse(m[2], { gfm: true }),
  };
}

function load(dir, draft) {
  const d = join(ROOT, dir);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => f.endsWith('.md') && f !== 'README.md').map((f) => parse(join(d, f), draft));
}

const posts = [...load('content/blog', false), ...(withDrafts ? load('content/drafts', true) : [])]
  .sort((a, b) => b.date.localeCompare(a.date));
const slugs = new Set();
for (const p of posts) { if (slugs.has(p.slug)) throw new Error(`duplicate slug ${p.slug}`); slugs.add(p.slug); }

const head = ({ title, description, path, type = 'website', extra = '', noindex = false }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}${path}">
  ${noindex ? '<meta name="robots" content="noindex">' : ''}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="${NAME} — blog" href="/blog/rss.xml">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${SITE}${path}">
  <link rel="stylesheet" href="/assets/style.css">
  ${extra}
</head>`;

const header = `<header class="site"><div class="wrap"><a class="brand" href="/">${NAME}</a><nav><a href="/blog/">Blog</a><a href="/#consult">Consultation</a></nav></div></header>`;
const footer = `<footer class="site"><div class="wrap">© ${new Date().getFullYear()} ${NAME} · <a href="/blog/">Blog</a> · <a href="/privacy/">Privacy</a> · <a href="/blog/rss.xml">RSS</a></div></footer>
  <script src="/assets/site.js" defer></script>`;
const fmt = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const cta = `<aside class="panel cta">
      <strong>Want to talk it through?</strong>
      <p style="margin:6px 0 14px">A one-hour online consultation: bring your own project, team or career question. €50.</p>
      <a class="btn" href="/pay/" data-ev="cta_click">Book a consultation</a>
    </aside>`;

function postPage(p) {
  const path = `/blog/${p.slug}/`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.updated, mainEntityOfPage: `${SITE}${path}`, url: `${SITE}${path}`,
    author: { '@type': 'Person', name: NAME, url: `${SITE}/` }, publisher: { '@type': 'Person', name: NAME, url: `${SITE}/` },
    inLanguage: 'en', ...(p.tags.length ? { keywords: p.tags.join(', ') } : {}),
  };
  return `${head({ title: `${p.title} — ${NAME}`, description: p.description, path, type: 'article', noindex: p.draft,
    extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` })}
<body>
  ${header}
  <main class="wrap">
    ${p.draft ? '<p class="note" style="background:#fff3cd;padding:8px 12px;border-radius:8px"><strong>DRAFT</strong> — not published.</p>' : ''}
    <article class="post">
      <p class="note" style="margin-bottom:6px"><a href="/blog/">Blog</a> · <time datetime="${p.date}">${fmt(p.date)}</time> · ${p.minutes} min read</p>
      <h1>${esc(p.title)}</h1>
      ${p.summary ? `<p class="lead tldr"><strong>In short:</strong> ${esc(p.summary)}</p>` : ''}
      ${p.html}
      ${p.tags.length ? `<p class="note">Topics: ${p.tags.map(esc).join(' · ')}</p>` : ''}
    </article>
    ${cta}
  </main>
  ${footer}
</body>
</html>
`;
}

function indexPage() {
  const list = posts.map((p) => `<a class="card" href="/blog/${p.slug}/"><strong>${esc(p.title)}${p.draft ? ' (draft)' : ''}</strong><span>${esc(p.description)}</span><span class="note" style="display:block;margin-top:6px">${fmt(p.date)} · ${p.minutes} min read</span></a>`).join('\n        ');
  return `${head({ title: `Blog — ${NAME}`, description: 'Practical notes on project, product, delivery and operational management, for managers, founders and people starting out.', path: '/blog/', noindex: posts.every((p) => p.draft) })}
<body>
  ${header}
  <main class="wrap">
    <h1 style="font-size:2rem">Blog</h1>
    <p class="lead">Practical notes on project, product, delivery and operational management.</p>
    <div class="cards">
        ${list}
    </div>
    ${cta}
  </main>
  ${footer}
</body>
</html>
`;
}

const rss = () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${NAME} — blog</title><link>${SITE}/blog/</link><description>Practical notes on management.</description><language>en</language>
${posts.filter((p) => !p.draft).map((p) => `<item><title>${esc(p.title)}</title><link>${SITE}/blog/${p.slug}/</link><guid>${SITE}/blog/${p.slug}/</guid><pubDate>${new Date(p.date + 'T09:00:00Z').toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join('\n')}
</channel></rss>
`;

const published = posts.filter((p) => !p.draft);
const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc></url>
  <url><loc>${SITE}/privacy/</loc></url>
${published.length ? `  <url><loc>${SITE}/blog/</loc><lastmod>${published[0].updated}</lastmod></url>\n` : ''}${published.map((p) => `  <url><loc>${SITE}/blog/${p.slug}/</loc><lastmod>${p.updated}</lastmod></url>`).join('\n')}
</urlset>
`;

const llms = () => `# ${NAME}

> Project, product and delivery management. One-hour online consultations (€50) and a practical management blog.

## Pages
- [Home and consultation](${SITE}/): who I am, selected work, how to book
${published.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}/): ${p.description}`).join('\n')}
`;

rmSync(OUT, { recursive: true, force: true });
if (posts.length) {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'index.html'), indexPage());
  for (const p of posts) { mkdirSync(join(OUT, p.slug), { recursive: true }); writeFileSync(join(OUT, p.slug, 'index.html'), postPage(p)); }
  writeFileSync(join(OUT, 'rss.xml'), rss());
}
writeFileSync(join(PUBLIC, 'sitemap.xml'), sitemap());
writeFileSync(join(PUBLIC, 'llms.txt'), llms());
console.log(`blog: ${published.length} published${withDrafts ? `, ${posts.length - published.length} draft(s) rendered for preview` : ''}`);
