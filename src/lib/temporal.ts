import { Client, Connection } from "@temporalio/client";
import {
  CODE_AGENT_TASK_QUEUE,
  CODE_AGENT_WORKFLOW_NAME,
  type CodeAgentWorkflowInput,
  type CodeAgentWorkflowResult,
} from "@/temporal/workflows";

let clientPromise: Promise<Client> | null = null;

async function getTemporalClient() {
  if (!clientPromise) {
    const address = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
    clientPromise = Connection.connect({ address }).then(
      (connection) => new Client({ connection }),
    );
  }

  return clientPromise;
}

export async function startCodeAgentWorkflow({
  workflowId,
  input,
}: {
  workflowId: string;
  input: CodeAgentWorkflowInput;
}) {
  const client = await getTemporalClient();

  return client.workflow.start<CodeAgentWorkflowResult>(
    CODE_AGENT_WORKFLOW_NAME,
    {
      args: [input],
      taskQueue: CODE_AGENT_TASK_QUEUE,
      workflowId,
      searchAttributes: {
        ProjectId: [input.projectId],
        MessageId: [input.messageId],
      },
    },
  );
}
