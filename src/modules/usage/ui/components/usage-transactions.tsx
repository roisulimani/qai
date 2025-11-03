const transactionHistory = [
    {
        id: "TX-9824",
        action: "Automation run",
        project: "Customer success triage",
        credits: "-18",
        timestamp: "2024-06-17 14:32",
        status: "Completed",
    },
    {
        id: "TX-9819",
        action: "Manual review override",
        project: "Invoice QA",
        credits: "-6",
        timestamp: "2024-06-17 09:18",
        status: "Completed",
    },
    {
        id: "TX-9812",
        action: "Credit allocation",
        project: "Workspace",
        credits: "+500",
        timestamp: "2024-06-16 19:04",
        status: "Approved",
    },
    {
        id: "TX-9798",
        action: "Automation run",
        project: "Logistics forecasting",
        credits: "-24",
        timestamp: "2024-06-16 11:45",
        status: "Completed",
    },
    {
        id: "TX-9786",
        action: "Data sync job",
        project: "Partner enablement",
        credits: "-12",
        timestamp: "2024-06-15 22:12",
        status: "Completed",
    },
];

const statusColors: Record<string, string> = {
    Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    Approved: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
};

export const UsageTransactions = () => {
    return (
        <section className="rounded-3xl border border-white/20 bg-white/60 p-6 text-sm shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent activity</p>
                    <h3 className="text-lg font-semibold">Latest credit transactions</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Synced from admin panel</span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/70 shadow-inner shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70">
                <table className="min-w-full divide-y divide-white/20 text-left text-sm dark:divide-white/10">
                    <thead className="bg-white/80 text-xs uppercase tracking-wide text-muted-foreground dark:bg-neutral-900/80">
                        <tr>
                            <th className="px-4 py-3 font-medium">Reference</th>
                            <th className="px-4 py-3 font-medium">Action</th>
                            <th className="px-4 py-3 font-medium">Project</th>
                            <th className="px-4 py-3 font-medium text-right">Credits</th>
                            <th className="px-4 py-3 font-medium">Timestamp</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionHistory.map((transaction) => (
                            <tr key={transaction.id} className="odd:bg-white/40 even:bg-white/25 text-muted-foreground dark:odd:bg-neutral-900/50 dark:even:bg-neutral-900/40">
                                <td className="px-4 py-3 font-medium text-foreground">{transaction.id}</td>
                                <td className="px-4 py-3">{transaction.action}</td>
                                <td className="px-4 py-3">{transaction.project}</td>
                                <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{transaction.credits}</td>
                                <td className="px-4 py-3">{transaction.timestamp}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[transaction.status] ?? "bg-muted text-muted-foreground"}`}>
                                        {transaction.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
