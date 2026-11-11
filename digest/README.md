# mykola-digest

Weekly Telegram digest (free Cloudflare cron Worker). Saturday 09:00 Sofia time, funnel numbers + top pages for the last 7 full days (UTC days).
Send-only through the existing bot: no webhook, no getUpdates.

    cd digest
    npx wrangler secret put TELEGRAM_BOT_TOKEN      # prompts, input hidden (chat id is already set)
    npx wrangler deploy                             # only from this folder, never from the repo root

Test (prints instead of sending):  `npx wrangler dev --test-scheduled --persist-to ../.wrangler/state --var DRY_RUN:1`, then `curl "http://localhost:8787/__scheduled?cron=manual"`.
Two cron triggers (06:00 and 07:00 UTC) cover Sofia summer/winter time; the code sends only when it is 09:xx in Sofia.
