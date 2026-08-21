-- Research instrument platform: schema.
--
-- Governing document: Research Protocol and Data Management Plan v1.1.
-- Build brief section 3 constrains this schema absolutely:
--
--   * no participant identifier of any kind, not even a random one
--   * no column that links one submission to another
--   * no IP address, user agent or referrer
--   * no time component anywhere: training day and calendar date only
--
-- Any future migration that adds a timestamp, a device id, a session id or a
-- foreign key between these tables breaks a commitment made in writing to a
-- university. Do not add one.
--
-- The tables live in schema `research`, not `public`. Supabase exposes only
-- `public` through PostgREST by default, so this schema has no HTTP surface
-- at all; the application reaches it over a direct Postgres connection.

create schema if not exists research;

-- gen_random_uuid() is built in from Postgres 13, and present on Supabase.
-- The primary key is random, never sequential: a sequential key would order
-- rows by submission and so reintroduce, in effect, the submission time that
-- section 3.4 forbids.

-- 1. Consent -----------------------------------------------------------------
-- Recorded as an anonymous count. A decline is stored exactly like an
-- agreement, which is what yields a participation rate.
create table if not exists research.consent_responses (
  id              uuid primary key default gen_random_uuid(),
  cohort          text not null,
  submission_date date not null,
  choice          text not null check (choice in ('agree', 'decline'))
);

-- 2. Pre-training questionnaire ----------------------------------------------
create table if not exists research.pre_training_responses (
  id              uuid primary key default gen_random_uuid(),
  cohort          text not null,
  submission_date date not null,
  -- A: background, coarse bands only. Job title and department are absent by
  -- design; see Research Instruments v2.0, part 4, change 3.
  a1 text check (a1 in ('individual_contributor', 'supervisor', 'manager', 'senior_manager', 'prefer_not_to_say')),
  a2 text check (a2 in ('under_5', '5_to_10', '11_to_20', 'over_20', 'prefer_not_to_say')),
  -- B: prior knowledge
  b1 text check (b1 in ('none', 'basic', 'moderate', 'strong', 'expert')),
  b2 text check (b2 in ('yes', 'no')),
  b3 text check (length(b3) <= 5000),
  -- C: prior experience with gamified learning
  c1 text check (c1 in ('yes', 'no')),
  c2 text check (c2 in ('not_at_all', 'somewhat', 'comfortable', 'very')),
  -- D: expectations
  d1 text check (length(d1) <= 5000)
);

-- 3. Daily reflection ---------------------------------------------------------
-- training_day is chosen by the participant, never derived from the date: a
-- session can run late, or a participant can complete on the way home.
create table if not exists research.daily_reflections (
  id              uuid primary key default gen_random_uuid(),
  cohort          text not null,
  submission_date date not null,
  training_day    smallint not null check (training_day between 1 and 4),
  r1 text check (length(r1) <= 5000),
  r2 text check (length(r2) <= 5000),
  r3 text check (length(r3) <= 5000),
  -- R4 is the cross-programme question and exists only on Day 4.
  r4 text check (length(r4) <= 5000),
  constraint r4_is_day_4_only check (r4 is null or training_day = 4)
);

-- 4. Post-training evaluation -------------------------------------------------
create table if not exists research.post_training_evaluations (
  id              uuid primary key default gen_random_uuid(),
  cohort          text not null,
  submission_date date not null,
  a1 smallint check (a1 between 1 and 5),
  a2 smallint check (a2 between 1 and 5),
  a3 smallint check (a3 between 1 and 5),
  a4 smallint check (a4 between 1 and 5),
  a5 smallint check (a5 between 1 and 5),
  b1 smallint check (b1 between 1 and 5),
  b2 smallint check (b2 between 1 and 5),
  b3 smallint check (b3 between 1 and 5),
  b4 smallint check (b4 between 1 and 5),
  b5 smallint check (b5 between 1 and 5),
  c1 smallint check (c1 between 1 and 5),
  c2 smallint check (c2 between 1 and 5),
  c3 smallint check (c3 between 1 and 5),
  c4 smallint check (c4 between 1 and 5),
  d1 text check (length(d1) <= 5000),
  d2 text check (length(d2) <= 5000),
  d3 text check (length(d3) <= 5000),
  d4 text check (length(d4) <= 5000)
);

comment on schema research is
  'Doctoral research instruments. Anonymous at source: no identifier, no linkage, no time component. See docs/VERIFICATION.md.';

-- Indexes support the admin counts view only.
create index if not exists idx_consent_date on research.consent_responses (submission_date);
create index if not exists idx_pre_date on research.pre_training_responses (submission_date);
create index if not exists idx_daily_day on research.daily_reflections (training_day, submission_date);
create index if not exists idx_eval_date on research.post_training_evaluations (submission_date);

-- Hardening for Supabase: even though this schema is not exposed through
-- PostgREST, take the API roles' access away explicitly, and turn on row
-- level security with no policy so that a future exposure grants nothing.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on schema research from anon;
    revoke all on all tables in schema research from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on schema research from authenticated;
    revoke all on all tables in schema research from authenticated;
  end if;
end
$$;

alter table research.consent_responses enable row level security;
alter table research.pre_training_responses enable row level security;
alter table research.daily_reflections enable row level security;
alter table research.post_training_evaluations enable row level security;
