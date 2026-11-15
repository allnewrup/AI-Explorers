"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Archive, Eye, LoaderCircle, Save, Send, TriangleAlert, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { ErrorText, KeyTermsEditor, StringListEditor } from "@/components/admin/list-editors"
import { QuizEditor } from "@/components/admin/quiz-editor"
import { StatusBadge } from "@/components/admin/status-badge"
import { BackLink } from "@/components/navigation/back-link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { AGE_BAND_LABELS, AGE_BANDS, type AgeBand } from "@/config/age-bands"
import { routes } from "@/config/site"
import { saveLessonAction, setLessonStatusAction } from "@/features/admin-content/actions"
import { DIFFICULTIES, type LessonInput } from "@/features/admin-content/schemas"
import { formatDateTime, slugify } from "@/lib/format"

type Status = "draft" | "published" | "archived"
type Busy = null | "save" | "publish" | "unpublish" | "archive"

export type EditorWorld = { id: string; title: string; isActive: boolean }
export type EditorVersion = {
  version_number: number
  created_at: string
  changed_by_name: string | null
  status: string | null
}

function Panel({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="grid gap-5 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5 sm:p-7">
      <div>
        <h2 id={id} className="text-2xl font-semibold text-ink-900">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

/**
 * Create / edit a lesson and its quiz.
 *
 * Saving never changes visibility: a draft stays a draft. Publishing is a
 * separate, explicit step that the database validates (description, lesson
 * text, objectives, safety notes and a complete answer key are required).
 */
export function LessonEditor({
  lessonId,
  status,
  initialValues,
  worlds,
  versions = [],
}: {
  lessonId: string | null
  status: Status
  initialValues: LessonInput
  worlds: EditorWorld[]
  versions?: EditorVersion[]
}) {
  const router = useRouter()
  const [values, setValues] = useState<LessonInput>(initialValues)
  const [slugTouched, setSlugTouched] = useState(lessonId !== null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState<Busy>(null)

  const isNew = lessonId === null
  const set = <K extends keyof LessonInput>(key: K, value: LessonInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  /** Messages for one field path, or for anything nested beneath it. */
  const errorsFor = (path: string) => errors[path]
  const errorCount = Object.keys(errors).length

  async function save(): Promise<string | null> {
    setErrors({})
    setFormError(null)
    const result = await saveLessonAction(lessonId, values)
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {})
      setFormError(result.error)
      return null
    }
    return result.data.id
  }

  async function handleSave() {
    setBusy("save")
    try {
      const id = await save()
      if (!id) return
      toast.success(isNew ? "Draft created." : "Changes saved.")
      if (isNew) router.replace(routes.admin.lesson(id))
      else router.refresh()
    } finally {
      setBusy(null)
    }
  }

  async function handleStatus(next: Status, action: Exclude<Busy, null | "save">) {
    setBusy(action)
    try {
      // Always save first so what gets published is what is on screen.
      const id = await save()
      if (!id) return
      const result = await setLessonStatusAction(id, next)
      if (result.ok) {
        toast.success(
          next === "published"
            ? "Lesson published. Families can see it now."
            : next === "draft"
              ? "Lesson moved back to draft. It is hidden from families."
              : "Lesson archived. It is hidden from families."
        )
      } else {
        // The save succeeded; only the status change was refused.
        toast.error("Saved, but the status was not changed.", { description: result.error })
        setFormError(result.error)
      }
      if (isNew) router.replace(routes.admin.lesson(id))
      else router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const spinner = <LoaderCircle className="animate-spin" aria-hidden="true" />

  return (
    <div className="grid gap-6">
      <BackLink href={routes.admin.lessons}>All lessons</BackLink>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-ink-900">
              {isNew ? "New lesson" : "Edit lesson"}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-ink-500">
            {status === "published"
              ? "This lesson is live. Saved changes appear to families straight away."
              : "Not visible to families until you publish it."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {lessonId ? (
            <Button asChild variant="ghost">
              <Link href={routes.admin.lessonPreview(lessonId)}>
                <Eye aria-hidden="true" />
                Preview
              </Link>
            </Button>
          ) : null}
          <Button variant="outline" onClick={handleSave} disabled={busy !== null}>
            {busy === "save" ? spinner : <Save aria-hidden="true" />}
            {status === "published" ? "Save changes" : "Save draft"}
          </Button>
          {status === "published" ? (
            <Button variant="outline" onClick={() => handleStatus("draft", "unpublish")} disabled={busy !== null}>
              {busy === "unpublish" ? spinner : <Undo2 aria-hidden="true" />}
              Unpublish
            </Button>
          ) : (
            <Button variant="success" onClick={() => handleStatus("published", "publish")} disabled={busy !== null}>
              {busy === "publish" ? spinner : <Send aria-hidden="true" />}
              Save and publish
            </Button>
          )}
          {lessonId && status !== "archived" ? (
            <Button variant="ghost" onClick={() => handleStatus("archived", "archive")} disabled={busy !== null}>
              {busy === "archive" ? spinner : <Archive aria-hidden="true" />}
              Archive
            </Button>
          ) : null}
        </div>
      </div>

      {formError ? (
        <Alert variant="destructive" role="alert">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>{formError}</AlertTitle>
          {errorCount > 0 ? (
            <AlertDescription>
              {errorCount} {errorCount === 1 ? "field needs" : "fields need"} attention. Each one is
              marked below.
            </AlertDescription>
          ) : null}
        </Alert>
      ) : null}

      <Panel id="basics" title="Basics">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              maxLength={120}
              onChange={(event) => {
                const title = event.target.value
                setValues((current) => ({
                  ...current,
                  title,
                  slug: slugTouched ? current.slug : slugify(title),
                }))
              }}
            />
            <ErrorText messages={errorsFor("title")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">URL name</Label>
            <Input
              id="slug"
              value={values.slug}
              maxLength={120}
              aria-describedby="slug-hint"
              onChange={(event) => {
                setSlugTouched(true)
                set("slug", event.target.value)
              }}
            />
            <p id="slug-hint" className="text-sm text-ink-500">
              Lowercase letters, numbers and hyphens. Appears in the lesson&apos;s address.
            </p>
            <ErrorText messages={errorsFor("slug")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="world">Learning world</Label>
            <NativeSelect
              id="world"
              value={values.learning_world_id}
              onChange={(event) => set("learning_world_id", event.target.value)}
            >
              {worlds.map((world) => (
                <option key={world.id} value={world.id}>
                  {world.title}
                  {world.isActive ? "" : " (inactive)"}
                </option>
              ))}
            </NativeSelect>
            <ErrorText messages={errorsFor("learning_world_id")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="age-band">Age group</Label>
            <NativeSelect
              id="age-band"
              value={values.age_band}
              onChange={(event) => set("age_band", event.target.value as AgeBand)}
            >
              {AGE_BANDS.map((band) => (
                <option key={band} value={band}>
                  {AGE_BAND_LABELS[band]}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <NativeSelect
              id="difficulty"
              value={values.difficulty}
              className="capitalize"
              onChange={(event) => set("difficulty", event.target.value as LessonInput["difficulty"])}
            >
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="minutes">Estimated minutes</Label>
            <Input
              id="minutes"
              type="number"
              min={1}
              max={120}
              value={values.estimated_minutes}
              onChange={(event) => set("estimated_minutes", Number(event.target.value) || 0)}
            />
            <ErrorText messages={errorsFor("estimated_minutes")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="order">Order within the world</Label>
            <Input
              id="order"
              type="number"
              min={0}
              max={10000}
              value={values.display_order}
              onChange={(event) => set("display_order", Number(event.target.value) || 0)}
            />
            <ErrorText messages={errorsFor("display_order")} />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              maxLength={600}
              rows={3}
              onChange={(event) => set("description", event.target.value)}
            />
            <ErrorText messages={errorsFor("description")} />
          </div>

          <div className="flex items-start gap-3 md:col-span-2">
            <Checkbox
              id="is-sample"
              checked={values.is_sample}
              onCheckedChange={(checked) => set("is_sample", checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="is-sample" className="leading-relaxed font-semibold">
              Label this as a sample lesson (shown to families as “Sample lesson”)
            </Label>
          </div>
        </div>
      </Panel>

      <Panel id="content" title="Lesson content">
        <StringListEditor
          id="objectives"
          legend="Learning objectives"
          hint="What a child will be able to do after the lesson. At least one is needed to publish."
          itemLabel="objective"
          items={values.learning_objectives}
          onChange={(items) => set("learning_objectives", items)}
          errors={errorsFor("learning_objectives")}
        />

        <div className="grid gap-2">
          <Label htmlFor="transcript">Lesson text / transcript</Label>
          <Textarea
            id="transcript"
            value={values.transcript}
            maxLength={20000}
            rows={12}
            aria-describedby="transcript-hint"
            onChange={(event) => set("transcript", event.target.value)}
          />
          <p id="transcript-hint" className="text-sm text-ink-500">
            Leave a blank line between paragraphs. This is shown to children as the written lesson
            and serves as the video transcript. Required to publish.
          </p>
          <ErrorText messages={errorsFor("transcript")} />
        </div>

        <KeyTermsEditor
          terms={values.key_terms}
          onChange={(terms) => set("key_terms", terms)}
          errors={errorsFor("key_terms")}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <StringListEditor
            id="advantages"
            legend="Advantages"
            hint="What AI is good at in this topic."
            itemLabel="advantage"
            items={values.advantages}
            onChange={(items) => set("advantages", items)}
            errors={errorsFor("advantages")}
          />
          <StringListEditor
            id="limitations"
            legend="Limitations"
            hint="Where AI falls short."
            itemLabel="limitation"
            items={values.limitations}
            onChange={(items) => set("limitations", items)}
            errors={errorsFor("limitations")}
          />
        </div>

        <StringListEditor
          id="safety"
          legend="Safety notes"
          hint="Practical safety advice for children. At least one is needed to publish."
          itemLabel="safety note"
          items={values.safety_notes}
          onChange={(items) => set("safety_notes", items)}
          errors={errorsFor("safety_notes")}
        />

        <StringListEditor
          id="takeaways"
          legend="Key takeaways"
          itemLabel="takeaway"
          items={values.key_takeaways}
          onChange={(items) => set("key_takeaways", items)}
          errors={errorsFor("key_takeaways")}
        />
      </Panel>

      <Panel
        id="media"
        title="Video (optional)"
        description="Upload files to the private “lesson-media” storage bucket in Supabase, then paste their paths here. With no video path, children see a “video coming soon” panel."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="video-key">Video file path</Label>
            <Input
              id="video-key"
              value={values.video_asset_key}
              maxLength={300}
              placeholder="lessons/what-is-ai/video.mp4"
              onChange={(event) => set("video_asset_key", event.target.value)}
            />
            <ErrorText messages={errorsFor("video_asset_key")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="captions-key">Captions file path (.vtt)</Label>
            <Input
              id="captions-key"
              value={values.captions_asset_key}
              maxLength={300}
              placeholder="lessons/what-is-ai/captions.vtt"
              onChange={(event) => set("captions_asset_key", event.target.value)}
            />
            <ErrorText messages={errorsFor("captions_asset_key")} />
          </div>
        </div>
      </Panel>

      <Panel
        id="quiz"
        title="Quiz"
        description="The correct answers and explanations are never sent to a child's device before they answer."
      >
        <QuizEditor quiz={values.quiz} onChange={(quiz) => set("quiz", quiz)} errorsFor={errorsFor} />
      </Panel>

      {versions.length > 0 ? (
        <Panel
          id="versions"
          title="Version history"
          description="A snapshot is stored every time the lesson is saved or its status changes. Quiz attempts record which version the child saw."
        >
          <ol className="grid gap-2">
            {versions.slice(0, 10).map((version) => (
              <li
                key={version.version_number}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-mist px-4 py-2.5 text-sm"
              >
                <span className="font-heading font-semibold text-ink-900">
                  Version {version.version_number}
                  {version.status ? <span className="font-sans font-normal text-ink-500"> · {version.status}</span> : null}
                </span>
                <span className="text-ink-500">
                  {version.changed_by_name ?? "Seed data"} · {formatDateTime(version.created_at)}
                </span>
              </li>
            ))}
          </ol>
          {versions.length > 10 ? (
            <p className="text-sm text-ink-500">Showing the 10 most recent of {versions.length}.</p>
          ) : null}
        </Panel>
      ) : null}

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleSave} disabled={busy !== null}>
          {busy === "save" ? spinner : <Save aria-hidden="true" />}
          {status === "published" ? "Save changes" : "Save draft"}
        </Button>
      </div>
    </div>
  )
}
