// Shared page shell for the Tools section pages (hub, JSE story, demo, setup guide).
import { ogPath, CHANNEL } from './config.mjs';

export const SITE = 'https://mykola.pages.dev';
export const REPO = 'https://github.com/hanizex/job-search-automation';
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------- shared chrome
export const P = {
  en: { pre: '', home: '/', name: 'Mykola Kalakutskyi', cv: 'CV', cvPath: '/cv/', blog: 'Blog', blogPath: '/blog/', tools: 'Tools', toolsPath: '/tools/', privacy: 'Privacy', privacyPath: '/privacy/', terms: 'Terms', termsPath: '/terms/', otherLabel: 'UA', otherHl: 'uk', otherTitle: 'Читати українською', footOther: 'Українською', reqPath: '/request/', prepPath: '/pm-interview-prep/', challengePath: '/challenge/' },
  uk: { pre: '/uk', home: '/uk/', name: 'Микола Калакуцький', cv: 'Резюме', cvPath: '/uk/cv/', blog: 'Блог', blogPath: '/uk/blog/', tools: 'Інструменти', toolsPath: '/uk/tools/', privacy: 'Конфіденційність', privacyPath: '/uk/privacy/', terms: 'Умови', termsPath: '/uk/terms/', otherLabel: 'EN', otherHl: 'en', otherTitle: 'Read in English', footOther: 'English', reqPath: '/uk/request/', prepPath: '/uk/pm-interview-prep/', challengePath: '/uk/challenge/' },
};
export const pth = (k, tail) => `${P[k].pre}${tail}`; // /tools/... or /uk/tools/...

export function shell(k, { path, otherPath, title, desc, crumbs, body, script, headScript, mainClass = 'jse', robots = 'index, follow, max-image-preview:large' }) {
  const p = P[k], url = `${SITE}${path}`;
  const enUrl = `${SITE}${k === 'en' ? path : otherPath}`, ukUrl = `${SITE}${k === 'uk' ? path : otherPath}`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ name: p.name, item: `${SITE}${p.home}` }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })) }];
  return `<!doctype html>
<html lang="${k}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="uk" href="${ukUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${k === 'uk' ? 'uk_UA' : 'en_US'}">
  <meta property="og:image" content="${SITE}${ogPath(path)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css">${headScript ? `\n  <script>${headScript}</script>` : ''}
  ${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n  ')}
</head>
<body>
  <header class="site"><div class="wrap"><a class="brand" href="${p.home}">${esc(p.name)}</a><nav><a href="${p.cvPath}">${p.cv}</a><a href="${p.blogPath}">${p.blog}</a><a href="${p.toolsPath}" aria-current="page">${p.tools}</a><a href="${otherPath}" hreflang="${p.otherHl}" lang="${p.otherHl}" title="${p.otherTitle}">${p.otherLabel}</a></nav></div></header>
  <main class="wrap ${mainClass}">
    ${body}
  </main>
  <footer class="site"><div class="wrap">© ${new Date().getFullYear()} ${esc(p.name)} · <a href="${p.cvPath}">${p.cv}</a> · <a href="${p.blogPath}">${p.blog}</a> · <a href="${p.toolsPath}">${p.tools}</a> · <a href="${CHANNEL}" rel="noopener">Telegram</a> · <a href="${p.privacyPath}">${p.privacy}</a> · <a href="${p.termsPath}">${p.terms}</a> · <a href="${otherPath}" hreflang="${p.otherHl}" lang="${p.otherHl}">${p.footOther}</a></div></footer>
  <script src="/assets/site.js" defer></script>${script ? `\n  <script src="${script}" defer></script>` : ''}
</body>
</html>
`;
}

