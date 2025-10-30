import { type TreeItem } from "@/types";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarProvider,
    SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";

interface TreeViewProps {
    treeData: TreeItem[];
    value: string | null;
    onSelect?: (value: string) => void;
    className?: string;
    contentClassName?: string;
}

export const TreeView = ({ treeData, value, onSelect, className, contentClassName }: TreeViewProps) => {
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className={cn("w-full bg-transparent dark:bg-transparent", className)}>
                <SidebarContent className={cn("px-0 py-2", contentClassName)}>
                    <SidebarGroup className="p-0">
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {treeData.map((item, index) => (
                                    <Tree key={index} item={item} selectedValue={value} onSelect={onSelect} parentPath="" />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
        </SidebarProvider>
    )
};

interface TreeProps {
    item: TreeItem;
    selectedValue?: string | null;
    onSelect?: (value: string) => void;
    parentPath: string;
}

const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
    const [name, ...items] = Array.isArray(item) ? item : [item];
    const currentPath = parentPath ? `${parentPath}/${name}` : name;

    if (!items.length) {
        // This is a leaf node - meaning it's a file
        const isSelected = selectedValue === currentPath;

        return (
            <SidebarMenuButton
                isActive={isSelected}
                className={cn(
                    "rounded-xl border border-transparent bg-white/40 text-foreground/80 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/60 dark:bg-neutral-900/40 dark:text-neutral-100",
                    isSelected && "border-white/50 bg-white/80 text-foreground dark:border-white/20 dark:bg-neutral-800/80",
                )}
                onClick={() => onSelect?.(currentPath)}
            >
                <FileIcon />
                <span className="truncate">
                    {name}
                </span>
            </SidebarMenuButton>
        )
    }

    // This is a directory node - meaning it has subfolders
    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="rounded-xl border border-transparent bg-white/30 text-foreground/80 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/60 dark:bg-neutral-900/40 dark:text-neutral-100">
                        <ChevronRightIcon className="transition-transform"/>
                        <FolderIcon />
                        <span className="truncate">
                            {name}
                        </span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {items.map((item, index) => (
                            <Tree key={index} item={item} selectedValue={selectedValue} onSelect={onSelect} parentPath={currentPath} />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
};