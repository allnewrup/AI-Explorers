import type { TestDatabase } from "../../tests/integration/helpers/db"

/**
 * Builds src/types/database.ts by introspecting a database that has the real
 * migrations applied.
 *
 * Unlike `supabase gen types`, the output describes the schema *as the
 * `authenticated` API role sees it*:
 *   - columns that role cannot SELECT (the quiz answer key, explanations) are
 *     left out of `Row`, so selecting them is a compile-time error;
 *   - tables it cannot read at all are omitted;
 *   - `Insert` / `Update` contain only the columns it may write;
 *   - only functions it may execute are listed.
 */

type ColumnRow = {
  table_name: string
  column_name: string
  data_type: string
  udt_name: string
  nullable: boolean
  has_default: boolean
  can_select: boolean
  can_insert: boolean
  can_update: boolean
}

type FunctionRow = {
  name: string
  arg_names: string[] | null
  arg_types: string[] | null
  default_count: number
  result: string
}

type EnumRow = { name: string; labels: string[] }

const SCALARS: Record<string, string> = {
  uuid: "string",
  text: "string",
  varchar: "string",
  bool: "boolean",
  boolean: "boolean",
  int2: "number",
  int4: "number",
  int8: "number",
  integer: "number",
  bigint: "number",
  numeric: "number",
  float8: "number",
  timestamptz: "string",
  "timestamp with time zone": "string",
  date: "string",
  json: "Json",
  jsonb: "Json",
  void: "undefined",
}

function mapType(pgType: string, enums: Set<string>): string {
  const bare = pgType.replace(/^public\./, "")
  if (bare.endsWith("[]")) return `${mapType(bare.slice(0, -2), enums)}[]`
  if (bare.startsWith("_")) return `${mapType(bare.slice(1), enums)}[]`
  if (enums.has(bare)) return `Database["public"]["Enums"]["${bare}"]`
  const scalar = SCALARS[bare]
  if (!scalar) throw new Error(`build-db-types: no TypeScript mapping for Postgres type "${pgType}"`)
  return scalar
}

export async function buildDatabaseTypes(db: TestDatabase): Promise<string> {
  const enumRows = await db.admin<EnumRow>(
    `select t.typname::text as name, array_agg(e.enumlabel::text order by e.enumsortorder) as labels
     from pg_type t
     join pg_enum e on e.enumtypid = t.oid
     join pg_namespace n on n.oid = t.typnamespace
     where n.nspname = 'public'
     group by t.typname
     order by 1`
  )
  const enums = new Set(enumRows.map((row) => row.name))

  const columns = await db.admin<ColumnRow>(
    `select c.table_name::text, c.column_name::text, c.data_type::text, c.udt_name::text,
            (c.is_nullable = 'YES') as nullable,
            (c.column_default is not null) as has_default,
            has_column_privilege('authenticated', format('public.%I', c.table_name), c.column_name::text, 'select') as can_select,
            has_column_privilege('authenticated', format('public.%I', c.table_name), c.column_name::text, 'insert') as can_insert,
            has_column_privilege('authenticated', format('public.%I', c.table_name), c.column_name::text, 'update') as can_update
     from information_schema.columns c
     join information_schema.tables t
       on t.table_schema = c.table_schema and t.table_name = c.table_name
     where c.table_schema = 'public' and t.table_type = 'BASE TABLE'
     order by c.table_name, c.ordinal_position`
  )

  const functions = await db.admin<FunctionRow>(
    `select p.proname::text as name,
            p.proargnames::text[] as arg_names,
            (select array_agg(format_type(a.type_oid, null) order by a.position)
             from unnest(p.proargtypes::oid[]) with ordinality as a(type_oid, position)) as arg_types,
            p.pronargdefaults::int as default_count,
            format_type(p.prorettype, null) as result
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and has_function_privilege('authenticated', p.oid, 'execute')
     order by 1`
  )

  const byTable = new Map<string, ColumnRow[]>()
  for (const column of columns) {
    const list = byTable.get(column.table_name) ?? []
    list.push(column)
    byTable.set(column.table_name, list)
  }

  const out: string[] = []
  out.push(
    "/**",
    " * GENERATED FILE — do not edit by hand.",
    " *   Source:      supabase/migrations/*.sql",
    " *   Regenerate:  npm run types:generate",
    " *",
    " * Describes the database as the signed-in (`authenticated`) API role sees it.",
    " * Columns that role cannot read (for example the quiz answer key) and tables",
    " * it cannot reach are deliberately absent, so misuse fails at compile time.",
    " */",
    "",
    "export type Json =",
    "  | string",
    "  | number",
    "  | boolean",
    "  | null",
    "  | { [key: string]: Json | undefined }",
    "  | Json[]",
    "",
    "export type Database = {",
    "  public: {",
    "    Tables: {"
  )

  for (const [table, tableColumns] of byTable) {
    const readable = tableColumns.filter((column) => column.can_select)
    if (readable.length === 0) continue
    const insertable = tableColumns.filter((column) => column.can_insert)
    const updatable = tableColumns.filter((column) => column.can_update)
    const tsType = (column: ColumnRow) => {
      const base = mapType(column.data_type === "ARRAY" ? column.udt_name : column.udt_name, enums)
      return column.nullable ? `${base} | null` : base
    }

    out.push(`      ${table}: {`, "        Row: {")
    for (const column of readable) out.push(`          ${column.column_name}: ${tsType(column)}`)
    out.push("        }")

    if (insertable.length === 0) {
      out.push("        Insert: Record<string, never>")
    } else {
      out.push("        Insert: {")
      for (const column of insertable) {
        const optional = column.nullable || column.has_default ? "?" : ""
        out.push(`          ${column.column_name}${optional}: ${tsType(column)}`)
      }
      out.push("        }")
    }

    if (updatable.length === 0) {
      out.push("        Update: Record<string, never>")
    } else {
      out.push("        Update: {")
      for (const column of updatable) out.push(`          ${column.column_name}?: ${tsType(column)}`)
      out.push("        }")
    }
    out.push("        Relationships: []", "      }")
  }

  out.push("    }", "    Views: {", "      [_ in never]: never", "    }", "    Functions: {")

  for (const fn of functions) {
    const names = fn.arg_names ?? []
    const types = fn.arg_types ?? []
    const firstOptional = types.length - fn.default_count
    out.push(`      ${fn.name}: {`)
    if (types.length === 0) {
      out.push("        Args: Record<PropertyKey, never>")
    } else {
      out.push("        Args: {")
      types.forEach((type, index) => {
        const name = names[index]
        if (!name) throw new Error(`build-db-types: ${fn.name} has an unnamed argument`)
        const optional = index >= firstOptional ? "?" : ""
        out.push(`          ${name}${optional}: ${mapType(type, enums)}`)
      })
      out.push("        }")
    }
    out.push(`        Returns: ${mapType(fn.result, enums)}`, "      }")
  }

  out.push("    }", "    Enums: {")
  for (const row of enumRows) {
    out.push(`      ${row.name}: ${row.labels.map((label) => JSON.stringify(label)).join(" | ")}`)
  }
  out.push(
    "    }",
    "    CompositeTypes: {",
    "      [_ in never]: never",
    "    }",
    "  }",
    "}",
    "",
    "export type Tables<T extends keyof Database[\"public\"][\"Tables\"]> =",
    "  Database[\"public\"][\"Tables\"][T][\"Row\"]",
    "",
    "export type Enums<T extends keyof Database[\"public\"][\"Enums\"]> = Database[\"public\"][\"Enums\"][T]",
    ""
  )

  return out.join("\n")
}
