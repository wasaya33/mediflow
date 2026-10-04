export type UserRole =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "BILLER"
  | "PROVIDER"
  | "AUDITOR";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  settings?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole | string;
  phone?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  organization?: Organization;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  orgName: string;
  orgSlug: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  organization: Pick<Organization, "id" | "name" | "slug">;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
