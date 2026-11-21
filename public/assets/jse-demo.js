/* Job Search Engine (JSE) demo tracker.
   Invented data only. Everything stays in this browser (localStorage). Nothing is sent to any server. */
(() => {
  'use strict';
  const L = document.documentElement.lang === 'uk' ? 'uk' : 'en';
  const adEl = document.getElementById('jse-ad');
  if (adEl) { renderAd(adEl); return; }
  const root = document.getElementById('jse-app');
  if (!root) return;
  const KEY = 'jse-demo-v1';

  const TXT = {
    en: {
      tabs: { todo: 'Not applied', li: 'Write on LinkedIn', active: 'In progress', all: 'All' },
      stats: { todo: 'not applied', fresh: 'fresh (2 days or less)', li: 'waiting for LinkedIn', active: 'in progress', interview: 'interviews' },
      search: 'Search by company or role',
      showP3: 'Show P3 (needs a visa)',
      status: 'Status', liCheck: 'I found 1-2 people and wrote to them',
      statuses: { todo: 'Not applied', ready: 'CV ready: apply', applied: 'Applied', talk: 'Talk with recruiter', screening: 'Screening', interview: 'Interview', offer: 'Offer', rejected: 'Rejected', closed: 'Vacancy closed', skip: 'Not a fit' },
      prio: { 1: 'P1: home city or fully remote', 2: 'P2: relocation in Europe', 3: 'P3: needs a visa' },
      verdict: { ok: 'Ad screened: no blockers', ask: 'Ad screened: check by hand', wall: 'Ad screened: blocker found' },
      ats: 'ATS match', fresh: (n) => (n === 0 ? 'Fresh: today' : n === 1 ? 'Fresh: yesterday' : 'Fresh: 2 days'),
      older: (n) => `Found ${n} days ago`,
      liDay: (n) => `LinkedIn: day ${n + 1} of 3`, liLate: (n) => `LinkedIn: ${n} days after applying`, liDone: 'LinkedIn done',
      copyAi: 'Copy for AI', copiedAi: 'Copied. Paste into your AI chat', copyFail: 'Could not copy: select the text below', jdSum: (n) => `Full job description (${n} characters)`, noJd: 'No full description on the card: open the source and copy the text by hand.', jobAd: 'Source ↗', li1: '1st circle ↗', liRec: 'Recruiter ↗', liHead: 'Head / CEO ↗', cover: 'Cover message', msg: 'LinkedIn message', copy: 'Copy', copied: 'Copied', manual: 'Select the text and copy it',
      chars: (n, m) => `${n}/${m} characters`, noCover: 'No cover message yet.', next: 'Next step',
      liStep: 'Within 3 days of applying: find 1-2 people at the company, send the message, tick the box.',
      empty: { todo: 'Everything is applied. New jobs appear after the next scan.', li: 'Everyone is written to. Good work.', active: 'Nothing here yet.', all: 'Nothing here yet.' },
      add: 'Add a job by hand', addCo: 'Company', addRole: 'Role', addBtn: 'Add', added: (c) => `Added: ${c}`,
      exp: 'Export JSON', imp: 'Import JSON', reset: 'Reset demo', resetAsk: 'Reset the demo to the original sample data? Your changes will be lost.',
      impOk: (a, s) => `Imported: ${a}. Skipped (already there or invalid): ${s}.`, impBad: 'This file is not a list of jobs.',
      impHelp: 'Import accepts a JSON list like the one the real tool writes (company, role, status, priority...). Duplicates are skipped.',
      saved: 'Saved in this browser',
      limit: (n) => `You have ${n} cards in "Not applied". Process them first: apply, or mark them "Not a fit". New jobs will appear only after that.`, sim: 'Simulate a full list (20 cards)', simDone: 'Added invented cards so that 20 are waiting. Reset the demo to remove them.',
      mode: { remote: 'Fully remote', hybrid: 'Hybrid, home city', site: 'On-site, home city', reloc: 'Relocation, Europe', visa: 'Needs a work visa' },
      pay: 'pay not stated', applied: 'applied',
    },
    uk: {
      tabs: { todo: 'Не подано', li: 'Написати в LinkedIn', active: 'У процесі', all: 'Усі' },
      stats: { todo: 'не подано', fresh: 'свіжих (до 2 днів)', li: 'чекають LinkedIn', active: 'у процесі', interview: 'співбесід' },
      search: 'Пошук за компанією чи роллю',
      showP3: 'Показати P3 (потрібна віза)',
      status: 'Статус', liCheck: 'Знайшов 1-2 людей і написав їм',
      statuses: { todo: 'Не подано', ready: 'Резюме готове: подати', applied: 'Подано', talk: 'Розмова з рекрутером', screening: 'Скринінг', interview: 'Співбесіда', offer: 'Оффер', rejected: 'Відмова', closed: 'Вакансія закрита', skip: 'Не підходить' },
      prio: { 1: 'P1: домашнє місто або повністю віддалено', 2: 'P2: релокація в Європі', 3: 'P3: потрібна віза' },
      verdict: { ok: 'Оголошення перевірено: блокерів немає', ask: 'Оголошення перевірено: перевір вручну', wall: 'Оголошення перевірено: є блокер' },
      ats: 'Збіг з ATS', fresh: (n) => (n === 0 ? 'Свіжа: сьогодні' : n === 1 ? 'Свіжа: вчора' : 'Свіжа: 2 дні'),
      older: (n) => `Знайдено ${n} дн. тому`,
      liDay: (n) => `LinkedIn: день ${n + 1} з 3`, liLate: (n) => `LinkedIn: ${n} дн. після подачі`, liDone: 'LinkedIn зроблено',
      copyAi: 'Скопіювати для ШІ', copiedAi: 'Скопійовано. Встав у чат зі ШІ', copyFail: 'Не вдалося: виділи текст нижче', jdSum: (n) => `Повний опис вакансії (${n} символів)`, noJd: 'Повного опису в картці немає: відкрий джерело й скопіюй текст вручну.', jobAd: 'Джерело ↗', li1: '1-ше коло ↗', liRec: 'Рекрутер ↗', liHead: 'Керівник / CEO ↗', cover: 'Супровідний лист', msg: 'Повідомлення в LinkedIn', copy: 'Копіювати', copied: 'Скопійовано', manual: 'Виділіть текст і скопіюйте вручну',
      chars: (n, m) => `${n}/${m} символів`, noCover: 'Супровідного листа ще немає.', next: 'Наступний крок',
      liStep: 'Протягом 3 днів після подачі: знайдіть 1-2 людей у компанії, надішліть повідомлення, поставте галочку.',
      empty: { todo: 'Усе подано. Нові вакансії з\'являться після наступного сканування.', li: 'Усім написано. Добра робота.', active: 'Тут поки порожньо.', all: 'Тут поки порожньо.' },
      add: 'Додати вакансію вручну', addCo: 'Компанія', addRole: 'Роль', addBtn: 'Додати', added: (c) => `Додано: ${c}`,
      exp: 'Експорт JSON', imp: 'Імпорт JSON', reset: 'Скинути демо', resetAsk: 'Скинути демо до початкових даних? Ваші зміни буде втрачено.',
      impOk: (a, s) => `Імпортовано: ${a}. Пропущено (вже є або некоректні): ${s}.`, impBad: 'Це не список вакансій.',
      impHelp: 'Імпорт приймає JSON-список у форматі, який пише справжній інструмент (company, role, status, priority...). Дублікати пропускаються.',
      saved: 'Збережено в цьому браузері',
      limit: (n) => `У вас ${n} карток у статусі "Не подано". Спершу опрацюйте їх: подайтеся або позначте "Не підходить". Нові вакансії з'являться лише після цього.`, sim: 'Імітувати повний список (20 карток)', simDone: 'Додано вигадані картки, щоб очікувало 20. Скиньте демо, щоб їх прибрати.',
      mode: { remote: 'Повністю віддалено', hybrid: 'Гібрид, домашнє місто', site: 'Офіс, домашнє місто', reloc: 'Релокація, Європа', visa: 'Потрібна робоча віза' },
      pay: 'зарплату не вказано', applied: 'подано',
    },
  }[L];

  const STATUSES = ['todo', 'ready', 'applied', 'talk', 'screening', 'interview', 'offer', 'rejected', 'closed', 'skip'];
  const TODO = new Set(['todo', 'ready']);
  const ACTIVE = new Set(['applied', 'talk', 'screening', 'interview', 'offer']);
  const CHIP = { todo: 'hot', ready: 'ok', applied: 'acc', talk: 'warn', screening: 'warn', interview: 'warn', offer: 'ok', rejected: '', closed: '', skip: '' };
  const VCHIP = { ok: 'ok', ask: 'warn', wall: 'hot' };

  const DAY = 86400000;
  const iso = (d) => d.toISOString().slice(0, 10);
  const ago = (n) => iso(new Date(Date.now() - n * DAY));
  const daysSince = (s) => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return null; const a = new Date(+m[1], m[2] - 1, +m[3]), n = new Date(); return Math.round((new Date(n.getFullYear(), n.getMonth(), n.getDate()) - a) / DAY); };

  const COVER = 'Hello,\n\nI want to join the team to make delivery more predictable: clear priorities, early risk reporting and plans the team believes in.\n\nIn the first weeks I can map the current delivery process, find the gaps that cost the most, agree changes with the people who do the work and report progress in numbers.\n\nLet\'s talk about how I can help.\n\nBest wishes,\nAlex';
  const MSG = (co, role) => `Hi!\n\nI have applied for the ${role} role at ${co}.\n\nI bring projects delivered on scope and budget, with risks raised early and honest status for everyone.\n\nIf you have a referral program, I would be grateful for a referral. If not, could you point me to someone involved in hiring for this role?\n\nThanks,\nAlex`;

  function seed() {
    const j = (id, company, role, status, priority, mode, verdict, ats, added, extra) => ({ id, company, role, status, priority, mode, verdict, ats, added: ago(added), pay: '', note: '', next: '', cover: '', msg: '', applied: '', li_done: false, jd: adBody(company, role), ...extra });
    return [
      j('s1', 'Acme Cloud', 'Delivery Manager', 'todo', 1, 'remote', 'ok', 86, 0, { next: 'Open the ad and decide: apply or skip.' }),
      j('s2', 'Bluefin Systems', 'Senior Project Manager', 'todo', 1, 'site', 'ask', 79, 1, { note: 'The ad says "PMP preferred". Not a hard requirement, but check the wording.', next: 'Read the requirement and decide.' }),
      j('s3', 'Orbit Payments', 'Product Manager', 'ready', 2, 'reloc', 'ok', 84, 3, { cover: COVER, msg: MSG('Orbit Payments', 'Product Manager'), next: 'CV and cover are ready. Apply.' }),
      j('s4', 'Lumen Health', 'Technical Project Manager', 'applied', 1, 'hybrid', 'ok', 88, 5, { applied: ago(1), cover: COVER, msg: MSG('Lumen Health', 'Technical Project Manager') }),
      j('s5', 'Kestrel Games', 'Product Owner', 'applied', 2, 'reloc', 'ok', 83, 9, { applied: ago(6), li_done: true, cover: COVER, msg: MSG('Kestrel Games', 'Product Owner') }),
      j('s6', 'Fjord Data', 'Program Manager', 'interview', 1, 'remote', 'ok', 90, 16, { applied: ago(12), li_done: true, note: 'Interview with the head of delivery next week.', next: 'Prepare two stories about risk management.' }),
      j('s7', 'Granite Software', 'Delivery Manager', 'rejected', 1, 'remote', 'ok', 82, 24, { applied: ago(20), li_done: true }),
      j('s8', 'Pixel Forge', 'Scrum Master', 'skip', 1, 'site', 'wall', 0, 2, { note: 'Blocker: fluent German (C1) required.' }),
      j('s9', 'Harbor Logistics', 'Project Manager', 'todo', 3, 'visa', 'wall', 0, 4, { note: 'Blocker: needs a work visa.' }),
    ];
  }

  let jobs = [], tab = 'todo', query = '', showP3 = false, flash = '';
  const mem = {};
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return mem.v || null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) { mem.v = v; } },
    del() { try { localStorage.removeItem(KEY); } catch (e) { delete mem.v; } },
  };
  function load() {
    try { const raw = store.get(); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) return a; } } catch (e) { /* use seed */ }
    return seed();
  }
  const persist = () => store.set(JSON.stringify(jobs));
  jobs = load();

  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = (s, r = root) => r.querySelector(s);
  function aiPrompt(j) {
    const v = j.verdict && TXT.verdict[j.verdict] ? TXT.verdict[j.verdict] : '-';
    const jd = j.jd || (L === 'uk' ? 'Опису в картці немає. Відкрий посилання, скопіюй текст оголошення й встав його тут.' : 'The card has no description. Open the link, copy the ad text and paste it here.');
    if (L === 'uk') return `Підготуй пакет для цієї вакансії за моїм методом JSE. Спочатку перевір блокери й постав уточнювальні питання. Після мого підтвердження збери резюме, супровідний лист і повідомлення, а потім онови картку в трекері (id картки: ${j.id}).\n\nКомпанія: ${j.company}\nРоль: ${j.role}\nФормат / локація: ${TXT.mode[j.mode] || j.mode || 'не вказано'}\nПріоритет: P${j.priority || '?'}\nАвтоматична перевірка оголошення: ${v}\n\nПовний опис вакансії:\n${jd}`;
    return `Prepare a package for this job with my JSE method. First check blockers and ask clarifying questions. After I confirm, build the CV, the cover message and the LinkedIn messages, then update the card in the tracker (card id: ${j.id}).\n\nCompany: ${j.company}\nRole: ${j.role}\nWork mode: ${TXT.mode[j.mode] || j.mode || 'not stated'}\nPriority: P${j.priority || '?'}\nAutomatic ad screening: ${v}\n\nFull job description:\n${jd}`;
  }
  const adBase = (L === 'uk' ? '/uk' : '') + '/tools/job-search-engine/demo/ad/';
  const adUrl = (j) => `${adBase}?c=${encodeURIComponent(j.company)}&r=${encodeURIComponent(j.role)}`;
  const liLink = (kw, net) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(kw)}&network=${encodeURIComponent(JSON.stringify([net]))}&origin=FACETED_SEARCH`;
  const liSearch = (kw) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(kw)}&origin=GLOBAL_SEARCH_HEADER`;
  const needsLi = (j) => j.status === 'applied' && !j.li_done && (j.priority || 9) < 4;

  function render() {
    const vis = jobs.filter((j) => showP3 || (j.priority || 9) < 3);
    const c = { todo: 0, fresh: 0, li: 0, active: 0, interview: 0 };
    vis.forEach((j) => {
      if (TODO.has(j.status)) { c.todo++; if (daysSince(j.added) <= 2) c.fresh++; }
      if (needsLi(j)) c.li++;
      if (ACTIVE.has(j.status)) c.active++;
      if (j.status === 'interview') c.interview++;
    });
    const n = { todo: c.todo, li: c.li, active: c.active, all: vis.length };
    const tabs = Object.keys(TXT.tabs).map((k) => `<button class="jse-tab" role="tab" data-tab="${k}" aria-selected="${k === tab}">${esc(TXT.tabs[k])}<span class="jse-n">${n[k]}</span></button>`).join('');
    const stats = `<div class="jse-stat"><b>${c.todo}</b><span>${esc(TXT.stats.todo)}</span></div><div class="jse-stat"><b>${c.fresh}</b><span>${esc(TXT.stats.fresh)}</span></div><div class="jse-stat"><b>${c.li}</b><span>${esc(TXT.stats.li)}</span></div><div class="jse-stat"><b>${c.active}</b><span>${esc(TXT.stats.active)}</span></div><div class="jse-stat"><b>${c.interview}</b><span>${esc(TXT.stats.interview)}</span></div>`;

    let rows = vis.filter((j) => tab === 'all' ? true : tab === 'todo' ? TODO.has(j.status) : tab === 'li' ? needsLi(j) : ACTIVE.has(j.status));
    if (query) { const q = query.toLowerCase(); rows = rows.filter((j) => (j.company + ' ' + j.role).toLowerCase().includes(q)); }
    rows.sort((a, b) => (a.status === 'ready' ? 0 : 1) - (b.status === 'ready' ? 0 : 1) || (a.priority || 9) - (b.priority || 9) || String(b.added).localeCompare(String(a.added)));

    const totalTodo = jobs.filter((j) => j.status === 'todo').length;
    const limitBanner = totalTodo >= 20 ? `<div class="jse-limit" role="status"><b>!</b><span>${esc(TXT.limit(totalTodo))}</span></div>` : '';
    const keepQ = document.activeElement && document.activeElement.id === 'jse-q';
    const list = rows.length ? rows.map(card).join('') : `<div class="jse-empty">${esc(TXT.empty[tab])}</div>`;
    root.innerHTML = `${limitBanner}<div class="jse-stats">${stats}</div>
      <div class="jse-tabs" role="tablist">${tabs}</div>
      <div class="jse-tools"><input id="jse-q" type="search" placeholder="${esc(TXT.search)}" aria-label="${esc(TXT.search)}" value="${esc(query)}">
        <label class="jse-check"><input type="checkbox" id="jse-p3" ${showP3 ? 'checked' : ''}> ${esc(TXT.showP3)}</label></div>
      <div class="jse-list${tab === 'all' ? ' compact' : ''}">${list}</div>
      <div class="jse-bar"><button class="btn ghost" data-act="export">${esc(TXT.exp)}</button><label class="btn ghost" for="jse-file">${esc(TXT.imp)}</label><input id="jse-file" type="file" accept=".json,application/json" hidden><button class="btn ghost" data-act="sim">${esc(TXT.sim)}</button><button class="btn ghost" data-act="reset">${esc(TXT.reset)}</button></div>
      <p class="note jse-help" id="jse-flash" role="status" aria-live="polite">${esc(flash || TXT.impHelp)}</p>
      <p class="note jse-help">${esc(TXT.saved)}.</p>`;
    if (keepQ) { const q = $('#jse-q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }

  function card(j) {
    const full = tab !== 'all';
    const chips = [];
    const age = daysSince(j.added);
    if (TODO.has(j.status) && age !== null) chips.push(age <= 2 ? `<span class="jse-chip hot">${esc(TXT.fresh(age))}</span>` : `<span class="jse-chip">${esc(TXT.older(age))}</span>`);
    if (needsLi(j)) { const d = daysSince(j.applied); chips.push(d !== null && d <= 2 ? `<span class="jse-chip hot">${esc(TXT.liDay(d))}</span>` : `<span class="jse-chip warn">${esc(TXT.liLate(d ?? 0))}</span>`); }
    if (j.li_done) chips.push(`<span class="jse-chip ok">${esc(TXT.liDone)}</span>`);
    chips.push(`<span class="jse-chip ${CHIP[j.status] || ''}">${esc(TXT.statuses[j.status] || j.status)}</span>`);
    const sub = [TXT.mode[j.mode] || j.mode, j.pay || TXT.pay, j.applied ? `${TXT.applied} ${j.applied}` : ''].filter(Boolean).map(esc).join(' · ');
    const tags = [];
    if (j.priority) tags.push(`<span class="jse-chip acc" title="${esc(TXT.prio[j.priority] || '')}">${esc(TXT.prio[j.priority] || 'P' + j.priority)}</span>`);
    if (j.verdict && TXT.verdict[j.verdict]) tags.push(`<span class="jse-chip ${VCHIP[j.verdict]}">${esc(TXT.verdict[j.verdict])}</span>`);
    if (j.ats) tags.push(`<span class="jse-chip">${esc(TXT.ats)}: ${j.ats}%</span>`);
    const opts = STATUSES.map((s) => `<option value="${s}"${s === j.status ? ' selected' : ''}>${esc(TXT.statuses[s])}</option>`).join('');
    let body = '';
    if (full) {
      body += tags.length ? `<div class="jse-chips">${tags.join('')}</div>` : '';
      if (j.note) body += `<p class="note">${esc(j.note)}</p>`;
      if (tab === 'li') body += `<p class="jse-next"><b>${esc(TXT.next)}:</b> ${esc(TXT.liStep)}</p>`;
      else if (j.next) body += `<p class="jse-next"><b>${esc(TXT.next)}:</b> ${esc(j.next)}</p>`;
      body += `<div class="jse-links"><button type="button" class="btn${TODO.has(j.status) ? ' jse-copyai' : ' ghost'}" data-copyai>${esc(TXT.copyAi)}</button><a class="btn ghost" href="${esc(adUrl(j))}" target="_blank" rel="noopener">${esc(TXT.jobAd)}</a><a class="btn ghost" href="${esc(liLink(j.company, 'F'))}" target="_blank" rel="noopener">${esc(TXT.li1)}</a><a class="btn ghost" href="${esc(liSearch(`"${j.company}" AND (recruiter OR "talent acquisition")`))}" target="_blank" rel="noopener">${esc(TXT.liRec)}</a><a class="btn ghost" href="${esc(liSearch(`"${j.company}" AND (CEO OR founder OR "head of" OR director)`))}" target="_blank" rel="noopener">${esc(TXT.liHead)}</a></div>`;
      body += j.jd ? `<details class="jse-jd"><summary>${esc(TXT.jdSum(j.jd.length))}</summary><pre>${esc(j.jd)}</pre></details>` : `<p class="note">${esc(TXT.noJd)}</p>`;
      if (j.cover) body += `<div class="jse-msg"><b>${esc(TXT.cover)}</b><textarea readonly aria-label="${esc(TXT.cover)}">${esc(j.cover)}</textarea><div class="jse-row"><span class="jse-count${j.cover.length > 1000 ? ' over' : ''}">${esc(TXT.chars(j.cover.length, 1000))}</span><button class="btn ghost" data-copy>${esc(TXT.copy)}</button></div></div>`;
      if (j.msg) body += `<div class="jse-msg"><b>${esc(TXT.msg)}</b><textarea readonly aria-label="${esc(TXT.msg)}">${esc(j.msg)}</textarea><div class="jse-row"><span class="jse-count${j.msg.length > 500 ? ' over' : ''}">${esc(TXT.chars(j.msg.length, 500))}</span><button class="btn ghost" data-copy>${esc(TXT.copy)}</button></div></div>`;
    }
    const liBox = ACTIVE.has(j.status) && (j.priority || 9) < 4 ? `<label class="jse-check"><input type="checkbox" data-li ${j.li_done ? 'checked' : ''}> ${esc(TXT.liCheck)}</label>` : '';
    return `<article class="jse-card${j.priority === 1 && TODO.has(j.status) ? ' p1' : ''}" data-id="${esc(j.id)}">
      <div class="jse-head"><div><div class="jse-co">${esc(j.company)}</div><div>${esc(j.role)}</div><div class="jse-meta">${sub}</div></div><div class="jse-chips">${chips.join('')}</div></div>
      ${body}
      <div class="jse-foot"><label>${esc(TXT.status)}<select data-status>${opts}</select></label>${liBox}</div>
    </article>`;
  }

  const byId = (id) => jobs.find((x) => x.id === id);
  const cardId = (el) => { const c = el.closest('.jse-card'); return c ? c.dataset.id : null; };

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('.jse-tab');
    if (t) { tab = t.dataset.tab; render(); return; }
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const ta = cp.closest('.jse-msg').querySelector('textarea'), label = cp.textContent;
      try { await navigator.clipboard.writeText(ta.value); cp.textContent = TXT.copied; } catch (_) { ta.focus(); ta.select(); cp.textContent = TXT.manual; }
      setTimeout(() => { cp.textContent = label; }, 1800);
      return;
    }
    const ca = e.target.closest('[data-copyai]');
    if (ca) {
      const job = byId(cardId(ca)); if (!job) return;
      const label = ca.textContent;
      try { await navigator.clipboard.writeText(aiPrompt(job)); ca.textContent = TXT.copiedAi; }
      catch (_) { const d = ca.closest('.jse-card').querySelector('details.jse-jd'); if (d) d.open = true; ca.textContent = TXT.copyFail; }
      setTimeout(() => { ca.textContent = label; }, 2400);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act && act.dataset.act === 'export') {
      const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'jse-demo-jobs.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return;
    }
    if (act && act.dataset.act === 'sim') {
      const roles = ['Project Manager', 'Product Owner', 'Delivery Manager', 'Scrum Master', 'Program Manager'];
      let n = jobs.filter((j) => j.status === 'todo').length, k = 1;
      while (n < 20) { jobs.push({ id: 'sim' + Date.now().toString(36) + k, company: 'Sample Company ' + k, role: roles[k % roles.length], status: 'todo', priority: 2, mode: 'remote', verdict: 'ok', ats: 0, added: iso(new Date()), pay: '', note: '', next: '', cover: '', msg: '', applied: '', li_done: false, jd: adBody('Sample Company ' + k, roles[k % roles.length]) }); n++; k++; }
      persist(); tab = 'todo'; flash = TXT.simDone; render(); return;
    }
    if (act && act.dataset.act === 'reset') {
      if (window.confirm(TXT.resetAsk)) { store.del(); jobs = seed(); tab = 'todo'; query = ''; showP3 = false; flash = ''; render(); }
    }
  });

  root.addEventListener('input', (e) => {
    if (e.target.id === 'jse-q') { query = e.target.value.trim(); render(); }
  });

  root.addEventListener('change', async (e) => {
    const s = e.target.closest('[data-status]');
    if (s) {
      const j = byId(cardId(s)); if (!j) return;
      j.status = s.value; if (s.value === 'applied' && !j.applied) j.applied = iso(new Date());
      persist(); render(); return;
    }
    const li = e.target.closest('[data-li]');
    if (li) { const j = byId(cardId(li)); if (j) { j.li_done = li.checked; persist(); render(); } return; }
    if (e.target.id === 'jse-p3') { showP3 = e.target.checked; render(); return; }
    if (e.target.id === 'jse-file') {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      let items;
      try { items = JSON.parse(await f.text()); if (!Array.isArray(items)) throw new Error('x'); } catch (_) { flash = TXT.impBad; render(); return; }
      const key = (c, r) => (String(c).toLowerCase().trim() + '|' + String(r).toLowerCase().trim());
      const have = new Set(jobs.map((j) => key(j.company, j.role)));
      let a = 0, sk = 0;
      for (const it of items.slice(0, 200)) {
        const co = typeof it?.company === 'string' ? it.company.trim().slice(0, 80) : '', ro = typeof it?.role === 'string' ? it.role.trim().slice(0, 80) : '';
        if (!co || !ro || have.has(key(co, ro))) { sk++; continue; }
        const st = STATUSES.includes(it.status) ? it.status : 'todo';
        const pr = [1, 2, 3].includes(Number(it.priority)) ? Number(it.priority) : 2;
        const sx = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
        jobs.push({ id: 'i' + Date.now().toString(36) + a, company: co, role: ro, status: st, priority: pr, mode: sx(it.mode || it.location, 60), verdict: '', ats: 0, added: iso(new Date()), pay: sx(it.pay, 60), note: sx(it.note, 400), next: '', cover: sx(it.cover, 1200), msg: sx(it.msg, 700), applied: '', li_done: false });
        have.add(key(co, ro)); a++;
      }
      persist(); flash = TXT.impOk(a, sk); render();
    }
  });

  function adBody(co, role) {
    // Job ads are usually in English, so the sample ad stays English on both language versions.
    const T = { about: 'About the role', do: 'What you will do', want: 'What we are looking for', plus: 'Nice to have', offer: 'What we offer', loc: 'Work mode: hybrid or remote within Europe.' };
    const text = [
      `${role} at ${co}`,
      '',
      T.about,
      `${co} is building a product used by customers across Europe. We are looking for a ${role} to keep delivery predictable as the team grows.`,
      '',
      T.do,
      '- Own planning, scope and delivery of several projects at the same time.',
      '- Report progress and risks early to stakeholders in plain numbers.',
      '- Work with engineering, QA and design to remove blockers.',
      '- Improve how the team plans, estimates and releases.',
      '',
      T.want,
      '- 4+ years delivering software projects in a cross-functional team.',
      '- Experience with Scrum or Kanban and with budgets and risk management.',
      '- Clear written and spoken English.',
      '',
      T.plus,
      '- Experience with release management and agile metrics.',
      '- A project management certificate.',
      '',
      T.offer,
      `- ${T.loc}`,
      '- Competitive salary and a learning budget.',
    ].join('\n');
    return text;
  }

  function renderAd(el) {
    const q = new URLSearchParams(location.search);
    const co = (q.get('c') || 'Example Company').slice(0, 80), role = (q.get('r') || 'Delivery Manager').slice(0, 80);
    // Job ads are usually in English, so the sample ad stays English on both language versions.
    const text = adBody(co, role);
    const h = document.createElement('h1'); h.style.fontSize = '1.8rem'; h.textContent = `${role}`;
    const sub = document.createElement('p'); sub.className = 'lead'; sub.textContent = co;
    const pre = document.createElement('pre'); pre.className = 'jse-adtext'; pre.lang = 'en'; pre.textContent = text.split('\n').slice(2).join('\n');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn'; btn.textContent = el.dataset.copy;
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(text); btn.textContent = el.dataset.copied; }
      catch (_) { const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); btn.textContent = el.dataset.manual; }
      setTimeout(() => { btn.textContent = el.dataset.copy; }, 2000);
    });
    el.append(h, sub, btn, pre);
  }

  render();
})();
