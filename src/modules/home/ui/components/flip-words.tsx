"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type FlipWordsProps = {
    words: string[];
    interval?: number;
    className?: string;
};

export const FlipWords = ({ words, interval = 2600, className }: FlipWordsProps) => {
    const safeWords = useMemo(() => (words.length > 0 ? words : [""]), [words]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (safeWords.length <= 1) {
            return;
        }

        const id = window.setInterval(() => {
            setIndex((current) => {
                const nextIndex = current + 1;
                return nextIndex >= safeWords.length ? 0 : nextIndex;
            });
        }, interval);

        return () => window.clearInterval(id);
    }, [interval, safeWords.length]);

    return (
        <span className={cn("relative inline-flex h-[1.1em] overflow-hidden align-baseline", className)}>
            <span
                className="flex flex-col justify-start transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateY(-${index * 1.1}em)` }}
            >
                {safeWords.map((word) => (
                    <span key={word} className="text-balance whitespace-nowrap font-semibold leading-tight">
                        {word}
                    </span>
                ))}
            </span>
            <span className="pointer-events-none absolute inset-0 rounded-sm border border-white/10 bg-white/5 backdrop-blur-sm mix-blend-overlay" />
        </span>
    );
};

export default FlipWords;
