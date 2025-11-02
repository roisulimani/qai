"use client";

import { MODEL_OPTIONS, type ModelId } from "@/modules/models/constants";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ModelSelectProps {
    value: ModelId;
    onChange: (value: ModelId) => void;
    disabled?: boolean;
    placeholder?: string;
    triggerClassName?: string;
}

export const ModelSelect = ({
    value,
    onChange,
    disabled,
    placeholder = "Select a model",
    triggerClassName,
}: ModelSelectProps) => {
    return (
        <Select value={value} onValueChange={(val) => onChange(val as ModelId)} disabled={disabled}>
            <SelectTrigger
                className={cn(
                    "h-9 w-full justify-between gap-2 rounded-full border border-black/5 bg-white/80 px-3 text-sm font-medium shadow-sm transition hover:bg-white focus-visible:ring-2 focus-visible:ring-black/5 dark:border-white/10 dark:bg-neutral-900/70 dark:hover:bg-neutral-900",
                    triggerClassName,
                )}
            >
                <SelectValue placeholder={placeholder}>
                    {MODEL_OPTIONS.find((option) => option.value === value)?.label}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width] min-w-0 rounded-2xl border border-border bg-popover/95 p-1 shadow-lg">
                {MODEL_OPTIONS.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className="rounded-xl px-3 py-2 text-sm focus:bg-muted/60"
                    >
                        <div className="flex flex-col text-left">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
