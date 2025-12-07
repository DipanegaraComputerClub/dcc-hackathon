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
import { LayoutDashboard, Mail, Lock, User, Store, ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    business_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // State untuk intip password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter, Daeng!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok, Daeng! Cek lagi nah.");
      return;
    }

    if (!isChecked) {
      setError("Centang dulu syarat & ketentuannya, Daeng.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        business_name: formData.business_name || formData.name,
      });
      
      setSuccess("Registrasi berhasil! Cek email Anda untuk verifikasi akun. Jika tidak ada di inbox, cek folder spam.");
      // Don't redirect, let user read the message
    } catch (err: any) {
      setError(err.message || "Registrasi gagal. Coba lagi nah!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Gagal daftar dengan Google');
      setIsLoading(false);
    }
  };

  // --- STYLE KONSISTEN (ANTI TABRAKAN) ---
  // pl-12: Jarak kiri lega untuk ikon
  // pr-12: Jarak kanan lega untuk tombol mata
  const inputStyle = "w-full h-12 rounded-xl border border-gray-200 bg-white/50 dark:bg-gray-900/50 pl-12 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-800 dark:text-white dark:focus:bg-[#020617] dark:focus:border-red-500";
  
  const iconLeftStyle = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none";
  const iconRightStyle = "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors";
  const labelStyle = "text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 opacity-[0.03]" 
              style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 dark:bg-red-900/20 rounded-full blur-[80px] opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-900/20 rounded-full blur-[80px] opacity-70 translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl shadow-red-600/20 mb-4 transform hover:scale-105 transition-transform duration-300">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Gabung TABE AI
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Mulai langkah digitalisasi UMKM ta' 🚀
          </p>
        </div>

        {/* CARD REGISTER */}
        <Card className="border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-2 text-center border-b border-gray-100 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50">
            <CardTitle className="text-xl font-bold">Buat Akun Baru</CardTitle>
            <CardDescription>Gratis ji pendaftarannya, Daeng!</CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* NAMA LENGKAP */}
              <div className="space-y-1.5">
                <label className={labelStyle}>Nama Lengkap</label>
                <div className="relative group">
                  <User className={iconLeftStyle} />
                  <Input
                    type="text"
                    placeholder="Contoh: Daeng Kuliner"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className={labelStyle}>Email</label>
                <div className="relative group">
                  <Mail className={iconLeftStyle} />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* NAMA BISNIS */}
              <div className="space-y-1.5">
                <label className={labelStyle}>Nama Bisnis (Opsional)</label>
                <div className="relative group">
                  <Store className={iconLeftStyle} />
                  <Input
                    type="text"
                    placeholder="Contoh: Coto Makassar Enak"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <label className={labelStyle}>Password</label>
                <div className="relative group">
                  <Lock className={iconLeftStyle} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={iconRightStyle}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* KONFIRMASI PASSWORD */}
              <div className="space-y-1.5">
                <label className={labelStyle}>Ulangi Password</label>
                <div className="relative group">
                  <CheckCircle2 className={iconLeftStyle} />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={inputStyle}
                    required
                  />
                   <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={iconRightStyle}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                </div>
              )}

              {/* CHECKBOX */}
              <div className="flex items-start gap-3 pt-2">
                <div className="flex items-center h-5">
                    <input
                    id="terms"
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-red-600 dark:ring-offset-gray-800"
                    />
                </div>
                <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400 leading-tight cursor-pointer">
                  Saya setuju dengan <Link href="#" className="text-red-600 hover:underline font-bold">Syarat & Ketentuan</Link> serta <Link href="#" className="text-red-600 hover:underline font-bold">Kebijakan Privasi</Link>.
                </label>
              </div>

              {/* TOMBOL DAFTAR */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg shadow-red-600/20 font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 group mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Lagi Mendaftar..." : (
                    <>
                        Daftar Sekarang <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                  Atau daftar dengan
                </span>
              </div>
            </div>

            {/* MAGIC LINK BUTTON */}
            <Link href="/magic-link">
              <Button
                type="button"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg shadow-purple-600/20 font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                🪄 Daftar dengan Magic Link
              </Button>
            </Link>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Lebih mudah! Tidak perlu password
            </p>

            {/* LINK LOGIN */}
            <div className="mt-6 text-center text-sm border-t border-gray-100 dark:border-gray-800 pt-6">
              <span className="text-gray-500 dark:text-gray-400">
                Sudah punya akun ki'?{" "}
              </span>
              <Link
                href="/login"
                className="font-bold text-red-600 hover:text-red-700 hover:underline dark:text-red-400 transition-colors"
              >
                Masuk di sini
              </Link>
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