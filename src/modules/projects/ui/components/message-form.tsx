import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpIcon, CircleStopIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DEFAULT_MODEL, MODEL_IDS } from "@/modules/models/constants";
import { ModelSelect } from "@/modules/models/ui/model-select";


interface Props {
    projectId: string;
    isAgentWorking?: boolean;
};

const formSchema = z.object({
    message: z.string()
    .min(1, {message: "Message is required"})
    .max(1000, {message: "Message must be less than 1000 characters"}),
    model: z.enum(MODEL_IDS),
});

export const MessageForm = ({ projectId, isAgentWorking = false }: Props) => {

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
            model: DEFAULT_MODEL,
        },
    });

    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onSuccess: () => {
            const currentModel = form.getValues("model");
            form.reset({ message: "", model: currentModel });
            queryClient.invalidateQueries(
                trpc.messages.getMany.queryOptions({ projectId }),
            );
            // Invalidate usage to refresh credits UI
            queryClient.invalidateQueries(
                trpc.companies.getCurrent.queryOptions(),
            );
        },
        
        onError: (error) => {
            // TODO: Redirect to pricing page if user is over usage limit
            // TODO: Show toast notification if user is over usage limit
            toast.error(error.message);
        },
    }));

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        await createMessage.mutateAsync({
            value: data.message,
            projectId,
            model: data.model,
        });
    };

    const [isFocused, setIsFocused] = useState(false);
    const showUsage = false;
    const isPending = createMessage.isPending;
    const isBusy = isPending || isAgentWorking;
    const isButtonDisabled = isBusy || !form.formState.isValid;
    
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                    isFocused && "shadow-xs",
                    showUsage && "rounded-t-none",
                )}
            >
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <TextareaAutosize
                            {...field}
                            disabled={isBusy}
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
                <div className="mt-3 flex flex-col gap-3 border-t border-black/5 pt-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-1 sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <FormLabel className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                                        Model
                                    </FormLabel>
                                    <FormControl>
                                        <ModelSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isPending}
                                            triggerClassName="w-[170px] sm:w-[180px]"
                                        />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="text-[10px] text-muted-foreground">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <span>&#8984;</span>Enter
                            </kbd>
                            <span className="ml-1">{isBusy ? "agent running" : "to send"}</span>
                        </div>
                        <Button
                            type="submit"
                            disabled={isButtonDisabled}
                            className={cn(
                                "size-8 rounded-full transition-all",
                                isBusy
                                    ? "bg-destructive/90 text-white shadow-lg shadow-destructive/30 hover:bg-destructive disabled:opacity-90"
                                    : "bg-foreground text-background shadow-lg shadow-black/10 hover:bg-foreground/90",
                                isButtonDisabled && "opacity-50 cursor-not-allowed",
                            )}
                            aria-label={isBusy ? "Stop current run" : "Send message"}
                            title={isBusy ? "The agent is working. You can stop and wait before sending another request." : "Send message"}
                        >
                            {isBusy ? (
                                isPending ? (
                                    <Loader2Icon className="size-4 animate-spin" />
                                ) : (
                                    <CircleStopIcon className="size-4" />
                                )
                            ) : (
                                <ArrowUpIcon className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};