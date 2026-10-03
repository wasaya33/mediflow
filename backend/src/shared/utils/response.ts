/**
 * Standard API response helper functions.
 * All route handlers should use these helpers for consistent response shapes.
 *
 * Response shapes:
 *  - success: { success: true, message, data }
 *  - paginated: { success: true, message, data, meta }
 *  - error: { success: false, message, errors? }
 */

import { Response } from "express";
import { PaginationMeta } from "../types";

// ---------------------------------------------------------------------------
// Success Responses
// ---------------------------------------------------------------------------

/**
 * Send a standard success response.
 *
 * @param res - Express Response object
 * @param data - The payload to include in the response
 * @param message - Human-readable success message
 * @param statusCode - HTTP status code (default: 200)
 *
 * @example
 * success(res, { user }, "User created successfully", 201);
 */
export function success<T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send a paginated success response with metadata.
 *
 * @param res - Express Response object
 * @param data - Array of items for the current page
 * @param meta - Pagination metadata (page, limit, total, totalPages, etc.)
 * @param message - Human-readable success message
 *
 * @example
 * paginated(res, claims, { page: 1, limit: 20, total: 150, totalPages: 8, ... });
 */
export function paginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message: string = "Success"
): void {
  res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
}

// ---------------------------------------------------------------------------
// Error Response
// ---------------------------------------------------------------------------

/**
 * Send a standard error response.
 * Prefer using the global error handler (errorHandler.ts) over calling this directly.
 * Use this only for programmatic error responses outside of middleware.
 *
 * @param res - Express Response object
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code (default: 500)
 * @param errors - Optional field-level validation errors
 *
 * @example
 * error(res, "Email already exists", 409);
 * error(res, "Validation failed", 400, { email: ["Invalid email format"] });
 */
export function error(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): void {
  const body: {
    success: boolean;
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
  } = {
    success: false,
    message,
    statusCode,
  };

  if (errors && Object.keys(errors).length > 0) {
    body.errors = errors;
  }

  res.status(statusCode).json(body);
}

// ---------------------------------------------------------------------------
// Pagination Utility
// ---------------------------------------------------------------------------

/**
 * Compute pagination metadata from raw values.
 *
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @param total - Total number of matching records
 * @returns Complete PaginationMeta object
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Calculate Prisma `skip` offset from page/limit values.
 *
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @returns Number of records to skip
 */
export function getPrismaSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
