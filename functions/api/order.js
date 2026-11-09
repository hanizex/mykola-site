// POST /api/order — order steps: start -> paid (claimed by visitor) -> booked.
// The owner's confirmation step comes later (separate, protected endpoint).
// Lead capture must never depend on D1: the Telegram alert is sent first.

import { classify } from './event.js';
import { ownerLink } from '../_lib/token.js';

const METHODS = new Set(['mono', 'revolut']);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });

// Send-only (sendMessage + a URL button): no webhook, no getUpdates, so it never disturbs the bot's other jobs.
async function notify(env, html, link) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    const msg = { chat_id: env.TELEGRAM_CHAT_ID, text: html, parse_mode: 'HTML', disable_web_page_preview: true };
    if (link) msg.reply_markup = { inline_keyboard: [[{ text: 'Open order / confirm', url: link }]] };
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(msg),
    });
  } catch (e) { /* never expose the token or break the flow */ }
}

async function logEvent(env, name, id, now) {
  if (!env.DB) return;
  try {
    await env.DB.prepare('INSERT INTO events (ts, day, name, path, order_id) VALUES (?,?,?,?,?)')
      .bind(Math.floor(now / 1000), new Date(now).toISOString().slice(0, 10), name, '/api/order', id).run();
  } catch (e) { /* ignore */ }
}

export async function onRequestPost({ request, env }) {
  const origin = new URL(request.url).origin;
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'bad_request' }, 400); }
  const now = Date.now();

  if (b.a === 'start') {
    const id = [...crypto.getRandomValues(new Uint8Array(12))].map((x) => x.toString(16).padStart(2, '0')).join('');
    const t = b.t && typeof b.t === 'object' ? b.t : {};
    const src = clip(t.r, 100).toLowerCase();
    if (env.DB) {
      try {
        await env.DB.prepare('INSERT INTO orders (id, created_ts, src, src_type, utm_source, utm_medium, utm_campaign, landing_path) VALUES (?,?,?,?,?,?,?,?)')
          .bind(id, Math.floor(now / 1000), src, classify(src), clip(t.s, 60), clip(t.m, 60), clip(t.c, 60), clip(t.lp, 100)).run();
      } catch (e) { /* ignore */ }
    }
    await logEvent(env, 'order_start', id, now);
    return json({ id });
  }

  const id = clip(b.id, 40);
  if (!/^[0-9a-f]{24}$/.test(id)) return json({ error: 'bad_id' }, 400);

  if (b.a === 'paid') {
    const m = METHODS.has(b.m) ? b.m : '';
    const tx = clip(b.tx, 64);
    if (!m || !/^[\w\-:./ ]{4,64}$/.test(tx)) return json({ error: 'bad_payment' }, 400);
    await notify(env, `💶 <b>Payment claimed</b>\nOrder <code>${id.slice(0, 8)}</code>\nMethod: ${esc(m)}\nTransaction ID: <code>${esc(tx)}</code>\n<i>Check it against your statement.</i>`, await ownerLink(env, origin, id));
    if (env.DB) {
      try { await env.DB.prepare('UPDATE orders SET method=?, tx_id=?, paid_claimed_ts=? WHERE id=?').bind(m, tx, Math.floor(now / 1000), id).run(); } catch (e) { /* ignore */ }
    }
    await logEvent(env, 'paid_claimed', id, now);
    return json({ ok: true });
  }

  if (b.a === 'booked') {
    await notify(env, `📅 <b>Meeting booked</b>\nOrder <code>${id.slice(0, 8)}</code>\n<i>Confirm payment + send the invite.</i>`, await ownerLink(env, origin, id));
    if (env.DB) {
      try { await env.DB.prepare('UPDATE orders SET booked_ts=? WHERE id=?').bind(Math.floor(now / 1000), id).run(); } catch (e) { /* ignore */ }
    }
    await logEvent(env, 'booked', id, now);
    return json({ ok: true });
  }

  return json({ error: 'unknown_action' }, 400);
}
