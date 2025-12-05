"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, Sparkles, Download, Share2, RefreshCw, CheckCircle2, 
  AlertCircle, Loader2, Palette, Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function VisualStudioPage() {
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<'form' | 'preview' | 'result'>('form');
  
  // Form inputs
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [businessType, setBusinessType] = useState<string>("makanan");
  const [theme, setTheme] = useState<string>("minimalist");
  const [brandColor, setBrandColor] = useState("#FF6347");
  const [targetMarket, setTargetMarket] = useState("");
  const [format, setFormat] = useState<string>("instagram-square");
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  // Results
  const [result, setResult] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate branding
  const handleGenerate = async () => {
    if (!productName || !targetMarket) {
      setError("Nama produk dan target market wajib diisi!");
      return;
    }

    setIsLoading(true);
    setError("");
    setStep('preview');

    try {
      const response = await fetch(`${API_URL}/api/visual-studio/generate-umkm-branding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImage,
          productName,
          businessType,
          theme,
          brandColor,
          targetMarket,
          format,
          additionalInfo
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Gagal generate design');
      }

      setResult(data.data);
      setPreviewImage(data.data.designResult.imageBase64);
      setStep('result');

    } catch (err: any) {
      setError(err.message);
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  // Download image
  const handleDownload = () => {
    if (!previewImage) return;
    
    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `${productName.replace(/\s+/g, '-')}-design.png`;
    link.click();
  };

  // Share to social media (placeholder)
  const handleShare = () => {
    alert('Fitur share akan segera hadir! Untuk saat ini, download gambar dan posting manual.');
  };

  // Reset form
  const handleReset = () => {
    setProductImage(null);
    setProductName("");
    setTargetMarket("");
    setAdditionalInfo("");
    setResult(null);
    setPreviewImage(null);
    setStep('form');
    setError("");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎨 AI Visual Branding Studio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buat desain promosi profesional untuk UMKM Anda dalam hitungan detik
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* LEFT: Form Input */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>✏️ Info Produk & Branding</CardTitle>
              <CardDescription>Isi data produk Anda untuk generate design</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Product Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  📸 Foto Produk (Opsional)
                </label>
                <div className="relative">
                  {productImage ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img src={productImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setProductImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Upload className="h-12 w-12 mb-2" />
                        <span className="text-sm">Klik untuk upload foto</span>
                        <span className="text-xs mt-1">JPG, PNG (Max 5MB)</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  📦 Nama Produk <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Contoh: Nasi Goreng Spesial"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  🏪 Jenis Bisnis
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm"
                >
                  <option value="makanan">🍜 Makanan</option>
                  <option value="fashion">👗 Fashion</option>
                  <option value="kosmetik">💄 Kosmetik</option>
                  <option value="kerajinan">🎨 Kerajinan</option>
                  <option value="cafe">☕ Cafe</option>
                  <option value="kuliner">🍴 Kuliner</option>
                  <option value="lainnya">📦 Lainnya</option>
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  🎨 Tema Design
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm"
                >
                  <option value="minimalist">✨ Minimalist</option>
                  <option value="elegant">💎 Elegant</option>
                  <option value="cute-pastel">🌸 Cute Pastel</option>
                  <option value="bold-modern">⚡ Bold Modern</option>
                  <option value="premium">👑 Premium</option>
                  <option value="playful">🎉 Playful</option>
                </select>
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  🎨 Warna Brand
                </label>
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

              {/* Target Market */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  🎯 Target Market <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Contoh: Remaja 17-25 tahun"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  📱 Format Posting
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm"
                >
                  <option value="instagram-square">📷 Instagram Square (1:1)</option>
                  <option value="instagram-story">📱 Instagram Story (9:16)</option>
                  <option value="tiktok">🎵 TikTok (9:16)</option>
                  <option value="facebook">👥 Facebook (1.91:1)</option>
                </select>
              </div>

              {/* Additional Info */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  📝 Info Tambahan (Opsional)
                </label>
                <Textarea
                  placeholder="Contoh: Promo weekend, diskon 20%"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="w-full"
                  rows={3}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !productName || !targetMarket}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-6 text-lg font-bold shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating Design...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    Generate Design UMKM
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* RIGHT: Preview & Result */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>👁️ Preview & Hasil</CardTitle>
              <CardDescription>Design Anda akan muncul disini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {step === 'form' && !previewImage && (
                <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400">
                  <Sparkles className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-center px-4">
                    Isi form di sebelah kiri<br />
                    lalu klik <strong>Generate Design</strong>
                  </p>
                </div>
              )}

              {step === 'preview' && isLoading && (
                <div className="aspect-square border-2 border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center justify-center">
                  <Loader2 className="h-16 w-16 animate-spin text-red-500 mb-4" />
                  <p className="text-lg font-semibold">Generating Design...</p>
                  <p className="text-sm text-gray-500 mt-2">Mohon tunggu 10-30 detik</p>
                </div>
              )}

              {step === 'result' && previewImage && (
                <>
                  {/* Preview Image */}
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-xl">
                    <img
                      src={previewImage}
                      alt="Generated Design"
                      className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900"
                    />
                  </div>

                  {/* Image Quality Analysis */}
                  {result?.imageAnalysis && (
                    <div className={cn(
                      "p-4 rounded-lg border-2",
                      result.imageAnalysis.isGoodQuality
                        ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                        : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {result.imageAnalysis.isGoodQuality ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="font-bold">
                          Kualitas Foto: {result.imageAnalysis.qualityScore}/10
                        </span>
                      </div>
                      {result.imageAnalysis.recommendations?.length > 0 && (
                        <ul className="text-sm space-y-1 ml-7">
                          {result.imageAnalysis.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300">• {rec}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Marketing Suggestions */}
                  {result?.marketingSuggestions && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Tips Posting
                      </h3>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Caption:</strong>
                          <p className="text-gray-700 dark:text-gray-300 mt-1 text-xs whitespace-pre-wrap">
                            {result.marketingSuggestions.caption}
                          </p>
                        </div>
                        
                        <div>
                          <strong>Hashtags:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.marketingSuggestions.hashtags.map((tag: string, idx: number) => (
                              <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <strong>Waktu Posting Terbaik:</strong>
                          <ul className="mt-1 space-y-0.5 text-xs">
                            {result.marketingSuggestions.bestPostingTime.map((time: string, idx: number) => (
                              <li key={idx} className="text-gray-600 dark:text-gray-400">• {time}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 font-bold"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleShare}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 font-bold"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Posting
                    </Button>
                  </div>

                  {/* Generate Again */}
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full py-5 border-2"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Buat Design Baru
                  </Button>
                </>
              )}

            </CardContent>
          </Card>

        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 <strong>Tips:</strong> Upload foto produk dengan pencahayaan baik untuk hasil terbaik. 
            Jika tidak punya foto, AI akan generate visualisasi produk untuk Anda.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
