# AI Explorers

**Learn AI. Play Smart. Think Critically.**

An educational platform that teaches children (launch audience: ages 8–12) about artificial
intelligence through short lessons, quizzes, XP and daily challenges, with a dashboard for
parents and a content management system for administrators.

This repository is the **first implementation phase**: a working, security-minded foundation.

- [Status](#status-read-this-first)
- [Quick start](#quick-start)
- [Connect Supabase](#connect-supabase)
- [Running tests](#running-tests)
- [Deploy to Vercel](#deploy-to-vercel)
- [How it is built](#how-it-is-built)
- [Security model](#security-model)
- [Editing the curriculum](#editing-the-curriculum)
- [Known limitations](#known-limitations)

---

## Status: read this first

| Area | State |
|---|---|
| Landing page, privacy notice | Built. Verified in a browser at desktop and phone sizes. |
| Database schema, RLS, scoring functions, seed | Built. **Verified** by 184 tests that apply the real migrations to embedded PostgreSQL and attempt unauthorised access. |
| App ↔ database contract | **Verified**: the app's column lists and response schemas are run against the migrated database. |
| Sign-up, login, password reset | Built against Supabase Auth. Logic tested with Supabase stubbed. **Not yet run against a real Supabase project.** |
| Child, parent and admin screens | Built. Layout, keyboard use and accessibility verified through a development preview with sample data. **Not yet run against a real Supabase project.** |
| Video | No videos exist. Lessons show a "Video coming soon" panel and the written lesson. A real player appears only when an administrator attaches a stored video. |

No Supabase project, Docker or Supabase CLI was available while this phase was built, so the
complete signed-in journey has **not** been exercised end to end against live infrastructure.
Two test files for that purpose are ready in `tests/e2e/live` (see its README) and should be
the first thing you run after connecting a project.

There is **no mock backend**. Without Supabase settings, every page that needs accounts or
data shows a "Supabase is not configured" screen.

---

## Quick start

Requires Node.js 20.9 or newer (built with Node 24) and npm.

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000>.

Without Supabase you can see:

- the landing page at `/`
- the signed-in screens with clearly labelled sample data at
  `/design-preview/child-dashboard` (development only; it returns 404 in production)

---

## Connect Supabase

### 1. Create a project

Create a project at <https://supabase.com/dashboard>. Use a separate project for development
and for production.

### 2. Get the credentials

In the dashboard open **Project Settings → API** (or **API Keys**):

| Value | Goes in | Notes |
|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | |
| `anon` / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public by design. Row-level security protects the data. |
| `service_role` / secret key | `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Bypasses row-level security. Only for the admin script and live tests. |

### 3. Configure local environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`. It is ignored by Git. The web app itself only ever reads the two
`NEXT_PUBLIC_` values; it never uses the service-role key.

### 4. Apply the SQL migrations

With the Supabase CLI (included as a dev dependency, version 3):

```bash
npx supabase login
```

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

```bash
npx supabase db push --remote --dry-run
```

```bash
npx supabase db push --remote
```

`--remote` targets the linked project (in CLI v3, `db push` targets a local database by
default). Review the dry run first. The migrations only create objects; they drop nothing.

Without the CLI: open **SQL Editor** in the dashboard and run the four files in
`supabase/migrations` in filename order.

### 5. Seed the sample curriculum

```bash
npx supabase db push --remote --include-seed
```

or paste `supabase/seed.sql` into the SQL Editor. It creates six learning worlds, twelve
sample lessons with five-question quizzes, and six achievements. It creates no accounts and is
safe to run more than once.

### 6. Configure Supabase Auth

In **Authentication → URL Configuration**:

- **Site URL**: your site address (`http://localhost:3000` in development)
- **Redirect URLs**: add `http://localhost:3000/auth/confirm` and, later,
  `https://YOUR_DOMAIN/auth/confirm`

Recommended in **Authentication → Sign In / Providers → Email**:

- keep **Confirm email** switched on
- set the minimum password length to **10** to match the app

Recommended in **Authentication → Emails**: change the confirmation and recovery links to the
token-hash form so they work when the email is opened on a different device:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/onboarding
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
```

The app's `/auth/confirm` route accepts both this form and Supabase's default `?code=` links.

### 7. Start the app and create an administrator

```bash
npm run dev
```

Sign up at `/signup`, confirm the email, then grant that account the admin role from your
terminal:

```bash
npm run admin:grant -- you@example.com
```

Administrator rights cannot be obtained through the web app. This script is the supported
way; it uses the service-role key from `.env.local` and changes one row. To remove the role:
`npm run admin:grant -- you@example.com --revoke`.

---

## Running tests

| Command | What it runs | Needs |
|---|---|---|
| `npm run typecheck` | TypeScript in strict mode | nothing |
| `npm run lint` | ESLint | nothing |
| `npm test` | 232 unit and component tests | nothing |
| `npm run test:db` | 184 database tests on embedded PostgreSQL | nothing |
| `npm run test:all` | both of the above | nothing |
| `npm run test:e2e` | 140 browser tests (Chromium) | `npx playwright install chromium` once |
| `E2E_LIVE=1 npx playwright test --project=live` | signed-in journey and live RLS | a development Supabase project |
| `npm run build` | production build | nothing |

How the layers divide the work:

- **Database tests** (`tests/integration`) apply the real migration files and seed to PGlite
  (PostgreSQL compiled to WebAssembly), with a small shim for Supabase's `auth` and `storage`
  schemas and API roles. Each test "request" runs in one transaction as the `authenticated`
  or `anon` role with the JWT claims `auth.uid()` reads. They cover every access rule, scoring,
  duplicate-reward protection, draft protection, versioning and storage policies.
- **Unit and component tests** (`tests/unit`) cover validation, the session proxy, auth and
  other server actions (with Supabase stubbed), the quiz player, and source-level security
  invariants such as "the web app never references the service-role key".
- **Browser tests** (`tests/e2e`) build the app twice into `.next-e2e/` (your `.next` build is
  untouched): once with placeholder Supabase settings and once with none. They cover the
  landing page, responsive navigation, redirects for protected routes, form validation,
  keyboard-only quiz play and axe accessibility scans.

PGlite is not Supabase. The database tests prove the SQL behaves as intended on PostgreSQL;
they do not prove Supabase's API layer or Auth service behave as assumed. That is what the
live tests are for.

---

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository. The framework is detected as
   Next.js; no build settings need changing.
3. Add environment variables for **Production** (and Preview if you use it):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (for example `https://your-domain.com`)

   Do **not** add `SUPABASE_SERVICE_ROLE_KEY`: the deployed app does not use it.
   Do **not** set `ENABLE_DESIGN_PREVIEW`.
4. Deploy.
5. In Supabase, add `https://your-domain.com/auth/confirm` to the Auth redirect URLs and set
   the Site URL to your domain.
6. Apply migrations to the production project from your machine (step 4 above) before the
   first deploy, and again whenever a migration is added. Deploying does not run migrations.

`NEXT_PUBLIC_` values are compiled in at build time, so redeploy after changing them.

---

## How it is built

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) ·
Tailwind CSS 4 · shadcn/ui (Radix) · Lucide icons · Supabase (Postgres, Auth, Storage) ·
Zod 4 · Vitest · Playwright.

```
src/
  app/                    routes
    (marketing)/          landing page, privacy notice (fully static)
    (auth)/               login, signup, forgot-password, reset-password
    auth/confirm/         email-link handler
    onboarding/           create an explorer profile
    child/                dashboard, learn, lessons, quiz, challenge, progress, leaderboard
    parent/               dashboard, explorer management
    admin/                overview, lessons (list, editor, preview), worlds
    design-preview/       development-only gallery with sample data
  components/             presentation only (ui, layout, navigation, mascot, lessons,
                          quizzes, gamification, dashboards, profiles, admin, feedback)
  features/               one folder per domain: queries.ts (server-only reads),
                          actions.ts (server actions), schemas.ts (zod)
  lib/                    supabase client, auth guards, error mapping, helpers
  config/                 site, env, XP rules and levels, worlds, avatars, names, policy
  types/database.ts       generated from the migrations (npm run types:generate)
  proxy.ts                session refresh and optimistic redirects (Next 16 "proxy")
supabase/
  migrations/             1 schema · 2 functions · 3 RLS and grants · 4 storage
  seed/content/           the sample curriculum as typed TypeScript
  seed.sql                generated from seed/content (npm run seed:generate)
scripts/                  generate-seed, generate-db-types, grant-admin
tests/                    unit · integration (database) · e2e (browser)
```

**Layering.** Pages are server components that call `features/*/queries.ts`. Interactive parts
are client components that call server actions in `features/*/actions.ts`. Only those two kinds
of file talk to Supabase. Anything that changes learner data goes through a PostgreSQL function.

**Rendering.** With Cache Components, each signed-in page ships a static shell and streams the
personal content behind a `<Suspense>` boundary, so every page has a loading state by
construction.

**Generated files.** `supabase/seed.sql` and `src/types/database.ts` are generated and
committed; tests fail if either is out of date.

---

## Security model

The browser is never the authority. In brief:

| Concern | How it is enforced |
|---|---|
| Identity | Supabase Auth session in httpOnly cookies. Every server read re-verifies the user with the Auth server. |
| Parent ↔ child ownership | RLS: a parent can read only rows where `parent_id = auth.uid()`; learner tables check ownership through the child. |
| Active child | A cookie stores only a selector. It is looked up among the parent's own children on every request. |
| Roles | `profiles.role` is set by a database trigger to `parent`, is not writable by any API role (column grants plus a guard trigger), and is read on the server. Admins are appointed by `npm run admin:grant`. |
| Quiz answers | `quiz_options.is_correct` and `quiz_questions.explanation` are not selectable by API roles. Answers are judged by `answer_quiz_question()`. |
| XP | `points_ledger` has no write grants. Only `SECURITY DEFINER` functions insert, and a unique constraint makes a duplicate reward impossible. Total XP is always the sum of the ledger. |
| Drafts | RLS hides unpublished lessons, their quizzes and questions. The child area filters on `published` as well. Previews live under `/admin`. |
| Content writes | Only through `admin_*` functions, each of which checks the caller's role. |
| Service-role key | Not referenced anywhere in `src/` (a test enforces this). |
| Children's data | No real name, birth date, email, photo or free text. Explorer names come from fixed word lists, enforced by a database check constraint. Leaderboard visibility is opt-in. |

The full access model is in `supabase/migrations/20261115000003_rls_and_grants.sql`, and each
rule has tests in `tests/integration/access-control.test.ts`.

---

## Editing the curriculum

Sample lessons live in `supabase/seed/content/*.ts`. After editing:

```bash
npm run seed:generate
```

The seed never overwrites rows that already exist, so to change a lesson in a database that
has already been seeded, edit it in the admin CMS instead.

After changing a migration:

```bash
npm run types:generate
```

---

## Known limitations

- **Not verified against live Supabase.** See [Status](#status-read-this-first).
- **Consent is not verifiable parental consent.** A ticked box by a signed-in adult is stored
  as evidence only. COPPA and UK/EU GDPR obligations (verifiable consent, a named data
  controller, a reviewed privacy policy) must be met before any public launch. The privacy
  notice is a draft.
- **Sample content.** The twelve lessons are original sample material that has not been
  reviewed by educators or child-safety specialists.
- **No videos, and no upload screen.** Storage buckets and policies exist; administrators
  upload through the Supabase dashboard and paste the file path into the lesson editor.
- **Siblings share the parent's session.** Child mode is a view, not a separate login. A child
  using the device can open the parent area. A parent gate (re-entering the password) is
  recommended next.
- **Dates use UTC** for streaks, the daily challenge and weekly totals.
- **No application-level rate limiting**; the app relies on Supabase Auth limits.
- **Only the 8–12 band has content.** The 5–7 and 13–15 bands can be selected but are empty.
- **Deferred pages:** games (`/child/play`), parent reports and settings, admin media library
  and analytics.
- **Dev tooling advisories.** `npm audit` reports moderate advisories in the ESLint and shadcn
  CLI dependency chains. `npm audit --omit=dev` reports none.
- **Running `npm run typecheck` while `npm run dev` is busy compiling** can occasionally read
  a half-written file under `.next/dev/types`. Run it again, or delete that folder.
