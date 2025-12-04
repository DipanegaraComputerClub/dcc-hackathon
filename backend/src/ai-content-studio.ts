import OpenAI from 'openai'

const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY!
const USE_MOCK = process.env.USE_MOCK_AI === 'true'

const client = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: 'https://api.kolosal.ai/v1'
})

console.log('🎨 AI Content Studio Config:')
console.log('   Model: Llama 4 Maverick')
console.log('   API Key:', KOLOSAL_API_KEY ? '✅ Set' : '❌ Not set')
console.log('   Mock Mode:', USE_MOCK ? '✅ Enabled' : '❌ Disabled')

// ================================
// TYPE DEFINITIONS
// ================================
export type ContentType = 
  | 'caption' 
  | 'promo' 
  | 'branding' 
  | 'planner'
  | 'copywriting'
  | 'pricing'
  | 'reply' 
  | 'comment'

export interface AIContentRequest {
  type: ContentType
  inputText: string
  metadata?: Record<string, any>
}

export interface AIContentResponse {
  type: ContentType
  inputText: string
  outputText: string
  metadata: Record<string, any>
}

// ================================
// MAIN GENERATOR FUNCTION
// ================================
export async function generateAIContent(
  request: AIContentRequest
): Promise<AIContentResponse> {
  if (USE_MOCK) {
    console.log(`🧪 MOCK: Generating ${request.type}...`)
    return generateMockContent(request)
  }

  try {
    const prompt = buildPromptByType(request)
    console.log(`🤖 Generating ${request.type} with Llama 4 Maverick...`)
    
    const completion = await client.chat.completions.create({
      model: 'Llama 4 Maverick',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(request.type),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: getTemperatureByType(request.type),
      max_tokens: 1500,  // Increased untuk output yang lebih detail & beragam
      top_p: 0.95,       // Nucleus sampling untuk kreativitas
      frequency_penalty: 0.3,  // Kurangi repetisi
      presence_penalty: 0.3,   // Encourage topik baru
    })
    
    const outputText = completion.choices[0].message.content?.trim() || ''
    console.log(`✅ ${request.type} generated successfully`)
    
    return {
      type: request.type,
      inputText: request.inputText,
      outputText,
      metadata: request.metadata || {},
    }
  } catch (error: any) {
    console.error(`❌ Error generating ${request.type}:`, error.message)
    throw new Error(`Gagal generate ${request.type}: ${error.message}`)
  }
}

