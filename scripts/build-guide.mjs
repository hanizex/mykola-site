// JSE setup guide: /tools/job-search-engine/setup/ (EN) and /uk/tools/job-search-engine/setup/ (UK).
// An interactive walkthrough: four steps, each with a carousel of annotated UI illustrations, an animated UML sequence diagram,
// a checklist and tips; then the life of a job in the tracker and a mistakes-and-fixes section.
// All screens are illustrations with invented data. Behaviour lives in public/assets/jse-guide.js, styles in style.css.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { introLink } from './config.mjs';
import { SITE, esc, P, pth, shell } from './tools-shell.mjs';
import { journey, slides, sequences, states, mistakes } from './guide-content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const G = {
  en: {
    title: 'Set up your Job Search Engine: a step-by-step guide with examples', desc: 'How to prepare the Fact Bank, create a Master CV, set your job preferences and run your first scan. Interactive screens, animated diagrams and fixes for the common mistakes.',
    crumb: 'Setup guide', h1: 'Set up your Job Search Engine',
    lead: 'Four steps from zero to your first screened job. At every step the AI does the heavy work and you confirm the result.',
    status: 'The assistant pack and the tracker are ready. Every screen in this guide is an illustration with invented data ("Alex Example"). You can try the tracker in the demo; the online tracker has its own guide.',
    demo: 'Try the tracker demo', back: 'Back to the JSE page',
    ownH: 'Where it lives:', whoH: 'Who holds what', whoLead: 'Your personal data stays with you. The tracker only needs the jobs.',
    whoYou: ['Stays with you (your AI project, folder or drive)', ['Fact Bank, your facts with evidence', 'Master CV', 'Preferences and private notes', 'Tailored CVs, cover messages and LinkedIn messages']],
    whoTr: ['In the tracker', ['Jobs from the scan: the public ad text, the screening verdict', 'Statuses, dates and links', 'Short notes and reminders', 'Cover and LinkedIn messages, only if you choose to store them']],
    whoNote: 'Your AI provider sees what you share in your own chat, under your own account. That is your choice and happens outside the tracker. You can open, edit, move or delete your files at any time.',
    pathH: 'The journey at a glance', you: 'You', ai: 'AI', youDo: 'You', aiDo: 'The AI',
    screensH: 'The screens you will see', screensHint: 'Use the arrows, the dots or the keyboard. Hover a number on the right, or tap it, to see what it points at.',
    connH: 'Two ways to connect your AI chat to the tracker', connLead: 'The tracker does not write your CV. Your AI chat does. How they exchange data is the only thing that changes.',
    conn: [['Today', 'Copy and paste', 'Press Copy for AI on a card and paste it into your chat. The chat shows the findings and builds the package. You copy the CV, cover message and messages back into the card and set the status. Two clicks and two pastes per job. Works with Claude, ChatGPT, Gemini and other chats.', 'now'], ['Free test access', 'Direct connection (MCP)', 'You connect your AI chat to the online tracker once. Then you say "Process the next job from the tracker". The AI reads the card with the full description, does the work with you and updates the card itself. No copy and paste. Works with Claude and ChatGPT.', 'now', 'How to connect']],
    dailyH: 'Your daily routine', dailyHint: 'What you click, what you paste and what the AI does, for each job. Manual steps are mostly one click or a copy and paste.',
    flowH: 'How it works behind the screens', flowHint: 'Press Play to watch the messages flow, or step through them.',
    doneH: 'Done when', tipsH: 'Good to know', mistakesLink: 'Common mistakes for this step',
    next: (n, t) => `Next: step ${n}, ${t}`,
    sourcesH: 'Sources that work',
    car: { prev: 'Previous screen', next: 'Next screen', label: 'Screens', go: (n, t) => `Go to screen ${n}: ${t}`, of: (n, m) => `${n} / ${m}`, legendH: 'What to notice', illus: 'Illustration with invented data' },
    seq: { play: 'Play', pause: 'Pause', prev: 'Previous', next: 'Next', restart: 'Restart', step: (n, m) => `Step ${n} of ${m}`, press: 'Press Play, or use Next to step through.', list: 'Read the steps as a list', swipe: 'Swipe sideways to see the whole diagram' },
    vt: { pass: 'A job that passes', stop: 'A job that stops' },
    prog: (n, m) => `${n} of ${m} checks done`, progLabel: 'Your progress (this page only, nothing is saved)',
    troubleH: 'Common mistakes and how to fix them', troubleLead: 'Think ahead. Most problems fall into the same few patterns. Filter by step.',
    why: 'Why it happens', fix: 'How to fix it',
    ctaH: 'Want help with your setup?', ctaText: 'I run one-hour consultations. We can build your Fact Bank, check your Master CV and set your preferences together.', ctaBtn: 'Request a consultation', ctaIntro: 'Or book a free 20-minute intro call',
  },
  uk: {
    title: 'Налаштування Job Search Engine: покроковий посібник з прикладами', desc: 'Як підготувати Fact Bank, створити базове резюме, налаштувати вподобання щодо вакансій і запустити перше сканування. Інтерактивні екрани, анімовані схеми та виправлення типових помилок.',
    crumb: 'Посібник з налаштування', h1: 'Налаштуйте Job Search Engine',
    lead: 'Чотири кроки від нуля до першої перевіреної вакансії. На кожному кроці важку роботу робить ШІ, а ви підтверджуєте результат.',
    status: 'Пакет для асистента й трекер готові. Кожен екран у цьому посібнику це ілюстрація з вигаданими даними ("Alex Example"). Трекер можна спробувати в демо; в онлайн трекера є власний посібник.',
    demo: 'Спробувати демо трекера', back: 'Назад на сторінку JSE',
    ownH: 'Де це живе:', whoH: 'Хто що тримає', whoLead: 'Ваші особисті дані лишаються у вас. Трекеру потрібні лише вакансії.',
    whoYou: ['Лишається у вас (проєкт вашого ШІ, папка чи диск)', ['Fact Bank, ваші факти з доказами', 'Базове резюме', 'Вподобання й приватні нотатки', 'Адаптовані резюме, супровідні листи та повідомлення в LinkedIn']],
    whoTr: ['У трекері', ['Вакансії зі сканування: публічний текст оголошення, вердикт перевірки', 'Статуси, дати й посилання', 'Короткі нотатки й нагадування', 'Супровідний лист і повідомлення в LinkedIn, лише якщо ви вирішите їх зберігати']],
    whoNote: 'Ваш постачальник ШІ бачить те, чим ви ділитеся у власному чаті, у вашому власному акаунті. Це ваш вибір, і відбувається він поза трекером. Ви можете відкрити, змінити, перенести чи видалити свої файли будь-коли.',
    pathH: 'Шлях одним поглядом', you: 'Ви', ai: 'ШІ', youDo: 'Ви', aiDo: 'ШІ',
    screensH: 'Екрани, які ви побачите', screensHint: 'Користуйтеся стрілками, крапками чи клавіатурою. Наведіть на номер справа або торкніться його, щоб побачити, на що він вказує.',
    connH: 'Два способи підключити чат зі ШІ до трекера', connLead: 'Трекер не пише резюме. Це робить ваш чат зі ШІ. Змінюється лише те, як вони обмінюються даними.',
    conn: [['Сьогодні', 'Копіювання і вставка', 'Натисніть "Скопіювати для ШІ" на картці й вставте у ваш чат. Чат покаже висновки й збере пакет. Ви копіюєте резюме, супровідний лист і повідомлення назад у картку та міняєте статус. Два кліки й дві вставки на вакансію. Працює з Claude, ChatGPT, Gemini та іншими чатами.', 'now'], ['Безкоштовний тестовий доступ', 'Пряме підключення (MCP)', 'Ви один раз підключаєте чат зі ШІ до онлайн трекера. Далі кажете «Опрацюй наступну вакансію з Трекера». ШІ читає картку з повним описом, працює з вами й сам оновлює картку. Без копіювання. Працює з Claude і ChatGPT.', 'now', 'Як підключити']],
    dailyH: 'Ваша щоденна рутина', dailyHint: 'Що ви клікаєте, що вставляєте і що робить ШІ для кожної вакансії. Ручні кроки здебільшого це один клік або копіювання.',
    flowH: 'Як це працює за екранами', flowHint: 'Натисніть Play, щоб побачити потік повідомлень, або проходьте їх крок за кроком.',
    doneH: 'Готово, коли', tipsH: 'Варто знати', mistakesLink: 'Типові помилки цього кроку',
    next: (n, t) => `Далі: крок ${n}, ${t}`,
    sourcesH: 'Джерела, які підходять',
    car: { prev: 'Попередній екран', next: 'Наступний екран', label: 'Екрани', go: (n, t) => `Перейти до екрана ${n}: ${t}`, of: (n, m) => `${n} / ${m}`, legendH: 'На що звернути увагу', illus: 'Ілюстрація з вигаданими даними' },
    seq: { play: 'Play', pause: 'Пауза', prev: 'Назад', next: 'Далі', restart: 'Спочатку', step: (n, m) => `Крок ${n} з ${m}`, press: 'Натисніть Play або використовуйте "Далі", щоб іти крок за кроком.', list: 'Прочитати кроки списком', swipe: 'Проведіть убік, щоб побачити всю схему' },
    vt: { pass: 'Вакансія, що проходить', stop: 'Вакансія, що зупиняється' },
    prog: (n, m) => `Виконано перевірок: ${n} з ${m}`, progLabel: 'Ваш прогрес (лише на цій сторінці, нічого не зберігається)',
    troubleH: 'Типові помилки і як їх виправити', troubleLead: 'Думайте наперед. Більшість проблем повторюють кілька патернів. Фільтруйте за кроком.',
    why: 'Чому так буває', fix: 'Як виправити',
    ctaH: 'Потрібна допомога з налаштуванням?', ctaText: 'Я проводжу консультації на годину. Можемо разом зібрати ваш Fact Bank, перевірити базове резюме й налаштувати вподобання.', ctaBtn: 'Запросити консультацію', ctaIntro: 'Або запишіться на безкоштовне знайомство на 20 хвилин',
  },
};

