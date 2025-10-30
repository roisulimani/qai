import { z } from "zod";

const envSchema = z.object({
  ACCESS_CODE_SECRET: z.string().default("dev-access-code-secret"),
  ADMIN_PORTAL_SECRET: z.string().default("dev-admin-secret"),
  PROJECT_CREDIT_COST: z.coerce.number().int().positive().default(10),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(14),
});

const parsed = envSchema.safeParse({
  ACCESS_CODE_SECRET: process.env.ACCESS_CODE_SECRET,
  ADMIN_PORTAL_SECRET: process.env.ADMIN_PORTAL_SECRET,
  PROJECT_CREDIT_COST: process.env.PROJECT_CREDIT_COST,
  SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
});

if (!parsed.success) {
  // Surface a readable error during startup so the developer can fix env vars quickly.
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
