import axios from 'axios'

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''

interface HFGenerationResult {
  success: boolean
  imageBase64?: string
  error?: string
  model?: string
}

const ACTIVE_MODELS = [
  { name: 'stabilityai/stable-diffusion-xl-base-1.0', steps: 30, cfg: 7.5 },
  { name: 'prompthero/openjourney-v4', steps: 25, cfg: 7 },
  { name: 'runwayml/stable-diffusion-v1-5', steps: 30, cfg: 7.5 }
]

export async function generateWithHuggingFace(prompt: string): Promise<HFGenerationResult> {
  if (!HUGGINGFACE_API_KEY) {
    return { success: false, error: 'HuggingFace API key not configured' }
  }

  for (const model of ACTIVE_MODELS) {
    try {
      console.log(`⚡ Using model: ${model.name}`)
      
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model.name}`,
        {
          inputs: prompt,
          parameters: {
            num_inference_steps: model.steps,
            guidance_scale: model.cfg,
            negative_prompt: 'blurry, low quality, distorted, watermark, text, logo'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 120000
        }
      )

      const imageBase64 = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`
      console.log(`✅ Generated with ${model.name}`)
      
      return { success: true, imageBase64, model: model.name }
    } catch (error: any) {
      const status = error.response?.status
      
      if (status === 503) {
        console.log(`⏳ ${model.name} loading, waiting 10s...`)
        await new Promise(resolve => setTimeout(resolve, 10000))
        try {
          const retryResponse = await axios.post(
            `https://api-inference.huggingface.co/models/${model.name}`,
            { inputs: prompt, parameters: { num_inference_steps: model.steps, guidance_scale: model.cfg } },
            {
              headers: { 'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`, 'Content-Type': 'application/json' },
              responseType: 'arraybuffer',
              timeout: 120000
            }
          )
          const imageBase64 = `data:image/png;base64,${Buffer.from(retryResponse.data).toString('base64')}`
          console.log(`✅ Generated with ${model.name} after retry`)
          return { success: true, imageBase64, model: model.name }
        } catch (retryError) {
          console.log(`❌ Retry failed for ${model.name}`)
          continue
        }
      }
      
      console.log(`❌ Model failed: ${model.name} (${status || error.message})`)
      continue
    }
  }

  return { success: false, error: 'All HuggingFace models failed' }
}
