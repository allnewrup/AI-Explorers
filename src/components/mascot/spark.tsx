import { cn } from "cn"

export type SparkMood = "happy" | "wave" | "thinking" | "celebrate" | "oops"

type SparkProps = {
  mood?: SparkMood
  /** Rendered width in pixels. Height follows the 10:11 artwork ratio. */
  size?: number
  /** Gentle hover animation. Disabled automatically for reduced-motion users. */
  floating?: boolean
  /**
   * Accessible name. Omit it when the mascot is purely decorative and the
   * surrounding text already carries the meaning.
   */
  title?: string
  className?: string
}

/**
 * Spark — the AI Explorers robot guide.
 *
 * Original vector artwork drawn for this project (temporary until final
 * illustration is commissioned). It uses only the brand palette.
 */
export function Spark({
  mood = "happy",
  size = 160,
  floating = false,
  title,
  className,
}: SparkProps) {
  const armsUp = mood === "celebrate"
  const waving = mood === "wave"

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={Math.round(size * 1.1)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("shrink-0 overflow-visible", floating && "animate-float", className)}
    >
      {/* ground shadow */}
      <ellipse cx="100" cy="212" rx="46" ry="6" fill="#111B3A" opacity="0.12" />

      {/* antenna */}
      <line x1="100" y1="40" x2="100" y2="20" stroke="#2A4FC4" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="15" r="13" fill="#FFD66B" opacity="0.35" />
      <circle cx="100" cy="15" r="8" fill="#FFD66B" />
      <circle cx="97.5" cy="12.5" r="2.5" fill="#FFFFFF" opacity="0.9" />

      {/* left arm */}
      {armsUp ? (
        <g>
          <path d="M62 152 Q38 140 34 112" fill="none" stroke="#4778F5" strokeWidth="12" strokeLinecap="round" />
          <circle cx="34" cy="108" r="10" fill="#8665E8" />
        </g>
      ) : (
        <g>
          <path d="M62 154 Q40 160 36 182" fill="none" stroke="#4778F5" strokeWidth="12" strokeLinecap="round" />
          <circle cx="36" cy="186" r="10" fill="#8665E8" />
        </g>
      )}

      {/* right arm */}
      {armsUp || waving ? (
        <g
          className={waving ? "animate-wave" : undefined}
          style={waving ? { transformOrigin: "140px 152px" } : undefined}
        >
          <path d="M138 152 Q162 140 166 112" fill="none" stroke="#4778F5" strokeWidth="12" strokeLinecap="round" />
          <circle cx="166" cy="108" r="10" fill="#8665E8" />
        </g>
      ) : (
        <g>
          <path d="M138 154 Q160 160 164 182" fill="none" stroke="#4778F5" strokeWidth="12" strokeLinecap="round" />
          <circle cx="164" cy="186" r="10" fill="#8665E8" />
        </g>
      )}

      {/* feet */}
      <rect x="70" y="194" width="24" height="14" rx="7" fill="#2A4FC4" />
      <rect x="106" y="194" width="24" height="14" rx="7" fill="#2A4FC4" />

      {/* body */}
      <rect x="58" y="134" width="84" height="66" rx="26" fill="#FFFFFF" stroke="#D5DAEA" strokeWidth="3" />
      <circle cx="100" cy="166" r="15" fill="#FFD66B" />
      {/* chest spark */}
      <path
        d="M100 155 L103 163 L111 166 L103 169 L100 177 L97 169 L89 166 L97 163 Z"
        fill="#111B3A"
      />

      {/* neck */}
      <rect x="88" y="124" width="24" height="14" rx="5" fill="#B4BCD6" />

      {/* ears */}
      <rect x="28" y="70" width="16" height="30" rx="8" fill="#8665E8" />
      <rect x="156" y="70" width="16" height="30" rx="8" fill="#8665E8" />

      {/* head */}
      <rect x="38" y="38" width="124" height="94" rx="36" fill="#4778F5" />
      <path d="M58 50 Q100 38 142 50" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.35" />

      {/* visor */}
      <rect x="52" y="56" width="96" height="62" rx="26" fill="#111B3A" />

      <SparkFace mood={mood} />

      {mood === "celebrate" ? (
        <g aria-hidden="true">
          <path d="M22 60 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFD66B" />
          <path d="M178 54 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" fill="#37C8BE" />
          <circle cx="16" cy="96" r="4" fill="#8665E8" />
          <circle cx="186" cy="92" r="4" fill="#FFD66B" />
        </g>
      ) : null}

      {mood === "thinking" ? (
        <g aria-hidden="true">
          <circle cx="168" cy="44" r="5" fill="#B4BCD6" />
          <circle cx="180" cy="28" r="8" fill="#B4BCD6" />
        </g>
      ) : null}
    </svg>
  )
}

