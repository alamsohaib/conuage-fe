
import { Location } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LocationSelectorProps {
  locations: Location[];
  activeLocation: Location | null;
  onLocationChange: (locationId: string) => void;
  disabled?: boolean;
  required?: boolean;
  isPrimaryLocation?: boolean;
}

const LocationSelector = ({ 
  locations, 
  activeLocation, 
  onLocationChange,
  disabled = false,
  required = false,
  isPrimaryLocation = false
}: LocationSelectorProps) => {
  if (!locations || locations.length === 0) return null;
  
  const handleLocationSelect = (locationId: string) => {
    console.log("LocationSelector: location selected:", locationId);
    onLocationChange(locationId);
  };
  
  return (
    <div className="flex items-center gap-2 mr-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 min-w-[180px] justify-start transition-all duration-200 hover:bg-accent/50 ${required && !activeLocation ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
            disabled={disabled}
          >
            <MapPin className="h-4 w-4 text-primary/80" />
            <span className="truncate font-medium">{activeLocation?.location_name || "Select location"}</span>
            {isPrimaryLocation && <span className="ml-1 text-xs text-primary font-medium">(Primary)</span>}
            {required && !activeLocation && <span className="text-destructive ml-1">*</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="z-[100] min-w-[180px] animate-fade-in shadow-lg bg-popover/95 backdrop-blur-sm"
        >
          {locations.map((location) => (
            <DropdownMenuItem
              key={location.location_id}
              onClick={() => handleLocationSelect(location.location_id)}
              className="cursor-pointer flex items-center gap-2 py-2 hover:bg-accent/50 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{location.location_name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LocationSelector;
