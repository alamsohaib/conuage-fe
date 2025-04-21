
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
import { UsageStatisticsCharts } from "@/components/profile/UsageStatisticsCharts";

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
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2 dark:text-white/80 hover:dark:text-white" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold dark:text-white">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    {photoPreview ? (
                      <AvatarImage src={photoPreview} alt="Profile preview" />
                    ) : (
                      <>
                        <AvatarImage src={profile?.profile_photo_url} alt={profile?.first_name} />
                        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  
                  <label 
                    htmlFor="photo-upload" 
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 cursor-pointer shadow-md transition-colors"
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
                  <div className="flex gap-2 mt-2 justify-center">
                    <Button onClick={handlePhotoUpload} disabled={isUploadingPhoto} size="sm">
                      {isUploadingPhoto ? 'Uploading...' : 'Save Photo'}
                    </Button>
                    <Button onClick={cancelPhotoUpload} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                )}

                <h3 className="text-xl font-semibold mt-4 mb-1">{profile?.first_name} {profile?.last_name}</h3>
                <span className="text-sm text-muted-foreground mb-4">{profile?.email}</span>

                <div className="w-full space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Shield className="h-4 w-4 mr-2" />
                      Role
                    </div>
                    <span className="capitalize">{profile?.role.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Badge className="h-4 w-4 mr-2" />
                      Status
                    </div>
                    <span className="capitalize">{profile?.status}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      Last Login
                    </div>
                    <span>{profile?.last_login ? formatDate(profile.last_login) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email Verified</span>
                  <span>{profile?.email_verified ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDate(profile?.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Locations Card */}
          {profile?.locations && profile.locations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Assigned Locations</CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="space-y-1.5">
                  {profile.locations.map((location) => (
                    <div 
                      key={location.location_id} 
                      className="flex items-center p-2 rounded-md bg-accent/30 text-sm"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-2 flex-shrink-0" />
                      <span className="font-medium truncate">{location.location_name}</span>
                      {location.is_primary && (
                        <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Forms and Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
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

                  <div className="flex justify-end">
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

          {/* Usage Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Your token usage overview</CardDescription>
            </CardHeader>
            <CardContent>
              <UsageStatisticsCharts
                chatTokens={profile?.chat_tokens_used ?? 0}
                documentTokens={profile?.document_processing_tokens_used ?? 0}
                dailyChatTokens={profile?.daily_chat_tokens_used ?? 0}
                dailyDocumentTokens={profile?.daily_document_processing_tokens_used ?? 0}
                dailyLimit={profile?.daily_token_limit ?? 0}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

