/**
 * Writes src/types/database.ts from the SQL migrations.
 *
 *   npm run types:generate
 *
 * Works without Docker or a Supabase project: the migrations are applied to an
 * embedded PostgreSQL (PGlite) and the result is introspected. Once a real
 * project exists you can compare against `npx supabase gen types typescript`.
 */
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { TestDatabase } from "../tests/integration/helpers/db"
import { buildDatabaseTypes } from "./lib/build-db-types"

async function main() {
  const target = fileURLToPath(new URL("../src/types/database.ts", import.meta.url))
  const db = await TestDatabase.create({ seed: false })
  try {
    const source = await buildDatabaseTypes(db)
    writeFileSync(target, source)
    console.log(`Wrote ${target} (${source.split("\n").length} lines).`)
  } finally {
    await db.close()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
