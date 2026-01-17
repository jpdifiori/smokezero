-- 1. Create Selections Table
create table if not exists smokezero.nutri_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references smokezero.nutri_plans(id) on delete cascade,
  day_index int not null,
  moment_id uuid not null references smokezero.nutri_moments(id) on delete cascade,
  option_id uuid not null references smokezero.nutri_options(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, plan_id, day_index, moment_id)
);

-- 2. RLS Policies
alter table smokezero.nutri_selections enable row level security;

create policy "Users can manage their own selections" 
on smokezero.nutri_selections 
for all 
to authenticated 
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 3. Permissions
grant all on smokezero.nutri_selections to authenticated;
grant all on smokezero.nutri_selections to service_role;
