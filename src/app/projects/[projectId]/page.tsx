import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { Spinner } from "@/components/ui/spinner";

const ProjectPageSkeleton = () => {
    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-24">
            <div className="relative w-full max-w-md">
                <div className="rounded-[2rem] border border-white/20 bg-white/70 p-8 text-center shadow-[0_30px_120px_-40px_rgba(15,23,42,0.35)] supports-[backdrop-filter]:backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_30px_120px_-40px_rgba(15,23,42,0.9)]">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-white/40 bg-white/40 shadow-inner supports-[backdrop-filter]:backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/60">
                        <Spinner className="size-6 text-primary" />
                    </div>
                    <div className="mt-6 space-y-2">
                        <p className="text-base font-medium">Preparing your project</p>
                        <p className="text-sm text-muted-foreground">
                            We&rsquo;re spinning up your collaborative workspace.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface Props {
    params: Promise<{
        projectId: string
    }>;
};

const Page = async ({ params }: Props) => {
    const { projectId } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({ projectId }));
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({ id: projectId }));
    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.18),transparent_60%)]">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<ProjectPageSkeleton />}>
                    <ProjectView projectId={projectId} />
                </Suspense>
            </HydrationBoundary>
        </div>
    );
};
export default Page;
