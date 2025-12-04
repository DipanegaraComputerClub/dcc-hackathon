import OpenAI from 'openai'

const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY!
const USE_MOCK = process.env.USE_MOCK_AI === 'true'

const client = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: 'https://api.kolosal.ai/v1'
})

if (!KOLOSAL_API_KEY || KOLOSAL_API_KEY === 'your_kolosal_api_key_here') {
  console.error('⚠️  KOLOSAL_API_KEY tidak diset!')
}

console.log('🔧 Kolosal AI Config:')
console.log('   Model: Claude Sonnet 4.5')
console.log('   API Key:', KOLOSAL_API_KEY ? '✅ Set' : '❌ Not set')
console.log('   Mock Mode:', USE_MOCK ? '✅ Enabled' : '❌ Disabled')

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

export async function generateCopywriting(
  request: CopywritingRequest
): Promise<CopywritingResponse> {
  if (USE_MOCK) {
    console.log('🧪 Using MOCK mode - generating dynamic copywriting...')
    return generateDynamicMockCopywriting(request)
  }

  try {
    const prompt = buildPrompt(request)
    console.log('🤖 Generating with Claude Sonnet 4.5...')
    
    const completion = await client.chat.completions.create({
      model: 'Claude Sonnet 4.5',
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah AI copywriter ahli yang membantu UMKM kuliner di Makassar membuat konten marketing yang menarik. Kamu bisa menulis dalam berbagai gaya bahasa termasuk bahasa Makassar.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })
    
    console.log('✅ AI response received')
    const mainText = completion.choices[0].message.content?.trim() || ''
    const alternatives = await generateAlternatives(request, 3)

    return { mainText, alternatives }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw new Error(error.message || 'Gagal generate copywriting')
  }
}

function buildPrompt(request: CopywritingRequest): string {
  const { namaProduk, jenisKonten, gayaBahasa, tujuanKonten } = request

  let styleInstruction = ''
  switch (gayaBahasa.toLowerCase()) {
    case 'makassar halus':
      styleInstruction = 'Gunakan bahasa Makassar yang halus dan sopan dengan campuran Indonesia. Contoh: "Enak sekali mi", "Jangan lupa mampir ki ya".'
      break
    case 'daeng friendly':
      styleInstruction = 'Gunakan gaya ramah khas Makassar dengan panggilan "Daeng". Hangat dan akrab. Contoh: "Halo Daeng! Cobai mi menu baru ta".'
      break
    case 'formal':
      styleInstruction = 'Gunakan bahasa Indonesia formal yang profesional dan sopan.'
      break
    case 'gen z tiktok':
      styleInstruction = 'Gunakan bahasa Gen Z yang catchy dengan emoji dan istilah viral TikTok. Contoh: "Ga nyobain? Rugi banget sih 😭✨".'
      break
    default:
      styleInstruction = `Gunakan gaya bahasa ${gayaBahasa}.`
  }

  return `Buatkan ${jenisKonten} untuk produk "${namaProduk}":

Gaya: ${styleInstruction}
Tujuan: ${tujuanKonten}

Buatkan copywriting yang menarik, sesuai gaya, cocok untuk ${jenisKonten}, singkat dan mengajak action.`
}

