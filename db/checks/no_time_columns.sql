-- Must return zero rows. Proves that no column in the research schema can
-- hold a time component (build brief section 3.4).
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'research'
  and data_type in ('timestamp with time zone', 'timestamp without time zone',
                    'time with time zone', 'time without time zone', 'interval');
