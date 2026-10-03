/**
 * Tenant Isolation Middleware.
 * Extracts the organizationId from the authenticated user's JWT payload
 * and attaches it to req.organizationId for downstream use.
 *
 * IMPORTANT: This middleware must run AFTER the `auth` middleware, since it
 * relies on req.user being populated.
 *
 * Multi-tenancy enforcement strategy:
 * - Every database query MUST include organizationId as a filter
 * - This prevents cross-tenant data leakage (e.g., user A seeing org B's data)
 * - The organizationId is always trusted from the JWT, never from user input
 *
 * @example
 * // Apply auth + tenant to all protected routes:
 * router.use(auth, tenant);
 *
 * // Access in controllers:
 * const orgId = req.organizationId; // always a string after this middleware
 */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../shared/errors/AppError";

/**
 * Ensures the current request has an authenticated user with a valid
 * organizationId, and attaches it to req.organizationId.
 *
 * @throws UnauthorizedError if req.user is not set (auth not applied before this)
 * @throws ForbiddenError if the user has no organizationId (PLATFORM_ADMIN bypass required)
 */
export function tenant(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(
      new UnauthorizedError(
        "Authentication required. The `auth` middleware must run before `tenant`."
      )
    );
  }

  const { organizationId, role } = req.user;

  // Platform admins may optionally bypass tenant isolation
  // (they can explicitly pass an orgId via query param in admin-only endpoints)
  if (role === "PLATFORM_ADMIN" && !organizationId) {
    // PLATFORM_ADMIN without an org — allow through, but log a warning
    req.organizationId = undefined;
    return next();
  }

  if (!organizationId || organizationId.trim().length === 0) {
    return next(
      new ForbiddenError(
        "Your account is not associated with any organization. Please contact support."
      )
    );
  }

  // Ensure req.organizationId is always set from the JWT (never from user input)
  req.organizationId = organizationId;
  next();
}

/**
 * Middleware that requires a specific organizationId to be present.
 * Stricter variant of `tenant` — does not allow PLATFORM_ADMIN bypass.
 * Use on routes where an orgId is always mandatory.
 */
export function requireTenant(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required."));
  }

  const { organizationId } = req.user;

  if (!organizationId || organizationId.trim().length === 0) {
    return next(
      new ForbiddenError(
        "This action requires an organization context. Please contact support."
      )
    );
  }

  req.organizationId = organizationId;
  next();
}
