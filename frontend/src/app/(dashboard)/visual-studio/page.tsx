"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  UploadCloud, ImageIcon, Sparkles, Eraser, LayoutTemplate, 
  Calendar as CalendarIcon, Clock, CheckCircle2, ArrowRight, RefreshCw,
  Image as ImageLucide 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VisualStudioPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  // --- HANDLER FUNGSI ---
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setAnalysisResult(null); // Reset hasil lama
      setProcessedImage(null);
    }
  };

  const simulateAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAnalysisResult("📸 Analisa AI:\nFoto makanan (Coto Makassar), pencahayaan bagus (alami), angle top-down.\n\n💡 Saran:\nCocok untuk konten 'Makan Siang' atau promo. Tambahkan teks warna kuning/putih agar kontras.");
      setProcessedImage(uploadedImage); // Sementara pakai gambar asli dulu
      setActiveTab("design"); // Pindah ke tab desain
    }, 2000);
  };

  const simulateRemoveBg = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Ganti URL ini dengan hasil API remove.bg nanti
      setProcessedImage("https://placehold.co/600x600/png?text=Background+Removed"); 
    }, 1500);
  };

  const simulateGenerateTemplate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Ganti URL ini dengan hasil generate template
      setProcessedImage("https://placehold.co/600x600/red/white?text=Template+Promo+Jumat");
    }, 2000);
  };

   const handleSchedule = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Mantap Daeng! Konten berhasil dijadwalkan.");
      // Reset ke awal
      setActiveTab("upload");
      setUploadedImage(null);
      setAnalysisResult(null);
      setProcessedImage(null);
    }, 1500);
  };

  const labelStyle = "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block";

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Studio Visual & Planner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload foto, edit dengan AI, dan jadwalkan postingan.</p>
        </div>

        {/* --- STEPPER / TAB --- */}
        <div className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl">
            <button 
                onClick={() => setActiveTab("upload")}
                className={cn(
                    "flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all",
                    activeTab === "upload" 
                        ? "bg-white dark:bg-gray-800 text-red-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                )}
            >
                <UploadCloud className="h-4 w-4 mr-2" /> 1. Upload & Analisa
            </button>
            <button 
                onClick={() => setActiveTab("design")}
                disabled={!analysisResult} // Kunci jika belum analisa
                className={cn(
                    "flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    activeTab === "design" 
                        ? "bg-white dark:bg-gray-800 text-red-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                )}
            >
                <LayoutTemplate className="h-4 w-4 mr-2" /> 2. Studio Desain
            </button>
            <button 
                onClick={() => setActiveTab("planner")}
                disabled={!processedImage} // Kunci jika belum ada gambar final
                className={cn(
                    "flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    activeTab === "planner" 
                        ? "bg-white dark:bg-gray-800 text-red-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                )}
            >
                <CalendarIcon className="h-4 w-4 mr-2" /> 3. Jadwal (Planner)
            </button>
        </div>


        {/* ================= LANGKAH 1: UPLOAD & ANALISA ================= */}
        {activeTab === "upload" && (
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* AREA UPLOAD */}
              <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shadow-none hover:border-red-400 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-[400px] p-6 text-center relative">
                  {uploadedImage ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden group">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-contain" />
                      <label htmlFor="picture" className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold">
                        <UploadCloud className="h-12 w-12 mb-2" /> Ganti Foto Lain
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="picture" className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors rounded-lg group">
                      <div className="p-5 bg-white dark:bg-gray-800 rounded-full mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-10 w-10 text-red-500" />
                      </div>
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-300">Klik untuk Upload Foto</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Format JPG/PNG (Max 5MB)</p>
                    </label>
                  )}
                  <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </CardContent>
              </Card>

              {/* HASIL ANALISA */}
              <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" /> Analisa AI
                  </CardTitle>
                  <CardDescription>AI akan melihat kualitas foto ta' & memberi saran.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-6 pt-0">
                  {uploadedImage && !analysisResult ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                       <p className="text-sm text-gray-500">Foto sudah siap. Klik tombol di bawah.</p>
                       <Button onClick={simulateAnalysis} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white w-full py-6 text-lg font-bold shadow-lg shadow-red-500/20">
                          {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                          Mulai Analisa Foto
                       </Button>
                    </div>
                  ) : analysisResult ? (
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-100 dark:border-purple-800 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto">
                        {analysisResult}
                      </div>
                      <Button onClick={() => setActiveTab("design")} className="w-full bg-red-600 hover:bg-red-700 text-white mt-4 py-6 text-lg font-bold group">
                        Lanjut ke Desain <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl m-4">
                      <ImageLucide className="h-10 w-10 mb-2 opacity-20" />
                      <p>Upload foto dulu di samping.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
        )}


        {/* ================= LANGKAH 2: STUDIO DESAIN ================= */}
        {activeTab === "design" && (
             <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* TOOLBAR KIRI */}
                <Card className="md:col-span-1 bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 h-fit">
                    <CardHeader>
                        <CardTitle>Alat Edit Ajaib</CardTitle>
                        <CardDescription>Pilih efek yang mau dipakai.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={simulateRemoveBg} disabled={isLoading} variant="outline" className="w-full justify-start py-6 border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:text-gray-200">
                             {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mr-3 text-red-500" /> : <Eraser className="h-5 w-5 mr-3 text-red-500" />}
                             <div className="text-left">
                                <span className="block font-bold">Hapus Background</span>
                                <span className="text-xs font-normal text-gray-500">Jadikan transparan otomatis</span>
                             </div>
                        </Button>
                        <Button onClick={simulateGenerateTemplate} disabled={isLoading} variant="outline" className="w-full justify-start py-6 border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:text-gray-200">
                             {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mr-3 text-blue-500" /> : <LayoutTemplate className="h-5 w-5 mr-3 text-blue-500" />}
                             <div className="text-left">
                                <span className="block font-bold">Buat Template Promo</span>
                                <span className="text-xs font-normal text-gray-500">Desain instan ala Canva</span>
                             </div>
                        </Button>
                    </CardContent>
                </Card>

                {/* PREVIEW KANAN */}
                <Card className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 border-dashed border-2 border-gray-300 dark:border-gray-700 shadow-none overflow-hidden flex flex-col h-[500px]">
                    <CardHeader className="pb-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <CardTitle className="text-center text-sm uppercase tracking-wider text-gray-500">Preview Hasil Edit</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-6 relative">
                        {processedImage ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
                                <img src={processedImage} alt="Processed" className="w-full h-full object-contain bg-[url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpng.pngtree.com%2Fpng-vector%2F20190419%2Fourmid%2Fpngtree-transparency-grid-seamless-pattern-png-image_956272.jpg&f=1&nofb=1&ipt=c7d00207865768370950672283995777c0062723')] bg-repeat" /> {/* Background catur transparan */}
                            </div>
                        ) : (
                           <div className="flex flex-col items-center text-gray-400">
                                <ImageIcon className="h-16 w-16 mb-2 opacity-20" />
                                <p>Pilih alat di kiri untuk melihat hasil.</p>
                           </div>
                        )}
                        
                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm">
                                <div className="flex flex-col items-center">
                                    <RefreshCw className="h-10 w-10 text-red-600 animate-spin mb-2" />
                                    <p className="font-bold text-gray-800 dark:text-white">Sedang memproses...</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    
                    {/* FOOTER BUTTON */}
                    <div className="p-4 bg-white dark:bg-[#020617] border-t border-gray-200 dark:border-gray-800 text-center">
                         <Button 
                            onClick={() => setActiveTab("planner")} 
                            className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 text-lg font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                            disabled={!processedImage}
                         >
                            Gambar Oke, Lanjut Jadwal! <CheckCircle2 className="h-5 w-5 ml-2" />
                         </Button>
                    </div>
                </Card>
             </div>
        )}


        {/* ================= LANGKAH 3: PLANNER (JADWAL) ================= */}
        {activeTab === "planner" && (
             <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* KIRI: PREVIEW FINAL */}
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 h-fit">
                   <CardHeader>
                     <CardTitle>Finalisasi Konten</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      {processedImage && (
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-gray-100">
                             <img src={processedImage} alt="Final" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div>
                        <label className={labelStyle}>Caption Postingan</label>
                        <Textarea placeholder="Tulis caption di sini atau gunakan hasil dari Studio Kata AI..." className="h-32 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-red-500 focus:ring-red-500/20 resize-none" />
                      </div>
                   </CardContent>
                </Card>

                {/* KANAN: WAKTU TAYANG */}
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 h-fit">
                    <CardHeader>
                        <CardTitle>Waktu Tayang</CardTitle>
                        <CardDescription>Jadwalkan agar postingan naik otomatis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        {/* Date Picker Manual */}
                        <div>
                            <label className={labelStyle}>Tanggal Posting</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        
                         {/* Time Picker Manual */}
                         <div>
                            <label className={labelStyle}>Jam Tayang (WITA)</label>
                             <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pl-10 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white appearance-none cursor-pointer">
                                    <option>09:00 WITA (Pagi - Sarapan)</option>
                                    <option>12:00 WITA (Siang - Istirahat)</option>
                                    <option>17:00 WITA (Sore - Pulang Kantor)</option>
                                    <option>20:00 WITA (Malam - Santai)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                         </div>

                         <div className="pt-4">
                            <Button onClick={handleSchedule} disabled={isLoading} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 text-lg font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">
                                {isLoading ? (
                                    <> <RefreshCw className="animate-spin mr-2" /> Menjadwalkan... </>
                                ) : (
                                    <> <CalendarIcon className="mr-2" /> Jadwalkan Sekarang </>
                                )}
                            </Button>
                         </div>

                    </CardContent>
                </Card>
             </div>
        )}

      </div>
    </DashboardLayout>
  );
}