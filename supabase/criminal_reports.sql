-- ClearSight-Recon: criminal_reports table
-- Run in Supabase Dashboard → SQL Editor → New query → Run

create extension if not exists "pgcrypto";

create table if not exists public.criminal_reports (
  id uuid primary key default gen_random_uuid(),
  case_number text not null unique,
  created_at timestamptz not null default now(),

  -- Witness descriptors (snake_case matches reportService.js)
  gender text,
  face_shape text,
  skin_tone text,
  ethnicity text,
  age_range text,

  eye_shape text,
  eye_color text,
  eye_size text,
  eyebrow_thickness text,
  eyebrow_shape text,

  nose_type text,
  nose_size text,
  nostril_width text,
  nose_bridge text,

  lip_thickness text,
  mouth_width text,

  hair_color text,
  hair_length text,
  hair_style text,

  facial_hair text,

  cheekbone_prominence text,
  jaw_shape text,
  jaw_width text,
  forehead_size text,

  scar_location text,
  scar_description text,
  tattoos text,
  birthmark_location text,
  birthmark_description text,
  glasses text,
  other_features text,

  height text,
  build text,

  generated_image_url text not null,
  selected_image_number integer not null check (selected_image_number between 1 and 4),
  notes text
);

create index if not exists criminal_reports_created_at_idx
  on public.criminal_reports (created_at desc);

alter table public.criminal_reports enable row level security;

-- Development policies (anon can read/write). Tighten for production.
drop policy if exists "Allow public read criminal_reports" on public.criminal_reports;
create policy "Allow public read criminal_reports"
  on public.criminal_reports for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert criminal_reports" on public.criminal_reports;
create policy "Allow public insert criminal_reports"
  on public.criminal_reports for insert
  to anon, authenticated
  with check (true);

-- Refresh PostgREST schema cache (fixes "Could not find the table in the schema cache")
notify pgrst, 'reload schema';
