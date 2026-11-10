// Generates the order-flow pages in English and Ukrainian from one set of strings:
//   /pay/ /book/ /done/ /privacy/        and        /uk/pay/ /uk/book/ /uk/done/ /uk/privacy/
// Logic is identical in both languages (see the inline scripts); only strings and next-step URLs differ.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const CALENDLY = 'https://calendly.com/hanizex/1-hour-meeting';
const EMAIL = 'hanizex@gmail.com';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const L = {
  en: {
    lang: 'en', pre: '', name: 'Mykola Kalakutskyi', home: '/', privacy: 'Privacy', backHome: 'Home',
    step: ['Step 1 of 3 · Pay', 'Step 2 of 3 · Book', 'Step 3 of 3 · Confirmation'],
    pay: {
      title: 'Pay for your consultation', h1: 'Pay for your consultation', lead: "€50 for one hour, online. Choose how you'd like to pay.",
      aria: 'Payment method', mono: 'Monobank', monoNote: '(UAH, fixed rate)', rev: 'Revolut', revNote: '(EUR)',
      howMono: 'Pay the consultation in hryvnia at a fixed rate through Monobank.', howRev: 'Pay €50 through Revolut.', open: 'Open payment page',
      personal: 'Please send it as a <strong>personal transfer</strong>. A comment is not needed – I match your payment by the transaction ID below.',
      txLabel: 'Transaction ID', txNote: "– from your bank's receipt after you pay", txPh: 'e.g. the ID shown in the transfer details',
      err: 'Please enter the transaction ID exactly as shown on your receipt (4–64 characters).', go: "I've paid – next: pick a time",
      after: "On the next step you'll book a time. Then I see your payment and accept the invite.",
    },
    book: {
      title: 'Pick a time', h1: 'Pick a time', lead: "Choose a slot for your one-hour consultation. I'll see your payment and accept the invite.",
      s1: 'Open the calendar and pick a slot.', s2: 'In the form, write the details and context of your case, and paste your reference:',
      s3: "Come back here and press \"I've booked\".",
      open: 'Open the calendar', note: 'The calendar opens on Calendly in a new tab. Calendly collects your name, email and message under its own privacy policy.',
      booked: "Booked? Then let me know:", bookedBtn: "I've booked my time", refLabel: 'Your reference',
    },
    done: { title: 'Thank you', h1: "Thank you – it's with me now", lead: "I'll check your payment and your booking, then confirm the meeting. If anything doesn't match, I'll write to you.", back: 'Back to the site' },
    priv: {
      title: 'Privacy', desc: 'What this site collects and why.', h1: 'Privacy',
      sections: [
        ['Visiting the site', 'This site sets no cookies. It counts visits with simple first-party events (page viewed, button clicked, scrolled halfway). To count unique visitors per day without tracking anyone across days, the server mixes your IP address and browser details with a secret that changes daily and keeps only a short irreversible code. Your IP address is not stored. If your browser sends Do Not Track or Global Privacy Control, no events are sent.'],
        ['Booking a consultation', 'When you pay and book, I store the payment method you chose, the transaction ID you entered, and the steps you completed, so I can confirm your order. Choosing a time opens Calendly in a new tab: Calendly collects your name, email and message under its own privacy policy and may set its own cookies there. I receive a Telegram notification for each order.'],
        ['How long and who to ask', `Order records are kept for up to 12 months, then deleted. To ask about or delete your data, contact me at <a href="mailto:${EMAIL}">${EMAIL}</a>.`],
      ],
    },
  },
  uk: {
    lang: 'uk', pre: '/uk', name: 'Микола Калакуцький', home: '/uk/', privacy: 'Конфіденційність', backHome: 'Головна',
    step: ['Крок 1 з 3 · Оплата', 'Крок 2 з 3 · Бронювання', 'Крок 3 з 3 · Підтвердження'],
    pay: {
      title: 'Оплата консультації', h1: 'Оплата консультації', lead: '€50 за одну годину онлайн. Оберіть, як вам зручно заплатити.',
      aria: 'Спосіб оплати', mono: 'Monobank', monoNote: '(UAH, фіксований курс)', rev: 'Revolut', revNote: '(EUR)',
      howMono: 'Сплатіть консультацію в гривнях за фіксованим курсом через Monobank.', howRev: 'Сплатіть €50 через Revolut.', open: 'Відкрити сторінку оплати',
      personal: 'Будь ласка, надішліть як <strong>особистий переказ</strong>. Коментар не потрібен – я звіряю ваш платіж за ID транзакції нижче.',
      txLabel: 'ID транзакції', txNote: '– з квитанції вашого банку після оплати', txPh: 'напр. ID з деталей переказу',
      err: 'Введіть ID транзакції точно так, як у квитанції (4–64 символи).', go: 'Оплату здійснено – далі: обрати час',
      after: 'На наступному кроці ви оберете час. Потім я бачу вашу оплату й приймаю запрошення.',
    },
    book: {
      title: 'Оберіть час', h1: 'Оберіть час', lead: 'Оберіть слот для вашої годинної консультації. Я побачу вашу оплату й прийму запрошення.',
      s1: 'Відкрийте календар і оберіть слот.', s2: 'У формі напишіть деталі та контекст вашого кейсу й вставте свій код:',
      s3: 'Поверніться сюди й натисніть "Час заброньовано".',
      open: 'Відкрити календар', note: 'Календар відкриється на Calendly в новій вкладці. Calendly збирає ваше ім\'я, email і повідомлення за власною політикою конфіденційності.',
      booked: 'Забронювали? Дайте мені знати:', bookedBtn: 'Час заброньовано', refLabel: 'Ваш код',
    },
    done: { title: 'Дякую', h1: 'Дякую – тепер це в мене', lead: 'Я перевірю вашу оплату й бронювання, а тоді підтверджу зустріч. Якщо щось не збігатиметься, я напишу вам.', back: 'Повернутися на сайт' },
    priv: {
      title: 'Конфіденційність', desc: 'Які дані збирає цей сайт і навіщо.', h1: 'Конфіденційність',
      sections: [
        ['Відвідування сайту', 'Цей сайт не встановлює cookies. Він рахує візити простими подіями (сторінку переглянуто, кнопку натиснуто, прокручено до половини). Щоб рахувати унікальних відвідувачів за день без стеження за людьми між днями, сервер змішує вашу IP-адресу та дані браузера із секретом, який змінюється щодня, і зберігає лише короткий незворотний код. Вашу IP-адресу не зберігаємо. Якщо ваш браузер надсилає Do Not Track або Global Privacy Control, жодні події не надсилаються.'],
        ['Бронювання консультації', 'Коли ви оплачуєте й бронюєте, я зберігаю обраний вами спосіб оплати, введений ID транзакції та кроки, які ви пройшли, щоб підтвердити ваше замовлення. Вибір часу відкриває Calendly в новій вкладці: Calendly збирає ваше ім\'я, email і повідомлення за власною політикою конфіденційності та може встановлювати там свої cookies. Я отримую сповіщення в Telegram про кожне замовлення.'],
        ['Як довго зберігаю і до кого звертатися', `Записи замовлень зберігаються до 12 місяців, потім видаляються. Щоб запитати про свої дані або видалити їх, напишіть мені: <a href="mailto:${EMAIL}">${EMAIL}</a>.`],
      ],
    },
  },
};

