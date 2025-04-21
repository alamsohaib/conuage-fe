
import { useState, useEffect } from "react";
import { Folder } from "@/lib/types";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { 
  ChevronRight, 
  ChevronDown, 
  Loader2, 
  AlertCircle,
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
  onAuthError?: () => void; // Added the missing prop
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
  onAuthError // Added the prop to the destructuring
}: FolderTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subfolders, setSubfolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInPath = folderPath.some(pathFolder => pathFolder.id === folder.id);

  useEffect(() => {
    if (isInPath && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isInPath, folderPath]);

  useEffect(() => {
    if (isExpanded) {
      loadSubfolders();
    }
  }, [isExpanded]);

  const loadSubfolders = async () => {
    if (!folder.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await api.documentManagement.getFolders(locationId, folder.id);
      
      if (data) {
        const folderArray = Array.isArray(data) ? data : (data.folders || []);
        setSubfolders(folderArray);
      } else if (error) {
        console.error("Error loading subfolders:", error);
        
        // Check if this is an authentication error (401)
        const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
        
        if (isUnauthorized && onAuthError) {
          console.log("Authentication error detected in folder tree item");
          onAuthError();
          return;
        }
        
        setError("Failed to load subfolders");
      }
    } catch (err) {
      console.error("Exception loading subfolders:", err);
      
      // Check if this is an authentication error
      if (err instanceof Error && 
         (err.message.includes('401') || 
          err.message.toLowerCase().includes('unauthorized'))) {
        if (onAuthError) {
          onAuthError();
          return;
        }
      }
      
      setError("Network error loading subfolders");
    } finally {
      setIsLoading(false);
    }
  };

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
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : subfolders.length > 0 || !isExpanded ? (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : null}
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
          />
        </div>
      </div>
      
      {isExpanded && (
        <div className="pl-2">
          {isLoading && subfolders.length === 0 ? (
            <div className="flex items-center pl-10 py-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Loading...
            </div>
          ) : error ? (
            <div className="flex items-center pl-10 py-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3 mr-2" />
              {error}
            </div>
          ) : subfolders.length > 0 ? (
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
                />
              ))}
            </div>
          ) : (
            <div className="pl-10 py-1 text-xs text-muted-foreground">
              No subfolders
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FolderTreeItem;