// ---------------------------------------------------------------- UML sequence diagram (SVG, built here, animated by jse-guide.js)
function wrapText(s, max) {
  const words = String(s).split(' '), lines = [];
  let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  return lines;
}
function seqSvg(spec, uid) {
  const AW = 210, HEAD = 48, ROW = 78, TOP = HEAD + 22, n = spec.actors.length, W = n * AW, H = TOP + spec.msgs.length * ROW + 16;
  const ax = (i) => AW * i + AW / 2;
  const frames = (spec.frames || []).map((f) => {
    const y1 = TOP + f.a * ROW - 4, y2 = TOP + (f.b + 1) * ROW - 12;
    return `<g class="seq-frame"><rect x="6" y="${y1}" width="${W - 12}" height="${y2 - y1}" rx="10"/><text x="16" y="${y1 + 16}">${esc(f.l)}</text></g>`;
  }).join('');
  const life = spec.actors.map((a, i) => `<line class="seq-life" x1="${ax(i)}" y1="${HEAD}" x2="${ax(i)}" y2="${H - 8}"/>`).join('');
  const actors = spec.actors.map((a, i) => `<g class="seq-actor ${a.c}"><rect x="${ax(i) - 76}" y="6" width="152" height="36" rx="9"/><text x="${ax(i)}" y="29" text-anchor="middle">${esc(a.l)}</text></g>`).join('');
  const msgs = spec.msgs.map((m, i) => {
    const top = TOP + i * ROW, ay = top + 58, x1 = ax(m.f), x2 = ax(m.t), self = m.f === m.t;
    const label = `${i + 1}. ${m.x}`;
    let body;
    if (self) {
      const lines = wrapText(label, 24), right = m.f < n - 1;
      const tx = right ? x1 + 44 : x1 - 44, anc = right ? 'start' : 'end';
      const loop = right ? `M${x1},${ay - 14} h30 v26 h-26` : `M${x1},${ay - 14} h-30 v26 h26`;
      const ys = lines.map((_, li) => ay - 8 - (lines.length - 1 - li) * 15 + 6);
      body = `${lines.map((ln, li) => `<text x="${tx}" y="${ys[li]}" text-anchor="${anc}">${esc(ln)}</text>`).join('')}<path class="seq-arrow" d="${loop}" marker-end="url(#ah-${uid})"/>`;
    } else {
      const span = Math.abs(m.t - m.f), mid = (x1 + x2) / 2, max = Math.max(22, Math.floor((AW * span - 30) / 6.8));
      const lines = wrapText(label, max);
      body = `${lines.map((ln, li) => `<text x="${mid}" y="${ay - 10 - (lines.length - 1 - li) * 15}" text-anchor="middle">${esc(ln)}</text>`).join('')}<line class="seq-arrow" x1="${x1 + (x2 > x1 ? 3 : -3)}" y1="${ay}" x2="${x2 + (x2 > x1 ? -3 : 3)}" y2="${ay}" marker-end="url(#ah-${uid})"/>`;
    }
    return `<g class="seq-msg seen" data-i="${i}" data-x1="${x1}" data-x2="${x2}" data-y="${ay}">${body}<circle class="seq-pk" r="6" cx="0" cy="0"/></g>`;
  }).join('');
  return `<svg class="seq-svg" viewBox="0 0 ${W} ${H}" width="${W}" style="min-width:${Math.round(W * 0.78)}px" role="img" aria-label="${esc(spec.title)}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="ah-${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>${frames}${life}${actors}${msgs}</svg>`;
}

