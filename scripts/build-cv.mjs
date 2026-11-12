// Generates the CV pages (EN: /cv/, UK: /uk/cv/) from the Fact Bank facts (private/fact-bank-v5.9.md).
// Rules agreed with the owner: no employer names; dates and money figures are public; 400+ sessions; ventures shown;
// PM Coffee Time is not work experience; no phone number, no work-authorisation line.
// Edit the content below, then run `npm run build`. The downloadable PDFs are generated ONCE (npm run cv:pdf) and committed.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const PHOTO = `${SITE}/assets/mykola.jpg`;
const LINKEDIN = 'https://www.linkedin.com/in/hanizex/';
const CHANNEL = 'https://t.me/outstanding_pm';
const GITHUB = 'https://github.com/hanizex';
const EMAIL = 'hanizex@gmail.com';
const TG = 'https://t.me/hanizex';
const MODIFIED = '2026-11-11';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ------------------------------------------------------------------ skills (id -> labels) and which roles used them
const SKILLS = [
  { g: { en: 'Delivery and project management', uk: 'Delivery і проєктний менеджмент' }, items: [
    ['fp', 'Fixed Price and T&M delivery', 'Delivery за Fixed Price та T&M'],
    ['agile', 'Scrum, Kanban, SAFe participation, PMBOK', 'Scrum, Kanban, участь у SAFe, PMBOK'],
    ['metrics', 'Delivery metrics: lead time, DORA, velocity', 'Метрики delivery: lead time, DORA, velocity'],
    ['budget', 'Budgets and cost control', 'Бюджети й контроль витрат'],
    ['presales', 'Pre-sales, estimation, RFPs', 'Пресейл, оцінка, RFP'],
    ['risk', 'Risk and stakeholder management', 'Управління ризиками та стейкхолдерами'],
  ] },
  { g: { en: 'People', uk: 'Люди' }, items: [
    ['teams', 'Building teams from scratch', 'Створення команд з нуля'],
    ['mom', 'Managing managers', 'Керування менеджерами'],
    ['mentor', 'Mentoring and coaching', 'Менторство й коучинг'],
  ] },
  { g: { en: 'Product', uk: 'Продукт' }, items: [
    ['discovery', 'Discovery, MVP, JTBD, PRDs', 'Discovery, MVP, JTBD, PRD'],
    ['ab', 'A/B tests, funnels, retention, LTV', 'A/B-тести, воронки, retention, LTV'],
    ['prio', 'Prioritisation: RICE, ICE, OKRs', 'Пріоритизація: RICE, ICE, OKR'],
  ] },
  { g: { en: 'Domains', uk: 'Домени' }, items: [
    ['igaming', 'iGaming: payments, KYC/AML, responsible gambling', 'iGaming: платежі, KYC/AML, відповідальна гра'],
    ['mobile', 'Mobile apps: iOS, Android, store releases', 'Мобільні застосунки: iOS, Android, релізи в магазинах'],
    ['edtech', 'EdTech and HRTech', 'EdTech та HRTech'],
    ['ecom', 'E-commerce, ERP, CRM', 'E-commerce, ERP, CRM'],
    ['seo', 'SEO and content', 'SEO та контент'],
  ] },
  { g: { en: 'AI', uk: 'ШІ' }, items: [
    ['ai', 'AI-assisted delivery, agents, MCP', 'Delivery з ШІ, агенти, MCP'],
  ] },
];

