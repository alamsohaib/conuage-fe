import { Edit, RotateCw, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "@/lib/types";
import { toast } from "sonner";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface DocumentActionsProps {
  document: Document;
  onEdit: (document: Document) => void;
  onProcess: (document: Document) => void;
  onDelete: (document: Document) => void;
  isProcessing: boolean;
}
const API_URL = "https://conuage-be-187523307981.us-central1.run.app"; // API URL
const DocumentActions = ({ 
  document: docItem, 
  onEdit, 
  onProcess, 
  onDelete, 
  isProcessing 
}: DocumentActionsProps) => {
  const handleDownload = () => {
    if (!docItem.file_path) {
      console.error("No file path available for download");
      toast.error("No file available for download");
      return;
    }
    
    const token = localStorage.getItem("authToken");
    const downloadUrl = `${API_URL}/api/v1/document-management/documents/${docItem.id}/download`;
    
    const a = window.document.createElement("a");
    a.href = downloadUrl;
    a.download = docItem.name || "document";
    a.setAttribute("target", "_blank");
    
    fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Download failed");
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      })
      .catch(error => {
        console.error("Download error:", error);
        toast.error("Failed to download document");
      });
  };

  const handleProcessDocument = () => {
    if (isProcessing) {
      console.log("Already processing a document, skipping");
      return;
    }
    
    console.log("Initiating processing for document:", docItem.id, "Status:", docItem.status);
    onProcess(docItem);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(docItem)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Rename</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleProcessDocument}
              disabled={isProcessing || docItem.status === 'processing' || docItem.status === 'processed'}
            >
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Process</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(docItem)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DocumentActions;
