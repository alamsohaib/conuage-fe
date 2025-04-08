
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Organization, UpdateOrganizationRequest, OrganizationLocation, Location } from "@/lib/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { format } from "date-fns";
import LocationSelector from "@/components/documents/LocationSelector";

const OrganizationDetails = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<UpdateOrganizationRequest>({
    defaultValues: {
      address: "",
      city: "", 
      state: "",
      country: "",
      post_code: "",
      primary_contact_email: "",
      default_location_id: "",
      auto_signup_enabled: false
    }
  });
  
  const fetchOrganization = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching organization details...");
      const { data, error } = await api.organization.getOrganization();
      console.log("Organization API response:", data, error);
      
      if (data) {
        setOrganization(data);
        form.reset({
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          post_code: data.post_code || "",
          auto_signup_enabled: data.auto_signup_enabled,
          primary_contact_email: data.primary_contact?.email || "",
          default_location_id: data.default_location?.id || "",
        });
        
        if (data.default_location) {
          const defaultActiveLocation: Location = {
            location_id: data.default_location.id,
            location_name: data.default_location.name,
            is_primary: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setActiveLocation(defaultActiveLocation);
        }
      } else if (error) {
        console.error("Error fetching organization:", error);
        setError(error.message || "Failed to load organization details");
        toast.error(error.message || "Failed to load organization details");
      }
    } catch (error) {
      console.error("Exception fetching organization:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Failed to load organization details");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchLocations = async () => {
    if (!organization) return;
    
    try {
      console.log("Fetching organization locations...");
      const { data, error } = await api.organization.getLocations(organization.id);
      console.log("Locations API response:", data, error);
      
      if (data) {
        const formattedLocations: Location[] = data.map(loc => ({
          location_id: loc.id,
          location_name: loc.name,
          is_primary: organization.default_location?.id === loc.id,
          created_at: loc.created_at,
          updated_at: loc.updated_at
        }));
        setLocations(formattedLocations);
        
        if (organization.default_location && !activeLocation) {
          const defaultLoc = formattedLocations.find(loc => 
            loc.location_id === organization.default_location?.id
          );
          if (defaultLoc) {
            setActiveLocation(defaultLoc);
          }
        }
      } else if (error) {
        console.error("Error fetching locations:", error);
        toast.error(error.message || "Failed to load locations");
      }
    } catch (error) {
      console.error("Exception fetching locations:", error);
      toast.error("Failed to load locations");
    }
  };
  
  useEffect(() => {
    fetchOrganization();
  }, []);
  
  useEffect(() => {
    if (organization) {
      fetchLocations();
    }
  }, [organization]);
  
  const handleLocationChange = (locationId: string) => {
    console.log("Location selected:", locationId);
    const selectedLocation = locations.find(loc => loc.location_id === locationId);
    if (selectedLocation) {
      setActiveLocation(selectedLocation);
      form.setValue("default_location_id", locationId);
    }
  };
  
  const onSubmit = async (formData: UpdateOrganizationRequest) => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Create a payload that matches the UpdateOrganizationRequest type
      const payload: UpdateOrganizationRequest = {};
      
      // Only add fields to the payload if they have valid string values
      if (formData.address && formData.address.trim()) {
        payload.address = formData.address.trim();
      }
      
      if (formData.city && formData.city.trim()) {
        payload.city = formData.city.trim();
      }
      
      if (formData.state && formData.state.trim()) {
        payload.state = formData.state.trim();
      }
      
      if (formData.post_code && formData.post_code.trim()) {
        payload.post_code = formData.post_code.trim();
      }
      
      if (formData.primary_contact_email && formData.primary_contact_email.trim()) {
        payload.primary_contact_email = formData.primary_contact_email.trim();
      }
      
      if (activeLocation?.location_id) {
        payload.default_location_id = activeLocation.location_id;
      }
      
      // Add the auto_signup_enabled field
      payload.auto_signup_enabled = formData.auto_signup_enabled;
      
      console.log("Submitting organization update with payload:", JSON.stringify(payload));
      
      const { data, error } = await api.organization.updateOrganization(payload);
      
      if (data) {
        setOrganization(data);
        toast.success("Organization details updated successfully");
      } else if (error) {
        console.error("Error updating organization:", error);
        setError(`Failed to update organization: ${error.message || "Unknown error"}`);
        
        if (error.details) {
          const errorMessages = Object.entries(error.details)
            .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
            .join("; ");
          toast.error(`Update failed: ${errorMessages}`);
        } else {
          toast.error(error.message || "Failed to update organization details");
        }
      }
    } catch (error: any) {
      console.error("Error updating organization:", error);
      setError(`Failed to update organization: ${error?.message || "An unexpected error occurred"}`);
      toast.error("Failed to update organization details. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            onClick={fetchOrganization} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  if (!organization) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Organization Data</AlertTitle>
          <AlertDescription>
            No organization data was found. This could be due to a temporary issue or your organization may not be set up yet.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            onClick={fetchOrganization} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            View your organization's information
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <div className="p-2 bg-muted/50 rounded-md">{organization.name}</div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="p-2 bg-muted/50 rounded-md">
                {organization.is_active ? (
                  <span className="text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-red-600 font-medium">Inactive</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label>Primary Contact</Label>
            <div className="p-2 bg-muted/50 rounded-md">
              {organization.primary_contact ? (
                <span>{organization.primary_contact.first_name} {organization.primary_contact.last_name} ({organization.primary_contact.email})</span>
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label>Default Location</Label>
            <div className="p-2 bg-muted/50 rounded-md">
              {organization.default_location ? (
                <span>{organization.default_location.name}</span>
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Edit Organization Details</CardTitle>
          <CardDescription>
            Update your organization's information
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="post_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal/Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal/Zip Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State/Province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primary_contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="default_location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Location</FormLabel>
                    <FormControl>
                      <div className="w-full">
                        <LocationSelector
                          locations={locations}
                          activeLocation={activeLocation}
                          onLocationChange={handleLocationChange}
                          disabled={isSaving}
                          isPrimaryLocation={true}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select a default location for your organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_signup_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Enable Auto Sign-up</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {organization && (
        <div className="text-sm text-muted-foreground mt-4 space-y-1">
          <p>Created: {organization.created_at && format(new Date(organization.created_at), 'PPP, p')}</p>
          <p>Last updated: {organization.updated_at && format(new Date(organization.updated_at), 'PPP, p')}</p>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetails;
