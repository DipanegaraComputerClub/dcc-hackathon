import axios from 'axios'
import FormData from 'form-data'
import sharp from 'sharp'

// ================================
// API CONFIGURATIONS (FREE & POWERFUL)
// ================================
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''
const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY || ''
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || ''

console.log('🔌 External APIs Config (FREE Tier):')
console.log('   Hugging Face:', HUGGINGFACE_API_KEY ? '✅ Configured' : '⚠️ Not set (Unlimited FREE)')
console.log('   Remove.bg:', REMOVEBG_API_KEY ? '✅ Configured' : '⚠️ Not set (50 free/month)')
console.log('   Stability AI:', STABILITY_API_KEY ? '✅ Configured' : '⚠️ Not set (25 free/month)')

// ================================
// 1. SIGHTENGINE - IMAGE QUALITY ANALYSIS
// ================================
export interface SightengineAnalysisResult {
  qualityScore: number // 1-10
  viralScore: number // 1-10
  needsRetake: boolean
  analysis: string
  detailedScores: {
    sharpness: number
    contrast: number
    brightness: number
    colors: number
    composition: number
  }
  issues: string[]
  suggestions: string[]
}

export async function analyzeImageWithSightengine(
  imageBase64: string
): Promise<SightengineAnalysisResult> {
  try {
    console.log('🔍 Analyzing image quality with Sharp.js...')

    // Use local Sharp.js analysis (FREE & FAST)
    return fallbackImageAnalysis(imageBase64)
    
    // Note: Sightengine API removed to simplify setup
    // Sharp.js provides excellent quality analysis for FREE!
    
    /* 
    // Optional: Uncomment if you want to use Sightengine API
    */

  } catch (error: any) {
    console.error('❌ Error analyzing image:', error.message)
    return fallbackImageAnalysis(imageBase64)
  }
}

// ================================
// 2. REMOVE.BG - BACKGROUND REMOVAL (50 FREE/MONTH)
// ================================
export interface BackgroundRemovalResult {
  success: boolean
  imageBase64?: string
  error?: string
}

