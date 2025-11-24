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
    const { data: sandboxStatus, isFetching, isLoading, refetch } = useQuery(
        trpc.sandboxes.status.queryOptions(
            { projectId },
            {
                staleTime: 30_000,
                gcTime: 5 * 60_000,
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
            },
        ),
    );

    const wakeSandbox = useMutation(
        trpc.sandboxes.wake.mutationOptions({
            onSuccess: async () => {
                await refetch();
                setFragmentKey((prev) => prev + 1);
            },
        }),
    );

    const { mutate: reportActivity } = useMutation(
        trpc.sandboxes.activity.mutationOptions(),
    );

    const previewUrl = sandboxStatus?.sandboxUrl ?? data.sandboxUrl;
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

    const lastActivityPingRef = useRef(0);

    useEffect(() => {
        const sendActivity = () => {
            const now = Date.now();
            if (now - lastActivityPingRef.current < 30_000) return;
            lastActivityPingRef.current = now;
            reportActivity({ projectId });
        };

        const handleVisibility = () => {
            sendActivity();
            if (document.visibilityState === "visible") {
                refetch();
            }
        };

        const handleFocus = () => {
            sendActivity();
            refetch();
        };

        sendActivity();

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("pointerdown", sendActivity);
        window.addEventListener("keydown", sendActivity);
        window.addEventListener("beforeunload", sendActivity);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("pointerdown", sendActivity);
            window.removeEventListener("keydown", sendActivity);
            window.removeEventListener("beforeunload", sendActivity);
            sendActivity();
        };
    }, [projectId, refetch, reportActivity]);

    const handleCopyClick = () => {
        if (!previewUrl) return;
        navigator.clipboard.writeText(previewUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const sandboxState = sandboxStatus?.status;
    const hasSandboxStatus = Boolean(sandboxStatus);

    const statusLabel = useMemo(() => {
        if (wakeSandbox.isPending) return "Waking sandbox…";
        if (isLoading && !hasSandboxStatus) return "Preparing sandbox…";

        switch (sandboxState) {
            case SandboxStatus.RUNNING:
                return "Live preview ready";
            case SandboxStatus.PAUSED:
                return "Sandbox asleep";
            default:
                return "Preparing sandbox…";
        }
    }, [hasSandboxStatus, isLoading, sandboxState, wakeSandbox.isPending]);

    const statusCaption = useMemo(() => {
        if (wakeSandbox.isPending) return "Bringing your sandbox back online…";
        if (sandboxStatus?.status === SandboxStatus.PAUSED) {
            return "Auto-paused after 3 minutes of inactivity. Wake it to continue.";
        }
        if (sandboxStatus?.recreated) {
            return "We restarted a fresh sandbox to keep your files available.";
        }
        return "Sandboxes stay active for 1 hour with smart auto-pause.";
    }, [sandboxStatus?.recreated, sandboxStatus?.status, wakeSandbox.isPending]);

    const statusClasses = getStatusClasses(
        sandboxStatus?.status,
        isFetching || wakeSandbox.isPending,
    );

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
            <iframe
                key={fragmentKey}
                className="h-full w-full"
                sandbox="allow-forms allow-scripts allow-same-origin"
                src={previewUrl ?? undefined}
            />
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
