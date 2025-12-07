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
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/config/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShowResendLink(false);

    try {
      await login(formData.email, formData.password);
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err.message || "Email atau password salah ki', coba lagi nah!";
      setError(errorMessage);
      
      // Show resend link if email not verified
      if (errorMessage.includes('Email belum diverifikasi')) {
        setShowResendLink(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google');
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResendMessage(data.message);
        setShowResendLink(false);
      } else {
        setResendMessage(data.error || 'Gagal mengirim email');
      }
    } catch (err) {
      setResendMessage('Terjadi kesalahan');
    } finally {
      setResendLoading(false);
    }
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

              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  {showResendLink && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="text-sm text-red-700 dark:text-red-300 font-medium hover:underline mt-2"
                    >
                      {resendLoading ? 'Mengirim...' : 'Kirim ulang email verifikasi'}
                    </button>
                  )}
                </div>
              )}

              {/* RESEND SUCCESS MESSAGE */}
              {resendMessage && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-600 dark:text-green-400">{resendMessage}</p>
                </div>
              )}

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

            {/* DIVIDER */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 dark:text-gray-400 font-medium">
                  Atau
                </span>
              </div>
            </div>

            {/* MAGIC LINK BUTTON */}
            <Link href="/magic-link">
              <Button
                type="button"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg shadow-purple-600/20 font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                🪄 Login dengan Magic Link
              </Button>
            </Link>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Lebih mudah! Tidak perlu password
            </p>

            {/* GOOGLE/GITHUB LOGIN - Uncomment setelah setup di Supabase
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-base transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Login dengan Google
            </Button>
            */}

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
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
            &copy; 2025 TABE AI - Karya Anak Makassar
        </p>

      </div>
    </div>
  );
}