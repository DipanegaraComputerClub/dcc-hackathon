"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (
      formData.email !== "admin@example.com" ||
      formData.password !== "password123"
    ) {
      setIsLoading(false);
      setError("Email atau password salah, mi!");
      return;
    }

    setTimeout(() => {
      localStorage.setItem("auth_token", "demo_token_123");
      setIsLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2 justify-center">
            <div className="rounded-full bg-gradient-to-br from-yellow-500 to-red-500 p-5 shadow-lg shadow-yellow-400/30 animate-pulse">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent">
            TABE AI
          </h1>

          <p className="text-gray-700 dark:text-gray-300 mt-1">
            Selamat datang kembali, Masuk dan mulai tingkatkan UMKM-mu
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border border-yellow-200">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Masukkan email & password untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <p className="mb-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-300 p-2 rounded-md">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="nama@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Login, mi!"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                Belum punya akun?
              </span>{" "}
              <Link
                href="/register"
                className="font-medium text-red-500 hover:underline dark:text-red-400"
              >
                Daftar sekarang mi
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-4 rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900/20">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
            Demo Credentials:
          </p>
          <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">
            Email: admin@example.com
          </p>
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
}
