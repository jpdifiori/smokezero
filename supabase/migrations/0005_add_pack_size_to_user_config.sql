-- Migration: Add pack_size and setup_completed to user_config
ALTER TABLE smokezero.user_config 
ADD COLUMN IF NOT EXISTS pack_size INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have setup_completed = true if they have cigs_per_day > 0
UPDATE smokezero.user_config 
SET setup_completed = TRUE 
WHERE cigs_per_day > 0;
