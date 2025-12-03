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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-4 shadow-lg shadow-blue-500/30">
              <LayoutDashboard className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AdminHub
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Dashboard admin modern yang powerful dan siap pakai. Dibangun dengan
            Next.js, TypeScript, dan Tailwind CSS.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Mulai Sekarang
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Lihat Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 w-fit mb-2">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Performa Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Dibangun dengan Next.js 15 untuk performa optimal dan loading
                yang super cepat
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 w-fit mb-2">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola pengguna dengan mudah, termasuk CRUD operations dan role
                management
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-3 w-fit mb-2">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Analytics & Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Visualisasi data yang interaktif dengan Recharts untuk insight
                yang lebih baik
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-3 w-fit mb-2">
                <Palette className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Modern Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                UI yang clean dan modern dengan dark mode support dan smooth
                animations
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-3 w-fit mb-2">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Type-Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Dibangun dengan TypeScript untuk keamanan tipe dan developer
                experience yang lebih baik
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-3 w-fit mb-2">
                <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Fully Customizable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Mudah dikustomisasi sesuai kebutuhan dengan komponen yang
                reusable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Siap untuk memulai?</h2>
              <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                Mulai gunakan AdminHub sekarang dan tingkatkan produktivitas
                Anda
              </p>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="gap-2">
                  Login Sekarang
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 AdminHub. Built with ❤️ using Next.js & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
