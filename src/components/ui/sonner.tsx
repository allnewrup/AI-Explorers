"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-aqua-700" />,
        info: <InfoIcon className="size-5 text-electric-600" />,
        warning: <TriangleAlertIcon className="size-5 text-sun-700" />,
        error: <OctagonXIcon className="size-5 text-coral-600" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border-2 !border-ink-200 !bg-white !font-sans !text-ink-900 !shadow-card",
          title: "!font-heading !text-base !font-semibold",
          description: "!text-ink-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
