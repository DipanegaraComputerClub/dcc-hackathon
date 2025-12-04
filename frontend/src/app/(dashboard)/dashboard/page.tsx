"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Brain, Sparkles, FileText, MessageCircle, Tag, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-1">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent dark:from-red-500 dark:to-red-400">
            Dashboard TABE AI
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Tabe', Daeng. Ini ringkasan aktivitas ta' hari ini.
          </p>
        </div>

        {/* RINGKASAN (Kartu Otomatis Putih/Hitam) */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* PERBAIKAN: Gunakan bg-white untuk terang, dark:bg-gray-900 untuk gelap */}
          <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all hover:shadow-md">
            <CardContent className="pt-6 text-center">
              <div className="mb-2 flex justify-center">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                    <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">12</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Konten Jadi Hari Ini</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all hover:shadow-md">
            <CardContent className="pt-6 text-center">
              <div className="mb-2 flex justify-center">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                    <MessageCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">5</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Komentar Masuk</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all hover:shadow-md">
            <CardContent className="pt-6 text-center">
               <div className="mb-2 flex justify-center">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">3</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Promo Jalan</p>
            </CardContent>
          </Card>
        </div>

        {/* FITUR AI SHORTCUT */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Mau bikin apa ki' sekarang?</h2>
          <div className="grid gap-4 md:grid-cols-3">
            
            {/* Kartu 1 */}
            <Card className="p-5 flex items-center gap-4 hover:border-red-300 dark:hover:border-red-900 border-gray-200 dark:border-gray-800 transition-colors cursor-pointer group bg-white dark:bg-gray-900">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-600">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">Bikin Konten Cepat</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Buat caption & skrip video</p>
              </div>
            </Card>

            {/* Kartu 2 */}
            <Card className="p-5 flex items-center gap-4 hover:border-red-300 dark:hover:border-red-900 border-gray-200 dark:border-gray-800 transition-colors cursor-pointer group bg-white dark:bg-gray-900">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">Cari Ide Baru</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Inspirasi biar tidak buntu</p>
              </div>
            </Card>

            {/* Kartu 3 */}
            <Card className="p-5 flex items-center gap-4 hover:border-red-300 dark:hover:border-red-900 border-gray-200 dark:border-gray-800 transition-colors cursor-pointer group bg-white dark:bg-gray-900">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-600">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">Buat Kata-kata Promo</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Supaya laris manis jualan ta'</p>
              </div>
            </Card>
          </div>
        </div>

        {/* GASPOL BUTTONS */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Gaspol (Aksi Cepat)</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Button className="w-full py-6 text-md font-semibold flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/20 border-0 transition-all active:scale-95">
              <FileText className="h-5 w-5" /> Generate Caption
            </Button>

            <Button className="w-full py-6 text-md font-semibold flex items-center gap-2 bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all active:scale-95">
              <Tag className="h-5 w-5" /> Bikin Promo
            </Button>

            <Button className="w-full py-6 text-md font-semibold flex items-center gap-2 bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all active:scale-95">
              <MessageCircle className="h-5 w-5" /> Balas Komentar
            </Button>
          </div>
        </div>

        {/* HISTORY */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" />
                <CardTitle className="text-lg text-gray-900 dark:text-white">Riwayat Aktivitas Ta'</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 1, text: "Bikin Caption Promo 'Jumat Berkah' Diskon 20%", time: "2 jam lalu" },
              { id: 2, text: "Analisa Komentar Pelanggan di Instagram", time: "5 jam lalu" },
              { id: 3, text: "Cari Ide Konten Makanan Pedas", time: "Kemarin" },
            ].map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-none dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors cursor-default"
              >
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm md:text-base">{item.text}</p>
                <p className="text-xs text-gray-400 whitespace-nowrap ml-4">{item.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}