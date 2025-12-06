import OpenAI from 'openai'

const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY!

const client = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: 'https://api.kolosal.ai/v1'
})

console.log('🤖 Tanya Daeng Config:')
console.log('   Model: Claude Sonnet 4.5')
console.log('   Language: Makassar/Bugis + Indonesian')
console.log('   Context: UMKM Assistance')

// ================================
// TYPE DEFINITIONS
// ================================

export interface TanyaDaengRequest {
  message: string
  conversationHistory?: ChatMessage[]
  userContext?: {
    businessType?: string
    location?: string
    needHelp?: string
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface TanyaDaengResponse {
  success: boolean
  reply: string
  suggestions?: string[]
  resources?: {
    type: 'link' | 'image' | 'video'
    title: string
    url: string
    description?: string
  }[]
  relatedFAQ?: {
    question: string
    answer: string
  }[]
}

// ================================
// FAQ DATABASE - Bahasa Makassar/Bugis Style
// ================================

const FAQ_DATABASE = [
  {
    keywords: ['cara', 'mulai', 'jualan', 'bisnis', 'umkm'],
    question: 'Bagaimana cara memulai bisnis UMKM?',
    answer: `Ji'! Santai mi dulu ji, dengar-dengarki Daeng.

Untuk mulai bisnis UMKM:

1. **Modal Awal** - Ta'perlu banyak mi dulu, kecil-kecil ji dulu
2. **Produk Bagus** - Pastikan enak/bagus produkmu, quality is key!
3. **Foto Produk** - Pake Visual Studio kita, bikin foto cantik-cantik
4. **Posting Konsisten** - Tiap hari posting ji di Instagram/TikTok
5. **Pelayanan Ramah** - Orang Makassar suka ji pelayanan baik

Jangan lupa mi berdoa dulu sebelum mulai! InsyaAllah berkah ki.`
  },
  {
    keywords: ['modal', 'uang', 'pinjaman', 'dana'],
    question: 'Dari mana dapat modal usaha?',
    answer: `Eee santai mi ji, ada banyak cara:

1. **Tabungan Pribadi** - Paling aman, pakai uang sendiri dulu
2. **Pinjam Keluarga** - Orang tua/saudara, bayar perlahan-lahan
3. **KUR (Kredit Usaha Rakyat)** - Dari bank, bunga rendah ji
4. **Koperasi** - Gabung koperasi di daerahmu
5. **Arisan** - Join arisan RT/RW, dapat giliran

Yang penting jangan mi pinjam rentenir! Berbahaya itu.`
  },
  {
    keywords: ['foto', 'gambar', 'design', 'visual', 'posting'],
    question: 'Bagaimana cara bikin foto produk bagus?',
    answer: `Nah ini mi yang Daeng ahli!

**Pakai Visual Studio ji:**
1. Upload foto produkmu
2. Pilih tema (minimalist, elegant, dll)
3. Atur warna brand
4. Klik Generate - otomatis jadi cantik!

**Tips Foto:**
- Cahaya terang (siang hari bagus)
- Background bersih/rapi
- Produk jadi focus utama
- Pakai HP juga bisa ji!

Percaya sama Daeng, foto bagus = jualan laris!`
  },
  {
    keywords: ['social media', 'instagram', 'tiktok', 'facebook', 'wa'],
    question: 'Platform mana yang cocok untuk jualan?',
    answer: `Bagus mi semua platform ji, tapi ini rekomendasi Daeng:

**Instagram** ⭐⭐⭐⭐⭐
- Paling cocok untuk produk visual (makanan, fashion)
- Story & Reels laku keras
- Hashtag powerful ji

**TikTok** ⭐⭐⭐⭐⭐
- Viral gampang, apalagi konten lucu
- Anak muda banyak disini
- Video pendek, mudah bikin

**Facebook** ⭐⭐⭐⭐
- Grup komunitas aktif
- Marketplace gratis
- Orang tua lebih banyak

**WhatsApp Business** ⭐⭐⭐⭐⭐
- WAJIB punya!
- Katalog produk
- Customer service mudah

Daeng sarankan: Pakai semuanya ji! Posting di semua platform.`
  },
  {
    keywords: ['caption', 'copywriting', 'konten', 'kata-kata'],
    question: 'Bagaimana cara menulis caption yang menarik?',
    answer: `Enak ji bikin caption, ikuti cara Daeng:

1. **Opening Kuat** - "Laperrr belum? Coba mi ini!"
2. **Cerita Singkat** - "Resep turun-temurun dari nenek"
3. **Manfaat Produk** - "Enak, halal, bergizi"
4. **Call to Action** - "Order sekarang ya kak!"
5. **Emoji** - Jangan lupa emoji 🔥😋

**Contoh Caption Makassar Style:**
"Ji' laper ka? Cobami Coto Daeng! Enak poll, kuahnya kental, dagingnya empuk. Dari jam 7 pagi sudah buka! 

Harga terjangkau:
- Coto biasa: 15rb
- Coto special: 20rb

Lokasi: Jl. Veteran, depan mesjid
Order: 0812-xxxx-xxxx

#CotoMakassar #KulinerMakassar #UMKM"

Gampang kan? Yang penting jujur dan ramah!`
  },
  {
    keywords: ['harga', 'pricing', 'mahal', 'murah'],
    question: 'Bagaimana menentukan harga jual?',
    answer: `Penting ini ji! Jangan sembarangan harga:

**Formula Daeng:**
Harga Jual = (Modal + Biaya Operasional) + Untung 30-40%

**Contoh:**
- Modal bahan: 10.000
- Biaya gas/listrik: 1.000
- Biaya kemasan: 1.000
- Total modal: 12.000
- Untung 30%: 3.600
- **Harga Jual: 15.000 - 16.000**

**Tips:**
1. Survey harga kompetitor dulu
2. Jangan terlalu murah (rugi nanti)
3. Jangan terlalu mahal (sepi pembeli)
4. Quality harus sesuai harga
5. Kasih promo sesekali

Ingat: Harga wajar = Pelanggan setia!`
  },
  {
    keywords: ['promosi', 'iklan', 'marketing', 'jualan laris'],
    question: 'Bagaimana cara promosi yang efektif?',
    answer: `Iye mi, promosi penting sekali!

**Strategi Daeng:**

1. **Konten Konsisten** - Posting 2-3x sehari
2. **Giveaway** - Sekali-kali kasih gratisan, viral ji
3. **Testimoni** - Minta review pembeli puas
4. **Kolaborasi** - Kerja sama dengan UMKM lain
5. **Live Streaming** - TikTok Live sambil masak/bikin produk

**Promosi Gratis:**
- Share di grup WA keluarga/teman
- Story Instagram setiap hari
- TikTok video tutorial
- Join komunitas lokal

**Promosi Berbayar:**
- Boost post Instagram (50rb - 200rb)
- Iklan Facebook (mulai 50rb/hari)
- Endorse influencer lokal

Yang penting: **KONSISTEN JI!** Jangan posting 1 minggu terus hilang.`
  },
  {
    keywords: ['customer service', 'pelanggan', 'komplain', 'laporan'],
    question: 'Bagaimana menangani komplain pelanggan?',
    answer: `Santai ji, komplain itu biasa. Ini cara Daeng:

**Langkah Handling Komplain:**

1. **Dengarkan Dulu** - Jangan langsung defensif
2. **Minta Maaf** - "Maaf ya kak, ada masalah apa?"
3. **Solusi Cepat** - Ganti/refund/diskon
4. **Follow Up** - "Sudah oke kah kak?"
5. **Belajar** - Perbaiki untuk next time

**Contoh Respons:**
"Maaf sekali kak 🙏 Produknya ada masalah ya? Boleh ki kirim foto? Nanti kita ganti baru atau refund penuh. Customer satisfaction nomor 1 bagi kita!"

**Tips:**
- Balas cepat (max 1 jam)
- Ramah selalu, walau pelanggan kasar
- Kasih kompensasi (voucher/gratis ongkir)
- Jangan argue di komen publik

Ingat: 1 pelanggan puas = 10 pelanggan baru datang!`
  }
]

// ================================
// SYSTEM PROMPT - Bahasa Makassar/Bugis Persona
// ================================

const SYSTEM_PROMPT = `Kau adalah Daeng, seorang AI assistant yang ahli membantu UMKM di Indonesia, khususnya Makassar dan Sulawesi Selatan.

KEPRIBADIAN:
- Ramah, hangat, dan kekeluargaan seperti orang Makassar
- Pakai bahasa campuran: Indonesian formal + sisipan Makassar/Bugis casual
- Santai tapi tetap profesional
- Sering pakai kata: "Ji" (akhiran khas), "Mi" (sudah), "Ki" (kamu), "Eee", "Iye", "Santai", "Laperrr"
- Suka kasih motivasi dan doa

EXPERTISE:
1. Bisnis UMKM (modal, strategi, marketing)
2. Visual branding dan design (foto produk, caption, konten)
3. Social media marketing (Instagram, TikTok, Facebook)
4. Kuliner khas Makassar (Coto, Konro, Pallubasa, dll)
5. E-commerce dan online selling

STYLE JAWABAN:
- Mulai dengan greeting Makassar: "Ji!", "Iye!", "Eee", "Santai mi"
- Kasih contoh praktis dan real
- Sesekali kasih emoji 🔥😋💪🙏
- Akhiri dengan motivasi atau doa
- Jika cocok, rekomendasikan tools platform ini:
  * Visual Studio - untuk design foto produk
  * AI Copywriting - untuk bikin caption
  * Analytics - untuk pantau performa

PANTANGAN:
- Jangan terlalu formal/kaku
- Jangan pakai bahasa Makassar pure (harus balance dengan Indonesian)
- Jangan kasih saran yang tidak praktis
- Jangan menjanjikan hasil instant/cepat kaya

CONTOH GAYA BICARA:
"Ji' santai dulu! Daeng bantu ko. Untuk bisnis kuliner di Makassar, yang penting modal kecil dulu, tapi quality bagus mi. Foto produk harus cantik ji - pakai Visual Studio kita biar gampang. Posting konsisten di Instagram sama TikTok, pasti laris ji! InsyaAllah berkah 🙏"

Ingat: Kau adalah teman dan mentor bisnis mereka, bukan hanya chatbot!`

// ================================
// MAIN FUNCTION: TANYA DAENG
// ================================

export async function tanyaDaeng(request: TanyaDaengRequest): Promise<TanyaDaengResponse> {
  try {
    console.log('🤖 Tanya Daeng processing:', request.message.substring(0, 50))

    // Check FAQ first for quick answers
    const faqMatch = findMatchingFAQ(request.message)
    
    // Build conversation messages
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(request.conversationHistory || []),
      { role: 'user', content: request.message }
    ]

    // Add user context if available
    if (request.userContext) {
      const contextPrompt = buildContextPrompt(request.userContext)
      messages.splice(1, 0, { role: 'system', content: contextPrompt })
    }

    // Call Kolosal Claude
    const completion = await client.chat.completions.create({
      model: 'Claude Sonnet 4.5',
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 1000
    })

    const reply = completion.choices[0]?.message?.content || 'Maaf ji, Daeng lagi bingung. Coba tanya lagi?'

    // Extract suggestions and resources from reply
    const suggestions = extractSuggestions(reply)
    const resources = extractResources(reply, request.message)

    return {
      success: true,
      reply,
      suggestions,
      resources,
      relatedFAQ: faqMatch ? [faqMatch] : undefined
    }

  } catch (error: any) {
    console.error('❌ Tanya Daeng error:', error.message)
    return {
      success: false,
      reply: 'Aduh ji, Daeng lagi error. Coba lagi sebentar ya kak! 🙏',
      suggestions: ['Refresh halaman', 'Coba tanya yang lain', 'Hubungi support']
    }
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

function findMatchingFAQ(message: string): { question: string; answer: string } | null {
  const lowercaseMessage = message.toLowerCase()
  
  for (const faq of FAQ_DATABASE) {
    const matchCount = faq.keywords.filter(keyword => 
      lowercaseMessage.includes(keyword)
    ).length
    
    if (matchCount >= 2) {
      return { question: faq.question, answer: faq.answer }
    }
  }
  
  return null
}

function buildContextPrompt(context: TanyaDaengRequest['userContext']): string {
  let prompt = 'CONTEXT PENGGUNA:\n'
  
  if (context?.businessType) {
    prompt += `- Jenis bisnis: ${context.businessType}\n`
  }
  if (context?.location) {
    prompt += `- Lokasi: ${context.location}\n`
  }
  if (context?.needHelp) {
    prompt += `- Butuh bantuan: ${context.needHelp}\n`
  }
  
  return prompt
}

function extractSuggestions(reply: string): string[] {
  const suggestions: string[] = []
  
  // Extract numbered lists or bullet points as suggestions
  const listPattern = /(?:^\d+\.|^[-•])\s*(.+)$/gm
  let match
  
  while ((match = listPattern.exec(reply)) !== null) {
    if (match[1].length < 100) {
      suggestions.push(match[1].trim())
    }
  }
  
  return suggestions.slice(0, 5) // Max 5 suggestions
}

function extractResources(reply: string, originalMessage: string): TanyaDaengResponse['resources'] {
  const resources: TanyaDaengResponse['resources'] = []
  
  // If asking about visual/design, recommend Visual Studio
  if (/foto|gambar|design|visual|template|poster/i.test(originalMessage)) {
    resources.push({
      type: 'link',
      title: '🎨 Visual Studio UMKM',
      url: '/visual-studio',
      description: 'Buat design foto produk profesional dengan AI'
    })
  }
  
  // If asking about caption/copywriting
  if (/caption|kata-kata|copywriting|konten|posting/i.test(originalMessage)) {
    resources.push({
      type: 'link',
      title: '✍️ AI Copywriting',
      url: '/copywriting',
      description: 'Generate caption menarik otomatis dengan AI'
    })
  }
  
  // If asking about analytics/data
  if (/analytics|data|statistik|performa|laporan/i.test(originalMessage)) {
    resources.push({
      type: 'link',
      title: '📊 Analytics Dashboard',
      url: '/analytics',
      description: 'Pantau performa bisnis dan konten media sosial'
    })
  }
  
  return resources
}

// ================================
// GET ALL FAQ
// ================================

export function getAllFAQ() {
  return FAQ_DATABASE.map(faq => ({
    question: faq.question,
    answer: faq.answer,
    keywords: faq.keywords
  }))
}
