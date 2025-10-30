import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    ChevronLeftIcon,
    ChevronDownIcon,
    SunMoonIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
    projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({ id: projectId })
    );
    const { theme, setTheme } = useTheme();

    const createdAtLabel = project.createdAt
        ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
        : null;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition shadow-sm shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/55 hover:border-white/40 hover:text-foreground dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-300 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/60"
                >
                    <ChevronLeftIcon className="size-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to dashboard</span>
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/70 px-4 py-2 text-xs font-semibold text-foreground shadow-sm shadow-black/10 transition hover:border-white/40 hover:bg-white/80 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-100 dark:shadow-black/30 dark:hover:border-white/20 dark:hover:bg-neutral-900/60"
                        >
                            <SunMoonIcon className="size-4" />
                            <span>Theme</span>
                            <ChevronDownIcon className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-2xl border border-white/30 bg-white/80 p-2 text-sm shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-lg supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/70"
                    >
                        <DropdownMenuRadioGroup
                            value={theme ?? "system"}
                            onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                        >
                            <DropdownMenuRadioItem value="light" className="rounded-xl px-3 py-2">
                                Light
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark" className="rounded-xl px-3 py-2">
                                Dark
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system" className="rounded-xl px-3 py-2">
                                System
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/70 shadow-sm shadow-black/5 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/70">
                    <Image
                        src="/logo.png"
                        alt="QAI"
                        width={32}
                        height={32}
                        className="rounded-md"
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Project Workspace
                    </p>
                    <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        {project.name}
                    </h1>
                    {createdAtLabel && (
                        <p className="text-sm text-muted-foreground">
                            Started {createdAtLabel}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};