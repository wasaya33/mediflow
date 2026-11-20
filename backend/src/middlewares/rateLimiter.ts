/**
 * Rate limiting for abuse-prone public endpoints.
 *
 * Limits are tracked per client IP in memory:
 * - Behind a reverse proxy or load balancer, set TRUST_PROXY so Express
 *   resolves the real client IP from X-Forwarded-For. Otherwise every client
 *   shares the proxy's IP and therefore a single bucket.
 * - When running multiple API instances, switch to a shared store (e.g.
 *   Redis) so limits apply across instances.
 *
 * When a limit is exceeded the request is forwarded to the global error
 * handler as a TooManyRequestsError, so clients receive the standard error
 * envelope (including requestId) together with a Retry-After header.
 */

import rateLimit, { type Options } from "express-rate-limit";
import { TooManyRequestsError } from "../shared/errors/AppError";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

/** Forward limit violations to the global error handler. */
function forwardTooManyRequests(message: string): Options["handler"] {
  return (_req, _res, next) => next(new TooManyRequestsError(message));
}

/**
 * Login: at most 10 failed attempts per IP every 15 minutes.
 * Successful logins are not counted, so users are never locked out by
 * their own valid sign-ins.
 */
export const loginRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: forwardTooManyRequests(
    "Too many failed login attempts. Please try again in 15 minutes."
  ),
});

/**
 * Registration: at most 5 attempts per IP per hour. Every successful
 * registration creates a new tenant organization, so all attempts count.
 */
export const registerRateLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: forwardTooManyRequests(
    "Too many registration attempts. Please try again later."
  ),
});
