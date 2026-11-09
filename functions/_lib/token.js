// Helper only (exports no route handlers). Owner-link tokens: HMAC-SHA256(ADMIN_SECRET, "confirm:" + orderId).
// The token only ever travels inside the owner's private Telegram chat and in the URL #fragment
// (the fragment is never sent to any server, so it stays out of logs and Referer headers).

const enc = new TextEncoder();

export async function makeToken(env, id) {
  if (!env.ADMIN_SECRET) return '';
  const key = await crypto.subtle.importKey('raw', enc.encode(env.ADMIN_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode('confirm:' + id)));
  return [...sig].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

export async function checkToken(env, id, k) {
  const want = await makeToken(env, id);
  if (!want || typeof k !== 'string' || k.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ k.charCodeAt(i);
  return diff === 0;
}

export async function ownerLink(env, origin, id) {
  const k = await makeToken(env, id);
  return k ? `${origin}/admin/#o=${id}&k=${k}` : '';
}
