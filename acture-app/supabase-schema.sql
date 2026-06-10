-- ============================================
-- ACTure Database Schema
-- Supabase SQL Editor에서 이 파일을 실행하세요
-- ============================================

-- 1. 유저 프로필 (Supabase Auth 확장)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  age int,
  height_cm int,
  weight_kg int,
  goal text check (goal in ('diet', 'bulk', 'healthy', 'custom')),
  is_pro boolean default false,
  pro_plan text check (pro_plan in ('monthly', 'yearly')),
  pro_expires_at timestamptz,
  onboarding_done boolean default false,
  notification_times jsonb default '{"breakfast":{"enabled":true,"hour":6,"minute":0},"lunch":{"enabled":true,"hour":12,"minute":0},"dinner":{"enabled":true,"hour":18,"minute":0},"snack":{"enabled":false,"hour":22,"minute":0}}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. 식사 기록
create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  foods jsonb not null,
  total_calories numeric default 0,
  total_protein numeric default 0,
  total_fat numeric default 0,
  total_carbs numeric default 0,
  feedback text,
  image_url text,
  meal_date date default current_date,
  meal_time time default current_time,
  created_at timestamptz default now()
);

-- 3. 구독/결제 기록
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text default 'active' check (status in ('active', 'cancelled', 'expired', 'trial')),
  payment_key text,
  order_id text,
  amount int,
  started_at timestamptz default now(),
  trial_ends_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 4. RLS (Row Level Security) 정책
alter table profiles enable row level security;
alter table meals enable row level security;
alter table subscriptions enable row level security;

-- 본인 프로필만 접근
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- 본인 식사기록만 접근
create policy "Users can view own meals" on meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on meals for insert with check (auth.uid() = user_id);
create policy "Users can delete own meals" on meals for delete using (auth.uid() = user_id);

-- 본인 구독만 접근
create policy "Users can view own subscriptions" on subscriptions for select using (auth.uid() = user_id);

-- 5. 자동 프로필 생성 트리거 (회원가입 시)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. 인덱스
create index if not exists idx_meals_user_date on meals (user_id, meal_date desc);
create index if not exists idx_subs_user on subscriptions (user_id, status);
