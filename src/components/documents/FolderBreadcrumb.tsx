
import { Folder } from "@/lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

interface FolderBreadcrumbProps {
  folderPath: Folder[];
  onNavigate: (index: number | null) => void;
}

const FolderBreadcrumb = ({ folderPath, onNavigate }: FolderBreadcrumbProps) => {
  if (folderPath.length === 0) return null;
  
  // Get the current folder (the last one in the path)
  const currentFolder = folderPath[folderPath.length - 1];
  
  // Create a mapping of folder IDs to folders for quick lookup
  const folderMap = folderPath.reduce((map, folder) => {
    map[folder.id] = folder;
    return map;
  }, {} as Record<string, Folder>);
  
  // Build the actual hierarchy
  const hierarchy: Folder[] = [];
  let folder = currentFolder;
  
  // Add the current folder first
  hierarchy.unshift(folder);
  
  // Build the hierarchy by traversing up the parent chain
  while (folder && folder.parent_folder_id && folderMap[folder.parent_folder_id]) {
    folder = folderMap[folder.parent_folder_id];
    hierarchy.unshift(folder);
  }
  
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            onClick={() => onNavigate(null)}
            className="flex items-center hover:text-foreground"
          >
            <HomeIcon className="h-3.5 w-3.5 mr-1" />
            <span>Root</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {hierarchy.map((folder) => {
          // Find the original index in folderPath for navigation
          const originalIndex = folderPath.findIndex(f => f.id === folder.id);
          
          return (
            <BreadcrumbItem key={folder.id}>
              <BreadcrumbSeparator />
              <BreadcrumbLink 
                onClick={() => onNavigate(originalIndex)}
                className="hover:text-foreground truncate max-w-[200px]"
              >
                {folder.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default FolderBreadcrumb;
