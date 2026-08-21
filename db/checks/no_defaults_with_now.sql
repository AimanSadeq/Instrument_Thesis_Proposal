-- Must return zero rows. Proves that no column defaults to a clock reading.
select table_name, column_name, column_default
from information_schema.columns
where table_schema = 'research'
  and column_default is not null
  and (column_default ilike '%now()%'
       or column_default ilike '%current_timestamp%'
       or column_default ilike '%current_date%'
       or column_default ilike '%clock_timestamp%'
       or column_default ilike '%transaction_timestamp%');
