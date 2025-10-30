import { Card } from "@/components/ui/card";
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
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Card className="max-w-[80%] break-words rounded-2xl border border-white/30 bg-white/80 px-4 py-3 text-sm shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-100 dark:shadow-black/40">
                {content}
            </Card>
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
                "group/fragment flex w-fit items-start gap-3 rounded-2xl border border-white/30 bg-white/80 px-4 py-3 text-left text-sm shadow-sm shadow-black/5 transition hover:border-white/40 hover:bg-white/90 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-200 dark:shadow-black/40",
                isActiveFragment &&
                    "border-primary/60 bg-primary/90 text-primary-foreground shadow-primary/40 hover:border-primary/60 hover:bg-primary/90",
            )}
            onClick={() => onFragmentClick(fragment)}
        >
            <div
                className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-white/70 shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/70",
                    isActiveFragment && "border-transparent bg-primary/20 text-primary-foreground",
                )}
            >
                <Code2Icon className="size-4" />
            </div>
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">
                    {fragment.title}
                </span>
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Preview
                </span>
            </div>
            <div className="flex items-center justify-center pt-1">
                <ChevronRightIcon className="size-4 transition-transform duration-200 group-hover/fragment:translate-x-1" />
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
            "group flex flex-col px-2 pb-4",
            type === "ERROR" && "text-red-600 dark:text-red-400",
        )}>
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
                    <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        {format(createdAt, "HH:mm 'on' MMMM d, yyyy")}
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-y-4 rounded-3xl border border-white/30 bg-white/80 px-5 py-4 text-sm shadow-sm shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-100 dark:shadow-black/40">
                <span className="leading-relaxed">
                    {content}
                </span>
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
