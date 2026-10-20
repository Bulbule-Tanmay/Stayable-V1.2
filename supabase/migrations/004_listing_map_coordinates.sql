alter table public.listings
  add column if not exists pin_x numeric check (pin_x >= 0 and pin_x <= 100),
  add column if not exists pin_y numeric check (pin_y >= 0 and pin_y <= 100);