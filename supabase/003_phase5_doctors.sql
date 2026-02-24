-- Phase 5: Doctor Consultation Module Schema

-- 1. First, we need to allow 'doctor' as a valid role in the users table
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check check (role in ('customer', 'retailer', 'delivery', 'admin', 'doctor'));

-- 2. Create the Doctors profile table
create table public.doctors (
  id uuid references public.users(id) not null primary key,
  full_name text not null,
  specialization text not null,
  experience_years integer,
  consultation_fee numeric not null default 0.00,
  bio text,
  is_verified boolean default false,
  available_slots jsonb, -- e.g., [{"day": "Monday", "start": "10:00", "end": "14:00"}]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.doctors enable row level security;

-- 3. Create the Appointments booking table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.users(id) not null,
  doctor_id uuid references public.doctors(id) not null,
  appointment_time timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  payment_status text check (payment_status in ('pending', 'paid', 'refunded')) default 'pending',
  meeting_link text, -- For Teleconsultations
  payment_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.appointments enable row level security;
