/**
 * Server entry point for MediFlow API.
 * Responsibilities:
 * 1. Validate environment variables (via env.ts import)
 * 2. Connect to MongoDB via Prisma
 * 3. Start the Express HTTP server
 * 4. Set up graceful shutdown handlers (SIGTERM, SIGINT)
 * 5. Set up global error handlers (uncaughtException, unhandledRejection)
 *
 * Startup order: env validation → db connect → http listen
 * Shutdown order: close http server → disconnect db → exit
 */

// Import env FIRST — crashes immediately on invalid config (fail-fast)
import { env } from "./config/env";
import { prisma, connectDB, disconnectDB } from "./config/db";
import app from "./app";
import { logger } from "./shared/utils/logger";
import { Server } from "http";

// ---------------------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------------------

/**
 * Gracefully shut down the server and database connection.
 * Allows in-flight requests to complete before closing (up to a timeout).
 *
 * @param server - The HTTP server instance
 * @param signal - The signal that triggered the shutdown (for logging)
 */
async function gracefulShutdown(server: Server, signal: string): Promise<void> {
  logger.info(`\n${signal} received — initiating graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info("HTTP server closed. No longer accepting connections.");

    try {
      // Disconnect from MongoDB
      await disconnectDB();
      logger.info("Database disconnected successfully.");
      logger.info("Graceful shutdown complete. Goodbye! 👋");
      process.exit(0);
    } catch (error) {
      logger.error("Error during database disconnection:", error);
      process.exit(1);
    }
  });

  // Force-kill after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10_000).unref();
}

// ---------------------------------------------------------------------------
// Global Error Handlers
// ---------------------------------------------------------------------------

/**
 * Handle synchronous uncaught exceptions (programmer errors).
 * We log and exit — these are NOT safe to continue from.
 */
process.on("uncaughtException", (error: Error) => {
  logger.error("UNCAUGHT EXCEPTION — shutting down", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

/**
 * Handle unhandled Promise rejections.
 * Log the reason and exit cleanly.
 */
process.on("unhandledRejection", (reason: unknown) => {
  logger.error("UNHANDLED PROMISE REJECTION — shutting down", {
    reason:
      reason instanceof Error
        ? { message: reason.message, stack: reason.stack }
        : reason,
  });
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Server Start
// ---------------------------------------------------------------------------

/**
 * Main startup function.
 * Connects to the database, then starts the HTTP server.
 * Any failure here will crash the process (correct fail-fast behavior).
 */
async function startServer(): Promise<void> {
  try {
    // Step 1: Connect to MongoDB via Prisma
    try {
      await connectDB();
    } catch (dbError) {
      if (env.NODE_ENV === "production") {
        throw dbError;
      }
      logger.warn(
        "⚠️  MongoDB is not running at DATABASE_URL. Server started in development mode.\n" +
        "   To connect to MongoDB, either start local MongoDB or set a MongoDB Atlas URI in .env"
      );
    }

    // Step 2: Start Express HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info("🏥  MediFlow API Server Started");
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info(`🌍  Environment : ${env.NODE_ENV}`);
      logger.info(`🚀  Server URL  : http://localhost:${env.PORT}`);
      logger.info(`❤️   Health      : http://localhost:${env.PORT}/api/health`);
      logger.info(`🔗  Frontend    : ${env.FRONTEND_URL}`);
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });

    // Step 3: Register graceful shutdown signal handlers
    process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
  } catch (error) {
    logger.error("Failed to start server:", error);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
}

// Boot the server
startServer();

// Suppress unused-variable warning for prisma (imported to ensure singleton is ready)
void prisma;
