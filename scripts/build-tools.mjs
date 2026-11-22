// Tools section.
//   /tools/                           hub (EN) and /uk/tools/
//   /tools/job-search-engine/         Job Search Engine (JSE): story, diagrams, what is shared, how to build your own
//   /tools/job-search-engine/demo/    interactive demo with invented data (public/assets/jse-demo.js), data stays in the browser
// Everything here describes things that exist today. Roadmap items are labelled as plans.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { introLink, CHANNEL } from './config.mjs';
import { SITE, REPO, esc, P, pth, shell } from './tools-shell.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- copy
const C = {
  en: {
    hub: {
      title: 'Tools I built for my own work and now share', desc: 'Small free tools from an IT project manager: the Job Search Engine (a job-search pipeline with a tracker and a live demo) and the Challenge AI quiz.',
      h1: 'Tools', lead: 'Small tools I built for my own work. I share the ones that can help other people.',
      cards: [
        { tag: 'Free test', title: 'Job Search Engine (JSE)', text: 'A job search run like a delivery project. The online tracker finds jobs that fit your goals every morning and works together with your AI chat. Also here: the open engine, the method, diagrams and a demo.', go: 'Open JSE', href: '/tools/job-search-engine/' },
        { tag: 'Free quiz', title: 'Challenge AI', text: 'Six questions that tell you whether AI is enough for a work problem, or whether you need a human view. Runs in your browser.', go: 'Take the quiz', href: '/challenge/' },
      ],
    },
    jse: {
      title: 'Job Search Engine (JSE): an automated job-search pipeline with a tracker', desc: 'How I run my job search like a delivery project: daily collection from company career systems, filters, ad screening, deduplication, a CV method with an ATS gate and a tracker. Diagrams, code free for personal use and a live demo with invented data.',
      crumb: 'Job Search Engine',
      h1: 'Job Search Engine (JSE)', lead: 'A job search run like a delivery project: automate the repetitive parts, keep a human for the decisions, and measure whether each source is worth keeping.',
      onlineBtn: 'Open the online tracker', onlineH: 'The online tracker (free test)', onlineLead: 'Every morning the tracker collects jobs that fit your goals and keeps them on your personal page with their statuses. You connect your AI chat (Claude or ChatGPT) once, and the chat works through the next job with you: it checks the ad against your own facts and prepares the CV, the cover message and the messages. It is free during the test; all you need is a personal link from me.', onlineList: ['Jobs for your own goals, every morning', 'Your AI chat reads and updates your cards', 'Your CV and personal history stay in your chat', 'Instructions, examples and the demo are inside the guide'], splitNote: 'With the online tracker: the tracker keeps your search goals, jobs, statuses and notes. Your Fact Bank, Master CV and personal history stay in your AI chat.', demoBtn: 'Try the demo', guideBtn: 'Setup guide', codeBtn: 'Code on GitHub',
      honest: 'JSE is my own tool. It is tuned to my search, and the demo uses invented data. The method works for any role and market: change the rules and the company list.',
      whatH: 'What it does',
      whatLead: 'Two parts. The first runs by itself every morning. The second is a short routine you do with an AI assistant for each job you decide to apply to.',
      laneA: 'Every morning, by itself', laneB: 'For each job you pick, with an AI assistant',
      stepsA: [
        ['Collect', 'Reads open positions from company career systems (public endpoints of ten ATS types) and a few job boards.'],
        ['Filter', 'Keeps titles that fit and gives every job a location priority, P1 to P3.'],
        ['Screen the ad', 'Reads the ad text for hidden blockers: residency, required languages, mandatory certificates. Verdict: wall, ask or ok.'],
        ['De-duplicate', 'Matches by link, job id, and company plus similar role, against your tracker.'],
        ['Report', 'Writes a digest and emails only what you have not seen. Reads employer replies from the inbox, read-only.'],
      ],
      handoff: 'You read the digest and pick the jobs. This is the human step.',
      stepsB: [
        ['Evidence map', 'Each requirement in the ad is matched to a real fact from your Fact Bank. The ad shows what the employer wants, never what you did.'],
        ['ATS gate', 'The keyword match must reach the optimal level. If real facts cannot reach it, the process stops and names the gaps.'],
        ['Build', 'A tailored CV, a cover message of up to 1000 characters and LinkedIn messages of up to 500.'],
        ['Apply and reach out', 'After applying, write to 1-2 people at the company within 3 days.'],
        ['Track', 'The tracker moves the card through statuses and shows what to do next.'],
      ],
      gateH: 'The CV chain and the gate',
      gateLead: 'The gate is what keeps the tool honest. A keyword is never added without a fact behind it.',
      gIn: ['Job ad', 'Fact Bank (facts only)', 'Master CV'], gMap: 'Evidence map: requirement to fact', gGate: 'ATS gate: is the match at the optimal level?',
      gPass: 'Yes: build CV, cover message and LinkedIn messages', gStop: 'No: stop, name the gaps, ask you',
      prioH: 'Location priority',
      prioLead: 'Every kept job gets a priority from your own rules. These are mine as an example.',
      prio: [['P1', 'Home city on-site or hybrid, or fully remote'], ['P2', 'Relocation within Europe'], ['P3', 'Needs a work visa. Hidden by default']],
      principlesH: 'Design decisions',
      principles: [
        ['APIs first', 'Where a company exposes a public jobs endpoint, I use it. Boards are read slowly, the same pages a person sees.'],
        ['Rules, not AI, for screening', 'Filters and ad screening are plain rules. Every skip carries a reason, so a wrong skip is easy to find and fix.'],
        ['AI only where it writes', 'Collecting, filtering, screening and deduplication cost nothing in AI. The assistant is used for the CV, the cover and the messages.'],
        ['Read-only and safe', 'Email access never moves, deletes or marks messages. A failing source never stops the daily run. No credentials in code.'],
        ['A human decides', 'The tool proposes. You choose which jobs to apply to.'],
      ],
      splitH: 'What stays with each person, and what is shared',
      mine: 'Stays with each person', shared: 'Shared, free for personal use',
      mineList: ['Fact Bank: your real facts and evidence', 'Master CV per role family', 'Your company list and rules', 'Job history, statuses and employer replies', 'Email access for the digest and replies', 'The CVs and letters you generate'],
      sharedList: ['Fetchers for ten ATS types', 'Filters, priorities and the ad-screening engine', 'Deduplication and the daily digest', 'Tests that run offline', 'The tracker and its data model', 'The CV method and message formats'],
      buildH: 'Build your own',
      buildLead: 'Prefer to run it yourself? Use the demo to see the tracker, then follow the step-by-step setup guide: it covers the Fact Bank, the Master CV, your preferences and your first run.', hostedLink: 'Online tracker', guideLink: 'Open the setup guide', trackerLink: 'Open the browser tracker', packLink: 'Assistant pack on GitHub',
      build: [
        'Open the demo and click through the cards, statuses and messages.',
        'Download the engine and run the offline demo with an example profile.',
        'Create a project in your AI chat and add the assistant pack. It interviews you and writes your profile, Fact Bank and Master CV.',
        'Run the engine with your profile and load its results into your own tracker, which lives in your browser.',
        'For each job press Copy for AI, paste it into your project and apply the answer.',
        'Apply on the employer\'s site, then write to 1-2 people at the company.',
      ],
      stateH: 'Where it stands',
      state: [
        ['Free test access', 'The online tracker works today for a small group of testers, free of charge: a daily scan of DOU for your own search goals, a personal tracker page and a direct connection to Claude or ChatGPT (MCP). Other chats, such as Gemini, work with copy and paste. To join, write to me.'],
        ['Available now', 'The engine on GitHub, free for personal and noncommercial use, with an offline demo and example profiles. An assistant pack for Claude, ChatGPT and Gemini that needs no code. A free browser tracker that keeps your data in your browser. The setup guide, the demo and the diagrams.'],
        ['Coming next', 'More job boards and company career sites, more room for jobs in the online tracker, real screenshots in the setup guide, and a public launch with self-service sign-up.'],
      ],
      stateFollow: 'To hear about new boards and the public launch, follow the Telegram channel.',
      notesH: 'Good to know',
      notes: [
        'Job ads belong to the employers. JSE reads public pages and endpoints at a low rate and does not bypass any protection.',
        'This is a personal project and it works "as is". I do not guarantee results, but I am happy to help you get the most out of it.',
        'The code is free for personal and noncommercial use (PolyForm Noncommercial 1.0.0), including running your own job search. Commercial use needs a licence from me.',
        'For now the online tracker reads DOU, a Ukrainian IT job board, and keeps up to 20 open jobs per person. This is temporary: more job boards and company career sites are coming, and the room for jobs will grow.',
      ],
      ctaH: 'Want help setting up your own search?', ctaText: 'I run one-hour consultations and mock interviews. We can build your Fact Bank, your rules and your routine together.',
      ctaBtn: 'Request a consultation', ctaIntro: 'Or book a free 20-minute intro call', tg: 'Telegram channel',
    },
    tracker: {
      title: 'Your job tracker, kept in your browser', desc: 'A free tracker for the Job Search Engine. Load the jobs your engine found, copy them to your AI assistant and apply its answers. Everything stays in your browser.',
      crumb: 'Browser tracker', h1: 'Your browser tracker', onlineNote: 'Prefer not to run the engine yourself? The online tracker collects fitting jobs for you every morning.', onlineLink: 'Open the online tracker',
      lead: 'Load the jobs the engine found, work through them and keep every status in one place. Your data stays in this browser. Nothing is sent to me or to any server.',
      notice: 'Back up with Export. Clearing your browser data deletes this tracker.',
      stepsH: 'How to use it',
      steps: ['Run the engine and load out/import_latest.json with Import. Each card brings the full job description and the screening verdict.', 'Press Copy for AI on a job and paste it into your assistant project.', 'Paste the assistant\'s answer into Apply AI result. The tracker reads its card-update block and fills the card.', 'Apply on the employer\'s site, set the status, and write to 1-2 people on LinkedIn within 3 days.'],
      guide: 'Setup guide', demo: 'Try the demo first', code: 'Engine code on GitHub',
    },
    demo: {
      title: 'Job Search Engine demo: an interactive tracker with invented data', desc: 'Try the Job Search Engine tracker in your browser. All jobs are invented. Your changes stay on your device and nothing is sent to a server.',
      crumb: 'Demo', h1: 'JSE demo tracker',
      lead: 'This is how the tracker works. It does three jobs: it takes you to the job post by a direct link, it holds the status of every job, and it takes you to the right people on LinkedIn. Jobs are not added here by hand. They come from the scan, and each card already holds the full description.',
      notice: 'Invented data: the companies, roles and the person "Alex Example" do not exist. The job link opens an invented sample ad, and LinkedIn searches show unrelated results. In your real tracker these links open the real job post and the real people. Your changes are saved only in this browser. Nothing is sent to me or to any server.',
      noscript: 'The demo needs JavaScript.',
      flowH: 'How the tracker and your AI chat work together', flowLead: 'The tracker does not write your CV. Your AI chat does. Each does what it is good at.',
      lanes: [['Tracker', 'Holds the jobs the scan found, each with the full description and the screening verdict. Statuses, links, LinkedIn searches and checkboxes.'], ['Your AI chat (Claude, ChatGPT or Gemini)', 'Checks blockers, asks questions, and builds the tailored CV, the cover message and the LinkedIn messages from your Fact Bank and Master CV.'], ['Other sites', 'The employer\'s form and LinkedIn. You apply and send the messages yourself.']],
      flowSteps: ['Press Copy for AI. The full description is already on the card.', 'Paste it into your AI chat.', 'Confirm the findings or correct them.', 'Copy the CV, cover message and LinkedIn messages from the chat.', 'Apply, set the status, write to 1-2 people, tick the box.'],
      today: 'Today', todayT: 'You move the job into the chat and the results back by copy and paste. Two clicks and two pastes per job.', planned: 'Free test access', plannedT: 'Connect your AI chat to the online tracker through MCP (Claude, ChatGPT). You say "Process the next job from the tracker". The AI reads the card, does the work and updates the card itself. No copy and paste.', plannedLink: 'How to connect',
      back: 'Back to the Job Search Engine page', build: 'Build your own',
    },
  },
  uk: {
    hub: {
      title: 'Інструменти, які я зробив для власної роботи і тепер ділюся', desc: 'Невеликі безкоштовні інструменти від IT проєктного менеджера: Job Search Engine (конвеєр пошуку роботи з трекером і живим демо) та тест Challenge AI.',
      h1: 'Інструменти', lead: 'Невеликі інструменти, які я зробив для власної роботи. Ділюся тими, що можуть допомогти іншим.',
      cards: [
        { tag: 'Безкоштовний тест', title: 'Job Search Engine (JSE)', text: 'Пошук роботи, організований як проєкт доставки. Онлайн трекер щоранку знаходить вакансії під ваші цілі й працює разом із вашим AI-чатом. Також тут: відкритий рушій, метод, схеми та демо.', go: 'Відкрити JSE', href: '/uk/tools/job-search-engine/' },
        { tag: 'Безкоштовний тест', title: 'Challenge AI', text: 'Шість запитань, які покажуть, чи вистачить ШІ для робочої проблеми, чи потрібен погляд людини. Працює у вашому браузері.', go: 'Пройти тест', href: '/uk/challenge/' },
      ],
    },
    jse: {
      title: 'Job Search Engine (JSE): автоматизований конвеєр пошуку роботи з трекером', desc: 'Як я веду пошук роботи як проєкт доставки: щоденний збір з кар\'єрних систем компаній, фільтри, перевірка оголошень, дедуплікація, метод підготовки резюме з ATS-бар\'єром і трекер. Схеми, код для особистого використання і живе демо з вигаданими даними.',
      crumb: 'Job Search Engine',
      h1: 'Job Search Engine (JSE)', lead: 'Пошук роботи, організований як проєкт доставки: автоматизуємо рутину, залишаємо людині рішення і міряємо, чи варте джерело того, щоб його лишати.',
      onlineBtn: 'Відкрити онлайн трекер', onlineH: 'Онлайн трекер (безкоштовний тест)', onlineLead: 'Щоранку трекер збирає вакансії під ваші цілі й тримає їх на вашій особистій сторінці зі статусами. Ви один раз підключаєте свій AI-чат (Claude або ChatGPT), і чат разом з вами опрацьовує наступну вакансію: звіряє оголошення з вашими власними фактами та готує резюме, супровідне й повідомлення. Під час тесту це безкоштовно; потрібне лише особисте посилання від мене.', onlineList: ['Вакансії під ваші власні цілі щоранку', 'Ваш AI-чат читає й оновлює ваші картки', 'Ваше резюме й особиста історія лишаються у вашому чаті', 'Інструкції, приклади та демо чекають усередині посібника'], splitNote: 'З онлайн трекером: трекер тримає ваші пошукові цілі, вакансії, статуси й нотатки. Ваш Банк Фактів, Базове Резюме та особиста історія лишаються у вашому AI-чаті.', demoBtn: 'Спробувати демо', guideBtn: 'Посібник з налаштування', codeBtn: 'Код на GitHub',
      honest: 'JSE це мій власний інструмент. Він налаштований під мій пошук, а демо працює на вигаданих даних. Метод підходить для будь-якої ролі й ринку: змініть правила та список компаній.',
      whatH: 'Що він робить',
      whatLead: 'Дві частини. Перша працює сама щоранку. Друга це коротка рутина з ШІ-асистентом для кожної вакансії, на яку ви вирішили податися.',
      laneA: 'Щоранку, сам', laneB: 'Для кожної обраної вакансії, з ШІ-асистентом',
      stepsA: [
        ['Збір', 'Читає відкриті позиції з кар\'єрних систем компаній (публічні адреси десяти типів ATS) і кількох сайтів з вакансіями.'],
        ['Фільтр', 'Залишає підходящі назви й дає кожній вакансії пріоритет за локацією, від P1 до P3.'],
        ['Перевірка оголошення', 'Читає текст оголошення в пошуках прихованих блокерів: резиденція, обов\'язкові мови, сертифікати. Вердикт: wall, ask або ok.'],
        ['Дедуплікація', 'Порівнює за посиланням, id вакансії та за компанією з подібною роллю, відносно вашого трекера.'],
        ['Звіт', 'Пише дайджест і надсилає листом лише те, чого ви ще не бачили. Читає відповіді роботодавців зі скриньки, лише для читання.'],
      ],
      handoff: 'Ви читаєте дайджест і обираєте вакансії. Це крок людини.',
      stepsB: [
        ['Карта доказів', 'Кожна вимога з оголошення зіставляється з реальним фактом із вашого Fact Bank. Оголошення показує, чого хоче роботодавець, а не що ви робили.'],
        ['ATS-бар\'єр', 'Збіг за ключовими словами має досягти оптимального рівня. Якщо реальні факти його не дають, процес зупиняється і називає прогалини.'],
        ['Збірка', 'Адаптоване резюме, супровідний лист до 1000 символів і повідомлення в LinkedIn до 500.'],
        ['Подача і контакт', 'Після подачі напишіть 1-2 людям у компанії протягом 3 днів.'],
        ['Трекер', 'Трекер переводить картку між статусами й показує наступний крок.'],
      ],
      gateH: 'Ланцюжок резюме і бар\'єр',
      gateLead: 'Бар\'єр тримає інструмент чесним. Ключове слово ніколи не додається без факту за ним.',
      gIn: ['Оголошення', 'Fact Bank (лише факти)', 'Базове резюме'], gMap: 'Карта доказів: вимога і факт', gGate: 'ATS-бар\'єр: збіг на оптимальному рівні?',
      gPass: 'Так: збираємо резюме, лист і повідомлення в LinkedIn', gStop: 'Ні: зупинка, називаємо прогалини, питаємо вас',
      prioH: 'Пріоритет за локацією',
      prioLead: 'Кожна вакансія отримує пріоритет за вашими правилами. Ось мої, як приклад.',
      prio: [['P1', 'Домашнє місто в офісі чи гібрид, або повністю віддалено'], ['P2', 'Релокація в межах Європи'], ['P3', 'Потрібна робоча віза. Приховано за замовчуванням']],
      principlesH: 'Ключові рішення',
      principles: [
        ['Спершу API', 'Якщо компанія має публічну адресу з вакансіями, я користуюся нею. Сайти читаються повільно, ті самі сторінки, що бачить людина.'],
        ['Правила, а не ШІ, для перевірки', 'Фільтри й перевірка оголошень це прості правила. Кожен пропуск має причину, тож хибний пропуск легко знайти й виправити.'],
        ['ШІ лише там, де треба писати', 'Збір, фільтрація, перевірка й дедуплікація не коштують нічого в ШІ. Асистент потрібен для резюме, листа й повідомлень.'],
        ['Лише для читання і безпечно', 'Доступ до пошти ніколи не переміщує, не видаляє й не позначає листи. Збій одного джерела не зупиняє щоденний запуск. Жодних паролів у коді.'],
        ['Рішення за людиною', 'Інструмент пропонує. Ви обираєте, куди подаватися.'],
      ],
      splitH: 'Що лишається в кожного, а що спільне',
      mine: 'Лишається в кожного', shared: 'Доступне, безкоштовно для особистого використання',
      mineList: ['Fact Bank: ваші реальні факти й докази', 'Базове резюме для кожної групи ролей', 'Ваш список компаній і правила', 'Історія вакансій, статуси й відповіді роботодавців', 'Доступ до пошти для дайджесту й відповідей', 'Резюме та листи, які ви створюєте'],
      sharedList: ['Збирачі для десяти типів ATS', 'Фільтри, пріоритети й рушій перевірки оголошень', 'Дедуплікація і щоденний дайджест', 'Тести, що працюють офлайн', 'Трекер і його модель даних', 'Метод підготовки резюме й формати повідомлень'],
      buildH: 'Зберіть власний',
      buildLead: 'Хочете запускати самі? Подивіться трекер у демо, а тоді йдіть за покроковим посібником з налаштування: Fact Bank, базове резюме, вподобання і перший запуск.', hostedLink: 'Онлайн трекер', guideLink: 'Відкрити посібник з налаштування', trackerLink: 'Відкрити браузерний трекер', packLink: 'Пакет для асистента на GitHub',
      build: [
        'Відкрийте демо й пройдіться картками, статусами та повідомленнями.',
        'Завантажте рушій і запустіть офлайн-демо з прикладом профілю.',
        'Створіть проєкт у вашому чаті зі ШІ й додайте пакет для асистента. Він інтерв\'юює вас і пише ваш профіль, Fact Bank та базове резюме.',
        'Запустіть рушій зі своїм профілем і завантажте його результати у власний трекер, що живе у вашому браузері.',
        'Для кожної вакансії натисніть "Скопіювати для ШІ", вставте її у ваш проєкт і застосуйте відповідь.',
        'Подайтеся на сайті роботодавця, а потім напишіть 1-2 людям у компанії.',
      ],
      stateH: 'Де це зараз',
      state: [
        ['Безкоштовний тестовий доступ', 'Онлайн трекер сьогодні працює для невеликої групи тестувальників, безкоштовно: щоденне сканування DOU під ваші власні пошукові цілі, особиста сторінка трекера і пряме підключення до Claude чи ChatGPT (MCP). Інші чати, як-от Gemini, працюють копіюванням. Щоб долучитися, напишіть мені.'],
        ['Є зараз', 'Рушій на GitHub, безкоштовний для особистого й некомерційного використання, з офлайн-демо та прикладами профілів. Пакет для асистента Claude, ChatGPT і Gemini без коду. Безкоштовний браузерний трекер, що зберігає ваші дані у вашому браузері. Посібник з налаштування, демо та схеми.'],
        ['Далі', 'Більше сайтів із вакансіями та кар\'єрних сторінок компаній, більше місця для вакансій в онлайн трекері, справжні скриншоти в посібнику й публічний запуск із самостійною реєстрацією.'],
      ],
      stateFollow: 'Щоб дізнатися про нові сайти й публічний запуск, підпишіться на Telegram-канал.',
      notesH: 'Варто знати',
      notes: [
        'Оголошення належать роботодавцям. JSE читає публічні сторінки й адреси повільно й не обходить жодного захисту.',
        'Це особистий проєкт, і він працює «як є». Я не гарантую результатів, але охоче допоможу витиснути з нього максимум.',
        'Код безкоштовний для особистого й некомерційного використання (PolyForm Noncommercial 1.0.0), зокрема для власного пошуку роботи. Для комерційного використання потрібна ліцензія від мене.',
        'Наразі онлайн трекер читає DOU, український IT-майданчик вакансій, і тримає до 20 відкритих вакансій на людину. Це тимчасово: скоро з’являться інші майданчики й кар\'єрні сторінки компаній, і місця для вакансій побільшає.',
      ],
      ctaH: 'Хочете допомогу з налаштуванням власного пошуку?', ctaText: 'Я проводжу консультації на годину й пробні співбесіди. Можемо разом зібрати ваш Fact Bank, правила й рутину.',
      ctaBtn: 'Запросити консультацію', ctaIntro: 'Або запишіться на безкоштовне знайомство на 20 хвилин', tg: 'Telegram-канал',
    },
    tracker: {
      title: 'Ваш трекер вакансій у вашому браузері', desc: 'Безкоштовний трекер для Job Search Engine. Завантажте вакансії, які знайшов рушій, скопіюйте їх у вашого ШІ-асистента й застосуйте його відповіді. Усе лишається у вашому браузері.',
      crumb: 'Браузерний трекер', h1: 'Ваш браузерний трекер', onlineNote: 'Не хочете запускати рушій самі? Онлайн трекер щоранку збирає для вас підхожі вакансії.', onlineLink: 'Відкрити онлайн трекер',
      lead: 'Завантажте вакансії, які знайшов рушій, опрацьовуйте їх і тримайте кожен статус в одному місці. Ваші дані лишаються в цьому браузері. Нічого не надсилається ні мені, ні на жоден сервер.',
      notice: 'Робіть резервні копії кнопкою експорту. Очищення даних браузера видаляє цей трекер.',
      stepsH: 'Як користуватися',
      steps: ['Запустіть рушій і завантажте out/import_latest.json кнопкою імпорту. Кожна картка приносить повний опис вакансії та вердикт перевірки.', 'Натисніть "Скопіювати для ШІ" на вакансії й вставте її у проєкт вашого асистента.', 'Вставте відповідь асистента в "Застосувати відповідь ШІ". Трекер прочитає блок card-update і заповнить картку.', 'Подайтеся на сайті роботодавця, змініть статус і протягом 3 днів напишіть 1-2 людям у LinkedIn.'],
      guide: 'Посібник з налаштування', demo: 'Спершу спробувати демо', code: 'Код рушія на GitHub',
    },
    demo: {
      title: 'Демо Job Search Engine: інтерактивний трекер з вигаданими даними', desc: 'Спробуйте трекер Job Search Engine у браузері. Усі вакансії вигадані. Ваші зміни лишаються на вашому пристрої, нічого не надсилається на сервер.',
      crumb: 'Демо', h1: 'Демо-трекер JSE',
      lead: 'Ось як працює трекер. Він робить три речі: веде вас до оголошення за прямим посиланням, тримає статус кожної вакансії й веде до потрібних людей у LinkedIn. Вакансії тут не додаються вручну. Вони приходять зі сканування, і кожна картка вже містить повний опис.',
      notice: 'Вигадані дані: компанії, ролі та людина "Alex Example" не існують. Посилання на вакансію відкриває вигадане зразкове оголошення, а пошук у LinkedIn покаже сторонні результати. У вашому справжньому трекері ці посилання відкривають реальну вакансію й реальних людей. Ваші зміни зберігаються лише в цьому браузері. Нічого не надсилається ні мені, ні на жоден сервер.',
      noscript: 'Для демо потрібен JavaScript.',
      flowH: 'Як трекер і ваш чат зі ШІ працюють разом', flowLead: 'Трекер не пише резюме. Це робить ваш чат зі ШІ. Кожен робить те, що вміє.',
      lanes: [['Трекер', 'Тримає вакансії, які знайшло сканування, кожну з повним описом і вердиктом перевірки. Статуси, посилання, пошуки в LinkedIn і галочки.'], ['Ваш чат зі ШІ (Claude, ChatGPT або Gemini)', 'Перевіряє блокери, ставить питання й збирає адаптоване резюме, супровідний лист і повідомлення в LinkedIn з вашого Fact Bank і базового резюме.'], ['Інші сайти', 'Форма роботодавця і LinkedIn. Ви подаєтеся й надсилаєте повідомлення самі.']],
      flowSteps: ['Натисніть "Скопіювати для ШІ". Повний опис уже в картці.', 'Вставте його у ваш чат зі ШІ.', 'Підтвердіть висновки або виправте їх.', 'Скопіюйте з чату резюме, супровідний лист і повідомлення в LinkedIn.', 'Подайтеся, змініть статус, напишіть 1-2 людям, поставте галочку.'],
      today: 'Сьогодні', todayT: 'Ви переносите вакансію в чат, а результати назад копіюванням і вставкою. Два кліки й дві вставки на вакансію.', planned: 'Безкоштовний тестовий доступ', plannedT: 'Підключіть чат зі ШІ до онлайн трекера через MCP (Claude, ChatGPT). Ви кажете «Опрацюй наступну вакансію з Трекера». ШІ читає картку, виконує роботу й сам оновлює картку. Без копіювання.', plannedLink: 'Як підключити',
      back: 'Назад на сторінку Job Search Engine', build: 'Зберіть власний',
    },
  },
};

