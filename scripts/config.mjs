// Shared constants for the page generators.
export const INTRO = 'https://calendly.com/hanizex/free-intro';
// Calendly keeps utm_* values with each booking, so the booking shows where the visitor came from.
export const introLink = (where) => `${INTRO}?utm_source=mykola.pages.dev&utm_medium=site&utm_campaign=free-intro&utm_content=${encodeURIComponent(where)}`;
