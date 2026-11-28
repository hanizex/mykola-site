/* Managerial DNA (Express): owner-only pilot UI. Talks to /api/challenge/express/* (private Worker; session cookie).
   No answer keys, rubrics or scoring here. DOM is built from text nodes only (no innerHTML).
   Views (location.hash): none = sign-in or attempt list, #a=<id> = an attempt, #r=<id> = its report. */
(() => {
  'use strict';
  const cfg = JSON.parse(document.getElementById('mx-cfg').textContent);
  const T = cfg.t, L = cfg.lang, API = cfg.api;
  const root = document.getElementById('mx');
  const title = document.getElementById('mx-title');
  const fmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (m, k) => (o[k] !== undefined && o[k] !== null ? o[k] : m));
  const key = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()).replace(/[^\w]/g, '').slice(0, 32);

  // tiny DOM builder: h('p', {class: 'note'}, 'text', child, ...)
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v === null || v === undefined) continue;
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return e;
  }
  const show = (...nodes) => { root.replaceChildren(...nodes); debugPanel(null); };
  const say = (msg, cls = 'note') => h('p', { class: cls, role: cls.includes('err') ? 'alert' : null }, msg);

  async function api(method, path, body) {
    let r;
    try {
      r = await fetch(API + path, { method, credentials: 'same-origin', headers: { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined });
    } catch (e) { return { status: 0, data: { error: 'network' } }; }
    let data = null;
    try { data = await r.json(); } catch (e) { /* empty */ }
    return { status: r.status, data: data || {} };
  }

  // ---------------------------------------------------------------- timing events (estimates; the server stamps time)
  let cur = null;          // { attempt, display_id }
  let beat = null;
  function sendEvents(events) {
    if (!cur) return;
    api('POST', `/attempts/${cur.attempt}/events`, { events: events.map((e) => ({ idem_key: key(), ...e })) });
  }
  function startBeat() {
    stopBeat();
    beat = setInterval(() => { if (cur && document.visibilityState === 'visible') sendEvents([{ type: 'heartbeat', display_id: cur.display_id }]); }, 15000);
  }
  function stopBeat() { if (beat) clearInterval(beat); beat = null; }
  document.addEventListener('visibilitychange', () => { if (cur) sendEvents([{ type: 'visibility', visible: document.visibilityState === 'visible' }]); });

  // language link: keep the attempt and tell the server about the switch
  const langLink = document.getElementById('mx-lang');
  if (langLink) langLink.addEventListener('click', async (ev) => {
    const m = location.hash.match(/^#([ar])=([0-9a-f]{32})$/);
    if (!m) { langLink.href = cfg.other; return; }
    ev.preventDefault();
    if (m[1] === 'a') await api('POST', `/attempts/${m[2]}/locale`, { locale: L === 'uk' ? 'en' : 'uk' });
    location.href = cfg.other + location.hash;
  });

  // ---------------------------------------------------------------- router
  async function route() {
    stopBeat(); cur = null;
    const m = location.hash.match(/^#([ar])=([0-9a-f]{32})$/);
    show(say(T.loading));
    const me = await api('GET', '/me');
    if (me.status === 503 || me.status === 0 || me.status >= 500) return unavailable();
    if (!me.data.authenticated) return access();
    if (m && m[1] === 'a') return attempt(m[2]);
    if (m && m[1] === 'r') return report(m[2]);
    return dashboard(me.data);
  }
  window.addEventListener('hashchange', route);

  function unavailable() {
    show(say(T.unavailable), h('p', {}, h('a', { href: cfg.hub }, T.toHub)));
  }

  // ---------------------------------------------------------------- access (owner password) and recovery
  function access(errorMsg) {
    const input = h('input', { type: 'password', id: 'mx-code', name: 'code', autocomplete: 'current-password', required: true, 'aria-describedby': errorMsg ? 'mx-err' : null });
    const form = h('form', { class: 'mx-form', onsubmit: async (ev) => {
      ev.preventDefault();
      const r = await api('POST', '/login', { password: input.value });
      if (r.status === 200) return route();
      access(r.status === 429 ? T.tooMany : T.wrongCode);
    } },
      h('label', { for: 'mx-code' }, T.codeLabel), input, h('button', { class: 'btn', type: 'submit' }, T.signIn));
    const recInput = h('input', { type: 'text', id: 'mx-rec', name: 'recovery', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'none', inputmode: 'latin' });
    const rec = h('details', { class: 'mx-rec' }, h('summary', {}, T.recoveryToggle),
      h('form', { class: 'mx-form', onsubmit: async (ev) => {
        ev.preventDefault();
        const r = await api('POST', '/recover', { secret: recInput.value });
        if (r.status === 200) { location.hash = '#a=' + r.data.attempt_id; return; }
        access(r.status === 429 ? T.tooMany : T.recoveryWrong);
      } }, h('label', { for: 'mx-rec' }, T.recoveryLabel), recInput, h('button', { class: 'btn ghost', type: 'submit' }, T.recoverBtn)));
    show(h('h2', {}, T.accessTitle), say(T.accessText), errorMsg ? h('p', { class: 'mx-err', id: 'mx-err', role: 'alert' }, errorMsg) : '', form, rec,
      h('p', {}, h('a', { href: cfg.hub }, T.toHub)));
    input.focus();
  }

  // ---------------------------------------------------------------- attempt list
  function dashboard(me) {
    const status = { active: T.statusActive, paused: T.statusPaused, finished: T.statusFinished };
    const list = me.attempts.length ? h('ul', { class: 'mx-list' }, me.attempts.map((a) => {
      const when = new Date(a.created_at).toLocaleString(L === 'uk' ? 'uk-UA' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
      const del = h('button', { class: 'linkbtn', type: 'button', onclick: () => confirmBox(row, T.confirmDelete, T.confirmYes, async () => { await api('DELETE', `/attempts/${a.id}`); route(); }) }, T.delete);
      const open = a.status === 'finished' ? h('a', { class: 'btn ghost', href: '#r=' + a.id }, T.viewReport) : h('a', { class: 'btn', href: '#a=' + a.id }, T.resume);
      const row = h('li', {}, h('span', {}, `${when} · ${status[a.status] || a.status} · ${fmt(T.shownN, { n: a.shown })}`), h('span', { class: 'mx-actions' }, open, del));
      return row;
    })) : say(T.noAttempts);
    const start = h('button', { class: 'btn', type: 'button', onclick: async () => {
      start.disabled = true;
      const r = await api('POST', '/attempts', { locale: L });
      if (r.status !== 200) { start.disabled = false; return root.prepend(say(T.error, 'note mx-err')); }
      recoveryPanel(r.data);
    } }, T.start);
    const out = h('button', { class: 'linkbtn', type: 'button', onclick: async () => { await api('POST', '/logout'); route(); } }, T.signOut);
    show(say(fmt(T.dashIntro, { n: me.plan.items, m: me.plan.minutes })), h('p', {}, start), h('h2', {}, T.attemptsH), list, h('p', {}, out));
  }

  function confirmBox(anchor, text, yes, action) {
    const box = h('div', { class: 'mx-confirm', role: 'group' }, h('p', {}, text),
      h('button', { class: 'btn', type: 'button', onclick: action }, yes), ' ',
      h('button', { class: 'btn ghost', type: 'button', onclick: () => box.remove() }, T.cancel));
    anchor.after(box);
    box.querySelector('button').focus();
  }

  function recoveryPanel(d) {
    const code = h('code', { class: 'mx-code' }, d.recovery_code);
    const copy = h('button', { class: 'btn ghost', type: 'button', onclick: async () => {
      try { await navigator.clipboard.writeText(d.recovery_code); copy.textContent = T.copied; } catch (e) { getSelection().selectAllChildren(code); }
    } }, T.copy);
    const go = h('a', { class: 'btn', href: '#a=' + d.attempt_id }, T.continue);
    show(h('div', { class: 'mx-panel' }, say(T.recoveryShow), h('p', {}, code, ' ', copy), h('p', {}, go)));
    go.focus();
  }

  // ---------------------------------------------------------------- attempt: one question at a time
  let A = null;   // { id, revision, status }
  async function attempt(id) {
    const s = await api('GET', `/attempts/${id}`);
    if (s.status === 404) { location.hash = ''; return; }
    if (s.status !== 200) return show(say(T.error, 'note mx-err'));
    A = { id, revision: s.data.revision, status: s.data.status };
    if (s.data.status === 'finished') { location.hash = '#r=' + id; return; }
    if (s.data.locale !== L) {   // the attempt was last used in the other language: follow this page
      const l = await api('POST', `/attempts/${id}/locale`, { locale: L });
      if (l.status === 200) A.revision = l.data.revision;
    }
    if (s.data.status === 'paused') return pausedView(s.data.progress);
    if (s.data.current && s.data.locale === L) return question(s.data.current, s.data.progress, s.data.debug);
    return nextQuestion(s.data.progress);
  }

  async function nextQuestion(prog) {
    const n = await api('POST', `/attempts/${A.id}/next`, { revision: A.revision });
    if (n.status === 409) { root.prepend(say(T.stale)); return attempt(A.id); }
    if (n.status !== 200) return show(say(T.error, 'note mx-err'));
    A.revision = n.data.revision;
    if (n.data.done) { planReached(n.data.progress || prog); return debugPanel(n.data.debug); }
    const p = prog || (await api('GET', `/attempts/${A.id}`)).data.progress;
    question(n.data.current, p, n.data.debug);
  }

  function progressBox(p, seq) {
    return h('div', { class: 'mx-progress' },
      h('p', { class: 'mx-qof' }, fmt(T.qOf, { n: seq || p.shown, p: p.plan })),
      h('dl', { class: 'mx-metrics' },
        h('div', {}, h('dt', {}, T.coverage), h('dd', {}, (p.coverage ?? 0) + '%')),
        h('div', {}, h('dt', {}, T.confidence), h('dd', {}, (p.confidence ?? 0) + '%')),
        h('div', {}, h('dt', {}, fmt(T.domains, { n: p.domains_with_evidence, t: p.domains_total })))),
      h('p', { class: 'note' }, T.measuresHint));
  }

  function question(q, prog, dbg) {
    cur = { attempt: A.id, display_id: q.display_id };
    const sel = q.selection;
    const multi = q.format === 'multiple_choice';
    const rank = q.format === 'ranking';
    let order = q.options.map((o) => o.id);
    const hint = rank ? fmt(T.rankHint, { n: sel.min }) : multi ? (sel.min === sel.max ? fmt(T.chooseN, { n: sel.min }) : fmt(T.chooseRange, { min: sel.min, max: sel.max })) : T.chooseOne;
    const legend = h('legend', { id: 'mx-stem', tabindex: '-1' }, q.stem);
    let choices;
    if (rank) {
      const list = h('ol', { class: 'mx-rank', 'aria-describedby': 'mx-hint' });
      let draw = () => {
        list.replaceChildren(...order.map((id, i) => {
          const o = q.options.find((x) => x.id === id);
          const move = (d) => () => { const j = i + d; if (j < 0 || j >= order.length) return; [order[i], order[j]] = [order[j], order[i]]; draw(); list.querySelectorAll('li')[j].querySelector(d < 0 ? '.up' : '.down')?.focus(); };
          return h('li', { class: i < sel.min ? 'in' : 'out' }, h('span', { class: 'mx-rtext' }, o.label),
            h('span', { class: 'mx-rbtns' },
              h('button', { type: 'button', class: 'linkbtn up', 'aria-label': `${T.up}: ${o.label}`, disabled: i === 0, onclick: move(-1) }, '↑'),
              h('button', { type: 'button', class: 'linkbtn down', 'aria-label': `${T.down}: ${o.label}`, disabled: i === order.length - 1, onclick: move(1) }, '↓')));
        }));
      };
      draw();
      const drawn = draw;
      draw = () => { drawn(); debugSelect(order.slice(0, sel.min)); };   // TEMPORARY debug panel
      choices = list;
    } else {
      choices = h('div', { class: 'mx-opts' }, q.options.map((o, i) => {
        const id = 'mx-o' + i;
        const input = h('input', { type: multi ? 'checkbox' : 'radio', name: 'opt', id, value: o.id });
        if (multi) input.addEventListener('change', () => {
          const on = [...choices.querySelectorAll('input:checked')];
          choices.querySelectorAll('input:not(:checked)').forEach((x) => { x.disabled = on.length >= sel.max; });
        });
        return h('label', { class: 'mx-opt', for: id }, input, h('span', {}, o.label));
      }));
    }
    if (!rank) choices.addEventListener('change', () => debugSelect([...choices.querySelectorAll('input:checked')].map((x) => x.value)));   // TEMPORARY debug panel
    const unsure = h('input', { type: 'checkbox', id: 'mx-unsure', name: 'unsure' });
    const msg = h('p', { class: 'mx-err', role: 'alert', hidden: true });
    const send = async (skip) => {
      let selected = [];
      if (!skip) {
        selected = rank ? order.slice(0, sel.min) : [...choices.querySelectorAll('input:checked')].map((x) => x.value);
        const ok = selected.length === 0 ? unsure.checked : selected.length >= sel.min && selected.length <= sel.max;
        if (!ok) { msg.textContent = T.needSelection; msg.hidden = false; return; }
      }
      form.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      const body = { display_id: q.display_id, revision: A.revision, idem_key: key(), selected_ids: skip ? [] : selected, uncertain: !skip && unsure.checked, skip };
      let r = await api('POST', `/attempts/${A.id}/answer`, body);
      if (r.status === 0) r = await api('POST', `/attempts/${A.id}/answer`, body);   // one retry with the same key is a safe replay
      if (r.status === 409) { stopBeat(); return attempt(A.id); }
      if (r.status !== 200) { msg.textContent = T.error; msg.hidden = false; form.querySelectorAll('button').forEach((b) => { b.disabled = false; }); return; }
      A.revision = r.data.revision;
      stopBeat(); cur = null;
      nextQuestion(r.data.progress);
    };
    const form = h('form', { class: 'mx-q', onsubmit: (ev) => { ev.preventDefault(); send(false); } },
      h('fieldset', {}, legend, h('p', { class: 'note', id: 'mx-hint' }, hint), choices),
      h('p', { class: 'mx-unsure' }, h('label', { for: 'mx-unsure' }, unsure, ' ', T.notSure), h('span', { class: 'note' }, ' ' + T.notSureHint)),
      msg,
      h('p', { class: 'mx-buttons' },
        h('button', { class: 'btn', type: 'submit' }, T.submit), ' ',
        h('button', { class: 'btn ghost', type: 'button', onclick: () => send(true) }, T.skip)),
      h('p', { class: 'mx-side' },
        h('button', { class: 'linkbtn', type: 'button', onclick: pause }, T.pause), ' · ',
        h('button', { class: 'linkbtn', type: 'button', onclick: (ev) => confirmBox(ev.target.parentNode, T.finishConfirm, T.finishYes, finish) }, T.finishEarly)));
    show(progressBox(prog, q.seq), form);
    debugPanel(dbg);
    if (rank) debugSelect(order.slice(0, sel.min));
    legend.focus({ preventScroll: false });
    sendEvents([{ type: 'display', display_id: q.display_id }].concat(document.visibilityState === 'visible' ? [{ type: 'visibility', visible: true }] : []));
    startBeat();
  }

  async function pause() {
    const r = await api('POST', `/attempts/${A.id}/pause`, {});
    if (r.status !== 200) return attempt(A.id);
    A.revision = r.data.revision; stopBeat(); cur = null;
    pausedView();
  }
  function pausedView(prog) {
    const btn = h('button', { class: 'btn', type: 'button', onclick: async () => {
      const r = await api('POST', `/attempts/${A.id}/resume`, { visible: document.visibilityState === 'visible' });
      if (r.status === 200) A.revision = r.data.revision;
      attempt(A.id);
    } }, T.resumeBtn);
    show(prog ? progressBox(prog) : '', say(T.pausedText), h('p', {}, btn), h('p', {}, h('a', { href: location.pathname }, T.backToList)));
    btn.focus();
  }
  function planReached(prog) {
    const btn = h('button', { class: 'btn', type: 'button', onclick: finish }, T.finishBtn);
    show(progressBox(prog), say(T.planReached), h('p', {}, btn));
    btn.focus();
  }
  async function finish() {
    stopBeat(); cur = null;
    const s = await api('GET', `/attempts/${A.id}`);
    const r = await api('POST', `/attempts/${A.id}/finish`, { revision: s.data.revision });
    if (r.status !== 200) return show(say(T.error, 'note mx-err'));
    location.hash = '#r=' + A.id;
  }

  // ---------------------------------------------------------------- report
  const domainName = (d) => (L === 'uk' && cfg.domainsUk[d.id]) || d.name;
  const pct = (v) => (v === null || v === undefined ? '–' : v + '%');
  const dur = (ms) => { if (ms === null || ms === undefined) return '–'; const s = Math.round(ms / 1000); const [sec, min] = L === 'uk' ? ['с', 'хв'] : ['s', 'min']; return s < 60 ? `${s} ${sec}` : `${Math.floor(s / 60)} ${min} ${s % 60} ${sec}`; };

  async function report(id) {
    const r = await api('GET', `/attempts/${id}/report?locale=${L}`);
    if (r.status === 404) { location.hash = '#a=' + id; return; }
    if (r.status !== 200) return show(say(T.error, 'note mx-err'));
    const d = r.data;
    if (d.status !== 'ready') return show(say(T.partialNote));
    if (d.v2 && !d.v2.preview) return show(...renderV2(id, d), h('p', {}, h('a', { href: location.pathname }, T.backToList)));
    const byId = Object.fromEntries(d.domains.map((x) => [x.id, x]));
    const findList = (items) => items.length ? h('ul', { class: 'mx-find' }, items.map((f) =>
      h('li', {}, h('span', { lang: 'en' }, f.statement), h('span', { class: 'note' }, ` · ${domainName(byId[f.domain])} · ${f.observed}% · ${f.support === 'corroborated' ? T.corroborated : T.single}`)))) : say(T.none);
    const table = h('div', { class: 'mx-table' }, h('table', {},
      h('caption', {}, T.domainsH),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, T.domainCol), h('th', { scope: 'col' }, T.observedCol), h('th', { scope: 'col' }, T.coverageCol), h('th', { scope: 'col' }, T.confidenceCol))),
      h('tbody', {}, d.domains.map((x) => h('tr', { class: x.measured ? '' : 'off' }, h('th', { scope: 'row' }, domainName(x)),
        x.measured ? [h('td', {}, pct(x.observed)), h('td', {}, pct(x.coverage)), h('td', {}, pct(x.confidence))] : h('td', { colspan: '3' }, T.notMeasured))))));
    const tm = d.timing || {};
    const cert = certBlock(id);
    show(
      h('h2', { id: 'mx-rep', tabindex: '-1' }, T.reportTitle),
      d.partial ? say(T.partialNote) : '',
      h('dl', { class: 'mx-head' },
        h('div', {}, h('dt', {}, T.observed), h('dd', {}, pct(d.headline.observed))),
        h('div', {}, h('dt', {}, T.coverageM), h('dd', {}, pct(d.headline.coverage))),
        h('div', {}, h('dt', {}, T.confidenceM), h('dd', {}, pct(d.headline.confidence)))),
      say(T.measuresExplain),
      say(fmt(T.questionsSummary, { shown: d.questions.shown, answered: d.questions.answered, skipped: d.questions.skipped, u: d.questions.uncertainty_only })
        + (d.uncertainty_rate !== null ? ' ' + fmt(T.uncertaintyRate, { r: d.uncertainty_rate }) : '')),
      h('h3', {}, T.strengthsH), findList(d.strengths),
      h('h3', {}, T.improveH), findList(d.improve),
      d.conflicts.length ? [h('h3', {}, T.conflictsH), findList(d.conflicts)] : '',
      L === 'uk' ? say(T.statementsEn) : '',
      table,
      h('h3', {}, T.notMeasuredH), say(T.notMeasuredText),
      h('h3', {}, T.timingH),
      h('ul', { class: 'mx-find' },
        h('li', {}, `${T.activeTime}: ${dur(tm.question_active_ms)}`),
        h('li', {}, `${T.elapsedTime}: ${dur(tm.elapsed_ms)}`),
        h('li', {}, `${T.pausedTime}: ${dur(tm.paused_ms)}`),
        tm.answered_active && tm.answered_active.median !== undefined ? h('li', {}, `${T.medianTime}: ${dur(tm.answered_active.median)}`) : ''),
      h('h3', {}, T.nextStepH), say(T.nextStepText),
      cert,
      say(fmt(T.versions, { p: d.versions.policy, f: d.versions.framework, r: d.versions.registry })),
      v2Slot(id),
      h('p', {}, h('a', { href: location.pathname }, T.backToList)));
    document.getElementById('mx-rep').focus();
  }

  function certBlock(id) {
    const box = h('section', { class: 'mx-cert-block', 'aria-labelledby': 'mx-cert-h' });
    const consent = h('input', { type: 'checkbox', id: 'mx-consent' });
    const btn = h('button', { class: 'btn ghost', type: 'button', onclick: async () => {
      if (!consent.checked) { consent.focus(); return; }
      btn.disabled = true;
      const r = await api('POST', `/attempts/${id}/certificate`, { consent: true });
      if (r.status !== 200) { btn.disabled = false; return box.append(say(T.error, 'note mx-err')); }
      if (r.data.status !== 'ready') return box.replaceChildren(h('h3', { id: 'mx-cert-h' }, T.certH), say(T.certNone));
      const c = r.data;
      const date = new Date(c.date).toLocaleDateString(L === 'uk' ? 'uk-UA' : 'en-GB', { dateStyle: 'long' });
      box.replaceChildren(h('h3', { id: 'mx-cert-h' }, T.certH), h('article', { class: 'mx-cert' },
        h('p', { class: 'mx-cert-t' }, T.certTitle), h('p', { class: 'mx-cert-n' }, c.name[L]), h('p', { class: 'note' }, `${T.dateLabel}: ${date}`),
        h('ul', {}, c.claims.map((x) => h('li', {}, x[L]))),
        h('p', { class: 'note' }, T.certNotice), h('p', { class: 'note' }, h('a', { href: c.entry[L] }, T.certEntry))));
    } }, T.certBtn);
    box.append(h('h3', { id: 'mx-cert-h' }, T.certH), h('p', {}, h('label', { for: 'mx-consent' }, consent, ' ', T.certConsent)), h('p', {}, btn));
    return box;
  }

  // ---------------------------------------------------------------- report V2 (plan express-24-v2, or a preview for V1 attempts)
  function v2Slot(id) {
    const slot = h('section', { class: 'mx-v2-slot' });
    const btn = h('button', { class: 'btn ghost', type: 'button', onclick: async () => {
      btn.disabled = true;
      const r = await api('GET', `/attempts/${id}/report?locale=${L}&v=2`);
      if (r.status !== 200 || !r.data.v2) { btn.disabled = false; return slot.append(say(T.error, 'note mx-err')); }
      slot.replaceChildren(...renderV2(id, r.data));
      slot.querySelector('h2')?.focus();
    } }, T.showV2);
    slot.append(h('p', {}, btn));
    return slot;
  }

  function renderV2(id, d) { return renderV2Parts(id, d).flat(2).filter((x) => x !== ''); }
  function renderV2Parts(id, d) {
    const v = d.v2, c = v.copy || {};
    const scen = (n) => (n > 1 ? fmt(T.manyScenarios, { n }) : T.oneScenario);
    const byId = Object.fromEntries(v.technical.domains.map((x) => [x.id, x]));
    const strengths = v.strengths.length ? h('ol', { class: 'mx-strengths' }, v.strengths.map((s, i) => {
      const txt = (c.strengths || [])[i];
      return h('li', {}, h('p', {}, txt ? txt[L] : s.statement), h('p', { class: 'note' }, `${domainName(byId[s.domain])} · ${scen(s.scenarios)} · ${T.evidence}: ${s.evidence_ids.join(', ')}`));
    })) : say(T.noStrengths);
    const dev = v.development ? h('div', { class: 'mx-dev' }, h('p', {}, c.development ? c.development[L] : v.development.statement),
      v.development.recheck ? h('p', { class: 'note' }, T.recheckNote) : '', h('p', { class: 'note' }, `${domainName(byId[v.development.domain])} · ${T.evidence}: ${v.development.evidence_ids.join(', ')}`)) : '';
    const tm = v.time || {};
    const themes = h('ul', { class: 'mx-find' }, v.themes.map((t) => h('li', {}, `${t[L]} · ${t.eligible ? T.eligibleTheme : T.notEligibleTheme}`,
      t.eligible ? h('span', { class: 'note' }, ` · ${scen(t.scenarios)} · ${T.evidence}: ${t.evidence_ids.join(', ')}`) : '')));
    const tech = h('details', { class: 'mx-tech' }, h('summary', {}, T.techH),
      h('dl', { class: 'mx-head' },
        h('div', {}, h('dt', {}, T.observed), h('dd', {}, pct(v.technical.headline.observed))),
        h('div', {}, h('dt', {}, T.coverageM), h('dd', {}, pct(v.technical.headline.coverage))),
        h('div', {}, h('dt', {}, T.confidenceM), h('dd', {}, pct(v.technical.headline.confidence)))),
      say(T.measuresExplain),
      h('div', { class: 'mx-table' }, h('table', {}, h('caption', {}, T.domainsH),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, T.domainCol), h('th', { scope: 'col' }, T.observedCol), h('th', { scope: 'col' }, T.coverageCol), h('th', { scope: 'col' }, T.confidenceCol))),
        h('tbody', {}, v.technical.domains.map((x) => h('tr', { class: x.sampled ? '' : 'off' }, h('th', { scope: 'row' }, domainName(x)),
          x.sampled ? [h('td', {}, pct(x.observed)), h('td', {}, pct(x.coverage)), h('td', {}, pct(x.confidence))] : h('td', { colspan: '3' }, T.notMeasured)))))),
      v.technical.lows.length ? [h('h4', {}, T.improveH), h('ul', { class: 'mx-find' }, v.technical.lows.map((f) => h('li', {}, h('span', { lang: 'en' }, f.statement),
        h('span', { class: 'note' }, ` · ${domainName(byId[f.domain])} · ${f.observed}% · ${scen(f.scenarios)}${f.recheck ? ' · ' + T.recheckNote : ''}`))))] : '');
    return [
      h('h2', { tabindex: '-1' }, v.preview ? T.showV2.replace(/^Show |^Показати /, '') : T.reportTitle),
      v.preview ? say(T.previewNote) : '',
      h('p', { class: 'mx-breadth' }, fmt(T.breadth, { n: v.breadth.domains_sampled, t: v.breadth.domains_total, q: v.breadth.answered })),
      h('h3', {}, T.strengthsV2H), strengths,
      dev ? [h('h3', {}, T.devH), dev] : '',
      h('h3', {}, T.themesH), themes,
      certV2Block(id, v.preview),
      h('h3', {}, T.timingH),
      h('ul', { class: 'mx-find' },
        h('li', {}, `${T.activeTime}: ${dur(tm.active_ms)}`), h('li', {}, `${T.pausedTime}: ${dur(tm.paused_ms)}`),
        h('li', {}, `${T.elapsedTime}: ${dur(tm.elapsed_ms)}`), h('li', {}, `${T.unclassified}: ${dur(tm.unclassified_ms)}`)),
      tech,
      say(c.source === 'gemini' ? T.wordingAi : T.wordingTpl),
    ];
  }

  function certV2Block(id, preview) {
    const box = h('section', { class: 'mx-cert-block' });
    const consent = h('input', { type: 'checkbox', id: 'mx-consent2' });
    const btn = h('button', { class: 'btn ghost', type: 'button', onclick: async () => {
      if (!consent.checked) { consent.focus(); return; }
      btn.disabled = true;
      const r = await api('POST', `/attempts/${id}/certificate${preview ? '?v=2' : ''}`, { consent: true });
      if (r.status !== 200) { btn.disabled = false; return box.append(say(T.error, 'note mx-err')); }
      if (r.data.status !== 'ready') return box.replaceChildren(h('h3', {}, T.certV2H), say(T.noTheme));
      const c = r.data;
      const svg = cardSvg(c);
      const dl = h('button', { class: 'btn', type: 'button', onclick: () => downloadPng(svg, `managerial-dna-${c.date.slice(0, 10)}.png`) }, T.download);
      box.replaceChildren(h('h3', {}, T.certV2H), c.themes.length < 3 ? say(fmt(T.fewerThemes, { n: c.themes.length })) : '',
        h('div', { class: 'mx-card' }, svg), h('p', {}, dl),
        h('ul', { class: 'mx-find' }, c.themes.map((t) => h('li', { class: 'note' }, `${t[L]} · ${T.evidence}: ${t.evidence_ids.join(', ')}`))),
        say(c.copy_source === 'gemini' ? T.wordingAi : T.wordingTpl));
    } }, T.certBtn);
    box.append(h('h3', {}, T.certV2H), h('p', {}, h('label', { for: 'mx-consent2' }, consent, ' ', T.certConsent)), h('p', {}, btn));
    return box;
  }

  // 1200x630 card, drawn as SVG (shown inline) and exported to PNG through a canvas.
  const NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, text) { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (text !== undefined) e.textContent = text; return e; }
  function wrap(text, max) { const out = []; let cur = ''; for (const w of String(text).split(/\s+/)) { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; }
  function cardSvg(c) {
    const svg = s('svg', { viewBox: '0 0 1200 630', width: '1200', height: '630', role: 'img', 'aria-label': `${T.certTitle}: ${c.name[L]}` });
    const g = s('linearGradient', { id: 'mxg', x1: '0', y1: '0', x2: '1', y2: '1' });
    g.append(s('stop', { offset: '0', 'stop-color': '#0b1020' }), s('stop', { offset: '1', 'stop-color': '#16213d' }));
    const defs = s('defs', {}); defs.append(g); svg.append(defs);
    const font = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    svg.append(s('rect', { width: '1200', height: '630', fill: 'url(#mxg)' }), s('rect', { x: '24', y: '24', width: '1152', height: '582', rx: '28', fill: 'none', stroke: '#5b9bf8', 'stroke-opacity': '.55', 'stroke-width': '2' }));
    svg.append(s('text', { x: '72', y: '108', fill: '#5b9bf8', 'font-family': font, 'font-size': '30', 'font-weight': '800', 'letter-spacing': '1' }, 'MANAGERIAL DNA'));
    svg.append(s('text', { x: '72', y: '146', fill: '#94a3b8', 'font-family': font, 'font-size': '22' }, T.certSub));
    svg.append(s('text', { x: '72', y: '220', fill: '#ffffff', 'font-family': font, 'font-size': '52', 'font-weight': '800' }, c.name[L]));
    const n = c.themes.length, w = (1056 - (n - 1) * 24) / Math.max(n, 1);
    c.themes.forEach((t, i) => {
      const x = 72 + i * (w + 24);
      svg.append(s('rect', { x, y: '262', width: w, height: '236', rx: '18', fill: '#ffffff', 'fill-opacity': '.06', stroke: '#f59e0b', 'stroke-opacity': '.6' }));
      const title = wrap(t[L], n === 1 ? 50 : n === 2 ? 30 : 20).slice(0, 3);
      title.forEach((line, j) => svg.append(s('text', { x: x + 24, y: 304 + j * 32, fill: '#ffffff', 'font-family': font, 'font-size': '26', 'font-weight': '800' }, line)));
      const copy = t.copy ? t.copy[L] : '';
      const top = 304 + title.length * 32 + 12;
      wrap(copy, n === 1 ? 84 : n === 2 ? 46 : 31).slice(0, Math.floor((486 - top) / 24) + 1).forEach((line, j) => svg.append(s('text', { x: x + 24, y: top + j * 24, fill: '#cbd5e1', 'font-family': font, 'font-size': '18' }, line)));
    });
    const date = new Date(c.date).toLocaleDateString(L === 'uk' ? 'uk-UA' : 'en-GB', { dateStyle: 'long' });
    svg.append(s('text', { x: '72', y: '552', fill: '#e2e8f0', 'font-family': font, 'font-size': '21' }, fmt(T.certContext, { q: c.context.questions, d: c.context.domains_sampled, t: c.context.domains_total })));
    svg.append(s('text', { x: '72', y: '584', fill: '#94a3b8', 'font-family': font, 'font-size': '18' }, `${date} · mykola.pages.dev/challenge · ${T.certNotice.split('.')[0]}.`));
    return svg;
  }
  function downloadPng(svg, name) {
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 630;
      cv.getContext('2d').drawImage(img, 0, 0);
      cv.toBlob((blob) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  }

  // ---------------------------------------------------------------- TEMPORARY debug panel (testing only; remove later)
  // Shown only when the owner-session API sends `debug` (Worker flag EXPRESS_DEBUG) and only on wide desktop screens
  // (CSS .mx-dbg in style.css hides it below 1280px). Left of the question: what the selected answer would change (live)
  // and the impact of the last answer; right: the next question and the one after it.
  // To remove: delete this block, the `debugPanel(...)` / `debugSelect(...)` calls and the `.mx-dbg` CSS block.
  let dbgWhatIf = null, dbgNowBox = null;
  const dbgSign = (v) => (v === null || v === undefined ? '–' : (v > 0 ? '+' : '') + v);
  const dbgBA = (x, unit = '%') => `${x.before ?? '–'} → ${x.after ?? '–'}${unit} (${dbgSign(x.delta)})`;
  const dbgRow = (k, v, cls) => h('div', { class: cls || null }, h('dt', {}, k), h('dd', {}, v));
  function dbgEffect(x) {      // targets, domains and overall of one (real or hypothetical) answer
    const out = [];
    for (const t of x.targets) out.push(h('div', { class: 'mx-dbg-t' },
      h('p', {}, h('b', {}, t.unit), ` · ${t.domain}${t.core ? ' · core' : ''}${t.dimension ? ' · ' + t.dimension : ''}`),
      t.statement ? h('p', { class: 'note', lang: 'en' }, t.statement) : '',
      h('dl', {}, dbgRow('Score', `${t.score}/${t.max} (${t.pct}%) · best ${t.best}/${t.max}`, t.score < t.best ? 'mx-dbg-lo' : 'mx-dbg-hi'),
        dbgRow('Weight', String(t.strength)), dbgRow('Unit observed', dbgBA(t.unit_score)), dbgRow('Unit confidence', dbgBA(t.unit_confidence)),
        dbgRow('Families', String(t.families) + (t.conflict ? ' · conflict' : '')))));
    for (const d of x.domains) out.push(h('div', { class: 'mx-dbg-t' }, h('p', {}, h('b', {}, `${d.id} · ${domainName(d)}`)),
      h('dl', {}, dbgRow('Observed', dbgBA(d.observed)), dbgRow('Coverage', dbgBA(d.coverage)), dbgRow('Confidence', dbgBA(d.confidence)))));
    out.push(h('div', { class: 'mx-dbg-t' }, h('p', {}, h('b', {}, 'Overall')),
      h('dl', {}, dbgRow('Observed', dbgBA(x.headline.observed)), dbgRow('Coverage', dbgBA(x.headline.coverage)), dbgRow('Confidence', dbgBA(x.headline.confidence)),
        dbgRow('Domains', dbgBA(x.headline.domains, '')))));
    return out;
  }
  // Called by question() whenever the selection changes: ids in answer order (ranking) or as checked.
  function debugSelect(ids) {
    if (!dbgNowBox) return;
    const head = h('p', { class: 'mx-dbg-h' }, 'DEBUG · if you answer now');
    if (!dbgWhatIf) return dbgNowBox.replaceChildren(head, h('p', {}, 'No preview for this question.'));
    if (!ids.length) return dbgNowBox.replaceChildren(head, h('p', {}, 'Pick an answer to see what it changes. Skip or “Not sure” alone change no score.'));
    const key = dbgWhatIf.format === 'multiple_choice' ? [...ids].sort().join('+') : ids.join(dbgWhatIf.sep);
    const x = dbgWhatIf.answers[key];
    dbgNowBox.replaceChildren(head, h('p', {}, `Selection: ${key}`), ...(x ? dbgEffect(x) : [h('p', {}, 'Not a complete answer yet.')]));
  }
  function debugPanel(d) {
    document.querySelectorAll('.mx-dbg').forEach((x) => x.remove());
    dbgWhatIf = null; dbgNowBox = null;
    if (!d) return;
    const last = h('section', { class: 'mx-dbg-box', 'aria-label': 'Debug: last answer impact' }, h('p', { class: 'mx-dbg-h' }, 'DEBUG · last answer impact'));
    const l = d.last;
    if (!l) last.append(h('p', {}, 'No answer yet.'));
    else {
      last.append(h('p', {}, `Q${l.seq} · ${l.item_id} · ${l.format}`),
        h('dl', {}, dbgRow('Outcome', l.outcome + (l.uncertain ? ' (not sure)' : '')), l.choice ? dbgRow('Choice', l.choice) : ''), ...dbgEffect(l));
      if (l.note) last.append(h('p', { class: 'note' }, 'No effective evidence: scores unchanged.'));
    }
    const left = h('aside', { class: 'mx-dbg mx-dbg-l', 'aria-label': 'Debug: scoring' });
    if (d.current) {
      dbgWhatIf = d.what_if || null;
      dbgNowBox = h('section', { class: 'mx-dbg-box mx-dbg-now', 'aria-live': 'polite', 'aria-label': 'Debug: what this answer would change' });
      left.append(dbgNowBox);
      debugSelect([]);
    }
    left.append(last);
    const right = h('aside', { class: 'mx-dbg mx-dbg-r', 'aria-label': 'Debug: next questions' }, h('p', { class: 'mx-dbg-h' }, 'DEBUG · next questions'));
    const c = d.current;
    if (c) right.append(h('p', { class: 'note' }, `Now: ${c.item_id} · ${c.domain} · ${c.purpose || 'v1'} · ${c.target_unit}${c.match !== null ? ' · match ' + c.match : ''}`));
    const preview = (label, n) => {
      const box = h('div', { class: 'mx-dbg-t' }, h('p', {}, h('b', {}, label)));
      if (!n) box.append(h('p', {}, 'No open question.'));
      else if (n.status !== 'selected') box.append(h('p', {}, `None: ${n.status}`));
      else box.append(
        h('p', {}, `${n.item_id} · ${n.format} · L${n.difficulty}`),
        h('p', { class: 'note' }, `${n.domain} · ${n.purpose || 'v1'} · ${n.target_unit}${n.match !== null ? ' · match ' + n.match : ''}${n.fallback ? ' · fallback' : ''}`),
        h('p', { class: n.stable ? 'mx-dbg-hi' : 'mx-dbg-lo' }, n.stable ? 'Fixed: does not depend on your answers.' : 'May change with your answers.'),
        h('p', { class: 'mx-dbg-stem' }, n.stem), h('ol', {}, n.options.map((o) => h('li', {}, o))));
      return box;
    };
    right.append(preview('Next question', d.next));
    if (d.next && d.next.status === 'selected') right.append(preview('Question after next', d.after_next));
    document.body.append(left, right);
  }

  route();
})();
