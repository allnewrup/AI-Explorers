import "server-only"

import { COLUMNS } from "@/lib/db-columns"
import { createClient } from "@/lib/supabase/server"
import type { Enums } from "@/types/database"

export type ConsentRecord = {
  id: string
  childProfileId: string
  consentType: Enums<"consent_type">
  policyVersion: string
  status: Enums<"consent_status">
  recordedAt: string
  revokedAt: string | null
}

/** Consent records of the signed-in parent (row-level security scopes them). */
export async function listConsentRecords(): Promise<ConsentRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("parental_consents")
    .select(COLUMNS.parental_consents)
    .order("recorded_at", { ascending: false })

  if (error) throw new Error(`Could not load consent records (${error.code ?? "unknown"}).`)

  return data.map((row) => ({
    id: row.id,
    childProfileId: row.child_profile_id,
    consentType: row.consent_type,
    policyVersion: row.policy_version,
    status: row.consent_status,
    recordedAt: row.recorded_at,
    revokedAt: row.revoked_at,
  }))
}
