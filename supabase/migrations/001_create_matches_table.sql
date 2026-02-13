-- W-Ground: w_matches table
CREATE TABLE IF NOT EXISTS w_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT,
  has_court BOOLEAN DEFAULT FALSE,
  location_raw TEXT,
  region_tag TEXT,
  match_date TEXT,
  match_time TEXT,
  match_type TEXT,
  level TEXT,
  contact TEXT,
  cost TEXT,
  note TEXT,
  original_text TEXT NOT NULL,
  password TEXT NOT NULL DEFAULT '0000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for filtering
CREATE INDEX idx_w_matches_region_tag ON w_matches(region_tag);
CREATE INDEX idx_w_matches_match_date ON w_matches(match_date);
CREATE INDEX idx_w_matches_has_court ON w_matches(has_court);
