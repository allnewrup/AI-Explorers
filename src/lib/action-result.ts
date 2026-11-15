import { z } from "zod"

/** Result of a Server Action that is called directly from client code. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data })
export const fail = (error: string, fieldErrors?: Record<string, string[]>): ActionResult<never> =>
  fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error }

/** State of a `<form action>` handled with React's useActionState. */
export type FormState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: Record<string, string[]>
  /** Echoed back so a failed form keeps what the user typed (never passwords). */
  values?: Record<string, string>
}

export const idleFormState: FormState = { status: "idle" }

export function fieldErrorsOf(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>
  const result: Record<string, string[]> = {}
  for (const [key, messages] of Object.entries(flattened)) {
    if (messages && messages.length > 0) result[key] = messages
  }
  return result
}

export function formError(
  message: string,
  extra: Pick<FormState, "fieldErrors" | "values"> = {}
): FormState {
  return { status: "error", message, ...extra }
}

/** Reads a FormData text field as a trimmed string ("" when absent). */
export function formText(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

export function formChecked(formData: FormData, name: string): boolean {
  const value = formData.get(name)
  return value === "on" || value === "true" || value === "1"
}
