"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  useEffect(() => {
    // User already loaded from localStorage in useState initializer
  }, []);

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
                <AvatarImage src={user?.avatar || ""} />
                <AvatarFallback>
                  {user?.name
                    ? user.name.substring(0, 2).toUpperCase()
                    : "US"}
                </AvatarFallback>
              </Avatar>

              <Button variant="secondary">Ganti Foto</Button>
            </div>

            {/* Form */}
            <div className="grid gap-4">
              <div>
                <label className="text-sm">Nama Lengkap</label>
                <Input
                  defaultValue={user?.name || ""}
                  placeholder="Nama Anda"
                />
              </div>

              <div>
                <label className="text-sm">Email</label>
                <Input
                  defaultValue={user?.email || ""}
                  placeholder="Email Anda"
                />
              </div>

              <div>
                <label className="text-sm">Nomor Telepon</label>
                <Input placeholder="+62xxxxx" />
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
