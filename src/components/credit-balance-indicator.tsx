"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestMoreCreditsButton } from "@/components/request-more-credits-button";

export type CreditBalanceIndicatorVariant = "card" | "inline";

export interface CreditBalanceIndicatorProps {
    className?: string;
    variant?: CreditBalanceIndicatorVariant;
    balance?: number | null;
    isLoading?: boolean;
}

export const CreditBalanceIndicator = ({
    className,
    variant = "card",
    balance: balanceProp,
    isLoading: loadingProp,
}: CreditBalanceIndicatorProps) => {
    const trpc = useTRPC();
    const shouldFetch = balanceProp === undefined;
    const { data, isLoading: queryLoading } = useQuery({
        ...trpc.companies.getCurrent.queryOptions(undefined, { staleTime: 10_000 }),
        enabled: shouldFetch,
    });

    const balance = balanceProp ?? data?.creditBalance ?? 0;
    const isLoading = loadingProp ?? (shouldFetch ? queryLoading : false);
    const isOutOfCredits = !isLoading && (balance ?? 0) <= 0;

    const formattedBalance = useMemo(
        () => new Intl.NumberFormat("en-US").format(balance ?? 0),
        [balance],
    );

    if (variant === "inline") {
        return (
            <div
                className={cn(
                    "flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground",
                    className,
                )}
            >
                <span className="font-normal">Credits remaining</span>
                {isLoading ? (
                    <Skeleton className="h-3 w-12" />
                ) : (
                    <span className="font-semibold text-foreground">{formattedBalance}</span>
                )}
                {isOutOfCredits && (
                    <RequestMoreCreditsButton
                        variant="link"
                        size="sm"
                        className="h-auto px-0 text-[11px]"
                    >
                        Request more credits
                    </RequestMoreCreditsButton>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-2xl border border-white/20 bg-white/60 p-4 text-sm shadow-lg shadow-black/5",
                "dark:border-white/10 dark:bg-neutral-900/60 supports-[backdrop-filter]:backdrop-blur",
                "supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50",
                className,
            )}
        >
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Credits remaining
            </div>
            {isLoading ? (
                <Skeleton className="mt-3 h-6 w-16" />
            ) : (
                <div className="mt-2 text-2xl font-semibold text-foreground">
                    {formattedBalance}
                </div>
            )}
            {isOutOfCredits && (
                <RequestMoreCreditsButton className="mt-4 w-full" />
            )}
        </div>
    );
};
