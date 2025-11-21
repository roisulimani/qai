import { prisma } from "@/lib/db";
import { getSandboxProvider } from "./provider";
import type { SandboxFilePayload } from "./types";

const SANDBOX_PORT = Number(process.env.SANDBOX_PREVIEW_PORT ?? 3000);

export async function ensureProjectSandbox(projectId: string) {
  const provider = getSandboxProvider();
  const metadata = await provider.ensureSandbox(projectId);

  await prisma.projectSandbox.upsert({
    where: { projectId },
    create: {
      projectId,
      provider: provider.name,
      sandboxId: metadata.id,
      host: metadata.host,
      status: metadata.status,
    },
    update: {
      sandboxId: metadata.id,
      provider: provider.name,
      host: metadata.host,
      status: metadata.status,
      lastActiveAt: new Date(),
    },
  });

  return metadata;
}

export async function hydrateProjectSandbox(projectId: string, files: SandboxFilePayload[]) {
  const provider = getSandboxProvider();
  const sandbox = await ensureProjectSandbox(projectId);
  await provider.syncFiles({ sandboxId: sandbox.id, files });
}

export async function runSandboxCommand(projectId: string, command: string) {
  const provider = getSandboxProvider();
  const sandbox = await ensureProjectSandbox(projectId);
  return provider.runCommand({ sandboxId: sandbox.id, command });
}

export async function readSandboxFile(projectId: string, path: string) {
  const provider = getSandboxProvider();
  const sandbox = await ensureProjectSandbox(projectId);
  return provider.readFile({ sandboxId: sandbox.id, path });
}

export async function getSandboxPreviewUrl(projectId: string) {
  const provider = getSandboxProvider();
  const sandbox = await ensureProjectSandbox(projectId);
  const host = sandbox.host ?? (await provider.getHost({ sandboxId: sandbox.id, port: SANDBOX_PORT }));
  return `https://${host}`;
}

export async function sleepInactiveSandbox(projectId: string) {
  const provider = getSandboxProvider();
  const record = await prisma.projectSandbox.findUnique({ where: { projectId } });
  if (!record) return;

  await provider.sleepSandbox(record.sandboxId);
}

export async function wakeSandbox(projectId: string) {
  const provider = getSandboxProvider();
  const record = await prisma.projectSandbox.findUnique({ where: { projectId } });
  if (!record) return ensureProjectSandbox(projectId);
  return provider.wakeSandbox(record.sandboxId);
}
