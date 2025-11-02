"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

type OnboardingStep = {
    title: string;
    description: string;
};

export const BuildOnboarding = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data: company } = useQuery(trpc.companies.getCurrent.queryOptions());

    const steps = useMemo<OnboardingStep[]>(
        () => [
            {
                title: "Welcome to Build",
                description:
                    "Kick things off with a short brief that captures what you want QAI to orchestrate. We’ll take it from there.",
            },
            {
                title: "Compose your prompt",
                description:
                    "Describe the workflow, tone, and deliverable in the message area. Use ⌘ + Enter (or Ctrl + Enter) to submit instantly.",
            },
            {
                title: "Pick the right model",
                description:
                    "Select from curated OpenAI models directly in the form. Each choice notes its strengths so you can match it to the task.",
            },
            {
                title: "Track credits in real time",
                description:
                    "Your remaining credits appear beneath the composer so you always know how many generations you have left.",
            },
            {
                title: "Jumpstart with templates",
                description:
                    "Need inspiration? Try the prebuilt templates underneath the form to preload QAI with a proven starting point.",
            },
        ],
        [],
    );

    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [hasCompleted, setHasCompleted] = useState(false);

    useEffect(() => {
        if (company?.buildTourCompleted === false && !hasCompleted) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [company?.buildTourCompleted, hasCompleted]);

    const updateOnboarding = useMutation(
        trpc.companies.updateOnboarding.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.companies.getCurrent.queryOptions());
            },
        }),
    );

    const isLastStep = activeStep === steps.length - 1;
    const isSubmitting = updateOnboarding.isPending;

    const resetTour = () => {
        setActiveStep(0);
    };

    const completeTour = async () => {
        if (hasCompleted) {
            setOpen(false);
            return;
        }

        try {
            await updateOnboarding.mutateAsync({ buildTourCompleted: true });
            setHasCompleted(true);
            setOpen(false);
            resetTour();
        } catch (error) {
            console.error(error);
            toast.error("We couldn't save your onboarding progress. Please try again.");
            setOpen(true);
        }
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            void completeTour();
        } else {
            setOpen(true);
        }
    };

    const handleNext = () => {
        setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    };

    const handleBack = () => {
        setActiveStep((current) => Math.max(current - 1, 0));
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-lg rounded-3xl border border-white/20 bg-white/70 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-black/40"
                showCloseButton={false}
            >
                <DialogHeader>
                    <DialogTitle>{steps[activeStep]?.title}</DialogTitle>
                    <DialogDescription>{steps[activeStep]?.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {steps.map((_, index) => (
                                <span
                                    key={index}
                                    className={cn(
                                        "h-1.5 w-6 rounded-full bg-muted/60",
                                        index === activeStep && "bg-emerald-500",
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Step {activeStep + 1} of {steps.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeStep > 0 && (
                            <Button variant="ghost" size="sm" onClick={handleBack} disabled={isSubmitting}>
                                Back
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                void completeTour();
                            }}
                            disabled={isSubmitting}
                        >
                            Skip tour
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                if (isLastStep) {
                                    void completeTour();
                                } else {
                                    handleNext();
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            {isLastStep ? "Finish" : "Next"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
