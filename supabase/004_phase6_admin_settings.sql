-- Phase 6: Admin Panel Global Settings

create table public.global_settings (
    id integer primary key check (id = 1), -- Ensure only one row of global settings exists
    referral_level_1_percent numeric default 0.05 not null,
    referral_level_2_percent numeric default 0.02 not null,
    delivery_fee_payout numeric default 50.00 not null,
    vendor_timeout_seconds integer default 60 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert the default starting row
insert into public.global_settings (id) values (1) on conflict (id) do nothing;

alter table public.global_settings enable row level security;
