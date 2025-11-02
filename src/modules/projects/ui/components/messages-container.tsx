import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
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