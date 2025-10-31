"use client";

import { useCallback } from "react";
import { useTheme } from "next-themes";
import { SunMoonIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export const ThemeToggleButton = () => {
    const { theme, setTheme } = useTheme();

    const cycleTheme = useCallback(() => {
        const themeOptions = ["light", "dark", "system"] as const;
        const currentIndex = themeOptions.findIndex((option) => option === theme);
        const nextTheme =
            themeOptions[(currentIndex + 1 + themeOptions.length) % themeOptions.length];
        setTheme(nextTheme);
    }, [theme, setTheme]);

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-transparent"
            onClick={cycleTheme}
            aria-label="Toggle theme"
        >
            <SunMoonIcon className="size-4" />
        </Button>
    );
};

export default ThemeToggleButton;
