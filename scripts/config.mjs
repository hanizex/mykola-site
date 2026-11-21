// Shared constants for the page generators.
export const INTRO = 'https://calendly.com/hanizex/free-intro';
// Calendly keeps utm_* values with each booking, so the booking shows where the visitor came from.
export const introLink = (where) => `${INTRO}?utm_source=mykola.pages.dev&utm_medium=site&utm_campaign=free-intro&utm_content=${encodeURIComponent(where)}`;

// Social preview card path for a page path ("/", "/uk/cv/", "/blog/some-post/"): one PNG per page, made by scripts/make-og.mjs.
export const ogPath = (p) => `/assets/og/${(p.replace(/^\/|\/$/g, '').replace(/\//g, '-')) || 'home'}.png`;

// Telegram channel and the Lane A page (mock interview + CV/story review).
export const CHANNEL = 'https://t.me/outstanding_pm';
export const PREP = { en: '/pm-interview-prep/', uk: '/uk/pm-interview-prep/' };

// Header menu link to the Tools section. Pass any path of the page language (anything under /uk is Ukrainian).
export const toolsLink = (anyPath) => (String(anyPath).startsWith('/uk') ? '<a href="/uk/tools/">Інструменти</a>' : '<a href="/tools/">Tools</a>');