function seqFigure(k, spec, uid) {
  const g = G[k].seq;
  return `<figure class="jg-seq" data-n="${spec.msgs.length}">
    <figcaption class="jg-seq-t">${esc(spec.title)}</figcaption>
    <div class="jg-seq-scroll" tabindex="0" role="group" aria-label="${esc(spec.title)}">${seqSvg(spec, uid)}</div>
    <p class="jg-swipe">${esc(g.swipe)}</p>
    <div class="jg-seq-ctl" role="group" aria-label="${esc(spec.title)}">
      <button type="button" class="jg-b" data-a="restart" aria-label="${esc(g.restart)}">⟲</button>
      <button type="button" class="jg-b" data-a="prev" aria-label="${esc(g.prev)}">◀</button>
      <button type="button" class="jg-b play" data-a="play" aria-label="${esc(g.play)}" data-play="${esc(g.play)}" data-pause="${esc(g.pause)}">▶</button>
      <button type="button" class="jg-b" data-a="next" aria-label="${esc(g.next)}">▶|</button>
      <span class="jg-seq-n" data-fmt="${esc(g.step(0, spec.msgs.length))}">${esc(g.step(0, spec.msgs.length))}</span>
    </div>
    <p class="jg-seq-cap" aria-live="polite" data-press="${esc(g.press)}">${esc(g.press)}</p>
    <details class="jg-list"><summary>${esc(g.list)}</summary><ol>${spec.msgs.map((m) => `<li data-cap="${esc(m.c)}"><b>${esc(spec.actors[m.f].l)} → ${esc(spec.actors[m.t].l)}:</b> ${esc(m.x)}. ${esc(m.c)}</li>`).join('')}</ol></details>
  </figure>`;
}

