"use client";

import { useState, useEffect } from "react";
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
  MessageCircle,
  Loader2,
  Edit,
  ExternalLink
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [settings, setSettings] = useState({
    business_name: "",
    category: "Kuliner / Makanan",
    address: "",
    phone: "",
    email: "",
    description: "",
    tone: "friendly",
  });

  const { addToast } = useToast();

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setSettings({
        business_name: profile.business_name || "",
        category: profile.category || "Kuliner / Makanan",
        address: profile.address || "",
        phone: profile.phone || "",
        email: profile.email || "",
        description: profile.description || "",
        tone: "friendly"
      });
      setLogoPreview(profile.logo_url || "");
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dapur-umkm/profile`);
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!settings.business_name) {
      addToast({
        title: "Error",
        description: "Nama bisnis wajib diisi!",
        variant: "error",
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/dapur-umkm/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile?.id,
          ...settings
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setProfile(data.data);
        addToast({
          title: "Berhasil! ✅",
          description: "Settings berhasil disimpan & landing page sudah diupdate!",
          variant: "success",
        });
        
        // Trigger landing page refresh
        if (typeof window !== 'undefined') {
          // For other tabs
          localStorage.setItem('profile_updated', Date.now().toString());
          // For same tab (if landing page is in iframe/embedded)
          window.dispatchEvent(new Event('profileUpdated'));
        }
      } else {
        addToast({
          title: "Error",
          description: data.message || "Gagal menyimpan settings",
          variant: "error",
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      addToast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) {
      if (!profile?.id) {
        addToast({
          title: "Perhatian",
          description: "Simpan profil terlebih dahulu sebelum upload logo",
          variant: "error",
        });
      }
      return;
    }

    // Validate
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        title: "Format Salah",
        description: "Format file harus JPEG, PNG, WebP, atau GIF",
        variant: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: "File Terlalu Besar",
        description: "Ukuran file maksimal 5MB",
        variant: "error",
      });
      return;
    }

    try {
      setIsUploadingLogo(true);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('profile_id', profile.id);

      const res = await fetch(`${API_URL}/api/dapur-umkm/upload-logo`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.data.profile);
        addToast({
          title: "Logo Uploaded! 🎨",
          description: "Logo berhasil diupload & landing page sudah diupdate!",
          variant: "success",
        });
        
        // Trigger landing page refresh
        if (typeof window !== 'undefined') {
          localStorage.setItem('profile_updated', Date.now().toString());
          window.dispatchEvent(new Event('profileUpdated'));
        }
      } else {
        addToast({
          title: "Upload Gagal",
          description: data.message || "Gagal upload logo",
          variant: "error",
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      addToast({
        title: "Error",
        description: "Terjadi kesalahan saat upload logo",
        variant: "error",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Settings UMKM
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Kelola profil bisnis - perubahan akan langsung terlihat di landing page.
            </p>
          </div>
          <a 
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Lihat Landing Page
          </a>
        </div>

        {/* SINGLE COLUMN LAYOUT */}
        <div className="space-y-6 max-w-4xl">
          
          {/* BUSINESS PROFILE CARD */}
          <Card className="shadow-sm border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                <CardTitle>Profil Bisnis UMKM</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Nama Bisnis <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={settings.business_name}
                    onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                    placeholder="Contoh: Coto Makassar Pak Amir"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">Kategori</label>
                  <select
                    value={settings.category}
                    onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="Kuliner / Makanan">Kuliner / Makanan</option>
                    <option value="Fashion / Pakaian">Fashion / Pakaian</option>
                    <option value="Kerajinan Tangan">Kerajinan Tangan</option>
                    <option value="Jasa">Jasa</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">Alamat</label>
                  <Input
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Jl. Pengayoman No. 10, Makassar"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">Nomor Telepon</label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="0812-3456-7890"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="bisnis@example.com"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Deskripsi Bisnis</label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Ceritakan tentang bisnis UMKM Anda..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* LOGO UPLOAD CARD */}
          <Card className="shadow-sm border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-blue-600" />
                <CardTitle>Logo UMKM</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {logoPreview && (
                <div className="flex justify-center">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="h-32 w-32 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 block mb-2">
                  Upload Logo (JPEG, PNG, WebP, GIF - Max 5MB)
                </label>
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo || !profile?.id}
                  className="cursor-pointer"
                />
                {!profile?.id && (
                  <p className="text-xs text-amber-600 mt-1">
                    💡 Simpan profil terlebih dahulu sebelum upload logo
                  </p>
                )}
              </div>

              {isUploadingLogo && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Uploading logo...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SAVE BUTTON */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Simpan Semua Perubahan
                </>
              )}
            </Button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
