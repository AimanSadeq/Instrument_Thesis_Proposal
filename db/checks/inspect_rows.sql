-- Paste into the Supabase SQL editor after making test submissions.
--
-- Shows every stored row as it actually is, alongside a per-row verdict on the
-- property the protocol depends on: that nothing carries a time of day. Read
-- the rows themselves as well as the verdict. What should be visible is a
-- random id, the cohort, a plain calendar date, the training day where it
-- applies, and the answers. Nothing else.

with everything as (
  select 'consent_responses'         as instrument, to_jsonb(t) as stored_row from research.consent_responses t
  union all
  select 'pre_training_responses',        to_jsonb(t) from research.pre_training_responses t
  union all
  select 'daily_reflections',             to_jsonb(t) from research.daily_reflections t
  union all
  select 'post_training_evaluations',     to_jsonb(t) from research.post_training_evaluations t
)
select
  instrument,
  case
    when stored_row::text ~ '\d{2}:\d{2}'                     then 'FAIL: a time of day is stored'
    when stored_row::text ~ 'T\d{2}'                          then 'FAIL: an ISO timestamp is stored'
    when stored_row::text ~ '\y\d{1,3}(\.\d{1,3}){3}\y'       then 'FAIL: something looks like an IP address'
    when stored_row::text ~* '(Mozilla|AppleWebKit|Android|iPhone OS)' then 'FAIL: a user agent is stored'
    when stored_row ->> 'submission_date' !~ '^\d{4}-\d{2}-\d{2}$'    then 'FAIL: the date is not a plain calendar date'
    else 'pass'
  end as verdict,
  stored_row
from everything
order by instrument, stored_row ->> 'id';
