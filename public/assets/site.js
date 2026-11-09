/* Cookieless first-party analytics + gentle reveal. No cookies, no persistent IDs.
   Honors Do Not Track and Global Privacy Control. */
(() => {
  'use strict';

  // --- reveal on scroll (decorative) ---
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }

  // --- analytics ---
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;

  const q = new URLSearchParams(location.search);
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  // First-touch source for this browser session (kept so later pages / orders can carry it).
  let touch = null;
  try { touch = JSON.parse(store.get('ft') || 'null'); } catch (e) { /* ignore */ }
  if (!touch) {
    let ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { /* ignore */ }
    if (ref === location.hostname) ref = '';
    touch = { r: ref, s: q.get('utm_source') || '', m: q.get('utm_medium') || '', c: q.get('utm_campaign') || '', lp: location.pathname };
    store.set('ft', JSON.stringify(touch));
  }
  window.__touch = touch; // used by pay/book pages when creating an order

  const orderId = q.get('o') || '';
  const send = (name) => {
    const body = JSON.stringify({ n: name, p: location.pathname, l: document.documentElement.lang || 'en', o: orderId, t: touch });
    try { navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' })); } catch (e) { /* ignore */ }
  };
  window.__send = send;

  send('page_view');

  let scrolled = false;
  addEventListener('scroll', () => {
    if (scrolled) return;
    const h = document.documentElement;
    if ((h.scrollTop + innerHeight) / h.scrollHeight >= 0.5) { scrolled = true; send('scroll_50'); }
  }, { passive: true });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-ev]');
    if (el) send(el.getAttribute('data-ev'));
  });
})();
