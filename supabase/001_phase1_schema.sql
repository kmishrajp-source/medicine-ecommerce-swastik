-- Phase 1: Swastik Medicare Database Setup
-- 1. Enable the PostGIS extension for spatial queries (Lat/Lng)
create extension if not exists postgis schema extensions;

-- 2. Create the Users Table
create table public.users (
  id uuid references auth.users not null primary key,
  full_name text,
  phone text unique,
  role text check (role in ('customer', 'retailer', 'delivery', 'admin')) default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security (RLS)
alter table public.users enable row level security;

-- 3. Create the Retailers Table (with spatial column for GPS)
create table public.retailers (
  id uuid references public.users(id) not null primary key,
  store_name text not null,
  address text,
  pincode text,
  is_online boolean default false,
  -- PostGIS Geography Point for Lat/Lng
  location geometry(Point, 4326),
  priority_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a spatial index to make the 3km radius search extremely fast
create index retailers_geo_index on public.retailers using gist (location);
alter table public.retailers enable row level security;

-- 4. Create the Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.users(id) not null,
  status text check (status in ('pending', 'assigned', 'accepted', 'rejected', 'shipped', 'delivered')) default 'pending',
  total_amount numeric not null,
  delivery_address text,
  -- Customer's location for calculating distance to retailer
  delivery_location geometry(Point, 4326),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.orders enable row level security;

-- 5. Create Order Assignments (The 60 second Bypass Logic Table)
create table public.order_assignments (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) not null,
  retailer_id uuid references public.retailers(id) not null,
  status text check (status in ('pending', 'accepted', 'rejected', 'timeout')) default 'pending',
  distance_km numeric,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- If not accepted by this time (60s), move to next retailer
  expires_at timestamp with time zone not null
);
alter table public.order_assignments enable row level security;

-- 6. Spatial Function: Find Nearest Online Retailers
-- Usage: select * from get_nearest_retailers(latitude, longitude, radius_km);
create or replace function get_nearest_retailers(
  lat double precision,
  lng double precision,
  radius_km double precision default 5.0
)
returns table (
  retailer_id uuid,
  store_name text,
  distance_km double precision
)
language sql stable strict
as $$
  select
    r.id,
    r.store_name,
    -- Calculate distance in meters, convert to km
    st_distance(r.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography) / 1000.0 as distance_km
  from
    public.retailers r
  where
    r.is_online = true
    -- Only return retailers within the exact radius (e.g. 5km)
    and st_dwithin(
      r.location,
      st_setsrid(st_makepoint(lng, lat), 4326)::geography,
      radius_km * 1000
    )
  order by
    r.priority_score desc, -- Highest priority first (Subscription)
    distance_km asc;        -- Nearest first
$$;
