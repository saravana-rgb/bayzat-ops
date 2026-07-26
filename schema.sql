-- ============================================================
-- Bayzat Ops — schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run: everything is create-if-not-exists or replace.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Working-day maths lives here, so every client agrees on dates.
-- KSA runs Fri–Sat, everywhere else Sat–Sun.
-- ------------------------------------------------------------
create or replace function add_working_days(start_date date, n int, fri_weekend boolean default false)
returns date language plpgsql immutable as $$
declare d date := start_date; added int := 0; dow int;
begin
  while added < n loop
    d := d + 1;
    dow := extract(dow from d);            -- 0 Sun … 6 Sat
    if fri_weekend then
      if dow not in (5, 6) then added := added + 1; end if;
    else
      if dow not in (6, 0) then added := added + 1; end if;
    end if;
  end loop;
  return d;
end $$;

create or replace function is_ksa(loc text)
returns boolean language sql immutable as $$
  select coalesce(loc, '') ~* 'saudi|ksa|riyadh|jeddah|dammam|khobar|mecca|medina';
$$;

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------
create table if not exists tickets (
  id              uuid primary key default gen_random_uuid(),
  ref             text unique not null,
  source_key      text unique not null,          -- first|last|doj, stops IMPORTRANGE re-reads duplicating
  first_name      text not null,
  last_name       text default '',
  doj             date not null,
  location        text default '',
  laptop_required boolean default true,
  due_date        date not null,
  status          text not null default 'open' check (status in ('open','closed')),
  closed_at       timestamptz,
  created_at      timestamptz default now()
);

create table if not exists ticket_steps (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references tickets(id) on delete cascade,
  position    int not null,
  label       text not null,
  status      text not null default 'todo' check (status in ('todo','progress','done','na')),
  detail      text default '',                   -- device type on the device step
  note        text default '',
  updated_at  timestamptz default now(),
  updated_by  text,
  unique (ticket_id, position)
);

create index if not exists idx_steps_ticket on ticket_steps(ticket_id);
create index if not exists idx_tickets_status on tickets(status, due_date);

-- ------------------------------------------------------------
-- The six steps. Change this list and new tickets pick it up.
-- ------------------------------------------------------------
-- "position" is reserved in a returns-table list, so the columns are named
-- pos/step_label here. The ticket_steps column itself stays "position".
create or replace function onboarding_steps()
returns table(pos int, step_label text) language sql immutable as $$
  values (1,'ID created'), (2,'Device allocated'), (3,'Drata configured'),
         (4,'Google + Slack groups'), (5,'Team access granted'), (6,'VPN set up')
$$;

-- ------------------------------------------------------------
-- One call creates the ticket and its checklist, or does nothing
-- if that joiner already exists. Called by Apps Script.
-- ------------------------------------------------------------
create or replace function create_ticket(
  p_first text, p_last text, p_doj date, p_location text, p_laptop boolean
) returns json language plpgsql security definer as $$
declare
  v_key text; v_id uuid; v_ref text; v_due date; s record;
begin
  v_key := lower(regexp_replace(p_first || '|' || coalesce(p_last,'') || '|' || p_doj::text, '\s', '', 'g'));

  select id into v_id from tickets where source_key = v_key;
  if v_id is not null then
    return json_build_object('created', false, 'ref', (select ref from tickets where id = v_id));
  end if;

  v_due := add_working_days(p_doj, 5, is_ksa(p_location));
  v_ref := 'ONB-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));

  insert into tickets (ref, source_key, first_name, last_name, doj, location, laptop_required, due_date)
  values (v_ref, v_key, p_first, coalesce(p_last,''), p_doj, coalesce(p_location,''), coalesce(p_laptop,true), v_due)
  returning id into v_id;

  for s in select * from onboarding_steps() loop
    insert into ticket_steps (ticket_id, position, label, status, detail)
    values (
      v_id, s.pos, s.step_label,
      case when s.pos = 2 and p_laptop is false then 'na' else 'todo' end,
      case when s.pos = 2 then (case when p_laptop then 'Company laptop' else 'Personal device' end) else '' end
    );
  end loop;

  return json_build_object('created', true, 'ref', v_ref, 'due', v_due,
                           'name', trim(p_first || ' ' || coalesce(p_last,'')),
                           'location', coalesce(p_location,''), 'laptop', coalesce(p_laptop,true),
                           'doj', p_doj);
end $$;

-- ------------------------------------------------------------
-- A ticket closes itself the moment every step reads done or na,
-- and reopens if anyone moves a step back. Enforced in the database,
-- so it holds no matter which client made the change.
-- ------------------------------------------------------------
create or replace function sync_ticket_status() returns trigger language plpgsql as $$
declare v_open int;
begin
  select count(*) into v_open from ticket_steps
   where ticket_id = new.ticket_id and status not in ('done','na');

  if v_open = 0 then
    update tickets set status = 'closed', closed_at = coalesce(closed_at, now())
     where id = new.ticket_id and status <> 'closed';
  else
    update tickets set status = 'open', closed_at = null
     where id = new.ticket_id and status <> 'open';
  end if;
  return new;
end $$;

drop trigger if exists trg_sync_ticket_status on ticket_steps;
create trigger trg_sync_ticket_status
  after insert or update of status on ticket_steps
  for each row execute function sync_ticket_status();

-- ------------------------------------------------------------
-- What the follow-up email and the board both read.
-- ------------------------------------------------------------
create or replace view v_pending_steps as
  select t.ref, t.first_name, t.last_name,
         trim(t.first_name || ' ' || t.last_name) as name,
         t.location, t.doj, t.due_date,
         (t.due_date - current_date) as days_left,
         s.position as step_position, s.label, s.status, s.note
    from tickets t
    join ticket_steps s on s.ticket_id = t.id
   where t.status = 'open' and s.status not in ('done','na')
   order by t.due_date, t.first_name, s.position;

-- ------------------------------------------------------------
-- Access: signed-in Bayzat accounts only. Apps Script uses the
-- service key and bypasses this.
-- ------------------------------------------------------------
alter table tickets      enable row level security;
alter table ticket_steps enable row level security;

drop policy if exists bayzat_read_tickets   on tickets;
drop policy if exists bayzat_read_steps     on ticket_steps;
drop policy if exists bayzat_write_steps    on ticket_steps;

create policy bayzat_read_tickets on tickets for select to authenticated
  using ( (auth.jwt() ->> 'email') like '%@bayzat.com' );

create policy bayzat_read_steps on ticket_steps for select to authenticated
  using ( (auth.jwt() ->> 'email') like '%@bayzat.com' );

create policy bayzat_write_steps on ticket_steps for update to authenticated
  using ( (auth.jwt() ->> 'email') like '%@bayzat.com' )
  with check ( (auth.jwt() ->> 'email') like '%@bayzat.com' );

grant select on v_pending_steps to authenticated;
