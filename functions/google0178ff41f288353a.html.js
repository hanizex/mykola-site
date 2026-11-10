// Google Search Console HTML-file verification. A Function (not a static file) because Pages 308-redirects *.html to the extensionless URL,
// and Google needs a plain 200 at the exact filename.
export const onRequestGet = () => new Response('google-site-verification: google0178ff41f288353a.html', { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
