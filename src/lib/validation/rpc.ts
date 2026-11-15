import type { z } from "zod"

/**
 * Validates the JSON returned by a database function.
 *
 * Database functions return `jsonb`, which TypeScript only knows as `Json`.
 * Parsing at this boundary means a shape mismatch is reported here, with the
 * function's name, instead of surfacing as `undefined` deep inside a page.
 * The same schemas are run against the real functions in the database tests.
 */
export function parseRpc<Schema extends z.ZodType>(
  schema: Schema,
  data: unknown,
  functionName: string
): z.infer<Schema> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const where = issue ? `${issue.path.join(".") || "(root)"}: ${issue.message}` : "unknown issue"
    throw new Error(`Unexpected response from ${functionName} — ${where}`)
  }
  return parsed.data
}
