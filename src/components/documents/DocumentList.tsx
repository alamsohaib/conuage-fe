
import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { Document } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EditDocumentDialog from "./EditDocumentDialog";
import ConfirmDialog from "./ConfirmDialog";
import DocumentTable from "./DocumentTable";
import DocumentEmptyState from "./DocumentEmptyState";
import DocumentGrid from "./DocumentGrid";

interface DocumentListProps {
  folderId: string;
  folderName: string;
  searchTerm?: string;
  viewMode?: "list" | "grid";
  onAuthError?: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const DocumentList = ({ folderId, folderName, searchTerm = "", viewMode = "list", onAuthError }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [processingDocumentId, setProcessingDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const itemsPerPage = 10;
  
  const loadDocuments = useCallback(async (retry = 0) => {
    if (!folderId) return;
    
    if (retry === 0) {
      setIsRefreshing(true);
      setIsLoading(true);
      setError(null);
    } else {
      setIsRetrying(true);
    }
    
    try {
      console.log(`Attempt ${retry + 1} to fetch documents for folder: ${folderId}`);
      const { data, error } = await api.documentManagement.getDocuments(folderId);
      
      if (data) {
        console.log("Documents loaded successfully:", data);
        const documentArray = Array.isArray(data) ? data : (data.documents || []);
        setDocuments(documentArray);
        setRetryCount(0); // Reset retry count on success
        setError(null);
        setSelectedDocuments([]);
      } else if (error) {
        console.error(`Attempt ${retry + 1} failed:`, error);
        
        // Check if this is an authentication error (401)
        const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
        
        if (isUnauthorized && onAuthError) {
          console.log("Authentication error detected in document list");
          onAuthError();
          return;
        }
        
        if (retry < MAX_RETRIES) {
          const backoffDelay = RETRY_DELAY * Math.pow(2, retry);
          setTimeout(() => loadDocuments(retry + 1), backoffDelay);
          setRetryCount(retry + 1);
        } else {
          setError(error.message || "Failed to load documents");
          toast.error("Failed to load documents. Please try again.", {
            id: "document-load-error",
          });
          setRetryCount(0);
        }
      }
    } catch (err) {
      console.error(`Exception on attempt ${retry + 1}:`, err);
      
      // Check if this is an authentication error
      if (err instanceof Error && 
         (err.message.includes('401') || 
          err.message.toLowerCase().includes('unauthorized'))) {
        if (onAuthError) {
          onAuthError();
          return;
        }
      }
      
      if (retry < MAX_RETRIES) {
        const backoffDelay = RETRY_DELAY * Math.pow(2, retry);
        setTimeout(() => loadDocuments(retry + 1), backoffDelay);
        setRetryCount(retry + 1);
      } else {
        setError("Network error. Please check your connection and try again.");
        toast.error("Network error. Please check your connection and try again.", {
          id: "document-network-error",
        });
        setRetryCount(0);
      }
    } finally {
      if (retry === MAX_RETRIES || retry === 0) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsRetrying(false);
      }
    }
  }, [folderId, onAuthError]);

  useEffect(() => {
    if (folderId) {
      loadDocuments();
    } else {
      setDocuments([]);
      setIsLoading(false);
      setSelectedDocuments([]);
    }
  }, [folderId, loadDocuments]);

  const handleManualRetry = () => {
    loadDocuments();
  };

  const handleProcessDocument = async (document: Document) => {
    setProcessingDocumentId(document.id);
    
    try {
      console.log("Processing document:", document.id, "Status:", document.status);
      
      const { data, error } = await api.documentManagement.processDocument(document.id);
      
      if (error) {
        // Check if this is an authentication error (401)
        const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
        
        if (isUnauthorized && onAuthError) {
          onAuthError();
          return;
        }
        
        console.error("Process document error:", error);
        throw new Error(error.message || "Failed to process document");
      }
      
      console.log("Process document response:", data);
      toast.success(`Document processed successfully${data?.total_pages_processed ? `: ${data.total_pages_processed} pages` : ''}`);
      
      setTimeout(() => {
        loadDocuments();
      }, 1000);
      
    } catch (error) {
      console.error("Process document error:", error);
      
      // Check if this is an authentication error
      if (error instanceof Error && 
         (error.message.includes('401') || 
          error.message.toLowerCase().includes('unauthorized'))) {
        if (onAuthError) {
          onAuthError();
          return;
        }
      }
      
      toast.error((error as Error).message || "Failed to process document");
    } finally {
      setProcessingDocumentId(null);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      const { data, error } = await api.documentManagement.deleteDocument(documentToDelete.id);
      
      if (error) {
        // Check if this is an authentication error (401)
        const isUnauthorized = error.code === '401' || error.message.includes('401') || error.message.toLowerCase().includes('unauthorized');
        
        if (isUnauthorized && onAuthError) {
          onAuthError();
          return;
        }
        
        toast.error(error.message || "Failed to delete document");
      } else if (data) {
        toast.success("Document deleted successfully");
        loadDocuments();
      }
    } catch (error) {
      console.error("Delete document error:", error);
      
      // Check if this is an authentication error
      if (error instanceof Error && 
         (error.message.includes('401') || 
          error.message.toLowerCase().includes('unauthorized'))) {
        if (onAuthError) {
          onAuthError();
          return;
        }
      }
      
      toast.error("Failed to delete document");
    } finally {
      setDocumentToDelete(null);
    }
  };

  const handleUpdateDocument = async () => {
    toast.success("Document updated successfully");
    loadDocuments();
    setEditingDocument(null);
  };

  const handleToggleSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const filteredDocuments = documents
    .filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const paginatedDocuments = filteredDocuments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  const areAllCurrentPageSelected = paginatedDocuments.length > 0 && 
    paginatedDocuments.every(doc => selectedDocuments.includes(doc.id));

  const areSomeCurrentPageSelected = paginatedDocuments.some(doc => 
    selectedDocuments.includes(doc.id)
  ) && !areAllCurrentPageSelected;

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const handleRefresh = () => {
      console.log("Refreshing document list...");
      loadDocuments();
    };

    window.addEventListener('refresh-documents', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-documents', handleRefresh);
    };
  }, [loadDocuments]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary/80" />
            <span>{folderName || "Documents"}</span>
            {searchTerm && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Search results for "{searchTerm}"
              </span>
            )}
          </CardTitle>
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
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh documents</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
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
        ) : paginatedDocuments.length > 0 ? (
          <>
            {viewMode === "list" ? (
              <DocumentTable 
                documents={paginatedDocuments}
                processingDocumentId={processingDocumentId}
                onEdit={setEditingDocument}
                onProcess={handleProcessDocument}
                onDelete={setDocumentToDelete}
                selectedDocuments={selectedDocuments}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                allSelected={areAllCurrentPageSelected}
                someSelected={areSomeCurrentPageSelected}
                totalDocuments={filteredDocuments.length}
                currentPageDocuments={paginatedDocuments.length}
              />
            ) : (
              <DocumentGrid 
                documents={paginatedDocuments}
                processingDocumentId={processingDocumentId}
                onEdit={setEditingDocument}
                onProcess={handleProcessDocument}
                onDelete={setDocumentToDelete}
                selectedDocuments={selectedDocuments}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                allSelected={areAllCurrentPageSelected}
                someSelected={areSomeCurrentPageSelected}
              />
            )}
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : searchTerm ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No documents found matching "{searchTerm}"</p>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={() => loadDocuments()}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <DocumentEmptyState />
        )}
      </CardContent>
      
      <EditDocumentDialog
        isOpen={!!editingDocument}
        onClose={() => setEditingDocument(null)}
        document={editingDocument}
        onSuccess={handleUpdateDocument}
      />
      
      <ConfirmDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        description={`Are you sure you want to delete "${documentToDelete?.name}"? This action cannot be undone.`}
      />
    </Card>
  );
};

export default DocumentList;
