// Real, anonymised written feedback (full text), loaded from content/examples.
//   content/examples/uk/<slug>.md   Ukrainian original (every example has one)
//   content/examples/en/<slug>.md   optional English translation (shown on the English page when present, labelled "translated from Ukrainian")
// Front matter: slug, kind, title, order, summary (one line, used on cards of the advice kinds). Body: Markdown.
// kind: consultation | interview (paid written feedback)  and  problem | review | career (advice messages written to mentees in chat).
// To add an example: drop a new .md file here (uk, and en if translated) and run `npm run build`. Anonymise it first (no names, sectors, years, figures).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'content', 'examples');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Display order of the groups on the page. consultation and interview are paid written feedback; problem, review, career are advice messages.
export const KINDS = ['consultation', 'problem', 'interview', 'review', 'career'];
export const ADVICE = ['problem', 'review', 'career'];

function parse(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split('\n')) { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1'); }
  for (const k of ['slug', 'kind', 'title', 'order']) if (!meta[k]) throw new Error(`${file}: front matter needs "${k}"`);
  if (!KINDS.includes(meta.kind)) throw new Error(`${file}: kind must be one of ${KINDS.join(', ')}`);
  if (ADVICE.includes(meta.kind) && !meta.summary) throw new Error(`${file}: advice examples need a summary line`);
  const md = m[2].trim();
  const heads = [...md.matchAll(/^### \d+\.\s*(.+)$/gm)].map((x) => x[1].trim());
  const areas = [...md.matchAll(/^- \*\*(.+?)\*\*/gm)].map((x) => x[1].trim());
  return { ...meta, order: Number(meta.order), md, html: marked.parse(md, { gfm: true, breaks: true }), points: meta.kind === 'consultation' ? areas : meta.kind === 'interview' ? heads : [] };
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
    lead: 'Read how deep I go into a situation and how I fit my advice to the person\'s circumstances, limits and experience. Most examples are full written feedback from real sessions. Some are advice messages I wrote to mentees in chat. Every example is labelled.',
    note: 'Anonymised and shared with permission.',
    langNote: 'Sessions and feedback are in English or Ukrainian, as you choose. These texts were written in Ukrainian, and the English versions are translated from Ukrainian.',
    kind: {
      consultation: 'After a consultation', problem: 'Advice message: a project problem', interview: 'After a mock interview',
      review: 'Advice message: a resume, site or post review', career: 'Advice message: career and job search',
    },
    groupLead: {
      consultation: 'A written summary after a paid consultation.',
      interview: 'Written point-by-point feedback after a paid mock interview.',
      advice: 'Messages I wrote to mentees in chat. They are not paid written feedback and not the format of a paid deliverable. They show how I think about a situation.',
    },
    tile: { consultation: 'Written summary after a paid consultation', problem: 'How I handle a real project problem', interview: 'Point-by-point feedback after a paid mock interview', review: 'How I review a resume, a site or a text', career: 'Job search and career questions' },
    count: (n) => `${n} ${n === 1 ? 'text' : 'texts'}`,
    ptsInterview: (n) => `${n} points`, ptsConsult: (n) => `${n} areas`,
    read: 'Read in full', all: (n) => `All ${n} examples`, origUk: 'Ukrainian original', translated: 'Translated from Ukrainian',
    blockH: 'Real examples of my feedback', blockLead: 'Full written feedback from real sessions and advice messages to mentees, all anonymised and shared with permission. See how deep I go and how I tie recommendations to the person\'s situation, limits and experience.',
    cta: 'Request a consultation', directQ: 'Want to talk first?', directLink: 'Book a free 20-minute intro call',
    index: 'Pick by your situation', crumb: 'Examples',
    howH: 'How my feedback is built',
    how: [
      'Every point has an assessment and a concrete next step.',
      'I name the strong sides and the weak spots in the same message.',
      'I explain why, often with a small example or a short dialogue.',
      'I show how to say or write it better: "not this, but this".',
      'I fit the advice to your situation. There is no universal solution.',
      'I finish with support and an offer to help.',
    ],
  },
  uk: {
    h1: 'Реальні приклади моїх відгуків',
    lead: 'Подивіться, наскільки глибоко я занурююсь у ситуацію і як підлаштовую поради під обставини, обмеження та досвід людини. Більшість прикладів це повні письмові відгуки після реальних сесій. Частина це поради, які я писав менті в чаті. Кожен приклад підписано.',
    note: 'Знеособлені, опубліковані за згодою.',
    langNote: 'Сесії та відгуки проходять англійською або українською, на ваш вибір.',
    kind: {
      consultation: 'Після консультації', problem: 'Порада в чаті: проєктна ситуація', interview: 'Після пробної співбесіди',
      review: 'Порада в чаті: розбір резюме, сайту чи тексту', career: 'Порада в чаті: кар\'єра і пошук роботи',
    },
    groupLead: {
      consultation: 'Письмовий підсумок після платної консультації.',
      interview: 'Письмовий відгук за пунктами після платної пробної співбесіди.',
      advice: 'Повідомлення, які я писав менті в чаті. Це не платний письмовий відгук і не формат платного результату. Вони показують, як я думаю про ситуацію.',
    },
    tile: { consultation: 'Письмовий підсумок після платної консультації', problem: 'Як я розбираю реальну проєктну ситуацію', interview: 'Відгук за пунктами після платної пробної співбесіди', review: 'Як я розбираю резюме, сайт чи текст', career: 'Пошук роботи і питання кар\'єри' },
    count: (n) => `текстів: ${n}`,
    ptsInterview: (n) => `${n} пунктів`, ptsConsult: (n) => `${n} напрямків`,
    read: 'Читати повністю', all: (n) => `Усі приклади (${n})`, origUk: 'Оригінал українською', translated: 'Translated from Ukrainian',
    blockH: 'Реальні приклади моїх відгуків', blockLead: 'Повні письмові відгуки після реальних сесій і поради менті в чаті, знеособлені, опубліковані за згодою. Подивіться, наскільки глибоко я занурююсь і як прив\'язую рекомендації до ситуації, обмежень та досвіду людини.',
    cta: 'Запросити консультацію', directQ: 'Хочете спершу поговорити?', directLink: 'Записатися на безкоштовне знайомство на 20 хвилин',
    index: 'Оберіть за вашою ситуацією', crumb: 'Приклади',
    howH: 'Як побудований мій відгук',
    how: [
      'У кожному пункті є оцінка і конкретний наступний крок.',
      'Сильні сторони і слабкі місця я називаю в одному повідомленні.',
      'Я пояснюю "чому", часто з невеликим прикладом або коротким діалогом.',
      'Я показую, як сказати чи написати краще: "не так, а ось так".',
      'Я підлаштовую пораду під вашу ситуацію. Універсального рішення не існує.',
      'Я завершую підтримкою і пропозицією допомогти.',
    ],
  },
};

export const pathFor = (k) => (k === 'uk' ? '/uk/examples/' : '/examples/');

export function pointsLabel(k, e) {
  const u = UI[k], v = e[k] || e.uk;
  if (ADVICE.includes(e.kind)) return v.summary || e.uk.summary;
  const n = v.points.length;
  return `${e.kind === 'consultation' ? u.ptsConsult(n) : u.ptsInterview(n)}: ${v.points.slice(0, 4).join(', ')}${n > 4 ? '…' : ''}`;
}

// Cards for the landing page and the interview prep page.
//   kinds: kinds to show, in order.  caps: max cards per kind (default 1 per kind when several kinds, else limit).  limit: max cards in total.
export function cardsHtml(k, { kinds = ['consultation', 'interview'], limit = 4, caps = {} } = {}) {
  const u = UI[k], list = loadExamples();
  const picked = [];
  for (const kind of kinds) {
    const cap = caps[kind] ?? (kinds.length > 1 ? 1 : limit);
    let c = 0;
    for (const e of list.filter((x) => x.kind === kind)) { if (c >= cap || picked.length >= limit) break; picked.push(e); c++; }
  }
  const cards = picked.map((e) => `<a class="card" href="${pathFor(k)}#${e.slug}" data-ev="cta_click"><span class="note">${esc(u.kind[e.kind])}</span><strong>${esc((e[k] || e.uk).title)}</strong><span>${esc(pointsLabel(k, e))}</span><span class="note" style="display:block;margin-top:6px">${esc(u.read)} →</span></a>`).join('\n        ');
  return `<div class="cards">
        ${cards}
      </div>
      <p class="note"><a href="${pathFor(k)}" data-ev="cta_click">${esc(u.all(list.length))} →</a> · ${esc(u.note)}</p>`;
}
