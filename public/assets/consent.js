/* Privacy page only: shows and changes the analytics choice. No analytics run on this page.
   A change applies from the next page that loads site.js. */
(() => {
  'use strict';
  const box = document.getElementById('consent-box');
  if (!box) return;
  const uk = (document.documentElement.lang || 'en').slice(0, 2) === 'uk';
  const T = uk
    ? { h: 'Ваш вибір щодо статистики', granted: 'Ви погодились. Google Analytics працює на сторінках зі статистикою, починаючи з наступної сторінки.', denied: 'Ви відхилили. Google Analytics вимкнений.', none: 'Вибір ще не зроблено. Google Analytics вимкнений, про вибір запитають на наступній сторінці.', refused: 'Ваш браузер надсилає Do Not Track або Global Privacy Control, тож Google Analytics лишається вимкненим.', a: 'Погодитись', d: 'Відхилити' }
    : { h: 'Your analytics choice', granted: 'Accepted. Google Analytics runs on pages with statistics, starting from the next page you open.', denied: 'Declined. Google Analytics is off.', none: 'Not chosen yet. Google Analytics is off and you will be asked on the next page.', refused: 'Your browser sends Do Not Track or Global Privacy Control, so Google Analytics stays off.', a: 'Accept', d: 'Decline' };
  const KEY = 'ga-consent';
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const set = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* ignore */ } };
  const refused = navigator.doNotTrack === '1' || navigator.globalPrivacyControl;
  function dropCookies() {
    document.cookie.split(';').forEach((c) => {
      const n = c.split('=')[0].trim();
      if (!/^_ga/.test(n)) return;
      const past = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = past;
      document.cookie = past + '; domain=' + location.hostname;
    });
  }
  function render() {
    const v = get();
    box.textContent = '';
    const h = document.createElement('h2'); h.textContent = T.h; box.appendChild(h);
    const p = document.createElement('p'); p.setAttribute('role', 'status');
    p.textContent = refused ? T.refused : v === 'granted' ? T.granted : v === 'denied' ? T.denied : T.none;
    box.appendChild(p);
    if (refused) return;
    const row = document.createElement('div'); row.className = 'cc-b';
    [['denied', T.d], ['granted', T.a]].forEach(([val, label]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      b.addEventListener('click', () => { set(val); if (val === 'denied') dropCookies(); render(); });
      row.appendChild(b);
    });
    box.appendChild(row);
  }
  render();
})();