// ---------------------------------------------------------------- pages
function hub(k) {
  const c = C[k].hub, p = P[k];
  const cards = c.cards.map((x, i) => `<a class="vcard${i === 0 ? ' open' : ''}" href="${x.href}" data-ev="cta_click"><span class="vtag">${esc(x.tag)}</span><strong>${esc(x.title)}</strong><span class="vtxt">${esc(x.text)}</span><span class="vgo">${esc(x.go)} →</span></a>`).join('');
  return shell(k, {
    path: pth(k, '/tools/'), otherPath: pth(k === 'en' ? 'uk' : 'en', '/tools/'), title: c.title, desc: c.desc,
    crumbs: [{ name: p.tools, item: `${SITE}${pth(k, '/tools/')}` }],
    body: `<h1 style="font-size:2rem">${esc(c.h1)}</h1>
    <p class="lead">${esc(c.lead)}</p>
    <div class="vault">${cards}</div>`,
  });
}

function stepList(items, start) {
  return `<ol class="jse-steps" start="${start}">${items.map(([h, t]) => `<li><b>${esc(h)}</b><span>${esc(t)}</span></li>`).join('')}</ol>`;
}

function jse(k) {
  const c = C[k].jse, p = P[k], base = pth(k, '/tools/job-search-engine/');
  const prio = c.prio.map(([a, b]) => `<li><b class="jse-pill">${esc(a)}</b><span>${esc(b)}</span></li>`).join('');
  const body = `<nav class="jse-crumb" aria-label="Breadcrumb"><a href="${p.toolsPath}">${esc(p.tools)}</a> / ${esc(c.crumb)}</nav>
    <h1 style="font-size:2.2rem">${esc(c.h1)}</h1>
    <p class="lead">${esc(c.lead)}</p>
    <p class="jse-herobtns"><a class="btn jse-demo-btn" href="${base}hosted/" data-ev="cta_click">${esc(c.onlineBtn)} →</a></p>

    <h2 class="sub" id="online">${esc(c.onlineH)}</h2>
    <p>${esc(c.onlineLead)}</p>
    <ul>${c.onlineList.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p><a class="btn" href="${base}hosted/" data-ev="cta_click">${esc(c.onlineBtn)}</a></p>
    <p class="note">${esc(c.honest)}</p>

    <h2 class="sub" id="what">${esc(c.whatH)}</h2>
    <p>${esc(c.whatLead)}</p>
    <div class="jse-flow" role="group" aria-label="${esc(c.whatH)}">
      <section class="jse-lane"><h3>${esc(c.laneA)}</h3>${stepList(c.stepsA, 1)}</section>
      <div class="jse-handoff" aria-hidden="false"><span>↓</span> ${esc(c.handoff)}</div>
      <section class="jse-lane human"><h3>${esc(c.laneB)}</h3>${stepList(c.stepsB, 6)}</section>
    </div>

    <h2 class="sub" id="gate">${esc(c.gateH)}</h2>
    <p>${esc(c.gateLead)}</p>
    <div class="jse-gate" role="group" aria-label="${esc(c.gateH)}">
      <div class="jse-in">${c.gIn.map((x) => `<span class="jse-box">${esc(x)}</span>`).join('')}</div>
      <div class="jse-arrow" aria-hidden="true">↓</div>
      <div class="jse-box wide">${esc(c.gMap)}</div>
      <div class="jse-arrow" aria-hidden="true">↓</div>
      <div class="jse-box wide gate">${esc(c.gGate)}</div>
      <div class="jse-arrow" aria-hidden="true">↓</div>
      <div class="jse-out"><span class="jse-box pass">${esc(c.gPass)}</span><span class="jse-box stop">${esc(c.gStop)}</span></div>
    </div>

    <h2 class="sub" id="priority">${esc(c.prioH)}</h2>
    <p>${esc(c.prioLead)}</p>
    <ul class="jse-prio">${prio}</ul>

    <h2 class="sub" id="decisions">${esc(c.principlesH)}</h2>
    <div class="jse-cards">${c.principles.map(([h, t]) => `<div class="jse-pc"><b>${esc(h)}</b><span>${esc(t)}</span></div>`).join('')}</div>

    <h2 class="sub" id="split">${esc(c.splitH)}</h2>
    <div class="jse-split">
      <div class="jse-col"><h3>${esc(c.mine)}</h3><ul>${c.mineList.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="jse-col open"><h3>${esc(c.shared)}</h3><ul>${c.sharedList.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <p class="note">${esc(c.splitNote)}</p>

    <h2 class="sub" id="build">${esc(c.buildH)}</h2>
    <p>${esc(c.buildLead)}</p>
    <ol class="jse-build">${c.build.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    <p><a class="btn" href="${base}setup/" data-ev="cta_click">${esc(c.guideLink)}</a> <a class="btn ghost" href="${base}demo/" data-ev="cta_click">${esc(c.demoBtn)}</a> <a class="btn ghost" href="${base}tracker/" data-ev="cta_click">${esc(c.trackerLink)}</a> <a class="btn ghost" href="${base}hosted/" data-ev="cta_click">${esc(c.hostedLink)}</a> <a class="btn ghost" href="${REPO}/tree/main/assistant" target="_blank" rel="noopener" data-ev="cta_click">${esc(c.packLink)}</a></p>
    <p class="note"><a href="${REPO}" target="_blank" rel="noopener" data-ev="cta_click">${esc(c.codeBtn)} →</a></p>

    <h2 class="sub" id="state">${esc(c.stateH)}</h2>
    <div class="jse-state">${c.state.map(([h, t], i) => `<div class="jse-st s${i}"><span class="vtag">${esc(h)}</span><p>${esc(t)}</p></div>`).join('')}</div>
    <p>${esc(c.stateFollow)} <a href="${CHANNEL}" rel="noopener" data-ev="cta_click">${esc(c.tg)} →</a></p>

    <h2 class="sub" id="notes">${esc(c.notesH)}</h2>
    <ul>${c.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>

    <section class="jse-cta">
      <h2>${esc(c.ctaH)}</h2>
      <p>${esc(c.ctaText)}</p>
      <p><a class="btn" href="${p.reqPath}" data-ev="cta_click">${esc(c.ctaBtn)}</a></p>
      <p class="note"><a href="${introLink('jse-' + k)}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${esc(c.ctaIntro)}</a></p>
    </section>`;
  return shell(k, {
    path: base, otherPath: pth(k === 'en' ? 'uk' : 'en', '/tools/job-search-engine/'), title: c.title, desc: c.desc,
    crumbs: [{ name: p.tools, item: `${SITE}${pth(k, '/tools/')}` }, { name: c.crumb, item: `${SITE}${base}` }], body,
  });
}

