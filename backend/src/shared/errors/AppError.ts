/**
 * Custom error class hierarchy for MediFlow API.
 * All operational errors should use these classes rather than native Error,
 * allowing the global error handler to distinguish between expected and
 * unexpected failures.
 */

// ---------------------------------------------------------------------------
// Base Error Class
// ---------------------------------------------------------------------------

/**
 * Base class for all operational (expected) application errors.
 * The `isOperational` flag lets the error handler distinguish between
 * programmer errors (bugs) and user/client errors (expected failures).
 */
export class AppError extends Error {
  /** HTTP status code to send in the response */
  public readonly statusCode: number;

  /**
   * True for expected operational errors (e.g., 404, 401).
   * False for unexpected programmer errors that should crash/restart.
   */
  public readonly isOperational: boolean;

  /**
   * @param message - Human-readable error description
   * @param statusCode - HTTP status code (default 500)
   */
  constructor(message: string, statusCode: number = 500) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace, excluding the constructor call from the trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the error name to the class name for easier identification in logs
    this.name = this.constructor.name;
  }
}

// ---------------------------------------------------------------------------
// HTTP 4xx Client Errors
// ---------------------------------------------------------------------------

/**
 * 400 Bad Request — The request body/params failed validation.
 * Can include field-level error details.
 */
export class ValidationError extends AppError {
  /** Field-level validation errors, keyed by field name */
  public readonly errors: Record<string, string[]>;

  /**
   * @param message - Summary error message
   * @param errors - Map of field names to their validation error messages
   */
  constructor(
    message: string = "Validation failed",
    errors: Record<string, string[]> = {}
  ) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized — The request lacks valid authentication credentials.
 * Used when no token is present or the token is invalid/expired.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required. Please log in.") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden — The authenticated user lacks permission for this action.
 * Used when a user is authenticated but does not have the required role/scope.
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = "You do not have permission to perform this action."
  ) {
    super(message, 403);
  }
}

/**
 * 404 Not Found — The requested resource does not exist.
 * @param resource - Optional resource name for clearer messages (e.g., "User", "Claim")
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found.`, 404);
  }
}

/**
 * 409 Conflict — The request conflicts with the current state of the resource.
 * Typically used for unique constraint violations (e.g., duplicate email).
 */
export class ConflictError extends AppError {
  constructor(message: string = "A conflict occurred with an existing record.") {
    super(message, 409);
  }
}

/**
 * 429 Too Many Requests — The client has sent too many requests in a given time.
 */
export class TooManyRequestsError extends AppError {
  constructor(
    message: string = "Too many requests. Please try again later."
  ) {
    super(message, 429);
  }
}
