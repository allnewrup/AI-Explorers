import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { listMigrationFiles, TestDatabase } from "./helpers/db"

const EXPECTED_TABLES = [
  "achievements",
  "child_achievements",
  "child_profiles",
  "content_versions",
  "daily_challenge_completions",
  "learning_streaks",
  "learning_worlds",
  "lesson_progress",
  "lessons",
  "parental_consents",
  "points_ledger",
  "profiles",
  "quiz_attempts",
  "quiz_options",
  "quiz_questions",
  "quiz_responses",
  "quizzes",
]

describe("migrations", () => {
  let db: TestDatabase

  beforeAll(async () => {
    db = await TestDatabase.create({ seed: false })
  })

  afterAll(async () => {
    await db.close()
  })

  it("are named so the Supabase CLI applies them in order", () => {
    const files = listMigrationFiles()
    expect(files.length).toBeGreaterThanOrEqual(4)
    for (const file of files) {
      expect(file).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/)
    }
  })

  it("create every specified table", async () => {
    const rows = await db.admin<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name"
    )
    expect(rows.map((row) => row.table_name)).toEqual(EXPECTED_TABLES)
  })

  it("enable row-level security on every public table", async () => {
    const rows = await db.admin<{ relname: string; relrowsecurity: boolean }>(
      `select c.relname, c.relrowsecurity
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r'`
    )
    const unprotected = rows.filter((row) => !row.relrowsecurity).map((row) => row.relname)
    expect(unprotected).toEqual([])
  })

  it("index every foreign key column", async () => {
    // A foreign key without a leading index makes cascades and RLS joins slow.
    const rows = await db.admin<{ table_name: string; column_name: string }>(
      `select c.conrelid::regclass::text as table_name, a.attname as column_name
       from pg_constraint c
       join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
       where c.contype = 'f'
         and c.connamespace = 'public'::regnamespace
         and not exists (
           select 1 from pg_index i
           where i.indrelid = c.conrelid and i.indkey[0] = c.conkey[1]
         )`
    )
    expect(rows).toEqual([])
  })

  it("pin search_path on every SECURITY DEFINER function", async () => {
    const rows = await db.admin<{ name: string }>(
      `select p.oid::regprocedure::text as name
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname in ('public', 'app_private')
         and p.prosecdef
         and not exists (
           select 1 from unnest(coalesce(p.proconfig, '{}')) as setting
           where setting like 'search_path=%'
         )`
    )
    expect(rows).toEqual([])
  })

  it("grant nothing in public to the anonymous role except reading worlds", async () => {
    const tables = await db.admin<{ table_name: string; privilege_type: string }>(
      `select table_name, privilege_type from information_schema.role_table_grants
       where table_schema = 'public' and grantee = 'anon'`
    )
    expect(tables).toEqual([{ table_name: "learning_worlds", privilege_type: "SELECT" }])

    const functions = await db.admin<{ name: string }>(
      `select p.oid::regprocedure::text as name
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname in ('public', 'app_private')
         and has_function_privilege('anon', p.oid, 'execute')`
    )
    expect(functions).toEqual([])
  })

  it("expose only the RLS predicates and the display-name validator from app_private", async () => {
    const rows = await db.admin<{ name: string }>(
      `select p.proname as name
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'app_private'
         and has_function_privilege('authenticated', p.oid, 'execute')
       order by 1`
    )
    expect(rows.map((row) => row.name)).toEqual([
      "explorer_adjectives",
      "explorer_nouns",
      "is_admin",
      "is_valid_explorer_name",
      "owns_child",
    ])
  })

  it("give signed-in users no write privilege on learner records or the answer key", async () => {
    const rows = await db.admin<{ table_name: string; privilege_type: string }>(
      `select table_name, privilege_type from information_schema.role_table_grants
       where table_schema = 'public' and grantee = 'authenticated' and privilege_type <> 'SELECT'
       order by table_name, privilege_type`
    )
    // Table-level write grants that exist on purpose:
    expect(rows).toEqual([
      { table_name: "child_profiles", privilege_type: "DELETE" },
      { table_name: "learning_worlds", privilege_type: "INSERT" },
      { table_name: "learning_worlds", privilege_type: "UPDATE" },
    ])

    const columns = await db.admin<{ table_name: string; column_name: string }>(
      `select table_name, column_name from information_schema.role_column_grants
       where table_schema = 'public' and grantee = 'authenticated' and privilege_type = 'UPDATE'
         and table_name <> 'learning_worlds'
       order by table_name, column_name`
    )
    expect(columns).toEqual([
      { table_name: "child_profiles", column_name: "age_band" },
      { table_name: "child_profiles", column_name: "avatar_key" },
      { table_name: "child_profiles", column_name: "display_name" },
      { table_name: "child_profiles", column_name: "is_active" },
      { table_name: "profiles", column_name: "display_name" },
    ])
  })
})
