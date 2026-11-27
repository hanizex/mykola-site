// /api/challenge/express/* -> the private Managerial DNA (Express) Worker through the service binding EXPRESS
// (production: mdna-express, previews: mdna-express-preview). The Worker checks the owner session on every request;
// the question bank and scoring never leave it. Without the binding the hub keeps working and Express reports "unavailable".
export async function onRequest({ request, env }) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return new Response(null, { status: 403 });
  if (!env.EXPRESS) {
    return new Response(JSON.stringify({ error: 'unavailable', reason: 'not_configured' }), {
      status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
    });
  }
  return env.EXPRESS.fetch(request);
}
