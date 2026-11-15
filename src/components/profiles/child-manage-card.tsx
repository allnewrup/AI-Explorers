"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff, Pause, Pencil, Play, Trash2 } from "lucide-react"
import { Field, FormAlert, SubmitButton, fieldAria } from "@/components/feedback/form"
import { AvatarDisc } from "@/components/gamification/avatar-disc"
import { ChildProfileFields } from "@/components/profiles/child-profile-fields"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AGE_BAND_LABELS, type AgeBand } from "@/config/age-bands"
import {
  deleteChildProfileAction,
  setChildActiveAction,
  setLeaderboardVisibilityAction,
  updateChildProfileAction,
} from "@/features/profiles/actions"
import { idleFormState } from "@/lib/action-result"
import { formatDate } from "@/lib/format"

export type ManagedChild = {
  id: string
  displayName: string
  avatarKey: string
  ageBand: AgeBand
  isActive: boolean
  showOnLeaderboard: boolean
  createdAt: string
}

export type ConsentSummary = {
  id: string
  label: string
  policyVersion: string
  status: "granted" | "revoked"
  recordedAt: string
  revokedAt: string | null
}

function EditDialog({ child, nameSuggestions }: { child: ManagedChild; nameSuggestions: string[] }) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState(updateChildProfileAction, idleFormState)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil aria-hidden="true" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-6 text-base sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Edit {child.displayName}</DialogTitle>
          <DialogDescription className="text-base text-ink-500">
            Change the explorer name, avatar or age band. Progress and XP are kept.
          </DialogDescription>
        </DialogHeader>
        <form action={action} noValidate className="grid gap-6">
          <FormAlert state={state} />
          <input type="hidden" name="childId" value={child.id} />
          <ChildProfileFields
            initialNames={nameSuggestions}
            defaults={{
              displayName: state.values?.displayName ?? child.displayName,
              avatarKey: state.values?.avatarKey ?? child.avatarKey,
              ageBand: state.values?.ageBand ?? child.ageBand,
            }}
            errors={state.fieldErrors}
          />
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
            <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ child }: { child: ManagedChild }) {
  const [state, action] = useActionState(deleteChildProfileAction, idleFormState)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-coral-700 hover:bg-coral-50 hover:text-coral-700">
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6 text-base sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Delete {child.displayName}?</DialogTitle>
          <DialogDescription className="text-base text-ink-600">
            This permanently deletes the profile together with its lesson progress, quiz results,
            XP, badges and consent records. It cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={action} noValidate className="grid gap-5">
          <FormAlert state={state} />
          <input type="hidden" name="childId" value={child.id} />
          <Field
            name={`confirmation-${child.id}`}
            label="Type DELETE to confirm"
            errors={state.fieldErrors?.confirmation}
          >
            <Input
              id={`confirmation-${child.id}`}
              name="confirmation"
              autoComplete="off"
              autoCapitalize="characters"
              {...fieldAria(`confirmation-${child.id}`, state.fieldErrors?.confirmation)}
            />
          </Field>
          <div className="flex justify-end">
            <SubmitButton variant="destructive" pendingLabel="Deleting…">
              Delete profile and records
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** One explorer profile with every control a parent has over it. */
export function ChildManageCard({
  child,
  consents,
  nameSuggestions,
}: {
  child: ManagedChild
  consents: ConsentSummary[]
  nameSuggestions: string[]
}) {
  return (
    <article
      aria-labelledby={`child-${child.id}`}
      className="grid gap-5 rounded-4xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <AvatarDisc avatarKey={child.avatarKey} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 id={`child-${child.id}`} className="text-2xl font-semibold text-ink-900">
            {child.displayName}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="neutral">{AGE_BAND_LABELS[child.ageBand]}</Badge>
            <Badge variant={child.isActive ? "aqua" : "coral"}>
              {child.isActive ? "Active" : "Paused"}
            </Badge>
            <Badge variant={child.showOnLeaderboard ? "default" : "outline"}>
              {child.showOnLeaderboard ? "On the leaderboard" : "Hidden from the leaderboard"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-ink-500">Created {formatDate(child.createdAt)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-ink-100 pt-4">
        <EditDialog child={child} nameSuggestions={nameSuggestions} />

        <form action={setChildActiveAction}>
          <input type="hidden" name="childId" value={child.id} />
          <input type="hidden" name="active" value={child.isActive ? "false" : "true"} />
          <SubmitButton variant="outline" size="sm" pendingLabel="Saving…">
            {child.isActive ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {child.isActive ? "Pause profile" : "Resume profile"}
          </SubmitButton>
        </form>

        <form action={setLeaderboardVisibilityAction}>
          <input type="hidden" name="childId" value={child.id} />
          <input type="hidden" name="visible" value={child.showOnLeaderboard ? "false" : "true"} />
          <SubmitButton variant="outline" size="sm" pendingLabel="Saving…">
            {child.showOnLeaderboard ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            {child.showOnLeaderboard ? "Hide from leaderboard" : "Show on leaderboard"}
          </SubmitButton>
        </form>

        <div className="sm:ml-auto">
          <DeleteDialog child={child} />
        </div>
      </div>

      <details className="rounded-2xl bg-mist p-4">
        <summary className="cursor-pointer rounded font-heading font-semibold text-ink-800">
          Consent records ({consents.length})
        </summary>
        {consents.length > 0 ? (
          <ul className="mt-3 grid gap-2 text-sm">
            {consents.map((consent) => (
              <li key={consent.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                <span className="font-semibold text-ink-800">{consent.label}</span>
                <span className="text-ink-500">
                  {consent.status === "granted"
                    ? `Agreed ${formatDate(consent.recordedAt)}`
                    : `Withdrawn ${formatDate(consent.revokedAt)}`}{" "}
                  · notice {consent.policyVersion}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-500">No consent records are stored for this profile.</p>
        )}
      </details>
    </article>
  )
}
