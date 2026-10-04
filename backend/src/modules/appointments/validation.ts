import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createAppointmentSchema = z.object({
  patientId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid Patient ID format"),
  providerId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid Provider ID format"),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid ISO appointment date and time is required",
    }),
  durationMins: z
    .coerce
    .number()
    .int()
    .min(15, "Duration must be at least 15 minutes")
    .max(240, "Duration cannot exceed 240 minutes")
    .default(30),
  type: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const updateAppointmentSchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Valid ISO appointment date and time is required",
    })
    .optional(),
  durationMins: z
    .coerce
    .number()
    .int()
    .min(15, "Duration must be at least 15 minutes")
    .max(240, "Duration cannot exceed 240 minutes")
    .optional(),
  type: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

export const appointmentQuerySchema = z.object({
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
  status: z.nativeEnum(AppointmentStatus).optional(),
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
  sortBy: z.string().default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;
