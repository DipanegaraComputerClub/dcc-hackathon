# 🐛 Troubleshooting Kolosal AI API

## Status Error 500 - Internal Server Error

Jika Anda mendapatkan error ini dari Kolosal AI:

```json
{
  "error": {
    "type": "internal_error",
    "message": "Internal server error",
    "code": null,
    "param": null
  }
}
```

### Kemungkinan Penyebab:

1. **Format API Request Tidak Sesuai**
   - Kolosal AI mungkin menggunakan format berbeda dari OpenAI
   - Model yang diminta tidak tersedia

2. **API Endpoint Salah**
   - Default endpoint: `https://api.kolosal.ai/v1/chat/completions`
   - Mungkin perlu endpoint berbeda

3. **API Key Format Tidak Sesuai**
   - Kolosal AI menggunakan format `kol_xxx` bukan `sk-xxx`

4. **Rate Limiting atau Quota**
   - API mungkin hit rate limit
   - Credit mungkin habis atau belum aktif

---

## ✅ SOLUSI: Mock Mode (Recommended untuk Testing)

Backend sudah dilengkapi dengan **Mock Mode** yang menggunakan dummy data untuk testing tanpa perlu API.

### Cara Menggunakan Mock Mode:

1. Edit file `.env`:
```env
USE_MOCK_AI=true
```

2. Restart backend server:
```bash
bun run dev
```

3. ✅ Backend sekarang akan generate copywriting dummy yang sudah disesuaikan dengan gaya bahasa!

### Keuntungan Mock Mode:
- ✅ Tidak perlu API key
- ✅ Tidak consume credit
- ✅ Instant response (tanpa delay API)
- ✅ Hasil sudah disesuaikan per gaya bahasa
- ✅ Perfect untuk demo dan testing

### Hasil Mock Mode:
- **Makassar Halus**: "Enak sekali mi Coto Makassar! Kuahnya gurih..."
- **Daeng Friendly**: "Halo Daeng-daeng! Cobai mi..."
- **Gen Z TikTok**: "POV: Kamu lagi craving... BUSSIN fr fr 🔥"
- **Formal**: "Cita Rasa Autentik untuk Anda..."

---

## 🔧 SOLUSI: Coba API Endpoint Alternatif

Jika ingin tetap menggunakan API asli, coba endpoint berbeda:

### Option 1: Chat Completions (Default)
```env
KOLOSAL_API_URL=https://api.kolosal.ai/v1/chat/completions
USE_MOCK_AI=false
```

### Option 2: Completions (Alternatif)
```env
KOLOSAL_API_URL=https://api.kolosal.ai/v1/completions
USE_MOCK_AI=false
```

### Option 3: Text Generation
```env
KOLOSAL_API_URL=https://api.kolosal.ai/v1/generate
USE_MOCK_AI=false
```

### Option 4: Custom Endpoint
```env
KOLOSAL_API_URL=https://api.kolosal.ai/v1/text/generate
USE_MOCK_AI=false
```

---

## 🔍 Cara Mengecek API Endpoint yang Benar

### 1. Cek Dokumentasi Kolosal AI
- Login ke https://console.kolosal.ai
- Cari menu "Documentation" atau "API Reference"
- Lihat example curl request

### 2. Test dengan curl
```bash
curl https://api.kolosal.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 3. Cek Response Error
Jika error 404 → endpoint salah
Jika error 401 → API key salah
Jika error 500 → format request salah atau model tidak tersedia

---

## 🎯 Recommended Workflow

### Untuk Hackathon/Demo (NOW):
```env
USE_MOCK_AI=true
```
✅ Gunakan mock mode untuk demo yang stabil

### Untuk Development (LATER):
```env
USE_MOCK_AI=false
```
Test dengan API asli setelah endpoint dikonfirmasi

### Untuk Production (FUTURE):
- Konfirmasi endpoint yang benar dari Kolosal AI
- Test thoroughly dengan berbagai input
- Implement retry logic
- Add caching untuk save credit

---

## 📝 Alternative: Gunakan OpenAI Compatible API

Jika Kolosal AI terus bermasalah, gunakan alternatif:

### Option 1: OpenAI
```env
KOLOSAL_API_URL=https://api.openai.com/v1/chat/completions
KOLOSAL_API_KEY=sk-xxxxx  # OpenAI API Key
USE_MOCK_AI=false
```

### Option 2: Groq (Fast & Free Tier)
```env
KOLOSAL_API_URL=https://api.groq.com/openai/v1/chat/completions
KOLOSAL_API_KEY=gsk-xxxxx  # Groq API Key
USE_MOCK_AI=false
```

### Option 3: OpenRouter
```env
KOLOSAL_API_URL=https://openrouter.ai/api/v1/chat/completions
KOLOSAL_API_KEY=sk-or-xxxxx  # OpenRouter API Key
USE_MOCK_AI=false
```

---

## 🎉 Quick Fix Summary

**UNTUK DEMO SEKARANG:**
1. Set `USE_MOCK_AI=true` di `.env`
2. Restart backend: `bun run dev`
3. ✅ Everything works!

**UNTUK INVESTIGASI NANTI:**
1. Contact Kolosal AI support
2. Cek dokumentasi untuk endpoint yang benar
3. Test dengan curl untuk validate format
4. Update `KOLOSAL_API_URL` jika perlu

---

## 📞 Contact Kolosal AI Support

- Website: https://kolosal.ai
- Dashboard: https://console.kolosal.ai
- Email: support@kolosal.ai
- Discord: (cek di website mereka)

Tanyakan:
1. API endpoint yang benar untuk chat completions
2. Format request yang expected
3. Model yang tersedia (gpt-3.5-turbo, gpt-4, dll)
4. Rate limits dan quota
5. Example code untuk implementasi

---

**Status saat ini: ✅ RESOLVED dengan Mock Mode**

Backend berfungsi normal dengan mock data. Untuk demo hackathon sudah cukup!
