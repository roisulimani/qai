import { Activity, Bot, Clock3, Gauge } from "lucide-react";

const actionHighlights = [
    {
        title: "Automations executed",
        value: "1,248",
        change: "+18% vs last month",
        description: "Successful production runs initiated across all projects.",
        icon: Bot,
    },
    {
        title: "Manual reviews",
        value: "312",
        change: "Down 11%",
        description: "Exceptions escalated to human review for quality control.",
        icon: Activity,
    },
    {
        title: "Average resolution time",
        value: "3m 42s",
        change: "-28%",
        description: "Median time from task creation to completion this month.",
        icon: Clock3,
    },
];

const actionBreakdown = [
    {
        label: "Build orchestrations",
        detail: "Triggered from admin dashboard",
        total: "642",
    },
    {
        label: "Data sync jobs",
        detail: "Nightly imports from partner systems",
        total: "388",
    },
    {
        label: "Release approvals",
        detail: "Manual overrides after QA checks",
        total: "218",
    },
    {
        label: "Incident follow-ups",
        detail: "Automated post-mortem workflows",
        total: "112",
    },
];

export const UsageActionsSummary = () => {
    return (
        <section className="rounded-3xl border border-white/20 bg-white/60 p-8 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl space-y-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Action insights</p>
                    <h2 className="text-2xl font-semibold sm:text-3xl">How your team is engaging with QAI</h2>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Track the automation runs, manual interventions, and operational throughput powering your workspace. These metrics mirror the usage details available in your admin dashboard.
                    </p>
                </div>
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                    {actionHighlights.map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <div
                                key={metric.title}
                                className="rounded-2xl border border-white/15 bg-white/70 p-4 text-sm shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.title}</p>
                                        <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                                        <p className="mt-1 text-xs text-emerald-500">{metric.change}</p>
                                    </div>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/70 shadow-inner shadow-black/5 dark:border-white/10 dark:bg-neutral-900/80">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </span>
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground">{metric.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/70 p-5 shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Breakdown by action</p>
                        <h3 className="text-lg font-semibold">Where activity is happening</h3>
                    </div>
                    <span className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
                        <Gauge className="h-3.5 w-3.5" /> Real-time sync
                    </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {actionBreakdown.map((action) => (
                        <div key={action.label} className="rounded-xl border border-white/10 bg-white/60 p-4 shadow-inner shadow-black/5 dark:border-white/10 dark:bg-neutral-900/70">
                            <p className="text-sm font-medium">{action.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{action.detail}</p>
                            <p className="mt-3 text-sm font-semibold text-primary">{action.total} actions</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
