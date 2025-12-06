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
    
    const payload = {
      prompt: prompt,
      output_format: 'png',
      aspect_ratio: '1:1'
    }
    
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'application/json'
        },
        timeout: 60000
      }
    )

    if (response.data.image) {
      const imageBase64 = `data:image/png;base64,${response.data.image}`
      console.log(`✅ Generated with Stability AI Core`)
      return { success: true, imageBase64 }
    }
    
    const imageBase64 = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`
    console.log(`✅ Generated with Stability AI Core`)
    return { success: true, imageBase64 }
  } catch (error: any) {
    const status = error.response?.status
    const detail = error.response?.data?.message || error.message
    console.log(`❌ Model failed: Stability AI Core (${status}: ${detail})`)
    return { success: false, error: detail }
  }
}
