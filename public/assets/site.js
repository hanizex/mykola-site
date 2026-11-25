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

  // Owner exclusion: open any page once with ?me=1 to stop counting this browser (?me=0 turns counting back on).
  let owner = false;
  try {
    if (q.get('me') === '1') localStorage.setItem('owner', '1');
    if (q.get('me') === '0') localStorage.removeItem('owner');
    owner = localStorage.getItem('owner') === '1';
  } catch (e) { /* ignore */ }
  if (owner) { window.__send = () => {}; window.__touch = { s: 'owner' }; return; }

  // Cloudflare Web Analytics: free, cookieless, aggregate statistics (country, referrer, device, page speed).
  // Reached only when Do Not Track and Global Privacy Control are off and this browser is not the owner's.
  // The token is a public site identifier, not a secret.
  try {
    const cfa = document.createElement('script');
    cfa.type = 'module';
    cfa.src = 'https://static.cloudflareinsights.com/beacon.min.js?token=058108edcba44790b91dce74928af8a5';
    document.head.appendChild(cfa);
  } catch (e) { /* analytics must never break the page */ }

  // Google Analytics 4. Visitors from the EU, the EEA, the UK and Switzerland are asked first (banner, Consent Mode starts
  // as denied); everywhere else it loads without a question (/api/geo decides, the answer is kept for the browser session).
  // Anyone can decline later with "Cookie settings" in the footer.
  // Do Not Track, Global Privacy Control and the owner's browser never reach this point (they return above).
  // The measurement ID is a public identifier, not a secret.
  const GA_ID = 'G-2V8P5MMY2K', CHOICE_KEY = 'ga-consent';
  let gaLoaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
  const choiceGet = () => { try { return localStorage.getItem(CHOICE_KEY); } catch (e) { return null; } };
  const choiceSet = (v) => { try { localStorage.setItem(CHOICE_KEY, v); } catch (e) { /* ignore */ } };
  function loadGa() {
    if (gaLoaded) return;
    gaLoaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  function dropGa() {
    gtag('consent', 'update', { analytics_storage: 'denied' });
    const parts = location.hostname.split('.'), doms = [''];          // GA writes its cookie on a parent domain: clear every level
    for (let i = 0; i < parts.length - 1; i++) { const d = parts.slice(i).join('.'); doms.push(d, '.' + d); }
    document.cookie.split(';').forEach((c) => {
      const n = c.split('=')[0].trim();
      if (!/^_ga/.test(n)) return;
      doms.forEach((d) => { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : ''); });
    });
  }
  const uk = (document.documentElement.lang || 'en').slice(0, 2) === 'uk';
  const CC = uk
    ? { t: 'Статистика й cookies', p: 'Я хотів би рахувати відвідування через Google Analytics. Він ставить cookies і передає дані про використання сайту Google. Без вашої згоди працює лише моя власна статистика без cookies.', a: 'Погодитись', d: 'Відхилити', m: 'Конфіденційність', s: 'Налаштування cookies', href: '/uk/privacy/' }
    : { t: 'Analytics cookies', p: 'I would like to count visits with Google Analytics. It sets cookies and sends usage data to Google. Without your consent only my own cookie-free statistics run.', a: 'Accept', d: 'Decline', m: 'Privacy', s: 'Cookie settings', href: '/privacy/' };
  function showBar() {
    if (document.getElementById('cc-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'cc-bar'; bar.className = 'cc-bar'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', CC.t);
    bar.innerHTML = '<div class="cc-t"><b></b><p></p></div><div class="cc-b"><button type="button" data-cc="denied"></button><button type="button" data-cc="granted"></button></div>';
    bar.querySelector('b').textContent = CC.t;
    const p = bar.querySelector('p'); p.textContent = CC.p + ' ';
    const a = document.createElement('a'); a.href = CC.href; a.textContent = CC.m; p.appendChild(a);
    bar.querySelector('[data-cc=denied]').textContent = CC.d;
    bar.querySelector('[data-cc=granted]').textContent = CC.a;
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cc]'); if (!b) return;
      const v = b.getAttribute('data-cc');
      choiceSet(v);
      if (v === 'granted') loadGa(); else dropGa();
      bar.remove();
    });
    document.body.appendChild(bar);
  }
  function needConsent() {
    let cached = null;
    try { cached = sessionStorage.getItem('geo-consent'); } catch (e) { /* ignore */ }
    if (cached === '1' || cached === '0') return Promise.resolve(cached === '1');
    return fetch('/api/geo', { credentials: 'omit' }).then((r) => r.json()).then((d) => {
      try { sessionStorage.setItem('geo-consent', d.consent ? '1' : '0'); } catch (e) { /* ignore */ }
      return !!d.consent;
    }).catch(() => true);                                    // unknown: ask
  }
  const choice = choiceGet();
  if (choice === 'granted') loadGa();
  else if (choice !== 'denied') needConsent().then((ask) => { if (ask) showBar(); else loadGa(); });
  const foot = document.querySelector('footer.site .wrap');
  if (foot) {
    foot.appendChild(document.createTextNode(' · '));
    const l = document.createElement('a'); l.href = '#cookie-settings'; l.textContent = CC.s;
    l.addEventListener('click', (e) => { e.preventDefault(); showBar(); });
    foot.appendChild(l);
  }

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
    touch = { r: ref, s: q.get('utm_source') || q.get('src') || '', m: q.get('utm_medium') || '', c: q.get('utm_campaign') || '', lp: location.pathname };
    store.set('ft', JSON.stringify(touch));
  }
  window.__touch = touch; // used by pay/book pages when creating an order

  const orderId = q.get('o') || '';
  const send = (name) => {
    const body = JSON.stringify({ n: name, p: location.pathname, l: document.documentElement.lang || 'en', o: orderId, t: touch });
    try { navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' })); } catch (e) { /* ignore */ }
    if (gaLoaded && name !== 'page_view') gtag('event', name, { page_path: location.pathname });
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
