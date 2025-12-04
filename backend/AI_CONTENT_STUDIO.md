# AI Content Studio API Documentation

## Overview
AI Content Studio adalah fitur all-in-one untuk generate berbagai jenis konten marketing menggunakan Kolosal AI (Llama 4 Maverick).

## Content Types
1. **caption** - Social media caption generator
2. **promo** - Promo announcement generator
3. **brand_voice** - Brand voice guideline generator
4. **comment_analysis** - Comment sentiment analyzer
5. **auto_reply** - Auto reply generator untuk customer service
6. **pricing** - Pricing strategy analyzer

---

## API Endpoints

### 1. Generate AI Content
**POST** `/api/ai-content`

Generate konten AI berdasarkan type yang dipilih.

#### Request Body
```json
{
  "type": "caption|promo|brand_voice|comment_analysis|auto_reply|pricing",
  "inputText": "Your input text here",
  "metadata": {
    // Optional metadata sesuai dengan type
  },
  "userId": "uuid-optional"
}
```

#### Metadata per Type

##### Caption
```json
{
  "platform": "Instagram|Facebook|TikTok",
  "tone": "friendly|formal|casual|enthusiastic",
  "maxLength": "short|medium|long"
}
```

##### Promo
```json
{
  "duration": "1 hari|1 minggu|1 bulan",
  "discount": "25%|Beli 2 Gratis 1|etc",
  "urgency": "low|medium|high"
}
```

##### Brand Voice
```json
{
  "businessType": "kuliner|fashion|tech|etc",
  "targetAudience": "Gen Z|Millenial|Keluarga|etc"
}
```

##### Comment Analysis
```json
{
  "commentsCount": 50
}
```

##### Auto Reply
```json
{
  "businessName": "Nama Bisnis Anda",
  "replyTone": "friendly|professional|casual"
}
```

##### Pricing
```json
{
  "currentPrice": "Rp 25,000",
  "costPrice": "Rp 15,000",
  "competitorPrices": "Rp 20,000 - Rp 30,000"
}
```

#### Response Success
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "caption",
    "inputText": "Your input",
    "outputText": "Generated content...",
    "metadata": {},
    "createdAt": "2025-12-04T10:30:00Z"
  }
}
```

#### Response Error
```json
{
  "error": "Error type",
  "message": "Error message"
}
```

---

### 2. Get All History
**GET** `/api/ai-content/history`

Ambil history semua generated content.

#### Query Parameters
- `userId` (optional) - Filter by user ID
- `type` (optional) - Filter by content type
- `limit` (optional, default: 50) - Jumlah data per request
- `offset` (optional, default: 0) - Offset untuk pagination

#### Example Request
```bash
GET /api/ai-content/history?userId=123&type=caption&limit=20&offset=0
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "caption",
      "input_text": "Risol Mayo",
      "output_text": "Generated caption...",
      "metadata": {},
      "created_at": "2025-12-04T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 100
  }
}
```

---

### 3. Get History by ID
**GET** `/api/ai-content/history/:id`

Ambil detail satu history berdasarkan ID.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "caption",
    "input_text": "Input text",
    "output_text": "Output text",
    "metadata": {},
    "created_at": "2025-12-04T10:30:00Z"
  }
}
```

---

### 4. Delete History
**DELETE** `/api/ai-content/history/:id`

Hapus satu history berdasarkan ID.

#### Response
```json
{
  "success": true,
  "message": "History berhasil dihapus"
}
```

---

### 5. Get Statistics
**GET** `/api/ai-content/stats`

Ambil statistik penggunaan AI Content Studio.

#### Query Parameters
- `userId` (optional) - Filter by user ID

#### Response
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byType": {
      "caption": 50,
      "promo": 30,
      "brand_voice": 20,
      "comment_analysis": 25,
      "auto_reply": 15,
      "pricing": 10
    },
    "recentActivity": [
      {
        "type": "caption",
        "created_at": "2025-12-04T10:30:00Z"
      }
    ]
  }
}
```

---

## Testing Examples

### 1. Test Caption Generator
```bash
curl -X POST http://localhost:3000/api/ai-content \
-H "Content-Type: application/json" \
-d '{
  "type": "caption",
  "inputText": "Risol Mayo spesial kami",
  "metadata": {
    "platform": "Instagram",
    "tone": "friendly",
    "maxLength": "medium"
  }
}'
```

### 2. Test Promo Generator
```bash
curl -X POST http://localhost:3000/api/ai-content \
-H "Content-Type: application/json" \
-d '{
  "type": "promo",
  "inputText": "Beli 2 Gratis 1 untuk semua menu",
  "metadata": {
    "duration": "3 hari",
    "discount": "Buy 2 Get 1",
    "urgency": "high"
  }
}'
```

### 3. Test Brand Voice
```bash
curl -X POST http://localhost:3000/api/ai-content \
-H "Content-Type: application/json" \
-d '{
  "type": "brand_voice",
  "inputText": "UMKM kuliner khas Makassar yang menyajikan makanan tradisional dengan sentuhan modern untuk keluarga Indonesia",
  "metadata": {
    "businessType": "kuliner",
    "targetAudience": "Keluarga dan Gen Z"
  }
}'
```

### 4. Test Comment Analysis
```bash
curl -X POST http://localhost:3000/api/ai-content \
-H "Content-Type: application/json" \
-d '{
  "type": "comment_analysis",
  "inputText": "1. Enak banget! Porsinya banyak\n2. Harganya agak mahal ya\n3. Tempatnya bersih, recommended!\n4. Lama banget nunggu makanan\n5. Rasanya juara! Pasti balik lagi",
  "metadata": {
    "commentsCount": 5
  }
}'
```

### 5. Test Auto Reply
```bash
curl -X POST http://localhost:3000/api/ai-content \
-H "Content-Type: application/json" \
-d '{
  "type": "auto_reply",
  "inputText": "Halo kak, apakah bisa delivery ke daerah Panakkukang?",
  "metadata": {
    "businessName": "Risol Mayo Makassar",
    "replyTone": "friendly dan helpful"
  }
}'
```

### 6. Test Pricing Analysis
```bash
curl -X POST http://localhost:3000/api/ai-content \
-H "Content-Type: application/json" \
-d '{
  "type": "pricing",
  "inputText": "Risol Mayo Premium",
  "metadata": {
    "currentPrice": "Rp 25,000",
    "costPrice": "Rp 12,000",
    "competitorPrices": "Rp 20,000 - Rp 35,000"
  }
}'
```

---

## Mock Mode
Untuk testing tanpa menggunakan API Kolosal AI (tidak consume credit):

Set di `.env`:
```env
USE_MOCK_AI=true
```

Matikan untuk production:
```env
USE_MOCK_AI=false
```

---

## Error Codes
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Schema
Data tersimpan di tabel `ai_content_activity`:

```sql
create table if not exists public.ai_content_activity (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    type text check (type in (
        'caption',
        'promo',
        'brand_voice',
        'comment_analysis',
        'auto_reply',
        'pricing'
    )) not null,
    input_text text not null,
    output_text text not null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now()
);
```

---

## Notes
- Semua endpoint menggunakan Kolosal AI (Llama 4 Maverick)
- Credit akan ter-consume setiap kali generate (kecuali mock mode)
- Metadata bersifat optional tapi sangat disarankan untuk hasil yang lebih spesifik
- userId optional, tapi wajib jika ingin track per user
- History otomatis tersimpan ke Supabase setiap kali generate
