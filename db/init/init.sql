
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  section_name TEXT NOT NULL,
  attribute_name TEXT NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
