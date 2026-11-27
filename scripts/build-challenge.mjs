// Challenge AI: a client-side quiz generated from content/challenge.json.
//   /challenge/  and  /uk/challenge/
// The quiz runs fully in the browser; answers are never sent. Only start/finish counts are posted by public/assets/challenge.js.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { introLink, ogPath, CHANNEL, toolsLink } from './config.mjs';

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
    title: 'Challenge AI: management tools by Mykola Kalakutskyi',
    desc: 'Challenge AI tools: Managerial DNA (Express), an evidence-based view across 18 management domains (private pilot), and a free 6-question quiz on whether AI can solve your work problem.',
    hubLead: 'Tools that check management thinking against evidence, not opinions.',
    pilot: 'Private pilot', dnaTitle: 'Managerial DNA (Express)', dnaText: 'A quick, evidence-based view across all 18 management domains: up to 24 questions and about 15 minutes. You get three separate measures (observed competency, coverage, evidence confidence), what was not measured, and a private report.', dnaCta: 'Open Managerial DNA', dnaNote: 'The pilot is closed for now: access is limited.',
    quizH: 'Can AI solve your problem?',
    progress: 'Question {n} of {t}', back: 'Back', why: 'Why this verdict', steps: 'Next steps', promptTitle: 'Prompt for your chatbot', promptHint: 'Copy it into the AI tool you use. Add one or two lines about your situation.',
    copy: 'Copy prompt', copied: 'Copied', shareCopy: 'Copy result text', again: 'Take the quiz again', intro: 'Book a free intro call', tried: 'Tried it and still stuck?', triedLink: 'Book a free intro call',
    noscript: 'This quiz needs JavaScript. You can still book a free intro call or read the blog.', tryAi: 'Prefer to try AI first? Open the prompt',
    send: 'Send my result to Mykola', sendHint: 'Opens the request form with your result filled in. Nothing is sent until you press Send there.',
    follow: 'Not ready for a call? I share short management notes in my Telegram channel.', followLink: 'Outstanding PM on Telegram',
    prefill: 'My Challenge AI result: {verdict}.\nWhat pointed that way: {signals}.\nWhat I need help with: ', reqPath: '/request/',
  },
  uk: {
    lang: 'uk', pre: '/uk', home: '/uk/', other: '/challenge/', otherLabel: 'EN', otherHl: 'en', otherTitle: 'Read in English', name: 'Микола Калакуцький',
    cv: 'Резюме', cvPath: '/uk/cv/', blog: 'Блог', blogPath: '/uk/blog/', privacy: 'Конфіденційність', privacyPath: '/uk/privacy/', terms: 'Умови', termsPath: '/uk/terms/', footOther: 'English',
    title: 'Challenge AI: інструменти для менеджерів від Миколи Калакуцького',
    desc: 'Інструменти Challenge AI: Managerial DNA (Express), доказовий погляд на всі 18 доменів менеджменту (закритий пілот), і безкоштовний тест із 6 запитань: чи вирішить ШІ вашу робочу проблему.',
    hubLead: 'Інструменти, які перевіряють управлінське мислення доказами, а не думками.',
    pilot: 'Закритий пілот', dnaTitle: 'Managerial DNA (Express)', dnaText: 'Швидкий доказовий погляд на всі 18 доменів менеджменту: до 24 запитань і близько 15 хвилин. Ви отримуєте три окремі показники (спостережена компетенція, покриття, достатність доказів), список того, що не виміряно, і приватний звіт.', dnaCta: 'Відкрити Managerial DNA', dnaNote: 'Пілот поки закритий: доступ обмежений.',
    quizH: 'Чи вирішить ШІ вашу проблему?',
    progress: 'Запитання {n} з {t}', back: 'Назад', why: 'Чому такий висновок', steps: 'Наступні кроки', promptTitle: 'Промпт для вашого чатбота', promptHint: 'Скопіюйте його в ШІ-інструмент, яким користуєтеся. Додайте один-два рядки про свою ситуацію.',
    copy: 'Копіювати промпт', copied: 'Скопійовано', shareCopy: 'Копіювати текст результату', again: 'Пройти тест ще раз', intro: 'Записатися на безкоштовне знайомство', tried: 'Спробували, а проблема лишилась?', triedLink: 'Запишіться на безкоштовне знайомство',
    noscript: 'Для тесту потрібен JavaScript. Ви все одно можете записатися на безкоштовне знайомство або почитати блог.', tryAi: 'Хочете спершу спробувати ШІ? Відкрити промпт',
    send: 'Надіслати результат Миколі', sendHint: 'Відкриє форму запиту з вашим результатом. Нічого не надсилається, доки ви самі не натиснете «Надіслати» у формі.',
    follow: 'Ще не час для розмови? Короткі нотатки про менеджмент я публікую в Telegram-каналі.', followLink: 'Outstanding PM у Telegram',
    prefill: 'Мій результат у Challenge AI: {verdict}.\nНа що це вказує: {signals}.\nЗ чим мені потрібна допомога: ', reqPath: '/uk/request/',
  },
};

