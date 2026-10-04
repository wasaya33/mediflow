import { prisma } from "../../config/db";
import { NotFoundError } from "../../shared/errors/AppError";
import { CreateInsuranceInput, UpdateInsuranceInput } from "./validation";

export class InsuranceService {
  /**
   * List all insurance policies for a patient in the organization.
   */
  async getInsurancesByPatient(orgId: string, patientId: string) {
    // Validate patient exists in this organization
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        organizationId: orgId,
      },
    });

    if (!patient) {
      throw new NotFoundError("Patient");
    }

    const insurances = await prisma.insurancePolicy.findMany({
      where: {
        organizationId: orgId,
        patientId,
      },
      orderBy: { createdAt: "desc" },
    });

    return insurances;
  }

  /**
   * Fetch a single insurance policy by ID.
   */
  async getInsuranceById(orgId: string, insuranceId: string) {
    const insurance = await prisma.insurancePolicy.findFirst({
      where: {
        id: insuranceId,
        organizationId: orgId,
      },
    });

    if (!insurance) {
      throw new NotFoundError("Insurance policy");
    }

    return insurance;
  }

  /**
   * Create an insurance policy linked to a patient in the organization.
   */
  async createInsurance(
    orgId: string,
    userId: string,
    data: CreateInsuranceInput
  ) {
    // Verify patient exists and belongs to this organization
    const patient = await prisma.patient.findFirst({
      where: {
        id: data.patientId,
        organizationId: orgId,
      },
    });

    if (!patient) {
      throw new NotFoundError("Patient");
    }

    const insurance = await prisma.insurancePolicy.create({
      data: {
        organizationId: orgId,
        patientId: data.patientId,
        insurerName: data.insurerName.trim(),
        memberId: data.memberId.trim(),
        groupNumber: data.groupNumber?.trim() ?? null,
        policyNumber: data.policyNumber?.trim() ?? null,
        effectiveDate: new Date(data.effectiveDate),
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        relationship: data.relationship ?? "Self",
        copay: data.copay ?? null,
        deductible: data.deductible ?? null,
        isActive: true,
      },
    });

    // Create AuditLog entry
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "CREATE",
        entity: "InsurancePolicy",
        entityId: insurance.id,
        afterValues: JSON.stringify({
          patientId: insurance.patientId,
          insurerName: insurance.insurerName,
          memberId: insurance.memberId,
        }),
      },
    });

    return insurance;
  }

  /**
   * Update an insurance policy with audit logging.
   */
  async updateInsurance(
    orgId: string,
    userId: string,
    insuranceId: string,
    data: UpdateInsuranceInput
  ) {
    const existing = await prisma.insurancePolicy.findFirst({
      where: {
        id: insuranceId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError("Insurance policy");
    }

    const updated = await prisma.insurancePolicy.update({
      where: { id: insuranceId },
      data: {
        ...(data.insurerName && { insurerName: data.insurerName.trim() }),
        ...(data.memberId && { memberId: data.memberId.trim() }),
        ...(data.groupNumber !== undefined && {
          groupNumber: data.groupNumber?.trim() ?? null,
        }),
        ...(data.policyNumber !== undefined && {
          policyNumber: data.policyNumber?.trim() ?? null,
        }),
        ...(data.effectiveDate && { effectiveDate: new Date(data.effectiveDate) }),
        ...(data.expirationDate !== undefined && {
          expirationDate: data.expirationDate
            ? new Date(data.expirationDate)
            : null,
        }),
        ...(data.relationship && { relationship: data.relationship }),
        ...(data.copay !== undefined && { copay: data.copay ?? null }),
        ...(data.deductible !== undefined && { deductible: data.deductible ?? null }),
      },
    });

    // Create AuditLog entry
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "UPDATE",
        entity: "InsurancePolicy",
        entityId: insuranceId,
        beforeValues: JSON.stringify({
          insurerName: existing.insurerName,
          memberId: existing.memberId,
        }),
        afterValues: JSON.stringify({
          insurerName: updated.insurerName,
          memberId: updated.memberId,
        }),
      },
    });

    return updated;
  }

  /**
   * Soft-delete an insurance policy.
   */
  async deactivateInsurance(
    orgId: string,
    userId: string,
    insuranceId: string
  ) {
    const existing = await prisma.insurancePolicy.findFirst({
      where: {
        id: insuranceId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError("Insurance policy");
    }

    const deactivated = await prisma.insurancePolicy.update({
      where: { id: insuranceId },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "DEACTIVATE",
        entity: "InsurancePolicy",
        entityId: insuranceId,
      },
    });

    return deactivated;
  }
}

export const insuranceService = new InsuranceService();
