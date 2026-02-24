-- Phase 2 & 3: Delivery Agents, Tracking, and Wallets

-- 1. Create the Delivery Agents Table
create table public.delivery_agents (
  id uuid references public.users(id) not null primary key,
  full_name text not null,
  vehicle_number text,
  is_online boolean default false,
  -- PostGIS location for real-time tracking
  current_location geometry(Point, 4326),
  last_location_update timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index delivery_geo_index on public.delivery_agents using gist (current_location);
alter table public.delivery_agents enable row level security;

-- Enable Realtime for the delivery agents table so the UI can draw the live map
alter publication supabase_realtime add table public.delivery_agents;

-- 2. Create the Wallet Table 
create table public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null unique,
  -- The user's role specifies if it's a Delivery Earnings wallet or Customer Referral wallet
  role text, 
  balance numeric default 0.00 not null check (balance >= 0), -- Prevent negative balances
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.wallets enable row level security;

-- 3. Create the Wallet Transactions Ledger
create table public.wallet_transactions (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references public.wallets(id) not null,
  order_id uuid references public.orders(id), -- Connect the transaction context to the exact order
  transaction_type text check (transaction_type in ('delivery_earning', 'referral_level_1', 'referral_level_2', 'withdrawal', 'refund')),
  amount numeric not null,
  -- E.g. "+50.00 for Delivery" or "-1000.00 for Withdrawal"
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.wallet_transactions enable row level security;

-- 4. Create the Referrals Mapping Table
create table public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references public.users(id) not null, -- The person who shared the link
  referred_user_id uuid references public.users(id) not null unique, -- The new customer
  level integer check (level in (1, 2)) default 1, -- 1=Direct (5%), 2=Indirect (2%)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.referrals enable row level security;
