/**
 * Simple structured console logger for MediFlow backend.
 * Includes timestamp, log level, and formatted message output.
 * In production, this can be swapped for a more robust logger (e.g., winston, pino).
 */

import { env } from "../../config/env";

// ---------------------------------------------------------------------------
// Log Level Type
// ---------------------------------------------------------------------------

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

// ANSI color codes for terminal output (development only)
const COLORS: Record<LogLevel, string> = {
  INFO: "\x1b[36m", // Cyan
  WARN: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  DEBUG: "\x1b[35m", // Magenta
};
const RESET = "\x1b[0m";

// ---------------------------------------------------------------------------
// Core Logging Function
// ---------------------------------------------------------------------------

/**
 * Internal log formatter and writer.
 * Format: [2026-01-01T12:00:00.000Z] [LEVEL] message
 *
 * @param level - Log severity level
 * @param message - Primary log message
 * @param meta - Optional additional data to log (objects are JSON-stringified)
 */
function log(level: LogLevel, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  const isProduction = env.NODE_ENV === "production";

  // In production, use plain text (structured logs for log aggregators)
  // In development, use colored terminal output
  const prefix = isProduction
    ? `[${timestamp}] [${level}]`
    : `${COLORS[level]}[${timestamp}] [${level}]${RESET}`;

  const metaStr =
    meta !== undefined
      ? ` ${typeof meta === "object" ? JSON.stringify(meta, null, 2) : String(meta)}`
      : "";

  const output = `${prefix} ${message}${metaStr}`;

  if (level === "ERROR") {
    console.error(output);
  } else if (level === "WARN") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

// ---------------------------------------------------------------------------
// Public Logger API
// ---------------------------------------------------------------------------

/**
 * Structured application logger.
 * All methods accept an optional `meta` parameter for additional context.
 *
 * @example
 * logger.info("Server started", { port: 5000 });
 * logger.error("Database connection failed", error);
 * logger.warn("JWT_SECRET is weak");
 * logger.debug("Query params", { page: 1, limit: 20 });
 */
export const logger = {
  /**
   * Log informational messages (routine operations, startup events).
   */
  info(message: string, meta?: unknown): void {
    log("INFO", message, meta);
  },

  /**
   * Log warnings (non-critical issues, deprecations, suspicious activity).
   */
  warn(message: string, meta?: unknown): void {
    log("WARN", message, meta);
  },

  /**
   * Log errors (failed operations, exceptions, unhandled rejections).
   */
  error(message: string, meta?: unknown): void {
    log("ERROR", message, meta);
  },

  /**
   * Log debug information — only emitted in development/test environments.
   */
  debug(message: string, meta?: unknown): void {
    if (env.NODE_ENV !== "production") {
      log("DEBUG", message, meta);
    }
  },
};
