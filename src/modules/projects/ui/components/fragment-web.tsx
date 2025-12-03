import { useEffect, useMemo, useRef, useState } from "react";
import {
    ExternalLinkIcon,
    Loader2,
    PlayIcon,
    RefreshCcwIcon,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { SandboxStatus } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";

interface Props {
    projectId: string;
}

export const FragmentWeb = ({ projectId }: Props) => {
    const [copied, setCopied] = useState(false);
    const [fragmentKey, setFragmentKey] = useState(0);
    const previousUrlRef = useRef<string | null>(null);

    const trpc = useTRPC();
    const { data: sandboxStatus, isFetching, refetch, error } = useQuery(
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

    const previewUrl = sandboxStatus?.sandboxUrl;
    const hasPreview = Boolean(previewUrl);

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

    const statusDescriptor = useMemo(() => {
        if (wakeSandbox.isPending) {
            return {
                label: "Waking sandbox…",
                caption: "Bringing your sandbox back online…",
            };
        }

        if (error) {
            return {
                label: "Unable to check sandbox",
                caption: "We couldn't verify the sandbox. Refresh to try again.",
            };
        }

        switch (sandboxStatus?.status) {
            case SandboxStatus.RUNNING:
                return {
                    label: "Live preview ready",
                    caption: sandboxStatus.recreated
                        ? "We restarted a fresh sandbox to keep your files available."
                        : "Sandboxes stay active for 1 hour with smart auto-pause.",
                };
            case SandboxStatus.PAUSED:
                return {
                    label: "Sandbox asleep",
                    caption: "Auto-paused after inactivity. Wake it to continue.",
                };
            case SandboxStatus.STARTING:
            default:
                return {
                    label: "Preparing sandbox…",
                    caption: sandboxStatus?.recreated
                        ? "We restarted your sandbox and are loading your latest files."
                        : "Setting up your environment with the latest project files.",
                };
        }
    }, [error, sandboxStatus?.recreated, sandboxStatus?.status, wakeSandbox.isPending]);

    const statusClasses = getStatusClasses(
        sandboxStatus?.status,
        wakeSandbox.isPending, // Only show pending state during wake, not during background polling
    );

    const previousStatusRef = useRef<SandboxStatus | undefined>();

    useEffect(() => {
        const previousStatus = previousStatusRef.current;
        if (
            sandboxStatus?.status === SandboxStatus.RUNNING &&
            previousStatus !== SandboxStatus.RUNNING
        ) {
            setFragmentKey((prev) => prev + 1);
        }

        previousStatusRef.current = sandboxStatus?.status;
    }, [sandboxStatus?.status]);

    const showPreview =
        sandboxStatus?.status === SandboxStatus.RUNNING && hasPreview && !wakeSandbox.isPending;

    const placeholder = useMemo(() => {
        if (wakeSandbox.isPending) {
            return {
                title: "Waking your sandbox…",
                description: "Hang tight while we bring your environment back online.",
                actionLabel: "Starting…",
                actionDisabled: true,
            };
        }

        if (error) {
            return {
                title: "We couldn't load the sandbox",
                description: "Refresh or try waking a new sandbox to continue.",
                actionLabel: "Wake new sandbox",
                actionDisabled: false,
            };
        }

        if (!sandboxStatus) {
            return {
                title: "Checking sandbox status…",
                description: "Preparing your preview with the latest project files.",
                actionLabel: "Create sandbox",
                actionDisabled: false,
            };
        }

        if (sandboxStatus.status === SandboxStatus.PAUSED) {
            return {
                title: "Sandbox asleep",
                description: "Wake it to pick up where you left off.",
                actionLabel: "Wake sandbox",
                actionDisabled: false,
            };
        }

        if (sandboxStatus.status === SandboxStatus.STARTING) {
            return {
                title: "Preparing your sandbox…",
                description: "Loading your files and getting ready to serve the preview.",
                actionLabel: "Preparing…",
                actionDisabled: true,
            };
        }

        if (!hasPreview) {
            return {
                title: "Preview not available yet",
                description: "We couldn't find a live sandbox. Start a new one to continue.",
                actionLabel: "Start sandbox",
                actionDisabled: false,
            };
        }

        return null;
    }, [error, hasPreview, sandboxStatus, wakeSandbox.isPending]);

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
                        <span>{statusDescriptor.label}</span>
                        {sandboxStatus?.recreated && (
                            <span className="text-amber-500">Restarted</span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{statusDescriptor.caption}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {(sandboxStatus?.status === SandboxStatus.PAUSED || !showPreview) && (
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
                            disabled={!showPreview || copied}
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
                            disabled={!showPreview}
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
                    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-md border bg-muted/40 px-4 text-center">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-center">
                                {wakeSandbox.isPending ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <RefreshCcwIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    {placeholder?.title ?? statusDescriptor.label}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {placeholder?.description ?? statusDescriptor.caption}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => wakeSandbox.mutate({ projectId })}
                                disabled={placeholder?.actionDisabled}
                            >
                                {placeholder?.actionLabel ?? "Wake sandbox"}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRefreshClick}
                                disabled={isFetching}
                            >
                                {isFetching ? "Refreshing…" : "Refresh status"}
                            </Button>
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
        default:
            return {
                badge: "bg-secondary text-secondary-foreground",
                dot: "bg-primary",
            };
    }
}
