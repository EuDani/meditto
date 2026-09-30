-- Medito — schema inicial
-- Rode este arquivo inteiro no SQL editor do seu projeto Supabase.
-- Daniel8810_meditto

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- cria automaticamente um profile quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- soundscapes (paisagens sonoras do YouTube cadastradas pelo usuário)
-- ---------------------------------------------------------------------------
create table if not exists public.soundscapes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  youtube_video_id text not null,
  category text,
  created_at timestamptz not null default now()
);

alter table public.soundscapes enable row level security;

create policy "soundscapes: select own" on public.soundscapes
  for select using (auth.uid() = user_id);

create policy "soundscapes: insert own" on public.soundscapes
  for insert with check (auth.uid() = user_id);

create policy "soundscapes: update own" on public.soundscapes
  for update using (auth.uid() = user_id);

create policy "soundscapes: delete own" on public.soundscapes
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_method_settings (duração customizada / favoritos por método)
-- ---------------------------------------------------------------------------
create table if not exists public.user_method_settings (
  user_id uuid not null references auth.users (id) on delete cascade,
  method_key text not null,
  custom_duration_seconds integer,
  favorite boolean not null default false,
  primary key (user_id, method_key)
);

alter table public.user_method_settings enable row level security;

create policy "method_settings: select own" on public.user_method_settings
  for select using (auth.uid() = user_id);

create policy "method_settings: upsert own" on public.user_method_settings
  for insert with check (auth.uid() = user_id);

create policy "method_settings: update own" on public.user_method_settings
  for update using (auth.uid() = user_id);

create policy "method_settings: delete own" on public.user_method_settings
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- sessions (histórico de meditações concluídas/abandonadas)
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  method_key text not null,
  method_label text not null,
  planned_duration_seconds integer not null,
  actual_duration_seconds integer not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  completed boolean not null default false,
  soundscape_id uuid references public.soundscapes (id) on delete set null
);

alter table public.sessions enable row level security;

create policy "sessions: select own" on public.sessions
  for select using (auth.uid() = user_id);

create policy "sessions: insert own" on public.sessions
  for insert with check (auth.uid() = user_id);

create policy "sessions: update own" on public.sessions
  for update using (auth.uid() = user_id);

create policy "sessions: delete own" on public.sessions
  for delete using (auth.uid() = user_id);

create index if not exists sessions_user_started_at_idx
  on public.sessions (user_id, started_at desc);
