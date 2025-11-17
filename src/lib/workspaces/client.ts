import { z } from "zod";

const workspaceResponse = z.object({
  workspaceId: z.string(),
  previewUrl: z.string(),
});

const commandResponse = z.object({
  stdout: z.string().optional().default(""),
  stderr: z.string().optional().default(""),
  exitCode: z.number().nullable().optional(),
});

const readResponse = z.object({
  files: z.array(z.object({ path: z.string(), content: z.string() })),
});

const writeResponse = z.object({ success: z.boolean() });

const DEFAULT_SERVICE_URL =
  process.env.WORKSPACE_SERVICE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function buildWorkspaceUrl() {
  return `${DEFAULT_SERVICE_URL.replace(/\/$/, "")}/api/workspaces`;
}

async function withRetry<T>(handler: () => Promise<T>, attempts = 3) {
  let error: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await handler();
    } catch (err) {
      error = err;
      const delay = Math.min(1000 * 2 ** i, 4000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw error ?? new Error("Workspace service request failed");
}

async function postToWorkspaceService<T>(body: unknown, schema: z.ZodSchema<T>) {
  const url = buildWorkspaceUrl();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.WORKSPACE_TOKEN
        ? { Authorization: `Bearer ${process.env.WORKSPACE_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Workspace service error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  return schema.parse(json);
}

export async function ensureWorkspaceSession({
  projectId,
  files,
  workspaceId,
}: {
  projectId: string;
  files?: Record<string, string> | null;
  workspaceId?: string;
}) {
  return withRetry(() =>
    postToWorkspaceService(
      { action: "ensure", projectId, files: files ?? undefined, workspaceId },
      workspaceResponse,
    ),
  );
}

export async function runWorkspaceCommand({
  workspaceId,
  projectId,
  command,
}: {
  workspaceId: string;
  projectId: string;
  command: string;
}) {
  return withRetry(() =>
    postToWorkspaceService(
      { action: "command", workspaceId, projectId, command },
      commandResponse,
    ),
  );
}

export async function writeWorkspaceFiles({
  workspaceId,
  projectId,
  files,
}: {
  workspaceId: string;
  projectId: string;
  files: Record<string, string>;
}) {
  return withRetry(() =>
    postToWorkspaceService(
      { action: "write", workspaceId, projectId, files },
      writeResponse,
    ),
  );
}

export async function readWorkspaceFiles({
  workspaceId,
  projectId,
  files,
}: {
  workspaceId: string;
  projectId: string;
  files: string[];
}) {
  return withRetry(() =>
    postToWorkspaceService(
      { action: "read", workspaceId, projectId, files },
      readResponse,
    ),
  );
}

export async function resolveWorkspacePreview({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) {
  return withRetry(() =>
    postToWorkspaceService(
      { action: "preview", workspaceId, projectId },
      workspaceResponse,
    ),
  );
}
