import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  createState,
  type Tool,
} from "@inngest/agent-kit";
import { inngest } from "./client";
import { lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  buildConversationPayload,
  computeRollingConversationSummary,
  loadProjectConversationContext,
} from "./conversation";
import { AgentActionKey } from "@/generated/prisma";
import {
  resetAgentActions,
  runTrackedAgentAction,
} from "@/modules/projects/server/agent-actions";
import { DEFAULT_MODEL, getModelConfig, MODEL_IDS } from "@/modules/models/constants";
import {
  PROJECT_NAME_MODEL,
  PROJECT_NAME_PLACEHOLDER,
  PROJECT_NAME_PROMPT,
} from "@/modules/projects/constants";
import {
  connectToProjectSandbox,
  ensureConnectedSandbox,
  SANDBOX_IDLE_TIMEOUT_MS,
} from "@/modules/sandboxes/server/service";
import { toFileRecord } from "@/modules/sandboxes/server/file-utils";
import { Sandbox } from "@e2b/code-interpreter";
import { SandboxStatus } from "@/generated/prisma";

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
    const requestedModelConfig =
      typeof event.data.model === "string" &&
      (MODEL_IDS as readonly string[]).includes(event.data.model)
        ? getModelConfig(event.data.model)
        : getModelConfig(DEFAULT_MODEL);

    const requestedModel = requestedModelConfig.id;

    await runTrackedAgentAction({
      step,
      projectId,
      key: AgentActionKey.INITIALIZE,
      detail: `Using ${requestedModelConfig.label}`,
      metadata: {
        model: requestedModel,
        provider: requestedModelConfig.provider,
        creditMultiplier: requestedModelConfig.creditMultiplier,
      },
      handler: async () => {},
    });

    const sandboxInfo = await runTrackedAgentAction({
      step,
      projectId,
      key: AgentActionKey.GET_SANDBOX_ID,
      handler: async () =>
        ensureConnectedSandbox({
          projectId,
          hydrateFiles: latestFragmentFiles,
          autoHydrate: false,
        }),
      onComplete: (result) => ({
        detail: result.created
          ? "Started dedicated sandbox"
          : result.resumed
            ? "Resumed sandbox"
            : "Reusing sandbox",
        metadata: {
          sandboxId: result.sandboxId,
          sandboxUrl: result.sandboxUrl,
          hydrated: result.requiresHydration,
        },
      }),
    });

    const sandboxId = sandboxInfo.sandboxId;

    if (sandboxInfo.requiresHydration && latestFragmentFiles) {
      const filePaths = Object.keys(latestFragmentFiles);
      await runTrackedAgentAction({
        step,
        projectId,
        key: AgentActionKey.HYDRATE_SANDBOX,
        detail: summarizeFileList(filePaths),
        metadata: { fileCount: filePaths.length, files: filePaths },
        handler: async () => {
          const sandbox = await connectToProjectSandbox(projectId, sandboxId);
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
                  const sandbox = await connectToProjectSandbox(
                    projectId,
                    sandboxId,
                  );
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
                  const sandbox = await connectToProjectSandbox(
                    projectId,
                    sandboxId,
                  );
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
                  const sandbox = await connectToProjectSandbox(
                    projectId,
                    sandboxId,
                  );
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
        const sandbox = await connectToProjectSandbox(projectId, sandboxId);
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

      const limitedWords = sanitized
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .slice(0, 4)
        .join(" ");

      if (!limitedWords) {
        return null;
      }

      return limitedWords.slice(0, 80);
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

/**
 * Background scheduler function that enforces idle timeout policy and reconciles sandbox states.
 * Runs every 20 minutes to:
 * 1. Check for sandboxes that have been idle for more than 3 minutes and pause them
 * 2. Verify existence of RUNNING/PAUSED sandboxes in E2B and mark missing ones as KILLED
 * 3. Synchronize database state with E2B reality
 */
export const sandboxIdleEnforcerFunction = inngest.createFunction(
  { id: "sandbox-idle-enforcer" },

  { cron: "*/20 * * * *" }, // Every 20 minutes
  async ({ step }) => {
    const result = await step.run("enforce-idle-timeout", async () => {
      const startTime = Date.now();
      console.log("[Sandbox Idle Enforcer] Starting idle timeout enforcement and state reconciliation");

      try {
        // Query all RUNNING and PAUSED sandboxes for verification
        const activeSandboxes = await prisma.projectSandbox.findMany({
          where: {
            status: {
              in: [SandboxStatus.RUNNING, SandboxStatus.PAUSED],
            },
          },
          select: {
            id: true,
            projectId: true,
            sandboxId: true,
            status: true,
            lastActiveAt: true,
          },
        });

        console.log(
          `[Sandbox Idle Enforcer] Found ${activeSandboxes.length} active sandboxes to check`,
        );

        const now = Date.now();
        let pausedCount = 0;
        let killedCount = 0;
        let errorCount = 0;
        const errors: Array<{ projectId: string; error: string }> = [];

        // Check each sandbox
        for (const sandbox of activeSandboxes) {
          try {
            // First, verify sandbox still exists in E2B
            try {
              await Sandbox.getFullInfo(sandbox.sandboxId);
              // Sandbox exists, proceed with idle check
            } catch (verifyError) {
              if (verifyError instanceof Error && verifyError.message.includes('not found')) {
                // Sandbox doesn't exist in E2B - mark as KILLED
                await prisma.projectSandbox.update({
                  where: { id: sandbox.id },
                  data: {
                    status: SandboxStatus.KILLED,
                    killedAt: new Date(),
                    killedReason: 'scheduler_orphaned',
                  },
                });
                killedCount++;
                console.log(
                  `[Sandbox Idle Enforcer] Marked orphaned sandbox ${sandbox.sandboxId} as KILLED (project: ${sandbox.projectId})`,
                );
                continue; // Skip idle check for killed sandbox
              }
              // Other verification errors - log and continue
              console.warn(
                `[Sandbox Idle Enforcer] Failed to verify sandbox ${sandbox.sandboxId}:`,
                verifyError,
              );
            }

            // Only check idle timeout for RUNNING sandboxes
            if (sandbox.status === SandboxStatus.RUNNING) {
              const idleMs = now - sandbox.lastActiveAt.getTime();

              if (idleMs >= SANDBOX_IDLE_TIMEOUT_MS) {
                console.log(
                  `[Sandbox Idle Enforcer] Pausing idle sandbox for project ${sandbox.projectId} (idle for ${Math.round(idleMs / 1000)}s)`,
                );

                // Pause the sandbox via E2B API
                const paused = await Sandbox.betaPause(sandbox.sandboxId);

                if (paused) {
                  // Update database status
                  await prisma.projectSandbox.update({
                    where: { id: sandbox.id },
                    data: {
                      status: SandboxStatus.PAUSED,
                    },
                  });

                  pausedCount++;
                  console.log(
                    `[Sandbox Idle Enforcer] Successfully paused sandbox for project ${sandbox.projectId}`,
                  );
                } else {
                  console.warn(
                    `[Sandbox Idle Enforcer] Failed to pause sandbox for project ${sandbox.projectId} - API returned false`,
                  );
                }
              }
            }
          } catch (error) {
            errorCount++;
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            errors.push({
              projectId: sandbox.projectId,
              error: errorMessage,
            });
            console.error(
              `[Sandbox Idle Enforcer] Error processing sandbox for project ${sandbox.projectId}:`,
              errorMessage,
            );
            // Continue processing other sandboxes even if one fails
          }
        }

        const duration = Date.now() - startTime;

        const summary = {
          totalChecked: activeSandboxes.length,
          pausedCount,
          killedCount,
          errorCount,
          durationMs: duration,
          errors: errors.length > 0 ? errors : undefined,
        };

        console.log(
          `[Sandbox Idle Enforcer] Completed: ${pausedCount} paused, ${killedCount} marked as killed, ${errorCount} errors, ${duration}ms`,
        );

        return summary;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          "[Sandbox Idle Enforcer] Fatal error during enforcement:",
          errorMessage,
        );
        throw error;
      }
    });

    return result;
  },
);
