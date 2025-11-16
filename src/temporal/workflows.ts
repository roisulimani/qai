export const CODE_AGENT_TASK_QUEUE = "code-agent-tasks";
export const CODE_AGENT_WORKFLOW_NAME = "code-agent.workflow";

export interface CodeAgentWorkflowInput {
  projectId: string;
  companyId: string;
  model: string;
  value: string;
  messageId: string;
}

export interface CodeAgentWorkflowResult {
  summary: string;
  sandboxUrl: string;
  fragmentId: string | null;
}
