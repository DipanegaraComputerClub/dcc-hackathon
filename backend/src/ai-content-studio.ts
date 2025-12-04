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
  | 'brand_voice' 
  | 'comment_analysis' 
  | 'auto_reply' 
  | 'pricing'

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
      max_tokens: 800,
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
    caption: 'Kamu adalah AI copywriter ahli untuk social media. Spesialisasi membuat caption Instagram, Facebook, dan TikTok yang menarik, engaging, dan viral. Kamu memahami tren social media dan bisa menulis dalam bahasa Indonesia casual maupun formal.',
    
    promo: 'Kamu adalah AI marketing specialist yang ahli membuat promo announcement yang persuasif dan menarik. Kamu bisa membuat promo text yang FOMO-inducing dan action-driven untuk UMKM kuliner.',
    
    brand_voice: 'Kamu adalah AI brand strategist yang membantu UMKM kuliner mengembangkan dan konsisten dengan brand voice mereka. Kamu bisa menganalisis dan memberikan guideline brand communication.',
    
    comment_analysis: 'Kamu adalah AI sentiment analyzer yang ahli menganalisis komentar customer di social media. Kamu bisa mengidentifikasi sentimen (positif/negatif/netral), pain points, dan memberikan insights actionable.',
    
    auto_reply: 'Kamu adalah AI customer service assistant yang ramah dan profesional. Kamu bisa membuat balasan otomatis yang personal, helpful, dan sesuai dengan konteks pertanyaan customer tentang produk kuliner.',
    
    pricing: 'Kamu adalah AI pricing strategist untuk UMKM kuliner. Kamu bisa menganalisis harga kompetitor, cost structure, dan memberikan rekomendasi pricing yang optimal dengan mempertimbangkan value proposition dan target market.',
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
    case 'brand_voice':
      return buildBrandVoicePrompt(inputText, metadata)
    case 'comment_analysis':
      return buildCommentAnalysisPrompt(inputText, metadata)
    case 'auto_reply':
      return buildAutoReplyPrompt(inputText, metadata)
    case 'pricing':
      return buildPricingPrompt(inputText, metadata)
    default:
      return inputText
  }
}

function buildCaptionPrompt(inputText: string, metadata?: Record<string, any>): string {
  const platform = metadata?.platform || 'Instagram'
  const tone = metadata?.tone || 'friendly'
  const maxLength = metadata?.maxLength || 'medium (100-150 kata)'
  
  return `Buatkan caption untuk ${platform} dengan karakteristik:
- Topik/Produk: ${inputText}
- Tone: ${tone}
- Panjang: ${maxLength}
- Sertakan emoji yang relevan
- Tambahkan 3-5 hashtag yang sesuai
- Buat engaging dan action-driven (ajak like, comment, share, atau visit)

Format output:
[Caption text dengan emoji]

#hashtag1 #hashtag2 #hashtag3`
}

function buildPromoPrompt(inputText: string, metadata?: Record<string, any>): string {
  const duration = metadata?.duration || '1 minggu'
  const discount = metadata?.discount || 'belum ditentukan'
  const urgency = metadata?.urgency || 'medium'
  
  return `Buatkan announcement promo untuk UMKM kuliner:
- Produk/Promo: ${inputText}
- Durasi: ${duration}
- Diskon/Benefit: ${discount}
- Urgency level: ${urgency}

Buat promo text yang:
- Menarik perhatian dengan opening yang strong
- Jelas menyebutkan benefit customer
- Menciptakan sense of urgency (FOMO)
- Sertakan call-to-action yang jelas
- Tambahkan emoji untuk visual appeal
- Maksimal 150 kata`
}

function buildBrandVoicePrompt(inputText: string, metadata?: Record<string, any>): string {
  const businessType = metadata?.businessType || 'kuliner'
  const targetAudience = metadata?.targetAudience || 'umum'
  
  return `Analisis dan berikan guideline brand voice untuk bisnis ${businessType}:

Deskripsi bisnis: ${inputText}
Target audience: ${targetAudience}

Berikan guideline lengkap meliputi:
1. Brand personality (3-5 trait utama)
2. Tone of voice (formal/casual/friendly, dll)
3. Bahasa yang digunakan (Indonesia formal/casual, bahasa daerah, slang, dll)
4. Do's and Don'ts dalam komunikasi
5. Contoh kalimat yang sesuai vs tidak sesuai
6. Emoji usage guideline

Format dalam bentuk guideline yang clear dan actionable.`
}

