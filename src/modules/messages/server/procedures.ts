import { TRPCError } from "@trpc/server";

import { companyProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { inngest } from '@/inngest/client';
import { recordMessageSendSpend } from '@/modules/companies/server/credits';
import { MODEL_IDS } from "@/modules/models/constants";

export const messagesRouter = createTRPCRouter({

    getMany: companyProcedure
    .input(
        z.object({
            projectId: z.string().min(1, {message: "Project ID is required"}),
        }),
    )
    .query(async ({ input, ctx }) => {
        const project = await prisma.project.findUnique({
            where: { id: input.projectId },
            select: { id: true, companyId: true, conversationSummary: true },
        });
        if (!project || project.companyId !== ctx.company.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
        }
        const messages = await prisma.message.findMany({
            where: {
                projectId: input.projectId,
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                fragment: true,
            },
        });
        return {
            messages,
            conversationSummary: project.conversationSummary,
        };
    }),

    create: companyProcedure
    .input(
        z.object({
            value: z.string()
             .min(1, {message: "Prompt is required"})
             .max(1000, {message: "Prompt must be less than 1000 characters"}),
            projectId: z.string().min(1, {message: "Project ID is required"}),
            model: z.enum(MODEL_IDS),
        }),
    )
    .mutation(async ({ input, ctx }) => {
        const project = await prisma.project.findUnique({
            where: { id: input.projectId },
            select: { id: true, companyId: true },
        });
        if (!project || project.companyId !== ctx.company.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
        }
        const newMessage = await prisma.message.create({
            data: {
                projectId: input.projectId,
                content: input.value,
                role: "USER",
                type: "RESULT",
            },
        });
        await recordMessageSendSpend(ctx.company.id, input.projectId, newMessage.id);
        await inngest.send({
            name: "code-agent/run",
            data: {
              value: input.value,
              projectId: input.projectId,
              companyId: ctx.company.id,
              model: input.model,
            },
          });
          return newMessage;
    }),
});