async function generateAlternatives(request: CopywritingRequest, count: number = 3): Promise<string[]> {
  try {
    const prompt = buildPrompt(request) + `\n\nBerikan ${count} variasi berbeda. Pisahkan dengan "---".`
    
    const completion = await client.chat.completions.create({
      model: 'Claude Sonnet 4.5',
      messages: [
        { role: 'system', content: 'Kamu AI copywriter Makassar. Berikan variasi berbeda.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 800,
    })

    const content = completion.choices[0].message.content?.trim() || ''
    return content.split('---').map(v => v.trim()).filter(v => v.length > 0).slice(0, count)
  } catch (error) {
    return []
  }
}

function generateDynamicMockCopywriting(request: CopywritingRequest): CopywritingResponse {
  const { namaProduk, jenisKonten, gayaBahasa } = request
  const templates = getMockTemplates(gayaBahasa, jenisKonten)
  
  const mainTemplate = templates.main[Math.floor(Math.random() * templates.main.length)]
  const mainText = mainTemplate.replace(/{produk}/g, namaProduk)
  
  const alternatives = templates.alternatives.map(t => t.replace(/{produk}/g, namaProduk))
  
  console.log('✅ Dynamic mock generated:', namaProduk, '-', gayaBahasa)
  return { mainText, alternatives }
}

function getMockTemplates(gayaBahasa: string, jenisKonten: string) {
  const style = gayaBahasa.toLowerCase()
  const type = jenisKonten.toLowerCase()
  
  // MAKASSAR HALUS
  if (style.includes('makassar')) {
    if (type === 'caption' || type === 'post') {
      return {
        main: [
          `Assalamualaikum Saudaraku! 🙏\n\nEnak sekali mi {produk} kami ini! Rasanya istimewa, bikin nagih terus ji. Dibuat dengan resep turun-temurun dan bahan pilihan.\n\nJangan lupa mampir ki ya! 😊\n\n📍 Lokasi mudah ditemukan kok\n☎️ 0821-xxxx-xxxx\n\n#{produk}Makassar #KulinerMakassar`,
          `Salam sejahtera Saudaraku! ✨\n\n{produk} kita sudah buka mi hari ini! Segar, enak, dan porsinya melimpah. Harga terjangkau, rasa tak terlupakan!\n\nMari singgah ki, banyak promo menarik! 🎉\n\n#{produk}Enak #MakassarBanget`,
          `Selamat pagi Saudaraku! 🌅\n\nSudah coba belum {produk} istimewa kami? Bumbu meresap sempurna, tekstur mantap, bikin kenyang dan puas!\n\nBuruan sebelum kehabisan ya! 🏃‍♂️\n\n#{produk}Makassar #Recommend`,
        ],
        alternatives: [
          `Hai Saudaraku! 👋\n\n{produk} kita luar biasa. Setiap gigitan penuh kelezatan!\n\nDicoba mi, tidak mengecewakan! ⭐\n\n#{produk} #Yummy`,
          `Bismillah! 🕌\n\n{produk} kami dibuat dengan penuh cinta. Higienis, halal, dan enak parah!\n\nTunggu kedatangan mu ya! 🤗\n\n#{produk}Halal`,
          `Kabar gembira! 🎊\n\n{produk} terlaris kami masih tersedia! Rasa original khas Makassar. Ga pake MSG!\n\nPesan sekarang ji! 📱\n\n#{produk}Asli`,
        ]
      }
    } else if (type === 'story') {
      return {
        main: [
          `*Swipe up untuk lokasi*\n\n{produk} kita lagi ramai nih! 😍\n\nBanyak yang bilang enak sekali mi!\n\nMampir ki ya! ⏰`,
          `Pagi-pagi sudah antre mi! 🌅\n\n{produk} fresh hari ini!\nPorsi jumbo ✓\nHarga OK ✓\nRasa juara ✓\n\nYuk buruan! 🏃‍♀️`,
        ],
        alternatives: [
          `UPDATE: Tinggal 10 porsi! ⚠️\n\n{produk} hari ini hampir habis mi!\n\nSiapa cepat dia dapat 🏃‍♂️`,
          `PROMO HARI INI! 🎉\n\nBeli 2 {produk} dapat 1 gratis minuman!\n\nSampai jam 12 siang ya! ⏰`,
        ]
      }
    }
  }
  
  // DAENG FRIENDLY
  else if (style.includes('daeng')) {
    if (type === 'caption' || type === 'post') {
      return {
        main: [
          `Halo Daeng-daeng! 👋\n\nAda kabar gembira! {produk} kesukaan Daeng sudah ready loh! Enak parah, bikin nagih terus! 🤤\n\nYuk mampir Daeng! Kita tunggu! 🏠\n\n#{produk}DaengKu #MakassarFoodies`,
          `Daengg, udah cobain belum {produk} terbaru ta? 🆕\n\nRasanya juara, harganya bersahabat sama kantong Daeng! 💸\n\nLangsung meluncur aja Daeng! 🪑\n\n#{produk}Mantap`,
        ],
        alternatives: [
          `Good morning Daeng! ☀️\n\n{produk} pagi-pagi hangat nih! Cocok ditemani kopi Daeng! ☕\n\nAyo Daeng! 😁\n\n#{produk}Pagi`,
          `Daeng kesayangan 💖\n\n{produk} nya masih anget-anget nih!\n\nDitunggu ya! 🤗\n\n#{produk}LunchTime`,
        ]
      }
    }
  }
  
  // GEN Z TIKTOK
  else if (style.includes('gen z') || style.includes('tiktok')) {
    if (type === 'caption' || type === 'post' || type === 'reel' || type === 'short') {
      return {
        main: [
          `POV: Kamu lagi scrolling sambil laper parah 🥺😭\n\n{produk} HITS BANGET SIH!! Ini tuh BUSSIN fr fr! 🔥✨\n\nHarga? AFFORDABLE banget! No debat! 💅\n\nYg belum nyobain, are we even friends? 🤨\n\nTag temen! 👇\n#{produk} #FYP #ViralTikTok`,
          `⚠️ WARNING: Jangan scroll kalau lagi diet! ⚠️\n\n{produk} = COMFORT FOOD tingkat DEWA! 🤩🙏\n\nYang belum cobain, kalian ketinggalan ZAMAN! 😤\n\nDouble tap! ❤️\n#{produk} #Viral`,
        ],
        alternatives: [
          `Alexa, cariin {produk} terdekat! 🤖💚\n\nBro sis, ini LEGEND! Ga nyobain? RUGI SEUMUR HIDUP! 😭\n\n#{produk}Legend`,
          `Not me eating {produk} at 3AM 🕐🙃\n\nIt's giving main character vibes ✨💅\n\nComment "NEED"! 📝\n\n#{produk}Mood`,
        ]
      }
    }
  }
  
  // FORMAL (DEFAULT)
  return {
    main: [
      `{produk} - Cita Rasa Autentik\n\nKami mempersembahkan {produk} berkualitas premium dengan resep tradisional. Bahan pilihan terbaik dan standar kebersihan ketat.\n\nReservasi: 0821-xxxx-xxxx\n\n#{produk} #KulinerIndonesia`,
      `Selamat datang di {produk}\n\nKeaslian cita rasa dengan sentuhan modern. Pelayanan profesional.\n\nKunjungi kami atau pesan delivery.\n\n#{produk} #Kualitas`,
    ],
    alternatives: [
      `{produk} - Pilihan Tepat\n\nMenu variatif, harga kompetitif.\n\nFasilitas:\n✓ AC ✓ WiFi ✓ Parkir\n\nWA 0821-xxxx-xxxx\n\n#{produk}`,
      `Promo {produk}\n\nPaket hemat tersedia. Harga terjangkau tanpa mengurangi kualitas.\n\nPesan: 0821-xxxx-xxxx\n\n#{produk}Promo`,
    ]
  }
}