// ================================
// SYSTEM PROMPTS
// ================================
function getSystemPrompt(type: ContentType): string {
  const prompts: Record<ContentType, string> = {
    caption: 'Kamu adalah AI copywriter expert untuk UMKM kuliner Makassar. Kamu SANGAT kreatif dan selalu menghasilkan caption yang BERBEDA setiap kali. Kamu memahami psikologi konsumen lokal, tren viral TikTok/Instagram, dan budaya Makassar. Gunakan storytelling yang emotional, data lokal yang spesifik, dan call-to-action yang kuat. JANGAN gunakan template generik - setiap caption harus UNIK dan FRESH!',
    
    promo: 'Kamu adalah AI marketing strategist dengan pengalaman 10+ tahun di UMKM kuliner. Kamu expert dalam consumer psychology, scarcity principle, social proof, dan viral marketing. Setiap promo yang kamu buat HARUS berbeda dan menggunakan strategi unik seperti: limited-time offers, bundle deals, loyalty programs, flash sales, kolaborasi influencer lokal, atau gamification. Fokus pada behavior triggers yang membuat orang ACTION sekarang!',
    
    branding: 'Kamu adalah AI brand strategist tingkat expert yang memahami positioning strategy, brand archetype, value proposition, dan competitive differentiation. Kamu bisa menganalisis pasar Makassar, kompetitor lokal, dan cultural insights untuk menciptakan brand identity yang UNIK dan MEMORABLE. Berikan analisa mendalam dengan contoh konkrit, referensi brand sukses, dan actionable steps. Fokus pada emotional branding dan local pride!',
    
    planner: 'Kamu adalah AI content strategist expert dengan deep understanding tentang content pillars, customer journey mapping, engagement metrics, dan platform algorithms (Instagram, TikTok, Facebook). Buat content calendar yang strategic dengan variasi format (Reels, Carousel, Story, Live), timing optimal berdasarkan behavior audience Makassar, dan content mix yang balance (educational, entertaining, promotional, UGC). Setiap plan harus include KPIs dan reasoning!',
    
    copywriting: 'Kamu adalah AI master copywriter dengan expertise dalam persuasive writing frameworks: AIDA, PAS (Problem-Agitate-Solve), FAB (Features-Advantages-Benefits), storytelling hooks, dan neuro-linguistic programming. Kamu bisa menulis dalam bahasa Makassar autentik (bukan template), bahasa gaul Makassar Gen Z, dan formal sesuai konteks. Setiap copywriting HARUS menggunakan sensory words, social proof, dan urgency triggers yang spesifik untuk kultur lokal!',
    
    pricing: 'Kamu adalah AI financial strategist dan pricing expert untuk UMKM. Kamu memahami: cost-plus pricing, value-based pricing, competitive pricing, psychological pricing (charm pricing, prestige pricing), dan dynamic pricing. Analisa break-even point, profit margins, price elasticity, dan positioning strategy. Berikan rekomendasi pricing dengan justifikasi detail, perbandingan kompetitor Makassar, dan strategi penetrasi pasar yang actionable!',
    
    reply: 'Kamu adalah AI customer service excellence trainer dengan expertise dalam empathetic communication, de-escalation techniques, solution-focused responses, dan relationship building. Setiap reply harus: (1) Acknowledge perasaan customer, (2) Provide solution/info yang jelas, (3) Add personal touch khas Makassar, (4) End with positive note. Sesuaikan tone: ramah untuk inquiry, empati untuk komplain, profesional untuk bisnis. Hindari template robot - be HUMAN!',
    
    comment: 'Kamu adalah AI data analyst expert dalam sentiment analysis, text mining, customer insights extraction, dan trend prediction. Analisa DEEP: sentiment score (1-10), emotion detection (happy/angry/sad/excited), pain points, buying intent, customer personas, dan action items. Berikan: (1) Summary ringkas, (2) Key insights dengan quote spesifik, (3) Prioritized action steps, (4) Suggested reply template, (5) Business improvement recommendations. Think like a business consultant!',
  }
  
  return prompts[type]
}

// ================================
// PROMPT BUILDERS
// ================================
function buildPromptByType(request: AIContentRequest): string {
  const { type, inputText, metadata } = request
  
  switch (type) {
    case 'caption':
      return buildCaptionPrompt(inputText, metadata)
    case 'promo':
      return buildPromoPrompt(inputText, metadata)
    case 'branding':
      return buildBrandingPrompt(inputText, metadata)
    case 'planner':
      return buildPlannerPrompt(inputText, metadata)
    case 'copywriting':
      return buildCopywritingPrompt(inputText, metadata)
    case 'pricing':
      return buildPricingPrompt(inputText, metadata)
    case 'reply':
      return buildReplyPrompt(inputText, metadata)
    case 'comment':
      return buildCommentPrompt(inputText, metadata)
    default:
      return inputText
  }
}

