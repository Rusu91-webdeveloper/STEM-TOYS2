"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ProfileFormData {
  name: string;
  email: string;
  image?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    image?: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      image: initialData.image,
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchNewPassword = watch("newPassword");

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Validate password match if new password is provided
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        toast({
          title: "Passwords do not match",
          description: "Please make sure your passwords match",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // In a real app, we would send the data to an API
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });

      // Reset password fields
      reset({
        ...data,
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={initialData.image}
              alt={initialData.name}
            />
            <AvatarFallback className="text-2xl">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Profile Picture</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This will be displayed on your profile
          </p>
          <div className="flex gap-4">
            <Button
              type="button"
              size="sm"
              variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Change
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline">
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="Your name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="Your email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              placeholder="Leave blank to keep current password"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                validate: (value) =>
                  !watchNewPassword ||
                  value === watchNewPassword ||
                  "Passwords do not match",
              })}
              placeholder="Confirm new password"
              disabled={isLoading || !watchNewPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
