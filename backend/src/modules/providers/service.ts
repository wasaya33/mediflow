import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { NotFoundError } from "../../shared/errors/AppError";
import {
  CreateProviderInput,
  UpdateProviderInput,
  ProviderQueryInput,
} from "./validation";
import { ProviderStats } from "./types";

export class ProviderService {
  /**
   * Fetch paginated list of providers with search and filtering.
   */
  async getProviders(orgId: string, query: ProviderQueryInput) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProviderWhereInput = {
      organizationId: orgId,
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.specialty) {
      where.specialty = {
        equals: query.specialty,
        mode: "insensitive",
      };
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { npi: { contains: term, mode: "insensitive" } },
        { specialty: { contains: term, mode: "insensitive" } },
      ];
    }

    const validSortFields = [
      "firstName",
      "lastName",
      "specialty",
      "npi",
      "createdAt",
      "updatedAt",
    ];
    const sortBy = validSortFields.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";
    const sortOrder: Prisma.SortOrder =
      query.sortOrder === "asc" ? "asc" : "desc";

    const [total, providers] = await Promise.all([
      prisma.provider.count({ where }),
      prisma.provider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              appointments: true,
              encounters: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      providers,
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
   * Retrieve single provider by ID within tenant organization with stats.
   */
  async getProviderById(orgId: string, providerId: string) {
    const provider = await prisma.provider.findFirst({
      where: {
        id: providerId,
        organizationId: orgId,
      },
      include: {
        _count: {
          select: {
            appointments: true,
            encounters: true,
            claims: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundError(`Provider with ID '${providerId}' not found.`);
    }

    return provider;
  }

  /**
   * Register a new provider and record an audit log.
   */
  async createProvider(
    orgId: string,
    userId: string,
    data: CreateProviderInput
  ) {
    const provider = await prisma.provider.create({
      data: {
        organizationId: orgId,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        npi: data.npi?.trim() ?? null,
        specialty: data.specialty?.trim() ?? null,
        phone: data.phone?.trim() ?? null,
        email: data.email?.toLowerCase().trim() ?? null,
        address: data.address ? (data.address as Prisma.InputJsonValue) : undefined,
        taxId: data.taxId?.trim() ?? null,
        isActive: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "CREATE",
        entity: "Provider",
        entityId: provider.id,
        afterValues: JSON.stringify({
          firstName: provider.firstName,
          lastName: provider.lastName,
          npi: provider.npi,
          specialty: provider.specialty,
        }),
      },
    });

    return provider;
  }

  /**
   * Update provider details and record audit log.
   */
  async updateProvider(
    orgId: string,
    userId: string,
    providerId: string,
    data: UpdateProviderInput
  ) {
    const existing = await prisma.provider.findFirst({
      where: {
        id: providerId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError(`Provider with ID '${providerId}' not found.`);
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName.trim() }),
        ...(data.lastName !== undefined && { lastName: data.lastName.trim() }),
        ...(data.npi !== undefined && { npi: data.npi ? data.npi.trim() : null }),
        ...(data.specialty !== undefined && {
          specialty: data.specialty ? data.specialty.trim() : null,
        }),
        ...(data.phone !== undefined && { phone: data.phone ? data.phone.trim() : null }),
        ...(data.email !== undefined && {
          email: data.email ? data.email.toLowerCase().trim() : null,
        }),
        ...(data.address !== undefined && {
          address: data.address as Prisma.InputJsonValue,
        }),
        ...(data.taxId !== undefined && { taxId: data.taxId ? data.taxId.trim() : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "UPDATE",
        entity: "Provider",
        entityId: updatedProvider.id,
        beforeValues: JSON.stringify({
          firstName: existing.firstName,
          lastName: existing.lastName,
          npi: existing.npi,
          specialty: existing.specialty,
          isActive: existing.isActive,
        }),
        afterValues: JSON.stringify({
          firstName: updatedProvider.firstName,
          lastName: updatedProvider.lastName,
          npi: updatedProvider.npi,
          specialty: updatedProvider.specialty,
          isActive: updatedProvider.isActive,
        }),
      },
    });

    return updatedProvider;
  }

  /**
   * Soft-delete provider by setting isActive = false.
   */
  async deactivateProvider(orgId: string, userId: string, providerId: string) {
    const existing = await prisma.provider.findFirst({
      where: {
        id: providerId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError(`Provider with ID '${providerId}' not found.`);
    }

    const deactivated = await prisma.provider.update({
      where: { id: providerId },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "DEACTIVATE",
        entity: "Provider",
        entityId: providerId,
        beforeValues: JSON.stringify({ isActive: true }),
        afterValues: JSON.stringify({ isActive: false }),
      },
    });

    return deactivated;
  }

  /**
   * Aggregate provider statistics for organization.
   */
  async getProviderStats(orgId: string): Promise<ProviderStats> {
    const [total, active, inactive, providers] = await Promise.all([
      prisma.provider.count({ where: { organizationId: orgId } }),
      prisma.provider.count({ where: { organizationId: orgId, isActive: true } }),
      prisma.provider.count({ where: { organizationId: orgId, isActive: false } }),
      prisma.provider.findMany({
        where: { organizationId: orgId, isActive: true },
        select: { specialty: true },
      }),
    ]);

    const bySpecialty: Record<string, number> = {};
    for (const p of providers) {
      const spec = p.specialty || "General Practice";
      bySpecialty[spec] = (bySpecialty[spec] || 0) + 1;
    }

    return {
      total,
      active,
      inactive,
      bySpecialty,
    };
  }
}

export const providerService = new ProviderService();
