import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface HintProps {
    children: React.ReactNode;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
}

export function Hint({
    children,
    description,
    side = "top",
    align = "center",
}: HintProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    <p>
                        {description}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}