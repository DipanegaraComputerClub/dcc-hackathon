import axios from 'axios'
import FormData from 'form-data'
import sharp from 'sharp'

// ================================
// API CONFIGURATIONS
// ================================
const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER || ''
const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET || ''
const PIXIAN_API_KEY = process.env.PIXIAN_API_KEY || ''
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY || ''

console.log('🔌 External APIs Config:')
console.log('   Sightengine:', SIGHTENGINE_USER ? '✅ Configured' : '❌ Not set')
console.log('   Pixian.ai:', PIXIAN_API_KEY ? '✅ Configured' : '❌ Not set')
console.log('   Replicate (Flux):', REPLICATE_API_KEY ? '✅ Configured' : '❌ Not set')

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
    console.log('🔍 Analyzing image with Sightengine API...')

    if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
      console.warn('⚠️ Sightengine credentials not configured, using fallback analysis')
      return fallbackImageAnalysis(imageBase64)
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    
    // Analyze with Sharp for technical metrics
    const metadata = await sharp(imageBuffer).metadata()
    const stats = await sharp(imageBuffer).stats()
    
    // Calculate sharpness (using laplacian variance approximation)
    const sharpnessScore = await calculateSharpness(imageBuffer)
    
    // Call Sightengine API for quality analysis
    const formData = new FormData()
    formData.append('media', imageBuffer, { filename: 'image.jpg' })
    formData.append('models', 'properties,quality')
    formData.append('api_user', SIGHTENGINE_USER)
    formData.append('api_secret', SIGHTENGINE_SECRET)

    const response = await axios.post(
      'https://api.sightengine.com/1.0/check.json',
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000
      }
    )

    const data = response.data
    console.log('✅ Sightengine response received')

    // Extract quality metrics
    const quality = data.quality || {}
    const sharpness = quality.sharpness || sharpnessScore
    const contrast = quality.contrast || calculateContrast(stats)
    const brightness = quality.brightness || calculateBrightness(stats)
    const colors = quality.colors || calculateColorScore(stats)

    // Calculate composition score (using rule of thirds approximation)
    const composition = calculateCompositionScore(metadata)

    // Calculate overall quality score (weighted average)
    const qualityScore = Math.round(
      (sharpness * 0.3) + 
      (contrast * 0.2) + 
      (brightness * 0.2) + 
      (colors * 0.15) + 
      (composition * 0.15)
    )

    // Calculate viral potential
    const viralScore = Math.round(
      (qualityScore * 0.5) + 
      (colors * 0.3) + 
      (composition * 0.2)
    )

    // Determine if needs retake
    const needsRetake = qualityScore < 7 || sharpness < 6

    // Identify issues
    const issues: string[] = []
    if (sharpness < 6) issues.push('❌ Gambar BLUR - fokus tidak tajam')
    if (contrast < 5) issues.push('⚠️ Contrast rendah - gambar flat')
    if (brightness < 4 || brightness > 9) issues.push('⚠️ Exposure tidak optimal - terlalu gelap/terang')
    if (colors < 6) issues.push('⚠️ Warna kusam - perlu color correction')
    if (composition < 6) issues.push('⚠️ Komposisi kurang optimal')

    // Generate suggestions
    const suggestions: string[] = []
    if (sharpness < 7) suggestions.push('📸 Gunakan tripod atau stabilize kamera untuk foto lebih tajam')
    if (contrast < 6) suggestions.push('🎨 Tingkatkan contrast saat editing untuk depth lebih baik')
    if (brightness < 5) suggestions.push('💡 Tambah pencahayaan atau naikkan exposure')
    if (brightness > 8) suggestions.push('💡 Kurangi exposure untuk avoid blown highlights')
    if (colors < 7) suggestions.push('🌈 Tingkatkan saturation dan lakukan color grading')
    if (composition < 7) suggestions.push('📐 Gunakan rule of thirds untuk komposisi lebih menarik')

    // Generate detailed analysis text
    const analysis = generateAnalysisText({
      qualityScore,
      viralScore,
      sharpness,
      contrast,
      brightness,
      colors,
      composition,
      needsRetake,
      issues,
      suggestions
    })

    return {
      qualityScore,
      viralScore,
      needsRetake,
      analysis,
      detailedScores: {
        sharpness,
        contrast,
        brightness,
        colors,
        composition
      },
      issues,
      suggestions
    }

  } catch (error: any) {
    console.error('❌ Sightengine API Error:', error.message)
    console.log('🔄 Using fallback analysis...')
    return fallbackImageAnalysis(imageBase64)
  }
}

