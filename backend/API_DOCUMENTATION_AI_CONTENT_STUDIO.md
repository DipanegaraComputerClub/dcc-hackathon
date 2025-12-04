# AI Content Studio API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Generate AI Content
Generate konten berdasarkan kategori yang dipilih.

**Endpoint:** `POST /api/ai-content`

**Request Body:**
```json
{
  "type": "caption | promo | branding | planner | copywriting | pricing | reply | comment",
  "inputText": "string (required)",
  "metadata": {
    // Metadata spesifik per kategori (opsional)
  },
  "userId": "uuid (optional)"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "caption",
    "inputText": "...",
    "outputText": "...",
    "metadata": {},
    "createdAt": "2025-12-05T..."
  }
}
```

---

## Category-Specific Requests

### 1. CAPTION GENERATOR
```json
{
  "type": "caption",
  "inputText": "Kuliner Makassar",
  "metadata": {
    "topik": "Coto Makassar enak di Pettarani",
    "tone": "Santai",
    "platform": "Instagram",
    "includeHashtags": true
  }
}
```

**Form Fields (Frontend):**
- Topik (Input Text) → `metadata.topik`
- Tone (Select: Santai/Formal/Lucu/Inspiratif) → `metadata.tone`
- Platform (Select: Instagram/Facebook/TikTok/Twitter) → `metadata.platform`
- Include Hashtags (Checkbox) → `metadata.includeHashtags`

---

### 2. PROMO GENERATOR
```json
{
  "type": "promo",
  "inputText": "Paket Hemat Coto 3 porsi",
  "metadata": {
    "namaProduk": "Paket Hemat Coto",
    "jenisPromo": "Diskon",
    "targetAudience": "Mahasiswa",
    "durasiPromo": "3 hari"
  }
}
```

**Form Fields (Frontend):**
- Nama Produk (Input Text) → `metadata.namaProduk`
- Jenis Promo (Select: Diskon/Beli 1 Gratis 1/Cashback/Bundling) → `metadata.jenisPromo`
- Target Audience (Select: Mahasiswa/Pekerja Kantoran/Ibu Rumah Tangga/Umum) → `metadata.targetAudience`
- Durasi Promo (Input Text, optional) → `metadata.durasiPromo`

---

### 3. BRANDING (AI Branding)
```json
{
  "type": "branding",
  "inputText": "Warung Coto Makassar keluarga",
  "metadata": {
    "sloganSekarang": "Rasa Enak Harga Kaki Lima",
    "brandPersona": "Sahabat yang asik",
    "toneOfVoice": "Makassar Friendly"
  }
}
```

**Form Fields (Frontend):**
- Slogan Saat Ini (Input Text, optional) → `metadata.sloganSekarang`
- Brand Persona (Input Text) → `metadata.brandPersona`
- Tone of Voice (Select: Makassar Friendly/Profesional & Elegan/Lucu & Humoris/Semangat Enerjik) → `metadata.toneOfVoice`

---

### 4. PLANNER (Content Planner)
```json
{
  "type": "planner",
  "inputText": "Kuliner Makassar, Tips Bisnis",
  "metadata": {
    "temaMingguan": "Kuliner Makassar",
    "durasi": "7"
  }
}
```

**Form Fields (Frontend):**
- Tema Mingguan (Input Text) → `metadata.temaMingguan`
- Durasi Rencana (Select: 7/14/30 hari) → `metadata.durasi`

---

### 5. COPYWRITING
```json
{
  "type": "copywriting",
  "inputText": "Risol Mayo",
  "metadata": {
    "namaProduk": "Risol Mayo",
    "jenisKonten": "Caption",
    "tujuanKonten": "Jualan",
    "gayaBahasa": "Daeng Friendly"
  }
}
```

**Form Fields (Frontend):**
- Nama Produk (Input Text) → `metadata.namaProduk`
- Jenis Konten (Select: Caption/Story/Post/Tweet) → `metadata.jenisKonten`
- Tujuan Konten (Select: Jualan/Brand Awareness/Engagement/Edukasi) → `metadata.tujuanKonten`
- Gaya Bahasa (Select: Makassar Halus/Daeng Friendly/Formal/Gen Z TikTok) → `metadata.gayaBahasa`

---

### 6. PRICING (Cek Harga)
```json
{
  "type": "pricing",
  "inputText": "Es Kopi Susu",
  "metadata": {
    "namaProduk": "Es Kopi Susu",
    "modalHPP": 15000,
    "targetUntung": 30,
    "hargaKompetitor": 25000
  }
}
```

**Form Fields (Frontend):**
- Nama Produk (Input Text) → `metadata.namaProduk`
- Modal/HPP (Number Input) → `metadata.modalHPP`
- Target Untung (Number Input, %) → `metadata.targetUntung`
- Harga Kompetitor (Number Input, optional) → `metadata.hargaKompetitor`

---

### 7. REPLY (Auto Reply)
```json
{
  "type": "reply",
  "inputText": "Pesan pelanggan tentang komplain",
  "metadata": {
    "pesanPelanggan": "Pesanan saya kok belum datang? Sudah 2 jam!",
    "nadaBalasan": "Ramah & Membantu"
  }
}
```

