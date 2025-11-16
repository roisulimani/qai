import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";

import { codeAgentWorkflow } from "../workflows";
import type { AgentWorkflowActivities } from "../activities/types";
import {
  CODE_AGENT_TASK_QUEUE,
  CODE_AGENT_WORKFLOW_NAME,
  type CodeAgentWorkflowInput,
} from "@/temporal/workflows";

const mockActivities: AgentWorkflowActivities = {
  async resetAgentActions() {},
  async loadConversationContext() {
    return {
      conversationPayload: "<user_request>Build a button</user_request>",
      initialSummary: "",
      latestFiles: {},
    };
  },
  async provisionSandbox() {
    return { sandboxId: "sandbox-test" };
  },
  async runCodeAgentNetwork() {
    return {
      summary: "<task_summary>Done</task_summary>",
      files: { "src/app/page.tsx": "export const Component = () => null;" },
    };
  },
  async resolveSandboxUrl() {
    return { sandboxUrl: "https://sandbox.local" };
  },
  async saveAgentResult() {
    return { fragmentId: "fragment-test" };
  },
};

async function main() {
  const env = await TestWorkflowEnvironment.createTimeSkipping();
  const worker = await Worker.create({
    connection: env.nativeConnection,
    taskQueue: CODE_AGENT_TASK_QUEUE,
    workflowsPath: new URL("../workflows", import.meta.url).pathname,
    activities: mockActivities,
  });

  const workerRun = worker.run();

  const input: CodeAgentWorkflowInput = {
    projectId: "project-test",
    companyId: "company-test",
    model: "gpt-4o-mini",
    value: "Create a component",
    messageId: "message-test",
  };

  const result = await env.workflowClient.execute(codeAgentWorkflow, {
    taskQueue: CODE_AGENT_TASK_QUEUE,
    workflowId: `${CODE_AGENT_WORKFLOW_NAME}-health-check`,
    args: [input],
  });

  console.log("Workflow health check result", result);

  await worker.shutdown();
  await workerRun;
  await env.teardown();
}

main().catch((error) => {
  console.error("Temporal workflow health check failed", error);
  process.exit(1);
});
