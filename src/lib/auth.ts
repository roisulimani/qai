import crypto from "crypto";

import { addDays, isAfter } from "date-fns";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const SESSION_COOKIE_NAME = "qai_company_session";
export const ADMIN_COOKIE_NAME = "qai_admin_session";

const ADMIN_COOKIE_VALUE = crypto
  .createHash("sha256")
  .update(env.ADMIN_PORTAL_SECRET)
  .digest("hex");

export const hashAccessCode = (code: string) => {
  return crypto
    .createHash("sha256")
    .update(`${env.ACCESS_CODE_SECRET}:${code.trim().toLowerCase()}`)
    .digest("hex");
};

export const createCompanySession = async (options: {
  companyId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}) => {
  const expiresAt = addDays(new Date(), env.SESSION_TTL_DAYS);

  return prisma.companySession.create({
    data: {
      companyId: options.companyId,
      token: crypto.randomUUID(),
      expiresAt,
      userAgent: options.userAgent ?? undefined,
      ipAddress: options.ipAddress ?? undefined,
    },
    include: {
      company: true,
    },
  });
};

export const findActiveCompanySession = async (token: string | undefined | null) => {
  if (!token) {
    return null;
  }

  const session = await prisma.companySession.findUnique({
    where: { token },
    include: { company: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt && isAfter(new Date(), session.expiresAt)) {
    await prisma.companySession.delete({ where: { id: session.id } });
    return null;
  }

  return session;
};

export const touchCompanySession = async (sessionId: string) => {
  await prisma.companySession.update({
    where: { id: sessionId },
    data: { lastSeenAt: new Date() },
  });
};

export const invalidateCompanySession = async (token: string | undefined | null) => {
  if (!token) return;

  await prisma.companySession.deleteMany({
    where: { token },
  });
};

export const parseCookieHeader = (cookieHeader: string | null | undefined) => {
  if (!cookieHeader) {
    return {} as Record<string, string>;
  }

  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [rawKey, ...rawValue] = cookie.trim().split("=");
    if (!rawKey) {
      return acc;
    }
    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {} as Record<string, string>);
};

export const getAdminCookieValue = () => ADMIN_COOKIE_VALUE;
export const isAdminCookieValid = (value: string | null | undefined) =>
  Boolean(value && value === ADMIN_COOKIE_VALUE);
