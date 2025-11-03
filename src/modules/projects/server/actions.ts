import type { Prisma } from "@/generated/prisma";
import { ProjectActionStatus } from "@/generated/prisma";
import { prisma } from "@/lib/db";

interface CreateProjectActionOptions {
  projectId: string;
  actionKey: string;
  label: string;
  metadata?: Prisma.JsonValue;
}

const ACTION_TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ACTION_TIMEOUT_MS}ms`));
    }, ACTION_TIMEOUT_MS);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

async function tryCreateProjectAction(options: CreateProjectActionOptions) {
  try {
    return await withTimeout(
      prisma.projectAction.create({
        data: {
          projectId: options.projectId,
          actionKey: options.actionKey,
          label: options.label,
          metadata: options.metadata,
          status: ProjectActionStatus.RUNNING,
        },
      }),
      `Creating project action ${options.actionKey}`,
    );
  } catch (error) {
    console.warn(
      `Project action tracking unavailable for ${options.actionKey}:`,
      error,
    );
    return null;
  }
}

async function tryCompleteProjectAction(actionId: string) {
  try {
    await withTimeout(
      prisma.projectAction.update({
        where: { id: actionId },
        data: {
          status: ProjectActionStatus.COMPLETED,
          completedAt: new Date(),
        },
      }),
      "Completing project action",
    );
  } catch (error) {
    console.warn("Failed to mark project action as completed:", error);
  }
}

async function tryFailProjectAction(actionId: string, error: unknown) {
  try {
    await withTimeout(
      prisma.projectAction.update({
        where: { id: actionId },
        data: {
          status: ProjectActionStatus.FAILED,
          completedAt: new Date(),
          error: error instanceof Error ? error.message : String(error),
        },
      }),
      "Failing project action",
    );
  } catch (updateError) {
    console.warn("Failed to mark project action as failed:", updateError);
  }
}

export async function withProjectAction<T>(
  options: CreateProjectActionOptions & {
    run: () => Promise<T>;
  },
): Promise<T> {
  const action = await tryCreateProjectAction(options);

  try {
    const result = await options.run();

    if (action) {
      await tryCompleteProjectAction(action.id);
    }

    return result;
  } catch (error) {
    if (action) {
      await tryFailProjectAction(action.id, error);
    }

    throw error;
  }
}
