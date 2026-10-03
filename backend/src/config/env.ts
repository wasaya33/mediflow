/**
 * Environment variable validation using Zod.
 * This module validates ALL environment variables on startup and throws a
 * descriptive error if any are missing or invalid, preventing silent failures.
 */

import { z } from "zod";
import dotenv from "dotenv";

// Load .env file before validation
dotenv.config();

/** Zod schema for all required environment variables */
const envSchema = z.object({
  PORT: z
    .string()
    .default("5000")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive("PORT must be a positive number")),

  NODE_ENV: z
    .enum(["development", "production", "test"], {
      error: "NODE_ENV must be one of: development, production, test",
    })
    .default("development"),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (url) => url.startsWith("mongodb://") || url.startsWith("mongodb+srv://"),
      {
        message:
          "DATABASE_URL must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://",
      }
    ),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long for security"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  FRONTEND_URL: z
    .string()
    .url("FRONTEND_URL must be a valid URL (e.g. http://localhost:3000)"),

  BCRYPT_SALT_ROUNDS: z
    .string()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(8, "BCRYPT_SALT_ROUNDS must be at least 8")
        .max(14, "BCRYPT_SALT_ROUNDS should not exceed 14 (too slow)")
    ),

  COOKIE_SECRET: z
    .string()
    .min(32, "COOKIE_SECRET must be at least 32 characters long for security"),
});

/** Inferred TypeScript type from the validated schema */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns a typed config object.
 * Throws a descriptive error on startup if validation fails.
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missingVars: string[] = [];

    // Zod v4: use .issues directly (.format() was removed in v4)
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "_root";
      missingVars.push(`  • ${field}: ${issue.message}`);
    }

    throw new Error(
      `\n❌ Invalid environment variables:\n${missingVars.join("\n")}\n\n` +
        `Please check your .env file against .env.example\n`
    );
  }

  return result.data;
}

/** Validated, typed environment configuration — safe to import anywhere */
export const env = validateEnv();
