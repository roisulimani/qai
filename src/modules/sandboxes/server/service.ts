import { NotFoundError, Sandbox } from "@e2b/code-interpreter";

import { prisma } from "@/lib/db";
import { SandboxStatus } from "@/generated/prisma";
import { toFileRecord } from "./file-utils";

const SANDBOX_TEMPLATE = "qai-nextjs-t4";

/**
 * Maximum lifetime duration for a sandbox instance in milliseconds.
 * After this duration, the sandbox will be terminated regardless of activity.
 * Default: 60 minutes (3,600,000 ms)
 */
export const SANDBOX_LIFETIME_MS = 60 * 60 * 1000;

/**
 * Idle timeout duration for a sandbox instance in milliseconds.
 * If the sandbox has no activity for this duration, it will be paused/stopped.
 * Default: 5 minutes (300,000 ms)
 */
export const SANDBOX_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

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

    // If sandbox is already in a terminal error state, return it directly
    if ([
        SandboxStatus.KILLED,
        SandboxStatus.EXPIRED,
        SandboxStatus.TERMINATED,
    ].includes(sandboxRecord.status)) {
        return {
            ...fallback,
            status: sandboxRecord.status,
            sandboxUrl: sandboxRecord.sandboxUrl,
            lastActiveAt: sandboxRecord.lastActiveAt,
        } as const;
    }

    try {
        // Verification-first approach: Check E2B API to ensure sandbox exists
        const info = await Sandbox.getFullInfo(sandboxRecord.sandboxId);
        const sandboxUrl = info.sandboxDomain
            ? `https://${info.sandboxDomain}`
            : sandboxRecord.sandboxUrl;
        
        // Use database status as source of truth (updated by webhooks and scheduler)
        const status = sandboxRecord.status;

        // Update verification timestamp and reset failure counter
        await prisma.projectSandbox.update({
            where: { projectId },
            data: {
                sandboxUrl,
                lastVerifiedAt: new Date(),
                verificationFailures: 0,
            },
        });

        // Extend sandbox lifetime on each status check to prevent premature termination
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
            // Sandbox no longer exists in E2B - mark as KILLED
            const now = new Date();
            await prisma.projectSandbox.update({
                where: { projectId },
                data: {
                    status: SandboxStatus.KILLED,
                    killedAt: now,
                    killedReason: 'not_found',
                    lastVerifiedAt: now,
                    verificationFailures: 0, // Reset counter since we've determined the issue
                },
            });

            console.log(
                `[Sandbox Service] Sandbox ${sandboxRecord.sandboxId} not found in E2B, marked as KILLED`,
            );

            return {
                ...fallback,
                status: SandboxStatus.KILLED,
                sandboxUrl: sandboxRecord.sandboxUrl,
                lastActiveAt: sandboxRecord.lastActiveAt,
            } as const;
        }

        // Check if error message indicates sandbox doesn't exist (catches 404-style messages)
        const errorMessage = error instanceof Error ? error.message : String(error);
        const is404Error = errorMessage.includes("doesn't exist") || 
                          errorMessage.includes("not found") ||
                          errorMessage.includes("404");

        if (is404Error) {
            // Treat consistent 404 errors as KILLED state
            const now = new Date();
            await prisma.projectSandbox.update({
                where: { projectId },
                data: {
                    status: SandboxStatus.KILLED,
                    killedAt: now,
                    killedReason: 'not_found_404',
                    lastVerifiedAt: now,
                    verificationFailures: 0,
                },
            });

            console.log(
                `[Sandbox Service] Sandbox ${sandboxRecord.sandboxId} returned 404 error, marked as KILLED`,
            );

            return {
                ...fallback,
                status: SandboxStatus.KILLED,
                sandboxUrl: sandboxRecord.sandboxUrl,
                lastActiveAt: sandboxRecord.lastActiveAt,
            } as const;
        }

        // Handle transient errors (network, timeout, etc.)
        const verificationFailures = sandboxRecord.verificationFailures + 1;
        await prisma.projectSandbox.update({
            where: { projectId },
            data: { verificationFailures },
        });

        console.warn(
            `[Sandbox Service] Failed to verify sandbox ${sandboxRecord.sandboxId} (attempt ${verificationFailures}):`,
            errorMessage,
        );

        // After multiple failures, mark as UNKNOWN (for non-404 errors)
        if (verificationFailures >= 3) {
            await prisma.projectSandbox.update({
                where: { projectId },
                data: { status: SandboxStatus.UNKNOWN },
            });

            return {
                ...fallback,
                status: SandboxStatus.UNKNOWN,
                sandboxUrl: sandboxRecord.sandboxUrl,
                lastActiveAt: sandboxRecord.lastActiveAt,
            } as const;
        }

        // Return current database state for transient errors
        return {
            ...fallback,
            status: sandboxRecord.status,
            sandboxUrl: sandboxRecord.sandboxUrl,
            lastActiveAt: sandboxRecord.lastActiveAt,
        } as const;
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

async function hydrateSandboxFiles(
    sandbox: Sandbox,
    files: Record<string, string>,
) {
    for (const [path, content] of Object.entries(files)) {
        await sandbox.files.write(path, content);
    }
}
