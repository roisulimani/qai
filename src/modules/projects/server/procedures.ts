import { TRPCError } from "@trpc/server";

import { companyProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { inngest } from '@/inngest/client';
import { generateSlug } from "random-word-slugs";
import { recordProjectCreationSpend } from "@/modules/companies/server/credits";

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
            orderBy: {
                createdAt: "desc",
            },
            where: {
                companyId: ctx.company.id,
            },
        });
        return projects;
    }),

    create: companyProcedure
    .input(
        z.object({
            value: z.string()
             .min(1, {message: "Prompt is required"})
             .max(1000, {message: "Prompt must be less than 1000 characters"}),
        })
    )
    .mutation(async ({ input, ctx }) => {
        const createdProject = await prisma.project.create({
            data: {
                name: generateSlug(2, {
                    format: "kebab"
                }),
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
            name: "code-agent/run",
            data: {
              value: input.value,
              projectId: createdProject.id,
              companyId: ctx.company.id,
            },
          });
          return createdProject;
    }),
});