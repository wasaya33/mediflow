import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { NotFoundError, ValidationError } from "../../shared/errors/AppError";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentQueryInput,
} from "./validation";
import { AppointmentStats } from "./types";
import { logger } from "../../shared/utils/logger";

export class AppointmentService {
  /**
   * Fetch paginated list of appointments with filters.
   */
  async getAppointments(orgId: string, query: AppointmentQueryInput) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {
      organizationId: orgId,
    };

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    if (query.providerId) {
      where.providerId = query.providerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) {
        where.date.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.date.lte = new Date(query.dateTo);
      }
    }

    const validSortFields = ["date", "createdAt", "status", "durationMins"];
    const sortBy = validSortFields.includes(query.sortBy)
      ? query.sortBy
      : "date";
    const sortOrder: Prisma.SortOrder =
      query.sortOrder === "desc" ? "desc" : "asc";

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
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
          encounters: {
            select: {
              id: true,
              dateOfService: true,
              visitType: true,
              status: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      appointments,
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
   * Retrieve single appointment by ID within tenant organization.
   */
  async getAppointmentById(orgId: string, appointmentId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
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
        encounters: {
          include: {
            claims: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundError(
        `Appointment with ID '${appointmentId}' not found.`
      );
    }

    return appointment;
  }

  /**
   * Create appointment after verifying patient and provider ownership.
   */
  async createAppointment(
    orgId: string,
    userId: string,
    data: CreateAppointmentInput
  ) {
    // Verify patient belongs to organization
    const patient = await prisma.patient.findFirst({
      where: {
        id: data.patientId,
        organizationId: orgId,
      },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!patient) {
      throw new NotFoundError(
        `Patient with ID '${data.patientId}' was not found in your organization.`
      );
    }

    // Verify provider belongs to organization
    const provider = await prisma.provider.findFirst({
      where: {
        id: data.providerId,
        organizationId: orgId,
      },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!provider) {
      throw new NotFoundError(
        `Provider with ID '${data.providerId}' was not found in your organization.`
      );
    }

    const appointmentDate = new Date(data.date);
    const duration = data.durationMins || 30;
    const appointmentEnd = new Date(
      appointmentDate.getTime() + duration * 60 * 1000
    );

    // Check potential scheduling overlap for same provider
    const overlapping = await prisma.appointment.findFirst({
      where: {
        organizationId: orgId,
        providerId: data.providerId,
        status: AppointmentStatus.SCHEDULED,
        date: {
          gte: new Date(appointmentDate.getTime() - 60 * 60 * 1000),
          lte: appointmentEnd,
        },
      },
    });

    if (overlapping) {
      logger.warn(
        `Scheduling overlap detected for provider ${provider.id} around ${appointmentDate.toISOString()}`
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        organizationId: orgId,
        patientId: data.patientId,
        providerId: data.providerId,
        date: appointmentDate,
        durationMins: duration,
        status: AppointmentStatus.SCHEDULED,
        type: data.type?.trim() ?? null,
        notes: data.notes?.trim() ?? null,
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

    // Audit log
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "CREATE",
        entity: "Appointment",
        entityId: appointment.id,
        afterValues: JSON.stringify({
          patientId: appointment.patientId,
          providerId: appointment.providerId,
          date: appointment.date,
          durationMins: appointment.durationMins,
          status: appointment.status,
          type: appointment.type,
        }),
      },
    });

    return appointment;
  }

  /**
   * Update appointment details and record audit log.
   */
  async updateAppointment(
    orgId: string,
    userId: string,
    appointmentId: string,
    data: UpdateAppointmentInput
  ) {
    const existing = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError(
        `Appointment with ID '${appointmentId}' not found.`
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.durationMins !== undefined && { durationMins: data.durationMins }),
        ...(data.type !== undefined && { type: data.type ? data.type.trim() : null }),
        ...(data.notes !== undefined && { notes: data.notes ? data.notes.trim() : null }),
        ...(data.status !== undefined && { status: data.status }),
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

    // Audit log
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "UPDATE",
        entity: "Appointment",
        entityId: updated.id,
        beforeValues: JSON.stringify({
          date: existing.date,
          status: existing.status,
          durationMins: existing.durationMins,
        }),
        afterValues: JSON.stringify({
          date: updated.date,
          status: updated.status,
          durationMins: updated.durationMins,
        }),
      },
    });

    return updated;
  }

  /**
   * Cancel an appointment.
   */
  async cancelAppointment(orgId: string, userId: string, appointmentId: string) {
    const existing = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError(
        `Appointment with ID '${appointmentId}' not found.`
      );
    }

    if (existing.status === AppointmentStatus.CANCELLED) {
      throw new ValidationError("Appointment is already cancelled.");
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
      include: {
        patient: true,
        provider: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "CANCEL",
        entity: "Appointment",
        entityId: appointmentId,
        beforeValues: JSON.stringify({ status: existing.status }),
        afterValues: JSON.stringify({ status: AppointmentStatus.CANCELLED }),
      },
    });

    return updated;
  }

  /**
   * Mark appointment as No-Show.
   */
  async markNoShow(orgId: string, userId: string, appointmentId: string) {
    const existing = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError(
        `Appointment with ID '${appointmentId}' not found.`
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.NO_SHOW },
      include: {
        patient: true,
        provider: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "NO_SHOW",
        entity: "Appointment",
        entityId: appointmentId,
        beforeValues: JSON.stringify({ status: existing.status }),
        afterValues: JSON.stringify({ status: AppointmentStatus.NO_SHOW }),
      },
    });

    return updated;
  }

  /**
   * Fetch upcoming appointments for dashboard widget.
   */
  async getUpcomingAppointments(orgId: string, limit = 10) {
    const now = new Date();
    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId: orgId,
        status: AppointmentStatus.SCHEDULED,
        date: { gte: now },
      },
      take: limit,
      orderBy: { date: "asc" },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
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

    return appointments;
  }

  /**
   * Fetch appointment stats for organization (today, this week, by status).
   */
  async getAppointmentStats(orgId: string): Promise<AppointmentStats> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [todayCount, weekCount, allAppointments] = await Promise.all([
      prisma.appointment.count({
        where: {
          organizationId: orgId,
          date: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.appointment.count({
        where: {
          organizationId: orgId,
          date: { gte: startOfWeek, lte: endOfWeek },
        },
      }),
      prisma.appointment.findMany({
        where: { organizationId: orgId },
        select: { status: true },
      }),
    ]);

    const byStatus: Record<AppointmentStatus, number> = {
      [AppointmentStatus.SCHEDULED]: 0,
      [AppointmentStatus.COMPLETED]: 0,
      [AppointmentStatus.CANCELLED]: 0,
      [AppointmentStatus.NO_SHOW]: 0,
    };

    for (const a of allAppointments) {
      if (a.status in byStatus) {
        byStatus[a.status as AppointmentStatus] += 1;
      }
    }

    return {
      today: todayCount,
      thisWeek: weekCount,
      pending: byStatus[AppointmentStatus.SCHEDULED],
      byStatus,
      total: allAppointments.length,
    };
  }
}

export const appointmentService = new AppointmentService();
