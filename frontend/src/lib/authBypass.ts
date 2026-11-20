/**
 * Temporary development authentication bypass.
 *
 * Mirrors AUTH_BYPASS_ENABLED in backend/src/middlewares/auth.ts: the bypass
 * only applies under `next dev`. Next.js inlines NODE_ENV as "production"
 * during `next build`, so production bundles always enforce authentication.
 *
 * Set NEXT_PUBLIC_AUTH_BYPASS=false in .env.local to exercise the real login
 * flow during local development.
 */
export const AUTH_BYPASS_ENABLED =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_AUTH_BYPASS !== "false";
