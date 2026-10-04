import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { ConflictError, NotFoundError } from "../../shared/errors/AppError";
import { PaginationMeta } from "../../shared/types";
import {
  CreatePatientInput,
  UpdatePatientInput,
  PatientQueryInput,
} from "./validation";
import { PatientStats } from "./types";

export class PatientService {
  /**
   * List patients in the organization with multi-field search and pagination.
   * Strictly enforces organizationId tenant isolation.
   */
  async getPatients(orgId: string, query: PatientQueryInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      organizationId: orgId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.gender && { gender: query.gender }),
      ...(query.search && {
        OR: [
          { patientId: { contains: query.search, mode: "insensitive" } },
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    };

    // Valid sortable fields
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "firstName",
      "lastName",
      "patientId",
      "dob",
    ];
    const sortBy = validSortFields.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        include: {
          insurancePolicies: {
            where: { isActive: true },
            select: {
              id: true,
              insurerName: true,
              memberId: true,
              effectiveDate: true,
              expirationDate: true,
              copay: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { patients, meta };
  }

  /**
   * Fetch a single patient by ID with active insurance policies.
   */
  async getPatientById(orgId: string, patientId: string) {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        organizationId: orgId,
      },
      include: {
        insurancePolicies: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patient) {
      throw new NotFoundError("Patient");
    }

    return patient;
  }

  /**
   * Create a new patient with MRN uniqueness check and audit logging.
   */
  async createPatient(
    orgId: string,
    userId: string,
    data: CreatePatientInput
  ) {
    const normalizedMrn = data.patientId.trim();

    // Check MRN uniqueness within this tenant organization
    const existing = await prisma.patient.findFirst({
      where: {
        organizationId: orgId,
        patientId: normalizedMrn,
      },
    });

    if (existing) {
      throw new ConflictError(
        `A patient with MRN '${normalizedMrn}' already exists in your organization.`
      );
    }

    const patient = await prisma.patient.create({
      data: {
        organizationId: orgId,
        patientId: normalizedMrn,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        dob: new Date(data.dob),
        gender: data.gender ?? null,
        phone: data.phone.trim(),
        email: data.email?.toLowerCase().trim() ?? null,
        address: data.address ? (data.address as Prisma.InputJsonValue) : undefined,
        emergencyContact: data.emergencyContact
          ? (data.emergencyContact as Prisma.InputJsonValue)
          : undefined,
        notes: data.notes?.trim() ?? null,
        isActive: true,
      },
      include: {
        insurancePolicies: true,
      },
    });

    // Create AuditLog entry
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "CREATE",
        entity: "Patient",
        entityId: patient.id,
        afterValues: JSON.stringify({
          patientId: patient.patientId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dob: patient.dob,
          phone: patient.phone,
        }),
      },
    });

    return patient;
  }

  /**
   * Update an existing patient with uniqueness check and audit logging.
   */
  async updatePatient(
    orgId: string,
    userId: string,
    patientId: string,
    data: UpdatePatientInput
  ) {
    const existing = await prisma.patient.findFirst({
      where: {
        id: patientId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError("Patient");
    }

    // If MRN is being modified, ensure it's not taken by another patient in the same organization
    if (data.patientId && data.patientId.trim() !== existing.patientId) {
      const duplicateMrn = await prisma.patient.findFirst({
        where: {
          organizationId: orgId,
          patientId: data.patientId.trim(),
          NOT: { id: patientId },
        },
      });

      if (duplicateMrn) {
        throw new ConflictError(
          `MRN '${data.patientId.trim()}' is already assigned to another patient.`
        );
      }
    }

    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...(data.patientId && { patientId: data.patientId.trim() }),
        ...(data.firstName && { firstName: data.firstName.trim() }),
        ...(data.lastName && { lastName: data.lastName.trim() }),
        ...(data.dob && { dob: new Date(data.dob) }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.email !== undefined && {
          email: data.email ? data.email.toLowerCase().trim() : null,
        }),
        ...(data.address !== undefined && {
          address: data.address as Prisma.InputJsonValue,
        }),
        ...(data.emergencyContact !== undefined && {
          emergencyContact: data.emergencyContact as Prisma.InputJsonValue,
        }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() ?? null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        insurancePolicies: {
          where: { isActive: true },
        },
      },
    });

    // Create AuditLog entry
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "UPDATE",
        entity: "Patient",
        entityId: patientId,
        beforeValues: JSON.stringify({
          patientId: existing.patientId,
          firstName: existing.firstName,
          lastName: existing.lastName,
          phone: existing.phone,
          isActive: existing.isActive,
        }),
        afterValues: JSON.stringify({
          patientId: updated.patientId,
          firstName: updated.firstName,
          lastName: updated.lastName,
          phone: updated.phone,
          isActive: updated.isActive,
        }),
      },
    });

    return updated;
  }

  /**
   * Soft-delete (deactivate) a patient record.
   */
  async deactivatePatient(
    orgId: string,
    userId: string,
    patientId: string
  ) {
    const existing = await prisma.patient.findFirst({
      where: {
        id: patientId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError("Patient");
    }

    const deactivated = await prisma.patient.update({
      where: { id: patientId },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "DEACTIVATE",
        entity: "Patient",
        entityId: patientId,
      },
    });

    return deactivated;
  }

  /**
   * Retrieve organizational patient statistics.
   */
  async getPatientStats(orgId: string): Promise<PatientStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, newThisMonth] = await Promise.all([
      prisma.patient.count({
        where: { organizationId: orgId },
      }),
      prisma.patient.count({
        where: { organizationId: orgId, isActive: true },
      }),
      prisma.patient.count({
        where: {
          organizationId: orgId,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    return { total, active, newThisMonth };
  }
}

export const patientService = new PatientService();
