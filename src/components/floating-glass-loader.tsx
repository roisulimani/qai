"use client";

import { cn } from "@/lib/utils";

interface FloatingGlassLoaderProps {
    label?: string;
    description?: string;
    className?: string;
}

export const FloatingGlassLoader = ({
    label = "Loading",
    description,
    className,
}: FloatingGlassLoaderProps) => {
    return (
        <div className={cn("flex h-full w-full items-center justify-center", className)}>
            <div
                className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/70 px-8 py-6 text-center shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-lg supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/60"
            >
                <div className="pointer-events-none absolute -inset-16 -z-10 bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-70 blur-3xl" />
                <div className="flex flex-col items-center gap-3">
                    <span className="relative flex h-10 w-10 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 dark:bg-primary/30" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.65)]" />
                    </span>
                    <p className="text-sm font-semibold tracking-wide text-foreground/90">
                        {label}
                    </p>
                    {description && (
                        <p className="max-w-[16rem] text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
