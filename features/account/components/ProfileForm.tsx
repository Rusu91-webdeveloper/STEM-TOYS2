"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

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
  const router = useRouter();
  const { t } = useTranslation();
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
          title: t("passwordsDontMatch", "Parolele nu se potrivesc"),
          description: t(
            "passwordsMatchError",
            "Te rugăm să te asiguri că parolele se potrivesc"
          ),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Prepare request data
      const requestData = {
        name: data.name,
        email: data.email,
        newPassword: data.newPassword || null,
      };

      // Call the API
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            t("profileUpdateFailed", "Nu s-a putut actualiza profilul")
        );
      }

      // If password is being updated, show specific message
      if (data.newPassword) {
        toast({
          title: t("passwordUpdated", "Parola a fost actualizată"),
          description: t(
            "passwordUpdateSuccess",
            "Parola ta a fost schimbată cu succes."
          ),
          variant: "default",
        });
      } else {
        toast({
          title: t("profileUpdated", "Profil actualizat"),
          description: t(
            "profileUpdateSuccess",
            "Informațiile profilului tău au fost actualizate cu succes."
          ),
        });
      }

      // Reset password fields
      reset({
        ...data,
        newPassword: "",
        confirmPassword: "",
      });

      // Refresh the page to update user session
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      // Determine if password change failed
      if (watchNewPassword) {
        toast({
          title: t("passwordUpdateFailed", "Actualizarea parolei a eșuat"),
          description:
            error instanceof Error
              ? error.message
              : t("tryAgain", "Te rugăm să încerci din nou."),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("error", "Eroare"),
          description:
            error instanceof Error
              ? error.message
              : t(
                  "profileUpdateError",
                  "A apărut o eroare la actualizarea profilului tău"
                ),
          variant: "destructive",
        });
      }
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
          <h3 className="text-lg font-medium mb-2">
            {t("profilePicture", "Poză de profil")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t(
              "profilePictureDescription",
              "Aceasta va fi afișată pe profilul tău"
            )}
          </p>
          <div className="flex gap-4">
            <Button
              type="button"
              size="sm"
              variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              {t("change", "Schimbă")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline">
              {t("remove", "Elimină")}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name", "Nume")}</Label>
            <Input
              id="name"
              {...register("name", {
                required: t("nameRequired", "Numele este obligatoriu"),
              })}
              placeholder={t("yourName", "Numele tău")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email", "Email")}</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: t("emailRequired", "Emailul este obligatoriu"),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("invalidEmail", "Adresă de email invalidă"),
                },
              })}
              placeholder={t("yourEmail", "Emailul tău")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">{t("password", "Parolă")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t("newPassword", "Parolă nouă")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              placeholder={t(
                "leaveBlankPassword",
                "Leave blank to keep current password"
              )}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("confirmNewPassword", "Confirmă parola nouă")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                validate: (value) =>
                  !watchNewPassword ||
                  value === watchNewPassword ||
                  t("passwordsDontMatch", "Parolele nu se potrivesc"),
              })}
              placeholder={t(
                "confirmNewPasswordPlaceholder",
                "Confirm new password"
              )}
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
          {isLoading
            ? t("saving", "Se salvează...")
            : t("saveChanges", "Salvează modificările")}
        </Button>
      </div>
    </form>
  );
}
