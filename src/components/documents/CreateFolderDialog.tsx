
import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  parentFolderId?: string;
  onSuccess: () => void;
}

const CreateFolderDialog = ({ 
  isOpen, 
  onClose, 
  locationId, 
  parentFolderId, 
  onSuccess 
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast.error("Folder name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    const payload: any = {
      name: folderName.trim(),
      location_id: locationId
    };
    
    if (parentFolderId) {
      payload.parent_folder_id = parentFolderId;
    }
    
    const { data, error } = await api.documentManagement.createFolder(payload);
    
    setIsSubmitting(false);
    
    if (data) {
      setFolderName("");
      toast.success("Folder created successfully");
      onSuccess();
      window.dispatchEvent(new Event('refresh-folders'));
      onClose();
    } else if (error) {
      toast.error(error.message || "Failed to create folder");
    }
  };

  const handleClose = () => {
    setFolderName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="dark:text-white">Create New Folder</DialogTitle>
            <DialogDescription className="dark:text-white/80">
              Enter a name for your new folder.
              {parentFolderId ? " It will be created inside the current folder." : " It will be created at the root level."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folderName" className="dark:text-white/80">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
                className="dark:text-white dark:placeholder:text-white/60"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="dark:text-white dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="dark:text-white dark:hover:brightness-125"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Creating...
                </>
              ) : (
                "Create Folder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;

