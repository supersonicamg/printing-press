-- ============================================================
-- PrintMaster Press — Supabase Schema
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. PROFILES  (one row per auth.users entry)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text,
  role        text not null default 'VIEWER'
                   check (role in ('ADMIN','ESTIMATOR','SALES','VIEWER')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'VIEWER')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─────────────────────────────────────────────
-- 2. MASTER TABLES
-- ─────────────────────────────────────────────

create table if not exists public.paper_types (
  id           serial primary key,
  name         text not null,
  gsm_range    text,
  rate_per_kg  numeric(10,2) not null default 0,
  stock        text default 'Available',
  created_at   timestamptz not null default now()
);

create table if not exists public.machines (
  id                  serial primary key,
  name                text not null,
  type                text,
  max_size            text,
  colors              integer default 4,
  speed_per_hour      integer default 10000,
  rate_per_impression numeric(10,4) not null default 0,
  created_at          timestamptz not null default now()
);

create table if not exists public.inks (
  id           serial primary key,
  name         text not null,
  type         text,
  brand        text,
  rate_per_kg  numeric(10,2) not null default 0,
  coverage     text,
  created_at   timestamptz not null default now()
);

create table if not exists public.processes (
  id          serial primary key,
  name        text not null,
  type        text,
  rate_type   text,
  rate        numeric(10,2) not null default 0,
  min_charge  numeric(10,2) default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.product_types (
  id         serial primary key,
  name       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.gsm_options (
  id         serial primary key,
  value      integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.print_types (
  id         serial primary key,
  name       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id         serial primary key,
  name       text not null,
  phone      text,
  email      text,
  created_at timestamptz not null default now()
);


-- ─────────────────────────────────────────────
-- 3. ESTIMATES
-- ─────────────────────────────────────────────
create table if not exists public.estimates (
  id                  uuid primary key default gen_random_uuid(),
  estimate_number     text not null unique,
  job_details         jsonb not null default '{}',
  paper_estimation    jsonb not null default '{}',
  printing_estimation jsonb not null default '{}',
  pre_post_press      jsonb not null default '{}',
  summary             jsonb not null default '{}',
  status              text not null default 'draft'
                           check (status in ('draft','pending','approved','completed','rejected')),
  quotation_generated boolean not null default false,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists estimates_updated_at on public.estimates;
create trigger estimates_updated_at
  before update on public.estimates
  for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ─────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.paper_types      enable row level security;
alter table public.machines         enable row level security;
alter table public.inks             enable row level security;
alter table public.processes        enable row level security;
alter table public.product_types    enable row level security;
alter table public.gsm_options      enable row level security;
alter table public.print_types      enable row level security;
alter table public.customers        enable row level security;
alter table public.estimates        enable row level security;

-- Profiles: users see/edit only their own row
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Master tables: any authenticated user can read; only authenticated can write
create policy "paper_types_read"   on public.paper_types   for select using (auth.role() = 'authenticated');
create policy "paper_types_write"  on public.paper_types   for all    using (auth.role() = 'authenticated');

create policy "machines_read"      on public.machines      for select using (auth.role() = 'authenticated');
create policy "machines_write"     on public.machines      for all    using (auth.role() = 'authenticated');

create policy "inks_read"          on public.inks          for select using (auth.role() = 'authenticated');
create policy "inks_write"         on public.inks          for all    using (auth.role() = 'authenticated');

create policy "processes_read"     on public.processes     for select using (auth.role() = 'authenticated');
create policy "processes_write"    on public.processes     for all    using (auth.role() = 'authenticated');

create policy "product_types_read" on public.product_types for select using (auth.role() = 'authenticated');
create policy "product_types_write"on public.product_types for all    using (auth.role() = 'authenticated');

create policy "gsm_options_read"   on public.gsm_options   for select using (auth.role() = 'authenticated');
create policy "gsm_options_write"  on public.gsm_options   for all    using (auth.role() = 'authenticated');

create policy "print_types_read"   on public.print_types   for select using (auth.role() = 'authenticated');
create policy "print_types_write"  on public.print_types   for all    using (auth.role() = 'authenticated');

create policy "customers_read"     on public.customers     for select using (auth.role() = 'authenticated');
create policy "customers_write"    on public.customers     for all    using (auth.role() = 'authenticated');

-- Estimates: authenticated users can read all; can write their own
create policy "estimates_read"     on public.estimates for select using (auth.role() = 'authenticated');
create policy "estimates_insert"   on public.estimates for insert with check (auth.role() = 'authenticated');
create policy "estimates_update"   on public.estimates for update using (auth.role() = 'authenticated');
create policy "estimates_delete"   on public.estimates for delete using (auth.uid() = created_by);


-- ─────────────────────────────────────────────
-- 5. SEED DATA
-- ─────────────────────────────────────────────

-- Paper Types
insert into public.paper_types (name, gsm_range, rate_per_kg, stock) values
  ('Art Paper',    '90-300',  95, 'Available'),
  ('Maplitho',     '60-120',  72, 'Available'),
  ('Chromo Paper', '80-150',  88, 'Low Stock'),
  ('Bond Paper',   '60-100',  68, 'Available'),
  ('Duplex Board', '200-450', 55, 'Available'),
  ('Grey Board',   '250-600', 42, 'Available'),
  ('Kraft Paper',  '80-200',  48, 'Available'),
  ('Newsprint',    '45-52',   38, 'Available')
on conflict do nothing;

-- Machines
insert into public.machines (name, type, max_size, colors, speed_per_hour, rate_per_impression) values
  ('Heidelberg SM 74',  'Offset',  '52x74 cm',  4, 15000, 0.12),
  ('Heidelberg SM 102', 'Offset',  '72x102 cm', 5, 13000, 0.18),
  ('Komori LS 440',     'Offset',  '62x90 cm',  4, 14000, 0.14),
  ('Roland 700',        'Offset',  '70x100 cm', 6, 12000, 0.22),
  ('HP Indigo 12000',   'Digital', '31x46 cm',  7,  4600, 0.85),
  ('Xerox iGen 5',      'Digital', '32x48 cm',  6,  6000, 0.65)
on conflict do nothing;

-- Inks
insert into public.inks (name, type, brand, rate_per_kg, coverage) values
  ('Process Cyan',     'CMYK',    'Sun Chemical', 850,  '4 gm/1000 imp'),
  ('Process Magenta',  'CMYK',    'Sun Chemical', 920,  '3.5 gm/1000 imp'),
  ('Process Yellow',   'CMYK',    'Sun Chemical', 780,  '3 gm/1000 imp'),
  ('Process Black',    'CMYK',    'Sun Chemical', 650,  '3.5 gm/1000 imp'),
  ('Pantone 485 Red',  'Spot',    'Toyo',         1200, '4 gm/1000 imp'),
  ('Metallic Gold',    'Special', 'Eckart',       2800, '5 gm/1000 imp'),
  ('UV Coating',       'Special', 'Actega',       450,  '8 gm/1000 imp')
on conflict do nothing;

-- Processes
insert into public.processes (name, type, rate_type, rate, min_charge) values
  ('Cutting',            'Post-Press', 'Per 100 sheets',  5,   100),
  ('Folding',            'Post-Press', 'Per 1000 sheets', 80,  200),
  ('Lamination (Gloss)', 'Post-Press', 'Per sq.ft',       2.5, 500),
  ('Lamination (Matte)', 'Post-Press', 'Per sq.ft',       3.0, 500),
  ('Perfect Binding',    'Binding',    'Per book',        15,  300),
  ('Saddle Stitch',      'Binding',    'Per book',        5,   150),
  ('Spiral Binding',     'Binding',    'Per book',        25,  100),
  ('Numbering',          'Post-Press', 'Per 1000',        150, 300),
  ('Perforation',        'Post-Press', 'Per 1000',        100, 200),
  ('UV Spot',            'Finishing',  'Per sq.ft',       8,   1000),
  ('Embossing',          'Finishing',  'Per sq.ft',       12,  1500),
  ('Die Cutting',        'Post-Press', 'Per 100 sheets',  25,  500)
on conflict do nothing;

-- Product Types
insert into public.product_types (name) values
  ('Business Cards'), ('Letterhead'), ('Envelope'), ('Brochure'),
  ('Flyer'), ('Poster'), ('Catalog'), ('Magazine'), ('Book'),
  ('Calendar'), ('Packaging Box'), ('Label/Sticker'),
  ('Invoice/Bill Book'), ('Visiting Card'), ('Wedding Card'),
  ('Carry Bag'), ('Other')
on conflict do nothing;

-- GSM Options
insert into public.gsm_options (value) values
  (60),(70),(75),(80),(90),(100),(115),(120),(130),(150),
  (170),(200),(230),(250),(300),(350),(400),(450)
on conflict do nothing;

-- Print Types
insert into public.print_types (name) values
  ('Single Side'), ('Both Side'), ('Front Only'), ('Back Only')
on conflict do nothing;

-- Sample Customers
insert into public.customers (name, phone, email) values
  ('AR Printers',      '+91 98765 43210', 'ar@printers.com'),
  ('Colorpix',         '+91 87654 32109', 'info@colorpix.in'),
  ('Sudarshan Press',  '+91 76543 21098', 'contact@sudarshanpress.com'),
  ('Acme Corporation', '+91 98765 11111', 'john@acme.com'),
  ('TechStart India',  '+91 87654 22222', 'priya@techstart.in'),
  ('Global Traders',   '+91 76543 33333', 'ahmed@globaltraders.com')
on conflict do nothing;
