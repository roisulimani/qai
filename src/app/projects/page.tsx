import { formatDistanceToNow } from "date-fns";

import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import { ProjectsOnboarding } from "@/modules/home/ui/components/projects-onboarding";
import { SiteHeader } from "@/modules/home/ui/components/site-header";
import { getCaller } from "@/trpc/server";

const formatMonthlyDelta = (count: number) => {
    if (count === 0) {
        return "No builds this month";
    }

    return `+${count} this month`;
};

const formatAverageFragments = (totalFragments: number, totalProjects: number) => {
    if (totalFragments === 0 || totalProjects === 0) {
        return "Awaiting insights";
    }

    const average = totalFragments / totalProjects;
    const formatted = average % 1 === 0 ? average.toString() : average.toFixed(1);
    return `${formatted} avg / project`;
};

const ProjectsPage = async () => {
    const caller = await getCaller();
    const overview = await caller.projects.getOverview();

    const latestUpdate = overview.latestProject?.createdAt
        ? `Latest build ${formatDistanceToNow(overview.latestProject.createdAt, { addSuffix: true })}`
        : "Run your first build";

    const stats = [
        {
            label: "Projects in workspace",
            value: overview.totalProjects.toLocaleString(),
            delta: formatMonthlyDelta(overview.projectsThisMonth),
        },
        {
            label: "Iterations logged",
            value: overview.totalMessages.toLocaleString(),
            delta: latestUpdate,
        },
        {
            label: "Fragments generated",
            value: overview.totalFragments.toLocaleString(),
            delta: formatAverageFragments(overview.totalFragments, overview.totalProjects),
        },
    ];

    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.65),_transparent_55%)]">
            <SiteHeader />

            <div className="h-20" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                <ProjectsOnboarding totalProjects={overview.totalProjects} />
                <section className="rounded-3xl border border-white/20 bg-white/60 px-8 py-12 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                        <div className="space-y-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Portfolio overview</p>
                            <h1 className="text-3xl font-semibold sm:text-4xl">Every project, orchestrated and ready to scale</h1>
                            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                                Keep a pulse on active automations, deployments, and collaboration across your organization. Your project workspace surfaces the context you need to make confident decisions.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-white/20 bg-white/70 p-4 text-sm shadow-lg shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70"
                                >
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                                    <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                                    <p className="mt-1 text-xs text-emerald-500">{stat.delta}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <ProjectsList />
            </main>
        </div>
    );
};

export default ProjectsPage;
