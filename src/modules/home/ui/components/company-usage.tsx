"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { useTRPC } from "@/trpc/client";

export const CompanyUsageSummary = () => {
    const trpc = useTRPC();
    const { data, isLoading } = useQuery(
        trpc.companies.getCurrent.queryOptions(),
    );

    if (isLoading) {
        return (
            <div className="w-full rounded-2xl border border-white/20 dark:border-white/10 p-4 sm:p-6 bg-white/60 dark:bg-neutral-900/60 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 shadow-lg shadow-black/5">
                <div className="h-20 animate-pulse rounded-xl bg-muted" />
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const creditsRemaining = data.creditBalance;
    const totalSpent = data.totalCreditsSpent;

    return (
        <div className="w-full rounded-2xl border border-white/20 dark:border-white/10 p-4 sm:p-6 flex flex-col gap-y-4 bg-white/60 dark:bg-neutral-900/60 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 shadow-lg shadow-black/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Access granted to</p>
                    <h2 className="text-lg font-semibold">{data.name}</h2>
                    {data.codeLabel && (
                        <p className="text-xs text-muted-foreground">Recruiter code: {data.codeLabel}</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Credits remaining</p>
                    <p className="text-2xl font-semibold">{creditsRemaining}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/30 dark:bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Projects built</p>
                    <p className="text-xl font-semibold">{data.projectsCreated}</p>
                    {data.lastProjectAt && (
                        <p className="text-xs text-muted-foreground">Last build {formatDistanceToNow(data.lastProjectAt, { addSuffix: true })}</p>
                    )}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/30 dark:bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Credits used</p>
                    <p className="text-xl font-semibold">{totalSpent}</p>
                    <p className="text-xs text-muted-foreground">Initial allocation {data.totalCreditsGranted}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/30 dark:bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Last activity</p>
                    <p className="text-xl font-semibold">
                        {data.lastActiveAt
                            ? formatDistanceToNow(data.lastActiveAt, { addSuffix: true })
                            : "First visit"}
                    </p>
                    <p className="text-xs text-muted-foreground">Joined {formatDistanceToNow(data.createdAt, { addSuffix: true })}</p>
                </div>
            </div>
        </div>
    );
};
