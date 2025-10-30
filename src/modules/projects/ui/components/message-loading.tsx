import Image from "next/image";
import { useState, useEffect } from "react";

const ShimmerMessages = () => {
    const messages = [
        "Thinking...",
        "Loading...",
        "Analyzing your request...",
        "Generating plan...",
        "Building your website...",
        "Crafting components...",
        "Optimizing performance...",
        "Optimizing layout...",
        "Finalizing details...",
        "Preparing to deploy...",
        "Deploying your website...",
        "Almost done...",
    ]

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/30 bg-white/80 px-5 py-4 text-sm shadow-sm shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-200 dark:shadow-black/40">
            <span className="relative flex h-9 w-9 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
            </span>
            <span className="text-sm text-muted-foreground">
                {messages[currentMessageIndex]}
            </span>
        </div>
    );
};

export const MessageLoading = () => {
    return (
        <div className="flex flex-col px-2 pb-4">
            <div className="mb-3 flex items-center gap-3 pl-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/40 bg-white/80 shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/70">
                    <Image
                        src="/logo.png"
                        alt="QAI"
                        width={26}
                        height={26}
                        className="rounded-md"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold tracking-wide text-foreground">
                        QAI Assistant
                    </span>
                    <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        Responding
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-y-4">
                <ShimmerMessages />
            </div>
        </div>
    );
};