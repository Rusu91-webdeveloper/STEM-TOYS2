import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      <Tabs
        defaultValue="general"
        className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent
          value="general"
          className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input
                    id="store-name"
                    defaultValue="TechTots"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-url">Store URL</Label>
                  <Input
                    id="store-url"
                    defaultValue="https://techtots.com"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="store-description">Store Description</Label>
                  <Textarea
                    id="store-description"
                    defaultValue="TechTots is a premier online destination for STEM toys that inspire learning through play."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    defaultValue="info@techtots.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure regional settings for your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                      <SelectItem value="aud">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="america-new_york">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-new_york">
                        America/New_York (UTC-5)
                      </SelectItem>
                      <SelectItem value="america-los_angeles">
                        America/Los_Angeles (UTC-8)
                      </SelectItem>
                      <SelectItem value="europe-london">
                        Europe/London (UTC+0)
                      </SelectItem>
                      <SelectItem value="europe-paris">
                        Europe/Paris (UTC+1)
                      </SelectItem>
                      <SelectItem value="asia-tokyo">
                        Asia/Tokyo (UTC+9)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY/MM/DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight-unit">Weight Unit</Label>
                  <Select defaultValue="lb">
                    <SelectTrigger id="weight-unit">
                      <SelectValue placeholder="Select weight unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Configure search engine optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta-title">Meta Title</Label>
                  <Input
                    id="meta-title"
                    defaultValue="TechTots | STEM Toys for Curious Minds"
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears in browser tabs and search engine results (50-60
                    characters recommended)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-description">Meta Description</Label>
                  <Textarea
                    id="meta-description"
                    defaultValue="Discover the best STEM toys for curious minds at TechTots. Educational toys that make learning fun for children of all ages."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears in search engine results (150-160 characters
                    recommended)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-keywords">Meta Keywords</Label>
                  <Input
                    id="meta-keywords"
                    defaultValue="STEM toys, educational toys, science toys, technology toys, engineering toys, math toys"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent
          value="shipping"
          className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Methods</CardTitle>
              <CardDescription>
                Configure available shipping methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="standard-shipping">Standard Shipping</Label>
                    <span className="text-sm text-muted-foreground">
                      3-5 business days
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[100px]">
                      <Input
                        id="standard-shipping"
                        defaultValue="5.99"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <Switch
                      defaultChecked
                      id="standard-shipping-active"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="express-shipping">Express Shipping</Label>
                    <span className="text-sm text-muted-foreground">
                      1-2 business days
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[100px]">
                      <Input
                        id="express-shipping"
                        defaultValue="12.99"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <Switch
                      defaultChecked
                      id="express-shipping-active"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="free-shipping-threshold">
                      Free Shipping Threshold
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      Orders above this amount qualify for free shipping
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[100px]">
                      <Input
                        id="free-shipping-threshold"
                        defaultValue="75.00"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <Switch
                      defaultChecked
                      id="free-shipping-active"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Payments Settings */}
        <TabsContent
          value="payments"
          className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure available payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label>Credit Card Payments</Label>
                    <span className="text-sm text-muted-foreground">
                      Accept Visa, Mastercard, American Express
                    </span>
                  </div>
                  <Switch
                    defaultChecked
                    id="credit-card-active"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label>PayPal</Label>
                    <span className="text-sm text-muted-foreground">
                      Allow customers to pay with PayPal
                    </span>
                  </div>
                  <Switch
                    defaultChecked
                    id="paypal-active"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label>Apple Pay</Label>
                    <span className="text-sm text-muted-foreground">
                      Accept Apple Pay for iOS devices
                    </span>
                  </div>
                  <Switch id="apple-pay-active" />
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label>Google Pay</Label>
                    <span className="text-sm text-muted-foreground">
                      Accept Google Pay for Android devices
                    </span>
                  </div>
                  <Switch id="google-pay-active" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented in a similar way */}
        <TabsContent
          value="tax"
          className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>
                Configure tax rates and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Tax settings content would go here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email and system notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Notification settings content would go here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="users"
          className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage admin users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  User management content would go here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
