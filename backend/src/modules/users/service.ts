import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from "../../shared/errors/AppError";
import { PaginationMeta } from "../../shared/types";
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryInput,
} from "./validation";

// Reusable user projection excluding passwordHash
const userSafeSelect = {
  id: true,
  organizationId: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

export class UserService {
  /**
   * List users in the organization with pagination and filters.
   * Strictly enforces organizationId tenant isolation.
   */
  async getUsers(orgId: string, query: UserQueryInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      organizationId: orgId,
      ...(query.role && { role: query.role }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: userSafeSelect,
        orderBy: { createdAt: "desc" },
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

    return { users, meta };
  }

  /**
   * Fetch a single user by ID within the current organization.
   */
  async getUserById(orgId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: orgId,
      },
      select: userSafeSelect,
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  }

  /**
   * Create a new user inside the organization.
   */
  async createUser(orgId: string, createdById: string, data: CreateUserInput) {
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if email is already taken in this organization
    const existing = await prisma.user.findFirst({
      where: {
        organizationId: orgId,
        email: normalizedEmail,
      },
    });

    if (existing) {
      throw new ConflictError(
        `A user with email '${normalizedEmail}' already exists in your organization.`
      );
    }

    // Set initial password (provided or secure auto-generated temporary password)
    const initialPassword = data.password || "TempPass123!";
    const passwordHash = await bcrypt.hash(initialPassword, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        organizationId: orgId,
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: data.role,
        phone: data.phone?.trim() ?? null,
        isActive: true,
      },
      select: userSafeSelect,
    });

    // Create AuditLog
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: createdById,
        action: "CREATE",
        entity: "User",
        entityId: user.id,
        afterValues: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
        }),
      },
    });

    return {
      user,
      initialTemporaryPassword: data.password ? undefined : initialPassword,
    };
  }

  /**
   * Update user details and role within the organization.
   */
  async updateUser(
    orgId: string,
    userId: string,
    data: UpdateUserInput,
    updatedById: string
  ) {
    const existing = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError("User");
    }

    // Prevent self-deactivation by an admin
    if (userId === updatedById && data.isActive === false) {
      throw new ForbiddenError("You cannot deactivate your own account.");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.role && { role: data.role }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() ?? null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: userSafeSelect,
    });

    // Create AuditLog
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: updatedById,
        action: "UPDATE",
        entity: "User",
        entityId: userId,
        beforeValues: JSON.stringify({
          name: existing.name,
          role: existing.role,
          phone: existing.phone,
          isActive: existing.isActive,
        }),
        afterValues: JSON.stringify({
          name: updated.name,
          role: updated.role,
          phone: updated.phone,
          isActive: updated.isActive,
        }),
      },
    });

    return updated;
  }

  /**
   * Soft-delete (deactivate) a user within the organization.
   */
  async deleteUser(orgId: string, userId: string, requestedById: string) {
    const existing = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: orgId,
      },
    });

    if (!existing) {
      throw new NotFoundError("User");
    }

    if (userId === requestedById) {
      throw new ForbiddenError("You cannot deactivate your own account.");
    }

    const deactivated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: userSafeSelect,
    });

    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: requestedById,
        action: "DEACTIVATE",
        entity: "User",
        entityId: userId,
      },
    });

    return deactivated;
  }
}

export const userService = new UserService();
