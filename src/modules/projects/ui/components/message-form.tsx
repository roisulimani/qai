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
import { projectGlassBubbleClass } from "../styles";


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
                    projectGlassBubbleClass,
                    "relative flex flex-col gap-3 border-white/40 px-4 py-4 transition-all focus-within:border-white/60 focus-within:bg-white/90 dark:border-white/10 dark:focus-within:border-white/20 dark:focus-within:bg-neutral-900",
                    isFocused && "shadow-[0_20px_90px_-45px_rgba(15,23,42,0.45)]",
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
                        className="pt-2 resize-none border-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70"
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
                <div className="flex items-end justify-between gap-2 pt-1">
                    <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-full border border-white/40 bg-white/60 px-2 font-sans text-[10px] font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-neutral-900/70 dark:text-slate-200">
                            <span>&#8984;</span>Enter
                        </kbd>
                        <span className="ml-2 normal-case tracking-normal text-muted-foreground/80">to submit</span>
                    </div>
                    <Button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={cn(
                            "flex size-10 items-center justify-center rounded-full border border-white/40 bg-slate-900 text-white shadow-lg transition hover:bg-slate-900/90 dark:border-white/10 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90",
                            isButtonDisabled && "opacity-40 hover:bg-slate-900",
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
