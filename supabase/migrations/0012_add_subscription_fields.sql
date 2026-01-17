-- 0012_add_subscription_fields.sql
-- Agrega campos para el manejo de suscripciones con Stripe

ALTER TABLE smokezero.user_config
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'canceled', 'unpaid'
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Indices para busquedas rapidas
CREATE INDEX IF NOT EXISTS user_config_subscription_status_idx ON smokezero.user_config(subscription_status);
CREATE INDEX IF NOT EXISTS user_config_stripe_customer_id_idx ON smokezero.user_config(stripe_customer_id);
