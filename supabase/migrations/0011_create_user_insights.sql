-- 0011_create_user_insights.sql
-- Crea la tabla para almacenar la "Memoria a Largo Plazo" del Guardián AI

CREATE TABLE IF NOT EXISTS smokezero.user_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('trigger', 'motivation', 'fear', 'strategy', 'preference')),
    insight TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE smokezero.user_insights ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Users can view their own insights" ON smokezero.user_insights;
CREATE POLICY "Users can view their own insights"
    ON smokezero.user_insights FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own insights" ON smokezero.user_insights;
CREATE POLICY "Users can insert their own insights"
    ON smokezero.user_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS user_insights_user_category_idx ON smokezero.user_insights (user_id, category);
