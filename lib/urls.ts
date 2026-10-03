const isProduction = process.env.NODE_ENV === "production";

/** Where staff belong. NEXT_PUBLIC_STAFF_APP_URL wins; otherwise localhost in dev, the live site in production. */
export const STAFF_APP_URL =
  process.env.NEXT_PUBLIC_STAFF_APP_URL ||
  (isProduction ? "https://staff.kalami.space" : "http://localhost:3101");

/** This app's own Clerk pages, used even when the NEXT_PUBLIC_CLERK_* URL vars are missing. */
export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
export const SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
