-- Ejecuta este archivo en Supabase > SQL Editor (una sola vez).

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  hidden text[] not null default '{}',   -- asignaturas optativas que el usuario NO cursa
  created_at timestamptz not null default now()
);
create table if not exists public.reminders_sent (
  event_id text not null,
  for_date date not null,
  sent_at timestamptz not null default now(),
  primary key (event_id, for_date)
);
-- Sin políticas: nadie puede leer ni escribir las tablas desde la web; solo las funciones de abajo y la Edge Function.
alter table public.push_subscriptions enable row level security;
alter table public.reminders_sent enable row level security;

create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_hidden text[])
returns void language sql security definer set search_path=public as $$
  insert into public.push_subscriptions(endpoint,p256dh,auth,hidden) values (p_endpoint,p_p256dh,p_auth,coalesce(p_hidden,'{}'))
  on conflict (endpoint) do update set p256dh=excluded.p256dh, auth=excluded.auth, hidden=excluded.hidden;
$$;
create or replace function public.delete_push_subscription(p_endpoint text)
returns void language sql security definer set search_path=public as $$
  delete from public.push_subscriptions where endpoint=p_endpoint;
$$;
grant execute on function public.save_push_subscription(text,text,text,text[]) to anon, authenticated;
grant execute on function public.delete_push_subscription(text) to anon, authenticated;

-- Programación diaria (16:00 UTC ≈ 17:00-18:00 en Valencia).
-- Cambia CAMBIA_ESTE_SECRETO por el mismo valor que pongas en el secreto CRON_SECRET de la función.
create extension if not exists pg_net;
create extension if not exists pg_cron;
select cron.schedule('exam-reminders','0 16 * * *', $$
  select net.http_post(
    url:='https://acasopanmjzlllsacitx.supabase.co/functions/v1/send-exam-reminders',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret','nexpreso1'),
    body:='{}'::jsonb);
$$);
