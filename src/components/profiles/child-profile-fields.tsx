"use client"

import { useState } from "react"
import { Shuffle } from "lucide-react"
import { FieldError } from "@/components/feedback/form"
import { AvatarDisc } from "@/components/gamification/avatar-disc"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { AGE_BAND_HINTS, AGE_BAND_LABELS, AGE_BANDS, type AgeBand } from "@/config/age-bands"
import { AVATAR_KEYS, AVATAR_LABELS, type AvatarKey } from "@/config/avatars"
import { generateExplorerNameOptions } from "@/config/explorer-names"

const NAME_COUNT = 6

/**
 * Explorer name, avatar and age band pickers, shared by onboarding and the
 * edit-profile form. Everything is a native radio or select, so it submits
 * with a plain form and works with a keyboard and screen readers.
 */
export function ChildProfileFields({
  initialNames,
  defaults,
  errors,
}: {
  /** Suggestions generated on the server so the first render is stable. */
  initialNames: string[]
  defaults?: { displayName?: string; avatarKey?: string; ageBand?: string }
  errors?: Record<string, string[]> | undefined
}) {
  const startingNames =
    defaults?.displayName && !initialNames.includes(defaults.displayName)
      ? [defaults.displayName, ...initialNames.slice(0, NAME_COUNT - 1)]
      : initialNames
  const [names, setNames] = useState(startingNames)
  const [selectedName, setSelectedName] = useState(defaults?.displayName ?? startingNames[0] ?? "")
  const [ageBand, setAgeBand] = useState<AgeBand>(
    (AGE_BANDS as readonly string[]).includes(defaults?.ageBand ?? "")
      ? (defaults?.ageBand as AgeBand)
      : "8-12"
  )
  const defaultAvatar: AvatarKey = (AVATAR_KEYS as readonly string[]).includes(defaults?.avatarKey ?? "")
    ? (defaults?.avatarKey as AvatarKey)
    : "rocket"

  function shuffle() {
    const fresh = generateExplorerNameOptions(NAME_COUNT)
    setNames(fresh)
    setSelectedName(fresh[0] ?? "")
  }

  return (
    <div className="grid gap-8">
      <fieldset className="grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <legend className="font-heading text-lg font-semibold text-ink-900">Explorer name</legend>
            <p className="text-sm text-ink-500">
              Pick a made-up name. We never ask for your child&apos;s real name.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={shuffle}>
            <Shuffle aria-hidden="true" />
            Show different names
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {names.map((name) => (
            <label
              key={name}
              className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-ink-200 bg-white px-4 py-3 text-center font-heading text-lg font-semibold text-ink-800 transition-colors hover:border-electric-300 has-checked:border-electric-500 has-checked:bg-electric-50 has-checked:text-electric-700 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
            >
              <input
                type="radio"
                name="displayName"
                value={name}
                checked={selectedName === name}
                onChange={() => setSelectedName(name)}
                className="sr-only"
              />
              {name}
            </label>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Selected name: {selectedName}
        </p>
        <FieldError name="displayName" messages={errors?.displayName} />
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="font-heading text-lg font-semibold text-ink-900">Avatar</legend>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {AVATAR_KEYS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-transparent p-2 transition-colors hover:bg-ink-100 has-checked:border-electric-500 has-checked:bg-electric-50 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
            >
              <input
                type="radio"
                name="avatarKey"
                value={key}
                defaultChecked={key === defaultAvatar}
                className="sr-only"
              />
              <AvatarDisc avatarKey={key} size="md" />
              <span className="text-xs font-bold text-ink-700">{AVATAR_LABELS[key]}</span>
            </label>
          ))}
        </div>
        <FieldError name="avatarKey" messages={errors?.avatarKey} />
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="ageBand" className="font-heading text-lg font-semibold text-ink-900">
          Age band
        </Label>
        <div className="max-w-xs">
          <NativeSelect
            id="ageBand"
            name="ageBand"
            value={ageBand}
            onChange={(event) => setAgeBand(event.target.value as AgeBand)}
            aria-describedby="ageBand-hint"
          >
            {AGE_BANDS.map((band) => (
              <option key={band} value={band}>
                {AGE_BAND_LABELS[band]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <p id="ageBand-hint" className="text-sm text-ink-500" aria-live="polite">
          {AGE_BAND_HINTS[ageBand]} We ask for a range, never a date of birth.
        </p>
        <FieldError name="ageBand" messages={errors?.ageBand} />
      </div>
    </div>
  )
}
