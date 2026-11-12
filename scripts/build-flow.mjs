// Generates the order-flow pages in English and Ukrainian from one set of strings:
//   /pay/ /book/ /done/ /privacy/ /terms/        and        /uk/pay/ /uk/book/ /uk/done/ /uk/privacy/ /uk/terms/
// Logic is identical in both languages (see the inline scripts); only strings and next-step URLs differ.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://mykola.pages.dev';
const CALENDLY = 'https://calendly.com/hanizex/1-hour-meeting';
const EMAIL = 'hanizex@gmail.com';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');


const REQ = {
  en: {
    title: 'Request a consultation', h1: 'Request a consultation',
    lead: 'One hour, online, €50. Tell me briefly about your situation. I will reply personally with a payment link and available time slots. Nothing is paid in advance.',
    name: 'Your name', li: 'LinkedIn profile', liPh: 'https://www.linkedin.com/in/your-name', msg: 'A few words about the problem', msgPh: 'What is happening, what you have already tried, what result you need.',
    send: 'Send request', sending: 'Sending...', note: 'I use these details only to reply to you. See the <a href="/privacy/">privacy page</a> and the <a href="/terms/">terms</a>.',
    thanksH: 'Thank you', thanks: 'I got your request and will write to you personally. If you do not hear from me, write to ' + EMAIL + '.',
    errName: 'Please enter your name.', errLi: 'Please paste a link to your LinkedIn profile.', errMsg: 'Please describe the problem in a few words (at least 10 characters).', errSend: 'Could not send the request. Please try again, or write to ' + EMAIL + '.',
  },
  uk: {
    title: 'Запит на консультацію', h1: 'Запит на консультацію',
    lead: 'Одна година, онлайн, €50. Коротко опишіть свою ситуацію. Я відповім особисто з посиланням на оплату та вільними слотами. Наперед нічого платити не потрібно.',
    name: 'Ваше ім\'я', li: 'Профіль у LinkedIn', liPh: 'https://www.linkedin.com/in/your-name', msg: 'Кілька слів про проблему', msgPh: 'Що відбувається, що ви вже пробували, який результат потрібен.',
    send: 'Надіслати запит', sending: 'Надсилаю...', note: 'Ці дані потрібні лише для відповіді вам. Див. <a href="/uk/privacy/">конфіденційність</a> та <a href="/uk/terms/">умови</a>.',
    thanksH: 'Дякую', thanks: 'Я отримав ваш запит і напишу вам особисто. Якщо відповіді не буде, напишіть на ' + EMAIL + '.',
    errName: 'Будь ласка, вкажіть ім\'я.', errLi: 'Будь ласка, вставте посилання на ваш профіль у LinkedIn.', errMsg: 'Опишіть проблему кількома словами (щонайменше 10 символів).', errSend: 'Не вдалося надіслати запит. Спробуйте ще раз або напишіть на ' + EMAIL + '.',
  },
};

