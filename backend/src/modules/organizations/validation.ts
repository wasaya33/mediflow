import { z } from "zod";

/**
 * Schema for updating an organization's profile and settings.
 */
export const updateOrgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters long")
    .max(100, "Organization name cannot exceed 100 characters")
    .optional(),

  address: z
    .string()
    .trim()
    .max(255, "Address cannot exceed 255 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid organization email address")
    .optional(),

  taxId: z
    .string()
    .trim()
    .max(30, "Tax ID cannot exceed 30 characters")
    .optional(),

  settings: z
    .record(z.string(), z.unknown())
    .optional(),
});

export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
