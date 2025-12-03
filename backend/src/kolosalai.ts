import axios from 'axios'

const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY!
const KOLOSAL_API_URL = 'https://api.kolosal.ai/v1/chat/completions'

export interface CopywritingRequest {
  namaProduk: string
  jenisKonten: string
  gayaBahasa: string
  tujuanKonten: string
}

export interface CopywritingResponse {
  mainText: string
  alternatives: string[]
}

/**
 * Generate copywriting menggunakan Kolosal AI
 */
export async function generateCopywriting(
  request: CopywritingRequest
): Promise<CopywritingResponse> {
  try {
    // Build prompt yang detail untuk AI
    const prompt = buildPrompt(request)

    // Request ke Kolosal AI API
    const response = await axios.post(
      KOLOSAL_API_URL,
      {
        model: 'gpt-3.5-turbo', // atau model lain yang tersedia di Kolosal AI
        messages: [
          {
            role: 'system',
            content:
              'Kamu adalah AI copywriter ahli yang membantu UMKM kuliner di Makassar membuat konten marketing yang menarik. Kamu bisa menulis dalam berbagai gaya bahasa termasuk bahasa Makassar.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KOLOSAL_API_KEY}`,
        },
      }
    )

    const mainText = response.data.choices[0].message.content.trim()

    // Generate alternatif copywriting (3-5 versi)
    const alternatives = await generateAlternatives(request, 3)

    return {
      mainText,
      alternatives,
    }
  } catch (error: any) {
    console.error('Error calling Kolosal AI:', error.response?.data || error.message)
    throw new Error('Gagal generate copywriting: ' + (error.response?.data?.error?.message || error.message))
  }
}

/**
 * Build prompt berdasarkan input user
 */
function buildPrompt(request: CopywritingRequest): string {
  const { namaProduk, jenisKonten, gayaBahasa, tujuanKonten } = request

  let styleInstruction = ''
  switch (gayaBahasa.toLowerCase()) {
    case 'makassar halus':
      styleInstruction =
        'Gunakan bahasa Makassar yang halus dan sopan, dengan campuran bahasa Indonesia. Contoh: "Enak sekali mi rasanya", "Jangan lupa mampir ki ya".'
      break
    case 'daeng friendly':
      styleInstruction =
        'Gunakan gaya bahasa yang ramah khas Makassar dengan panggilan "Daeng" atau "Puang". Hangat dan akrab seperti berbicara dengan teman. Contoh: "Halo Daeng! Cobai mi menu baru ta".'
      break
    case 'formal':
      styleInstruction =
        'Gunakan bahasa Indonesia formal yang profesional dan sopan, cocok untuk komunikasi bisnis.'
      break
    case 'gen z tiktok':
      styleInstruction =
        'Gunakan bahasa Gen Z yang catchy, singkat, dengan emoji dan istilah viral TikTok. Contoh: "Ga nyobain? Rugi banget sih 😭✨", "POV: kamu lagi cari makanan enak".'
      break
    default:
      styleInstruction = `Gunakan gaya bahasa ${gayaBahasa}.`
  }

  return `
Buatkan ${jenisKonten} untuk produk "${namaProduk}" dengan karakteristik berikut:

Gaya Bahasa: ${styleInstruction}
Tujuan: ${tujuanKonten}

Buatkan copywriting yang:
1. Menarik perhatian dan sesuai dengan tujuan konten
2. Cocok untuk ${jenisKonten}
3. Mencerminkan karakteristik UMKM kuliner Makassar
4. Menggunakan gaya bahasa yang diminta
5. Singkat, padat, dan mengajak action

Langsung berikan hasil copywriting-nya tanpa penjelasan tambahan.
`.trim()
}

/**
 * Generate alternatif copywriting
 */
async function generateAlternatives(
  request: CopywritingRequest,
  count: number = 3
): Promise<string[]> {
  const alternatives: string[] = []

  try {
    const prompt = buildPrompt(request) + '\n\nBerikan variasi copywriting yang berbeda dari sebelumnya.'

    // Generate multiple alternatives dengan satu request
    const response = await axios.post(
      KOLOSAL_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Kamu adalah AI copywriter ahli yang membantu UMKM kuliner di Makassar membuat konten marketing yang menarik. Berikan 3 variasi copywriting yang berbeda.',
          },
          {
            role: 'user',
            content: prompt + `\n\nBerikan ${count} variasi copywriting yang berbeda-beda. Pisahkan setiap variasi dengan "---" (tiga garis).`,
          },
        ],
        temperature: 0.9,
        max_tokens: 800,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KOLOSAL_API_KEY}`,
        },
      }
    )

    const content = response.data.choices[0].message.content.trim()
    
    // Split by separator dan bersihkan
    const variants = content.split('---').map((v: string) => v.trim()).filter((v: string) => v.length > 0)
    
    // Ambil maksimal sesuai count yang diminta
    alternatives.push(...variants.slice(0, count))

    // Jika kurang dari count, generate lebih banyak
    if (alternatives.length < count) {
      for (let i = alternatives.length; i < count; i++) {
        alternatives.push(await generateSingleAlternative(request))
      }
    }

  } catch (error) {
    console.error('Error generating alternatives:', error)
    // Jika gagal, return array kosong atau minimal alternatives
    return []
  }

  return alternatives
}

/**
 * Generate satu alternatif copywriting
 */
async function generateSingleAlternative(request: CopywritingRequest): Promise<string> {
  try {
    const prompt = buildPrompt(request) + '\n\nBerikan variasi yang berbeda dan kreatif.'

    const response = await axios.post(
      KOLOSAL_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah AI copywriter ahli yang membantu UMKM kuliner di Makassar.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KOLOSAL_API_KEY}`,
        },
      }
    )

    return response.data.choices[0].message.content.trim()
  } catch (error) {
    return 'Gagal generate alternatif'
  }
}
