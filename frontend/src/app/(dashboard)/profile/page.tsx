"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, updateProfile, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    business_name: "",
    phone: "",
    address: "",
    description: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        description: profile.description || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      await updateProfile(formData);
      await refreshUser();
      setMessage("Profil berhasil diperbarui!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(error.message || "Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Profil Akun
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola data akun Anda di sini.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informasi Pengguna</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {user?.name
                    ? user.name.substring(0, 2).toUpperCase()
                    : "US"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded ${message.includes('berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input
                  value={user?.name || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Nama tidak bisa diubah</p>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email tidak bisa diubah</p>
              </div>

              <div>
                <label className="text-sm font-medium">Nama Bisnis</label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  placeholder="Nama UMKM/Bisnis Anda"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nomor Telepon</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+62xxxxx"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Alamat</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Alamat lengkap"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Deskripsi Bisnis</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ceritakan tentang bisnis Anda"
                />
              </div>

              <Button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
