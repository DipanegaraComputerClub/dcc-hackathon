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

const LLAMA_MODEL = 'llama-3.3-70b-instruct';

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
// EXPORTS
// ============================================
export default {
  getAIRecommendation,
  calculateBusinessMetrics,
  getPastInsights,
  QUICK_INSIGHTS
};
