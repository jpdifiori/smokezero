-- 1. Add Future-Proofing Columns to nutri_plans
alter table smokezero.nutri_plans 
add column if not exists created_by uuid references auth.users(id) on delete set null,
add column if not exists is_public boolean default false,
add column if not exists parent_plan_id uuid references smokezero.nutri_plans(id) on delete set null,
add column if not exists tags text[] default '{}';

-- 2. Update RLS for nutri_plans to allow users to see public plans or their own
drop policy if exists "Read plans for authenticated" on smokezero.nutri_plans;
create policy "Authenticated users can see public or own plans" 
on smokezero.nutri_plans 
for select 
to authenticated 
using (is_public = true or created_by = auth.uid() or created_by is null);

-- 3. Policy for users to manage their own created plans
create policy "Users can manage their own plans" 
on smokezero.nutri_plans 
for all 
to authenticated 
using (created_by = auth.uid())
with check (created_by = auth.uid());
