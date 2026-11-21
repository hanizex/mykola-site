// POST /api/notify - relay for operator alerts of the JSE hosted service (the Worker "jse-hosted" and its GitHub crawler).
// It forwards a short text to the owner's Telegram bot, using the same bot secrets as the request form.
// Protected by a shared secret (NOTIFY_TOKEN, set on both sides). Not linked from anywhere; /api/ is disallowed in robots.txt.
const enc = new TextEncoder();
async function same(a, b) {
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const p = new Uint8Array(x), q = new Uint8Array(y);
  let d = 0;
  for (let i = 0; i < p.length; i++) d |= p[i] ^ q[i];
  return d === 0;
}
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export async function onRequestPost({ request, env }) {
  const auth = request.headers.get('authorization') || '';
  if (!env.NOTIFY_TOKEN || !(await same(auth, 'Bearer ' + env.NOTIFY_TOKEN))) return new Response('unauthorized', { status: 401 });
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return new Response('unavailable', { status: 503 });
  let body;
  try { body = await request.json(); } catch (e) { return new Response('bad request', { status: 400 }); }
  const text = String((body && body.text) || '').slice(0, 900);
  if (!text) return new Response('bad request', { status: 400 });
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: esc(text), parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  return new Response(null, { status: res.ok ? 204 : 502 });
}
export async function onRequest({ request }) {
  return new Response('method not allowed', { status: 405, headers: { Allow: 'POST' } });
}
