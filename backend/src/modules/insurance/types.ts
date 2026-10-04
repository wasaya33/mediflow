export type RelationshipToInsured = "Self" | "Spouse" | "Child" | "Other";

export interface InsurancePolicyDto {
  id: string;
  organizationId: string;
  patientId: string;
  insurerName: string;
  memberId: string;
  groupNumber?: string | null;
  policyNumber?: string | null;
  effectiveDate: Date;
  expirationDate?: Date | null;
  relationship?: string | null;
  copay?: number | null;
  deductible?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
