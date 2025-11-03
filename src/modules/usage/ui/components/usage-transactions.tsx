"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const reasonLabels: Record<string, string> = {
    project_created: "Project created",
    message_sent: "Iteration generated",
    manual_grant: "Manual credit grant",
    initial_grant: "Initial allocation",
};

type UsageTransaction = {
    id: string;
    amount: number;
    reason: string;
    createdAt: string;
    projectName: string | null;
};

type UsageTransactionsProps = {
    transactions: UsageTransaction[];
};

const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString();
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
};

export const UsageTransactions = ({ transactions }: UsageTransactionsProps) => {
    const [visibleCount, setVisibleCount] = useState(10);

    const visibleTransactions = useMemo(
        () => transactions.slice(0, visibleCount),
        [transactions, visibleCount],
    );

    const canLoadMore = visibleCount < transactions.length;

    return (
        <section className="rounded-3xl border border-white/20 bg-white/60 p-6 text-sm shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent activity</p>
                    <h3 className="text-lg font-semibold">Latest credit transactions</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Direct from ledger</span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/70 shadow-inner shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70">
                {visibleTransactions.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-muted-foreground">No credit movements recorded for this period.</p>
                ) : (
                    <table className="min-w-full divide-y divide-white/20 text-left text-sm dark:divide-white/10">
                        <thead className="bg-white/80 text-xs uppercase tracking-wide text-muted-foreground dark:bg-neutral-900/80">
                            <tr>
                                <th className="px-4 py-3 font-medium">Reference</th>
                                <th className="px-4 py-3 font-medium">Reason</th>
                                <th className="px-4 py-3 font-medium">Project</th>
                                <th className="px-4 py-3 font-medium text-right">Amount</th>
                                <th className="px-4 py-3 font-medium">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleTransactions.map((transaction) => (
                                <tr key={transaction.id} className="odd:bg-white/40 even:bg-white/25 text-muted-foreground dark:odd:bg-neutral-900/50 dark:even:bg-neutral-900/40">
                                    <td className="px-4 py-3 font-medium text-foreground">{transaction.id}</td>
                                    <td className="px-4 py-3">{reasonLabels[transaction.reason] ?? transaction.reason.replaceAll("_", " ")}</td>
                                    <td className="px-4 py-3">{transaction.projectName ?? "—"}</td>
                                    <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{formatAmount(transaction.amount)}</td>
                                    <td className="px-4 py-3">{new Date(transaction.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {canLoadMore ? (
                <div className="mt-4 flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setVisibleCount((count) => Math.min(count + 10, transactions.length));
                        }}
                    >
                        Load more
                    </Button>
                </div>
            ) : null}
        </section>
    );
};
