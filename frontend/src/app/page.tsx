import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Zap,
  Shield,
  Palette,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 justify-center">
            <div className="rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 p-5 shadow-lg shadow-yellow-400/30 animate-pulse">
              <LayoutDashboard className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent">
              TABE AI
            </span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Platform AI untuk UMKM kuliner Makassar, mi! Bikin branding, konten marketing, dan engagement pelanggan lebih gampang, nakko.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md">
                Gaskanmi
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {[
            {
              title: "AI Lokal Copywriting",
              icon: <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />,
              color: "yellow",
              text: "Bikin caption, slogan, dan deskripsi menu khas Makassar, mi! Bisa pilih bahasa halus, kasar, atau santai ala lokal. Contoh: “Coto Daeng — sekali coba, nakko ulangi mi!”"
            },
            {
              title: "AI Branding Coach",
              icon: <Users className="h-6 w-6 text-green-600 dark:text-green-400" />,
              color: "green",
              text: "Rekomendasi branding lengkap, ji: logo, warna, tone, style visual, dan positioning sesuai target audiens Makassar. Supaya warungmu makin terkenal, ndeh!"
            },
            {
              title: "AI Marketing Strategy",
              icon: <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
              color: "orange",
              text: "Analisis produk UMKM dan bikin kalender konten, strategi promo, jam posting terbaik, serta ide campaign lokal otomatis, mi. Contoh: “Promo Rampe-Rampe Weekend — beli 2 Pallubasa gratis es teh!”"
            },
            {
              title: "AI Food Photo Scoring",
              icon: <Palette className="h-6 w-6 text-red-600 dark:text-red-400" />,
              color: "red",
              text: "Upload foto makanan. Dapat skor kualitas, saran angle, warna, dan rekomendasi background supaya layak IG/TikTok."
            },
            {
              title: "Customer Engagement",
              icon: <Shield className="h-6 w-6 text-pink-600 dark:text-pink-400" />,
              color: "pink",
              text: "Auto-reply chat, template komentar IG/TikTok, dan balasan sopan tapi lucu khas Makassar, ndeh!"
            },
            {
              title: "AI Financial Insight",
              icon: <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
              color: "indigo",
              text: "Analisis penjualan, prediksi menu paling laku, dan rekomendasi bundling biar profit makin oke, ji!"
            },
          ].map((feature, idx) => (
            <Card
              key={idx}
              className={`transition-all hover:shadow-xl hover:scale-105 border-${feature.color}-200`}
            >
              <CardHeader>
                <div className={`rounded-lg bg-${feature.color}-200 dark:bg-${feature.color}-900/30 p-3 w-fit mb-2`}>
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-400">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-yellow-500 to-red-500 border-0 text-white rounded-xl shadow-lg">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Siap tingkatkan UMKM-mu, mi?</h2>
              <p className="text-yellow-100 mb-6 max-w-xl mx-auto">
                Gunakan TABE AI sekarang dan dapatkan branding, konten, dan strategi marketing yang langsung relevan untuk pasar Makassar, nakko!
              </p>
              <Link href="/login">
                <Button size="lg" className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg shadow-md">
                  Gaskanmi
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-700 dark:text-gray-400">
          <p>© 2024 TABE AI. Solusi UMKM Kuliner Makassar. Built with ❤️ Next.js & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
