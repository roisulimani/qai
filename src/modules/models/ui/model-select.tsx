"use client";

import { type ModelId } from "@/modules/models/constants";
import { ModelRegistryService, PROVIDERS, type ProviderId } from "@/modules/models/registry";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

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
    // Group models by provider
    const modelsByProvider = useMemo(() => ModelRegistryService.getModelsByProviderGrouped(), []);
    const enabledProviders = useMemo(() => ModelRegistryService.getEnabledProviders(), []);
    const selectedModel = useMemo(() => ModelRegistryService.getModel(value), [value]);

    return (
        <Select value={value} onValueChange={(val) => onChange(val as ModelId)} disabled={disabled}>
            <SelectTrigger
                className={cn(
                    "h-9 min-w-[10rem] justify-between gap-2 rounded-full border border-black/5 bg-white/80 px-3 text-sm font-medium shadow-sm transition hover:bg-white focus-visible:ring-2 focus-visible:ring-black/5 dark:border-white/10 dark:bg-neutral-900/70 dark:hover:bg-neutral-900",
                    triggerClassName,
                )}
            >
                <SelectValue placeholder={placeholder}>
                    <div className="flex items-center gap-2">
                        {selectedModel && (
                            <Badge variant="outline" className="h-5 px-1.5 text-xs font-normal">
                                {PROVIDERS[selectedModel.provider].name}
                            </Badge>
                        )}
                        <span>{selectedModel?.label || placeholder}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width] min-w-[20rem] rounded-2xl border border-border bg-popover/95 p-1 shadow-lg">
                {enabledProviders.map((provider) => {
                    const models = modelsByProvider[provider.providerId as ProviderId] || [];
                    if (models.length === 0) return null;

                    return (
                        <SelectGroup key={provider.providerId}>
                            <SelectLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                                {provider.name}
                            </SelectLabel>
                            {models.map((model) => (
                                <SelectItem
                                    key={model.modelId}
                                    value={model.modelId}
                                    className="rounded-xl px-3 py-2 text-sm focus:bg-muted/60"
                                >
                                    <div className="flex flex-col gap-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{model.label}</span>
                                            {model.metadata.recommended && (
                                                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                                                    Recommended
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">{model.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    );
                })}
            </SelectContent>
        </Select>
    );
};
