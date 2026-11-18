import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ChartColumn,
  CircleCheck,
  CircleHelp,
  Clock,
  EyeOff,
  Flame,
  History,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { WorldArt } from "@/components/lessons/world-art"
import { Spark } from "@/components/mascot/spark"
import { SpeechBubble } from "@/components/mascot/speech-bubble"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { AGE_BAND_LABELS } from "@/config/age-bands"
import { XP_RULES } from "@/config/gamification"
import { routes, siteConfig } from "@/config/site"
import { WORLD_CATALOG } from "@/config/worlds"

function SectionHeading({
  eyebrow,
  title,
  children,
  tone = "dark",
  align = "center",
}: {
  eyebrow: string
  title: string
  children?: React.ReactNode
  tone?: "dark" | "light"
  align?: "center" | "left"
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p
        className={cn(
          "font-heading text-sm font-semibold tracking-widest uppercase",
          tone === "dark" ? "text-electric-600" : "text-sun-400"
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-2 text-3xl font-semibold sm:text-4xl",
          tone === "dark" ? "text-ink-900" : "text-white"
        )}
      >
        {title}
      </h2>
      {children ? (
        <p className={cn("mt-4 text-lg", tone === "dark" ? "text-ink-500" : "text-ink-200")}>
          {children}
        </p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ Hero */

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 text-white">
      <div className="bg-starfield absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="absolute -top-40 -right-32 -z-10 size-[34rem] rounded-full bg-electric-500/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-48 -left-24 -z-10 size-[30rem] rounded-full bg-nebula-500/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge variant="glass" className="text-sm">
            <Sparkles aria-hidden="true" />
            For curious minds aged {siteConfig.launchAgeRange}
          </Badge>
          <h1 className="mt-6 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
            The Future Is AI.{" "}
            <span className="bg-linear-to-r from-sun-400 to-aqua-300 bg-clip-text text-transparent">
              Let&apos;s Help Kids Understand It.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-200 sm:text-xl">{siteConfig.description}</p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild variant="playful" size="xl">
              <Link href={routes.signup}>
                Start exploring
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost-inverse" size="xl" className="ring-2 ring-white/25">
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink-200">
            {["Parent-managed accounts", "No adverts", "No child email needed"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CircleCheck className="size-4 text-aqua-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
          <SpeechBubble tail="bottom" className="mb-6 self-start sm:ml-4">
            <p className="font-heading text-lg font-semibold">Hi! I&apos;m {siteConfig.mascotName}.</p>
            <p className="text-ink-500">Ready to explore AI together?</p>
          </SpeechBubble>
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 scale-110 rounded-full bg-electric-500/25 blur-2xl"
              aria-hidden="true"
            />
            <Spark
              mood="wave"
              size={260}
              floating
              title={`${siteConfig.mascotName}, the AI Explorers robot guide, waving hello`}
            />
          </div>
          <div
            className="absolute top-24 -right-2 hidden rotate-6 rounded-2xl bg-sun-400 px-4 py-2 font-heading text-lg font-bold text-ink-900 shadow-lift sm:block"
            aria-hidden="true"
          >
            +{XP_RULES.lessonCompleted} XP
          </div>
          <div
            className="absolute bottom-10 -left-2 hidden -rotate-6 items-center gap-2 rounded-2xl bg-white px-4 py-2 font-heading font-semibold text-ink-900 shadow-lift sm:flex"
            aria-hidden="true"
          >
            <Flame className="size-5 text-coral-500" />
            Daily streak
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- Worlds */

export function WorldsPreview() {
  return (
    <section id="worlds" className="scroll-mt-20 bg-mist py-20">
      <div className="container-page">
        <SectionHeading eyebrow="Six learning worlds" title="A whole galaxy of AI to explore">
          Each world answers real questions children ask, in short lessons with a quick quiz at the
          end.
        </SectionHeading>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORLD_CATALOG.map((world, index) => (
            <li key={world.slug}>
              <Card variant="elevated" padding="sm" className="h-full">
                <WorldArt imageKey={world.imageKey} />
                <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-sm font-semibold text-ink-500">
                      World {index + 1}
                    </span>
                    <Badge variant="neutral">{AGE_BAND_LABELS[world.ageBand]}</Badge>
                  </div>
                  <CardTitle>{world.title}</CardTitle>
                  <CardDescription className="text-base">{world.description}</CardDescription>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- How it works */

const STEPS: { icon: LucideIcon; title: string; body: string; tone: string }[] = [
  {
    icon: UserPlus,
    title: "A parent creates the account",
    body: "Grown-ups sign up with their own email. Children never register by themselves.",
    tone: "bg-electric-100 text-electric-700",
  },
  {
    icon: Users,
    title: "Set up an explorer profile",
    body: "Pick or type a fun explorer name, then an avatar and an age band. No birthday needed.",
    tone: "bg-nebula-100 text-nebula-700",
  },
  {
    icon: BookOpen,
    title: "Learn, quiz and earn XP",
    body: "Your child works through a lesson, checks what they learned and collects XP and badges.",
    tone: "bg-aqua-100 text-aqua-700",
  },
]

const LESSON_PARTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BookOpen,
    title: "A clear explanation",
    body: "A short, friendly lesson with a full transcript. Video is added as it is produced.",
  },
  {
    icon: Lightbulb,
    title: "Key words and big ideas",
    body: "New vocabulary, what AI is good at, and where it falls short.",
  },
  {
    icon: ShieldCheck,
    title: "Safety notes",
    body: "Every lesson ends with practical advice for staying safe and thinking critically.",
  },
  {
    icon: ListChecks,
    title: "A five-question quiz",
    body: "Instant feedback with an explanation for every answer.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white py-20">
      <div className="container-page">
        <SectionHeading eyebrow="How it works" title="Up and learning in three steps" />

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card variant="outline" className="h-full">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-12 items-center justify-center rounded-2xl", step.tone)}>
                    <step.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-4xl font-bold text-ink-200" aria-hidden="true">
                    {index + 1}
                  </span>
                </div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription className="text-base">{step.body}</CardDescription>
              </Card>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid items-center gap-10 rounded-4xl bg-mist p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h3 className="text-2xl font-semibold sm:text-3xl">What is inside every lesson?</h3>
            <p className="mt-3 text-ink-500">
              Lessons follow the same simple shape, so children always know what comes next, and
              each one takes around ten minutes.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-700 shadow-soft">
              <Clock className="size-4 text-electric-600" aria-hidden="true" />
              About 8–10 minutes each
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {LESSON_PARTS.map((part) => (
              <li key={part.title} className="rounded-2xl bg-white p-5 shadow-soft">
                <part.icon className="size-6 text-electric-600" aria-hidden="true" />
                <p className="mt-3 font-heading text-lg font-semibold">{part.title}</p>
                <p className="mt-1 text-sm text-ink-500">{part.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- Daily learning */

const DAILY: { icon: LucideIcon; title: string; body: string; tone: string }[] = [
  {
    icon: CalendarCheck,
    title: "Daily challenge",
    body: `One question a day, worth ${XP_RULES.dailyChallenge} XP.`,
    tone: "bg-sun-100 text-sun-700",
  },
  {
    icon: Flame,
    title: "Learning streaks",
    body: "Come back tomorrow to keep the streak glowing.",
    tone: "bg-coral-100 text-coral-700",
  },
  {
    icon: Zap,
    title: "XP and levels",
    body: `Earn ${XP_RULES.lessonCompleted} XP per lesson and ${XP_RULES.quizCorrectAnswer} XP per correct answer.`,
    tone: "bg-electric-100 text-electric-700",
  },
  {
    icon: Trophy,
    title: "Badges",
    body: "Unlock achievements as understanding grows.",
    tone: "bg-nebula-100 text-nebula-700",
  },
]

export function DailyLearning() {
  return (
    <section id="daily" className="scroll-mt-20 bg-mist py-20">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Daily learning" title="A little every day goes a long way" align="left">
            Short, regular sessions help ideas stick. Gentle rewards celebrate effort without
            pressure, and nothing is lost by missing a day.
          </SectionHeading>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {DAILY.map((item) => (
              <li key={item.title} className="flex gap-3 rounded-2xl bg-white p-4 shadow-soft">
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", item.tone)}>
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading font-semibold">{item.title}</p>
                  <p className="text-sm text-ink-500">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* An illustration of the daily challenge card, not live data. */}
        <figure className="mx-auto w-full max-w-md">
          <div className="rotate-1 rounded-4xl bg-linear-to-br from-electric-500 to-nebula-500 p-1.5 shadow-lift">
            <div className="rounded-[1.75rem] bg-white p-6">
              <div className="flex items-center justify-between">
                <Badge variant="sun">
                  <Star aria-hidden="true" />
                  Daily challenge
                </Badge>
                <span className="font-heading font-bold text-electric-600">
                  +{XP_RULES.dailyChallenge} XP
                </span>
              </div>
              <p className="mt-4 font-heading text-xl font-semibold">
                What do we call the examples an AI learns from?
              </p>
              <ul className="mt-4 grid gap-2" aria-hidden="true">
                {["Batteries", "Wires", "Data", "Passwords"].map((option) => (
                  <li
                    key={option}
                    className={cn(
                      "rounded-xl border-2 px-4 py-2.5 font-semibold",
                      option === "Data"
                        ? "border-aqua-500 bg-aqua-50 text-aqua-700"
                        : "border-ink-200 text-ink-700"
                    )}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <figcaption className="mt-4 text-center text-sm text-ink-500">
            Illustration of a daily challenge from the sample lessons.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- Safety */

const SAFETY: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Users,
    title: "Parents hold the keys",
    body: "Only a signed-in parent can create, pause or delete an explorer profile.",
  },
  {
    icon: EyeOff,
    title: "Made-up names",
    body: "Children appear under an explorer name such as “CosmicOtter42”. Parents choose it, and rude words are blocked.",
  },
  {
    icon: CalendarCheck,
    title: "Age band, not birthday",
    body: "We ask for an age range so lessons fit. We never ask for a date of birth.",
  },
  {
    icon: Trophy,
    title: "Leaderboard is opt-in",
    body: "A child is shown to other families only if their parent switches it on.",
  },
  {
    icon: CircleHelp,
    title: "Fair, checked scoring",
    body: "Quiz answers are checked and points are awarded by our servers, not by the device.",
  },
  {
    icon: Trash2,
    title: "Delete whenever you like",
    body: "Removing a profile removes its learning records with it.",
  },
]

export function Safety() {
  return (
    <section id="safety" className="scroll-mt-20 bg-ink-900 py-20 text-white">
      <div className="container-page">
        <SectionHeading eyebrow="Child safety" title="Built with care for young learners" tone="light">
          We collect as little as possible and keep grown-ups involved at every step.
        </SectionHeading>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY.map((item) => (
            <li key={item.title} className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-aqua-500/15 text-aqua-300">
                <item.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-ink-200">{item.body}</p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white/5 p-5 text-center text-sm text-ink-200 ring-1 ring-white/10">
          AI Explorers is at an early stage. It has not been certified or accredited by any
          educational or child-safety body, and formal verification of parental consent is not yet
          in place. Read our{" "}
          <Link href={routes.privacy} className="font-bold text-white underline underline-offset-4">
            privacy notice
          </Link>{" "}
          for exactly what is stored.
        </p>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- For parents */

const PARENT_FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ChartColumn,
    title: "Real numbers only",
    body: "Lessons completed, quiz attempts and accuracy come straight from your child's activity. With no activity yet, the dashboard simply says so.",
  },
  {
    icon: History,
    title: "Learning history",
    body: "See which lessons were finished and how each quiz went, in order.",
  },
  {
    icon: CalendarCheck,
    title: "Weekly summary",
    body: "A quick view of what happened this week: XP earned, lessons and quizzes.",
  },
  {
    icon: Users,
    title: "Several children, one account",
    body: "Add a profile for each child and switch between them in a tap.",
  },
]

export function ForParents() {
  return (
    <section id="parents" className="scroll-mt-20 bg-white py-20">
      <div className="container-page grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-28">
          <SectionHeading eyebrow="For parents" title="Know what your child is learning" align="left">
            AI is already part of childhood. AI Explorers helps your child understand it, question
            it and use it responsibly, while you stay informed.
          </SectionHeading>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href={routes.signup}>
                Create a parent account
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          {PARENT_FEATURES.map((feature) => (
            <li key={feature.title}>
              <Card variant="electric" className="h-full">
                <feature.icon className="size-7 text-electric-600" aria-hidden="true" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.body}</CardDescription>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ Final CTA */

export function FinalCta() {
  return (
    <section className="bg-white pb-20">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-4xl bg-linear-to-br from-electric-600 to-nebula-600 px-6 py-12 text-white sm:px-12">
          <div className="bg-starfield absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
          <div className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
            <Spark mood="celebrate" size={150} />
            <div className="flex-1">
              <h2 className="text-3xl font-semibold sm:text-4xl">Ready to start the adventure?</h2>
              <p className="mt-3 text-lg text-white/85">
                Create a parent account, set up an explorer profile and open the first lesson.
              </p>
            </div>
            <Button asChild variant="playful" size="xl">
              <Link href={routes.signup}>
                Get started
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
