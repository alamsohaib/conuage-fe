
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSuccess: () => void;
}

const EditDocumentDialog = ({ 
  isOpen, 
  onClose, 
  document, 
  onSuccess 
}: EditDocumentDialogProps) => {
  const [documentName, setDocumentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (document) {
      setDocumentName(document.name);
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document) return;
    
    if (!documentName.trim()) {
      toast.error("Document name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    const { data, error } = await api.documentManagement.updateDocument(document.id, {
      name: documentName.trim(),
      folder_id: document.folder_id
    });
    
    setIsSubmitting(false);
    
    if (data) {
      onSuccess();
    } else if (error) {
      toast.error(error.message || "Failed to update document");
    }
  };

  const handleClose = () => {
    setDocumentName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the document details.
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
                autoFocus
              />
            </div>
            
            {document && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">File Type</Label>
                  <div className="font-medium">{document.file_type}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Page Count</Label>
                  <div className="font-medium">{document.page_count}</div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Updating...
                </>
              ) : (
                "Update Document"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentDialog;
