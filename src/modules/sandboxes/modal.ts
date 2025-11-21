import { prisma } from "@/lib/db";
import type {
  SandboxCommandResult,
  SandboxFilePayload,
  SandboxMetadata,
  SandboxProvider,
  SandboxStatus,
} from "./types";

const MODAL_API_BASE = process.env.MODAL_API_BASE ?? "https://api.modal.com/v1";
const MODAL_API_TOKEN = process.env.MODAL_API_TOKEN;
const MODAL_SANDBOX_APP = process.env.MODAL_SANDBOX_APP;
const MODAL_INACTIVITY_TIMEOUT_MINUTES = Number(
  process.env.MODAL_SANDBOX_INACTIVITY_MINUTES ?? "20",
);

if (!MODAL_API_TOKEN) {
  console.warn(
    "MODAL_API_TOKEN is not configured. Sandbox operations will fail until it is provided.",
  );
}

if (!MODAL_SANDBOX_APP) {
  console.warn(
    "MODAL_SANDBOX_APP is not configured. New sandboxes cannot be provisioned until it is provided.",
  );
}

async function modalRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!MODAL_API_TOKEN) {
    throw new Error("MODAL_API_TOKEN is not configured");
  }

  const response = await fetch(`${MODAL_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MODAL_API_TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Modal API error (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
}

function toSandboxStatus(state?: string): SandboxStatus {
  switch (state) {
    case "READY":
    case "ready":
      return "ready";
    case "sleeping":
    case "SLEEPING":
      return "sleeping";
    case "creating":
    case "CREATING":
      return "creating";
    case "error":
    case "ERROR":
      return "error";
    default:
      return "unknown";
  }
}

export class ModalSandboxProvider implements SandboxProvider {
  readonly name = "modal" as const;

  async ensureSandbox(projectId: string): Promise<SandboxMetadata> {
    const existing = await prisma.projectSandbox.findUnique({
      where: { projectId },
    });

    if (existing) {
      return {
        id: existing.sandboxId,
        provider: this.name,
        host: existing.host ?? undefined,
        status: toSandboxStatus(existing.status),
        lastActiveAt: existing.lastActiveAt,
      };
    }

    if (!MODAL_SANDBOX_APP) {
      throw new Error("MODAL_SANDBOX_APP is not configured");
    }

    const sandbox = await modalRequest<{ id: string; state: string; host?: string }>(
      `/sandboxes`,
      {
        method: "POST",
        body: JSON.stringify({
          app: MODAL_SANDBOX_APP,
          idle_timeout: MODAL_INACTIVITY_TIMEOUT_MINUTES,
          metadata: { projectId },
        }),
      },
    );

    const created = await prisma.projectSandbox.create({
      data: {
        projectId,
        provider: this.name,
        sandboxId: sandbox.id,
        host: sandbox.host,
        status: sandbox.state,
      },
    });

    return {
      id: created.sandboxId,
      provider: this.name,
      host: created.host ?? undefined,
      status: toSandboxStatus(created.status),
    };
  }

  async syncFiles({ sandboxId, files }: { sandboxId: string; files: SandboxFilePayload[] }) {
    await modalRequest(`/sandboxes/${sandboxId}/files`, {
      method: "POST",
      body: JSON.stringify({ files }),
    });

    await prisma.projectSandbox.update({
      where: { sandboxId },
      data: { lastSyncedAt: new Date(), lastActiveAt: new Date(), status: "READY" },
    });
  }

  async runCommand({ sandboxId, command, cwd }: { sandboxId: string; command: string; cwd?: string }) {
    const result = await modalRequest<
      SandboxCommandResult & { state?: string; host?: string }
    >(`/sandboxes/${sandboxId}/commands`, {
      method: "POST",
      body: JSON.stringify({ command, cwd }),
    });

    await prisma.projectSandbox.update({
      where: { sandboxId },
      data: {
        status: result.state ?? "READY",
        host: result.host,
        lastActiveAt: new Date(),
      },
    });

    return result;
  }

  async readFile({ sandboxId, path }: { sandboxId: string; path: string }): Promise<string> {
    const result = await modalRequest<{ content: string }>(
      `/sandboxes/${sandboxId}/files?path=${encodeURIComponent(path)}`,
    );
    await prisma.projectSandbox.update({
      where: { sandboxId },
      data: { lastActiveAt: new Date() },
    });
    return result.content;
  }

  async getHost({ sandboxId, port }: { sandboxId: string; port: number }): Promise<string> {
    const result = await modalRequest<{ host: string; state?: string }>(
      `/sandboxes/${sandboxId}/ports/${port}`,
    );

    await prisma.projectSandbox.update({
      where: { sandboxId },
      data: {
        host: result.host,
        status: result.state ?? "READY",
        lastActiveAt: new Date(),
      },
    });

    return result.host;
  }

  async sleepSandbox(sandboxId: string): Promise<void> {
    await modalRequest(`/sandboxes/${sandboxId}/sleep`, { method: "POST" });
    await prisma.projectSandbox.update({
      where: { sandboxId },
      data: { status: "SLEEPING" },
    });
  }

  async wakeSandbox(sandboxId: string): Promise<SandboxMetadata> {
    const sandbox = await modalRequest<{ id: string; state: string; host?: string }>(
      `/sandboxes/${sandboxId}/wake`,
      { method: "POST" },
    );

    const updated = await prisma.projectSandbox.update({
      where: { sandboxId },
      data: {
        status: sandbox.state,
        host: sandbox.host,
        lastActiveAt: new Date(),
      },
    });

    return {
      id: updated.sandboxId,
      provider: this.name,
      host: updated.host ?? undefined,
      status: toSandboxStatus(updated.status),
      lastActiveAt: updated.lastActiveAt,
    };
  }
}
