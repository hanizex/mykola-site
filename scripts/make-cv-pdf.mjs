// Generates the two downloadable CV PDFs ONCE (headless Chrome, print layout of the CV pages). Commit the results.
//   npm run build && npm run cv:pdf
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) throw new Error('Google Chrome not found at ' + CHROME);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  try { const buf = await readFile(join(PUB, p)); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(buf); }
  catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
await mkdir(join(PUB, 'assets', 'cv'), { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'cvpdf-')); // separate profile so an open Chrome never blocks us
for (const [path, out] of [['/cv/', 'Mykola_Kalakutskyi_CV_EN.pdf'], ['/uk/cv/', 'Mykola_Kalakutskyi_CV_UA.pdf']]) {
  const file = join(PUB, 'assets', 'cv', out);
  await run(CHROME, ['--headless=new', '--disable-gpu', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--no-pdf-header-footer', '--virtual-time-budget=5000', `--print-to-pdf=${file}`, `http://127.0.0.1:${port}${path}?print=1`], { timeout: 90000 });
  console.log('pdf:', out);
}
server.close();
