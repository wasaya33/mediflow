/**
 * Zod schema validation middleware factory.
 * Validates req.body, req.query, and/or req.params against provided Zod schemas.
 * On failure, throws a ValidationError with field-level error details.
 *
 * @example
 * // Validate only body
 * router.post('/users', validate({ body: createUserSchema }), asyncHandler(controller.create));
 *
 * // Validate body + query params
 * router.get('/claims', validate({ query: paginationSchema }), asyncHandler(controller.list));
 *
 * // Validate URL params
 * router.get('/claims/:id', validate({ params: idParamSchema }), asyncHandler(controller.getById));
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../shared/errors/AppError";

/** Validation targets: which parts of the request to validate */
interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Convert a ZodError into a map of field → error messages.
 * Path arrays are joined with dots: ["address", "city"] → "address.city"
 * Zod v4: uses .issues (the .errors alias was removed in v4)
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".") || "_root";
    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field].push(issue.message);
  }

  return errors;
}

/**
 * Express middleware factory for Zod schema validation.
 * Validates the specified parts of the request and replaces them with
 * the parsed (coerced/transformed) values from Zod.
 *
 * @param schemas - Object specifying which parts of the request to validate
 * @returns Express middleware that validates and parses the request
 * @throws ValidationError with field-level details on failure
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const allErrors: Record<string, string[]> = {};
    let hasErrors = false;

    // Validate and parse req.body
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        hasErrors = true;
        const fieldErrors = formatZodErrors(result.error);
        Object.assign(allErrors, fieldErrors);
      } else {
        // Replace with Zod-parsed/coerced values
        req.body = result.data;
      }
    }

    // Validate and parse req.query
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        hasErrors = true;
        // Prefix query errors to avoid collision with body field names
        const fieldErrors = formatZodErrors(result.error);
        for (const [key, val] of Object.entries(fieldErrors)) {
          allErrors[`query.${key}`] = val;
        }
      } else {
        // Express 5 makes req.query a getter on prototype — use Object.defineProperty
        Object.defineProperty(req, "query", {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
    }

    // Validate and parse req.params
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        hasErrors = true;
        const fieldErrors = formatZodErrors(result.error);
        for (const [key, val] of Object.entries(fieldErrors)) {
          allErrors[`params.${key}`] = val;
        }
      } else {
        Object.defineProperty(req, "params", {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
    }

    if (hasErrors) {
      return next(new ValidationError("Validation failed", allErrors));
    }

    next();
  };
}
