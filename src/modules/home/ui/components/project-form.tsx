"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { CreditBalanceIndicator } from "@/components/credit-balance-indicator";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "@/modules/home/constants";
import { DEFAULT_MODEL, MODEL_IDS } from "@/modules/models/constants";
import { ModelSelect } from "@/modules/models/ui/model-select";

const formSchema = z.object({
    message: z.string()
    .min(1, {message: "Message is required"})
    .max(1000, {message: "Message must be less than 1000 characters"}),
    model: z.enum(MODEL_IDS),
});

export const ProjectForm = () => {

    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data: company, isLoading: isCompanyLoading } = useQuery(
        trpc.companies.getCurrent.queryOptions(undefined, { staleTime: 10_000 }),
    );
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
            model: DEFAULT_MODEL,
        },
    });

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries(
                trpc.projects.getMany.queryOptions(),
            );
            queryClient.invalidateQueries(
                trpc.companies.getCurrent.queryOptions(),
            );
            router.push(`/projects/${data.id}`);
            toast.success("Project created successfully");
        },
        
        onError: (error) => {
            // TODO: Redirect to pricing page if user is over usage limit
            // TODO: Show toast notification if user is over usage limit
            toast.error(error.message);
        },
    }));

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        await createProject.mutateAsync({
            value: data.message,
            model: data.model,
        });
    };

    const handleTemplateClick = (value: string) => {
        form.setValue("message", value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    const [isFocused, setIsFocused] = useState(false);
    const isPending = createProject.isPending;
    const creditBalance = company?.creditBalance;
    const isCreditBalanceKnown = typeof creditBalance === "number";
    const hasCredits = isCreditBalanceKnown ? creditBalance > 0 : true;
    const shouldShowOutOfCredits = !isCompanyLoading && isCreditBalanceKnown && !hasCredits;
    const isButtonDisabled = isPending || !form.formState.isValid || !hasCredits;
    
    return (
        <Form {...form}>
            <section className="space-y-4">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn(
                        "relative p-4 pt-1 rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 shadow-lg shadow-black/5 transition-all",
                        isFocused && "ring-1 ring-black/5 dark:ring-white/10",
                    )}
                >
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <TextareaAutosize
                                {...field}
                                disabled={isPending}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                minRows={2}
                                maxRows={8}
                                className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                                placeholder="What do you want to build?"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (!e.ctrlKey || !e.metaKey)) {
                                        e.preventDefault();
                                        form.handleSubmit(onSubmit)(e);
                                    }
                                }}
                            />
                        )}
                    />
                    <div className="mt-4 space-y-3 border-t border-black/5 pt-3 dark:border-white/10">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CreditBalanceIndicator
                                variant="inline"
                                balance={company?.creditBalance}
                                isLoading={isCompanyLoading}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem className="w-full sm:w-auto">
                                        <FormLabel className="text-xs font-medium text-muted-foreground">
                                            Model
                                        </FormLabel>
                                        <FormControl>
                                            <ModelSelect
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={isPending}
                                                triggerClassName="w-full sm:w-[220px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center gap-3 sm:justify-end">
                                <div className="text-[10px] text-muted-foreground">
                                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                        <span>&#8984;</span>Enter
                                    </kbd>
                                    <span className="ml-1">to launch</span>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isButtonDisabled}
                                    className={cn(
                                        "size-8 rounded-full",
                                        isButtonDisabled && "cursor-not-allowed opacity-50",
                                    )}
                                >
                                    {isPending ? (
                                        <Loader2Icon className="size-4 animate-spin" />
                                    ) : (
                                        <ArrowUpIcon className="size-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>

                {shouldShowOutOfCredits && (
                    <div className="rounded-xl border border-dashed border-destructive/50 bg-destructive/5 p-3 text-xs text-destructive">
                        You are out of credits. Reach out to Lior for more access to QAI.
                    </div>
                )}

                <div className="flex-wrap justify-center gap-2 hidden md:flex max-w-3xl">
                    {PROJECT_TEMPLATES.map((template) => (
                        <Button
                            key={template.title}
                            variant="outline"
                            size="sm"
                            className="bg-white dark:bg-sidebar"
                            onClick={() => handleTemplateClick(template.prompt)}
                        >
                            {/* {template.emoji} */}
                            {template.title}
                        </Button>
                    ))}
                </div>
            </section>
        </Form>
    );
};