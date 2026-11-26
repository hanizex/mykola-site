// Daily publishing gate for the blog (see scripts/build-blog.mjs).
// Every post is built ahead of time with its publication day. Until that day (Europe/Sofia) its page answers 404,
// every list entry wrapped in <!--pub:DATE-->...<!--/pub--> (index, related posts, RSS, sitemap, llms.txt) is removed,
// and an in-text link to a later post (<!--pla:DATE-->) shows as plain text.
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sofia', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export function strip(text, day = today()) {
  const keep = (d, body) => (d <= day ? body : '');
  return text
    .replace(/<!--pubs:(\d{4}-\d{2}-\d{2})-->([\s\S]*?)<!--\/pubs-->/g, (m, d, b) => keep(d, b))
    .replace(/<!--pub:(\d{4}-\d{2}-\d{2})-->([\s\S]*?)<!--\/pub-->/g, (m, d, b) => keep(d, b))
    .replace(/<!--pla:(\d{4}-\d{2}-\d{2})-->([\s\S]*?)<!--\/pla-->/g, (m, d, b) => (d <= day ? b : b.replace(/<[^>]+>/g, '')));
}

export async function gated(context) {
  const res = await context.next();
  const type = res.headers.get('content-type') || '';
  if (res.status !== 200 || !/text\/html|xml|text\/plain/.test(type)) return res;
  const text = await res.text();
  const day = today();
  const m = text.match(/<meta name="pub-date" content="(\d{4}-\d{2}-\d{2})">/);
  if (m && m[1] > day) {
    const nf = await context.env.ASSETS.fetch(new URL('/404.html', context.request.url));
    return new Response(nf.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  const headers = new Headers(res.headers);
  headers.delete('etag'); headers.delete('content-length');
  headers.set('cache-control', 'public, max-age=0, must-revalidate');
  return new Response(strip(text, day), { status: 200, headers });
}
