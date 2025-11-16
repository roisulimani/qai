import { Context } from "@temporalio/activity";
import { Sandbox } from "@e2b/code-interpreter";

import { loadProjectConversationContext, buildConversationPayload, computeRollingConversationSummary } from "@/inngest/conversation";
import { runTrackedAgentAction, resetAgentActions as resetActions } from "@/modules/projects/server/agent-actions";
import { AgentActionKey } from "@/generated/prisma";
import { getSandbox } from "@/inngest/utils";
import { prisma } from "@/lib/db";
import { toFileRecord } from "@/lib/files";
import type {
  AgentWorkflowActivities,
  ConversationContextResult,
  ProvisionSandboxResult,
  SaveAgentResultInput,
  SaveAgentResultOutput,
} from "./types";
import { runLangGraphNetwork } from "@/agents/langgraph/network";

export const activities: AgentWorkflowActivities = {
  async resetAgentActions({ projectId }) {
    await resetActions(projectId);
  },
  async loadConversationContext({ projectId, userInput, workflowId }): Promise<ConversationContextResult> {
    const activityId = Context.current().info.activityId;
    return runTrackedAgentAction({
      projectId,
      workflowId,
      activityId,
      key: AgentActionKey.LOAD_CONVERSATION_CONTEXT,
      handler: async () => {
        const context = await loadProjectConversationContext(projectId);
        const conversationPayload = buildConversationPayload({
          projectSummary: context.projectSummary,
          messages: context.messages,
          latestUserMessage: context.latestUserMessage,
          userInput,
        });

        const latestFiles = toFileRecord(context.latestFragment?.files ?? null);
        const initialSummary =
          context.latestFragment?.summary || context.projectSummary || "";

        return {
          conversationPayload,
          initialSummary,
          latestFiles,
        } satisfies ConversationContextResult;
      },
    });
  },
  async provisionSandbox({ projectId, workflowId, files }): Promise<ProvisionSandboxResult> {
    const activityId = Context.current().info.activityId;
    const sandboxId = await runTrackedAgentAction({
      projectId,
      workflowId,
      activityId,
      key: AgentActionKey.GET_SANDBOX_ID,
      handler: async () => {
        const sandbox = await Sandbox.create("qai-nextjs-t4");
        return sandbox.sandboxId;
      },
    });

    if (Object.keys(files).length > 0) {
      await runTrackedAgentAction({
        projectId,
        workflowId,
        activityId,
        key: AgentActionKey.HYDRATE_SANDBOX,
        detail: Object.keys(files).join(", "),
        metadata: { files: Object.keys(files) },
        handler: async () => {
          const sandbox = await getSandbox(sandboxId);
          await Promise.all(
            Object.entries(files).map(([path, content]) =>
              sandbox.files.write(path, content),
            ),
          );
        },
      });
    }

    return { sandboxId } satisfies ProvisionSandboxResult;
  },
  async runCodeAgentNetwork(input) {
    const activityId = Context.current().info.activityId;
    return runLangGraphNetwork({ ...input, activityId });
  },
  async resolveSandboxUrl({ projectId, workflowId, sandboxId }) {
    const activityId = Context.current().info.activityId;
    const sandboxUrl = await runTrackedAgentAction({
      projectId,
      workflowId,
      activityId,
      key: AgentActionKey.GET_SANDBOX_URL,
      handler: async () => {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      },
    });

    return { sandboxUrl };
  },
  async saveAgentResult({
    projectId,
    workflowId,
    sandboxUrl,
    summary,
    files,
    userInput,
  }: SaveAgentResultInput): Promise<SaveAgentResultOutput> {
    const activityId = Context.current().info.activityId;
    return runTrackedAgentAction({
      projectId,
      workflowId,
      activityId,
      key: AgentActionKey.SAVE_RESULT,
      handler: async () => {
        if (!summary || Object.keys(files).length === 0) {
          await prisma.message.create({
            data: {
              projectId,
              content: "Something went wrong. Please try again.",
              role: "ASSISTANT",
              type: "ERROR",
            },
          });
          return { fragmentId: null } satisfies SaveAgentResultOutput;
        }

        const assistantMessage = await prisma.message.create({
          data: {
            projectId,
            content: summary,
            role: "ASSISTANT",
            type: "RESULT",
            fragment: {
              create: {
                sandboxUrl,
                title: "Fragmented UI Coding Agent",
                files,
                summary,
              },
            },
          },
          include: { fragment: true },
        });

        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { conversationSummary: true },
        });

        const updatedSummary = computeRollingConversationSummary({
          previousSummary: project?.conversationSummary ?? null,
          userMessage: userInput,
          assistantMessage: summary,
        });

        await prisma.project.update({
          where: { id: projectId },
          data: { conversationSummary: updatedSummary },
        });

        return {
          fragmentId: assistantMessage.fragment?.id ?? null,
        } satisfies SaveAgentResultOutput;
      },
    });
  },
};
