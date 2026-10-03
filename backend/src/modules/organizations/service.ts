import { prisma } from "../../config/db";
import { NotFoundError } from "../../shared/errors/AppError";
import { UpdateOrgInput } from "./validation";
import { Prisma } from "@prisma/client";

export class OrganizationService {
  /**
   * Fetch organization profile and operational statistics.
   */
  async getOrganization(orgId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            claims: true,
            providers: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundError("Organization");
    }

    return organization;
  }

  /**
   * Update organization profile and settings with audit logging.
   */
  async updateOrganization(orgId: string, data: UpdateOrgInput, userId: string) {
    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!existingOrg) {
      throw new NotFoundError("Organization");
    }

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.address !== undefined && { address: data.address?.trim() ?? null }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() ?? null }),
        ...(data.email !== undefined && { email: data.email?.trim() ?? null }),
        ...(data.taxId !== undefined && { taxId: data.taxId?.trim() ?? null }),
        ...(data.settings !== undefined && {
          settings: data.settings as Prisma.InputJsonValue,
        }),
      },
    });

    // Record audit trail
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId,
        action: "UPDATE",
        entity: "Organization",
        entityId: orgId,
        beforeValues: JSON.stringify({
          name: existingOrg.name,
          address: existingOrg.address,
          phone: existingOrg.phone,
          email: existingOrg.email,
          taxId: existingOrg.taxId,
        }),
        afterValues: JSON.stringify({
          name: updated.name,
          address: updated.address,
          phone: updated.phone,
          email: updated.email,
          taxId: updated.taxId,
        }),
      },
    });

    return updated;
  }
}

export const organizationService = new OrganizationService();
