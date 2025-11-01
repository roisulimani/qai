import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { hashAccessCode } from "@/lib/auth";
import { adminProcedure, companyProcedure, createTRPCRouter } from "@/trpc/init";

export const companiesRouter = createTRPCRouter({
  getCurrent: companyProcedure.query(async ({ ctx }) => {
    const company = await prisma.company.findUnique({
      where: { id: ctx.company.id },
      select: {
        id: true,
        name: true,
        codeLabel: true,
        creditBalance: true,
        totalCreditsGranted: true,
        totalCreditsSpent: true,
        projectsCreated: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
        buildTourCompleted: true,
        projectsTourCompleted: true,
        projectViewTourCompleted: true,
      },
    });

    if (!company) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
    }

    const recentProject = await prisma.project.findFirst({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    return {
      ...company,
      lastProjectAt: recentProject?.createdAt ?? null,
    };
  }),

  adminList: adminProcedure.query(async () => {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sessions: {
          orderBy: { lastSeenAt: "desc" },
          take: 1,
        },
        creditTransactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      codeLabel: company.codeLabel,
      creditBalance: company.creditBalance,
      totalCreditsGranted: company.totalCreditsGranted,
      totalCreditsSpent: company.totalCreditsSpent,
      projectsCreated: company.projectsCreated,
      lastActiveAt: company.lastActiveAt,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      projectsCount: company._count.projects,
      lastSession: company.sessions[0] ?? null,
      lastCreditTransactionAt: company.creditTransactions[0]?.createdAt ?? null,
    }));
  }),

  adminCreate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: "Company name is required" }),
        code: z.string().min(4, { message: "Code must be at least 4 characters" }),
        initialCredits: z.coerce.number().int().min(0),
        codeLabel: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const codeHash = hashAccessCode(input.code);

      const existingCompany = await prisma.company.findUnique({
        where: { codeHash },
        select: { id: true },
      });

      if (existingCompany) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A company with this access code already exists",
        });
      }

      const company = await prisma.company.create({
        data: {
          name: input.name,
          codeLabel: input.codeLabel ?? null,
          codeHash,
          creditBalance: input.initialCredits,
          totalCreditsGranted: input.initialCredits,
        },
      });

      if (input.initialCredits > 0) {
        await prisma.creditTransaction.create({
          data: {
            companyId: company.id,
            amount: input.initialCredits,
            reason: "initial_grant",
            metadata: {
              performedBy: "admin",
              action: "initial_grant",
            } satisfies Prisma.JsonObject,
          },
        });
      }

      return company;
    }),

  adminGrantCredits: adminProcedure
    .input(
      z.object({
        companyId: z.string().min(1),
        amount: z.coerce.number().int().positive(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const company = await prisma.company.update({
        where: { id: input.companyId },
        data: {
          creditBalance: { increment: input.amount },
          totalCreditsGranted: { increment: input.amount },
        },
      });

      await prisma.creditTransaction.create({
        data: {
          companyId: company.id,
          amount: input.amount,
          reason: input.reason ?? "manual_grant",
          metadata: {
            performedBy: "admin",
            action: "manual_grant",
          } satisfies Prisma.JsonObject,
        },
      });

      return company;
    }),

  adminOverview: adminProcedure
    .input(
      z
        .object({
          rangeInDays: z.coerce.number().int().min(1).max(180).default(30),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const rangeInDays = input?.rangeInDays ?? 30;
      const now = new Date();
      const rangeStart = new Date(now.getTime() - rangeInDays * 24 * 60 * 60 * 1000);

      const [
        totalCompanies,
        newCompanies,
        activeCompanies,
        aggregate,
        projectCount,
        activeSessions,
        topCompanies,
        topCreditReasons,
      ] = await Promise.all([
        prisma.company.count(),
        prisma.company.count({
          where: { createdAt: { gte: rangeStart } },
        }),
        prisma.company.count({
          where: { lastActiveAt: { gte: rangeStart } },
        }),
        prisma.company.aggregate({
          _sum: {
            totalCreditsGranted: true,
            totalCreditsSpent: true,
            projectsCreated: true,
          },
        }),
        prisma.project.count(),
        prisma.companySession.count({
          where: { lastSeenAt: { gte: rangeStart } },
        }),
        prisma.company.findMany({
          orderBy: { totalCreditsSpent: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            creditBalance: true,
            totalCreditsSpent: true,
            totalCreditsGranted: true,
            projectsCreated: true,
            lastActiveAt: true,
          },
        }),
        prisma.creditTransaction.groupBy({
          by: ["reason"],
          where: { createdAt: { gte: rangeStart } },
          _sum: { amount: true },
          _count: { _all: true },
          orderBy: { _sum: { amount: "desc" } },
          take: 5,
        }),
      ]);

      const totalCreditsGranted = aggregate._sum.totalCreditsGranted ?? 0;
      const totalCreditsSpent = aggregate._sum.totalCreditsSpent ?? 0;
      const totalProjectsCreated = aggregate._sum.projectsCreated ?? 0;
      const averageCreditsPerCompany = totalCompanies === 0 ? 0 : Math.round(totalCreditsSpent / totalCompanies);
      const averageProjectsPerCompany = totalCompanies === 0 ? 0 : Number((totalProjectsCreated / totalCompanies).toFixed(1));

      return {
        rangeInDays,
        totals: {
          companies: totalCompanies,
          newCompanies,
          activeCompanies,
          totalProjects: projectCount,
          totalCreditsGranted,
          totalCreditsSpent,
          averageCreditsPerCompany,
          averageProjectsPerCompany,
          activeSessions,
        },
        topCompanies,
        topCreditReasons: topCreditReasons.map((group) => ({
          reason: group.reason,
          totalAmount: group._sum.amount ?? 0,
          count: group._count._all,
        })),
      };
    }),

  adminCreditTransactions: adminProcedure
    .input(
      z
        .object({
          timeframe: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
          companyId: z.string().optional(),
          reason: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(200).default(50),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const filters = input ?? { timeframe: "30d", limit: 50 };
      const { timeframe, companyId, reason, limit } = filters;

      let createdAtFilter: Date | undefined;
      if (timeframe !== "all") {
        const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
        createdAtFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      }

      const where: Prisma.CreditTransactionWhereInput = {
        ...(createdAtFilter ? { createdAt: { gte: createdAtFilter } } : {}),
        ...(companyId ? { companyId } : {}),
        ...(reason ? { reason } : {}),
      };

      const [transactions, reasons] = await Promise.all([
        prisma.creditTransaction.findMany({
          where,
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
        prisma.creditTransaction.findMany({
          select: { reason: true },
          distinct: ["reason"],
          orderBy: { reason: "asc" },
        }),
      ]);

      return {
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          company: transaction.company,
          amount: transaction.amount,
          reason: transaction.reason,
          metadata: transaction.metadata,
          createdAt: transaction.createdAt,
        })),
        availableReasons: reasons.map((entry) => entry.reason),
      };
    }),

  adminActivityLog: adminProcedure
    .input(
      z
        .object({
          limit: z.coerce.number().int().min(1).max(200).default(40),
          rangeInDays: z.coerce.number().int().min(1).max(180).default(30),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 40;
      const rangeInDays = input?.rangeInDays ?? 30;
      const rangeStart = new Date(Date.now() - rangeInDays * 24 * 60 * 60 * 1000);

      const [adminTransactions, createdCompanies, recentProjects] = await Promise.all([
        prisma.creditTransaction.findMany({
          where: {
            createdAt: { gte: rangeStart },
            metadata: {
              path: ["performedBy"],
              equals: "admin",
            },
          },
          include: {
            company: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit * 2,
        }),
        prisma.company.findMany({
          where: { createdAt: { gte: rangeStart } },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        }),
        prisma.project.findMany({
          where: { createdAt: { gte: rangeStart } },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            name: true,
            createdAt: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

      const events = [
        ...adminTransactions.map((transaction) => ({
          id: `transaction-${transaction.id}`,
          type: transaction.reason === "initial_grant" ? "company_initialized" : "credits_granted",
          createdAt: transaction.createdAt,
          company: transaction.company,
          details: {
            amount: transaction.amount,
            reason: transaction.reason,
          },
        })),
        ...createdCompanies.map((company) => ({
          id: `company-${company.id}`,
          type: "company_created" as const,
          createdAt: company.createdAt,
          company: { id: company.id, name: company.name },
          details: {},
        })),
        ...recentProjects.map((project) => ({
          id: `project-${project.id}`,
          type: "project_created" as const,
          createdAt: project.createdAt,
          company: project.company,
          details: {
            projectName: project.name,
          },
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
        rangeInDays,
        events: events.slice(0, limit),
      };
    }),

  updateOnboarding: companyProcedure
    .input(
      z.object({
        buildTourCompleted: z.boolean().optional(),
        projectsTourCompleted: z.boolean().optional(),
        projectViewTourCompleted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Partial<
        Record<"buildTourCompleted" | "projectsTourCompleted" | "projectViewTourCompleted", boolean>
      > = {};

      if (typeof input.buildTourCompleted === "boolean") {
        updates.buildTourCompleted = input.buildTourCompleted;
      }

      if (typeof input.projectsTourCompleted === "boolean") {
        updates.projectsTourCompleted = input.projectsTourCompleted;
      }

      if (typeof input.projectViewTourCompleted === "boolean") {
        updates.projectViewTourCompleted = input.projectViewTourCompleted;
      }

      if (Object.keys(updates).length === 0) {
        const company = await prisma.company.findUnique({
          where: { id: ctx.company.id },
          select: {
            buildTourCompleted: true,
            projectsTourCompleted: true,
            projectViewTourCompleted: true,
          },
        });

        if (!company) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
        }

        return company;
      }

      const company = await prisma.company.update({
        where: { id: ctx.company.id },
        data: updates,
        select: {
          buildTourCompleted: true,
          projectsTourCompleted: true,
          projectViewTourCompleted: true,
        },
      });

      return company;
    }),
});
