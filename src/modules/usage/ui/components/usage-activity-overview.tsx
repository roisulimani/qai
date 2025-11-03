"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltipContent,
    ChartTooltip,
    type ChartConfig,
} from "@/components/ui/chart";

const weeklyActivity = [
    { week: "May 6", automations: 180, interventions: 54, credits: 420 },
    { week: "May 13", automations: 204, interventions: 48, credits: 468 },
    { week: "May 20", automations: 236, interventions: 42, credits: 512 },
    { week: "May 27", automations: 261, interventions: 36, credits: 558 },
    { week: "Jun 3", automations: 275, interventions: 34, credits: 590 },
    { week: "Jun 10", automations: 292, interventions: 31, credits: 628 },
    { week: "Jun 17", automations: 300, interventions: 28, credits: 640 },
];

const chartConfig: ChartConfig = {
    automations: {
        label: "Automations",
        color: "var(--chart-1)",
    },
    interventions: {
        label: "Manual reviews",
        color: "var(--chart-2)",
    },
    credits: {
        label: "Credits used",
        color: "var(--chart-3)",
    },
};

export const UsageActivityOverview = () => {
    return (
        <section className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Weekly activity</p>
                    <h3 className="text-lg font-semibold">Automation throughput &amp; credit usage</h3>
                </div>
                <div className="rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
                    Updated 5 minutes ago
                </div>
            </div>

            <div className="mt-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart data={weeklyActivity} margin={{ left: 8, right: 8, top: 16, bottom: 0 }}>
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
                        <Area type="monotone" dataKey="automations" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} strokeWidth={2} />
                        <Area type="monotone" dataKey="interventions" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.25} strokeWidth={2} />
                        <Area type="monotone" dataKey="credits" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.2} strokeWidth={2} />
                        <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </div>
        </section>
    );
};
