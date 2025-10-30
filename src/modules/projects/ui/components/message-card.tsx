import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";

interface UserMessageProps {
    content: string;
};

const UserMessage = ({ content }: UserMessageProps) => {
    return (
        <div className="flex justify-end pl-12">
            <div className="max-w-[80%] rounded-3xl border border-white/50 bg-white/80 px-4 py-3 text-sm leading-relaxed shadow-lg shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-800/70">
                {content}
            </div>
        </div>
    );
};

interface FragmentCardProps {
    fragment: Fragment;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
};

const FragmentCard = ({
    fragment,
    isActiveFragment,
    onFragmentClick
}: FragmentCardProps) => {
    return (
        <button
            className={cn(
                "group/button flex w-full items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-50",
                isActiveFragment && "border-primary/60 bg-primary/90 text-primary-foreground shadow-md",
            )}
            onClick={() => onFragmentClick(fragment)}
        >
            <span className="inline-flex size-8 items-center justify-center rounded-full border border-white/50 bg-white/70 shadow-sm dark:border-white/10 dark:bg-neutral-800/70">
                <Code2Icon className="size-4" />
            </span>
            <div className="flex flex-1 flex-col text-sm">
                <span className="line-clamp-1 font-semibold">
                    {fragment.title}
                </span>
                <span className="text-xs text-muted-foreground">
                    View generated preview
                </span>
            </div>
            <div className="flex items-center justify-center text-muted-foreground">
                <ChevronRightIcon className="size-4 transition-transform duration-200 group-hover/button:translate-x-1" />
            </div>
        </button>
    );
};

interface AssistantMessageProps {
    content: string;
    fragment: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
};

const AssistantMessage = ({
    content,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type
}: AssistantMessageProps) => {
    return (
        <div className={cn(
            "group flex flex-col gap-3",
            type === "ERROR" && "text-red-700 dark:text-red-400",
        )}>
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
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {format(createdAt, "HH:mm 'on' MMMM d, yyyy")}
                </span>
            </div>
            <div
                className={cn(
                    "ml-14 flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/85 px-5 py-4 text-sm leading-relaxed shadow-lg shadow-black/10 backdrop-blur-xl transition hover:shadow-xl dark:border-white/10 dark:bg-neutral-900/65",
                    type === "ERROR" && "border-red-200/60 bg-red-50/80 text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200",
                )}
            >
                <span>{content}</span>
                {fragment && type === "RESULT" && (
                    <FragmentCard
                        fragment={fragment}
                        isActiveFragment={isActiveFragment}
                        onFragmentClick={onFragmentClick}
                    />
                )}
            </div>
        </div>
    );
};

interface MessageCardProps {
    content: string;
    role: MessageRole;
    fragment: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
}

export const MessageCard = ({
    content,
    role,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type
}: MessageCardProps) => {
    if (role === "ASSISTANT") {
        return (
            <AssistantMessage
                content={content}
                fragment={fragment}
                createdAt={createdAt}
                isActiveFragment={isActiveFragment}
                onFragmentClick={onFragmentClick}
                type={type}
            />
        );
    }
    return (
        <UserMessage
            content={content}
        />
    );
};
