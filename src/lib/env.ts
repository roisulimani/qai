import { z } from "zod";

const envSchema = z.object({
  ACCESS_CODE_SECRET: z.string().default("dev-access-code-secret"),
  ADMIN_PORTAL_SECRET: z.string().default("dev-admin-secret"),
  PROJECT_CREDIT_COST: z.coerce.number().int().positive().default(1),
  MESSAGE_CREDIT_COST: z.coerce.number().int().positive().default(1),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(14),
  RESEND_API_KEY: z.string().optional(),
  EARLY_ACCESS_REQUEST_RECIPIENT: z.string().email().default("roi.sul@aol.com"),
  EARLY_ACCESS_REQUEST_FROM: z.string().email().default("no-reply@qai.app"),
});

const parsed = envSchema.safeParse({
  ACCESS_CODE_SECRET: process.env.ACCESS_CODE_SECRET,
  ADMIN_PORTAL_SECRET: process.env.ADMIN_PORTAL_SECRET,
  PROJECT_CREDIT_COST: process.env.PROJECT_CREDIT_COST,
  SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EARLY_ACCESS_REQUEST_RECIPIENT: process.env.EARLY_ACCESS_REQUEST_RECIPIENT,
  EARLY_ACCESS_REQUEST_FROM: process.env.EARLY_ACCESS_REQUEST_FROM,
});

if (!parsed.success) {
  // Surface a readable error during startup so the developer can fix env vars quickly.
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
