import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { GlassLoadingState } from "@/modules/projects/ui/components/glass-loading-state";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

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
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense
                fallback={(
                    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                        <GlassLoadingState
                            label="Preparing your workspace"
                            description="Fetching your project configuration and recent activity."
                        />
                    </div>
                )}
            >
                <ProjectView projectId={projectId} />
            </Suspense>
        </HydrationBoundary>
    );
};
export default Page;