function SparkFace({ mood }: { mood: SparkMood }) {
  switch (mood) {
    case "celebrate":
      return (
        <g>
          <path d="M70 88 Q80 74 90 88" fill="none" stroke="#37C8BE" strokeWidth="6" strokeLinecap="round" />
          <path d="M110 88 Q120 74 130 88" fill="none" stroke="#37C8BE" strokeWidth="6" strokeLinecap="round" />
          <path d="M84 98 Q100 114 116 98 Z" fill="#37C8BE" />
        </g>
      )
    case "thinking":
      return (
        <g>
          <circle cx="80" cy="84" r="11" fill="#37C8BE" />
          <circle cx="120" cy="84" r="11" fill="#37C8BE" />
          <circle cx="84" cy="80" r="4.5" fill="#FFFFFF" />
          <circle cx="124" cy="80" r="4.5" fill="#FFFFFF" />
          <path d="M92 104 L108 102" fill="none" stroke="#37C8BE" strokeWidth="5" strokeLinecap="round" />
        </g>
      )
    case "oops":
      return (
        <g>
          <circle cx="80" cy="86" r="10" fill="#37C8BE" />
          <circle cx="120" cy="86" r="10" fill="#37C8BE" />
          <circle cx="77" cy="83" r="3.5" fill="#FFFFFF" />
          <circle cx="117" cy="83" r="3.5" fill="#FFFFFF" />
          <path d="M68 72 L88 76" fill="none" stroke="#37C8BE" strokeWidth="4" strokeLinecap="round" />
          <path d="M132 72 L112 76" fill="none" stroke="#37C8BE" strokeWidth="4" strokeLinecap="round" />
          <path d="M88 106 Q100 98 112 106" fill="none" stroke="#37C8BE" strokeWidth="5" strokeLinecap="round" />
        </g>
      )
    case "wave":
    case "happy":
    default:
      return (
        <g>
          <circle cx="80" cy="84" r="11" fill="#37C8BE" />
          <circle cx="120" cy="84" r="11" fill="#37C8BE" />
          <circle cx="76.5" cy="80.5" r="4" fill="#FFFFFF" />
          <circle cx="116.5" cy="80.5" r="4" fill="#FFFFFF" />
          <path d="M86 100 Q100 111 114 100" fill="none" stroke="#37C8BE" strokeWidth="5" strokeLinecap="round" />
        </g>
      )
  }
}

/** Compact head-only mark used in the logo and small UI spots. */
export function SparkMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <line x1="32" y1="14" x2="32" y2="7" stroke="#2A4FC4" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="6" r="4.5" fill="#FFD66B" />
      <rect x="3" y="27" width="7" height="14" rx="3.5" fill="#8665E8" />
      <rect x="54" y="27" width="7" height="14" rx="3.5" fill="#8665E8" />
      <rect x="8" y="13" width="48" height="42" rx="16" fill="#4778F5" />
      <rect x="14" y="21" width="36" height="27" rx="11" fill="#111B3A" />
      <circle cx="25" cy="32" r="4.5" fill="#37C8BE" />
      <circle cx="39" cy="32" r="4.5" fill="#37C8BE" />
      <path d="M26 40 Q32 45 38 40" fill="none" stroke="#37C8BE" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