function buildCommentAnalysisPrompt(inputText: string, metadata?: Record<string, any>): string {
  const commentsCount = metadata?.commentsCount || 'beberapa'
  
  return `Analisis komentar customer berikut dan berikan insights:

Komentar:
${inputText}

Berikan analisis lengkap meliputi:
1. **Sentiment Overview**: Hitung persentase positif/negatif/netral
2. **Key Themes**: Topik utama yang paling banyak dibahas
3. **Pain Points**: Masalah atau keluhan yang perlu diperhatikan
4. **Positive Highlights**: Apa yang customer suka
5. **Actionable Recommendations**: Saran konkret untuk improve berdasarkan feedback
6. **Priority Issues**: Isu yang harus segera ditangani (jika ada)

Format dalam bentuk bullet points yang jelas dan mudah dipahami.`
}

function buildAutoReplyPrompt(inputText: string, metadata?: Record<string, any>): string {
  const businessName = metadata?.businessName || 'kami'
  const replyTone = metadata?.replyTone || 'friendly dan helpful'
  
  return `Buatkan balasan otomatis untuk pertanyaan/komentar customer berikut:

Pertanyaan/Komentar Customer:
"${inputText}"

Context:
- Nama bisnis: ${businessName}
- Tone yang diinginkan: ${replyTone}

Buat balasan yang:
- Personal dan tidak terkesan robot
- Menjawab pertanyaan dengan jelas
- Helpful dan informative
- Ramah dengan emoji yang sesuai (1-2 emoji cukup)
- Jika perlu, ajak customer untuk action (order, DM, kunjungi, dll)
- Maksimal 100 kata
- Dalam bahasa Indonesia yang natural

Langsung tulis balasan tanpa embel-embel lain.`
}

function buildPricingPrompt(inputText: string, metadata?: Record<string, any>): string {
  const currentPrice = metadata?.currentPrice || 'belum ditentukan'
  const costPrice = metadata?.costPrice || 'unknown'
  const competitorPrices = metadata?.competitorPrices || 'unknown'
  
  return `Berikan analisis dan rekomendasi pricing untuk produk kuliner:

Produk: ${inputText}
Harga saat ini: ${currentPrice}
Harga pokok (COGS): ${costPrice}
Harga kompetitor: ${competitorPrices}

Berikan analisis lengkap:
1. **Current Pricing Assessment**: Evaluasi harga saat ini
2. **Cost Analysis**: Margin analysis jika data tersedia
3. **Competitive Positioning**: Posisi vs kompetitor
4. **Pricing Recommendation**: Rekomendasi harga optimal dengan reasoning
5. **Pricing Strategy Options**: 
   - Premium pricing (jika kualitas superior)
   - Competitive pricing (match/beat kompetitor)
   - Value pricing (best value for money)
   - Penetration pricing (untuk market entry)
6. **Implementation Tips**: Cara implement pricing baru tanpa lose customer

Berikan angka konkret dan actionable recommendations.`
}

// ================================
// TEMPERATURE SETTINGS
// ================================
function getTemperatureByType(type: ContentType): number {
  const temperatures: Record<ContentType, number> = {
    caption: 0.8,           // Creative
    promo: 0.7,             // Creative tapi tetap clear
    brand_voice: 0.6,       // Balanced, not too wild
    comment_analysis: 0.3,  // Factual dan consistent
    auto_reply: 0.5,        // Helpful tapi personal
    pricing: 0.4,           // Data-driven, analytical
  }
  
  return temperatures[type]
}

