-- 0007_create_asked_questions.sql

CREATE TABLE IF NOT EXISTS smokezero.asked_questions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    category text NOT NULL,
    question_text text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE smokezero.asked_questions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see their own asked questions" ON smokezero.asked_questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own asked questions" ON smokezero.asked_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
