"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, PauseCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type {
    AgentAction,
    AgentActionStatus,
    AgentArtifact,
    AgentArtifactType,
} from "@/generated/prisma";
import type {
    PlanArtifact,
    PlanTaskStatus,
    ReviewArtifact,
    ReviewChecklistItem,
} from "@/modules/agent/types";

interface MessageLoadingProps {
    projectId: string;
}

export const MessageLoading = ({ projectId }: MessageLoadingProps) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(
        trpc.projects.getAgentActions.queryOptions(
            { projectId },
            {
                refetchInterval: 1000,
            },
        ),
    );

    const orderedActions = useMemo(() => {
        const actions = data.actions ?? [];
        const inProgress = actions.filter((action) => action.status === "IN_PROGRESS");
        const failed = actions.filter((action) => action.status === "FAILED");
        const completed = actions.filter((action) => action.status === "COMPLETED");
        return [...inProgress, ...failed, ...completed];
    }, [data.actions]);

    const latestPlan = useMemo(() => selectLatestPlan(data.artifacts), [data.artifacts]);
    const latestReview = useMemo(
        () => selectLatestReview(data.artifacts),
        [data.artifacts],
    );

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
                {latestPlan ? <PlanOverview plan={latestPlan} /> : null}
                {latestReview ? <ReviewOverview review={latestReview} /> : null}
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

const PLAN_STATUS_LABELS: Record<PlanTaskStatus, string> = {
    pending: "Pending",
    in_progress: "In progress",
    completed: "Completed",
};

const PLAN_STATUS_STYLES: Record<PlanTaskStatus, string> = {
    pending: "text-muted-foreground",
    in_progress: "text-primary",
    completed: "text-emerald-600 dark:text-emerald-500",
};

const REVIEW_STATUS_COLORS: Record<ReviewChecklistItem["status"], string> = {
    pass: "text-emerald-600 dark:text-emerald-500",
    warn: "text-amber-600",
    fail: "text-destructive",
};

const REVIEW_STATUS_ICONS: Record<ReviewChecklistItem["status"], JSX.Element> = {
    pass: <CheckCircle2 className="h-4 w-4" aria-hidden />, 
    warn: <PauseCircle className="h-4 w-4" aria-hidden />, 
    fail: <AlertCircle className="h-4 w-4" aria-hidden />,
};

const PlanOverview = ({ plan }: { plan: PlanArtifact }) => {
    return (
        <div className="rounded-md border border-border/60 bg-muted/30 p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Execution plan
            </span>
            <p className="mt-2 text-sm text-foreground">{plan.summary}</p>
            <ul className="mt-3 space-y-2">
                {plan.tasks.map((task) => (
                    <li key={task.id} className="rounded bg-background/60 p-2 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">
                                {task.title}
                            </span>
                            <span
                                className={cn(
                                    "text-xs font-semibold uppercase",
                                    PLAN_STATUS_STYLES[task.status],
                                )}
                            >
                                {PLAN_STATUS_LABELS[task.status]}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {task.description}
                        </p>
                        {task.dependencies?.length ? (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Depends on: {task.dependencies.join(", ")}
                            </p>
                        ) : null}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ReviewOverview = ({ review }: { review: ReviewArtifact }) => {
    const statusClassName =
        review.status === "approved" ? "text-emerald-600 dark:text-emerald-500" : "text-amber-600";

    return (
        <div className="rounded-md border border-border/60 bg-muted/30 p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                UX review
            </span>
            <p className={cn("mt-2 text-sm", statusClassName)}>{review.summary}</p>
            <div className="mt-3 space-y-2">
                {review.checklist.map((item) => (
                    <div key={`${item.aspect}-${item.status}`} className="flex items-start gap-2">
                        <span className={cn(REVIEW_STATUS_COLORS[item.status], "mt-0.5")}>{
                            REVIEW_STATUS_ICONS[item.status]
                        }</span>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground capitalize">
                                {item.aspect.replace(/_/g, " ")}
                            </span>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.notes}</p>
                            {item.recommendation ? (
                                <p className="text-xs text-muted-foreground italic mt-1">
                                    Recommendation: {item.recommendation}
                                </p>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
            {review.actionItems?.length ? (
                <div className="mt-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Action items
                    </span>
                    <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground space-y-1">
                        {review.actionItems.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
};

function selectLatestPlan(artifacts?: AgentArtifact[]) {
    if (!artifacts?.length) {
        return null;
    }
    const planArtifacts = artifacts.filter(
        (artifact) => artifact.type === AgentArtifactType.PLAN,
    );
    const latest = planArtifacts[planArtifacts.length - 1];
    if (!latest) {
        return null;
    }
    return isPlanArtifact(latest.data) ? latest.data : null;
}

function selectLatestReview(artifacts?: AgentArtifact[]) {
    if (!artifacts?.length) {
        return null;
    }
    const reviewArtifacts = artifacts.filter(
        (artifact) => artifact.type === AgentArtifactType.REVIEW,
    );
    const latest = reviewArtifacts[reviewArtifacts.length - 1];
    if (!latest) {
        return null;
    }
    return isReviewArtifact(latest.data) ? latest.data : null;
}

function isPlanArtifact(value: AgentArtifact["data"]): value is PlanArtifact {
    if (!value || typeof value !== "object") {
        return false;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.summary !== "string" || !Array.isArray(record.tasks)) {
        return false;
    }
    return record.tasks.every((task) => {
        if (!task || typeof task !== "object") {
            return false;
        }
        const t = task as Record<string, unknown>;
        return (
            typeof t.id === "string" &&
            typeof t.title === "string" &&
            typeof t.description === "string" &&
            typeof t.status === "string"
        );
    });
}

function isReviewArtifact(value: AgentArtifact["data"]): value is ReviewArtifact {
    if (!value || typeof value !== "object") {
        return false;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.status !== "string" || typeof record.summary !== "string") {
        return false;
    }
    if (!Array.isArray(record.checklist)) {
        return false;
    }
    return record.checklist.every((item) => {
        if (!item || typeof item !== "object") {
            return false;
        }
        const entry = item as Record<string, unknown>;
        return (
            typeof entry.aspect === "string" &&
            typeof entry.status === "string" &&
            typeof entry.notes === "string"
        );
    });
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

