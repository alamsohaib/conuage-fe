
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Folder, Document, Location } from "@/lib/types";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  LayoutGrid, 
  List, 
  WifiOff, 
  AlertCircle, 
  FolderPlus, 
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";

import FolderExplorer from "@/components/documents/FolderExplorer";
import DocumentList from "@/components/documents/DocumentList";
import CreateFolderDialog from "@/components/documents/CreateFolderDialog";
import UploadDocumentDialog from "@/components/documents/UploadDocumentDialog";
import LocationSelector from "@/components/documents/LocationSelector";
import FolderBreadcrumb from "@/components/documents/FolderBreadcrumb";
import NoFolderSelected from "@/components/documents/NoFolderSelected";
import NoLocationAvailable from "@/components/documents/NoLocationAvailable";
import DocumentBulkActions from "@/components/documents/DocumentBulkActions";

const DocumentManagement = () => {
  const { profile, refreshProfile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);
  
  // Effect to redirect to login when authentication fails
  useEffect(() => {
    if (shouldRedirectToLogin) {
      navigate('/auth/login', { replace: true });
    }
  }, [shouldRedirectToLogin, navigate]);

  // Effect to check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User is not authenticated, redirecting to login...");
      setShouldRedirectToLogin(true);
    }
  }, [isAuthenticated]);
  
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
  
  const handleAuthError = () => {
    toast.error("Your session has expired. Please login again.");
    logout();
    setShouldRedirectToLogin(true);
  };
  
  const loadProfileData = useCallback(async () => {
    if (!profile) {
      try {
        console.log("Loading profile data...");
        setConnectionError(null);
        await refreshProfile();
      } catch (error) {
        console.error("Failed to load profile:", error);
        
        // Check if it's an authentication error
        if (error instanceof Error && 
            (error.message.includes('401') || 
             error.message.toLowerCase().includes('unauthorized'))) {
          handleAuthError();
        } else {
          setConnectionError("Failed to connect to the server. Please check your connection and try again.");
        }
      }
    }
  }, [profile, refreshProfile, logout]);
  
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

  const handleLocationChange = (locationId: string) => {
    if (!profile?.locations) return;
    
    const location = profile.locations.find(loc => loc.location_id === locationId);
    if (location) {
      console.log("Changing location to:", location);
      setActiveLocation(location);
      setCurrentFolder(null);
      setFolderPath([]);
      setSearchTerm("");
    }
  };

  const handleBreadcrumbNavigate = (index: number | null) => {
    if (index === null) {
      // Navigate to root
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      // Navigate to specific folder in the path
      const selectedFolder = folderPath[index];
      setCurrentFolder(selectedFolder);
      setFolderPath(prevPath => prevPath.slice(0, index + 1));
    }
    setSearchTerm("");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const handleFolderClick = async (folder: Folder) => {
    console.log("Selected folder:", folder);
    setCurrentFolder(folder);
    
    try {
      // Build folder path
      const folderHierarchy = [];
      let currentFolderNode = folder;
      
      // Add the current folder
      folderHierarchy.unshift(currentFolderNode);
      
      // Traverse up the parent hierarchy
      while (currentFolderNode.parent_folder_id) {
        const parentResponse = await api.documentManagement.getFolders(
          currentFolderNode.location_id,
          null
        );
        
        if (parentResponse.error) {
          const isUnauthorized = parentResponse.error.code === '401' || parentResponse.error.message.includes('401') || parentResponse.error.message.toLowerCase().includes('unauthorized');
          
          if (isUnauthorized) {
            handleAuthError();
            return;
          }
        }
        
        const folders = Array.isArray(parentResponse.data) 
          ? parentResponse.data 
          : (parentResponse.data?.folders || []);
        
        const parentFolder = folders.find(
          f => f.id === currentFolderNode.parent_folder_id
        );
        
        if (!parentFolder) break;
        
        folderHierarchy.unshift(parentFolder);
        currentFolderNode = parentFolder;
      }
      
      setFolderPath(folderHierarchy);
    } catch (error) {
      console.error("Error building folder path:", error);
      
      if (error instanceof Error && 
         (error.message.includes('401') || 
          error.message.toLowerCase().includes('unauthorized'))) {
        handleAuthError();
        return;
      }
      
      toast.error("Failed to build folder path");
      setFolderPath([folder]); // Fallback to just the current folder
    }
    
    setSearchTerm("");
  };

  const handleFolderDelete = () => {
    // Clear the current folder and folder path when a folder is deleted
    setCurrentFolder(null);
    setFolderPath([]);
    setSearchTerm("");
  };

  const loadRootFolders = useCallback(async () => {
    if (!activeLocation?.location_id) return;
    
    try {
      // Fetch root folders for the active location
      const response = await api.documentManagement.getFolders(activeLocation.location_id);
      
      if (response.error) {
        const isUnauthorized = response.error.code === '401' || response.error.message.includes('401') || response.error.message.toLowerCase().includes('unauthorized');
        
        if (isUnauthorized) {
          handleAuthError();
        }
      }
    } catch (error) {
      console.error("Error loading root folders:", error);
      
      if (error instanceof Error && 
         (error.message.includes('401') || 
          error.message.toLowerCase().includes('unauthorized'))) {
        handleAuthError();
      }
    }
  }, [activeLocation, handleAuthError]);

  const handleUploadSuccess = () => {
    setIsUploadDocumentOpen(false);
    
    // After upload is successful, dispatch a refresh event
    const refreshEvent = new CustomEvent('refresh-documents');
    window.dispatchEvent(refreshEvent);
    
    toast.success("Document uploaded successfully");
  };

  console.log("Active location ID:", activeLocation?.location_id);
  console.log("Current folder ID:", currentFolder?.id);
  console.log("Current folder path:", folderPath);

  // Immediate redirect if we should go to login page
  if (shouldRedirectToLogin) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 mr-1 dark:text-white dark:hover:bg-gray-700" 
              onClick={handleNavigateBack}
            >
              <ArrowLeft className="h-5 w-5 dark:text-white" />
            </Button>
            <span className="font-medium text-lg text-foreground dark:text-white">Document Management</span>
          </div>
          
          <div className="flex items-center gap-4">
            <LocationSelector 
              locations={profile?.locations || []}
              activeLocation={activeLocation}
              onLocationChange={handleLocationChange}
              required
            />
            
            <div className="flex items-center">
              <div className="flex items-center space-x-3 mr-6">
                <ToggleGroup 
                  type="single" 
                  value={viewMode} 
                  onValueChange={(value) => {
                    if (value) setViewMode(value as "list" | "grid");
                  }} 
                  className="hidden md:flex"
                >
                  <ToggleGroupItem value="list" aria-label="List view">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <LayoutGrid className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateFolderOpen(true)}
                  disabled={!activeLocation || isOffline}
                  className="flex items-center gap-2 dark:text-foreground dark:hover:bg-muted"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span>New Folder</span>
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsUploadDocumentOpen(true)}
                  disabled={!currentFolder || isOffline}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Button>
              </div>
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
                onClick={() => {loadProfileData()}}
                disabled={isLoading}
                className="dark:text-foreground"
              >
                {isLoading ? (
                  <>
                    Loading...
                  </>
                ) : (
                  <>
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
                  onFolderDelete={handleFolderDelete}
                  onAuthError={handleAuthError}
                />
              </div>
              
              <div className="md:col-span-8 lg:col-span-9">
                {currentFolder ? (
                  <>
                    <DocumentBulkActions 
                      currentFolder={currentFolder} 
                      onActionComplete={() => {
                        // Dispatch refresh event when bulk actions are completed
                        const refreshEvent = new CustomEvent('refresh-documents');
                        window.dispatchEvent(refreshEvent);
                      }}
                      searchTerm={searchTerm}
                      onSearchChange={handleSearchChange}
                    />
                    <DocumentList 
                      folderId={currentFolder.id} 
                      folderName={currentFolder.name}
                      searchTerm={searchTerm}
                      viewMode={viewMode}
                      onAuthError={handleAuthError}
                    />
                  </>
                ) : (
                  <NoFolderSelected 
                    onCreateFolder={() => setIsCreateFolderOpen(true)}
                  />
                )}
              </div>
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
        onSuccess={() => {
          // Refresh folder view after creating a folder
          loadRootFolders();
        }}
      />

      <UploadDocumentDialog 
        isOpen={isUploadDocumentOpen}
        onClose={() => setIsUploadDocumentOpen(false)}
        folderId={currentFolder?.id || ""}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default DocumentManagement;
