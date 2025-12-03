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

export const FragmentWeb = ({ data: _data, projectId }: Props) => {
    // The latest fragment data is embedded in the sandbox status response; this keeps the signature stable.
    void _data;
    const [copied, setCopied] = useState(false);
    const [fragmentKey, setFragmentKey] = useState(0);
    const previousUrlRef = useRef<string | null>(null);
    const previousStatusRef = useRef<SandboxStatus | undefined>(undefined);

    const trpc = useTRPC();
    const {
        data: sandboxStatus,
        isFetching,
        isLoading,
        refetch,
        error,
    } = useQuery(
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

    const isStatusLoading = isLoading || (isFetching && !sandboxStatus);
    const isRunning = sandboxStatus?.status === SandboxStatus.RUNNING && !wakeSandbox.isPending;
    const previewUrl = isRunning ? sandboxStatus?.sandboxUrl : undefined;
    const hasPreview = Boolean(previewUrl);

    useEffect(() => {
        if (isRunning && (previousStatusRef.current !== SandboxStatus.RUNNING || previousUrlRef.current !== previewUrl)) {
            setFragmentKey((prev) => prev + 1);
        }

        previousStatusRef.current = sandboxStatus?.status;

        if (previewUrl) {
            previousUrlRef.current = previewUrl;
        }
    }, [isRunning, previewUrl, sandboxStatus?.status]);

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

    const isSandboxMissing = useMemo(
        () =>
            Boolean(
                error?.message?.toLowerCase().includes("not found") ||
                    (!isStatusLoading && !wakeSandbox.isPending && !sandboxStatus),
            ),
        [error?.message, isStatusLoading, sandboxStatus, wakeSandbox.isPending],
    );

    const statusLabel = useMemo(() => {
        if (wakeSandbox.isPending) return "Starting sandbox…";
        if (isStatusLoading) return "Checking sandbox…";
        if (isSandboxMissing) return "Sandbox expired. Please recreate.";
        if (error || !sandboxStatus) return "Sandbox unavailable";

        switch (sandboxStatus.status) {
            case SandboxStatus.RUNNING:
                return "Live preview ready";
            case SandboxStatus.PAUSED:
                return "Sandbox asleep";
            case SandboxStatus.STARTING:
            default:
                return "Preparing sandbox…";
        }
    }, [error, isSandboxMissing, isStatusLoading, sandboxStatus, wakeSandbox.isPending]);

    const statusCaption = useMemo(() => {
        if (wakeSandbox.isPending) return "Getting your workspace ready…";
        if (isStatusLoading) return "Syncing with your latest project files…";
        if (isSandboxMissing) return "We couldn’t find your sandbox. Create a new one to continue.";
        if (error) return "We couldn’t reach the sandbox. Create a new one to continue.";
        if (!sandboxStatus) return "Create a sandbox to view your live preview.";
        if (sandboxStatus.status === SandboxStatus.PAUSED) {
            return "Auto-paused after inactivity. Wake it to continue.";
        }
        if (sandboxStatus.status === SandboxStatus.STARTING) {
            return "Preparing an isolated workspace with your files.";
        }
        if (sandboxStatus.recreated) {
            return "We restarted a fresh sandbox with your files.";
        }
        return "Sandboxes stay active for 1 hour with smart auto-pause.";
    }, [error, isSandboxMissing, isStatusLoading, sandboxStatus, wakeSandbox.isPending]);

    const statusClasses = getStatusClasses(
        sandboxStatus?.status,
        wakeSandbox.isPending || isStatusLoading, // Only show pending state during wake or initial load
    );

    const showWakeAction = !isRunning || !hasPreview;
    const actionLabel = sandboxStatus?.status === SandboxStatus.PAUSED ? "Wake sandbox" : "Create sandbox";

    const renderPreviewPlaceholder = () => {
        return (
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 bg-muted/30 p-6 text-center">
                <div className="flex flex-col items-center gap-3 rounded-lg bg-background/80 px-5 py-4 shadow-sm">
                    <div
                        className={cn(
                            "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                            statusClasses.badge,
                        )}
                    >
                        <span className={cn("h-2.5 w-2.5 rounded-full", statusClasses.dot)} />
                        <span>{statusLabel}</span>
                        {sandboxStatus?.recreated && <span className="text-amber-500">Restarted</span>}
                    </div>
                    <p className="max-w-sm text-sm text-muted-foreground">{statusCaption}</p>
                    {error && <p className="text-xs text-destructive">{error.message}</p>}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {showWakeAction && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => wakeSandbox.mutate({ projectId })}
                                disabled={wakeSandbox.isPending}
                                className="min-w-[150px]"
                            >
                                {wakeSandbox.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <PlayIcon className="h-4 w-4" />
                                )}
                                <span>{wakeSandbox.isPending ? "Waking…" : actionLabel}</span>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={onRefreshClick}>
                            <RefreshCcwIcon className="h-4 w-4" />
                            <span>Refresh</span>
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

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
                    {showWakeAction && (
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
                            <span>{wakeSandbox.isPending ? "Waking…" : actionLabel}</span>
                        </Button>
                    )}
                    <Hint description="Refresh" side="bottom" align="start">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefreshClick}
                        >
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
            <div className="relative h-full w-full flex-1 overflow-hidden rounded-md border bg-background shadow-inner">
                {!hasPreview && renderPreviewPlaceholder()}
                {hasPreview && (
                    <iframe
                        key={fragmentKey}
                        className="h-full w-full"
                        sandbox="allow-forms allow-scripts allow-same-origin"
                        src={previewUrl}
                    />
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
            badge: "bg-muted text-foreground", // subtle neutral state while loading
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
        default:
            return {
                badge: "bg-secondary text-secondary-foreground",
                dot: "bg-primary",
            };
    }
}
