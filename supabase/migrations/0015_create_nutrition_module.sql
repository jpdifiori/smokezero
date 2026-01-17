-- Create tables in smokezero schema (already exposed to API)
-- Using nutri_ prefix to keep things organized

-- 1. Nutrition Plans
create table if not exists smokezero.nutri_plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- 2. Templates (A/B)
create table if not exists smokezero.nutri_templates (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references smokezero.nutri_plans(id) on delete cascade,
  code text not null, -- 'A' or 'B'
  name text not null,
  unique(plan_id, code)
);

-- 3. Moments (M1..M8)
create table if not exists smokezero.nutri_moments (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references smokezero.nutri_templates(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  code text not null, -- 'M1'
  name text not null,
  "order" int not null,
  unique(template_id, day_of_week, code)
);

-- 4. Options
create table if not exists smokezero.nutri_options (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references smokezero.nutri_moments(id) on delete cascade,
  description text not null,
  is_recommended boolean default false
);

-- 5. Daily Checkins (User)
create table if not exists smokezero.nutri_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references smokezero.nutri_plans(id) on delete cascade,
  day_index int not null check (day_index between 1 and 30),
  did_comply boolean not null default false,
  notes text,
  updated_at timestamptz not null default now(),
  unique(user_id, plan_id, day_index)
);

-- Enable RLS
alter table smokezero.nutri_plans enable row level security;
alter table smokezero.nutri_templates enable row level security;
alter table smokezero.nutri_moments enable row level security;
alter table smokezero.nutri_options enable row level security;
alter table smokezero.nutri_checkins enable row level security;

-- Policies
drop policy if exists "Read plans for authenticated" on smokezero.nutri_plans;
create policy "Read plans for authenticated" on smokezero.nutri_plans for select to authenticated using (true);

drop policy if exists "Read templates for authenticated" on smokezero.nutri_templates;
create policy "Read templates for authenticated" on smokezero.nutri_templates for select to authenticated using (true);

drop policy if exists "Read moments for authenticated" on smokezero.nutri_moments;
create policy "Read moments for authenticated" on smokezero.nutri_moments for select to authenticated using (true);

drop policy if exists "Read options for authenticated" on smokezero.nutri_options;
create policy "Read options for authenticated" on smokezero.nutri_options for select to authenticated using (true);

-- User Checkins Policies
drop policy if exists "select_own_checkins" on smokezero.nutri_checkins;
create policy "select_own_checkins" on smokezero.nutri_checkins for select to authenticated using (auth.uid() = user_id);

drop policy if exists "insert_own_checkins" on smokezero.nutri_checkins;
create policy "insert_own_checkins" on smokezero.nutri_checkins for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "update_own_checkins" on smokezero.nutri_checkins;
create policy "update_own_checkins" on smokezero.nutri_checkins for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Permissions (already granted for schema smokezero, but ensuring for tables)
grant all privileges on all tables in schema smokezero to service_role;
grant select on all tables in schema smokezero to authenticated;
grant all privileges on smokezero.nutri_checkins to authenticated;
grant all privileges on smokezero.nutri_plans to authenticated;
grant all privileges on smokezero.nutri_templates to authenticated;
grant all privileges on smokezero.nutri_moments to authenticated;
grant all privileges on smokezero.nutri_options to authenticated;
