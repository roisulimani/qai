"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
    const indicatorStyle = useMemo<CSSProperties>(
        () => ({
            animation: "global-loading-orbit 2.8s ease-in-out infinite",
            width: "var(--global-loading-length)",
            "--global-loading-length": "clamp(120px, 40vw, 320px)",
            "--global-loading-radius":
                "max(calc(min(45vw, 45vh) - (var(--global-loading-length) / 2) - 32px), 32px)",
        }),
        [],
    );

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
                "pointer-events-none fixed inset-0 z-[100] transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0",
            )}
        >
            <div className="relative h-full w-full">
                <div
                    className="absolute left-1/2 top-1/2 h-1 overflow-hidden rounded-full bg-primary/15"
                    style={indicatorStyle}
                >
                    <div
                        className="absolute inset-y-0 w-1/2 min-w-[120px] rounded-full bg-primary"
                        style={{
                            animation: "global-loading-bar 1.2s ease-in-out infinite",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
