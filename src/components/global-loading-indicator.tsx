"use client";

import { useEffect, useMemo, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { cn } from "@/lib/utils";

const SHOW_DELAY_MS = 150;
const HIDE_DELAY_MS = 300;

export const GlobalLoadingIndicator = () => {
    const fetchingCount = useIsFetching();
    const mutatingCount = useIsMutating();
    const isBusy = useMemo(
        () => fetchingCount > 0 || mutatingCount > 0,
        [fetchingCount, mutatingCount],
    );
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        let showTimeout: NodeJS.Timeout | undefined;
        let hideTimeout: NodeJS.Timeout | undefined;

        if (isBusy) {
            setShouldRender(true);
            showTimeout = setTimeout(() => {
                setIsVisible(true);
            }, SHOW_DELAY_MS);
        } else {
            setIsVisible(false);
            hideTimeout = setTimeout(() => {
                setShouldRender(false);
            }, HIDE_DELAY_MS);
        }

        return () => {
            if (showTimeout) {
                clearTimeout(showTimeout);
            }
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        };
    }, [isBusy]);

    if (!shouldRender) {
        return null;
    }

    return (
        <div
            aria-hidden={!isVisible}
            className={cn(
                "pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-6 transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0",
            )}
        >
            <div className="relative h-1 w-full max-w-4xl overflow-hidden rounded-b-full bg-primary/15">
                <div
                    className="absolute inset-y-0 w-1/2 min-w-[120px] rounded-full bg-primary"
                    style={{
                        animation: "global-loading-bar 1.2s ease-in-out infinite",
                    }}
                />
            </div>
        </div>
    );
};
