// Lane A landing page: PM interview prep (mock interview + CV/story review), one hour, EUR 50.
//   /pm-interview-prep/  and  /uk/pm-interview-prep/
// Copy is deliberately plain: no invented results or numbers. Anything marked [CHECK] in private/launch-kit.md needs Mykola's OK.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { introLink, ogPath, CHANNEL, toolsLink } from './config.mjs';
import { cardsHtml, UI as EXUI } from './examples.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const L = {
  en: {
    lang: 'en', pre: '', home: '/', other: '/uk/pm-interview-prep/', otherLabel: 'UA', otherHl: 'uk', otherTitle: 'Читати українською', name: 'Mykola Kalakutskyi',
    cv: 'CV', cvPath: '/cv/', blog: 'Blog', blogPath: '/blog/', privacy: 'Privacy', privacyPath: '/privacy/', terms: 'Terms', termsPath: '/terms/', footOther: 'Українською',
    reqPath: '/request/', quizPath: '/challenge/',
    title: 'PM interview prep: mock interview and CV review, 1 hour',
    desc: 'One online hour with an experienced IT project and delivery manager: a mock interview on real PM questions, a review of your CV and your story, and a written list of next steps. EUR 50.',
    h1: 'PM interview prep: find the weak spots before the interviewer does',
    lead: 'One online hour, EUR 50. A mock interview on real project manager questions, a hard look at how you tell your last project, and a written list of what to fix first.',
    why: 'I built 18 teams from scratch, so I have sat on the hiring side of the table. I know which answers sound like experience and which sound like a list of PM verbs.',
    forH: 'Who it is for', forList: ['Project and delivery managers who keep getting interviews but not offers.', 'Juniors and career switchers aiming at a first PM role.', 'New managers who want to be sure their story holds up.'],
    notFor: 'Not for: a guaranteed offer, a ready-made script to memorise, or someone to write your CV for you.',
    hourH: 'How the hour goes', hourList: ['10 minutes: the role you are aiming at and your story so far.', '30 minutes: a mock interview with real PM questions, including questions about decisions, conflicts and what you actually did on each project phase.', '20 minutes: honest feedback and what to rework first.'],
    leaveH: 'What you leave with', leaveList: ['A list of the answers that are weakest, and why.', 'A clearer way to tell the story of your last project.', 'Detailed written point-by-point feedback within 1 working week after the mock interview.'],
    prepH: 'Before the call', prep: 'Send your CV and the job description you are aiming at, if you have them. If not, a few lines about the role are enough.',
    readH: 'Read first', read: [['8 job interview mistakes and how to avoid them', '/blog/8-mistakes-candidates-make-in-job-interviews/'], ['IT project manager skills: 10 essentials, including AI', '/blog/it-project-manager-skills-from-job-postings/']],
    quizText: 'Not sure you need a person? Take the free six-question quiz first.', quizBtn: 'Take the quiz',
    cta: 'Request the hour', ctaNote: 'You send a short request. I reply personally within 1 to 2 working days with a payment link and time slots. Nothing is paid in advance.',
    directQ: 'Want to talk first?', directLink: 'Book a free 20-minute intro call',
    termsNote: 'Free rescheduling up to 24 hours before. Details are in the', termsLink: 'terms',
    crumbHome: 'Mykola Kalakutskyi', crumb: 'PM interview prep',
  },
  uk: {
    lang: 'uk', pre: '/uk', home: '/uk/', other: '/pm-interview-prep/', otherLabel: 'EN', otherHl: 'en', otherTitle: 'Read in English', name: 'Микола Калакуцький',
    cv: 'Резюме', cvPath: '/uk/cv/', blog: 'Блог', blogPath: '/uk/blog/', privacy: 'Конфіденційність', privacyPath: '/uk/privacy/', terms: 'Умови', termsPath: '/uk/terms/', footOther: 'English',
    reqPath: '/uk/request/', quizPath: '/uk/challenge/',
    title: 'Підготовка до співбесіди на PM: пробна співбесіда й розбір резюме, 1 година',
    desc: 'Одна онлайн-година з досвідченим IT project і delivery менеджером: пробна співбесіда на реальних питаннях для PM, розбір резюме та вашої історії й письмовий список наступних кроків. EUR 50.',
    h1: 'Підготовка до співбесіди на PM: знайдіть слабкі місця раніше, ніж інтерв\'юер',
    lead: 'Одна онлайн-година, EUR 50. Пробна співбесіда на реальних питаннях для проєктного менеджера, чесний погляд на те, як ви розповідаєте про останній проєкт, і письмовий список, що виправляти першим.',
    why: 'Я з нуля збудував 18 команд, тож сидів і по той бік столу, де наймають. Знаю, які відповіді звучать як досвід, а які як перелік PM-дієслів.',
    forH: 'Кому підійде', forList: ['Проєктним і delivery менеджерам, яких запрошують на співбесіди, але оффера немає.', 'Джуніорам і тим, хто переходить у PM з іншої ролі.', 'Новим менеджерам, які хочуть переконатися, що їхня історія витримує питання.'],
    notFor: 'Не підійде, якщо потрібні: гарантований оффер, готовий скрипт для заучування або людина, яка напише резюме за вас.',
    hourH: 'Як проходить година', hourList: ['10 хвилин: роль, на яку ви цілитеся, і ваша історія.', '30 хвилин: пробна співбесіда з реальними питаннями для PM, зокрема про рішення, конфлікти й те, що ви насправді робили на кожній фазі проєкту.', '20 хвилин: чесний фідбек і що переробити першим.'],
    leaveH: 'З чим ви підете', leaveList: ['Список найслабших відповідей і чому вони слабкі.', 'Чіткіший спосіб розповідати про свій останній проєкт.', 'Детальний письмовий відгук за пунктами протягом 1 робочого тижня після пробної співбесіди.'],
    prepH: 'Перед розмовою', prep: 'Надішліть резюме й опис вакансії, на яку цілитеся, якщо вони є. Якщо немає, достатньо кількох рядків про роль.',
    readH: 'Спершу почитайте', read: [['8 помилок на співбесіді, які коштують вам оффера', '/uk/blog/8-pomylok-na-spivbesidi/'], ['Навички IT-проєктного менеджера: 10 головних, включно зі ШІ', '/uk/blog/navychky-it-proektnoho-menedzhera/']],
    quizText: 'Не впевнені, що потрібна людина? Спершу пройдіть безкоштовний тест із шести запитань.', quizBtn: 'Пройти тест',
    cta: 'Запросити годину', ctaNote: 'Ви надсилаєте короткий запит. Я відповідаю особисто протягом 1-2 робочих днів: надсилаю посилання на оплату й вільні слоти. Наперед нічого не сплачується.',
    directQ: 'Хочете спершу поговорити?', directLink: 'Записатися на безкоштовне знайомство на 20 хвилин',
    termsNote: 'Безкоштовне перенесення за 24 години до зустрічі. Деталі в', termsLink: 'умовах',
    crumbHome: 'Микола Калакуцький', crumb: 'Підготовка до співбесіди на PM',
  },
};

