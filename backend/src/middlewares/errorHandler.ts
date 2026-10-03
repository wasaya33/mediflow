/**
 * Global Express error handling middleware.
 * This MUST be the last middleware registered in app.ts.
 *
 * Handles:
 * - AppError subclasses (operational errors) → use their statusCode
 * - Prisma-specific errors → mapped to appropriate HTTP codes
 * - ZodError → 400 with field-level details
 * - Generic errors → 500 Internal Server Error
 * - Stack trace only included in development mode
 */

import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, ValidationError } from "../shared/errors/AppError";
import { logger } from "../shared/utils/logger";
import { env } from "../config/env";

// ---------------------------------------------------------------------------
// Prisma Error Mapper
// ---------------------------------------------------------------------------

/**
 * Maps Prisma client known request errors to HTTP-friendly AppError instances.
 * Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
 */
function handlePrismaError(
  err: Prisma.PrismaClientKnownRequestError
): AppError {
  switch (err.code) {
    case "P2002": {
      // Unique constraint violation (e.g., duplicate email)
      const fields = (err.meta?.target as string[])?.join(", ") ?? "field";
      return new AppError(`Duplicate value for: ${fields}. Please use a unique value.`, 409);
    }
    case "P2025":
      // Record not found (e.g., update/delete on non-existent record)
      return new AppError("The requested record was not found.", 404);
    case "P2003":
      // Foreign key constraint violation
      return new AppError(
        "Referenced record does not exist. Check related fields.",
        400
      );
    case "P2014":
      // Required relation violation
      return new AppError("The operation violates a required relationship.", 400);
    case "P2016":
      // Query interpretation error
      return new AppError("Query error: invalid data provided.", 400);
    default:
      logger.error(`Unhandled Prisma error [${err.code}]`, {
        message: err.message,
        meta: err.meta,
      });
      return new AppError("A database error occurred.", 500);
  }
}

// ---------------------------------------------------------------------------
// Zod Error Mapper
// ---------------------------------------------------------------------------

/**
 * Converts a ZodError into a ValidationError with field-level error details.
 * Uses z.flattenError() (Zod v4 API) for clean field → messages mapping.
 * Format: { fieldName: ["error message 1", "error message 2"] }
 */
function handleZodError(err: ZodError): ValidationError {
  // Zod v4: z.flattenError() replaces the deprecated .flatten() instance method
  const flattened = z.flattenError(err);
  const errors: Record<string, string[]> = {};

  // Form-level errors (e.g., refinements on the whole object)
  if (flattened.formErrors.length > 0) {
    errors["_root"] = flattened.formErrors;
  }

  // Field-level errors
  const fieldErrors = flattened.fieldErrors as Record<string, string[] | undefined>;
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      errors[field] = messages;
    }
  }

  return new ValidationError("Validation failed", errors);
}

// ---------------------------------------------------------------------------
// Global Error Handler Middleware
// ---------------------------------------------------------------------------

/**
 * Express global error handler.
 * Attach as the LAST middleware in app.ts:
 *
 * @example
 * app.use(errorHandler);
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction // Must have 4 params for Express to treat as error handler
): void {
  let appError: AppError;

  // --- Normalize error to AppError ---

  if (err instanceof AppError) {
    // Already an operational error
    appError = err;
  } else if (err instanceof ZodError) {
    // Zod validation failure
    appError = handleZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma known errors (unique constraint, not found, etc.)
    appError = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    // Prisma schema/query validation error
    appError = new AppError("Invalid data provided to the database.", 400);
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    // Prisma connection error
    appError = new AppError("Database connection failed.", 503);
    logger.error("Prisma initialization error", err.message);
  } else {
    // Unknown / programmer error — default to 500
    appError = new AppError(
      env.NODE_ENV === "development" ? (err.message || "An unexpected internal error occurred.") : "An unexpected internal error occurred.",
      500
    );
    appError.stack = err.stack;
    logger.error(`[${req.method}] ${req.path} → 500 Unhandled Error:`, err);
  }

  // --- Log the error ---
  if (appError.statusCode >= 500 || !appError.isOperational) {
    // Log full details for server errors
    logger.error(`[${req.method}] ${req.path} → ${appError.statusCode}`, {
      message: appError.message,
      stack: appError.stack,
    });
  } else {
    // Log brief info for client errors
    logger.warn(`[${req.method}] ${req.path} → ${appError.statusCode}: ${appError.message}`);
  }

  // --- Build response body ---
  const responseBody: {
    success: boolean;
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
    stack?: string;
  } = {
    success: false,
    message: appError.message,
    statusCode: appError.statusCode,
  };

  // Include field-level errors for ValidationError
  if (appError instanceof ValidationError && Object.keys(appError.errors).length > 0) {
    responseBody.errors = appError.errors;
  }

  // Include stack trace only in development (never expose in production)
  if (env.NODE_ENV === "development") {
    responseBody.stack = appError.stack;
  }

  res.status(appError.statusCode).json(responseBody);
}
