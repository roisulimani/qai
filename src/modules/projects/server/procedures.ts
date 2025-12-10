import { TRPCError } from "@trpc/server";
import { startOfMonth } from "date-fns";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { AgentActionStatus } from "@/generated/prisma";
import { recordProjectCreationSpend } from "@/modules/companies/server/credits";
import { companyProcedure, createTRPCRouter } from "@/trpc/init";
import { inngest } from '@/inngest/client';
import { MODEL_IDS } from "@/modules/models/constants";
import { PROJECT_NAME_PLACEHOLDER } from "@/modules/projects/constants";

export const projectsRouter = createTRPCRouter({

    getOne: companyProcedure
    .input(z.object({
        id: z.string().min(1, {message: "Project ID is required"})
    }))
    .query(async ({ input, ctx }) => {
        const existingProject = await prisma.project.findUnique({
            where: {
                id: input.id,
            },
        });
        if (!existingProject) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Project not found",
            });
        }
        if (existingProject.companyId !== ctx.company.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
        }
        return existingProject;
    }),

    getMany: companyProcedure
    .query(async ({ ctx }) => {
        const projects = await prisma.project.findMany({
            orderBy: [
                { isFavorite: "desc" },
                { createdAt: "desc" },
            ],
            where: {
                companyId: ctx.company.id,
            },
        });
        return projects;
    }),

    getOverview: companyProcedure.query(async ({ ctx }) => {
        const monthStart = startOfMonth(new Date());

        const [
            totalProjects,
            projectsThisMonth,
            totalMessages,
            totalFragments,
            latestProject,
        ] = await prisma.$transaction([
            prisma.project.count({
                where: { companyId: ctx.company.id },
            }),
            prisma.project.count({
                where: {
                    companyId: ctx.company.id,
                    createdAt: { gte: monthStart },
                },
            }),
            prisma.message.count({
                where: {
                    project: {
                        companyId: ctx.company.id,
                    },
                },
            }),
            prisma.fragment.count({
                where: {
                    message: {
                        project: {
                            companyId: ctx.company.id,
                        },
                    },
                },
            }),
            prisma.project.findFirst({
                where: { companyId: ctx.company.id },
                orderBy: { createdAt: "desc" },
                select: {
                    name: true,
                    createdAt: true,
                },
            }),
        ]);

        return {
            totalProjects,
            projectsThisMonth,
            totalMessages,
            totalFragments,
            latestProject,
        };
    }),

    getAgentActions: companyProcedure
    .input(
        z.object({
            projectId: z.string().min(1, {message: "Project ID is required"}),
        }),
    )
    .query(async ({ input, ctx }) => {
        const project = await prisma.project.findUnique({
            where: { id: input.projectId },
            select: { companyId: true },
        });

        if (!project || project.companyId !== ctx.company.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
        }

        const actions = await prisma.agentAction.findMany({
            where: { projectId: input.projectId },
            orderBy: [
                { startedAt: "asc" },
                { createdAt: "asc" },
            ],
        });

        return { actions };
    }),

    cancelAgentRun: companyProcedure
    .input(
        z.object({
            projectId: z.string().min(1, { message: "Project ID is required" }),
        }),
    )
    .mutation(async ({ input, ctx }) => {
        const project = await prisma.project.findUnique({
            where: { id: input.projectId },
            select: { companyId: true },
        });

        if (!project || project.companyId !== ctx.company.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
        }

        const cancelledAt = new Date();

        await prisma.$transaction([
            prisma.project.update({
                where: { id: input.projectId },
                data: { agentRunCancelledAt: cancelledAt },
            }),
            prisma.agentAction.updateMany({
                where: {
                    projectId: input.projectId,
                    status: AgentActionStatus.IN_PROGRESS,
                },
                data: {
                    status: AgentActionStatus.FAILED,
                    detail: "Cancelled by user",
                    completedAt: cancelledAt,
                },
            }),
        ]);

        return { cancelledAt };
    }),

    create: companyProcedure
    .input(
        z.object({
            value: z.string()
             .min(1, {message: "Prompt is required"})
             .max(1000, {message: "Prompt must be less than 1000 characters"}),
            model: z.enum(MODEL_IDS),
        })
    )
    .mutation(async ({ input, ctx }) => {
        const createdProject = await prisma.project.create({
            data: {
                name: PROJECT_NAME_PLACEHOLDER,
                companyId: ctx.company.id,
                messages: {
                    create: {
                        content: input.value,
                        role: "USER",
                        type: "RESULT",
                    }
                }
            }
        });

        await prisma.company.update({
            where: { id: ctx.company.id },
            data: {
                projectsCreated: { increment: 1 },
            }
        });

        await recordProjectCreationSpend(ctx.company.id, createdProject.id);

        await inngest.send({
            name: "project/generate-name",
            data: {
                projectId: createdProject.id,
                companyId: ctx.company.id,
                initialMessage: input.value,
            },
        });

        await inngest.send({
            name: "code-agent/run",
            data: {
              value: input.value,
              projectId: createdProject.id,
              companyId: ctx.company.id,
              model: input.model,
            },
          });
          return createdProject;
    }),

    delete: companyProcedure
    .input(
        z.object({
            id: z.string().min(1, {message: "Project ID is required"}),
        }),
    )
    .mutation(async ({ input, ctx }) => {
        const project = await prisma.project.findUnique({
            where: { id: input.id },
            select: { companyId: true },
        });

        if (!project || project.companyId !== ctx.company.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
        }

        await prisma.project.delete({
            where: { id: input.id },
        });

        return { id: input.id };
    }),

    setFavorite: companyProcedure
    .input(
        z.object({
            id: z.string().min(1, {message: "Project ID is required"}),
            isFavorite: z.boolean(),
        }),
    )
    .mutation(async ({ input, ctx }) => {
        const project = await prisma.project.findUnique({
            where: { id: input.id },
            select: { companyId: true },
        });

        if (!project || project.companyId !== ctx.company.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
        }

        const updatedProject = await prisma.project.update({
            where: { id: input.id },
            data: { isFavorite: input.isFavorite },
            select: { id: true, isFavorite: true },
        });

        return updatedProject;
    }),
});
