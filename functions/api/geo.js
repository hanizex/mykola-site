// GET /api/geo - tells the page whether to ask for analytics consent.
// The banner is shown only to visitors from the EU, the EEA, the UK and Switzerland, where the law asks for consent
// before analytics cookies. Elsewhere Google Analytics loads without a question. Unknown country = ask (safe side).
// Nothing is stored; the country comes from Cloudflare's request data.

const ASK = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',            // EU
  'IS', 'LI', 'NO',                                    // EEA
  'GB', 'CH',                                          // UK, Switzerland
]);

export function onRequestGet({ request }) {
  const cc = (request.cf && request.cf.country) || '';
  const consent = !cc || cc === 'XX' || cc === 'T1' || ASK.has(cc);
  return new Response(JSON.stringify({ consent }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
  });
}
