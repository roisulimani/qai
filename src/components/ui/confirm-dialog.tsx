"use client";

import { type ReactNode } from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./dialog";

export type ConfirmDialogTone = "default" | "destructive";

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
    tone?: ConfirmDialogTone;
    icon?: ReactNode;
    onConfirm: () => void;
}

const toneIconClasses: Record<ConfirmDialogTone, string> = {
    default:
        "border-white/40 bg-white/70 text-primary shadow-white/50 dark:border-white/10 dark:bg-neutral-800/70 dark:text-primary",
    destructive:
        "border-white/30 bg-white/65 text-destructive shadow-white/40 dark:border-white/10 dark:bg-neutral-800/70",
};

const toneConfirmVariant: Record<ConfirmDialogTone, "default" | "destructive"> = {
    default: "default",
    destructive: "destructive",
};

export const ConfirmDialog = ({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isLoading = false,
    tone = "default",
    icon,
    onConfirm,
}: ConfirmDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={(nextOpen) => {
            if (isLoading && !nextOpen) {
                return;
            }

            onOpenChange(nextOpen);
        }}>
            <DialogContent
                showCloseButton={false}
                className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/75 px-8 py-10 text-center shadow-2xl shadow-black/20 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-neutral-900/75 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/60"
            >
                <div
                    className={cn(
                        "mx-auto mb-6 flex size-12 items-center justify-center rounded-full shadow-inner supports-[backdrop-filter]:backdrop-blur",
                        toneIconClasses[tone],
                    )}
                >
                    {icon ?? <span aria-hidden="true" className="block size-5" />}
                </div>
                <DialogHeader className="gap-4 text-center">
                    <DialogTitle className="text-2xl font-semibold">
                        {title}
                    </DialogTitle>
                    {description ? (
                        <DialogDescription className="text-base text-muted-foreground">
                            {description}
                        </DialogDescription>
                    ) : null}
                </DialogHeader>
                <DialogFooter className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-11 rounded-full border border-transparent bg-white/40 px-6 text-sm font-medium shadow-sm transition hover:bg-white/60 dark:bg-neutral-800/70 dark:hover:bg-neutral-800 supports-[backdrop-filter]:backdrop-blur"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={toneConfirmVariant[tone]}
                        className="h-11 rounded-full px-6 text-sm font-semibold shadow-lg shadow-black/20"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2Icon className="size-4 animate-spin" />
                                Processing
                            </span>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

