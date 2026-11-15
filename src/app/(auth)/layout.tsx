import { SetupRequired } from "@/components/feedback/setup-required"
import { isSupabaseConfigured } from "@/config/env"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SetupRequired area="Signing in" />
  return children
}
