import { z } from "zod";
import { UserRole } from "@prisma/client";

/**
 * Schema for creating a new user within an organization.
 */
export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  role: z
    .nativeEnum(UserRole, {
      message: `Invalid role. Must be one of: ${Object.values(UserRole).join(", ")}`,
    })
    .default(UserRole.BILLING_SPECIALIST),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .optional(),
});

/**
 * Schema for updating an existing user.
 */
export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  role: z
    .nativeEnum(UserRole)
    .optional(),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

/**
 * Schema for querying and paginating user lists.
 */
export const userQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),

  search: z
    .string()
    .trim()
    .optional(),

  role: z
    .nativeEnum(UserRole)
    .optional(),

  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
