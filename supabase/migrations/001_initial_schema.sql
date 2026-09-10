create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member' check (role in ('admin','member')),
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null, industry text, address text, contact_name text, phone text,
  owner text, status text not null default 'normal', first_cooperation_date date,
  next_service_date date, health_score integer default 100 check (health_score between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  device_name text not null, device_model text, quantity integer not null default 1 check (quantity > 0),
  install_date date, status text not null default 'normal', created_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  contract_type text, start_date date not null, end_date date not null, amount numeric(12,2) not null default 0,
  service_cycle text, total_service_count integer not null default 0, completed_service_count integer not null default 0,
  renew_status text not null default 'active', created_at timestamptz not null default now()
);

create table public.service_records (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  service_date date not null, service_person text, service_type text, service_content text,
  oil_model text, oil_quantity integer default 0, photo text, remark text, created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  total_amount numeric(12,2) not null default 0, paid_amount numeric(12,2) not null default 0,
  unpaid_amount numeric(12,2) generated always as (total_amount - paid_amount) stored,
  payment_method text, payment_date date, created_at timestamptz not null default now()
);

create table public.customer_risks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  risk_level text not null, risk_score integer not null check (risk_score between 0 and 100),
  risk_reason text not null, suggestion text, created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  type text not null, content text not null, status text not null default 'pending', created_at timestamptz not null default now()
);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  title text not null, source_type text not null, qdrant_point_id uuid not null,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id, display_name) values(new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email)); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.equipment enable row level security;
alter table public.contracts enable row level security;
alter table public.service_records enable row level security;
alter table public.payments enable row level security;
alter table public.customer_risks enable row level security;
alter table public.notifications enable row level security;
alter table public.knowledge_documents enable row level security;

create policy "profiles_self" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "customers_owner" on public.customers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "equipment_owner" on public.equipment for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "contracts_owner" on public.contracts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "services_owner" on public.service_records for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "payments_owner" on public.payments for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "risks_owner" on public.customer_risks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_owner" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "knowledge_owner" on public.knowledge_documents for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index customers_user_id_idx on public.customers(user_id);
create index equipment_customer_id_idx on public.equipment(customer_id);
create index contracts_customer_id_idx on public.contracts(customer_id);
create index service_records_customer_id_idx on public.service_records(customer_id);
create index payments_customer_id_idx on public.payments(customer_id);
create index customer_risks_customer_id_idx on public.customer_risks(customer_id);
