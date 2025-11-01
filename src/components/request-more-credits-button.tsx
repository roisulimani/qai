"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

type ButtonProps = React.ComponentProps<typeof Button>;

type RequestMoreCreditsButtonProps = Omit<ButtonProps, "onClick"> & {
    onClick?: ButtonProps["onClick"];
};

export const RequestMoreCreditsButton = ({
    children = "Request more credits",
    disabled,
    onClick,
    type,
    ...props
}: RequestMoreCreditsButtonProps) => {
    const trpc = useTRPC();

    const requestCredits = useMutation(
        trpc.companies.requestMoreCredits.mutationOptions({
            onSuccess: () => {
                toast.success("Thanks! We'll review your request shortly.");
            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );

    const isPending = requestCredits.isPending;
    const isSuccess = requestCredits.isSuccess;
    const isButtonDisabled = Boolean(disabled) || isPending || isSuccess;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        if (isButtonDisabled) {
            event.preventDefault();
            return;
        }

        onClick?.(event);

        if (event.defaultPrevented) {
            return;
        }

        requestCredits.mutate();
    };

    return (
        <Button
            {...props}
            type={type ?? "button"}
            disabled={isButtonDisabled}
            onClick={handleClick}
        >
            {isPending ? (
                <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Sending...
                </>
            ) : isSuccess ? (
                "Request sent"
            ) : (
                children
            )}
        </Button>
    );
};
