export const siteConfig = {
  name: "AI Explorers",
  tagline: "Learn AI. Play Smart. Think Critically.",
  description:
    "An exciting learning adventure where children discover artificial intelligence through stories, videos, games and interactive challenges.",
  mascotName: "Spark",
  launchAgeRange: "8–12",
} as const

export const routes = {
  home: "/",
  privacy: "/privacy",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  onboarding: "/onboarding",
  child: {
    dashboard: "/child",
    learn: "/child/learn",
    world: (slug: string) => `/child/learn/${slug}`,
    lesson: (slug: string) => `/child/lessons/${slug}`,
    quiz: (slug: string) => `/child/lessons/${slug}/quiz`,
    quizResults: (slug: string, attemptId: string) =>
      `/child/lessons/${slug}/quiz/results/${attemptId}`,
    challenge: "/child/challenge",
    progress: "/child/progress",
    leaderboard: "/child/leaderboard",
  },
  parent: {
    dashboard: "/parent",
    children: "/parent/children",
  },
  admin: {
    dashboard: "/admin",
    lessons: "/admin/lessons",
    newLesson: "/admin/lessons/new",
    lesson: (id: string) => `/admin/lessons/${id}`,
    lessonPreview: (id: string) => `/admin/lessons/${id}/preview`,
    worlds: "/admin/worlds",
  },
} as const

/** Path prefixes that require a signed-in parent or administrator. */
export const PROTECTED_PREFIXES = ["/child", "/parent", "/admin", "/onboarding"] as const

/** Auth pages that a signed-in user should be bounced away from. */
export const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password"] as const
