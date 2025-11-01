import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./message-loading";
import { CreditBalanceIndicator } from "@/components/credit-balance-indicator";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
};

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {

    const trpc = useTRPC();
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastAssistantMessageIdRef = useRef<string | null>(null);

    const { data } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId }, {
            // TODO: Remove this once we have a real-time update
            refetchInterval: 5000,
        }
    ));

    const messages = data.messages;
    const conversationSummary = data.conversationSummary ?? null;

    const activeFragmentFilePaths = useMemo(() => {
        if (!activeFragment) {
            return [] as string[];
        }
        const { files } = activeFragment;
        if (!files || Array.isArray(files) || typeof files !== "object") {
            return [] as string[];
        }

        return Object.keys(files as Record<string, unknown>).sort();
    }, [activeFragment]);

    const activeSnapshotSummary = useMemo(() => {
        if (activeFragment?.summary && activeFragment.summary.length > 0) {
            return activeFragment.summary;
        }
        if (conversationSummary && conversationSummary.length > 0) {
            return conversationSummary;
        }
        return "";
    }, [activeFragment?.summary, conversationSummary]);

    useEffect(() => {
        const lastAssistantMessage = messages.findLast(
            (message) => message.role === "ASSISTANT"
        );
        if (lastAssistantMessage?.fragment &&
            lastAssistantMessage.id !== lastAssistantMessageIdRef.current
        ) {
            setActiveFragment(lastAssistantMessage.fragment);
            lastAssistantMessageIdRef.current = lastAssistantMessage.id;
        }
    }, [messages, setActiveFragment]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length]);

    const lastMessage = messages[messages.length - 1];
    const isLastMessageUserMessage = lastMessage?.role === "USER";

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                {activeFragment && (
                    <div className="px-3 pt-3">
                        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                            <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                                Active snapshot
                            </div>
                            <div className="mt-2 text-sm whitespace-pre-wrap">
                                {activeSnapshotSummary.length > 0 ? (
                                    activeSnapshotSummary
                                ) : (
                                    <span className="text-muted-foreground">No summary available for this snapshot.</span>
                                )}
                            </div>
                            {activeFragmentFilePaths.length > 0 && (
                                <div className="mt-3">
                                    <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                                        Files
                                    </div>
                                    <ul className="mt-1 grid gap-1 text-xs font-mono">
                                        {activeFragmentFilePaths.slice(0, 6).map((filePath) => (
                                            <li key={filePath} className="truncate">
                                                {filePath}
                                            </li>
                                        ))}
                                    </ul>
                                    {activeFragmentFilePaths.length > 6 && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            +{activeFragmentFilePaths.length - 6} more file{activeFragmentFilePaths.length - 6 === 1 ? "" : "s"}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="pt-2 pr-1">
                    {messages.map((message) => (
                        <MessageCard
                            key={message.id} 
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                            onFragmentClick={() => setActiveFragment(message.fragment)}
                            type={message.type}
                        />
                    ))}
                    {isLastMessageUserMessage && <MessageLoading />}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="relative px-3 pb-3 pt-2">
                <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background" />
                <div className="flex flex-col gap-3">
                    <MessageForm projectId={projectId} />
                    <div className="border-t border-border/60 pt-2">
                        <CreditBalanceIndicator variant="inline" />
                    </div>
                </div>
            </div>
        </div>
    );
};