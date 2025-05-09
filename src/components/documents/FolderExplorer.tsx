import React, { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { api } from "@/services/api";
import { Folder } from "@/lib/types";
import { 
  Loader2, 
  AlertCircle,
  RefreshCw,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FolderTreeItem from "./FolderTreeItem";
import { Button } from "@/components/ui/button";

interface FolderExplorerProps {
  locationId: string;
  currentFolder: Folder | null;
  onFolderSelect: (folder: Folder) => void;
  folderPath: Folder[];
  onFolderDelete?: () => void;
  onAuthError?: () => void;
  setAllFolders?: Dispatch<SetStateAction<Folder[]>>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const FolderExplorer = ({ locationId, currentFolder, onFolderSelect, folderPath, onFolderDelete, onAuthError, setAllFolders }: FolderExplorerProps) => {
  const [allFolders, setAllFoldersState] = useState<Folder[]>([]);
  const [rootFolders, setRootFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOffline && locationId) {
      loadFolders();
    }
  }, [isOffline, locationId]);
  
  const loadFolders = useCallback(async (retry = 0) => {
    if (!locationId) return;
    
    if (retry === 0) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsRetrying(true);
    }
    
    try {
      console.log(`Attempt ${retry + 1} to fetch all folders for location: ${locationId}`);
      
      const { data, error } = await api.documentManagement.getAllFolders(locationId);
      
      if (data) {
        console.log("Successfully loaded all folders:", data);
        const folderArray = Array.isArray(data) ? data : [];
        const flattenedFolders = flattenFolderStructure(folderArray);
        setAllFoldersState(flattenedFolders);
        
        if (setAllFolders) {
          setAllFolders(flattenedFolders);
        }
        
        setRootFolders(folderArray);
        setRetryCount(0);
        setError(null);
      } else if (error) {
        console.error(`Attempt ${retry + 1} failed:`, error);
        
        if (error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
          console.log("Authentication error detected in folder explorer");
          onAuthError?.();
          return;
        }
        
        if (retry < MAX_RETRIES) {
          const backoffDelay = RETRY_DELAY * Math.pow(2, retry);
          console.log(`Retrying in ${backoffDelay}ms...`);
          setTimeout(() => loadFolders(retry + 1), backoffDelay);
          setRetryCount(retry + 1);
        } else {
          setError(error.message || "Failed to load folders");
          toast.error("Failed to load folders. Please try again.", {
            id: "folder-load-error",
          });
          setRetryCount(0);
        }
      }
    } catch (err) {
      console.error(`Exception on attempt ${retry + 1}:`, err);
      
      if (err instanceof Error && 
         (err.message.includes('401') || 
          err.message.toLowerCase().includes('unauthorized'))) {
        onAuthError?.();
        return;
      }
      
      if (retry < MAX_RETRIES) {
        const backoffDelay = RETRY_DELAY * Math.pow(2, retry);
        console.log(`Retrying in ${backoffDelay}ms...`);
        setTimeout(() => loadFolders(retry + 1), backoffDelay);
        setRetryCount(retry + 1);
      } else {
        setError("Network error. Please check your connection and try again.");
        toast.error("Network error. Please check your connection and try again.", {
          id: "folder-network-error",
        });
        setRetryCount(0);
      }
    } finally {
      if (retry === MAX_RETRIES || retry === 0) {
        setIsLoading(false);
        setIsRetrying(false);
      }
    }
  }, [locationId, onAuthError, setAllFolders]);

  const flattenFolderStructure = (folders: Folder[]): Folder[] => {
    let flattenedFolders: Folder[] = [];
    
    const processFolders = (currentFolders: Folder[]) => {
      currentFolders.forEach(folder => {
        flattenedFolders.push({ ...folder });
        if (folder.children && folder.children.length > 0) {
          processFolders(folder.children);
        }
      });
    };
    
    processFolders(folders);
    return flattenedFolders;
  };

  useEffect(() => {
    const handleFolderChange = () => {
      console.log("Refreshing folder list due to external event...");
      loadFolders();
    };

    window.addEventListener('refresh-folders', handleFolderChange);
    
    return () => {
      window.removeEventListener('refresh-folders', handleFolderChange);
    };
  }, [loadFolders]);

  const handleManualRetry = () => {
    loadFolders();
  };

  const getChildFolders = useCallback((folderId: string): Folder[] => {
    const folder = allFolders.find(f => f.id === folderId);
    return folder?.children || [];
  }, [allFolders]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">Folders</h3>
        <div className="flex items-center gap-2">
          {retryCount > 0 && (
            <span className="text-xs text-amber-500">Retrying...</span>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleManualRetry} 
                  disabled={isLoading || isRetrying}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4", 
                    (isLoading || isRetrying) && "animate-spin"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh folders</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="p-2 max-h-[600px] overflow-y-auto">
        {isOffline ? (
          <div className="text-center py-8">
            <WifiOff className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-muted-foreground mb-2">You are currently offline</p>
            <p className="text-sm text-muted-foreground">Please check your internet connection and try again</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            {retryCount > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                Retrying ({retryCount}/{MAX_RETRIES})...
              </span>
            )}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </>
              )}
            </Button>
          </div>
        ) : rootFolders.length > 0 ? (
          <div className="space-y-1">
            {rootFolders.map((folder) => (
              <FolderTreeItem
                key={folder.id}
                folder={folder}
                depth={0}
                isActive={currentFolder?.id === folder.id}
                onSelect={onFolderSelect}
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No folders found</p>
            <p className="text-sm mt-1">Create a folder to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderExplorer;
