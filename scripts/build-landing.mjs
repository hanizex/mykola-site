// Generates the two landing pages from one content file, so EN and UK stay in sync while the copy is iterated.
//   public/index.html      (EN)
//   public/uk/index.html   (UK)
// Edit the content below, then run: node scripts/build-landing.mjs   (npm run build / deploy do it for you)

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const PHOTO = `${SITE}/assets/mykola.jpg`;
const LINKEDIN = 'https://www.linkedin.com/in/hanizex/';
const CHANNEL = 'https://t.me/outstanding_pm';
const GITHUB = 'https://github.com/hanizex';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');


// ---------------------------------------------------------------- generated abstract icons (seeded by text, so they never change between builds)
const BG = ['#eaf1ee', '#f3ebdd', '#e8eef3', '#f1e6e6'];
const FG = ['#3d6b5a', '#6f9c8a', '#c9a46c', '#c97b63', '#7a9bb5', '#8c7aa6', '#1f3d33'];
const seedFrom = (str) => { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
import { introLink } from './config.mjs';
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
let iconCount = 0;
function icon(text) {
  const seed = seedFrom(text), r = mulberry32(seed);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const bg = pick(BG);
  const cols = []; while (cols.length < 3) { const c = pick(FG); if (!cols.includes(c)) cols.push(c); }
  const id = `ic${seed.toString(36)}${iconCount++}`;
  const kind = Math.floor(r() * 5);
  let n = 0;
  // every shape flies out from the centre, spins and scales on hover (CSS reads these per-shape variables),
  // all with one duration/easing and a tiny stagger, so the icon "disassembles" and re-assembles as one rhythm
  const part = (svg, cx, cy) => {
    let vx = cx - 28, vy = cy - 28; const d = Math.hypot(vx, vy);
    if (d < 4) { const a = r() * 6.283; vx = Math.cos(a); vy = Math.sin(a); } else { vx /= d; vy /= d; }
    const mag = 5 + r() * 4;
    const st = `--dx:${(vx * mag).toFixed(1)};--dy:${(vy * mag).toFixed(1)};--r:${Math.round((r() - 0.5) * 150)}deg;--s:${(0.78 + r() * 0.55).toFixed(2)};--i:${n++}`;
    return svg.replace(/^<(\w+)/, `<$1 class="p" style="${st}"`);
  };
  let body = '';
  if (kind === 0) { // bauhaus 2x2
    const cell = (x, y) => {
      const c = pick(cols), t = Math.floor(r() * 4);
      if (t === 0) return part(`<circle cx="${x + 14}" cy="${y + 14}" r="12" fill="${c}"/>`, x + 14, y + 14);
      if (t === 1) return part(`<rect x="${x + 2}" y="${y + 2}" width="24" height="24" rx="4" fill="${c}"/>`, x + 14, y + 14);
      if (t === 2) return part(`<path d="M${x + 2} ${y + 26}A24 24 0 0 1 ${x + 26} ${y + 2}V${y + 26}Z" fill="${c}"/>`, x + 18, y + 18);
      return part(`<path d="M${x + 2} ${y + 14}a12 12 0 0 1 24 0Z" fill="${c}"/>`, x + 14, y + 10);
    };
    body = cell(0, 0) + cell(28, 0) + cell(0, 28) + cell(28, 28);
  } else if (kind === 1) { // overlapping circles
    body = [0, 1, 2].map((i) => { const cx = 14 + r() * 28, cy = 14 + r() * 28; return part(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(10 + r() * 12).toFixed(1)}" fill="${cols[i]}" opacity=".82"/>`, cx, cy); }).join('');
  } else if (kind === 2) { // bars
    body = [0, 1, 2, 3].map((i) => { const h = 14 + r() * 28; return part(`<rect x="${6 + i * 11}" y="${(50 - h).toFixed(1)}" width="8" height="${h.toFixed(1)}" rx="4" fill="${pick(cols)}"/>`, 10 + i * 11, 50 - h / 2); }).join('');
  } else if (kind === 3) { // rings
    body = [24, 17, 10].map((rad, i) => { const cx = 22 + r() * 12, cy = 22 + r() * 12; return part(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad}" fill="none" stroke="${cols[i]}" stroke-width="${(3 + r() * 3).toFixed(1)}"/>`, cx, cy); }).join('');
  } else { // waves
    body = [0, 1, 2].map((i) => { const y = 14 + i * 14, a = 5 + r() * 8; return part(`<path d="M-2 ${y}C12 ${y - a} 20 ${y + a} 30 ${y}S46 ${y - a} 58 ${y}" fill="none" stroke="${cols[i]}" stroke-width="${(3 + r() * 2.5).toFixed(1)}" stroke-linecap="round"/>`, 28, y); }).join('');
  }
  return `<svg class="ico" viewBox="0 0 56 56" width="52" height="52" aria-hidden="true" focusable="false"><defs><clipPath id="${id}"><rect width="56" height="56" rx="14"/></clipPath></defs><g clip-path="url(#${id})"><rect width="56" height="56" fill="${bg}"/>${body}</g></svg>`;
}

// ---------------------------------------------------------------- content
const EN = {
  lang: 'en', locale: 'en_US', altLocale: 'uk_UA', path: '/', otherPath: '/uk/', otherLabel: 'UA', otherTitle: 'Читати українською', otherHreflang: 'uk',
  blogPath: '/blog/', payPath: '/pay/', requestPath: '/request/', challengePath: '/challenge/', privacyPath: '/privacy/', termsPath: '/terms/', name: 'Mykola Kalakutskyi', alt: 'Микола Калакуцький',
  title: 'Mykola Kalakutskyi – IT Project & Delivery Management Consultant',
  description: 'IT project and delivery manager, consultant and mentor: 400+ consultation and mentorship sessions since 2023. When textbook answers and AI advice stop working, book a free intro call or request a one-hour online consultation.',
  ogDesc: 'I help where your AI fails. One-hour online management consultations from someone with 400+ sessions behind them.',
  nav: { cv: 'CV', projects: 'Projects', blog: 'Blog', consult: 'Consultation', challenge: 'Challenge AI' }, cvPath: '/cv/', photoAlt: 'Portrait of Mykola Kalakutskyi',
  eyebrow: 'IT project and delivery manager · consultant · mentor',
  h1: 'I help where your AI fails', h1class: '',
  lead: 'AI gave you advice. Reality said no. When the textbook has run out of scenarios and the chatbot has run out of useful answers, I look for the real cause and give you the full list of actions that fit your situation.',
  book: 'Book a free intro call', projectsBtn: 'My projects',
  stats: [
    { n: '400+', t: 'consultations and mentorship sessions since June 2023' },
    { n: '12+', t: 'years in IT' },
    { n: '18', t: 'teams built from scratch' },
    { n: '~30', t: 'recommendations on LinkedIn', href: LINKEDIN },
  ],
  statsNote: '',
  bringTitle: 'Bring me one of these',
  bring: ["The developer who doesn't want to contribute", "Unmanageable, toxic and other shitty stakeholders", "Perfect plans that never made it into real work", "Any people management approach that looks like firefighting", "Unclear priorities and goals, vague KPIs and OKRs, false expectations", "A PM process that needs an audit before it needs another PM", "A startup that doesn't want to grow, or dies before it's born", "A PM technical interview you need to survive to get the offer"],
  dossier: {"title": "Bring me one of these", "note": "Illustrative case files. Real cases stay confidential.", "kicker": "CASE FILE", "unit": "MANAGEMENT INTELLIGENCE UNIT", "seal": "MK", "fTitle": "Title", "fObjective": "Objective", "fConfidence": "Confidence", "fId": "Case ID", "tab": "CASE", "aria": "Case files: problems I solve", "prev": "Previous case", "next": "Next case", "of": "of", "objectives": ["Find the real cause of the low contribution. Agree on results, not on hours.", "Map the interests, set the boundaries, keep the project moving without losing your mind.", "Turn the plan into commitments that people actually own.", "Replace heroics with a system that stops the fire from starting.", "One list of priorities, goals you can measure, expectations that match reality.", "Find out what is actually broken before you hire or buy anything.", "Diagnose the stall: product, team, money or founder. Choose the next move.", "Prepare your answers and the stories behind them."], "conf": [96, 94, 95, 97, 94, 98, 95, 97], "stamps": ["PERSONAL", "CONFIDENTIAL", "HANDLE WITH CARE", "SENSITIVE", "DNA ON FILE", "EYES ONLY", "TOP PRIORITY", "CLASSIFIED"], "last": {"title": "UNIDENTIFIED CASES", "objective": "Not on the list? Bring it anyway! We will identify it together.", "stamp": "UNIDENTIFIED"}},
  bringNote: "Not on the list? Bring it anyway!",
  whyTitle: "You don't buy a drill. You buy a hole in the wall.",
  benefits: [["Use my experience for your needs", "No tour of theory. You get what has already worked, applied to your situation."], ["Your pain is understood", "E-commerce, fintech, edtech, iGaming, product and outsourcing teams: I have seen how it hurts in each of them."], ["You stay in sync with your tech people", "I started as a developer, so I speak your engineers' language."], ["The path is safe", "Building a team from scratch is a road I have walked more than a dozen times."], ["Big numbers are not scary", "I have led a unit of up to 45 people. We will ride your scale with fun, not fear."], ["Relax and follow", "This is not my first rodeo. You may be surprised how easily things can get solved."]],
  quotesTitle: "What people say",
  quotesSub: "Excerpts from recommendations on my LinkedIn profile.",
  quotesMore: "Read the recommendations on LinkedIn →",
  tagTranslated: "Translated from Ukrainian",
  quotes: [{"n": "Kateryna Kolosova", "r": "Strategic HRBP", "orig": "en", "en": "Within the first few minutes of our meeting, I received so many insights that I couldn't have even anticipated. The amount of experience and knowledge that Mykola was able to share with me in just one hour is impossible to describe in this brief recommendation.", "uk": "Уже за кілька перших хвилин зустрічі я отримала стільки інсайтів, яких навіть не очікувала. Обсяг досвіду й знань, яким Микола поділився зі мною всього за одну годину, неможливо описати в цій короткій рекомендації."}, {"n": "Arina Lysenko", "r": "Junior Project Manager", "orig": "uk", "en": "During an in-depth consultation we dug into nuances that could have been the root cause of the failures, which I had not even thought about. Mykola suggested ways out of the situation and showed me the direction to work in to deepen my theoretical and practical knowledge.", "uk": "Під час поглибленої консультації ми занурилися у нюанси, які могли стати першопричиною факапів, про що я навіть не замислювалася. Микола підказав мені варіанти виходу з ситуації, показав напрямок, у якому варто працювати, щоб поглибити теоретичні та практичні знання."}, {"n": "Pavlo Fedorenko", "r": "Sales & Business Development Manager", "orig": "en", "en": "Their insightful guidance during our career consultation session significantly contributed to shaping my professional trajectory, offering valuable insights on skill development.", "uk": "Змістовні поради Миколи під час кар'єрної консультації суттєво допомогли сформувати мою професійну траєкторію й дали цінні підказки щодо розвитку навичок."}, {"n": "Yuliia Machuliak", "r": "Project Manager", "orig": "en", "en": "Your mentorship has reinforced my belief that switching to Project Management was [the] correct choice and I do see endless opportunities for personal growth in this field.", "uk": "Ваше менторство зміцнило мою віру в те, що перехід у проєктний менеджмент був правильним вибором, і я бачу безмежні можливості для особистого росту в цій сфері."}, {"n": "Daria Sedihi-Volchenko", "r": "PMP, PgMP, PRINCE2 · Business Development Manager", "orig": "en", "en": "Mykola has a genuine desire to nurture talent, and his ability to inspire and motivate is exceptional. Mykola's passion for mentorship, coupled with deep expertise, make[s] him invaluable for cultivating top talent.", "uk": "У Миколи щире бажання виховувати таланти, а його здатність надихати й мотивувати виняткова. Пристрасть Миколи до менторства в поєднанні з глибокою експертизою робить його безцінним для вирощування найкращих талантів."}, {"n": "Alexandra Kostyukevich", "r": "UX/UI Designer", "orig": "en", "en": "With a sense of humor like his, any difficulties and obstacles are perceived with optimism and confidence that everything can be solved.", "uk": "З таким почуттям гумору, як у нього, будь-які труднощі й перешкоди сприймаються з оптимізмом і впевненістю, що все можна вирішити."}, {"n": "Sergey Shevchenko", "r": "Delivery Manager", "orig": "en", "en": "He consistently delivered complex mobile projects on time, combining strong technical expertise with great leadership. Mykola excelled at managing both teams and stakeholders relationships, always staying calm under pressure and focused on solutions.", "uk": "Він стабільно доставляв складні мобільні проєкти вчасно, поєднуючи сильну технічну експертизу з чудовим лідерством. Микола блискуче керував і командами, і стосунками зі стейкхолдерами, завжди зберігаючи спокій під тиском і фокус на рішеннях."}, {"n": "Olena Stepura", "r": "Founder @ PM Level Next · PMI Chapter Leader", "orig": "en", "en": "What I value especially is how naturally professionalism and personality come together here. The way he supports PMs, shares experience, invites strong speakers, and creates space where people genuinely want to return and keep learning. [...] Lucky is the one who has a mentor like this!", "uk": "Особливо ціную, як природно тут поєднуються професіоналізм і особистість. Те, як він підтримує PM, ділиться досвідом, запрошує сильних спікерів і створює простір, куди люди справді хочуть повертатися й вчитися далі. [...] Щасливий той, хто має такого ментора!"}],
  projectsSub: 'My projects and activities',
  groups: [
    { title: 'Community and teaching', cards: [
      { t: 'PM Coffee Time', role: 'Founder and host', d: 'Online meetups for PMs: 60+ meetings since October 2023, 30–50 people each.', href: 'https://pmcoffeetime.online/', go: 'Visit the site →' },
      { t: 'Outstanding PM', role: 'Author', d: 'My Telegram channel about management: practical notes, cases and discussions. 900+ subscribers, writing since January 2024.', href: CHANNEL, go: 'Open the channel →', ev: 'channel_click' },
      { t: 'SkillsUp', role: 'Teacher', d: 'I teach several practical courses.', href: 'https://skillsup.ua/about/our-team/mykola-kalakutsky/', go: 'My SkillsUp profile →' },
      { t: 'Team Challenge', role: 'PM Mentor', d: 'Free mentorship for PMs in a community of 4,400+ members.' },
      { t: 'LinkedIn', role: 'Author', d: 'Posts about project management and about 30 recommendations.', href: LINKEDIN, go: 'Open LinkedIn →' },
      { t: 'English Speaking Club', role: 'Host', d: 'A conversation club for A2–B2 levels that I run for friends. Ongoing.' },
    ] },
    { title: 'Companies and startups', cards: [
      { t: 'Mimeon', role: 'CEO and Founder', d: 'A mobile app: an endless gallery of images with no text, where the feed is filtered and sorted by your own behavior and activity.', href: 'https://mimeon.art/', go: 'Visit mimeon.art →' },
      { t: 'MyManager', role: 'CEO', d: 'An AI career manager: collects jobs daily, scores them against your CV and tracks your applications.', href: 'https://mymgr.app/', go: 'Visit mymgr.app →' },
      { t: 'CyberField Net', role: 'COO', d: 'Online cybersecurity education: a practical course with mentoring.', href: 'https://cyberfieldnet-tech.webflow.io/', go: 'Course page →' },
    ] },
  ],
  codeTitle: 'Code I wrote and shared',
  code: [
    { t: 'Job Search Automation', d: 'A daily pipeline for a structured job search: polls 9 ATS types and job boards, filters and dedupes ads, reads employer replies, tracks funding signals.', href: `${GITHUB}/job-search-automation` },
    { t: 'Mimeon Onboarding Bot', d: 'A Telegram bot that runs the Mimeon app alpha end to end: onboarding, support tickets, a Mom Test survey, rewards, funnel analytics. Google Apps Script + Sheets.', href: `${GITHUB}/mimeon-onboarding-bot` },
    { t: 'PM Coffee Time Bot', d: 'A Telegram bot for PM Coffee Time meetups: registration, calendar invites, reminders, materials, feedback. SendPulse flows + Google Apps Script.', href: `${GITHUB}/pm-coffee-time-bot` },
  ],
  codeGo: 'Open on GitHub →',
  consultTitle: 'One-hour consultation', price: '€50', priceNote: '· 60 minutes · online',
  confident: 'My experience lets me see your pain points, and their roots, more clearly than you do.',
  stepsTitle: '3 easy steps to getting the solutions:',
  steps: [
    ['Send a request.', 'Your name, LinkedIn profile and a few words about the problem.'],
    ['I reply personally', 'with a payment link and available time slots. One meeting is enough in most cases.'],
    ['Pay, pick a time and send me the context', 'so I can prepare in advance.'],
  ],
  stepsAfter: 'Nothing is paid in advance.', bookShort: 'Request a consultation',
  directQ: 'Not sure yet?', directLink: 'Book a free intro call',
  challenge: { title: 'Challenge AI', text: 'Can AI solve your problem, or do you need a human view? Six questions, about 90 seconds, free.', btn: 'Take the quiz' },
  footer: { blog: 'Blog', other: 'Українською', privacy: 'Privacy', terms: 'Terms' },
  service: { name: 'One-hour online management consultation', type: 'Management consulting', desc: 'A 60-minute online consultation on project, product, delivery or operational management, startup setup, C-level decisions, PM process audits and interview preparation.' },
  personDesc: 'IT project and delivery manager, consultant, mentor and teacher with 12+ years in IT. Looks for the root cause before choosing tools. Has run 400+ consultation and mentorship sessions since June 2023.',
  jobTitle: 'IT project and delivery manager',
  knows: ['Project management', 'Product management', 'Delivery management', 'Operational management', 'Startup management', 'Management consulting', 'AI in project management', 'Mentoring project managers'],
};

const UK = {
  lang: 'uk', locale: 'uk_UA', altLocale: 'en_US', path: '/uk/', otherPath: '/', otherLabel: 'EN', otherTitle: 'Read in English', otherHreflang: 'en',
  blogPath: '/uk/blog/', payPath: '/uk/pay/', requestPath: '/uk/request/', challengePath: '/uk/challenge/', privacyPath: '/uk/privacy/', termsPath: '/uk/terms/', name: 'Микола Калакуцький', alt: 'Mykola Kalakutskyi',
  title: 'Микола Калакуцький – консультант з IT-проєктного та delivery-менеджменту',
  description: 'IT-проєктний і delivery-менеджер, консультант і ментор: понад 400 консультацій і менторських сесій від 2023 року. Коли підручник і ШІ не допомагають, запишіться на безкоштовне знайомство або надішліть запит на годинну онлайн-консультацію.',
  ogDesc: 'Я вирішую ті проблеми, які ШІ не може. Годинні онлайн-консультації від людини з понад 400 сесіями за плечима.',
  nav: { cv: 'Резюме', projects: 'Проєкти', blog: 'Блог', consult: 'Консультація', challenge: 'Challenge AI' }, cvPath: '/uk/cv/', photoAlt: 'Портрет Миколи Калакуцького',
  eyebrow: 'IT-проєктний і delivery-менеджер · консультант · ментор',
  h1: 'Я вирішую ті проблеми, які ШІ не може', h1class: 'long',
  lead: 'ШІ дав вам пораду. Реальність сказала ні. Коли підручник вичерпав сценарії, а чатбот - корисні відповіді, я шукаю справжню причину й даю повний перелік дій, які підходять до вашої ситуації.',
  book: 'Записатися на безкоштовне знайомство', projectsBtn: 'Мої проєкти',
  stats: [
    { n: '400+', t: 'консультацій і менторських сесій від червня 2023' },
    { n: '12+', t: 'років в IT' },
    { n: '18', t: 'команд створено з нуля' },
    { n: '~30', t: 'рекомендацій у LinkedIn', href: LINKEDIN },
  ],
  statsNote: '',
  bringTitle: 'Принесіть мені одне з цього',
  bring: ["Розробник, який не хоче вкладатися в результат", "Некеровані, токсичні та інші паскудні стейкхолдери", "Ідеальні плани, які так і не дійшли до справжньої роботи", "Будь-який підхід до управління людьми, що скидається на гасіння пожеж", "Нечіткі пріоритети й цілі, розмиті KPI та OKR, хибні очікування", "PM-процес, якому потрібен аудит раніше, ніж ще один PM", "Стартап, який не хоче рости, або помирає ще до народження", "Технічна співбесіда на PM, яку треба пережити, щоб отримати оффер"],
  dossier: {"title": "Принесіть мені одне з цього", "note": "Ілюстративні справи. Реальні кейси лишаються конфіденційними.", "kicker": "СПРАВА", "unit": "ВІДДІЛ УПРАВЛІНСЬКИХ РІШЕНЬ", "seal": "МК", "fTitle": "Назва", "fObjective": "Мета", "fConfidence": "Впевненість", "fId": "№ справи", "tab": "СПРАВА", "aria": "Справи: проблеми, які я розв'язую", "prev": "Попередня справа", "next": "Наступна справа", "of": "з", "objectives": ["Знайти справжню причину низького внеску. Домовитися про результати, а не про години.", "Розкласти інтереси, поставити межі й не втратити ні проєкт, ні нерви.", "Перетворити план на зобов'язання, які люди справді беруть на себе.", "Замінити героїзм системою, яка не дає пожежі спалахнути.", "Один список пріоритетів, вимірювані цілі й очікування, що збігаються з реальністю.", "З'ясувати, що саме зламано, перш ніж когось наймати чи щось купувати.", "Поставити діагноз зупинці: продукт, команда, гроші чи засновник. Обрати наступний хід.", "Підготувати відповіді та історії, які за ними стоять."], "conf": [96, 94, 95, 97, 94, 98, 95, 97], "stamps": ["ОСОБИСТЕ", "КОНФІДЕНЦІЙНО", "З ОБЕРЕЖНІСТЮ", "ЧУТЛИВО", "ДНК У СПРАВІ", "ЛИШЕ ДЛЯ ОЧЕЙ", "ПРІОРИТЕТ", "ЗАСЕКРЕЧЕНО"], "last": {"title": "НЕВИЗНАЧЕНІ СПРАВИ", "objective": "Немає у списку? Принесіть усе одно! Визначимо, що це, разом.", "stamp": "НЕВИЗНАЧЕНО"}},
  bringNote: "Немає у списку? Принесіть усе одно!",
  whyTitle: "Ви купуєте не дриль. Ви купуєте дірку в стіні.",
  benefits: [["Використайте мій досвід для своїх потреб", "Жодної екскурсії в теорію. Ви отримуєте те, що вже працювало, застосоване до вашої ситуації."], ["Ваш біль зрозумілий", "E-commerce, fintech, edtech, iGaming, продуктові й аутсорсингові команди: я бачив, як болить у кожній із них."], ["Ви говоритимете з технарями однією мовою", "Я почав як розробник, тож розумію мову ваших інженерів."], ["Шлях безпечний", "Створення команди з нуля - дорога, якою я пройшов понад десяток разів."], ["Великі цифри не лякають", "Я керував підрозділом до 45 людей. Ваш масштаб ми проїдемо із задоволенням, а не зі страхом."], ["Я в цьому не вперше", "Розслабтеся й слідуйте за мною. Ви можете здивуватися, наскільки легко розв'язується складне."]],
  quotesTitle: "Що кажуть люди",
  quotesSub: "Уривки з рекомендацій у моєму профілі LinkedIn.",
  quotesMore: "Читати рекомендації в LinkedIn →",
  tagTranslated: "Переклад з англійської",
  quotes: [{"n": "Kateryna Kolosova", "r": "Strategic HRBP", "orig": "en", "en": "Within the first few minutes of our meeting, I received so many insights that I couldn't have even anticipated. The amount of experience and knowledge that Mykola was able to share with me in just one hour is impossible to describe in this brief recommendation.", "uk": "Уже за кілька перших хвилин зустрічі я отримала стільки інсайтів, яких навіть не очікувала. Обсяг досвіду й знань, яким Микола поділився зі мною всього за одну годину, неможливо описати в цій короткій рекомендації."}, {"n": "Arina Lysenko", "r": "Junior Project Manager", "orig": "uk", "en": "During an in-depth consultation we dug into nuances that could have been the root cause of the failures, which I had not even thought about. Mykola suggested ways out of the situation and showed me the direction to work in to deepen my theoretical and practical knowledge.", "uk": "Під час поглибленої консультації ми занурилися у нюанси, які могли стати першопричиною факапів, про що я навіть не замислювалася. Микола підказав мені варіанти виходу з ситуації, показав напрямок, у якому варто працювати, щоб поглибити теоретичні та практичні знання."}, {"n": "Pavlo Fedorenko", "r": "Sales & Business Development Manager", "orig": "en", "en": "Their insightful guidance during our career consultation session significantly contributed to shaping my professional trajectory, offering valuable insights on skill development.", "uk": "Змістовні поради Миколи під час кар'єрної консультації суттєво допомогли сформувати мою професійну траєкторію й дали цінні підказки щодо розвитку навичок."}, {"n": "Yuliia Machuliak", "r": "Project Manager", "orig": "en", "en": "Your mentorship has reinforced my belief that switching to Project Management was [the] correct choice and I do see endless opportunities for personal growth in this field.", "uk": "Ваше менторство зміцнило мою віру в те, що перехід у проєктний менеджмент був правильним вибором, і я бачу безмежні можливості для особистого росту в цій сфері."}, {"n": "Daria Sedihi-Volchenko", "r": "PMP, PgMP, PRINCE2 · Business Development Manager", "orig": "en", "en": "Mykola has a genuine desire to nurture talent, and his ability to inspire and motivate is exceptional. Mykola's passion for mentorship, coupled with deep expertise, make[s] him invaluable for cultivating top talent.", "uk": "У Миколи щире бажання виховувати таланти, а його здатність надихати й мотивувати виняткова. Пристрасть Миколи до менторства в поєднанні з глибокою експертизою робить його безцінним для вирощування найкращих талантів."}, {"n": "Alexandra Kostyukevich", "r": "UX/UI Designer", "orig": "en", "en": "With a sense of humor like his, any difficulties and obstacles are perceived with optimism and confidence that everything can be solved.", "uk": "З таким почуттям гумору, як у нього, будь-які труднощі й перешкоди сприймаються з оптимізмом і впевненістю, що все можна вирішити."}, {"n": "Sergey Shevchenko", "r": "Delivery Manager", "orig": "en", "en": "He consistently delivered complex mobile projects on time, combining strong technical expertise with great leadership. Mykola excelled at managing both teams and stakeholders relationships, always staying calm under pressure and focused on solutions.", "uk": "Він стабільно доставляв складні мобільні проєкти вчасно, поєднуючи сильну технічну експертизу з чудовим лідерством. Микола блискуче керував і командами, і стосунками зі стейкхолдерами, завжди зберігаючи спокій під тиском і фокус на рішеннях."}, {"n": "Olena Stepura", "r": "Founder @ PM Level Next · PMI Chapter Leader", "orig": "en", "en": "What I value especially is how naturally professionalism and personality come together here. The way he supports PMs, shares experience, invites strong speakers, and creates space where people genuinely want to return and keep learning. [...] Lucky is the one who has a mentor like this!", "uk": "Особливо ціную, як природно тут поєднуються професіоналізм і особистість. Те, як він підтримує PM, ділиться досвідом, запрошує сильних спікерів і створює простір, куди люди справді хочуть повертатися й вчитися далі. [...] Щасливий той, хто має такого ментора!"}],
  projectsSub: 'Мої проєкти й активності',
  groups: [
    { title: 'Спільнота й навчання', cards: [
      { t: 'PM Coffee Time', role: 'Засновник і ведучий', d: 'Онлайн-зустрічі для PM: 60+ зустрічей від жовтня 2023, по 30-50 учасників.', href: 'https://pmcoffeetime.online/', go: 'Перейти на сайт →' },
      { t: 'Outstanding PM', role: 'Автор', d: 'Мій Telegram-канал про менеджмент: практичні нотатки, кейси й дискусії. 900+ підписників, пишу від січня 2024.', href: CHANNEL, go: 'Відкрити канал →', ev: 'channel_click' },
      { t: 'SkillsUp', role: 'Викладач', d: 'Викладаю кілька практичних курсів.', href: 'https://skillsup.ua/about/our-team/mykola-kalakutsky/', go: 'Мій профіль у SkillsUp →' },
      { t: 'Team Challenge', role: 'PM-ментор', d: 'Безкоштовне менторство для PM у спільноті з 4400+ учасників.' },
      { t: 'LinkedIn', role: 'Автор', d: 'Дописи про проєктний менеджмент і близько 30 рекомендацій.', href: LINKEDIN, go: 'Відкрити LinkedIn →' },
      { t: 'English Speaking Club', role: 'Ведучий', d: 'Розмовний клуб для рівнів A2–B2, який я веду для друзів. Триває досі.' },
    ] },
    { title: 'Компанії та стартапи', cards: [
      { t: 'Mimeon', role: 'CEO і засновник', d: 'Мобільний застосунок: нескінченна галерея зображень без тексту, у якій стрічка фільтрується й сортується за вашою поведінкою та активністю.', href: 'https://mimeon.art/', go: 'Перейти на mimeon.art →' },
      { t: 'MyManager', role: 'CEO', d: 'AI-менеджер кар\'єри: щодня збирає вакансії, оцінює їх за вашим CV і відстежує ваші відгуки.', href: 'https://mymgr.app/', go: 'Перейти на mymgr.app →' },
      { t: 'CyberField Net', role: 'COO', d: 'Онлайн-освіта з кібербезпеки: практичний курс із менторською підтримкою.', href: 'https://cyberfieldnet-tech.webflow.io/', go: 'Сторінка курсу →' },
    ] },
  ],
  codeTitle: 'Код, який я написав і відкрив',
  code: [
    { t: 'Job Search Automation', d: 'Щоденний конвеєр структурованого пошуку роботи: опитує 9 типів ATS і джоб-бордів, фільтрує та дедуплікує вакансії, читає відповіді роботодавців, відстежує сигнали про фінансування.', href: `${GITHUB}/job-search-automation` },
    { t: 'Mimeon Onboarding Bot', d: 'Telegram-бот, який веде альфа-тест застосунку Mimeon від початку до кінця: онбординг, тикети підтримки, опитування за Mom Test, винагороди, аналітика воронки. Google Apps Script + Sheets.', href: `${GITHUB}/mimeon-onboarding-bot` },
    { t: 'PM Coffee Time Bot', d: 'Telegram-бот для зустрічей PM Coffee Time: реєстрація, календарні запрошення, нагадування, матеріали, відгуки. SendPulse + Google Apps Script.', href: `${GITHUB}/pm-coffee-time-bot` },
  ],
  codeGo: 'Відкрити на GitHub →',
  consultTitle: 'Консультація на одну годину', price: '€50', priceNote: '· 60 хвилин · онлайн',
  confident: 'Мій досвід дозволяє бачити ваші болі та їхні корені чіткіше, ніж бачите їх ви.',
  stepsTitle: '3 прості кроки до рішення:',
  steps: [
    ['Надішліть запит.', 'Ваше ім\'я, посилання на LinkedIn і кілька слів про проблему.'],
    ['Я відповім особисто', 'з посиланням на оплату та вільними слотами. У більшості випадків достатньо однієї зустрічі.'],
    ['Сплатіть, оберіть час і надайте контекст,', 'щоб я міг підготуватися заздалегідь.'],
  ],
  stepsAfter: 'Наперед нічого платити не потрібно.', bookShort: 'Надіслати запит на консультацію',
  directQ: 'Ще не впевнені?', directLink: 'Запишіться на безкоштовне знайомство',
  challenge: { title: 'Challenge AI', text: 'Чи впорається ШІ з вашою проблемою, чи потрібен погляд людини? Шість запитань, близько 90 секунд, безкоштовно.', btn: 'Пройти тест' },
  note: 'Сторінки оплати й бронювання поки англійською.',
  footer: { blog: 'Блог', other: 'English', privacy: 'Конфіденційність', terms: 'Умови' },
  service: { name: 'Консультація з менеджменту на одну годину', type: 'Консультування з менеджменту', desc: '60-хвилинна онлайн-консультація з проєктного, продуктового, delivery чи операційного менеджменту, запуску стартапу, рішень рівня C-level, аудиту PM-процесів і підготовки до співбесіди.' },
  personDesc: 'IT-проєктний і delivery-менеджер, консультант, ментор і викладач із 12+ роками в IT. Шукає першопричину, перш ніж обирати інструменти. Від червня 2023 року провів понад 400 консультацій і менторських сесій.',
  jobTitle: 'IT-проєктний і delivery-менеджер',
  knows: ['Проєктний менеджмент', 'Продуктовий менеджмент', 'Delivery-менеджмент', 'Операційний менеджмент', 'Менеджмент стартапів', 'Консультування з менеджменту', 'ШІ в проєктному менеджменті', 'Менторство проєктних менеджерів'],
};


// ---------------------------------------------------------------- "case files" slider
function folderHtml(L, i, f) {
  const D = L.dossier;
  return `<article class="folder${f.last ? ' unidentified' : ''}" aria-label="${esc(f.title)}">
          <div class="tab">${esc(D.tab)} ${esc(f.id)}</div>
          <div class="cover">
            <div class="hdr"><span class="seal">${esc(D.seal)}</span><div><b>${esc(D.kicker)}</b><small>${esc(D.unit)}</small></div></div>
            <div class="chev" aria-hidden="true"></div>
            <dl>
              <div class="row"><dt>${esc(D.fTitle)}</dt><dd class="ttl">${esc(f.title)}</dd></div>
              <div class="row"><dt>${esc(D.fObjective)}</dt><dd>${esc(f.objective)}</dd></div>
              <div class="row"><dt>${esc(D.fConfidence)}</dt><dd class="conf"><span class="meter"><i style="width:${f.conf == null ? 100 : f.conf}%"></i></span><b>${f.conf == null ? '??' : f.conf + '%'}</b></dd></div>
              <div class="row"><dt>${esc(D.fId)}</dt><dd class="mono">${esc(f.id)}</dd></div>
            </dl>
            <div class="stamp" aria-hidden="true">${esc(f.stamp)}</div>
            <div class="print" aria-hidden="true"></div>
          </div>
        </article>`;
}
function dossierHtml(L) {
  const D = L.dossier;
  const files = L.bring.map((t, i) => ({ title: t, objective: D.objectives[i], conf: D.conf[i], id: `MK-${String(14 + i * 7).padStart(3, '0')}`, stamp: D.stamps[i] }));
  files.push({ title: D.last.title, objective: D.last.objective, conf: null, id: 'MK-???', stamp: D.last.stamp, last: true });
  return `<div class="dossier" role="region" aria-roledescription="carousel" aria-label="${esc(D.aria)}" data-of="${esc(D.of)}" data-prev="${esc(D.prev)}" data-next="${esc(D.next)}">
      <div class="folders" tabindex="0">
        ${files.map((f, i) => folderHtml(L, i, f)).join('\n        ')}
      </div>
      <div class="dctl"><button type="button" class="dprev" aria-label="${esc(D.prev)}">‹</button><div class="dots"></div><button type="button" class="dnext" aria-label="${esc(D.next)}">›</button></div>
      <p class="note dnote">${esc(D.note)}</p>
    </div>`;
}

// ---------------------------------------------------------------- templates
const LOGOS = {
  'PM Coffee Time': 'pm-coffee-time.jpg', 'Outstanding PM': 'outstanding-pm.jpg', 'SkillsUp': 'skillsup.png', 'Team Challenge': 'team-challenge.png',
  'LinkedIn': 'linkedin.svg', 'English Speaking Club': 'english-speaking-club.jpg', 'Mimeon': 'mimeon.png', 'MyManager': 'mymanager.png', 'CyberField Net': 'cyberfield.png',
};
const mark = (t) => (LOGOS[t] ? `<img class="logo" src="/assets/logos/${LOGOS[t]}" alt="" width="52" height="52" loading="lazy">` : icon(t));
const ev = (c) => (c.ev ? c.ev : 'project_click');
const cardHtml = (c, repo = false) => {
  const inner = `${mark(c.t)}<div class="ct"><strong>${esc(c.t)}</strong>${c.role ? `<span class="role">${esc(c.role)}</span>` : ''}<span>${esc(c.d)}</span>${c.go ? `<span class="gh">${esc(c.go)}</span>` : ''}</div>`;
  return c.href
    ? `<a class="card ic" href="${c.href}" data-ev="${repo ? 'repo_click' : ev(c)}" rel="noopener">${inner}</a>`
    : `<div class="card static ic">${inner}</div>`;
};

function page(L) {
  const home = SITE + L.path, other = SITE + L.otherPath;
  const en = L.lang === 'en' ? home : other, uk = L.lang === 'uk' ? home : other;
  const person = {
    '@type': 'Person', '@id': `${SITE}/#me`, name: L.name, alternateName: L.alt, url: home, image: PHOTO, jobTitle: L.jobTitle,
    description: L.personDesc, sameAs: [GITHUB, CHANNEL, LINKEDIN], knowsAbout: L.knows,
    worksFor: [{ '@type': 'Organization', name: 'Mimeon', url: 'https://mimeon.art/' }, { '@type': 'Organization', name: 'MyManager', url: 'https://mymgr.app/' }],
    affiliation: [{ '@type': 'Organization', name: 'PM Coffee Time', url: 'https://pmcoffeetime.online/' }, { '@type': 'Organization', name: 'SkillsUp', url: 'https://skillsup.ua/' }],
  };
  const graph = { '@context': 'https://schema.org', '@graph': [person,
    { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Mykola Kalakutskyi', inLanguage: ['en', 'uk'], publisher: { '@id': `${SITE}/#me` } },
    { '@type': 'Service', name: L.service.name, serviceType: L.service.type, provider: { '@id': `${SITE}/#me` }, areaServed: 'Worldwide', inLanguage: L.lang, description: L.service.desc,
      offers: { '@type': 'Offer', price: '50', priceCurrency: 'EUR', url: `${home}#consult` } }] };
  return `<!doctype html>
<html lang="${L.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(L.title)}</title>
  <meta name="description" content="${esc(L.description)}">
  <meta name="author" content="${esc(L.name)}">
  <link rel="canonical" href="${home}">
  <link rel="alternate" hreflang="en" href="${en}">
  <link rel="alternate" hreflang="uk" href="${uk}">
  <link rel="alternate" hreflang="x-default" href="${SITE}/">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="${esc(L.name)} – ${esc(L.footer.blog)}" href="${L.blogPath}rss.xml">
  <meta property="og:title" content="${esc(L.title)}">
  <meta property="og:description" content="${esc(L.ogDesc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${home}">
  <meta property="og:image" content="${PHOTO}">
  <meta property="og:locale" content="${L.locale}">
  <meta property="og:locale:alternate" content="${L.altLocale}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/assets/style.css">
  <script type="application/ld+json">
  ${JSON.stringify(graph).replace(/</g, '\\u003c')}
  </script>
</head>
<body class="landing">
  <header class="site">
    <div class="wrap">
      <a class="brand" href="${L.path}">${esc(L.name)}</a>
      <nav><a href="${L.cvPath}">${L.nav.cv}</a><a href="#projects">${L.nav.projects}</a><a href="${L.blogPath}">${L.nav.blog}</a><a href="${L.challengePath}">${L.nav.challenge}</a><a href="#consult">${L.nav.consult}</a><a href="${L.otherPath}" hreflang="${L.otherHreflang}" lang="${L.otherHreflang}" title="${L.otherTitle}">${L.otherLabel}</a></nav>
    </div>
  </header>

  <main class="wrap">
    <div class="hero">
      <div class="hero-top">
        <img class="photo" src="/assets/mykola.jpg" width="128" height="128" alt="${esc(L.photoAlt)}" fetchpriority="high">
        <div class="hero-head">
          <p class="eyebrow">${esc(L.eyebrow)}</p>
          <h1${L.h1class ? ` class="${L.h1class}"` : ''}>${esc(L.h1)}</h1>
        </div>
      </div>
      <p class="lead">${esc(L.lead)}</p>
      <p class="cta-row">
        <a class="btn" href="${introLink('hero')}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${esc(L.book)}</a>
        <a class="btn ghost" href="#projects">${esc(L.projectsBtn)}</a>
      </p>
    </div>

    <section class="proofbar">
      <div class="stats">
        ${L.stats.map((s) => `<div class="stat">${s.href ? `<a href="${s.href}" data-ev="project_click" rel="noopener">` : ''}<strong>${esc(s.n)}</strong><span>${esc(s.t)}</span>${s.href ? '</a>' : ''}</div>`).join('\n        ')}
      </div>
      ${L.statsNote ? `<p class="note">${esc(L.statsNote)}</p>` : ''}
    </section>

    <section id="bring" class="reveal">
      <h2>${esc(L.dossier.title)}</h2>
      ${dossierHtml(L)}
    </section>

    <section id="why" class="reveal">
      <h2>${esc(L.whyTitle)}</h2>
      <div class="cards three">
        ${L.benefits.map((b) => `<div class="card static ic">${icon(b[0])}<div class="ct"><strong>${esc(b[0])}</strong><span>${esc(b[1])}</span></div></div>`).join('\n        ')}
      </div>
    </section>

    <section id="proof" class="reveal">
      <h2>${esc(L.quotesTitle)}</h2>
      <p class="note">${esc(L.quotesSub)}</p>
      <div class="quotes">
        ${L.quotes.map((q) => `<figure class="quote"><blockquote>${esc(q[L.lang])}</blockquote><figcaption><strong>${esc(q.n)}</strong><span>${esc(q.r)}</span>${q.orig !== L.lang ? `<em>${esc(L.tagTranslated)}</em>` : ''}</figcaption></figure>`).join('\n        ')}
      </div>
      <p class="note" style="margin-top:14px"><a href="${LINKEDIN}" data-ev="project_click" rel="noopener">${esc(L.quotesMore)}</a></p>
    </section>

    <section id="projects" class="reveal">
      <h2>${esc(L.projectsSub)}</h2>
      ${L.groups.map((g) => `<h3 class="sub">${esc(g.title)}</h3>
      <div class="cards three">
        ${g.cards.map((c) => cardHtml(c)).join('\n        ')}
      </div>`).join('\n      ')}
      <h3 class="sub">${esc(L.codeTitle)}</h3>
      <div class="cards three">
        ${L.code.map((c) => cardHtml({ ...c, go: L.codeGo }, true)).join('\n        ')}
      </div>
    </section>

    <section id="challenge" class="reveal">
      <h2>${esc(L.challenge.title)}</h2>
      <p>${esc(L.challenge.text)}</p>
      <a class="btn" href="${L.challengePath}" data-ev="challenge_click">${esc(L.challenge.btn)}</a>
    </section>

    <section id="consult" class="reveal">
      <h2>${esc(L.consultTitle)}</h2>
      <p class="price">${L.price} <span class="muted" style="font-size:1rem;font-weight:400">${esc(L.priceNote)}</span></p>
      <p>${esc(L.confident)}</p>
      <p class="steps-title"><strong>${esc(L.stepsTitle)}</strong></p>
      <ol class="steps">
        ${L.steps.map((s) => `<li><strong>${esc(s[0])}</strong> ${esc(s[1])}</li>`).join('\n        ')}
      </ol>
      <p class="note">${esc(L.stepsAfter)}</p>
      <a class="btn" href="${L.requestPath}" data-ev="cta_click">${esc(L.bookShort)}</a>
      <p class="note" style="margin-top:14px">${esc(L.directQ)} <a href="${introLink('consult')}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${esc(L.directLink)}</a></p>
    </section>
  </main>

  <footer class="site">
    <div class="wrap">© <span id="y">2026</span> ${esc(L.name)} · <a href="${L.cvPath}">${L.nav.cv}</a> · <a href="${L.blogPath}">${L.footer.blog}</a> · <a href="${L.otherPath}" hreflang="${L.otherHreflang}" lang="${L.otherHreflang}">${L.footer.other}</a> · <a href="${L.privacyPath}">${L.footer.privacy}</a> · <a href="${L.termsPath}">${L.footer.terms}</a> · <a href="${CHANNEL}" rel="noopener">Telegram</a> · <a href="${LINKEDIN}" rel="noopener">LinkedIn</a> · <a href="${GITHUB}" rel="noopener">GitHub</a></div>
  </footer>
  <script src="/assets/site.js" defer></script>
  <script src="/assets/dossier.js" defer></script>
</body>
</html>
`;
}

mkdirSync(join(ROOT, 'public', 'uk'), { recursive: true });
writeFileSync(join(ROOT, 'public', 'index.html'), page(EN));
writeFileSync(join(ROOT, 'public', 'uk', 'index.html'), page(UK));
console.log('landing: en + uk written');
