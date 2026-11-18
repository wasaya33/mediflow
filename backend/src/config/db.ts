/**
 * Prisma Client singleton for MediFlow.
 *
 * SINGLETON PATTERN:
 * In development with hot-reloading (tsx watch), each file save could create a
 * new PrismaClient instance, quickly exhausting the MongoDB connection pool.
 * We prevent this by caching the instance on `globalThis` in non-production envs.
 *
 * In production, a fresh PrismaClient is created once at startup and reused.
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { logger } from "../shared/utils/logger";

// ---------------------------------------------------------------------------
// Singleton Cache
// ---------------------------------------------------------------------------

// Extend globalThis to hold our cached Prisma instance (TypeScript-safe)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ---------------------------------------------------------------------------
// Client Configuration
// ---------------------------------------------------------------------------

/**
 * Creates a new Prisma client with appropriate logging settings.
 * In development: log queries, info, warnings, and errors.
 * In production: log only warnings and errors to reduce noise.
 */
function createPrismaClient(): PrismaClient {
  const isDevelopment = env.NODE_ENV === "development";

  const client = new PrismaClient({
    log: isDevelopment
      ? [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ]
      : [
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
  });

  // In development, log slow queries (> 100ms)
  if (isDevelopment) {
    (client as unknown as { $on: (event: string, cb: (e: { duration: number; query: string }) => void) => void }).$on(
      "query",
      (event: { duration: number; query: string }) => {
        if (event.duration > 100) {
          logger.warn(`Slow query (${event.duration}ms): ${event.query}`);
        }
      }
    );
  }

  return client;
}

// ---------------------------------------------------------------------------
// Exported Singleton
// ---------------------------------------------------------------------------

/**
 * The global Prisma client instance.
 * - In development: cached on globalThis to survive hot-reload
 * - In production: always a fresh instance (single process, no reloads)
 *
 * Import this anywhere you need database access:
 * @example
 * import { prisma } from '../config/db';
 * const users = await prisma.user.findMany({ where: { organizationId } });
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

// Cache in development to prevent connection pool exhaustion on hot-reload
if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ---------------------------------------------------------------------------
// Connection Helpers
// ---------------------------------------------------------------------------

/**
 * Explicitly connect to the MongoDB database via Prisma.
 * Called during server startup to verify the connection is healthy
 * before accepting traffic.
 *
 * @throws If the database is unreachable
 */
export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("✅ MongoDB connected successfully via Prisma");
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB:", error);
    throw error; // Re-throw to crash startup (fail-fast)
  }
}

/**
 * Gracefully disconnect from the database.
 * Called during server shutdown to release the connection pool cleanly.
 */
export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info("🔌 MongoDB disconnected.");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

/** Maximum time a readiness probe waits for MongoDB before reporting "down" */
const DB_HEALTH_TIMEOUT_MS = 3_000;

/** Result of a database health probe */
export interface DatabaseHealth {
  status: "up" | "down";
  /** Round-trip time of the probe in milliseconds */
  latencyMs: number;
}

/**
 * Check database availability by sending a lightweight `ping` command.
 * Never throws: failures and timeouts are reported as `status: "down"` and
 * logged server-side, so connection details are never exposed to clients.
 *
 * @param timeoutMs - Maximum time to wait for a response (default: 3s)
 * @returns The database status and probe latency
 */
export async function checkDatabaseHealth(
  timeoutMs: number = DB_HEALTH_TIMEOUT_MS
): Promise<DatabaseHealth> {
  const startedAt = Date.now();
  let timer: NodeJS.Timeout | undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Database ping timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
    timer.unref();
  });

  try {
    await Promise.race([prisma.$runCommandRaw({ ping: 1 }), timeout]);
    return { status: "up", latencyMs: Date.now() - startedAt };
  } catch (error) {
    logger.warn("Database health check failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
    return { status: "down", latencyMs: Date.now() - startedAt };
  } finally {
    clearTimeout(timer);
  }
}
