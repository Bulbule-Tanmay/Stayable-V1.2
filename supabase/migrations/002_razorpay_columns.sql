-- Add Razorpay payment tracking columns
alter table public.owner_subscriptions
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text;

-- Ensure profiles is linked to auth.users on insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed subscription plans if empty
insert into public.subscription_plans (name, price, max_listings, features, is_popular, is_active)
select 'Starter', 499, 1, '["1 active listing","Basic enquiry management","WhatsApp contact button","Standard listing visibility","Email support"]'::jsonb, false, true
where not exists (select 1 from public.subscription_plans where name = 'Starter');

insert into public.subscription_plans (name, price, max_listings, features, is_popular, is_active)
select 'Growth', 999, 5, '["Up to 5 active listings","Priority enquiry notifications","WhatsApp + Call buttons","Featured in search results","Analytics dashboard","Chat support"]'::jsonb, true, true
where not exists (select 1 from public.subscription_plans where name = 'Growth');

insert into public.subscription_plans (name, price, max_listings, features, is_popular, is_active)
select 'Pro', 1999, 20, '["Up to 20 listings","Top of search placement","Verified Owner badge","Advanced analytics","Dedicated account manager","API access"]'::jsonb, false, true
where not exists (select 1 from public.subscription_plans where name = 'Pro');
