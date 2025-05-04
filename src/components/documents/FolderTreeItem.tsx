
import { useState, useEffect } from "react";
import { Folder } from "@/lib/types";
import { cn } from "@/lib/utils";
import { 
  ChevronRight, 
  ChevronDown, 
  FolderOpen,
  FolderClosed
} from "lucide-react";
import FolderActions from "./FolderActions";

interface FolderTreeItemProps {
  folder: Folder;
  depth: number;
  isActive: boolean;
  onSelect: (folder: Folder) => void;
  folderPath: Folder[];
  locationId: string;
  currentFolder: Folder | null;
  onFolderDelete?: () => void;
  onAuthError?: () => void;
  allFolders?: Folder[];
  getChildFolders: (folderId: string) => Folder[];
}

const FolderTreeItem = ({ 
  folder, 
  depth, 
  isActive, 
  onSelect, 
  folderPath, 
  locationId, 
  currentFolder,
  onFolderDelete,
  onAuthError,
  allFolders = [],
  getChildFolders
}: FolderTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subfolders, setSubfolders] = useState<Folder[]>([]);

  // Check if this folder is in the current path (to auto-expand it)
  const isInPath = folderPath.some(pathFolder => pathFolder.id === folder.id);
  const hasChildren = (folder.children?.length || 0) > 0 || getChildFolders(folder.id).length > 0;

  // Auto-expand folders that are in the current path
  useEffect(() => {
    if (isInPath && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isInPath, folderPath]);

  // Set subfolders when expanded, using children from props or from getChildFolders function
  useEffect(() => {
    if (isExpanded) {
      if (folder.children && folder.children.length > 0) {
        setSubfolders(folder.children);
      } else {
        const children = getChildFolders(folder.id);
        setSubfolders(children);
      }
    }
  }, [isExpanded, folder.id, folder.children, getChildFolders]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    onSelect(folder);
  };

  const getFolderIcon = (isExpanded: boolean) => {
    const iconProps = {
      className: cn(
        "h-4 w-4 mr-2 shrink-0",
        folder.name.toLowerCase().includes('archive') 
          ? "text-amber-500" 
          : folder.name.toLowerCase().includes('draft')
          ? "text-blue-500"
          : folder.name.toLowerCase().includes('sync')
          ? "text-green-500"
          : "text-muted-foreground"
      )
    };

    return isExpanded ? (
      <FolderOpen {...iconProps} />
    ) : (
      <FolderClosed {...iconProps} />
    );
  };

  return (
    <div className="w-full">
      <div 
        className={cn(
          "flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer group relative",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
        )}
        style={{ paddingLeft: `${(depth + 1) * 12}px` }}
        onClick={handleSelect}
      >
        <div
          className="mr-1 h-4 w-4 shrink-0 cursor-pointer"
          onClick={handleToggle}
        >
          {hasChildren && (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </div>
        {getFolderIcon(isExpanded)}
        <span className="truncate flex-1">{folder.name}</span>
        
        <div className="opacity-0 group-hover:opacity-100 absolute right-2">
          <FolderActions 
            folder={folder} 
            isActive={isActive}
            locationId={locationId}
            currentFolder={currentFolder}
            onDelete={onFolderDelete}
            onSuccess={() => {
              // Dispatch custom event when a folder action succeeds
              window.dispatchEvent(new Event('refresh-folders'));
            }}
          />
        </div>
      </div>
      
      {isExpanded && subfolders.length > 0 && (
        <div className="pl-2">
          <div>
            {subfolders.map((subfolder) => (
              <FolderTreeItem
                key={subfolder.id}
                folder={subfolder}
                depth={depth + 1}
                isActive={currentFolder?.id === subfolder.id}
                onSelect={onSelect}
                folderPath={folderPath}
                locationId={locationId}
                currentFolder={currentFolder}
                onFolderDelete={onFolderDelete}
                onAuthError={onAuthError}
                allFolders={allFolders}
                getChildFolders={getChildFolders}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderTreeItem;
