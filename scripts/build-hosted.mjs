// JSE online tracker guide: /tools/job-search-engine/hosted/ (EN) and /uk/tools/job-search-engine/hosted/ (UK).
// A standalone page: how to connect Claude or ChatGPT (connector), and the manual mode for Gemini and other chats
// (copy-paste the assistant pack, then Copy for AI / Apply AI result). No readiness checks, no screenshots of private data.
// The pack text is read from the public repo job-search-automation (assistant/), next to this repo, at build time.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, esc, P, pth, shell, REPO } from './tools-shell.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACK = process.env.JSE_PACK_DIR || join(ROOT, '..', 'job-search-automation', 'assistant');
const read = (f) => { const p = join(PACK, f); if (!existsSync(p)) throw new Error('pack file missing: ' + p); return readFileSync(p, 'utf8').trim() + '\n'; };
const FILES = [
  ['project-instructions.md', 'project-instructions.md'], ['modules/01-profile-interview.md', 'modules/01-profile-interview.md'],
  ['modules/02-fact-bank.md', 'modules/02-fact-bank.md'], ['modules/03-master-cv.md', 'modules/03-master-cv.md'],
  ['modules/04-tailor-to-job.md', 'modules/04-tailor-to-job.md'], ['modules/05-after-an-interview.md', 'modules/05-after-an-interview.md'],
  ['templates/fact_bank.md', 'templates/fact_bank.md'], ['templates/fact_inbox.md', 'templates/fact_inbox.md'], ['templates/master_cv.md', 'templates/master_cv.md'],
];

const SHOT = { chatgpt: '/assets/jse/chatgpt-add-mcp.jpg', claude: '/assets/jse/claude-add-connector.jpg' };

