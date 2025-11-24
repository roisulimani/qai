import { Sandbox } from "@e2b/code-interpreter";
import { NotFoundError } from "e2b";
import type { Fragment, ProjectSandbox } from "@/generated/prisma";
import { ProjectSandboxStatus } from "@/generated/prisma";
import { prisma } from "@/lib/db";

const SANDBOX_TEMPLATE = "qai-nextjs-t4";
const SANDBOX_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour lifecycle
const SANDBOX_IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

type FileRecord = Record<string, string>;

interface EnsureSandboxOptions {
  projectId: string;
  latestFragment?: Fragment | null;
}

interface EnsureSandboxResult {
  sandbox: Sandbox;
  record: ProjectSandbox;
  needsHydration: boolean;
  sandboxUrl: string;
  wasRecreated: boolean;
}

export function toFileRecord(
  value: Fragment["files"] | undefined | null,
): FileRecord | null {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return Object.entries(value).reduce<FileRecord>((accumulator, [path, content]) => {
    if (typeof content === "string") {
      accumulator[path] = content;
    }
    return accumulator;
  }, {});
}

export async function ensureProjectSandbox({
  projectId,
  latestFragment,
}: EnsureSandboxOptions): Promise<EnsureSandboxResult> {
  const existing = await prisma.projectSandbox.findUnique({
    where: { projectId },
  });

  const latestFragmentId = latestFragment?.id ?? null;
  let sandbox: Sandbox | null = null;
  let wasRecreated = false;

  if (existing) {
    try {
      sandbox = await Sandbox.connect(existing.sandboxId, {
        timeoutMs: SANDBOX_TIMEOUT_MS,
      });
    } catch {
      // Sandbox expired or missing, recreate below
      sandbox = null;
    }
  }

  if (!sandbox) {
    sandbox = await Sandbox.betaCreate(SANDBOX_TEMPLATE, {
      timeoutMs: SANDBOX_TIMEOUT_MS,
      autoPause: true,
      metadata: { projectId },
    });
    wasRecreated = true;
  }

  const sandboxUrl = `https://${sandbox.getHost(3000)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SANDBOX_TIMEOUT_MS);

  const record = await prisma.projectSandbox.upsert({
    where: { projectId },
    update: {
      sandboxId: sandbox.sandboxId,
      sandboxUrl,
      status: ProjectSandboxStatus.ACTIVE,
      lastActiveAt: now,
      expiresAt,
    },
    create: {
      projectId,
      sandboxId: sandbox.sandboxId,
      sandboxUrl,
      status: ProjectSandboxStatus.ACTIVE,
      lastActiveAt: now,
      expiresAt,
    },
  });

  await sandbox.setTimeout(SANDBOX_TIMEOUT_MS).catch(() => undefined);

  const needsHydration =
    !!latestFragmentId && record.lastSyncedFragmentId !== latestFragmentId;

  return { sandbox, record, needsHydration, sandboxUrl, wasRecreated };
}

export async function hydrateProjectSandbox({
  sandbox,
  projectId,
  files,
  fragmentId,
}: {
  sandbox: Sandbox;
  projectId: string;
  files: FileRecord;
  fragmentId?: string | null;
}) {
  for (const [path, content] of Object.entries(files)) {
    await sandbox.files.write(path, content);
  }

  await prisma.projectSandbox.update({
    where: { projectId },
    data: {
      lastSyncedFragmentId: fragmentId,
      status: ProjectSandboxStatus.ACTIVE,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + SANDBOX_TIMEOUT_MS),
    },
  });
}

export async function markSandboxActive(projectId: string) {
  return prisma.projectSandbox.update({
    where: { projectId },
    data: {
      status: ProjectSandboxStatus.ACTIVE,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + SANDBOX_TIMEOUT_MS),
    },
  });
}

export async function pauseSandboxIfIdle(
  record: ProjectSandbox,
  sandbox: Sandbox,
) {
  const idleThreshold = Date.now() - SANDBOX_IDLE_TIMEOUT_MS;
  if (
    record.lastActiveAt.getTime() < idleThreshold &&
    record.status !== ProjectSandboxStatus.PAUSED
  ) {
    try {
      await sandbox.betaPause();
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        console.error("Failed to pause sandbox", error);
      }
    }

    return prisma.projectSandbox.update({
      where: { id: record.id },
      data: { status: ProjectSandboxStatus.PAUSED },
    });
  }

  return record;
}

export async function wakeSandbox({
  projectId,
  latestFragment,
}: EnsureSandboxOptions) {
  const context = await ensureProjectSandbox({ projectId, latestFragment });
  await markSandboxActive(projectId);
  return context;
}

export const SANDBOX_CONSTANTS = {
  TEMPLATE: SANDBOX_TEMPLATE,
  TIMEOUT_MS: SANDBOX_TIMEOUT_MS,
  IDLE_TIMEOUT_MS: SANDBOX_IDLE_TIMEOUT_MS,
};
