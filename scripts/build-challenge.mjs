// Challenge AI: a client-side quiz generated from content/challenge.json.
//   /challenge/  and  /uk/challenge/
// The quiz runs fully in the browser; answers are never sent. Only start/finish counts are posted by public/assets/challenge.js.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { introLink } from './config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const Q = JSON.parse(readFileSync(join(ROOT, 'content', 'challenge.json'), 'utf8'));

// --- validate the content so a bad edit fails the build, not the visitor ---
const max = Q.questions.reduce((a, q) => a + Math.max(...q.options.map((o) => o.human)), 0);
const seen = new Set();
for (const b of Q.bands) for (let i = b.min; i <= b.max; i++) { if (seen.has(i)) throw new Error(`challenge: score ${i} in two bands`); seen.add(i); }
for (let i = 0; i <= max; i++) if (!seen.has(i)) throw new Error(`challenge: score ${i} not in any band`);
for (const k of ['en', 'uk']) for (const q of Q.questions) for (const o of q.options) if (!o.label[k] || !o.signal[k]) throw new Error(`challenge: missing ${k} text in ${q.id}/${o.id}`);

const UI = {
  en: {
    lang: 'en', pre: '', home: '/', other: '/uk/challenge/', otherLabel: 'UA', otherHl: 'uk', otherTitle: 'Читати українською', name: 'Mykola Kalakutskyi',
    cv: 'CV', cvPath: '/cv/', blog: 'Blog', blogPath: '/blog/', privacy: 'Privacy', privacyPath: '/privacy/', terms: 'Terms', termsPath: '/terms/', footOther: 'Українською',
    title: 'Challenge AI: can AI solve your problem? Free 6-question quiz',
    desc: 'A free 90-second quiz: describe your work problem in six short questions and find out whether AI is enough, AI plus a human check, or a conversation with a person.',
    progress: 'Question {n} of {t}', back: 'Back', why: 'Why this verdict', steps: 'Next steps', promptTitle: 'Prompt for your chatbot', promptHint: 'Copy it into the AI tool you use. Add one or two lines about your situation.',
    copy: 'Copy prompt', copied: 'Copied', shareCopy: 'Copy result text', again: 'Take the quiz again', intro: 'Book a free intro call', tried: 'Tried it and still stuck?', triedLink: 'Book a free intro call',
    noscript: 'This quiz needs JavaScript. You can still book a free intro call or read the blog.', tryAi: 'Prefer to try AI first? Open the prompt',
  },
  uk: {
    lang: 'uk', pre: '/uk', home: '/uk/', other: '/challenge/', otherLabel: 'EN', otherHl: 'en', otherTitle: 'Read in English', name: 'Микола Калакуцький',
    cv: 'Резюме', cvPath: '/uk/cv/', blog: 'Блог', blogPath: '/uk/blog/', privacy: 'Конфіденційність', privacyPath: '/uk/privacy/', terms: 'Умови', termsPath: '/uk/terms/', footOther: 'English',
    title: 'Challenge AI: чи вирішить ШІ вашу проблему? Безкоштовний тест із 6 запитань',
    desc: 'Безкоштовний тест на 90 секунд: опишіть робочу проблему шістьма короткими запитаннями й дізнайтеся, чи вистачить ШІ, чи потрібні ШІ плюс перевірка людиною, чи розмова з людиною.',
    progress: 'Запитання {n} з {t}', back: 'Назад', why: 'Чому такий висновок', steps: 'Наступні кроки', promptTitle: 'Промпт для вашого чатбота', promptHint: 'Скопіюйте його в ШІ-інструмент, яким користуєтеся. Додайте один-два рядки про свою ситуацію.',
    copy: 'Копіювати промпт', copied: 'Скопійовано', shareCopy: 'Копіювати текст результату', again: 'Пройти тест ще раз', intro: 'Записатися на безкоштовне знайомство', tried: 'Спробували, а проблема лишилась?', triedLink: 'Запишіться на безкоштовне знайомство',
    noscript: 'Для тесту потрібен JavaScript. Ви все одно можете записатися на безкоштовне знайомство або почитати блог.', tryAi: 'Хочете спершу спробувати ШІ? Відкрити промпт',
  },
};