// ------------------------------------------------------------------ roles
const ROLES = [
  { id: 'consult', open: true, when: '06/2023 – present', skills: 'mentor risk ai',
    title: { en: 'Independent consultant and mentor', uk: 'Незалежний консультант і ментор' },
    org: { en: 'Own practice, parallel with employed roles · Remote', uk: 'Власна практика, паралельно з найманою роботою · Віддалено' },
    hl: { en: '400+ consultations and mentoring sessions', uk: '400+ консультацій і менторських сесій' },
    b: { en: [
      'Delivered 400+ individual and group consultations, PM process audits and private mentoring sessions.',
      'Mentors project and product managers and helps managers at different levels with delivery, people and process problems.',
    ], uk: [
      'Провів 400+ індивідуальних і групових консультацій, аудитів PM-процесів і приватних менторських сесій.',
      'Менторю проєктних і продуктових менеджерів та допомагаю керівникам різного рівня з проблемами delivery, людей і процесів.',
    ] } },
  { id: 'genius', open: true, when: '09/2024 – 08/2026', skills: 'fp agile budget risk mom discovery ab prio igaming mobile ai metrics',
    title: { en: 'Project & Product Manager', uk: 'Project & Product Manager' },
    org: { en: 'IT outsourcing and outstaffing company · Remote', uk: 'Аутсорсингова та аутстафінгова IT-компанія · Віддалено' },
    hl: { en: '3 products from discovery to production · 4 teams · 16% of a project budget saved', uk: '3 продукти від discovery до продакшену · 4 команди · 16% бюджету проєкту збережено' },
    b: { en: [
      'Delivered 3 products from discovery to production across 4 cross-functional teams.',
      'Reused an existing platform with minimal customisation, cutting time-to-market by about 30%.',
      'Validated an early prototype with AI assistance, rejected an unproven hypothesis before development and saved 16% of the project budget.',
      'Managed a B2B casino and sportsbook platform from prototype through MVP, testing, production and live operations, including Android and iOS apps: an 8-person team, working directly with the client\'s CEO.',
      'Specified REST contracts, webhooks, status and error mapping and reconciliation for payment-provider integrations (e-wallets, vouchers, crypto).',
      'Coordinated KYC/AML integrations, GDPR requirements, rule-based fraud and risk controls, responsible-gambling tools and player segmentation.',
      'Introduced benchmark-derived player notifications: LTV +9% and a higher average deposit, proven with control-group A/B tests.',
      'Prioritised with RICE and ICE; defined hypotheses and success metrics, configured experiments and analysed funnels in Amplitude, Tableau and Google Analytics.',
      'Managed Fixed Price and Time & Materials delivery; estimated and agreed change requests before acceptance.',
      'Wrote PRDs, SRS, user stories, acceptance criteria and JTBD job stories.',
      'Introduced AI-assisted coding, testing, documentation and code review into team workflows and practised Spec-Driven Development.',
      'Delivered enterprise data and analytics projects for about 8 months.',
      'Coordinated incident response, urgent fixes and L1–L3 support under SLAs; negotiated and drafted operator contracts and worked with regulators on licensing.',
      'Replaced vendors across analytics, marketing, payments, legal, content and SaaS.',
    ], uk: [
      'Довів 3 продукти від discovery до продакшену в 4 крос-функціональних командах.',
      'Повторно використав наявну платформу з мінімальною кастомізацією й скоротив time-to-market приблизно на 30%.',
      'Перевірив ранній прототип за допомогою ШІ, відхилив недоведену гіпотезу ще до розробки й зберіг 16% бюджету проєкту.',
      'Вів B2B-платформу казино та беттингу від прототипу через MVP, тестування й продакшен до роботи в бойовому режимі, зокрема застосунки Android та iOS: команда з 8 людей, пряма робота з CEO клієнта.',
      'Специфікував REST-контракти, вебхуки, мапінг статусів і помилок та звірку для інтеграцій із платіжними провайдерами (е-гаманці, ваучери, крипто).',
      'Координував інтеграції KYC/AML, вимоги GDPR, правила антифроду й ризик-контролю, інструменти відповідальної гри та сегментацію гравців.',
      'Запровадив сповіщення гравцям на основі бенчмарків: LTV +9% і вищий середній депозит, підтверджено A/B-тестами з контрольною групою.',
      'Пріоритизував за RICE та ICE; формулював гіпотези й метрики успіху, налаштовував експерименти та аналізував воронки в Amplitude, Tableau і Google Analytics.',
      'Вів delivery за Fixed Price та Time & Materials; оцінював і погоджував зміни до приймання.',
      'Писав PRD, SRS, user stories, критерії приймання та JTBD job stories.',
      'Запровадив у робочі процеси команди кодинг, тестування, документацію й code review із ШІ та практикував Spec-Driven Development.',
      'Близько 8 місяців вів проєкти з даних і аналітики для enterprise.',
      'Координував реагування на інциденти, термінові виправлення та підтримку L1–L3 за SLA; вів переговори й складав договори з операторами та працював із регуляторами щодо ліцензування.',
      'Замінював вендорів в аналітиці, маркетингу, платежах, юридичних питаннях, контенті та SaaS.',
    ] } },
  { id: 'brain', when: '04/2024 – 09/2024', skills: 'agile metrics mom teams risk igaming mobile',
    title: { en: 'Senior Delivery Manager', uk: 'Senior Delivery Manager' },
    org: { en: 'International iGaming product company · Cyprus, on site', uk: 'Міжнародна iGaming-продуктова компанія · Кіпр, офіс' },
    hl: { en: '2 teams of 17 · 60+ projects a quarter · Lead Time -25%', uk: '2 команди по 17 · 60+ проєктів на квартал · Lead Time -25%' },
    b: { en: [
      'Managed 2 cross-functional teams of 17 people each, including PMs, developers, QA and designers.',
      'Coordinated 2 strategic initiatives and an average of 60+ short-term projects per quarter.',
      'Reduced Lead Time by 25% over six months by removing blockers and cross-team dependencies.',
      'Delivered an experimental product from idea to release in 4 months; it is live, well rated and scaling to Europe and the US.',
      'Managed B2C casino delivery and 4 concurrent iGaming mobile apps for Android and iOS in a licensed, strictly regulated sector.',
      'Stabilised a high-load app with an SLA on transactions during promotions: changed the cross-platform framework, added caching and proxying and moved duplicate-request handling for Kafka to the server side.',
      'Introduced lightweight reporting that gave senior management visibility of progress, blockers and risks.',
      'Hired for two experimental internal startups and for mobile delivery.',
    ], uk: [
      'Керував 2 крос-функціональними командами по 17 людей, зокрема PM, розробниками, QA та дизайнерами.',
      'Координував 2 стратегічні ініціативи та в середньому 60+ короткострокових проєктів на квартал.',
      'Скоротив Lead Time на 25% за пів року, прибираючи блокери та міжкомандні залежності.',
      'Довів експериментальний продукт від ідеї до релізу за 4 місяці: він працює, має високі оцінки та масштабується на Європу й США.',
      'Вів B2C-delivery казино та 4 одночасні iGaming-застосунки для Android та iOS у ліцензованому, суворо регульованому секторі.',
      'Стабілізував навантажений застосунок із SLA на транзакції під час промоакцій: змінив кросплатформний фреймворк, додав кешування та проксі й переніс обробку дублікатів запитів для Kafka на сервер.',
      'Запровадив легку звітність, яка дала топменеджменту видимість прогресу, блокерів і ризиків.',
      'Набирав людей для двох експериментальних внутрішніх стартапів і для мобільного delivery.',
    ] } },
  { id: 'itstep', when: '11/2021 – 06/2023', skills: 'budget mom mentor teams risk edtech mobile ab metrics',
    title: { en: 'Program Manager', uk: 'Program Manager' },
    org: { en: 'EdTech and HRTech product company · Ukraine, on site', uk: 'EdTech- та HRTech-продуктова компанія · Україна, офіс' },
    hl: { en: 'Department of up to 45 · $400,000 saved in a year · 15+ releases', uk: 'Підрозділ до 45 людей · $400 000 заощаджено за рік · 15+ релізів' },
    b: { en: [
      'Managed 3 product streams (HR and knowledge management, online schooling, education administration), B2B and B2C.',
      'Led a department of up to 45 people across product, engineering, design, QA, business analysis, DevOps and support; up to 11 managers and team leads reported directly. About 22 projects were supported at the same time.',
      'Saved $400,000 in one year through process improvements and supplier contract optimisation, including a 22% operating-expense reduction (tool and infrastructure costs plus process gains).',
      'Delivered 15+ releases with improvements in NPS, retention and partner satisfaction.',
      'Stabilised the department and retained 80%+ of the team and all key people through the full-scale invasion.',
      'Introduced Definition of Ready, Definition of Done and capacity planning as a hybrid process that fitted stakeholders with business constraints.',
      'Aligned 300+ stakeholders outside the reporting line and established a shared delivery-governance model across business, product, engineering, QA and DevOps.',
      'Owned budget forecasting, financial reporting and cost control.',
      'Proposed tablet-based QR sign-in for students: 9.9/10 satisfaction, then adopted across other products.',
      'Managed 2 subscription mobile apps in parallel and contributed to pricing, packaging and paywall tests.',
      'Mentored 3 PMs.',
    ], uk: [
      'Керував 3 продуктовими напрямами (HR і управління знаннями, онлайн-школа, адміністрування освіти), B2B та B2C.',
      'Очолював підрозділ до 45 людей у продукті, розробці, дизайні, QA, бізнес-аналізі, DevOps і підтримці; до 11 менеджерів і тімлідів підпорядковувалися напряму. Одночасно підтримувалося близько 22 проєктів.',
      'Заощадив $400 000 за рік завдяки покращенню процесів і оптимізації договорів із постачальниками, зокрема скоротив операційні витрати на 22% (витрати на інструменти й інфраструктуру плюс виграш від процесів).',
      'Випустив 15+ релізів із покращенням NPS, retention і задоволеності партнерів.',
      'Стабілізував підрозділ і зберіг 80%+ команди та всіх ключових людей під час повномасштабного вторгнення.',
      'Запровадив Definition of Ready, Definition of Done і capacity planning як гібридний процес, що пасував стейкхолдерам із бізнес-обмеженнями.',
      'Узгоджував 300+ стейкхолдерів поза лінією підпорядкування та створив спільну модель delivery-governance між бізнесом, продуктом, розробкою, QA і DevOps.',
      'Відповідав за прогнозування бюджету, фінансову звітність і контроль витрат.',
      'Запропонував вхід студентів за QR-кодом на планшетах: 9,9/10 задоволеності, згодом застосовано в інших продуктах.',
      'Паралельно вів 2 мобільні застосунки з підпискою та долучався до тестів цін, пакетів і paywall.',
      'Менторив 3 PM.',
    ] } },
  { id: 'pace', when: '05/2020 – 10/2021', skills: 'fp agile metrics presales mentor risk mobile',
    title: { en: 'Senior IT Project Manager', uk: 'Senior IT Project Manager' },
    org: { en: 'IT outsourcing company · Ukraine, remote', uk: 'Аутсорсингова IT-компанія · Україна, віддалено' },
    hl: { en: '8 concurrent projects · 25 developers · stakeholder satisfaction +25%', uk: '8 одночасних проєктів · 25 розробників · задоволеність стейкхолдерів +25%' },
    b: { en: [
      'Managed up to 8 concurrent client projects and teams with 25 developers under Fixed Price and T&M contracts.',
      'Coordinated distributed delivery across Ukraine, EU, US and UK clients; ran client workshops and interviews.',
      'Scope: web and mobile apps, online design tools, AR/VR and enterprise software; game development for about 1.5 years in total.',
      'Introduced the 4 DORA metrics, KPI dashboards and reporting templates.',
      'Led remote pre-sales scoping, proposals, estimation, RFP responses and account expansion.',
      'Proposed infrastructure improvements that generated additional profit; an SEO and promotion proposal raised another contract\'s value by 20% and improved margin.',
      'Raised stakeholder satisfaction by 25% and received internal recognition for project management.',
      'Mentored 7 PMs.',
    ], uk: [
      'Вів до 8 одночасних клієнтських проєктів і команд із 25 розробниками за контрактами Fixed Price та T&M.',
      'Координував розподілене delivery для клієнтів з України, ЄС, США та Великої Британії; проводив воркшопи й інтерв\'ю з клієнтами.',
      'Сфера: веб- і мобільні застосунки, онлайн-інструменти дизайну, AR/VR та enterprise-софт; розробка ігор загалом близько 1,5 року.',
      'Запровадив 4 метрики DORA, KPI-дашборди та шаблони звітності.',
      'Вів віддалений пресейл: скоупінг, пропозиції, оцінки, відповіді на RFP та розширення акаунтів.',
      'Запропонував покращення інфраструктури, що дали додатковий прибуток; пропозиція із SEO й просування підвищила вартість іншого контракту на 20% та покращила маржу.',
      'Підвищив задоволеність стейкхолдерів на 25% і отримав внутрішнє визнання за управління проєктами.',
      'Менторив 7 PM.',
    ] } },
  { id: 'pinguin', when: '05/2016 – 10/2019', skills: 'fp agile teams presales discovery ecom risk',
    title: { en: 'IT Project Manager', uk: 'IT Project Manager' },
    org: { en: 'Web development studio (custom software for SMEs) · Ukraine', uk: 'Студія веброзробки (замовний софт для малого й середнього бізнесу) · Україна' },
    hl: { en: '10+ client engagements of 2 to 3 years each', uk: '10+ клієнтських співпраць по 2–3 роки кожна' },
    b: { en: [
      'Managed 10+ long-term client engagements, 2 to 3 years each, including Fixed Price projects with 8 developers.',
      'Rebuilt the development team and delivery processes after a staffing disruption.',
      'Assembled teams for specific ERP and e-commerce projects, first for development and then for support.',
      'Acted as Product Owner: translated business goals into requirements, priorities and user journeys.',
      'Managed scope, budget, schedules and releases; introduced Kanban, Jira, Confluence and structured reporting.',
      'Supported pre-sales and repeat business through product improvements and maintenance.',
    ], uk: [
      'Вів 10+ довгострокових клієнтських співпраць по 2–3 роки кожна, зокрема проєкти Fixed Price з 8 розробниками.',
      'Відбудував команду розробки й процеси delivery після кадрового збою.',
      'Збирав команди для конкретних ERP- та e-commerce-проєктів: спершу для розробки, потім для підтримки.',
      'Виконував обов\'язки Product Owner: перетворював бізнес-цілі на вимоги, пріоритети й користувацькі сценарії.',
      'Керував скоупом, бюджетом, термінами й релізами; запровадив Kanban, Jira, Confluence і структуровану звітність.',
      'Підтримував пресейл і повторні продажі через покращення продукту та супровід.',
    ] } },
  { id: 'obmen', when: '01/2016 – 09/2016', skills: 'discovery ab ecom prio',
    title: { en: 'Product Owner', uk: 'Product Owner' },
    org: { en: 'Electronic currency exchange · Ukraine', uk: 'Обмінник електронних валют · Україна' },
    hl: { en: 'Contributed to profitability within six months', uk: 'Вийшли на прибутковість за пів року' },
    b: { en: [
      'Prioritised high-demand, high-margin exchange directions, payment integrations, merchant connectivity and automation.',
      'Optimised commissions, operating costs and UX using click-map analysis and contributed to profitability within six months.',
      'Built client support from scratch, including SLAs, standards and quality metrics.',
      'Managed daily operations, exchange-direction economics, staff training and process documentation.',
    ], uk: [
      'Пріоритизував напрями обміну з високим попитом і маржею, платіжні інтеграції, підключення мерчантів і автоматизацію.',
      'Оптимізував комісії, операційні витрати та UX за допомогою аналізу кліків і долучився до виходу на прибутковість за пів року.',
      'Побудував клієнтську підтримку з нуля, зокрема SLA, стандарти й метрики якості.',
      'Керував щоденними операціями, економікою напрямів обміну, навчанням персоналу й документацією процесів.',
    ] } },
  { id: 'free', when: '01/2015 – 05/2018', skills: 'seo ecom',
    title: { en: 'Freelancer', uk: 'Фрілансер' },
    org: { en: 'Direct client work, parallel with employed roles · Ukraine', uk: 'Робота напряму з клієнтами, паралельно з найманою роботою · Україна' },
    hl: { en: 'Translations, banners, SEO blogs, data tools', uk: 'Переклади, банери, SEO-блоги, інструменти для даних' },
    b: { en: [
      'Delivered technical translations and animated Flash advertising banners for international corporate clients.',
      'Developed and promoted entrepreneurs\' blogs through SEO.',
      'Built parsers and migration tools for eBay, Amazon and AliExpress data.',
    ], uk: [
      'Виконував технічні переклади та створював анімовані Flash-банери для міжнародних корпоративних клієнтів.',
      'Розробляв і просував блоги підприємців за допомогою SEO.',
      'Створював парсери та інструменти міграції даних eBay, Amazon і AliExpress.',
    ] } },
  { id: 'prseo', when: '12/2012 – 01/2015', skills: 'teams seo presales ecom',
    title: { en: 'Director of IT', uk: 'Director of IT' },
    org: { en: 'Web development and digital promotion agency · Ukraine', uk: 'Агенція веброзробки й digital-просування · Україна' },
    hl: { en: '100+ projects · 92% of target keywords in Google\'s top 5', uk: '100+ проєктів · 92% цільових ключових слів у топ-5 Google' },
    b: { en: [
      'Acquired clients; negotiated and signed website-development and promotion contracts, including exclusive corporate engagements.',
      'Recruited, trained and led up to 9 people; completed 100+ projects and secured long-term maintenance engagements.',
      'SEO results: 92% of target keywords in Google\'s top 5 and 42% in the top 3.',
    ], uk: [
      'Залучав клієнтів; вів переговори й підписував договори на розробку та просування сайтів, зокрема ексклюзивні корпоративні.',
      'Наймав, навчав і очолював до 9 людей; виконав 100+ проєктів і забезпечив довгострокові угоди на супровід.',
      'Результати SEO: 92% цільових ключових слів у топ-5 Google і 42% у топ-3.',
    ] } },
  { id: 'web', when: '01/2008 – 12/2012', skills: 'teams seo ecom',
    title: { en: 'Web Developer', uk: 'Веброзробник' },
    org: { en: 'Freelance web development under my own brand · Ukraine', uk: 'Фриланс-веброзробка під власним брендом · Україна' },
    hl: { en: '60+ projects · a team of up to 12 freelancers', uk: '60+ проєктів · команда до 12 фрилансерів' },
    b: { en: [
      'Built websites on WordPress, Joomla and OpenCart; completed 60+ projects sourced through freelance platforms.',
      'Built a team of up to 12 freelancers covering design, SEO, content, development and testing.',
    ], uk: [
      'Створював сайти на WordPress, Joomla та OpenCart; виконав 60+ проєктів, знайдених на фриланс-платформах.',
      'Зібрав команду до 12 фрилансерів: дизайн, SEO, контент, розробка й тестування.',
    ] } },
];

