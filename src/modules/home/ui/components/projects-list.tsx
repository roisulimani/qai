"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";

const formatPossessive = (name: string) => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return "Your";
    }

    const needsEs = /s$/i.test(trimmed);
    return needsEs ? `${trimmed}'` : `${trimmed}'s`;
};

export const ProjectsList = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [projectPendingDeletion, setProjectPendingDeletion] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { data: projects, isLoading: isLoadingProjects } = useQuery(
        trpc.projects.getMany.queryOptions(),
    );
    const { data: company } = useQuery(trpc.companies.getCurrent.queryOptions());

    const deleteProject = useMutation(
        trpc.projects.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
                queryClient.invalidateQueries(trpc.projects.getOverview.queryOptions());
                toast.success("Project deleted successfully");
                setIsConfirmOpen(false);
                setProjectPendingDeletion(null);
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const handleDeleteClick = (projectId: string, projectName: string) => (
        event: MouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
        event.stopPropagation();

        setProjectPendingDeletion({ id: projectId, name: projectName });
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!projectPendingDeletion) {
            return;
        }

        await deleteProject.mutateAsync({ id: projectPendingDeletion.id });
    };

    const handleDialogOpenChange = (open: boolean) => {
        if (!open && !deleteProject.isPending) {
            setProjectPendingDeletion(null);
        }

        setIsConfirmOpen(open);
    };

    const projectCountLabel = isLoadingProjects
        ? "Loading projects..."
        : `${projects?.length ?? 0} ${(projects?.length ?? 0) === 1 ? "project" : "projects"}`;

    return (
        <div className="w-full rounded-2xl border border-white/20 dark:border-white/10 p-8 flex flex-col gap-y-6 sm:gap-y-4 bg-white/60 dark:bg-neutral-900/60 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 shadow-lg shadow-black/5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold">
                    {company ? `${formatPossessive(company.name)} projects` : "Your projects"}
                </h2>
                <p className="text-sm text-muted-foreground">{projectCountLabel}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {!isLoadingProjects && (projects?.length ?? 0) === 0 && (
                    <div className="col-span-full text-center">
                        <p className="text-sm text-muted-foreground">No projects yet</p>
                    </div>
                )}
                {projects?.map((project) => (
                    <div key={project.id} className="relative group">
                        <Button
                            variant="outline"
                            className="font-normal h-auto justify-start w-full text-start rounded-2xl border-white/25 bg-white/60 p-4 pb-14 pr-5 text-base shadow-lg shadow-black/5 transition-colors hover:bg-white/70 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/70 dark:hover:bg-neutral-900 dark:supports-[backdrop-filter]:bg-neutral-900/60"
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
                                        <h3 className="truncate font-medium">{project.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className={cn(
                                "absolute bottom-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/65 text-destructive opacity-0 shadow-md shadow-black/10 transition-all duration-200 hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-destructive/30 group-hover:opacity-100 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/70",
                                projectPendingDeletion?.id === project.id
                                    ? "opacity-100"
                                    : "translate-y-2 group-hover:translate-y-0",
                            )}
                            onClick={handleDeleteClick(project.id, project.name)}
                            disabled={deleteProject.isPending}
                            aria-label={`Delete ${project.name}`}
                        >
                            <Trash2Icon className="size-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={handleDialogOpenChange}
                title="Delete project"
                description={
                    projectPendingDeletion
                        ? `Are you sure you want to delete "${projectPendingDeletion.name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this project? This action cannot be undone."
                }
                confirmLabel="Delete project"
                cancelLabel="Keep project"
                isLoading={deleteProject.isPending}
                tone="destructive"
                icon={<Trash2Icon className="size-5" />}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};
