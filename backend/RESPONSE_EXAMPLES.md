# Contoh Response API

## 1. Generate Copywriting - Makassar Halus Style

**Request:**
```json
POST /api/copywriting
{
  "namaProduk": "Coto Makassar Daeng Tata",
  "jenisKonten": "Caption",
  "gayaBahasa": "Makassar Halus",
  "tujuanKonten": "Brand awareness dan mengajak orang untuk datang"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mainText": "Assalamualaikum, Saudara-saudara! 🙏\n\nEnak sekali mi Coto Makassar Daeng Tata ini! Kuahnya gurih berempah, dagingnya empuk teramat, dan sambalnya pedas manis pas di lidah. Sungguh nikmat ji rasanya! 😋\n\nBuka setiap hari mulai pukul 08.00 WITA sampai habis. Jangan lupa mampir ki ya, Saudaraku! Lokasi nya mudah ditemukan kok.\n\n📍 Jl. Sultan Alauddin No. 123, Makassar\n☎️ 0821-xxxx-xxxx\n\n#CotoMakassar #DaengTata #KulinerMakassar #MakananKhas #HalalFood",
    "alternatives": [
      "Selamat pagi mi, Daeng! ☀️\n\nSudah coba belum Coto Makassar Daeng Tata? Kuahnya kental gurih, isinya melimpah - daging, jeroan, dan ketupat. Cocok sekali untuk sarapan atau makan siang ji!\n\nHarga terjangkau, rasa istimewa. Mari singgah ki! 🍲\n\n#CotoMakassar #KulinerLokal #MakananTradisional",
      
      "Bismillah! 🕌\n\nCoto Makassar Daeng Tata, resep turun temurun yang autentik. Bumbu rempah pilihan, daging segar setiap hari. Dijamin enak mi, tidak mengecewakan!\n\nAyo datang dengan keluarga, banyak porsi besar untuk berbagi bersama. Tunggu apalagi? 😊\n\n#CotoAsli #MakassarBanget #KulinerNusantara",
      
      "Siang-siang begini, cocok sekali mi makan Coto Makassar yang hangat! 🥘\n\nDaeng Tata punya resep istimewa: kuah tak terlalu kental, bumbu meresap sempurna, dan tambahan jeruk nipis segar. Mantap ji!\n\nBuka sampai sore, buruan sebelum kehabisan! Wassalam! 🙏\n\n#CotoHangat #SegarNikmat #MakassarCulinary"
    ]
  },
  "historyId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 2. Generate Copywriting - Gen Z TikTok Style

**Request:**
```json
POST /api/copywriting
{
  "namaProduk": "Es Pallu Butung",
  "jenisKonten": "Reel",
  "gayaBahasa": "Gen Z TikTok",
  "tujuanKonten": "Viral di TikTok dan meningkatkan engagement"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mainText": "POV: Kamu lagi scrolling sambil kehausan 🥤😭\n\nEs Pallu Butung HITS BANGET SIH!! 🔥✨\n\nGa percaya? Cobain deh! Pisang ijo + es serut + sirup merah = CHEF'S KISS 😘👌\n\nHarga 15K doang, rasa SULTAN! No debat! 💅\n\nDM for location atau tag temen yang suka es! 👇\n\n#EsPalluButung #MakassarVibes #ViralTikTok #FYP #FoodReview #IndonesianFood #Yummy #MustTry",
    "alternatives": [
      "Alexa, cariin Es Pallu Butung terdekat! 🤖💚\n\nBro sis, ini minuman LEGEND Makassar yang WAJIB dicoba! Manis, seger, tekstur nya unik banget. Bikin nagih parah! 😍\n\nGa nyobain? RUGI BANGET DEH! 😤\n\nTag bestie mu sekarang! 👥\n\n#PalluButung #MakassarFoodie #ViralDrinks #TikTokFood",
      
      "⚠️ WARNING: Jangan nonton kalo lagi puasa! ⚠️\n\nEs Pallu Butung = COMFORT DRINK tingkat dewa! 🤩\n\nYang belum cobain, kalian ketinggalan zaman! Udah dari jaman nini-nini kita loh, tapi tetep hits sampai sekarang. Timeless banget! ✨\n\nLocation? Swipe up! 👆\n\n#TimelessDrink #ClassicMakassar #IconicDrinks",
      
      "Tell me you're from Makassar without telling me you're from Makassar 🗿\n\nMe: *slurping Es Pallu Butung aggressively* 🥤💅\n\nKalo kalian belum pernah nyobain ini, are we even friends? 🤨\n\nDouble tap kalo setuju! ❤️\n\n#MakassarCheck #LocalPride #ProudlyIndonesian"
    ]
  },
  "historyId": "660e8400-e29b-41d4-a716-446655440001"
}
```

---

## 3. Generate Copywriting - Formal Style

**Request:**
```json
POST /api/copywriting
{
  "namaProduk": "Konro Bakar Bu Haji",
  "jenisKonten": "Post",
  "gayaBahasa": "Formal",
  "tujuanKonten": "Promosi menu baru untuk profesional muda"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mainText": "Konro Bakar Bu Haji - Cita Rasa Autentik Makassar untuk Anda\n\nKami dengan bangga mempersembahkan menu signature kami, Konro Bakar, yang diolah dengan resep tradisional turun-temurun. Setiap sajian menggunakan daging berkualitas premium, dibumbui dengan rempah-rempah pilihan, dan dipanggang hingga sempurna.\n\nNikmati pengalaman kuliner yang memorable bersama keluarga dan kolega di restoran kami yang nyaman dan higienis.\n\nKami buka setiap hari:\n🕐 Senin - Jumat: 10.00 - 21.00 WITA\n🕐 Sabtu - Minggu: 09.00 - 22.00 WITA\n\nReservasi: 0821-xxxx-xxxx\nAlamat: Jl. Veteran Selatan No. 45, Makassar\n\nKami tunggu kunjungan Anda.\n\n#KonroBakar #KulinerMakassar #RestoranHalal #MakananIndonesia",
    "alternatives": [
      "Mencari tempat makan untuk business lunch atau family dinner?\n\nKonro Bakar Bu Haji adalah pilihan tepat. Kami menyajikan hidangan khas Sulawesi Selatan dengan standar kualitas tinggi dan pelayanan profesional.\n\nFasilitas:\n✓ Ruang VIP untuk meeting\n✓ Wi-Fi gratis\n✓ Parkir luas\n✓ Toilet bersih\n\nHubungi kami untuk reservasi dan informasi lebih lanjut.\n\n#BusinessDining #FamilyRestaurant #HalalCertified",
      
      "Konro Bakar Bu Haji menghadirkan warisan kuliner Makassar yang telah dipercaya selama puluhan tahun.\n\nKeunggulan kami:\n• Daging pilihan berkualitas ekspor\n• Bumbu rahasia keluarga\n• Proses pemasakan higienis\n• Harga kompetitif\n\nDapatkan diskon 10% untuk pembelian paket keluarga setiap hari Sabtu-Minggu.\n\nKunjungi kami atau pesan via delivery.\n\n#PromoWeekend #KulinerBerkualitas #MakassarDining",
      
      "Selamat datang di Konro Bakar Bu Haji!\n\nSebagai bagian dari upaya pelestarian kuliner tradisional Makassar, kami berkomitmen menyajikan hidangan autentik dengan standar modern.\n\nTersedia menu paket untuk:\n- Corporate gathering\n- Family celebration\n- Casual dining\n\nFollow Instagram kami @konrobakarbuhajiofficial untuk update menu dan promo terbaru.\n\nTerima kasih atas kepercayaan Anda.\n\n#TradisionalModern #PelestarianBudaya #KulinerNusantara"
    ]
  },
  "historyId": "770e8400-e29b-41d4-a716-446655440002"
}
```

---

## 4. Generate Copywriting - Daeng Friendly Style

**Request:**
```json
POST /api/copywriting
{
  "namaProduk": "Pisang Epe",
  "jenisKonten": "Story",
  "gayaBahasa": "Daeng Friendly",
  "tujuanKonten": "Mengajak followers untuk datang ke stand"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mainText": "Halo Daeng-daeng semua! 👋😊\n\nSiapa yang kangen Pisang Epe? 🍌🔥\n\nMampir ki di stand ta, Daeng! Lagi ramai nih, banyak yang antri. Pisang nya masih panas-panas, gula merahnya manis legit, dan coklatnya melimpah! 🤤\n\nBisa request topping sesukamu ji! Ada keju, meses, kacang, coklat leleh - semua ada! ✨\n\nTunggu apalagi Daeng? Ayo buruan sebelum kehabisan! Nanti penyesal ki loh! 😁\n\nSampai jumpa ya Daeng! 🙌\n\n#PisangEpe #JajanMakassar #DaengKu",
    "alternatives": [
      "Aduuhhh Daeng, rindu mi sama kalian! 💕\n\nKabar gembira nih: Hari ini ada PROMO SPESIAL! 🎉\n\nBeli 2 gratis 1 topping pilihan! Lumayan kan Daeng buat cemal cemil bareng keluarga? 😍\n\nJangan sampai ketinggalan ya! Cuma hari ini doang promonya! ⏰\n\nYuk Daeng, tunggu di tempat biasa! 📍\n\n#PromoHariIni #PisangEpe #DaengBanget",
      
      "Psssttt Daeng... cobai ki yang baru! 🤫✨\n\nPisang Epe JUMBO SIZE dengan topping TRIPLE CHOCOLATE! Gila enak ji ini Daeng, tidak bohong mi! 🍫🍌\n\nCocok banget buat yang doyan coklat. Manis, gurih, nagih parah!\n\nDM langsung atau langsung datang ji ya Daeng! Stok terbatas nih! 😉\n\n#MenuBaru #TripleChocolate #DaengLovers",
      
      "Cie Daeng yang baru pulang kerja/kuliah! 😊👋\n\nPasti capek kan? Yuk istirahat sebentar sambil ngemil Pisang Epe! Enak ji buat ngilangin stress. 💆‍♀️✨\n\nTempat ta nyaman, ada tempat duduk, bisa wifi-an juga kalau mau! 📱\n\nTunggu kedatangan mu ya Daeng! 🤗\n\n#RelaxTime #PisangEpe #TempatNongkrong"
    ]
  },
  "historyId": "880e8400-e29b-41d4-a716-446655440003"
}
```

---

## 5. Error Response - Validation Failed

**Request:**
```json
POST /api/copywriting
{
  "namaProduk": "",
  "jenisKonten": "Caption",
  "gayaBahasa": "",
  "tujuanKonten": "Brand awareness"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Semua field wajib diisi",
  "details": {
    "namaProduk": "Nama produk wajib diisi",
    "jenisKonten": null,
    "gayaBahasa": "Gaya bahasa wajib diisi",
    "tujuanKonten": null
  }
}
```

---

## 6. Error Response - API Key Invalid

**Response (500 Internal Server Error):**
```json
{
  "error": "Gagal generate copywriting",
  "message": "Request failed with status code 401"
}
```

---

## 7. Get History Response

**Request:**
```
GET /api/copywriting/history
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nama_produk": "Coto Makassar Daeng Tata",
      "jenis_konten": "Caption",
      "gaya_bahasa": "Makassar Halus",
      "tujuan_konten": "Brand awareness dan mengajak orang untuk datang",
      "main_text": "Assalamualaikum, Saudara-saudara! 🙏\n\nEnak sekali mi Coto Makassar...",
      "alternatives": ["...", "...", "..."],
      "created_at": "2025-12-04T10:30:00.000Z",
      "updated_at": "2025-12-04T10:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "nama_produk": "Es Pallu Butung",
      "jenis_konten": "Reel",
      "gaya_bahasa": "Gen Z TikTok",
      "tujuan_konten": "Viral di TikTok dan meningkatkan engagement",
      "main_text": "POV: Kamu lagi scrolling sambil kehausan...",
      "alternatives": ["...", "...", "..."],
      "created_at": "2025-12-04T10:25:00.000Z",
      "updated_at": "2025-12-04T10:25:00.000Z"
    }
  ]
}
```

---

## Notes:
- Response bervariasi tergantung AI generation
- Setiap request menghasilkan copywriting yang berbeda
- `alternatives` array berisi 3-5 variasi copywriting
- `historyId` digunakan untuk tracking di database
