import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { CodeView } from "@/components/code-view";
import { 
    ResizableHandle, 
    ResizablePanel, 
    ResizablePanelGroup 
} from "@/components/ui/resizable";
import { 
    Breadcrumb, 
    BreadcrumbItem, 
    BreadcrumbSeparator, 
    BreadcrumbList, 
    BreadcrumbPage, 
    BreadcrumbEllipsis 
} from "@/components/ui/breadcrumb";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "@/components/tree-view";
import { toast } from "sonner";


type FileCollection = { [path: string]: string };

function getLanguageFromExtension(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension || "text";
}

interface FileBreadcrumbProps {
    filePath: string;
}

const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegments = filePath.split("/");
  const maxSegments = 4;

  const renderBreadcrumbItems = () => {
    if (pathSegments.length <= maxSegments) {
        // Show all segments
        return pathSegments.map((segment, index) => {
            const isLast = index === pathSegments.length - 1;
            return (
                <Fragment key={index}>
                    <BreadcrumbItem>
                        {isLast ? (
                            <BreadcrumbPage className="font-medium">
                                {segment}
                            </BreadcrumbPage>
                        ) : (
                            <span className="text-muted-foreground">
                                {segment}
                            </span>
                        )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                </Fragment>
            )
    })
    } else {
        const firstSegment = pathSegments[0];
        const lastSegment = pathSegments[pathSegments.length - 1];

        return (
            <>
                <BreadcrumbItem>
                    <span className="text-muted-foreground">
                        {firstSegment}
                    </span>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="font-medium">
                            {lastSegment}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbItem>
            </>
        )
    }
  };
  return (
    <Breadcrumb>
        <BreadcrumbList>
            {renderBreadcrumbItems()}
        </BreadcrumbList>
    </Breadcrumb>
  )
};

interface FileExplorerProps {
    files: FileCollection;
};

export const FileExplorer = ({ files }: FileExplorerProps) => {
    const [ copied, setCopied ] = useState(false);
    const [ selectedFile, setSelectedFile ] = useState<string | null>(() => {
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? fileKeys[0] : null;
    });

    const treeData = useMemo(() => {
        return convertFilesToTreeItems(files);    
    }, [files]);

    const handleSelectFile = useCallback((file: string) => {
        if (files[file]) {
            setSelectedFile(file);
        }
    }, [files]);

    const handleCopyToClipboard = useCallback(() => {
        if (selectedFile) {
            navigator.clipboard.writeText(files[selectedFile]);
            setCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    }, [selectedFile, files]);

    return (
        <ResizablePanelGroup direction="horizontal" className="h-full gap-3">
            <ResizablePanel
                defaultSize={30}
                minSize={20}
                className="flex min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/50 p-2 supports-[backdrop-filter]:backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/60"
            >
                <TreeView
                    treeData={treeData}
                    value={selectedFile}
                    onSelect={handleSelectFile}
                />
            </ResizablePanel>
            <ResizableHandle className="mx-1 w-px rounded-full bg-white/30 transition-colors duration-300 hover:bg-white/50 dark:bg-white/10 dark:hover:bg-white/30" />
            <ResizablePanel defaultSize={70} minSize={60} className="flex min-h-0 flex-col">
                {selectedFile && files[selectedFile] ? (
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/50 supports-[backdrop-filter]:backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/60">
                        <div className="flex flex-wrap items-center gap-2 border-b border-white/20 bg-white/40 px-4 py-3 text-xs font-medium supports-[backdrop-filter]:backdrop-blur-lg dark:border-white/10 dark:bg-neutral-900/60">
                            <FileBreadcrumb filePath={selectedFile} />
                            <Hint description="Copy to clipboard" side="bottom">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-auto rounded-full border border-white/30 bg-white/70 text-foreground shadow-sm transition hover:bg-white/80 dark:border-white/10 dark:bg-neutral-900/70 dark:text-white"
                                    onClick={handleCopyToClipboard}
                                    disabled={copied}
                                >
                                    {copied ? <CopyCheckIcon /> : <CopyIcon />}
                                </Button>
                            </Hint>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <CodeView
                                code={files[selectedFile]}
                                language={getLanguageFromExtension(selectedFile)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        <p>Select a file to view the code</p>
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
    
}
