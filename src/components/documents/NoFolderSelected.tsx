
import { Button } from "@/components/ui/button";

interface NoFolderSelectedProps {
  onCreateFolder: () => void;
}

const NoFolderSelected = ({ onCreateFolder }: NoFolderSelectedProps) => {
  return (
    <div className="md:col-span-8 lg:col-span-9 bg-muted/40 dark:bg-muted/10 rounded-lg p-8 text-center">
      <h3 className="text-lg font-medium mb-2 text-foreground">No folder selected</h3>
      <p className="text-muted-foreground mb-4">
        Select a folder from the left to view its documents
      </p>
      <Button 
        variant="outline" 
        onClick={onCreateFolder}
        className="dark:text-foreground dark:hover:bg-primary/20"
      >
        Create Root Folder
      </Button>
    </div>
  );
};

export default NoFolderSelected;
