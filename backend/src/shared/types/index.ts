/**
 * Shared TypeScript types used across the MediFlow backend.
 * These types define the common shapes and contracts for the API layer.
 */

import { Role } from "../../config/constants";

// ---------------------------------------------------------------------------
// Authenticated User Context
// ---------------------------------------------------------------------------

/**
 * The decoded JWT payload attached to every authenticated request.
 * This is set by the `auth` middleware and used throughout request handlers.
 */
export interface AuthUser {
  userId: string;
  organizationId: string;
  role: Role;
  email: string;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/** Input parameters for paginated queries */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Metadata returned with paginated API responses */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ---------------------------------------------------------------------------
// API Response Shapes
// ---------------------------------------------------------------------------

/** Standard successful API response */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

/** Paginated API response with meta information */
export interface ApiPaginatedResponse<T = unknown> {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

/** Standard error API response */
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  stack?: string;
}

// ---------------------------------------------------------------------------
// Query Filters
// ---------------------------------------------------------------------------

/** Base filter available on all tenant-scoped queries */
export interface TenantFilter {
  organizationId: string;
}

/** Common sortable fields direction */
export type SortOrder = "asc" | "desc";

/** Generic sort input for Prisma queries */
export interface SortInput {
  field: string;
  order: SortOrder;
}

// ---------------------------------------------------------------------------
// Utility Types
// ---------------------------------------------------------------------------

/** Makes all properties of T optional recursively */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Extract the resolved type from a Promise */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** ID type alias for MongoDB ObjectId strings */
export type ObjectId = string;
