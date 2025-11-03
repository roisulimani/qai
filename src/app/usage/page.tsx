import type { Metadata } from "next";
import Link from "next/link";

import { CompanyUsageSummary } from "@/modules/home/ui/components/company-usage";
import { SiteHeader } from "@/modules/home/ui/components/site-header";
import { UsageActionsSummary } from "@/modules/usage/ui/components/usage-actions-summary";
import { UsageActivityOverview } from "@/modules/usage/ui/components/usage-activity-overview";
import { UsageTransactions } from "@/modules/usage/ui/components/usage-transactions";

export const metadata: Metadata = {
    title: "Usage | QAI",
    description: "Track your credits, projects, and activity across QAI.",
};

const UsagePage = () => {
    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.6),_transparent_55%)]">
            <SiteHeader />

            <div className="h-20" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-white/20 bg-white/60 p-8 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Usage overview</p>
                            <h1 className="text-3xl font-semibold sm:text-4xl">Stay on top of your company performance</h1>
                            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                                Monitor credits, spot trends in project activity, and understand how your team collaborates across QAI.
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Link
                            href="/projects"
                            className="group rounded-2xl border border-white/10 bg-white/40 p-4 text-sm transition hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-lg hover:shadow-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-black/30 supports-[backdrop-filter]:backdrop-blur"
                        >
                            <span className="block text-xs uppercase tracking-wide text-muted-foreground">Quick action</span>
                            <span className="mt-1 block text-base font-medium">Browse all projects</span>
                            <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                                Manage builds
                                <svg
                                    aria-hidden
                                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                                </svg>
                            </span>
                        </Link>
                        <Link
                            href="/admin"
                            className="group rounded-2xl border border-white/10 bg-white/40 p-4 text-sm transition hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-lg hover:shadow-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-black/30 supports-[backdrop-filter]:backdrop-blur"
                        >
                            <span className="block text-xs uppercase tracking-wide text-muted-foreground">Audit usage</span>
                            <span className="mt-1 block text-base font-medium">Open admin dashboard</span>
                            <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                                Review logs
                                <svg
                                    aria-hidden
                                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                                </svg>
                            </span>
                        </Link>
                        <Link
                            href="/build"
                            className="group rounded-2xl border border-white/10 bg-white/40 p-4 text-sm transition hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-lg hover:shadow-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:shadow-black/30 supports-[backdrop-filter]:backdrop-blur"
                        >
                            <span className="block text-xs uppercase tracking-wide text-muted-foreground">Launch new flow</span>
                            <span className="mt-1 block text-base font-medium">Create automation build</span>
                            <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                                Start building
                                <svg
                                    aria-hidden
                                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>

                <CompanyUsageSummary />

                <UsageActionsSummary />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <UsageActivityOverview />
                    <UsageTransactions />
                </div>
            </div>
        </div>
    );
};

export default UsagePage;