function buildCaptionPrompt(inputText: string, metadata?: Record<string, any>): string {
  const topik = metadata?.topik || inputText
  const tone = metadata?.tone || 'Santai'
  const platform = metadata?.platform || 'Instagram'
  const includeHashtags = metadata?.includeHashtags !== false
  
  // Variasi frameworks untuk setiap generation
  const frameworks = [
    'Hook + Story + CTA',
    'Problem + Agitate + Solution',
    'Question + Answer + Action',
    'FOMO + Social Proof + Urgency',
    'Behind the Scenes + Value + Invitation'
  ]
  const randomFramework = frameworks[Math.floor(Math.random() * frameworks.length)]
  
  return `Buat caption UNIK untuk ${platform} tentang: "${topik}"

KONTEKS PENTING:
- Target: UMKM kuliner Makassar
- Tone: ${tone}
- Platform: ${platform}
- Framework: Gunakan pendekatan "${randomFramework}"

INSTRUKSI KREATIF:
1. Opening HOOK yang bikin berhenti scroll (jangan generic!)
2. Ceritakan dengan storytelling yang emotional & relatable
3. Gunakan sensory words (rasa, aroma, tekstur) yang spesifik
4. Include social proof atau testimoni singkat jika relevan
5. Closing dengan CTA yang kuat (comment/share/visit)
6. Sesuaikan bahasa dengan kultur Makassar (bisa campur lokal words)
7. ${includeHashtags ? 'Tambahkan 8-12 hashtag strategi: mix populer + niche + branded' : 'Tanpa hashtag'}

CONTOH VARIASI OPENING HOOKS:
- "Pagi ini kami hampir kehabisan stok..." (Scarcity)
- "Ada yang tanya kenapa ${topik} kami beda..." (Curiosity)  
- "3 tahun lalu, kami mulai dari..." (Story)
- "Pelanggan: 'Ini enak banget!'" (Social proof)

OUTPUT: Buat caption yang BENAR-BENAR BERBEDA dari biasanya!

Format:
🔥 CAPTION ${platform.toUpperCase()}

[Caption siap post - 150-250 kata]

${includeHashtags ? '\n📌 HASHTAGS:\n[Hashtag strategy dengan reasoning]' : ''}`
}

function buildPromoPrompt(inputText: string, metadata?: Record<string, any>): string {
  const namaProduk = metadata?.namaProduk || inputText
  const discount = metadata?.discount || '20%'
  const targetAudience = metadata?.targetAudience || 'Umum'
  
  // Variasi strategi promo
  const strategies = [
    'Flash Sale + Countdown Timer',
    'Buy 1 Get 1 + Limited Stock',
    'Bundle Deal + Free Shipping',
    'Loyalty Reward + Gamification',
    'Kolaborasi Influencer Lokal + Giveaway',
    'Payday Special + Cashback'
  ]
  const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)]
  
  return `Buat KONSEP PROMO KREATIF untuk: "${namaProduk}"

BRIEF:
- Diskon/Promo: ${discount}
- Target: ${targetAudience}
- Lokasi: Makassar
- Strategi Unik: ${randomStrategy}

CHALLENGE: Buat promo yang VIRAL & MENGHASILKAN PENJUALAN!

REQUIREMENTS:
1. **JUDUL PROMO** yang bikin FOMO (Fear of Missing Out)
   - Gunakan power words: GRATIS, EKSKLUSIF, HARI INI, TERBATAS
   - Angka spesifik (Diskon 47% lebih menarik dari 50%)

2. **CAPTION PROMO** (200-300 kata) yang include:
   - Opening hook yang shocking/surprising
   - Benefit jelas untuk customer
   - Social proof (testimoni/sold out history)
   - Urgency triggers (limited time/stock)
   - Clear instructions cara ikutan promo
   - Multiple CTAs (Order/Share/Tag)

3. **STRATEGI EKSEKUSI** yang actionable:
   - Timing optimal post (hari + jam)
   - Platform prioritas (IG/FB/TikTok/WA)
   - Content format (carousel/video/story)
   - Kolaborasi potential (influencer/komunitas Makassar)

4. **PROMO MECHANICS** yang clear:
   - Syarat & ketentuan simple
   - Cara claim/redeem
   - Duration specific

5. **SUCCESS METRICS** untuk track:
   - Target sales/orders
   - Engagement expected

PENTING: Jangan buat promo generik! Sesuaikan dengan culture & behavior audience Makassar!

Format output:
📢 KONSEP PROMO VIRAL

🔥 [JUDUL PROMO]

📝 CAPTION:
[Full caption siap post]

⚡ STRATEGI EKSEKUSI:
[Step-by-step implementation]

📊 SUCCESS METRICS:
[KPIs to track]`
}

