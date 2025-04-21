
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  // For rename functionality
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputRequired?: boolean;
  inputLabel?: string;
}

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  isDangerous = false,
  isLoading = false,
  inputValue,
  onInputChange,
  inputRequired = false,
  inputLabel
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    // Don't close the dialog here - let the parent component decide when to close
  };

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => {
        // Prevent closing dialog by clicking outside when loading
        if (isLoading) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle className="dark:text-white">{title}</DialogTitle>
          <DialogDescription className="dark:text-white/80">{description}</DialogDescription>
        </DialogHeader>
        
        {inputValue !== undefined && onInputChange && (
          <div className="grid gap-4 py-2">
            {inputLabel && (
              <Label htmlFor="input-field" className="dark:text-white/80">{inputLabel}</Label>
            )}
            <Input 
              id="input-field"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              autoFocus
              className={cn({
                "border-destructive": inputRequired && !inputValue.trim(),
                "dark:bg-gray-800 dark:text-white": true
              })}
              disabled={isLoading}
            />
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="dark:text-white/80 hover:dark:text-white"
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            variant={isDangerous ? "destructive" : "default"} 
            onClick={handleConfirm}
            disabled={isLoading || (inputRequired && !inputValue?.trim())}
            className="dark:text-white"
          >
            {isLoading ? `${confirmText.replace('Delete', 'Deleting').replace('Rename', 'Renaming')}...` : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
