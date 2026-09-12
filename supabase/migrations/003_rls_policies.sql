-- ─────────────────────────────────────────────────────────────────────────────
-- 003: Row-Level Security (RLS) for all tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.enquiries enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.owner_subscriptions enable row level security;

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Users can read and update their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Admins can read all profiles
create policy "profiles_admin_select_all" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── listings ────────────────────────────────────────────────────────────────
-- Anyone (including unauthenticated) can read approved + active listings
create policy "listings_public_read" on public.listings
  for select using (is_approved = true and is_active = true);

-- Owners can see all their own listings (including unapproved)
create policy "listings_owner_read_own" on public.listings
  for select using (auth.uid() = owner_id);

-- Owners can insert listings (ownership enforced in API layer too)
create policy "listings_owner_insert" on public.listings
  for insert with check (auth.uid() = owner_id);

-- Owners can update their own listings
create policy "listings_owner_update" on public.listings
  for update using (auth.uid() = owner_id);

-- Owners can delete their own listings
create policy "listings_owner_delete" on public.listings
  for delete using (auth.uid() = owner_id);

-- Admins can read/update all listings
create policy "listings_admin_all" on public.listings
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── enquiries ───────────────────────────────────────────────────────────────
-- Students can see their own enquiries
create policy "enquiries_student_select_own" on public.enquiries
  for select using (auth.uid() = student_id);

-- Students can submit enquiries
create policy "enquiries_student_insert" on public.enquiries
  for insert with check (true); -- student_id may be null (anonymous enquiry)

-- Owners can see enquiries for their listings
create policy "enquiries_owner_select_own" on public.enquiries
  for select using (auth.uid() = owner_id);

-- Owners can update status on their enquiries
create policy "enquiries_owner_update" on public.enquiries
  for update using (auth.uid() = owner_id);

-- Admins can do everything
create policy "enquiries_admin_all" on public.enquiries
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── subscription_plans ──────────────────────────────────────────────────────
-- Plans are public read
create policy "subscription_plans_public_read" on public.subscription_plans
  for select using (is_active = true);

-- Only admins can manage plans
create policy "subscription_plans_admin_all" on public.subscription_plans
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─── owner_subscriptions ─────────────────────────────────────────────────────
-- Owners can see their own subscription
create policy "owner_subscriptions_select_own" on public.owner_subscriptions
  for select using (auth.uid() = owner_id);

-- Admins can see all subscriptions
create policy "owner_subscriptions_admin_all" on public.owner_subscriptions
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
