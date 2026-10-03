/**
 * Application-wide constants, enums, and configuration values.
 * All role definitions, status codes, and shared constants are centralized here
 * to ensure consistency across the entire application.
 */

// ---------------------------------------------------------------------------
// Role Definitions
// ---------------------------------------------------------------------------

/**
 * System-wide user roles, ordered from highest to lowest privilege.
 * - PLATFORM_ADMIN: Full platform access (internal use)
 * - ORG_ADMIN: Full access within their organization
 * - BILLING_MANAGER: Manage billing operations and staff
 * - BILLING_SPECIALIST: Create/edit claims and billing records
 * - PROVIDER: View their own patients and orders
 * - VIEWER: Read-only access to organization data
 */
export const ROLES = {
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  ORG_ADMIN: "ORG_ADMIN",
  BILLING_MANAGER: "BILLING_MANAGER",
  BILLING_SPECIALIST: "BILLING_SPECIALIST",
  PROVIDER: "PROVIDER",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Ordered list of roles by privilege level (highest first) */
export const ROLE_HIERARCHY: Role[] = [
  ROLES.PLATFORM_ADMIN,
  ROLES.ORG_ADMIN,
  ROLES.BILLING_MANAGER,
  ROLES.BILLING_SPECIALIST,
  ROLES.PROVIDER,
  ROLES.VIEWER,
];

// ---------------------------------------------------------------------------
// Claim Status
// ---------------------------------------------------------------------------

/**
 * Medical billing claim lifecycle statuses.
 * Claims flow: DRAFT → SUBMITTED → ACCEPTED/REJECTED → PAID/DENIED → APPEALED → CLOSED
 */
export const CLAIM_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  PAID: "PAID",
  DENIED: "DENIED",
  APPEALED: "APPEALED",
  CLOSED: "CLOSED",
} as const;

export type ClaimStatus = (typeof CLAIM_STATUS)[keyof typeof CLAIM_STATUS];

// ---------------------------------------------------------------------------
// Task Management
// ---------------------------------------------------------------------------

/** Priority levels for billing tasks */
export const TASK_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

/** Task lifecycle statuses */
export const TASK_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  ON_HOLD: "ON_HOLD",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// ---------------------------------------------------------------------------
// Appointment Status
// ---------------------------------------------------------------------------

/** Patient appointment statuses */
export const APPOINTMENT_STATUS = {
  SCHEDULED: "SCHEDULED",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
  RESCHEDULED: "RESCHEDULED",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

// ---------------------------------------------------------------------------
// Pagination Defaults
// ---------------------------------------------------------------------------

/** Default and maximum values for paginated API responses */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ---------------------------------------------------------------------------
// API Configuration
// ---------------------------------------------------------------------------

/** Base path prefix for all API routes */
export const API_PREFIX = "/api" as const;

// ---------------------------------------------------------------------------
// Token & Session
// ---------------------------------------------------------------------------

/** HTTP-only cookie name for refresh tokens */
export const REFRESH_TOKEN_COOKIE = "mediflow_refresh_token" as const;

/** Access token header name */
export const AUTH_HEADER = "Authorization" as const;

/** Bearer token prefix in Authorization header */
export const BEARER_PREFIX = "Bearer " as const;
