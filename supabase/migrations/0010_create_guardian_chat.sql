-- 0010_create_guardian_chat.sql
-- Crea la tabla para el historial efímero del chat del Guardián

CREATE TABLE IF NOT EXISTS smokezero.guardian_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE smokezero.guardian_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view their own guardian messages"
    ON smokezero.guardian_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guardian messages"
    ON smokezero.guardian_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Índice para búsquedas rápidas por usuario y fecha
CREATE INDEX IF NOT EXISTS guardian_messages_user_date_idx ON smokezero.guardian_messages (user_id, created_at DESC);

-- Función para limpiar mensajes viejos (más de 24 horas)
-- Nota: Esto se puede ejecutar vía cron o simplemente filtrar en las consultas, 
-- pero tener la tabla limpia es mejor.
CREATE OR REPLACE FUNCTION smokezero.cleanup_old_guardian_messages()
RETURNS void AS $$
BEGIN
    DELETE FROM smokezero.guardian_messages
    WHERE created_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;
