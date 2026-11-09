# mykola-site

Personal site: CV/portfolio + paid 1-hour consultation flow. Cloudflare Pages project `mykola` -> https://mykola.pages.dev

Flow: landing -> /pay/ (method + transaction ID) -> /book/ (Calendly) -> /done/. The owner gets Telegram alerts
(send-only: sendMessage + a link button, no webhook, no getUpdates) and confirms from a private link (/admin/#o=<id>&k=<token>,
POST-only, HMAC token, token in the URL fragment).

## Local preview
    printf 'ADMIN_SECRET=local\nDAILY_SALT=local\n' > .dev.vars   # gitignored
    npx wrangler d1 execute mykola-site --local --file=schema.sql
    npx wrangler pages dev --port 8788

## Blog
Markdown posts in `content/blog/` are built into `public/blog/` (plus sitemap.xml, rss.xml, llms.txt) by `scripts/build-blog.mjs`.
Drafts live in `content/drafts/` (git-ignored, never built for production). `npm run preview` renders them locally with a DRAFT banner.
Front matter: title, description, date (YYYY-MM-DD), slug, optional summary, tags, updated.

## Deploy (only after owner approval)
    npm run deploy        # builds the blog, then wrangler pages deploy
Never run `wrangler deploy` here (creates a Workers project instead).

## Secrets (Pages project, production; never in files/chat)
    npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name mykola   # prompts, input hidden
Also set: TELEGRAM_CHAT_ID, DAILY_SALT, ADMIN_SECRET. Secrets apply from the next deployment.

## Stats
`queries.sql` — funnel by day and by traffic source: `npx wrangler d1 execute mykola-site --remote --file=queries.sql`

## TODO
- weekly Telegram digest (needs a cron Worker), Search Console + sitemap submission
- Ukrainian pages, blog (Astro), custom .com once there is income
