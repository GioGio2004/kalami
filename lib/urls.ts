const isProduction = process.env.NODE_ENV === "production";

/** Where staff belong. NEXT_PUBLIC_STAFF_APP_URL wins; otherwise localhost in dev, the live site in production. */
export const STAFF_APP_URL =
  process.env.NEXT_PUBLIC_STAFF_APP_URL ||
  (isProduction ? "https://staff.kalami.space" : "http://localhost:3101");

/** Code tasks open in the sandbox; quizzes, midterms and finals in the quiz player. */
export function assessmentPath(kind: "task" | "quiz" | "midterm" | "final", assessmentId: string): string {
  return kind === "task" ? `/tasks/${assessmentId}` : `/quizzes/${assessmentId}`;
}

/** This app's own Clerk pages, used even when the NEXT_PUBLIC_CLERK_* URL vars are missing. */
export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
export const SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";

/**
 * `value` if it is one of our join pages (`/join/<code>` or `/join/invite/<token>`),
 * else undefined. Guards the `?next=` hop through onboarding against open redirects.
 */
export function joinReturnPath(value: unknown): string | undefined {
  return typeof value === "string" && /^\/join\/(invite\/)?[A-Za-z0-9_-]{1,64}$/.test(value) ? value : undefined;
}

/** Onboarding that comes back to `path` (a join page) when it is done. */
export function onboardingUrlFor(path: string): string {
  return `/onboarding?next=${encodeURIComponent(path)}`;
}

/** Clerk honours `redirect_url` over the pages' fallbacks, and keeps it when you switch between them. */
export function signInUrlFor(path: string): string {
  return `${SIGN_IN_URL}?redirect_url=${encodeURIComponent(path)}`;
}

/** New accounts set up their notebook first, then land on `path`. */
export function signUpUrlFor(path: string): string {
  return `${SIGN_UP_URL}?redirect_url=${encodeURIComponent(onboardingUrlFor(path))}`;
}
