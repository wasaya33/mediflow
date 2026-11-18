/**
 * Express application setup and middleware configuration.
 * This module creates and configures the Express app instance with all
 * middleware in the correct order, routes, and error handlers.
 *
 * MIDDLEWARE ORDER (important — do not reorder):
 * 1. Request context (correlation ID + request logging)
 * 2. Security (helmet, cors)
 * 3. Body parsing
 * 4. Cookie parsing
 * 5. Routes
 * 6. 404 handler
 * 7. Global error handler (MUST be last)
 */

import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { checkDatabaseHealth } from "./config/db";
import { API_PREFIX, REQUEST_ID_HEADER } from "./config/constants";
import { errorHandler } from "./middlewares/errorHandler";
import { requestContext } from "./middlewares/requestContext";
import { NotFoundError } from "./shared/errors/AppError";
import authRoutes from "./modules/auth/routes";
import organizationRoutes from "./modules/organizations/routes";
import userRoutes from "./modules/users/routes";
import patientRoutes from "./modules/patients/routes";
import insuranceRoutes from "./modules/insurance/routes";
import providerRoutes from "./modules/providers/routes";
import appointmentRoutes from "./modules/appointments/routes";
import encounterRoutes from "./modules/encounters/routes";

const app = express();

// ---------------------------------------------------------------------------
// Request Context
// ---------------------------------------------------------------------------

/**
 * Assign a correlation ID (X-Request-Id) to every request and log its
 * arrival and completion (status code + duration). Registered first so that
 * every subsequent log line and error response can reference the ID.
 */
app.use(requestContext);

// ---------------------------------------------------------------------------
// Security Middleware
// ---------------------------------------------------------------------------

/**
 * Helmet: Sets various security-related HTTP headers to protect against
 * common web vulnerabilities (XSS, clickjacking, sniffing, etc.)
 */
app.use(helmet());

/**
 * CORS: Allows requests only from the configured FRONTEND_URL.
 * - credentials: true allows cookies and Authorization headers
 * - X-Request-Id is accepted from and exposed to the browser for tracing
 * - Adjust methods/headers as needed when adding more complex flows
 */
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      REQUEST_ID_HEADER,
    ],
    exposedHeaders: [REQUEST_ID_HEADER],
  })
);

// ---------------------------------------------------------------------------
// Body Parsing Middleware
// ---------------------------------------------------------------------------

/** Parse incoming JSON request bodies (up to 10MB for file-like payloads) */
app.use(express.json({ limit: "10mb" }));

/** Parse URL-encoded bodies (form submissions) */
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ---------------------------------------------------------------------------
// Cookie Parser
// ---------------------------------------------------------------------------

/**
 * Cookie parser with secret for signed cookies.
 * Signed cookies are used for refresh tokens to prevent tampering.
 */
app.use(cookieParser(env.COOKIE_SECRET));

// ---------------------------------------------------------------------------
// Application Routes
// ---------------------------------------------------------------------------

/**
 * Health Check Endpoint (liveness)
 * Used by load balancers, container orchestrators, and monitoring tools
 * to verify the service is running.
 *
 * GET /api/health
 */
app.get(`${API_PREFIX}/health`, (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "MediFlow API is running",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env["npm_package_version"] ?? "1.0.0",
  });
});

/**
 * Readiness Check Endpoint
 * Verifies that downstream dependencies (MongoDB) are reachable, so
 * orchestrators only route traffic to instances that can serve requests.
 * Returns 200 when ready and 503 when a dependency is unavailable.
 *
 * GET /api/health/ready
 */
app.get(`${API_PREFIX}/health/ready`, async (_req: Request, res: Response) => {
  const database = await checkDatabaseHealth();
  const isReady = database.status === "up";

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    message: isReady
      ? "MediFlow API is ready"
      : "MediFlow API is not ready: database unavailable",
    timestamp: new Date().toISOString(),
    checks: { database },
  });
});

/**
 * Root Endpoint
 * Simple welcome message for the API root.
 *
 * GET /
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MediFlow API — Medical Billing Platform",
    docs: `${env.FRONTEND_URL}/docs`,
    health: `${API_PREFIX}/health`,
  });
});

// ---------------------------------------------------------------------------
// Module Routes
// ---------------------------------------------------------------------------
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/organizations`, organizationRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/patients`, patientRoutes);
app.use(`${API_PREFIX}/insurance`, insuranceRoutes);
app.use(`${API_PREFIX}/providers`, providerRoutes);
app.use(`${API_PREFIX}/appointments`, appointmentRoutes);
app.use(`${API_PREFIX}/encounters`, encounterRoutes);

// ---------------------------------------------------------------------------
// 404 Handler
// ---------------------------------------------------------------------------

/**
 * Catch-all handler for unmatched routes.
 * Must come AFTER all route definitions.
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

/**
 * MUST be the last middleware registered.
 * Express identifies error handlers by the 4-parameter signature (err, req, res, next).
 */
app.use(errorHandler);

export default app;
