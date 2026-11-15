import type { Metadata } from "next"
import { TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MAX_CHILD_PROFILES } from "@/config/gamification"
import { CONSENT_LIMITATION_NOTICE, POLICY_VERSION } from "@/config/policy"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Privacy notice (draft)",
  description: `What ${siteConfig.name} stores about parents and children, and why.`,
}

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "What we store about a parent",
    items: [
      "The email address and password you sign in with. Passwords are handled by our sign-in provider (Supabase Auth) and are never visible to us.",
      "The display name you choose for yourself.",
      "A record of the consent statements you ticked, with the date and the version of this notice.",
    ],
  },
  {
    title: "What we store about a child",
    items: [
      "A generated explorer name (for example “CosmicOtter42”), an avatar choice and an age band.",
      "Learning records: lessons opened and completed, quiz answers and scores, XP, streaks, achievements and daily challenge answers.",
      "Whether you have chosen to show the child on the shared leaderboard.",
    ],
  },
  {
    title: "What we deliberately do not collect",
    items: [
      "A child's real name, date of birth, email address, phone number, photo or location.",
      "Free-text writing from children. There are no chat, comment or messaging features.",
      "Advertising identifiers. There are no adverts and no third-party advertising trackers in the app.",
    ],
  },
  {
    title: "Who can see a child's information",
    items: [
      "You, the parent who created the profile, can see all of that child's records.",
      "Other families can see only an explorer name, avatar and weekly XP, and only if you switch the leaderboard option on. It is off by default.",
      "Content administrators manage lessons. They can see totals such as how many lessons have been completed overall, not individual children's records.",
    ],
  },
  {
    title: "Your choices",
    items: [
      `You can create up to ${MAX_CHILD_PROFILES} explorer profiles, pause a profile, or change its name, avatar and age band at any time.`,
      "You can delete an explorer profile at any time from the Explorers page. Deleting it permanently removes its learning records and consent records.",
      "You can turn leaderboard visibility on or off whenever you like. Each change is recorded.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="bg-mist">
      <div className="container-page max-w-3xl py-14">
        <p className="font-heading text-sm font-semibold tracking-widest text-electric-600 uppercase">
          Version {POLICY_VERSION}
        </p>
        <h1 className="mt-2 text-4xl font-semibold">Privacy notice</h1>
        <p className="mt-4 text-lg text-ink-500">
          This page describes, in plain language, what this early version of {siteConfig.name}{" "}
          stores and why.
        </p>

        <Alert variant="warning" className="mt-8">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Draft: not yet reviewed by a lawyer</AlertTitle>
          <AlertDescription>
            <p>
              This notice accurately describes how the software behaves today, but it is a working
              draft. It must be reviewed by a qualified legal adviser, and a data controller and
              contact address must be named, before {siteConfig.name} is offered to the public.
            </p>
            <p className="mt-2">{CONSENT_LIMITATION_NOTICE}</p>
          </AlertDescription>
        </Alert>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title} aria-labelledby={section.title.replace(/\W+/g, "-")}>
              <h2 id={section.title.replace(/\W+/g, "-")} className="text-2xl font-semibold">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 rounded-2xl bg-white p-4 shadow-soft">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-electric-500" aria-hidden="true" />
                    <span className="text-ink-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
