"use client"

import { useFormStatus } from "react-dom"
import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react"
import { cn } from "cn"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { FormState } from "@/lib/action-result"

/** Announces the outcome of a form submission. */
export function FormAlert({ state, className }: { state: FormState; className?: string }) {
  if (state.status === "idle" || !state.message) return null
  const isError = state.status === "error"
  return (
    <Alert
      variant={isError ? "destructive" : "success"}
      role={isError ? "alert" : "status"}
      className={className}
    >
      {isError ? <TriangleAlert aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  )
}

export function fieldErrorId(name: string): string {
  return `${name}-error`
}

export function FieldError({ name, messages }: { name: string; messages?: string[] | undefined }) {
  if (!messages || messages.length === 0) return null
  return (
    <p id={fieldErrorId(name)} className="text-sm font-semibold text-coral-700">
      {messages.join(" ")}
    </p>
  )
}

/**
 * Label + control + hint + error, wired together for assistive technology.
 * Pass the control as children and give it the same `id`/`name`.
 */
export function Field({
  name,
  label,
  hint,
  errors,
  children,
  className,
}: {
  name: string
  label: string
  hint?: React.ReactNode
  errors?: string[] | undefined
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint ? (
        <p id={`${name}-hint`} className="text-sm text-ink-500">
          {hint}
        </p>
      ) : null}
      <FieldError name={name} messages={errors} />
    </div>
  )
}

/** aria attributes for a control inside <Field>. */
export function fieldAria(name: string, errors?: string[] | undefined, hasHint = false) {
  const describedBy = [
    hasHint ? `${name}-hint` : null,
    errors && errors.length > 0 ? fieldErrorId(name) : null,
  ]
    .filter(Boolean)
    .join(" ")
  return {
    "aria-invalid": errors && errors.length > 0 ? true : undefined,
    "aria-describedby": describedBy || undefined,
  } as const
}

/** Submit button that shows progress while its form's action is running. */
export function SubmitButton({
  children,
  pendingLabel = "Working…",
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending} {...props}>
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