const G = {
  en: {
    title: 'Set up the Job Search Engine online tracker', desc: 'How to use the online Job Search Engine tracker with Claude, ChatGPT, Gemini or any other AI chat: MCP connector steps and a manual copy-and-paste mode.',
    crumb: 'Online tracker guide', h1: 'Set up the online tracker',
    noticeAccent: 'Free access during the test period.', notice: ' To get a personal link, write to me (see the end of this page). Your link is your key: do not share it.',
    lead: 'The online tracker collects fitting jobs for you every morning and keeps their statuses. Your AI chat does the thinking: it sets your search goals, screens an ad against your own facts and writes your CV and messages. This page shows how to connect it.',
    whatH: 'What you need',
    whatList: [['A personal tracker link from me (it looks like a web address that ends in a long secret).'], ['An AI chat with projects or custom instructions: Claude, ChatGPT or Gemini (Gems) are fine. A free plan is enough.'],
      ['Your CV, or several, plus a LinkedIn profile data export, to build the Fact Bank. The Fact Bank is then used to tailor CVs and cover letters. Your data is processed on your side, in your own chat. ', 'No sensitive information is sent to the online tracker.']],
    aH: 'Way A: Claude or ChatGPT ', aAccent: '(MCP connector, recommended)', aLead: 'You work with the tracker and its jobs through your chat: you read the content, refine your goals and update cards. The tracker is the single universal dashboard and the source of statuses for every job (so the tracker really is a tracker 🙂).',
    aSteps: [
      { t: 'Open your tracker link in a browser. At the bottom of the page you see a connector address. Press "Copy connector address".' },
      { t: 'Claude: open claude.ai/plugins/yours, press Add, then Add custom connector. Paste the address of the custom MCP (the link must end with "/mcp"). Choose any name you like and leave the OAuth settings alone. The free plan allows one custom connector.', img: 'claude', alt: 'Claude: the Add menu with "Add custom connector"' },
      { t: 'ChatGPT (a free plan works too): open chatgpt.com/plugins, press Add, then Add custom MCP server. Paste the address of the custom MCP (the link must end with "/mcp"). Set authentication to "No authentication". Description, name and icon: whatever you like.', img: 'chatgpt', alt: 'ChatGPT: the dialog "Add custom MCP server" with the authentication list' },
      { t: 'Start a new chat and write: "Help me set up my job search with the online tracker via MCP." The chat loads the rules from the tracker, asks about your goals, proposes up to 3 search terms and asks you to confirm.' },
      { t: 'Next you will build the Fact Bank and prepare the Master CV. Your AI chat already has all the instructions: it knows what must be collected so that everything is enough for the work, it explains it all and helps you do it.' },
      { t: 'Then you can start taking the jobs from your tracker into work. I do it with the request "Process the next job from the tracker".' },
    ],
    aNote: 'The connector holds only search rules and job cards. Your name, CV and facts stay in your own chat project.',
    bH: 'Way B: Gemini and other chats (manual mode)', bLead: 'If you cannot set up an MCP, you have to copy and paste some information yourself. For convenience the tracker already has the buttons "Copy for AI" and "Apply AI result". Search goals you set yourself, with the "Search goals" button in the tracker.',
    bSteps: [{ t: 'Open your tracker and press "Search goals". Fill in your job titles, up to 3 DOU search terms (and, if you like, up to 3 Djinni keywords), the country where you live, and your languages.' }, { t: 'Create a project (Claude), a Gem (Gemini) or a custom GPT, and paste the "Project instructions" block below into its instructions.' }, { t: 'Add the modules (blocks below) as knowledge files or paste them into the chat when asked. Add your CV as text.' },
      { t: 'Open a job card (Details and full ad) and press "Copy for AI". Paste it into your chat and write: "Tailor my CV to this job".' }, { t: 'The chat works through the steps and, at the end, gives a block named card-update.' }, { t: 'Copy that answer, scroll to "Apply AI result" in your tracker, paste it and press Check. You see what will change on the card. Press "Save to the card".' }],
    bNote: 'The block never changes your cover message on a card you already work on, and it never sends anything anywhere. You always see the change before it is saved.',
    packH: 'Prompt pack for your AI chat', packLead: 'This is the same text the connector hands to Claude and ChatGPT. It is public: the source is on GitHub. Copy a block and paste it into your chat project.',
    copy: 'Copy', copied: 'Copied', size: (n) => `${n} characters`, enlarge: 'Click to enlarge',
    guideH: 'More materials', guideText: 'A demo of the tracker and a longer step-by-step guide with illustrations.', guideBtn: 'Open the setup guide', demoBtn: 'Try the demo', codeBtn: 'Code on GitHub',
    checkH: 'Check that it works', checkText: 'Ask your chat: "What is my JSE status?". It answers with the state of your tracker. After that the guide on your tracker page turns the first step green.',
    faqH: 'Questions and answers',
    faq: [['No jobs yet?', 'After you save your goals, the first jobs appear within a few minutes if the ads are already collected, otherwise after the next morning scan. You can ask your chat: "Check my scan".'], ['Claude does not let me add another connector', 'The free plan allows one custom connector. If you already use one, replace it with this one, or use manual mode (Way B).'], ['Can I change my goals later?', 'Yes. Ask your chat, or press "Search goals" in your tracker if you use manual mode.'], ['My link ended up with someone else', 'Open the tracker settings and press "Replace my link". The old link stops working. Then add the new address to your chat.'], ['How do I delete my data?', 'In the tracker settings choose "Delete my account and data". Your goals, cards and notes are removed.'], ['Something does not work', 'Write to me on LinkedIn or Telegram and we will sort it out together.']],
    limitsH: 'Good to know', limitsText: 'For now the online tracker reads DOU and Djinni, two IT job boards, and keeps up to 20 open jobs per person. This is temporary: more job boards and company career sites are coming, and the room for jobs will grow.',
    privH: 'Privacy in one paragraph', priv: 'The tracker keeps your search goals, the jobs it found, your statuses and notes, and the cover messages you choose to save on cards. It never receives your CV, your Fact Bank or your personal history. Only your own AI chat works with your personal data; it goes nowhere else. You can replace your link or delete everything in the tracker settings at any time. If you stop using it for two days, scanning for you pauses until you return.',
    ctaH: 'Want access or help?', ctaText: 'Write to me for a personal link, or if anything is unclear. Choose whatever is easiest for you.', ctaBtn: 'LinkedIn', ctaBtn2: 'Telegram',
    files: { 'project-instructions.md': 'Project instructions (paste into the chat instructions)', 'modules/01-profile-interview.md': 'Module 1: job goals interview', 'modules/02-fact-bank.md': 'Module 2: Fact Bank', 'modules/03-master-cv.md': 'Module 3: Master CV', 'modules/04-tailor-to-job.md': 'Module 4: tailor to a job', 'modules/05-after-an-interview.md': 'Module 5: after an interview', 'templates/fact_bank.md': 'Template: Fact Bank', 'templates/fact_inbox.md': 'Template: Fact Inbox', 'templates/master_cv.md': 'Template: Master CV' },
  },
  uk: {
    title: 'Налаштування онлайн трекера Job Search Engine', desc: 'Як користуватися онлайн трекером Job Search Engine з Claude, ChatGPT, Gemini чи будь-яким іншим AI-чатом: кроки для MCP-конектора та ручний режим копіювання.',
    crumb: 'Посібник з онлайн трекера', h1: 'Налаштування онлайн трекера',
    noticeAccent: 'Безкоштовний доступ на час тестування.', notice: ' Щоб отримати особисте посилання, напишіть мені (контакти в кінці сторінки). Ваше посилання це ключ: нікому його не передавайте.',
    lead: 'Онлайн трекер щоранку збирає для вас підхожі вакансії й тримає їхні статуси. Думає ваш AI-чат: він задає пошукові цілі, звіряє оголошення з вашими власними фактами та пише резюме й повідомлення. Ця сторінка показує, як його підключити.',
    whatH: 'Що вам потрібно',
    whatList: [['Особисте посилання на трекер від мене (вебадреса, що закінчується довгим секретом).'], ['AI-чат із проєктами чи власними інструкціями: підійдуть Claude, ChatGPT чи Gemini (Gems). Безкоштовного тарифу достатньо.'],
      ['Ваше резюме, або кілька штук + файл експорту профілю з LinkedIn для збору Банку Фактів, який потім використовується для адаптації резюме та супровідних листів. Ваші дані обробляються у вас локально з вашим чатом. ', 'В онлайн трекер ніяка чутлива інформація не передається.']],
    aH: 'Спосіб A: Claude або ChatGPT ', aAccent: '(MCP-конектор, рекомендовано)', aLead: 'Ви взаємодієте з Трекером і вакансіями в ньому через ваш чат: читаєте зміст, уточнюєте цілі, оновлюєте картки. Трекер виступає єдиним універсальним дашбордом і джерелом статусів по кожній вакансії (тобто трекер виступає трекером 🙂).',
    aSteps: [
      { t: 'Відкрийте своє посилання на трекер у браузері. Внизу сторінки є адреса конектора. Натисніть «Копіювати адресу конектора».' },
      { t: 'Claude: відкрийте claude.ai/plugins/yours, натисніть Add, потім Add custom connector. Вставте адресу кастомного MCP (посилання має закінчуватися на «/mcp»). Назву обирайте на власний смак, OAuth-налаштування не чіпайте. Безкоштовний тариф дозволяє один власний конектор.', img: 'claude', alt: 'Claude: меню Add з пунктом «Add custom connector»' },
      { t: 'ChatGPT (безкоштовний тариф теж підходить): відкрийте chatgpt.com/plugins, натисніть «Додати», потім «Додати власний сервер MCP». Вставте адресу кастомного MCP (посилання має закінчуватися на «/mcp»). Тип автентифікації оберіть «Без автентифікації». Опис, назву та іконку обирайте на власний смак.', img: 'chatgpt', alt: 'ChatGPT: вікно «Додати власний сервер MCP» зі списком автентифікації' },
      { t: 'Почніть новий чат і напишіть: «Допоможи налаштувати мій пошук роботи з онлайн трекером через MCP». Чат завантажить правила з трекера, розпитає про ваші цілі, запропонує до 3 пошукових термінів і попросить підтвердити.' },
      { t: 'Далі треба буде скласти Банк Фактів і підготувати Базове Резюме. У вашого ШІ-чату вже будуть усі необхідні інструкції, що саме треба зібрати, щоб усього вистачило для роботи: він вам усе пояснить і допоможе це зробити.' },
      { t: 'Далі можна починати брати наявні вакансії з вашого трекера в обробку. Я роблю це запитом «Опрацюй наступну вакансію з Трекера».' },
    ],
    aNote: 'Конектор тримає лише правила пошуку та картки вакансій. Ваше ім’я, резюме й факти лишаються у вашому власному проєкті чату.',
    bH: 'Спосіб B: Gemini та інші чати (ручний режим)', bLead: 'Якщо MCP немає можливості налаштувати, то доведеться деяку інформацію копіювати та вставляти самостійно. Для зручності в трекері вже є кнопки «Копіювати для AI» та «Застосувати відповідь AI». Пошукові цілі ви задаєте самі кнопкою «Цілі пошуку» в трекері.',
    bSteps: [{ t: 'Відкрийте трекер і натисніть «Цілі пошуку». Заповніть посади, до 3 пошукових термінів DOU (і, за бажанням, до 3 ключових слів Djinni), країну, де ви живете, і мови.' }, { t: 'Створіть проєкт (Claude), Gem (Gemini) чи власний GPT і вставте блок «Інструкції проєкту» нижче в його інструкції.' }, { t: 'Додайте модулі (блоки нижче) як файли знань або вставляйте в чат, коли про це просять. Додайте своє резюме текстом.' },
      { t: 'Відкрийте картку вакансії (Деталі та повний опис) і натисніть «Копіювати для AI». Вставте в чат і напишіть: «Адаптуй моє резюме до цієї вакансії».' }, { t: 'Чат пройде кроки й наприкінці дасть блок card-update.' }, { t: 'Скопіюйте відповідь, прокрутіть у трекері до «Застосувати відповідь AI», вставте й натисніть «Перевірити». Ви побачите, що зміниться в картці. Натисніть «Зберегти в картку».' }],
    bNote: 'Блок ніколи не змінює супровідне повідомлення картки, з якою ви вже працюєте, і нічого нікуди не надсилає. Ви завжди бачите зміну до збереження.',
    packH: 'Пакет промптів для вашого AI-чату', packLead: 'Це той самий текст, який конектор передає Claude і ChatGPT. Він публічний: джерело є на GitHub. Скопіюйте блок і вставте у проєкт вашого чату. Тексти англійською, чат відповідатиме вам вашою мовою.',
    copy: 'Копіювати', copied: 'Скопійовано', size: (n) => `${n} символів`, enlarge: 'Натисніть, щоб збільшити',
    guideH: 'Додаткові матеріали', guideText: 'Демо трекера та докладніший покроковий посібник з ілюстраціями.', guideBtn: 'Відкрити посібник з налаштування', demoBtn: 'Спробувати демо', codeBtn: 'Код на GitHub',
    checkH: 'Перевірте, що все працює', checkText: 'Спитайте свій чат: «Який мій статус JSE?». Він відповість станом вашого трекера. Після цього посібник на сторінці трекера позначить перший крок зеленим.',
    faqH: 'Питання й відповіді',
    faq: [['Вакансій ще немає?', 'Після збереження цілей перші вакансії з’являються за кілька хвилин, якщо оголошення вже зібрані, інакше після ранкового сканування. Можна спитати чат: «Перевір моє сканування».'], ['Claude не дає додати ще один конектор', 'Безкоштовний тариф дозволяє один власний конектор. Якщо один уже є, замініть його цим або скористайтеся ручним режимом (Спосіб B).'], ['Чи можна пізніше змінити цілі?', 'Так. Попросіть чат або натисніть «Цілі пошуку» у трекері, якщо ви в ручному режимі.'], ['Моє посилання випадково потрапило до когось іншого', 'Відкрийте налаштування трекера й натисніть «Замінити моє посилання». Старе посилання перестане працювати. Потім додайте нову адресу у свій чат.'], ['Як видалити мої дані?', 'У налаштуваннях трекера оберіть «Видалити мій акаунт і дані». Ваші цілі, картки й нотатки буде видалено.'], ['Щось не працює', 'Напишіть мені в LinkedIn або Telegram, і ми разом усе владнаємо.']],
    limitsH: 'Варто знати', limitsText: 'Наразі онлайн трекер читає DOU і Djinni, два майданчики IT-вакансій, і тримає до 20 відкритих вакансій на людину. Це тимчасово: скоро з’являться інші майданчики й кар\'єрні сторінки компаній, і місця для вакансій побільшає.',
    privH: 'Приватність в одному абзаці', priv: 'Трекер зберігає ваші пошукові цілі, знайдені вакансії, статуси, нотатки та супровідні повідомлення, які ви самі вирішили зберегти на картках. Він ніколи не отримує ваше резюме, Банк Фактів чи особисту історію. З вашими персональними даними працює тільки ваш AI-чат. Більше вони нікуди не передаються. Ви можете замінити посилання або видалити все в налаштуваннях трекера будь-коли. Якщо ви не користуєтеся ним два дні, сканування для вас призупиняється до вашого повернення.',
    ctaH: 'Потрібен доступ чи допомога?', ctaText: 'Напишіть мені по особисте посилання або якщо щось незрозуміло. Оберіть те, що вам зручніше.', ctaBtn: 'LinkedIn', ctaBtn2: 'Telegram',
    files: { 'project-instructions.md': 'Інструкції проєкту (вставте в інструкції чату)', 'modules/01-profile-interview.md': 'Модуль 1: розмова про цілі', 'modules/02-fact-bank.md': 'Модуль 2: Банк Фактів', 'modules/03-master-cv.md': 'Модуль 3: базове резюме', 'modules/04-tailor-to-job.md': 'Модуль 4: адаптація до вакансії', 'modules/05-after-an-interview.md': 'Модуль 5: після співбесіди', 'templates/fact_bank.md': 'Шаблон: Банк Фактів', 'templates/fact_inbox.md': 'Шаблон: Fact Inbox', 'templates/master_cv.md': 'Шаблон: базове резюме' },
  },
};

