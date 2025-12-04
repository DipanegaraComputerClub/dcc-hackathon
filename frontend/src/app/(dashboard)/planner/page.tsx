"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Copy } from "lucide-react";

export default function ContentPlannerPage() {
  const [formData, setFormData] = useState({
    tema: "",
    durasi: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tema.trim()) {
      newErrors.tema = "Tema wajib diisi";
    }

    if (!formData.durasi.trim()) {
      newErrors.durasi = "Durasi wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      addToast({
        title: "Form Submitted!",
        description: "Data berhasil diproses",
        variant: "success",
      });
    } else {
      addToast({
        title: "Validation Error",
        description: "Mohon periksa kembali form Anda",
        variant: "error",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const previewText =
    formData.tema && formData.durasi
      ? `AI Content Planner
Tema: ${formData.tema}
Durasi: ${formData.durasi} hari

Output: Rencana konten otomatis berdasarkan tema mingguan yang akan menghasilkan ide posting harian, caption, dan strategi distribusi konten.`
      : "Isi form terlebih dahulu untuk melihat hasil preview…";

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    addToast({
      title: "Text Copied!",
      description: "Berhasil disalin ke clipboard",
      variant: "success",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            AI Content Planner
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Buat rencana konten otomatis berdasarkan tema mingguan 📅✨
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Tema Mingguan <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="tema"
                    value={formData.tema}
                    onChange={handleChange}
                    placeholder='Contoh: "Kuliner Makassar"'
                    className="mt-1"
                  />
                  {errors.tema && (
                    <p className="mt-1 text-xs text-red-500">{errors.tema}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Durasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="durasi"
                    value={formData.durasi}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">Pilih durasi…</option>
                    <option value="7">7 Hari</option>
                    <option value="14">14 Hari</option>
                    <option value="30">30 Hari</option>
                  </select>
                  {errors.durasi && (
                    <p className="mt-1 text-xs text-red-500">{errors.durasi}</p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Buat Rencana
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview Hasil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative">
                <button
                  onClick={handleCopy}
                  className="absolute top-0 right-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                >
                  <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700 dark:text-gray-400" />
                </button>

                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {previewText}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
