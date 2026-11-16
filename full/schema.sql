-- Pinkas (full version) - Supabase / Postgres schema.
-- Every organization sees only its own rows: enforced by row-level security on the server.

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  role text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id),
  unique (user_id)                      -- one organization per user
);

create table if not exists public.invites (
  token text primary key default (replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','')),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email text not null,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days'
);

create table if not exists public.campaigns (
  org_id uuid not null references public.orgs(id) on delete cascade,
  id text not null,
  name_yi text not null default '', name_en text not null default '',
  goal numeric(12,2) not null default 0,
  start_date date, end_date date,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (org_id, id)
);

create table if not exists public.donors (
  org_id uuid not null references public.orgs(id) on delete cascade,
  id text not null,
  name_yi text not null default '', name_en text not null default '',
  phone text not null default '', email text not null default '',
  address text not null default '', city text not null default '', city_yi text not null default '',
  notes text not null default '',
  created date,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (org_id, id)
);

create table if not exists public.pledges (
  org_id uuid not null references public.orgs(id) on delete cascade,
  id text not null,
  donor_id text not null,
  campaign_id text,
  amount numeric(12,2) not null check (amount > 0),
  date date, due date,
  note text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (org_id, id),
  foreign key (org_id, donor_id) references public.donors(org_id, id) on delete cascade,
  foreign key (org_id, campaign_id) references public.campaigns(org_id, id) on delete set null (campaign_id)
);

create table if not exists public.donations (
  org_id uuid not null references public.orgs(id) on delete cascade,
  id text not null,
  donor_id text not null,
  date date not null,
  amount numeric(12,2) not null check (amount > 0),
  method text not null default 'check',
  check_no text not null default '',
  campaign_id text,
  pledge_id text,
  note text not null default '',
  receipt_no text,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (org_id, id),
  foreign key (org_id, donor_id) references public.donors(org_id, id) on delete cascade,
  foreign key (org_id, campaign_id) references public.campaigns(org_id, id) on delete set null (campaign_id),
  foreign key (org_id, pledge_id) references public.pledges(org_id, id) on delete set null (pledge_id)
);
create index if not exists donations_org_date on public.donations(org_id, date);
create index if not exists donations_org_receipt on public.donations(org_id, receipt_no);

-- updated_at stamps
create or replace function public.touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['orgs','campaigns','donors','pledges','donations'] loop
    execute format('drop trigger if exists touch on public.%I', t);
    execute format('create trigger touch before update on public.%I for each row execute function public.touch()', t);
  end loop;
end $$;

-- receipt numbers: unique per organization, assigned on the server when missing or already taken
create or replace function public.receipt_no() returns trigger language plpgsql set search_path = '' as $$
declare y text := to_char(new.date, 'YYYY'); n int;
begin
  if new.receipt_no is not null and new.receipt_no <> '' and not exists (
       select 1 from public.donations d where d.org_id = new.org_id and d.receipt_no = new.receipt_no and d.id <> new.id) then
    return new;
  end if;
  if exists (select 1 from public.donations d where d.org_id = new.org_id and d.id = new.id and d.receipt_no is not null) then
    -- an update (upsert) of an existing row keeps its own number
    select d.receipt_no into new.receipt_no from public.donations d where d.org_id = new.org_id and d.id = new.id;
    return new;
  end if;
  perform pg_advisory_xact_lock(hashtext(new.org_id::text));
  select coalesce(max(split_part(d.receipt_no, '-', 2)::int), 0) + 1 into n
    from public.donations d where d.org_id = new.org_id and d.receipt_no like y || '-%' and split_part(d.receipt_no, '-', 2) ~ '^\d+$';
  new.receipt_no := y || '-' || lpad(n::text, 4, '0');
  return new;
end $$;
drop trigger if exists receipt_no on public.donations;
create trigger receipt_no before insert on public.donations for each row execute function public.receipt_no();

-- who am I
create or replace function public.my_org() returns uuid language sql stable security definer set search_path = '' as $$
  select org_id from public.members where user_id = auth.uid() limit 1 $$;
create or replace function public.my_role() returns text language sql stable security definer set search_path = '' as $$
  select role from public.members where user_id = auth.uid() limit 1 $$;

-- first sign-in: join by invite, or make a new organization
create or replace function public.pinkas_bootstrap(p_org_name text default null, p_invite text default null)
returns json language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); m record; inv record; oid uuid; nm text;
begin
  if u is null then raise exception 'not_signed_in'; end if;
  select * into m from public.members where user_id = u;
  if found then
    return json_build_object('org_id', m.org_id, 'role', m.role, 'created', false,
      'invite_ignored', p_invite is not null);
  end if;
  if p_invite is not null and p_invite <> '' then
    select * into inv from public.invites where token = p_invite and expires_at > now();
    if not found then raise exception 'invite_invalid'; end if;
    insert into public.members(org_id, user_id, email, role) values (inv.org_id, u, auth.email(), 'member');
    delete from public.invites where token = p_invite;
    return json_build_object('org_id', inv.org_id, 'role', 'member', 'created', false, 'joined', true);
  end if;
  nm := coalesce(nullif(trim(p_org_name), ''), nullif(trim(auth.jwt() -> 'user_metadata' ->> 'org_name'), ''), 'My organization');
  insert into public.orgs(settings, created_by)
    values (jsonb_build_object(case when nm ~ '[֐-׿]' then 'orgYi' else 'orgEn' end, nm), u)
    returning id into oid;
  insert into public.members(org_id, user_id, email, role) values (oid, u, auth.email(), 'owner');
  return json_build_object('org_id', oid, 'role', 'owner', 'created', true);