// ---------------------------------------------------------------- carousel with annotated mock-ups
function carousel(k, id, list) {
  const g = G[k].car;
  const sl = list.map((s, i) => `<div class="jg-slide" role="group" aria-roledescription="slide" aria-label="${esc(g.of(i + 1, list.length))}: ${esc(s.title)}" data-title="${esc(s.title)}"${i === 0 ? ' data-first="1"' : ''}>
      <div class="jg-slide-h"><span class="jg-st-n">${i + 1}</span><b>${esc(s.title)}</b></div>
      <div class="jg-slide-b">
        <div class="jg-shot" aria-hidden="false"><div class="jg-illus">${esc(g.illus)}</div>${s.variants ? `<div class="jg-vts" role="group">${['pass', 'stop'].map((v, vi) => `<button type="button" class="jg-vt${vi === 0 ? ' on' : ''}" data-v="${v}">${esc(G[k].vt[v])}</button>`).join('')}</div>` : ''}${s.mock}</div>
        <div class="jg-legend"><h4>${esc(g.legendH)}</h4><ol>${s.legend.map((t, n) => `<li><button type="button" class="jg-lg" data-hs="${n + 1}"><b>${n + 1}</b><span>${esc(t)}</span></button></li>`).join('')}</ol></div>
      </div>
    </div>`).join('');
  return `<section class="jg-car" id="${id}" aria-roledescription="carousel" aria-label="${esc(g.label)}" data-prev="${esc(g.prev)}" data-next="${esc(g.next)}" data-go="${esc(g.go('%n', '%t'))}" data-of="${esc(g.of('%n', '%m'))}">
    <div class="jg-slides">${sl}</div>
    <div class="jg-ctl"><button type="button" class="jg-b" data-c="prev" aria-label="${esc(g.prev)}">◀</button><div class="jg-dots" role="group"></div><span class="jg-count" aria-live="polite"></span><button type="button" class="jg-b" data-c="next" aria-label="${esc(g.next)}">▶</button></div>
  </section>`;
}

