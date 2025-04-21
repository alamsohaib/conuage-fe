import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Organization, OrganizationLocation, CreateLocationRequest, UpdateLocationRequest } from "@/lib/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const OrganizationLocations = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<OrganizationLocation | null>(null);
  
  const createForm = useForm<CreateLocationRequest>();
  const editForm = useForm<UpdateLocationRequest>();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const orgResponse = await api.organization.getOrganization();
        
        if (orgResponse.data) {
          setOrganization(orgResponse.data);
          
          const locationsResponse = await api.organization.getLocations(orgResponse.data.id);
          
          if (locationsResponse.data) {
            setLocations(locationsResponse.data);
          } else if (locationsResponse.error) {
            toast.error(locationsResponse.error.message || "Failed to load locations");
          }
        } else if (orgResponse.error) {
          toast.error(orgResponse.error.message || "Failed to load organization details");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCreate = async (data: CreateLocationRequest) => {
    if (!organization) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.organization.createLocation({
        ...data,
        organization_id: organization.id
      });
      
      if (response.data) {
        setLocations([...locations, response.data]);
        toast.success("Location created successfully");
        createForm.reset();
        setIsCreating(false);
      } else if (response.error) {
        toast.error(response.error.message || "Failed to create location");
      }
    } catch (error) {
      console.error("Error creating location:", error);
      toast.error("Failed to create location");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = async (data: UpdateLocationRequest) => {
    if (!currentLocation) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.organization.updateLocation(currentLocation.id, data);
      
      if (response.data) {
        setLocations(locations.map(loc => loc.id === currentLocation.id ? response.data : loc));
        toast.success("Location updated successfully");
        editForm.reset();
        setIsEditing(false);
        setCurrentLocation(null);
      } else if (response.error) {
        toast.error(response.error.message || "Failed to update location");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (locationId: string) => {
    setIsSubmitting(true);
    try {
      const response = await api.organization.deleteLocation(locationId);
      
      if (response.error) {
        toast.error(response.error.message || "Failed to delete location");
      } else {
        setLocations(locations.filter(loc => loc.id !== locationId));
        toast.success("Location deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditDialog = (location: OrganizationLocation) => {
    setCurrentLocation(location);
    editForm.reset({
      name: location.name,
      details: location.details
    });
    setIsEditing(true);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground dark:text-white">Organization Locations</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={createForm.handleSubmit(handleCreate)}>
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                  Create a new location for your organization
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Location Name</Label>
                  <Input
                    id="create-name"
                    placeholder="Location Name"
                    {...createForm.register("name", { required: "Location name is required" })}
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-details">Details</Label>
                  <Textarea
                    id="create-details"
                    placeholder="Location details"
                    {...createForm.register("details")}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Location"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No locations found</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.details}</TableCell>
                    <TableCell>{formatDate(location.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(location)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the location "{location.name}" and cannot be undone.
                                All associated folders and documents will also be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(location.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <form onSubmit={editForm.handleSubmit(handleEdit)}>
            <DialogHeader>
              <DialogTitle>Edit Location</DialogTitle>
              <DialogDescription>
                Update location details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Location Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Location Name"
                  {...editForm.register("name", { required: "Location name is required" })}
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-details">Details</Label>
                <Textarea
                  id="edit-details"
                  placeholder="Location details"
                  {...editForm.register("details")}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationLocations;