const TERMS = {
  en: {
    label: 'Terms', title: 'Terms of service', desc: 'Terms for the free intro call and the one-hour consultation.', h1: 'Terms of service', updated: 'Last updated: 12 November 2026.',
    payNote: 'By paying you accept the <a href="/terms/" target="_blank" rel="noopener">terms of service</a>.',
    sections: [
      ['Who provides the service', `The service is provided by Mykola Kalakutskyi, an individual consultant. Contact: <a href="mailto:${EMAIL}">${EMAIL}</a>.`],
      ['The free intro call', 'A free online call where we get to know each other and decide whether a consultation can help with your situation. It costs nothing and commits you to nothing. I may suggest the paid consultation, or tell you it is not the right fit.'],
      ['The consultation', 'One hour (60 minutes) of online consultation on management topics: projects, delivery, products, operations, team and stakeholder problems, startup setup, process audits and interview preparation. The price is €50 per session. The meeting link comes with the calendar invitation.'],
      ['Requesting and paying', 'You send a request through the form. I reply personally with a payment link (Monobank in UAH at a fixed rate, or Revolut in EUR) and available time slots. Nothing is paid in advance. Your slot is confirmed when I see the payment and send the calendar invitation. I may decline a request if I am not the right person for the problem; in that case nothing is charged. Payment providers and banks may charge their own fees.'],
      ['Rescheduling and cancelling', 'You can reschedule or cancel free of charge up to 24 hours before the meeting, and I refund the payment in full if you cancel. If you cancel less than 24 hours before, or do not join within 15 minutes of the start, the session counts as held and is not refunded; I may offer a new time at my discretion. If I need to cancel or move the meeting, you can choose a new time or get a full refund.'],
      ['Refunds', 'Refunds go back to the method you paid with within 7 working days of the request. The amount may differ slightly because of exchange rates or bank fees.'],
      ['What to expect', 'I give you my professional opinion and a list of actions based on what you tell me. I do not guarantee a particular result: the decisions and their outcomes stay with you. This is management and process advice, not legal, tax, financial or medical advice.'],
      ['Confidentiality', 'What you tell me stays between us. I do not record sessions unless we agree otherwise. I do not publish details that could identify you or your company; examples on this site and in my posts are illustrative or anonymised.'],
      ['Your data', 'See the <a href="/privacy/">privacy page</a> for what is stored and for how long.'],
      ['Changes', 'I may update these terms. The version published when you booked applies to your session.'],
    ],
  },
  uk: {
    label: 'Умови', title: 'Умови надання послуг', desc: 'Умови безкоштовного знайомства та годинної консультації.', h1: 'Умови надання послуг', updated: 'Остання редакція: 12 листопада 2026.',
    payNote: 'Сплачуючи, ви погоджуєтеся з <a href="/uk/terms/" target="_blank" rel="noopener">умовами надання послуг</a>.',
    sections: [
      ['Хто надає послугу', `Послугу надає Микола Калакуцький, індивідуальний консультант. Контакт: <a href="mailto:${EMAIL}">${EMAIL}</a>.`],
      ['Безкоштовне знайомство', 'Безкоштовна онлайн-зустріч, на якій ми знайомимося й вирішуємо, чи допоможе консультація у вашій ситуації. Вона нічого не коштує й ні до чого вас не зобов\'язує. Я можу запропонувати платну консультацію або сказати, що вона вам не підходить.'],
      ['Консультація', 'Одна година (60 хвилин) онлайн-консультації з питань менеджменту: проєкти, delivery, продукти, операційна робота, проблеми з командою та стейкхолдерами, запуск стартапу, аудит процесів і підготовка до співбесід. Вартість: €50 за одну сесію. Посилання на зустріч надходить із запрошенням у календарі.'],
      ['Запит і оплата', 'Ви надсилаєте запит через форму. Я відповідаю особисто з посиланням на оплату (Monobank у гривнях за фіксованим курсом або Revolut у євро) та вільними слотами. Наперед нічого платити не потрібно. Час підтверджується, коли я бачу оплату й надсилаю запрошення в календар. Я можу відмовити, якщо не є відповідною людиною для вашої проблеми; тоді оплата не стягується. Платіжні сервіси та банки можуть брати власні комісії.'],
      ['Перенесення та скасування', 'Ви можете безкоштовно перенести або скасувати зустріч не пізніше ніж за 24 години до початку; у разі скасування я повертаю оплату повністю. Якщо ви скасовуєте менш ніж за 24 години або не приєдналися протягом 15 хвилин після початку, сесія вважається проведеною й оплата не повертається; новий час я можу запропонувати на власний розсуд. Якщо зустріч скасовую або переношу я, ви обираєте новий час або отримуєте повне повернення коштів.'],
      ['Повернення коштів', 'Кошти повертаються тим самим способом, яким ви платили, протягом 7 робочих днів після запиту. Сума може трохи відрізнятися через курс валют або комісії банків.'],
      ['Чого очікувати', 'Я даю професійну думку й перелік дій на основі того, що ви розповісте. Я не гарантую конкретного результату: рішення та їхні наслідки залишаються за вами. Це поради з менеджменту й процесів, а не юридичні, податкові, фінансові чи медичні поради.'],
      ['Конфіденційність', 'Те, що ви мені розповідаєте, залишається між нами. Я не записую сесії, якщо ми не домовимося інакше. Я не публікую подробиць, за якими можна впізнати вас чи вашу компанію; приклади на цьому сайті й у моїх дописах є ілюстративними або знеособленими.'],
      ['Ваші дані', 'Що зберігається і як довго, дивіться на <a href="/uk/privacy/">сторінці конфіденційності</a>.'],
      ['Зміни', 'Я можу оновлювати ці умови. До вашої сесії застосовується редакція, чинна на момент бронювання.'],
    ],
  },
};

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
        ['Requests, intro calls and the quiz', 'If you request a consultation, the form sends your name, LinkedIn link and message to me as a Telegram notification so I can reply. I keep it for up to 12 months, then delete it. Booking a free intro call opens Calendly in a new tab: Calendly collects your name, email and message under its own privacy policy and may set its own cookies there. Payments happen on Monobank or Revolut pages; I never see your card details. The Challenge AI quiz runs in your browser: your answers are not sent or stored, only the fact that a quiz was started or finished is counted like other page events.'],
        ['How long and who to ask', `Requests and order records are kept for up to 12 months, then deleted. To ask about or delete your data, contact me at <a href="mailto:${EMAIL}">${EMAIL}</a>.`],
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
        ['Запити, знайомство й тест', 'Якщо ви надсилаєте запит на консультацію, форма передає мені ваше ім\'я, посилання на LinkedIn і повідомлення як сповіщення в Telegram, щоб я міг відповісти. Я зберігаю це до 12 місяців, потім видаляю. Запис на безкоштовне знайомство відкриває Calendly в новій вкладці: Calendly збирає ваше ім\'я, email і повідомлення за власною політикою конфіденційності та може встановлювати там свої cookies. Оплата відбувається на сторінках Monobank або Revolut; я ніколи не бачу даних вашої картки. Тест Challenge AI працює у вашому браузері: відповіді не надсилаються й не зберігаються, лише факт початку чи завершення тесту рахується, як інші події сторінок.'],
        ['Як довго зберігаю і до кого звертатися', `Запити та записи замовлень зберігаються до 12 місяців, потім видаляються. Щоб запитати про свої дані або видалити їх, напишіть мені: <a href="mailto:${EMAIL}">${EMAIL}</a>.`],
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
  <footer class="site"><div class="wrap">${footerHome ? `<a href="${c.home}">${esc(c.backHome)}</a>` : `<a href="${c.pre}/privacy/">${esc(c.privacy)}</a> · <a href="${c.pre}/terms/">${esc(TERMS[c.lang].label)}</a>`}</div></footer>
  ${noScript ? '' : '<script src="/assets/site.js" defer></script>'}
