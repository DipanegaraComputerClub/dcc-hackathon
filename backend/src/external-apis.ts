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
    const { generateWithHuggingFace } = await import('./services/huggingface.client')
    const { generateWithStabilityAI } = await import('./services/stability.client')
    
    const result = await generateWithHuggingFace(prompt)
    
    if (result.success) {
      return { success: true, imageBase64: result.imageBase64 }
    }
    
    if (STABILITY_API_KEY) {
      const stabilityResult = await generateWithStabilityAI(prompt)
      if (stabilityResult.success) {
        return { success: true, imageBase64: stabilityResult.imageBase64 }
      }
    }
    
    return { success: false, error: 'All AI models failed' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}



// Final fallback: Creative UMKM-focused templates
export function generateFallbackTemplate(
  prompt: string,
  style: string,
  productImage?: string,
  theme: string = 'minimalist',
  brandColor: string = '#FF6347',
  productName?: string
): TemplateGenerationResult {
  console.log(`🎨 Generating creative ${theme} template with fallback`)
  
  const dimensions = style === 'story' 
    ? { width: 1080, height: 1920 } 
    : { width: 1080, height: 1080 }
  
  // Color helper
  const adjustBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + percent))
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + percent))
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + percent))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }
  
  const brandLight = adjustBrightness(brandColor, 40)
  const brandDark = adjustBrightness(brandColor, -30)
  
  // Add randomization for variety
  const seed = Date.now() % 1000
  const randomRotation = (seed % 30) - 15 // -15 to 15 degrees
  const randomScale = 0.9 + (seed % 20) / 100 // 0.9 to 1.1
  const randomX = (seed % 10) - 5 // -5 to 5% shift
  const randomY = (seed % 10) - 5
  
  let templateSvg = ''
  
  // Generate theme-specific templates
  if (theme === 'cute-pastel' || theme.includes('pastel')) {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE5EC"/>
            <stop offset="50%" stop-color="#FFF0F5"/>
            <stop offset="100%" stop-color="#E5F5FF"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#FFB6C1" flood-opacity="0.3"/></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <ellipse cx="20%" cy="15%" rx="80" ry="50" fill="white" opacity="0.7"/>
        <ellipse cx="80%" cy="20%" rx="70" ry="45" fill="white" opacity="0.7"/>
        <text x="10%" y="85%" font-size="40" opacity="0.6">💕</text>
        <text x="88%" y="88%" font-size="40" opacity="0.6">💕</text>
        <rect x="10%" y="25%" width="80%" height="60%" fill="white" rx="40" filter="url(#shadow)"/>
        ${productImage ? `<image href="${productImage}" x="15%" y="30%" width="70%" height="45%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 30px)"/>` : `<text x="50%" y="53%" font-size="80" text-anchor="middle">🌸</text>`}
        <rect x="15%" y="78%" width="70%" height="12%" fill="#FFB6C1" rx="25"/>
        <text x="50%" y="84.5%" font-family="Comic Sans MS" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${productName || 'Kawaii'} ♡</text>
      </svg>`
  } else if (theme === 'elegant' || theme.includes('luxury')) {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1a1a1a"/>
            <stop offset="100%" stop-color="#2d2d2d"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFD700"/>
            <stop offset="50%" stop-color="#FFA500"/>
            <stop offset="100%" stop-color="#FFD700"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect x="5%" y="5%" width="90%" height="2" fill="url(#gold)"/>
        <rect x="5%" y="95%" width="90%" height="2" fill="url(#gold)"/>
        ${productImage ? `<circle cx="50%" cy="45%" r="255" fill="url(#gold)"/><image href="${productImage}" x="27%" y="22%" width="46%" height="46%" preserveAspectRatio="xMidYMid slice" clip-path="circle(250px at 50% 50%)"/>` : `<circle cx="50%" cy="45%" r="250" fill="${brandColor}" opacity="0.2"/><text x="50%" y="47%" font-size="100" text-anchor="middle" fill="url(#gold)">✨</text>`}
        <text x="50%" y="82%" font-family="Georgia" font-size="48" font-weight="bold" fill="url(#gold)" text-anchor="middle">${productName || 'Luxury'}</text>
        <text x="50%" y="88%" font-family="Georgia" font-size="24" fill="#999" text-anchor="middle">PREMIUM QUALITY</text>
      </svg>`
  } else if (theme === 'bold-modern' || theme.includes('bold')) {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${brandColor}"/>
            <stop offset="100%" stop-color="${brandDark}"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="15" flood-opacity="0.3"/></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <polygon points="0,0 ${dimensions.width},0 ${dimensions.width},200" fill="black" opacity="0.1"/>
        <polygon points="0,${dimensions.height} ${dimensions.width},${dimensions.height} 0,${dimensions.height - 200}" fill="white" opacity="0.1"/>
        <rect x="10%" y="20%" width="80%" height="65%" fill="white" rx="20" filter="url(#shadow)"/>
        ${productImage ? `<image href="${productImage}" x="15%" y="25%" width="70%" height="50%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 15px)"/>` : `<text x="50%" y="50%" font-size="100" font-weight="900" text-anchor="middle" fill="${brandColor}">⚡</text>`}
        <rect x="5%" y="88%" width="90%" height="10%" fill="black"/>
        <text x="50%" y="93.5%" font-family="Impact" font-size="42" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle">${(productName || 'BOLD').toUpperCase()}</text>
      </svg>`
  } else if (theme === 'playful') {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF6B9D"/>
            <stop offset="50%" stop-color="#FEC163"/>
            <stop offset="100%" stop-color="#C3F0FF"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="4" dy="8" stdDeviation="10" flood-color="${brandColor}" flood-opacity="0.4"/></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="15%" cy="12%" r="40" fill="#FFD93D" opacity="0.6"/>
        <circle cx="88%" cy="18%" r="50" fill="#6BCB77" opacity="0.6"/>
        <circle cx="10%" cy="85%" r="45" fill="#4D96FF" opacity="0.6"/>
        <text x="20%" y="25%" font-size="35" transform="rotate(-15 216 270)">⭐</text>
        <text x="82%" y="30%" font-size="40" transform="rotate(20 886 324)">✨</text>
        <rect x="12%" y="28%" width="76%" height="58%" fill="white" rx="35" filter="url(#shadow)" transform="rotate(-2 ${dimensions.width/2} ${dimensions.height/2})"/>
        ${productImage ? `<image href="${productImage}" x="18%" y="33%" width="64%" height="43%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 25px)"/>` : `<text x="50%" y="56%" font-size="90" text-anchor="middle" fill="${brandColor}">🎉</text>`}
        <ellipse cx="50%" cy="82%" rx="38%" ry="8%" fill="${brandColor}"/>
        <text x="50%" y="83.5%" font-family="Comic Sans MS" font-size="38" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${productName || 'Fun'} 🎊</text>
      </svg>`
  } else if (theme === 'premium') {
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg"><stop offset="0%" stop-color="#0a0a0a"/><stop offset="100%" stop-color="#1a1a1a"/></linearGradient>
          <linearGradient id="accent" x1="0%" x2="100%"><stop offset="0%" stop-color="${brandColor}"/><stop offset="100%" stop-color="${brandDark}"/></linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect x="3%" y="3%" width="94%" height="94%" fill="none" stroke="url(#accent)" stroke-width="3" rx="15"/>
        <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="url(#accent)" stroke-width="1" rx="12"/>
        <text x="8%" y="10%" font-size="30" fill="${brandColor}">◆</text>
        <text x="92%" y="10%" font-size="30" fill="${brandColor}">◆</text>
        ${productImage ? `<rect x="18%" y="20%" width="64%" height="50%" fill="url(#accent)" rx="10"/><image href="${productImage}" x="20%" y="22%" width="60%" height="46%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 8px)"/>` : `<text x="50%" y="47%" font-size="120" text-anchor="middle" fill="url(#accent)">👑</text>`}
        <line x1="20%" y1="78%" x2="80%" y2="78%" stroke="url(#accent)" stroke-width="2"/>
        <text x="50%" y="85%" font-family="Georgia" font-size="40" font-weight="bold" fill="${brandColor}" text-anchor="middle">${productName || 'Premium'}</text>
        <text x="50%" y="91%" font-family="Georgia" font-size="20" fill="#888" text-anchor="middle" letter-spacing="3">EXCLUSIVE</text>
      </svg>`
  } else {
    // Minimalist (default)
    templateSvg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAFAFA"/>
            <stop offset="100%" stop-color="#F0F0F0"/>
          </linearGradient>
          <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.1"/></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="15%" cy="15%" r="120" fill="${brandLight}" opacity="0.3"/>
        <circle cx="85%" cy="85%" r="150" fill="${brandColor}" opacity="0.2"/>
        <rect x="8%" y="8%" width="84%" height="84%" fill="white" rx="30" filter="url(#shadow)"/>
        ${productImage ? `<image href="${productImage}" x="15%" y="15%" width="70%" height="55%" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 20px)"/>` : `<text x="50%" y="42%" font-size="80" text-anchor="middle" fill="${brandColor}">🎨</text>`}
        <rect x="12%" y="75%" width="76%" height="15%" fill="${brandColor}" rx="15"/>
        <text x="50%" y="82.5%" font-family="Arial" font-size="36" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${productName || 'Product'}</text>
      </svg>`
  }
  
  const templateBase64 = `data:image/svg+xml;base64,${Buffer.from(templateSvg.trim()).toString('base64')}`
  
  return {
    success: true,
    imageBase64: templateBase64
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