function page(k) {
  const u = UI[k];
  const pick = (o) => o[k];
  const cfg = {
    ui: { progress: u.progress, back: u.back, why: u.why, steps: u.steps, promptTitle: u.promptTitle, promptHint: u.promptHint, copy: u.copy, copied: u.copied, shareCopy: u.shareCopy, again: u.again, intro: u.intro, tried: u.tried, triedLink: u.triedLink, tryAi: u.tryAi, send: u.send, sendHint: u.sendHint, follow: u.follow, followLink: u.followLink, prefill: u.prefill },
    reqUrl: u.reqPath, channel: CHANNEL,
    url: `${SITE}${u.pre}/challenge/`,
    questions: Q.questions.map((q) => ({ id: q.id, text: pick(q.text), options: q.options.map((o) => ({ id: o.id, label: pick(o.label), human: o.human, signal: pick(o.signal) })) })),
    bands: Q.bands.map((b) => ({ id: b.id, min: b.min, max: b.max, title: pick(b.title), analysis: pick(b.analysis), steps: b.steps[k], cta: b.cta, introUrl: introLink('challenge-' + b.id) })),
    overrides: Q.overrides.map((o) => ({ if: o.if, minBand: o.minBand })),
    aiPrompt: Q.aiPrompt[k], share: Q.share[k],
  };
  const ld = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Challenge AI quiz', url: cfg.url, description: u.desc, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', inLanguage: k, isAccessibleForFree: true,
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
  <meta property="og:image" content="${SITE}${ogPath(cfg.url.replace(SITE, ''))}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css">
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
  <header class="site"><div class="wrap"><a class="brand" href="${u.home}">${esc(u.name)}</a><nav><a href="${u.cvPath}">${u.cv}</a><a href="${u.blogPath}">${u.blog}</a>${toolsLink(u.home)}<a href="${u.other}" hreflang="${u.otherHl}" lang="${u.otherHl}" title="${u.otherTitle}">${u.otherLabel}</a></nav></div></header>
  <main class="wrap">
    <h1>Challenge AI</h1>
    <p class="lead">${esc(u.hubLead)}</p>
    <section class="tool-card" aria-labelledby="dna-h">
      <p class="tool-tag">${esc(u.pilot)}</p>
      <h2 id="dna-h">${esc(u.dnaTitle)}</h2>
      <p>${esc(u.dnaText)}</p>
      <p><a class="btn" href="${u.pre}/challenge/express/">${esc(u.dnaCta)}</a></p>
      <p class="note">${esc(u.dnaNote)}</p>
    </section>
    <div id="qz" class="quiz tool-card" data-lang="${k}">
      <div id="qz-intro">
        <h2 class="tool-h">${esc(u.quizH)}</h2>
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

// ---------------------------------------------------------------- Managerial DNA (Express): owner-only pilot UI
// The page is a shell; public/assets/express.js talks to /api/challenge/express/* (private Worker, owner session).
// Nothing private is in this HTML: strings and domain names only. Not indexed, not in the sitemap.
const DOMAINS_UK = { SM: 'Стратегічний менеджмент', FCM: 'Фінансовий і комерційний менеджмент', PVM: 'Управління продуктом і цінністю', PRM: 'Планування й управління ресурсами',
  EDM: 'Управління виконанням і поставкою', POM: 'Управління процесами й операціями', QM: 'Управління якістю', RIM: 'Управління ризиками й проблемами', PTM: 'Управління людьми й командою',
  LI: 'Лідерство й вплив', STM: 'Управління стейкхолдерами', CN: 'Комунікація й переговори', GEC: 'Врядування, етика й комплаєнс', CTM: 'Управління змінами й трансформацією',
  MEL: 'Вимірювання, оцінювання й навчання', TM: 'Управління технологіями', AIM: 'Управління ШІ й автоматизацією', IE: 'Інновації й експерименти' };
const X = JSON.parse(readFileSync(join(ROOT, 'content', 'express.json'), 'utf8'));

function expressPage(k) {
  const u = UI[k];
  const t = X[k];
  const cfg = { lang: k, api: '/api/challenge/express', other: k === 'uk' ? '/challenge/express/' : '/uk/challenge/express/', hub: `${u.pre}/challenge/`, t, domainsUk: DOMAINS_UK };
  return `<!doctype html>
<html lang="${k}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(t.pageTitle)}</title>
  <meta name="description" content="${esc(t.pageDesc)}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="alternate" hreflang="en" href="${SITE}/challenge/express/">
  <link rel="alternate" hreflang="uk" href="${SITE}/uk/challenge/express/">
  <meta property="og:title" content="${esc(t.pageTitle)}">
  <meta property="og:description" content="${esc(t.pageDesc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}${u.pre}/challenge/express/">
  <meta property="og:image" content="${SITE}${ogPath(`${u.pre}/challenge/`)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <header class="site"><div class="wrap"><a class="brand" href="${u.home}">${esc(u.name)}</a><nav><a href="${u.pre}/challenge/">Challenge AI</a><a href="${u.blogPath}">${u.blog}</a>${toolsLink(u.home)}<a href="${cfg.other}" hreflang="${u.otherHl}" lang="${u.otherHl}" title="${u.otherTitle}" id="mx-lang">${u.otherLabel}</a></nav></div></header>
  <main class="wrap mx">
    <p class="note"><a href="${u.pre}/challenge/">Challenge AI</a> · <span class="tool-tag">${esc(u.pilot)}</span></p>
    <h1 id="mx-title" tabindex="-1">Managerial DNA (Express)</h1>
    <div id="mx" aria-live="polite"><p class="note">${esc(t.loading)}</p></div>
    <noscript><p class="note">${esc(t.noscript)}</p></noscript>
  </main>
  <footer class="site"><div class="wrap">© <span id="y">2026</span> ${esc(u.name)} · <a href="${u.pre}/challenge/">Challenge AI</a> · <a href="${u.privacyPath}">${u.privacy}</a> · <a href="${u.termsPath}">${u.terms}</a></div></footer>
  <script type="application/json" id="mx-cfg">${JSON.stringify(cfg).replace(/</g, '\\u003c')}</script>
  <script src="/assets/site.js" defer></script>
  <script src="/assets/express.js" defer></script>
</body>
</html>
`;
}

for (const k of ['en', 'uk']) {
  const d = join(ROOT, 'public', k === 'uk' ? 'uk' : '', 'challenge');
  mkdirSync(join(d, 'express'), { recursive: true });
  writeFileSync(join(d, 'index.html'), page(k));
  writeFileSync(join(d, 'express', 'index.html'), expressPage(k));
}
console.log('challenge: hub + Managerial DNA (Express) pilot pages, en + uk written');
