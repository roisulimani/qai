"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MouseEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";

const formatPossessive = (name: string) => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return "Your";
    }

    const needsEs = /s$/i.test(trimmed);
    return needsEs ? `${trimmed}'` : `${trimmed}'s`;
};

const formatProjectName = (name: string) => {
    const words = name.trim().split(/\s+/);

    if (words.length <= 4) {
        return name.trim();
    }

    return `${words.slice(0, 4).join(" ")}...`;
};

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        createdAt: Date;
        isFavorite: boolean;
    };
    onDelete: (projectId: string) => void;
    onToggleFavorite: (projectId: string, nextValue: boolean) => void;
    isDeleting: boolean;
    isUpdatingFavorite: boolean;
}

const ProjectCard = ({ project, onDelete, onToggleFavorite, isDeleting, isUpdatingFavorite }: ProjectCardProps) => {
    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete(project.id);
    };

    const handleToggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleFavorite(project.id, !project.isFavorite);
    };

    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between rounded-2xl border border-white/20 bg-white/70 p-4 shadow-md shadow-black/5 transition-all",
                "hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900/70",
                "supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60",
                "dark:supports-[backdrop-filter]:bg-neutral-900/60",
                (isDeleting || isUpdatingFavorite) && "opacity-70",
            )}
        >
            <Link href={`/projects/${project.id}`} className="flex h-full items-center gap-x-4">
                <Image src="/logo.png" alt="QAI" width={32} height={32} className="object-contain" />
                <div className="flex flex-col">
                    <h3 className="font-medium text-foreground" title={project.name}>
                        {formatProjectName(project.name)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                    </p>
                </div>
            </Link>

            <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    aria-label={project.isFavorite ? "Remove from favourites" : "Add to favourites"}
                    disabled={isUpdatingFavorite}
                    className={cn(
                        "pointer-events-auto flex size-8 items-center justify-center rounded-full border border-white/40 bg-white/80 text-neutral-600 shadow-sm transition",
                        "hover:bg-white dark:border-white/20 dark:bg-neutral-800/80 dark:text-neutral-200",
                        isUpdatingFavorite && "cursor-progress",
                    )}
                >
                    {isUpdatingFavorite ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Star
                            className={cn("size-4", project.isFavorite ? "fill-amber-400 text-amber-400" : "text-neutral-500 dark:text-neutral-300")}
                        />
                    )}
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    aria-label="Delete project"
                    disabled={isDeleting}
                    className={cn(
                        "pointer-events-auto flex size-8 items-center justify-center rounded-full border border-white/40 bg-white/80 text-neutral-600 shadow-sm transition",
                        "hover:bg-white dark:border-white/20 dark:bg-neutral-800/80 dark:text-neutral-200",
                        isDeleting && "cursor-progress",
                    )}
                >
                    {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </button>
            </div>
        </div>
    );
};

export const ProjectsList = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data: projects, isLoading: isLoadingProjects } = useQuery(
        trpc.projects.getMany.queryOptions(),
    );
    const { data: company } = useQuery(trpc.companies.getCurrent.queryOptions());

    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
    const [updatingFavoriteId, setUpdatingFavoriteId] = useState<string | null>(null);

    const deleteProject = useMutation(
        trpc.projects.delete.mutationOptions({
            onMutate: async ({ id }) => {
                setDeletingProjectId(id);
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
                router.refresh();
                toast.success("Project deleted");
            },
            onError: (error) => {
                toast.error(error.message);
            },
            onSettled: () => {
                setDeletingProjectId(null);
            },
        }),
    );

    const toggleFavorite = useMutation(
        trpc.projects.setFavorite.mutationOptions({
            onMutate: async ({ id }) => {
                setUpdatingFavoriteId(id);
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
                toast.success("Favourites updated");
            },
            onError: (error) => {
                toast.error(error.message);
            },
            onSettled: () => {
                setUpdatingFavoriteId(null);
            },
        }),
    );

    const favoriteProjects = useMemo(
        () => projects?.filter((project) => project.isFavorite) ?? [],
        [projects],
    );

    const otherProjects = useMemo(() => {
        if (!projects) {
            return [];
        }

        return projects.filter((project) => !project.isFavorite);
    }, [projects]);

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
            <div className="space-y-10">
                {favoriteProjects.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Favourites
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {favoriteProjects.length} {favoriteProjects.length === 1 ? "project" : "projects"}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {favoriteProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onDelete={(id) => {
                                        if (deletingProjectId || deleteProject.isPending) return;
                                        if (confirm("Are you sure you want to delete this project?")) {
                                            deleteProject.mutate({ id });
                                        }
                                    }}
                                    onToggleFavorite={(id, nextValue) => {
                                        if (toggleFavorite.isPending) return;
                                        toggleFavorite.mutate({ id, isFavorite: nextValue });
                                    }}
                                    isDeleting={deletingProjectId === project.id && deleteProject.isPending}
                                    isUpdatingFavorite={updatingFavoriteId === project.id && toggleFavorite.isPending}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {favoriteProjects.length > 0 ? "All projects" : "Projects"}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                            {otherProjects.length} {otherProjects.length === 1 ? "project" : "projects"}
                        </span>
                    </div>
                    {(!isLoadingProjects && (projects?.length ?? 0) === 0) ? (
                        <div className="rounded-2xl border border-dashed border-white/30 bg-white/40 p-6 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-neutral-900/40">
                            No projects yet
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {otherProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onDelete={(id) => {
                                        if (deletingProjectId || deleteProject.isPending) return;
                                        if (confirm("Are you sure you want to delete this project?")) {
                                            deleteProject.mutate({ id });
                                        }
                                    }}
                                    onToggleFavorite={(id, nextValue) => {
                                        if (toggleFavorite.isPending) return;
                                        toggleFavorite.mutate({ id, isFavorite: nextValue });
                                    }}
                                    isDeleting={deletingProjectId === project.id && deleteProject.isPending}
                                    isUpdatingFavorite={updatingFavoriteId === project.id && toggleFavorite.isPending}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};