"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltipContent,
    ChartTooltip,
    type ChartConfig,
} from "@/components/ui/chart";

const chartConfig: ChartConfig = {
    creditsSpent: {
        label: "Credits spent",
        color: "var(--chart-1)",
    },
    messagesCreated: {
        label: "Iterations",
        color: "var(--chart-2)",
    },
    fragmentsGenerated: {
        label: "Fragments",
        color: "var(--chart-3)",
    },
};

type UsageActivityOverviewProps = {
    timeline: Array<{
        date: string;
        creditsSpent: number;
        creditsGranted: number;
        projectsCreated: number;
        messagesCreated: number;
        fragmentsGenerated: number;
    }>;
    rangeLabel: string;
};

export const UsageActivityOverview = ({ timeline, rangeLabel }: UsageActivityOverviewProps) => {
    const chartData = timeline.map((entry) => ({
        week: format(parseISO(entry.date), "MMM d"),
        creditsSpent: entry.creditsSpent,
        messagesCreated: entry.messagesCreated,
        fragmentsGenerated: entry.fragmentsGenerated,
    }));

    return (
        <section className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Activity timeline</p>
                    <h3 className="text-lg font-semibold">Build velocity &amp; credit spend</h3>
                    <p className="text-xs text-muted-foreground">{rangeLabel}</p>
                </div>
                <div className="rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary">Synced in real time</div>
            </div>

            <div className="mt-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" className="stroke-white/40 dark:stroke-white/10" />
                        <XAxis
                            dataKey="week"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            stroke="currentColor"
                            className="text-xs text-muted-foreground"
                        />
                        <YAxis
                            width={56}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            stroke="currentColor"
                            className="text-xs text-muted-foreground"
                        />
                        <ChartTooltip
                            cursor={{ strokeDasharray: "4 4" }}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area type="monotone" dataKey="creditsSpent" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} strokeWidth={2} />
                        <Area type="monotone" dataKey="messagesCreated" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.25} strokeWidth={2} />
                        <Area type="monotone" dataKey="fragmentsGenerated" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.2} strokeWidth={2} />
                        <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </div>
        </section>
    );
};
