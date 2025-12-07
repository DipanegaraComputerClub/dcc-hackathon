"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, Wand2, Download, Share2, RefreshCw, Check, AlertCircle,
  Scissors, Sparkles, Calendar, Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/config/api";

export default function VisualStudioPage() {
  // States
  const [step, setStep] = useState(1); // 1: Upload, 2: Edit & Design, 3: Posting
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Image states
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [finalDesign, setFinalDesign] = useState<string | null>(null);
  
  // Analysis result
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [analysisText, setAnalysisText] = useState("");
  const [needsRetake, setNeedsRetake] = useState(false);
  
  // Form data
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [theme, setTheme] = useState("modern");
  const [brandColor, setBrandColor] = useState("#FF6347");
  const [targetMarket, setTargetMarket] = useState("");
  
  // Design options
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [templateStyle, setTemplateStyle] = useState("instagram-feed");
  
  // Schedule
  const [scheduleData, setScheduleData] = useState<any>(null);

  // --- UTILITIES ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleReset = () => {
    setStep(1);
    setOriginalImage(null);
    setUploadedFile(null);
    setProcessedImage(null);
    setFinalDesign(null);
    setQualityScore(0);
    setAnalysisText("");
    setNeedsRetake(false);
    setProductName("");
    setProductDesc("");
    setBackgroundRemoved(false);
    setScheduleData(null);
    setError("");
  };

  // --- STEP 1: UPLOAD & ANALYZE ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setOriginalImage(imageUrl);
    setUploadedFile(file);
    setError("");

    // Auto-analyze after upload
    await analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsLoading(true);
    try {
      const imageBase64 = await fileToBase64(file);

      const response = await fetch(`${API_URL}/visual-studio/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, context: "UMKM Indonesia" })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal menganalisa gambar');

      // Extract scores from metadata
      const score = data.data?.metadata?.qualityScore || 7;
      const needsRetake = data.data?.metadata?.needsRetake || false;
      
      setQualityScore(score);
      setAnalysisText(data.data?.analysis || "Foto terlihat baik untuk digunakan.");
      setNeedsRetake(needsRetake);
      setProcessedImage(imageBase64);

      // Auto proceed to step 2 if quality is good
      if (!needsRetake) {
        setTimeout(() => setStep(2), 1500);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: REMOVE BACKGROUND ---
  const handleRemoveBackground = async () => {
    if (!processedImage) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/visual-studio/remove-background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: processedImage })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal menghapus background');

      setProcessedImage(data.data?.imageBase64 || processedImage);
      setBackgroundRemoved(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: GENERATE DESIGN ---
  const handleGenerateDesign = async () => {
    if (!productName || !theme) {
      setError("Mohon isi nama produk dan pilih tema");
      return;
    }

    setIsLoading(true);
    try {
      // Build prompt for AI
      const prompt = `Professional UMKM product branding for "${productName}". 
      Description: ${productDesc || 'Indonesian UMKM product'}. 
      Style: ${theme}, Brand color: ${brandColor}, Target: ${targetMarket || 'Indonesian consumers'}. 
      Create clean, modern, professional design ready for social media posting.`;

      const response = await fetch(`${API_URL}/visual-studio/generate-design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          style: templateStyle,
          productImage: processedImage 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal generate design');

      setFinalDesign(data.data?.imageBase64 || data.data?.imageUrl);
      setStep(3); // Move to posting step

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 3: GENERATE SCHEDULE ---
  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/visual-studio/schedule-planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: productName || "Produk UMKM",
          targetAudience: targetMarket || "Pelanggan umum",
          businessGoal: "engagement",
          duration: 7
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal generate jadwal');

      setScheduleData(data.data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- DOWNLOAD DESIGN ---
  const handleDownload = () => {
    if (!finalDesign) return;

    const link = document.createElement('a');
    link.href = finalDesign;
    link.download = `${productName || 'design'}-${Date.now()}.png`;
    link.click();
  };

  // --- RENDER STEPS ---
  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 AI Visual Branding Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buat desain konten visual profesional untuk UMKM Anda dengan bantuan AI
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex justify-center items-center gap-4">
          {[
            { num: 1, label: "Upload & Analisa", icon: Upload },
            { num: 2, label: "Edit & Design", icon: Wand2 },
            { num: 3, label: "Posting", icon: Share2 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.num} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-lg transition-all",
                  step === item.num 
                    ? "bg-red-600 text-white shadow-lg scale-105" 
                    : step > item.num
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                )}>
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{item.label}</span>
                  {step > item.num && <Check className="h-4 w-4" />}
                </div>
                {item.num < 3 && (
                  <div className={cn(
                    "w-12 h-1 mx-2",
                    step > item.num ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p className="font-semibold">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 1: UPLOAD & ANALYZE */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-6 w-6 text-red-600" />
                Step 1: Upload Foto Produk
              </CardTitle>
              <CardDescription>
                Upload foto produk Anda untuk mendapatkan analisa kualitas dari AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                    originalImage 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/10" 
                      : "border-gray-300 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {originalImage ? (
                    <div className="relative w-full h-full p-4">
                      <img 
                        src={originalImage} 
                        alt="Preview" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        Klik untuk upload foto
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, PNG, WEBP (Max 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Analysis Result */}
              {qualityScore > 0 && (
                <div className={cn(
                  "p-6 rounded-xl border-2",
                  needsRetake 
                    ? "bg-orange-50 border-orange-300 dark:bg-orange-900/20" 
                    : "bg-green-50 border-green-300 dark:bg-green-900/20"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">Skor Kualitas Foto</h3>
                      <p className="text-sm text-gray-600">Hasil analisa AI</p>
                    </div>
                    <div className="text-5xl font-black">
                      {qualityScore}/10
                    </div>
                  </div>
                  
                  {needsRetake ? (
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg">
                      <p className="font-bold text-orange-800 dark:text-orange-300 mb-2">
                        ⚠️ Rekomendasi: Upload Foto Baru
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        Foto bisa ditingkatkan untuk hasil maksimal. Coba foto ulang dengan pencahayaan lebih baik.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                      <p className="font-bold text-green-800 dark:text-green-300 mb-2">
                        ✅ Foto Sudah Bagus!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Kualitas foto sudah cukup baik untuk digunakan. Lanjut ke tahap design!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {originalImage && !isLoading && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    Upload Ulang
                  </Button>
                )}
                {originalImage && qualityScore > 0 && (
                  <Button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    Lanjut ke Design
                  </Button>
                )}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-3 text-gray-600">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Menganalisa foto...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 2: EDIT & DESIGN */}
        {step === 2 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Image Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-red-600" />
                  Edit Foto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview */}
                <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-checkerboard">
                  {processedImage && (
                    <img 
                      src={processedImage} 
                      alt="Product" 
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Remove Background Button */}
                <Button
                  onClick={handleRemoveBackground}
                  disabled={isLoading || backgroundRemoved}
                  variant="outline"
                  className="w-full"
                >
                  {backgroundRemoved ? (
                    <><Check className="h-4 w-4 mr-2" /> Background Dihapus</>
                  ) : (
                    <><Scissors className="h-4 w-4 mr-2" /> Hapus Background</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Right: Design Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-red-600" />
                  Generate Design
                </CardTitle>
                <CardDescription>
                  Isi detail produk untuk generate template design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Nama Produk *</label>
                  <Input 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Contoh: Kue Brownies Premium"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Deskripsi Singkat</label>
                  <Input 
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder="Contoh: Lembut, coklat asli"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Tema Design</label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900"
                    >
                      <option value="modern">Modern</option>
                      <option value="elegant">Elegant</option>
                      <option value="cute-pastel">Cute Pastel</option>
                      <option value="bold">Bold & Vibrant</option>
                      <option value="minimalist">Minimalist</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Format</label>
                    <select
                      value={templateStyle}
                      onChange={(e) => setTemplateStyle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900"
                    >
                      <option value="instagram-feed">Instagram Post (1:1)</option>
                      <option value="instagram-story">Instagram Story (9:16)</option>
                      <option value="promo">Promo Banner</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Warna Brand</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Input 
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Target Pasar</label>
                    <Input 
                      value={targetMarket}
                      onChange={(e) => setTargetMarket(e.target.value)}
                      placeholder="Contoh: Ibu rumah tangga"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateDesign}
                  disabled={isLoading || !productName}
                  className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg font-bold"
                >
                  {isLoading ? (
                    <><RefreshCw className="h-5 w-5 animate-spin mr-2" /> Generating...</>
                  ) : (
                    <><Wand2 className="h-5 w-5 mr-2" /> Generate Design Sekarang!</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 3: POSTING */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Design Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Check className="h-6 w-6 text-green-600" />
                    Design Siap Posting!
                  </span>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {finalDesign && (
                  <div className="max-w-md mx-auto">
                    <img 
                      src={finalDesign} 
                      alt="Final Design" 
                      className="w-full rounded-xl shadow-2xl"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  Rekomendasi Waktu Posting
                </CardTitle>
                <CardDescription>
                  Jadwal optimal untuk posting konten Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!scheduleData ? (
                  <Button 
                    onClick={handleGenerateSchedule}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Generate Jadwal Posting
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {scheduleData.schedule?.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                          <p className="font-bold text-sm">{item.date}</p>
                          <p className="text-2xl font-black text-red-600 my-2">{item.time}</p>
                          <p className="text-xs text-gray-600">{item.reasoning}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Posting di waktu ini untuk engagement maksimal! 🚀
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Posting Actions */}
            <div className="flex gap-3">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Buat Design Baru
              </Button>
              <Button 
                onClick={() => window.open('https://www.instagram.com/', '_blank')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Posting ke Instagram
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
