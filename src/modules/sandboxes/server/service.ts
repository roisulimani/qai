import { Sandbox } from "@e2b/code-interpreter";
import { Prisma } from "@/generated/prisma";

import { prisma } from "@/lib/db";
import { SandboxStatus } from "@/generated/prisma";
import { toFileRecord } from "./file-utils";

const SANDBOX_TEMPLATE = "qai-nextjs-t4";
export const SANDBOX_LIFETIME_MS = 60 * 60 * 1000;
export const SANDBOX_IDLE_TIMEOUT_MS = 3 * 60 * 1000;

export type SandboxLifecycleEventType =
    | "sandbox.lifecycle.created"
    | "sandbox.lifecycle.updated"
    | "sandbox.lifecycle.killed"
    | "sandbox.lifecycle.paused"
    | "sandbox.lifecycle.resumed";

export interface SandboxWebhookPayload {
    version: string;
    id: string;
    type: SandboxLifecycleEventType | string;
    eventData?: {
        sandbox_metadata?: Record<string, string>;
    };
    sandboxBuildId: string;
    sandboxExecutionId: string;
    sandboxId: string;
    sandboxTeamId: string;
    sandboxTemplateId: string;
    timestamp: string;
}

interface EnsureSandboxOptions {
    projectId: string;
    hydrateFiles?: Record<string, string> | null;
    autoHydrate?: boolean;
}

interface EnsureSandboxResult {
    sandboxId: string;
    sandboxUrl: string;
    created: boolean;
    resumed: boolean;
    requiresHydration: boolean;
    hydrated: boolean;
}

export async function ensureConnectedSandbox({
    projectId,
    hydrateFiles,
    autoHydrate = false,
}: EnsureSandboxOptions): Promise<EnsureSandboxResult> {
    const filesToHydrate = hydrateFiles ?? null;
    let sandboxRecord = await prisma.projectSandbox.findUnique({
        where: { projectId },
    });

    const now = new Date();
    let created = false;
    let resumed = false;
    let requiresHydration = false;

    const createSandbox = async () => {
        const sandbox = await Sandbox.betaCreate(SANDBOX_TEMPLATE, {
            timeoutMs: SANDBOX_LIFETIME_MS,
            autoPause: true,
            metadata: { projectId },
        });

        const sandboxUrl = `https://${sandbox.getHost(3000)}`;
        sandboxRecord = await prisma.projectSandbox.upsert({
            where: { projectId },
            update: {
                sandboxId: sandbox.sandboxId,
                sandboxUrl,
                status: SandboxStatus.STARTING,
                lastActiveAt: now,
            },
            create: {
                projectId,
                sandboxId: sandbox.sandboxId,
                sandboxUrl,
                status: SandboxStatus.STARTING,
                lastActiveAt: now,
            },
        });

        created = true;
        requiresHydration = true;
        return { sandbox, sandboxUrl };
    };

    const connectSandbox = async (sandboxId: string) => {
        const sandbox = await Sandbox.connect(sandboxId, {
            timeoutMs: SANDBOX_LIFETIME_MS,
        });
        await sandbox.setTimeout(SANDBOX_LIFETIME_MS);
        const sandboxUrl = `https://${sandbox.getHost(3000)}`;
        await prisma.projectSandbox.update({
            where: { projectId },
            data: {
                status: SandboxStatus.RUNNING,
                sandboxUrl,
                lastActiveAt: now,
            },
        });
        return { sandbox, sandboxUrl };
    };

    let sandbox: Sandbox;
    let sandboxUrl: string;

    if (!sandboxRecord) {
        ({ sandbox, sandboxUrl } = await createSandbox());
    } else {
        try {
            ({ sandbox, sandboxUrl } = await connectSandbox(sandboxRecord.sandboxId));
            resumed = sandboxRecord.status !== SandboxStatus.RUNNING;
        } catch (error) {
            console.warn("Failed to reuse sandbox, creating a new one", error);
            ({ sandbox, sandboxUrl } = await createSandbox());
        }
    }

    let hydrated = false;
    if (autoHydrate && requiresHydration && filesToHydrate) {
        await hydrateSandboxFiles(sandbox, filesToHydrate);
        hydrated = true;
        await prisma.projectSandbox.update({
            where: { projectId },
            data: {
                status: SandboxStatus.RUNNING,
                lastActiveAt: new Date(),
            },
        });
    }

    await recordSandboxActivity(projectId, sandbox.sandboxId, sandbox.getHost(3000));
    await Sandbox.setTimeout(sandbox.sandboxId, SANDBOX_LIFETIME_MS).catch(() => undefined);

    return {
        sandboxId: sandbox.sandboxId,
        sandboxUrl,
        created,
        resumed,
        requiresHydration,
        hydrated,
    };
}

export async function connectToProjectSandbox(projectId: string, sandboxId: string) {
    const sandbox = await Sandbox.connect(sandboxId, { timeoutMs: SANDBOX_LIFETIME_MS });
    await sandbox.setTimeout(SANDBOX_LIFETIME_MS);
    await recordSandboxActivity(projectId, sandboxId, sandbox.getHost(3000));
    return sandbox;
}