function buildBrandingPrompt(inputText: string, metadata?: Record<string, any>): string {
  const sloganSekarang = metadata?.sloganSekarang || ''
  const brandPersona = metadata?.brandPersona || inputText
  const toneOfVoice = metadata?.toneOfVoice || 'Makassar Friendly'
  
  return `Bantu analisis dan kembangkan branding untuk UMKM dengan detail:

${sloganSekarang ? `Slogan Sekarang: ${sloganSekarang}` : 'Belum punya slogan'}
Brand Persona: ${brandPersona}
Tone of Voice: ${toneOfVoice}

Buatkan rekomendasi branding yang meliputi:

Format output:
🎨 HASIL ANALISA BRANDING:

✨ SLOGAN UNIK:
[3 pilihan slogan yang memorable dan sesuai persona]

🎨 REKOMENDASI WARNA:
[3 warna dengan kode hex dan psikologi warnanya]

📖 STORYTELLING BRAND:
[Cerita brand yang emotional dan relatable untuk Makassar]

👤 KARAKTER BRAND PERSONA:
[Deskripsi karakter brand yang konsisten]`
}

function buildPlannerPrompt(inputText: string, metadata?: Record<string, any>): string {
  const temaMingguan = metadata?.temaMingguan || inputText
  const durasi = metadata?.durasi || '7'
  
  return `Buatkan content planner untuk social media dengan:

Tema: ${temaMingguan}
Durasi: ${durasi} hari

Buatkan jadwal konten yang:
- Seimbang antara konten edukasi, hiburan, dan promosi (80:20 ratio)
- Berdasarkan best practice posting time untuk audience Makassar
- Mencakup berbagai format (foto, video, story, carousel, reels)
- Mengikuti prinsip content marketing yang efektif

Format output:
📅 JADWAL KONTEN (${durasi} HARI)
Tema: ${temaMingguan}

[Untuk setiap hari, tulis:]
✅ Hari [X] ([Format Konten]): [Judul/Ide konten singkat]
   ⏰ Waktu posting terbaik: [Jam WITA]
   🎯 Tujuan: [Engagement/Edukasi/Selling]

💡 TIPS EKSEKUSI:
[Strategi tambahan untuk memaksimalkan engagement]`
}

function buildCopywritingPrompt(inputText: string, metadata?: Record<string, any>): string {
  const namaProduk = metadata?.namaProduk || inputText
  const jenisKonten = metadata?.jenisKonten || 'Caption'
  const tujuanKonten = metadata?.tujuanKonten || 'Jualan'
  const gayaBahasa = metadata?.gayaBahasa || 'Makassar Halus'
  
  let styleInstruction = ''
  switch (gayaBahasa.toLowerCase()) {
    case 'makassar halus':
      styleInstruction = 'Gunakan bahasa Makassar yang halus dan sopan dengan campuran Indonesia. Contoh: "Enak sekali mi", "Jangan lupa mampir ki ya".'
      break
    case 'daeng friendly':
      styleInstruction = 'Gunakan gaya ramah khas Makassar dengan panggilan "Daeng". Hangat dan akrab. Contoh: "Halo Daeng! Cobai mi menu baru ta".'
      break
    case 'formal':
      styleInstruction = 'Gunakan bahasa Indonesia formal yang profesional dan sopan.'
      break
    case 'gen z tiktok':
      styleInstruction = 'Gunakan bahasa Gen Z yang catchy dengan emoji dan istilah viral TikTok. Contoh: "Ga nyobain? Rugi banget sih 😭✨".'
      break
    default:
      styleInstruction = `Gunakan gaya bahasa ${gayaBahasa}.`
  }

  return `Buatkan ${jenisKonten} untuk produk "${namaProduk}":

Gaya: ${styleInstruction}
Tujuan: ${tujuanKonten}

Buatkan copywriting yang:
- Menarik dan sesuai gaya
- Cocok untuk ${jenisKonten}
- Singkat, padat, dan mengajak action
- Sesuai dengan tujuan ${tujuanKonten}

Format output:
📝 COPYWRITING (Tujuan: ${tujuanKonten})

[Copywriting lengkap siap pakai dengan emoji yang sesuai]

✨ ALTERNATIF:
[Berikan 2 variasi berbeda dengan gaya yang sama]`
}

