import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";
import { projectGlassBubbleClass } from "../styles";

interface UserMessageProps {
    content: string;
};

const UserMessage = ({ content }: UserMessageProps) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <div
                className={cn(
                    projectGlassBubbleClass,
                    "max-w-[75%] break-words px-4 py-3 text-sm leading-relaxed text-slate-900/90 shadow-lg dark:text-slate-100"
                )}
            >
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
                projectGlassBubbleClass,
                "group flex w-full items-start gap-3 border border-white/40 px-4 py-3 text-left text-sm text-foreground/90 transition hover:border-white/60 hover:bg-white/80 dark:border-white/10 dark:text-white/90 dark:hover:border-white/20 dark:hover:bg-neutral-900/70",
                isActiveFragment &&
                    "border-primary/70 bg-primary/90 text-primary-foreground shadow-[0_20px_90px_-45px_rgba(37,99,235,0.6)] hover:bg-primary/90 dark:border-primary/60"
            )}
            onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5" />
            <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium line-clamp-1">
                        {fragment.title}
                    </span>
                    <span className="text-sm">
                        Preview
                    </span>
                </div>
                <div className="flex items-center justify-center mt-0.5">
                    <ChevronRightIcon className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
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
        <div className="group flex flex-col px-2 pb-6">
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
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {format(createdAt, "HH:mm 'on' MMMM d, yyyy")}
                </span>
            </div>
            <div className="flex flex-col gap-4 pl-12 pr-3">
                <div
                    className={cn(
                        projectGlassBubbleClass,
                        "w-fit max-w-full px-5 py-4 text-sm leading-relaxed text-slate-900/90 shadow-lg transition dark:text-slate-100",
                        type === "ERROR" &&
                            "border-red-200/70 bg-red-50/80 text-red-700 shadow-[0_20px_90px_-50px_rgba(220,38,38,0.4)] dark:border-red-500/40 dark:bg-red-500/20 dark:text-red-200"
                    )}
                >
                    {content}
                </div>
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