export async function recordSandboxActivity(
    projectId: string,
    sandboxId: string,
    host?: string,
) {
    const now = new Date();
    await prisma.projectSandbox.update({
        where: { projectId },
        data: {
            lastActiveAt: now,
            status: SandboxStatus.RUNNING,
            ...(host ? { sandboxUrl: `https://${host}` } : {}),
        },
    });
    await Sandbox.setTimeout(sandboxId, SANDBOX_LIFETIME_MS).catch(() => undefined);
}

export async function getLatestProjectFiles(projectId: string) {
    const fragment = await prisma.fragment.findFirst({
        where: { message: { projectId } },
        orderBy: { createdAt: "desc" },
    });

    return toFileRecord(fragment?.files);
}

export async function getProjectSandboxStatus(projectId: string) {
    const files = await getLatestProjectFiles(projectId);
    const sandboxRecord = await prisma.projectSandbox.findUnique({
        where: { projectId },
    });

    const fallback = {
        idleTimeoutMs: SANDBOX_IDLE_TIMEOUT_MS,
        lifecycleTimeoutMs: SANDBOX_LIFETIME_MS,
    } as const;

    if (!sandboxRecord) {
        const ensured = await ensureConnectedSandbox({
            projectId,
            hydrateFiles: files,
            autoHydrate: true,
        });

        return {
            ...fallback,
            status: SandboxStatus.RUNNING,
            sandboxUrl: ensured.sandboxUrl,
            lastActiveAt: new Date(),
            recreated: true,
        } as const;
    }

    return {
        ...fallback,
        status: sandboxRecord.status,
        sandboxUrl: sandboxRecord.sandboxUrl,
        lastActiveAt: sandboxRecord.lastActiveAt,
    } as const;
}

export async function wakeProjectSandbox(projectId: string) {
    const files = await getLatestProjectFiles(projectId);
    return ensureConnectedSandbox({
        projectId,
        hydrateFiles: files,
        autoHydrate: true,
    });
}

export async function pauseProjectSandbox(projectId: string) {
    const sandboxRecord = await prisma.projectSandbox.findUnique({
        where: { projectId },
    });

    if (!sandboxRecord || !sandboxRecord.sandboxId) return null;

    const alreadyPaused = sandboxRecord.status === SandboxStatus.PAUSED;

    if (!alreadyPaused) {
        try {
            await Sandbox.betaPause(sandboxRecord.sandboxId);
        } catch (error) {
            const notFound = (error as Error)?.name === "NotFoundError";
            if (!notFound) {
                console.error("Failed to pause sandbox", error);
            }
        }
    }

    return prisma.projectSandbox.update({
        where: { projectId },
        data: {
            status: SandboxStatus.PAUSED,
            lastActiveAt: new Date(),
        },
    });
}

export async function applySandboxLifecycleWebhook(payload: SandboxWebhookPayload) {
    const status = mapWebhookTypeToStatus(payload.type);
    if (!status) return { updated: false } as const;

    const projectId = await resolveProjectIdFromWebhook(payload);
    if (!projectId) return { updated: false } as const;

    const sandboxRecord = await prisma.projectSandbox.findUnique({
        where: { projectId },
    });

    let sandboxUrl = sandboxRecord?.sandboxUrl;
    if (!sandboxUrl || status === SandboxStatus.RUNNING) {
        sandboxUrl = await resolveSandboxUrl(payload.sandboxId, sandboxUrl);
    }

    const lastActiveAt = payload.timestamp
        ? new Date(payload.timestamp)
        : new Date();

    const updateData: Prisma.ProjectSandboxUpdateInput = {
        sandboxId: payload.sandboxId,
        status,
        sandboxUrl: sandboxUrl ?? sandboxRecord?.sandboxUrl ?? "",
        lastActiveAt,
    };

    await prisma.projectSandbox.upsert({
        where: { projectId },
        update: updateData,
        create: {
            projectId,
            sandboxId: payload.sandboxId,
            sandboxUrl: updateData.sandboxUrl as string,
            status,
            lastActiveAt,
        },
    });

    return { updated: true } as const;
}

function mapWebhookTypeToStatus(type: string) {
    switch (type) {
        case "sandbox.lifecycle.created":
        case "sandbox.lifecycle.resumed":
        case "sandbox.lifecycle.updated":
            return SandboxStatus.RUNNING;
        case "sandbox.lifecycle.paused":
        case "sandbox.lifecycle.killed":
            return SandboxStatus.PAUSED;
        default:
            return null;
    }
}

async function resolveProjectIdFromWebhook(payload: SandboxWebhookPayload) {
    const metadataProjectId = payload.eventData?.sandbox_metadata?.projectId;
    if (metadataProjectId) return metadataProjectId;

    const sandboxRecord = await prisma.projectSandbox.findFirst({
        where: { sandboxId: payload.sandboxId },
    });

    return sandboxRecord?.projectId;
}

async function resolveSandboxUrl(sandboxId: string, fallback?: string | null) {
    try {
        const info = await Sandbox.getFullInfo(sandboxId);
        if (info.sandboxDomain) {
            return `https://${info.sandboxDomain}`;
        }
    } catch (error) {
        console.error("Failed to resolve sandbox host", error);
    }

    return fallback ?? undefined;
}

async function hydrateSandboxFiles(
    sandbox: Sandbox,
    files: Record<string, string>,
) {
    for (const [path, content] of Object.entries(files)) {
        await sandbox.files.write(path, content);
    }
}
