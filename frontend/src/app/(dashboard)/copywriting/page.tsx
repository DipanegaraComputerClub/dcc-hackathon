"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Copy } from "lucide-react";
import { API_URL } from "@/config/api";

export default function FormsPage() {
  const [formData, setFormData] = useState({
    namaProduk: "",
    jenisKonten: "",
    gayaBahasa: "",
    tujuanKonten: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.namaProduk.trim()) {
      newErrors.namaProduk = "Nama Produk wajib diisi";
    }

    if (!formData.jenisKonten.trim()) {
      newErrors.jenisKonten = "Jenis Konten wajib diisi";
    }

    if (!formData.gayaBahasa.trim()) {
      newErrors.gayaBahasa = "Gaya Bahasa wajib diisi";
    }

    if (!formData.tujuanKonten.trim()) {
      newErrors.tujuanKonten = "Tujuan Konten wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const [loading, setLoading] = useState(false);
const [result, setResult] = useState<{
  mainText: string;
  alternatives: string[];
} | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    addToast({
      title: "Validation Error",
      description: "Mohon periksa kembali form Anda",
      variant: "error",
    });
    return;
  }

  setLoading(true);
  
  try {
    // Call backend API
    const response = await fetch(`${API_URL}/copywriting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namaProduk: formData.namaProduk,
        jenisKonten: formData.jenisKonten,
        gayaBahasa: formData.gayaBahasa,
        tujuanKonten: formData.tujuanKonten,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate copywriting');
    }

    const data = await response.json();

    if (data.success) {
      setResult(data.data);
      addToast({
        title: "Success!",
        description: "Copywriting berhasil di-generate",
        variant: "success",
      });
    }
  } catch (error) {
    console.error('Error:', error);
    addToast({
      title: "Error",
      description: "Gagal generate copywriting. Coba lagi.",
      variant: "error",
    });
  } finally {
    setLoading(false);
  }
};

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const textToCopy = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea
  debitis ipsum eligendi aspernatur perspiciatis consequuntur
  dolor? Atque dolores at amet sapiente debitis minus totam
  quia, tempora dicta, hic veniam voluptate?`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: "Text Copied!",
      description: "Text berhasil disalin ke clipboard",
      variant: "success",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            AI Copywriting
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Optimalkan pesanmu dengan copywriting cerdas berbasis AI 🚀✨
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="namaProduk"
                    value={formData.namaProduk}
                    onChange={handleChange}
                    placeholder="Masukkan Produk"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Jenis Konten <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jenisKonten"
                    id="jenisKonten"
                    onChange={handleSelectChange}
                    className="mt-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Pilih jenis konten…</option>
                    <option value="Caption">Caption</option>
                    <option value="Story">Story</option>
                    <option value="Post">Post</option>
                    <option value="Tweet">Tweet</option>
                    <option value="Reel">Reel</option>
                    <option value="Short">Short</option>
                    <option value="Bio">Bio</option>
                  </select>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Gaya Bahasa <span className="text-red-500">*</span>
                  </label>
                  <select
                    onChange={handleSelectChange}
                    name="gayaBahasa"
                    id="gayaBahasa"
                    className="mt-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Pilih gaya bahasa…</option>
                    <option value="Formal">Formal</option>
                    <option value="Makassar Halus">Makassar halus</option>
                    <option value="Daeng Friendly">Daeng Friendly</option>
                    <option value="Gen Z TikTok">Gen Z TikTok</option>
                  </select>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Tujuan Konten <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    name="tujuanKonten"
                    value={formData.tujuanKonten}
                    onChange={handleChange}
                    placeholder="Contoh : brand awareness, jualan, engagement, edukasi"
                    className="mt-1"
                    rows={4}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Kirim
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Form Preview */}
<Card>
  <CardHeader>
    <CardTitle>Hasil Copywriting</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Generating copywriting...</p>
        </div>
      ) : result ? (
        <>
          {/* Main Text */}
          <div className="relative">
            <button
              onClick={() => handleCopy(result.mainText)}
              className="absolute top-0 right-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            >
              <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400" />
            </button>
            <div className="pr-10">
              <h3 className="text-sm font-semibold mb-2">Text Utama:</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {result.mainText}
              </p>
            </div>
          </div>

          {/* Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Alternatif Lainnya:</h3>
              <div className="space-y-3">
                {result.alternatives.map((alt, index) => (
                  <div key={index} className="relative bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <button
                      onClick={() => handleCopy(alt)}
                      className="absolute top-2 right-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 pr-8">
                      {alt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hasil copywriting akan muncul di sini setelah Anda klik "Kirim"
          </p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
