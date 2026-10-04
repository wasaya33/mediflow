import { z } from "zod";

export const providerAddressSchema = z
  .object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zip: z.string().trim().optional(),
    country: z.string().trim().optional(),
  })
  .optional();

export const createProviderSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters"),
  npi: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "NPI must be exactly 10 digits")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  specialty: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  address: providerAddressSchema,
  taxId: z.string().trim().optional(),
});

export const updateProviderSchema = createProviderSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export const providerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  specialty: z.string().trim().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (typeof val === "boolean") return val;
      if (val.toLowerCase() === "false") return false;
      if (val.toLowerCase() === "true") return true;
      if (val === "all") return undefined;
      return true;
    }),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ProviderQueryInput = z.infer<typeof providerQuerySchema>;
