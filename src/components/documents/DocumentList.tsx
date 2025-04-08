
import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { Document } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EditDocumentDialog from "./EditDocumentDialog";
import ConfirmDialog from "./ConfirmDialog";
import DocumentSearchInput from "./DocumentSearchInput";
import DocumentTable from "./DocumentTable";
import DocumentEmptyState from "./DocumentEmptyState";

interface DocumentListProps {
  folderId: string;
  folderName: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const DocumentList = ({ folderId, folderName }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [processingDocumentId, setProcessingDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const itemsPerPage = 10;
  
  const loadDocuments = useCallback(async (retry = 0) => {
    if (!folderId) return;
    
    if (retry === 0) {
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
      } else if (error) {
        console.error(`Attempt ${retry + 1} failed:`, error);
        
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
        setIsRetrying(false);
      }
    }
  }, [folderId]);
  
  useEffect(() => {
    if (folderId) {
      loadDocuments();
    } else {
      setDocuments([]);
      setIsLoading(false);
    }
  }, [folderId, loadDocuments]);
  
  const handleManualRetry = () => {
    loadDocuments();
  };
  
  const handleProcessDocument = async (document: Document) => {
    setProcessingDocumentId(document.id);
    
    try {
      console.log("Processing document:", document.id, "Status:", document.status);
      
      // Make sure we're using the api utility with the correct endpoint
      const { data, error } = await api.documentManagement.processDocument(document.id);
      
      if (error) {
        console.error("Process document error:", error);
        throw new Error(error.message || "Failed to process document");
      }
      
      console.log("Process document response:", data);
      toast.success(`Document processed successfully${data?.total_pages_processed ? `: ${data.total_pages_processed} pages` : ''}`);
      loadDocuments(); // Refresh the list
    } catch (error) {
      console.error("Process document error:", error);
      toast.error((error as Error).message || "Failed to process document");
    } finally {
      setProcessingDocumentId(null);
    }
  };
  
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    const { data, error } = await api.documentManagement.deleteDocument(documentToDelete.id);
    
    if (data) {
      toast.success("Document deleted successfully");
      loadDocuments(); // Refresh the list
    } else if (error) {
      toast.error(error.message || "Failed to delete document");
    }
    
    setDocumentToDelete(null);
  };
  
  const handleUpdateDocument = async () => {
    toast.success("Document updated successfully");
    loadDocuments(); // Refresh the list
    setEditingDocument(null);
  };
  
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const paginatedDocuments = filteredDocuments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{folderName || "Documents"}</CardTitle>
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
                    <RefreshCw className={`h-4 w-4 ${(isLoading || isRetrying) ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh documents</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DocumentSearchInput 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={handleManualRetry}
            />
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
            <DocumentTable 
              documents={paginatedDocuments}
              processingDocumentId={processingDocumentId}
              onEdit={setEditingDocument}
              onProcess={handleProcessDocument}
              onDelete={setDocumentToDelete}
            />
            
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
