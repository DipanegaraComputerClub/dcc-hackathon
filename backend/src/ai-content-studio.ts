import OpenAI from 'openai'

const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY!
const USE_MOCK = process.env.USE_MOCK_AI === 'true'

const client = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: 'https://api.kolosal.ai/v1'
})

console.log('🎨 AI Content Studio Config:')
console.log('   Model: Llama 4 Maverick')
console.log('   API Key:', KOLOSAL_API_KEY ? '✅ Set' : '❌ Not set')
console.log('   Mock Mode:', USE_MOCK ? '✅ Enabled' : '❌ Disabled')

// ================================
// TYPE DEFINITIONS
// ================================
export type ContentType = 
  | 'caption' 
  | 'promo' 
  | 'branding' 
  | 'planner'
  | 'copywriting'
  | 'pricing'
  | 'reply' 
  | 'comment'

export interface AIContentRequest {
  type: ContentType
  inputText: string
  metadata?: Record<string, any>
}

export interface AIContentResponse {
  type: ContentType
  inputText: string
  outputText: string
  metadata: Record<string, any>
}

// ================================
// MAIN GENERATOR FUNCTION
// ================================
export async function generateAIContent(
  request: AIContentRequest
): Promise<AIContentResponse> {
  if (USE_MOCK) {
    console.log(`🧪 MOCK: Generating ${request.type}...`)
    return generateMockContent(request)
  }

  try {
    const prompt = buildPromptByType(request)
    console.log(`🤖 Generating ${request.type} with Llama 4 Maverick...`)
    
    const completion = await client.chat.completions.create({
      model: 'Llama 4 Maverick',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(request.type),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: getTemperatureByType(request.type),
      max_tokens: 800,
    })
    
    const outputText = completion.choices[0].message.content?.trim() || ''
    console.log(`✅ ${request.type} generated successfully`)
    
    return {
      type: request.type,
      inputText: request.inputText,
      outputText,
      metadata: request.metadata || {},
    }
  } catch (error: any) {
    console.error(`❌ Error generating ${request.type}:`, error.message)
    throw new Error(`Gagal generate ${request.type}: ${error.message}`)
  }
}

// ================================
// SYSTEM PROMPTS
// ================================
function getSystemPrompt(type: ContentType): string {
  const prompts: Record<ContentType, string> = {
    caption: 'Kamu adalah AI copywriter ahli untuk social media. Spesialisasi membuat caption Instagram, Facebook, dan TikTok yang menarik, engaging, dan viral. Kamu memahami tren social media dan bisa menulis dalam bahasa Indonesia casual maupun formal.',
    
    promo: 'Kamu adalah AI marketing specialist yang ahli membuat promo announcement yang persuasif dan menarik. Kamu bisa membuat konsep promo yang FOMO-inducing dan action-driven untuk UMKM kuliner di Makassar.',
    
    branding: 'Kamu adalah AI branding consultant yang membantu UMKM membangun identitas brand yang kuat dan memorable. Kamu ahli dalam slogan, color psychology, brand storytelling, dan brand persona development.',
    
    planner: 'Kamu adalah AI content strategist yang membuat jadwal konten terstruktur dengan tujuan jelas untuk meningkatkan engagement. Kamu memahami best practice posting time, content mix, dan platform algorithms.',
    
    copywriting: 'Kamu adalah AI copywriter ahli yang membantu UMKM kuliner di Makassar membuat konten marketing yang menarik. Kamu bisa menulis dalam berbagai gaya bahasa termasuk bahasa Makassar.',
    
    pricing: 'Kamu adalah AI pricing strategist untuk UMKM kuliner. Kamu bisa menganalisis harga kompetitor, cost structure, dan memberikan rekomendasi pricing yang optimal dengan mempertimbangkan value proposition dan target market.',
    
    reply: 'Kamu adalah AI customer service expert yang membuat balasan profesional, empati, dan solutif untuk berbagai tipe pesan pelanggan. Kamu bisa menyesuaikan tone dari ramah hingga tegas sesuai konteks.',
    
    comment: 'Kamu adalah AI sentiment analyzer yang menganalisis komentar pelanggan, mendeteksi sentimen (positif/negatif/netral), masalah utama, dan memberikan rekomendasi tindakan serta balasan yang tepat.',
  }
  
  return prompts[type]
}

