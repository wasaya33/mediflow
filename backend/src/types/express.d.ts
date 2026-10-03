/**
 * Express Request interface extension for MediFlow.
 * Augments the default Express.Request type with our custom properties
 * so TypeScript knows about req.user and req.organizationId.
 *
 * This file is automatically picked up by TypeScript because it's in the
 * `typeRoots` path defined in tsconfig.json.
 */

import { AuthUser } from "../shared/types";

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user context, set by the `auth` middleware.
       * Undefined on unauthenticated routes.
       */
      user?: AuthUser;

      /**
       * Current tenant's organization ID, set by the `tenant` middleware.
       * Always matches req.user.organizationId — provided as a shortcut.
       * Undefined if user is not in an organization (e.g., PLATFORM_ADMIN).
       */
      organizationId?: string;
    }
  }
}

// This export makes the file a module (required for global augmentation to work)
export {};
