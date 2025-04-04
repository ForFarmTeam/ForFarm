"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Paintbrush, User, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const handleDeleteAccount = () => {
    toast.warning("Account deletion is not yet implemented.", {
      description: "This feature will be available in a future update.",
      action: { label: "Close", onClick: () => toast.dismiss() },
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-primary" /> Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Label htmlFor="theme" className="whitespace-nowrap">
              Theme
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Add other appearance settings here if needed */}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Account
          </CardTitle>
          <CardDescription>Manage your account details and security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/profile" passHref>
            <Button variant="outline" className="w-full justify-between">
              <span>Edit Profile Information</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => toast.info("Password change coming soon!")}>
            <span>Change Password</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Button>
        </CardContent>
        <Separator className="my-4" />
        <CardFooter className="flex flex-col items-start gap-4">
          <div>
            <h4 className="font-medium text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <Button variant="destructive" onClick={handleDeleteAccount} className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
