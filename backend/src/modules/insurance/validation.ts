import { z } from "zod";

export const createInsuranceSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required"),
  insurerName: z.string().trim().min(1, "Insurer name is required"),
  memberId: z.string().trim().min(1, "Member ID is required"),
  groupNumber: z.string().trim().optional(),
  policyNumber: z.string().trim().optional(),
  effectiveDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid effective date (ISO format) is required",
    }),
  expirationDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Valid expiration date (ISO format) is required",
    }),
  relationship: z.enum(["Self", "Spouse", "Child", "Other"]).default("Self"),
  copay: z.coerce.number().min(0, "Copay must be a positive number").optional(),
  deductible: z.coerce.number().min(0, "Deductible must be a positive number").optional(),
});

export const updateInsuranceSchema = createInsuranceSchema.partial();

export type CreateInsuranceInput = z.infer<typeof createInsuranceSchema>;
export type UpdateInsuranceInput = z.infer<typeof updateInsuranceSchema>;
