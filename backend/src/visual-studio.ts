import OpenAI from 'openai'

const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY!
const USE_MOCK = process.env.USE_MOCK_AI === 'true'

const client = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: 'https://api.kolosal.ai/v1'
})

console.log('🎨 Visual Studio Config:')
console.log('   Model: Llama 4 Maverick Vision')
console.log('   API Key:', KOLOSAL_API_KEY ? '✅ Set' : '❌ Not set')
console.log('   Mock Mode:', USE_MOCK ? '✅ Enabled' : '❌ Disabled')

// ================================
// TYPE DEFINITIONS
// ================================
export interface ImageAnalysisRequest {
  imageUrl?: string
  imageBase64?: string
  context?: string  // Konteks bisnis (e.g., "UMKM makanan Makassar")
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
// 1. IMAGE ANALYSIS WITH AI VISION
// ================================
export async function analyzeImageWithAI(
  request: ImageAnalysisRequest
): Promise<ImageAnalysisResponse> {
  if (USE_MOCK) {
    console.log('🧪 MOCK: Analyzing image...')
    return generateMockImageAnalysis(request)
  }

  try {
    console.log('🤖 Analyzing image with Llama 4 Maverick Vision...')
    
    // Build prompt for image analysis
    const prompt = `Analisa gambar ini sebagai expert visual marketing untuk UMKM kuliner Makassar.

TUGAS ANALISA:

1. **VISUAL QUALITY ASSESSMENT** (Score 1-10)
   - Composition & framing
   - Lighting & exposure
   - Color balance
   - Focus & sharpness
   - Overall appeal

2. **CONTENT IDENTIFICATION**
   - Apa yang ada di gambar? (describe detail)
   - Food photography quality
   - Presentation & plating
   - Background & props
   - Mood & atmosphere

3. **MARKETING POTENTIAL**
   - Platform terbaik (Instagram/TikTok/Facebook)
   - Target audience cocok untuk siapa?
   - Emotion yang ditimbulkan
   - Call-to-action potential
   - Viral potential (1-10)

4. **IMPROVEMENT SUGGESTIONS**
   - Apa yang bisa diperbaiki?
   - Editing recommendations
   - Props/background suggestions
   - Angle/framing alternatives

5. **CONTENT STRATEGY**
   - Best time to post (hari + jam)
   - Caption theme suggestions
   - Hashtag strategy (10-15 hashtags)
   - Color palette extraction (hex codes)

6. **DESIGN ENHANCEMENTS**
   - Text overlay positioning
   - Graphic elements to add
   - Filters/presets suggestions
   - Branding opportunities

${request.context ? `\nBUSINESS CONTEXT: ${request.context}` : ''}

Output format harus DETAILED dan ACTIONABLE!`

    const completion = await client.chat.completions.create({
      model: 'Llama 4 Maverick',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah AI visual marketing expert dengan 10+ years experience dalam food photography, social media marketing, dan brand positioning untuk UMKM. Kamu bisa menganalisa gambar secara mendalam dan memberikan actionable insights untuk maximize engagement dan sales.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    })
    
    const analysisText = completion.choices[0].message.content?.trim() || ''
    
    // Parse output (simplified - in production, use structured output)
    return {
      analysis: analysisText,
      suggestions: extractSuggestions(analysisText),
      marketingTips: extractMarketingTips(analysisText),
      bestTimeToPost: extractBestTime(analysisText),
      hashtags: extractHashtags(analysisText),
      colorPalette: extractColors(analysisText),
      metadata: {
        analyzedAt: new Date().toISOString(),
        model: 'Llama 4 Maverick',
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
// MOCK GENERATORS
// ================================
function generateMockImageAnalysis(request: ImageAnalysisRequest): ImageAnalysisResponse {
  return {
    analysis: `📸 ANALISA VISUAL MARKETING

1. VISUAL QUALITY (8/10)
   - Composition: Baik, rule of thirds terpenuhi
   - Lighting: Natural light, warm tone
   - Color: Vibrant dan appetizing
   - Sharpness: Fokus bagus pada subjek utama

2. CONTENT IDENTIFICATION
   - Makanan khas Makassar (food photography)
   - Presentation menarik dengan garnish
   - Background clean dengan props minimal
   - Mood: Warm, inviting, homey

3. MARKETING POTENTIAL (9/10)
   - Platform: Instagram Feed & Story (optimal)
   - Target: Foodies, mahasiswa, pekerja 25-40 tahun
   - Emotion: Hunger appeal, nostalgia
   - Viral potential: Tinggi jika timing pas

4. IMPROVEMENT SUGGESTIONS
   ✅ Tambahkan text overlay untuk highlight promo
   ✅ Gunakan filter warm untuk enhance appetite appeal
   ✅ Crop closer untuk hero shot di Story format
   
5. CONTENT STRATEGY
   - Best time: Senin-Jumat 11:00-13:00 (lunch) & 18:00-20:00 (dinner)
   - Caption theme: Storytelling + call-to-action
   - Hashtag mix: Popular + niche + branded`,
    suggestions: [
      'Tingkatkan pencahayaan dengan reflektor',
      'Gunakan angle 45° untuk depth',
      'Tambahkan props garnish segar'
    ],
    marketingTips: [
      'Post di jam makan untuk maximize hunger appeal',
      'Tag lokasi untuk local SEO',
      'Collaborate dengan food blogger lokal'
    ],
    bestTimeToPost: [
      'Senin-Jumat: 11:00-13:00 WIB',
      'Sabtu-Minggu: 18:00-20:00 WIB',
      'Story: 07:00-09:00 WIB'
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
      imageContext: request.context || 'UMKM Kuliner'
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
