import Image from "next/image";
import { useState, useEffect } from "react";

const ShimmerMessages = () => {
    const messages = [
        "Thinking through the next steps...",
        "Sketching your interface...",
        "Pairing the right components...",
        "Polishing the layout...",
        "Fine-tuning animations...",
        "Optimizing performance...",
        "Preparing your preview...",
        "Almost ready to share...",
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex items-center gap-3">
            <span className="relative inline-flex h-10 w-10 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
                {messages[currentMessageIndex]}
            </span>
        </div>
    );
};

export const MessageLoading = () => {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 pl-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/40 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/70">
                    <Image
                        src="/logo.png"
                        alt="QAI"
                        width={28}
                        height={28}
                        className="rounded"
                    />
                </span>
                <span className="text-sm font-semibold">QAI</span>
            </div>
            <div className="ml-14 rounded-3xl border border-white/40 bg-white/85 px-5 py-4 shadow-lg shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/65">
                <ShimmerMessages />
            </div>
        </div>
    );
};
