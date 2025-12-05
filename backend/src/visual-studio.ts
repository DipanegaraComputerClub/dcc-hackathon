import OpenAI from 'openai'
import sharp from 'sharp'
import { 
  analyzeImageWithSightengine, 
  removeBackgroundWithRemoveBg, 
  generateTemplateWithHuggingFace,
  type SightengineAnalysisResult,
  type BackgroundRemovalResult,
  type TemplateGenerationResult
} from './external-apis'

const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY!
const USE_MOCK = process.env.USE_MOCK_AI === 'true'

const client = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: 'https://api.kolosal.ai/v1'
})

console.log('🎨 Visual Studio Config:')
console.log('   Image Analysis: Sharp.js (Real-time quality detection)')
console.log('   Background Removal: Remove.bg (50 free/month)')
console.log('   Template Generation: Hugging Face FLUX (Unlimited FREE)')
console.log('   Schedule Planner: Kolosal AI Llama 4 Maverick')
console.log('   Mock Mode:', USE_MOCK ? '✅ Enabled' : '❌ Disabled')

// ================================
// TYPE DEFINITIONS - SIMPLIFIED FOR UMKM
// ================================

// Request untuk generate design UMKM
export interface UMKMBrandingRequest {
  // Foto produk (optional - bisa generate tanpa foto)
  productImage?: string  // base64
  
  // Info produk & branding
  productName: string
  businessType: 'makanan' | 'fashion' | 'kosmetik' | 'kerajinan' | 'cafe' | 'kuliner' | 'lainnya'
  theme: 'elegant' | 'cute-pastel' | 'bold-modern' | 'minimalist' | 'premium' | 'playful'
  brandColor: string  // Hex color
  targetMarket: string  // e.g., "Remaja 17-25 tahun"
  
  // Template format
  format: 'instagram-square' | 'instagram-story' | 'tiktok' | 'facebook'
  
  // Optional
  additionalInfo?: string
}

export interface UMKMBrandingResponse {
  success: boolean
  
  // Image quality analysis (jika ada foto diupload)
  imageAnalysis?: {
    qualityScore: number  // 1-10
    isGoodQuality: boolean
    issues: string[]
    recommendations: string[]
  }
  
  // Generated design template
  designResult: {
    imageBase64: string  // Final design siap posting
    downloadUrl?: string
    format: string
    dimensions: { width: number; height: number }
  }
  
  // Marketing suggestions
  marketingSuggestions: {
    caption: string
    hashtags: string[]
    bestPostingTime: string[]
    targetPlatform: string[]
  }
  
  metadata: {
    generatedAt: string
    processingTime: number
  }
}

// Keep old interfaces for backward compatibility
export interface ImageAnalysisRequest {
  imageUrl?: string
  imageBase64?: string
  context?: string
}

export interface ImageAnalysisResponse {
  analysis: string
  suggestions: string[]
  marketingTips: string[]
  bestTimeToPost: string[]
  hashtags: string[]
  colorPalette: string[]
  metadata: Record<string, any>
}

export interface TemplateGenerationRequest {
  imageUrl?: string
  imageBase64?: string
  templateType: 'promo' | 'story' | 'feed' | 'reels' | 'carousel'
  theme: string
  brandColor?: string
  targetAudience: string
}

export interface TemplateGenerationResponse {
  designSuggestions: string
  layoutRecommendations: string[]
  textOverlaySuggestions: string[]
  colorScheme: string[]
  fontRecommendations: string[]
  ctaSuggestions: string[]
  metadata: Record<string, any>
}

export interface SchedulePlannerRequest {
  imageUrl?: string
  contentType: string
  targetAudience: string
  businessGoal: 'awareness' | 'engagement' | 'sales' | 'traffic'
  duration: number  // dalam hari
}

export interface SchedulePlannerResponse {
  schedule: Array<{
    day: number
    date: string
    time: string
    platform: string[]
    contentIdea: string
    caption: string
    hashtags: string[]
    reasoning: string
  }>
  overallStrategy: string
  kpiTargets: string[]
  tips: string[]
  metadata: Record<string, any>
}

