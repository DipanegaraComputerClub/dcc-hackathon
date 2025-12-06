/**
 * ============================================
 * DAPUR UMKM SERVICE
 * ============================================
 * AI-Powered UMKM Management System with Kolosal Llama
 * Features:
 * - Business strategy recommendations
 * - Pricing analysis and optimization
 * - Inventory management insights
 * - Financial health assessment
 * - Marketing strategy suggestions
 * 
 * Model: Kolosal Llama 3.3 70B Instruct
 * ============================================
 */

import OpenAI from 'openai';
import { supabase } from './supabase';

// ============================================
// KOLOSAL AI CLIENT (Llama 3.3 70B)
// ============================================
const kolosalLlama = new OpenAI({
  apiKey: process.env.KOLOSAL_API_KEY,
  baseURL: 'https://api.kolosal.ai/v1'
});

const LLAMA_MODEL = 'Llama 4 Maverick';

// ============================================
// SYSTEM PROMPT untuk UMKM Expert
// ============================================
const UMKM_EXPERT_PROMPT = `Kamu adalah konsultan bisnis UMKM profesional dari Indonesia dengan keahlian:
- Strategi pemasaran untuk UMKM lokal (terutama Makassar & Indonesia Timur)
- Analisis harga dan margin keuntungan
- Manajemen stok dan inventory
- Pengelolaan keuangan usaha kecil
- Digital marketing untuk UMKM

Gaya komunikasi:
- Ramah, praktis, dan actionable
- Gunakan bahasa Indonesia yang santai tapi profesional
- Berikan contoh nyata dan tips konkret
- Fokus pada solusi sederhana yang bisa langsung diterapkan
- Pahami kondisi UMKM Indonesia (modal terbatas, pasar lokal, kompetisi ketat)

Selalu berikan rekomendasi yang:
1. Spesifik dan terukur
2. Realistis untuk UMKM kecil
3. Bisa dieksekusi dengan budget minimal
4. Sesuai dengan konteks pasar Indonesia`;

// ============================================
// TYPE DEFINITIONS
// ============================================
interface UMKMProfile {
  id?: string;
  business_name: string;
  category: string;
  address?: string;
  phone?: string;
  description?: string;
}

interface Product {
  id?: string;
  name: string;
  price: number;
  stock: number;
  cost_price?: number;
  image_url?: string;
  category?: string;
}

interface Transaction {
  id?: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  category?: string;
}

interface BusinessMetrics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  productCount: number;
  lowStockProducts: Product[];
  topSellingProducts?: Product[];
  averageTransactionValue: number;
}

interface AIRecommendationRequest {
  profileId: string;
  insightType: 'pricing' | 'inventory' | 'strategy' | 'marketing' | 'finance';
  question: string;
  context?: BusinessMetrics;
}

// ============================================
// BUSINESS METRICS CALCULATION
// ============================================
export async function calculateBusinessMetrics(profileId: string): Promise<BusinessMetrics> {
  try {
    // Get all transactions
    const { data: transactions, error: txError } = await supabase
      .from('umkm_transactions')
      .select('*')
      .eq('profile_id', profileId);

    if (txError) throw txError;

    // Get all products
    const { data: products, error: prodError } = await supabase
      .from('umkm_products')
      .select('*')
      .eq('profile_id', profileId);

    if (prodError) throw prodError;

    // Calculate financial metrics
    const totalIncome = transactions
      ?.filter(t => t.type === 'in')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const totalExpense = transactions
      ?.filter(t => t.type === 'out')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const balance = totalIncome - totalExpense;

    // Inventory analysis
    const lowStockProducts = products?.filter(p => p.stock < 10) || [];
    
    const averageTransactionValue = transactions?.length 
      ? totalIncome / transactions.filter(t => t.type === 'in').length 
      : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      productCount: products?.length || 0,
      lowStockProducts,
      averageTransactionValue
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    throw error;
  }
}

