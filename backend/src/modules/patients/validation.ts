import { z } from "zod";

export const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zip: z.string().trim().optional(),
    country: z.string().trim().optional(),
  })
  .optional();

export const emergencyContactSchema = z
  .object({
    name: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    relationship: z.string().trim().optional(),
  })
  .optional();

export const createPatientSchema = z.object({
  patientId: z
    .string()
    .trim()
    .min(1, "Patient ID (MRN) is required"),
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters"),
  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid Date of Birth (ISO date) is required",
    }),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number is too long"),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  notes: z.string().trim().optional(),
});

export const updatePatientSchema = createPatientSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export const patientQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return true;
      if (typeof val === "boolean") return val;
      if (val.toLowerCase() === "false") return false;
      if (val.toLowerCase() === "true") return true;
      if (val === "all") return undefined;
      return true;
    }),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientQueryInput = z.infer<typeof patientQuerySchema>;