// ================================
// PROMPT BUILDERS
// ================================
function buildPromptByType(request: AIContentRequest): string {
  const { type, inputText, metadata } = request
  
  switch (type) {
    case 'caption':
      return buildCaptionPrompt(inputText, metadata)
    case 'promo':
      return buildPromoPrompt(inputText, metadata)
    case 'branding':
      return buildBrandingPrompt(inputText, metadata)
    case 'planner':
      return buildPlannerPrompt(inputText, metadata)
    case 'copywriting':
      return buildCopywritingPrompt(inputText, metadata)
    case 'pricing':
      return buildPricingPrompt(inputText, metadata)
    case 'reply':
      return buildReplyPrompt(inputText, metadata)
    case 'comment':
      return buildCommentPrompt(inputText, metadata)
    default:
      return inputText
  }
}

function buildCaptionPrompt(inputText: string, metadata?: Record<string, any>): string {
  const topik = metadata?.topik || inputText
  const tone = metadata?.tone || 'Santai'
  const platform = metadata?.platform || 'Instagram'
  const includeHashtags = metadata?.includeHashtags !== false
  
  return `Buatkan caption untuk ${platform} dengan detail:

Topik: ${topik}
Tone: ${tone}
Platform: ${platform}

Buatkan caption yang:
- Menarik perhatian di 3 detik pertama
- Sesuai dengan tone ${tone}
- Optimal untuk algoritma ${platform}
${includeHashtags ? '- Dilengkapi dengan 5-10 hashtag relevan yang bisa viral' : ''}
- Mengajak engagement (like, comment, share)
- Gunakan emoji yang sesuai

Format output:
🔥 CAPTION ${platform.toUpperCase()} SIAP PAKAI 🔥

[Caption lengkap siap post dengan emoji]

${includeHashtags ? '#hashtag1 #hashtag2 #hashtag3 ...' : ''}`
}

function buildPromoPrompt(inputText: string, metadata?: Record<string, any>): string {
  const namaProduk = metadata?.namaProduk || inputText
  const jenisPromo = metadata?.jenisPromo || 'Diskon'
  const targetAudience = metadata?.targetAudience || 'Umum'
  const durasiPromo = metadata?.durasiPromo || '3 hari'
  
  return `Buatkan konsep promo marketing untuk:

Produk: ${namaProduk}
Jenis Promo: ${jenisPromo}
Target Audience: ${targetAudience}
Durasi: ${durasiPromo}

Buatkan konsep promo yang:
- Menarik perhatian target audience
- Menciptakan sense of urgency
- Mudah dipahami dan actionable
- Cocok untuk UMKM di Makassar

Format output:
📢 KONSEP PROMO SIAP POST!

🔥 JUDUL PROMO: [Judul yang eye-catching]

📝 CAPTION:
[Teks promo siap post dengan emoji dan CTA kuat]

⏰ WAKTU TERBAIK POST: [Jam dan hari optimal]

💡 TIPS TAMBAHAN: [Strategi maksimalkan promo]`
}

