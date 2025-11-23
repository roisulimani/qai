import { NotFoundError, Sandbox } from "@e2b/code-interpreter";

import { prisma } from "@/lib/db";
import { SandboxStatus } from "@/generated/prisma";
import { toFileRecord } from "./file-utils";

const SANDBOX_TEMPLATE = "qai-nextjs-t4";
export const SANDBOX_LIFETIME_MS = 60 * 60 * 1000;
export const SANDBOX_IDLE_TIMEOUT_MS = 3 * 60 * 1000;

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

    try {
        const info = await Sandbox.getFullInfo(sandboxRecord.sandboxId);
        const sandboxUrl = info.sandboxDomain
            ? `https://${info.sandboxDomain}`
            : sandboxRecord.sandboxUrl;
        const now = Date.now();
        const idleMs = now - sandboxRecord.lastActiveAt.getTime();
        let status = info.state === "paused" ? SandboxStatus.PAUSED : SandboxStatus.RUNNING;

        if (status === SandboxStatus.RUNNING && idleMs >= SANDBOX_IDLE_TIMEOUT_MS) {
            const paused = await Sandbox.betaPause(sandboxRecord.sandboxId);
            if (paused) {
                status = SandboxStatus.PAUSED;
            }
        }

        await prisma.projectSandbox.update({
            where: { projectId },
            data: { status, sandboxUrl },
        });

        await Sandbox.setTimeout(
            sandboxRecord.sandboxId,
            SANDBOX_LIFETIME_MS,
        ).catch(() => undefined);

        return {
            ...fallback,
            status,
            sandboxUrl,
            lastActiveAt: sandboxRecord.lastActiveAt,
            expiresAt: info.endAt,
        } as const;
    } catch (error) {
        if (error instanceof NotFoundError) {
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

        throw error;
    }
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

    if (!sandboxRecord) {
        return { paused: false } as const;
    }

    try {
        const paused = await Sandbox.betaPause(sandboxRecord.sandboxId);

        if (paused) {
            await prisma.projectSandbox.update({
                where: { projectId },
                data: {
                    status: SandboxStatus.PAUSED,
                },
            });
        }

        return { paused } as const;
    } catch (error) {
        if (error instanceof NotFoundError) {
            await prisma.projectSandbox.update({
                where: { projectId },
                data: {
                    status: SandboxStatus.PAUSED,
                },
            });

            return { paused: true } as const;
        }

        throw error;
    }
}

async function hydrateSandboxFiles(
    sandbox: Sandbox,
    files: Record<string, string>,
) {
    for (const [path, content] of Object.entries(files)) {
        await sandbox.files.write(path, content);
    }
}
