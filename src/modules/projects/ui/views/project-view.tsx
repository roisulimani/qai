"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Fragment } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { Suspense, useState } from "react";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { EyeIcon, CodeIcon, CrownIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { GlassLoadingState } from "../components/glass-loading-state";

interface Props {
    projectId: string;
};

export const ProjectView = ({ projectId }: Props) => {
    const [ activeFragment, setActiveFragment ] = useState<Fragment | null>(null);
    const [ tabState, setTabState ] = useState<"preview" | "code">("preview");

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 top-[-10rem] h-72 w-72 rounded-full bg-primary/25 blur-3xl dark:bg-primary/20" />
                <div className="absolute right-[-8rem] top-1/3 h-64 w-64 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-400/10" />
                <div className="absolute bottom-[-12rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-500/20" />
            </div>
            <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-10">
                <Suspense fallback={<GlassLoadingState label="Loading project details" className="h-24" compact />}>
                    <ProjectHeader projectId={projectId} />
                </Suspense>
                <div className="flex flex-1 pb-10">
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="flex-1 rounded-[32px] border border-white/30 bg-white/40 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/40"
                    >
                        <ResizablePanel
                            defaultSize={36}
                            minSize={24}
                            className="min-w-0 p-1"
                        >
                            <Suspense
                                fallback={(
                                    <div className="flex h-full items-center justify-center rounded-[26px] border border-white/30 bg-white/70 p-6 shadow-inner backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/60">
                                        <GlassLoadingState
                                            label="Loading conversation"
                                            description="Retrieving the latest updates for this project."
                                            compact
                                        />
                                    </div>
                                )}
                            >
                                <MessagesContainer
                                    projectId={projectId}
                                    activeFragment={activeFragment}
                                    setActiveFragment={setActiveFragment}
                                />
                            </Suspense>
                        </ResizablePanel>
                        <ResizableHandle
                            withHandle
                            className="mx-2 rounded-full bg-white/40 transition-colors hover:bg-primary/50 dark:bg-white/10 dark:hover:bg-primary/40"
                        />
                        <ResizablePanel
                            defaultSize={64}
                            minSize={40}
                            className="min-w-0 p-1"
                        >
                            <div className="flex h-full flex-col rounded-[26px] border border-white/30 bg-white/70 p-4 shadow-inner backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/60">
                                <Tabs
                                    className="flex h-full flex-col"
                                    defaultValue="preview"
                                    value={tabState}
                                    onValueChange={(value) => setTabState(value as "preview" | "code")}
                                >
                                    <div className="flex flex-wrap items-center gap-3 pb-4">
                                        <TabsList className="flex h-10 items-center gap-1 rounded-full border border-white/40 bg-white/60 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60">
                                            <TabsTrigger
                                                value="preview"
                                                className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-neutral-800 dark:data-[state=active]:text-white"
                                            >
                                                <EyeIcon className="size-4" />
                                                <span>Preview</span>
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="code"
                                                className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-neutral-800 dark:data-[state=active]:text-white"
                                            >
                                                <CodeIcon className="size-4" />
                                                <span>Code</span>
                                            </TabsTrigger>
                                        </TabsList>
                                        <div className="ml-auto flex items-center gap-2">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="ghost"
                                                className="rounded-full border border-white/50 bg-white/60 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-white/80 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100 dark:hover:bg-neutral-700/80"
                                            >
                                                <Link href="/pricing" className="flex items-center gap-2">
                                                    <CrownIcon className="size-4" />
                                                    <span>Upgrade</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    <TabsContent value="preview" className="flex-1 focus-visible:outline-hidden">
                                        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/80 shadow-inner backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-950/50">
                                            {activeFragment ? (
                                                <FragmentWeb data={activeFragment} />
                                            ) : (
                                                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                                                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/50 bg-white/40 text-muted-foreground dark:border-white/20 dark:bg-neutral-900/60">
                                                        <SparklesIcon className="size-5" />
                                                    </span>
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        Select a response to see the live preview.
                                                    </p>
                                                    <p className="max-w-sm text-xs text-muted-foreground/80">
                                                        Start chatting with QAI or choose a generated fragment from the conversation to explore it here.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="code" className="flex-1 focus-visible:outline-hidden">
                                        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/80 shadow-inner backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-950/50">
                                            {activeFragment?.files ? (
                                                <FileExplorer files={activeFragment.files as { [path: string]: string }} />
                                            ) : (
                                                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-muted-foreground">
                                                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/50 bg-white/40 text-muted-foreground dark:border-white/20 dark:bg-neutral-900/60">
                                                        <CodeIcon className="size-5" />
                                                    </span>
                                                    <p className="text-sm font-medium">
                                                        No code selected yet.
                                                    </p>
                                                    <p className="max-w-sm text-xs text-muted-foreground/80">
                                                        Choose a fragment from the conversation to inspect the generated files.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </div>
    );
};
