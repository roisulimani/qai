"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

export const ProjectsList = () => {
    const trpc = useTRPC();
    const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

    return (
        <div className="w-full rounded-2xl border border-white/20 dark:border-white/10 p-8 flex flex-col gap-y-6 sm:gap-y-4 bg-white/60 dark:bg-neutral-900/60 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 shadow-lg shadow-black/5">
            <h2 className="text-2xl font-semibold">
                Your Projects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {projects?.length === 0 && (
                    <div className="col-span-full text-center">
                        <p className="text-sm text-muted-foreground">
                            No projects yet
                        </p>
                    </div>
                )}
                {projects?.map((project) => (
                    <Button
                    key={project.id}
                    variant="outline"
                    className="font-normal h-auto justify-start w-full text-start p-4"
                    asChild
                    >
                        <Link href={`/projects/${project.id}`}>
                            <div className="flex items-center gap-x-4">
                                <Image 
                                src="/logo.png" 
                                alt="QAI" 
                                width={32} 
                                height={32} 
                                className="object-contain"
                                />
                                <div className="flex flex-col">
                                    <h3 className="truncate font-medium">
                                        {project.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </Button>
                ))}
            </div>

        </div>
    )
}