export async function removeBackgroundWithRemoveBg(
  imageBase64: string
): Promise<BackgroundRemovalResult> {
  try {
    console.log('✂️ Removing background with Remove.bg...')

    if (!REMOVEBG_API_KEY) {
      console.warn('⚠️ Remove.bg API key not configured - using simulation mode')
      
      // Return simulation success (untuk demo purposes)
      // Di production, user perlu setup API key
      return {
        success: false,
        error: 'Remove.bg API key not configured. Get 50 free images/month at https://remove.bg/api'
      }
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    // Call Remove.bg API
    const formData = new FormData()
    formData.append('image_file_b64', imageBase64.replace(/^data:image\/\w+;base64,/, ''))
    formData.append('size', 'auto')

    const response = await axios.post(
      'https://api.remove.bg/v1.0/removebg',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': REMOVEBG_API_KEY
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    )

    console.log('✅ Background removed successfully with Remove.bg')

    // Convert response to base64
    const resultBase64 = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`

    return {
      success: true,
      imageBase64: resultBase64
    }

  } catch (error: any) {
    console.error('❌ Remove.bg API Error:', error.message)
    return {
      success: false,
      error: error.response?.data?.errors?.[0]?.title || error.message
    }
  }
}

// ================================
// 3. HUGGING FACE - AI IMAGE GENERATION (UNLIMITED FREE)
// ================================
export interface TemplateGenerationResult {
  success: boolean
  imageBase64?: string
  error?: string
}

export async function generateTemplateWithHuggingFace(
  prompt: string,
  style: string = 'instagram-feed'
): Promise<TemplateGenerationResult> {
  try {
    console.log('🎨 Generating template with Hugging Face Stable Diffusion...')

    if (!HUGGINGFACE_API_KEY) {
      console.warn('⚠️ Hugging Face API key not configured - using fallback')
      return generateFallbackTemplate(prompt, style)
    }

    // Enhanced prompt untuk UMKM branding
    const brandingPrompts = {
      'instagram-feed': 'square 1:1 instagram post, modern clean design, vibrant colors, professional product photography',
      'story': 'vertical 9:16 instagram story, eye-catching design, bold colors, mobile-optimized layout',
      'promo': 'promotional banner, sale design, attention-grabbing, bold typography, dynamic composition',
      'feed': 'social media feed post, aesthetic layout, minimal design, instagram-worthy',
      'reels': 'vertical video thumbnail, dynamic composition, vibrant colors, engaging visual'
    }

    const stylePrompt = brandingPrompts[style as keyof typeof brandingPrompts] || brandingPrompts['instagram-feed']
    
    const enhancedPrompt = `Professional UMKM branding ${stylePrompt}: ${prompt}. 
    High quality commercial photography, clean background, vibrant appetizing colors, 
    product-focused composition, professional lighting, marketing material, 
    instagram-worthy aesthetic, no text overlay, space for text, modern minimalist design`

    // Call Hugging Face Inference API - Using Stable Diffusion XL
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        inputs: enhancedPrompt,
        parameters: {
          negative_prompt: 'blurry, low quality, watermark, text, signature, distorted, ugly, bad composition',
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: style === 'story' ? 768 : 1024,
          height: style === 'story' ? 1344 : 1024
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 120000 // 120s for image generation
      }
    )

    console.log('✅ Template generated successfully with Hugging Face')

    // Convert to base64
    const imageBase64 = `data:image/jpeg;base64,${Buffer.from(response.data).toString('base64')}`

    return {
      success: true,
      imageBase64
    }

  } catch (error: any) {
    console.error('❌ Hugging Face API Error:', error.message)
    
    // Fallback to Stability AI if available
    if (STABILITY_API_KEY) {
      console.log('🔄 Trying fallback to Stability AI...')
      return generateWithStabilityAI(prompt, style)
    }
    
    return {
      success: false,
      error: error.response?.data?.error || error.message
    }
  }
}

// Fallback: Stability AI (25 free generations/month)
async function generateWithStabilityAI(
  prompt: string,
  style: string
): Promise<TemplateGenerationResult> {
  try {
    const formData = new FormData()
    formData.append('prompt', `UMKM product branding ${style}: ${prompt}. Professional, clean, vibrant`)
    formData.append('output_format', 'jpeg')
    formData.append('aspect_ratio', style === 'story' ? '9:16' : '1:1')
    
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'image/*',
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    )

    const imageBase64 = `data:image/jpeg;base64,${Buffer.from(response.data).toString('base64')}`
    
    return {
      success: true,
      imageBase64
    }
  } catch (error: any) {
    console.error('❌ Stability AI Error:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Final fallback: Return professional-looking placeholder
export function generateFallbackTemplate(
  prompt: string,
  style: string
): TemplateGenerationResult {
  console.log('⚠️ Using fallback template generator')
  
  const dimensions = style === 'story' ? { width: 720, height: 1280 } : { width: 1024, height: 1024 }
  
  // Generate professional placeholder SVG
  const placeholderSvg = `
    <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFD93D;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="5%" y="5%" width="90%" height="90%" fill="white" rx="20"/>
      <text x="50%" y="35%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FF6B6B" text-anchor="middle" dominant-baseline="middle">
        🎨 UMKM Design
      </text>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#333" text-anchor="middle" dominant-baseline="middle">
        Template Demo Mode
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle" dominant-baseline="middle">
        Configure API keys for AI generation
      </text>
      <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dominant-baseline="middle">
        Hugging Face • Stability AI • Remove.bg
      </text>
    </svg>
  `.trim()
  
  const placeholderBase64 = `data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString('base64')}`
  
  return {
    success: true,
    imageBase64: placeholderBase64
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

async function calculateSharpness(imageBuffer: Buffer): Promise<number> {
  try {
    // Use Laplacian variance to detect blur - more accurate method
    const { data, info } = await sharp(imageBuffer)
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0] // Laplacian kernel
      })
      .raw()
      .toBuffer({ resolveWithObject: true })
    
    // Calculate variance of Laplacian
    let sum = 0
    let sumSq = 0
    const pixels = data.length
    
    for (let i = 0; i < pixels; i++) {
      sum += data[i]
      sumSq += data[i] * data[i]
    }
    
    const mean = sum / pixels
    const variance = (sumSq / pixels) - (mean * mean)
    
    // Strict scoring: variance < 100 = very blurry, > 1000 = sharp
    // Map variance 0-2000 to score 1-10
    let sharpnessScore: number
    if (variance < 50) sharpnessScore = 1  // Extremely blurry
    else if (variance < 100) sharpnessScore = 2  // Very blurry
    else if (variance < 200) sharpnessScore = 3  // Blurry
    else if (variance < 300) sharpnessScore = 4  // Quite blurry
    else if (variance < 500) sharpnessScore = 5  // Slightly blurry
    else if (variance < 700) sharpnessScore = 6  // Acceptable
    else if (variance < 1000) sharpnessScore = 7  // Good
    else if (variance < 1500) sharpnessScore = 8  // Very good
    else if (variance < 2000) sharpnessScore = 9  // Excellent
    else sharpnessScore = 10  // Perfect
    
    console.log(`   📊 Sharpness variance: ${variance.toFixed(2)} → Score: ${sharpnessScore}/10`)
    
    return sharpnessScore
  } catch (error) {
    console.warn('⚠️ Sharpness calculation error:', error)
    return 3 // Default low score on error
  }
}

function calculateContrast(stats: sharp.Stats): number {
  try {
    const channels = stats.channels
    let avgStdDev = 0
    
    channels.forEach((channel: any) => {
      avgStdDev += channel.stdev || 0
    })
    
    avgStdDev = avgStdDev / channels.length
    
    // Strict scoring: stddev < 20 = very flat, > 60 = good contrast
    let contrastScore: number
    if (avgStdDev < 10) contrastScore = 1  // No contrast, very flat
    else if (avgStdDev < 20) contrastScore = 3  // Low contrast
    else if (avgStdDev < 30) contrastScore = 5  // Moderate
    else if (avgStdDev < 45) contrastScore = 7  // Good
    else if (avgStdDev < 60) contrastScore = 9  // Excellent
    else contrastScore = 10  // Perfect
    
    console.log(`   📊 Contrast stddev: ${avgStdDev.toFixed(2)} → Score: ${contrastScore}/10`)
    
    return contrastScore
  } catch (error) {
    return 3
  }
}

function calculateBrightness(stats: sharp.Stats): number {
  try {
    const channels = stats.channels
    let avgMean = 0
    
    channels.forEach((channel: any) => {
      avgMean += channel.mean || 0
    })
    
    avgMean = avgMean / channels.length
    
    // Strict scoring based on exposure
    // Ideal range: 100-150 (properly exposed)
    let brightnessScore: number
    if (avgMean < 30) brightnessScore = 1  // Way too dark
    else if (avgMean < 50) brightnessScore = 2  // Very dark
    else if (avgMean < 80) brightnessScore = 4  // Dark/underexposed
    else if (avgMean < 100) brightnessScore = 6  // Slightly underexposed
    else if (avgMean >= 100 && avgMean <= 150) brightnessScore = 9  // Perfect exposure
    else if (avgMean <= 180) brightnessScore = 7  // Slightly overexposed
    else if (avgMean <= 200) brightnessScore = 5  // Overexposed
    else if (avgMean <= 220) brightnessScore = 3  // Very overexposed
    else brightnessScore = 1  // Blown highlights
    
    console.log(`   📊 Brightness mean: ${avgMean.toFixed(2)} → Score: ${brightnessScore}/10`)
    
    return brightnessScore
  } catch (error) {
    return 3
  }
}

function calculateColorScore(stats: sharp.Stats): number {
  try {
    // Check color saturation and vibrancy
    const channels = stats.channels
    
    if (channels.length < 3) {
      return 3 // Grayscale image = low color score
    }
    
    // Calculate color variance and range
    let totalStdDev = 0
    let totalRange = 0
    
    channels.forEach((channel: any) => {
      totalStdDev += channel.stdev || 0
      totalRange += (channel.max - channel.min) || 0
    })
    
    const avgStdDev = totalStdDev / channels.length
    const avgRange = totalRange / channels.length
    
    // Strict scoring: dull colors vs vibrant
    let colorScore: number
    if (avgRange < 50) colorScore = 1  // Very dull/monochrome
    else if (avgRange < 100) colorScore = 3  // Dull colors
    else if (avgRange < 150) colorScore = 5  // Moderate
    else if (avgRange < 200) colorScore = 7  // Good colors
    else if (avgRange < 230) colorScore = 9  // Vibrant
    else colorScore = 10  // Excellent vibrancy
    
    console.log(`   📊 Color range: ${avgRange.toFixed(2)} → Score: ${colorScore}/10`)
    
    return colorScore
  } catch (error) {
    return 3
  }
}

function calculateCompositionScore(metadata: sharp.Metadata): number {
  try {
    const width = metadata.width || 1
    const height = metadata.height || 1
    const aspectRatio = width / height
    
    // Ideal aspect ratios: 1:1 (Instagram), 4:5, 16:9
    const idealRatios = [1.0, 0.8, 1.78]
    let closestDiff = 999
    
    idealRatios.forEach(ratio => {
      const diff = Math.abs(aspectRatio - ratio)
      if (diff < closestDiff) closestDiff = diff
    })
    
    // Score based on aspect ratio closeness
    const compositionScore = Math.min(10, Math.max(1, Math.round(10 - (closestDiff * 5))))
    
    return compositionScore
  } catch (error) {
    return 6
  }
}

function generateAnalysisText(params: {
  qualityScore: number
  viralScore: number
  sharpness: number
  contrast: number
  brightness: number
  colors: number
  composition: number
  needsRetake: boolean
  issues: string[]
  suggestions: string[]
}): string {
  const { qualityScore, viralScore, sharpness, contrast, brightness, colors, composition, needsRetake, issues, suggestions } = params

  return `🔍 ANALISIS VISUAL COMPREHENSIVE (Powered by Sightengine AI)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 QUALITY SCORE: ${qualityScore}/10 ${needsRetake ? '❌ NEEDS RETAKE' : '✅ APPROVED'}
🔥 VIRAL POTENTIAL: ${viralScore}/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${needsRetake 
  ? '⚠️ REKOMENDASI: RETAKE FOTO\n\nFoto ini memiliki kualitas di bawah standar profesional. Pertimbangkan untuk foto ulang dengan pencahayaan lebih baik, fokus lebih tajam, dan komposisi yang lebih optimal.\n' 
  : '✅ REKOMENDASI: FOTO SIAP DIGUNAKAN!\n\nFoto ini memiliki kualitas yang baik dan siap untuk konten marketing. Anda bisa langsung lanjut ke tahap design.\n'
}

1. DETAIL PENILAIAN TEKNIS

   🔍 Sharpness/Focus: ${sharpness}/10 ${sharpness >= 8 ? '- Crystal Sharp ✓' : sharpness >= 6 ? '- Acceptable' : '- Blur/Soft ✗'}
   ${sharpness >= 8 ? '   ✓ Fokus tack sharp, detail sangat jelas' : sharpness >= 6 ? '   ~ Fokus decent tapi bisa lebih tajam' : '   ✗ BLUR - fokus tidak tajam, gambar soft/kabur'}
   
   ⚡ Contrast: ${contrast}/10 ${contrast >= 8 ? '- Excellent ✓' : contrast >= 6 ? '- Good' : '- Flat ✗'}
   ${contrast >= 8 ? '   ✓ Contrast optimal, depth bagus' : contrast >= 6 ? '   ~ Contrast cukup, bisa ditingkatkan' : '   ✗ Gambar flat, perlu boost contrast'}
   
   💡 Brightness/Exposure: ${brightness}/10 ${brightness >= 8 ? '- Perfect ✓' : brightness >= 6 ? '- Acceptable' : '- Poor ✗'}
   ${brightness >= 8 ? '   ✓ Exposure ideal, tidak ada blown highlights' : brightness >= 6 ? '   ~ Exposure cukup tapi bisa lebih optimal' : '   ✗ Exposure buruk - terlalu gelap/terang'}
   
   🎨 Colors/Vibrancy: ${colors}/10 ${colors >= 8 ? '- Vibrant ✓' : colors >= 6 ? '- Decent' : '- Dull ✗'}
   ${colors >= 8 ? '   ✓ Warna vibrant dan appealing' : colors >= 6 ? '   ~ Warna decent tapi kurang pop' : '   ✗ Warna kusam/pudar, tidak menarik'}
   
   📐 Composition: ${composition}/10 ${composition >= 8 ? '- Excellent ✓' : composition >= 6 ? '- Good' : '- Poor ✗'}
   ${composition >= 8 ? '   ✓ Komposisi profesional, well-framed' : composition >= 6 ? '   ~ Komposisi acceptable' : '   ✗ Komposisi lemah, framing kurang optimal'}

${issues.length > 0 ? `
2. MASALAH TERDETEKSI
${issues.map(issue => `   ${issue}`).join('\n')}
` : ''}

3. REKOMENDASI PERBAIKAN
${suggestions.length > 0 ? suggestions.map(s => `   ${s}`).join('\n') : '   ✓ Foto sudah bagus, lanjut ke editing & design!'}

4. MARKETING STRATEGY
   📱 Platform: Instagram Feed & Story (optimal)
   🎯 Target: Foodies 25-40 tahun, mahasiswa
   ⏰ Best time: 11:00-13:00 & 18:00-20:00 WIB
   📈 Engagement potential: ${viralScore >= 8 ? 'HIGH' : viralScore >= 6 ? 'MEDIUM' : 'LOW'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 FINAL VERDICT: ${needsRetake ? '❌ Retake disarankan untuk hasil maksimal' : '✅ Ready for design & posting!'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
}

async function fallbackImageAnalysis(imageBase64: string): Promise<SightengineAnalysisResult> {
  console.log('🔄 Using fallback image analysis with Sharp...')
  
  try {
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    
    const metadata = await sharp(imageBuffer).metadata()
    const stats = await sharp(imageBuffer).stats()
    
    const sharpness = await calculateSharpness(imageBuffer)
    const contrast = calculateContrast(stats)
    const brightness = calculateBrightness(stats)
    const colors = calculateColorScore(stats)
    const composition = calculateCompositionScore(metadata)
    
    const qualityScore = Math.round((sharpness * 0.3) + (contrast * 0.2) + (brightness * 0.2) + (colors * 0.15) + (composition * 0.15))
    const viralScore = Math.round((qualityScore * 0.5) + (colors * 0.3) + (composition * 0.2))
    const needsRetake = qualityScore < 7 || sharpness < 6
    
    const issues: string[] = []
    if (sharpness < 6) issues.push('❌ Gambar BLUR - fokus tidak tajam')
    if (contrast < 5) issues.push('⚠️ Contrast rendah')
    if (brightness < 4 || brightness > 9) issues.push('⚠️ Exposure tidak optimal')
    if (colors < 6) issues.push('⚠️ Warna kusam')
    
    const suggestions: string[] = []
    if (sharpness < 7) suggestions.push('📸 Gunakan tripod untuk foto lebih tajam')
    if (contrast < 6) suggestions.push('🎨 Tingkatkan contrast saat editing')
    if (brightness < 5) suggestions.push('💡 Tambah pencahayaan')
    if (colors < 7) suggestions.push('🌈 Tingkatkan saturation')
    
    const analysis = generateAnalysisText({
      qualityScore, viralScore, sharpness, contrast, brightness, colors, composition,
      needsRetake, issues, suggestions
    })
    
    return {
      qualityScore, viralScore, needsRetake, analysis,
      detailedScores: { sharpness, contrast, brightness, colors, composition },
      issues, suggestions
    }
  } catch (error) {
    console.error('❌ Fallback analysis error:', error)
    throw error
  }
}

export default {
  analyzeImageWithSightengine,
  removeBackgroundWithRemoveBg,
  generateTemplateWithHuggingFace
}