const shell = (c, { title, desc, canonical, noindex, noScript, step, body, script, alts, footerHome }) => `<!doctype html>
<html lang="${c.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} – ${esc(c.name)}</title>
  ${desc ? `<meta name="description" content="${esc(desc)}">` : ''}
  ${noindex ? '<meta name="robots" content="noindex">' : ''}
  ${canonical ? `<link rel="canonical" href="${SITE}${canonical}">` : ''}
  ${(alts || []).map((a) => `<link rel="alternate" hreflang="${a.l}" href="${SITE}${a.h}">`).join('\n  ')}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <header class="site"><div class="wrap"><a class="brand" href="${c.home}">${esc(c.name)}</a>${step ? `<nav><span class="muted">${esc(step)}</span></nav>` : ''}</div></header>
  <main class="wrap">
${body}
  </main>
  <footer class="site"><div class="wrap">${footerHome ? `<a href="${c.home}">${esc(c.backHome)}</a>` : `<a href="${c.pre}/privacy/">${esc(c.privacy)}</a>`}</div></footer>
  ${noScript ? '' : '<script src="/assets/site.js" defer></script>'}
${script || ''}
</body>
</html>
`;

function payPage(c) {
  const p = c.pay;
  const cfg = { next: `${c.pre}/book/`, err: p.err, mono: { url: 'https://base.monobank.ua/8RDvxE1Tcf8mXg', how: p.howMono }, revolut: { url: 'https://revolut.me/hanizex', how: p.howRev } };
  return shell(c, {
    title: p.title, noindex: true, step: c.step[0],
    body: `    <h1 style="font-size:2rem">${esc(p.h1)}</h1>
    <p class="lead">${esc(p.lead)}</p>

    <form id="f" class="panel" autocomplete="off">
      <div class="choice" role="radiogroup" aria-label="${esc(p.aria)}">
        <label><input type="radio" name="m" value="mono" required> ${p.mono} <span class="note">${esc(p.monoNote)}</span></label>
        <label><input type="radio" name="m" value="revolut"> ${p.rev} <span class="note">${esc(p.revNote)}</span></label>
      </div>

      <div class="panel" id="details" hidden style="background:var(--accent-soft);margin:16px 0 0">
        <p style="margin:0 0 10px" id="how"></p>
        <a class="btn" id="paylink" href="#" target="_blank" rel="noopener noreferrer">${esc(p.open)}</a>
        <p class="note" style="margin:10px 0 0">${p.personal}</p>
      </div>

      <p style="margin:18px 0 6px"><label for="tx"><strong>${esc(p.txLabel)}</strong> <span class="note">${esc(p.txNote)}</span></label></p>
      <input id="tx" type="text" maxlength="64" placeholder="${esc(p.txPh)}" required>
      <p class="note" id="err" role="alert" hidden></p>

      <p style="margin-top:18px"><button class="btn" type="submit" id="go">${esc(p.go)}</button></p>
      <p class="note">${esc(p.after)}</p>
    </form>`,
    script: `  <script>
    const CFG = ${JSON.stringify(cfg)};
    addEventListener('DOMContentLoaded', async () => {
      const f = document.getElementById('f'), err = document.getElementById('err'), go = document.getElementById('go');
      const post = (body) => fetch('/api/order', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()).catch(() => ({}));
      const box = document.getElementById('details');
      f.querySelectorAll('input[name=m]').forEach((r) => r.addEventListener('change', () => {
        const m = CFG[r.value]; if (!m) return;
        document.getElementById('how').textContent = m.how;
        document.getElementById('paylink').href = m.url;
        box.hidden = false;
      }));
      let id = new URLSearchParams(location.search).get('o') || '';
      if (!id) { const r = await post({ a: 'start', t: window.__touch || {} }); id = r.id || ''; }
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tx = document.getElementById('tx').value.trim();
        const m = f.m.value;
        if (!/^[\\w\\-:./ ]{4,64}$/.test(tx)) { err.hidden = false; err.textContent = CFG.err; return; }
        go.disabled = true;
        await post({ a: 'paid', id, m, tx });
        location.href = CFG.next + (id ? '?o=' + encodeURIComponent(id) : '');
      });
    });
  </script>`,
  });
}

