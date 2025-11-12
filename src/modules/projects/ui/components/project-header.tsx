import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    HomeIcon,
    Loader2,
    MoonIcon,
    PlayCircleIcon,
    SunMoonIcon,
    type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PROJECT_NAME_PLACEHOLDER } from "@/modules/projects/constants";
import { Badge } from "@/components/ui/badge";
import { SandboxLifecycleStatus } from "@/generated/prisma";


interface Props {
    projectId: string;
}
export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(
        trpc.projects.getOne.queryOptions(
            { id: projectId },
            {
                refetchInterval: (query) => {
                    const data = query.state.data;
                    if (!data) {
                        return false;
                    }

                    if (data.name === PROJECT_NAME_PLACEHOLDER) {
                        return 2000;
                    }

                    const sandboxState = data.sandboxes?.[0]?.status;
                    if (
                        sandboxState === SandboxLifecycleStatus.WARMING ||
                        sandboxState === SandboxLifecycleStatus.HIBERNATED
                    ) {
                        return 5000;
                    }

                    return false;
                },
            }
        )
    );
    const { theme, setTheme } = useTheme();

    const activeSandbox = project.sandboxes?.[0] ?? null;
    const sandboxStatus = activeSandbox?.status ?? SandboxLifecycleStatus.WARMING;
    const lastActiveLabel = activeSandbox?.lastActiveAt
        ? formatDistanceToNow(new Date(activeSandbox.lastActiveAt), { addSuffix: true })
        : null;

    const statusConfig: Record<
        SandboxLifecycleStatus,
        { label: string; variant: "default" | "secondary" | "outline"; icon: LucideIcon; iconClassName?: string; description: string }
    > = {
        [SandboxLifecycleStatus.WARMING]: {
            label: "Warming",
            variant: "secondary",
            icon: Loader2,
            iconClassName: "animate-spin",
            description: "Preparing environment…",
        },
        [SandboxLifecycleStatus.RUNNING]: {
            label: "Running",
            variant: "default",
            icon: PlayCircleIcon,
            description: lastActiveLabel ? `Last active ${lastActiveLabel}` : "Environment ready",
        },
        [SandboxLifecycleStatus.HIBERNATED]: {
            label: "Hibernated",
            variant: "outline",
            icon: MoonIcon,
            description: lastActiveLabel ? `Last active ${lastActiveLabel}` : "Environment sleeping",
        },
    };

    const { icon: StatusIcon, label: statusLabel, variant, iconClassName, description } =
        statusConfig[sandboxStatus];
    const cycleTheme = () => {
        const themeOptions = ["light", "dark", "system"] as const;
        const currentIndex = themeOptions.findIndex((option) => option === theme);
        const nextTheme =
            themeOptions[(currentIndex + 1 + themeOptions.length) % themeOptions.length];
        setTheme(nextTheme);
    };

    return (
        <header className="flex h-14 items-center justify-between border-b px-3">
            <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="QAI" width={30} height={30} />
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{project.name}</span>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={variant} className="gap-1">
                            <StatusIcon className={`size-3 ${iconClassName ?? ""}`} />
                            <span>{statusLabel}</span>
                        </Badge>
                        <span>{description}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Button asChild variant="ghost" size="icon" className="hover:bg-transparent">
                    <Link href="/" aria-label="Go to Home">
                        <HomeIcon className="size-4" />
                    </Link>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent"
                    onClick={cycleTheme}
                    aria-label="Toggle theme"
                >
                    <SunMoonIcon className="size-4" />
                </Button>
            </div>
        </header>
    );
}