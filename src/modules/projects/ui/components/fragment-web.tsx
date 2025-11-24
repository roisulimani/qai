import { useState } from "react";
import { ExternalLinkIcon, MoonIcon, PlayIcon, RefreshCcwIcon } from "lucide-react";

import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectSandboxStatus } from "@/generated/prisma";

interface Props {
    data: Fragment;
    projectId: string;
}

export const FragmentWeb = ({ data, projectId }: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [ copied, setCopied ] = useState(false);
    const [ fragmentKey, setFragmentKey ] = useState(0);

    const sandboxQuery = useQuery(trpc.projects.getSandbox.queryOptions(
        { projectId },
        {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 30,
        },
    ));

    const wakeSandbox = useMutation(trpc.projects.wakeSandbox.mutationOptions({
        onSuccess: (result) => {
            queryClient.setQueryData(
                trpc.projects.getSandbox.queryOptions({ projectId }).queryKey,
                result,
            );
            setFragmentKey((prev) => prev + 1);
        },
    }));

    const sandboxUrl = sandboxQuery.data?.sandboxUrl ?? data.sandboxUrl;
    const sandboxStatus = sandboxQuery.data?.status ?? ProjectSandboxStatus.ACTIVE;
    const lastActiveAt = sandboxQuery.data?.lastActiveAt;

    const onRefreshClick = () => {
        setFragmentKey((prev) => prev + 1);
        sandboxQuery.refetch();
    };

    const handleCopyClick = () => {
        if (!sandboxUrl) return;
        navigator.clipboard.writeText(sandboxUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
                <Hint description="Refresh" side="bottom" align="start">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefreshClick}
                    >
                        <RefreshCcwIcon />
                    </Button>
                </Hint>
                {sandboxStatus === ProjectSandboxStatus.PAUSED ? (
                    <div className="flex items-center gap-2 text-xs text-amber-600">
                        <MoonIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Sandbox is asleep after inactivity.</span>
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={wakeSandbox.isPending}
                            onClick={() => wakeSandbox.mutate({ projectId })}
                        >
                            <PlayIcon className="h-4 w-4" />
                            <span>Wake sandbox</span>
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="hidden sm:inline">
                            {sandboxQuery.data?.wasRecreated
                                ? "Sandbox was restarted for this project."
                                : "Live preview ready."}
                        </span>
                        {lastActiveAt ? (
                            <span className="text-[11px]">
                                Last active {new Date(lastActiveAt).toLocaleTimeString()}
                            </span>
                        ) : null}
                    </div>
                )}
                <Hint description="Copy URL" side="bottom" align="start">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyClick}
                        disabled={!sandboxUrl || copied}
                        className="flex-1 justify-start text-start font-normal"
                    >
                        <span className="truncate">
                            {sandboxUrl}
                        </span>
                    </Button>
                </Hint>
                <Hint description="Open in new tab" side="bottom" align="start">
                    <Button
                        size="sm"
                        disabled={!sandboxUrl}
                        variant={"outline"}
                        onClick={() => {
                            if (!sandboxUrl) return;
                            window.open(sandboxUrl, "_blank");
                        }}
                    >
                        <ExternalLinkIcon />
                    </Button>
                </Hint>
            </div>
            <iframe
                key={fragmentKey}
                className="w-full h-full"
                sandbox="allow-forms allow-scripts allow-same-origin"
                src={sandboxUrl}
            />
        </div>
    );
};