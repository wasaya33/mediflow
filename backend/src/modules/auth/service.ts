import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors/AppError";
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./validation";

export class AuthService {
  /**
   * Register a new Organization and its initial ORG_ADMIN user.
   */
  async register(data: RegisterInput) {
    const normalizedSlug = data.orgSlug.toLowerCase().trim();
    const normalizedEmail = data.email.toLowerCase().trim();

    // 1. Check if org slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: normalizedSlug },
    });
    if (existingOrg) {
      throw new ConflictError(
        `Organization identifier '${normalizedSlug}' is already taken. Please choose another.`
      );
    }

    // 2. Check if user email already exists across the platform
    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictError(
        `A user account with email '${normalizedEmail}' already exists.`
      );
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

    // 4. Create Organization and initial User
    const organization = await prisma.organization.create({
      data: {
        name: data.orgName.trim(),
        slug: normalizedSlug,
        isActive: true,
      },
    });

    const user = await prisma.user.create({
      data: {
        organizationId: organization.id,
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: UserRole.ORG_ADMIN,
        isActive: true,
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 5. Create AuditLogs for onboarding traceability
    await prisma.auditLog.createMany({
      data: [
        {
          organizationId: organization.id,
          userId: user.id,
          action: "CREATE",
          entity: "Organization",
          entityId: organization.id,
          afterValues: JSON.stringify({ name: organization.name, slug: organization.slug }),
        },
        {
          organizationId: organization.id,
          userId: user.id,
          action: "CREATE",
          entity: "User",
          entityId: user.id,
          afterValues: JSON.stringify({ name: user.name, email: user.email, role: user.role }),
        },
      ],
    });

    // 6. Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: organization.id,
        role: user.role,
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
    );

    return {
      user,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      token,
    };
  }

  /**
   * Authenticate a user by email & password.
   */
  async login(data: LoginInput) {
    const normalizedEmail = data.email.toLowerCase().trim();

    // 1. Find user by email (include organization to check tenant status)
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // 3. Check user and organization active status
    if (!user.isActive) {
      throw new ForbiddenError("Your user account has been deactivated. Please contact your administrator.");
    }

    if (!user.organization || !user.organization.isActive) {
      throw new ForbiddenError("Your organization has been suspended. Please contact support.");
    }

    // 4. Update last login timestamp
    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: now },
    });

    // 5. Create AuditLog for login
    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
        metadata: { loginTime: now.toISOString() },
      },
    });

    // 6. Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        organizationId: user.organizationId,
        role: user.role,
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
    );

    return {
      user: {
        id: user.id,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        lastLoginAt: now,
        createdAt: user.createdAt,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
      },
      token,
    };
  }

  /**
   * Get the current authenticated user's profile with organization details.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
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
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            phone: true,
            email: true,
            taxId: true,
            settings: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User profile");
    }

    return user;
  }

  /**
   * Update the current authenticated user's own profile.
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true },
    });

    if (!existing) {
      throw new NotFoundError("User");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() ?? null }),
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Change user password after verifying the current password.
   */
  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Current password is incorrect.");
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, env.BCRYPT_SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        action: "UPDATE_PASSWORD",
        entity: "User",
        entityId: user.id,
      },
    });

    return { message: "Password changed successfully." };
  }
}

export const authService = new AuthService();
