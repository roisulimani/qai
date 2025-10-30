import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./message-loading";

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
};

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {

    const trpc = useTRPC();
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastAssistantMessageIdRef = useRef<string | null>(null);

    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId }, {
            // TODO: Remove this once we have a real-time update
            refetchInterval: 5000,
        }
    ));

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
        <div className="flex flex-1 min-h-0 flex-col rounded-[26px] border border-white/30 bg-white/75 shadow-xl shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/60">
            <div className="flex-1 overflow-y-auto px-5 py-6">
                <div className="space-y-6">
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
            <div className="relative px-5 pb-5 pt-0">
                <div className="pointer-events-none absolute inset-x-5 -top-10 h-10 bg-gradient-to-b from-transparent via-white/40 to-white/80 dark:via-neutral-900/40 dark:to-neutral-900/70" />
                <MessageForm projectId={projectId} />
            </div>
        </div>
    );
};