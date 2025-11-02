"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
    blur?: number;
}

export const AuroraBackground = React.forwardRef<HTMLDivElement, AuroraBackgroundProps>(
    ({ className, children, blur = 120, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                    <div
                        className="absolute -left-1/3 top-[-10%] h-[60vh] w-[60vh] animate-[spin_28s_linear_infinite] rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.28)_0%,_transparent_60%)]"
                        style={{ filter: `blur(${blur}px)` }}
                    />
                    <div
                        className="absolute right-[-20%] top-1/3 h-[55vh] w-[55vh] animate-[spin_34s_linear_infinite_reverse] rounded-full bg-[radial-gradient(circle,_rgba(192,132,252,0.22)_0%,_transparent_65%)]"
                        style={{ filter: `blur(${blur * 0.7}px)` }}
                    />
                    <div
                        className="absolute bottom-[-15%] left-1/2 h-[50vh] w-[50vh] -translate-x-1/2 animate-[spin_36s_linear_infinite] rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.18)_0%,_transparent_70%)]"
                        style={{ filter: `blur(${blur * 0.8}px)` }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.66),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.55),_transparent_65%)]" />
                </div>
                <div className="relative z-10">{children}</div>
            </div>
        );
    },
);
AuroraBackground.displayName = "AuroraBackground";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    spotlightClassName?: string;
}

export const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
    ({ className, children, spotlightClassName, ...props }, ref) => {
        const [spotlightStyle, setSpotlightStyle] = React.useState<React.CSSProperties>({ opacity: 0 });

        const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            const element = event.currentTarget;
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            setSpotlightStyle({
                opacity: 1,
                background: `radial-gradient(500px circle at ${x}px ${y}px, rgba(255,255,255,0.32), transparent 70%)`,
            });
        }, []);

        const handleMouseLeave = React.useCallback(() => {
            setSpotlightStyle({ opacity: 0, transition: "opacity 0.4s ease" });
        }, []);

        return (
            <div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "group relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/30",
                    className,
                )}
                {...props}
            >
                <div
                    className={cn("pointer-events-none absolute inset-0 transition-opacity duration-300", spotlightClassName)}
                    style={spotlightStyle}
                    aria-hidden
                />
                <div className="relative z-10 flex flex-col gap-3">{children}</div>
            </div>
        );
    },
);
SpotlightCard.displayName = "SpotlightCard";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
    pauseOnHover?: boolean;
    repeat?: number;
    duration?: number;
}

export const Marquee = ({
    className,
    children,
    pauseOnHover = true,
    repeat = 2,
    duration = 28,
    ...props
}: MarqueeProps) => {
    const trackRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!pauseOnHover) return;
        const track = trackRef.current;
        if (!track) return;
        const handleMouseEnter = () => track.style.animationPlayState = "paused";
        const handleMouseLeave = () => track.style.animationPlayState = "running";
        track.addEventListener("mouseenter", handleMouseEnter);
        track.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            track.removeEventListener("mouseenter", handleMouseEnter);
            track.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [pauseOnHover]);

    const content = React.Children.toArray(children);
    const clones = Array.from({ length: Math.max(repeat, 1) }, () => content);

    return (
        <div className={cn("relative overflow-hidden", className)} {...props}>
            <div
                ref={trackRef}
                className="flex w-max animate-marquee items-center gap-12 whitespace-nowrap"
                style={{ animationDuration: `${duration}s` }}
            >
                {clones.flat().map((child, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
};

Marquee.displayName = "Marquee";