// Screenshot sizes (width, height) so the page does not jump while they load.
const SHOT_SIZE = { claude: [1400, 417], chatgpt: [1400, 847] };

function page(k, texts) {
  const c = G[k], p = P[k], base = pth(k, '/tools/job-search-engine/'), path = base + 'hosted/';
  const shot = (s) => (s.img ? `<figure class="hp-shot"><a href="${SHOT[s.img]}" target="_blank" rel="noopener"><img src="${SHOT[s.img]}" alt="${esc(s.alt)}"${SHOT_SIZE[s.img] ? ` width="${SHOT_SIZE[s.img][0]}" height="${SHOT_SIZE[s.img][1]}"` : ''} loading="lazy" decoding="async"></a><figcaption>${esc(c.enlarge)}</figcaption></figure>` : '');
  const ol = (a) => `<ol class="hp-steps">${a.map((s) => `<li>${esc(s.t)}${shot(s)}</li>`).join('')}</ol>`;
  const blocks = FILES.map(([f], i) => `<details class="hp-block"><summary><span>${esc(c.files[f])}</span><em>${esc(c.size(texts[f].length))}</em></summary>
      <div class="hp-actions"><button type="button" class="btn ghost" data-copy-target="hp-${i}" data-done="${esc(c.copied)}" aria-label="${esc(c.copy)}: ${esc(c.files[f])}">${esc(c.copy)}</button></div>
      <pre id="hp-${i}" class="hp-pre" lang="en" tabindex="0" aria-label="${esc(c.files[f])}">${esc(texts[f])}</pre></details>`).join('\n');
  const need = c.whatList.map(([a, b]) => `<li>${esc(a)}${b ? `<strong class="hp-accent">${esc(b)}</strong>` : ''}</li>`).join('');
  const body = `<nav class="jse-crumb" aria-label="Breadcrumb"><a href="${p.toolsPath}">${esc(p.tools)}</a> / <a href="${base}">Job Search Engine</a> / ${esc(c.crumb)}</nav>
    <h1 style="font-size:2.1rem">${esc(c.h1)}</h1>
    <p class="jse-notice" role="note"><strong class="hp-accent">${esc(c.noticeAccent)}</strong>${esc(c.notice)}</p>
    <p class="lead">${esc(c.lead)}</p>
    <h2 class="sub" id="need">${esc(c.whatH)}</h2><ul>${need}</ul>
    <h2 class="sub" id="connector">${esc(c.aH)}<span class="hp-accent">${esc(c.aAccent)}</span></h2><p>${esc(c.aLead)}</p>${ol(c.aSteps)}<p class="note">${esc(c.aNote)}</p>
    <h2 class="sub" id="manual">${esc(c.bH)}</h2><p>${esc(c.bLead)}</p>${ol(c.bSteps)}<p class="note">${esc(c.bNote)}</p>
    <h2 class="sub" id="pack">${esc(c.packH)}</h2><p>${esc(c.packLead)} <a href="${REPO}/tree/main/assistant" rel="noopener">GitHub →</a></p>
    <div class="hp-blocks">${blocks}</div>
    <h2 class="sub" id="check">${esc(c.checkH)}</h2><p>${esc(c.checkText)}</p>
    <h2 class="sub" id="faq">${esc(c.faqH)}</h2>
    <div class="hp-blocks">${c.faq.map(([q, a]) => `<details class="hp-block"><summary><span>${esc(q)}</span></summary><p>${esc(a)}</p></details>`).join('')}</div>
    <h2 class="sub" id="guide">${esc(c.guideH)}</h2><p>${esc(c.guideText)}</p><p><a class="btn" href="${base}setup/" data-ev="cta_click">${esc(c.guideBtn)}</a> <a class="btn ghost" href="${base}demo/" data-ev="cta_click">${esc(c.demoBtn)}</a> <a class="btn ghost" href="${REPO}" target="_blank" rel="noopener" data-ev="cta_click">${esc(c.codeBtn)}</a></p>
    <h2 class="sub" id="privacy">${esc(c.privH)}</h2><p>${esc(c.priv)}</p>
    <section class="jse-cta"><h2>${esc(c.ctaH)}</h2><p>${esc(c.ctaText)}</p><p><a class="btn" href="https://www.linkedin.com/in/hanizex/" target="_blank" rel="noopener" data-ev="cta_click">${esc(c.ctaBtn)}</a> <a class="btn" href="https://t.me/hanizex" target="_blank" rel="noopener" data-ev="cta_click">${esc(c.ctaBtn2)}</a></p></section>
    <h2 class="sub" id="good">${esc(c.limitsH)}</h2><p>${esc(c.limitsText)}</p>`;
  return shell(k, {
    path, otherPath: pth(k === 'en' ? 'uk' : 'en', '/tools/job-search-engine/hosted/'), title: c.title, desc: c.desc,
    crumbs: [{ name: p.tools, item: `${SITE}${pth(k, '/tools/')}` }, { name: 'Job Search Engine', item: `${SITE}${base}` }, { name: c.crumb, item: `${SITE}${path}` }],
    body, script: '/assets/jse-copy.js', mainClass: 'jse',
  });
}

const texts = Object.fromEntries(FILES.map(([f]) => [f, read(f)]));
for (const k of ['en', 'uk']) {
  const f = join(ROOT, 'public', k === 'uk' ? 'uk' : '', 'tools', 'job-search-engine', 'hosted', 'index.html');
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, page(k, texts));
}
console.log('hosted: guide written (en + uk)');
