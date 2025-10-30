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
        <div className="flex flex-1 flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 pt-4">
                <div className="space-y-4">
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
            <div className="relative px-4 pb-4">
                <div className="pointer-events-none absolute -top-6 left-4 right-4 h-12 rounded-full bg-gradient-to-b from-transparent via-white/60 to-white/80 dark:via-neutral-900/30 dark:to-neutral-950/70" />
                <MessageForm projectId={projectId} />
            </div>
        </div>
    );
};