// ------------------------------------------------------------------ page-level strings
const L = {
  en: {
    lang: 'en', locale: 'en_US', altLocale: 'uk_UA', path: '/cv/', otherPath: '/uk/cv/', otherLabel: 'UA', otherTitle: 'Читати українською', otherHreflang: 'uk',
    home: '/', blog: '/blog/', pay: '/pay/', privacy: '/privacy/', privacyLabel: 'Privacy', name: 'Mykola Kalakutskyi', alt: 'Микола Калакуцький',
    nav: { cv: 'CV', projects: 'Projects', blog: 'Blog', consult: 'Consultation' }, pdf: '/assets/cv/Mykola_Kalakutskyi_CV_EN.pdf',
    title: 'Mykola Kalakutskyi – CV: Project, Delivery & Program Manager',
    description: 'CV of Mykola Kalakutskyi, project, delivery and program manager: 12+ years in IT delivery, 18 teams built from scratch, a department of up to 45, 400+ mentoring sessions. iGaming, EdTech, outsourcing, AI-assisted delivery.',
    eyebrow: 'CV · open to EU-remote roles and relocation', role: 'Project, Delivery & Program Manager', loc: 'Sofia, Bulgaria (EU)',
    btnPdf: 'Download CV (PDF)', mail: 'Email', stats: [
      ['12', '+', 'years in IT delivery'], ['18', '', 'teams built from scratch'], ['400', '+', 'mentoring sessions and consultations'],
      ['160', '+', 'client projects delivered (2008–2018)'], ['1.2', 'M+', 'extra outsourcing revenue (pre-sales and upselling)', '$'], ['400', 'K', 'saved in one year (22% lower operating costs)', '$'],
    ],
    sumH: 'Summary',
    summary: 'Project, delivery and program manager. 12+ years in IT, managing delivery and teams, in product companies, IT outsourcing and my own ventures. I run delivery for B2B and B2C products in iGaming, EdTech, HRTech, e-commerce and mobile, build teams from scratch and manage managers: up to 45 people in one department. Engineering background, product thinking and practical AI tooling in daily work.',
    skillsH: 'Skills', skillsHint: 'Tap one or more skills to highlight the roles where I used them.', clear: 'Clear',
    expH: 'Experience', expand: 'Expand all', collapse: 'Collapse all', expNote: 'Employer names are left out on purpose; the work, dates and results are real.',
    venH: 'Ventures', venNote: 'Companies I run or help run, next to my delivery roles.',
    ventures: [
      { t: 'Mimeon', r: 'CEO and Founder', d: 'A mobile app: an endless gallery of images with no text, where the feed is filtered and sorted by your own behavior and activity.', href: 'https://mimeon.art/', logo: 'mimeon.png' },
      { t: 'MyManager', r: 'CEO', d: 'An AI career manager: collects jobs daily, scores them against your CV and tracks your applications.', href: 'https://mymgr.app/', logo: 'mymanager.png' },
      { t: 'CyberField Net', r: 'COO', d: 'Online cybersecurity education: a practical course with mentoring.', href: 'https://cyberfieldnet-tech.webflow.io/', logo: 'cyberfield.png' },
    ],
    comH: 'Community and teaching', comNote: 'Non-commercial work, not counted as employment.',
    community: [
      ['Outstanding PM', 'Telegram channel about management, 900+ subscribers, since 01/2024', CHANNEL],
      ['PM Coffee Time', 'Founder and host of online meetups for project managers, since 10/2023', 'https://pmcoffeetime.online/'],
      ['Team Challenge', 'PM mentor in a community of 4,400+ members', ''],
      ['SkillsUp', 'Teacher of practical courses', 'https://skillsup.ua/about/our-team/mykola-kalakutsky/'],
    ],
    eduH: 'Education and certifications',
    edu: ['Bachelor of Engineering, Automation Engineering (Computer Automation), Kyiv Polytechnic Institute, Ukraine',
      'Certified Project Manager (CPM), 2018', 'Practical Product Management Course, 10/2025 – 03/2026', 'Preparing for PMP and PRINCE2 (planned 2027); ITIL planned for 2027'],
    langH: 'Languages', langs: ['English: advanced (C1)', 'Ukrainian: native', 'Russian: native', 'Greek: intermediate (B1)', 'Czech: elementary (A2)'],
    toolsH: 'Tools',
    tools: ['Jira, Confluence, Linear, MS Project, Asana, Trello, ClickUp', 'Miro, Figma, Notion, Slack, Google Workspace, Draw.io, Mermaid', 'Postman, Swagger/OpenAPI, GitHub, GitLab', 'Amplitude, Tableau, Google Analytics, Power BI or Grafana', 'HubSpot, Zendesk', 'Claude, Claude Code, ChatGPT and Codex, Gemini, Cursor, Perplexity'],
    ctaH: 'Let us talk', ctaP: 'Hiring for a delivery, project or program role? Write to me or download the CV. Looking for a one-hour consultation instead?', ctaLink: 'Book a consultation', footerBlog: 'Blog', footerOther: 'Українською',
    printContact: `${EMAIL} · linkedin.com/in/hanizex · t.me/hanizex · mykola.pages.dev/cv/`,
    jobTitle: 'Project, Delivery and Program Manager', personDesc: 'Project, delivery and program manager with 12+ years in IT, managing delivery and teams. Built 18 teams from scratch, led a department of up to 45 people, delivered 400+ mentoring sessions and consultations.',
  },
  uk: {
    lang: 'uk', locale: 'uk_UA', altLocale: 'en_US', path: '/uk/cv/', otherPath: '/cv/', otherLabel: 'EN', otherTitle: 'Read in English', otherHreflang: 'en',
    home: '/uk/', blog: '/uk/blog/', pay: '/uk/pay/', privacy: '/uk/privacy/', privacyLabel: 'Конфіденційність', name: 'Микола Калакуцький', alt: 'Mykola Kalakutskyi',
    nav: { cv: 'Резюме', projects: 'Проєкти', blog: 'Блог', consult: 'Консультація' }, pdf: '/assets/cv/Mykola_Kalakutskyi_CV_UA.pdf',
    title: 'Микола Калакуцький – резюме: проєктний, delivery- і програмний менеджер',
    description: 'Резюме Миколи Калакуцького, проєктного, delivery- і програмного менеджера: 12+ років в IT-delivery, 18 команд створено з нуля, підрозділ до 45 людей, 400+ менторських сесій. iGaming, EdTech, аутсорсинг, delivery з ШІ.',
    eyebrow: 'Резюме · відкритий до EU-remote ролей і релокації', role: 'Проєктний, delivery- і програмний менеджер', loc: 'Софія, Болгарія (ЄС)',
    btnPdf: 'Завантажити резюме (PDF)', mail: 'Email', stats: [
      ['12', '+', 'років в IT-delivery'], ['18', '', 'команд створено з нуля'], ['400', '+', 'менторських сесій і консультацій'],
      ['160', '+', 'клієнтських проєктів (2008–2018)'], ['1,2', 'M+', 'додаткового аутсорс-доходу (пресейл і апсейл)', '$'], ['400', 'K', 'заощаджено за рік (операційні витрати -22%)', '$'],
    ],
    sumH: 'Коротко про мене',
    summary: 'Проєктний, delivery- і програмний менеджер. 12+ років в IT, керую delivery і командами: у продуктових компаніях, IT-аутсорсингу та власних проєктах. Веду delivery B2B- і B2C-продуктів в iGaming, EdTech, HRTech, e-commerce та мобільній розробці, створюю команди з нуля й керую менеджерами: до 45 людей в одному підрозділі. Інженерний бекграунд, продуктове мислення й практичне використання ШІ в щоденній роботі.',
    skillsH: 'Навички', skillsHint: 'Натисніть одну чи кілька навичок, щоб підсвітити ролі, де я їх застосовував.', clear: 'Скинути',
    expH: 'Досвід', expand: 'Розгорнути все', collapse: 'Згорнути все', expNote: 'Назви роботодавців свідомо не вказані; робота, дати й результати справжні.',
    venH: 'Власні проєкти', venNote: 'Компанії, якими я керую або допомагаю керувати, поряд із ролями в delivery.',
    ventures: [
      { t: 'Mimeon', r: 'CEO і засновник', d: 'Мобільний застосунок: нескінченна галерея зображень без тексту, у якій стрічка фільтрується й сортується за вашою поведінкою та активністю.', href: 'https://mimeon.art/', logo: 'mimeon.png' },
      { t: 'MyManager', r: 'CEO', d: 'AI-менеджер кар\'єри: щодня збирає вакансії, оцінює їх за вашим CV і відстежує ваші відгуки.', href: 'https://mymgr.app/', logo: 'mymanager.png' },
      { t: 'CyberField Net', r: 'COO', d: 'Онлайн-освіта з кібербезпеки: практичний курс із менторською підтримкою.', href: 'https://cyberfieldnet-tech.webflow.io/', logo: 'cyberfield.png' },
    ],
    comH: 'Спільнота й навчання', comNote: 'Некомерційна робота, у стаж не зараховується.',
    community: [
      ['Outstanding PM', 'Telegram-канал про менеджмент, 900+ підписників, від 01/2024', CHANNEL],
      ['PM Coffee Time', 'Засновник і ведучий онлайн-зустрічей для проєктних менеджерів, від 10/2023', 'https://pmcoffeetime.online/'],
      ['Team Challenge', 'PM-ментор у спільноті з 4400+ учасників', ''],
      ['SkillsUp', 'Викладач практичних курсів', 'https://skillsup.ua/about/our-team/mykola-kalakutsky/'],
    ],
    eduH: 'Освіта й сертифікати',
    edu: ['Бакалавр інженерії, автоматизація (комп\'ютерна автоматизація), Київський політехнічний інститут, Україна',
      'Certified Project Manager (CPM), 2018', 'Практичний курс із продуктового менеджменту, 10/2025 – 03/2026', 'Готуюсь до PMP та PRINCE2 (план: 2027); ITIL у планах на 2027'],
    langH: 'Мови', langs: ['Англійська: просунутий рівень (C1)', 'Українська: рідна', 'Російська: рідна', 'Грецька: середній рівень (B1)', 'Чеська: елементарний рівень (A2)'],
    toolsH: 'Інструменти',
    tools: ['Jira, Confluence, Linear, MS Project, Asana, Trello, ClickUp', 'Miro, Figma, Notion, Slack, Google Workspace, Draw.io, Mermaid', 'Postman, Swagger/OpenAPI, GitHub, GitLab', 'Amplitude, Tableau, Google Analytics, Power BI або Grafana', 'HubSpot, Zendesk', 'Claude, Claude Code, ChatGPT і Codex, Gemini, Cursor, Perplexity'],
    ctaH: 'Давайте поговоримо', ctaP: 'Шукаєте delivery-, проєктного чи програмного менеджера? Напишіть мені або завантажте резюме. Потрібна година консультації?', ctaLink: 'Забронювати консультацію', footerBlog: 'Блог', footerOther: 'English',
    printContact: `${EMAIL} · linkedin.com/in/hanizex · t.me/hanizex · mykola.pages.dev/uk/cv/`,
    jobTitle: 'Проєктний, delivery- і програмний менеджер', personDesc: 'Проєктний, delivery- і програмний менеджер із 12+ роками в IT, керує delivery і командами. Створив 18 команд з нуля, очолював підрозділ до 45 людей, провів 400+ менторських сесій і консультацій.',
  },
};

