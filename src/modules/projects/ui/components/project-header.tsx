import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    ChevronLeftIcon,
    ChevronDownIcon,
    SunIcon,
    MoonIcon,
    MonitorIcon,
} from "lucide-react";

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

const themeOptions = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "system", label: "System", icon: MonitorIcon },
] as const;

export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({ id: projectId })
    );
    const { theme, setTheme } = useTheme();
    const activeTheme = theme ?? "system";
    const ActiveIcon = themeOptions.find((option) => option.value === activeTheme)?.icon ?? SunIcon;

    return (
        <header className="relative overflow-hidden rounded-[28px] border border-white/30 bg-white/70 px-5 py-4 shadow-2xl backdrop-blur-2xl transition dark:border-white/10 dark:bg-neutral-900/60">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/70 via-white/20 to-transparent opacity-70 dark:from-white/10 dark:via-white/5" />
            <div className="pointer-events-none absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl dark:bg-primary/20" />
            <div className="relative flex flex-wrap items-center gap-4">
                <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="rounded-full border border-white/50 bg-white/60 px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100 dark:hover:bg-neutral-700/80"
                >
                    <Link href="/" className="flex items-center gap-2">
                        <ChevronLeftIcon className="size-4" />
                        <span>Back to dashboard</span>
                    </Link>
                </Button>
                <span className="hidden h-10 w-px bg-white/50 sm:block dark:bg-white/10" />
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/70 shadow-sm dark:border-white/10 dark:bg-neutral-800/70">
                        <Image
                            src="/logo.png"
                            alt="QAI"
                            width={32}
                            height={32}
                            className="rounded"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Project
                        </p>
                        <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                            {project.name}
                        </h1>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-full border border-white/50 bg-white/60 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-white/80 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100 dark:hover:bg-neutral-700/80"
                            >
                                <span className="flex items-center gap-2">
                                    <ActiveIcon className="size-4" />
                                    <span>Theme</span>
                                    <ChevronDownIcon className="size-3.5" />
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="w-48 rounded-2xl border border-white/40 bg-white/80 p-2 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/80"
                        >
                            <DropdownMenuRadioGroup
                                value={activeTheme}
                                onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
                            >
                                {themeOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <DropdownMenuRadioItem
                                            key={option.value}
                                            value={option.value}
                                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
                                        >
                                            <Icon className="size-4" />
                                            <span className="font-medium">
                                                {option.label}
                                            </span>
                                        </DropdownMenuRadioItem>
                                    );
                                })}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
