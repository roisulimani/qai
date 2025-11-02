import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { ProjectActionStatus } from "@/generated/prisma";

interface CreateProjectActionOptions {
  projectId: string;
  actionKey: string;
  label: string;
  metadata?: Prisma.JsonValue;
}

export async function createProjectAction({
  projectId,
  actionKey,
  label,
  metadata,
}: CreateProjectActionOptions) {
  return prisma.projectAction.create({
    data: {
      projectId,
      actionKey,
      label,
      metadata,
      status: ProjectActionStatus.RUNNING,
    },
  });
}

export async function completeProjectAction(actionId: string) {
  await prisma.projectAction.update({
    where: { id: actionId },
    data: {
      status: ProjectActionStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
}

export async function failProjectAction(actionId: string, error: unknown) {
  await prisma.projectAction.update({
    where: { id: actionId },
    data: {
      status: ProjectActionStatus.FAILED,
      completedAt: new Date(),
      error: error instanceof Error ? error.message : String(error),
    },
  });
}

export async function withProjectAction<T>(
  options: CreateProjectActionOptions & {
    run: () => Promise<T>;
  },
): Promise<T> {
  const action = await createProjectAction(options);

  try {
    const result = await options.run();
    await completeProjectAction(action.id);
    return result;
  } catch (error) {
    await failProjectAction(action.id, error);
    throw error;
  }
}
