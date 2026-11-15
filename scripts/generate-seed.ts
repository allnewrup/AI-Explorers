/**
 * Writes supabase/seed.sql from the typed content in supabase/seed/content.
 *
 *   npm run seed:generate            write the file
 *   npm run seed:generate -- --check exit 1 if the file is out of date
 */
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { buildSeedSql } from "../supabase/seed/build-seed"

const target = fileURLToPath(new URL("../supabase/seed.sql", import.meta.url))
const sql = buildSeedSql()

if (process.argv.includes("--check")) {
  let current = ""
  try {
    current = readFileSync(target, "utf8")
  } catch {
    // Missing file counts as out of date.
  }
  if (current !== sql) {
    console.error("supabase/seed.sql is out of date. Run: npm run seed:generate")
    process.exit(1)
  }
  console.log("supabase/seed.sql is up to date.")
} else {
  writeFileSync(target, sql)
  console.log(`Wrote ${target} (${sql.split("\n").length} lines).`)
}
