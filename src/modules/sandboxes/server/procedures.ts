import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { companyProcedure, createTRPCRouter } from "@/trpc/init";
import {
    getProjectSandboxStatus,
    recordProjectSandboxActivity,
    wakeProjectSandbox,
} from "./service";

export const sandboxesRouter = createTRPCRouter({
    status: companyProcedure
        .input(z.object({ projectId: z.string().min(1, { message: "Project ID is required" }) }))
        .query(async ({ input, ctx }) => {
            const project = await prisma.project.findUnique({
                where: { id: input.projectId },
                select: { companyId: true },
            });

            if (!project || project.companyId !== ctx.company.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
            }

            return getProjectSandboxStatus(input.projectId);
        }),
    wake: companyProcedure
        .input(z.object({ projectId: z.string().min(1, { message: "Project ID is required" }) }))
        .mutation(async ({ input, ctx }) => {
            const project = await prisma.project.findUnique({
                where: { id: input.projectId },
                select: { companyId: true },
            });

            if (!project || project.companyId !== ctx.company.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
            }

            return wakeProjectSandbox(input.projectId);
        }),
    activity: companyProcedure
        .input(z.object({ projectId: z.string().min(1, { message: "Project ID is required" }) }))
        .mutation(async ({ input, ctx }) => {
            const project = await prisma.project.findUnique({
                where: { id: input.projectId },
                select: { companyId: true },
            });

            if (!project || project.companyId !== ctx.company.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Project not found" });
            }

            await recordProjectSandboxActivity(input.projectId);
            return { ok: true } as const;
        }),
});
