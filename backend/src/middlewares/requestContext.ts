/**
 * Request context middleware.
 *
 * Assigns every incoming request a correlation ID and logs the request
 * lifecycle (arrival and completion with status code and duration).
 *
 * - If the client sends a well-formed `X-Request-Id` header, it is reused so
 *   a single ID can be traced across services (frontend → API → logs).
 * - Otherwise a new UUID v4 is generated.
 * - The ID is exposed on `req.requestId` and echoed back in the
 *   `X-Request-Id` response header.
 *
 * Register this as the FIRST middleware in app.ts so that every log line and
 * error response — including body-parsing and CORS failures — carries the ID.
 */

import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { REQUEST_ID_HEADER } from "../config/constants";
import { logger } from "../shared/utils/logger";

/**
 * Accept only short, header-safe IDs from clients.
 * Rejecting anything else prevents log injection and unbounded header values.
 */
const VALID_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

/**
 * Resolve the request ID from the incoming header, or generate a new one.
 *
 * @param req - Express Request object
 * @returns A trusted, header-safe request ID
 */
function resolveRequestId(req: Request): string {
  const incoming = req.get(REQUEST_ID_HEADER);
  return incoming && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
}

/**
 * Express middleware that attaches a correlation ID to the request and logs
 * when the request starts and finishes.
 *
 * @example
 * app.use(requestContext);
 */
export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = resolveRequestId(req);
  const startedAt = process.hrtime.bigint();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info(
      `← ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`,
      { requestId }
    );
  });

  next();
}
