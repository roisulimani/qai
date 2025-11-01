import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  createState,
  type Tool,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  buildConversationPayload,
  computeRollingConversationSummary,
  loadProjectConversationContext,
} from "./conversation";
import type { Fragment } from "@/generated/prisma";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
  hasFreshSummary: boolean;
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const {
      projectSummary,
      messages,
      latestFragment,
      latestUserMessage,
    } = await step.run("load-conversation-context", async () => {
      return await loadProjectConversationContext(event.data.projectId);
    });

    const latestFragmentFiles = toFileRecord(latestFragment?.files);

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("qai-nextjs-t4");
      return sandbox.sandboxId;
    });

    if (latestFragmentFiles) {
      await step.run("hydrate-sandbox", async () => {
        const sandbox = await getSandbox(sandboxId);
        for (const [path, content] of Object.entries(latestFragmentFiles)) {
          await sandbox.files.write(path, content);
        }
      });
    }
    // Create a new agent with a system prompt
    const codeAgent = createAgent<AgentState>({
      name: "codeAgent",
      system: PROMPT,
      model: openai({ 
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Execute a command in the terminal",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = {
                stdout: "",
                stderr: "",
              };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`,
                );
                return `Command failed: ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update a file in the file system in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files }, 
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }

                return updatedFiles;

              } catch (e) {
                console.error(
                  `Failed to create or update files: ${e}`,
                );
                return `Failed to create or update files: ${e}`;
              }
            });

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read a file from the file system in the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({
                    path: file,
                    content,
                  });
                }
                return JSON.stringify(contents);
              } catch (e) {
                console.error(
                  `Failed to read files: ${e}`,
                );
                return `Failed to read files: ${e}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = 
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText;
              network.state.data.hasFreshSummary = true;
            }
          }
          
          return result;
        },
      },
    });

    const defaultState = createState<AgentState>({
      summary: latestFragment?.summary ?? "",
      files: latestFragmentFiles ?? {},
      hasFreshSummary: false,
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState,
      router: async ({ network }) => {
        if (network.state.data.hasFreshSummary) {
          return;
        }
        return codeAgent;
      },
    });

    const conversationPayload = buildConversationPayload({
      projectSummary,
      messages,
      latestUserMessage,
      userInput: event.data.value,
    });

    const result = await network.run(conversationPayload);

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      const assistantMessage = await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: "Fragmented UI Coding Agent",
              files: result.state.data.files,
              summary: result.state.data.summary,
            },
          },
        },
      });

      const updatedSummary = computeRollingConversationSummary({
        previousSummary: projectSummary,
        userMessage: event.data.value,
        assistantMessage: result.state.data.summary ?? "",
      });

      await prisma.project.update({
        where: { id: event.data.projectId },
        data: { conversationSummary: updatedSummary },
      });

      return assistantMessage;
    });

    return {
      url: sandboxUrl,
      title: "Fragmented UI Coding Agent",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);

function toFileRecord(
  value: Fragment["files"] | undefined | null,
): Record<string, string> | null {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (accumulator, [path, content]) => {
      if (typeof content === "string") {
        accumulator[path] = content;
      }
      return accumulator;
    },
    {},
  );
}