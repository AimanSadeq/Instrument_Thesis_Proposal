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
   | `COHORT` | This cohort's label: `elm`, `nupco1`, `nupco2`. Lowercase letters, digits and hyphens, 2 to 40 characters; the service refuses to start otherwise, and refuses to start in production if it is not set at all. Matches the FinPlay cohort subdomain so one name means one group across both systems. |
   | `PROGRAMME_DAYS` | Training days in this cohort's programme. Defaults to `4`. Set `3` for a three-day programme. Decides the day selector and which day carries R4. Two cohorts of different lengths running at once need two services. |
   | `ADMIN_SECRET` | facilitator secret, counts only |
   | `EXPORT_SECRET` | researcher secret, export and delete. **Must differ** |
   | `INSTRUMENTS_OPEN` | `true` during a programme, `false` between them |
   | `PUBLIC_URL` | the public address, used only for links and QR codes |

   The service refuses to start in production if `DATABASE_URL`, `ADMIN_SECRET`,
   `EXPORT_SECRET` or `COHORT` is missing, or if the two secrets are the same.
   `COHORT` is on that list because a second service is made by copying the
   first, and a service that inherited a default label would write a whole
   cohort's rows under another cohort's name with nothing to separate them
   afterwards. Refusing to start is the only failure mode that can be repaired.

5. A short URL is worth arranging: participants type it from a screen. Either a
   custom domain on Render or a short redirect the client's IT can host.

## 2a. A blueprint overwrites the dashboard

If the service is connected to a blueprint with auto sync on, every value in
`render.yaml` is pushed over whatever the dashboard holds. On 23 August 2026 a
sync pushed `DATABASE_SSL: verify` over a working `ca`, and every database call
began failing. The cohort-1 service was therefore disconnected from its
blueprint and is managed from the dashboard.

So: use the blueprint to create a service, then either disconnect it or keep
`render.yaml` correct. Do not leave a stale file connected to a live service in
the middle of a collection period.

## 3. After deploying, before the first session

```bash
DATABASE_URL='…' npm run verify:privacy    # schema and source checks
BASE_URL='https://…' npm run screenshots   # re-captures evidence, re-checks browser storage
```

Then, by hand:

- Open `/`, `/pre`, `/daily`, `/eval` in both languages on a phone.
- Submit one test response to each instrument.
- `DATABASE_URL='…' npm run verify:rows` and read the rows that come back. If
  Node is not to hand, paste `db/checks/inspect_rows.sql` into the Supabase SQL
  editor instead: it prints every stored row with a verdict on whether anything
  carries a time, an address or a user agent.
- Delete the test data: `/admin` with the export secret, then the delete-all
  form. Confirm the counts return to zero before the first real session.
- Print every instrument in both languages for the paper fallback.

## Live services, as of 25 August 2026

A dated record, because the dashboard is the source of truth and this file otherwise
only says how to build one.

| Service | Cohort label | Days | Serves |
|---|---|---|---|
| instrument-platform (the original) | `cohort-1` | 4 | ELM, 6 to 9 September |
| nupco-instrument-thesis-proposal.onrender.com | `nupco1`, then `nupco2` per section J | 3 | both NUPCO cohorts |

Post-deploy check run against `nupco1` on 25 August: nine passes, no rows in any cohort.

The original service still carries the label `cohort-1` rather than `elm`. If it is to be
renamed to match the FinPlay subdomain, the change must happen while the database holds no
rows, because a label change after collection starts splits one cohort into two datasets
with nothing to join them. As of 25 August the database is empty, so the rename is safe
now and only now.

## 3a. Two cohorts at once

Two cohorts start on 6 September: a four-day programme and a three-day one, in
different organizations, with different facilitators. `COHORT` and
`PROGRAMME_DAYS` are read once at start-up, so one service cannot serve both.
Stand up a second service.

They can share the Supabase database. Everything a service reads or deletes is
scoped to its own `COHORT`: the admin counts, both export formats, and the
delete. A researcher exporting one cohort and then deleting cannot touch the
other's rows, and neither facilitator sees the other's room. That is enforced in
`src/db.js` and asserted in `tests/cohort-isolation.test.js`, including a test
that the delete endpoint reaches no further than the library function does.

**Creating the second service, in the Render dashboard rather than the
blueprint.** Reconnecting a blueprint overwrites dashboard values, which is how
`DATABASE_SSL` was broken once already (section 2a). So do this by hand:

1. New web service from the same repository, same United States region, same
   build and start commands, `autoDeploy` off.
2. Copy `DATABASE_URL`, `DATABASE_SSL` and `DATABASE_CA_CERT` from the first
   service. Same database, deliberately. **If `DATABASE_CA_CERT` is a path**
   such as `/etc/secrets/prod-ca-2021.crt`, copying the variable is not enough:
   Secret Files belong to one service. Add the certificate to this service's
   own Secret Files as well, or the service will refuse to start and say it
   cannot read the certificate. Pasting the certificate text into the variable
   instead avoids the second step entirely.
3. Set `COHORT` to this cohort's label and `PROGRAMME_DAYS` to that
   programme's length. September: `elm` with `4`, and `nupco1` with `3`. The
   labels match the FinPlay cohort subdomains on purpose, so one name means one
   group in both systems and in the run sheets. The service will not start
   without `COHORT`, so a service copied from the other one fails loudly rather
   than quietly collecting into the wrong dataset.
4. Generate **new** `ADMIN_SECRET` and `EXPORT_SECRET`. Do not copy them. The
   facilitator of one cohort has no business holding the other's secret, and the
   delete confirmation phrase is now `DELETE <cohort>`, which is only a
   safeguard if the two labels differ.
5. Set `PUBLIC_URL` to this service's own hostname, or the QR codes will send a
   room to the other cohort's forms.
6. Before opening it: run `db/checks/post_deploy_check.sql` with the cohort at
   the top edited to this cohort. Check 9 asks whether *this* cohort has rows
   yet, and its detail column lists every cohort in the database, so a live
   cohort next door reads as information rather than as a failure.

**On the day**, keep them apart: two admin pages, two sets of QR codes, and the
admin header on each states its cohort, its programme length, and which day
will carry R4. Read that header before displaying anything.

## 4. Between cohorts

1. Export both formats and check the row counts against the admin counts.
2. Store the export where the data management plan says it goes.
3. Delete this cohort's source records through the admin page. The confirmation
   phrase is `DELETE ` followed by the cohort label.
4. For a cohort that follows on the same service, change `COHORT` and, if the
   length differs, `PROGRAMME_DAYS`, then redeploy. In September that is
   `nupco1` to `nupco2`, between 8 and 13 September. **This is not optional and
   it cannot be repaired afterwards.** `COHORT` is read once at start-up, so a
   second cohort begun under the previous label writes into the same dataset,
   and no identifier or linkage exists to separate the two. The admin page now
   warns when the configured cohort already holds rows from an earlier day;
   heed it before anyone opens a link.

## 5. After the second cohort

1. Final export, counts checked.
2. Delete all source records.
3. Confirm the tables are empty **across every cohort**, not only the one you
   just exported. With more than one service on one database, an empty count on
   your own admin page says nothing about the others.
4. Then delete the Supabase project and every Render service. The protocol
   commits to no research data remaining on third party infrastructure beyond
   the collection period, and an empty table in a live project is not the same
   as no project.
