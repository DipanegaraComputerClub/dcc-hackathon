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
import { Mail, Lock, Sparkles, Store, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (
      formData.email !== "admin@example.com" ||
      formData.password !== "password123"
    ) {
      setTimeout(() => {
        setIsLoading(false);
        setError("Email atau password salah ki', coba lagi nah!");
      }, 500);
      return;
    }

    setTimeout(() => {
      localStorage.setItem("token", "demo_token_123");
      localStorage.setItem("user", JSON.stringify({ name: "Daeng Kuliner", email: "admin@example.com" }));
      setIsLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  // --- STYLE BARU (LEBIH LEGA) ---
  // pl-12: Memberi jarak 48px dari kiri (Supaya tidak nabrak ikon Email/Lock)
  // pr-12: Memberi jarak 48px dari kanan (Supaya tidak nabrak ikon Mata)
  const inputStyle = "w-full h-12 rounded-xl border border-gray-200 bg-white/50 dark:bg-gray-900/50 pl-12 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-800 dark:text-white dark:focus:bg-[#020617] dark:focus:border-red-500";
  
  // Posisi Icon dimundurkan sedikit (left-4) biar imbang
  const iconLeftStyle = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none";
  const iconRightStyle = "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 opacity-[0.03]" 
              style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>
         <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-red-600/10 dark:bg-red-900/20 rounded-full blur-[80px] opacity-70"></div>
         <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-900/20 rounded-full blur-[80px] opacity-70"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* LOGO */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl shadow-red-600/20 mb-4 transform hover:scale-105 transition-transform duration-300">
                <Store className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                TABE AI
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Masuk ki' untuk kelola bisnis ta' 🚀
            </p>
        </div>

        {/* CARD LOGIN */}
        <Card className="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-2 text-center border-b border-gray-100 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50">
            <CardTitle className="text-xl font-bold">Selamat Datang Kembali</CardTitle>
            <CardDescription>Masukkan email & password akun ta'</CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-start gap-3 animate-in shake">
                <Sparkles className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* INPUT EMAIL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                    Email
                </label>
                <div className="relative group">
                  {/* Ikon di Kiri */}
                  <Mail className={iconLeftStyle} />
                  
                  <Input
                    type="email"
                    placeholder="contoh@umkm.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputStyle} // Pakai style baru (pl-12)
                    required
                  />
                </div>
              </div>

              {/* INPUT PASSWORD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">
                        Password
                    </label>
                    <Link href="#" className="text-xs font-medium text-red-600 hover:text-red-500 hover:underline">
                        Lupa password?
                    </Link>
                </div>
                <div className="relative group">
                  {/* Ikon Kunci di Kiri */}
                  <Lock className={iconLeftStyle} />
                  
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputStyle} // Pakai style baru (pl-12 pr-12)
                    required
                  />
                  
                  {/* Tombol Mata di Kanan */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={iconRightStyle}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* TOMBOL LOGIN */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg shadow-red-600/20 font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 group mt-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                    "Lagi memproses..."
                ) : (
                    <>
                      Masuk Sekarang <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-[#0b0f19] px-2 text-gray-500 rounded-full">Atau</span>
                </div>
            </div>

            {/* Link Register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Belum punya akun TABE AI?{" "}
                <Link
                  href="/register"
                  className="font-bold text-red-600 hover:text-red-500 hover:underline transition-colors"
                >
                  Daftar gratis di sini
                </Link>
              </p>
            </div>
          </CardContent>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center border-t border-gray-100 dark:border-gray-800">
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Demo: <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">admin@example.com</span> / <span className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">password123</span>
             </p>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
            &copy; 2025 TABE AI - Karya Anak Makassar
        </p>

      </div>
    </div>
  );
}