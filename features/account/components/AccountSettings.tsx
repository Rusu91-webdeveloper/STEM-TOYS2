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

export function AccountSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState({
    marketing: true,
    orderUpdates: true,
    newProducts: false,
    accountActivity: true,
  });
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");

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
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Preferences updated",
        description: "Your account preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would show a confirmation dialog
    toast({
      title: "Account deletion requested",
      description: "Please contact support to complete account deletion.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose what updates you want to hear about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new products, features, and more.
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
              <Label htmlFor="orderUpdates">Order updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about your order status, shipping, and delivery.
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
              <Label htmlFor="newProducts">New products</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new products are available.
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
              <Label htmlFor="accountActivity">Account activity</Label>
              <p className="text-sm text-muted-foreground">
                Get important notifications about your account activity.
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
              {isLoading ? "Saving..." : "Save notification preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Preferences</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                defaultValue={language}
                onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                defaultValue={currency}
                onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4">
            <Button
              onClick={handleSavePreferences}
              disabled={isLoading}>
              {isLoading ? "Saving..." : "Save preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all of your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
