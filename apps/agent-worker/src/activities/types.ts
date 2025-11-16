import type { FileRecord } from "@/lib/files";
import type {
  LangGraphNetworkInput,
  LangGraphNetworkResult,
} from "@/agents/langgraph/network";

export interface ConversationContextResult {
  conversationPayload: string;
  initialSummary: string;
  latestFiles: FileRecord;
}

export interface ProvisionSandboxResult {
  sandboxId: string;
}

export interface SaveAgentResultInput {
  projectId: string;
  workflowId: string;
  sandboxUrl: string;
  summary: string;
  files: FileRecord;
  userInput: string;
}

export interface SaveAgentResultOutput {
  fragmentId: string | null;
}

export interface AgentWorkflowActivities {
  resetAgentActions(input: { projectId: string }): Promise<void>;
  loadConversationContext(input: {
    projectId: string;
    userInput: string;
    workflowId: string;
  }): Promise<ConversationContextResult>;
  provisionSandbox(input: {
    projectId: string;
    workflowId: string;
    files: FileRecord;
  }): Promise<ProvisionSandboxResult>;
  runCodeAgentNetwork(
    input: LangGraphNetworkInput,
  ): Promise<LangGraphNetworkResult>;
  resolveSandboxUrl(input: {
    projectId: string;
    workflowId: string;
    sandboxId: string;
  }): Promise<{ sandboxUrl: string }>;
  saveAgentResult(input: SaveAgentResultInput): Promise<SaveAgentResultOutput>;
}
