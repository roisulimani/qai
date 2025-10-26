import { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";

import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";

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
        <div className="flex flex-col w-full h-full">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
                <Hint description="Refresh" side="bottom" align="start">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefreshClick}
                    >
                        <RefreshCcwIcon />
                    </Button>
                </Hint>
                <Hint description="Copy URL" side="bottom" align="start">
                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleCopyClick}
                        disabled={!data.sandboxUrl || copied}
                        className="flex-1 justify-start text-start font-normal"
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
                        variant={"outline"}
                        onClick={() => {
                            if (!data.sandboxUrl) return;
                            window.open(data.sandboxUrl, "_blank");
                        }}
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