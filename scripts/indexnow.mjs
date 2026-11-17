// Tells Bing, Yandex and other IndexNow engines which URLs exist or changed (free, no account).
// Run it AFTER a production deploy:   npm run indexnow
// It sends only public page URLs from sitemap.xml plus the public key file; nothing private.
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'mykola.pages.dev';
const KEY = '15add7d17e7ed0f308b04b9f7a63b92f';
const xml = await readFile(join(ROOT, 'public', 'sitemap.xml'), 'utf8');
const urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))];
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log('indexnow:', urls.length, 'urls, status', res.status);