end $$;
revoke all on function public.pinkas_bootstrap(text, text) from public, anon;
grant execute on function public.pinkas_bootstrap(text, text) to authenticated;

-- row-level security
alter table public.orgs enable row level security;
alter table public.members enable row level security;
alter table public.invites enable row level security;
alter table public.campaigns enable row level security;
alter table public.donors enable row level security;
alter table public.pledges enable row level security;
alter table public.donations enable row level security;

revoke all on public.orgs, public.members, public.invites, public.campaigns, public.donors, public.pledges, public.donations from anon;
grant select, update on public.orgs to authenticated;
grant select, delete on public.members to authenticated;
grant select, insert, delete on public.invites to authenticated;
grant select, insert, update, delete on public.campaigns, public.donors, public.pledges, public.donations to authenticated;

drop policy if exists org_read on public.orgs;
create policy org_read on public.orgs for select to authenticated using (id = (select public.my_org()));
drop policy if exists org_write on public.orgs;
create policy org_write on public.orgs for update to authenticated using (id = (select public.my_org())) with check (id = (select public.my_org()));

drop policy if exists members_read on public.members;
create policy members_read on public.members for select to authenticated using (org_id = (select public.my_org()));
drop policy if exists members_remove on public.members;
create policy members_remove on public.members for delete to authenticated
  using (org_id = (select public.my_org()) and (select public.my_role()) = 'owner' and user_id <> auth.uid());

drop policy if exists invites_read on public.invites;
create policy invites_read on public.invites for select to authenticated using (org_id = (select public.my_org()));
drop policy if exists invites_add on public.invites;
create policy invites_add on public.invites for insert to authenticated
  with check (org_id = (select public.my_org()) and invited_by = auth.uid());
drop policy if exists invites_del on public.invites;
create policy invites_del on public.invites for delete to authenticated using (org_id = (select public.my_org()));

do $$ declare t text; begin
  foreach t in array array['campaigns','donors','pledges','donations'] loop
    execute format('drop policy if exists own_org on public.%I', t);
    execute format('create policy own_org on public.%I for all to authenticated using (org_id = (select public.my_org())) with check (org_id = (select public.my_org()))', t);
  end loop;
end $$;

-- live updates between devices
do $$ declare t text; begin
  foreach t in array array['orgs','campaigns','donors','pledges','donations'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
