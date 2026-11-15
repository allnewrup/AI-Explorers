"use client"

import { useActionState, useId } from "react"
import { ErrorText } from "@/components/admin/list-editors"
import { FormAlert, SubmitButton } from "@/components/feedback/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { AGE_BAND_LABELS, AGE_BANDS } from "@/config/age-bands"
import { WORLD_IMAGE_KEYS } from "@/config/worlds"
import { saveWorldAction } from "@/features/admin-content/actions"
import { idleFormState } from "@/lib/action-result"

const IMAGE_LABELS: Record<(typeof WORLD_IMAGE_KEYS)[number], string> = {
  "world-beginners": "Robot (blue to purple)",
  "world-everyday": "Map pin (turquoise to blue)",
  "world-creativity": "Palette (purple to coral)",
  "world-detective": "Magnifier (navy to purple)",
  "world-safety": "Shield (turquoise)",
  "world-future": "Rocket (navy to blue)",
}

export type WorldFormValues = {
  id?: string
  title: string
  slug: string
  description: string
  imageKey: string
  ageBand: string
  displayOrder: number
  isActive: boolean
}

/** Create or edit one learning world (category). */
export function WorldForm({ world }: { world?: WorldFormValues }) {
  const [state, action] = useActionState(saveWorldAction, idleFormState)
  const uid = useId()
  const value = (name: keyof NonNullable<typeof state.values>, fallback: string) =>
    state.values?.[name] ?? fallback
  const isNew = !world?.id

  return (
    <form action={action} noValidate className="grid gap-4">
      <FormAlert state={state} />
      {world?.id ? <input type="hidden" name="id" value={world.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${uid}-title`}>Title</Label>
          <Input
            id={`${uid}-title`}
            name="title"
            maxLength={80}
            required
            defaultValue={value("title", world?.title ?? "")}
          />
          <ErrorText messages={state.fieldErrors?.title} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${uid}-slug`}>URL name</Label>
          <Input
            id={`${uid}-slug`}
            name="slug"
            maxLength={80}
            required
            placeholder="ai-and-nature"
            defaultValue={value("slug", world?.slug ?? "")}
          />
          <ErrorText messages={state.fieldErrors?.slug} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${uid}-description`}>Description</Label>
        <Textarea
          id={`${uid}-description`}
          name="description"
          maxLength={500}
          rows={2}
          className="min-h-16"
          defaultValue={value("description", world?.description ?? "")}
        />
        <ErrorText messages={state.fieldErrors?.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor={`${uid}-image`}>Illustration</Label>
          <NativeSelect
            id={`${uid}-image`}
            name="image_key"
            defaultValue={value("image_key", world?.imageKey ?? "world-beginners")}
          >
            {WORLD_IMAGE_KEYS.map((key) => (
              <option key={key} value={key}>
                {IMAGE_LABELS[key]}
              </option>
            ))}
          </NativeSelect>
          <ErrorText messages={state.fieldErrors?.image_key} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${uid}-age`}>Age suitability</Label>
          <NativeSelect
            id={`${uid}-age`}
            name="age_band"
            defaultValue={value("age_band", world?.ageBand ?? "8-12")}
          >
            {AGE_BANDS.map((band) => (
              <option key={band} value={band}>
                {AGE_BAND_LABELS[band]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${uid}-order`}>Display order</Label>
          <Input
            id={`${uid}-order`}
            name="display_order"
            type="number"
            min={0}
            max={10000}
            defaultValue={value("display_order", String(world?.displayOrder ?? 0))}
          />
          <ErrorText messages={state.fieldErrors?.display_order} />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-ink-800">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={world?.isActive ?? false}
          className="size-5 rounded accent-electric-600"
        />
        Active (visible to families, together with its published lessons)
      </label>

      <div>
        <SubmitButton variant={isNew ? "default" : "outline"} pendingLabel="Saving…">
          {isNew ? "Create world" : "Save world"}
        </SubmitButton>
      </div>
    </form>
  )
}