**Form Fields (Frontend):**
- Pesan Pelanggan (Textarea) → `metadata.pesanPelanggan`
- Nada Balasan (Select: Ramah & Membantu/Tegas untuk Komplain/Lucu Santai/Formal) → `metadata.nadaBalasan`

---

### 8. COMMENT (Comment Analyzer)
```json
{
  "type": "comment",
  "inputText": "Komentar pelanggan dari IG/TikTok",
  "metadata": {
    "komentarPelanggan": "Pelayanannya lambat banget! Kecewa deh!"
  }
}
```

**Form Fields (Frontend):**
- Komentar Pelanggan (Textarea) → `metadata.komentarPelanggan`

---

## Additional Endpoints

### 2. Get History (All Categories)
**Endpoint:** `GET /api/ai-content/history`

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `type` (optional): Filter by content type
- `limit` (optional, default: 50): Number of records
- `offset` (optional, default: 0): Pagination offset

**Example:**
```
GET /api/ai-content/history?type=caption&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "caption",
      "input_text": "...",
      "output_text": "...",
      "metadata": {},
      "created_at": "2025-12-05T..."
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 100
  }
}
```

---

### 3. Get History by ID
**Endpoint:** `GET /api/ai-content/history/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "caption",
    "input_text": "...",
    "output_text": "...",
    "metadata": {},
    "created_at": "2025-12-05T..."
  }
}
```

---

### 4. Delete History
**Endpoint:** `DELETE /api/ai-content/history/:id`

**Response:**
```json
{
  "success": true,
  "message": "History berhasil dihapus"
}
```

---

### 5. Get Statistics
**Endpoint:** `GET /api/ai-content/stats`

**Query Parameters:**
- `userId` (optional): Filter by user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byType": {
      "caption": 30,
      "promo": 25,
      "branding": 10,
      "planner": 15,
      "copywriting": 40,
      "pricing": 10,
      "reply": 15,
      "comment": 5
    },
    "recentActivity": [...]
  }
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "message": "type dan inputText wajib diisi"
}
```

**404 Not Found:**
```json
{
  "error": "History tidak ditemukan"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Gagal generate content",
  "message": "Error details..."
}
```

---

## Integration Example (React/Next.js)

```typescript
// api.ts
const API_BASE_URL = 'http://localhost:3000';

export async function generateAIContent(
  type: string,
  inputText: string,
  metadata: Record<string, any> = {}
) {
  const response = await fetch(`${API_BASE_URL}/api/ai-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      inputText,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate content');
  }

  return response.json();
}

// Usage in component
const handleGenerate = async () => {
  try {
    const result = await generateAIContent('caption', 'Coto Makassar', {
      topik: 'Coto Makassar enak',
      tone: 'Santai',
      platform: 'Instagram',
      includeHashtags: true,
    });
    
    setOutput(result.data.outputText);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS public.ai_content_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    type TEXT CHECK (type IN (
        'caption',
        'promo',
        'branding',
        'planner',
        'copywriting',
        'pricing',
        'reply',
        'comment'
    )) NOT NULL,

    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,

    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS ai_content_activity_user_id_idx
    ON public.ai_content_activity (user_id);

CREATE INDEX IF NOT EXISTS ai_content_activity_type_idx
    ON public.ai_content_activity (type);

CREATE INDEX IF NOT EXISTS ai_content_activity_created_at_idx
    ON public.ai_content_activity (created_at);
```

---

## Environment Variables

```env
# Kolosal AI API Key
KOLOSAL_API_KEY=kol_your_api_key_here

# Mock Mode (set to 'true' untuk testing tanpa API)
USE_MOCK_AI=false

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

---

## Testing

### Test dengan cURL

**Caption Generator:**
```bash
curl -X POST http://localhost:3000/api/ai-content \
  -H "Content-Type: application/json" \
  -d '{
    "type": "caption",
    "inputText": "Coto Makassar",
    "metadata": {
      "topik": "Coto Makassar enak di Pettarani",
      "tone": "Santai",
      "platform": "Instagram",
      "includeHashtags": true
    }
  }'
```

**Pricing:**
```bash
curl -X POST http://localhost:3000/api/ai-content \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pricing",
    "inputText": "Es Kopi Susu",
    "metadata": {
      "namaProduk": "Es Kopi Susu",
      "modalHPP": 15000,
      "targetUntung": 30,
      "hargaKompetitor": 25000
    }
  }'
```

---

## Notes

1. **Mock Mode**: Jika `USE_MOCK_AI=true`, sistem akan menggunakan data dummy untuk testing
2. **Rate Limiting**: Kolosal AI memiliki rate limit, perhatikan usage Anda
3. **Credit Usage**: Setiap request menggunakan credit Kolosal AI
4. **Metadata**: Setiap kategori memiliki metadata berbeda, sesuaikan dengan form frontend
5. **Error Handling**: Selalu handle error dari API dengan proper try-catch

---

## Support

Untuk pertanyaan atau issue, silakan hubungi tim developer.
