import { useEffect, useMemo, useRef, useState } from "react";
import {
    ExternalLinkIcon,
    Loader2,
    PlayIcon,
    RefreshCcwIcon,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Fragment, SandboxStatus } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";

interface Props {
    data: Fragment;
    projectId: string;
}

export const FragmentWeb = ({ data, projectId }: Props) => {
    const [copied, setCopied] = useState(false);
    const [fragmentKey, setFragmentKey] = useState(0);
    const previousUrlRef = useRef<string | null>(null);

    const trpc = useTRPC();
    const { data: sandboxStatus, isFetching, refetch } = useQuery(
        trpc.sandboxes.status.queryOptions(
            { projectId },
            {
                // Adaptive polling based on sandbox status
                refetchInterval: (query) => {
                    const status = query.state.data?.status;
                    
                    // No polling when paused - save resources
                    if (status === SandboxStatus.PAUSED) {
                        return false;
                    }
                    
                    // Slow polling for running sandboxes (background job handles lifecycle)
                    if (status === SandboxStatus.RUNNING) {
                        return 30000; // 30 seconds
                    }
                    
                    // Faster polling during initialization
                    return 5000; // 5 seconds for STARTING status
                },
            },
        ),
    );

    const wakeSandbox = useMutation(
        trpc.sandboxes.wake.mutationOptions({
            onSuccess: async () => {
                // After wake, poll aggressively for a short period to catch state change
                await refetch();
                setFragmentKey((prev) => prev + 1);
            },
        }),
    );

    const previewUrl = sandboxStatus?.sandboxUrl ?? data.sandboxUrl;
    const previewReady = sandboxStatus?.previewReady ?? false;
    const showPreview = sandboxStatus?.status === SandboxStatus.RUNNING && previewReady && previewUrl;
    const hasPreview = Boolean(showPreview);

    useEffect(() => {
        if (previewUrl && previousUrlRef.current !== previewUrl) {
            previousUrlRef.current = previewUrl;
            setFragmentKey((prev) => prev + 1);
        }
    }, [previewUrl]);

    const onRefreshClick = () => {
        setFragmentKey((prev) => prev + 1);
        refetch();
    };

    const handleCopyClick = () => {
        if (!previewUrl) return;
        navigator.clipboard.writeText(previewUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const statusLabel = useMemo(() => {
        if (wakeSandbox.isPending) return "Waking sandbox…";

        switch (sandboxStatus?.status) {
            case SandboxStatus.RUNNING:
                return previewReady ? "Live preview ready" : "Restoring sandbox…";
            case SandboxStatus.PAUSED:
                return "Sandbox asleep";
            case SandboxStatus.STARTING:
                return "Preparing sandbox…";
            default:
                return "Checking sandbox…";
        }
    }, [previewReady, sandboxStatus?.status, wakeSandbox.isPending]);

    const statusCaption = useMemo(() => {
        if (wakeSandbox.isPending) return "Bringing your sandbox back online…";
        if (sandboxStatus?.status === SandboxStatus.PAUSED) {
            return "Auto-paused after 3 minutes of inactivity. Wake it to continue.";
        }
        if (!previewReady && sandboxStatus?.status === SandboxStatus.RUNNING) {
            return "We couldn't reach the last sandbox. Starting a fresh one with your files.";
        }
        if (sandboxStatus?.status === SandboxStatus.STARTING) {
            return "Creating your isolated environment and installing dependencies.";
        }
        if (sandboxStatus?.recreated) {
            return "We restarted a fresh sandbox to keep your files available.";
        }
        return "Sandboxes stay active for 1 hour with smart auto-pause.";
    }, [previewReady, sandboxStatus?.recreated, sandboxStatus?.status, wakeSandbox.isPending]);

    const statusClasses = getStatusClasses(
        sandboxStatus?.status,
        wakeSandbox.isPending, // Only show pending state during wake, not during background polling
    );

    const previewState = useMemo(() => {
        if (wakeSandbox.isPending) {
            return {
                title: "Waking sandbox…",
                description: "Bringing your preview back online.",
                actionLabel: "Cancel",
                actionDisabled: true,
            } as const;
        }

        if (!sandboxStatus && isFetching) {
            return {
                title: "Checking sandbox…",
                description: "Fetching the latest preview status.",
                actionLabel: "Refresh",
                actionDisabled: true,
            } as const;
        }

        if (sandboxStatus?.status === SandboxStatus.PAUSED) {
            return {
                title: "Sandbox asleep",
                description: "Auto-paused after inactivity. Wake it to continue working.",
                actionLabel: "Wake sandbox",
            } as const;
        }

        if (sandboxStatus?.status === SandboxStatus.STARTING) {
            return {
                title: "Preparing sandbox…",
                description: "Creating your environment and applying your latest files.",
                actionLabel: "Refresh",
                actionDisabled: true,
            } as const;
        }

        if (!previewReady || !previewUrl) {
            return {
                title: "Restoring sandbox…",
                description:
                    "We couldn't reach the last sandbox. Start a fresh one with all your project files.",
                actionLabel: "Create new sandbox",
            } as const;
        }

        return null;
    }, [isFetching, previewReady, previewUrl, sandboxStatus, wakeSandbox.isPending]);

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex flex-col gap-2 border-b bg-sidebar p-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                    <div
                        className={cn(
                            "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                            statusClasses.badge,
                        )}
                    >
                        <span className={cn("h-2 w-2 rounded-full", statusClasses.dot)} />
                        <span>{statusLabel}</span>
                        {sandboxStatus?.recreated && (
                            <span className="text-amber-500">Restarted</span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{statusCaption}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {(sandboxStatus?.status === SandboxStatus.PAUSED || !hasPreview) && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => wakeSandbox.mutate({ projectId })}
                            disabled={wakeSandbox.isPending}
                            className="min-w-[130px]"
                        >
                            {wakeSandbox.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <PlayIcon className="h-4 w-4" />
                            )}
                            <span>{wakeSandbox.isPending ? "Waking…" : "Wake sandbox"}</span>
                        </Button>
                    )}
                    <Hint description="Refresh" side="bottom" align="start">
                        <Button variant="outline" size="sm" onClick={onRefreshClick}>
                            <RefreshCcwIcon />
                        </Button>
                    </Hint>
                    <Hint description="Copy URL" side="bottom" align="start">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyClick}
                            disabled={!hasPreview || copied}
                            className="flex-1 justify-start text-start font-normal"
                        >
                            <span className="truncate">
                                {previewUrl ?? "Sandbox URL unavailable"}
                            </span>
                        </Button>
                    </Hint>
                    <Hint description="Open in new tab" side="bottom" align="start">
                        <Button
                            size="sm"
                            disabled={!hasPreview}
                            variant={"outline"}
                            onClick={() => {
                                if (!previewUrl) return;
                                window.open(previewUrl, "_blank");
                            }}
                        >
                            <ExternalLinkIcon />
                        </Button>
                    </Hint>
                </div>
            </div>
            <div className="relative h-full w-full">
                {showPreview ? (
                    <iframe
                        key={fragmentKey}
                        className="h-full w-full"
                        sandbox="allow-forms allow-scripts allow-same-origin"
                        src={previewUrl ?? undefined}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/50 px-6 text-center">
                        <div className="flex max-w-lg flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{previewState?.title ?? "Preparing sandbox…"}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {previewState?.description ??
                                    "Hold tight while we prepare a fresh sandbox for your project."}
                            </p>
                            <div className="flex items-center gap-2">
                                {(sandboxStatus?.status === SandboxStatus.PAUSED || !previewReady || !previewUrl) && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => wakeSandbox.mutate({ projectId })}
                                        disabled={wakeSandbox.isPending || previewState?.actionDisabled}
                                        className="min-w-[150px]"
                                    >
                                        {wakeSandbox.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <PlayIcon className="h-4 w-4" />
                                        )}
                                        <span>
                                            {wakeSandbox.isPending
                                                ? "Waking…"
                                                : previewState?.actionLabel ?? "Wake sandbox"}
                                        </span>
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={onRefreshClick}>
                                    <RefreshCcwIcon className="h-4 w-4" />
                                    <span className="ml-1">Refresh status</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

function getStatusClasses(
    status: SandboxStatus | undefined,
    isPending: boolean,
) {
    if (isPending) {
        return {
            badge: "bg-muted text-foreground",
            dot: "bg-muted-foreground animate-pulse",
        };
    }

    switch (status) {
        case SandboxStatus.PAUSED:
            return {
                badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
                dot: "bg-amber-400",
            };
        case SandboxStatus.RUNNING:
            return {
                badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
                dot: "bg-emerald-500",
            };
        case SandboxStatus.STARTING:
            return {
                badge: "bg-secondary text-secondary-foreground",
                dot: "bg-primary animate-pulse",
            };
        default:
            return {
                badge: "bg-secondary text-secondary-foreground",
                dot: "bg-primary",
            };
    }
}
