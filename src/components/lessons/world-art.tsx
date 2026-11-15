import {
  Bot,
  MapPinned,
  Palette,
  Rocket,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { isWorldImageKey, type WorldImageKey } from "@/config/worlds"

type WorldTheme = {
  icon: LucideIcon
  /** Background gradient of the illustration panel. */
  gradient: string
  /** Soft tint used for chips and progress accents that belong to the world. */
  tone: "electric" | "nebula" | "aqua" | "sun"
  orbit: string
}

export const WORLD_THEMES: Record<WorldImageKey, WorldTheme> = {
  "world-beginners": {
    icon: Bot,
    gradient: "from-electric-500 to-nebula-500",
    tone: "electric",
    orbit: "border-white/30",
  },
  "world-everyday": {
    icon: MapPinned,
    gradient: "from-aqua-500 to-electric-500",
    tone: "aqua",
    orbit: "border-white/35",
  },
  "world-creativity": {
    icon: Palette,
    gradient: "from-nebula-500 to-coral-500",
    tone: "nebula",
    orbit: "border-white/30",
  },
  "world-detective": {
    icon: ScanSearch,
    gradient: "from-ink-800 to-nebula-600",
    tone: "nebula",
    orbit: "border-white/20",
  },
  "world-safety": {
    icon: ShieldCheck,
    gradient: "from-aqua-700 to-aqua-500",
    tone: "aqua",
    orbit: "border-white/30",
  },
  "world-future": {
    icon: Rocket,
    gradient: "from-ink-900 to-electric-600",
    tone: "sun",
    orbit: "border-white/20",
  },
}

export function getWorldTheme(imageKey: string): WorldTheme {
  return WORLD_THEMES[isWorldImageKey(imageKey) ? imageKey : "world-beginners"]
}

/**
 * Original, code-drawn world illustration. Decorative: the world title is
 * always rendered as text next to it.
 */
export function WorldArt({
  imageKey,
  className,
  size = "md",
}: {
  imageKey: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const theme = getWorldTheme(imageKey)
  const Icon = theme.icon

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br",
        theme.gradient,
        size === "sm" && "h-20",
        size === "md" && "h-36",
        size === "lg" && "h-52",
        className
      )}
    >
      <div className="bg-starfield absolute inset-0 opacity-70" />
      <div className={cn("absolute size-[130%] rounded-full border-2 border-dashed", theme.orbit)} />
      <div className={cn("absolute size-[85%] rounded-full border-2", theme.orbit)} />
      <div className="absolute -top-6 -right-6 size-24 rounded-full bg-white/15 blur-xl" />
      <div className="absolute -bottom-8 -left-4 size-28 rounded-full bg-sun-400/25 blur-2xl" />
      <Sparkles className="absolute top-3 right-4 size-5 animate-twinkle text-sun-300" />
      <div
        className={cn(
          "relative flex items-center justify-center rounded-3xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm",
          size === "sm" ? "size-12" : size === "md" ? "size-20" : "size-28"
        )}
      >
        <Icon
          strokeWidth={1.75}
          className={size === "sm" ? "size-7" : size === "md" ? "size-11" : "size-16"}
        />
      </div>
    </div>
  )
}
