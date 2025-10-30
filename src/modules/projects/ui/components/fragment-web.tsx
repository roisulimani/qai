import { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";

import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";

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
        <div className="flex h-full w-full flex-col overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/30 bg-white/70 px-4 py-3 text-sm font-medium shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60">
                <Hint description="Refresh" side="bottom" align="start">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRefreshClick}
                        className="size-9 rounded-full border border-white/40 bg-white/70 text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                    >
                        <RefreshCcwIcon className="size-4" />
                    </Button>
                </Hint>
                <Hint description="Copy URL" side="bottom" align="start">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyClick}
                        disabled={!data.sandboxUrl || copied}
                        className="flex-1 justify-start truncate rounded-full border border-white/40 bg-white/70 px-4 py-2 text-start font-normal text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 disabled:opacity-60 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                    >
                        <span className="truncate">
                            {data.sandboxUrl || "Preview not available"}
                        </span>
                    </Button>
                </Hint>
                <Hint description="Open in new tab" side="bottom" align="start">
                    <Button
                        size="icon"
                        disabled={!data.sandboxUrl}
                        variant="ghost"
                        onClick={() => {
                            if (!data.sandboxUrl) return;
                            window.open(data.sandboxUrl, "_blank");
                        }}
                        className="size-9 rounded-full border border-white/40 bg-white/70 text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90 disabled:opacity-50 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                    >
                        <ExternalLinkIcon className="size-4" />
                    </Button>
                </Hint>
            </div>
            <iframe
                key={fragmentKey}
                className="h-full w-full flex-1"
                sandbox="allow-forms allow-scripts allow-same-origin"
                src={data.sandboxUrl}
            />
        </div>
    );
};