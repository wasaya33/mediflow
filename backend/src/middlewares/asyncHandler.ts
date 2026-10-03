/**
 * Async route handler wrapper.
 * Eliminates the need for try/catch boilerplate in every async route handler
 * by automatically catching rejected promises and forwarding to Express's
 * global error handler via next().
 *
 * @example
 * // Without asyncHandler (verbose):
 * router.get('/', async (req, res, next) => {
 *   try {
 *     const data = await someAsyncOperation();
 *     res.json(data);
 *   } catch (err) {
 *     next(err);
 *   }
 * });
 *
 * // With asyncHandler (clean):
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express route handler to automatically catch errors and
 * forward them to Express's next() error handling middleware.
 *
 * @param fn - An async Express route handler function
 * @returns A standard Express RequestHandler that handles promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
