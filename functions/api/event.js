// POST /api/event — cookieless first-party analytics.
// Stores one row per event. No raw IP is stored; `vid` is a daily-rotating hash.

const ALLOWED = new Set(['page_view', 'scroll_50', 'cta_click', 'repo_click', 'book_open', 'channel_click', 'project_click', 'cv_download', 'cv_contact', 'intro_click', 'request_sent', 'challenge_click', 'challenge_start', 'challenge_done']);
const AI = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai', 'you.com', 'phind.com'];
const SEARCH = ['google.', 'bing.com', 'duckduckgo.com', 'yahoo.', 'ecosia.org', 'search.brave.com', 'yandex.'];
const SOCIAL = ['t.me', 'telegram.org', 'linkedin.com', 'lnkd.in', 'facebook.com', 'x.com', 'twitter.com', 'instagram.com', 'youtube.com'];
const BOT_UA = /bot|crawl|spider|headless|preview|monitor|curl|wget/i;

export function classify(host) {
  if (!host) return 'direct';
  const h = host.toLowerCase();
  if (AI.some((d) => h === d || h.endsWith('.' + d))) return 'ai';
  if (SEARCH.some((d) => h.includes(d))) return 'search';
  if (SOCIAL.some((d) => h === d || h.endsWith('.' + d))) return 'social';
  return 'referral';
}

const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');

async function dailyHash(parts) {
  const data = new TextEncoder().encode(parts.join('|'));
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  const done = new Response(null, { status: 204 });
  try {
    const ua = request.headers.get('user-agent') || '';
    if (BOT_UA.test(ua) || !env.DB) return done;

    const b = await request.json();
    if (!ALLOWED.has(b.n)) return done;
    const path = clip(b.p, 100);
    if (!path.startsWith('/')) return done;

    const t = b.t && typeof b.t === 'object' ? b.t : {};
    const src = clip(t.r, 100).toLowerCase();
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const ip = request.headers.get('cf-connecting-ip') || '';
    const vid = await dailyHash([day, env.DAILY_SALT || 'dev-salt', ip, ua]);

    await env.DB.prepare(
      'INSERT INTO events (ts, day, name, path, vid, src, src_type, utm_source, utm_medium, utm_campaign, lang, cc, order_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).bind(
      Math.floor(now.getTime() / 1000), day, b.n, path, vid, src, classify(src),
      clip(t.s, 60), clip(t.m, 60), clip(t.c, 60), clip(b.l, 8),
      request.cf && request.cf.country ? request.cf.country : '', clip(b.o, 40)
    ).run();
  } catch (e) {
    // Analytics must never break the site.
  }
  return done;
}
