// Updated Dashboard Page (Refactored & Simplified)
// This version focuses only on TABE AI features: Summary, Shortcuts, History, Quick Actions

"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Brain, Sparkles, FileText, MessageCircle, Tag } from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Dashboard TABE AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Ringkasan aktivitas harian UMKM Anda.
          </p>
        </div>

        {/* Summary of Today */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-sm border border-blue-100 dark:border-gray-800">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-blue-600">12</p>
              <p className="text-gray-600 dark:text-gray-400">Konten di-generate hari ini</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-blue-100 dark:border-gray-800">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-blue-600">5</p>
              <p className="text-gray-600 dark:text-gray-400">Analisa komentar</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-blue-100 dark:border-gray-800">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-blue-600">3</p>
              <p className="text-gray-600 dark:text-gray-400">Promo dibuat</p>
            </CardContent>
          </Card>
        </div>

        {/* Shortcut to AI Features */}
        <div>
          <h2 className="text-xl font-bold mb-3">Shortcut Fitur AI</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-5 flex items-center gap-4 hover:bg-blue-50 dark:hover:bg-gray-900 transition cursor-pointer">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">AI Content Generator</p>
                <p className="text-sm text-gray-500">Buat caption, postingan, dan script</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 hover:bg-blue-50 dark:hover:bg-gray-900 transition cursor-pointer">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">Ide Konten Harian</p>
                <p className="text-sm text-gray-500">Dapatkan inspirasi instan</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 hover:bg-blue-50 dark:hover:bg-gray-900 transition cursor-pointer">
              <Tag className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">Generate Promo</p>
                <p className="text-sm text-gray-500">Buat promo otomatis</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Button className="w-full py-6 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" /> Generate Caption Cepat
            </Button>

            <Button className="w-full py-6 text-lg flex items-center gap-2">
              <Tag className="h-5 w-5" /> Generate Promo
            </Button>

            <Button className="w-full py-6 text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> Analisa Komentar
            </Button>
          </div>
        </div>

        {/* History AI Generate */}
        <Card>
          <CardHeader>
            <CardTitle>History AI Generate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 1, text: "Generate Caption Promo Diskon 20%", time: "2 jam lalu" },
              { id: 2, text: "Analisa Komentar Instagram", time: "5 jam lalu" },
              { id: 3, text: "Generate Ide Konten Mingguan", time: "Kemarin" },
            ].map((item) => (
              <div
                key={item.id}
                className="border-b pb-3 last:border-none dark:border-gray-700"
              >
                <p className="font-medium">{item.text}</p>
                <p className="text-sm text-gray-500">{item.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}