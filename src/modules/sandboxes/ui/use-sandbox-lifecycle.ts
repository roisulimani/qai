"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export function useSandboxLifecycle(projectId: string) {
    const trpc = useTRPC();
    const wakeSandbox = useMutation(trpc.sandboxes.wake.mutationOptions());
    const pauseSandbox = useMutation(trpc.sandboxes.pause.mutationOptions());
    const hasAwakenedRef = useRef(false);
    const [isPageVisible, setIsPageVisible] = useState(() =>
        typeof document === "undefined"
            ? true
            : document.visibilityState === "visible",
    );

    useEffect(() => {
        if (hasAwakenedRef.current) return;
        hasAwakenedRef.current = true;
        wakeSandbox.mutate({ projectId });
    }, [projectId, wakeSandbox]);

    const pauseIfNeeded = useCallback(() => {
        pauseSandbox.mutate({ projectId });
    }, [pauseSandbox, projectId]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            const visible = document.visibilityState === "visible";
            setIsPageVisible(visible);
            if (!visible) {
                pauseIfNeeded();
            }
        };

        window.addEventListener("pagehide", pauseIfNeeded);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            pauseIfNeeded();
            window.removeEventListener("pagehide", pauseIfNeeded);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pauseIfNeeded]);

    return { isPageVisible, wakeSandbox, pauseSandbox };
}
