-- 0008_add_significance_to_savings_goals.sql

ALTER TABLE smokezero.savings_goals 
ADD COLUMN IF NOT EXISTS significance text;
