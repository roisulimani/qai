import "server-only";

import { Sandbox, waitForPort } from "@e2b/code-interpreter";

export type WorkspaceFiles = Record<string, string>;

type WorkspaceResult = { workspaceId: string; previewUrl: string };

type WorkspaceCommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

interface WorkspaceProvider {
  ensure(input: {
    projectId: string;
    workspaceId?: string;
    files?: WorkspaceFiles;
  }): Promise<WorkspaceResult>;
  write(input: { workspaceId: string; files: WorkspaceFiles }): Promise<{ success: boolean }>;
  read(input: { workspaceId: string; files: string[] }): Promise<{ files: Array<{ path: string; content: string }> }>;
  command(input: { workspaceId: string; command: string }): Promise<WorkspaceCommandResult>;
  preview(input: { workspaceId: string }): Promise<WorkspaceResult>;
}

class ModalWorkspaceProvider implements WorkspaceProvider {
  private readonly endpoint: string;
  private readonly authHeader?: string;

  constructor() {
    this.endpoint = process.env.WORKSPACE_MODAL_SERVICE_URL || "";
    if (!this.endpoint) {
      throw new Error("WORKSPACE_MODAL_SERVICE_URL is required when WORKSPACE_RUNTIME=modal");
    }

    const tokenId = process.env.MODAL_TOKEN_ID;
    const tokenSecret = process.env.MODAL_TOKEN_SECRET;
    if (tokenId && tokenSecret) {
      const encoded = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");
      this.authHeader = `Basic ${encoded}`;
    }
  }

  private async request<T>(body: unknown): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.authHeader ? { Authorization: this.authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Modal workspace request failed (${response.status}): ${message}`);
    }

    return (await response.json()) as T;
  }

  ensure({ projectId, workspaceId, files }: Parameters<WorkspaceProvider["ensure"]>[0]) {
    return this.request<WorkspaceResult>({ action: "ensure", projectId, workspaceId, files });
  }

  write({ workspaceId, files }: Parameters<WorkspaceProvider["write"]>[0]) {
    return this.request({ action: "write", workspaceId, files });
  }

  read({ workspaceId, files }: Parameters<WorkspaceProvider["read"]>[0]) {
    return this.request({ action: "read", workspaceId, files });
  }

  command({ workspaceId, command }: Parameters<WorkspaceProvider["command"]>[0]) {
    return this.request({ action: "command", workspaceId, command });
  }

  preview({ workspaceId }: Parameters<WorkspaceProvider["preview"]>[0]) {
    return this.request<WorkspaceResult>({ action: "preview", workspaceId });
  }
}

interface E2BWorkspaceHandle {
  id: string;
  projectId: string;
  sandbox: Sandbox;
}

class E2BWorkspaceProvider implements WorkspaceProvider {
  private readonly workspaceByProject = new Map<string, E2BWorkspaceHandle>();
  private readonly workspaceById = new Map<string, E2BWorkspaceHandle>();
  private readonly workspaceWithDeps = new Set<string>();
  private readonly template: string;
  private readonly devCommand: string;

  constructor(template: string, devCommand: string) {
    this.template = template;
    this.devCommand = devCommand;
  }

  private async runCommand(
    handle: E2BWorkspaceHandle,
    command: string,
    timeoutMs = 240_000,
  ): Promise<WorkspaceCommandResult> {
    const result = (await handle.sandbox.commands.run(command, {
      timeout: timeoutMs,
    })) as {
      stdout?: string;
      stderr?: string;
      exitCode?: number | null;
      exit_code?: number | null;
    };

    return {
      stdout: result?.stdout ?? "",
      stderr: result?.stderr ?? "",
      exitCode: result?.exitCode ?? result?.exit_code ?? null,
    };
  }

  private async ensureHandleById(workspaceId: string) {
    const cached = this.workspaceById.get(workspaceId);
    if (cached) return cached;

    const sandbox = await Sandbox.connect(workspaceId);
    const handle: E2BWorkspaceHandle = {
      id: sandbox.sandboxId,
      projectId: sandbox.sandboxId,
      sandbox,
    };
    this.workspaceById.set(handle.id, handle);
    return handle;
  }

  private async getHandle({
    projectId,
    workspaceId,
  }: {
    projectId: string;
    workspaceId?: string;
  }): Promise<E2BWorkspaceHandle> {
    const cached = this.workspaceByProject.get(projectId);
    if (cached) return cached;

    if (workspaceId) {
      const handle = await this.ensureHandleById(workspaceId);
      this.workspaceByProject.set(projectId, handle);
      return handle;
    }

    const sandbox = await Sandbox.create(this.template);
    const handle: E2BWorkspaceHandle = {
      id: sandbox.sandboxId,
      projectId,
      sandbox,
    };
    this.workspaceByProject.set(projectId, handle);
    this.workspaceById.set(handle.id, handle);
    return handle;
  }

  private async installDependencies(handle: E2BWorkspaceHandle) {
    if (this.workspaceWithDeps.has(handle.id)) return;

    await this.runCommand(handle, "npm install", 480_000);
    await this.runCommand(handle, this.devCommand, 30_000);

    try {
      await waitForPort({ sandbox: handle.sandbox, port: 3000, timeout: 60_000 });
    } catch (error) {
      console.warn("Timed out waiting for workspace dev server", error);
    }

    this.workspaceWithDeps.add(handle.id);
  }

  async ensure({ projectId, workspaceId, files }: Parameters<WorkspaceProvider["ensure"]>[0]) {
    const handle = await this.getHandle({ projectId, workspaceId });

    if (files && Object.keys(files).length > 0) {
      await this.write({ workspaceId: handle.id, files });
    }

    await this.installDependencies(handle);

    const previewUrl = await this.getPreviewUrl(handle);

    return { workspaceId: handle.id, previewUrl };
  }

  async write({ workspaceId, files }: Parameters<WorkspaceProvider["write"]>[0]) {
    const handle = await this.ensureHandleById(workspaceId);
    for (const [path, content] of Object.entries(files)) {
      const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
      if (dir) {
        await this.runCommand(handle, `mkdir -p "${dir.replace(/"/g, "\\\"")}"`);
      }
      await handle.sandbox.files.write(path, content);
    }
    return { success: true };
  }

  async read({ workspaceId, files }: Parameters<WorkspaceProvider["read"]>[0]) {
    const handle = await this.ensureHandleById(workspaceId);
    const results: Array<{ path: string; content: string }> = [];
    for (const path of files) {
      const content = await handle.sandbox.files.read(path);
      results.push({ path, content });
    }
    return { files: results };
  }

  command({ workspaceId, command }: Parameters<WorkspaceProvider["command"]>[0]) {
    return this.ensureHandleById(workspaceId).then((handle) => this.runCommand(handle, command));
  }

  async preview({ workspaceId }: Parameters<WorkspaceProvider["preview"]>[0]) {
    const handle = await this.ensureHandleById(workspaceId);
    const previewUrl = await this.getPreviewUrl(handle);
    return { workspaceId: handle.id, previewUrl };
  }

  private async getPreviewUrl(handle: E2BWorkspaceHandle) {
    const host = await handle.sandbox.getHost(3000);
    return `https://${host}`;
  }
}