function demo(k) {
  const c = C[k].demo, j = C[k].jse, p = P[k], base = pth(k, '/tools/job-search-engine/'), path = `${base}demo/`;
  const body = `<nav class="jse-crumb" aria-label="Breadcrumb"><a href="${p.toolsPath}">${esc(p.tools)}</a> / <a href="${base}">${esc(j.crumb)}</a> / ${esc(c.crumb)}</nav>
    <h1 style="font-size:2rem">${esc(c.h1)}</h1>
    <p class="lead">${esc(c.lead)}</p>
    <p class="jse-notice" role="note">${esc(c.notice)}</p>
    <div id="jse-app" class="jse-app"><noscript><p>${esc(c.noscript)}</p></noscript></div>
    <section class="jse-co" aria-labelledby="h-flow"><h2 class="sub" id="h-flow">${esc(c.flowH)}</h2><p>${esc(c.flowLead)}</p>
      <div class="jse-lanes">${c.lanes.map(([h, t]) => `<div class="jse-lane2"><b>${esc(h)}</b><span>${esc(t)}</span></div>`).join('')}</div>
      <ol class="jse-fsteps">${c.flowSteps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
      <div class="jse-state2"><div class="jse-st2 now"><span class="vtag">${esc(c.today)}</span><p>${esc(c.todayT)}</p></div><div class="jse-st2 now"><span class="vtag">${esc(c.planned)}</span><p>${esc(c.plannedT)}</p><p><a href="${base}hosted/">${esc(c.plannedLink)} →</a></p></div></div>
    </section>
    <p style="margin-top:26px"><a class="btn" href="${base}#build" data-ev="cta_click">${esc(c.build)}</a> <a class="btn ghost" href="${base}">${esc(c.back)}</a></p>`;
  return shell(k, {
    path, otherPath: pth(k === 'en' ? 'uk' : 'en', '/tools/job-search-engine/demo/'), title: c.title, desc: c.desc,
    crumbs: [{ name: p.tools, item: `${SITE}${pth(k, '/tools/')}` }, { name: j.crumb, item: `${SITE}${base}` }, { name: c.crumb, item: `${SITE}${path}` }], body, script: '/assets/jse-demo.js',
  });
}

