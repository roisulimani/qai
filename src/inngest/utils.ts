import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

import { prisma } from "@/lib/db";
import { SandboxLifecycleStatus } from "@/generated/prisma";

const SANDBOX_TEMPLATE_ID = "qai-nextjs-t4";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  await prisma.sandboxEnvironment.updateMany({
    where: { sandboxId },
    data: {
      status: SandboxLifecycleStatus.RUNNING,
      lastActiveAt: new Date(),
    },
  });
  return sandbox;
}

export async function getOrCreateSandbox(projectId: string) {
  const existingSandbox = await prisma.sandboxEnvironment.findFirst({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
  });

  if (existingSandbox) {
    try {
      const sandbox = await Sandbox.connect(existingSandbox.sandboxId);
      await prisma.sandboxEnvironment.update({
        where: { id: existingSandbox.id },
        data: {
          status: SandboxLifecycleStatus.RUNNING,
          lastActiveAt: new Date(),
        },
      });
      return sandbox.sandboxId;
    } catch (error) {
      console.warn(
        `Failed to resume sandbox ${existingSandbox.sandboxId}; creating a new sandbox.`,
        error,
      );
      await prisma.sandboxEnvironment.update({
        where: { id: existingSandbox.id },
        data: {
          status: SandboxLifecycleStatus.HIBERNATED,
          lastActiveAt: new Date(),
        },
      });
    }
  }

  const sandbox = await Sandbox.create(SANDBOX_TEMPLATE_ID);
  const record = await prisma.sandboxEnvironment.create({
    data: {
      sandboxId: sandbox.sandboxId,
      projectId,
      status: SandboxLifecycleStatus.WARMING,
      lastActiveAt: new Date(),
    },
  });

  await prisma.sandboxEnvironment.update({
    where: { id: record.id },
    data: {
      status: SandboxLifecycleStatus.RUNNING,
      lastActiveAt: new Date(),
    },
  });

  return sandbox.sandboxId;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant",
  );
  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;
  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
}