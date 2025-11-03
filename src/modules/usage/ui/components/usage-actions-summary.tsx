import { Braces, Code2, Coins, FolderGit2, Layers, Sparkles } from "lucide-react";
import { format } from "date-fns";

const reasonLabels: Record<string, string> = {
    project_created: "Project created",
    message_sent: "Iteration generated",
    manual_grant: "Manual credit grant",
    initial_grant: "Initial allocation",
};

type UsageActionsSummaryProps = {
    totals: {
        creditsSpent: number;
        creditsGranted: number;
        projectsCreated: number;
        messagesCreated: number;
        fragmentsGenerated: number;
        netCredits: number;
    };
    range: {
        start: string;
        end: string;
    };
    reasons: Array<{
        reason: string;
        totalAmount: number;
        count: number;
    }>;
};

const formatNumber = (value: number) => value.toLocaleString();

export const UsageActionsSummary = ({ totals, range, reasons }: UsageActionsSummaryProps) => {
    const rangeLabel = `${format(new Date(range.start), "MMM d")} – ${format(new Date(range.end), "MMM d")}`;

    const metrics = [
        {
            title: "Credits spent",
            value: formatNumber(totals.creditsSpent),
            helper: totals.netCredits < 0 ? "Net credits out" : undefined,
            icon: Coins,
        },
        {
            title: "Credits granted",
            value: formatNumber(totals.creditsGranted),
            helper: totals.netCredits > 0 ? `Net +${formatNumber(totals.netCredits)}` : undefined,
            icon: Sparkles,
        },
        {
            title: "Iterations generated",
            value: formatNumber(totals.messagesCreated),
            helper: "Messages sent to the agent",
            icon: Code2,
        },
        {
            title: "Fragments produced",
            value: formatNumber(totals.fragmentsGenerated),
            helper: "Code updates captured",
            icon: Braces,
        },
        {
            title: "Projects started",
            value: formatNumber(totals.projectsCreated),
            helper: "New builds kicked off",
            icon: FolderGit2,
        },
    ];

    return (
        <section className="rounded-3xl border border-white/20 bg-white/60 p-8 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl space-y-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Workspace insights</p>
                    <h2 className="text-2xl font-semibold sm:text-3xl">How your credits fuel shipped product</h2>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Data below reflects activity recorded between {rangeLabel}. Every metric is sourced from your projects, messages, and credit ledger — no placeholders or estimates.
                    </p>
                </div>
                <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {metrics.map((metric) => {
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
                                        {metric.helper && <p className="mt-1 text-xs text-muted-foreground">{metric.helper}</p>}
                                    </div>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/70 shadow-inner shadow-black/5 dark:border-white/10 dark:bg-neutral-900/80">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/70 p-5 shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Credit usage breakdown</p>
                        <h3 className="text-lg font-semibold">Where your credits are going</h3>
                    </div>
                    <span className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
                        <Layers className="h-3.5 w-3.5" /> Synced live
                    </span>
                </div>
                {reasons.length === 0 ? (
                    <p className="mt-5 text-sm text-muted-foreground">No credit usage recorded in this window.</p>
                ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {reasons.map((reason) => (
                            <div key={reason.reason} className="rounded-xl border border-white/10 bg-white/60 p-4 shadow-inner shadow-black/5 dark:border-white/10 dark:bg-neutral-900/70">
                                <p className="text-sm font-medium">{reasonLabels[reason.reason] ?? reason.reason.replaceAll("_", " ")}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{reason.count.toLocaleString()} events</p>
                                <p className="mt-3 text-sm font-semibold text-primary">{formatNumber(reason.totalAmount)} credits</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
