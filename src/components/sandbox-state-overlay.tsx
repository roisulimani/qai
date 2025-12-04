import {
    AlertCircleIcon,
    AlertTriangleIcon,
    ClockIcon,
    PowerOffIcon,
    RefreshCcwIcon,
    WifiOffIcon,
} from "lucide-react";
import { SandboxStatus } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SandboxStateOverlayProps {
    status: SandboxStatus;
    onWake?: () => void;
    onRetry?: () => void;
    isWaking?: boolean;
}

/**
 * State-specific overlay component for non-running sandbox states.
 * Displays branded error messages with glassmorphism styling.
 */
export function SandboxStateOverlay({
    status,
    onWake,
    onRetry,
    isWaking = false,
}: SandboxStateOverlayProps) {
    const config = getOverlayConfig(status);

    if (!config) return null;

    const IconComponent = config.icon;

    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {/* Background gradient */}
            <div
                className={cn(
                    "absolute inset-0",
                    config.backgroundGradient
                )}
            />

            {/* Glass-effect container */}
            <div className="relative z-10 flex max-w-md flex-col items-center gap-6 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg dark:border-gray-700/30 dark:bg-gray-800/20">
                {/* Icon */}
                <div
                    className={cn(
                        "rounded-full p-4",
                        config.iconBackground
                    )}
                >
                    <IconComponent className={cn("h-12 w-12", config.iconColor)} />
                </div>

                {/* Title */}
                <h3 className="text-center text-2xl font-semibold text-gray-900 dark:text-white">
                    {config.title}
                </h3>

                {/* Description */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                    {config.description}
                </p>

                {/* Action buttons */}
                <div className="flex gap-3">
                    {onWake && (
                        <Button
                            onClick={onWake}
                            disabled={isWaking}
                            size="lg"
                            className="min-w-[140px]"
                        >
                            {isWaking ? (
                                <>
                                    <RefreshCcwIcon className="h-4 w-4 animate-spin" />
                                    Waking…
                                </>
                            ) : (
                                <>
                                    <PowerOffIcon className="h-4 w-4" />
                                    Wake Sandbox
                                </>
                            )}
                        </Button>
                    )}
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            variant="outline"
                            size="lg"
                        >
                            <RefreshCcwIcon className="h-4 w-4" />
                            Retry
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface OverlayConfig {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    iconColor: string;
    iconBackground: string;
    backgroundGradient: string;
}

function getOverlayConfig(status: SandboxStatus): OverlayConfig | null {
    switch (status) {
        case SandboxStatus.PAUSED:
            return {
                icon: ClockIcon,
                title: "Sandbox Asleep",
                description:
                    "Your sandbox was auto-paused after 3 minutes of inactivity to save resources. Wake it to continue working.",
                iconColor: "text-amber-600 dark:text-amber-400",
                iconBackground: "bg-amber-100 dark:bg-amber-900/30",
                backgroundGradient:
                    "bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-yellow-50/80 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20",
            };

        case SandboxStatus.KILLED:
            return {
                icon: AlertCircleIcon,
                title: "Sandbox Not Found",
                description:
                    "The sandbox was expired. Wake to create a new sandbox with your latest project files.",
                iconColor: "text-red-600 dark:text-red-400",
                iconBackground: "bg-red-100 dark:bg-red-900/30",
                backgroundGradient:
                    "bg-gradient-to-br from-red-50/80 via-rose-50/50 to-pink-50/80 dark:from-red-950/20 dark:via-rose-950/10 dark:to-pink-950/20",
            };

        case SandboxStatus.EXPIRED:
            return {
                icon: AlertTriangleIcon,
                title: "Sandbox Expired",
                description:
                    "Your sandbox reached its 1-hour lifetime limit. Wake to create a fresh sandbox with your project files.",
                iconColor: "text-orange-600 dark:text-orange-400",
                iconBackground: "bg-orange-100 dark:bg-orange-900/30",
                backgroundGradient:
                    "bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-yellow-50/80 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-yellow-950/20",
            };

        case SandboxStatus.TERMINATED:
            return {
                icon: PowerOffIcon,
                title: "Sandbox Stopped",
                description:
                    "The sandbox was intentionally shut down. Wake to restart with your project files.",
                iconColor: "text-gray-600 dark:text-gray-400",
                iconBackground: "bg-gray-100 dark:bg-gray-900/30",
                backgroundGradient:
                    "bg-gradient-to-br from-gray-50/80 via-slate-50/50 to-zinc-50/80 dark:from-gray-950/20 dark:via-slate-950/10 dark:to-zinc-950/20",
            };

        case SandboxStatus.UNKNOWN:
            return {
                icon: WifiOffIcon,
                title: "Connection Issue",
                description:
                    "Cannot verify sandbox status. Please check your internet connection and try again.",
                iconColor: "text-yellow-600 dark:text-yellow-400",
                iconBackground: "bg-yellow-100 dark:bg-yellow-900/30",
                backgroundGradient:
                    "bg-gradient-to-br from-yellow-50/80 via-amber-50/50 to-orange-50/80 dark:from-yellow-950/20 dark:via-amber-950/10 dark:to-orange-950/20",
            };

        default:
            return null;
    }
}
