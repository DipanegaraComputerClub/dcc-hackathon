"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  User,
  Store,
  Image,
  MessageCircle
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: "Admin User",
    email: "admin@example.com",
    storeName: "UMKM Makassar",
    storeLocation: "Makassar, Indonesia",
    storeDescription: "Menjual makanan khas Makassar.",
    tone: "friendly",
    logo: null as File | null,
    productImage: null as File | null,
  });

  const { addToast } = useToast();

  const handleSave = () => {
    addToast({
      title: "Settings Saved",
      description: "Pengaturan berhasil disimpan.",
      variant: "success",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Brand Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola akun dan brand UMKM Anda.
          </p>
        </div>

        {/* GRID COMPONENTS */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* PROFILE SETTINGS */}
          <Card className="shadow-sm border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle>Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Nama</label>
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                Simpan Profile
              </Button>
            </CardContent>
          </Card>

          {/* UMKM INFO */}
          <Card className="shadow-sm border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                <CardTitle>UMKM Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="text-sm">Nama Toko / Brand</label>
                <Input
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm">Lokasi</label>
                <Input
                  value={settings.storeLocation}
                  onChange={(e) =>
                    setSettings({ ...settings, storeLocation: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm">Deskripsi</label>
                <Textarea
                  value={settings.storeDescription}
                  onChange={(e) =>
                    setSettings({ ...settings, storeDescription: e.target.value })
                  }
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                Simpan UMKM
              </Button>
            </CardContent>
          </Card>

          {/* UPLOAD MEDIA */}
          <Card className="shadow-sm border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-blue-600" />
                <CardTitle>Brand Media</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <label className="text-sm">Logo UMKM</label>
                <Input
                  type="file"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      logo: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm">Foto Produk</label>
                <Input
                  type="file"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      productImage: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                Upload
              </Button>
            </CardContent>
          </Card>

          {/* TONE OF VOICE */}
          <Card className="shadow-sm border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <CardTitle>Tone of Voice</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <label className="text-sm">Gaya Bahasa Brand</label>

              <select
                className="w-full rounded-lg border p-2 bg-white dark:bg-gray-900"
                value={settings.tone}
                onChange={(e) =>
                  setSettings({ ...settings, tone: e.target.value })
                }
              >
                <option value="friendly">Friendly & Ramah</option>
                <option value="professional">Professional</option>
                <option value="energetic">Energetic</option>
                <option value="funny">Lucu & Santai</option>
              </select>

              <Button onClick={handleSave} className="w-full">
                Simpan Tone
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
