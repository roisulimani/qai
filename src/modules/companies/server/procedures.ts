import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
        },
      });

      return company;
    }),

  updateOnboarding: companyProcedure
    .input(
      z.object({
        buildTourCompleted: z.boolean().optional(),
        projectsTourCompleted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Partial<Record<"buildTourCompleted" | "projectsTourCompleted", boolean>> = {};

      if (typeof input.buildTourCompleted === "boolean") {
        updates.buildTourCompleted = input.buildTourCompleted;
      }

      if (typeof input.projectsTourCompleted === "boolean") {
        updates.projectsTourCompleted = input.projectsTourCompleted;
      }

      if (Object.keys(updates).length === 0) {
        const company = await prisma.company.findUnique({
          where: { id: ctx.company.id },
          select: {
            buildTourCompleted: true,
            projectsTourCompleted: true,
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
        },
      });

      return company;
    }),
});
