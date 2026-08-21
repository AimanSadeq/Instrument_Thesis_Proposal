-- Must return zero rows. Proves that no column exists whose name suggests an
-- identity, a device, a session, a network address or a link between rows.
select table_name, column_name
from information_schema.columns
where table_schema = 'research'
  and (column_name ~* '(ip|addr|agent|referr|session|token|cookie|device|fingerprint|participant|user|email|name|employee|finplay|created_at|updated_at|submitted_at|timestamp)');
