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
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center gap-x-2 border-b border-white/20 bg-white/70 px-4 py-3 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/55 dark:border-white/10 dark:bg-neutral-900/70">
                <Hint description="Refresh" side="bottom" align="start">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border border-white/30 bg-white/80 text-foreground shadow-sm transition hover:border-white/40 hover:bg-white supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/70"
                        onClick={onRefreshClick}
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
                        className="flex-1 justify-start rounded-full border border-white/30 bg-white/80 text-start text-xs font-medium text-muted-foreground shadow-sm transition hover:border-white/40 hover:bg-white supports-[backdrop-filter]:backdrop-blur disabled:opacity-60 dark:border-white/10 dark:bg-neutral-900/70 dark:text-neutral-200"
                    >
                        <span className="truncate">
                            {data.sandboxUrl}
                        </span>
                    </Button>
                </Hint>
                <Hint description="Open in new tab" side="bottom" align="start">
                    <Button
                        size="icon"
                        disabled={!data.sandboxUrl}
                        variant="ghost"
                        className="h-8 w-8 rounded-full border border-white/30 bg-white/80 shadow-sm transition hover:border-white/40 hover:bg-white supports-[backdrop-filter]:backdrop-blur disabled:opacity-60 dark:border-white/10 dark:bg-neutral-900/70"
                        onClick={() => {
                            if (!data.sandboxUrl) return;
                            window.open(data.sandboxUrl, "_blank");
                        }}
                    >
                        <ExternalLinkIcon />
                    </Button>
                </Hint>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-b-[24px] border border-t-0 border-white/20 bg-white/60 shadow-inner supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-neutral-900/60">
                <iframe
                    key={fragmentKey}
                    className="h-full w-full"
                    sandbox="allow-forms allow-scripts allow-same-origin"
                    src={data.sandboxUrl}
                />
            </div>
        </div>
    );
};