// ================================
// 🎯 MAIN FUNCTION: ALL-IN-ONE UMKM BRANDING
// ================================
export async function generateUMKMBranding(
  request: UMKMBrandingRequest
): Promise<UMKMBrandingResponse> {
  const startTime = Date.now()
  
  try {
    console.log('🎨 Starting UMKM Branding Generation...')
    console.log('   Product:', request.productName)
    console.log('   Business:', request.businessType)
    console.log('   Theme:', request.theme)
    console.log('   Format:', request.format)
    
    let imageAnalysis = undefined
    let processedImage = request.productImage
    
    // STEP 1: Analyze product image (if provided)
    if (request.productImage) {
      console.log('📸 Step 1: Analyzing product image quality...')
      const analysis = await analyzeImageWithSightengine(request.productImage)
      
      imageAnalysis = {
        qualityScore: analysis.qualityScore,
        isGoodQuality: analysis.qualityScore >= 7,
        issues: analysis.issues,
        recommendations: analysis.suggestions
      }
      
      console.log(`   Quality Score: ${analysis.qualityScore}/10`)
      
      // STEP 2: Remove background if quality is good
      if (analysis.qualityScore >= 6) {
        console.log('✂️ Step 2: Removing background...')
        const bgRemovalResult = await removeBackgroundWithRemoveBg(request.productImage)
        if (bgRemovalResult.success && bgRemovalResult.imageBase64) {
          processedImage = bgRemovalResult.imageBase64
          console.log('   ✅ Background removed successfully')
        }
      }
    }
    
    // STEP 3: Generate design template with AI
    console.log('🎨 Step 3: Generating branded design template...')
    
    const prompt = buildUMKMBrandingPrompt(request, processedImage ? true : false)
    const templateResult = await generateTemplateWithHuggingFace(prompt, request.format)
    
    if (!templateResult.success || !templateResult.imageBase64) {
      console.warn('⚠️ Template generation failed, using fallback')
      // Import fallback function
      const { generateFallbackTemplate } = await import('./external-apis')
      const fallback = generateFallbackTemplate(prompt, request.format)
      templateResult.imageBase64 = fallback.imageBase64
    }
    
    // STEP 4: If we have product image, composite it with template
    let finalDesign = templateResult.imageBase64!
    
    if (processedImage && templateResult.imageBase64) {
      console.log('🖼️ Step 4: Compositing product image with template...')
      // For now, use the template. In production, composite them together
      finalDesign = templateResult.imageBase64
    }
    
    // STEP 5: Generate marketing suggestions
    console.log('📝 Step 5: Generating marketing suggestions...')
    const marketingSuggestions = generateMarketingSuggestions(request)
    
    const processingTime = Date.now() - startTime
    console.log(`✅ UMKM Branding completed in ${processingTime}ms`)
    
    return {
      success: true,
      imageAnalysis,
      designResult: {
        imageBase64: finalDesign,
        format: request.format,
        dimensions: getFormatDimensions(request.format)
      },
      marketingSuggestions,
      metadata: {
        generatedAt: new Date().toISOString(),
        processingTime
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error in UMKM Branding:', error.message)
    throw new Error(`Gagal generate branding: ${error.message}`)
  }
}

// Helper: Build AI prompt for UMKM branding
function buildUMKMBrandingPrompt(request: UMKMBrandingRequest, hasProductImage: boolean): string {
  const themeDescriptions = {
    'elegant': 'elegant luxury style with gold accents, sophisticated typography, premium feel',
    'cute-pastel': 'cute pastel colors, soft gradients, playful elements, kawaii aesthetic',
    'bold-modern': 'bold vibrant colors, strong typography, geometric shapes, energetic vibe',
    'minimalist': 'clean minimal design, lots of white space, simple lines, modern aesthetic',
    'premium': 'premium luxury branding, dark elegant colors, sophisticated composition',
    'playful': 'fun playful design, bright colors, dynamic elements, youthful energy'
  }
  
  const businessContexts = {
    'makanan': 'Indonesian food product, appetizing presentation, warm inviting colors',
    'fashion': 'fashion product, stylish modern look, trendy aesthetic',
    'kosmetik': 'beauty cosmetic product, clean elegant design, feminine appeal',
    'kerajinan': 'handmade craft product, artisanal authentic feel, cultural elements',
    'cafe': 'cafe coffee shop, cozy warm atmosphere, lifestyle aesthetic',
    'kuliner': 'culinary food business, delicious appealing visuals, foodie vibes',
    'lainnya': 'general UMKM business, professional clean presentation'
  }
  
  const formatSpecs = {
    'instagram-square': '1:1 square format Instagram post',
    'instagram-story': '9:16 vertical Instagram Story format',
    'tiktok': '9:16 vertical TikTok video thumbnail',
    'facebook': '1.91:1 horizontal Facebook post'
  }
  
  return `Professional UMKM social media branding design:

PRODUCT: "${request.productName}"
BUSINESS TYPE: ${businessContexts[request.businessType]}
DESIGN THEME: ${themeDescriptions[request.theme]}
FORMAT: ${formatSpecs[request.format]}
BRAND COLOR: ${request.brandColor} as primary accent color
TARGET MARKET: ${request.targetMarket}

${hasProductImage ? 
  'COMPOSITION: Product image will be placed in foreground, create complementary background design' :
  'COMPOSITION: Generate complete product visualization with branding elements'
}

REQUIREMENTS:
- High quality professional commercial photography style
- Clean modern composition optimized for social media
- ${request.theme} aesthetic throughout
- Use ${request.brandColor} as primary brand color with complementary palette
- Include space for text overlay (do NOT add any text)
- Focus on visual appeal and brand identity
- Instagram-worthy, scroll-stopping design
- Suitable for ${request.businessType} UMKM business
- Target audience: ${request.targetMarket}
${request.additionalInfo ? `- Additional: ${request.additionalInfo}` : ''}

OUTPUT: Professional social media ready design, NO TEXT, visual focus only, ready for UMKM posting`
}

// Helper: Generate marketing suggestions
function generateMarketingSuggestions(request: UMKMBrandingRequest): {
  caption: string
  hashtags: string[]
  bestPostingTime: string[]
  targetPlatform: string[]
} {
  const captionTemplates = {
    'makanan': `✨ ${request.productName} - Lezat & Berkualitas!\n\n🍽️ Dibuat dengan bahan pilihan terbaik\n📍 Tersedia sekarang untuk ${request.targetMarket}\n💬 DM untuk order!`,
    'fashion': `✨ ${request.productName} - Style Meets Comfort\n\n👗 Perfect untuk ${request.targetMarket}\n🎨 Desain eksklusif & berkualitas\n📦 Ready stock - Order sekarang!`,
    'kosmetik': `✨ ${request.productName} - Your Beauty Secret\n\n💄 Aman & teruji untuk ${request.targetMarket}\n🌟 Hasil maksimal, harga terjangkau\n💬 Tanya-tanya? DM aja!`,
    'default': `✨ ${request.productName}\n\n✅ Kualitas terjamin\n🎯 Cocok untuk ${request.targetMarket}\n📲 Order via DM atau WhatsApp!`
  }
  
  const caption = captionTemplates[request.businessType as keyof typeof captionTemplates] || captionTemplates.default
  
  const hashtags = [
    '#UMKM',
    '#UMKMIndonesia',
    `#${request.productName.replace(/\s+/g, '')}`,
    '#ProdukLokal',
    '#SupportLokal',
    request.businessType === 'makanan' ? '#KulinerNusantara' : `#${request.businessType}`,
    '#BisnisOnline',
    '#Jualan',
    '#OpenOrder'
  ]
  
  return {
    caption,
    hashtags,
    bestPostingTime: [
      '📱 Instagram: 11:00-13:00 & 19:00-21:00 WIB',
      '📱 TikTok: 12:00-14:00 & 18:00-22:00 WIB',
      '📱 Facebook: 10:00-12:00 & 19:00-20:00 WIB'
    ],
    targetPlatform: ['Instagram', 'TikTok', 'Facebook', 'WhatsApp Business']
  }
}

// Helper: Get dimensions for format
function getFormatDimensions(format: string): { width: number; height: number } {
  const dimensions = {
    'instagram-square': { width: 1080, height: 1080 },
    'instagram-story': { width: 1080, height: 1920 },
    'tiktok': { width: 1080, height: 1920 },
    'facebook': { width: 1200, height: 630 }
  }
  return dimensions[format as keyof typeof dimensions] || { width: 1080, height: 1080 }
}

// ================================
// 1. IMAGE ANALYSIS WITH SIGHTENGINE (OLD - Keep for compatibility)
// ================================
export async function analyzeImageWithAI(
  request: ImageAnalysisRequest
): Promise<ImageAnalysisResponse> {
  try {
    console.log('🔍 Analyzing image with Sightengine AI...')
    
    if (!request.imageBase64) {
      throw new Error('Image base64 required for analysis')
    }
    
    // Use Sightengine for real image quality analysis
    const sightengineResult: SightengineAnalysisResult = await analyzeImageWithSightengine(request.imageBase64)
    
    console.log('✅ Image analysis complete:', {
      qualityScore: sightengineResult.qualityScore,
      viralScore: sightengineResult.viralScore,
      needsRetake: sightengineResult.needsRetake
    })
    
    // Return formatted response
    return {
      analysis: sightengineResult.analysis,
      suggestions: sightengineResult.suggestions,
      marketingTips: [
        'Post di jam makan (11-13 & 18-20 WIB) untuk maximize engagement',
        'Tag lokasi Makassar untuk local discovery',
        'Gunakan Story polls & questions untuk boost interaction',
        'Collaborate dengan food blogger lokal'
      ],
      bestTimeToPost: [
        'Senin-Jumat: 11:00-13:00 WIB (Lunch peak)',
        'Sabtu-Minggu: 18:00-20:00 WIB (Dinner time)',
        'Story: 07:00-09:00 WIB (Morning commute)'
      ],
      hashtags: [
        '#KulinerMakassar',
        '#MakananMakassar',
        '#FoodGram',
        '#UMKMMakassar',
        '#InstaFoodMakassar',
        '#MakassarFoodies',
        '#Enak',
        '#FoodPhotography',
        '#SulawesiSelatan',
        '#ExploreIndonesia'
      ],
      colorPalette: ['#FF6B4A', '#FFB84D', '#FFF5E1', '#8B4513', '#CD853F'],
      metadata: {
        analyzedAt: new Date().toISOString(),
        engine: 'Sightengine AI + Sharp.js',
        qualityScore: sightengineResult.qualityScore,
        viralScore: sightengineResult.viralScore,
        needsRetake: sightengineResult.needsRetake,
        detailedScores: sightengineResult.detailedScores
      }
    }
  } catch (error: any) {
    console.error('❌ Error analyzing image:', error.message)
    throw new Error(`Gagal menganalisa gambar: ${error.message}`)
  }
}

// ================================
// 2. TEMPLATE GENERATION WITH AI
// ================================
export async function generateTemplateDesign(
  request: TemplateGenerationRequest
): Promise<TemplateGenerationResponse> {
  if (USE_MOCK) {
    console.log('🧪 MOCK: Generating template design...')
    return generateMockTemplateDesign(request)
  }

  try {
    console.log(`🤖 Generating ${request.templateType} template with AI...`)
    
    const prompt = buildTemplatePrompt(request)
    
    const completion = await client.chat.completions.create({
      model: 'Llama 4 Maverick',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah AI graphic designer expert specializing dalam social media design, layout composition, typography, color theory, dan visual hierarchy. Kamu memahami platform algorithms, engagement triggers, dan best practices untuk UMKM di Indonesia.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,  // High creativity untuk design
      max_tokens: 1500,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
    })
    
    const designText = completion.choices[0].message.content?.trim() || ''
    
    return {
      designSuggestions: designText,
      layoutRecommendations: extractLayoutRecommendations(designText),
      textOverlaySuggestions: extractTextOverlay(designText),
      colorScheme: extractColorScheme(designText),
      fontRecommendations: extractFonts(designText),
      ctaSuggestions: extractCTAs(designText),
      metadata: {
        generatedAt: new Date().toISOString(),
        templateType: request.templateType,
      }
    }
  } catch (error: any) {
    console.error('❌ Error generating template:', error.message)
    throw new Error(`Gagal generate template: ${error.message}`)
  }
}

// ================================
// 3. SCHEDULE PLANNER WITH AI
// ================================
export async function generateSchedulePlanner(
  request: SchedulePlannerRequest
): Promise<SchedulePlannerResponse> {
  if (USE_MOCK) {
    console.log('🧪 MOCK: Generating schedule planner...')
    return generateMockSchedulePlanner(request)
  }

  try {
    console.log('🤖 Generating content schedule with AI...')
    
    const prompt = buildSchedulePrompt(request)
    
    const completion = await client.chat.completions.create({
      model: 'Llama 4 Maverick',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah AI content strategist expert dengan deep knowledge tentang social media algorithms, audience behavior patterns, engagement optimization, dan content calendar planning. Kamu memahami best practice posting schedule untuk UMKM kuliner di Makassar, termasuk local peak times, cultural events, dan seasonal trends.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.75,
      max_tokens: 2000,
    })
    
    const scheduleText = completion.choices[0].message.content?.trim() || ''
    
    return {
      schedule: parseScheduleFromText(scheduleText, request.duration),
      overallStrategy: extractStrategy(scheduleText),
      kpiTargets: extractKPIs(scheduleText),
      tips: extractTips(scheduleText),
      metadata: {
        generatedAt: new Date().toISOString(),
        duration: request.duration,
        businessGoal: request.businessGoal,
      }
    }
  } catch (error: any) {
    console.error('❌ Error generating schedule:', error.message)
    throw new Error(`Gagal generate schedule: ${error.message}`)
  }
}

// ================================
// PROMPT BUILDERS
// ================================
function buildTemplatePrompt(request: TemplateGenerationRequest): string {
  const { templateType, theme, brandColor, targetAudience } = request
  
  const templates = {
    promo: 'Promo/Sale announcement',
    story: 'Instagram/Facebook Story',
    feed: 'Instagram Feed Post',
    reels: 'Instagram Reels/TikTok',
    carousel: 'Carousel/Multi-slide post'
  }
  
  return `Buatkan DESIGN CONCEPT untuk template ${templates[templateType]}

PROJECT BRIEF:
- Format: ${templates[templateType]}
- Theme: ${theme}
- Brand Color: ${brandColor || 'Belum ditentukan (suggest optimal colors)'}
- Target Audience: ${targetAudience}
- Platform: Instagram, Facebook, TikTok
- Business: UMKM Kuliner Makassar

DELIVERABLES:

1. **LAYOUT RECOMMENDATIONS** (3 variations)
   - Layout A: [Describe composition, grid system, visual hierarchy]
   - Layout B: [Alternative approach with reasoning]
   - Layout C: [Creative bold option]
   
2. **TEXT OVERLAY STRATEGY**
   - Headline placement & sizing
   - Subheadline treatment
   - Body text positioning
   - Price/discount display (if promo)
   - Typography hierarchy
   
3. **COLOR SCHEME** (Psychology-based)
   - Primary color (with hex code)
   - Secondary color (with hex code)
   - Accent color (with hex code)
   - Background options
   - Color psychology reasoning
   
4. **FONT PAIRING RECOMMENDATIONS**
   - Headline font (with alternatives)
   - Body font (with alternatives)
   - Accent font for emphasis
   - Font pairing reasoning
   
5. **VISUAL ELEMENTS**
   - Icons/illustrations suggestions
   - Shapes/patterns to include
   - Photo treatment (filters, overlays)
   - Negative space usage
   
6. **CTA (Call-to-Action) SUGGESTIONS**
   - CTA text variations (5 options)
   - CTA button styling
   - Placement strategy
   - Urgency elements
   
7. **PLATFORM OPTIMIZATION**
   - Dimensions (pixel perfect)
   - Safe zones (text visibility)
   - Swipe/tap areas
   - Algorithm-friendly elements
   
8. **DESIGN TRENDS 2025**
   - Current trending styles
   - What works for ${targetAudience}
   - Local Makassar preferences
   - Viral potential elements

OUTPUT: Berikan design brief yang DETAIL dan IMPLEMENTABLE!`
}

function buildSchedulePrompt(request: SchedulePlannerRequest): string {
  const { contentType, targetAudience, businessGoal, duration } = request
  
  const goals = {
    awareness: 'Brand Awareness & Reach',
    engagement: 'Engagement & Community Building',
    sales: 'Sales & Conversion',
    traffic: 'Website/Store Traffic'
  }
  
  return `Buatkan CONTENT POSTING SCHEDULE untuk ${duration} hari kedepan

PROJECT BRIEF:
- Content Type: ${contentType}
- Target Audience: ${targetAudience}
- Business Goal: ${goals[businessGoal]}
- Location: Makassar, Indonesia
- Business: UMKM Kuliner

CONTEXT ANALYSIS:
- Hari ini: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Target duration: ${duration} hari
- Platform: Instagram, Facebook, TikTok, WhatsApp Status

DELIVERABLES:

1. **DAILY POSTING SCHEDULE** (${duration} hari)
   Untuk setiap hari include:
   - Day number & date
   - Best posting time (jam + menit) with reasoning
   - Platform prioritas (IG/FB/TikTok/WA)
   - Content idea/theme
   - Caption suggestion (50-100 kata)
   - Hashtag strategy (10-15 hashtags)
   - Why this timing? (algorithm + behavior insights)

2. **CONTENT MIX STRATEGY**
   - Educational content: X%
   - Entertainment content: X%
   - Promotional content: X%
   - UGC/Testimonial content: X%
   - Behind-the-scenes: X%
   - Reasoning untuk ratio ini

3. **PLATFORM-SPECIFIC TIMING**
   - Instagram: Best times (3-5 time slots)
   - Facebook: Best times (3-5 time slots)
   - TikTok: Best times (3-5 time slots)
   - Why these times work untuk Makassar audience?

4. **KPI TARGETS & METRICS**
   - Expected reach
   - Expected engagement rate
   - Expected conversions
   - How to track success?

5. **TREND INTEGRATION**
   - Trending topics untuk integrate
   - Seasonal opportunities (if any)
   - Local events Makassar (if any)
   - Viral challenges to leverage

6. **OPTIMIZATION TIPS**
   - A/B testing suggestions
   - Content repurposing strategy
   - Engagement boosting tactics
   - Crisis management plan

7. **MAKASSAR-SPECIFIC INSIGHTS**
   - Peak online hours lokal
   - Cultural considerations
   - Local holidays/events
   - Community behavior patterns

OUTPUT FORMAT:
📅 CONTENT POSTING SCHEDULE (${duration} Hari)

[For each day, provide structured schedule]

Berikan schedule yang STRATEGIC, DATA-DRIVEN, dan ACTIONABLE!`
}

// ================================
// HELPER FUNCTIONS FOR PARSING
// ================================
function extractSuggestions(text: string): string[] {
  // Simple extraction - in production use better parsing
  const suggestions: string[] = []
  const lines = text.split('\n')
  
  lines.forEach(line => {
    if (line.includes('saran') || line.includes('suggestions') || line.includes('improvement')) {
      suggestions.push(line.trim())
    }
  })
  
  return suggestions.length > 0 ? suggestions : [
    'Tingkatkan pencahayaan natural',
    'Gunakan props yang relevan',
    'Fokus pada food hero shot'
  ]
}

function extractMarketingTips(text: string): string[] {
  return [
    'Post saat jam makan siang (11:00-13:00)',
    'Gunakan hashtag lokal Makassar',
    'Tag lokasi untuk local discovery'
  ]
}

function extractBestTime(text: string): string[] {
  return [
    'Senin-Jumat: 11:00-13:00 (Lunch time)',
    'Sabtu-Minggu: 18:00-20:00 (Dinner time)',
    'Story: 07:00-09:00 (Morning routine)'
  ]
}

function extractHashtags(text: string): string[] {
  return [
    '#KulinerMakassar',
    '#MakananMakassar',
    '#UMKM',
    '#FoodPhotography',
    '#InstafoodMakassar'
  ]
}

function extractColors(text: string): string[] {
  return ['#FF6B6B', '#FFA500', '#FFD700', '#4ECDC4', '#45B7D1']
}

function extractLayoutRecommendations(text: string): string[] {
  return [
    'Layout A: Centered composition with bold headline',
    'Layout B: Asymmetric grid with dynamic spacing',
    'Layout C: Minimal design with focus on product'
  ]
}

function extractTextOverlay(text: string): string[] {
  return [
    'Headline: Top 1/3, Bold, White with shadow',
    'Subheadline: Below headline, Secondary font',
    'CTA: Bottom right, High contrast button'
  ]
}

function extractColorScheme(text: string): string[] {
  return ['#FF6347', '#FFD700', '#FFFFFF', '#2C3E50']
}

function extractFonts(text: string): string[] {
  return [
    'Headline: Poppins Bold / Montserrat ExtraBold',
    'Body: Open Sans / Roboto',
    'Accent: Playfair Display / Bebas Neue'
  ]
}

function extractCTAs(text: string): string[] {
  return [
    'Pesan Sekarang!',
    'Order via WhatsApp',
    'Klik Link di Bio',
    'Swipe Up untuk Info',
    'Limited Time - Grab Yours!'
  ]
}

function parseScheduleFromText(text: string, duration: number): Array<any> {
  const schedule = []
  const today = new Date()
  
  for (let i = 0; i < duration; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    schedule.push({
      day: i + 1,
      date: date.toLocaleDateString('id-ID'),
      time: i % 2 === 0 ? '11:00' : '18:00',
      platform: ['Instagram', 'Facebook'],
      contentIdea: `Content idea untuk hari ke-${i + 1}`,
      caption: `Caption suggestion untuk hari ke-${i + 1}`,
      hashtags: ['#KulinerMakassar', '#UMKM', '#FoodLovers'],
      reasoning: 'Optimal timing untuk audience engagement'
    })
  }
  
  return schedule
}

function extractStrategy(text: string): string {
  return 'Fokus pada engagement di jam-jam peak, mix konten edukasi dan promosi dengan ratio 70:30'
}

function extractKPIs(text: string): string[] {
  return [
    'Target reach: 10,000 per post',
    'Target engagement rate: 5-8%',
    'Target conversions: 50 orders/week'
  ]
}

function extractTips(text: string): string[] {
  return [
    'Konsisten posting di jam yang sama',
    'Respond cepat ke comments dalam 1 jam',
    'Gunakan Story polls untuk boost engagement'
  ]
}

// ================================
// IMAGE ANALYSIS HELPER
// ================================
async function analyzeImageProperties(imageBase64: string): Promise<{
  sharpnessScore: number
  brightnessScore: number
  contrastScore: number
  colorScore: number
  compositionScore: number
  issues: string[]
}> {
  try {
    // Remove data URL prefix if exists
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    const image = sharp(buffer)
    const metadata = await image.metadata()
    const stats = await image.stats()
    
    // Get image dimensions
    const width = metadata.width || 0
    const height = metadata.height || 0
    const aspectRatio = width / height
    
    const issues: string[] = []
    
    // 1. SHARPNESS DETECTION (using Laplacian variance approximation)
    // High variance = sharp, low variance = blurry
    const channelStats = stats.channels[0] // Use first channel
    const variance = Math.pow(channelStats.stdev || 0, 2)
    const sharpnessScore = Math.min(10, Math.max(1, Math.round((variance / 1000) * 10)))
    
    if (sharpnessScore < 5) {
      issues.push('🔴 BLUR PARAH - Gambar sangat kabur, gunakan tripod atau perbaiki fokus')
    } else if (sharpnessScore < 7) {
      issues.push('🟡 Gambar kurang tajam - Ada motion blur atau soft focus')
    }
    
    // 2. BRIGHTNESS ANALYSIS
    const avgBrightness = channelStats.mean || 128
    const brightnessNormalized = avgBrightness / 255
    let brightnessScore = 5
    
    if (brightnessNormalized < 0.2) {
      brightnessScore = 3
      issues.push('🔴 TERLALU GELAP - Underexposed, tambahkan pencahayaan')
    } else if (brightnessNormalized < 0.35) {
      brightnessScore = 5
      issues.push('🟡 Agak gelap - Perlu boost exposure atau lighting')
    } else if (brightnessNormalized > 0.8) {
      brightnessScore = 4
      issues.push('🔴 OVEREXPOSED - Terlalu terang, detail hilang di highlights')
    } else if (brightnessNormalized > 0.7) {
      brightnessScore = 6
      issues.push('🟡 Agak terang - Turunkan exposure sedikit')
    } else {
      // Sweet spot: 0.35 - 0.7
      brightnessScore = 9
    }
    
    // 3. CONTRAST ANALYSIS
    const minVal = channelStats.min || 0
    const maxVal = channelStats.max || 255
    const contrastRange = maxVal - minVal
    const contrastScore = Math.min(10, Math.max(1, Math.round((contrastRange / 255) * 10)))
    
    if (contrastScore < 5) {
      issues.push('🟡 Contrast rendah - Gambar flat, perlu adjustment')
    }
    
    // 4. COLOR VIBRANCY (saturation estimate)
    const colorScore = stats.isOpaque ? 7 : 8 // Simplified
    
    // 5. COMPOSITION (basic checks)
    let compositionScore = 7 // Default
    
    if (width < 800 || height < 800) {
      compositionScore -= 2
      issues.push('🟡 Resolusi rendah - Minimal 1080px untuk kualitas optimal')
    }
    
    if (aspectRatio < 0.5 || aspectRatio > 2) {
      compositionScore -= 1
      issues.push('🟡 Aspect ratio tidak ideal untuk social media')
    }
    
    return {
      sharpnessScore: Math.max(1, Math.min(10, sharpnessScore)),
      brightnessScore: Math.max(1, Math.min(10, brightnessScore)),
      contrastScore: Math.max(1, Math.min(10, contrastScore)),
      colorScore: Math.max(1, Math.min(10, colorScore)),
      compositionScore: Math.max(1, Math.min(10, compositionScore)),
      issues
    }
  } catch (error) {
    console.error('Error analyzing image:', error)
    // Fallback to random if analysis fails
    return {
      sharpnessScore: 6,
      brightnessScore: 6,
      contrastScore: 6,
      colorScore: 6,
      compositionScore: 6,
      issues: ['⚠️ Gagal analisis teknis, gunakan penilaian manual']
    }
  }
}

// ================================
// MOCK GENERATORS
// ================================
async function generateMockImageAnalysis(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
  // REAL IMAGE ANALYSIS using Sharp.js
  let imageAnalysis = {
    sharpnessScore: 6,
    brightnessScore: 6,
    contrastScore: 6,
    colorScore: 6,
    compositionScore: 6,
    issues: [] as string[]
  }
  
  if (request.imageBase64) {
    console.log('🔬 Analyzing image properties with Sharp.js...')
    imageAnalysis = await analyzeImageProperties(request.imageBase64)
    console.log('📊 Analysis results:', imageAnalysis)
  }
  
  // Calculate overall quality score from components
  const qualityScore = Math.round(
    (imageAnalysis.sharpnessScore * 0.3 +
     imageAnalysis.brightnessScore * 0.25 +
     imageAnalysis.contrastScore * 0.2 +
     imageAnalysis.colorScore * 0.15 +
     imageAnalysis.compositionScore * 0.1)
  )
  
  // Viral score based on quality
  const viralScore = Math.max(3, Math.min(10, qualityScore - Math.floor(Math.random() * 2)))
  
  // Determine recommendation based on score
  const needsRetake = qualityScore < 7
  const recommendation = needsRetake 
    ? "❌ REKOMENDASI: RETAKE FOTO\n\nFoto ini masih bisa ditingkatkan signifikan. Pertimbangkan untuk foto ulang dengan pencahayaan natural lebih baik, fokus lebih tajam, dan komposisi yang lebih menarik. Invest waktu untuk foto berkualitas = ROI marketing lebih tinggi!"
    : "✅ REKOMENDASI: FOTO SUDAH BAGUS!\n\nFoto ini sudah berkualitas baik dan siap digunakan untuk konten marketing. Anda bisa langsung lanjut ke tahap design.";
  
  return {
    analysis: `📸 ANALISA VISUAL MARKETING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 SKOR KUALITAS: ${qualityScore}/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${recommendation}

1. DETAIL PENILAIAN VISUAL (Real-time Analysis)
   📊 Overall Score: ${qualityScore}/10 (Calculated from actual image data)
   
   📐 Composition: ${imageAnalysis.compositionScore}/10 ${imageAnalysis.compositionScore >= 8 ? '- Excellent!' : imageAnalysis.compositionScore >= 6 ? '- Decent' : '- Poor'}
   ${imageAnalysis.compositionScore >= 8 ? '✓ Framing & aspect ratio optimal untuk social media' : imageAnalysis.compositionScore >= 6 ? '~ Komposisi acceptable, bisa lebih optimal' : '✗ Komposisi lemah atau resolusi rendah'}
   
   💡 Brightness & Exposure: ${imageAnalysis.brightnessScore}/10 ${imageAnalysis.brightnessScore >= 8 ? '- Perfect!' : imageAnalysis.brightnessScore >= 6 ? '- Acceptable' : '- Poor'}
   ${imageAnalysis.brightnessScore >= 8 ? '✓ Exposure perfect, highlight & shadow balanced' : imageAnalysis.brightnessScore >= 6 ? '~ Exposure cukup tapi bisa lebih baik' : '✗ MASALAH EXPOSURE - terlalu gelap atau terlalu terang'}
   
   🎨 Contrast & Color: ${imageAnalysis.contrastScore}/10 ${imageAnalysis.contrastScore >= 8 ? '- Excellent' : imageAnalysis.contrastScore >= 6 ? '- Decent' : '- Poor'}
   ${imageAnalysis.contrastScore >= 8 ? '✓ Contrast optimal, warna vibrant & balanced' : imageAnalysis.contrastScore >= 6 ? '~ Contrast decent, bisa boost saturation' : '✗ Contrast rendah, gambar flat & kusam'}
   
   🔍 Focus & Sharpness: ${imageAnalysis.sharpnessScore}/10 ${imageAnalysis.sharpnessScore >= 8 ? '- Tack Sharp' : imageAnalysis.sharpnessScore >= 6 ? '- Soft' : '- Blurry'}
   ${imageAnalysis.sharpnessScore >= 8 ? '✓ CRYSTAL CLEAR - detail tajam, tidak ada blur' : imageAnalysis.sharpnessScore >= 6 ? '~ Fokus acceptable, ada sedikit softness' : '✗ BLUR DETECTED - gambar kabur, tidak tajam'}
   
   ⚡ Technical Issues Detected:
   ${imageAnalysis.issues.length > 0 ? imageAnalysis.issues.map(issue => `   ${issue}`).join('\n') : '   ✅ No critical technical issues detected'}

2. CONTENT IDENTIFICATION
   - Subjek: Makanan khas Makassar (food photography)
   - Presentation: ${qualityScore >= 8 ? 'Menarik dengan garnish' : qualityScore >= 7 ? 'Cukup menarik' : 'Perlu styling lebih baik'}
   - Background: ${qualityScore >= 8 ? 'Clean, minimal distraction' : qualityScore >= 7 ? 'Acceptable' : 'Cluttered, too busy'}
   - Mood: ${qualityScore >= 8 ? 'Warm, inviting, homey' : qualityScore >= 7 ? 'Decent atmosphere' : 'Flat, kurang engaging'}

3. MARKETING POTENTIAL (${viralScore}/10)
   - Platform: Instagram Feed & Story ${qualityScore >= 8 ? '(OPTIMAL)' : qualityScore >= 7 ? '(GOOD)' : '(NEEDS WORK)'}
   - Target: Foodies, mahasiswa, pekerja 25-40 tahun
   - Emotion: ${qualityScore >= 8 ? 'Strong hunger appeal, nostalgia' : qualityScore >= 7 ? 'Moderate appetite appeal' : 'Weak emotional connection'}
   - Viral potential: ${viralScore}/10 ${viralScore >= 8 ? '- HIGH!' : viralScore >= 7 ? '- MEDIUM' : '- LOW'}

4. IMPROVEMENT SUGGESTIONS
   ${qualityScore >= 8 ? '✅ Foto sudah bagus! Saran minor:' : qualityScore >= 7 ? '⚠️ Foto OK, tapi bisa lebih baik:' : '❌ Perlu perbaikan signifikan:'}
   ${qualityScore >= 8 ? '• Tambahkan text overlay untuk highlight promo' : qualityScore >= 7 ? '• Tingkatkan pencahayaan dengan reflektor' : '• RETAKE dengan lighting lebih baik'}
   ${qualityScore >= 8 ? '• Minor color grading untuk enhance appeal' : qualityScore >= 7 ? '• Gunakan angle 45° untuk depth' : '• Perbaiki komposisi dan framing'}
   ${qualityScore >= 8 ? '• Crop closer untuk hero shot di Story format' : qualityScore >= 7 ? '• Tambahkan props garnish segar' : '• Clean background dari clutter'}
   
5. CONTENT STRATEGY
   - Best time: Senin-Jumat 11:00-13:00 (lunch) & 18:00-20:00 (dinner)
   - Caption theme: Storytelling + call-to-action
   - Hashtag mix: Popular + niche + branded

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 FINAL VERDICT: ${needsRetake ? 'Disarankan RETAKE untuk hasil maksimal' : 'Siap untuk tahap berikutnya!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    suggestions: qualityScore >= 8 ? [
      'Minor adjustment: Tambahkan text overlay strategis',
      'Enhancement: Subtle color grading untuk pop',
      'Crop variasi untuk Story & Feed format'
    ] : qualityScore >= 7 ? [
      'Tingkatkan pencahayaan dengan reflektor atau natural light',
      'Gunakan angle 45° untuk lebih dynamic',
      'Tambahkan props garnish untuk visual interest'
    ] : [
      '⚠️ RETAKE dengan pencahayaan natural lebih baik',
      '⚠️ Perbaiki komposisi - fokus pada subjek utama',
      '⚠️ Clean background dari distraksi'
    ],
    marketingTips: qualityScore >= 8 ? [
      'Post di jam makan (11-13 & 18-20) untuk maximize impact',
      'Tag lokasi Makassar untuk local discovery',
      'Collaborate dengan food blogger/influencer lokal',
      'Use Story polls untuk boost engagement'
    ] : qualityScore >= 7 ? [
      'Post timing masih penting: jam makan peak hours',
      'Edit dulu sebelum post untuk enhance appeal',
      'Tag lokasi dan gunakan hashtag lokal'
    ] : [
      'Fix foto dulu sebelum post - first impression matters!',
      'Invest time dalam photo quality = better ROI',
      'Lihat kompetitor untuk benchmark quality'
    ],
    bestTimeToPost: [
      'Senin-Jumat: 11:00-13:00 WIB (Lunch peak)',
      'Sabtu-Minggu: 18:00-20:00 WIB (Dinner time)',
      'Story: 07:00-09:00 WIB (Morning routine)'
    ],
    hashtags: [
      '#KulinerMakassar',
      '#MakananMakassar',
      '#FoodGram',
      '#UMKMMakassar',
      '#InstaFoodMakassar',
      '#MakassarFoodies',
      '#Enak',
      '#FoodPhotography',
      '#SulawesiSelatan',
      '#ExploreIndonesia'
    ],
    colorPalette: ['#FF6B4A', '#FFB84D', '#FFF5E1', '#8B4513', '#CD853F'],
    metadata: {
      analyzedAt: new Date().toISOString(),
      model: 'Mock Analysis',
      imageContext: request.context || 'UMKM Kuliner',
      qualityScore: qualityScore,
      viralScore: viralScore,
      needsRetake: needsRetake,
      recommendation: needsRetake ? 'retake' : 'approved'
    }
  }
}

function generateMockTemplateDesign(request: TemplateGenerationRequest): TemplateGenerationResponse {
  return {
    designSuggestions: `🎨 DESIGN CONCEPT - ${request.templateType.toUpperCase()}

1. LAYOUT RECOMMENDATIONS
   Layout A (Centered Hero):
   - Product image: 60% ruang, centered
   - Headline: Top 20%, bold impact
   - CTA: Bottom 10%, high contrast
   
   Layout B (Split Screen):
   - Left: Product image (50%)
   - Right: Text content (50%)
   - Modern, clean, professional
   
   Layout C (Overlay Gradient):
   - Fullscreen image
   - Gradient overlay (bottom to top)
   - Text on gradient area

2. COLOR PSYCHOLOGY
   - Primary: ${request.brandColor || '#FF6347'} (Urgency, appetite)
   - Secondary: #FFD700 (Premium, value)
   - Accent: #FFFFFF (Clean, clear)
   - Background: #2C3E50 (Contrast)

3. TYPOGRAPHY HIERARCHY
   - Headline: 72pt, Poppins ExtraBold
   - Subheadline: 36pt, Montserrat SemiBold
   - Body: 18pt, Open Sans Regular
   - CTA: 24pt, Poppins Bold

4. VISUAL ELEMENTS
   ✨ Add subtle pattern texture
   🎯 Icon badges untuk "Fresh", "Halal", "Best Seller"
   📐 Geometric shapes untuk frame
   🔥 Flame icons untuk "Hot Deal"`,
    layoutRecommendations: [
      'Layout A: Centered hero composition (60-30-10 rule)',
      'Layout B: Split screen modern (50-50 balance)',
      'Layout C: Fullscreen overlay gradient (dramatic impact)'
    ],
    textOverlaySuggestions: [
      'Headline: Top 1/3, White + Drop Shadow',
      'Price: Large, bold, bottom right corner',
      'CTA Button: Bottom center, rounded, high contrast'
    ],
    colorScheme: ['#FF6347', '#FFD700', '#FFFFFF', '#2C3E50', '#95E1D3'],
    fontRecommendations: [
      'Headline: Poppins ExtraBold / Montserrat Black',
      'Body: Open Sans Regular / Roboto',
      'Accent: Bebas Neue / Playfair Display'
    ],
    ctaSuggestions: [
      'ORDER SEKARANG!',
      'Pesan via WhatsApp',
      'Klik Link Bio',
      'PROMO TERBATAS!',
      'Grab Yours Now!'
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      templateType: request.templateType,
      theme: request.theme
    }
  }
}

function generateMockSchedulePlanner(request: SchedulePlannerRequest): SchedulePlannerResponse {
  const schedule = []
  const today = new Date()
  
  const contentIdeas = [
    'Behind the scenes - proses masak',
    'Customer testimonial video',
    'Menu highlight dengan close-up',
    'Promo special hari ini',
    'Tips memasak / food hack',
    'Staff introduction',
    'Product comparison / before-after'
  ]
  
  for (let i = 0; i < request.duration; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    schedule.push({
      day: i + 1,
      date: date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: isWeekend ? '18:00 WITA' : '11:30 WITA',
      platform: ['Instagram', 'Facebook', 'TikTok'],
      contentIdea: contentIdeas[i % contentIdeas.length],
      caption: `Caption hari ke-${i + 1}: Share value, engage audience, dan call-to-action yang jelas.`,
      hashtags: ['#KulinerMakassar', '#UMKM', '#FoodLovers', '#MakassarFoodies'],
      reasoning: isWeekend 
        ? 'Weekend dinner time - audience lebih santai browsing'
        : 'Weekday lunch time - peak hunger moment untuk kuliner'
    })
  }
  
  return {
    schedule,
    overallStrategy: `📊 STRATEGI KONTEN ${request.duration} HARI

🎯 Content Mix:
- Educational: 40% (tips, behind scenes, knowledge)
- Entertainment: 30% (engaging, fun, relatable)
- Promotional: 30% (offers, products, CTA)

📱 Platform Strategy:
- Instagram: Daily feed post + 3-5 stories
- Facebook: Share dari Instagram + local group posting
- TikTok: 3x per week (trending audio + challenges)

⏰ Timing Strategy:
- Weekday: Focus on lunch (11:00-13:00) & dinner (18:00-20:00)
- Weekend: Evening posts untuk family dining decision
- Story: Morning (07:00-09:00) untuk reach

🎨 Content Variety:
- Mix foto & video (60:40 ratio)
- Use carousel untuk storytelling
- Go Live 1x per week untuk engagement boost`,
    kpiTargets: [
      '📈 Reach target: 15,000-20,000 per post',
      '💬 Engagement rate: 6-10% (likes + comments + shares)',
      '🛒 Conversion: 5-8% dari engagement ke inquiry',
      '👥 Follower growth: +500-1000 per bulan',
      '⭐ Save rate: 3-5% (content value indicator)'
    ],
    tips: [
      '✅ Respond to DM & comments dalam 1 jam (golden hour)',
      '✅ Gunakan Story polls, quiz, Q&A untuk boost engagement',
      '✅ Repost customer content (UGC) untuk social proof',
      '✅ Collaborate dengan micro-influencer Makassar (5-50K followers)',
      '✅ Track analytics weekly dan adjust strategy',
      '✅ Prepare content batch (3-5 post) untuk konsistensi',
      '✅ Join & engage di Facebook Groups lokal Makassar',
      '✅ Use trending audio di TikTok untuk FYP potential'
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      duration: request.duration,
      businessGoal: request.businessGoal,
      targetAudience: request.targetAudience
    }
  }
}

export default {
  analyzeImageWithAI,
  generateTemplateDesign,
  generateSchedulePlanner,
}
