// Last build step for the Ukrainian pages: one set of key terms everywhere.
//   "Fact Bank" -> "Банк Фактів", "базове резюме" -> "Базове Резюме" (capitalised on purpose, and declined by case);
//   on the JSE pages "ШІ" -> "AI" ("ШІ-чат", "чат зі ШІ" -> "AI-чат").
// It edits the built HTML only (never <script>, <style> or <pre> blocks), so the sources keep their original strings.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UK = join(ROOT, 'public', 'uk');

function* walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (p === join(UK, 'blog')) continue; yield* walk(p); } else if (n.endsWith('.html')) yield p;
  }
}

const B = '(?<![\\p{L}])'; // a word boundary that also works for Cyrillic
const GEN_PREP = '(?:із|з|зі|З|Із|до|До|від|Від|для|Для|без|Без|Розділи|розділи)';
function terms(t) {
  t = t.replace(/Розбіжності з Fact Bank/g, 'Розбіжності з Банком Фактів'); // instrumental: "differences with"
  // Fact Bank, by case
  t = t.replace(new RegExp(`(${B}${GEN_PREP}\\s+(?:(?:ваш\\S*|мій|мого|моєму|свого)\\s+)?)Fact Bank`, 'gu'), '$1Банку Фактів');
  t = t.replace(new RegExp(`(${B}[УуВв]\\s+)Fact Bank`, 'gu'), '$1Банку Фактів');
  t = t.replace(new RegExp(`(${B}(?:вашого|мого|свого|вашому|моєму)\\s+)Fact Bank`, 'gu'), '$1Банку Фактів');
  t = t.replace(/Fact Bank/g, 'Банк Фактів');
  // Master CV in Ukrainian text: Базове Резюме, by case
  t = t.replace(/([Бб])азов(е|ого|ому|им|ій)(\s+)[Рр]езюме/g, (m, b, end, sp) => `Базов${end}${sp}Резюме`);
  return t;
}
function ai(t) {
  t = t.replace(new RegExp(`${B}([Чч]ат)(у|і|ом|ів|и)?\\s+JSE\\s+зі ШІ`, 'gu'), (m, c, e) => `AI-${c.toLowerCase()}${e || ''} JSE`);
  t = t.replace(new RegExp(`${B}([Чч]ат)(у|і|ом|ів|и)?\\s+зі ШІ`, 'gu'), (m, c, e) => `AI-${c.toLowerCase()}${e || ''}`);
  t = t.replace(/ШІ-([Чч]ат)/g, (m, c) => `AI-${c.toLowerCase()}`);
  t = t.replace(/ШІ-/g, 'AI-');
  t = t.replace(new RegExp(`${B}зі ШІ`, 'gu'), 'з AI').replace(new RegExp(`${B}Зі ШІ`, 'gu'), 'З AI');
  t = t.replace(/ШІ/g, 'AI');
  t = t.replace(/Скопіювати для AI/g, 'Копіювати для AI'); // same button label as in the online tracker
  return t;
}

let changed = 0;
for (const f of walk(UK)) {
  const rel = relative(UK, f);
  const html = readFileSync(f, 'utf8');
  const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<pre[\s\S]*?<\/pre>)/);
  const jse = rel.startsWith('tools/job-search-engine');
  const out = parts.map((seg, i) => (i % 2 ? seg : ai2(seg, jse))).join('');
  if (out !== html) { writeFileSync(f, out); changed++; }
}
function ai2(seg, jse) { let t = terms(seg); if (jse) t = ai(t); return t; }
console.log(`finalize-uk: ${changed} Ukrainian pages normalised`);