function bookPage(c) {
  const b = c.book;
  const cfg = { cal: CALENDLY, done: `${c.pre}/done/` };
  return shell(c, {
    title: b.title, noindex: true, step: c.step[1],
    body: `    <h1 style="font-size:2rem">${esc(b.h1)}</h1>
    <p class="lead">${esc(b.lead)}</p>

    <div class="panel">
      <ol class="steps">
        <li>${esc(b.s1)}</li>
        <li>${esc(b.s2)} <code id="ref" class="refcode">–</code></li>
        <li>${esc(b.s3)}</li>
      </ol>
      <p><a class="btn" id="open" href="${CALENDLY}" target="_blank" rel="noopener noreferrer" data-ev="book_open">${esc(b.open)}</a></p>
      <p class="note">${esc(b.note)}</p>
      <div id="after" hidden style="margin-top:18px;padding-top:18px;border-top:1px solid var(--line)">
        <p style="margin:0 0 10px"><strong>${esc(b.booked)}</strong></p>
        <button class="btn" id="booked" type="button">${esc(b.bookedBtn)}</button>
      </div>
    </div>
    <p class="note">${esc(b.refLabel)}: <code class="refcode" id="ref2">–</code></p>`,
    script: `  <script>
    const CFG = ${JSON.stringify(cfg)};
    addEventListener('DOMContentLoaded', () => {
      const id = new URLSearchParams(location.search).get('o') || '';
      const ref = id ? id.slice(0, 8) : '–';
      document.getElementById('ref').textContent = ref; document.getElementById('ref2').textContent = ref;
      const open = document.getElementById('open');
      if (id) open.href = CFG.cal + '?utm_content=' + encodeURIComponent(ref);
      const post = (body) => fetch('/api/order', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).catch(() => {});
      let done = false;
      open.addEventListener('click', () => { document.getElementById('after').hidden = false; });
      document.getElementById('booked').addEventListener('click', async () => {
        if (done) return; done = true;
        await post({ a: 'booked', id });
        location.href = CFG.done + (id ? '?o=' + encodeURIComponent(id) : '');
      });
    });
  </script>`,
  });
}

const donePage = (c) => shell(c, {
  title: c.done.title, noindex: true, step: c.step[2],
  body: `    <h1 style="font-size:2rem">${esc(c.done.h1)}</h1>
    <p class="lead">${esc(c.done.lead)}</p>
    <p><a class="btn ghost" style="margin-left:0" href="${c.home}">${esc(c.done.back)}</a></p>`,
});

const privacyPage = (c) => shell(c, {
  title: c.priv.title, desc: c.priv.desc, canonical: `${c.pre}/privacy/`, footerHome: true,
  alts: [{ l: 'en', h: '/privacy/' }, { l: 'uk', h: '/uk/privacy/' }, { l: 'x-default', h: '/privacy/' }],
  noScript: true,
  body: `    <h1 style="font-size:2rem">${esc(c.priv.h1)}</h1>
${c.priv.sections.map((s) => `
    <h2>${esc(s[0])}</h2>
    <p>${s[1]}</p>`).join('\n')}`,
});

for (const k of ['en', 'uk']) {
  const c = L[k];
  for (const [dir, html] of [['pay', payPage(c)], ['book', bookPage(c)], ['done', donePage(c)], ['privacy', privacyPage(c)]]) {
    const d = join(ROOT, 'public', c.pre.replace(/^\//, ''), dir);
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, 'index.html'), html);
  }
}
console.log('flow: en + uk written');
