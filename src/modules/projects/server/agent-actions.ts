import { prisma } from "@/lib/db";
import type { Prisma, AgentActionKey } from "@/generated/prisma";
import { AgentActionStatus } from "@/generated/prisma";

type StepLike = {
  run<T>(name: string, handler: () => Promise<T>): Promise<T>;
};

type AgentActionUpdate = {
  detail?: string | null;
  metadata?: Prisma.JsonValue;
};

type UpdateResolver<T> =
  | ((value: T) => AgentActionUpdate | void | Promise<AgentActionUpdate | void>)
  | undefined;

export interface RunTrackedAgentActionOptions<T> {
  step?: StepLike;
  projectId: string;
  key: AgentActionKey;
  detail?: string | null;
  metadata?: Prisma.JsonValue;
  handler: () => Promise<T>;
  onComplete?: UpdateResolver<T>;
  onError?: UpdateResolver<unknown>;
}

const AGENT_ACTION_LABELS: Record<AgentActionKey, string> = {
  INITIALIZE: "Preparing agent run",
  LOAD_CONVERSATION_CONTEXT: "Loading project context",
  GET_SANDBOX_ID: "Starting workspace environment",
  HYDRATE_SANDBOX: "Syncing workspace files",
  NETWORK_RUN: "Generating solution",
  GET_SANDBOX_URL: "Preparing workspace preview",
  SAVE_RESULT: "Saving results",
  TERMINAL: "Running terminal command",
  CREATE_OR_UPDATE_FILES: "Updating files",
  READ_FILES: "Reading files",
};

const STEP_NAMES: Partial<Record<AgentActionKey, string>> = {
  INITIALIZE: "initialize",
  LOAD_CONVERSATION_CONTEXT: "load-conversation-context",
  GET_SANDBOX_ID: "get-sandbox-id",
  HYDRATE_SANDBOX: "hydrate-sandbox",
  NETWORK_RUN: "network-run",
  GET_SANDBOX_URL: "get-sandbox-url",
  SAVE_RESULT: "save-result",
  TERMINAL: "terminal",
  CREATE_OR_UPDATE_FILES: "createOrUpdateFiles",
  READ_FILES: "readFiles",
};

export function getAgentActionLabel(key: AgentActionKey) {
  return AGENT_ACTION_LABELS[key];
}

export async function resetAgentActions(projectId: string) {
  await prisma.agentAction.deleteMany({ where: { projectId } });
}

export async function runTrackedAgentAction<T>({
  step,
  projectId,
  key,
  detail,
  metadata,
  handler,
  onComplete,
  onError,
}: RunTrackedAgentActionOptions<T>): Promise<T> {
  const stepName = STEP_NAMES[key] ?? key.toLowerCase();

  const execute = async () => {
    const action = await prisma.agentAction.create({
      data: {
        projectId,
        key,
        label: getAgentActionLabel(key),
        detail: detail ?? undefined,
        metadata,
      },
    });

    try {
      const result = await handler();
      const completionUpdate = await resolveUpdate(onComplete, result);
      await prisma.agentAction.update({
        where: { id: action.id },
        data: {
          status: AgentActionStatus.COMPLETED,
          completedAt: new Date(),
          ...(completionUpdate?.detail !== undefined
            ? { detail: completionUpdate.detail }
            : {}),
          ...(completionUpdate?.metadata !== undefined
            ? { metadata: completionUpdate.metadata }
            : {}),
        },
      });
      return result;
    } catch (error) {
      const errorUpdate = await resolveUpdate(onError, error);
      await prisma.agentAction.update({
        where: { id: action.id },
        data: {
          status: AgentActionStatus.FAILED,
          completedAt: new Date(),
          detail:
            errorUpdate?.detail !== undefined
              ? errorUpdate.detail
              : getErrorDetail(error),
          ...(errorUpdate?.metadata !== undefined
            ? { metadata: errorUpdate.metadata }
            : {}),
        },
      });
      throw error;
    }
  };

  if (step) {
    return step.run(stepName, execute);
  }

  return execute();
}

async function resolveUpdate<T>(
  resolver: UpdateResolver<T>,
  value: T,
): Promise<AgentActionUpdate | undefined> {
  if (!resolver) {
    return undefined;
  }
  const result = await resolver(value);
  return result === undefined ? undefined : result;
}

function getErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

