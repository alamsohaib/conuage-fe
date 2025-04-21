import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Organization, OrganizationLocation, OrganizationUser, CreateUserRequest, UpdateUserRequest, UserRole } from "@/lib/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Pencil, UserPlus, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import LocationSelector from "@/components/documents/LocationSelector";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const OrganizationUsers = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<OrganizationUser | null>(null);
  const [primaryLocationError, setPrimaryLocationError] = useState(false);
  const [selectedAdditionalLocations, setSelectedAdditionalLocations] = useState<string[]>([]);
  
  const createForm = useForm<CreateUserRequest>();
  const editForm = useForm<UpdateUserRequest>();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [orgResponse, usersResponse] = await Promise.all([
          api.organization.getOrganization(),
          api.organization.getUsers()
        ]);
        
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
        
        if (usersResponse.data) {
          setUsers(usersResponse.data);
        } else if (usersResponse.error) {
          toast.error(usersResponse.error.message || "Failed to load users");
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
  
  const handleCreate = async (data: CreateUserRequest) => {
    if (!data.location_id) {
      setPrimaryLocationError(true);
      toast.error("A primary location is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (!data.location_id) {
        setPrimaryLocationError(true);
        toast.error("A primary location is required");
        return;
      }
      
      const cleanPayload: CreateUserRequest = {
        ...data,
        location_id: data.location_id,
        additional_location_ids: Array.isArray(data.additional_location_ids) 
          ? data.additional_location_ids.filter(id => id !== data.location_id) 
          : []
      };
      
      console.log("Creating user with cleaned payload:", cleanPayload);
      const response = await api.organization.createUser(cleanPayload);
      
      if (response.data) {
        setUsers([...users, response.data]);
        toast.success("User created successfully");
        createForm.reset();
        setIsCreating(false);
      } else if (response.error) {
        console.error("Create user error:", response.error);
        toast.error(response.error.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = async (data: UpdateUserRequest) => {
    if (!currentUser) return;
    
    if (!data.location_id) {
      setPrimaryLocationError(true);
      toast.error("A primary location is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Updating user with data:", data);
      console.log("User ID:", currentUser.id);
      
      const userResponse = await api.organization.getUser(currentUser.id);
      if (userResponse.error) {
        toast.error("Failed to get current user data");
        setIsSubmitting(false);
        return;
      }
      
      let additionalLocations: string[] = [];
      
      if (Array.isArray(data.additional_location_ids)) {
        additionalLocations = [...data.additional_location_ids];
      }
      
      additionalLocations = additionalLocations.filter(id => id !== data.location_id);
      
      const payload: UpdateUserRequest = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        role: data.role as UserRole,
        status: data.status || "active",
        location_id: data.location_id,
        additional_location_ids: additionalLocations
      };
      
      console.log("Final payload being sent to API:", payload);
      
      const response = await api.organization.updateUser(currentUser.id, payload);
      
      if (response.data) {
        setUsers(users.map(user => user.id === currentUser.id ? response.data : user));
        toast.success("User updated successfully");
        editForm.reset();
        setIsEditing(false);
        setCurrentUser(null);
        setPrimaryLocationError(false);
        setSelectedAdditionalLocations([]);
      } else if (response.error) {
        console.error("Update user error:", response.error);
        
        if (response.error.message && response.error.message.includes("primary location")) {
          toast.error("User must have exactly one primary location");
          setPrimaryLocationError(true);
        } else {
          toast.error(response.error.message || "Failed to update user");
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditDialog = (user: OrganizationUser) => {
    setCurrentUser(user);
    setPrimaryLocationError(false);
    
    editForm.reset();
    
    const primaryLocation = user.locations.find(loc => loc.is_primary);
    console.log("Primary location found in user data:", primaryLocation);
    
    const additionalLocations = user.locations
      .filter(loc => !loc.is_primary)
      .map(loc => loc.location_id);
    
    console.log("Opening edit dialog for user:", user);
    console.log("Primary location:", primaryLocation);
    console.log("Additional locations:", additionalLocations);
    
    setSelectedAdditionalLocations(additionalLocations);
    
    editForm.setValue("first_name", user.first_name);
    editForm.setValue("last_name", user.last_name);
    editForm.setValue("email", user.email);
    
    if (primaryLocation) {
      editForm.setValue("location_id", primaryLocation.location_id);
    } else if (user.locations.length > 0) {
      editForm.setValue("location_id", user.locations[0].location_id);
    } else if (locations.length > 0) {
      editForm.setValue("location_id", locations[0].id);
    }
    
    editForm.setValue("additional_location_ids", additionalLocations);
    
    const userRole = user.role as UserRole;
    editForm.setValue("role", userRole);
    
    editForm.setValue("status", user.status as "active" | "inactive");
    
    setIsEditing(true);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };
  
  const getUserLocationNames = (user: OrganizationUser) => {
    return user.locations.map(loc => {
      const location = locations.find(l => l.id === loc.location_id);
      return location?.name || 'Unknown';
    }).join(', ');
  };
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'org_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };
  
  const getUserPrimaryLocation = (user: OrganizationUser) => {
    const primaryLoc = user.locations.find(loc => loc.is_primary);
    if (!primaryLoc) return null;
    
    const location = locations.find(l => l.id === primaryLoc.location_id);
    if (!location) return null;
    
    return {
      location_id: location.id,
      location_name: location.name,
      is_primary: true,
      created_at: primaryLoc.created_at,
      updated_at: primaryLoc.updated_at
    };
  };
  
  const mapLocationsForSelector = (orgLocations: OrganizationLocation[]) => {
    return orgLocations.map(loc => ({
      location_id: loc.id,
      location_name: loc.name,
      is_primary: false,
      created_at: loc.created_at,
      updated_at: loc.updated_at
    }));
  };
  
  const handleAdditionalLocationChange = (locationId: string, checked: boolean) => {
    let updatedLocations: string[];
    
    if (checked) {
      updatedLocations = [...selectedAdditionalLocations, locationId];
    } else {
      updatedLocations = selectedAdditionalLocations.filter(id => id !== locationId);
    }
    
    setSelectedAdditionalLocations(updatedLocations);
    editForm.setValue("additional_location_ids", updatedLocations);
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
        <h2 className="text-xl font-semibold text-foreground dark:text-white">Organization Users</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={createForm.handleSubmit(handleCreate)}>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user for your organization
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-first-name">First Name</Label>
                  <Input
                    id="create-first-name"
                    placeholder="First Name"
                    {...createForm.register("first_name", { required: "First name is required" })}
                  />
                  {createForm.formState.errors.first_name && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.first_name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-last-name">Last Name</Label>
                  <Input
                    id="create-last-name"
                    placeholder="Last Name"
                    {...createForm.register("last_name", { required: "Last name is required" })}
                  />
                  {createForm.formState.errors.last_name && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.last_name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="Email"
                    {...createForm.register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-password">Password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    placeholder="Password"
                    {...createForm.register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                      }
                    })}
                  />
                  {createForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="create-location" className="flex items-center">
                      Primary Location 
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    {primaryLocationError && (
                      <div className="ml-2 text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Required</span>
                      </div>
                    )}
                  </div>
                  <LocationSelector
                    locations={mapLocationsForSelector(locations)}
                    activeLocation={
                      createForm.getValues("location_id") 
                        ? {
                            location_id: createForm.getValues("location_id"),
                            location_name: locations.find(l => l.id === createForm.getValues("location_id"))?.name || "",
                            is_primary: true,
                            created_at: "",
                            updated_at: ""
                          }
                        : null
                    }
                    onLocationChange={(locationId) => {
                      console.log("Setting primary location to:", locationId);
                      createForm.setValue("location_id", locationId);
                      setPrimaryLocationError(false);
                      
                      const currentAdditional = createForm.getValues("additional_location_ids") || [];
                      if (Array.isArray(currentAdditional)) {
                        createForm.setValue(
                          "additional_location_ids", 
                          currentAdditional.filter(id => id !== locationId)
                        );
                      }
                    }}
                    required={true}
                    isPrimaryLocation={true}
                  />
                  {createForm.formState.errors.location_id && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.location_id.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-role">Role</Label>
                  <Select 
                    onValueChange={value => {
                      if (value === "end_user" || value === "manager" || value === "org_admin") {
                        createForm.setValue("role", value as UserRole);
                      }
                    }} 
                  >
                    <SelectTrigger id="create-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="end_user">End User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="org_admin">Organization Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {createForm.formState.errors.role && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.role.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-status">Status</Label>
                  <Select 
                    onValueChange={value => {
                      if (value === "active" || value === "inactive") {
                        createForm.setValue("status", value);
                      }
                    }} 
                    defaultValue="active"
                  >
                    <SelectTrigger id="create-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Additional Locations</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {locations.map(location => (
                      <div key={location.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location.id}`}
                          onCheckedChange={(checked) => {
                            const currentLocations = createForm.getValues("additional_location_ids") || [];
                            if (checked) {
                              createForm.setValue("additional_location_ids", [...currentLocations, location.id]);
                            } else {
                              createForm.setValue(
                                "additional_location_ids", 
                                currentLocations.filter(id => id !== location.id)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`location-${location.id}`} className="text-sm font-normal">
                          {location.name}
                        </Label>
                      </div>
                    ))}
                  </div>
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
                    "Create User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No users found</p>
            <Button onClick={() => setIsCreating(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First User
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                        {user.role === 'org_admin' ? 'Admin' : 
                         user.role === 'manager' ? 'Manager' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getUserLocationNames(user)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isEditing} onOpenChange={(open) => {
        setIsEditing(open);
        if (!open) {
          setPrimaryLocationError(false);
          setSelectedAdditionalLocations([]);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={editForm.handleSubmit(handleEdit)}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">First Name</Label>
                <Input
                  id="edit-first-name"
                  placeholder="First Name"
                  {...editForm.register("first_name", { required: "First name is required" })}
                />
                {editForm.formState.errors.first_name && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.first_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">Last Name</Label>
                <Input
                  id="edit-last-name"
                  placeholder="Last Name"
                  {...editForm.register("last_name", { required: "Last name is required" })}
                />
                {editForm.formState.errors.last_name && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.last_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Email"
                  {...editForm.register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
                {editForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="edit-location" className="block mb-1.5">
                    Primary Location <span className="text-red-500">*</span>
                  </Label>
                  {primaryLocationError && (
                    <div className="ml-2 text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Required</span>
                    </div>
                  )}
                </div>
                
                <LocationSelector
                  locations={mapLocationsForSelector(locations)}
                  activeLocation={
                    editForm.getValues("location_id") 
                      ? {
                          location_id: editForm.getValues("location_id"),
                          location_name: locations.find(l => l.id === editForm.getValues("location_id"))?.name || "",
                          is_primary: true,
                          created_at: "",
                          updated_at: ""
                        }
                      : null
                  }
                  onLocationChange={(locationId) => {
                    console.log("Setting primary location to:", locationId);
                    editForm.setValue("location_id", locationId);
                    setPrimaryLocationError(false);
                    
                    setSelectedAdditionalLocations(prev => prev.filter(id => id !== locationId));
                    
                    const currentAdditional = editForm.getValues("additional_location_ids") || [];
                    if (Array.isArray(currentAdditional)) {
                      editForm.setValue(
                        "additional_location_ids", 
                        currentAdditional.filter(id => id !== locationId)
                      );
                    }
                  }}
                  required={true}
                  isPrimaryLocation={true}
                />
                
                {!editForm.getValues("location_id") && primaryLocationError && (
                  <p className="text-sm text-red-500 mt-1">Primary location is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  onValueChange={(value) => {
                    if (value === "end_user" || value === "manager" || value === "org_admin") {
                      const role = value as UserRole;
                      editForm.setValue("role", role);
                    }
                  }}
                  defaultValue={editForm.getValues("role")}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="end_user">End User</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="org_admin">Organization Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  onValueChange={(value) => {
                    if (value === "active" || value === "inactive") {
                      const status = value as "active" | "inactive";
                      editForm.setValue("status", status);
                    }
                  }}
                  defaultValue={editForm.getValues("status")}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Additional Locations</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select additional locations the user can access. The primary location above will be automatically excluded.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {locations.map(location => {
                    const isPrimaryLocation = location.id === editForm.getValues("location_id");
                    const isSelected = selectedAdditionalLocations.includes(location.id);
                    
                    return (
                      <div 
                        key={location.id} 
                        className={`flex items-center space-x-2 p-2 rounded-md ${
                          isSelected && !isPrimaryLocation ? 'bg-accent/30' : ''
                        }`}
                      >
                        <Checkbox
                          id={`edit-location-${location.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (isPrimaryLocation) return;
                            handleAdditionalLocationChange(location.id, checked === true);
                          }}
                          disabled={isPrimaryLocation}
                        />
                        <Label 
                          htmlFor={`edit-location-${location.id}`} 
                          className={`text-sm font-normal ${isPrimaryLocation ? "text-muted-foreground" : ""} ${
                            isSelected && !isPrimaryLocation ? 'font-medium' : ''
                          }`}
                        >
                          {location.name}
                          {isPrimaryLocation && <span className="ml-2 text-xs">(Primary - cannot be selected here)</span>}
                          {isSelected && !isPrimaryLocation && <span className="ml-2 text-xs text-primary">✓</span>}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditing(false);
                setPrimaryLocationError(false);
                setSelectedAdditionalLocations([]);
              }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || (!editForm.getValues("location_id") && primaryLocationError)}
              >
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

export default OrganizationUsers;
