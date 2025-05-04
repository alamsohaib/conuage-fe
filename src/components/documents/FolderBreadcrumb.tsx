
import { Folder } from "@/lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon, Folder as FolderIcon } from "lucide-react";

interface FolderBreadcrumbProps {
  folderPath: Folder[];
  onNavigate: (index: number | null) => void;
}

const FolderBreadcrumb = ({ folderPath, onNavigate }: FolderBreadcrumbProps) => {
  if (!folderPath || folderPath.length === 0) {
    return (
      <Breadcrumb className="mb-4 bg-muted/20 py-2 px-3 rounded-md">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => onNavigate(null)}
              className="hover:text-foreground cursor-pointer flex items-center"
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              <span>Root</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb className="mb-4 bg-muted/20 py-2 px-3 rounded-md overflow-x-auto">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            onClick={() => onNavigate(null)}
            className="hover:text-foreground cursor-pointer flex items-center"
          >
            <HomeIcon className="h-4 w-4 mr-1" />
            <span>Root</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {folderPath.map((folder, index) => (
          <BreadcrumbItem key={folder.id}>
            <BreadcrumbSeparator />
            <BreadcrumbLink 
              onClick={() => onNavigate(index)}
              className="hover:text-foreground truncate max-w-[200px] cursor-pointer flex items-center"
              title={folder.name}
            >
              <FolderIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{folder.name}</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default FolderBreadcrumb;
