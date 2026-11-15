import {
  DailyLearning,
  FinalCta,
  ForParents,
  Hero,
  HowItWorks,
  Safety,
  WorldsPreview,
} from "@/components/marketing/sections"

/**
 * Public landing page. Fully static: it reads no session and no database, so
 * it renders the same whether or not Supabase is configured.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <WorldsPreview />
      <HowItWorks />
      <DailyLearning />
      <Safety />
      <ForParents />
      <FinalCta />
    </>
  )
}
