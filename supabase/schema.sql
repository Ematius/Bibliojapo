-- El esquema de Bibliojapo. Se ejecuta entero en el editor SQL del panel y es
-- idempotente: volver a lanzarlo no rompe nada.
--
-- Solo guarda lo que es DEL USUARIO. El temario —kana, palabras, frases— sigue en
-- `content/` y sube a tablas cuando haya que servir el tomo 2, no antes.

-- ---------------------------------------------------------------------------
-- Perfiles
-- ---------------------------------------------------------------------------

-- `auth.users` ya guarda el correo, la contraseña y con qué proveedor se entró.
-- Aquí va lo único que no cubre: el nombre que se enseña en el carné.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  created_at timestamptz not null default now()
);

-- El perfil nace con la cuenta. Sin esto, entrar con Google dejaría a alguien sin
-- fila de perfil y el carné sin nombre que enseñar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Sellos
-- ---------------------------------------------------------------------------

-- Una fila por sello, no un JSON por usuario: así subir un sello es un INSERT y no
-- leer, mezclar y reescribir el progreso entero.
--
-- `block_id` y `exam_id` van sin clave ajena porque el catálogo todavía vive en el
-- código. Cuando el temario esté en tablas, aquí entra la FK.
create table if not exists public.seals (
  user_id uuid not null references auth.users (id) on delete cascade,
  block_id text not null,
  exam_id text not null,
  sealed_at timestamptz not null default now(),
  primary key (user_id, block_id, exam_id)
);

create index if not exists seals_user_block_idx
  on public.seals (user_id, block_id);

-- ---------------------------------------------------------------------------
-- Insignias
-- ---------------------------------------------------------------------------

-- Las da el servidor al recibir el sello del examen final. El cliente NO escribe
-- aquí: no hay política de insert, update ni delete, así que la única vía es el
-- trigger de abajo.
create table if not exists public.badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  block_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, block_id)
);

create or replace function public.grant_badge_on_final_seal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.exam_id = 'final' then
    insert into public.badges (user_id, block_id)
    values (new.user_id, new.block_id)
    on conflict (user_id, block_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_final_seal on public.seals;
create trigger on_final_seal
  after insert on public.seals
  for each row execute function public.grant_badge_on_final_seal();

-- ---------------------------------------------------------------------------
-- Avisos de Contacta
-- ---------------------------------------------------------------------------

-- Se escribe sin cuenta a propósito: un fallo se cuenta igual. Por eso `account_id`
-- admite null y `anon` puede insertar.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  -- Lo pone el servidor, no el navegador: así un aviso no se puede firmar con la
  -- cuenta de otro. Queda null cuando se escribe sin cuenta, que se puede.
  account_id uuid default auth.uid() references auth.users (id) on delete set null,
  kind text not null check (kind in ('bug', 'idea', 'other')),
  message text not null check (length(message) between 1 and 5000),
  email text not null default '',
  route text not null default '',
  user_agent text not null default '',
  viewport text not null default '',
  sent_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.seals    enable row level security;
alter table public.badges   enable row level security;
alter table public.feedback enable row level security;

drop policy if exists "profiles: leer lo propio"     on public.profiles;
drop policy if exists "profiles: cambiar lo propio"  on public.profiles;
drop policy if exists "seals: leer lo propio"        on public.seals;
drop policy if exists "seals: sellar lo propio"      on public.seals;
drop policy if exists "badges: leer lo propio"       on public.badges;
drop policy if exists "feedback: escribir y punto"   on public.feedback;

create policy "profiles: leer lo propio" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "profiles: cambiar lo propio" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "seals: leer lo propio" on public.seals
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "seals: sellar lo propio" on public.seals
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "badges: leer lo propio" on public.badges
  for select to authenticated using ((select auth.uid()) = user_id);

-- Nadie los lee desde la app: se leen desde el panel, que va por `service_role`.
create policy "feedback: escribir y punto" on public.feedback
  for insert to anon, authenticated
  with check (account_id is null or account_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

-- Hacen falta a mano porque el proyecto se creó SIN exponer las tablas nuevas de
-- forma automática. Sin esto, una tabla con sus políticas correctas responde 401.
-- Los permisos abren la puerta; quién pasa lo siguen decidiendo las políticas.
grant usage on schema public to anon, authenticated;

grant select, update            on public.profiles to authenticated;
grant select, insert            on public.seals    to authenticated;
grant select                    on public.badges   to authenticated;
grant insert                    on public.feedback to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Aviso por correo de Contacta
-- ---------------------------------------------------------------------------

-- El panel de Database Webhooks falla en este proyecto con «schema
-- supabase_functions does not exist» —un hueco de aprovisionamiento de Supabase,
-- no nuestro—, así que el disparo va por un trigger propio con pg_net en vez de
-- por esa UI. El secreto compartido con la función vive en Vault, nunca aquí: se
-- guarda una sola vez desde el SQL Editor con `vault.create_secret(...)` y esa
-- consulta NO se commitea.
create extension if not exists pg_net;

create or replace function public.notify_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'feedback_webhook_secret';

  perform net.http_post(
    url := 'https://jfrgxqskgxnqgoxmtnjr.supabase.co/functions/v1/notify-feedback',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$;

drop trigger if exists on_feedback_insert on public.feedback;
create trigger on_feedback_insert
  after insert on public.feedback
  for each row execute function public.notify_feedback();
