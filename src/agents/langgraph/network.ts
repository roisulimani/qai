import { z } from "zod";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { StructuredTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";

import type { FileRecord } from "@/lib/files";
import { getSandbox, lastAssistantTextMessageContent } from "@/inngest/utils";
import { PROMPT } from "@/prompt";
import { runTrackedAgentAction } from "@/modules/projects/server/agent-actions";
import { AgentActionKey } from "@/generated/prisma";

export interface LangGraphNetworkInput {
  workflowId: string;
  activityId?: string;
  projectId: string;
  model: string;
  sandboxId: string;
  conversationPayload: string;
  initialSummary: string;
  initialFiles: FileRecord;
}

export interface LangGraphNetworkResult {
  summary: string;
  files: FileRecord;
}

interface GraphState {
  summary: string;
  files: FileRecord;
  conversation: string;
}

const AgentState = Annotation.Root({
  summary: Annotation<string>("summary"),
  files: Annotation<FileRecord>("files"),
  conversation: Annotation<string>("conversation"),
});

class TerminalTool extends StructuredTool {
  name = "terminal";
  description = "Execute a command in the terminal";
  schema = z.object({ command: z.string() });

  constructor(
    private readonly opts: Pick<
      LangGraphNetworkInput,
      "projectId" | "workflowId" | "activityId" | "sandboxId"
    >,
  ) {
    super();
  }

  async _call({ command }: z.infer<typeof this.schema>): Promise<string> {
    const { projectId, workflowId, activityId, sandboxId } = this.opts;
    return runTrackedAgentAction({
      projectId,
      workflowId,
      activityId,
      key: AgentActionKey.TERMINAL,
      detail: command,
      metadata: { command },
      handler: async () => {
        const sandbox = await getSandbox(sandboxId);
        const buffers = { stdout: "", stderr: "" };
        try {
          const result = await sandbox.commands.run(command, {
            onStdout: (data: string) => {
              buffers.stdout += data;
            },
            onStderr: (data: string) => {
              buffers.stderr += data;
            },
          });
          return result.stdout;
        } catch (error) {
          return `Command failed: ${String(error)}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
        }
      },
      onComplete: (output) => {
        if (typeof output === "string" && output.startsWith("Command failed")) {
          return { detail: "Command failed" };
        }
      },
    });
  }
}

class WriteFilesTool extends StructuredTool {
  name = "createOrUpdateFiles";
  description = "Create or update files in the sandbox";
  schema = z.object({
    files: z.array(
      z.object({
        path: z.string(),
        content: z.string(),
      }),
    ),
  });

  constructor(
    private readonly opts: {
      sharedState: GraphState;
    } & Pick<
      LangGraphNetworkInput,
      "projectId" | "workflowId" | "activityId" | "sandboxId"
    >,
  ) {
    super();
  }

  async _call({ files }: z.infer<typeof this.schema>) {
    const { projectId, workflowId, activityId, sandboxId, sharedState } =
      this.opts;
    const filePaths = files.map((file) => file.path);
    await runTrackedAgentAction({
      projectId,
      workflowId,
      activityId,
      key: AgentActionKey.CREATE_OR_UPDATE_FILES,
      detail: filePaths.join(", "),
      metadata: { files: filePaths },
      handler: async () => {
        const sandbox = await getSandbox(sandboxId);
        await Promise.all(
          files.map(async (file) => {
            await sandbox.files.write(file.path, file.content);
            sharedState.files[file.path] = file.content;
          }),
        );
      },
    });

    return "Files updated";
  }
}

class ReadFilesTool extends StructuredTool {
  name = "readFiles";
  description = "Read files from the sandbox";
  schema = z.object({ files: z.array(z.string()) });

  constructor(
    private readonly opts: Pick<
      LangGraphNetworkInput,
      "projectId" | "workflowId" | "activityId" | "sandboxId"
    >,
  ) {
    super();
  }

  async _call({ files }: z.infer<typeof this.schema>) {
    const { projectId, workflowId, activityId, sandboxId } = this.opts;
    return runTrackedAgentAction({
      projectId,
      workflowId,
      activityId,
      key: AgentActionKey.READ_FILES,
      detail: files.join(", "),
      metadata: { files },
      handler: async () => {
        const sandbox = await getSandbox(sandboxId);
        const contents = await Promise.all(
          files.map(async (file) => ({
            path: file,
            content: await sandbox.files.read(file),
          })),
        );
        return JSON.stringify(contents);
      },
    });
  }
}

export async function runLangGraphNetwork({
  workflowId,
  activityId,
  projectId,
  sandboxId,
  conversationPayload,
  initialSummary,
  initialFiles,
  model,
}: LangGraphNetworkInput): Promise<LangGraphNetworkResult> {
  const sharedState: GraphState = {
    summary: initialSummary,
    files: { ...initialFiles },
    conversation: conversationPayload,
  };

  const llm = new ChatOpenAI({
    model,
    temperature: 0.1,
  });

  const tools = [
    new TerminalTool({ projectId, workflowId, activityId, sandboxId }),
    new WriteFilesTool({
      projectId,
      workflowId,
      activityId,
      sandboxId,
      sharedState,
    }),
    new ReadFilesTool({ projectId, workflowId, activityId, sandboxId }),
  ];

  const agent = createReactAgent({
    llm,
    tools,
    stateModifier: ({ messages }) => [
      { role: "system", content: PROMPT },
      ...(messages ?? []),
    ],
  });

  const graph = new StateGraph(AgentState)
    .addNode(AgentActionKey.INITIALIZE, async (state: GraphState) => {
      await runTrackedAgentAction({
        projectId,
        workflowId,
        activityId,
        key: AgentActionKey.INITIALIZE,
        detail: `Using ${model}`,
        metadata: { model },
        handler: async () => state,
      });
      return state;
    })
    .addNode(AgentActionKey.NETWORK_RUN, async (state: GraphState) => {
      const result = await runTrackedAgentAction({
        projectId,
        workflowId,
        activityId,
        key: AgentActionKey.NETWORK_RUN,
        detail: `Model: ${model}`,
        metadata: { model },
        handler: async () =>
          agent.invoke({
            messages: [
              { role: "user", content: state.conversation },
              { role: "assistant", content: state.summary },
            ],
          }),
      });

      const summary =
        lastAssistantTextMessageContent(result) ?? state.summary ?? "";
      return {
        ...state,
        summary,
        files: { ...sharedState.files },
      } satisfies GraphState;
    })
    .addEdge(START, AgentActionKey.INITIALIZE)
    .addEdge(AgentActionKey.INITIALIZE, AgentActionKey.NETWORK_RUN)
    .addEdge(AgentActionKey.NETWORK_RUN, END);

  const compiled = graph.compile();

  const finalState = await compiled.invoke({
    summary: sharedState.summary,
    files: sharedState.files,
    conversation: sharedState.conversation,
  });

  return {
    summary: finalState.summary,
    files: finalState.files,
  } satisfies LangGraphNetworkResult;
}