// ================================
// MOCK GENERATOR
// ================================
function generateMockContent(request: AIContentRequest): AIContentResponse {
  const { type, inputText, metadata } = request
  
  const mockOutputs: Record<ContentType, string> = {
    caption: `🔥 ${inputText} HITS BANGET!

Pernah cobain yang seenak ini? Ini dia rahasia kenyang + happy dalam satu gigitan! 😍✨

Yuk mampir ke tempat kita, dijamin ga nyesel! Tag temen yang perlu dicoba in! 👇

#${inputText.replace(/\s+/g, '')} #KulinerMakassar #Foodie #Enak #Viral`,

    promo: `🎉 PROMO SPESIAL ALERT! 🎉

${inputText} sekarang lagi DISKON 25%! 🤯

Cuma sampai akhir minggu ini aja loh! Siapa cepat dia dapat! 🏃‍♀️💨

Buruan order sebelum kehabisan:
📱 DM atau WA kami sekarang!
📍 Lokasi di bio

Jangan sampai nyesel ya! 😎

#PromoSpesial #DiskonMakanan #LimitedOffer`,

    brand_voice: `**Brand Voice Guideline untuk "${inputText}"**

1. **Brand Personality:**
   - Ramah & Approachable
   - Autentik & Jujur
   - Energetik & Passionate
   - Down-to-earth

2. **Tone of Voice:**
   - Casual tapi sopan
   - Hangat & welcoming
   - Conversational
   - Enthusiastic tanpa berlebihan

3. **Bahasa:**
   - Bahasa Indonesia casual dengan sentuhan lokal Makassar
   - Emoji usage: 2-3 per post
   - Slang: Moderate (disesuaikan dengan audience)

4. **Do's:**
   ✅ Sapa customer dengan ramah
   ✅ Gunakan "kita" dan "kami" untuk personal touch
   ✅ Share behind-the-scenes
   ✅ Respond cepat dan helpful

5. **Don'ts:**
   ❌ Terlalu formal atau kaku
   ❌ Overclaim (jangan lebay)
   ❌ Ignore negative comments
   ❌ Copy paste reply

6. **Contoh:**
   ✅ "Halo! Ada yang bisa kami bantu? 😊"
   ❌ "Dengan hormat, kami siap melayani Anda."`,

    comment_analysis: `**Analisis Komentar Customer**

Input yang dianalisis: "${inputText}"

1. **Sentiment Overview:**
   - Positif: 65%
   - Netral: 25%
   - Negatif: 10%

2. **Key Themes:**
   - Kualitas rasa (40%)
   - Harga (30%)
   - Pelayanan (20%)
   - Lokasi/delivery (10%)

3. **Pain Points:**
   - Waktu tunggu agak lama saat jam ramai
   - Porsi dianggap kurang besar untuk harga premium
   - Parkir terbatas

4. **Positive Highlights:**
   ✨ Rasa enak dan authentic
   ✨ Tempat bersih dan nyaman
   ✨ Staff ramah
   ✨ Packaging bagus

5. **Actionable Recommendations:**
   🎯 Tambah staff di jam peak hours
   🎯 Consider paket "porsi besar" atau "jumbo"
   🎯 Kerjasama dengan tempat parkir terdekat
   🎯 Maintain kualitas rasa dan service yang sudah bagus

6. **Priority Issues:**
   ⚠️ Atasi waktu tunggu dengan sistem antrian digital atau pre-order`,

    auto_reply: `Halo! Terima kasih sudah tertarik dengan ${inputText} 😊

Untuk pertanyaan "${inputText}", saya dengan senang hati membantu!

[Jawaban detail disesuaikan dengan pertanyaan]

Kalau ada yang ingin ditanyakan lagi, jangan ragu DM kita ya! Atau bisa langsung order via WhatsApp di nomor bio 📱

Ditunggu orderannya! 🙏✨`,

    pricing: `**Analisis & Rekomendasi Pricing untuk "${inputText}"**

1. **Current Pricing Assessment:**
   Harga saat ini cukup kompetitif di market segment ini.

2. **Cost Analysis:**
   Estimasi margin: 60-65% (healthy untuk F&B)

3. **Competitive Positioning:**
   Positioning di mid-range market, sesuai dengan quality yang ditawarkan.

4. **Pricing Recommendation:**
   💰 **Rekomendasi: Rp 25,000 - Rp 30,000**
   
   Reasoning:
   - Sesuai dengan cost structure
   - Kompetitif dengan kompetitor
   - Margin sehat untuk sustainability
   - Masih affordable untuk target market

5. **Pricing Strategy Options:**
   
   **Option A: Value Pricing (Recommended)**
   - Harga: Rp 27,500
   - Position: Best value for money
   - Bundle promo untuk volume
   
   **Option B: Premium Pricing**
   - Harga: Rp 32,000
   - Jika quality/experience superior
   - Highlight USP yang membedakan
   
   **Option C: Penetration Pricing**
   - Harga: Rp 23,000 (temporary)
   - Untuk grab market share
   - Naikkan bertahap setelah brand established

6. **Implementation Tips:**
   ✅ Test pricing dengan A/B testing
   ✅ Komunikasikan value, bukan cuma harga
   ✅ Offer bundle deals untuk increase AOV
   ✅ Monitor competitor pricing monthly
   ✅ Gradual price increase (max 10% per year)`,
  }
  
  return {
    type,
    inputText,
    outputText: mockOutputs[type],
    metadata: metadata || {},
  }
}
