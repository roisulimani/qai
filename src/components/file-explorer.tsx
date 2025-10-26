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
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={20} className="bg-sidebar">
                <TreeView 
                    treeData={treeData}
                    value={selectedFile}
                    onSelect={handleSelectFile}
                />
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary transition-colors" />
            <ResizablePanel defaultSize={70} minSize={60}>
                {selectedFile && files[selectedFile] ? (
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
                            <FileBreadcrumb filePath={selectedFile} />
                            <Hint description="Copy to clipboard" side="bottom">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="ml-auto"
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
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <p>Select a file to view the code</p>
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
    
}