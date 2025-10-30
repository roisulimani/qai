import { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";

import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { cn } from "@/lib/utils";
import { projectGlassPanelClass } from "../styles";

interface Props {
    data: Fragment;
}

export const FragmentWeb = ({ data }: Props) => {
    const [ copied, setCopied ] = useState(false);
    const [ fragmentKey, setFragmentKey ] = useState(0);

    const onRefreshClick = () => {
        setFragmentKey((prev) => prev + 1);
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText(data.sandboxUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div
            className={cn(
                projectGlassPanelClass,
                "flex h-full w-full flex-col overflow-hidden"
            )}
        >
            <div className="flex flex-wrap items-center gap-2 border-b border-white/30 bg-white/40 px-3 py-3 text-xs font-medium supports-[backdrop-filter]:backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/60">
                <Hint description="Refresh" side="bottom" align="start">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefreshClick}
                        className="rounded-full border border-white/40 bg-white/70 text-foreground shadow-sm transition hover:bg-white/80 dark:border-white/10 dark:bg-neutral-900/70 dark:text-white"
                    >
                        <RefreshCcwIcon />
                    </Button>
                </Hint>
                <Hint description="Copy URL" side="bottom" align="start">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyClick}
                        disabled={!data.sandboxUrl || copied}
                        className="flex-1 justify-start truncate rounded-full border border-white/30 bg-white/80 text-start font-medium text-foreground shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed dark:border-white/10 dark:bg-neutral-900/70 dark:text-white"
                    >
                        <span className="truncate">
                            {data.sandboxUrl}
                        </span>
                    </Button>
                </Hint>
                <Hint description="Open in new tab" side="bottom" align="start">
                    <Button
                        size="sm"
                        disabled={!data.sandboxUrl}
                        variant="ghost"
                        onClick={() => {
                            if (!data.sandboxUrl) return;
                            window.open(data.sandboxUrl, "_blank");
                        }}
                        className="rounded-full border border-white/30 bg-white/70 text-foreground shadow-sm transition hover:bg-white/80 disabled:opacity-40 dark:border-white/10 dark:bg-neutral-900/70 dark:text-white"
                    >
                        <ExternalLinkIcon />
                    </Button>
                </Hint>
            </div>
            <iframe
                key={fragmentKey}
                className="w-full h-full"
                sandbox="allow-forms allow-scripts allow-same-origin"
                src={data.sandboxUrl}
            />
        </div>
    );
};
