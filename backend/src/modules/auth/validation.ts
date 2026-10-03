import { z } from "zod";

/**
 * Schema for organization registration + initial ORG_ADMIN user creation.
 */
export const registerSchema = z.object({
  orgName: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters long")
    .max(100, "Organization name cannot exceed 100 characters"),

  orgSlug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Organization slug must be at least 2 characters long")
    .max(50, "Organization slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens (e.g. 'metro-health')"
    ),

  name: z
    .string()
    .trim()
    .min(2, "User name must be at least 2 characters long")
    .max(100, "User name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

/**
 * Schema for user login.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z.string().min(1, "Password is required"),
});

/**
 * Schema for updating user profile.
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional(),
});

/**
 * Schema for changing password.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(100, "New password cannot exceed 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "New password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
