
import { useState, useRef } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  onSuccess: () => void;
}

const UploadDocumentDialog = ({ 
  isOpen, 
  onClose, 
  folderId, 
  onSuccess 
}: UploadDocumentDialogProps) => {
  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Set document name to file name if not already set
      if (!documentName) {
        const fileName = file.name.split('.')[0]; // Remove extension
        setDocumentName(fileName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentName.trim()) {
      toast.error("Document name is required");
      return;
    }
    
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!folderId) {
      toast.error("No folder selected for upload");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Uploading document to folder:", folderId);
      console.log("Document name:", documentName.trim());
      console.log("File:", selectedFile.name, "Size:", selectedFile.size);
      
      const formData = new FormData();
      formData.append("name", documentName.trim());
      formData.append("folder_id", folderId);
      formData.append("file", selectedFile);
      
      const response = await fetch(`https://conuage-be-production.up.railway.app/api/v1/document-management/documents/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("Upload failed:", responseData);
        throw new Error(responseData.detail || "Upload failed");
      }
      
      reset();
      toast.success("Document uploaded successfully");
      onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error((error as Error).message || "Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setDocumentName("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to the selected folder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                placeholder="Enter document name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="flex-1"
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.csv,.json,.xml"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              
              {selectedFile && (
                <div className="text-sm text-muted-foreground mt-1">
                  File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedFile}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
