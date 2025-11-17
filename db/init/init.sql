-- Initialize database and create files table

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  content_type TEXT,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