function buildBrandingPrompt(inputText: string, metadata?: Record<string, any>): string {
  const sloganSekarang = metadata?.sloganSekarang || ''
  const brandPersona = metadata?.brandPersona || inputText
  const toneOfVoice = metadata?.toneOfVoice || 'Makassar Friendly'
  
  return `Bantu analisis dan kembangkan branding untuk UMKM dengan detail:

${sloganSekarang ? `Slogan Sekarang: ${sloganSekarang}` : 'Belum punya slogan'}
Brand Persona: ${brandPersona}
Tone of Voice: ${toneOfVoice}

Buatkan rekomendasi branding yang meliputi:

Format output:
🎨 HASIL ANALISA BRANDING:

✨ SLOGAN UNIK:
[3 pilihan slogan yang memorable dan sesuai persona]

🎨 REKOMENDASI WARNA:
[3 warna dengan kode hex dan psikologi warnanya]

📖 STORYTELLING BRAND:
[Cerita brand yang emotional dan relatable untuk Makassar]

👤 KARAKTER BRAND PERSONA:
[Deskripsi karakter brand yang konsisten]`
}

function buildPlannerPrompt(inputText: string, metadata?: Record<string, any>): string {
  const temaMingguan = metadata?.temaMingguan || inputText
  const durasi = metadata?.durasi || '7'
  
  return `Buatkan content planner untuk social media dengan:

Tema: ${temaMingguan}
Durasi: ${durasi} hari

Buatkan jadwal konten yang:
- Seimbang antara konten edukasi, hiburan, dan promosi (80:20 ratio)
- Berdasarkan best practice posting time untuk audience Makassar
- Mencakup berbagai format (foto, video, story, carousel, reels)
- Mengikuti prinsip content marketing yang efektif

Format output:
📅 JADWAL KONTEN (${durasi} HARI)
Tema: ${temaMingguan}

[Untuk setiap hari, tulis:]
✅ Hari [X] ([Format Konten]): [Judul/Ide konten singkat]
   ⏰ Waktu posting terbaik: [Jam WITA]
   🎯 Tujuan: [Engagement/Edukasi/Selling]

💡 TIPS EKSEKUSI:
[Strategi tambahan untuk memaksimalkan engagement]`
}

