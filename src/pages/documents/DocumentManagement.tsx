import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Folder, Document, Location } from "@/lib/types";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, AlertCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

import FolderExplorer from "@/components/documents/FolderExplorer";
import DocumentList from "@/components/documents/DocumentList";
import CreateFolderDialog from "@/components/documents/CreateFolderDialog";
import UploadDocumentDialog from "@/components/documents/UploadDocumentDialog";
import LocationSelector from "@/components/documents/LocationSelector";
import FolderBreadcrumb from "@/components/documents/FolderBreadcrumb";
import NoFolderSelected from "@/components/documents/NoFolderSelected";
import NoLocationAvailable from "@/components/documents/NoLocationAvailable";

const DocumentManagement = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      refreshProfile();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshProfile]);
  
  const loadProfileData = useCallback(async () => {
    if (!profile) {
      try {
        setConnectionError(null);
        await refreshProfile();
      } catch (error) {
        console.error("Failed to load profile:", error);
        setConnectionError("Failed to connect to the server. Please check your connection and try again.");
      }
    }
  }, [profile, refreshProfile]);
  
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    if (profile?.locations && profile.locations.length > 0) {
      const primaryLocation = profile.locations.find(loc => loc.is_primary) || profile.locations[0];
      console.log("Setting active location from profile:", primaryLocation);
      setActiveLocation(primaryLocation);
      setIsLoading(false);
      setConnectionError(null);
    } else if (profile) {
      setIsLoading(false);
    }
  }, [profile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setConnectionError(null);
    
    try {
      await refreshProfile();
      if (currentFolder) {
        toast.success("Document list refreshed");
      }
    } catch (error) {
      console.error("Refresh error:", error);
      setConnectionError("Failed to refresh. Please check your connection and try again.");
      toast.error("Failed to refresh. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNavigateBack = () => {
    if (folderPath.length > 0) {
      const newPath = [...folderPath];
      newPath.pop();
      setFolderPath(newPath);
      
      if (newPath.length > 0) {
        setCurrentFolder(newPath[newPath.length - 1]);
      } else {
        setCurrentFolder(null);
      }
    } else {
      navigate("/dashboard");
    }
  };

  const handleFolderClick = (folder: Folder) => {
    console.log("Folder clicked:", folder);
    setCurrentFolder(folder);
    setFolderPath([...folderPath, folder]);
  };

  const handleCreateFolderSuccess = () => {
    toast.success("Folder created successfully");
    setIsCreateFolderOpen(false);
    handleRefresh(); // Refresh the folder list
  };

  const handleUploadDocumentSuccess = () => {
    toast.success("Document uploaded successfully");
    setIsUploadDocumentOpen(false);
    handleRefresh();
  };

  const handleLocationChange = (locationId: string) => {
    if (!profile?.locations) return;
    
    const location = profile.locations.find(loc => loc.location_id === locationId);
    if (location) {
      console.log("Changing location to:", location);
      setActiveLocation(location);
      setCurrentFolder(null);
      setFolderPath([]);
    }
  };

  const handleBreadcrumbNavigate = (index: number | null) => {
    if (index === null) {
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setCurrentFolder(folderPath[index]);
    }
  };

  console.log("Active location ID:", activeLocation?.location_id);
  console.log("Current folder ID:", currentFolder?.id);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {folderPath.length > 0 ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 mr-1 p-0" 
                onClick={handleNavigateBack}
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </Button>
            ) : (
              <span className="font-medium text-lg">Document Management</span>
            )}
            {folderPath.length > 0 && (
              <span className="font-medium text-lg">
                {currentFolder?.name || "Documents"}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleRefresh}
                    disabled={isRefreshing || isOffline}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh all data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <LocationSelector 
              locations={profile?.locations || []}
              activeLocation={activeLocation}
              onLocationChange={handleLocationChange}
            />
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateFolderOpen(true)}
                disabled={!activeLocation || isOffline}
              >
                New Folder
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsUploadDocumentOpen(true)}
                disabled={!currentFolder || isOffline}
              >
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {isOffline && (
          <Card className="mb-6 p-4 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <p className="text-amber-700 dark:text-amber-400 font-medium">You are currently offline</p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">Please check your internet connection. The application will automatically reconnect when you're back online.</p>
              </div>
            </div>
          </Card>
        )}
      
        {connectionError && !isOffline && (
          <Card className="mb-6 p-4 bg-destructive/10 border-destructive/50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-destructive font-medium">{connectionError}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Connection
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        <FolderBreadcrumb 
          folderPath={folderPath}
          onNavigate={handleBreadcrumbNavigate}
        />

        <div className="grid md:grid-cols-12 gap-6">
          {activeLocation ? (
            <>
              <div className="md:col-span-4 lg:col-span-3">
                <FolderExplorer 
                  locationId={activeLocation.location_id}
                  currentFolder={currentFolder}
                  onFolderSelect={handleFolderClick}
                  folderPath={folderPath}
                />
              </div>
              
              {currentFolder ? (
                <div className="md:col-span-8 lg:col-span-9">
                  <DocumentList 
                    folderId={currentFolder.id} 
                    folderName={currentFolder.name}
                  />
                </div>
              ) : (
                <NoFolderSelected 
                  onCreateFolder={() => setIsCreateFolderOpen(true)}
                />
              )}
            </>
          ) : (
            <NoLocationAvailable isLoading={isLoading} />
          )}
        </div>
      </main>

      <CreateFolderDialog 
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        locationId={activeLocation?.location_id || ""}
        parentFolderId={currentFolder?.id}
        onSuccess={handleCreateFolderSuccess}
      />

      <UploadDocumentDialog 
        isOpen={isUploadDocumentOpen}
        onClose={() => setIsUploadDocumentOpen(false)}
        folderId={currentFolder?.id || ""}
        onSuccess={handleUploadDocumentSuccess}
      />
    </div>
  );
};

export default DocumentManagement;
