/**
 * Role-Based Access Control (RBAC) Middleware.
 * Restricts access to routes based on the authenticated user's role.
 *
 * Role hierarchy (highest to lowest privilege):
 *   PLATFORM_ADMIN > ORG_ADMIN > BILLING_MANAGER > BILLING_SPECIALIST > PROVIDER > VIEWER
 *
 * Usage patterns:
 *   - requireRoles([ROLES.ORG_ADMIN])             → only ORG_ADMIN
 *   - requireRoles([ROLES.ORG_ADMIN, ROLES.BILLING_MANAGER]) → either role
 *   - requireMinRole(ROLES.BILLING_SPECIALIST)    → any role >= BILLING_SPECIALIST
 *
 * MUST be used AFTER the `auth` middleware (requires req.user).
 */

import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/errors/AppError";
import { Role, ROLE_HIERARCHY, ROLES } from "../config/constants";

// ---------------------------------------------------------------------------
// RBAC: Exact Role Match
// ---------------------------------------------------------------------------

/**
 * Middleware factory that allows access only to users with one of the specified roles.
 * PLATFORM_ADMIN always passes (super-admin bypass).
 *
 * @param allowedRoles - Array of roles that are permitted to access the route
 * @returns Express middleware that enforces the role restriction
 *
 * @example
 * // Only ORG_ADMIN can access this route
 * router.post('/org/settings', auth, requireRoles([ROLES.ORG_ADMIN]), handler);
 *
 * // ORG_ADMIN or BILLING_MANAGER can access
 * router.get('/reports', auth, requireRoles([ROLES.ORG_ADMIN, ROLES.BILLING_MANAGER]), handler);
 */
export function requireRoles(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    const userRole = req.user.role as Role;

    // PLATFORM_ADMIN can bypass all role restrictions
    if (userRole === ROLES.PLATFORM_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${userRole}.`
        )
      );
    }

    next();
  };
}

/**
 * Convenience middleware factory that checks if req.user.role is in allowedRoles.
 * Accepts variadic role strings: authorize("ORG_ADMIN", "PLATFORM_ADMIN")
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    const userRole = req.user.role;

    if (userRole === ROLES.PLATFORM_ADMIN || allowedRoles.includes(userRole)) {
      return next();
    }

    return next(
      new ForbiddenError(
        `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${userRole}.`
      )
    );
  };
}

// ---------------------------------------------------------------------------
// RBAC: Minimum Role (Hierarchy-Based)
// ---------------------------------------------------------------------------

/**
 * Middleware factory that allows access to users with a role at or above
 * the specified minimum role in the hierarchy.
 *
 * Hierarchy (index 0 = highest privilege):
 * PLATFORM_ADMIN(0) > ORG_ADMIN(1) > BILLING_MANAGER(2) > BILLING_SPECIALIST(3) > PROVIDER(4) > VIEWER(5)
 *
 * @param minRole - The minimum role required for access
 * @returns Express middleware that enforces the minimum role restriction
 *
 * @example
 * // BILLING_SPECIALIST, BILLING_MANAGER, ORG_ADMIN, PLATFORM_ADMIN can all access
 * router.post('/claims', auth, requireMinRole(ROLES.BILLING_SPECIALIST), handler);
 */
export function requireMinRole(minRole: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    const userRole = req.user.role as Role;

    const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
    const minRoleIndex = ROLE_HIERARCHY.indexOf(minRole);

    // If role not found in hierarchy, deny access
    if (userRoleIndex === -1) {
      return next(
        new ForbiddenError(`Unknown role: ${userRole}. Access denied.`)
      );
    }

    // Lower index = higher privilege; user must have a role at or before minRole
    if (userRoleIndex > minRoleIndex) {
      return next(
        new ForbiddenError(
          `Access denied. Minimum required role: ${minRole}. Your role: ${userRole}.`
        )
      );
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// RBAC: Ownership Check
// ---------------------------------------------------------------------------

/**
 * Middleware that allows access only if the requesting user is the resource owner
 * OR has one of the specified override roles.
 *
 * Useful for "edit your own profile" type rules:
 * - A user can always edit their own data
 * - An admin can edit anyone's data
 *
 * @param getResourceUserId - Function to extract the owner's userId from the request
 * @param overrideRoles - Roles that can bypass the ownership check
 *
 * @example
 * router.put('/users/:userId', auth,
 *   requireOwnerOrRole(
 *     (req) => req.params.userId,
 *     [ROLES.ORG_ADMIN]
 *   ),
 *   handler
 * );
 */
export function requireOwnerOrRole(
  getResourceUserId: (req: Request) => string,
  overrideRoles: Role[] = [ROLES.PLATFORM_ADMIN, ROLES.ORG_ADMIN]
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    const userRole = req.user.role as Role;
    const userId = req.user.userId;

    // Check if user has an override role
    if (overrideRoles.includes(userRole)) {
      return next();
    }

    // Check if the user owns the resource
    const resourceUserId = getResourceUserId(req);
    if (userId === resourceUserId) {
      return next();
    }

    next(
      new ForbiddenError(
        "You can only access or modify your own resources."
      )
    );
  };
}
