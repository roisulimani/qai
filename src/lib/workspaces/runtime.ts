import "server-only";

import { Sandbox, waitForPort } from "@e2b/code-interpreter";

export type WorkspaceFiles = Record<string, string>;

interface WorkspaceHandle {
  id: string;
  projectId: string;
  sandbox: Sandbox;
}

const workspaceByProject = new Map<string, WorkspaceHandle>();
const workspaceById = new Map<string, WorkspaceHandle>();
const workspaceWithDeps = new Set<string>();

const DEFAULT_TEMPLATE = process.env.WORKSPACE_IMAGE || "qai-nextjs-t4";
const DEV_COMMAND =
  process.env.WORKSPACE_DEV_COMMAND ||
  "nohup npm run dev -- --hostname 0.0.0.0 --port 3000 > /tmp/dev.log 2>&1 &";

export class WorkspaceRuntime {
  static async ensure({
    projectId,
    workspaceId,
    files,
  }: {
    projectId: string;
    workspaceId?: string;
    files?: WorkspaceFiles;
  }) {
    const handle = await this.getHandle({ projectId, workspaceId });

    if (files && Object.keys(files).length > 0) {
      await this.writeFiles(handle, files);
    }

    await this.installDependencies(handle);

    const previewUrl = await this.getPreviewUrl(handle);

    return { workspaceId: handle.id, previewUrl };
  }

  static async writeFiles(handle: WorkspaceHandle, files: WorkspaceFiles) {
    for (const [path, content] of Object.entries(files)) {
      const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
      if (dir) {
        await this.runCommand(handle, `mkdir -p "${dir.replace(/"/g, "\\\"")}"`);
      }
      await handle.sandbox.files.write(path, content);
    }
  }

  static async readFiles(handle: WorkspaceHandle, paths: string[]) {
    const results: Array<{ path: string; content: string }> = [];
    for (const path of paths) {
      const content = await handle.sandbox.files.read(path);
      results.push({ path, content });
    }
    return results;
  }

  static async runCommand(
    handle: WorkspaceHandle,
    command: string,
    timeoutMs = 240_000,
  ) {
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

  static async ensureHandleById(workspaceId: string) {
    const cached = workspaceById.get(workspaceId);
    if (cached) return cached;

    const sandbox = await Sandbox.connect(workspaceId);
    const handle: WorkspaceHandle = {
      id: sandbox.sandboxId,
      projectId: sandbox.sandboxId,
      sandbox,
    };
    workspaceById.set(handle.id, handle);
    return handle;
  }

  static async getHandle({
    projectId,
    workspaceId,
  }: {
    projectId: string;
    workspaceId?: string;
  }): Promise<WorkspaceHandle> {
    const cached = workspaceByProject.get(projectId);
    if (cached) return cached;

    if (workspaceId) {
      const handle = await this.ensureHandleById(workspaceId);
      workspaceByProject.set(projectId, handle);
      return handle;
    }

    const sandbox = await Sandbox.create(DEFAULT_TEMPLATE);
    const handle: WorkspaceHandle = {
      id: sandbox.sandboxId,
      projectId,
      sandbox,
    };
    workspaceByProject.set(projectId, handle);
    workspaceById.set(handle.id, handle);
    return handle;
  }

  static async installDependencies(handle: WorkspaceHandle) {
    if (workspaceWithDeps.has(handle.id)) return;

    await this.runCommand(handle, "npm install", 480_000);
    await this.runCommand(handle, DEV_COMMAND, 30_000);

    try {
      await waitForPort({ sandbox: handle.sandbox, port: 3000, timeout: 60_000 });
    } catch (error) {
      console.warn("Timed out waiting for workspace dev server", error);
    }

    workspaceWithDeps.add(handle.id);
  }

  static async getPreviewUrl(handle: WorkspaceHandle) {
    const host = await handle.sandbox.getHost(3000);
    return `https://${host}`;
  }
}
