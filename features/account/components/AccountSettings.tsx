"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

export function AccountSettings() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    marketing: true,
    orderUpdates: true,
    newProducts: false,
    accountActivity: true,
  });
  const [selectedLanguage, setSelectedLanguage] = useState(language || "ro");
  const [currency, setCurrency] = useState("RON");

  const handleToggleNotification = (key: keyof typeof emailNotifications) => {
    setEmailNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: t("settingsUpdated", "Settings updated"),
        description: t(
          "notificationPreferencesSaved",
          "Your notification preferences have been saved."
        ),
      });
    } catch (error) {
      toast({
        title: t("error", "Error"),
        description: t(
          "failedToUpdateSettings",
          "Failed to update settings. Please try again."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    // Update language cookie and refresh page to apply changes
    setCookie("NEXT_LOCALE", value);
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Apply language change if different from current
      if (selectedLanguage !== language) {
        setCookie("NEXT_LOCALE", selectedLanguage);
        // Refresh the page to apply the language change
        router.refresh();
      }

      toast({
        title: t("preferencesUpdated", "Preferences updated"),
        description: t(
          "accountPreferencesSaved",
          "Your account preferences have been saved."
        ),
      });
    } catch (error) {
      toast({
        title: t("error", "Error"),
        description: t(
          "failedToUpdatePreferences",
          "Failed to update preferences. Please try again."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would show a confirmation dialog
    toast({
      title: t("accountDeletionRequested", "Account deletion requested"),
      description: t(
        "contactSupportToComplete",
        "Please contact support to complete account deletion."
      ),
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("emailNotifications", "Email Notifications")}
          </CardTitle>
          <CardDescription>
            {t("chooseUpdates", "Choose what updates you want to hear about")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">
                {t("marketingEmails", "Marketing emails")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(
                  "receiveMarketingEmails",
                  "Receive emails about new products, features, and more."
                )}
              </p>
            </div>
            <Switch
              id="marketing"
              checked={emailNotifications.marketing}
              onCheckedChange={() => handleToggleNotification("marketing")}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label htmlFor="orderUpdates">
                {t("orderUpdates", "Order updates")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(
                  "receiveOrderEmails",
                  "Receive emails about your order status, shipping, and delivery."
                )}
              </p>
            </div>
            <Switch
              id="orderUpdates"
              checked={emailNotifications.orderUpdates}
              onCheckedChange={() => handleToggleNotification("orderUpdates")}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label htmlFor="newProducts">
                {t("newProducts", "New products")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(
                  "receiveNewProductNotifications",
                  "Get notified when new products are available."
                )}
              </p>
            </div>
            <Switch
              id="newProducts"
              checked={emailNotifications.newProducts}
              onCheckedChange={() => handleToggleNotification("newProducts")}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label htmlFor="accountActivity">
                {t("accountActivity", "Account activity")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(
                  "receiveAccountNotifications",
                  "Get important notifications about your account activity."
                )}
              </p>
            </div>
            <Switch
              id="accountActivity"
              checked={emailNotifications.accountActivity}
              onCheckedChange={() =>
                handleToggleNotification("accountActivity")
              }
            />
          </div>
          <div className="pt-4">
            <Button
              onClick={handleSaveNotifications}
              disabled={isLoading}>
              {isLoading
                ? t("saving", "Saving...")
                : t(
                    "saveNotificationPreferences",
                    "Save notification preferences"
                  )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("accountPreferences", "Account Preferences")}
          </CardTitle>
          <CardDescription>
            {t(
              "manageAccountSettings",
              "Manage your account settings and preferences"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t("language", "Language")}</Label>
              <Select
                value={selectedLanguage}
                onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("selectLanguage", "Select language")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ro">
                    {t("romanian", "Romanian")}
                  </SelectItem>
                  <SelectItem value="en">{t("english", "English")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t("currency", "Currency")}</Label>
              <Select
                value={currency}
                onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("selectCurrency", "Select currency")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RON">RON (lei)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4">
            <Button
              onClick={handleSavePreferences}
              disabled={isLoading}>
              {isLoading
                ? t("saving", "Saving...")
                : t("savePreferences", "Save preferences")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            {t("dangerZone", "Danger Zone")}
          </CardTitle>
          <CardDescription>
            {t(
              "permanentlyDelete",
              "Permanently delete your account and all of your data"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}>
            {t("deleteAccount", "Delete Account")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
