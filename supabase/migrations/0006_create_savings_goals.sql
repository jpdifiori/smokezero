-- 0006_create_savings_goals.sql

CREATE TABLE IF NOT EXISTS smokezero.savings_goals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_days integer NOT NULL CHECK (milestone_days IN (7, 14, 21, 30, 60)),
  goal_name text,
  target_amount numeric(10,2),
  goal_image_url text,
  status text DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'achieved')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, milestone_days)
);

-- Enable RLS
ALTER TABLE smokezero.savings_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see their own goals" ON smokezero.savings_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON smokezero.savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON smokezero.savings_goals
    FOR UPDATE USING (auth.uid() = user_id);
