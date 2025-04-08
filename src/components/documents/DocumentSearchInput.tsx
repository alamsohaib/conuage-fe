
import { Search, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DocumentSearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

const DocumentSearchInput = ({ 
  searchQuery, 
  onSearchChange, 
  onRefresh 
}: DocumentSearchInputProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documents..."
          className="w-[200px] pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
      >
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DocumentSearchInput;
