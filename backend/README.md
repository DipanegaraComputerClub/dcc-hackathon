# 🚀 Backend - AI Copywriting untuk UMKM Kuliner Makassar

Backend API untuk platform AI copywriting menggunakan **Kolosal AI** dan **Supabase**.

> **Status:** ✅ Ready to Use | **Version:** 1.0.0 | **Runtime:** Bun + Hono

---

## 📦 Quick Start (5 Menit)

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Environment Variables
Edit file `.env` dan isi `KOLOSAL_API_KEY`:
```env
KOLOSAL_API_KEY=sk-xxxxxxxxxxxxxxxxxx  # Dapatkan dari https://kolosal.ai
```

### 3. Setup Database
Jalankan SQL di Supabase Dashboard (copy dari `src/migration.sql`)

### 4. Run Server
```bash
bun run dev
```

✅ Server running di: **http://localhost:3000**

📖 **Lihat [QUICKSTART.md](QUICKSTART.md) untuk panduan lengkap**

---

## 📡 API Endpoints

### Generate Copywriting
```bash
POST /api/copywriting
```

**Request:**
```json
{
  "namaProduk": "Coto Makassar",
  "jenisKonten": "Caption",
  "gayaBahasa": "Makassar Halus",
  "tujuanKonten": "Brand awareness"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mainText": "Enak sekali mi Coto Makassar...",
    "alternatives": ["Alt 1...", "Alt 2...", "Alt 3..."]
  },
  "historyId": "uuid"
}
```

### Get History
```bash
GET /api/copywriting/history
GET /api/copywriting/history/:id
```

---

## 🎨 Features

### ✅ 4 Gaya Bahasa
- **Formal** - Profesional dan sopan
- **Makassar Halus** - Bahasa Makassar + Indonesia
- **Daeng Friendly** - Ramah dengan panggilan "Daeng"
- **Gen Z TikTok** - Catchy dengan emoji

### ✅ 7+ Jenis Konten
Caption, Story, Post, Tweet, Reel, Short, Bio

### ✅ Smart AI Generation
- 1 copywriting utama
- 3-5 alternatif copywriting
- Auto-save ke database
- Optimized prompts per style

---

## 📚 Documentation

| File | Description |
|------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | ⚡ Setup dalam 5 menit |
| [CHECKLIST.md](CHECKLIST.md) | ✅ Setup checklist lengkap |
| [SUMMARY.md](SUMMARY.md) | 📝 Overview lengkap backend |
| [README_FULL.md](README_FULL.md) | 📖 Dokumentasi detail API |
| [KOLOSAL_AI_SETUP.md](KOLOSAL_AI_SETUP.md) | 🔑 Setup Kolosal AI |
| [TESTING.md](TESTING.md) | 🧪 Testing guide |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | 🔗 Integrasi frontend |
| [RESPONSE_EXAMPLES.md](RESPONSE_EXAMPLES.md) | 💡 Contoh response |

---

## 🛠️ Tech Stack

- **Runtime:** Bun (Fast JavaScript runtime)
- **Framework:** Hono (Lightweight web framework)
- **Database:** Supabase (PostgreSQL)
- **AI:** Kolosal AI API
- **HTTP Client:** Axios

---

## 🔧 Project Structure

```
backend/
├── src/
│   ├── index.ts          # API routes
│   ├── kolosalai.ts      # AI service
│   ├── supabase.ts       # Database client
│   └── migration.sql     # Database schema
├── .env                  # Environment variables
├── package.json          # Dependencies
└── [Documentation files]
```

---

## 🧪 Testing

```bash
# Test root endpoint
curl http://localhost:3000

# Test generate copywriting
curl -X POST http://localhost:3000/api/copywriting \
  -H "Content-Type: application/json" \
  -d '{"namaProduk": "Test", "jenisKonten": "Caption", "gayaBahasa": "Formal", "tujuanKonten": "Test"}'
```

📖 **Lihat [TESTING.md](TESTING.md) untuk testing lengkap**

---

## 🔗 Frontend Integration

Update `frontend/src/app/(dashboard)/copywriting/page.tsx`:

```typescript
const response = await fetch('http://localhost:3000/api/copywriting', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});

const data = await response.json();
// Display data.data.mainText dan data.data.alternatives
```

📖 **Lihat [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) untuk detail lengkap**

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "KOLOSAL_API_KEY not defined" | Edit `.env`, isi API key, restart server |
| "Table does not exist" | Run `migration.sql` di Supabase |
| CORS Error | Update `origin` di `src/index.ts` |
| Port already in use | Kill process atau ubah port |

---

## 💰 Cost Estimation

Dengan kredit **$20** dan model `gpt-3.5-turbo`:
- ~**$0.002** per request (main + alternatives)
- ~**10,000 requests** total
- ~**100 hari** dengan 100 requests/hari

---

## 📝 License

Private - DCC Hackathon Project

---

## 🎉 Ready to Use!

Backend sudah **100% siap**. Tinggal:
1. ✅ Isi `KOLOSAL_API_KEY`
2. ✅ Run migration SQL
3. ✅ `bun run dev`
4. ✅ Integrasikan dengan frontend

**Happy Hacking! 🚀**
