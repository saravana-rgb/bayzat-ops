# Bayzat Ops

Internal tile app for the IT and People teams. Tile one is the onboarding
tracker; the shell is built so tile two is a folder and a registry entry.

## How the pieces fit

```
Google Sheet (IMPORTRANGE)
        │  Apps Script, every 5 minutes
        ▼
   Supabase  ── Postgres holds tickets, due dates, auto-close, access rules
        ▲
        │  the team reads and updates here
   Vercel (Next.js)
```

**Apps Script** is the only piece that can watch an IMPORTRANGE tab, because a
row arriving by formula is not a user edit and never fires `onEdit`. It polls,
pushes new joiners into Supabase, and sends both emails from your Workspace
account. **Supabase** owns the rules: due dates are computed in SQL, a ticket
closes itself when the last step is done, and row level security limits access
to `@bayzat.com` accounts. **Vercel** serves the UI. All three tiers are free at
your volume.

## Deploy — about 30 minutes

### 1. Supabase

1. supabase.com → new project. Note the region; pick one near Dubai.
2. SQL Editor → New query → paste all of `supabase/schema.sql` → Run.
3. Authentication → Providers → enable **Google**. Follow its instructions to
   create an OAuth client in Google Cloud, and add the callback URL Supabase
   shows you.
4. Authentication → URL Configuration → set Site URL to your Vercel URL once
   you have it (step 2), and add `http://localhost:3000` for local work.
5. Project Settings → API. You need two values:
   - **Project URL** and **anon key** → go to Vercel.
   - **service_role key** → goes to Apps Script only. It bypasses row level
     security, so it must never appear in the web app or in git.

### 2. Vercel

1. Push this folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo. Framework detects as Next.js.
3. Environment Variables, both for all environments:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Put the resulting URL into Supabase Site URL and into the Apps
   Script `APP_URL` so the emails link straight to the tracker.

### 3. Apps Script

1. Open the joiners sheet → Extensions → Apps Script.
2. Delete the placeholder, paste `apps-script/ingest.gs`, save.
3. Project Settings → Script Properties → add:
   - `SUPABASE_URL` — the project URL
   - `SUPABASE_SERVICE_KEY` — the service_role key
4. Project Settings → time zone → **Asia/Dubai**.
5. Edit the `CONFIG` block: `EMAIL_TO` is already yours, add `APP_URL`.
6. Run `setup`, approve the permissions prompt (Advanced → Go to project → Allow).

## Test it

Add one row to the joiners tab:

| First name | Last name | DOJ | Location | Laptop request |
|---|---|---|---|---|
| Test | Joiner | 7/25/2026 | Dubai | Yes |

Then Onboarding menu → **Check my setup** (confirms the columns it found and
that Supabase is reachable) → **Check for new joiners now**.

Expect: a ticket in Supabase with due date **2026-07-31** (five working days,
Dubai weekend), an email in your inbox, and the joiner visible in the app.
Run the sync twice — the second run must create nothing. That dedupe is what
makes a five-minute poll safe.

To test the digest today, note `SKIP_WEEKEND_MAIL` returns early on Sat and Sun.

## Adding tile two

1. `app/<slug>/page.js` — copy the shape of `app/onboarding/page.js`.
2. An entry in `lib/tiles.js`.
3. Tables in Supabase with the same RLS pattern as `schema.sql`.

The shell, auth, and styling carry over untouched.

## Things worth knowing

- **Changing the six steps** — edit `onboarding_steps()` in Postgres. New
  tickets pick it up; existing tickets keep the steps they were created with.
- **Due date rule** — `add_working_days(doj, 5, is_ksa(location))`. Saudi
  locations skip Fri–Sat, everywhere else skips Sat–Sun.
- **Date format** — `CONFIG.DATE_ORDER` is `MDY` for `7/25/2026`. Switch to
  `DMY` if the sheet ever changes.
- **Email limits** — `MailApp` allows 1,500/day on Workspace, far above what
  this sends.
- **Two people editing at once** — the board subscribes to Postgres changes, so
  a status set by one person appears on the other's screen without a refresh.