const AD = {
  en: { title: 'Sample job ad (invented)', desc: 'An invented sample job ad used by the Job Search Engine demo.', h1: 'Sample job ad', note: 'This is an invented sample, not a real vacancy. In your real tracker this link opens the employer\'s page. Select the text, copy it and paste it into your JSE AI chat.', back: 'Back to the demo' },
  uk: { title: 'Зразкове оголошення (вигадане)', desc: 'Вигадане зразкове оголошення для демо Job Search Engine.', h1: 'Зразкове оголошення', note: 'Це вигаданий зразок, а не справжня вакансія. У вашому справжньому трекері це посилання відкриває сторінку роботодавця. Виділіть текст, скопіюйте його й вставте у ваш чат JSE зі ШІ.', back: 'Назад до демо' },
};
function ad(k) {
  const c = AD[k], p = P[k], base = pth(k, '/tools/job-search-engine/'), path = `${base}demo/ad/`;
  const body = `<nav class="jse-crumb" aria-label="Breadcrumb"><a href="${p.toolsPath}">${esc(p.tools)}</a> / <a href="${base}demo/">${esc(C[k].demo.crumb)}</a> / ${esc(c.h1)}</nav>
    <p class="jse-notice" role="note">${esc(c.note)}</p>
    <article id="jse-ad" class="jse-ad" data-copy="${k === 'uk' ? 'Копіювати текст оголошення' : 'Copy the job description'}" data-copied="${k === 'uk' ? 'Скопійовано' : 'Copied'}" data-manual="${k === 'uk' ? 'Виділіть текст і скопіюйте вручну' : 'Select the text and copy it'}"><noscript><p>${k === 'uk' ? 'Потрібен JavaScript.' : 'This page needs JavaScript.'}</p></noscript></article>
    <p style="margin-top:22px"><a class="btn ghost" href="${base}demo/">${esc(c.back)}</a></p>`;
  return shell(k, { path, otherPath: pth(k === 'en' ? 'uk' : 'en', '/tools/job-search-engine/demo/ad/'), title: c.title, desc: c.desc, crumbs: [{ name: p.tools, item: `${SITE}${pth(k, '/tools/')}` }, { name: C[k].jse.crumb, item: `${SITE}${base}` }, { name: C[k].demo.crumb, item: `${SITE}${base}demo/` }, { name: c.h1, item: `${SITE}${path}` }], body, script: '/assets/jse-demo.js', robots: 'noindex, follow' });
}

