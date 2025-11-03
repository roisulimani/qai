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
import { AgentActionKey, type Fragment } from "@/generated/prisma";
import {
  resetAgentActions,
  runTrackedAgentAction,
} from "@/modules/projects/server/agent-actions";
import { DEFAULT_MODEL, MODEL_IDS } from "@/modules/models/constants";
import {
  PROJECT_NAME_MODEL,
  PROJECT_NAME_PLACEHOLDER,
  PROJECT_NAME_PROMPT,
} from "@/modules/projects/constants";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
  hasFreshSummary: boolean;
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const projectId = event.data.projectId;

    await resetAgentActions(projectId);

    const {
      projectSummary,
      messages,
      latestFragment,
      latestUserMessage,
    } = await runTrackedAgentAction({
      step,
      projectId,
      key: AgentActionKey.LOAD_CONVERSATION_CONTEXT,
      handler: () => loadProjectConversationContext(projectId),
    });

    const latestFragmentFiles = toFileRecord(latestFragment?.files);
    const requestedModel =
      typeof event.data.model === "string" &&
      (MODEL_IDS as readonly string[]).includes(event.data.model)
        ? (event.data.model as (typeof MODEL_IDS)[number])
        : DEFAULT_MODEL;

    await runTrackedAgentAction({
      step,
      projectId,
      key: AgentActionKey.INITIALIZE,
      detail: `Using ${requestedModel}`,
      metadata: { model: requestedModel },
      handler: async () => {},
    });

    const sandboxId = await runTrackedAgentAction({
      step,
      projectId,
      key: AgentActionKey.GET_SANDBOX_ID,
      handler: async () => {
        const sandbox = await Sandbox.create("qai-nextjs-t4");
        return sandbox.sandboxId;
      },
    });

    if (latestFragmentFiles) {
      const filePaths = Object.keys(latestFragmentFiles);
      await runTrackedAgentAction({
        step,
        projectId,
        key: AgentActionKey.HYDRATE_SANDBOX,
        detail: summarizeFileList(filePaths),
        metadata: { fileCount: filePaths.length, files: filePaths },
        handler: async () => {
          const sandbox = await getSandbox(sandboxId);
          for (const [path, content] of Object.entries(latestFragmentFiles)) {
            await sandbox.files.write(path, content);
          }
        },
      });
    }
    // Create a new agent with a system prompt
    const codeAgent = createAgent<AgentState>({
      name: "codeAgent",
      system: PROMPT,
      model: openai({
        model: requestedModel,
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
            return await runTrackedAgentAction({
              step,
              projectId,
              key: AgentActionKey.TERMINAL,
              detail: command,
              metadata: { command },
              handler: async () => {
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
              },
              onComplete: (result) => {
                if (
                  typeof result === "string" &&
                  result.startsWith("Command failed")
                ) {
                  return { detail: "Command failed" };
                }
              },
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
            const filePaths = files.map((file) => file.path);
            const newFiles = await runTrackedAgentAction({
              step,
              projectId,
              key: AgentActionKey.CREATE_OR_UPDATE_FILES,
              detail: summarizeFileList(filePaths),
              metadata: { files: filePaths },
              handler: async () => {
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
              },
              onComplete: (result) => {
                if (typeof result === "string") {
                  return { detail: result };
                }
              },
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
            return await runTrackedAgentAction({
              step,
              projectId,
              key: AgentActionKey.READ_FILES,
              detail: summarizeFileList(files),
              metadata: { files },
              handler: async () => {
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
              },
              onComplete: (result) => {
                if (typeof result === "string" && result.startsWith("Failed")) {
                  return { detail: result };
                }
              },
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

    const result = await runTrackedAgentAction({
      projectId,
      key: AgentActionKey.NETWORK_RUN,
      detail: `Model: ${requestedModel}`,
      metadata: { model: requestedModel },
      handler: () => network.run(conversationPayload),
    });

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await runTrackedAgentAction({
      step,
      projectId,
      key: AgentActionKey.GET_SANDBOX_URL,
      handler: async () => {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      },
    });

    await runTrackedAgentAction({
      step,
      projectId,
      key: AgentActionKey.SAVE_RESULT,
      handler: async () => {
        if (isError) {
          return await prisma.message.create({
            data: {
              projectId,
              content: "Something went wrong. Please try again.",
              role: "ASSISTANT",
              type: "ERROR",
            },
          });
        }

        const assistantMessage = await prisma.message.create({
          data: {
            projectId,
            content: result.state.data.summary,
            role: "ASSISTANT",
            type: "RESULT",
            fragment: {
              create: {
                sandboxUrl,
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
          where: { id: projectId },
          data: { conversationSummary: updatedSummary },
        });

        return assistantMessage;
      },
    });

    return {
      url: sandboxUrl,
      title: "Fragmented UI Coding Agent",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);

export const generateProjectNameFunction = inngest.createFunction(
  { id: "generate-project-name" },
  { event: "project/generate-name" },
  async ({ event, step }) => {
    const project = await step.run("load-project", async () => {
      return prisma.project.findUnique({
        where: { id: event.data.projectId },
        select: {
          id: true,
          name: true,
          companyId: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { content: true },
          },
        },
      });
    });

    if (!project || project.companyId !== event.data.companyId) {
      return;
    }

    if (project.name && project.name !== PROJECT_NAME_PLACEHOLDER) {
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OPENAI_API_KEY is not configured; skipping project name generation");
      return;
    }

    const initialMessage =
      typeof event.data.initialMessage === "string" && event.data.initialMessage.trim().length > 0
        ? event.data.initialMessage.trim()
        : project.messages[0]?.content ?? "";

    if (!initialMessage) {
      return;
    }

    const projectName = await step.run("generate-project-name", async () => {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: PROJECT_NAME_MODEL,
          input: [
            {
              role: "system",
              content: PROJECT_NAME_PROMPT,
            },
            {
              role: "user",
              content: `Initial project request: """${initialMessage.slice(0, 600)}"""`,
            },
          ],
          max_output_tokens: 60,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate project name: ${errorText}`);
      }

      const payload = (await response.json()) as {
        output_text?: string[];
        output?: Array<
          | {
              content?: Array<{ text?: string }>;
            }
          | string
        >;
      };

      const combinedText = Array.isArray(payload.output_text)
        ? payload.output_text.join(" ")
        : Array.isArray(payload.output)
          ? payload.output
              .map((item) => {
                if (typeof item === "string") {
                  return item;
                }
                const content = item?.content;
                if (!Array.isArray(content)) {
                  return "";
                }
                return content
                  .map((segment) => (typeof segment.text === "string" ? segment.text : ""))
                  .join(" ");
              })
              .join(" ")
          : "";

      const cleaned = combinedText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0);

      if (!cleaned) {
        return null;
      }

      const sanitized = cleaned
        .replace(/^[-"'\s]+/, "")
        .replace(/[-"'\s]+$/, "")
        .trim();

      if (!sanitized) {
        return null;
      }

      return sanitized.slice(0, 80);
    });

    if (!projectName) {
      return;
    }

    await step.run("store-project-name", async () => {
      await prisma.project.update({
        where: { id: project.id },
        data: { name: projectName },
      });
    });
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

function summarizeFileList(files: string[]): string | undefined {
  if (!files.length) {
    return undefined;
  }
  const uniquePaths = Array.from(new Set(files));

  let summary: string;
  if (uniquePaths.length === 1) {
    summary = uniquePaths[0];
  } else if (uniquePaths.length === 2) {
    summary = `${uniquePaths[0]}, ${uniquePaths[1]}`;
  } else {
    summary = `${uniquePaths[0]}, ${uniquePaths[1]} +${uniquePaths.length - 2} more`;
  }

  return truncateSummary(summary, 80);
}

function truncateSummary(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}