// ================================
// 2. PIXIAN.AI - BACKGROUND REMOVAL
// ================================
export interface BackgroundRemovalResult {
  success: boolean
  imageBase64?: string
  error?: string
}

export async function removeBackgroundWithPixian(
  imageBase64: string
): Promise<BackgroundRemovalResult> {
  try {
    console.log('✂️ Removing background with Pixian.ai...')

    if (!PIXIAN_API_KEY) {
      console.warn('⚠️ Pixian API key not configured')
      return {
        success: false,
        error: 'Pixian API key not configured. Please set PIXIAN_API_KEY in .env'
      }
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    // Call Pixian API
    const formData = new FormData()
    formData.append('image', imageBuffer, { filename: 'image.jpg' })

    const response = await axios.post(
      'https://api.pixian.ai/api/v2/remove-background',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${PIXIAN_API_KEY}`
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    )

    console.log('✅ Background removed successfully')

    // Convert response to base64
    const resultBase64 = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`

    return {
      success: true,
      imageBase64: resultBase64
    }

  } catch (error: any) {
    console.error('❌ Pixian API Error:', error.message)
    return {
      success: false,
      error: error.response?.data?.error || error.message
    }
  }
}

// ================================
// 3. FLUX/REPLICATE - TEMPLATE GENERATION
// ================================
export interface TemplateGenerationResult {
  success: boolean
  imageUrl?: string
  predictionId?: string
  error?: string
}

export async function generateTemplateWithFlux(
  prompt: string,
  style: string = 'instagram-feed'
): Promise<TemplateGenerationResult> {
  try {
    console.log('🎨 Generating template with Flux via Replicate...')

    if (!REPLICATE_API_KEY) {
      console.warn('⚠️ Replicate API key not configured')
      return {
        success: false,
        error: 'Replicate API key not configured. Please set REPLICATE_API_KEY in .env'
      }
    }

    // Enhanced prompt for social media templates
    const enhancedPrompt = `Professional social media ${style} template design: ${prompt}. 
    High quality, vibrant colors, modern design, clean layout, instagram-worthy, 
    marketing material, eye-catching composition, professional photography style`

    // Call Replicate API (Flux Schnell for fast generation)
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'black-forest-labs/flux-schnell', // Fast model
        input: {
          prompt: enhancedPrompt,
          num_outputs: 1,
          aspect_ratio: style === 'story' ? '9:16' : '1:1',
          output_format: 'jpg',
          output_quality: 90
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    const prediction = response.data
    console.log('✅ Flux generation started:', prediction.id)

    // Poll for completion (simplified - in production use webhooks)
    let attempts = 0
    const maxAttempts = 30 // 30 seconds max wait
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s
      
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_KEY}`
          }
        }
      )

      const status = statusResponse.data
      
      if (status.status === 'succeeded') {
        console.log('✅ Template generated successfully')
        return {
          success: true,
          imageUrl: status.output[0],
          predictionId: prediction.id
        }
      }
      
      if (status.status === 'failed') {
        console.error('❌ Generation failed:', status.error)
        return {
          success: false,
          error: status.error
        }
      }
      
      attempts++
    }

    return {
      success: false,
      error: 'Generation timeout - please try again'
    }

  } catch (error: any) {
    console.error('❌ Replicate API Error:', error.message)
    return {
      success: false,
      error: error.response?.data?.detail || error.message
    }
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
  removeBackgroundWithPixian,
  generateTemplateWithFlux
}