function tracker(k) {
  const c = C[k].tracker, j = C[k].jse, p = P[k], base = pth(k, '/tools/job-search-engine/'), path = `${base}tracker/`;
  const body = `<nav class="jse-crumb" aria-label="Breadcrumb"><a href="${p.toolsPath}">${esc(p.tools)}</a> / <a href="${base}">${esc(j.crumb)}</a> / ${esc(c.crumb)}</nav>
    <h1 style="font-size:2rem">${esc(c.h1)}</h1>
    <p class="lead">${esc(c.lead)}</p>
    <p class="jse-notice" role="note">${esc(c.notice)}</p>
    <p class="note">${esc(c.onlineNote)} <a href="${base}hosted/" data-ev="cta_click">${esc(c.onlineLink)} →</a></p>
    <div id="jse-app" class="jse-app" data-mode="live"><noscript><p>${esc(C[k].demo.noscript)}</p></noscript></div>
    <section class="jse-co"><h2 class="sub">${esc(c.stepsH)}</h2><ol class="jse-fsteps">${c.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>
    <p style="margin-top:22px"><a class="btn" href="${base}setup/" data-ev="cta_click">${esc(c.guide)}</a> <a class="btn ghost" href="${base}demo/" data-ev="cta_click">${esc(c.demo)}</a> <a class="btn ghost" href="${REPO}" target="_blank" rel="noopener" data-ev="cta_click">${esc(c.code)}</a></p>`;
  return shell(k, { path, otherPath: pth(k === 'en' ? 'uk' : 'en', '/tools/job-search-engine/tracker/'), title: c.title, desc: c.desc,
    crumbs: [{ name: p.tools, item: `${SITE}${pth(k, '/tools/')}` }, { name: j.crumb, item: `${SITE}${base}` }, { name: c.crumb, item: `${SITE}${path}` }], body, script: '/assets/jse-demo.js' });
}

function write(rel, html) { const f = join(ROOT, 'public', rel, 'index.html'); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); }
for (const k of ['en', 'uk']) {
  const pre = k === 'uk' ? 'uk/' : '';
  write(`${pre}tools`, hub(k));
  write(`${pre}tools/job-search-engine`, jse(k));
  write(`${pre}tools/job-search-engine/demo`, demo(k));
  write(`${pre}tools/job-search-engine/demo/ad`, ad(k));
  write(`${pre}tools/job-search-engine/tracker`, tracker(k));
}
console.log('tools: hub + job-search-engine + demo written (en + uk)');
