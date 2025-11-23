"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Fragment } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { Suspense, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { ProjectOnboarding } from "../components/project-onboarding";
import { EyeIcon, CodeIcon, CrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";

const ProjectViewHeaderFallback = () => (
    <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
            </div>
        </div>
    </div>
);

const MessagesContainerFallback = () => (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-6">
        <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface Props {
    projectId: string;
};
export const ProjectView = ({ projectId }: Props) => {
    const [ activeFragment, setActiveFragment ] = useState<Fragment | null>(null);
    const [ tabState, setTabState ] = useState<"preview" | "code">("preview");
    const trpc = useTRPC();

    const wakeSandbox = useMutation(trpc.sandboxes.wake.mutationOptions());
    const pauseSandbox = useMutation(trpc.sandboxes.pause.mutationOptions());

    useEffect(() => {
        wakeSandbox.mutate({ projectId });

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                pauseSandbox.mutate({ projectId });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            pauseSandbox.mutate({ projectId });
        };
    }, [pauseSandbox, projectId, wakeSandbox]);

    return (
        <div className="h-screen">
            <ProjectOnboarding />
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <Suspense fallback={<ProjectViewHeaderFallback />}>
                        <ProjectHeader projectId={projectId} />
                    </Suspense>
                    <Suspense fallback={<MessagesContainerFallback />}>
                        <MessagesContainer
                            projectId={projectId}
                            activeFragment={activeFragment}
                            setActiveFragment={setActiveFragment}
                        />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                >
                    <Tabs
                        className="h-full gap-y-0"
                        defaultValue="preview"
                        value={tabState}
                        onValueChange={(value) => setTabState(value as "preview" | "code")}
                    >
                        <div className="flex h-14 w-full items-center gap-x-2 border-b px-3">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon />
                                    <span>Preview</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-md">
                                    <CodeIcon />
                                    <span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                <Button asChild variant="tertiary" size="sm">
                                    <Link href="/pricing">
                                        <CrownIcon />
                                        <span>Upgrade</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <TabsContent value="preview">
                            {!!activeFragment && (
                                <FragmentWeb
                                    data={activeFragment}
                                    projectId={projectId}
                                />
                            )}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment?.files && (
                                <FileExplorer
                                    files={activeFragment.files as {[path: string]: string}}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};