"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Fragment } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { Suspense, useState, type ReactNode } from "react";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragment-web";
import { EyeIcon, CodeIcon, CrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { FloatingGlassLoader } from "@/components/floating-glass-loader";

interface Props {
    projectId: string;
};
const GlassEmptyState = ({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) => (
    <div className="flex h-full items-center justify-center px-6 py-10 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-white/30 bg-white/70 px-8 py-10 shadow-lg shadow-black/10 supports-[backdrop-filter]:backdrop-blur-lg supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    </div>
);

export const ProjectView = ({ projectId }: Props) => {
    const [ activeFragment, setActiveFragment ] = useState<Fragment | null>(null);
    const [ tabState, setTabState ] = useState<"preview" | "code">("preview");

    return (
        <div className="relative h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(139,92,246,0.12),_transparent_60%)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55),transparent_45%)] opacity-70 blur-3xl dark:opacity-40" />
            <div className="pointer-events-none absolute -top-32 right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative z-10 flex h-full w-full flex-col">
                <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
                    <ResizablePanelGroup direction="horizontal" className="gap-6">
                        <ResizablePanel defaultSize={36} minSize={24}>
                            <div className="flex h-full min-h-0 flex-col gap-5">
                                <div className="rounded-[28px] border border-white/30 bg-white/70 p-6 shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/60">
                                    <Suspense
                                        fallback={(
                                            <FloatingGlassLoader
                                                label="Loading project overview"
                                                description="Fetching your project details"
                                                className="py-8"
                                            />
                                        )}
                                    >
                                        <ProjectHeader projectId={projectId} />
                                    </Suspense>
                                </div>

                                <div className="flex flex-1 flex-col overflow-hidden rounded-[28px] border border-white/30 bg-white/70 shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/60">
                                    <Suspense
                                        fallback={(
                                            <FloatingGlassLoader
                                                label="Loading conversation"
                                                description="Retrieving messages and fragments"
                                                className="py-12"
                                            />
                                        )}
                                    >
                                        <MessagesContainer
                                            projectId={projectId}
                                            activeFragment={activeFragment}
                                            setActiveFragment={setActiveFragment}
                                        />
                                    </Suspense>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle className="mx-2 w-1 rounded-full bg-white/20 transition-colors hover:bg-primary/50 dark:bg-white/10" />
                        <ResizablePanel defaultSize={64} minSize={48}>
                            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/30 bg-white/70 shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/60">
                                <Tabs
                                    className="flex h-full flex-col"
                                    defaultValue="preview"
                                    value={tabState}
                                    onValueChange={(value) => setTabState(value as "preview" | "code")}
                                >
                                    <div className="flex items-center gap-3 border-b border-white/20 px-6 py-4 dark:border-white/10">
                                        <TabsList className="h-9 gap-1 rounded-full border border-white/30 bg-white/70 p-1 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/70">
                                            <TabsTrigger value="preview" className="rounded-full px-4 data-[state=active]:bg-white data-[state=active]:text-foreground supports-[backdrop-filter]:backdrop-blur-sm dark:data-[state=active]:bg-neutral-800">
                                                <EyeIcon className="mr-2 size-4" />
                                                <span className="text-sm">Preview</span>
                                            </TabsTrigger>
                                            <TabsTrigger value="code" className="rounded-full px-4 data-[state=active]:bg-white data-[state=active]:text-foreground supports-[backdrop-filter]:backdrop-blur-sm dark:data-[state=active]:bg-neutral-800">
                                                <CodeIcon className="mr-2 size-4" />
                                                <span className="text-sm">Code</span>
                                            </TabsTrigger>
                                        </TabsList>
                                        <div className="ml-auto flex items-center gap-2">
                                            <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-primary to-violet-500 text-xs font-semibold text-white shadow-lg shadow-primary/30 transition hover:from-primary/90 hover:to-violet-500/90">
                                                <Link href="/pricing">
                                                    <CrownIcon className="mr-2 size-4" />
                                                    Upgrade
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col gap-4 p-4">
                                        <TabsContent value="preview" className="flex-1 overflow-hidden rounded-[24px] border border-white/20 bg-white/60 shadow-inner shadow-black/5 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
                                            {activeFragment ? (
                                                <FragmentWeb data={activeFragment} />
                                            ) : (
                                                <GlassEmptyState
                                                    icon={<EyeIcon className="size-5" />}
                                                    title="Choose a fragment to preview"
                                                    description="Select a response on the left to view the live sandbox preview."
                                                />
                                            )}
                                        </TabsContent>
                                        <TabsContent value="code" className="flex-1 overflow-hidden rounded-[24px] border border-white/20 bg-white/60 shadow-inner shadow-black/5 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
                                            {activeFragment?.files ? (
                                                <FileExplorer files={activeFragment.files as { [path: string]: string }} />
                                            ) : (
                                                <GlassEmptyState
                                                    icon={<CodeIcon className="size-5" />}
                                                    title="No code available yet"
                                                    description="Generate a response or pick a message that contains code to explore it here."
                                                />
                                            )}
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </div>
    );
};