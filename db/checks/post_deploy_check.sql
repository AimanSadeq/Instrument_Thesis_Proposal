-- One paste, run in the Supabase SQL editor after the migration.
-- Every row must read 'pass'. Anything else is a finding, not a warning.
--
-- EDIT THE COHORT BELOW to the one you are about to open. Check 9 asks whether
-- that cohort has any rows yet, not whether the tables are empty: another
-- cohort may be running in the same week, or may be exported but not yet
-- deleted, and its rows are none of this service's business. The detail column
-- names every cohort present, so you can see what else is in the database.

with target as (select 'elm'::text as cohort),

checks as (

  select 1 as ord, 'four tables exist in the research schema' as check_name,
         count(*)::text as detail,
         (count(*) = 4) as ok
    from information_schema.tables
   where table_schema = 'research'

  union all
  select 2, 'no column can hold a time component',
         coalesce(string_agg(table_name || '.' || column_name, ', '), 'none'),
         (count(*) = 0)
    from information_schema.columns
   where table_schema = 'research'
     and data_type in ('timestamp with time zone', 'timestamp without time zone',
                       'time with time zone', 'time without time zone', 'interval')

  union all
  select 3, 'no column defaults to a clock reading',
         coalesce(string_agg(table_name || '.' || column_name, ', '), 'none'),
         (count(*) = 0)
    from information_schema.columns
   where table_schema = 'research'
     and column_default is not null
     and (column_default ilike '%now()%'
          or column_default ilike '%current_timestamp%'
          or column_default ilike '%current_date%'
          or column_default ilike '%clock_timestamp%')

  union all
  select 4, 'no column is named for an identity, device, address or link',
         coalesce(string_agg(table_name || '.' || column_name, ', '), 'none'),
         (count(*) = 0)
    from information_schema.columns
   where table_schema = 'research'
     and column_name ~* '(ip|addr|agent|referr|session|token|cookie|device|fingerprint|participant|user|email|name|employee|finplay|created_at|updated_at|submitted_at|timestamp)'

  union all
  select 5, 'no foreign key joins one instrument to another',
         coalesce(string_agg(conname, ', '), 'none'),
         (count(*) = 0)
    from pg_constraint
   where contype = 'f' and connamespace = 'research'::regnamespace

  union all
  select 6, 'row level security is on for all four tables',
         count(*)::text,
         (count(*) = 4)
    from pg_tables
   where schemaname = 'research' and rowsecurity

  union all
  select 7, 'no table is exposed in the public schema',
         coalesce(string_agg(tablename, ', '), 'none'),
         (count(*) = 0)
    from pg_tables
   where schemaname = 'public'

  union all
  select 8, 'no table anywhere is named for FinPlay',
         coalesce(string_agg(table_schema || '.' || table_name, ', '), 'none'),
         (count(*) = 0)
    from information_schema.tables
   where table_name ilike '%finplay%'

  union all
  select 9, 'no rows exist yet for the cohort about to start',
         (select coalesce(string_agg(cohort || ': ' || n, ', ' order by cohort),
                          'no rows in any cohort')
            from (select cohort, count(*)::text as n from research.consent_responses group by 1
                  union all
                  select cohort, count(*)::text from research.pre_training_responses group by 1
                  union all
                  select cohort, count(*)::text from research.daily_reflections group by 1
                  union all
                  select cohort, count(*)::text from research.post_training_evaluations group by 1) per),
         (select (select count(*) from research.consent_responses where cohort = (select cohort from target))
               + (select count(*) from research.pre_training_responses where cohort = (select cohort from target))
               + (select count(*) from research.daily_reflections where cohort = (select cohort from target))
               + (select count(*) from research.post_training_evaluations where cohort = (select cohort from target))) = 0
)
select case when ok then 'pass' else 'FAIL' end as result,
       check_name,
       detail
  from checks
 order by ord;
