import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import { ProjectsOnboarding } from "@/modules/home/ui/components/projects-onboarding";
import { ProjectsOverview } from "@/modules/home/ui/components/projects-overview";
import { SiteHeader } from "@/modules/home/ui/components/site-header";
import { getCaller } from "@/trpc/server";

const ProjectsPage = async () => {
    const caller = await getCaller();
    const overview = await caller.projects.getOverview();

    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_65%)] pb-16 dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.65),_transparent_55%)]">
            <SiteHeader />

            <div className="h-20" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                <ProjectsOnboarding totalProjects={overview.totalProjects} />
                <ProjectsOverview initialOverview={overview} />
                <ProjectsList />
            </main>
        </div>
    );
};

export default ProjectsPage;