// ---------------------------------------------------------------- page
function guide(k) {
  const c = G[k], p = P[k], base = pth(k, '/tools/job-search-engine/'), path = `${base}setup/`;
  const J = journey(k), S = slides(k), Q = sequences(k), ST = states(k), M = mistakes(k);
  const stepKey = ['facts', 'cv', 'prefs', 'run'];
  const totalChecks = J.reduce((a, s) => a + s.done.length, 0);

  const path_ = `<ol class="jg-path">${J.map((s) => `<li><a href="#step-${s.id}"><span class="jg-num">${s.n}</span><b>${esc(s.title)}</b><span class="jg-goal">${esc(s.goal)}</span><span class="jg-who-m"><i class="y">${esc(c.youDo)}</i> ${esc(s.who.you)}</span><span class="jg-who-m"><i class="a">${esc(c.aiDo)}</i> ${esc(s.who.ai)}</span></a></li>`).join('')}</ol>`;

  const prog = `<nav class="jg-prog" aria-label="${esc(c.progLabel)}"><ul>${J.map((s) => `<li><a href="#step-${s.id}" data-step="${s.id}"><span class="jg-pn">${s.n}</span><span class="jg-pt">${esc(s.title)}</span></a></li>`).join('')}</ul><div class="jg-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${totalChecks}" aria-valuenow="0" aria-label="${esc(c.progLabel)}"><i></i></div><span class="jg-prog-t" data-fmt="${esc(c.prog('%n', '%m'))}" data-max="${totalChecks}">${esc(c.prog(0, totalChecks))}</span></nav>`;

  const steps = J.map((s, i) => {
    const key = stepKey[i];
    const src = s.sources ? `<div class="jg-src"><h3>${esc(s.sourcesH)}</h3><ul>${s.sources.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
    const checks = s.done.map((d, n) => `<li><label><input type="checkbox" data-step="${s.id}"> <span>${esc(d)}</span></label></li>`).join('');
    const nxt = J[i + 1] ? `<a class="jg-next" href="#step-${J[i + 1].id}"><span aria-hidden="true">↓</span> ${esc(c.next(J[i + 1].n, J[i + 1].title))}</a>` : '';
    return `<section class="jg-step" id="step-${s.id}" aria-labelledby="h-${s.id}" data-step="${s.id}">
      <header class="jg-sh"><span class="jg-num big">${s.n}</span><div><h2 id="h-${s.id}">${esc(s.title)}</h2><p class="jg-goal">${esc(s.goal)}</p></div></header>
      <p class="jg-intro">${esc(s.intro)}</p>
      <div class="jg-who"><div class="jg-w you"><b>${esc(c.you)}</b><span>${esc(s.who.you)}</span></div><span class="jg-wa" aria-hidden="true">⇄</span><div class="jg-w ai"><b>${esc(c.ai)}</b><span>${esc(s.who.ai)}</span></div></div>
      ${src}
      <p class="jg-own"><b>${esc(c.ownH)}</b> ${esc(s.own)}</p>
      <h3 class="jg-h3">${esc(c.screensH)}</h3><p class="note">${esc(c.screensHint)}</p>
      ${carousel(k, `car-${s.id}`, S[key])}
      <h3 class="jg-h3">${esc(c.flowH)}</h3><p class="note">${esc(c.flowHint)}</p>
      ${seqFigure(k, Q[key], s.id)}
      ${key === 'run' ? `<h3 class="jg-h3">${esc(c.dailyH)}</h3><p class="note">${esc(c.dailyHint)}</p>${seqFigure(k, Q.runDaily, 'daily')}<h3 class="jg-h3">${esc(c.connH)}</h3><p class="note">${esc(c.connLead)}</p><div class="jg-conn">${c.conn.map(([tag, h, t, cl, link]) => `<div class="jg-cn ${cl}"><span class="vtag">${esc(tag)}</span><b>${esc(h)}</b><p>${esc(t)}</p>${link ? `<p><a href="${base}hosted/">${esc(link)} →</a></p>` : ''}</div>`).join('')}</div>` : ''}
      <div class="jg-two"><div class="jg-done"><h3>${esc(c.doneH)}</h3><ul>${checks}</ul></div>
        <div class="jg-tips"><h3>${esc(c.tipsH)}</h3><ul>${s.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p><a href="#troubleshooting" data-cat-link="${key === 'facts' ? 'fact' : key === 'prefs' ? 'prefs' : key === 'run' ? 'scan' : 'cv'}">${esc(c.mistakesLink)} →</a></p></div></div>
      ${nxt}
    </section>`;
  }).join('\n');

  const stBtn = (x) => `<button type="button" class="jg-sb" data-id="${x.id}" data-d="${esc(x.d)}">${esc(x.l)}</button>`;
  const states_ = `<section class="jg-states" id="journey-of-a-job" aria-labelledby="h-states">
      <h2 class="sub" id="h-states">${esc(ST.title)}</h2><p>${esc(ST.lead)}</p>
      <div class="jg-sflow"><div class="jg-smain">${ST.main.map((x, i) => `${i ? '<span class="jg-sa" aria-hidden="true">→</span>' : ''}${stBtn(x)}`).join('')}</div>
        <div class="jg-sside" aria-label="${esc(ST.side.map((x) => x.l).join(', '))}">${ST.side.map(stBtn).join('')}</div></div>
      <div class="jg-sd" aria-live="polite"></div>
      <p><button type="button" class="btn ghost jg-splay" data-play="${esc(ST.play)}" data-pause="${esc(ST.pause)}">▶ ${esc(ST.play)}</button></p>
    </section>`;

  const chips = Object.entries(M.cats).map(([id, l], i) => `<button type="button" class="jg-fc${i === 0 ? ' on' : ''}" data-cat="${id}" aria-pressed="${i === 0}">${esc(l)}</button>`).join('');
  const trouble = `<section class="jg-trouble" id="troubleshooting" aria-labelledby="h-trouble">
      <h2 class="sub" id="h-trouble">${esc(c.troubleH)}</h2><p>${esc(c.troubleLead)}</p>
      <div class="jg-fcs" role="group">${chips}</div>
      <div class="jg-ms">${M.items.map((m) => `<details class="jg-m" data-cat="${m.cat}"><summary><span class="jg-mc">${esc(M.cats[m.cat])}</span>${esc(m.q)}</summary><div class="jg-mb"><p><b>${esc(c.why)}</b> ${esc(m.why)}</p><p class="jg-fix"><b>${esc(c.fix)}</b> ${esc(m.fix)}</p></div></details>`).join('')}</div>
    </section>`;

  const body = `<nav class="jse-crumb" aria-label="Breadcrumb"><a href="${p.toolsPath}">${esc(p.tools)}</a> / <a href="${base}">Job Search Engine</a> / ${esc(c.crumb)}</nav>
    <h1 style="font-size:2.1rem">${esc(c.h1)}</h1>
    <p class="lead">${esc(c.lead)}</p>
    <p class="jse-notice" role="note">${esc(c.status)}</p>
    <p><a class="btn" href="${base}demo/" data-ev="cta_click">${esc(c.demo)}</a> <a class="btn ghost" href="${base}">${esc(c.back)}</a></p>
    <h2 class="sub" id="overview">${esc(c.pathH)}</h2>
    ${path_}
    <h2 class="sub" id="who">${esc(c.whoH)}</h2><p>${esc(c.whoLead)}</p>
    <div class="jg-hold"><div class="jg-hc you"><h3>${esc(c.whoYou[0])}</h3><ul>${c.whoYou[1].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><span class="jg-hx" aria-hidden="true">⇄</span><div class="jg-hc"><h3>${esc(c.whoTr[0])}</h3><ul>${c.whoTr[1].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
    <p class="note">${esc(c.whoNote)}</p>
    ${prog}
    ${steps}
    ${states_}
    ${trouble}
    <section class="jse-cta"><h2>${esc(c.ctaH)}</h2><p>${esc(c.ctaText)}</p><p><a class="btn" href="${p.reqPath}" data-ev="cta_click">${esc(c.ctaBtn)}</a></p><p class="note"><a href="${introLink('jse-setup-' + k)}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${esc(c.ctaIntro)}</a></p></section>`;

  return shell(k, {
    path, otherPath: pth(k === 'en' ? 'uk' : 'en', '/tools/job-search-engine/setup/'), title: c.title, desc: c.desc,
    crumbs: [{ name: p.tools, item: `${SITE}${pth(k, '/tools/')}` }, { name: 'Job Search Engine', item: `${SITE}${base}` }, { name: c.crumb, item: `${SITE}${path}` }],
    body, script: '/assets/jse-guide.js', mainClass: 'jse jg',
    headScript: "document.documentElement.classList.add('jg-js')",
  });
}

for (const k of ['en', 'uk']) {
  const f = join(ROOT, 'public', k === 'uk' ? 'uk' : '', 'tools', 'job-search-engine', 'setup', 'index.html');
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, guide(k));
}
console.log('guide: setup guide written (en + uk)');