function buildCopywritingPrompt(inputText: string, metadata?: Record<string, any>): string {
  const namaProduk = metadata?.namaProduk || inputText
  const jenisKonten = metadata?.jenisKonten || 'Caption'
  const tujuanKonten = metadata?.tujuanKonten || 'Jualan'
  const gayaBahasa = metadata?.gayaBahasa || 'Makassar Halus'
  
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

Buatkan copywriting yang:
- Menarik dan sesuai gaya
- Cocok untuk ${jenisKonten}
- Singkat, padat, dan mengajak action
- Sesuai dengan tujuan ${tujuanKonten}

Format output:
📝 COPYWRITING (Tujuan: ${tujuanKonten})

[Copywriting lengkap siap pakai dengan emoji yang sesuai]

✨ ALTERNATIF:
[Berikan 2 variasi berbeda dengan gaya yang sama]`
}

function buildPricingPrompt(inputText: string, metadata?: Record<string, any>): string {
  const namaProduk = metadata?.namaProduk || inputText
  const modalHPP = metadata?.modalHPP || 0
  const targetUntung = metadata?.targetUntung || 30
  const hargaKompetitor = metadata?.hargaKompetitor || 0
  
  const kompetitorInfo = hargaKompetitor > 0
    ? `Harga Kompetitor: Rp ${hargaKompetitor.toLocaleString('id-ID')}`
    : 'Tidak ada data kompetitor'

  return `Analisis pricing untuk produk UMKM:

Produk: ${namaProduk}
Modal (HPP): Rp ${modalHPP.toLocaleString('id-ID')}
Target Keuntungan: ${targetUntung}%
${kompetitorInfo}

Berikan analisis pricing yang mencakup:

Format output:
📊 ANALISIS HARGA:

💰 Modal (HPP): Rp ${modalHPP.toLocaleString('id-ID')}
📈 Rekomendasi Harga Jual: [Range harga min-max]
✅ Margin Keuntungan: [Persentase aktual]

${hargaKompetitor > 0 ? '🔍 PERBANDINGAN KOMPETITOR:\n[Analisis posisi harga vs kompetitor]\n' : ''}
💡 STRATEGI PRICING:
[Tips dan rekomendasi strategi harga untuk maksimalkan profit]

⚠️ CATATAN:
[Hal yang perlu diperhatikan dalam penentuan harga]`
}

function buildReplyPrompt(inputText: string, metadata?: Record<string, any>): string {
  const pesanPelanggan = metadata?.pesanPelanggan || inputText
  const nadaBalasan = metadata?.nadaBalasan || 'Ramah & Membantu'
  
  return `Buatkan balasan customer service untuk pesan pelanggan berikut:

PESAN PELANGGAN:
"${pesanPelanggan}"

NADA BALASAN: ${nadaBalasan}

Buatkan balasan yang:
- Sesuai dengan nada "${nadaBalasan}"
- Empati dan solutif
- Profesional namun tetap friendly
- Mengandung action/solusi konkret
- Mempertahankan customer relationship

Format output:
💬 REKOMENDASI BALASAN:

[Balasan lengkap siap kirim dengan emoji yang sesuai]

💡 ANALISIS SITUASI:
[Penjelasan singkat situasi dan mengapa balasan ini efektif]`
}

function buildCommentPrompt(inputText: string, metadata?: Record<string, any>): string {
  const komentarPelanggan = metadata?.komentarPelanggan || inputText
  
  return `Analisis komentar pelanggan berikut:

KOMENTAR:
"${komentarPelanggan}"

Lakukan analisis menyeluruh:

Format output:
🔍 ANALISA KOMENTAR:

📊 SENTIMEN: [POSITIF 🟢 / NETRAL 🟡 / NEGATIF 🔴]

${komentarPelanggan.length > 50 ? '📝 RINGKASAN:\n[Ringkasan singkat isi komentar]\n' : ''}
⚠️ MASALAH UTAMA:
[Identifikasi masalah/concern utama jika ada, atau tulis "Tidak ada masalah" jika positif]

😊 POIN POSITIF:
[Hal baik yang disebutkan jika ada, atau tulis "-" jika tidak ada]

💡 REKOMENDASI TINDAKAN:
[Action konkret yang perlu dilakukan]

💬 AUTO-REPLY SUGGESTION:
[Balasan yang tepat untuk komentar ini dengan tone yang sesuai]`
}

// ================================
// TEMPERATURE SETTINGS
// ================================
function getTemperatureByType(type: ContentType): number {
  const temperatures: Record<ContentType, number> = {
    caption: 0.8,       // Creative & engaging
    promo: 0.7,         // Creative tapi tetap clear
    branding: 0.6,      // Balanced, strategic
    planner: 0.5,       // Structured but creative
    copywriting: 0.8,   // Creative dengan gaya bahasa
    pricing: 0.4,       // Data-driven, analytical
    reply: 0.5,         // Helpful dan empati
    comment: 0.3,       // Factual dan consistent
  }
  
  return temperatures[type]
}

// ================================
// MOCK GENERATOR
// ================================
function generateMockContent(request: AIContentRequest): AIContentResponse {
  const { type, inputText, metadata } = request
  
  const mockOutputs: Record<ContentType, string> = {
    caption: `🔥 CAPTION INSTAGRAM SIAP PAKAI 🔥

Halo Daeng! 👋 Sudah coba menu baru kami? Rasanya bikin nagih! 🤤
Cocok banget buat makan siang bareng teman kantor.

📍 Lokasi: Jl. Pettarani No. 10
🛵 Tersedia di GrabFood & GoFood

Yuk buruan mampir sebelum kehabisan! 

#KulinerMakassar #MakassarDagang #Ewako #CotoMakassar #JajananMakassar`,

    promo: `📢 KONSEP PROMO SIAP POST!

🔥 JUDUL PROMO: GAJIAN TIBA? WAKTUNYA MAKAN ENAK TANPA PUSING!

📝 CAPTION:
Habis gajian jangan langsung habis cika'! 😂
Mending ke sini, makan kenyang hati senang.

Khusus buat Pegawai Kantor & Mahasiswa, tunjukkan ID Card kalian dan dapatkan DISKON 20% untuk semua menu Paket!

Buruan nah, cuma berlaku 3 hari! 🏃💨

⏰ WAKTU TERBAIK POST: Pukul 11:30 WITA (sebelum jam makan siang)

💡 TIPS TAMBAHAN: 
- Posting di story IG jam 8 pagi untuk reminder
- Share di grup WA kantor/kampus
- Buat countdown timer untuk urgency`,

    branding: `🎨 HASIL ANALISA BRANDING:

✨ SLOGAN UNIK:
1. "Rasa Sultan, Harga Teman - Ewako!"
2. "Dari Hati Makassar, Untuk Perut Indonesia"
3. "Authentik. Enak. Terjangkau."

🎨 REKOMENDASI WARNA:
- Merah Marun (#800000) → Berani, nafsu makan, tradisional
- Kuning Emas (#FFD700) → Mewah tapi ceria, optimis
- Hitam (#000000) → Elegan, premium, modern

📖 STORYTELLING BRAND:
"Berawal dari resep rahasia Nenek di lorong sempit Makassar tahun 1990, kami membawa cita rasa otentik yang tidak pernah berubah. Setiap suapan adalah perjalanan ke masa lalu, ke kehangatan keluarga Makassar."

👤 KARAKTER BRAND PERSONA:
"Si Daeng yang Ramah, Humoris, tapi Sangat Menghargai Tradisi. Bicara santai tapi tahu sopan santun. Seperti tetangga yang selalu siap berbagi cerita sambil makan bersama."`,

    planner: `📅 JADWAL KONTEN (7 HARI)
Tema: Kuliner Makassar

✅ Hari 1 (Video Reel): 'Behind The Scene' proses pembuatan bumbu rahasia
   ⏰ Waktu posting: 18:00 WITA
   🎯 Tujuan: Edukasi & Trust Building

✅ Hari 2 (Carousel): Repost testimoni pelanggan yang paling lucu
   ⏰ Waktu posting: 12:00 WITA
   🎯 Tujuan: Social Proof

✅ Hari 3 (Story + Post): Tebak-tebakan bahasa Makassar berhadiah voucher
   ⏰ Waktu posting: 15:00 WITA
   🎯 Tujuan: Engagement

✅ Hari 4 (Foto HD): Produk close-up yang bikin ngiler
   ⏰ Waktu posting: 11:00 WITA
   🎯 Tujuan: Soft Selling

✅ Hari 5 (Story + Post): Promo 'Jumat Berkah' diskon khusus
   ⏰ Waktu posting: 08:00 WITA
   🎯 Tujuan: Hard Selling

✅ Hari 6 (Carousel Edukasi): Tips makan Coto biar makin enak ala Daeng
   ⏰ Waktu posting: 16:00 WITA
   🎯 Tujuan: Value Content

✅ Hari 7 (Quote Card): Motivasi usaha anak muda Makassar
   ⏰ Waktu posting: 09:00 WITA
   🎯 Tujuan: Inspirasi & Community

💡 TIPS EKSEKUSI:
- Gunakan Reels untuk konten edukatif (algoritma prioritas)
- Selalu reply komentar dalam 1 jam pertama
- Cross-posting ke TikTok & Facebook untuk jangkauan lebih luas`,

    copywriting: `📝 COPYWRITING (Tujuan: Jualan)

POV: Kamu nemu produk lokal yang kualitasnya impor! 😱✨

Sumpah ini barang mantap sekali cika'. ${metadata?.namaProduk || inputText} ini solusinya buat kamu yang mau tampil beda.

Keunggulannya:
✅ Kualitas Premium
✅ Harga Terjangkau
✅ Asli Anak Makassar

Order sekarang sebelum kehabisan stok! Klik link di bio nah. 👇

✨ ALTERNATIF:

VARIASI 1:
Eh Daeng! Tau nda' kalo ${metadata?.namaProduk || inputText} kita ini sudah jadi favorit pelanggan setia? 🔥

Rahasianya? Simple ji:
- Bahan berkualitas
- Harga bersahabat
- Pelayanan cepat

Yuk cobai sebelum terlambat! DM aja langsung 📱

VARIASI 2:
Breaking News! 📢

${metadata?.namaProduk || inputText} yang viral di TikTok sekarang bisa dibeli di Makassar! 

Limited stock, siapa cepat dia dapat!
Grab yours NOW! 🏃‍♂️💨

#MakassarLokalPride`,

    pricing: `📊 ANALISIS HARGA:

💰 Modal (HPP): Rp ${metadata?.modalHPP?.toLocaleString('id-ID') || '15.000'}
📈 Rekomendasi Harga Jual: Rp 25.000 - Rp 28.000
✅ Margin Keuntungan: 40% - 46%

💡 STRATEGI PRICING:
1. **Harga Psikologis**: Gunakan Rp 24.999 atau Rp 27.999 (terlihat lebih murah)
2. **Tier Pricing**: 
   - Regular: Rp 25.000
   - Jumbo: Rp 35.000 (margin lebih besar)
3. **Bundle Deal**: Beli 3 hanya Rp 70.000 (dari Rp 75.000)

⚠️ CATATAN:
- Harga ini sudah kompetitif untuk market Makassar
- Pastikan packaging mendukung perceived value
- Monitor biaya operasional (listrik, gas, gaji) setiap bulan
- Evaluasi harga setiap 3 bulan mengikuti inflasi bahan baku`,

    reply: `💬 REKOMENDASI BALASAN:

"Halo Kak, terima kasih sudah menghubungi kami! 🙏

Mohon maaf atas ketidaknyamanannya. Boleh kami tahu detail masalahnya atau nomor pesanan Kakak supaya kami bantu cek statusnya segera? 

Kami pastikan masalah ini akan ditangani dengan cepat. Terima kasih atas kesabarannya ya Kak 😊

Salam hangat,
Tim [Nama Bisnis]"

💡 ANALISIS SITUASI:
Pesan ini efektif karena:
- Menunjukkan empati langsung
- Menawarkan solusi konkret (cek nomor pesanan)
- Menggunakan bahasa yang ramah namun profesional
- Menutup dengan harapan positif
- Mencantumkan signature untuk personal touch`,

    comment: `🔍 ANALISA KOMENTAR:

📊 SENTIMEN: NEGATIF 🔴

⚠️ MASALAH UTAMA: 
- Pelayanan lambat (respon customer service)
- Pesanan salah/tidak sesuai ekspektasi
- Kemungkinan kecewa dengan kualitas vs harga

💡 REKOMENDASI TINDAKAN:
1. **SEGERA** reply komentar secara personal (jangan generic)
2. **Minta maaf** dengan tulus dan akui kesalahan
3. **Tawarkan kompensasi** (voucher/diskon/refund)
4. **Follow up via DM** untuk privasi
5. **Internal review** proses yang bermasalah

💬 AUTO-REPLY SUGGESTION:
"Tabe' Kak, mohon maaf sekali atas ketidaknyamanannya 🙏 

Ini bukan standar pelayanan kami dan kami sangat menyesal. Boleh kami DM untuk ganti rugi dan pastikan hal ini tidak terulang lagi? 

Terima kasih masukannya, ini sangat membantu kami berkembang.

Hormat kami,
[Nama Bisnis]"

⚡ URGENCY LEVEL: TINGGI - Handle dalam 1 jam!`,
  }
  
  return {
    type,
    inputText,
    outputText: mockOutputs[type],
    metadata: metadata || {},
  }
}
