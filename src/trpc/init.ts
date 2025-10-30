import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import {
  ADMIN_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  findActiveCompanySession,
  getAdminCookieValue,
  parseCookieHeader,
  touchCompanySession,
} from '@/lib/auth';
import { prisma } from '@/lib/db';

type CreateContextOptions = {
  req?: Request;
  headers?: HeadersInit;
};

export const createTRPCContext = async (opts?: CreateContextOptions) => {
  const cookieHeader =
    opts?.req?.headers.get('cookie') ??
    (opts?.headers ? new Headers(opts.headers).get('cookie') : undefined);

  const cookies = parseCookieHeader(cookieHeader);
  const sessionToken = cookies?.[SESSION_COOKIE_NAME] ?? null;
  const adminCookie = cookies?.[ADMIN_COOKIE_NAME] ?? null;

  const session = await findActiveCompanySession(sessionToken);

  if (session?.id) {
    await Promise.all([
      touchCompanySession(session.id),
      prisma.company.update({
        where: { id: session.companyId },
        data: { lastActiveAt: new Date() },
      }),
    ]);
  }

  const isAdmin = Boolean(adminCookie && adminCookie === getAdminCookieValue());

  return {
    company: session?.company ?? null,
    session,
    sessionToken,
    isAdmin,
  };
};
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

const requireCompany = t.middleware(({ ctx, next }) => {
  if (!ctx.company) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Access code required' });
  }
  return next({ ctx: { ...ctx, company: ctx.company } });
});

const requireAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next();
});

export const companyProcedure = baseProcedure.use(requireCompany);
export const adminProcedure = baseProcedure.use(requireAdmin);