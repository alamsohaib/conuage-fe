
import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Profile, UpdateProfileRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Camera, User, Mail, Calendar, Shield, ChevronLeft, Pencil, Badge, Clock, AlertTriangle, MapPin } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { profile: authProfile, userRole } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await api.auth.getProfile();
        if (data) {
          setProfile(data);
          form.reset({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
          });
        } else if (error) {
          toast.error(error.message || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      const updateData: UpdateProfileRequest = {
        first_name: values.first_name,
        last_name: values.last_name,
      };

      const { data, error } = await api.auth.updateProfile(updateData);
      if (data) {
        setProfile(data);
        toast.success("Profile updated successfully");
      } else if (error) {
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    
    setIsUploadingPhoto(true);
    try {
      const { data, error } = await api.auth.updateProfilePhoto(photoFile);
      if (data) {
        // Refetch profile to get updated photo URL
        const profileResponse = await api.auth.getProfile();
        if (profileResponse.data) {
          setProfile(profileResponse.data);
        }
        toast.success("Profile photo updated successfully");
        setPhotoFile(null);
        setPhotoPreview(null);
      } else if (error) {
        toast.error(error.message || "Failed to update profile photo");
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      toast.error("Failed to update profile photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const cancelPhotoUpload = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const initials = profile ? 
    `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || ''}` : 
    (profile?.email.charAt(0) || '').toUpperCase();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
  };

  return (
    <div className="container py-10 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column - Photo and basic info */}
        <div className="md:col-span-4">
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-4 group">
                <Avatar className="h-32 w-32">
                  {photoPreview ? (
                    <AvatarImage src={photoPreview} alt="Profile preview" />
                  ) : (
                    <>
                      <AvatarImage src={profile?.profile_photo_url} alt={profile?.first_name} />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <label 
                  htmlFor="photo-upload" 
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Upload new photo</span>
                </label>
                
                <input 
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
              </div>

              {photoFile && (
                <div className="flex gap-2 mt-2">
                  <Button onClick={handlePhotoUpload} disabled={isUploadingPhoto} size="sm">
                    {isUploadingPhoto ? 'Uploading...' : 'Save Photo'}
                  </Button>
                  <Button onClick={cancelPhotoUpload} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              )}

              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="text-sm">{profile?.first_name} {profile?.last_name}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="text-sm truncate">{profile?.email}</span>
                </div>

                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="text-sm capitalize">{profile?.role.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center">
                  <Badge className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="text-sm capitalize">{profile?.status}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="text-sm">
                    Last login: {profile?.last_login ? formatDate(profile.last_login) : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="text-sm">
                    Created: {formatDate(profile?.created_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* User ID Card */}
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start">
                <span className="font-medium min-w-24">User ID:</span>
                <span className="text-muted-foreground break-all">{profile?.id}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium min-w-24">Email Verified:</span>
                <span className="text-muted-foreground">
                  {profile?.email_verified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium min-w-24">Updated At:</span>
                <span className="text-muted-foreground">{formatDate(profile?.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - User information form */}
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal information here</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="submit"
                      disabled={isUpdating || !form.formState.isDirty}
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Chat Tokens Used:</span>
                  <span className="font-medium">{profile?.chat_tokens_used ?? 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Document Processing Tokens Used:</span>
                  <span className="font-medium">{profile?.document_processing_tokens_used ?? 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Daily Chat Tokens Used:</span>
                  <span className="font-medium">{profile?.daily_chat_tokens_used ?? 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Daily Document Processing Tokens Used:</span>
                  <span className="font-medium">{profile?.daily_document_processing_tokens_used ?? 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Daily Token Limit:</span>
                  <span className="font-medium">{profile?.daily_token_limit ?? 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* User Locations */}
          {profile?.locations && profile.locations.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Assigned Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.locations.map((location) => (
                    <div key={location.location_id} className="p-4 border rounded-md">
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{location.location_name}</span>
                        {location.is_primary && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span>Location ID:</span>
                          <span className="font-mono text-xs">{location.location_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Added:</span>
                          <span>{formatDate(location.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Updated:</span>
                          <span>{formatDate(location.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
