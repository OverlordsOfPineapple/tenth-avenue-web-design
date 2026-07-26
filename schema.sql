CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business TEXT,
  message TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx
  ON leads(created_at DESC);

CREATE INDEX IF NOT EXISTS leads_ip_created_idx
  ON leads(ip_hash, created_at DESC);
