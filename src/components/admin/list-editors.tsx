"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ErrorText({ messages }: { messages?: string[] | undefined }) {
  if (!messages || messages.length === 0) return null
  return (
    <p role="alert" className="text-sm font-semibold text-coral-700">
      {[...new Set(messages)].join(" ")}
    </p>
  )
}

/** An editable list of short lines (objectives, takeaways, safety notes…). */
export function StringListEditor({
  id,
  legend,
  hint,
  itemLabel,
  items,
  onChange,
  errors,
  max = 12,
}: {
  id: string
  legend: string
  hint?: string
  /** Singular noun used in accessible names, e.g. "objective". */
  itemLabel: string
  items: string[]
  onChange: (items: string[]) => void
  errors?: string[] | undefined
  max?: number
}) {
  const rows = items.length > 0 ? items : [""]

  return (
    <fieldset className="grid gap-2">
      <legend className="font-heading text-base font-semibold text-ink-900">{legend}</legend>
      {hint ? <p className="text-sm text-ink-500">{hint}</p> : null}
      <ul className="grid gap-2">
        {rows.map((item, index) => (
          <li key={index} className="flex gap-2">
            <Input
              id={`${id}-${index}`}
              aria-label={`${itemLabel} ${index + 1}`}
              value={item}
              maxLength={300}
              onChange={(event) => onChange(rows.map((row, i) => (i === index ? event.target.value : row)))}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${itemLabel} ${index + 1}`}
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      <ErrorText messages={errors} />
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={rows.length >= max}
          onClick={() => onChange([...rows, ""])}
        >
          <Plus aria-hidden="true" />
          Add {itemLabel}
        </Button>
      </div>
    </fieldset>
  )
}

export type KeyTermRow = { term: string; definition: string }

export function KeyTermsEditor({
  terms,
  onChange,
  errors,
}: {
  terms: KeyTermRow[]
  onChange: (terms: KeyTermRow[]) => void
  errors?: string[] | undefined
}) {
  const rows = terms.length > 0 ? terms : [{ term: "", definition: "" }]
  const set = (index: number, patch: Partial<KeyTermRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  return (
    <fieldset className="grid gap-3">
      <legend className="font-heading text-base font-semibold text-ink-900">Key terminology</legend>
      <p className="text-sm text-ink-500">New words with child-friendly definitions.</p>
      <ul className="grid gap-3">
        {rows.map((row, index) => (
          <li key={index} className="grid gap-2 rounded-2xl bg-mist p-3 sm:grid-cols-[14rem_1fr_auto] sm:items-start">
            <div className="grid gap-1.5">
              <Label htmlFor={`term-${index}`}>Term {index + 1}</Label>
              <Input
                id={`term-${index}`}
                value={row.term}
                maxLength={80}
                onChange={(event) => set(index, { term: event.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`definition-${index}`}>Definition</Label>
              <Textarea
                id={`definition-${index}`}
                value={row.definition}
                maxLength={400}
                className="min-h-12"
                rows={2}
                onChange={(event) => set(index, { definition: event.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="sm:mt-6"
              aria-label={`Remove term ${index + 1}`}
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      <ErrorText messages={errors} />
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={rows.length >= 20}
          onClick={() => onChange([...rows, { term: "", definition: "" }])}
        >
          <Plus aria-hidden="true" />
          Add term
        </Button>
      </div>
    </fieldset>
  )
}
