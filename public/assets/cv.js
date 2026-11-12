/* CV page: count-up numbers, skill filter that highlights roles, expand/collapse, print mode. Everything is readable without JS. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const printMode = params.has('print');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const roles = [...document.querySelectorAll('details.job')];
  const openAll = (v) => roles.forEach((r) => { r.open = v; });

  if (printMode) { document.documentElement.classList.add('print-mode'); openAll(true); return; }
  addEventListener('beforeprint', () => openAll(true));

  // expand / collapse
  const ex = document.getElementById('expand'), co = document.getElementById('collapse');
  if (ex) ex.addEventListener('click', () => openAll(true));
  if (co) co.addEventListener('click', () => openAll(false));

  // skill filter: any selected chip highlights roles that list it; matching roles open, others dim
  const chips = [...document.querySelectorAll('.chip')], tl = document.querySelector('.tl'), clear = document.getElementById('clear');
  const apply = () => {
    const on = chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.skill);
    tl.classList.toggle('filtering', on.length > 0);
    if (clear) clear.hidden = on.length === 0;
    roles.forEach((r) => {
      const has = on.length > 0 && on.some((s) => r.dataset.skills.split(' ').includes(s));
      r.classList.toggle('match', has);
      if (on.length) r.open = has;
    });
  };
  chips.forEach((c) => c.addEventListener('click', () => { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); apply(); }));
  if (clear) clear.addEventListener('click', () => { chips.forEach((c) => c.setAttribute('aria-pressed', 'false')); apply(); });

  // count-up (final numbers are already in the HTML for crawlers and no-JS)
  if (reduce || !('IntersectionObserver' in window)) return;
  const fmt = (v, dec) => (dec ? v.toFixed(1) : String(Math.round(v)));
  const comma = document.documentElement.lang === 'uk';
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, to = parseFloat(el.dataset.to), dec = Number(el.dataset.dec), t0 = performance.now(), dur = 1100;
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / dur), v = to * (1 - Math.pow(1 - k, 3));
        el.textContent = fmt(v, dec).replace('.', comma ? ',' : '.');
        if (k < 1) requestAnimationFrame(tick);
      };
      el.textContent = fmt(0, dec).replace('.', comma ? ',' : '.');
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.num').forEach((n) => io.observe(n));
})();