function selectProvider(): WorkspaceProvider {
  const runtime = (process.env.WORKSPACE_RUNTIME || "modal").toLowerCase();
  if (runtime === "modal") {
    return new ModalWorkspaceProvider();
  }

  const template = process.env.WORKSPACE_IMAGE || "qai-nextjs-t4";
  const devCommand =
    process.env.WORKSPACE_DEV_COMMAND ||
    "nohup npm run dev -- --hostname 0.0.0.0 --port 3000 > /tmp/dev.log 2>&1 &";
  return new E2BWorkspaceProvider(template, devCommand);
}

const provider = selectProvider();

export class WorkspaceRuntime {
  static ensure(params: Parameters<WorkspaceProvider["ensure"]>[0]) {
    return provider.ensure(params);
  }

  static writeFiles(_: unknown, files: WorkspaceFiles) {
    // Kept for API compatibility; provider takes workspaceId directly
    return provider.write({ workspaceId: (_ as { id: string }).id, files });
  }

  static readFiles(_: unknown, paths: string[]) {
    return provider.read({ workspaceId: (_ as { id: string }).id, files: paths });
  }

  static runCommand(_: unknown, command: string) {
    return provider.command({ workspaceId: (_ as { id: string }).id, command });
  }

  static ensureHandleById(workspaceId: string) {
    // Providers expect IDs directly; maintain method signature for existing callers.
    return Promise.resolve({ id: workspaceId });
  }

  static getPreviewUrl(_: unknown) {
    return provider.preview({ workspaceId: (_ as { id: string }).id }).then((res) => res.previewUrl);
  }
}
