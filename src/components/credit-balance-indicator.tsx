"use client";

import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

interface CreditBalanceIndicatorProps {
    className?: string;
}

export const CreditBalanceIndicator = ({ className }: CreditBalanceIndicatorProps) => {
    const trpc = useTRPC();
    const { data, isLoading } = useQuery(
        trpc.companies.getCurrent.queryOptions(undefined, {
            refetchInterval: 5000,
        }),
    );

    const balance = data?.creditBalance;

    return (
        <div
            className={cn(
                "flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm",
                className,
            )}
        >
            <span className="font-medium">Credits remaining</span>
            {isLoading ? (
                <span className="h-4 w-10 rounded bg-muted-foreground/30 animate-pulse" />
            ) : (
                <span className="text-sm font-semibold text-foreground tabular-nums">{balance ?? "--"}</span>
            )}
        </div>
    );
};
