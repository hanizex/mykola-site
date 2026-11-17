// POST /api/request — consultation request form (name, LinkedIn link, a few words about the problem).
// Nothing is stored in a database: the request goes to the owner as a Telegram message, and the
// visitor only sees "sent" when Telegram accepted it, so a request is never silently lost.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'bad_request' }, 400); }

  // Bots: a filled hidden field or a form submitted within 2.5 s gets a fake "ok" and nothing is sent.
  if (clip(b.hp, 50) || !(Number(b.ms) >= 2500)) return json({ ok: true });

  const name = clip(b.name, 80).replace(/\s+/g, ' ');
  let li = clip(b.li, 200);
  let contact = clip(b.contact, 120).replace(/\s+/g, '');
  const msg = clip(b.msg, 1000);
  if (li && !/^https?:\/\//i.test(li)) li = 'https://' + li;
  // Contact: an email or a Telegram @username / t.me link. LinkedIn: optional when a contact is given.
  const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
  const tg = contact.match(/^(?:@|(?:https?:\/\/)?t\.me\/)([A-Za-z0-9_]{4,32})$/i);
  if (tg) contact = '@' + tg[1];
  const contactOk = isMail || !!tg;
  const liOk = /^https?:\/\/([\w-]+\.)?linkedin\.com\/\S{2,}$/i.test(li);
  if (contact && !contactOk) return json({ error: 'invalid' }, 400);
  if (li && !liOk) return json({ error: 'invalid' }, 400);
  if (!contactOk && !liOk) return json({ error: 'invalid' }, 400);
  if (name.length < 2 || msg.length < 10) return json({ error: 'invalid' }, 400);
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json({ error: 'unavailable' }, 503);

  const lang = b.l === 'uk' ? 'UA' : 'EN';
  const t = b.t && typeof b.t === 'object' ? b.t : {};
  const src = [clip(t.r, 60), clip(t.s, 40)].filter(Boolean).join(' / ') || 'direct';
  const lines = [`📝 <b>Consultation request</b> (${lang})`, `Name: ${esc(name)}`];
  if (contact) lines.push(`Contact: ${esc(contact)}${tg ? ` (https://t.me/${tg[1]})` : ''}`);
  if (li) lines.push(`LinkedIn: ${esc(li)}`);
  const text = `${lines.join('\n')}\n\n${esc(msg)}\n\n<i>Source: ${esc(src)}. Reply within 1-2 working days: payment link + time slots (or a question / the free intro call).</i>`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) return json({ error: 'unavailable' }, 502);
  } catch (e) { return json({ error: 'unavailable' }, 502); }
  return json({ ok: true });
}
