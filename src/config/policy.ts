/**
 * Version label stored with every consent record. Bump it whenever the privacy
 * notice or the consent wording below changes.
 */
export const POLICY_VERSION = "2026-11-draft"

export const CONSENT_STATEMENTS = {
  termsAndPrivacy:
    "I am this child's parent or legal guardian, and I have read the privacy notice.",
  childProfileData:
    "I agree that AI Explorers may store this child's explorer name, avatar, age band and learning progress so the service can work.",
  leaderboardDisplay:
    "Show this child's explorer name, avatar and weekly XP on the leaderboard that other families can see.",
} as const

/**
 * Shown wherever consent is collected. Kept deliberately blunt: a ticked box is
 * a record of what a signed-in adult told us, not proof of who they are.
 */
export const CONSENT_LIMITATION_NOTICE =
  "Ticking these boxes records your agreement against your account. It does not verify your identity. Verifiable parental consent, as required by laws such as COPPA and the UK/EU GDPR, is not part of this early version and must be added before a public launch."
