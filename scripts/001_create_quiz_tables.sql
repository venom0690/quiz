-- Create submissions table to store quiz answers
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  question_number INTEGER NOT NULL CHECK (question_number > 0),
  answer TEXT,
  time_taken INTEGER CHECK (time_taken >= 0),
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
-- Index on team_name for filtering submissions by team
CREATE INDEX IF NOT EXISTS idx_submissions_team_name ON submissions(team_name);

-- Composite index for common query: get all answers for a specific question
CREATE INDEX IF NOT EXISTS idx_submissions_question ON submissions(question_number);

-- Note: banned_teams.team_name already has an implicit index from UNIQUE constraint
