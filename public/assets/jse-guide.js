/* JSE setup guide: carousels with linked hotspots, animated sequence diagrams, checklist progress,
   status journey and a filterable mistakes list. Progressive enhancement: without JS everything is shown stacked.
   Honors prefers-reduced-motion. Nothing is stored or sent. */
(() => {
  'use strict';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const setHh = () => { const h = document.querySelector('header.site'); if (h) document.documentElement.style.setProperty('--hh', h.offsetHeight + 'px'); };
  setHh(); window.addEventListener('resize', setHh);
  const fmt = (tpl, vars) => Object.keys(vars).reduce((s, k) => s.split('%' + k).join(vars[k]), tpl);

  // ------------------------------------------------------------ carousels + hotspots
  $$('.jg-car').forEach((car) => {
    const slides = $$('.jg-slide', car), dots = $('.jg-dots', car), count = $('.jg-count', car);
    const prev = $('[data-c=prev]', car), next = $('[data-c=next]', car);
    let cur = 0, pinned = null;
    const dotBtns = slides.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'jg-dot';
      b.setAttribute('aria-label', fmt(car.dataset.go, { n: i + 1, t: s.dataset.title }));
      b.addEventListener('click', () => go(i));
      dots.appendChild(b);
      return b;
    });
    function clearHl(slide) { $$('.hl', slide).forEach((e) => e.classList.remove('hl')); }
    function go(n, focus) {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => { s.classList.toggle('on', i === cur); clearHl(s); });
      pinned = null;
      dotBtns.forEach((b, i) => { b.classList.toggle('on', i === cur); if (i === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      count.textContent = fmt(car.dataset.of, { n: cur + 1, m: slides.length });
      prev.disabled = slides.length < 2; next.disabled = slides.length < 2;
      if (focus) slides[cur].focus({ preventScroll: true });
    }
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    car.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); }
    });
    // swipe
    let sx = null;
    car.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && !e.target.closest('button')) sx = e.clientX; });
    car.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); });
    car.addEventListener('pointercancel', () => { sx = null; });

    // hotspot <-> legend linking
    function setHl(slide, hs, on) {
      $$(`.m-win [data-hs="${hs}"], .jg-lg[data-hs="${hs}"]`, slide).forEach((e) => e.classList.toggle('hl', on));
    }
    slides.forEach((slide) => {
      slide.tabIndex = -1;
      slide.addEventListener('mouseover', (e) => { const t = e.target.closest('.m-win [data-hs], .jg-lg'); if (t && pinned === null) setHl(slide, t.dataset.hs, true); });
      slide.addEventListener('mouseout', (e) => { const t = e.target.closest('.m-win [data-hs], .jg-lg'); if (t && pinned === null) setHl(slide, t.dataset.hs, false); });
      slide.addEventListener('focusin', (e) => { const t = e.target.closest('.jg-lg'); if (t && pinned === null) setHl(slide, t.dataset.hs, true); });
      slide.addEventListener('focusout', (e) => { const t = e.target.closest('.jg-lg'); if (t && pinned === null) setHl(slide, t.dataset.hs, false); });
      slide.addEventListener('click', (e) => {
        const t = e.target.closest('.jg-lg, .m-win [data-hs]');
        const vt = e.target.closest('.jg-vt');
        if (vt) {
          $$('.jg-vt', slide).forEach((b) => b.classList.toggle('on', b === vt));
          $$('.m-var', slide).forEach((v) => v.classList.toggle('on', v.dataset.var === vt.dataset.v));
          return;
        }
        if (!t) { if (pinned !== null) { clearHl(slide); pinned = null; } return; }
        const hs = t.dataset.hs;
        clearHl(slide);
        if (pinned === hs) { pinned = null; return; }
        pinned = hs; setHl(slide, hs, true);
      });
    });
    go(0);
  });

  // ------------------------------------------------------------ sequence diagrams
  $$('.jg-seq').forEach((fig) => {
    const msgs = $$('.seq-msg', fig), caps = $$('.jg-list li', fig).map((li) => li.dataset.cap);
    const cap = $('.jg-seq-cap', fig), stepEl = $('.jg-seq-n', fig), playBtn = $('[data-a=play]', fig);
    const total = msgs.length, tpl = stepEl.dataset.fmt;
    let i = -1, timer = null, started = false;
    const stepText = (n) => tpl.replace(/\d+/, n).replace(/\d+(?!.*\d)/, total);

    function packet(m) {
      const pk = $('.seq-pk', m); if (!pk || reduce || !pk.animate) return;
      const x1 = +m.dataset.x1, x2 = +m.dataset.x2, y = +m.dataset.y;
      if (x1 === x2) return;
      pk.animate([{ transform: `translate(${x1}px,${y}px)`, opacity: 1 }, { transform: `translate(${x2}px,${y}px)`, opacity: 1, offset: 0.92 }, { transform: `translate(${x2}px,${y}px)`, opacity: 0 }], { duration: 1100, easing: 'ease-in-out', fill: 'forwards' });
    }
    function show(n, animate) {
      i = Math.max(-1, Math.min(total - 1, n));
      msgs.forEach((m, k) => { m.classList.toggle('seen', k <= i); m.classList.toggle('now', k === i); });
      stepEl.textContent = i < 0 ? stepText(0) : stepText(i + 1);
      cap.textContent = i < 0 ? cap.dataset.press : caps[i];
      if (i >= 0) {
        if (animate) packet(msgs[i]);
        // keep the current message in view inside the horizontal scroller
        const sc = $('.jg-seq-scroll', fig), m = msgs[i], x = Math.min(+m.dataset.x1, +m.dataset.x2) - 40;
        if (sc.scrollWidth > sc.clientWidth + 4) sc.scrollTo({ left: Math.max(0, x), behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = '▶'; playBtn.setAttribute('aria-label', playBtn.dataset.play); }
    function play() {
      if (i >= total - 1) show(-1);
      playBtn.textContent = '❚❚'; playBtn.setAttribute('aria-label', playBtn.dataset.pause);
      show(i + 1, true);
      timer = setInterval(() => { if (i >= total - 1) { stop(); return; } show(i + 1, true); }, reduce ? 4200 : 3200);
    }
    fig.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'play') { timer ? stop() : play(); return; }
      stop();
      if (a === 'next') show(i + 1, true);
      if (a === 'prev') show(i - 1, false);
      if (a === 'restart') show(-1);
    });
    if (!reduce) show(-1); else { show(total - 1); }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting && !started && !reduce) { started = true; play(); io.disconnect(); } else if (!en.isIntersecting && timer) stop(); }), { threshold: 0.55 });
      io.observe(fig);
    }
  });

  // ------------------------------------------------------------ checklist progress + scroll spy
  const checks = $$('.jg-done input[type=checkbox]');
  const bar = $('.jg-bar'), barFill = bar && $('i', bar), progT = $('.jg-prog-t');
  function updateProgress() {
    const n = checks.filter((c) => c.checked).length, max = checks.length;
    if (bar) { bar.setAttribute('aria-valuenow', n); barFill.style.width = (max ? (n / max) * 100 : 0) + '%'; }
    if (progT) progT.textContent = fmt(progT.dataset.fmt, { n, m: max });
    $$('.jg-step').forEach((s) => {
      const mine = checks.filter((c) => c.dataset.step === s.dataset.step), all = mine.length && mine.every((c) => c.checked);
      s.classList.toggle('done', !!all);
      const pill = document.querySelector(`.jg-prog a[data-step="${s.dataset.step}"]`); if (pill) pill.classList.toggle('done', !!all);
    });
  }
  checks.forEach((c) => c.addEventListener('change', updateProgress));
  updateProgress();
  if ('IntersectionObserver' in window) {
    const pills = $$('.jg-prog a[data-step]');
    const spy = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) pills.forEach((p) => { if (p.dataset.step === en.target.dataset.step) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current'); });
    }), { rootMargin: '-35% 0px -55% 0px' });
    $$('.jg-step').forEach((s) => spy.observe(s));
  }

  // ------------------------------------------------------------ status journey
  const sf = $('.jg-states');
  if (sf) {
    const btns = $$('.jg-sb', sf), desc = $('.jg-sd', sf), pb = $('.jg-splay', sf), main = btns.filter((b) => b.parentElement.classList.contains('jg-smain'));
    let k = -1, t = null;
    function pick(b) { btns.forEach((x) => x.classList.toggle('on', x === b)); desc.textContent = b ? b.dataset.d : ''; desc.classList.toggle('has', !!b); }
    function stopS() { if (t) { clearInterval(t); t = null; } pb.textContent = '▶ ' + pb.dataset.play; }
    function playS() {
      pb.textContent = '❚❚ ' + pb.dataset.pause; k = -1;
      const tick = () => { k += 1; if (k >= main.length) { stopS(); return; } pick(main[k]); };
      tick(); t = setInterval(tick, reduce ? 3800 : 2600);
    }
    btns.forEach((b) => b.addEventListener('click', () => { stopS(); pick(b); }));
    pb.addEventListener('click', () => { t ? stopS() : playS(); });
    if (main[0]) pick(main[0]);
  }

  // ------------------------------------------------------------ mistakes filter
  const tr = $('.jg-trouble');
  if (tr) {
    const fcs = $$('.jg-fc', tr), items = $$('.jg-m', tr);
    function filter(cat) {
      fcs.forEach((b) => { const on = b.dataset.cat === cat; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      items.forEach((d) => { d.hidden = !(cat === 'all' || d.dataset.cat === cat); if (d.hidden) d.open = false; });
    }
    fcs.forEach((b) => b.addEventListener('click', () => filter(b.dataset.cat)));
    $$('[data-cat-link]').forEach((a) => a.addEventListener('click', () => filter(a.dataset.catLink)));
    filter('all');
  }
})();
