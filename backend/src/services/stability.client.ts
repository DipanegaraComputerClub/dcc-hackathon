import axios from 'axios'

const STABILITY_API_KEY = process.env.STABILITY_API_KEY || ''

interface StabilityResult {
  success: boolean
  imageBase64?: string
  error?: string
}

export async function generateWithStabilityAI(prompt: string): Promise<StabilityResult> {
  if (!STABILITY_API_KEY) {
    return { success: false, error: 'Stability API key not configured' }
  }

  try {
    console.log(`⚡ Using model: Stability AI Core`)
    
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      { prompt },
      {
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'image/png'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    )

    const imageBase64 = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`
    console.log(`✅ Generated with Stability AI Core`)
    
    return { success: true, imageBase64 }
  } catch (error: any) {
    const status = error.response?.status
    console.log(`❌ Model failed: Stability AI Core (${status || error.message})`)
    return { success: false, error: error.message }
  }
}
