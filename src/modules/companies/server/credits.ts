import { TRPCError } from "@trpc/server";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const PROJECT_CREDIT_COST = env.PROJECT_CREDIT_COST;

export const spendCredits = async (
  companyId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, unknown>,
) => {
  if (amount <= 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const company = await tx.company.findUnique({
      where: { id: companyId },
      select: {
        creditBalance: true,
      },
    });

    if (!company) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
    }

    if (company.creditBalance < amount) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not enough credits. Please contact the QAI team for more access.",
      });
    }

    await tx.company.update({
      where: { id: companyId },
      data: {
        creditBalance: { decrement: amount },
        totalCreditsSpent: { increment: amount },
      },
    });

    await tx.creditTransaction.create({
      data: {
        companyId,
        amount: -amount,
        reason,
        metadata,
      },
    });
  });
};

export const recordProjectCreationSpend = async (
  companyId: string,
  projectId: string,
) => {
  await spendCredits(companyId, PROJECT_CREDIT_COST, "project_created", {
    projectId,
  });
};
