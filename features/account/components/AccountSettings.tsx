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
        title: t("settingsUpdated", "Setări actualizate"),
        description: t(
          "notificationPreferencesSaved",
          "Preferințele tale de notificare au fost salvate."
        ),
      });
    } catch (error) {
      toast({
        title: t("error", "Eroare"),
        description: t(
          "failedToUpdateSettings",
          "Nu s-au putut actualiza setările. Te rugăm să încerci din nou."
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
        title: t("preferencesUpdated", "Preferințe actualizate"),
        description: t(
          "accountPreferencesSaved",
          "Preferințele contului tău au fost salvate."
        ),
      });
    } catch (error) {
      toast({
        title: t("error", "Eroare"),
        description: t(
          "failedToUpdatePreferences",
          "Nu s-au putut actualiza preferințele. Te rugăm să încerci din nou."
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
      title: t("accountDeletionRequested", "Ștergere cont solicitată"),
      description: t(
        "contactSupportToComplete",
        "Te rugăm să contactezi asistența pentru a finaliza ștergerea contului."
      ),
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("emailNotifications", "Notificări prin Email")}
          </CardTitle>
          <CardDescription>
            {t("chooseUpdates", "Alege ce actualizări dorești să primești")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">
                {t("marketingEmails", "Email-uri de marketing")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(
                  "receiveMarketingEmails",
                  "Primește email-uri despre produse noi, funcții și altele."
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
                {t("orderUpdates", "Actualizări comandă")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(
                  "receiveOrderEmails",
                  "Primește email-uri despre starea comenzii, expediere și livrare."
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
                {t("newProducts", "Produse noi")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(
                  "receiveNewProductNotifications",
                  "Primește notificări când sunt disponibile produse noi."
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
                {t("accountActivity", "Activitate cont")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t(
                  "receiveAccountNotifications",
                  "Primește notificări importante despre activitatea contului tău."
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
                ? t("saving", "Se salvează...")
                : t(
                    "saveNotificationPreferences",
                    "Salvează preferințele de notificare"
                  )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("accountPreferences", "Preferințe Cont")}</CardTitle>
          <CardDescription>
            {t(
              "manageAccountSettings",
              "Gestionează setările și preferințele contului tău"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t("language", "Limbă")}</Label>
              <Select
                value={selectedLanguage}
                onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("selectLanguage", "Selectează limba")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ro">{t("romanian", "Română")}</SelectItem>
                  <SelectItem value="en">{t("english", "Engleză")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t("currency", "Monedă")}</Label>
              <Select
                value={currency}
                onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("selectCurrency", "Selectează moneda")}
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
                ? t("saving", "Se salvează...")
                : t("savePreferences", "Salvează preferințele")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            {t("dangerZone", "Zonă de Pericol")}
          </CardTitle>
          <CardDescription>
            {t(
              "permanentlyDelete",
              "Șterge definitiv contul tău și toate datele tale"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}>
            {t("deleteAccount", "Șterge Contul")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
