-- Grant usage on the schema to the standard Supabase roles
GRANT USAGE ON SCHEMA smokezero TO anon, authenticated, service_role;

-- Grant all privileges on all tables in the schema to service_role (for Admin/Webhook access)
GRANT ALL ON ALL TABLES IN SCHEMA smokezero TO service_role;

-- Ensure future tables also get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA smokezero GRANT ALL ON TABLES TO service_role;

-- Grant standard access to authenticated users (CRUD is controlled by RLS, but they need BASIC table access)
GRANT ALL ON ALL TABLES IN SCHEMA smokezero TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA smokezero TO anon;
