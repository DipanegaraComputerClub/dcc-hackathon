# Setup Kolosal AI

Panduan lengkap untuk setup Kolosal AI API.

## 🔑 Mendapatkan API Key

### Opsi 1: Kolosal AI (Recommended)
Website: https://kolosal.ai atau https://console.kolosal.ai

1. **Daftar/Login** ke Kolosal AI
2. **Dashboard** → Buka menu API Keys
3. **Create New API Key** 
   - Berikan nama (contoh: "DCC Hackathon Backend")
   - Copy API key yang di-generate
4. **Simpan** API key dengan aman (tidak bisa dilihat lagi setelah dibuat)

### Opsi 2: OpenAI Compatible API
Jika Kolosal AI tidak tersedia, bisa menggunakan:
- OpenAI API (https://platform.openai.com)
- Azure OpenAI
- Groq AI (https://console.groq.com)
- OpenRouter (https://openrouter.ai)

## 📝 Konfigurasi Backend

1. Buka file `.env` di folder backend:
```bash
cd backend
```

2. Tambahkan API key:
```env
KOLOSAL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. (Optional) Jika menggunakan API berbeda, update URL di `src/kolosalai.ts`:
```typescript
// Line 4-5 di kolosalai.ts
const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY!
const KOLOSAL_API_URL = 'https://api.kolosal.ai/v1/chat/completions' // Ganti URL jika perlu
```

## 🔧 Konfigurasi Model

Di file `src/kolosalai.ts`, kamu bisa mengubah model yang digunakan:

```typescript
// Line 27-29
{
  model: 'gpt-3.5-turbo', // Ubah sesuai model yang tersedia
  messages: [...]
}
```

### Model yang Umum Digunakan:
- **gpt-3.5-turbo** - Cepat dan murah (Recommended)
- **gpt-4** - Lebih pintar tapi lebih mahal
- **gpt-4-turbo** - Balance antara speed dan quality
- **claude-3-haiku** - Alternatif dari Anthropic (jika pakai OpenRouter)

## 💰 Credit Management

Untuk kredit $20 yang Anda miliki:

### Estimasi Penggunaan:
- **gpt-3.5-turbo**: ~$0.002 per request (4-5 alternatif)
- **Total**: Sekitar **10,000 requests** dengan kredit $20

### Tips Hemat Kredit:
1. Gunakan model `gpt-3.5-turbo` untuk development
2. Kurangi `max_tokens` jika tidak perlu response panjang
3. Cache response di database (sudah diimplementasi)
4. Set rate limiting di production

### Monitor Penggunaan:
- Check dashboard Kolosal AI untuk usage
- Set alert jika mendekati limit
- Log setiap request untuk tracking

## 🧪 Testing API Key

Test apakah API key valid:

```bash
# Test dengan curl
curl https://api.kolosal.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

Atau test lewat backend:
```bash
# Jalankan server
bun run dev

# Test endpoint
curl -X POST http://localhost:3000/api/copywriting \
  -H "Content-Type: application/json" \
  -d '{"namaProduk": "Test", "jenisKonten": "Caption", "gayaBahasa": "Formal", "tujuanKonten": "Test"}'
```

## 🛠️ Troubleshooting

### Error: "Invalid API Key"
- Pastikan API key benar dan tidak ada spasi
- Check apakah API key masih aktif di dashboard
- Regenerate API key jika perlu

### Error: "Rate limit exceeded"
- Tunggu beberapa detik dan coba lagi
- Implementasi retry logic (belum ada di code saat ini)
- Upgrade plan jika perlu

### Error: "Insufficient credits"
- Top up kredit di dashboard
- Atau ganti ke API key yang berbeda

### Error: "Model not found"
- Check model name di `kolosalai.ts`
- Pastikan model tersedia di plan Anda

## 🔒 Security Best Practices

1. **Jangan commit API key** ke git
   ```bash
   # .gitignore sudah include .env
   # Pastikan .env tidak ter-commit
   ```

2. **Rotate API key** secara berkala (setiap 3-6 bulan)

3. **Monitor unusual activity** di dashboard

4. **Set spending limits** di dashboard API provider

5. **Gunakan environment-specific keys**:
   - Development: Key dengan limit rendah
   - Production: Key dengan limit lebih tinggi

## 📊 Alternative APIs (Jika Kolosal AI Tidak Tersedia)

### 1. OpenAI
```typescript
const KOLOSAL_API_URL = 'https://api.openai.com/v1/chat/completions'
// Model: gpt-3.5-turbo, gpt-4, gpt-4-turbo
```

### 2. Groq (Fast & Cheap)
```typescript
const KOLOSAL_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
// Model: llama-3.1-70b-versatile, mixtral-8x7b-32768
```

### 3. OpenRouter (Multiple Models)
```typescript
const KOLOSAL_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Model: berbagai pilihan dari berbagai provider
```

### 4. Azure OpenAI
```typescript
const KOLOSAL_API_URL = 'https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT/chat/completions?api-version=2024-02-15-preview'
// Header: api-key: YOUR_AZURE_KEY
```

## 📞 Support

Jika ada masalah dengan Kolosal AI:
- Email: support@kolosal.ai
- Discord: https://discord.gg/kolosalai (jika ada)
- Documentation: https://docs.kolosal.ai

## 📝 Notes

- API key bersifat **rahasia**, jangan share ke orang lain
- Setiap request akan mengurangi kredit
- Simpan backup API key di tempat aman (password manager)
- Monitor usage secara berkala
