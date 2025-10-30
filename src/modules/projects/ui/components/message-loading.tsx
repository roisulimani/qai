import Image from "next/image";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { projectGlassBubbleClass } from "../styles";

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
        <span className="text-sm font-medium text-muted-foreground">
            {messages[currentMessageIndex]}
        </span>
    );
};

export const MessageLoading = () => {
    return (
        <div className="flex flex-col px-2 pb-6">
            <div className="mb-3 flex items-center gap-2 pl-2">
                <Image
                src="/logo.png"
                alt="QAI"
                width={30}
                height={30}
                className="shrink-0"
            />
                <span className="text-sm font-medium">
                    QAI
                </span>
            </div>
            <div className="pl-12 pr-3">
                <div
                    className={cn(
                        projectGlassBubbleClass,
                        "flex w-fit items-center gap-3 px-5 py-4 text-sm text-muted-foreground shadow-lg"
                    )}
                >
                    <span className="flex size-9 items-center justify-center rounded-full border border-white/40 bg-white/60 shadow-inner supports-[backdrop-filter]:backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/60">
                        <Spinner className="size-4" />
                    </span>
                    <ShimmerMessages />
                </div>
            </div>
        </div>
    );
};