function buildPricingPrompt(inputText: string, metadata?: Record<string, any>): string {
  const namaProduk = metadata?.namaProduk || inputText
  const cost = metadata?.cost || metadata?.modalHPP || 0
  const targetProfit = metadata?.targetProfit || metadata?.targetUntung || 30
  const competitorPrice = metadata?.competitorPrice || metadata?.hargaKompetitor || 0
  
  // Variasi analisa pricing methods
  const methods = [
    'Cost-Plus + Psychological Pricing',
    'Value-Based + Competitive Analysis',
    'Penetration Strategy + Market Share Focus',
    'Premium Positioning + Brand Value',
    'Dynamic Pricing + Demand-Based'
  ]
  const selectedMethod = methods[Math.floor(Math.random() * methods.length)]
  
  return `Lakukan ANALISA PRICING STRATEGY MENDALAM untuk: "${namaProduk}"

📊 DATA FINANSIAL:
- HPP/Cost: Rp ${cost.toLocaleString('id-ID')}
- Target Profit Margin: ${targetProfit}%
${competitorPrice > 0 ? `- Harga Kompetitor: Rp ${competitorPrice.toLocaleString('id-ID')}` : '- Data kompetitor: Perlu research'}
- Market: UMKM Kuliner Makassar
- Metode Analisa: ${selectedMethod}

TUGAS ANALISA LENGKAP:

1. **KALKULASI DETAIL** (Harus accurate!)
   - Break-even price (HPP + 0% margin)
   - Cost-plus target (HPP + ${targetProfit}% margin)
   - Harga psikologis optimal (charm pricing: 9.900 vs 10.000)
   - Bundling price suggestions
   - Volume discount structure

2. **COMPETITIVE INTELLIGENCE**
   ${competitorPrice > 0 ? `
   - Gap analysis vs kompetitor (Rp ${competitorPrice.toLocaleString('id-ID')})
   - Positioning: Above/At/Below kompetitor?
   - Value differentiation yang justify price difference` : `
   - Research kompetitor Makassar serupa
   - Estimasi range harga market
   - Sweet spot positioning`}

3. **MARKET CONTEXT MAKASSAR**
   - Daya beli segmen target (mahasiswa/pekerja/keluarga)
   - Price sensitivity untuk produk ini
   - Cultural pricing (angka favorit: 8, 9, 88, 99)
   - Seasonal pricing opportunities (Ramadhan, weekends, payday)

4. **STRATEGI MAKSIMALKAN REVENUE**
   - Paket bundling (1+1, family pack, catering)
   - Upselling strategy (add-ons, premium version)
   - Cross-selling items
   - Loyalty program pricing tier
   - Early bird / happy hour pricing

5. **IMPLEMENTATION PLAN**
   - Phase 1: Launch pricing (penetration/premium?)
   - Phase 2: Regular pricing
   - Phase 3: Promotional pricing calendar
   - A/B testing suggestions (test 2-3 price points)

6. **RISK & OPPORTUNITY ANALYSIS**
   - Risk pricing terlalu tinggi
   - Risk pricing terlalu rendah (devaluasi brand)
   - Sweet spot range dengan reasoning
   - Contingency plan jika harga tidak work

Output dalam format:
💰 PRICING STRATEGY ANALYSIS

📊 REKOMENDASI HARGA (3 Skenario):
[Berikan 3 opsi: Aggressive/Standard/Premium dengan pros-cons]

📈 BREAKDOWN FINANSIAL:
[Tabel detail kalkulasi]

🎯 POSITIONING STRATEGY:
[Strategic reasoning + competitive advantage]

🚀 IMPLEMENTATION ROADMAP:
[Timeline eksekusi 3 bulan]

💡 PRO TIPS PRICING MAKASSAR:
[Insights spesifik lokal yang actionable]`
}

function buildReplyPrompt(inputText: string, metadata?: Record<string, any>): string {
  const pesanPelanggan = metadata?.pesanPelanggan || inputText
  const nadaBalasan = metadata?.nadaBalasan || 'Ramah & Membantu'
  
  return `Buatkan balasan customer service untuk pesan pelanggan berikut:

PESAN PELANGGAN:
"${pesanPelanggan}"

NADA BALASAN: ${nadaBalasan}

Buatkan balasan yang:
- Sesuai dengan nada "${nadaBalasan}"
- Empati dan solutif
- Profesional namun tetap friendly
- Mengandung action/solusi konkret
- Mempertahankan customer relationship

Format output:
💬 REKOMENDASI BALASAN:

[Balasan lengkap siap kirim dengan emoji yang sesuai]

💡 ANALISIS SITUASI:
[Penjelasan singkat situasi dan mengapa balasan ini efektif]`
}

