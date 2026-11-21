// Makes the 1200x630 social preview cards (public/assets/og/*.png) with headless Chrome.
// One card per page: titles and descriptions are read from the built HTML, so run it after `npm run build`.
//   npm run build && npm run og
// Commit the PNGs; re-run only when titles or descriptions change.
import http from 'node:http';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ogPath } from './config.mjs';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) throw new Error('Google Chrome not found at ' + CHROME);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const meta = (html, prop) => { const m = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`)); return m ? unesc(m[1]) : ''; };
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

// Hand-written cards for the main pages; blog posts use their own title and description.
const FIXED = {
  '/': { kicker: 'Mykola Kalakutskyi', title: 'I help where your AI fails', sub: 'IT project and delivery manager, consultant, mentor. 400+ sessions. Free intro call.' },
  '/uk/': { kicker: 'Микола Калакуцький', title: 'Я вирішую ті проблеми, які ШІ не може', sub: 'IT project і delivery менеджер, консультант, ментор. 400+ сесій. Безкоштовне знайомство.' },
  '/cv/': { kicker: 'CV · open to EU-remote roles', title: 'Mykola Kalakutskyi', sub: 'Project, Delivery & Program Manager. 12+ years in IT, 18 teams built from scratch.' },
  '/uk/cv/': { kicker: 'Резюме', title: 'Микола Калакуцький', sub: 'Project, Delivery & Program Manager. 12+ років в IT, 18 команд з нуля.' },
  '/challenge/': { kicker: 'Challenge AI · free quiz', title: 'Can AI solve your problem?', sub: 'Six questions, about 90 seconds. Use AI, or call a human.' },
  '/pm-interview-prep/': { kicker: 'PM interview prep', title: 'Find the weak spots before the interviewer does', sub: 'Mock interview, CV and story review, written next steps. One hour, EUR 50.' },
  '/uk/pm-interview-prep/': { kicker: 'Підготовка до співбесіди на PM', title: 'Знайдіть слабкі місця раніше, ніж інтерв\'юер', sub: 'Пробна співбесіда, розбір резюме й історії, письмові наступні кроки. Година, EUR 50.' },
  '/examples/': { kicker: 'Examples of feedback', title: 'Real feedback, in full', sub: 'Feedback after mock interviews and consultations, plus advice messages. Anonymised.' },
  '/uk/examples/': { kicker: 'Приклади відгуків', title: 'Реальні відгуки, повністю', sub: 'Відгуки після співбесід і консультацій та поради в чаті. Знеособлені.' },
  '/tools/': { kicker: 'Tools', title: 'Tools I built for my own work', sub: 'Job Search Engine and Challenge AI. Free to try.' },
  '/uk/tools/': { kicker: 'Інструменти', title: 'Інструменти для власної роботи', sub: 'Job Search Engine і Challenge AI. Безкоштовно спробувати.' },
  '/tools/job-search-engine/': { kicker: 'Job Search Engine (JSE)', title: 'A job search run like a delivery project', sub: 'Daily collection, ad screening, a CV method with an ATS gate and a tracker. Live demo.' },
  '/uk/tools/job-search-engine/': { kicker: 'Job Search Engine (JSE)', title: 'Пошук роботи як проєкт доставки', sub: 'Щоденний збір, перевірка оголошень, метод резюме з ATS-бар\'єром і трекер. Живе демо.' },
  '/tools/job-search-engine/setup/': { kicker: 'JSE setup guide', title: 'From zero to your first screened job', sub: 'Fact Bank, Master CV, preferences, first run. Interactive screens and diagrams.' },
  '/uk/tools/job-search-engine/setup/': { kicker: 'Посібник JSE', title: 'Від нуля до першої перевіреної вакансії', sub: 'Fact Bank, базове резюме, вподобання, перший запуск. Інтерактивні екрани та схеми.' },
  '/tools/job-search-engine/tracker/': { kicker: 'JSE tracker', title: 'Your job tracker, in your browser', sub: 'Load your engine results, copy jobs to your AI assistant. Data stays with you.' },
  '/uk/tools/job-search-engine/tracker/': { kicker: 'Трекер JSE', title: 'Ваш трекер вакансій у браузері', sub: 'Завантажте результати рушія, копіюйте вакансії в ШІ-асистента. Дані лишаються у вас.' },
  '/tools/job-search-engine/demo/': { kicker: 'JSE demo', title: 'Try the job tracker', sub: 'Invented data. Your changes stay in your browser.' },
  '/uk/tools/job-search-engine/demo/': { kicker: 'Демо JSE', title: 'Спробуйте трекер вакансій', sub: 'Вигадані дані. Ваші зміни лишаються у вашому браузері.' },
  '/uk/challenge/': { kicker: 'Challenge AI · безкоштовний тест', title: 'Чи впорається ШІ з вашою проблемою?', sub: 'Шість запитань, близько 90 секунд. Скористатися ШІ чи звернутися до людини.' },
};

async function pages() {
  const list = [['/', 'index.html'], ['/uk/', 'uk/index.html'], ['/cv/', 'cv/index.html'], ['/uk/cv/', 'uk/cv/index.html'], ['/challenge/', 'challenge/index.html'], ['/uk/challenge/', 'uk/challenge/index.html'], ['/examples/', 'examples/index.html'], ['/uk/examples/', 'uk/examples/index.html'], ['/pm-interview-prep/', 'pm-interview-prep/index.html'], ['/uk/pm-interview-prep/', 'uk/pm-interview-prep/index.html'], ['/blog/', 'blog/index.html'], ['/uk/blog/', 'uk/blog/index.html'], ['/tools/', 'tools/index.html'], ['/uk/tools/', 'uk/tools/index.html'], ['/tools/job-search-engine/', 'tools/job-search-engine/index.html'], ['/uk/tools/job-search-engine/', 'uk/tools/job-search-engine/index.html'], ['/tools/job-search-engine/setup/', 'tools/job-search-engine/setup/index.html'], ['/uk/tools/job-search-engine/setup/', 'uk/tools/job-search-engine/setup/index.html'], ['/tools/job-search-engine/tracker/', 'tools/job-search-engine/tracker/index.html'], ['/uk/tools/job-search-engine/tracker/', 'uk/tools/job-search-engine/tracker/index.html'], ['/tools/job-search-engine/demo/', 'tools/job-search-engine/demo/index.html'], ['/uk/tools/job-search-engine/demo/', 'uk/tools/job-search-engine/demo/index.html']];
  for (const base of ['blog', 'uk/blog']) {
    for (const d of await readdir(join(PUB, base), { withFileTypes: true })) {
      if (d.isDirectory() && existsSync(join(PUB, base, d.name, 'index.html'))) list.push([`/${base}/${d.name}/`, `${base}/${d.name}/index.html`]);
    }
  }
  const out = [];
  for (const [path, file] of list) {
    const html = await readFile(join(PUB, file), 'utf8');
    const uk = path.startsWith('/uk/');
    let card = FIXED[path];
    if (!card) {
      const title = meta(html, 'og:title').replace(/\s+[–-]\s+(Mykola Kalakutskyi|Микола Калакуцький)\s*$/, '');
      card = { kicker: (uk ? 'Блог · ' : 'Blog · ') + (uk ? 'Микола Калакуцький' : 'Mykola Kalakutskyi'), title: clip(title, 90), sub: clip(meta(html, 'og:description'), 150) };
    }
    out.push({ path, card });
  }
  return out;
}

const cardHtml = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#fafaf7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#1c2421;position:relative;overflow:hidden}
.glow{position:absolute;right:-120px;top:-140px;width:640px;height:640px;border-radius:50%;background:radial-gradient(circle,#cfe0d8 0%,rgba(207,224,216,0) 70%)}
.glow2{position:absolute;left:-160px;bottom:-220px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,#efe6d3 0%,rgba(239,230,211,0) 70%)}
.bar{position:absolute;left:72px;top:72px;width:72px;height:6px;border-radius:6px;background:linear-gradient(90deg,#3d6b5a,#c9a96b)}
.txt{position:absolute;left:72px;top:112px;width:700px}
.k{font-size:26px;letter-spacing:.04em;text-transform:uppercase;color:#3d6b5a;font-weight:700}
h1{font-size:${c.title.length > 48 ? 54 : 66}px;line-height:1.08;margin-top:22px;letter-spacing:-.02em}
p{font-size:29px;line-height:1.35;color:#55605b;margin-top:24px}
.ph{position:absolute;right:78px;top:150px;width:300px;height:300px;border-radius:50%;border:8px solid #fff;box-shadow:0 10px 40px rgba(40,60,50,.18);background:url(/assets/mykola.jpg) center/cover}
.u{position:absolute;left:72px;bottom:52px;font-size:25px;color:#7b857f}
</style></head><body><div class="glow"></div><div class="glow2"></div><div class="bar"></div>
<div class="txt"><div class="k">${esc(c.kicker)}</div><h1>${esc(c.title)}</h1><p>${esc(c.sub)}</p></div>
<div class="ph"></div><div class="u">mykola.pages.dev</div></body></html>`;

const cards = await pages();
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__card') { res.writeHead(200, { 'content-type': TYPES['.html'] }); return res.end(cardHtml(JSON.parse(u.searchParams.get('c')))); }
  try { const buf = await readFile(join(PUB, decodeURIComponent(u.pathname))); res.writeHead(200, { 'content-type': TYPES[extname(u.pathname)] || 'application/octet-stream' }); res.end(buf); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
await mkdir(join(PUB, 'assets', 'og'), { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'og-'));
for (const { path, card } of cards) {
  const file = join(PUB, ogPath(path));
  await run(CHROME, ['--headless=new', '--disable-gpu', `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', '--window-size=1200,630', '--force-device-scale-factor=1', '--virtual-time-budget=3000', `--screenshot=${file}`, `http://127.0.0.1:${port}/__card?c=${encodeURIComponent(JSON.stringify(card))}`], { timeout: 60000 });
  console.log('og:', ogPath(path));
}
server.close();
