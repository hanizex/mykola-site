// POST /api/admin — owner only. {a:'get'|'confirm', id, k}. Needs the HMAC token from the Telegram alert.
// POST (not GET) so link previews / crawlers can never confirm anything by merely fetching a URL.

import { checkToken } from '../_lib/token.js';

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const view = (r) => ({ id: r.id.slice(0, 8), method: r.method, tx_id: r.tx_id, paid_claimed_ts: r.paid_claimed_ts, booked_ts: r.booked_ts, confirmed_ts: r.confirmed_ts, src_type: r.src_type });

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'bad_request' }, 400); }
  const id = typeof b.id === 'string' ? b.id : '';
  if (!/^[0-9a-f]{24}$/.test(id) || !(await checkToken(env, id, b.k))) return json({ error: 'forbidden' }, 403);
  if (!env.DB) return json({ error: 'no_db' }, 503);

  const now = Date.now();
  if (b.a === 'confirm') {
    await env.DB.prepare('UPDATE orders SET confirmed_ts = COALESCE(confirmed_ts, ?) WHERE id = ?').bind(Math.floor(now / 1000), id).run();
    await env.DB.prepare('INSERT INTO events (ts, day, name, path, order_id) VALUES (?,?,?,?,?)')
      .bind(Math.floor(now / 1000), new Date(now).toISOString().slice(0, 10), 'confirmed', '/api/admin', id).run().catch(() => {});
  } else if (b.a !== 'get') {
    return json({ error: 'unknown_action' }, 400);
  }
  const row = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  return row ? json({ order: view(row) }) : json({ error: 'not_found' }, 404);
}
