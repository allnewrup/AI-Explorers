"use client"

import { useRef } from "react"
import { recordLessonProgressAction } from "@/features/lessons/actions"

/** Native video player with optional captions. Records "finished" once. */
export function LessonVideo({
  src,
  captionsSrc,
  title,
  lessonId,
}: {
  src: string
  captionsSrc: string | null
  title: string
  lessonId?: string | undefined
}) {
  const reported = useRef(false)

  function handleEnded() {
    if (!lessonId || reported.current) return
    reported.current = true
    void recordLessonProgressAction(lessonId, true)
  }

  return (
    <video
      controls
      playsInline
      preload="metadata"
      aria-label={`Video: ${title}`}
      className="aspect-video w-full bg-black"
      onEnded={handleEnded}
    >
      <source src={src} />
      {captionsSrc ? (
        <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />
      ) : null}
      Your browser cannot play this video. The full lesson is written out below.
    </video>
  )
}