${script || ''}
</body>
</html>
`;

function payPage(c) {
  const p = c.pay;
  const cfg = { next: `${c.pre}/book/`, err: p.err, mono: { url: 'https://base.monobank.ua/8RDvxE1Tcf8mXg', how: p.howMono }, revolut: { url: c.lang === 'uk' ? 'https://checkout.revolut.com/pay/63daaeb0-0ed8-4601-aabe-64d90680c78a' : 'https://checkout.revolut.com/pay/35c04074-9012-4a76-81c5-244414d5ae91', how: p.howRev } };
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
        <p class="note" id="personal" style="margin:10px 0 0">${p.personal}</p>
      </div>

      <p style="margin:18px 0 6px"><label for="tx"><strong>${esc(p.txLabel)}</strong> <span class="note">${esc(p.txNote)}</span></label></p>
      <input id="tx" type="text" maxlength="64" placeholder="${esc(p.txPh)}" required>
      <p class="note" id="err" role="alert" hidden></p>

      <p style="margin-top:18px"><button class="btn" type="submit" id="go">${esc(p.go)}</button></p>
      <p class="note">${TERMS[c.lang].payNote}</p>
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
        document.getElementById('personal').hidden = r.value !== 'mono';
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

const termsPage = (c) => { const t = TERMS[c.lang]; return shell(c, {
  title: t.title, desc: t.desc, canonical: `${c.pre}/terms/`, footerHome: true,
  alts: [{ l: 'en', h: '/terms/' }, { l: 'uk', h: '/uk/terms/' }, { l: 'x-default', h: '/terms/' }],
  noScript: true,
  body: `    <h1 style="font-size:2rem">${esc(t.h1)}</h1>
    <p class="note">${esc(t.updated)}</p>
