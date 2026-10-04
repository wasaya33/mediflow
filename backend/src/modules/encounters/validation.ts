import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createEncounterSchema = z.object({
  patientId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid Patient ID format"),
  providerId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid Provider ID format"),
  appointmentId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid Appointment ID format")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  dateOfService: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid Date of Service (ISO datetime) is required",
    }),
  visitType: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.string().trim().default("COMPLETED"),
});

export const updateEncounterSchema = createEncounterSchema
  .partial();

export const encounterQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  patientId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid Patient ID format")
    .optional(),
  providerId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid Provider ID format")
    .optional(),
  visitType: z.string().trim().optional(),
  dateFrom: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    })
    .optional(),
  dateTo: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    })
    .optional(),
  sortBy: z.string().default("dateOfService"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type UpdateEncounterInput = z.infer<typeof updateEncounterSchema>;
export type EncounterQueryInput = z.infer<typeof encounterQuerySchema>;