// ------------------------------------------------------------------ rendering
const skillLabel = (it, lang) => (lang === 'en' ? it[1] : it[2]);

function page(c) {
  const lang = c.lang, home = SITE + c.path, other = SITE + c.otherPath;
  const en = lang === 'en' ? home : other, uk = lang === 'uk' ? home : other;
  const person = {
    '@type': 'Person', '@id': `${SITE}/#me`, name: c.name, alternateName: c.alt, url: SITE + c.home, image: PHOTO, jobTitle: c.jobTitle, description: c.personDesc,
    sameAs: [LINKEDIN, CHANNEL, GITHUB], knowsLanguage: ['en', 'uk', 'ru', 'el', 'cs'],
    knowsAbout: ['Project management', 'Delivery management', 'Program management', 'Product management', 'iGaming', 'EdTech', 'Agile', 'Team building', 'Mentoring', 'AI-assisted delivery'],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Kyiv Polytechnic Institute' },
    homeLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Sofia', addressCountry: 'BG' } },
  };
  const ld = { '@context': 'https://schema.org', '@type': 'ProfilePage', dateModified: MODIFIED, inLanguage: lang, url: home, name: c.title, mainEntity: person };
  const ev = (n) => `data-ev="${n}"`;
  const chips = SKILLS.map((g) => `<div class="chipgroup"><h3 class="sub">${esc(g.g[lang])}</h3><div class="chips">${g.items.map((it) => `<button type="button" class="chip" data-skill="${it[0]}" aria-pressed="false">${esc(skillLabel(it, lang))}</button>`).join('')}</div></div>`).join('\n        ');
  const roles = ROLES.map((r, i) => `<details class="job"${r.open ? ' open' : ''} id="role-${i + 1}" data-skills="${r.skills}">
          <summary><span class="when">${esc(r.when.replace('present', lang === 'uk' ? 'тепер' : 'present'))}</span><span class="what"><strong>${esc(r.title[lang])}</strong><em>${esc(r.org[lang])}</em><span class="hl">${esc(r.hl[lang])}</span></span><span class="chev" aria-hidden="true"></span></summary>
          <ul>${r.b[lang].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </details>`).join('\n        ');
  const stats = c.stats.map((s) => `<div class="stat"><strong>${s[3] || ''}<span class="num" data-to="${s[0].replace(',', '.')}" data-dec="${/[.,]/.test(s[0]) ? 1 : 0}">${s[0]}</span>${s[1]}</strong><span>${esc(s[2])}</span></div>`).join('\n        ');
  const ventures = c.ventures.map((v) => `<a class="card ic" href="${v.href}" data-ev="project_click" rel="noopener"><img class="logo" src="/assets/logos/${v.logo}" alt="" width="52" height="52" loading="lazy"><div class="ct"><strong>${esc(v.t)}</strong><span class="role">${esc(v.r)}</span><span>${esc(v.d)}</span></div></a>`).join('\n        ');
  const community = c.community.map((x) => `<li>${x[2] ? `<a href="${x[2]}" rel="noopener">${esc(x[0])}</a>` : `<strong>${esc(x[0])}</strong>`}: ${esc(x[1])}</li>`).join('');
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.title)}</title>
  <meta name="description" content="${esc(c.description)}">
  <meta name="author" content="${esc(c.name)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${home}">
  <link rel="alternate" hreflang="en" href="${en}">
  <link rel="alternate" hreflang="uk" href="${uk}">
  <link rel="alternate" hreflang="x-default" href="${SITE}/cv/">
  <link rel="alternate" type="application/pdf" href="${SITE}${c.pdf}" title="${esc(c.btnPdf)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="${esc(c.title)}">
  <meta property="og:description" content="${esc(c.description)}">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${home}">
  <meta property="og:image" content="${PHOTO}">
  <meta property="og:locale" content="${c.locale}">
  <meta property="og:locale:alternate" content="${c.altLocale}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/assets/style.css">
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body class="landing cv">
  <header class="site">
    <div class="wrap">
      <a class="brand" href="${c.home}">${esc(c.name)}</a>
      <nav><a href="${c.path}" aria-current="page">${c.nav.cv}</a><a href="${c.home}#projects">${c.nav.projects}</a><a href="${c.blog}">${c.nav.blog}</a><a href="${c.home}#consult">${c.nav.consult}</a><a href="${c.otherPath}" hreflang="${c.otherHreflang}" lang="${c.otherHreflang}" title="${c.otherTitle}">${c.otherLabel}</a></nav>
    </div>
  </header>

  <main class="wrap">
    <div class="cv-hero hero">
      <div class="hero-top">
        <img class="photo" src="/assets/mykola.jpg" width="128" height="128" alt="${esc(c.name)}" fetchpriority="high">
        <div class="hero-head">
          <p class="eyebrow">${esc(c.eyebrow)}</p>
          <h1>${esc(c.name)}</h1>
          <p class="cv-role">${esc(c.role)} · ${esc(c.loc)}</p>
        </div>
      </div>
      <p class="cta-row noprint">
        <a class="btn" href="${c.pdf}" download ${ev('cv_download')}>${esc(c.btnPdf)}</a>
        <a class="btn ghost" href="${LINKEDIN}" rel="noopener" ${ev('cv_contact')}>LinkedIn</a>
        <a class="btn ghost" href="mailto:${EMAIL}" ${ev('cv_contact')}>${esc(c.mail)}</a>
        <a class="btn ghost" href="${TG}" rel="noopener" ${ev('cv_contact')}>Telegram</a>
      </p>
      <p class="printonly">${esc(c.printContact)}</p>
    </div>

    <section class="proofbar">
      <div class="stats six">
        ${stats}
      </div>
    </section>

    <section id="summary" class="reveal">
      <h2>${esc(c.sumH)}</h2>
      <p class="cv-summary">${esc(c.summary)}</p>
    </section>

    <section id="skills" class="reveal noprint">
      <h2>${esc(c.skillsH)}</h2>
      <p class="note">${esc(c.skillsHint)} <button type="button" class="linkbtn" id="clear" hidden>${esc(c.clear)}</button></p>
      <div class="skillgrid">
        ${chips}
      </div>
    </section>

    <section id="experience" class="reveal">
      <h2>${esc(c.expH)}</h2>
      <p class="note noprint">${esc(c.expNote)} <button type="button" class="linkbtn" id="expand">${esc(c.expand)}</button> · <button type="button" class="linkbtn" id="collapse">${esc(c.collapse)}</button></p>
      <div class="tl">
        ${roles}
      </div>
    </section>

    <section id="ventures" class="reveal">
      <h2>${esc(c.venH)}</h2>
      <p class="note">${esc(c.venNote)}</p>
      <div class="cards three">
        ${ventures}
      </div>
    </section>

    <section id="community" class="reveal">
      <h2>${esc(c.comH)}</h2>
      <p class="note">${esc(c.comNote)}</p>
      <ul class="plainlist">${community}</ul>
    </section>

    <section id="education" class="reveal">
      <div class="cols">
        <div><h2>${esc(c.eduH)}</h2><ul class="plainlist">${c.edu.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div><h2>${esc(c.langH)}</h2><ul class="plainlist">${c.langs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      <h2 style="margin-top:28px">${esc(c.toolsH)}</h2>
      <ul class="plainlist">${c.tools.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </section>

    <section id="contact" class="reveal noprint">
      <div class="cvcta">
        <h2>${esc(c.ctaH)}</h2>
        <p>${esc(c.ctaP)} <a href="${c.home}#consult">${esc(c.ctaLink)}</a>.</p>
        <p><a class="btn" href="${c.pdf}" download ${ev('cv_download')}>${esc(c.btnPdf)}</a> <a class="btn ghost" href="mailto:${EMAIL}" ${ev('cv_contact')}>${EMAIL}</a></p>
      </div>
    </section>
  </main>

  <footer class="site noprint">
    <div class="wrap">© <span id="y">2026</span> ${esc(c.name)} · <a href="${c.blog}">${c.footerBlog}</a> · <a href="${c.otherPath}" hreflang="${c.otherHreflang}" lang="${c.otherHreflang}">${c.footerOther}</a> · <a href="${c.privacy}">${c.privacyLabel}</a> · <a href="${LINKEDIN}" rel="noopener">LinkedIn</a> · <a href="${CHANNEL}" rel="noopener">Telegram</a></div>
  </footer>
  <script src="/assets/site.js" defer></script>
  <script src="/assets/cv.js" defer></script>
</body>
</html>
`;
}

for (const k of ['en', 'uk']) {
  const c = L[k];
  const dir = join(ROOT, 'public', c.path.replace(/^\/|\/$/g, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page(c));
}
console.log('cv: en + uk written');
