import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";
import {
  CreateEncounterInput,
  UpdateEncounterInput,
  EncounterQueryInput,
} from "./validation";
import { EncounterStats } from "./types";

export class EncounterService {
  /**
   * Fetch paginated list of encounters with filtering and relations.
   */
  async getEncounters(orgId: string, query: EncounterQueryInput) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.EncounterWhereInput = {
      organizationId: orgId,
    };

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    if (query.providerId) {
      where.providerId = query.providerId;
    }

    if (query.visitType) {
      where.visitType = {
        equals: query.visitType,
        mode: "insensitive",
      };
    }

    if (query.dateFrom || query.dateTo) {
      where.dateOfService = {};
      if (query.dateFrom) {
        where.dateOfService.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.dateOfService.lte = new Date(query.dateTo);
      }
    }

    const validSortFields = ["dateOfService", "createdAt", "visitType", "status"];
    const sortBy = validSortFields.includes(query.sortBy)
      ? query.sortBy
      : "dateOfService";
    const sortOrder: Prisma.SortOrder =
      query.sortOrder === "asc" ? "asc" : "desc";

    const [total, encounters] = await Promise.all([
      prisma.encounter.count({ where }),
      prisma.encounter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              dob: true,
            },
          },
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
              npi: true,
            },
          },
          appointment: {
            select: {
              id: true,
              date: true,
              type: true,
              status: true,
            },
          },
          claims: {
            select: {
              id: true,
              claimNumber: true,
              status: true,
              totalAmount: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      encounters,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Retrieve single encounter by ID with detailed relations.
   */
  async getEncounterById(orgId: string, encounterId: string) {
    const encounter = await prisma.encounter.findFirst({
      where: {
        id: encounterId,
        organizationId: orgId,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            dob: true,
            gender: true,
            address: true,
            insurancePolicies: {
              where: { isActive: true },
            },
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            npi: true,
            phone: true,
            email: true,
          },
        },
        appointment: true,
        claims: {
          include: {
            payer: true,
            diagnoses: true,
            procedures: true,
          },
        },
      },
    });

    if (!encounter) {
      throw new NotFoundError(`Encounter with ID '${encounterId}' not found.`);
    }

    return encounter;
  }

  /**
   * Create a new encounter (optionally linked to an appointment).
   */
  async createEncounter(
    orgId: string,
    userId: string,
    data: CreateEncounterInput
  ) {
    // Validate patient exists in org
    const patient = await prisma.patient.findFirst({
      where: {
        id: data.patientId,
        organizationId: orgId,
      },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundError(
        `Patient with ID '${data.patientId}' was not found in your organization.`
      );
    }

    // Validate provider exists in org
    const provider = await prisma.provider.findFirst({
      where: {
        id: data.providerId,
        organizationId: orgId,
      },
      select: { id: true },
    });

    if (!provider) {
      throw new NotFoundError(
        `Provider with ID '${data.providerId}' was not found in your organization.`
      );
    }

    // If linked to an appointment, validate and update appointment status if needed
    if (data.appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: data.appointmentId,
          organizationId: orgId,
        },
      });

      if (!appointment) {
        throw new NotFoundError(
          `Appointment with ID '${data.appointmentId}' not found in your organization.`
        );
      }

      if (appointment.patientId !== data.patientId) {
        throw new ValidationError(
          "The appointment belongs to a different patient than the encounter patient."
        );
      }

      // Automatically mark appointment as completed if it was scheduled
      if (appointment.status === AppointmentStatus.SCHEDULED) {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { status: AppointmentStatus.COMPLETED },
        });
      }
    }

    const encounter = await prisma.encounter.create({
      data: {
        organizationId: orgId,
        patientId: data.patientId,
        providerId: data.providerId,
        appointmentId: data.appointmentId || null,
        dateOfService: new Date(data.dateOfService),
        visitType: data.visitType?.trim() ?? "Office Visit",
        notes: data.notes?.trim() ?? null,
        status: data.status?.trim() ?? "COMPLETED",
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            type: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "CREATE",
        entity: "Encounter",
        entityId: encounter.id,
        afterValues: JSON.stringify({
          patientId: encounter.patientId,
          providerId: encounter.providerId,
          dateOfService: encounter.dateOfService,
          visitType: encounter.visitType,
          appointmentId: encounter.appointmentId,
        }),
      },
    });

    return encounter;
  }

  /**
   * Update encounter details and record audit log.
   */
  async updateEncounter(
    orgId: string,
    userId: string,
    encounterId: string,
    data: UpdateEncounterInput
  ) {
    const existing = await prisma.encounter.findFirst({
      where: {
        id: encounterId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError(`Encounter with ID '${encounterId}' not found.`);
    }

    const updated = await prisma.encounter.update({
      where: { id: encounterId },
      data: {
        ...(data.dateOfService !== undefined && {
          dateOfService: new Date(data.dateOfService),
        }),
        ...(data.visitType !== undefined && {
          visitType: data.visitType ? data.visitType.trim() : null,
        }),
        ...(data.notes !== undefined && {
          notes: data.notes ? data.notes.trim() : null,
        }),
        ...(data.status !== undefined && {
          status: data.status.trim(),
        }),
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "UPDATE",
        entity: "Encounter",
        entityId: updated.id,
        beforeValues: JSON.stringify({
          dateOfService: existing.dateOfService,
          visitType: existing.visitType,
          status: existing.status,
        }),
        afterValues: JSON.stringify({
          dateOfService: updated.dateOfService,
          visitType: updated.visitType,
          status: updated.status,
        }),
      },
    });

    return updated;
  }

  /**
   * Fetch all encounters for a specific patient.
   */
  async getEncountersByPatient(orgId: string, patientId: string) {
    const encounters = await prisma.encounter.findMany({
      where: {
        organizationId: orgId,
        patientId,
      },
      orderBy: { dateOfService: "desc" },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            type: true,
          },
        },
        claims: {
          select: {
            id: true,
            claimNumber: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    return encounters;
  }

  /**
   * Aggregate encounter statistics for organization.
   */
  async getEncounterStats(orgId: string): Promise<EncounterStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisMonth, allEncounters] = await Promise.all([
      prisma.encounter.count({ where: { organizationId: orgId } }),
      prisma.encounter.count({
        where: {
          organizationId: orgId,
          dateOfService: { gte: startOfMonth },
        },
      }),
      prisma.encounter.findMany({
        where: { organizationId: orgId },
        select: { visitType: true },
      }),
    ]);

    const byVisitType: Record<string, number> = {};
    for (const enc of allEncounters) {
      const type = enc.visitType || "Office Visit";
      byVisitType[type] = (byVisitType[type] || 0) + 1;
    }

    return {
      total,
      thisMonth,
      byVisitType,
    };
  }
}

export const encounterService = new EncounterService();
