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
          `Hai Saudaraku! 👋\n\n{produk} kita luar biasa. Setiap gigitan penuh kelezatan, setiap suapan bikin bahagia!\n\nDicoba mi, tidak mengecewakan! ⭐⭐⭐⭐⭐\n\n#{produk} #Yummy #Makassar`,
          
          `Bismillah! 🕌\n\n{produk} kami dibuat dengan penuh cinta dan kehati-hatian. Higienis, halal, dan tentunya enak parah!\n\nTunggu kedatangan mu ya Saudaraku! 🤗\n\n#{produk}Halal #BersihSehat`,
          
          `Kabar gembira Saudaraku! 🎊\n\n{produk} terlaris kami hari ini masih tersedia! Rasa original khas Makassar yang autentik. Ga pake MSG, semua natural!\n\nPesan sekarang ji sebelum kehabisan! 📱\n\n#{produk}Asli #Natural`,
          
          `Siang-siang begini cocok sekali mi makan {produk}! 🍲\n\nHangat, gurih, bikin kenyang. Sempurna untuk makan siang bersama keluarga!\n\nYuk mampir, tempat nya nyaman kok! 🏠\n\n#{produk}LunchTime #KeluargaBahagia`,
          
          `Mau berbagi cerita nih Saudaraku! 💬\n\n{produk} kami sudah dipercaya pelanggan selama bertahun-tahun. Resep rahasia yang tak pernah berubah!\n\nSilakan dicoba, pasti jatuh cinta! 😍\n\n#{produk}Legendary #RahasisKeluarga`,
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
          `Good morning Daeng! ☀️\n\n{produk} pagi-pagi hangat nih! Cocok banget ditemani kopi atau teh favoritDaeng! ☕\n\nAyo Daeng, jangan malas-malas! Sudah buka dari jam 7 pagi loh! 😁\n\n#{produk}Pagi #SarapanDaeng`,
          
          `Daeng kesayangan 💖\n\n{produk} nya masih anget-anget nih! Baru keluar dari oven! 🔥\n\nDitunggu kedatangannya ya Daeng! Ada promo spesial hari ini! 🎉\n\n#{produk}LunchTime #PromoSpesial`,
          
          `Psssttt Daeng... 🤫\n\nMau tahu rahasia {produk} kita yang enak banget? Rahasianya adalah CINTA dan KESABARAN dalam setiap proses!\n\nDM aja ya Daeng kalau mau order! 📱\n\n#{produk}Rahasia #MadeWithLove`,
          
          `Breaking news Daeng! 📢\n\n{produk} lagi promo buy 2 get 1 hari ini aja! Limited time offer Daeng!\n\nBuruan sebelum nyesel! Tag teman Daeng sekarang! 👥\n\n#{produk}Promo #BOGOF`,
          
          `Daengg, sudah makan siang belum? 🤔\n\nKalau belum, yuk ke tempat kita! {produk} nya lezat banget, porsinya juga banyak loh!\n\nAda tempat duduk nyaman, WiFi gratis pula! 🪑📶\n\n#{produk}NyamanBanget #DaengFriendly`,
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
          `Tell me you're from Makassar without telling me you're from Makassar 🗺️😎\n\nMe: *shows {produk}* 🤤✨\n\nThis is THE moment! Share ke story kamu! 📱\n\n#{produk} #MakassarVibes #Foodies`,
          `No cuz why is {produk} so GOOD?! 😩💯\n\nLiterally the best thing I've ever tasted! NO CAP! 🧢🙅‍♂️\n\nGo viral bestie! 🚀\n\n#{produk}Obsessed #MakassarFood #Foodgasm`,
        ],
        alternatives: [
          `Alexa, cariin {produk} terdekat! 🤖💚\n\nBro sis, ini LEGEND! Ga nyobain? RUGI SEUMUR HIDUP! 😭\n\n#{produk}Legend`,
          `Not me eating {produk} at 3AM 🕐🙃\n\nIt's giving main character vibes ✨💅\n\nComment "NEED"! 📝\n\n#{produk}Mood`,
          `Understanding the assignment ✅\n\n{produk}? CHECKED! SLAYED! DEVOURED! 👑🔥\n\nSave this post NOW! 🔖\n\n#{produk}Goals #Slay`,
          `The way I GASPED when I tried {produk}! 😲🤯\n\nIt's giving everything! Everything! 💅✨\n\nWho's with me?? 🙋‍♀️🙋‍♂️\n\n#{produk}Moment #Stunner`,
          `This is your sign to try {produk} 🪧⭐\n\nSeriously, I'm obsessed! It's chef's kiss 👨‍🍳💋\n\nTag someone who needs this! 💬👇\n\n#{produk}Divine #FoodieLife #MustTry`,
        ]
      }
    }
  }
  
  // FORMAL (DEFAULT)
  return {
    main: [
      `{produk} - Cita Rasa Autentik untuk Anda\n\nKami dengan bangga mempersembahkan {produk} berkualitas premium yang diolah dengan resep tradisional turun-temurun. Setiap sajian menggunakan bahan pilihan terbaik dan melalui standar kebersihan yang ketat.\n\nNikmati pengalaman kuliner yang memorable bersama keluarga dan rekan bisnis Anda.\n\nReservasi: 0821-xxxx-xxxx\nAlamat: Makassar, Sulawesi Selatan\n\n#{produk} #KulinerIndonesia #HalalFood`,
      
      `Selamat Datang di {produk}\n\nMenghadirkan keaslian cita rasa kuliner Nusantara dengan sentuhan modern. Kami berkomitmen untuk menyajikan hidangan berkualitas tinggi dengan pelayanan yang profesional dan ramah.\n\nKunjungi outlet kami atau pesan melalui layanan delivery yang tersedia.\n\nFollow Instagram: @{produk}official\nTelepon: 0821-xxxx-xxxx\n\n#{produk} #KualitasTerjamin #PelayananProfesional`,
      
      `{produk} - Warisan Kuliner yang Terpercaya\n\nTelah melayani ribuan pelanggan dengan tingkat kepuasan maksimal. Setiap hidangan dibuat fresh daily dengan standar food safety internasional.\n\nTersedia paket untuk berbagai kebutuhan acara Anda.\n\nOperasional: 08.00 - 21.00 WITA\nHubungi: 0821-xxxx-xxxx\n\n#{produk}Makassar #Terpercaya #SejaktahunLalu`,
      
      `Nikmati Kelezatan {produk} Premium\n\nDiproduksi dengan teknologi modern namun tetap mempertahankan cita rasa tradisional yang autentik. Bahan baku dipilih langsung dari supplier terpercaya.\n\nDapatkan diskon 10% untuk pemesanan pertama!\n\nInfo & Pemesanan:\nWhatsApp: 0821-xxxx-xxxx\nDelivery Area: Seluruh Makassar\n\n#{produk}Premium #Diskon #DeliveryAvailable`,
    ],
    alternatives: [
      `{produk} - Pilihan Tepat untuk Setiap Momen\n\nMenu variatif dengan cita rasa yang konsisten. Harga kompetitif tanpa mengurangi kualitas.\n\nFasilitas:\n✓ Ruang ber-AC\n✓ WiFi gratis\n✓ Parkir luas\n✓ Musholla\n\nInformasi lengkap: WA 0821-xxxx-xxxx\n\n#{produk}Recommended #FasilitasLengkap`,
      
      `Promo Special {produk}\n\nDapatkan paket hemat untuk keluarga dengan harga yang sangat terjangkau. Kualitas tetap terjaga, rasa tetap istimewa!\n\nPaket tersedia:\n• Paket Keluarga (4-6 orang)\n• Paket Meeting (10 orang)\n• Paket Acara (custom)\n\nPesan sekarang: 0821-xxxx-xxxx\n\n#{produk}Promo #PaketHemat`,
      
      `{produk} Terpercaya Sejak 1990\n\nPengalaman lebih dari 30 tahun melayani masyarakat Makassar. Kualitas konsisten, pelayanan memuaskan.\n\nTestimoni pelanggan:\n"Rasa yang tak pernah berubah!" ⭐⭐⭐⭐⭐\n"Tempat favorit keluarga" ⭐⭐⭐⭐⭐\n\nKontak: 0821-xxxx-xxxx\n\n#{produk}LegendaryTaste #PelangganSetia`,
      
      `Mencari Tempat Makan Berkualitas?\n\n{produk} adalah solusi tepat untuk Anda. Kami menyediakan berbagai pilihan menu dengan standar hygiene tinggi.\n\nLayanan:\n✓ Dine-in\n✓ Take away\n✓ Delivery\n✓ Catering untuk acara\n\nReservasi & Info: 0821-xxxx-xxxx\n\n#{produk}Service #MultiLayanan`,
      
      `{produk} - Experience the Difference\n\nPerpaduan sempurna antara tradisi dan inovasi. Setiap hidangan diciptakan untuk memberikan pengalaman kuliner yang tak terlupakan.\n\nBuka setiap hari pukul 08.00 - 22.00 WITA\n\nKunjungi kami di:\nJl. [Alamat], Makassar\nTelp: 0821-xxxx-xxxx\n\n#{produk}Experience #Innovation`,
    ]
  }
}
