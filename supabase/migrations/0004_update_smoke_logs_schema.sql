-- Add missing columns to smoke_logs
ALTER TABLE smokezero.smoke_logs 
ADD COLUMN IF NOT EXISTS mission_text TEXT,
ADD COLUMN IF NOT EXISTS context_json JSONB DEFAULT '{}'::JSONB;
