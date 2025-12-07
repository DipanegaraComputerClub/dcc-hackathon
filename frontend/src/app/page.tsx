"use client";
import { API_URL } from "@/config/api";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Store,
  Zap,
  Shield,
  Palette,
  ArrowRight,
  Sparkles,
  MessageCircle,
  TrendingUp,
  CheckCircle2
} from "lucide-react";


export default function Home() {
  const [umkmProfile, setUmkmProfile] = useState<any>(null);

  const loadProfile = () => {
    fetch(`${API_URL}/dapur-umkm/public/profile`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setUmkmProfile(data.data);
        }
      })
      .catch(err => console.error('Error loading UMKM profile:', err));
  };

  useEffect(() => {
    // Load UMKM profile for dynamic branding
    loadProfile();

    // Listen for profile updates from settings page
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profile_updated') {
        loadProfile();
      }
    };

    // Listen for localStorage changes (from other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Listen for same-tab updates (custom event)
    const handleProfileUpdate = () => {
      loadProfile();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] relative overflow-hidden selection:bg-red-500 selection:text-white">
      
      {/* === STYLE TAMBAHAN UNTUK ANIMASI === */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(to right, #dc2626 40%, #f87171 50%, #dc2626 60%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* === DEKORASI LATAR (ANIMATED BLOBS) === */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 opacity-[0.03]" 
              style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>
         {/* Blob Merah - Bergerak */}
         <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/10 dark:bg-red-900/20 rounded-full blur-[100px] animate-blob"></div>
         {/* Blob Orange - Bergerak Delay */}
         <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
         {/* Blob Tambahan - Tengah */}
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* === NAVBAR === */}
      <nav className="relative z-10 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white group cursor-pointer">
            {umkmProfile?.logo_url ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-lg shadow-red-500/20 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
                <img 
                  src={umkmProfile.logo_url} 
                  alt={umkmProfile.business_name || "Logo"} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-2 rounded-lg text-white shadow-lg shadow-red-500/20 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
                <Store className="h-5 w-5" />
              </div>
            )}
            <span className="tracking-tight">{umkmProfile?.business_name || "TABE AI"}</span>
        </div>
        <div className="flex gap-3 md:gap-4">
            <Link href="/login">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105 active:scale-95">
                    Masuk
                </Button>
            </Link>
            <Link href="/register">
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 hover:shadow-red-500/40">
                    Daftar Ki'
                </Button>
            </Link>
        </div>
      </nav>

      {/* === HERO SECTION === */}
      <div className="container relative z-10 mx-auto px-4 py-16 lg:py-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 justify-center px-4 py-1.5 rounded-full bg-white/50 dark:bg-red-900/10 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium animate-in fade-in zoom-in-95 duration-700 delay-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-default">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Solusi Cerdas untuk UMKM Makassar</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Bikin Usaha Makin <br/>
            {/* Teks Shimmer (Mengkilap) */}
            <span className="animate-shimmer">
              Gagah & Laris Manis!
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Asisten AI asli anak Makassar, siap bantu ki' bikin konten, atur jualan, sampai layani pelanggan. Tidak pake ribet, gampang sekali mi dipakai!
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 rounded-xl shadow-xl shadow-red-500/30 text-lg font-bold transition-all hover:scale-105 active:scale-95 hover:shadow-red-500/50 group">
                Gaskanmi Daftar 🚀
                {/* Arrow animation on hover */}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#fitur">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-gray-300 dark:border-gray-700 px-8 py-6 rounded-xl text-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white bg-white/50 dark:bg-black/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
                Lihat Fiturnya
              </Button>
            </Link>
          </div>

          {/* UMKM Profile Showcase (if available) */}
          {umkmProfile && (
            <div className="mt-16 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  UMKM Verified Partner
                </span>
              </div>
              
              <div className="group relative p-8 bg-gradient-to-br from-white via-white to-red-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-red-950/30 backdrop-blur-lg rounded-3xl border-2 border-red-200/50 dark:border-red-900/50 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 hover:scale-[1.02]">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-3xl"></div>
                
                <div className="relative">
                  {/* Logo & Name */}
                  <div className="flex items-center gap-4 mb-6">
                    {umkmProfile.logo_url ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-red-200 dark:border-red-800 group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={umkmProfile.logo_url} 
                          alt={umkmProfile.business_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-xl">
                        <Store className="w-10 h-10 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1 text-left">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {umkmProfile.business_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
                          {umkmProfile.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {umkmProfile.description && (
                    <div className="mb-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {umkmProfile.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Location */}
                  {umkmProfile.address && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-900/50">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-xl">📍</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Lokasi</p>
                        <p className="text-gray-700 dark:text-gray-300">{umkmProfile.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Powered by badge */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                      Powered by <span className="font-semibold text-red-600 dark:text-red-400">TABE AI</span> - Platform UMKM Makassar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === FITUR GRID (STAGGERED ANIMATION) === */}
      <div id="fitur" className="container relative z-10 mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 viewport-trigger">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Kenapa Harus TABE AI?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Lengkap mi fiturnya, canggih tapi tetap lokal. Cocok sekali buat kita yang mau naik kelas!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Studio Kata AI",
              icon: <Zap className="h-6 w-6 text-yellow-500" />,
              text: "Bikin caption, slogan, dan deskripsi menu khas Makassar. Bisa pilih bahasa halus, gaul, atau 'Daeng Friendly'.",
              badge: "Andalan"
            },
            {
              title: "Studio Visual & Planner",
              icon: <Palette className="h-6 w-6 text-purple-500" />,
              text: "Upload foto makanan, AI kasih nilai. Bisa juga hapus background dan buat template promo otomatis ala Canva.",
              badge: "Canggih"
            },
            {
              title: "Dapur UMKM",
              icon: <Store className="h-6 w-6 text-blue-500" />,
              text: "Atur profil usaha, daftar menu, sampai catat uang masuk/keluar. Semua rapi dalam satu tempat, ndeh!",
              badge: "Penting"
            },
            {
              title: "Tanya Daeng Chatbot",
              icon: <MessageCircle className="h-6 w-6 text-green-500" />,
              text: "Bingung cari ide? Curhat saja sama 'Daeng Bot'. Dia kasih saran strategi marketing yang pas buat pasar lokal.",
              badge: "24 Jam"
            },
            {
              title: "Strategi Marketing",
              icon: <TrendingUp className="h-6 w-6 text-red-500" />,
              text: "Analisis tren pasar Makassar. Kapan jam posting terbaik, dan promo apa yang lagi disuka orang.",
              badge: "Update"
            },
            {
              title: "Branding Coach",
              icon: <Shield className="h-6 w-6 text-orange-500" />,
              text: "Rekomendasi logo dan warna yang bikin warungta' menonjol dan gampang diingat pelanggan.",
              badge: "Keren"
            },
          ].map((feature, idx) => (
            <Card
              key={idx}
              // ANIMASI MUNCUL BERURUTAN (delay berdasarkan index)
              className="group border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md hover:border-red-500/50 dark:hover:border-red-500/50 transition-all hover:shadow-xl hover:-translate-y-2 duration-300 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-3 w-fit mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-sm duration-300">
                        {feature.icon}
                    </div>
                    {feature.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full border border-red-200 dark:border-red-800 group-hover:bg-red-600 group-hover:text-white transition-colors">
                            {feature.badge}
                        </span>
                    )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                    {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* === CTA SECTION (GASPOL) === */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-red-600 to-red-800 p-8 md:p-16 text-center text-white shadow-2xl shadow-red-900/20 relative overflow-hidden group transition-all hover:scale-[1.01] duration-500">
            
            {/* Pattern Overlay bergerak saat hover */}
            <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-in zoom-in-95 duration-700">Siap kasih naik level UMKM-ta'?</h2>
                <p className="text-red-100 text-lg md:text-xl mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                    Jangan maki' ragu. Gabung sekarang sama ratusan UMKM lain di Makassar yang sudah pakai TABE AI.
                </p>
                <div className="flex justify-center gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                    <Link href="/register">
                        <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100 px-8 py-6 rounded-xl text-lg font-bold shadow-lg transition-all hover:scale-105 active:scale-95 hover:shadow-white/20">
                            Daftar Gratis Ji!
                        </Button>
                    </Link>
                </div>
                
                {/* Trust Badge */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-red-200 opacity-80 animate-in fade-in duration-1000 delay-500">
                    <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Tanpa Kartu Kredit</div>
                    <div className="hidden sm:block">•</div>
                    <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Fitur Lengkap</div>
                    <div className="hidden sm:block">•</div>
                    <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Support Lokal</div>
                </div>
            </div>
        </div>
      </div>

      {/* === FOOTER === */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#020617] py-12 relative z-10">
        <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4 font-bold text-2xl text-gray-900 dark:text-white group cursor-default">
                <Store className="h-6 w-6 text-red-600 group-hover:rotate-12 transition-transform duration-300" /> TABE AI
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Platform digital kebanggaan Makassar. Dibuat dengan ❤️ dan semangat Ewako untuk memajukan ekonomi lokal.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-8">
                <Link href="#" className="hover:text-red-600 transition-colors hover:underline underline-offset-4">Tentang Kami</Link>
                <Link href="#" className="hover:text-red-600 transition-colors hover:underline underline-offset-4">Fitur</Link>
                <Link href="#" className="hover:text-red-600 transition-colors hover:underline underline-offset-4">Harga</Link>
                <Link href="#" className="hover:text-red-600 transition-colors hover:underline underline-offset-4">Syarat & Ketentuan</Link>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-8 w-full max-w-xs mx-auto">
                <p className="text-xs text-gray-400">
                    © 2025 TABE AI. Hak Cipta Dilindungi Undang-Undang.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}