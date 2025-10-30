import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    ChevronLeftIcon,
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
import { cn } from "@/lib/utils";
import { projectGlassPanelClass } from "../styles";


interface Props {
    projectId: string;
}
export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({ id: projectId })
    );
    const { theme, setTheme } = useTheme();
    return (
        <header>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Button
                    asChild
                    size="sm"
                    className="rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-white/80 dark:border-white/10 dark:bg-neutral-900/70 dark:text-white dark:hover:bg-neutral-900"
                >
                    <Link href="/">
                        <ChevronLeftIcon className="mr-2 size-4" />
                        Back to dashboard
                    </Link>
                </Button>
                <div
                    className={cn(projectGlassPanelClass, "flex flex-1 items-center gap-4 px-5 py-4")}
                >
                    <div className="flex size-12 items-center justify-center rounded-full border border-white/40 bg-white/60 shadow-inner supports-[backdrop-filter]:backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/70">
                        <Image
                            src="/logo.png"
                            alt="QAI"
                            width={28}
                            height={28}
                            className="rounded"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Project Workspace</p>
                        <h1 className="truncate text-lg font-semibold md:text-xl">
                            {project.name}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                        </p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                    "rounded-full border border-white/30 bg-white/50 text-sm font-medium text-foreground shadow-sm transition hover:bg-white/70 dark:border-white/10 dark:bg-neutral-900/70 dark:hover:bg-neutral-900",
                                    "focus-visible:ring-0 focus-visible:ring-offset-0"
                                )}
                                aria-label="Toggle theme"
                            >
                                <SunMoonIcon className="size-4" />
                                <span className="ml-2 hidden sm:inline">Theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} className="min-w-[160px]">
                            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
                                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>

    );
}
