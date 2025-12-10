import Image from "next/image";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AgentAction, AgentActionStatus } from "@/generated/prisma";

interface MessageLoadingProps {
    actions: AgentAction[];
}

export const MessageLoading = ({ actions }: MessageLoadingProps) => {
    const inProgress = actions.filter((action) => action.status === "IN_PROGRESS");
    const failed = actions.filter((action) => action.status === "FAILED");
    const completed = actions.filter((action) => action.status === "COMPLETED");
    const orderedActions = [...inProgress, ...failed, ...completed];

    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
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
            <div className="pl-8.5 flex flex-col gap-y-4">
                {orderedActions.length > 0 ? (
                    orderedActions.map((action) => (
                        <ActionRow key={action.id} action={action} />
                    ))
                ) : (
                    <PlaceholderRow />
                )}
            </div>
        </div>
    );
};

const PlaceholderRow = () => (
    <div className="flex items-start gap-3 text-sm text-muted-foreground">
        <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" />
        <span>Preparing agent workspace…</span>
    </div>
);

interface ActionRowProps {
    action: AgentAction;
}

const ActionRow = ({ action }: ActionRowProps) => {
    const icon = getStatusIcon(action.status);

    return (
        <div className="flex items-start gap-3">
            {icon}
            <div className="flex flex-col gap-1">
                <span className={cn(
                    "text-sm font-medium",
                    getLabelClassName(action.status),
                )}>
                    {action.label}
                </span>
                {action.detail ? (
                    <span className={cn(
                        "text-xs leading-relaxed break-words",
                        action.status === "FAILED"
                            ? "text-destructive"
                            : "text-muted-foreground",
                    )}>
                        {action.detail}
                    </span>
                ) : null}
            </div>
        </div>
    );
};

function getStatusIcon(status: AgentActionStatus) {
    const baseClasses = "mt-0.5 h-4 w-4";

    switch (status) {
        case "FAILED":
            return <AlertCircle className={cn(baseClasses, "text-destructive")} />;
        case "COMPLETED":
            return <CheckCircle2 className={cn(baseClasses, "text-emerald-500")} />;
        case "IN_PROGRESS":
        default:
            return <Loader2 className={cn(baseClasses, "text-primary animate-spin")} />;
    }
}

function getLabelClassName(status: AgentActionStatus) {
    switch (status) {
        case "FAILED":
            return "text-destructive";
        case "COMPLETED":
            return "text-muted-foreground";
        case "IN_PROGRESS":
        default:
            return "text-foreground";
    }
}

