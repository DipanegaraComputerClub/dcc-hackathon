"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Brain, 
  Sparkles, 
  FileText, 
  MessageCircle, 
  Tag, 
  TrendingUp,
  Store,
  Package,
  DollarSign,
  ShoppingCart,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  BarChart3
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface DashboardData {
  profile: any;
  products: any[];
  transactions: any[];
  aiInsights: any[];
  summary: any;
}

interface ContentAnalysis {
  contentIdeas: string[];
  targetAudience: string;
  bestPostingTimes: string[];
  trendingTopics: string[];
  statistics: {
    totalRevenue: number;
    growthRate: string;
    topProduct: string;
    conversionTips: string[];
  };
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    profile: null,
    products: [],
    transactions: [],
    aiInsights: [],
    summary: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel
      const [profileRes, productsRes, transactionsRes, insightsRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/api/dapur-umkm/profile`),
        fetch(`${API_URL}/api/dapur-umkm/products`),
        fetch(`${API_URL}/api/dapur-umkm/transactions`),
        fetch(`${API_URL}/api/dapur-umkm/insights-history`),
        fetch(`${API_URL}/api/dapur-umkm/summary`)
      ]);

      const [profile, products, transactions, insights, summary] = await Promise.all([
        profileRes.json(),
        productsRes.json(),
        transactionsRes.json(),
        insightsRes.json(),
        summaryRes.json()
      ]);

      setDashboardData({
        profile: profile.success ? profile.data : null,
        products: products.success ? products.data : [],
        transactions: transactions.success ? transactions.data : [],
        aiInsights: insights.success ? insights.data : [],
        summary: summary.success ? summary.data : null
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContentAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      // Use new dedicated dashboard analysis endpoint
      const res = await fetch(`${API_URL}/api/dapur-umkm/dashboard-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: dashboardData.profile?.id
        })
      });

      const data = await res.json();
      
      if (data.success) {
        // Backend already provides structured data
        const analysis = data.data;
        
        setContentAnalysis({
          contentIdeas: analysis.contentIdeas || [],
          targetAudience: analysis.targetAudience || '',
          bestPostingTimes: analysis.bestPostingTimes || [],
          trendingTopics: analysis.trendingTopics || [],
          statistics: {
            totalRevenue: analysis.statistics.totalRevenue || 0,
            growthRate: analysis.statistics.growthRate || '+0%',
            topProduct: analysis.statistics.topProduct || 'Belum ada data',
            conversionTips: analysis.conversionTips || []
          }
        });
        
        setShowAnalysis(true);
      } else {
        console.error('Analysis failed:', data.message);
        alert('Gagal generate analisis: ' + (data.message || 'Terjadi kesalahan'));
      }
    } catch (error) {
      console.error('Error generating content analysis:', error);
      alert('Terjadi kesalahan saat generate analisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate metrics
  const totalProducts = dashboardData.products.length;
  const activeProducts = dashboardData.products.filter(p => p.stock > 0).length;
  const lowStockProducts = dashboardData.products.filter(p => p.stock > 0 && p.stock < 10).length;
  const totalRevenue = dashboardData.summary?.total_revenue || 0;
  const totalTransactions = dashboardData.transactions.length;
  const recentTransactions = dashboardData.transactions.slice(0, 5);
  const recentInsights = dashboardData.aiInsights.slice(0, 5);

  // Calculate today's transactions
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = dashboardData.transactions.filter(t => 
    t.transaction_date?.startsWith(today)
  );
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-1">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent dark:from-red-500 dark:to-red-400">
            Dashboard UMKM - {dashboardData.profile?.business_name || 'TABE AI'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Tabe', Daeng. Ini ringkasan bisnis UMKM ta' hari ini.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : (
          <>
            {/* RINGKASAN UTAMA */}
            <div className="grid gap-4 md:grid-cols-4">
              {/* Total Revenue */}
              <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        Rp {totalRevenue.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-3 h-3" />
                        Hari ini: Rp {todayRevenue.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Products */}
              <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Produk</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {activeProducts} produk ready stok
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Transactions */}
              <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transaksi</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTransactions}</p>
                      <p className="text-xs text-purple-600 mt-1">
                        {todayTransactions.length} transaksi hari ini
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card className="shadow-sm border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stok Menipis</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockProducts}</p>
                      <p className="text-xs text-amber-600 mt-1">
                        Perlu restock segera
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CONTENT ANALYSIS & STATISTICS */}
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-red-600" />
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      Analisis Konten & Statistik AI
                    </CardTitle>
                  </div>
                  <Button
                    onClick={generateContentAnalysis}
                    disabled={isAnalyzing || !dashboardData.profile}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menganalisis...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Analisis
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!showAnalysis ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Belum ada analisis. Klik tombol di atas untuk mendapatkan rekomendasi konten & statistik bisnis.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      AI akan menganalisis data produk, transaksi, dan performa bisnis Anda
                    </p>
                  </div>
                ) : contentAnalysis && (
                  <div className="space-y-6">
                    {/* Statistics Overview */}
                    <div className="grid md:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          Rp {contentAnalysis.statistics.totalRevenue.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Growth Rate</p>
                        <p className={`text-2xl font-bold ${contentAnalysis.statistics.growthRate.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {contentAnalysis.statistics.growthRate}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Top Product</p>
                        <p className="text-lg font-bold text-blue-600 truncate">
                          {contentAnalysis.statistics.topProduct}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Content Ideas */}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          <h3 className="font-bold text-gray-900 dark:text-white">Ide Konten</h3>
                        </div>
                        <ul className="space-y-2">
                          {contentAnalysis.contentIdeas.map((idea, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="text-red-600 font-bold">{idx + 1}.</span>
                              <span>{idea}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Target Audience */}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                          <h3 className="font-bold text-gray-900 dark:text-white">Target Audience</h3>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {contentAnalysis.targetAudience}
                        </p>
                      </div>

                      {/* Best Posting Times */}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          <h3 className="font-bold text-gray-900 dark:text-white">Waktu Posting Terbaik</h3>
                        </div>
                        <ul className="space-y-2">
                          {contentAnalysis.bestPostingTimes.map((time, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="text-purple-600">•</span>
                              <span>{time}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Trending Topics */}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-5 h-5 text-green-600" />
                          <h3 className="font-bold text-gray-900 dark:text-white">Trending Topics</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {contentAnalysis.trendingTopics.map((topic, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                              #{topic.replace(/\s+/g, '')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Conversion Tips */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                        <h3 className="font-bold text-gray-900 dark:text-white">Tips Meningkatkan Conversion</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        {contentAnalysis.statistics.conversionTips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                            <span className="text-orange-600 font-bold text-lg">💡</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        💡 Analisis dihasilkan oleh Kolosal Llama 4 Maverick berdasarkan data bisnis Anda
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QUICK ACTIONS */}
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/management">
                <Card className="p-5 flex items-center gap-4 hover:border-red-300 dark:hover:border-red-900 border-gray-200 dark:border-gray-800 transition-colors cursor-pointer group bg-white dark:bg-gray-900">
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-600">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">Kelola UMKM</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Produk, transaksi & stok</p>
                  </div>
                </Card>
              </Link>

              <Link href="/copywriting">
                <Card className="p-5 flex items-center gap-4 hover:border-red-300 dark:hover:border-red-900 border-gray-200 dark:border-gray-800 transition-colors cursor-pointer group bg-white dark:bg-gray-900">
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-600">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">Bikin Konten AI</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Caption & copywriting otomatis</p>
                  </div>
                </Card>
              </Link>

              <Link href="/analytics">
                <Card className="p-5 flex items-center gap-4 hover:border-red-300 dark:hover:border-red-900 border-gray-200 dark:border-gray-800 transition-colors cursor-pointer group bg-white dark:bg-gray-900">
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-600">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">Lihat Laporan</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Analisis & statistik bisnis</p>
                  </div>
                </Card>
              </Link>
            </div>

            {/* 2 COLUMN LAYOUT */}
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* RECENT TRANSACTIONS */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg text-gray-900 dark:text-white">Transaksi Terbaru</CardTitle>
                    </div>
                    <Link href="/management" className="text-xs text-red-600 hover:underline">
                      Lihat Semua
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentTransactions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada transaksi</p>
                  ) : (
                    recentTransactions.map((trans) => (
                      <div
                        key={trans.id}
                        className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-none dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            {trans.description || 'Transaksi'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(trans.transaction_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <p className={`text-sm font-bold ${trans.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trans.amount > 0 ? '+' : ''}Rp {Math.abs(trans.amount).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* AI INSIGHTS HISTORY */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <CardTitle className="text-lg text-gray-900 dark:text-white">Rekomendasi AI Terbaru</CardTitle>
                    </div>
                    <Link href="/management" className="text-xs text-red-600 hover:underline">
                      Lihat Semua
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentInsights.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada rekomendasi AI</p>
                  ) : (
                    recentInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="border-b border-gray-100 pb-3 last:border-none dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                            {insight.insight_type}
                          </span>
                          <p className="text-xs text-gray-500 ml-auto">
                            {new Date(insight.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {insight.recommendation}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* PRODUCTS OVERVIEW */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Produk & Stok</CardTitle>
                  </div>
                  <Link href="/management" className="text-xs text-red-600 hover:underline">
                    Kelola Produk
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {dashboardData.products.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Belum ada produk. Tambahkan produk pertama Anda!</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.products.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-none dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Harga: Rp {product.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            product.stock === 0 ? 'text-red-600' : 
                            product.stock < 10 ? 'text-amber-600' : 
                            'text-green-600'
                          }`}>
                            Stok: {product.stock}
                          </p>
                          {product.stock < 10 && product.stock > 0 && (
                            <p className="text-xs text-amber-600">⚠️ Segera restock</p>
                          )}
                          {product.stock === 0 && (
                            <p className="text-xs text-red-600">❌ Habis</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}