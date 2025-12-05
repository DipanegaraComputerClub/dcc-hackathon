"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  UploadCloud, ImageIcon, Sparkles, Eraser, ChevronDown, LayoutTemplate, 
  Calendar as CalendarIcon, Clock, CheckCircle2, ArrowRight, RefreshCw,
  Image as ImageLucide 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/config/api";

export default function VisualStudioPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [templateResult, setTemplateResult] = useState<any>(null);
  const [scheduleResult, setScheduleResult] = useState<any>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  
  // Form states for template generation
  const [templateType, setTemplateType] = useState("promo");
  const [theme, setTheme] = useState("");
  const [brandColor, setBrandColor] = useState("#FF6347");
  const [targetAudience, setTargetAudience] = useState("");
  
  // Form states for schedule planner
  const [contentType, setContentType] = useState("");
  const [businessGoal, setBusinessGoal] = useState("engagement");
  const [duration, setDuration] = useState("7");

  // --- HANDLER FUNGSI ---
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setUploadedFile(file);
      setAnalysisResult(null);
      setTemplateResult(null);
      setScheduleResult(null);
      setProcessedImage(null);
      setError("");
    }
  };

  // Convert image to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // 1. ANALYZE IMAGE WITH AI
  const handleAnalyzeImage = async () => {
    if (!uploadedFile) {
      setError("Mohon upload gambar terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const imageBase64 = await fileToBase64(uploadedFile);

      const response = await fetch(`${API_URL}/api/visual-studio/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          context: "UMKM kuliner Makassar"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menganalisa gambar');
      }

      console.log('Analysis result:', data.data);
      setAnalysisResult(data.data);
      setProcessedImage(uploadedImage);
      setActiveTab("design");

    } catch (err: any) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Terjadi kesalahan saat menganalisa gambar');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. GENERATE TEMPLATE DESIGN
  const handleGenerateTemplate = async () => {
    if (!theme || !targetAudience) {
      setError("Mohon isi Theme dan Target Audience");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const imageBase64 = uploadedFile ? await fileToBase64(uploadedFile) : undefined;

      const response = await fetch(`${API_URL}/api/visual-studio/generate-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          templateType,
          theme,
          brandColor,
          targetAudience
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal generate template');
      }

      console.log('Template result:', data.data);
      setTemplateResult(data.data);

    } catch (err: any) {
      console.error('Error generating template:', err);
      setError(err.message || 'Terjadi kesalahan saat generate template');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. GENERATE SCHEDULE PLANNER
  const handleGenerateSchedule = async () => {
    if (!contentType || !targetAudience) {
      setError("Mohon isi Content Type dan Target Audience");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const imageBase64 = uploadedFile ? await fileToBase64(uploadedFile) : undefined;

      const response = await fetch(`${API_URL}/api/visual-studio/schedule-planner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          contentType,
          targetAudience,
          businessGoal,
          duration: parseInt(duration)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal generate schedule');
      }

      console.log('Schedule result:', data.data);
      setScheduleResult(data.data);

    } catch (err: any) {
      console.error('Error generating schedule:', err);
      setError(err.message || 'Terjadi kesalahan saat generate schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setActiveTab("upload");
    setUploadedImage(null);
    setUploadedFile(null);
    setAnalysisResult(null);
    setTemplateResult(null);
    setScheduleResult(null);
    setProcessedImage(null);
    setError("");
    setTheme("");
    setTargetAudience("");
    setContentType("");
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
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  {uploadedImage && !analysisResult ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                       <p className="text-sm text-gray-500">Foto sudah siap. Klik tombol di bawah.</p>
                       <Button onClick={handleAnalyzeImage} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white w-full py-6 text-lg font-bold shadow-lg shadow-red-500/20">
                          {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                          {isLoading ? 'Menganalisa dengan AI...' : 'Mulai Analisa Foto'}
                       </Button>
                    </div>
                  ) : analysisResult ? (
                    <div className="flex-1 flex flex-col justify-between h-full">
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-100 dark:border-purple-800 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto max-h-[400px]">
                        {analysisResult.analysis}
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
                
                {/* FORM INPUT KIRI */}
                <Card className="md:col-span-1 bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 h-fit">
                    <CardHeader>
                        <CardTitle>🎨 Generate Template Design</CardTitle>
                        <CardDescription>AI akan buatkan design template untuk Anda</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                            {error}
                          </div>
                        )}
                        
                        <div>
                          <label className={labelStyle}>Template Type</label>
                          <select 
                            value={templateType}
                            onChange={(e) => setTemplateType(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white transition-all"
                          >
                            <option value="promo">Promo/Sale</option>
                            <option value="story">Instagram Story</option>
                            <option value="feed">Instagram Feed</option>
                            <option value="reels">Reels/TikTok</option>
                            <option value="carousel">Carousel</option>
                          </select>
                        </div>

                        <div>
                          <label className={labelStyle}>Theme/Konsep</label>
                          <Input 
                            placeholder="Contoh: Flash Sale Weekend"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className={labelStyle}>Brand Color</label>
                          <div className="flex gap-2">
                            <Input 
                              type="color"
                              value={brandColor}
                              onChange={(e) => setBrandColor(e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input 
                              type="text"
                              value={brandColor}
                              onChange={(e) => setBrandColor(e.target.value)}
                              className="flex-1"
                              placeholder="#FF6347"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelStyle}>Target Audience</label>
                          <Input 
                            placeholder="Contoh: Mahasiswa, Pekerja 25-40 tahun"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <Button 
                          onClick={handleGenerateTemplate} 
                          disabled={isLoading || !theme || !targetAudience}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 font-bold"
                        >
                          {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                          {isLoading ? 'Generating...' : 'Generate Template'}
                        </Button>
                    </CardContent>
                </Card>

                {/* HASIL TEMPLATE KANAN */}
                <Card className="md:col-span-2 bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-800">
                        <CardTitle className="text-center">📋 Design Recommendations</CardTitle>
                        <CardDescription className="text-center">AI-generated template suggestions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-6 overflow-y-auto max-h-[600px]">
                        {templateResult ? (
                            <div className="space-y-6">
                              {/* Design Suggestions */}
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
                                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">🎨 Design Concept</h3>
                                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                  {templateResult.designSuggestions}
                                </div>
                              </div>

                              {/* Layout Recommendations */}
                              {templateResult.layoutRecommendations && templateResult.layoutRecommendations.length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                                  <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-300">📐 Layout Options</h3>
                                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    {templateResult.layoutRecommendations.map((layout: string, idx: number) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span>{layout}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Color Scheme */}
                              {templateResult.colorScheme && templateResult.colorScheme.length > 0 && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
                                  <h3 className="font-bold text-lg mb-3 text-purple-900 dark:text-purple-300">🎨 Color Palette</h3>
                                  <div className="flex flex-wrap gap-3">
                                    {templateResult.colorScheme.map((color: string, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div 
                                          className="w-8 h-8 rounded-md border-2 border-gray-300 dark:border-gray-600" 
                                          style={{backgroundColor: color}}
                                        />
                                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{color}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* CTA Suggestions */}
                              {templateResult.ctaSuggestions && templateResult.ctaSuggestions.length > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800">
                                  <h3 className="font-bold text-lg mb-3 text-green-900 dark:text-green-300">🎯 Call-to-Action Ideas</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {templateResult.ctaSuggestions.map((cta: string, idx: number) => (
                                      <span key={idx} className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full text-sm font-semibold text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                                        {cta}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                        ) : (
                           <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <LayoutTemplate className="h-16 w-16 mb-3 opacity-20" />
                                <p className="text-center">Isi form di kiri dan klik Generate untuk melihat rekomendasi design</p>
                           </div>
                        )}
                    </CardContent>
                    
                    {/* FOOTER BUTTON */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 text-center">
                         <Button 
                            onClick={() => setActiveTab("planner")} 
                            className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 text-lg font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                            disabled={!templateResult}
                         >
                            Lanjut ke Jadwal Posting! <ArrowRight className="h-5 w-5 ml-2" />
                         </Button>
                    </div>
                </Card>
             </div>
        )}


        {/* ================= LANGKAH 3: PLANNER (JADWAL) ================= */}
        {activeTab === "planner" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* FORM INPUT */}
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle>📅 Generate Content Schedule</CardTitle>
                        <CardDescription>AI akan buatkan jadwal posting optimal berdasarkan trend & analytics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                            {error}
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelStyle}>Content Type</label>
                            <Input 
                              placeholder="Contoh: Foto makanan, Promo, Story"
                              value={contentType}
                              onChange={(e) => setContentType(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className={labelStyle}>Target Audience</label>
                            <Input 
                              placeholder="Contoh: Mahasiswa Makassar"
                              value={targetAudience}
                              onChange={(e) => setTargetAudience(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelStyle}>Business Goal</label>
                            <select 
                              value={businessGoal}
                              onChange={(e) => setBusinessGoal(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            >
                              <option value="awareness">Brand Awareness</option>
                              <option value="engagement">Engagement & Community</option>
                              <option value="sales">Sales & Conversion</option>
                              <option value="traffic">Website/Store Traffic</option>
                            </select>
                          </div>

                          <div>
                            <label className={labelStyle}>Duration (Hari)</label>
                            <Input 
                              type="number"
                              min="1"
                              max="30"
                              placeholder="7"
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={handleGenerateSchedule} 
                          disabled={isLoading || !contentType || !targetAudience}
                          className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white py-6 text-lg font-bold shadow-lg"
                        >
                          {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                          {isLoading ? 'Generating Schedule...' : 'Generate AI Schedule'}
                        </Button>
                    </CardContent>
                </Card>

                {/* SCHEDULE RESULTS */}
                {scheduleResult && (
                  <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <CardTitle>📊 Your Content Calendar</CardTitle>
                      <CardDescription>{duration} hari posting schedule dengan optimal timing</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                      
                      {/* Overall Strategy */}
                      {scheduleResult.overallStrategy && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                          <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-300">📋 Overall Strategy</h3>
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {scheduleResult.overallStrategy}
                          </div>
                        </div>
                      )}

                      {/* Daily Schedule */}
                      {scheduleResult.schedule && scheduleResult.schedule.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">📅 Daily Schedule</h3>
                          {scheduleResult.schedule.map((item: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span className="font-bold text-red-600 dark:text-red-400">Hari {item.day}</span>
                                  <span className="text-gray-500 ml-2 text-sm">• {item.date}</span>
                                </div>
                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{item.time}</span>
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                <strong>Content:</strong> {item.contentIdea}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                <strong>Platform:</strong> {item.platform.join(', ')}
                              </div>
                              {item.reasoning && (
                                <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                                  💡 {item.reasoning}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* KPI Targets */}
                      {scheduleResult.kpiTargets && scheduleResult.kpiTargets.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800">
                          <h3 className="font-bold text-lg mb-3 text-green-900 dark:text-green-300">🎯 KPI Targets</h3>
                          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {scheduleResult.kpiTargets.map((kpi: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{kpi}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tips */}
                      {scheduleResult.tips && scheduleResult.tips.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-800">
                          <h3 className="font-bold text-lg mb-3 text-yellow-900 dark:text-yellow-300">💡 Pro Tips</h3>
                          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {scheduleResult.tips.map((tip: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Reset Button */}
                      <div className="pt-4 text-center">
                        <Button 
                          onClick={handleReset}
                          variant="outline"
                          className="w-full md:w-auto px-8 py-3 font-bold"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Mulai dari Awal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!scheduleResult && (
                  <Card className="bg-gray-50 dark:bg-gray-900/50 border-dashed border-2 border-gray-300 dark:border-gray-700">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <CalendarIcon className="h-16 w-16 mb-3 opacity-20" />
                      <p className="text-center">Isi form di atas dan klik Generate untuk melihat AI schedule</p>
                    </CardContent>
                  </Card>
                )}
             </div>
        )}

        {/* Backup manual schedule section if needed */}
        {false && activeTab === "planner" && (
             <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="bg-white dark:bg-[#020617] border-gray-200 dark:border-gray-800 h-fit">
                   <CardHeader>
                     <CardTitle>Manual Schedule</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-6">
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
                        <div className="pt-4">
                            <Button disabled={isLoading} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 text-lg font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">
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