function page(k) {
  const u = UI[k];
  const pick = (o) => o[k];
  const cfg = {
    ui: { progress: u.progress, back: u.back, why: u.why, steps: u.steps, promptTitle: u.promptTitle, promptHint: u.promptHint, copy: u.copy, copied: u.copied, shareCopy: u.shareCopy, again: u.again, intro: u.intro, tried: u.tried, triedLink: u.triedLink, tryAi: u.tryAi },
    url: `${SITE}${u.pre}/challenge/`,
    questions: Q.questions.map((q) => ({ id: q.id, text: pick(q.text), options: q.options.map((o) => ({ id: o.id, label: pick(o.label), human: o.human, signal: pick(o.signal) })) })),
    bands: Q.bands.map((b) => ({ id: b.id, min: b.min, max: b.max, title: pick(b.title), analysis: pick(b.analysis), steps: b.steps[k], cta: b.cta, introUrl: introLink('challenge-' + b.id) })),
    overrides: Q.overrides.map((o) => ({ if: o.if, minBand: o.minBand })),
    aiPrompt: Q.aiPrompt[k], share: Q.share[k],
  };
  const ld = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Challenge AI', url: cfg.url, description: u.desc, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', inLanguage: k, isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, author: { '@type': 'Person', name: u.name, url: `${SITE}${u.home}` } };
  const intro = Q.intro[k];
  return `<!doctype html>
<html lang="${k}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(u.title)}</title>
  <meta name="description" content="${esc(u.desc)}">
  <link rel="canonical" href="${cfg.url}">
  <link rel="alternate" hreflang="en" href="${SITE}/challenge/">
  <link rel="alternate" hreflang="uk" href="${SITE}/uk/challenge/">
  <link rel="alternate" hreflang="x-default" href="${SITE}/challenge/">
  <meta property="og:title" content="${esc(u.title)}">
  <meta property="og:description" content="${esc(u.desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${cfg.url}">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css">
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
  <header class="site"><div class="wrap"><a class="brand" href="${u.home}">${esc(u.name)}</a><nav><a href="${u.cvPath}">${u.cv}</a><a href="${u.blogPath}">${u.blog}</a><a href="${u.other}" hreflang="${u.otherHl}" lang="${u.otherHl}" title="${u.otherTitle}">${u.otherLabel}</a></nav></div></header>
  <main class="wrap">
    <div id="qz" class="quiz" data-lang="${k}">
      <div id="qz-intro">
        <h1>${esc(intro.title)}</h1>
        <p class="lead">${esc(intro.lead)}</p>
        <p><button class="btn" type="button" id="qz-start" data-ev="challenge_start">${esc(intro.start)}</button></p>
        <p class="note">${esc(Q.disclaimer[k])}</p>
        <noscript><p class="note">${esc(u.noscript)}</p></noscript>
      </div>
      <div id="qz-q" hidden></div>
      <div id="qz-res" hidden></div>
    </div>
  </main>
  <footer class="site"><div class="wrap">© <span id="y">2026</span> ${esc(u.name)} · <a href="${u.cvPath}">${u.cv}</a> · <a href="${u.blogPath}">${u.blog}</a> · <a href="${u.other}" hreflang="${u.otherHl}" lang="${u.otherHl}">${u.footOther}</a> · <a href="${u.privacyPath}">${u.privacy}</a> · <a href="${u.termsPath}">${u.terms}</a></div></footer>
  <script>window.__QUIZ = ${JSON.stringify(cfg).replace(/</g, '\\u003c')};</script>
  <script src="/assets/site.js" defer></script>
  <script src="/assets/challenge.js" defer></script>
</body>
</html>
`;
}

for (const k of ['en', 'uk']) {
  const d = join(ROOT, 'public', k === 'uk' ? 'uk' : '', 'challenge');
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'index.html'), page(k));
}
console.log('challenge: en + uk written');
