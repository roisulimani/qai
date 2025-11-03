"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { inferRouterOutputs } from "@trpc/server";

import { useTRPC } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

type ProjectsOverviewData = inferRouterOutputs<AppRouter>["projects"]["getOverview"];

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

const formatLatestUpdate = (latestProject: ProjectsOverviewData["latestProject"]) => {
    if (!latestProject?.createdAt) {
        return "Run your first build";
    }

    return `Latest build ${formatDistanceToNow(latestProject.createdAt, { addSuffix: true })}`;
};

interface ProjectsOverviewProps {
    initialOverview: ProjectsOverviewData;
}

export const ProjectsOverview = ({ initialOverview }: ProjectsOverviewProps) => {
    const trpc = useTRPC();
    const { data = initialOverview } = useQuery({
        ...trpc.projects.getOverview.queryOptions(),
        initialData: initialOverview,
    });

    const stats = useMemo(() => {
        return [
            {
                label: "Projects in workspace",
                value: data.totalProjects.toLocaleString(),
                delta: formatMonthlyDelta(data.projectsThisMonth),
            },
            {
                label: "Iterations logged",
                value: data.totalMessages.toLocaleString(),
                delta: formatLatestUpdate(data.latestProject),
            },
            {
                label: "Fragments generated",
                value: data.totalFragments.toLocaleString(),
                delta: formatAverageFragments(data.totalFragments, data.totalProjects),
            },
        ];
    }, [data]);

    return (
        <section className="rounded-3xl border border-white/20 bg-white/60 px-8 py-12 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Portfolio overview</p>
                    <h1 className="text-3xl font-semibold sm:text-4xl">Every project, orchestrated and ready to scale</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                        Keep a pulse on active automations, deployments, and collaboration across your organization. Your project
                        workspace surfaces the context you need to make confident decisions.
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
    );
};

