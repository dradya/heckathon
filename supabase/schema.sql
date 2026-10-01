-- MedQR hackathon schema
-- Run this entire file in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.medical_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  public_id uuid not null unique default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) > 0),
  blood_group text not null check (length(trim(blood_group)) > 0),
  allergies text,
  medications text,
  medical_conditions text,
  critical_notes text,
  emergency_contact_name text not null check (length(trim(emergency_contact_name)) > 0),
  emergency_contact_relation text,
  emergency_contact_phone text not null check (length(trim(emergency_contact_phone)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.medical_profiles enable row level security;

-- The owner can directly read only their own private row.
drop policy if exists "Owners can read their medical profile" on public.medical_profiles;
create policy "Owners can read their medical profile"
on public.medical_profiles
for select
to authenticated
using (auth.uid() = user_id);

-- The owner can create only a row linked to their own auth user id.
drop policy if exists "Owners can create their medical profile" on public.medical_profiles;
create policy "Owners can create their medical profile"
on public.medical_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

-- The owner can update only their own row and cannot transfer ownership.
drop policy if exists "Owners can update their medical profile" on public.medical_profiles;
create policy "Owners can update their medical profile"
on public.medical_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- The owner can delete only their own row.
drop policy if exists "Owners can delete their medical profile" on public.medical_profiles;
create policy "Owners can delete their medical profile"
on public.medical_profiles
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_medical_profiles_updated_at on public.medical_profiles;
create trigger set_medical_profiles_updated_at
before update on public.medical_profiles
for each row execute function public.set_updated_at();

-- Public emergency lookup.
-- IMPORTANT: this function deliberately returns only the approved emergency fields.
-- It bypasses table RLS only for this limited lookup, while direct anonymous table reads stay blocked.
create or replace function public.get_emergency_profile(public_profile_id uuid)
returns table (
  full_name text,
  blood_group text,
  allergies text,
  medications text,
  medical_conditions text,
  critical_notes text,
  emergency_contact_name text,
  emergency_contact_relation text,
  emergency_contact_phone text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    mp.full_name,
    mp.blood_group,
    mp.allergies,
    mp.medications,
    mp.medical_conditions,
    mp.critical_notes,
    mp.emergency_contact_name,
    mp.emergency_contact_relation,
    mp.emergency_contact_phone
  from public.medical_profiles as mp
  where mp.public_id = public_profile_id
  limit 1;
$$;

revoke all on function public.get_emergency_profile(uuid) from public;
grant execute on function public.get_emergency_profile(uuid) to anon, authenticated;

-- Direct table writes are never needed for anonymous visitors.
revoke insert, update, delete on table public.medical_profiles from anon;
