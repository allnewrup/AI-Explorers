import {
  Atom,
  Globe,
  Orbit,
  Rocket,
  Satellite,
  Star,
  Telescope,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { AVATAR_LABELS, toAvatarKey, type AvatarKey } from "@/config/avatars"

const AVATAR_ART: Record<AvatarKey, { icon: LucideIcon; gradient: string }> = {
  rocket: { icon: Rocket, gradient: "from-electric-500 to-nebula-500" },
  star: { icon: Star, gradient: "from-sun-500 to-coral-500" },
  planet: { icon: Globe, gradient: "from-aqua-500 to-electric-500" },
  comet: { icon: Orbit, gradient: "from-nebula-500 to-coral-500" },
  atom: { icon: Atom, gradient: "from-aqua-700 to-aqua-500" },
  telescope: { icon: Telescope, gradient: "from-ink-800 to-electric-600" },
  satellite: { icon: Satellite, gradient: "from-nebula-600 to-electric-500" },
  bolt: { icon: Zap, gradient: "from-coral-500 to-sun-500" },
}

const SIZES = {
  xs: { box: "size-8 rounded-xl", icon: "size-4" },
  sm: { box: "size-10 rounded-xl", icon: "size-5" },
  md: { box: "size-14 rounded-2xl", icon: "size-7" },
  lg: { box: "size-20 rounded-3xl", icon: "size-10" },
  xl: { box: "size-28 rounded-[2rem]", icon: "size-14" },
} as const

/** Original avatar artwork: a brand gradient tile with a line icon. */
export function AvatarDisc({
  avatarKey,
  size = "md",
  decorative = true,
  className,
}: {
  avatarKey: string
  size?: keyof typeof SIZES
  /** When false the avatar announces its name (used in the avatar picker). */
  decorative?: boolean
  className?: string
}) {
  const key = toAvatarKey(avatarKey)
  const art = AVATAR_ART[key]
  const Icon = art.icon
  const dims = SIZES[size]

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `${AVATAR_LABELS[key]} avatar`}
      aria-hidden={decorative ? true : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-linear-to-br text-white shadow-soft ring-2 ring-white",
        art.gradient,
        dims.box,
        className
      )}
    >
      <Icon className={dims.icon} strokeWidth={2} />
    </span>
  )
}
