import type { Metadata } from "next";
import { format } from "date-fns";

import { CompanyUsageSummary } from "@/modules/home/ui/components/company-usage";
import { SiteHeader } from "@/modules/home/ui/components/site-header";
import { UsageActionsSummary } from "@/modules/usage/ui/components/usage-actions-summary";
import { UsageActivityOverview } from "@/modules/usage/ui/components/usage-activity-overview";
import { UsageTransactions } from "@/modules/usage/ui/components/usage-transactions";
import { getCaller } from "@/trpc/server";

export const metadata: Metadata = {
    title: "Usage | QAI",
    description: "Track your credits, iterations, and project activity across QAI.",
};

const UsagePage = async () => {
    const caller = await getCaller();
    const usageAnalytics = await caller.companies.getUsageAnalytics();

    const rangeLabel = `${format(new Date(usageAnalytics.range.start), "MMM d")} – ${format(new Date(usageAnalytics.range.end), "MMM d")}`;

    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.6),_transparent_55%)]">
            <SiteHeader />

            <div className="h-20" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-white/20 bg-white/60 p-8 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Usage overview</p>
                        <h1 className="text-3xl font-semibold sm:text-4xl">Understand how your team builds with QAI</h1>
                        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Review credit consumption, monitor iteration volume, and track project progress without leaving the product.
                            All insights here are powered directly by your workspace activity.
                        </p>
                    </div>
                </div>

                <CompanyUsageSummary />

                <UsageActionsSummary
                    totals={usageAnalytics.totals}
                    range={usageAnalytics.range}
                    reasons={usageAnalytics.reasons}
                />

                <div className="flex flex-col gap-6">
                    <UsageActivityOverview timeline={usageAnalytics.timeline} rangeLabel={rangeLabel} />
                    <UsageTransactions transactions={usageAnalytics.recentTransactions} />
                </div>
            </div>
        </div>
    );
};

export default UsagePage;
