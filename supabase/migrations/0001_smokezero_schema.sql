-- Create smokezero schema
CREATE SCHEMA IF NOT EXISTS smokezero;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: user_config
CREATE TABLE IF NOT EXISTS smokezero.user_config (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    cigs_per_day INTEGER DEFAULT 0,
    pack_price DECIMAL(10, 2) DEFAULT 0.00,
    identity_anchor TEXT CHECK (identity_anchor IN ('Atleta', 'Padre', 'Libre', 'Other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: smoke_logs
CREATE TABLE IF NOT EXISTS smokezero.smoke_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('VETO', 'CEDO')) NOT NULL,
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
    trigger_id UUID, -- References triggers_catalog but currently loose if catalog not required initially
    time_to_decision INTEGER, -- Seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: triggers_catalog
CREATE TABLE IF NOT EXISTS smokezero.triggers_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    frequency_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: progressive_profiling
CREATE TABLE IF NOT EXISTS smokezero.progressive_profiling (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

-- Enable RLS
ALTER TABLE smokezero.user_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE smokezero.smoke_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE smokezero.triggers_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE smokezero.progressive_profiling ENABLE ROW LEVEL SECURITY;

-- Policies for user_config
CREATE POLICY "Users can view own config" 
ON smokezero.user_config FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" 
ON smokezero.user_config FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" 
ON smokezero.user_config FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies for smoke_logs
CREATE POLICY "Users can view own logs" 
ON smokezero.smoke_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" 
ON smokezero.smoke_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies for triggers_catalog (Public read, or shared?)
-- Assuming everyone can read triggers, but maybe only system updates them?
-- Or users can add triggers? 'Diccionario dinámico' implies potentially users adding or system learning?
-- For now, let's allow authenticated users to read.
CREATE POLICY "Authenticated users can read triggers" 
ON smokezero.triggers_catalog FOR SELECT 
TO authenticated 
USING (true);

-- Policies for progressive_profiling
CREATE POLICY "Users can view own profiling" 
ON smokezero.progressive_profiling FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiling" 
ON smokezero.progressive_profiling FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiling" 
ON smokezero.progressive_profiling FOR INSERT 
WITH CHECK (auth.uid() = user_id);
