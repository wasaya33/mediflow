/**
 * JWT Authentication Middleware.
 * Verifies the Bearer token from the Authorization header,
 * decodes the payload, and attaches the user context to req.user.
 *
 * Token format expected: Authorization: Bearer <token>
 *
 * On success: req.user is populated with { userId, organizationId, role, email }
 * On failure: throws UnauthorizedError (passed to global error handler)
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../shared/errors/AppError";
import { AuthUser } from "../shared/types";
import { BEARER_PREFIX, AUTH_HEADER, Role } from "../config/constants";

// ---------------------------------------------------------------------------
// JWT Payload Interface
// ---------------------------------------------------------------------------

/** Shape of the data encoded inside our JWT access tokens */
export interface JwtPayload {
  userId: string;
  organizationId: string;
  role: Role;
  email: string;
  iat?: number;
  exp?: number;
}

// ---------------------------------------------------------------------------
// Token Extraction Helper
// ---------------------------------------------------------------------------

/**
 * Extracts the raw token string from the Authorization header.
 * Returns null if the header is missing or malformed.
 *
 * @param req - Express Request object
 * @returns The raw JWT string or null
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers[AUTH_HEADER.toLowerCase()] as string | undefined;

  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    return null;
  }

  // Slice off "Bearer " prefix (7 chars)
  const token = authHeader.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}

// ---------------------------------------------------------------------------
// Auth Middleware
// ---------------------------------------------------------------------------

/**
 * Protects routes by verifying the JWT access token.
 * Attaches the decoded user payload to req.user for downstream use.
 *
 * @throws UnauthorizedError if token is missing, invalid, or expired
 *
 * @example
 * router.get('/profile', auth, asyncHandler(controller.getProfile));
 */
export function auth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    return next(
      new UnauthorizedError(
        "No authentication token provided. Include 'Authorization: Bearer <token>' header."
      )
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Validate that required fields are present in the payload
    if (!decoded.userId || !decoded.organizationId || !decoded.role || !decoded.email) {
      throw new Error("Invalid token payload: missing required fields");
    }

    // Attach user context to the request for downstream handlers
    const user: AuthUser = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role,
      email: decoded.email,
    };

    req.user = user;
    req.organizationId = decoded.organizationId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new UnauthorizedError("Your session has expired. Please log in again.")
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError("Invalid authentication token."));
    }

    // Unknown error — pass as-is
    next(error);
  }
}

/**
 * Optional auth middleware — attaches user context if token is present
 * but does NOT block unauthenticated requests.
 * Use for routes that have different behavior for logged-in vs. guest users.
 *
 * @example
 * router.get('/public-profile', optionalAuth, asyncHandler(controller.getProfile));
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);

  if (!token) {
    return next(); // No token — continue without user context
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (decoded.userId && decoded.organizationId && decoded.role && decoded.email) {
      req.user = {
        userId: decoded.userId,
        organizationId: decoded.organizationId,
        role: decoded.role,
        email: decoded.email,
      };
      req.organizationId = decoded.organizationId;
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
}