function buildCommentPrompt(inputText: string, metadata?: Record<string, any>): string {
  const comment = metadata?.komentarPelanggan || inputText
  
  return `Lakukan ANALISA MENDALAM terhadap komentar customer ini:

💬 KOMENTAR:
"${comment}"

TUGAS: Analisa seperti seorang BUSINESS ANALYST & CUSTOMER SUCCESS MANAGER!

ANALISA YANG HARUS DILAKUKAN:

1. **SENTIMENT ANALYSIS** (Detailed!)
   - Overall sentiment: Positif/Netral/Negatif (dengan score 1-10)
   - Emotion detected: Happy/Angry/Disappointed/Excited/Confused
   - Urgency level: Low/Medium/High/Critical
   - Customer lifecycle stage: New/Regular/Loyal/Churning

2. **DEEP INSIGHTS EXTRACTION**
   - Pain points mentioned (spesifik!)
   - Expectations vs reality gap
   - Buying intent signals
   - Recommendation likelihood
   - Competitor mentions
   - Cultural/local context (Makassar specific)

3. **KEY QUOTES & THEMES**
   - Quote 2-3 kalimat penting dari comment
   - Main themes/topics
   - Keywords yang sering muncul

4. **BUSINESS IMPLICATIONS**
   - Impact ke brand reputation (positive/negative/neutral)
   - Revenue opportunity (upsell/cross-sell potential)
   - Churn risk assessment
   - Product/service improvement insights
   - Competitive advantage/disadvantage revealed

5. **PRIORITIZED ACTION ITEMS**
   - Immediate actions (24 hours)
   - Short-term actions (1 week)
   - Long-term improvements (1 month+)
   - Who should handle this? (owner/CS/chef/marketing)

6. **RESPONSE STRATEGY**
   - Recommended tone: Empathetic/Professional/Friendly/Apologetic
   - Key points to address dalam reply
   - Do's and Don'ts
   - 2 alternative reply drafts (formal & casual Makassar style)

7. **SIMILAR PATTERN DETECTION**
   - Apakah ini one-off issue atau pattern?
   - Red flags untuk monitor
   - Opportunities untuk leverage (jika positif)

Format output:
🔍 COMPREHENSIVE COMMENT ANALYSIS

📊 SENTIMENT BREAKDOWN:
[Detail scoring + reasoning]

🎯 KEY INSIGHTS:
[Bullet points penting dengan quotes]

⚡ PRIORITY ACTIONS:
[Ranked by urgency + impact]

💬 RESPONSE TEMPLATES:

**Option 1 (Formal):**
[Balasan profesional]

**Option 2 (Makassar Friendly):**
[Balasan hangat khas Makassar]

💡 BUSINESS RECOMMENDATIONS:
[Strategic suggestions untuk prevent/leverage]`
}

// ================================
// TEMPERATURE SETTINGS
// ================================
function getTemperatureByType(type: ContentType): number {
  const temperatures: Record<ContentType, number> = {
    caption: 0.95,      // SANGAT kreatif & beragam
    promo: 0.90,        // Kreatif dengan ide fresh
    branding: 0.85,     // Strategic tapi inovatif
    planner: 0.75,      // Structured tapi varied
    copywriting: 0.95,  // Maksimal kreativitas
    pricing: 0.70,      // Analytical tapi varied approach
    reply: 0.80,        // Empati dengan varied tone
    comment: 0.75,      // Analytical tapi deep insights
  }
  
  return temperatures[type]
}