${t.sections.map((s) => `
    <h2>${esc(s[0])}</h2>
    <p>${s[1]}</p>`).join('\n')}`,
}); };

const requestPage = (c) => { const r = REQ[c.lang]; return shell(c, {
  title: r.title, noindex: true,
  body: `    <h1 style="font-size:2rem">${esc(r.h1)}</h1>
    <p class="lead">${esc(r.lead)}</p>
    <form id="rq" class="panel" autocomplete="on" novalidate>
      <p style="margin:0 0 6px"><label for="n"><strong>${esc(r.name)}</strong></label></p>
      <input id="n" type="text" maxlength="80" autocomplete="name" required>
      <p style="margin:16px 0 6px"><label for="l"><strong>${esc(r.li)}</strong></label></p>
      <input id="l" type="text" inputmode="url" maxlength="200" placeholder="${esc(r.liPh)}" required>
      <p style="margin:16px 0 6px"><label for="m"><strong>${esc(r.msg)}</strong></label></p>
      <textarea id="m" rows="5" maxlength="1000" placeholder="${esc(r.msgPh)}" required></textarea>
      <div style="position:absolute;left:-9999px" aria-hidden="true"><label>Website <input id="hp" type="text" tabindex="-1" autocomplete="off"></label></div>
      <p class="note" id="err" role="alert" hidden></p>
      <p style="margin-top:18px"><button class="btn" type="submit" id="go">${esc(r.send)}</button></p>
      <p class="note">${r.note}</p>
    </form>
    <div id="ok" class="panel" hidden><h2>${esc(r.thanksH)}</h2><p>${esc(r.thanks)}</p></div>`,
  script: `  <script>
    const CFG = ${JSON.stringify({ lang: c.lang, errName: r.errName, errLi: r.errLi, errMsg: r.errMsg, errSend: r.errSend, send: r.send, sending: r.sending })};
    addEventListener('DOMContentLoaded', () => {
      const f = document.getElementById('rq'), err = document.getElementById('err'), go = document.getElementById('go'), t0 = Date.now();
      const show = (m) => { err.hidden = false; err.textContent = m; };
      f.addEventListener('submit', async (e) => {
        e.preventDefault(); err.hidden = true;
        const name = f.n.value.trim(), li = f.l.value.trim(), msg = f.m.value.trim();
        if (name.length < 2) return show(CFG.errName);
        if (!/linkedin\\.com\\/\\S{2,}/i.test(li)) return show(CFG.errLi);
        if (msg.length < 10) return show(CFG.errMsg);
        go.disabled = true; go.textContent = CFG.sending;
        let ok = false;
        try {
          const r = await fetch('/api/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, li, msg, hp: f.hp.value, ms: Date.now() - t0, l: CFG.lang, t: window.__touch || {} }) });
          ok = r.ok && (await r.json()).ok === true;
        } catch (x) { ok = false; }
        if (ok) { f.hidden = true; document.getElementById('ok').hidden = false; if (window.__send) window.__send('request_sent'); scrollTo(0, 0); }
        else { go.disabled = false; go.textContent = CFG.send; show(CFG.errSend); }
      });
    });
  </script>`,
}); };

for (const k of ['en', 'uk']) {
  const c = L[k];
  for (const [dir, html] of [['pay', payPage(c)], ['book', bookPage(c)], ['done', donePage(c)], ['privacy', privacyPage(c)], ['terms', termsPage(c)], ['request', requestPage(c)]]) {
    const d = join(ROOT, 'public', c.pre.replace(/^\//, ''), dir);
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, 'index.html'), html);
  }
}
console.log('flow: en + uk written');
