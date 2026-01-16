-- Add missing columns to user_config
ALTER TABLE smokezero.user_config 
ADD COLUMN IF NOT EXISTS manifesto_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manifesto_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS identity_type TEXT,
ADD COLUMN IF NOT EXISTS identity_statement TEXT,
ADD COLUMN IF NOT EXISTS total_identity_votes INTEGER DEFAULT 0;