// ================================
// MOCK GENERATOR
// ================================
function generateMockContent(request: AIContentRequest): AIContentResponse {
  const { type, inputText, metadata } = request
  
  const mockOutputs: Record<ContentType, string> = {
    caption: `🔥 CAPTION INSTAGRAM SIAP PAKAI 🔥

Halo Daeng! 👋 Sudah coba menu baru kami? Rasanya bikin nagih! 🤤
Cocok banget buat makan siang bareng teman kantor.

📍 Lokasi: Jl. Pettarani No. 10
🛵 Tersedia di GrabFood & GoFood

Yuk buruan mampir sebelum kehabisan! 

#KulinerMakassar #MakassarDagang #Ewako #CotoMakassar #JajananMakassar`,

    promo: `📢 KONSEP PROMO SIAP POST!

🔥 JUDUL PROMO: GAJIAN TIBA? WAKTUNYA MAKAN ENAK TANPA PUSING!

📝 CAPTION:
Habis gajian jangan langsung habis cika'! 😂
Mending ke sini, makan kenyang hati senang.

Khusus buat Pegawai Kantor & Mahasiswa, tunjukkan ID Card kalian dan dapatkan DISKON 20% untuk semua menu Paket!

Buruan nah, cuma berlaku 3 hari! 🏃💨

⏰ WAKTU TERBAIK POST: Pukul 11:30 WITA (sebelum jam makan siang)

💡 TIPS TAMBAHAN: 
- Posting di story IG jam 8 pagi untuk reminder
- Share di grup WA kantor/kampus
- Buat countdown timer untuk urgency`,

    branding: `🎨 HASIL ANALISA BRANDING:

✨ SLOGAN UNIK:
1. "Rasa Sultan, Harga Teman - Ewako!"
2. "Dari Hati Makassar, Untuk Perut Indonesia"
3. "Authentik. Enak. Terjangkau."

🎨 REKOMENDASI WARNA:
- Merah Marun (#800000) → Berani, nafsu makan, tradisional
- Kuning Emas (#FFD700) → Mewah tapi ceria, optimis
- Hitam (#000000) → Elegan, premium, modern

📖 STORYTELLING BRAND:
"Berawal dari resep rahasia Nenek di lorong sempit Makassar tahun 1990, kami membawa cita rasa otentik yang tidak pernah berubah. Setiap suapan adalah perjalanan ke masa lalu, ke kehangatan keluarga Makassar."

👤 KARAKTER BRAND PERSONA:
"Si Daeng yang Ramah, Humoris, tapi Sangat Menghargai Tradisi. Bicara santai tapi tahu sopan santun. Seperti tetangga yang selalu siap berbagi cerita sambil makan bersama."`,

    planner: `📅 JADWAL KONTEN (7 HARI)
Tema: Kuliner Makassar

✅ Hari 1 (Video Reel): 'Behind The Scene' proses pembuatan bumbu rahasia
   ⏰ Waktu posting: 18:00 WITA
   🎯 Tujuan: Edukasi & Trust Building

✅ Hari 2 (Carousel): Repost testimoni pelanggan yang paling lucu
   ⏰ Waktu posting: 12:00 WITA
   🎯 Tujuan: Social Proof

✅ Hari 3 (Story + Post): Tebak-tebakan bahasa Makassar berhadiah voucher
   ⏰ Waktu posting: 15:00 WITA
   🎯 Tujuan: Engagement

✅ Hari 4 (Foto HD): Produk close-up yang bikin ngiler
   ⏰ Waktu posting: 11:00 WITA
   🎯 Tujuan: Soft Selling

✅ Hari 5 (Story + Post): Promo 'Jumat Berkah' diskon khusus
   ⏰ Waktu posting: 08:00 WITA
   🎯 Tujuan: Hard Selling

✅ Hari 6 (Carousel Edukasi): Tips makan Coto biar makin enak ala Daeng
   ⏰ Waktu posting: 16:00 WITA
   🎯 Tujuan: Value Content

✅ Hari 7 (Quote Card): Motivasi usaha anak muda Makassar
   ⏰ Waktu posting: 09:00 WITA
   🎯 Tujuan: Inspirasi & Community

💡 TIPS EKSEKUSI:
- Gunakan Reels untuk konten edukatif (algoritma prioritas)
- Selalu reply komentar dalam 1 jam pertama
- Cross-posting ke TikTok & Facebook untuk jangkauan lebih luas`,

    copywriting: `📝 COPYWRITING (Tujuan: Jualan)

POV: Kamu nemu produk lokal yang kualitasnya impor! 😱✨

Sumpah ini barang mantap sekali cika'. ${metadata?.namaProduk || inputText} ini solusinya buat kamu yang mau tampil beda.

Keunggulannya:
✅ Kualitas Premium
✅ Harga Terjangkau
✅ Asli Anak Makassar

Order sekarang sebelum kehabisan stok! Klik link di bio nah. 👇

✨ ALTERNATIF:

VARIASI 1:
Eh Daeng! Tau nda' kalo ${metadata?.namaProduk || inputText} kita ini sudah jadi favorit pelanggan setia? 🔥

Rahasianya? Simple ji:
- Bahan berkualitas
- Harga bersahabat
- Pelayanan cepat

Yuk cobai sebelum terlambat! DM aja langsung 📱

VARIASI 2:
Breaking News! 📢

${metadata?.namaProduk || inputText} yang viral di TikTok sekarang bisa dibeli di Makassar! 

Limited stock, siapa cepat dia dapat!
Grab yours NOW! 🏃‍♂️💨

#MakassarLokalPride`,

    pricing: `📊 ANALISIS HARGA:

💰 Modal (HPP): Rp ${metadata?.modalHPP?.toLocaleString('id-ID') || '15.000'}
📈 Rekomendasi Harga Jual: Rp 25.000 - Rp 28.000
✅ Margin Keuntungan: 40% - 46%

💡 STRATEGI PRICING:
1. **Harga Psikologis**: Gunakan Rp 24.999 atau Rp 27.999 (terlihat lebih murah)
2. **Tier Pricing**: 
   - Regular: Rp 25.000
   - Jumbo: Rp 35.000 (margin lebih besar)
3. **Bundle Deal**: Beli 3 hanya Rp 70.000 (dari Rp 75.000)

⚠️ CATATAN:
- Harga ini sudah kompetitif untuk market Makassar
- Pastikan packaging mendukung perceived value
- Monitor biaya operasional (listrik, gas, gaji) setiap bulan
- Evaluasi harga setiap 3 bulan mengikuti inflasi bahan baku`,

    reply: `💬 REKOMENDASI BALASAN:

"Halo Kak, terima kasih sudah menghubungi kami! 🙏

Mohon maaf atas ketidaknyamanannya. Boleh kami tahu detail masalahnya atau nomor pesanan Kakak supaya kami bantu cek statusnya segera? 

Kami pastikan masalah ini akan ditangani dengan cepat. Terima kasih atas kesabarannya ya Kak 😊

Salam hangat,
Tim [Nama Bisnis]"

💡 ANALISIS SITUASI:
Pesan ini efektif karena:
- Menunjukkan empati langsung
- Menawarkan solusi konkret (cek nomor pesanan)
- Menggunakan bahasa yang ramah namun profesional
- Menutup dengan harapan positif
- Mencantumkan signature untuk personal touch`,

    comment: `🔍 ANALISA KOMENTAR:

📊 SENTIMEN: NEGATIF 🔴

⚠️ MASALAH UTAMA: 
- Pelayanan lambat (respon customer service)
- Pesanan salah/tidak sesuai ekspektasi
- Kemungkinan kecewa dengan kualitas vs harga

💡 REKOMENDASI TINDAKAN:
1. **SEGERA** reply komentar secara personal (jangan generic)
2. **Minta maaf** dengan tulus dan akui kesalahan
3. **Tawarkan kompensasi** (voucher/diskon/refund)
4. **Follow up via DM** untuk privasi
5. **Internal review** proses yang bermasalah

💬 AUTO-REPLY SUGGESTION:
"Tabe' Kak, mohon maaf sekali atas ketidaknyamanannya 🙏 

Ini bukan standar pelayanan kami dan kami sangat menyesal. Boleh kami DM untuk ganti rugi dan pastikan hal ini tidak terulang lagi? 

Terima kasih masukannya, ini sangat membantu kami berkembang.

Hormat kami,
[Nama Bisnis]"

⚡ URGENCY LEVEL: TINGGI - Handle dalam 1 jam!`,
  }
  
  return {
    type,
    inputText,
    outputText: mockOutputs[type],
    metadata: metadata || {},
  }
}
