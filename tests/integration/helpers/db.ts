import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { PGlite } from "@electric-sql/pglite"

const fromHere = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const SHIM_FILE = fromHere("./supabase-shim.sql")
const MIGRATIONS_DIR = fromHere("../../../supabase/migrations")
const SEED_FILE = fromHere("../../../supabase/seed.sql")

export type Row = Record<string, unknown>

/** Runs one statement inside the current "request". */
export type Query = <T extends Row = Row>(sql: string, params?: unknown[]) => Promise<T[]>

export type PgError = Error & { code?: string }

export function listMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort()
}

/**
 * An embedded PostgreSQL database with the project's real migrations applied.
 *
 * `asUser`, `asAnon` model one API request each: a single transaction that
 * runs as the same database role Supabase would use, with the same JWT claims
 * that `auth.uid()` reads. A failing statement rolls the whole request back,
 * exactly as PostgREST does.
 */
export class TestDatabase {
  /** Requests run one at a time: the embedded database has a single connection. */
  private queue: Promise<unknown> = Promise.resolve()

  private constructor(private readonly pg: PGlite) {}

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = this.queue.then(task, task)
    this.queue = next.catch(() => undefined)
    return next
  }

  static async create(options: { seed?: boolean } = {}): Promise<TestDatabase> {
    const pg = new PGlite()
    await pg.exec(readFileSync(SHIM_FILE, "utf8"))
    for (const file of listMigrationFiles()) {
      try {
        await pg.exec(readFileSync(`${MIGRATIONS_DIR}/${file}`, "utf8"))
      } catch (error) {
        throw new Error(`Migration ${file} failed: ${(error as Error).message}`, { cause: error })
      }
    }
    if (options.seed ?? true) {
      try {
        await pg.exec(readFileSync(SEED_FILE, "utf8"))
      } catch (error) {
        throw new Error(`seed.sql failed: ${(error as Error).message}`, { cause: error })
      }
    }
    return new TestDatabase(pg)
  }

  async close(): Promise<void> {
    await this.pg.close()
  }

  /** Superuser access, for test setup and for inspecting the true state. */
  admin: Query = <T extends Row = Row>(sql: string, params: unknown[] = []) =>
    this.enqueue(async () => {
      const result = await this.pg.query<T>(sql, params)
      return result.rows
    })

  /** Applies a whole SQL script as superuser (used to re-run seed.sql). */
  execScript(sql: string): Promise<void> {
    return this.enqueue(async () => {
      await this.pg.exec(sql)
    })
  }

  private asRole<T>(
    role: "anon" | "authenticated" | "service_role",
    userId: string | null,
    run: (query: Query) => Promise<T>,
    extraClaims: Record<string, unknown> = {}
  ): Promise<T> {
    return this.enqueue(() => this.runAsRole(role, userId, run, extraClaims))
  }

  private async runAsRole<T>(
    role: "anon" | "authenticated" | "service_role",
    userId: string | null,
    run: (query: Query) => Promise<T>,
    extraClaims: Record<string, unknown> = {}
  ): Promise<T> {
    const claims = JSON.stringify({ ...extraClaims, ...(userId ? { sub: userId, role } : { role }) })
    await this.pg.exec("begin")
    try {
      await this.pg.query("select set_config('request.jwt.claims', $1, true)", [claims])
      await this.pg.exec(`set local role ${role}`)
      const query: Query = async <R extends Row = Row>(sql: string, params: unknown[] = []) => {
        const result = await this.pg.query<R>(sql, params)
        return result.rows
      }
      const value = await run(query)
      await this.pg.exec("commit")
      return value
    } catch (error) {
      await this.pg.exec("rollback")
      throw error
    }
  }

  /**
   * One request from a signed-in user. `extraClaims` adds arbitrary fields to
   * the session token, to prove that nothing trusts client-supplied claims.
   */
  asUser<T>(
    userId: string,
    run: (query: Query) => Promise<T>,
    extraClaims: Record<string, unknown> = {}
  ): Promise<T> {
    return this.asRole("authenticated", userId, run, extraClaims)
  }

  /** One request from a visitor who is not signed in. */
  asAnon<T>(run: (query: Query) => Promise<T>): Promise<T> {
    return this.asRole("anon", null, run)
  }

  /** Calls a function in `public` as a signed-in user and returns its result. */
  async rpc<T = unknown>(userId: string, fn: string, args: unknown[] = []): Promise<T> {
    const placeholders = args.map((_, index) => `$${index + 1}`).join(", ")
    const rows = await this.asUser(userId, (query) =>
      query<{ result: T }>(`select public.${fn}(${placeholders}) as result`, args)
    )
    return rows[0]?.result as T
  }

  /** Creates an auth user; the on_auth_user_created trigger adds the profile. */
  async createUser(email: string, metadata: Record<string, unknown> = {}): Promise<string> {
    const rows = await this.admin<{ id: string }>(
      "insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id",
      [email, JSON.stringify(metadata)]
    )
    const id = rows[0]?.id
    if (!id) throw new Error("failed to create test user")
    return id
  }

  /** Appoints an administrator the only supported way: as the database owner. */
  async makeAdmin(userId: string): Promise<void> {
    await this.admin("update public.profiles set role = 'admin' where id = $1", [userId])
  }

  async createChild(
    parentId: string,
    overrides: {
      displayName?: string
      avatarKey?: string
      ageBand?: string
      showOnLeaderboard?: boolean
    } = {}
  ): Promise<string> {
    return this.rpc<string>(parentId, "create_child_profile", [
      overrides.displayName ?? "CosmicOtter42",
      overrides.avatarKey ?? "rocket",
      overrides.ageBand ?? "8-12",
      overrides.showOnLeaderboard ?? false,
      "test-policy-v1",
    ])
  }
}

/** Resolves to the Postgres error a rejected request produced. */
export async function captureError(promise: Promise<unknown>): Promise<PgError> {
  try {
    await promise
  } catch (error) {
    return error as PgError
  }
  throw new Error("expected the request to be rejected, but it succeeded")
}

export const PERMISSION_DENIED = "42501"
