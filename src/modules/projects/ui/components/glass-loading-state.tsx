import { cn } from "@/lib/utils";

interface GlassLoadingStateProps {
    label: string;
    description?: string;
    className?: string;
    compact?: boolean;
}

export const GlassLoadingState = ({
    label,
    description,
    className,
    compact = false,
}: GlassLoadingStateProps) => {
    return (
        <div className={cn("flex w-full items-center justify-center", className)} role="status" aria-live="polite">
            <div
                className={cn(
                    "relative isolate overflow-hidden rounded-3xl border border-white/30 bg-white/70 px-6 py-6 text-center shadow-xl backdrop-blur-2xl transition dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/20",
                    compact ? "px-4 py-4" : "px-6 py-6",
                )}
            >
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/70 via-white/30 to-white/10 opacity-60 dark:from-white/10 dark:via-white/5 dark:to-transparent" />
                <div className="relative mx-auto flex flex-col items-center gap-3">
                    <span className="relative inline-flex h-12 w-12 items-center justify-center">
                        <span className="absolute inset-0 rounded-full border border-white/70 opacity-70 dark:border-white/15" />
                        <span className="absolute inset-1 rounded-full border border-white/80 opacity-50 dark:border-white/20" />
                        <span className="absolute inset-1.5 rounded-full border-t-2 border-b-2 border-primary/70 animate-spin" />
                        <span className="absolute inset-2 rounded-full bg-primary/20 blur-xl opacity-50 dark:bg-primary/25" />
                    </span>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    {description ? (
                        <p className="max-w-[18rem] text-xs text-muted-foreground/80">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
