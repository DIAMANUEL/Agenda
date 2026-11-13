create extension if not exists pgcrypto;
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.class_events (id uuid primary key default gen_random_uuid(), type text not null default 'other', date date not null, time time, subject text not null, title text not null, description text default '', created_at timestamptz not null default now());
create table if not exists public.subjects (id uuid primary key default gen_random_uuid(), name text not null unique, color text not null default '#2563eb', created_at timestamptz not null default now());
create table if not exists public.books (id uuid primary key default gen_random_uuid(), title text not null, storage_path text not null unique, url text not null, created_at timestamptz not null default now());
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()); $$;
alter table public.admin_users enable row level security;
alter table public.class_events enable row level security;
alter table public.subjects enable row level security;
alter table public.books enable row level security;
drop policy if exists "admin users self read" on public.admin_users; create policy "admin users self read" on public.admin_users for select using (user_id=auth.uid());
drop policy if exists "events public read" on public.class_events; create policy "events public read" on public.class_events for select using (true);
drop policy if exists "events admin insert" on public.class_events; create policy "events admin insert" on public.class_events for insert with check (public.is_admin());
drop policy if exists "events admin update" on public.class_events; create policy "events admin update" on public.class_events for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "events admin delete" on public.class_events; create policy "events admin delete" on public.class_events for delete using (public.is_admin());
drop policy if exists "subjects public read" on public.subjects; create policy "subjects public read" on public.subjects for select using (true);
drop policy if exists "subjects admin insert" on public.subjects; create policy "subjects admin insert" on public.subjects for insert with check (public.is_admin());
drop policy if exists "subjects admin update" on public.subjects; create policy "subjects admin update" on public.subjects for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "subjects admin delete" on public.subjects; create policy "subjects admin delete" on public.subjects for delete using (public.is_admin());
drop policy if exists "books public read" on public.books; create policy "books public read" on public.books for select using (true);
drop policy if exists "books admin insert" on public.books; create policy "books admin insert" on public.books for insert with check (public.is_admin());
drop policy if exists "books admin update" on public.books; create policy "books admin update" on public.books for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "books admin delete" on public.books; create policy "books admin delete" on public.books for delete using (public.is_admin());
insert into storage.buckets (id,name,public) values ('books','books',true) on conflict (id) do update set public=true;
drop policy if exists "books storage public read" on storage.objects; create policy "books storage public read" on storage.objects for select using (bucket_id='books');
drop policy if exists "books storage admin insert" on storage.objects; create policy "books storage admin insert" on storage.objects for insert with check (bucket_id='books' and public.is_admin());
drop policy if exists "books storage admin delete" on storage.objects; create policy "books storage admin delete" on storage.objects for delete using (bucket_id='books' and public.is_admin());

insert into public.subjects (name,color) values
('Valenciano (Carolina)','#2563eb'),('Valenciano (Pau)','#2563eb'),('FyQ','#16a34a'),('Economía','#16a34a'),('Inglés','#7c3aed'),('FOPP','#ea580c'),('Biología','#059669'),('Educación Física','#dc2626'),('Proyecto Interdisciplinar','#0891b2'),('Tecnología','#f59e0b'),('Latín','#a855f7'),('Mate A','#2563eb'),('Mate B','#1d4ed8'),('Tutoría','#64748b'),('Geografía e Historia','#92400e'),('Castellano Carolina','#0f766e'),('Castellano Gema','#0d9488'),('Religión','#6b21a8'),('Educación Valores','#be123c')
on conflict (name) do nothing;
