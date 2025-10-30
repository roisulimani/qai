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
                    "relative rounded-2xl border border-white/30 bg-white/80 px-5 pb-5 pt-4 text-sm shadow-lg shadow-black/5 transition-all supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-black/40",
                    isFocused && "ring-1 ring-primary/40 dark:ring-primary/30",
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
                        className="w-full resize-none border-none bg-transparent pt-3 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/80"
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
                <div className="flex items-end justify-between gap-x-2 pt-4">
                    <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Press
                        <kbd className="ml-2 inline-flex h-5 select-none items-center gap-1 rounded-full border border-white/30 bg-white/80 px-2 font-mono text-[11px] font-semibold text-muted-foreground shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/80">
                            <span>&#8984;</span>Enter
                        </kbd>
                    </div>
                    <Button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={cn(
                            "h-9 w-9 rounded-full bg-gradient-to-br from-primary to-violet-500 text-white shadow-lg shadow-primary/30 transition hover:from-primary/90 hover:to-violet-500/90",
                            isButtonDisabled && "cursor-not-allowed opacity-60 hover:from-primary hover:to-violet-500",
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