-- Funnel by day (unique daily visitors per stage). Run: wrangler d1 execute mykola-site --remote --file=queries.sql
SELECT day,
  COUNT(DISTINCT CASE WHEN name='page_view' AND path='/'        THEN vid END) AS visitors,
  COUNT(DISTINCT CASE WHEN name='cta_click'                     THEN vid END) AS cta_clicks,
  COUNT(DISTINCT CASE WHEN name='page_view' AND path='/pay/'    THEN vid END) AS pay_page,
  COUNT(DISTINCT CASE WHEN name='book_open'                     THEN vid END) AS book_opened
FROM events GROUP BY day ORDER BY day DESC LIMIT 30;

-- Order funnel by traffic source type.
SELECT src_type,
  COUNT(*)                                  AS orders_started,
  COUNT(paid_claimed_ts)                    AS paid_claimed,
  COUNT(booked_ts)                          AS booked,
  COUNT(confirmed_ts)                       AS confirmed
FROM orders GROUP BY src_type ORDER BY orders_started DESC;
