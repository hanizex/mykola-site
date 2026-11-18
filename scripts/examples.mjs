// Real, anonymised written feedback (full text), loaded from content/examples.
//   content/examples/uk/<slug>.md   Ukrainian original (every example has one)
//   content/examples/en/<slug>.md   optional English translation (shown on the English page when present)
// Front matter: slug, kind (interview | consultation), title, order. Body: Markdown.
// To add an example: drop a new .md file here and run `npm run build`. Anonymise it first (no names, sectors, years, figures).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'content', 'examples');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function parse(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split('\n')) { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  for (const k of ['slug', 'kind', 'title', 'order']) if (!meta[k]) throw new Error(`${file}: front matter needs "${k}"`);
  if (!['interview', 'consultation'].includes(meta.kind)) throw new Error(`${file}: kind must be interview or consultation`);
  const md = m[2].trim();
  const heads = [...md.matchAll(/^### \d+\.\s*(.+)$/gm)].map((x) => x[1].trim());
  const areas = [...md.matchAll(/^- \*\*(.+?)\*\*/gm)].map((x) => x[1].trim());
  return { ...meta, order: Number(meta.order), md, html: marked.parse(md, { gfm: true, breaks: true }), points: meta.kind === 'consultation' ? areas : heads };
}

export function loadExamples() {
  const uk = join(DIR, 'uk');
  if (!existsSync(uk)) return [];
  const out = readdirSync(uk).filter((f) => f.endsWith('.md')).map((f) => {
    const u = parse(join(uk, f));
    const enFile = join(DIR, 'en', f);
    return { slug: u.slug, kind: u.kind, order: u.order, uk: u, en: existsSync(enFile) ? parse(enFile) : null };
  });
  const seen = new Set();
  for (const e of out) { if (seen.has(e.slug)) throw new Error(`examples: duplicate slug ${e.slug}`); seen.add(e.slug); }
  return out.sort((a, b) => a.order - b.order);
}

export const UI = {
  en: {
    h1: 'Real examples of my feedback',
    lead: 'These are full written feedbacks from real sessions, not samples or templates. Read how deep I go into a situation and how I fit recommendations to the person\'s circumstances, limits and experience.',
    note: 'Anonymised and shared with the clients\' permission.',
    langNote: 'The sessions and the feedback are in English or Ukrainian, as you choose. Most of these examples are in Ukrainian, the language they were given in.',
    kind: { interview: 'After a mock interview', consultation: 'After a consultation' },
    ptsInterview: (n) => `${n} points`, ptsConsult: (n) => `${n} areas`,
    read: 'Read in full', all: (n) => `All ${n} examples`, origUk: 'Ukrainian original',
    blockH: 'Real examples of my feedback', blockLead: 'Full written feedback from real sessions, anonymised and shared with the clients\' permission. See how deep I go and how I tie recommendations to the person\'s situation, limits and experience.',
    cta: 'Request a consultation', directQ: 'Want to talk first?', directLink: 'Book a free 20-minute intro call',
    index: 'In this page', crumb: 'Examples',
  },
  uk: {
    h1: 'Реальні приклади моїх відгуків',
    lead: 'Це повні письмові відгуки після реальних сесій, а не зразки чи шаблони. Подивіться, наскільки глибоко я занурююсь у ситуацію і як підлаштовую рекомендації під обставини, обмеження та досвід людини.',
    note: 'Знеособлені, опубліковані за згодою клієнтів.',
    langNote: 'Сесії та відгуки проходять англійською або українською, на ваш вибір.',
    kind: { interview: 'Після пробної співбесіди', consultation: 'Після консультації' },
    ptsInterview: (n) => `${n} пунктів`, ptsConsult: (n) => `${n} напрямків`,
    read: 'Читати повністю', all: (n) => `Усі приклади (${n})`, origUk: 'Оригінал українською',
    blockH: 'Реальні приклади моїх відгуків', blockLead: 'Повні письмові відгуки після реальних сесій, знеособлені, опубліковані за згодою клієнтів. Подивіться, наскільки глибоко я занурююсь і як прив\'язую рекомендації до ситуації, обмежень та досвіду людини.',
    cta: 'Запросити консультацію', directQ: 'Хочете спершу поговорити?', directLink: 'Записатися на безкоштовне знайомство на 20 хвилин',
    index: 'На цій сторінці', crumb: 'Приклади',
  },
};

export const pathFor = (k) => (k === 'uk' ? '/uk/examples/' : '/examples/');

export function pointsLabel(k, e) {
  const u = UI[k], v = e[k] || e.uk;
  const n = v.points.length;
  return `${e.kind === 'consultation' ? u.ptsConsult(n) : u.ptsInterview(n)}: ${v.points.slice(0, 4).join(', ')}${n > 4 ? '…' : ''}`;
}

// Cards for the landing page and the interview prep page. kinds: array of kinds to show; limit: max cards.
export function cardsHtml(k, { kinds = ['consultation', 'interview'], limit = 4 } = {}) {
  const u = UI[k], list = loadExamples();
  const picked = [];
  for (const kind of kinds) {
    const cap = kinds.length > 1 && kind === 'consultation' ? 1 : limit;
    let c = 0;
    for (const e of list.filter((x) => x.kind === kind)) { if (c >= cap || picked.length >= limit) break; picked.push(e); c++; }
  }
  const cards = picked.map((e) => `<a class="card" href="${pathFor(k)}#${e.slug}" data-ev="cta_click"><span class="note">${esc(u.kind[e.kind])}</span><strong>${esc((e[k] || e.uk).title)}</strong><span>${esc(pointsLabel(k, e))}</span><span class="note" style="display:block;margin-top:6px">${esc(u.read)} →</span></a>`).join('\n        ');
  return `<div class="cards">
        ${cards}
      </div>
      <p class="note"><a href="${pathFor(k)}" data-ev="cta_click">${esc(u.all(list.length))} →</a> · ${esc(u.note)}</p>`;
}
