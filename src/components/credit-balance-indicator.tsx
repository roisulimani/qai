"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

type CreditBalanceIndicatorProps = {
  variant?: "card" | "inline";
  className?: string;
};

type IndicatorContentProps = {
  creditsRemaining: number;
  totalCreditsGranted: number;
  totalCreditsSpent: number;
  variant: "card" | "inline";
  className?: string;
};

const formatNumber = (value: number) => value.toLocaleString();

const InlineIndicatorContent = ({
  creditsRemaining,
  totalCreditsGranted,
  totalCreditsSpent,
  variant,
  className,
}: IndicatorContentProps) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground",
        variant === "inline" ? "text-xs" : "text-sm",
        className,
      )}
    >
      <span>
        <span className="font-medium text-foreground">
          {formatNumber(creditsRemaining)}
        </span>{" "}
        credits remaining
      </span>
      <span className="hidden text-muted-foreground/50 sm:inline">•</span>
      <span>
        Spent {" "}
        <span className="font-medium text-foreground">
          {formatNumber(totalCreditsSpent)}
        </span>
      </span>
      <span className="hidden text-muted-foreground/50 sm:inline">•</span>
      <span>
        Granted {" "}
        <span className="font-medium text-foreground">
          {formatNumber(totalCreditsGranted)}
        </span>
      </span>
    </div>
  );
};

const CreditBalanceIndicatorSkeleton = ({
  variant,
  className,
}: {
  variant: "card" | "inline";
  className?: string;
}) => {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          className,
        )}
      >
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-white/20 bg-white/60 p-4 shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/60 dark:supports-[backdrop-filter]:bg-neutral-900/50",
        className,
      )}
    >
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
};

export const CreditBalanceIndicator = ({
  variant = "card",
  className,
}: CreditBalanceIndicatorProps) => {
  const trpc = useTRPC();
  const query = trpc.companies.getCurrent.queryOptions(undefined, {
    staleTime: 15_000,
  });
  const { data, isLoading } = useQuery(query);

  if (isLoading) {
    return (
      <CreditBalanceIndicatorSkeleton
        variant={variant}
        className={className}
      />
    );
  }

  if (!data) {
    return null;
  }

  if (variant === "inline") {
    return (
      <InlineIndicatorContent
        variant={variant}
        creditsRemaining={data.creditBalance}
        totalCreditsGranted={data.totalCreditsGranted}
        totalCreditsSpent={data.totalCreditsSpent}
        className={cn("text-xs text-muted-foreground", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-white/20 bg-white/60 p-4 sm:p-6 shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:supports-[backdrop-filter]:bg-neutral-900/50",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Credits overview
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Credits remaining
            </p>
            <p className="text-3xl font-semibold">
              {formatNumber(data.creditBalance)}
            </p>
          </div>
          <InlineIndicatorContent
            variant={variant}
            creditsRemaining={data.creditBalance}
            totalCreditsGranted={data.totalCreditsGranted}
            totalCreditsSpent={data.totalCreditsSpent}
            className="justify-end sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

CreditBalanceIndicator.displayName = "CreditBalanceIndicator";

