import { Captions, CircleAlert, VideoOff } from "lucide-react"
import { LessonVideo } from "@/components/lessons/lesson-video"
import { Spark } from "@/components/mascot/spark"
import type { LessonMedia } from "@/features/lessons/queries"

/**
 * The lesson's video area.
 *
 * A player is rendered only when storage has returned a real, signed video
 * URL. Otherwise the panel says plainly that the video is not available yet
 * and points to the written lesson. It never shows a mock player.
 */
export function LessonMediaPanel({
  media,
  title,
  lessonId,
  trackProgress = true,
}: {
  media: LessonMedia
  title: string
  /** Needed to record "video finished" for the active child. */
  lessonId?: string
  trackProgress?: boolean
}) {
  if (media.state === "ready") {
    return (
      <figure className="overflow-hidden rounded-3xl bg-ink-950 shadow-card">
        <LessonVideo
          src={media.videoUrl}
          captionsSrc={media.captionsUrl}
          title={title}
          lessonId={trackProgress ? lessonId : undefined}
        />
        <figcaption className="flex items-center gap-2 bg-ink-900 px-4 py-3 text-sm text-ink-200">
          <Captions className="size-4 shrink-0" aria-hidden="true" />
          {media.captionsUrl
            ? "Captions are available in the player. The full transcript is below."
            : "This video has no captions yet. The full transcript is below."}
        </figcaption>
      </figure>
    )
  }

  const unavailable = media.state === "unavailable"

  return (
    <div
      data-testid="media-pending"
      className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-ink-300 bg-white/70 p-6 text-center sm:flex-row sm:text-left"
    >
      <Spark mood={unavailable ? "oops" : "thinking"} size={96} />
      <div>
        <p className="flex items-center justify-center gap-2 font-heading text-xl font-semibold text-ink-900 sm:justify-start">
          {unavailable ? (
            <CircleAlert className="size-5 text-coral-600" aria-hidden="true" />
          ) : (
            <VideoOff className="size-5 text-ink-500" aria-hidden="true" />
          )}
          {unavailable ? "The video cannot be played right now" : "Video coming soon"}
        </p>
        <p className="mt-1 text-ink-500">
          {unavailable
            ? "Something went wrong loading this lesson's video. You can still read the whole lesson below."
            : "This lesson's video has not been made yet. Everything you need is in the written lesson below."}
        </p>
      </div>
    </div>
  )
}