// ============================================
// AI RECOMMENDATION ENGINE
// ============================================
export async function getAIRecommendation(request: AIRecommendationRequest) {
  try {
    const { profileId, insightType, question, context } = request;

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('umkm_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profileError) throw profileError;

    // Build context for AI
    const businessContext = context || await calculateBusinessMetrics(profileId);

    // Build prompt based on insight type
    let specificPrompt = '';
    
    switch (insightType) {
      case 'pricing':
        specificPrompt = `Analisis harga dan strategi pricing untuk bisnis ${profile.business_name} (${profile.category}).
        
Data bisnis:
- Total Pemasukan: Rp ${businessContext.totalIncome.toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${businessContext.totalExpense.toLocaleString('id-ID')}
- Saldo: Rp ${businessContext.balance.toLocaleString('id-ID')}
- Jumlah Produk: ${businessContext.productCount}

Pertanyaan: ${question}

Berikan rekomendasi pricing yang:
1. Kompetitif di pasar lokal
2. Mempertimbangkan margin keuntungan sehat (minimal 30%)
3. Sesuai dengan target pasar UMKM
4. Disertai contoh perhitungan konkret`;
        break;

      case 'inventory':
        specificPrompt = `Analisis dan rekomendasi manajemen stok untuk ${profile.business_name}.
        
Data stok:
- Total Produk: ${businessContext.productCount}
- Produk Stok Rendah: ${businessContext.lowStockProducts.length}
${businessContext.lowStockProducts.map(p => `  • ${p.name}: ${p.stock} unit`).join('\n')}

Pertanyaan: ${question}

Berikan tips inventory management yang praktis dan realistis untuk UMKM.`;
        break;

      case 'strategy':
        specificPrompt = `Konsultasi strategi bisnis untuk ${profile.business_name} (${profile.category}).
        
Performa bisnis:
- Omzet: Rp ${businessContext.totalIncome.toLocaleString('id-ID')}
- Pengeluaran: Rp ${businessContext.totalExpense.toLocaleString('id-ID')}
- Net Profit: Rp ${businessContext.balance.toLocaleString('id-ID')}
- Rata-rata Transaksi: Rp ${businessContext.averageTransactionValue.toLocaleString('id-ID')}

Pertanyaan: ${question}

Berikan strategi bisnis yang actionable dan bisa langsung dieksekusi.`;
        break;

      case 'marketing':
        specificPrompt = `Strategi marketing digital untuk ${profile.business_name}.
        
Bisnis: ${profile.category}
Budget: Minimal (UMKM kecil)

Pertanyaan: ${question}

Rekomendasikan strategi marketing yang:
1. Low-cost / no-cost
2. Fokus digital (Instagram, Facebook, TikTok, WhatsApp Business)
3. Sesuai target pasar lokal Indonesia
4. Mudah dieksekusi tanpa tim marketing`;
        break;

      case 'finance':
        specificPrompt = `Analisis kesehatan keuangan ${profile.business_name}.
        
Laporan Keuangan:
- Pemasukan: Rp ${businessContext.totalIncome.toLocaleString('id-ID')}
- Pengeluaran: Rp ${businessContext.totalExpense.toLocaleString('id-ID')}
- Saldo: Rp ${businessContext.balance.toLocaleString('id-ID')}
- Profit Margin: ${businessContext.totalIncome > 0 ? ((businessContext.balance / businessContext.totalIncome) * 100).toFixed(1) : 0}%

Pertanyaan: ${question}

Berikan analisis dan saran pengelolaan keuangan yang sehat untuk UMKM.`;
        break;
    }

    // Call Kolosal Llama API
    const completion = await kolosalLlama.chat.completions.create({
      model: LLAMA_MODEL,
      messages: [
        {
          role: 'system',
          content: UMKM_EXPERT_PROMPT
        },
        {
          role: 'user',
          content: specificPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9
    });

    const recommendation = completion.choices[0].message.content;

    // Save to database
    const { data: insight, error: insertError } = await supabase
      .from('umkm_ai_insights')
      .insert({
        profile_id: profileId,
        insight_type: insightType,
        question,
        recommendation,
        context_data: businessContext
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving AI insight:', insertError);
      // Continue even if save fails
    }

    return {
      success: true,
      data: {
        recommendation,
        insightType,
        context: businessContext,
        savedInsight: insight
      }
    };

  } catch (error: any) {
    console.error('AI Recommendation Error:', error);
    return {
      success: false,
      message: error.message || 'Gagal mendapatkan rekomendasi AI',
      error: error.response?.data || error
    };
  }
}

// ============================================
// QUICK AI INSIGHTS (Pre-defined Questions)
// ============================================
export const QUICK_INSIGHTS = [
  {
    id: 'pricing-strategy',
    title: 'Strategi Harga Optimal',
    question: 'Bagaimana cara menentukan harga jual yang kompetitif tapi tetap untung?',
    type: 'pricing' as const,
    icon: '💰'
  },
  {
    id: 'increase-sales',
    title: 'Cara Ningkatin Penjualan',
    question: 'Tips praktis untuk meningkatkan penjualan dengan budget terbatas?',
    type: 'strategy' as const,
    icon: '📈'
  },
  {
    id: 'social-media',
    title: 'Strategi Medsos',
    question: 'Platform medsos apa yang paling efektif untuk UMKM kuliner dan cara optimasinya?',
    type: 'marketing' as const,
    icon: '📱'
  },
  {
    id: 'inventory-management',
    title: 'Kelola Stok Efisien',
    question: 'Bagaimana cara mengelola stok agar tidak kelebihan atau kehabisan?',
    type: 'inventory' as const,
    icon: '📦'
  },
  {
    id: 'cash-flow',
    title: 'Atur Cash Flow',
    question: 'Tips mengatur arus kas agar bisnis tidak boncos?',
    type: 'finance' as const,
    icon: '💸'
  },
  {
    id: 'customer-retention',
    title: 'Pelanggan Setia',
    question: 'Strategi agar pelanggan jadi loyal dan repeat order?',
    type: 'strategy' as const,
    icon: '🤝'
  }
];

// ============================================
// GET PAST AI INSIGHTS
// ============================================
export async function getPastInsights(profileId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('umkm_ai_insights')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Error fetching past insights:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}

// ============================================
// DASHBOARD CONTENT ANALYSIS
// ============================================
export async function generateDashboardAnalysis(profileId: string) {
  try {
    // Get all business data
    const [profile, products, transactions, metrics] = await Promise.all([
      supabase.from('umkm_profiles').select('*').eq('id', profileId).single(),
      supabase.from('umkm_products').select('*').eq('profile_id', profileId),
      supabase.from('umkm_transactions').select('*').eq('profile_id', profileId).order('transaction_date', { ascending: false }),
      calculateBusinessMetrics(profileId)
    ]);

    if (profile.error) throw profile.error;
    
    const businessData = profile.data;
    const productList = products.data || [];
    const transactionList = transactions.data || [];

    // Find top product
    const productSales = productList.map(p => ({
      name: p.name,
      sold: p.sold || 0,
      stock: p.stock || 0,
      price: p.price || 0
    })).sort((a, b) => b.sold - a.sold);

    const topProduct = productSales[0]?.name || 'Belum ada data';
    const totalRevenue = metrics.totalIncome || 0;
    const totalTransactions = transactionList.length;

    // Calculate growth rate
    const sortedTransactions = [...transactionList].sort((a, b) => 
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
    
    let growthRate = '+0%';
    if (sortedTransactions.length >= 2) {
      const halfPoint = Math.floor(sortedTransactions.length / 2);
      const recentSum = sortedTransactions.slice(0, halfPoint).reduce((sum, t) => sum + (t.amount || 0), 0);
      const oldSum = sortedTransactions.slice(halfPoint).reduce((sum, t) => sum + (t.amount || 0), 0);
      
      if (oldSum > 0) {
        const growth = ((recentSum - oldSum) / oldSum * 100).toFixed(1);
        growthRate = parseFloat(growth) >= 0 ? `+${growth}%` : `${growth}%`;
      }
    }

    // Build comprehensive prompt for AI
    const analysisPrompt = `Sebagai konsultan bisnis UMKM, buatkan analisis lengkap untuk bisnis berikut:

PROFIL BISNIS:
- Nama: ${businessData.business_name || 'UMKM'}
- Kategori: ${businessData.category || 'Belum ditentukan'}
- Deskripsi: ${businessData.description || 'Tidak ada deskripsi'}
- Lokasi: ${businessData.address || 'Tidak disebutkan'}

DATA PERFORMA:
- Total Pendapatan: Rp ${totalRevenue.toLocaleString('id-ID')}
- Total Transaksi: ${totalTransactions}
- Growth Rate: ${growthRate}
- Total Produk: ${productList.length}
- Produk Terlaris: ${topProduct}
- Stok Rendah: ${metrics.lowStockProducts.length} produk

YANG PERLU DIANALISIS:
1. **5 IDE KONTEN MEDIA SOSIAL** yang spesifik untuk bisnis ini (bukan template umum). Setiap ide harus:
   - Relevan dengan kategori bisnis
   - Bisa langsung dieksekusi
   - Menarik untuk target market lokal Indonesia
   - Format: numbering 1-5 dengan deskripsi singkat

2. **TARGET AUDIENCE** yang tepat untuk bisnis ini, jelaskan:
   - Demografi (usia, gender, pekerjaan)
   - Psikografi (kebutuhan, pain points)
   - Behavior (kapan mereka beli, di mana mereka cari info)

3. **3 WAKTU POSTING TERBAIK** untuk media sosial, berikan:
   - Hari dan jam spesifik (misal: Senin-Jumat 11:00-13:00)
   - Alasan mengapa waktu tersebut efektif
   - Platform yang cocok untuk tiap waktu

4. **3 TRENDING TOPICS** yang relevan dengan bisnis ini:
   - Topik yang sedang trending di Indonesia
   - Cara mengaitkan bisnis dengan topik tersebut
   - Hashtag yang bisa dipakai

5. **3 TIPS CONVERSION** untuk meningkatkan penjualan:
   - Tips praktis dan actionable
   - Fokus pada closing sale
   - Bisa diterapkan langsung tanpa budget besar

PENTING: Format jawaban harus terstruktur dengan jelas, gunakan numbering dan bullet points. Jangan gunakan markdown heading (# ##), cukup gunakan teks bold atau numbering.`;

    // Call AI
    const completion = await kolosalLlama.chat.completions.create({
      model: LLAMA_MODEL,
      messages: [
        { role: 'system', content: UMKM_EXPERT_PROMPT },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      top_p: 0.95
    });

    const aiResponse = completion.choices[0].message.content || '';

    // Parse AI response into structured format
    const analysis = parseAIAnalysis(aiResponse);

    // Add statistics
    const result = {
      success: true,
      data: {
        contentIdeas: analysis.contentIdeas,
        targetAudience: analysis.targetAudience,
        bestPostingTimes: analysis.bestPostingTimes,
        trendingTopics: analysis.trendingTopics,
        conversionTips: analysis.conversionTips,
        statistics: {
          totalRevenue,
          growthRate,
          topProduct,
          totalProducts: productList.length,
          totalTransactions,
          lowStockCount: metrics.lowStockProducts.length
        },
        rawAnalysis: aiResponse,
        generatedAt: new Date().toISOString()
      }
    };

    // Save to insights history
    await supabase.from('umkm_ai_insights').insert({
      profile_id: profileId,
      insight_type: 'dashboard_analysis',
      question: 'Dashboard Content & Statistics Analysis',
      recommendation: aiResponse,
      context_data: result.data
    });

    return result;

  } catch (error: any) {
    console.error('Dashboard Analysis Error:', error);
    return {
      success: false,
      message: error.message || 'Gagal generate analisis dashboard',
      error: error.response?.data || error
    };
  }
}

// ============================================
// PARSE AI ANALYSIS RESPONSE
// ============================================
function parseAIAnalysis(text: string): {
  contentIdeas: string[];
  targetAudience: string;
  bestPostingTimes: string[];
  trendingTopics: string[];
  conversionTips: string[];
} {
  const lines = text.split('\n').filter(line => line.trim());
  
  const result = {
    contentIdeas: [] as string[],
    targetAudience: '',
    bestPostingTimes: [] as string[],
    trendingTopics: [] as string[],
    conversionTips: [] as string[]
  };

  let currentSection = '';
  let captureNext = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Detect sections
    if (lowerLine.includes('ide konten') || lowerLine.includes('content idea')) {
      currentSection = 'contentIdeas';
      captureNext = true;
      continue;
    } else if (lowerLine.includes('target audience') || lowerLine.includes('audiens')) {
      currentSection = 'targetAudience';
      captureNext = true;
      continue;
    } else if (lowerLine.includes('waktu posting') || lowerLine.includes('posting time')) {
      currentSection = 'bestPostingTimes';
      captureNext = true;
      continue;
    } else if (lowerLine.includes('trending') || lowerLine.includes('topik populer')) {
      currentSection = 'trendingTopics';
      captureNext = true;
      continue;
    } else if (lowerLine.includes('conversion') || lowerLine.includes('tips')) {
      currentSection = 'conversionTips';
      captureNext = true;
      continue;
    }

    // Extract content based on current section
    if (captureNext && line.length > 10) {
      const cleaned = line.replace(/^[\d\-\*\.\)\:\s]+/, '').trim();
      
      if (cleaned.length > 15) {
        if (currentSection === 'contentIdeas' && result.contentIdeas.length < 5) {
          result.contentIdeas.push(cleaned);
        } else if (currentSection === 'bestPostingTimes' && result.bestPostingTimes.length < 3) {
          result.bestPostingTimes.push(cleaned);
        } else if (currentSection === 'trendingTopics' && result.trendingTopics.length < 3) {
          result.trendingTopics.push(cleaned);
        } else if (currentSection === 'conversionTips' && result.conversionTips.length < 3) {
          result.conversionTips.push(cleaned);
        } else if (currentSection === 'targetAudience' && !result.targetAudience) {
          result.targetAudience = cleaned;
        }
      }
    }
  }

  // Fallback values if parsing failed
  if (result.contentIdeas.length === 0) {
    result.contentIdeas = [
      'Posting foto produk dengan customer testimonial',
      'Behind the scenes proses produksi atau persiapan',
      'Tips dan trik menggunakan atau memilih produk',
      'Promo spesial dengan storytelling menarik',
      'User generated content dari pelanggan setia'
    ];
  }

  if (!result.targetAudience) {
    result.targetAudience = 'Keluarga muda usia 25-40 tahun yang aktif di media sosial, mencari produk berkualitas dengan harga terjangkau, peduli dengan produk lokal.';
  }

  if (result.bestPostingTimes.length === 0) {
    result.bestPostingTimes = [
      'Senin-Jumat: 11:00-13:00 (jam istirahat makan siang, orang browsing sosmed)',
      'Sabtu-Minggu: 18:00-20:00 (prime time weekend, audience lebih santai)',
      'Kamis-Jumat: 16:00-17:00 (menjelang weekend, mood positif untuk belanja)'
    ];
  }

  if (result.trendingTopics.length === 0) {
    result.trendingTopics = [
      'Produk lokal berkualitas dan mendukung UMKM Indonesia',
      'Sustainable dan ramah lingkungan',
      'Behind the brand story dan perjalanan bisnis'
    ];
  }

  if (result.conversionTips.length === 0) {
    result.conversionTips = [
      'Gunakan call-to-action yang jelas dan mendesak (misal: "DM sekarang, stok terbatas!")',
      'Tambahkan urgency dengan limited time offer atau limited stock',
      'Showcase social proof dengan repost testimoni pelanggan'
    ];
  }

  return result;
}

// ============================================
// EXPORTS
// ============================================
export default {
  getAIRecommendation,
  calculateBusinessMetrics,
  getPastInsights,
  generateDashboardAnalysis,
  QUICK_INSIGHTS
};
