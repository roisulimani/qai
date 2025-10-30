"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Fragment } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { Suspense, useMemo, useState } from "react";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { EyeIcon, CodeIcon, CrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { projectGlassPanelClass } from "../styles";

const SectionFallback = ({ label, className }: { label: string; className?: string }) => (
    <div
        className={cn(
            projectGlassPanelClass,
            "flex items-center justify-center px-6 py-10 text-sm text-muted-foreground",
            className,
        )}
    >
        <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/60 shadow-inner supports-[backdrop-filter]:backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/70">
                <Spinner className="size-4" />
            </span>
            <span className="font-medium tracking-wide">{label}</span>
        </div>
    </div>
);

interface Props {
    projectId: string;
};
export const ProjectView = ({ projectId }: Props) => {
    const [ activeFragment, setActiveFragment ] = useState<Fragment | null>(null);
    const [ tabState, setTabState ] = useState<"preview" | "code">("preview");

    const previewIsEmpty = useMemo(() => !activeFragment, [activeFragment]);

    return (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-24 md:px-8">
            <Suspense fallback={<SectionFallback label="Loading project details" className="px-4 py-6" />}>
                <ProjectHeader projectId={projectId} />
            </Suspense>
            <div className="flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/30 p-4 shadow-[0_45px_140px_-60px_rgba(15,23,42,0.55)] supports-[backdrop-filter]:backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/40 dark:shadow-[0_45px_140px_-60px_rgba(15,23,42,0.9)]">
                <ResizablePanelGroup direction="horizontal" className="h-full gap-4">
                    <ResizablePanel
                        defaultSize={35}
                        minSize={20}
                        className="flex min-h-0 flex-col gap-4"
                    >
                        <Suspense fallback={<SectionFallback label="Connecting messages" className="flex-1" />}>
                            <MessagesContainer
                                projectId={projectId}
                                activeFragment={activeFragment}
                                setActiveFragment={setActiveFragment}
                            />
                        </Suspense>
                    </ResizablePanel>
                    <ResizableHandle className="mx-1 w-px rounded-full bg-white/30 transition-colors duration-300 hover:bg-white/50 dark:bg-white/10 dark:hover:bg-white/30" />
                    <ResizablePanel
                        defaultSize={65}
                        minSize={50}
                        className="flex min-h-0 flex-col"
                    >
                        <Tabs
                            className="flex h-full flex-col gap-4"
                            defaultValue="preview"
                            value={tabState}
                            onValueChange={(value) => setTabState(value as "preview" | "code")}
                        >
                            <div className={cn(projectGlassPanelClass, "flex items-center gap-3 px-4 py-3")}>
                                <TabsList className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/60 px-1 py-1 text-xs font-medium supports-[backdrop-filter]:backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/60">
                                    <TabsTrigger value="preview" className="rounded-full px-4">
                                        <EyeIcon className="size-4" />
                                        <span>Preview</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="code" className="rounded-full px-4">
                                        <CodeIcon className="size-4" />
                                        <span>Code</span>
                                    </TabsTrigger>
                                </TabsList>
                                <div className="ml-auto flex items-center gap-2">
                                    <Button asChild size="sm" className="rounded-full border border-white/40 bg-white/70 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-white/80 dark:border-white/10 dark:bg-neutral-900/70 dark:text-white dark:hover:bg-neutral-900">
                                        <Link href="/pricing">
                                            <CrownIcon className="size-4" />
                                            <span className="ml-1">Upgrade</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <TabsContent value="preview" className="flex-1">
                                {previewIsEmpty ? (
                                    <SectionFallback label="Select a fragment to preview" className="h-full justify-center" />
                                ) : (
                                    <FragmentWeb data={activeFragment!} />
                                )}
                            </TabsContent>
                            <TabsContent value="code" className="flex-1">
                                {!!activeFragment?.files ? (
                                    <div className={cn(projectGlassPanelClass, "flex h-full flex-col overflow-hidden")}>
                                        <FileExplorer
                                            files={activeFragment.files as {[path: string]: string}}
                                        />
                                    </div>
                                ) : (
                                    <SectionFallback label="Select a fragment to explore the code" className="h-full justify-center" />
                                )}
                            </TabsContent>
                        </Tabs>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
};
