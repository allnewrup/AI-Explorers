# Live end-to-end tests

These specs exercise the app against a **real Supabase project**: real sign-in,
real row-level security through the API, real XP awarded by the database.

> **Status:** run against a development project on 16 Nov 2026: 11 of 11 passed.

## What they do

| Spec | Checks |
|---|---|
| `rls.spec.ts` | Talks to your project's API directly with real parent sessions and repeats the key access-control attacks from `tests/integration/access-control.test.ts`: reading another family's child, reading the answer key, writing XP, self-promotion to admin. |
| `journey.spec.ts` | In a browser: a parent logs in, creates an explorer, opens a lesson, completes it, takes the quiz, and sees the real numbers on the parent dashboard. A second parent and a non-admin are shown to be locked out. |

## Before you run them

1. Use a **development** project, never production. The specs create accounts
   (`aie-e2e-…@example.com`) and delete them afterwards, along with everything
   those accounts created.
2. Apply the migrations and the seed (see the main README).
3. Put these in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
   The service-role key is used only by the test process, to create
   already-confirmed test users and to clean up. The app under test never
   receives it.

## Run

```bash
E2E_LIVE=1 npx playwright test --project=live
```

Without `E2E_LIVE=1` the `live` project does not exist and these files are
ignored.
