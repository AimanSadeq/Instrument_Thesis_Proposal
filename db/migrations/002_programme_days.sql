-- 002. The programme is not always four days.
--
-- 001 hard-coded four: training_day was checked against 1 to 4, and the
-- cross-programme question R4 was constrained to training_day = 4. The
-- programme is not always four days, so a three-day room would have been
-- unable to answer R4 at all: the database would have rejected the row.
--
-- The fix keeps the guarantee rather than dropping it. Each reflection now
-- records how many days its programme had, and R4 is constrained to the last
-- of them. That is strictly stronger than 001: a Day 4 submission in a
-- three-day programme is now rejected too, which 001 would have accepted.
--
-- programme_days is cohort-level metadata, shared by everyone in the room in
-- the same way the cohort label is. It carries nothing about a person, and a
-- reflection count cannot be read correctly without it.
--
-- Idempotent, because scripts/migrate.js reapplies every file on every run.

alter table research.daily_reflections
  add column if not exists programme_days smallint not null default 4;

do $$
begin
  -- 001's inline check, named by Postgres. Superseded by the pair below.
  alter table research.daily_reflections
    drop constraint if exists daily_reflections_training_day_check;
  alter table research.daily_reflections
    drop constraint if exists r4_is_day_4_only;

  if not exists (
    select 1 from pg_constraint
     where conrelid = 'research.daily_reflections'::regclass
       and conname = 'programme_days_in_range'
  ) then
    alter table research.daily_reflections
      add constraint programme_days_in_range
      check (programme_days between 2 and 6);
  end if;

  if not exists (
    select 1 from pg_constraint
     where conrelid = 'research.daily_reflections'::regclass
       and conname = 'training_day_within_programme'
  ) then
    alter table research.daily_reflections
      add constraint training_day_within_programme
      check (training_day between 1 and programme_days);
  end if;

  if not exists (
    select 1 from pg_constraint
     where conrelid = 'research.daily_reflections'::regclass
       and conname = 'r4_is_final_day_only'
  ) then
    alter table research.daily_reflections
      add constraint r4_is_final_day_only
      check (r4 is null or training_day = programme_days);
  end if;
end
$$;

comment on column research.daily_reflections.programme_days is
  'Training days in this cohort''s programme. Cohort-level, not personal. R4 is answerable only on the last of them.';
