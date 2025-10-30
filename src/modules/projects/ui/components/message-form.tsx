import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";


interface Props {
    projectId: string;
};

const formSchema = z.object({
    message: z.string()
    .min(1, {message: "Message is required"})
    .max(1000, {message: "Message must be less than 1000 characters"}),
});

export const MessageForm = ({ projectId }: Props) => {

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    });

    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onSuccess: () => {
            form.reset();
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
        });
    };

    const [isFocused, setIsFocused] = useState(false);
    const showUsage = false;
    const isPending = createMessage.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;
    
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    "relative rounded-2xl border border-white/40 bg-white/80 px-4 pb-4 pt-5 shadow-lg shadow-black/5 backdrop-blur-2xl transition-all dark:border-white/10 dark:bg-neutral-900/60",
                    isFocused && "ring-2 ring-primary/40",
                    showUsage && "rounded-t-none",
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
                            className="w-full resize-none border-none bg-transparent pt-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                            placeholder="Describe what you want QAI to build for you..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)(e);
                                }
                            }}
                        />
                    )}
                />
                <div className="flex items-end justify-between gap-2 pt-4">
                    <div className="text-[11px] text-muted-foreground">
                        <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-full border border-white/40 bg-white/60 px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm dark:border-white/10 dark:bg-neutral-800/70">
                            <span>&#8984;</span>Enter
                        </kbd>
                        <span className="ml-2">Press to submit</span>
                    </div>
                    <Button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={cn(
                            "size-9 rounded-full bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:from-primary hover:to-primary",
                            isButtonDisabled && "opacity-50 cursor-not-allowed",
                        )}
                    >
                        {isPending ? (
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <ArrowUpIcon className="size-4" />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};