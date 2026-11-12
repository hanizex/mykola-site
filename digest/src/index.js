// Weekly Telegram digest for mykola.pages.dev. Separate free cron Worker (Pages cannot run schedules).
// Send-only: one sendMessage to the owner's chat. No webhook, no getUpdates, so it never disturbs the bot's other jobs.
//
// Schedule: Saturday 09:00 Sofia time. Cron runs in UTC and Sofia switches between UTC+2 and UTC+3,
// so two triggers (06:00 and 07:00 UTC) are registered and the code sends only when it is 09:xx in Sofia.
//
// Manual test:  npx wrangler dev --test-scheduled   then   curl "http://localhost:8787/__scheduled?cron=manual"
// (add --var DRY_RUN:1 to print the message instead of sending it)

const DAY = 86400;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const dayStr = (ms) => new Date(ms).toISOString().slice(0, 10);

async function one(db, sql, ...binds) {
  const r = await db.prepare(sql).bind(...binds).first();
  return r ? Object.values(r)[0] || 0 : 0;
}

export async function buildReport(db, nowMs) {
  const today = dayStr(nowMs), from = dayStr(nowMs - 7 * DAY * 1000), last = dayStr(nowMs - DAY * 1000);
  const t0 = Math.floor(Date.parse(from + 'T00:00:00Z') / 1000), t1 = Math.floor(Date.parse(today + 'T00:00:00Z') / 1000);

  // "visits" = sum over days of distinct daily visitor hashes (the hash rotates daily, so this is visits, not people)
  const bySrc = await db.prepare(
    `SELECT src_type, SUM(c) n FROM (SELECT day, src_type, COUNT(DISTINCT vid) c FROM events WHERE name='page_view' AND day>=? AND day<? GROUP BY day, src_type) GROUP BY src_type ORDER BY n DESC`
  ).bind(from, today).all();
  const visits = (bySrc.results || []).reduce((a, r) => a + r.n, 0);

  const daily = async (where, ...b) => one(db, `SELECT COALESCE(SUM(c),0) FROM (SELECT day, COUNT(DISTINCT vid) c FROM events WHERE ${where} AND day>=? AND day<? GROUP BY day)`, ...b, from, today);
  const intro = await daily("name='intro_click'");
  const reqSent = await daily("name='request_sent'");
  const chStart = await daily("name='challenge_start'");
  const chDone = await daily("name='challenge_done'");
  const cta = await daily("name='cta_click'");
  const payPage = await daily("name='page_view' AND path IN ('/pay/','/uk/pay/')");
  const bookOpen = await daily("name='book_open'");
  const started = await one(db, 'SELECT COUNT(*) FROM orders WHERE created_ts>=? AND created_ts<?', t0, t1);
  const paid = await one(db, 'SELECT COUNT(*) FROM orders WHERE paid_claimed_ts>=? AND paid_claimed_ts<?', t0, t1);
  const booked = await one(db, 'SELECT COUNT(*) FROM orders WHERE booked_ts>=? AND booked_ts<?', t0, t1);
  const confirmed = await one(db, 'SELECT COUNT(*) FROM orders WHERE confirmed_ts>=? AND confirmed_ts<?', t0, t1);

  const top = await db.prepare(
    `SELECT path, SUM(c) n FROM (SELECT day, path, COUNT(DISTINCT vid) c FROM events WHERE name='page_view' AND day>=? AND day<? AND path NOT LIKE '/api/%' GROUP BY day, path) GROUP BY path ORDER BY n DESC LIMIT 6`
  ).bind(from, today).all();

  const src = (bySrc.results || []).map((r) => `${r.src_type} ${r.n}`).join(' · ') || 'no data';
  const pages = (top.results || []).map((r, i) => `${i + 1}. <code>${esc(r.path)}</code> – ${r.n}`).join('\n') || 'no page views yet';
  return [
    `📊 <b>Weekly digest</b> · ${from} – ${last}`,
    '',
    `<b>Visits</b> (daily unique): ${visits}`,
    `<i>By source:</i> ${esc(src)}`,
    '',
    '<b>Funnel</b>',
    `Free intro button clicks: ${intro}`,
    `Consultation request button clicks: ${cta}`,
    `Consultation requests sent: ${reqSent}`,
    `Challenge AI: started ${chStart}, finished ${chDone}`,
    `Pay page opened: ${payPage}`,
    `Orders started: ${started}`,
    `Payments claimed: ${paid}`,
    `Calendar opened: ${bookOpen}`,
    `Booked: ${booked}`,
    `Confirmed by you: ${confirmed}`,
    '',
    '<b>Top pages</b>',
    pages,
  ].join('\n');
}

async function run(env, event) {
  const manual = event.cron === 'manual';
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Sofia', hour: '2-digit', hourCycle: 'h23' }).format(new Date(event.scheduledTime)));
  if (!manual && hour !== 9) return; // the other DST trigger: skip

  const text = await buildReport(env.DB, event.scheduledTime || Date.now());
  if (env.DRY_RUN) { console.log(text); return; }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) { console.log('digest: Telegram secrets missing, not sent'); return; }
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  console.log('digest: telegram status', res.status); // never log the token or the response body
}

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(run(env, event)); },
  async fetch() { return new Response('Not found', { status: 404 }); },
};
