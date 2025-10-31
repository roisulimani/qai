import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HomeIcon, SunMoonIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


interface Props {
    projectId: string;
}
export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({ id: projectId })
    );
    const { theme, setTheme } = useTheme();
    const cycleTheme = () => {
        const themeOptions = ["light", "dark", "system"] as const;
        const currentIndex = themeOptions.findIndex((option) => option === theme);
        const nextTheme =
            themeOptions[(currentIndex + 1 + themeOptions.length) % themeOptions.length];
        setTheme(nextTheme);
    };

    return (
        <header className="p-2 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="QAI" width={30} height={30} />
                <span className="text-sm font-medium">{project.name}</span>
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