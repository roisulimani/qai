import { proxyActivities, workflowInfo } from "@temporalio/workflow";

import type { AgentWorkflowActivities } from "../activities/types";
import type {
  CodeAgentWorkflowInput,
  CodeAgentWorkflowResult,
} from "@/temporal/workflows";
import { CODE_AGENT_TASK_QUEUE } from "@/temporal/workflows";

const {
  resetAgentActions,
  loadConversationContext,
  provisionSandbox,
  runCodeAgentNetwork,
  resolveSandboxUrl,
  saveAgentResult,
} = proxyActivities<AgentWorkflowActivities>({
  startToCloseTimeout: "10 minutes",
  taskQueue: CODE_AGENT_TASK_QUEUE,
});

export async function codeAgentWorkflow(
  input: CodeAgentWorkflowInput,
): Promise<CodeAgentWorkflowResult> {
  const workflowId = workflowInfo().workflowId;

  await resetAgentActions({ projectId: input.projectId });

  const context = await loadConversationContext({
    projectId: input.projectId,
    userInput: input.value,
    workflowId,
  });

  const sandbox = await provisionSandbox({
    projectId: input.projectId,
    workflowId,
    files: context.latestFiles,
  });

  const runResult = await runCodeAgentNetwork({
    workflowId,
    projectId: input.projectId,
    model: input.model,
    sandboxId: sandbox.sandboxId,
    conversationPayload: context.conversationPayload,
    initialSummary: context.initialSummary,
    initialFiles: context.latestFiles,
  });

  const { sandboxUrl } = await resolveSandboxUrl({
    projectId: input.projectId,
    workflowId,
    sandboxId: sandbox.sandboxId,
  });

  const persisted = await saveAgentResult({
    projectId: input.projectId,
    workflowId,
    sandboxUrl,
    summary: runResult.summary,
    files: runResult.files,
    userInput: input.value,
  });

  return {
    summary: runResult.summary,
    sandboxUrl,
    fragmentId: persisted.fragmentId,
  } satisfies CodeAgentWorkflowResult;
}
