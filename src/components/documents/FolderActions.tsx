import React, { useState } from "react";
import { Folder } from "@/lib/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { EditIcon, TrashIcon, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import ConfirmDialog from "./ConfirmDialog";

interface FolderActionsProps {
  folder: Folder;
  locationId: string;
  currentFolder: Folder | null;
  isActive?: boolean;
  onSuccess?: () => void;
  onDelete?: () => void;
}

const FolderActions = ({ 
  folder, 
  locationId, 
  currentFolder, 
  isActive, 
  onSuccess = () => {}, 
  onDelete = () => {} 
}: FolderActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folder.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log(`Attempting to delete folder with ID: ${folder.id}`);
      const response = await api.documentManagement.deleteFolder(folder.id);
      
      console.log("Delete folder response:", response);
      
      if (response && response.error) {
        console.error("API returned an error:", response.error);
        toast.error(`Failed to delete folder: ${response.error.message}`);
      } else {
        console.log("Folder deletion successful");
        toast.success("Folder deleted successfully");
        onSuccess();
        onDelete();
        window.dispatchEvent(new Event('refresh-folders'));
      }
    } catch (err: any) {
      console.error("Exception in deleteFolder:", err);
      toast.error(`Error deleting folder: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRename = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }
    
    setIsRenaming(true);
    try {
      console.log(`Renaming folder ${folder.id} to "${newFolderName}"`);
      const response = await api.documentManagement.updateFolder(folder.id, {
        name: newFolderName,
      });
      
      console.log("Rename folder response:", response);
      
      if (response && response.error && response.error.message) {
        console.error("API returned an error:", response.error);
        toast.error(`Failed to rename folder: ${response.error.message}`);
      } else {
        console.log("Folder rename successful");
        toast.success("Folder renamed successfully");
        onSuccess();
        window.dispatchEvent(new Event('refresh-folders'));
      }
    } catch (err: any) {
      console.error("Exception in renameFolder:", err);
      toast.error(`Error renaming folder: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRenaming(false);
      setIsRenameDialogOpen(false);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="rounded-full h-7 w-7 p-0 flex items-center justify-center hover:bg-accent text-muted-foreground"
          onClick={handleActionClick}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {dropdownOpen && (
          <div 
            className="absolute right-0 mt-1 w-48 rounded-md bg-popover border shadow-lg z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent cursor-pointer dark:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewFolderName(folder.name);
                  setIsRenameDialogOpen(true);
                  setDropdownOpen(false);
                }}
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Rename
              </button>
              <button
                className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent cursor-pointer text-destructive dark:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                  setDropdownOpen(false);
                }}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(open);
          }
        }}
      >
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            if (!isDeleting) {
              setIsDeleteDialogOpen(false);
            }
          }}
          onConfirm={handleDelete}
          title="Delete Folder"
          description={`Are you sure you want to delete "${folder.name}"? This action cannot be undone.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          isLoading={isDeleting}
          isDangerous={true}
        />
      </Dialog>

      <Dialog 
        open={isRenameDialogOpen} 
        onOpenChange={(open) => {
          if (!isRenaming) {
            setIsRenameDialogOpen(open);
          }
        }}
      >
        <ConfirmDialog
          isOpen={isRenameDialogOpen}
          onClose={() => {
            if (!isRenaming) {
              setIsRenameDialogOpen(false);
            }
          }}
          onConfirm={handleRename}
          title="Rename Folder"
          description="Enter a new name for this folder"
          confirmText={isRenaming ? "Renaming..." : "Rename"}
          isLoading={isRenaming}
          inputValue={newFolderName}
          onInputChange={(value) => setNewFolderName(value)}
          inputRequired={true}
          inputLabel="Folder Name"
        />
      </Dialog>
    </>
  );
};

export default FolderActions;
