-- D1 schema. Free plan: 100k row-writes/day; each indexed insert counts twice,
-- so we keep ONE index on events. ~10 row-writes per visit => ~10k visits/day ceiling.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  day TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  vid TEXT,
  src TEXT, src_type TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
  lang TEXT, cc TEXT, order_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_day_name ON events (day, name);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_ts INTEGER NOT NULL,
  method TEXT, tx_id TEXT,
  src TEXT, src_type TEXT, utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, landing_path TEXT,
  paid_claimed_ts INTEGER, booked_ts INTEGER, confirmed_ts INTEGER
);
