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
  const show = (...nodes) => { root.replaceChildren(...nodes); };
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
    if (s.data.current && s.data.locale === L) return question(s.data.current, s.data.progress);
    return nextQuestion(s.data.progress);
  }

  async function nextQuestion(prog) {
    const n = await api('POST', `/attempts/${A.id}/next`, { revision: A.revision });
    if (n.status === 409) { root.prepend(say(T.stale)); return attempt(A.id); }
    if (n.status !== 200) return show(say(T.error, 'note mx-err'));
    A.revision = n.data.revision;
    if (n.data.done) return planReached(n.data.progress || prog);
    const p = prog || (await api('GET', `/attempts/${A.id}`)).data.progress;
    question(n.data.current, p);
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

  function question(q, prog) {
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
      const draw = () => {
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
    legend.focus({ preventScroll: false });
    sendEvents([{ type: 'display', display_id: q.display_id }]);
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
  const dur = (ms) => { if (ms === null || ms === undefined) return '–'; const s = Math.round(ms / 1000); return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`; };

  async function report(id) {
    const r = await api('GET', `/attempts/${id}/report?locale=${L}`);
    if (r.status === 404) { location.hash = '#a=' + id; return; }
    if (r.status !== 200) return show(say(T.error, 'note mx-err'));
    const d = r.data;
    if (d.status !== 'ready') return show(say(T.partialNote));
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

  route();
})();
