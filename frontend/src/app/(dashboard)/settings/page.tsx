"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { User, Bell, Lock, Palette } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: "Admin User",
    email: "admin@example.com",
    notifications: true,
    emailNotifications: true,
  });
  const { addToast } = useToast();

  const handleSave = () => {
    addToast({
      title: "Settings Saved",
      description: "Pengaturan berhasil disimpan",
      variant: "success",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola preferensi dan pengaturan akun Anda
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Simpan Perubahan
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Terima notifikasi push
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Terima notifikasi via email
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <CardTitle>Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Password Lama</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password Baru</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Konfirmasi Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              <Button variant="outline" className="w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" />
                <CardTitle>Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  <button className="rounded-lg border-2 border-blue-600 bg-white p-3 text-center text-sm font-medium transition-all hover:bg-gray-50">
                    Light
                  </button>
                  <button className="rounded-lg border-2 border-gray-300 bg-gray-900 p-3 text-center text-sm font-medium text-white transition-all hover:bg-gray-800">
                    Dark
                  </button>
                  <button className="rounded-lg border-2 border-gray-300 bg-gradient-to-br from-white to-gray-900 p-3 text-center text-sm font-medium transition-all">
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <p className="font-medium mb-3">Accent Color</p>
                <div className="flex gap-2">
                  {[
                    "bg-blue-600",
                    "bg-purple-600",
                    "bg-green-600",
                    "bg-red-600",
                    "bg-orange-600",
                  ].map((color) => (
                    <button
                      key={color}
                      className={`h-10 w-10 rounded-full ${color} transition-transform hover:scale-110`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
