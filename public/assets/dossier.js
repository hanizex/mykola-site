/* Case-file slider: native scroll-snap + prev/next buttons + dots + arrow keys. Works (scrollable) even without JS. */
(() => {
  'use strict';
  const root = document.querySelector('.dossier');
  if (!root) return;
  const scroller = root.querySelector('.folders');
  const folders = [...scroller.querySelectorAll('.folder')];
  const dotsBox = root.querySelector('.dots');
  const of = root.dataset.of || '/';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = -1, cur = 0, lock = 0;

  const center = (i) => folders[i].offsetLeft + folders[i].offsetWidth / 2;
  const go = (i) => {
    i = Math.max(0, Math.min(folders.length - 1, i));
    cur = i; lock = Date.now() + 700; // rapid clicks keep stepping from the requested folder, not the one still scrolling past
    scroller.scrollTo({ left: center(i) - scroller.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  };

  const dots = folders.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dot';
    b.setAttribute('aria-label', `${i + 1} ${of} ${folders.length}`);
    b.addEventListener('click', () => go(i));
    dotsBox.appendChild(b);
    return b;
  });

  const update = () => {
    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0, dist = Infinity;
    folders.forEach((_, i) => { const d = Math.abs(center(i) - mid); if (d < dist) { dist = d; best = i; } });
    if (Date.now() > lock) cur = best;
    if (best === active) return;
    active = best;
    folders.forEach((f, i) => f.classList.toggle('is-active', i === best));
    dots.forEach((b, i) => { b.classList.toggle('on', i === best); if (i === best) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  };

  let raf = 0;
  scroller.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  root.querySelector('.dprev').addEventListener('click', () => go(cur - 1));
  root.querySelector('.dnext').addEventListener('click', () => go(cur + 1));
  scroller.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
  });
  update();
})();
