/**
 * Express application setup and middleware configuration.
 * This module creates and configures the Express app instance with all
 * middleware in the correct order, routes, and error handlers.
 *
 * MIDDLEWARE ORDER (important — do not reorder):
 * 1. Security (helmet, cors)
 * 2. Body parsing
 * 3. Cookie parsing
 * 4. Request logging
 * 5. Routes
 * 6. 404 handler
 * 7. Global error handler (MUST be last)
 */

import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { API_PREFIX } from "./config/constants";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./shared/utils/logger";
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
    ],
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
// Request Logging Middleware
// ---------------------------------------------------------------------------

/**
 * Log every incoming HTTP request with method, URL, and timestamp.
 * In production, consider replacing with a structured HTTP logger (e.g., morgan).
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`→ ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// ---------------------------------------------------------------------------
// Application Routes
// ---------------------------------------------------------------------------

/**
 * Health Check Endpoint
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
