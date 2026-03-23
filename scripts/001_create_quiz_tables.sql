-- Create submissions table to store quiz answers
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  answer TEXT,
  time_taken INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_name, question_number)
);

-- Create banned_teams table to store banned team names
CREATE TABLE IF NOT EXISTS banned_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_submissions_team_name ON submissions(team_name);
CREATE INDEX IF NOT EXISTS idx_banned_teams_team_name ON banned_teams(team_name);
