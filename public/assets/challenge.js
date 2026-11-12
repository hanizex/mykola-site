/* Challenge AI quiz. Runs fully in the browser: answers stay in memory and are never sent anywhere.
   Only two counters are posted through site.js (start, finish); they carry no answers. */
(() => {
  'use strict';
  const C = window.__QUIZ; if (!C) return;
  const $ = (id) => document.getElementById(id);
  const intro = $('qz-intro'), qBox = $('qz-q'), rBox = $('qz-res');
  const N = C.questions.length;
  let answers = [], idx = 0;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const send = (n) => { if (window.__send) window.__send(n); };

  function showQuestion() {
    const q = C.questions[idx];
    intro.hidden = true; rBox.hidden = true; qBox.hidden = false;
    const prog = C.ui.progress.replace('{n}', idx + 1).replace('{t}', N);
    qBox.innerHTML =
      `<p class="note qz-prog" aria-live="polite">${esc(prog)}</p>` +
      `<div class="qz-bar" aria-hidden="true"><i style="width:${Math.round((idx / N) * 100)}%"></i></div>` +
      `<h2 id="qz-h" tabindex="-1">${esc(q.text)}</h2>` +
      `<div class="opts" role="group" aria-labelledby="qz-h">${q.options.map((o, i) => `<button type="button" class="opt${answers[idx] === i ? ' on' : ''}" data-i="${i}">${esc(o.label)}</button>`).join('')}</div>` +
      (idx > 0 ? `<p><button type="button" class="linkbtn" id="qz-back">${esc(C.ui.back)}</button></p>` : '');
    qBox.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => { answers[idx] = Number(b.dataset.i); idx += 1; idx < N ? showQuestion() : showResult(); }));
    const back = $('qz-back'); if (back) back.addEventListener('click', () => { idx -= 1; showQuestion(); });
    $('qz-h').focus({ preventScroll: true });
  }

  function verdict() {
    const picked = C.questions.map((q, i) => ({ q, o: q.options[answers[i]], i }));
    const total = picked.reduce((a, p) => a + p.o.human, 0);
    let bi = C.bands.findIndex((b) => total >= b.min && total <= b.max); if (bi < 0) bi = C.bands.length - 1;
    const forced = [];
    C.overrides.forEach((ov) => {
      const hit = Object.entries(ov.if).every(([qid, oid]) => { const p = picked.find((x) => x.q.id === qid); return p && p.o.id === oid; });
      if (!hit) return;
      Object.keys(ov.if).forEach((qid) => forced.push(picked.find((x) => x.q.id === qid)));
      const t = C.bands.findIndex((b) => b.id === ov.minBand); if (t > bi) bi = t;
    });
    const ranked = picked.slice().sort((a, b) => (b.o.human - a.o.human) || (a.i - b.i));
    const sig = []; [...forced, ...ranked].forEach((p) => { if (!sig.includes(p) && sig.length < 2) sig.push(p); });
    return { band: C.bands[bi], signals: sig.map((p) => p.o.signal), picked };
  }

  function fillPrompt(picked) {
    let t = C.aiPrompt;
    picked.forEach((p) => { t = t.split('{{' + p.q.id + '}}').join(p.o.label.replace(/[.;]+$/, '')); });
    return t;
  }

  function copy(text, btn, done) {
    const ok = () => { const old = btn.textContent; btn.textContent = done; setTimeout(() => { btn.textContent = old; }, 1800); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(ok, () => fallback()); } else fallback();
    function fallback() {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { /* ignore */ } ta.remove();
    }
  }

  function showResult() {
    const v = verdict(), b = v.band, prompt = fillPrompt(v.picked);
    send('challenge_done');
    qBox.hidden = true; intro.hidden = true; rBox.hidden = false;
    const promptBlock = `<h3 class="sub">${esc(C.ui.promptTitle)}</h3><p class="note">${esc(C.ui.promptHint)}</p><pre class="qz-prompt" id="qz-prompt">${esc(prompt)}</pre><p><button type="button" class="btn ghost" id="qz-copy" style="margin-left:0">${esc(C.ui.copy)}</button></p>`;
    rBox.innerHTML =
      `<h2 id="qz-rh" tabindex="-1" class="qz-verdict">${esc(b.title)}</h2>` +
      `<p>${esc(b.analysis)}</p>` +
      `<h3 class="sub">${esc(C.ui.why)}</h3><ul class="qz-why">${v.signals.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` +
      `<h3 class="sub">${esc(C.ui.steps)}</h3><ol class="steps">${b.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` +
      (b.cta === 'intro' ? `<p><a class="btn" href="${esc(b.introUrl)}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${esc(C.ui.intro)}</a></p>` : `<p class="note">${esc(C.ui.tried)} <a href="${esc(b.introUrl)}" target="_blank" rel="noopener noreferrer" data-ev="intro_click">${esc(C.ui.triedLink)}</a></p>`) +
      (b.id === 'human' ? `<details class="qz-more"><summary>${esc(C.ui.tryAi)}</summary>${promptBlock}</details>` : promptBlock) +
      `<p style="margin-top:22px"><button type="button" class="btn ghost" id="qz-share" style="margin-left:0">${esc(C.ui.shareCopy)}</button> <button type="button" class="linkbtn" id="qz-again">${esc(C.ui.again)}</button></p>`;
    $('qz-copy').addEventListener('click', (e) => copy(prompt, e.currentTarget, C.ui.copied));
    $('qz-share').addEventListener('click', (e) => copy(C.share.replace('{{verdict}}', b.title) + ' ' + C.url, e.currentTarget, C.ui.copied));
    $('qz-again').addEventListener('click', () => { answers = []; idx = 0; rBox.hidden = true; intro.hidden = false; scrollTo(0, 0); });
    $('qz-rh').focus({ preventScroll: true }); scrollTo(0, 0);
  }

  $('qz-start').addEventListener('click', () => { answers = []; idx = 0; showQuestion(); });
})();
