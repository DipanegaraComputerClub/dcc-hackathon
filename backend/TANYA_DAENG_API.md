# 🤖 Tanya Daeng - AI Chatbot UMKM

## 📌 Overview

**Tanya Daeng** adalah AI chatbot dengan kepribadian khas Makassar/Bugis yang membantu pelaku UMKM dalam:
- Strategi bisnis dan marketing
- Visual branding dan design
- Social media content creation
- Troubleshooting masalah bisnis
- Rekomendasi tools dan resources

## 🎯 Features

### 1. **Natural Language Chat**
- Bahasa Indonesia + sisipan Makassar/Bugis
- Personality: Ramah, hangat, kekeluargaan
- Kontekstual dan personal

### 2. **FAQ System**
Pre-loaded dengan 8+ FAQ tentang:
- Cara memulai bisnis UMKM
- Modal usaha
- Foto produk
- Social media strategy
- Pricing
- Marketing & promosi
- Customer service

### 3. **Smart Recommendations**
Automatically suggests:
- Visual Studio (untuk design)
- AI Copywriting (untuk caption)
- Analytics (untuk data)
- External resources (articles, videos)

### 4. **Conversation History**
Simpan chat history untuk:
- Continuity dalam conversation
- User analytics
- Improvement feedback

---

## 🔌 API Endpoints

### 1. **POST /api/tanya-daeng/chat**

**Request:**
```json
{
  "message": "Bagaimana cara memulai bisnis coto makassar?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Halo Daeng"
    },
    {
      "role": "assistant",
      "content": "Ji! Ada yang bisa Daeng bantu?"
    }
  ],
  "userContext": {
    "businessType": "kuliner",
    "location": "Makassar",
    "needHelp": "marketing"
  },
  "userId": "uuid-optional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "Ji'! Santai mi dulu ji, dengar-dengarki Daeng...",
    "suggestions": [
      "Mulai dengan modal kecil",
      "Buat foto produk menarik",
      "Posting konsisten di social media"
    ],
    "resources": [
      {
        "type": "link",
        "title": "🎨 Visual Studio UMKM",
        "url": "/visual-studio",
        "description": "Buat design foto produk profesional"
      }
    ],
    "relatedFAQ": [
      {
        "question": "Bagaimana cara memulai bisnis UMKM?",
        "answer": "..."
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (message empty)
- `500` - Server error

---

### 2. **GET /api/tanya-daeng/faq**

Get all pre-loaded FAQ.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "question": "Bagaimana cara memulai bisnis UMKM?",
      "answer": "Ji'! Santai mi dulu ji...",
      "keywords": ["cara", "mulai", "jualan", "bisnis"]
    },
    ...
  ]
}
```

---

## 💬 Example Conversations

### Example 1: Business Advice
**User:** "Daeng, saya mau jualan coto tapi modal terbatas"

**Daeng:** 
```
Ji'! Santai mi ji, modal terbatas bukan masalah besar.

Untuk jualan Coto dengan modal minimal:

1. **Mulai Kecil** - Jualan di depan rumah dulu, jangan sewa tempat
2. **Menu Terbatas** - Coto biasa dulu, nanti tambah menu kalau sudah laku
3. **Bahan Lokal** - Beli di pasar tradisional, lebih murah
4. **Marketing Gratis** - Pakai Instagram/TikTok, posting foto coto yang appetizing

Yang penting: RASANYA HARUS ENAK JI! Kalau enak, pelanggan pasti balik lagi.

Butuh bantuan foto produk? Pakai Visual Studio kita biar foto cotomu kelihatan mantap! 🔥

InsyaAllah berkah usahamu!
```

### Example 2: Social Media Help
**User:** "Posting di Instagram tapi sepi terus Daeng"

**Daeng:**
```
Eee, jangan menyerah dulu ji! Daeng kasih tips:

**Kenapa Sepi:**
1. Foto kurang menarik
2. Caption membosankan
3. Posting tidak konsisten
4. Hashtag salah
5. Engagement rendah

**Solusi Daeng:**
1. **Foto Berkualitas** - Pakai Visual Studio, bikin foto wow
2. **Caption Engaging** - Cerita singkat, emoji, CTA kuat
3. **Posting Rutin** - 2-3x sehari, jam tertentu (11-13, 18-20)
4. **Hashtag Lokal** - #KulinerMakassar #CotoMakassar #UMKMMakassar
5. **Story Aktif** - Upload story tiap hari, behind the scenes

Yang penting: INTERAKSI! Balas komen, like balik, follow back.

Mau bantuan bikin caption? Coba AI Copywriting kita!

Semangat ji! 💪
```

---

## 🎨 Image Generation Recommendations

Saat user bertanya tentang design/visual, Daeng akan recommend:

### Primary: Platform Visual Studio (Internal)
- Feature lengkap: Analysis, BG Removal, Template Gen
- UMKM-focused
- Bahasa Indonesia

### External Alternatives (untuk advanced users):
1. **Canva** - https://canva.com
   - Free tier bagus
   - Template banyak
   - Easy to use

2. **Remove.bg** - https://remove.bg
   - 50 free/month
   - Background removal

3. **Unsplash** - https://unsplash.com
   - Stock photos gratis
   - High quality

4. **Pexels** - https://pexels.com
   - Video + foto gratis
   - No attribution needed

---

## 🛠️ Setup & Configuration

### 1. Environment Variables
```env
KOLOSAL_API_KEY=your_kolosal_api_key
```

### 2. Database Migration
Run `migration-tanya-daeng.sql` in Supabase SQL Editor.

### 3. Start Backend
```bash
cd backend
bun run dev
```

### 4. Test API
```bash
curl -X POST http://localhost:3000/api/tanya-daeng/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Halo Daeng!"
  }'
```

---

## 🎭 Personality Guidelines

**DO:**
- ✅ Ramah dan hangat
- ✅ Pakai "Ji", "Mi", "Ki" secara natural
- ✅ Kasih contoh praktis
- ✅ Motivasi dan doa
- ✅ Recommend platform tools when relevant

**DON'T:**
- ❌ Terlalu formal/kaku
- ❌ Pure bahasa Makassar (harus balance)
- ❌ Janji instant success
- ❌ Ignore user context

---

## 📊 Analytics & Metrics

Track conversation metrics:
- Total conversations
- Popular topics (keywords)
- User satisfaction (ratings)
- FAQ hit rate
- Average response time

---

## 🚀 Future Enhancements

1. **Multi-language Support** - Bugis, Manado, Toraja
2. **Voice Input/Output** - Text-to-speech Makassar accent
3. **Image Recognition** - Upload foto produk, get instant feedback
4. **Sentiment Analysis** - Detect user frustration, adjust tone
5. **Business Coach Mode** - Structured mentoring program

---

## 📞 Support

Jika ada error atau butuh bantuan:
- Check backend logs
- Verify Kolosal API key
- Test FAQ endpoint terlebih dahulu
- Contact: support@hackathon.com

---

**Built with ❤️ for UMKM Makassar** 🏪🔥
