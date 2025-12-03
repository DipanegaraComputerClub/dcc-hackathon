"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Copy } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Simulate API call
      setTimeout(() => {
        addToast({
          title: "Form Submitted!",
          description: "Data berhasil dikirim",
          variant: "success",
        });
        setFormData({
          namaProduk: "",
          jenisKonten: "",
          gayaBahasa: "",
          tujuanKonten: "",
        });
        setErrors({});
      }, 500);
    } else {
      addToast({
        title: "Validation Error",
        description: "Mohon periksa kembali form Anda",
        variant: "error",
      });
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

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
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
              <CardTitle>Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative">
                <button
                  onClick={handleCopy}
                  className="absolute top-0 right-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                >
                  <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400" />
                </button>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-5">
                    {textToCopy}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
