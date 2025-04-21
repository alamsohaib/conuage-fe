
import { useState, useEffect } from "react";
import { Folder, Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  RotateCw, 
  Search
} from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface DocumentBulkActionsProps {
  currentFolder: Folder;
  onActionComplete: () => void;
  searchTerm?: string;
  onSearchChange: (value: string) => void;
}

const DocumentBulkActions = ({ 
  currentFolder, 
  onActionComplete, 
  searchTerm = "", 
  onSearchChange 
}: DocumentBulkActionsProps) => {
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  
  useEffect(() => {
    const handleSelectionChange = (event: CustomEvent) => {
      setSelectedDocuments(event.detail.selectedDocuments || []);
    };
    
    window.addEventListener('document-selection-change', handleSelectionChange as EventListener);
    
    return () => {
      window.removeEventListener('document-selection-change', handleSelectionChange as EventListener);
    };
  }, []);

  const fetchTotalDocuments = async () => {
    if (currentFolder?.id) {
      try {
        const { data } = await api.documentManagement.getDocuments(currentFolder.id);
        const docs = Array.isArray(data) ? data : (data?.documents || []);
        setTotalDocuments(docs.length);
        console.log("Total documents count updated:", docs.length);
      } catch (error) {
        console.error("Error fetching document count:", error);
      }
    }
  };

  useEffect(() => {
    fetchTotalDocuments();
  }, [currentFolder]);

  useEffect(() => {
    const handleRefreshDocuments = () => {
      console.log("Refreshing document count...");
      fetchTotalDocuments();
    };

    window.addEventListener('refresh-documents', handleRefreshDocuments);
    
    return () => {
      window.removeEventListener('refresh-documents', handleRefreshDocuments);
    };
  }, []);

  const handleProcessSelected = async () => {
    if (selectedDocuments.length === 0) {
      toast.warning("No documents selected");
      return;
    }
    
    setIsProcessing(true);
    setProcessedCount(0);
    
    try {
      const documentsToProcess = selectedDocuments.filter(doc => doc.status === 'added');
      
      if (documentsToProcess.length === 0) {
        toast.info("No documents need processing");
        setIsProcessing(false);
        return;
      }
      
      toast.info(`Processing ${documentsToProcess.length} document${documentsToProcess.length > 1 ? 's' : ''}...`);
      
      let hasTokenLimitError = false;
      let processedSuccessfully = 0;
      
      for (let i = 0; i < documentsToProcess.length; i++) {
        try {
          const response = await api.documentManagement.processDocument(documentsToProcess[i].id);
          
          if (response.error) {
            if (response.error.message?.includes("token limit") || 
                response.error.message?.includes("Daily token limit reached")) {
              hasTokenLimitError = true;
              break;
            } else {
              throw new Error(response.error.message || "Processing failed");
            }
          }
          
          processedSuccessfully++;
          setProcessedCount(i + 1);
        } catch (error: any) {
          const errorMsg = error.message || "Failed to process document";
          if (errorMsg.includes("token limit") || errorMsg.includes("Daily token limit reached")) {
            hasTokenLimitError = true;
            break;
          } else {
            toast.error(`Error processing document: ${errorMsg}`);
          }
        }
      }
      
      if (hasTokenLimitError) {
        toast.error("You have reached your daily token limit. Please try again tomorrow.");
      } else if (processedSuccessfully > 0) {
        toast.success(`Successfully processed ${processedSuccessfully} document${processedSuccessfully > 1 ? 's' : ''}`);
      }
      
      onActionComplete();
      
      const refreshEvent = new CustomEvent('refresh-documents');
      window.dispatchEvent(refreshEvent);
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to process documents";
      if (errorMsg.includes("token limit") || errorMsg.includes("Daily token limit reached")) {
        toast.error("You have reached your daily token limit. Please try again tomorrow.");
      } else {
        toast.error("Failed to process documents");
      }
      console.error("Bulk process error:", error);
    } finally {
      setIsProcessing(false);
      setProcessedCount(0);
    }
  };

  const getProcessableDocumentCount = () => {
    return selectedDocuments.filter(doc => doc.status === 'added').length;
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-grow max-w-xs mr-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {selectedDocuments.length > 0 && (
          <Button
            variant="default"
            className="bg-[#4A9C57] text-white hover:bg-[#3A7C47] gap-1"
            size="sm"
            disabled={isProcessing}
            onClick={handleProcessSelected}
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>
                  Initializing ({processedCount}/{getProcessableDocumentCount()})
                </span>
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4" />
                <span>
                  Process Selected ({getProcessableDocumentCount()})
                </span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentBulkActions;
