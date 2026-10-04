export type UserRole =
  | "PLATFORM_ADMIN"
  | "ORG_ADMIN"
  | "BILLING_MANAGER"
  | "BILLING_SPECIALIST"
  | "PROVIDER"
  | "VIEWER"
  | "SUPER_ADMIN"
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
  statusCode?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface InsurancePolicy {
  id: string;
  organizationId: string;
  patientId: string;
  insurerName: string;
  memberId: string;
  groupNumber?: string | null;
  policyNumber?: string | null;
  effectiveDate: string;
  expirationDate?: string | null;
  relationship?: string | null;
  copay?: number | null;
  deductible?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Patient {
  id: string;
  organizationId: string;
  patientId: string; // Medical Record Number (MRN)
  firstName: string;
  lastName: string;
  dob: string;
  gender?: string | null;
  phone: string;
  email?: string | null;
  address?: Address | null;
  emergencyContact?: EmergencyContact | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  insurancePolicies?: InsurancePolicy[];
}

export interface PatientStats {
  total: number;
  active: number;
  newThisMonth: number;
}

export interface PatientQuery {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreatePatientRequest {
  patientId: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender?: "Male" | "Female" | "Other";
  phone: string;
  email?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  notes?: string;
}

export type UpdatePatientRequest = Partial<CreatePatientRequest> & {
  isActive?: boolean;
};

export interface CreateInsuranceRequest {
  patientId: string;
  insurerName: string;
  memberId: string;
  groupNumber?: string;
  policyNumber?: string;
  effectiveDate: string;
  expirationDate?: string;
  relationship?: "Self" | "Spouse" | "Child" | "Other";
  copay?: number;
  deductible?: number;
}

export type UpdateInsuranceRequest = Partial<CreateInsuranceRequest>;

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Provider {
  id: string;
  organizationId: string;
  npi?: string | null;
  firstName: string;
  lastName: string;
  specialty?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: Address | null;
  taxId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    appointments?: number;
    encounters?: number;
    claims?: number;
  };
}

export interface ProviderStats {
  total: number;
  active: number;
  inactive: number;
  bySpecialty: Record<string, number>;
}

export interface ProviderQuery {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateProviderRequest {
  firstName: string;
  lastName: string;
  npi?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: Address;
  taxId?: string;
}

export type UpdateProviderRequest = Partial<CreateProviderRequest> & {
  isActive?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  organizationId: string;
  patientId: string;
  providerId: string;
  date: string;
  durationMins: number;
  status: AppointmentStatus;
  type?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  patient?: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    dob?: string;
    gender?: string;
  };
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
    npi?: string;
    phone?: string;
    email?: string;
  };
  encounters?: Array<{
    id: string;
    dateOfService: string;
    visitType?: string | null;
    status: string;
  }>;
}

export interface AppointmentStats {
  today: number;
  thisWeek: number;
  pending: number;
  byStatus: Record<AppointmentStatus, number>;
  total: number;
}

export interface AppointmentQuery {
  page?: number;
  limit?: number;
  patientId?: string;
  providerId?: string;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateAppointmentRequest {
  patientId: string;
  providerId: string;
  date: string;
  durationMins?: number;
  type?: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  date?: string;
  durationMins?: number;
  type?: string;
  notes?: string;
  status?: AppointmentStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENCOUNTER TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Encounter {
  id: string;
  organizationId: string;
  patientId: string;
  providerId: string;
  appointmentId?: string | null;
  dateOfService: string;
  visitType?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;
  patient?: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    dob?: string;
    gender?: string;
    address?: Address | null;
    insurancePolicies?: InsurancePolicy[];
  };
  provider?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
    npi?: string;
    phone?: string;
    email?: string;
  };
  appointment?: {
    id: string;
    date: string;
    type?: string | null;
    status: string;
  } | null;
  claims?: Array<{
    id: string;
    claimNumber: string;
    status: string;
    totalAmount: number;
  }>;
}

export interface EncounterStats {
  total: number;
  thisMonth: number;
  byVisitType: Record<string, number>;
}

export interface EncounterQuery {
  page?: number;
  limit?: number;
  patientId?: string;
  providerId?: string;
  visitType?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateEncounterRequest {
  patientId: string;
  providerId: string;
  appointmentId?: string;
  dateOfService: string;
  visitType?: string;
  notes?: string;
  status?: string;
}

export interface UpdateEncounterRequest {
  dateOfService?: string;
  visitType?: string;
  notes?: string;
  status?: string;
}

