# Deployment

Target: deployed and tested by **3 September 2026**, first live use **6 September 2026**.

## 1. Supabase

1. Create a **new** Supabase project. Not the FinPlay project, and not a new
   schema inside it. Separate project, separate database, separate credentials.
2. Open the SQL editor and run `db/migrations/001_init.sql`. It creates the
   `research` schema, the four tables, and revokes the API roles' access.
   Running it twice is safe.
3. Copy the **direct connection string** (Project settings → Database →
   Connection string → URI). That is `DATABASE_URL`. The application uses a
   direct Postgres connection, so no anon key, no service-role key and no
   PostgREST surface is involved at any point.
4. Confirm the tables are in `research`, not `public`. Supabase exposes only
   `public` through its REST API, so a schema outside it has no HTTP surface
   even if a key leaked.
5. While in the dashboard, note the answers to outstanding item **O2** in
   `VERIFICATION.md`: `log_connections`, `log_statement` and log retention.

**The certificate.** Expect `DATABASE_SSL=verify` to fail against the Supabase
pooler with `SELF_SIGNED_CERT_IN_CHAIN` in the service log. The pooler presents
a chain signed by Supabase's own root, which is not in Node's default trust
store. This happened on the first deployment and the fix takes five minutes:

1. Supabase → Settings → Database → SSL Configuration → **Download
   certificate** (`prod-ca-2021.crt`).
2. Render → the service → Environment → **Secret Files** → add
   `prod-ca-2021.crt` with the full certificate text, `BEGIN` and `END` lines
   included. Render mounts it at `/etc/secrets/prod-ca-2021.crt`.
3. Set `DATABASE_SSL=ca` and `DATABASE_CA_CERT=/etc/secrets/prod-ca-2021.crt`.
4. Save, redeploy if Render does not do it itself, and reload `/admin`.

The application then trusts exactly one certificate, Supabase's, and still
verifies the connection fully. Pasting the certificate text straight into
`DATABASE_CA_CERT` works too; the code accepts a path or the certificate.

Do not reach for `rejectUnauthorized: false`, which most guides suggest and
which this codebase deliberately cannot do. It would leave the connection
encrypted but unauthenticated, and participant text travels over it.

## 2. Render

The quickest path is the blueprint: **New → Blueprint**, point it at this
repository, and `render.yaml` supplies the region, runtime, build and start
commands, health check path and auto-deploy setting. It generates both
secrets, takes the public address from the service itself, and asks you for
one value only: `DATABASE_URL`. Read the generated `ADMIN_SECRET` and
`EXPORT_SECRET` from the Environment tab afterwards; the facilitator is given
`ADMIN_SECRET` and only `ADMIN_SECRET`.

To create the service by hand instead:

1. New Web Service from this repository.
2. Region: a **United States** region. The protocol discloses United States
   hosting; deploying elsewhere would make that disclosure untrue.
3. Build `npm ci --omit=dev`, start `node src/server.js`, health check `/healthz`.
4. Environment variables:

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | the Supabase direct connection string |
   | `DATABASE_SSL` | `verify`, or `ca` with `DATABASE_CA_CERT` |
   | `COLLECTION_TIMEZONE` | `Asia/Riyadh`, or the zone the programme runs in |
   | `COHORT` | `cohort-1`, then `cohort-2` before the October programme |
   | `ADMIN_SECRET` | facilitator secret, counts only |
   | `EXPORT_SECRET` | researcher secret, export and delete. **Must differ** |
   | `INSTRUMENTS_OPEN` | `true` during a programme, `false` between them |
   | `PUBLIC_URL` | the public address, used only for links and QR codes |

   The service refuses to start in production if `DATABASE_URL`, `ADMIN_SECRET`
   or `EXPORT_SECRET` is missing, or if the two secrets are the same.

5. A short URL is worth arranging: participants type it from a screen. Either a
   custom domain on Render or a short redirect the client's IT can host.

## 3. After deploying, before the first session

```bash
DATABASE_URL='…' npm run verify:privacy    # schema and source checks
BASE_URL='https://…' npm run screenshots   # re-captures evidence, re-checks browser storage
```

Then, by hand:

- Open `/`, `/pre`, `/daily`, `/eval` in both languages on a phone.
- Submit one test response to each instrument.
- `DATABASE_URL='…' npm run verify:rows` and read the rows that come back.
- Delete the test data: `/admin` with the export secret, then the delete-all
  form. Confirm the counts return to zero before the first real session.
- Print every instrument in both languages for the paper fallback.

## 4. Between cohorts

1. Export both formats and check the row counts against the admin counts.
2. Store the export where the data management plan says it goes.
3. Delete all source records through the admin page.
4. Change `COHORT` to `cohort-2` and redeploy.

## 5. After the second cohort

1. Final export, counts checked.
2. Delete all source records.
3. Confirm the tables are empty, then delete the Supabase project and the
   Render service. The protocol commits to no research data remaining on third
   party infrastructure beyond the collection period, and an empty table in a
   live project is not the same as no project.
