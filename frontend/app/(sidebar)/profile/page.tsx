// frontend/app/(sidebar)/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Mail, Save, X, Edit, Camera } from "lucide-react";

import { fetchUserMe, UserDataOutput } from "@/api/user"; // Fetch function
import { updateUserProfile, UpdateUserProfileInput } from "@/api/profile"; // Update function
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// Schema for editable fields
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .optional() // Make it optional if user doesn't have one initially
    .or(z.literal("")), // Allow empty string
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current user data
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery<UserDataOutput>({
    queryKey: ["userMe"],
    queryFn: fetchUserMe,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const user = userData?.user;

  // Setup react-hook-form
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
    },
  });

  // Populate form when user data loads or edit mode changes
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || "",
      });
    }
  }, [user, isEditing, form.reset]);

  // Mutation for updating profile
  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully!");
      // Update the cache with the new user data
      queryClient.setQueryData(["userMe"], { user: updatedUser });
      setIsEditing(false); // Exit edit mode
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original values if canceling edit
      form.reset({ username: user?.username || "" });
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = (formData: ProfileFormData) => {
    const updatePayload: UpdateUserProfileInput = {};
    // Only include username if it actually changed
    if (formData.username !== undefined && formData.username !== (user?.username || "")) {
      // Allow setting to empty string if desired, or add validation to prevent it
      updatePayload.username = formData.username;
    }

    if (Object.keys(updatePayload).length > 0) {
      mutation.mutate(updatePayload);
    } else {
      // No changes were made
      setIsEditing(false); // Just exit edit mode
    }
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-destructive">Error loading profile: {(error as Error)?.message}</div>;
  }

  if (!user) {
    return <div className="p-6 text-muted-foreground">User data not found.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View and manage your personal details.</CardDescription>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              size="sm"
              onClick={handleEditToggle}
              disabled={mutation.isPending}>
              {isEditing ? <X className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar Section (Placeholder for upload) */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24 border-2 border-primary/20">
                    <AvatarImage
                      src={user.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${user.email}`}
                      alt={user.username || user.email}
                    />
                    <AvatarFallback className="text-lg">
                      {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isEditing || mutation.isPending}
                    onClick={() => toast.info("Avatar upload coming soon!")}>
                    <Camera className="mr-2 h-3 w-3" /> Change
                  </Button>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  {/* Username Field */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="username" className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4 text-muted-foreground" /> Username
                        </Label>
                        <FormControl>
                          <Input
                            id="username"
                            placeholder="Enter your username"
                            {...field}
                            readOnly={!isEditing}
                            className={
                              !isEditing
                                ? "border-none bg-transparent px-1 shadow-none read-only:focus-visible:ring-0 read-only:focus-visible:ring-offset-0"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field (Read-only) */}
                  <div className="space-y-1">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground" /> Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      readOnly
                      className="border-none bg-transparent px-1 shadow-none read-only:focus-visible:ring-0 read-only:focus-visible:ring-offset-0"
                    />
                    <p className="text-xs text-muted-foreground px-1">Email cannot be changed currently.</p>
                  </div>

                  {/* User ID (Read-only) */}
                  <div className="space-y-1">
                    <Label htmlFor="userId" className="flex items-center gap-1">
                      ID
                    </Label>
                    <Input
                      id="userId"
                      value={user.uuid}
                      readOnly
                      className="border-none bg-transparent px-1 shadow-none text-xs text-muted-foreground read-only:focus-visible:ring-0 read-only:focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button (Visible only in edit mode) */}
              {isEditing && (
                <>
                  <Separator />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
