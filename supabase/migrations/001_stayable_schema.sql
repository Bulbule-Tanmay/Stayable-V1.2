-- Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null default 'student' check (role in ('student', 'owner', 'admin')),
  full_name text,
  phone text,
  college text,
  email text,
  avatar_url text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Listings table
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('pg', 'flat')),
  gender text not null check (gender in ('boys', 'girls', 'coed', 'unisex')),
  gender_label text,
  address text,
  campus text,
  price_from integer not null default 0,
  price_suffix text default '/month',
  deposit text,
  tiers jsonb default '[]',
  amenities jsonb default '[]',
  highlights jsonb default '[]',
  images jsonb default '[]',
  phone text,
  wa_message text,
  rating numeric(2,1) default 0,
  review_count integer default 0,
  distance text,
  walk_time text,
  instant boolean default false,
  badge text,
  is_active boolean default true,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- Enquiries table
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete cascade,
  student_name text not null,
  student_phone text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'replied', 'scheduled', 'closed')),
  created_at timestamptz default now()
);

-- Subscription plans
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  max_listings integer not null default 1,
  features jsonb default '[]',
  is_popular boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Owner subscriptions
create table if not exists public.owner_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade unique,
  plan_id uuid references public.subscription_plans(id),
  status text default 'trial' check (status in ('trial', 'active', 'expired', 'cancelled')),
  started_at timestamptz default now(),
  expires_at timestamptz,
  payment_status text default 'pending' check (payment_status in ('paid', 'pending', 'failed')),
  created_at timestamptz default now()
);

-- Seed subscription plans
insert into public.subscription_plans (name, price, max_listings, features, is_popular, is_active)
values
  ('Starter', 499, 1,
   '["1 active listing", "Basic enquiry management", "WhatsApp contact button", "Standard listing visibility", "Email support"]',
   false, true),
  ('Growth', 999, 5,
   '["Up to 5 active listings", "Priority enquiry notifications", "WhatsApp + Call buttons", "Featured in search results", "Analytics dashboard", "Chat support"]',
   true, true),
  ('Pro', 1999, 20,
   '["Up to 20 listings", "Top of search placement", "Verified Owner badge", "Advanced analytics", "Dedicated account manager", "API access", "Priority support"]',
   false, true)
on conflict do nothing;

-- Seed sample admin profile
insert into public.profiles (id, role, full_name, email, phone, is_verified)
values (
  'a0000000-0000-0000-0000-000000000001',
  'admin',
  'Stayable Admin',
  'admin@stayable.in',
  '+919999999999',
  true
)
on conflict (id) do nothing;