function page(k) {
  const c = L[k], url = `${SITE}${c.pre}/pm-interview-prep/`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Service', name: c.title, description: c.desc, url, inLanguage: k, serviceType: 'Interview preparation for project managers',
      provider: { '@type': 'Person', name: c.name, url: `${SITE}${c.home}`, sameAs: ['https://www.linkedin.com/in/hanizex/', CHANNEL, 'https://github.com/hanizex'] },
      offers: { '@type': 'Offer', price: '50', priceCurrency: 'EUR', url: `${SITE}${c.reqPath}` } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: c.crumbHome, item: `${SITE}${c.home}` },
      { '@type': 'ListItem', position: 2, name: c.crumb, item: url } ] },
  ];
  return `<!doctype html>
<html lang="${k}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.title)}</title>
  <meta name="description" content="${esc(c.desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${SITE}/pm-interview-prep/">
  <link rel="alternate" hreflang="uk" href="${SITE}/uk/pm-interview-prep/">
  <link rel="alternate" hreflang="x-default" href="${SITE}/pm-interview-prep/">
  <meta property="og:title" content="${esc(c.title)}">
  <meta property="og:description" content="${esc(c.desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${k === 'uk' ? 'uk_UA' : 'en_US'}">
  <meta property="og:image" content="${SITE}${ogPath(c.pre + '/pm-interview-prep/')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css">
  ${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n  ')}
</head>
<body>
  <header class="site"><div class="wrap"><a class="brand" href="${c.home}">${esc(c.name)}</a><nav><a href="${c.cvPath}">${c.cv}</a><a href="${c.blogPath}">${c.blog}</a>${toolsLink(c.home)}<a href="${c.other}" hreflang="${c.otherHl}" lang="${c.otherHl}" title="${c.otherTitle}">${c.otherLabel}</a></nav></div></header>
  <main class="wrap">
    <h1 style="font-size:2rem">${esc(c.h1)}</h1>
    <p class="lead">${esc(c.lead)}</p>
    <p>${esc(c.why)}</p>
    <p><a class="btn" href="${c.reqPath}" data-ev="cta_click">${esc(c.cta)}</a></p>
    <div class="cgrid">
      <div class="panel"><h2 class="sub" style="font-size:1.1rem">${esc(c.forH)}</h2><ul class="tick">${c.forList.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p class="note">${esc(c.notFor)}</p></div>
      <div class="panel"><h2 class="sub" style="font-size:1.1rem">${esc(c.leaveH)}</h2><ul class="tick">${c.leaveList.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <div class="panel" style="margin-top:18px"><h2 class="sub" style="font-size:1.1rem">${esc(c.hourH)}</h2><ol class="plain">${c.hourList.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      <h2 class="sub" style="font-size:1.1rem;margin-top:18px">${esc(c.prepH)}</h2><p>${esc(c.prep)}</p></div>
    <h2 class="sub" style="font-size:1.1rem;margin-top:26px">${esc(EXUI[k].blockH)}</h2>
    <p>${esc(EXUI[k].blockLead)}</p>
    ${cardsHtml(k, { kinds: ['interview', 'review', 'career'], limit: 4, caps: { interview: 2 } })}
    <h2 class="sub" style="font-size:1.1rem;margin-top:26px">${esc(c.readH)}</h2>
    <ul class="tick">${c.read.map((r) => `<li><a href="${r[1]}">${esc(r[0])}</a></li>`).join('')}</ul>
    <p class="note">${esc(c.quizText)} <a href="${c.quizPath}" data-ev="challenge_click">${esc(c.quizBtn)}</a></p>
    <p style="margin-top:26px"><a class="btn" href="${c.reqPath}" data-ev="cta_click">${esc(c.cta)}</a></p>
    <p class="note">${esc(c.ctaNote)}</p>
    <p class="note">${esc(c.directQ)} <a href="${introLink('prep-' + k)}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${esc(c.directLink)}</a></p>
    <p class="note">${esc(c.termsNote)} <a href="${c.termsPath}">${esc(c.termsLink)}</a>.</p>
  </main>
  <footer class="site"><div class="wrap">© ${new Date().getFullYear()} ${esc(c.name)} · <a href="${c.cvPath}">${c.cv}</a> · <a href="${c.blogPath}">${c.blog}</a> · <a href="${CHANNEL}" rel="noopener">Telegram</a> · <a href="${c.privacyPath}">${c.privacy}</a> · <a href="${c.termsPath}">${c.terms}</a> · <a href="${c.other}" hreflang="${c.otherHl}" lang="${c.otherHl}">${c.footOther}</a></div></footer>
  <script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

for (const k of ['en', 'uk']) {
  const d = join(ROOT, 'public', k === 'uk' ? 'uk' : '', 'pm-interview-prep');
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'index.html'), page(k));
}
console.log('prep: en + uk written');
